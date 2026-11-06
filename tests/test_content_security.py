"""Regression coverage for malformed content and media boundaries.

All requests use an isolated temporary SQLite database, never production.
"""
import io
import sqlite3
from html.parser import HTMLParser
from urllib.parse import urlsplit

import pytest
from PIL import Image
from werkzeug.security import generate_password_hash

from server import create_app, now, render_markdown


@pytest.fixture(scope="module")
def owner(tmp_path_factory):
    root = tmp_path_factory.mktemp("content-security")
    app = create_app({"TESTING": True, "DATA_DIR": str(root), "COOKIE_SECURE": False, "ORIGIN": "http://localhost"})
    with sqlite3.connect(app.config["DATABASE"]) as db:
        db.execute("INSERT INTO users(username,password_hash,role,created_at) VALUES (?,?,?,?)",
            ("content-review", generate_password_hash("isolated-password-123", method="pbkdf2:sha256:1000"), "admin", now()))
    client = app.test_client()
    csrf = client.get("/api/auth/me").json["csrf_token"]
    response = client.post("/api/auth/login", json={"username": "content-review", "password": "isolated-password-123"}, headers={"X-CSRF-Token": csrf})
    assert response.status_code == 200
    return client, {"X-CSRF-Token": response.json["csrf_token"]}, root


@pytest.mark.parametrize("body", [
    {"category_id": 2**100},
    {"category_id": -(2**100)},
    {"category_id": True},
    {"category_id": []},
    {"cover_url": "https://[broken"},
    {"cover_url": "https://example.org:invalid/image.jpg"},
    {"cover_url": "https://example.org:99999/image.jpg"},
    {"cover_url": "https://:123/image.jpg"},
    {"cover_url": "https://:password@example.org/image.jpg"},
    {"cover_url": "javascript:alert(1)"},
    {"published_at": "0001-01-01T00:00:00+01:00"},
    {"published_at": "9999-12-31T23:59:59-01:00"},
    {"published_at": 0},
    {"published_at": False},
    {"published_at": []},
    {"published_at": {}},
])
def test_invalid_content_returns_client_error_without_saving(owner, body):
    client, headers, _ = owner
    before = client.get("/api/admin/stats").json["articles"]
    response = client.post("/api/admin/articles", json=body, headers=headers)
    assert response.status_code == 400, response.json
    assert response.json["code"] == 400
    assert client.get("/api/admin/stats").json["articles"] == before


@pytest.mark.parametrize("resource,method", [("articles", "get"), ("articles", "put"), ("articles", "delete"), ("categories", "put"), ("categories", "delete"), ("images", "delete")])
def test_numeric_resource_ids_stay_within_sqlite_range(owner, resource, method):
    client, headers, _ = owner
    response = getattr(client, method)(f"/api/admin/{resource}/{2**100}", json={}, headers=headers)
    assert response.status_code == 404
    assert response.json["code"] == 404


class Elements(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, attrs))


def test_markdown_attack_corpus_preserves_only_passive_content():
    source = "\n\n".join([
        '<script>alert(document.cookie)</script>',
        '<img src=x onerror="alert(1)">',
        '<svg><a href="javascript:alert(1)">x</a></svg>',
        '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
        '[click](javascript:alert(1))',
        '[click](java&#x73;cript:alert(1))',
        '[click](vbscript:msgbox(1))',
        '![x](data:image/svg+xml,<svg onload="alert(1)"></svg>)',
        '![x](file:///etc/passwd)',
        '[safe](https://example.org/)',
        '[email](mailto:test@example.org)',
        '| A | B |\n| - | - |\n| one | two |',
        '```python\nprint("safe")\n```',
    ])
    html = render_markdown(source)
    elements = Elements()
    elements.feed(html)
    assert not any(tag in {"script", "svg", "iframe", "object", "embed"} for tag, _ in elements.elements)
    for _, attrs in elements.elements:
        for name, value in attrs:
            assert not name.lower().startswith("on") and name not in {"style", "srcdoc"}
            if name in {"href", "src"}:
                assert urlsplit(value).scheme.lower() in {"", "http", "https", "mailto"}
    assert '<a href="https://example.org/">' in html and '<table>' in html and 'language-python' in html


def test_uploaded_polyglot_is_reencoded_and_cannot_choose_storage_path(owner):
    client, headers, root = owner
    image = io.BytesIO()
    Image.new("RGBA", (8, 5), color="#4c6c99").save(image, format="PNG")
    payload = image.getvalue() + b'<script>polyglot-marker</script>'
    response = client.post("/api/admin/images", data={"file": (io.BytesIO(payload), "../../private.py")}, headers=headers)
    assert response.status_code == 201
    stored = response.json
    assert stored["url"].startswith("/uploads/") and stored["url"].endswith(".png")
    assert stored["filename"] == "private.py"
    assert not (root / "private.py").exists()
    image_response = client.get(stored["url"])
    assert image_response.content_type == "image/png"
    assert b"polyglot-marker" not in image_response.data
    assert client.get("/uploads/../nest.sqlite3").status_code == 404
    assert client.delete(f'/api/admin/images/{stored["id"]}', headers=headers).status_code == 200


def test_phone_image_orientation_is_applied_before_metadata_is_removed(owner):
    client, headers, _ = owner
    image = io.BytesIO()
    source = Image.new("RGB", (20, 12), color="#4c6c99")
    exif = Image.Exif()
    exif[274] = 6
    source.save(image, format="JPEG", exif=exif)
    image.seek(0)
    response = client.post("/api/admin/images", data={"file": (image, "portrait.jpg")}, headers=headers)
    assert response.status_code == 201
    stored = response.json
    assert (stored["width"], stored["height"]) == (12, 20)
    with Image.open(io.BytesIO(client.get(stored["url"]).data)) as final:
        assert final.size == (12, 20)
        assert 274 not in final.getexif()
    assert client.delete(f'/api/admin/images/{stored["id"]}', headers=headers).status_code == 200


@pytest.mark.parametrize("cover_prefix,cover_suffix", [("", "?version=1"), ("https://xiaoqiuyi.me", "#cover")])
def test_image_delete_detects_query_and_absolute_cover_references(owner, cover_prefix, cover_suffix):
    client, headers, _ = owner
    image = io.BytesIO()
    Image.new("RGB", (8, 5), color="#4c6c99").save(image, format="PNG")
    image.seek(0)
    uploaded = client.post("/api/admin/images", data={"file": (image, "cover.png")}, headers=headers).json
    article = client.post("/api/admin/articles", json={"cover_url": cover_prefix + uploaded["url"] + cover_suffix}, headers=headers)
    assert article.status_code == 201
    assert client.delete(f'/api/admin/images/{uploaded["id"]}', headers=headers).status_code == 409
    assert client.get(uploaded["url"]).status_code == 200
    assert client.delete(f'/api/admin/articles/{article.json["id"]}', headers=headers).status_code == 200
    assert client.delete(f'/api/admin/images/{uploaded["id"]}', headers=headers).status_code == 200
