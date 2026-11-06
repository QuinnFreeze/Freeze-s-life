import io
import sqlite3
from datetime import datetime, timedelta, timezone

import pytest
from PIL import Image
from werkzeug.security import generate_password_hash

from server import create_app, now

PASSWORD = "test-password-12345"


@pytest.fixture
def app(tmp_path):
    instance = create_app({"TESTING": True, "DATA_DIR": str(tmp_path), "COOKIE_SECURE": False, "ORIGIN": "http://localhost"})
    with sqlite3.connect(instance.config["DATABASE"]) as connection:
        connection.execute("INSERT INTO users(username,password_hash,role,created_at) VALUES (?,?,?,?)", ("admin", generate_password_hash(PASSWORD, method="scrypt"), "admin", now()))
    return instance


def login(client, username="admin", password=PASSWORD):
    token = client.get("/api/auth/me").json["csrf_token"]
    response = client.post("/api/auth/login", json={"username": username, "password": password}, headers={"X-CSRF-Token": token})
    assert response.status_code == 200, response.json
    return {"X-CSRF-Token": response.json["csrf_token"]}


def article(client, headers, **fields):
    body = {"slug": "hello-world", "title_zh": "你好世界", "content_zh": "## 内容\n这是历史阅读笔记。", "title_en": "Hello world", "content_en": "## Content\nA history reading note.", "status": "published", "tags": ["history"]}
    body.update(fields)
    response = client.post("/api/admin/articles", json=body, headers=headers)
    assert response.status_code == 201, response.json
    return response.json


def test_authentication_csrf_origin_and_session_rotation(app):
    client = app.test_client()
    assert client.get("/api/admin/articles").status_code == 401
    anon = client.get("/api/auth/me").json["csrf_token"]
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}).status_code == 403
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}, headers={"X-CSRF-Token": anon, "Origin": "https://evil.example"}).status_code == 403
    headers = login(client)
    assert headers["X-CSRF-Token"] != anon
    assert client.post("/api/admin/articles", json={}, headers={"X-CSRF-Token": anon}).status_code == 403
    assert client.post("/api/admin/articles", json={}, headers=headers).status_code == 201
    assert client.post("/api/auth/logout", json={}, headers=headers).status_code == 200
    assert client.get("/api/admin/stats").status_code == 401
    assert client.post("/api/auth/register", json={}).status_code in (403, 404)


def test_production_cookie_flags_and_no_store(tmp_path):
    app = create_app({"DATA_DIR": str(tmp_path), "TESTING": True})
    response = app.test_client().get("/api/auth/me")
    cookie = response.headers["Set-Cookie"]
    for expected in ("__Host-nest_session=", "Secure", "HttpOnly", "SameSite=Strict", "Path=/"):
        assert expected in cookie
    assert response.headers["Cache-Control"] == "no-store"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "script-src 'self'" in response.headers["Content-Security-Policy"]


def test_bilingual_publication_draft_and_future_visibility(app):
    client = app.test_client()
    headers = login(client)
    live = article(client, headers)
    draft = article(client, headers, slug="draft", status="draft")
    future = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    article(client, headers, slug="future", published_at=future)
    article(client, headers, slug="chinese-only", title_en="", content_en="")
    assert client.get("/api/articles?lang=zh").json["total"] == 2
    assert client.get("/api/articles?lang=en").json["total"] == 1
    assert client.get("/api/articles/hello-world?lang=en").json["title"] == "Hello world"
    assert client.get("/api/articles/hello-world?lang=zh").json["title"] == "你好世界"
    assert client.get("/api/articles/draft").status_code == 404
    assert client.get("/api/articles/future").status_code == 404
    missing = client.get("/api/articles/chinese-only?lang=en")
    assert missing.status_code == 404 and missing.json["available_languages"] == ["zh"]
    assert client.get("/api/articles?lang=de").status_code == 400
    invalid = client.post("/api/admin/articles", json={"slug": "incomplete", "title_en": "No body", "status": "published"}, headers=headers)
    assert invalid.status_code == 400


def test_article_search_taxonomy_pagination_and_sql_injection(app):
    client = app.test_client()
    headers = login(client)
    category = client.post("/api/admin/categories", json={"slug": "history", "name_zh": "历史", "name_en": "History"}, headers=headers).json
    article(client, headers, category_id=category["id"])
    article(client, headers, slug="second", title_zh="第二篇", content_zh="技术实践", tags=["technology"])
    assert client.get("/api/articles?q=阅读").json["total"] == 1
    assert client.get("/api/admin/articles?q=技术实践").json["total"] == 1
    assert client.get("/api/articles?category=history").json["total"] == 1
    assert client.get("/api/articles?tag=technology").json["total"] == 1
    paged = client.get("/api/articles?per_page=1&page=2").json
    assert paged["total"] == 2 and paged["pages"] == 2 and len(paged["items"]) == 1
    assert client.get("/api/articles?q=%27%20OR%201%3D1--").json["total"] == 0
    assert client.get("/api/articles?q=%25").json["total"] == 0
    assert client.get("/api/categories?lang=en").json["items"][0]["count"] == 1
    assert client.delete(f'/api/admin/categories/{category["id"]}', headers=headers).status_code == 200
    assert client.get("/api/articles/hello-world").json["category"] is None


def test_edit_conflict_delete_and_database_persistence(app):
    client = app.test_client()
    headers = login(client)
    old = article(client, headers)
    edited = client.put(f'/api/admin/articles/{old["id"]}', json={"title_zh": "更新标题", "updated_at": old["updated_at"]}, headers=headers)
    assert edited.status_code == 200 and edited.json["updated_at"] != old["updated_at"]
    assert client.put(f'/api/admin/articles/{old["id"]}', json={"title_zh": "过时保存", "updated_at": old["updated_at"]}, headers=headers).status_code == 409
    fresh = create_app({"TESTING": True, "DATA_DIR": app.config["DATA_DIR"], "COOKIE_SECURE": False})
    assert fresh.test_client().get("/api/articles/hello-world").json["title"] == "更新标题"
    assert client.delete(f'/api/admin/articles/{old["id"]}', headers=headers).status_code == 200
    assert client.get("/api/articles/hello-world").status_code == 404


def test_view_counts_are_deduplicated_and_drafts_not_counted(app):
    owner = app.test_client()
    headers = login(owner)
    article(owner, headers)
    article(owner, headers, slug="draft", status="draft")
    reader = app.test_client()
    assert reader.post("/api/articles/hello-world/view").json["views"] == 1
    assert reader.post("/api/articles/hello-world/view").json["views"] == 1
    assert app.test_client().post("/api/articles/hello-world/view").json["views"] == 2
    assert reader.post("/api/articles/draft/view").status_code == 404
    assert reader.post("/api/articles/hello-world/view", headers={"Origin": "https://evil.example"}).status_code == 403
    stats = owner.get("/api/admin/stats").json
    assert stats == {"articles": 2, "drafts": 1, "published": 1, "views": 2, "images": 0}


def test_markdown_sanitization(app):
    client = app.test_client()
    headers = login(client)
    markdown = '<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n![x](https://example.org/image.png)\n\n| A | B |\n| - | - |\n| 1 | 2 |'
    response = client.post("/api/admin/preview", json={"content": markdown}, headers=headers)
    assert response.status_code == 200
    html = response.json["html"]
    assert "<script>" not in html and 'href="javascript:' not in html
    assert '<img src="https://example.org/image.png"' in html and "<table>" in html


def test_verified_image_upload_reference_protection_and_delete(app):
    client = app.test_client()
    headers = login(client)
    assert client.post("/api/admin/images", data={"file": (io.BytesIO(b'<svg onload="alert(1)"></svg>'), "evil.png")}, headers=headers).status_code == 400
    image = io.BytesIO()
    Image.new("RGB", (20, 12), color="white").save(image, format="PNG")
    image.seek(0)
    response = client.post("/api/admin/images", data={"file": (image, "photo.png")}, headers=headers)
    assert response.status_code == 201, response.json
    uploaded = response.json
    assert uploaded["width"] == 20 and uploaded["height"] == 12
    result = client.get(uploaded["url"])
    assert result.status_code == 200 and result.content_type == "image/png"
    post = article(client, headers, cover_url=uploaded["url"])
    assert client.delete(f'/api/admin/images/{uploaded["id"]}', headers=headers).status_code == 409
    client.delete(f'/api/admin/articles/{post["id"]}', headers=headers)
    assert client.delete(f'/api/admin/images/{uploaded["id"]}', headers=headers).status_code == 200
    assert client.get(uploaded["url"]).status_code == 404


def test_roles_and_account_management(app):
    admin = app.test_client()
    headers = login(admin)
    created = admin.post("/api/admin/users", json={"username": "editor", "password": PASSWORD, "role": "editor"}, headers=headers)
    assert created.status_code == 201
    editor = app.test_client()
    editor_headers = login(editor, "editor")
    assert editor.get("/api/admin/users").status_code == 403
    assert editor.get("/api/admin/settings").status_code == 403
    assert editor.put("/api/admin/settings", json={"site_title_zh": "unauthorized"}, headers=editor_headers).status_code == 403
    assert article(editor, editor_headers)["id"] > 0
    me = admin.get("/api/auth/me").json["user"]
    assert admin.delete(f'/api/admin/users/{me["id"]}', headers=headers).status_code == 409
    assert admin.patch(f'/api/admin/users/{me["id"]}', json={"role": "editor"}, headers=headers).status_code == 409
    assert admin.patch(f'/api/admin/users/{created.json["id"]}', json={"active": False}, headers=headers).status_code == 200
    assert editor.get("/api/admin/articles").status_code == 401


def test_password_change_invalidates_existing_sessions(app):
    first, second = app.test_client(), app.test_client()
    headers = login(first)
    login(second)
    changed = first.post("/api/auth/password", json={"old_password": PASSWORD, "password": " new-password-with-spaces "}, headers=headers)
    assert changed.status_code == 200
    assert second.get("/api/admin/articles").status_code == 401
    assert first.get("/api/admin/articles").status_code == 200
    login(app.test_client(), password=" new-password-with-spaces ")


def test_login_throttling_persists(app):
    client = app.test_client()
    token = client.get("/api/auth/me").json["csrf_token"]
    codes = []
    for _ in range(10):
        response = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"}, headers={"X-CSRF-Token": token})
        codes.append(response.status_code)
    assert 429 in codes
    fresh = create_app({"TESTING": True, "DATA_DIR": app.config["DATA_DIR"], "COOKIE_SECURE": False})
    other = fresh.test_client()
    csrf = other.get("/api/auth/me").json["csrf_token"]
    assert other.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}, headers={"X-CSRF-Token": csrf}).status_code == 429


def test_settings_validation_and_private_files(app):
    client = app.test_client()
    headers = login(client)
    changed = client.put("/api/admin/settings", json={"site_title_zh": "更新小窝", "posts_per_page": 3}, headers=headers)
    assert changed.status_code == 200
    assert client.get("/api/settings").json["posts_per_page"] == 3
    assert client.put("/api/admin/settings", json={"posts_per_page": 1000}, headers=headers).status_code == 400
    for path in ("/server.py", "/nest.sqlite3", "/.env", "/data/nest.sqlite3", "/backups/original-site.tar.gz"):
        assert client.get(path).status_code == 404
    assert client.get("/healthz").json["status"] == "ok"


def test_public_pagination_rejects_integer_overflow(app):
    client = app.test_client()
    for value in ("9" * 100, "9" * 5000, "1000001"):
        response = client.get("/api/articles", query_string={"page": value})
        assert response.status_code == 400
        assert response.json["code"] == 400
    assert client.get("/api/articles?page=1000000").status_code == 200
