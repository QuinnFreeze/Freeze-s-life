from flask import abort
from werkzeug.exceptions import TooManyRequests

from test_backend import app


def test_missing_page_and_article_keep_status_and_shared_style(app):
    client = app.test_client()
    for path in ('/does-not-exist', '/articles/missing-article', '/data/nest.sqlite3'):
        response = client.get(path)
        assert response.status_code == 404
        assert response.mimetype == 'text/html'
        assert b'class="site-header"' in response.data
        assert b'data-error-code="404"' in response.data
        assert b'__NEST_STATUS_CODE__' not in response.data
        assert b'/assets/paper-background.jpeg' in response.data
        assert response.headers['Cache-Control'] == 'no-store'
        assert response.headers['X-Robots-Tag'] == 'noindex, nofollow'
        assert "script-src 'self'" in response.headers['Content-Security-Policy']


def test_error_response_keeps_protocol_headers_and_api_json(app):
    @app.get('/error-limit-test')
    def limited():
        raise TooManyRequests(retry_after=25)

    client = app.test_client()
    limited_response = client.get('/error-limit-test')
    assert limited_response.status_code == 429
    assert limited_response.headers['Retry-After'] == '25'
    assert b'data-error-code="429"' in limited_response.data
    invalid_method = client.post('/articles')
    assert invalid_method.status_code == 405
    assert 'GET' in invalid_method.headers['Allow']
    missing_api = client.get('/api/missing-route')
    assert missing_api.status_code == 404
    assert missing_api.is_json and missing_api.json['code'] == 404


def test_internal_error_page_does_not_expose_error_details(app):
    @app.get('/error-internal-test')
    def failed():
        abort(500, description='internal-secret-not-for-visitors')

    response = app.test_client().get('/error-internal-test')
    assert response.status_code == 500
    assert response.mimetype == 'text/html'
    assert b'data-error-code="500"' in response.data
    assert b'internal-secret-not-for-visitors' not in response.data
