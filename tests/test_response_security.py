import io

from PIL import Image

from test_backend import app, login


def test_https_hsts_does_not_change_plain_http_or_other_hosts(app):
    client = app.test_client()
    secure = client.get('/healthz', base_url='https://xiaoqiuyi.me')
    # The fixture uses localhost as its configured site origin.
    assert secure.status_code == 400
    secure = client.get('/healthz', base_url='https://localhost')
    assert secure.status_code == 200
    assert secure.headers['Strict-Transport-Security'] == 'max-age=31536000'
    assert 'includeSubDomains' not in secure.headers['Strict-Transport-Security']
    plain = client.get('/healthz')
    assert plain.status_code == 200
    assert 'Strict-Transport-Security' not in plain.headers


def test_untrusted_host_rejected_and_loopback_health_stays_available(app):
    client = app.test_client()
    assert client.get('/', headers={'Host': 'attacker.example'}).status_code == 400
    assert client.get('/healthz', headers={'Host': '127.0.0.1:8000'}).status_code == 200
    assert client.get('/healthz', headers={'Host': 'localhost:8765'}).status_code == 200


def test_uploaded_raster_keeps_sandbox_content_security_policy(app):
    client = app.test_client()
    headers = login(client)
    source = io.BytesIO()
    Image.new('RGB', (8, 8), '#8899aa').save(source, 'PNG')
    source.seek(0)
    image = client.post('/api/admin/images', headers=headers,
                        data={'file': (source, 'sample.png')},
                        content_type='multipart/form-data')
    assert image.status_code == 201
    uploaded = client.get(image.json['url'])
    assert uploaded.status_code == 200
    assert uploaded.content_type.startswith('image/png')
    assert uploaded.headers['Content-Security-Policy'] == "default-src 'none'; sandbox"
    assert uploaded.headers['X-Content-Type-Options'] == 'nosniff'
    normal = client.get('/api/auth/me')
    assert "script-src 'self'" in normal.headers['Content-Security-Policy']
