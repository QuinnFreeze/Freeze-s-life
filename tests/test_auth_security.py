"""Regression coverage for malformed CSRF input and session-revocation races."""
import concurrent.futures
import sqlite3
import threading

import pytest
from werkzeug.security import check_password_hash, generate_password_hash

import server

PASSWORD = "isolated-auth-test-password"


@pytest.fixture
def auth_app(tmp_path):
    app = server.create_app({"TESTING": True, "DATA_DIR": str(tmp_path), "COOKIE_SECURE": False, "ORIGIN": "http://localhost"})
    password_hash = generate_password_hash(PASSWORD, method="scrypt")
    with sqlite3.connect(app.config["DATABASE"]) as connection:
        for name, role in (("admin", "admin"), ("editor", "editor")):
            connection.execute("INSERT INTO users(username,password_hash,role,created_at) VALUES (?,?,?,?)", (name, password_hash, role, server.now()))
    return app


def login(app, name):
    client = app.test_client()
    csrf = client.get("/api/auth/me").json["csrf_token"]
    response = client.post("/api/auth/login", json={"username": name, "password": PASSWORD}, headers={"X-CSRF-Token": csrf})
    assert response.status_code == 200
    return client, {"X-CSRF-Token": response.json["csrf_token"]}


def test_non_ascii_csrf_header_is_rejected_without_server_error(auth_app):
    client = auth_app.test_client()
    client.get("/api/auth/me")
    response = client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}, headers={"X-CSRF-Token": "é"})
    assert response.status_code == 403


def test_pending_password_change_cannot_undo_administrator_reset(auth_app, monkeypatch):
    admin, admin_headers = login(auth_app, "admin")
    editor, editor_headers = login(auth_app, "editor")
    editor_id = editor.get("/api/auth/me").json["user"]["id"]
    old_password_checked, release_check = threading.Event(), threading.Event()
    original_check = server.check_password_hash

    def delayed_check(stored, password):
        if threading.current_thread().name.startswith("password-change"):
            old_password_checked.set()
            assert release_check.wait(10)
        return original_check(stored, password)

    monkeypatch.setattr(server, "check_password_hash", delayed_check)
    own_new = "self-change-password-after-reset"
    reset_new = "administrator-reset-password-final"
    with concurrent.futures.ThreadPoolExecutor(max_workers=1, thread_name_prefix="password-change") as own_pool, concurrent.futures.ThreadPoolExecutor(max_workers=1, thread_name_prefix="admin-reset") as reset_pool:
        own = own_pool.submit(editor.post, "/api/auth/password", json={"old_password": PASSWORD, "password": own_new}, headers=editor_headers)
        assert old_password_checked.wait(10)
        reset = reset_pool.submit(admin.patch, f"/api/admin/users/{editor_id}", json={"password": reset_new}, headers=admin_headers)
        try:
            assert reset.result(timeout=10).status_code == 200
        finally:
            release_check.set()
        assert reset.result(timeout=15).status_code == 200
        assert own.result(timeout=15).status_code in (200, 401, 409)
    with sqlite3.connect(auth_app.config["DATABASE"]) as connection:
        stored = connection.execute("SELECT password_hash FROM users WHERE id=?", (editor_id,)).fetchone()[0]
    assert check_password_hash(stored, reset_new)
    assert editor.get("/api/admin/stats").status_code == 401


def test_revoked_administrator_cannot_finish_queued_account_change(auth_app, monkeypatch):
    admin, headers = login(auth_app, "admin")
    users = admin.get("/api/admin/users").json["items"]
    admin_id = next(row["id"] for row in users if row["username"] == "admin")
    editor_id = next(row["id"] for row in users if row["username"] == "editor")
    guard = sqlite3.connect(auth_app.config["DATABASE"], timeout=15)
    guard.execute("BEGIN IMMEDIATE")
    awaiting_write_lock = threading.Event()
    original_connect = sqlite3.connect

    class TracedConnection(sqlite3.Connection):
        def execute(self, sql, parameters=()):
            if sql == "BEGIN IMMEDIATE" and threading.current_thread().name.startswith("queued-account-change"):
                awaiting_write_lock.set()
            return super().execute(sql, parameters)

    def connect(*args, **kwargs):
        kwargs["factory"] = TracedConnection
        return original_connect(*args, **kwargs)

    monkeypatch.setattr(server.sqlite3, "connect", connect)
    with concurrent.futures.ThreadPoolExecutor(max_workers=1, thread_name_prefix="queued-account-change") as pool:
        queued = pool.submit(admin.patch, f"/api/admin/users/{editor_id}", json={"role": "admin"}, headers=headers)
        try:
            assert awaiting_write_lock.wait(10)
            # Model a completed administrator password reset/revocation while
            # the older authenticated request waits for the database lock.
            guard.execute("UPDATE users SET password_hash=? WHERE id=?", (generate_password_hash("revoked-admin-password", method="scrypt"), admin_id))
            guard.execute("DELETE FROM sessions WHERE user_id=?", (admin_id,))
            guard.commit()
        finally:
            guard.close()
        response = queued.result(timeout=15)
    assert response.status_code == 401
    with original_connect(auth_app.config["DATABASE"]) as connection:
        assert connection.execute("SELECT role FROM users WHERE id=?", (editor_id,)).fetchone()[0] == "editor"


def test_account_route_rejects_sqlite_integer_overflow(auth_app):
    admin, headers = login(auth_app, "admin")
    for value in ("9223372036854775808", "9" * 100):
        response = admin.patch(f"/api/admin/users/{value}", json={"role": "editor"}, headers=headers)
        assert response.status_code == 404


def test_cookie_less_session_creation_is_limited_but_valid_clients_keep_working(auth_app):
    established = auth_app.test_client()
    token = established.get("/api/auth/me").json["csrf_token"]
    anonymous = auth_app.test_client(use_cookies=False)
    for _ in range(29):
        assert anonymous.get("/api/auth/me").status_code == 200
    blocked = anonymous.get("/api/auth/me")
    assert blocked.status_code == 429
    assert 1 <= int(blocked.headers["Retry-After"]) <= 60
    assert established.get("/api/auth/me").json["csrf_token"] == token
    signed_in = established.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}, headers={"X-CSRF-Token": token})
    assert signed_in.status_code == 200
    with sqlite3.connect(auth_app.config["DATABASE"]) as connection:
        assert connection.execute("SELECT COUNT(*) FROM sessions").fetchone()[0] == 30
        assert connection.execute("SELECT COUNT(*) FROM request_budgets").fetchone()[0] == 1
        key = connection.execute("SELECT client_hash FROM request_budgets").fetchone()[0]
        assert len(key) == 64 and "127.0.0.1" not in key
    fresh = server.create_app({"TESTING": True, "DATA_DIR": auth_app.config["DATA_DIR"], "COOKIE_SECURE": False, "ORIGIN": "http://localhost"})
    assert fresh.test_client(use_cookies=False).get("/api/auth/me").status_code == 429


def test_session_rate_buckets_are_bounded_and_expire(auth_app, monkeypatch):
    clock = [1_800_000_000.0]
    monkeypatch.setattr(server.time, "time", lambda: clock[0])
    monkeypatch.setattr(server, "MAX_REQUEST_BUDGET_BUCKETS", 3)
    for address in ("192.0.2.1", "192.0.2.2", "192.0.2.3"):
        assert auth_app.test_client(use_cookies=False).get("/api/auth/me", environ_overrides={"REMOTE_ADDR": address}).status_code == 200
    assert auth_app.test_client(use_cookies=False).get("/api/auth/me", environ_overrides={"REMOTE_ADDR": "192.0.2.4"}).status_code == 429
    # Already-accounted-for addresses can still use their remaining budget.
    assert auth_app.test_client(use_cookies=False).get("/api/auth/me", environ_overrides={"REMOTE_ADDR": "192.0.2.1"}).status_code == 200
    clock[0] += 61
    assert auth_app.test_client(use_cookies=False).get("/api/auth/me", environ_overrides={"REMOTE_ADDR": "192.0.2.4"}).status_code == 200
    with sqlite3.connect(auth_app.config["DATABASE"]) as connection:
        assert connection.execute("SELECT COUNT(*) FROM request_budgets").fetchone()[0] == 1


def test_session_creation_budget_is_atomic_under_concurrent_requests(auth_app):
    def new_session(_):
        return auth_app.test_client(use_cookies=False).get("/api/auth/me").status_code

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(new_session, range(35)))
    assert results.count(200) == 30 and results.count(429) == 5
    with sqlite3.connect(auth_app.config["DATABASE"]) as connection:
        assert connection.execute("SELECT COUNT(*) FROM sessions").fetchone()[0] == 30
