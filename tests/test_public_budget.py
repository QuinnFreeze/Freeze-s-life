from test_backend import app, article, login


def test_new_visitors_are_bounded_without_blocking_deduplicated_reads(app):
    owner = app.test_client()
    headers = login(owner)
    article(owner, headers)
    existing = app.test_client()
    assert existing.post('/api/articles/hello-world/view').json['views'] == 1
    for _ in range(59):
        visitor = app.test_client()
        assert visitor.post('/api/articles/hello-world/view').status_code == 200
    rejected = app.test_client().post('/api/articles/hello-world/view')
    assert rejected.status_code == 429
    assert int(rejected.headers['Retry-After']) > 0
    assert owner.get('/api/articles/hello-world').json['views'] == 60
    repeated = existing.post('/api/articles/hello-world/view')
    assert repeated.status_code == 200
    assert repeated.json['views'] == 60
    other_ip = app.test_client().post('/api/articles/hello-world/view',
                                    environ_overrides={'REMOTE_ADDR': '192.0.2.45'})
    assert other_ip.status_code == 200
    assert other_ip.json['views'] == 61
