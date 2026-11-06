"""Freeze's Nest: isolated bilingual publishing service.

Production entry point: gunicorn 'server:create_app()'. Runtime data lives only
in NEST_DATA_DIR. No Komari files, ports or database are used by this service.
"""
from __future__ import annotations

import argparse
import fcntl
import hashlib
import hmac
import io
import json
import math
import os
from pathlib import Path
import re
import secrets
import sqlite3
import threading
import time
from datetime import datetime, timezone
from functools import wraps
from urllib.parse import urlsplit
import warnings

import bleach
from flask import Flask, abort, g, jsonify, request, send_from_directory
from markdown_it import MarkdownIt
from PIL import Image, ImageOps, UnidentifiedImageError
from werkzeug.exceptions import HTTPException, TooManyRequests
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash, generate_password_hash

ROOT = Path(__file__).resolve().parent
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
USERNAME = re.compile(r"^[A-Za-z0-9_.-]{3,64}$")
TOKEN = re.compile(r"^[A-Za-z0-9_-]{32,128}$")
MAX_REQUEST_BUDGET_BUCKETS = 10_000
MARKDOWN = MarkdownIt("commonmark", {"html": False, "breaks": True}).enable("table")
Image.MAX_IMAGE_PIXELS = 12_000_000
DEFAULT_SETTINGS = {
    "site_title_zh": "秋易的小窝", "site_title_en": "Freeze’s Nest",
    "description_zh": "阅读、思考与技术实践。", "description_en": "Reading, thoughts and technical practice.",
    "posts_per_page": 9,
}
SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','editor')),
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 csrf TEXT NOT NULL, expires REAL NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
CREATE TABLE IF NOT EXISTS login_attempts (key TEXT NOT NULL, attempted_at REAL NOT NULL);
CREATE INDEX IF NOT EXISTS login_time ON login_attempts(key,attempted_at);
CREATE TABLE IF NOT EXISTS request_budgets (
 scope TEXT NOT NULL, client_hash TEXT NOT NULL, window_start INTEGER NOT NULL,
 hits INTEGER NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY(scope,client_hash));
CREATE INDEX IF NOT EXISTS request_budget_expiry ON request_budgets(expires_at);
CREATE TABLE IF NOT EXISTS categories (
 id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name_zh TEXT NOT NULL, name_en TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS articles (
 id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE,
 title_zh TEXT NOT NULL DEFAULT '', title_en TEXT NOT NULL DEFAULT '',
 content_zh TEXT NOT NULL DEFAULT '', content_en TEXT NOT NULL DEFAULT '',
 excerpt_zh TEXT NOT NULL DEFAULT '', excerpt_en TEXT NOT NULL DEFAULT '',
 cover_url TEXT NOT NULL DEFAULT '', category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
 tags TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
 published_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS article_publication ON articles(status,published_at DESC);
CREATE INDEX IF NOT EXISTS article_category ON articles(category_id);
CREATE TABLE IF NOT EXISTS article_views (
 article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
 visitor_hash TEXT NOT NULL, last_seen REAL NOT NULL, PRIMARY KEY(article_id,visitor_hash));
CREATE TABLE IF NOT EXISTS images (
 id INTEGER PRIMARY KEY, filename TEXT NOT NULL, stored_name TEXT NOT NULL UNIQUE,
 width INTEGER NOT NULL, height INTEGER NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY,value TEXT NOT NULL);
PRAGMA user_version=1;
"""


def now():
    return datetime.now(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def render_markdown(content):
    tags = {"p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code", "em", "strong", "s", "ul", "ol", "li", "a", "img", "table", "thead", "tbody", "tr", "th", "td"}
    return bleach.clean(MARKDOWN.render(content), tags=tags,
        attributes={"a": ["href", "title"], "img": ["src", "alt", "title"], "code": ["class"], "ol": ["start"], "th": ["align"], "td": ["align"]},
        protocols={"http", "https", "mailto"}, strip=True)


def create_app(test_config=None):
    app = Flask(__name__, static_folder=None)
    upload_lock = threading.Lock()
    app.config.update(
        DATA_DIR=os.environ.get("NEST_DATA_DIR", str(ROOT / "data")),
        PUBLIC_DIR=str(ROOT / "public"),
        ORIGIN=os.environ.get("NEST_ORIGIN", "https://xiaoqiuyi.me"),
        COOKIE_SECURE=os.environ.get("NEST_COOKIE_SECURE", "1") != "0",
        MAX_CONTENT_LENGTH=11 * 1024 * 1024, MAX_FORM_PARTS=10,
        MAX_FORM_MEMORY_SIZE=64 * 1024,
    )
    if test_config:
        app.config.update(test_config)
    if app.config.get("TRUSTED_HOSTS") is None:
        configured_host = urlsplit(app.config["ORIGIN"]).hostname
        app.config["TRUSTED_HOSTS"] = list(dict.fromkeys(
            host for host in (configured_host, "localhost", "127.0.0.1") if host))
    if os.environ.get("NEST_TRUST_PROXY") == "1":
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)
    data_dir = Path(app.config["DATA_DIR"])
    data_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    (data_dir / "uploads").mkdir(exist_ok=True, mode=0o700)
    app.config["DATABASE"] = str(data_dir / "nest.sqlite3")
    salt_path = data_dir / "privacy-key"
    fd = os.open(salt_path, os.O_CREAT | os.O_RDWR, 0o600)
    with os.fdopen(fd, "r+") as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        salt = f.read()
        if not salt:
            salt = secrets.token_hex(32)
            f.write(salt)
            f.flush()
            os.fsync(f.fileno())
        app.config["PRIVACY_KEY"] = salt.encode()
    app.config["AUTH_COOKIE"] = "__Host-nest_session" if app.config["COOKIE_SECURE"] else "nest_session"
    with sqlite3.connect(app.config["DATABASE"], timeout=15) as db:
        db.execute("PRAGMA journal_mode=WAL")
        db.execute("PRAGMA foreign_keys=ON")
        db.executescript(SCHEMA)
        for key, value in DEFAULT_SETTINGS.items():
            db.execute("INSERT OR IGNORE INTO settings(key,value) VALUES (?,?)", (key, json.dumps(value, ensure_ascii=False)))
    os.chmod(app.config["DATABASE"], 0o600)

    def db():
        if "db" not in g:
            g.db = sqlite3.connect(app.config["DATABASE"], timeout=15)
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA foreign_keys=ON")
            g.db.execute("PRAGMA busy_timeout=15000")
        return g.db

    @app.teardown_appcontext
    def close_db(error=None):
        connection = g.pop("db", None)
        if connection:
            connection.close()

    def private_hash(value):
        return hmac.new(app.config["PRIVACY_KEY"], value.encode(), hashlib.sha256).hexdigest()

    def problem(message, code=400):
        abort(code, description=message)

    def payload():
        result = request.get_json(silent=True)
        if not isinstance(result, dict):
            problem("请求需要 JSON 对象 / A JSON object is required")
        return result

    def text_field(body, key, maximum=200, default=""):
        value = body.get(key, default)
        if not isinstance(value, str) or len(value) > maximum:
            problem(f"字段无效 / Invalid field: {key}")
        return value if key == "content" or key.startswith("content_") or "password" in key else value.strip()

    def enforce_request_budget(scope, limit, window_seconds=60):
        """Budget new persistent public records; join the caller's transaction.

        Expiry cleanup acquires SQLite's write lock before checking/incrementing
        the counter. No commit here: the accepted record and budget commit
        together, including when called inside an existing BEGIN IMMEDIATE.
        """
        timestamp = time.time()
        window = int(timestamp // window_seconds) * window_seconds
        expires = window + window_seconds
        key = private_hash("request-budget:" + scope + ":" + (request.remote_addr or "unknown"))
        connection = db()
        connection.execute("DELETE FROM request_budgets WHERE expires_at<=?", (timestamp,))
        row = connection.execute("SELECT hits FROM request_budgets WHERE scope=? AND client_hash=?", (scope, key)).fetchone()
        if row and row["hits"] >= limit:
            raise TooManyRequests(description="请求过于频繁，请稍后重试 / Too many requests; retry shortly", retry_after=max(1, math.ceil(expires - timestamp)))
        if row:
            connection.execute("UPDATE request_budgets SET hits=hits+1 WHERE scope=? AND client_hash=?", (scope, key))
        else:
            if connection.execute("SELECT COUNT(*) FROM request_budgets").fetchone()[0] >= MAX_REQUEST_BUDGET_BUCKETS:
                raise TooManyRequests(description="请求过于频繁，请稍后重试 / Too many requests; retry shortly", retry_after=max(1, math.ceil(expires - timestamp)))
            connection.execute("INSERT INTO request_budgets(scope,client_hash,window_start,hits,expires_at) VALUES (?,?,?,1,?)", (scope, key, window, expires))

    def session(create=False):
        if "auth_session" not in g:
            token = request.cookies.get(app.config["AUTH_COOKIE"], "")
            row = db().execute("SELECT * FROM sessions WHERE token_hash=? AND expires>?", (digest(token), time.time())).fetchone() if TOKEN.fullmatch(token) else None
            g.auth_session = row
        if g.auth_session is None and create:
            enforce_request_budget("anonymous-session", 30)
            token = secrets.token_urlsafe(32)
            csrf = secrets.token_urlsafe(32)
            expires = time.time() + 1800
            db().execute("INSERT INTO sessions VALUES (?,?,?,?)", (digest(token), None, csrf, expires))
            db().execute("DELETE FROM sessions WHERE expires<?", (time.time(),))
            db().commit()
            g.auth_session = dict(token_hash=digest(token), user_id=None, csrf=csrf, expires=expires)
            g.set_auth_cookie = (token, 1800)
        return g.auth_session

    def user():
        s = session()
        if not s or not s["user_id"]:
            return None
        # Cached request metadata must not keep a session alive after another
        # request has revoked it while this request waits for a write lock.
        return db().execute("SELECT u.id,u.username,u.role,u.active,u.created_at FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires>? AND u.active=1", (s["token_hash"], time.time())).fetchone()

    def user_json(row):
        return dict(row) if row else None

    def require_user(admin=False):
        u = user()
        if not u:
            problem("请先登录 / Authentication required", 401)
        if admin and u["role"] != "admin":
            problem("需要管理员权限 / Administrator permission required", 403)
        return u

    def same_origin():
        origin = request.headers.get("Origin")
        if origin and origin.rstrip("/") != app.config["ORIGIN"].rstrip("/"):
            problem("请求来源无效 / Invalid request origin", 403)
        if request.headers.get("Sec-Fetch-Site") == "cross-site":
            problem("禁止跨站请求 / Cross-site request forbidden", 403)

    def csrf_check():
        same_origin()
        s = session()
        value = request.headers.get("X-CSRF-Token", "")
        if not s or not TOKEN.fullmatch(value) or not hmac.compare_digest(value, s["csrf"]):
            problem("安全令牌已失效，请刷新后重试 / Refresh and try again", 403)

    def rotate_session(user_id):
        old = session()
        if old:
            db().execute("DELETE FROM sessions WHERE token_hash=?", (old["token_hash"],))
        token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        expires = time.time() + 28800
        db().execute("INSERT INTO sessions VALUES (?,?,?,?)", (digest(token), user_id, csrf, expires))
        db().commit()
        g.auth_session = dict(token_hash=digest(token), user_id=user_id, csrf=csrf, expires=expires)
        g.set_auth_cookie = (token, 28800)
        return csrf

    @app.before_request
    def protect_admin():
        if request.path.startswith("/api/admin/"):
            require_user()
            if request.method not in ("GET", "HEAD", "OPTIONS"):
                csrf_check()
        elif request.path.startswith("/api/auth/") and request.method != "GET":
            csrf_check()

    @app.after_request
    def response_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers.setdefault("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'")
        if request.is_secure:
            response.headers["Strict-Transport-Security"] = "max-age=31536000"
        if request.path.startswith(("/api/", "/admin")):
            response.headers["Cache-Control"] = "no-store"
            response.headers["Vary"] = "Cookie"
        if "set_auth_cookie" in g:
            token, max_age = g.set_auth_cookie
            response.set_cookie(app.config["AUTH_COOKIE"], token, max_age=max_age,
                secure=app.config["COOKIE_SECURE"], httponly=True, samesite="Strict", path="/")
        return response

    @app.errorhandler(HTTPException)
    def http_error(error):
        if request.path.startswith("/api/") or request.path == "/healthz":
            response = jsonify(error=error.description, code=error.code)
            response.status_code = error.code
        else:
            markup = (Path(app.config["PUBLIC_DIR"]) / "error.html").read_text(encoding="utf-8")
            response = app.response_class(markup.replace("__NEST_STATUS_CODE__", str(error.code)),
                                          status=error.code, mimetype="text/html")
            response.headers["X-Robots-Tag"] = "noindex, nofollow"
            response.headers["Cache-Control"] = "no-store"
        for name, value in error.get_headers():
            if name in ("Retry-After", "Allow", "WWW-Authenticate"):
                response.headers[name] = value
        return response

    @app.errorhandler(sqlite3.IntegrityError)
    def integrity_error(error):
        if "db" in g:
            db().rollback()
        return jsonify(error="名称或链接已存在，或关联数据无效 / Duplicate or invalid related data", code=409), 409

    @app.errorhandler(500)
    def internal_error(error):
        if not request.path.startswith("/api/") and request.path != "/healthz":
            return http_error(error)
        return jsonify(error="服务器内部错误 / Internal server error", code=500), 500

    @app.get("/healthz")
    def health():
        db().execute("SELECT 1").fetchone()
        return jsonify(status="ok", service="freeze-nest")

    @app.get("/api/auth/me")
    def auth_me():
        s = session(create=True)
        return jsonify(user=user_json(user()), csrf_token=s["csrf"])

    @app.post("/api/auth/login")
    def login():
        body = payload()
        username = text_field(body, "username", 64)
        password = text_field(body, "password", 256)
        client_key = private_hash("login-ip:" + (request.remote_addr or "unknown"))
        account_key = private_hash("login-user:" + username.lower())
        cutoff = time.time() - 900
        connection = db()
        connection.execute("DELETE FROM login_attempts WHERE attempted_at<?", (time.time() - 86400,))
        count = connection.execute("SELECT COUNT(*) FROM login_attempts WHERE key IN (?,?) AND attempted_at>?", (client_key, account_key, cutoff)).fetchone()[0]
        if count >= 16:
            connection.commit()
            response = jsonify(error="尝试过多，请 15 分钟后重试 / Too many attempts; retry in 15 minutes", code=429)
            response.status_code = 429
            response.headers["Retry-After"] = "900"
            return response
        row = connection.execute("SELECT * FROM users WHERE username=? COLLATE NOCASE AND active=1", (username,)).fetchone()
        valid = check_password_hash(row["password_hash"], password) if row else check_password_hash(app.config["DUMMY_PASSWORD_HASH"], password)
        if not valid or not row:
            connection.executemany("INSERT INTO login_attempts VALUES (?,?)", [(client_key, time.time()), (account_key, time.time())])
            connection.commit()
            problem("账号或密码错误 / Invalid username or password", 401)
        connection.execute("DELETE FROM login_attempts WHERE key=?", (account_key,))
        csrf = rotate_session(row["id"])
        return jsonify(user=user_json(user()), csrf_token=csrf)

    @app.post("/api/auth/logout")
    def logout():
        s = session()
        if s:
            db().execute("DELETE FROM sessions WHERE token_hash=?", (s["token_hash"],))
            db().commit()
        g.auth_session = None
        g.set_auth_cookie = ("", 0)
        return jsonify(ok=True)

    def password_hash(password):
        if not isinstance(password, str) or not 12 <= len(password) <= 128:
            problem("密码需为 12–128 个字符 / Password must contain 12–128 characters")
        return generate_password_hash(password, method="scrypt")

    @app.post("/api/auth/password")
    def change_password():
        u = require_user()
        body = payload()
        old = text_field(body, "old_password", 256)
        row = db().execute("SELECT password_hash FROM users WHERE id=?", (u["id"],)).fetchone()
        if not check_password_hash(row[0], old):
            problem("原密码错误 / Current password is incorrect", 400)
        hashed = password_hash(body.get("password"))
        db().execute("BEGIN IMMEDIATE")
        u = require_user()
        current = db().execute("SELECT password_hash FROM users WHERE id=?", (u["id"],)).fetchone()
        if not current or not hmac.compare_digest(current[0], row[0]):
            problem("密码已被更新，请重新登录 / Credentials changed; sign in again", 409)
        db().execute("UPDATE users SET password_hash=? WHERE id=?", (hashed, u["id"]))
        db().execute("DELETE FROM sessions WHERE user_id=?", (u["id"],))
        csrf = rotate_session(u["id"])
        return jsonify(ok=True, csrf_token=csrf)

    def settings():
        return {r["key"]: json.loads(r["value"]) for r in db().execute("SELECT * FROM settings")}

    @app.get("/api/settings")
    @app.get("/api/admin/settings")
    def get_settings():
        if request.path.startswith("/api/admin"):
            require_user(admin=True)
        return jsonify(settings())

    @app.put("/api/admin/settings")
    def put_settings():
        require_user(admin=True)
        body = payload()
        values = settings()
        for k in DEFAULT_SETTINGS:
            if k not in body:
                continue
            if k == "posts_per_page":
                v = body[k]
                if isinstance(v, bool) or not isinstance(v, int) or not 1 <= v <= 50:
                    problem("每页文章数需为 1–50 / Posts per page must be 1–50")
                values[k] = v
            else:
                values[k] = text_field(body, k, 300)
        # Write submitted fields only: another editor may have updated an
        # unrelated setting since the snapshot above was read.
        for k, v in values.items():
            if k not in body:
                continue
            db().execute("UPDATE settings SET value=? WHERE key=?", (json.dumps(v, ensure_ascii=False), k))
        db().commit()
        return jsonify(settings())

    def lang():
        value = request.args.get("lang", "zh")
        if value not in ("zh", "en"):
            problem("语言无效 / Invalid language")
        return value

    def pagination(default=20):
        try:
            page = max(1, int(request.args.get("page", "1")))
            per_page = min(50, max(1, int(request.args.get("per_page", default))))
        except (ValueError, TypeError):
            problem("分页参数无效 / Invalid pagination")
        if page > 1_000_000:
            problem("页码过大 / Page number is too large")
        return page, per_page

    def page_result(items, total, page, per_page):
        return jsonify(items=items, total=total, page=page, pages=math.ceil(total / per_page), per_page=per_page)

    def category_json(row, language=None):
        item = dict(row)
        if language:
            item["name"] = item.get("name_" + language) or item["name_zh"] or item["name_en"]
        return item

    @app.get("/api/categories")
    @app.get("/api/admin/categories")
    def categories():
        language = lang() if request.path == "/api/categories" else None
        count_filter = "a.status='published' AND a.published_at<=?" if language else "1=1"
        params = [now()] if language else []
        if language:
            count_filter += f" AND a.title_{language}<>'' AND a.content_{language}<>''"
        rows = db().execute(f"SELECT c.*,COUNT(a.id) AS count FROM categories c LEFT JOIN articles a ON a.category_id=c.id AND {count_filter} GROUP BY c.id ORDER BY c.id", params).fetchall()
        return jsonify(items=[category_json(row, language) for row in rows])

    def category_body(body, old=None):
        old = dict(old) if old else {}
        slug = text_field(body, "slug", 120, old.get("slug", ""))
        zh = text_field(body, "name_zh", 80, old.get("name_zh", ""))
        en = text_field(body, "name_en", 80, old.get("name_en", ""))
        if not SLUG.fullmatch(slug) or not (zh or en):
            problem("请填写分类名和有效链接 / Category name and lowercase slug required")
        return slug, zh, en

    @app.post("/api/admin/categories")
    def create_category():
        values = category_body(payload())
        cursor = db().execute("INSERT INTO categories(slug,name_zh,name_en) VALUES (?,?,?)", values)
        db().commit()
        return jsonify(dict(db().execute("SELECT *,0 AS count FROM categories WHERE id=?", (cursor.lastrowid,)).fetchone())), 201

    @app.route("/api/admin/categories/<int(max=9223372036854775807):ident>", methods=["PUT", "DELETE"])
    def manage_category(ident):
        old = db().execute("SELECT * FROM categories WHERE id=?", (ident,)).fetchone()
        if not old:
            problem("分类不存在 / Category not found", 404)
        if request.method == "DELETE":
            db().execute("DELETE FROM categories WHERE id=?", (ident,))
            db().commit()
            return jsonify(ok=True)
        values = category_body(payload(), old)
        db().execute("UPDATE categories SET slug=?,name_zh=?,name_en=? WHERE id=?", (*values, ident))
        db().commit()
        return jsonify(dict(db().execute("SELECT * FROM categories WHERE id=?", (ident,)).fetchone()))

    def admin_article(row):
        result = dict(row)
        result["tags"] = json.loads(result["tags"])
        return result

    def public_article(row, language, include_content=False):
        result = {k: row[k] for k in ("id", "slug", "cover_url", "published_at", "updated_at", "views")}
        result.update(title=row["title_" + language], excerpt=row["excerpt_" + language], tags=json.loads(row["tags"]),
            available_languages=[l for l in ("zh", "en") if row["title_" + l] and row["content_" + l]])
        if not result["excerpt"]:
            plain = re.sub(r"[#*`>\[\]!_]+", "", row["content_" + language])
            result["excerpt"] = re.sub(r"\s+", " ", plain)[:180]
        result["category"] = None
        if row["category_id"]:
            c = db().execute("SELECT * FROM categories WHERE id=?", (row["category_id"],)).fetchone()
            if c:
                result["category"] = {"id": c["id"], "slug": c["slug"], "name": c["name_" + language] or c["name_zh"] or c["name_en"]}
        if include_content:
            result["content"] = row["content_" + language]
            result["html"] = render_markdown(result["content"])
        return result

    def published_row(slug):
        row = db().execute("SELECT * FROM articles WHERE slug=? AND status='published' AND published_at<=?", (slug, now())).fetchone()
        if not row:
            problem("文章不存在或尚未发布 / Article not found", 404)
        return row

    @app.get("/api/articles")
    def article_list():
        language = lang()
        page, size = pagination(settings()["posts_per_page"])
        where = ["a.status='published'", "a.published_at<=?", f"a.title_{language}<>''", f"a.content_{language}<>''"]
        args = [now()]
        q = request.args.get("q", "").strip()[:200]
        if q:
            where.append(f"(a.title_{language} LIKE ? ESCAPE '\\' OR a.content_{language} LIKE ? ESCAPE '\\' OR a.tags LIKE ? ESCAPE '\\')")
            term = "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
            args.extend([term, term, term])
        if request.args.get("category"):
            where.append("a.category_id IN (SELECT id FROM categories WHERE slug=? OR CAST(id AS TEXT)=?)")
            args.extend([request.args["category"], request.args["category"]])
        if request.args.get("tag"):
            where.append("EXISTS (SELECT 1 FROM json_each(a.tags) WHERE value=?)")
            args.append(request.args["tag"][:40])
        condition = " AND ".join(where)
        total = db().execute("SELECT COUNT(*) FROM articles a WHERE " + condition, args).fetchone()[0]
        rows = db().execute("SELECT a.* FROM articles a WHERE " + condition + " ORDER BY a.published_at DESC,a.id DESC LIMIT ? OFFSET ?", [*args, size, (page - 1) * size]).fetchall()
        return page_result([public_article(row, language) for row in rows], total, page, size)

    @app.get("/api/articles/<slug>")
    def get_article(slug):
        language = lang()
        row = published_row(slug)
        if not row["title_" + language] or not row["content_" + language]:
            return jsonify(error="此语言版本尚未发布 / This translation is not available", code=404,
                available_languages=[l for l in ("zh", "en") if row["title_" + l] and row["content_" + l]]), 404
        return jsonify(public_article(row, language, True))

    @app.post("/api/articles/<slug>/view")
    def article_view(slug):
        same_origin()
        row = published_row(slug)
        visitor = request.cookies.get("nest_visitor", "")
        new_visitor = not bool(TOKEN.fullmatch(visitor))
        if new_visitor:
            visitor = secrets.token_urlsafe(32)
        key = private_hash("view:" + visitor)
        connection = db()
        connection.execute("BEGIN IMMEDIATE")
        seen = connection.execute("SELECT last_seen FROM article_views WHERE article_id=? AND visitor_hash=?", (row["id"], key)).fetchone()
        if not seen or seen[0] < time.time() - 86400:
            enforce_request_budget("article-view", 60)
            connection.execute("INSERT INTO article_views VALUES (?,?,?) ON CONFLICT(article_id,visitor_hash) DO UPDATE SET last_seen=excluded.last_seen", (row["id"], key, time.time()))
            connection.execute("UPDATE articles SET views=views+1 WHERE id=?", (row["id"],))
        connection.execute("DELETE FROM article_views WHERE last_seen<?", (time.time() - 86400 * 31,))
        connection.commit()
        count = connection.execute("SELECT views FROM articles WHERE id=?", (row["id"],)).fetchone()[0]
        response = jsonify(views=count)
        if new_visitor:
            response.set_cookie("nest_visitor", visitor, max_age=86400 * 365,
                secure=app.config["COOKIE_SECURE"], httponly=True, samesite="Lax", path="/")
        return response

    def parse_date(value):
        if value is None or value == "":
            return None
        if not isinstance(value, str):
            problem("发布时间无效 / Invalid publication time")
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if not dt.tzinfo:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")
        except (ValueError, OverflowError):
            problem("发布时间无效 / Invalid publication time")

    def article_body(body, previous=None):
        old = dict(previous) if previous else {}
        result = {}
        for key in ("title_zh", "title_en", "content_zh", "content_en", "excerpt_zh", "excerpt_en"):
            limit = 500000 if key.startswith("content") else 300 if key.startswith("title") else 1000
            result[key] = text_field(body, key, limit, old.get(key, ""))
        result["slug"] = text_field(body, "slug", 160, old.get("slug", ""))
        if not result["slug"]:
            result["slug"] = "article-" + secrets.token_hex(6)
        if not SLUG.fullmatch(result["slug"]):
            problem("文章链接只能含小写英文字母、数字和连字符 / Invalid article slug")
        result["status"] = body.get("status", old.get("status", "draft"))
        if result["status"] not in ("draft", "published"):
            problem("状态无效 / Invalid article status")
        if result["status"] == "published":
            pairs = [(bool(result["title_" + l]), bool(result["content_" + l].strip())) for l in ("zh", "en")]
            if not any(a and b for a, b in pairs) or any(a != b for a, b in pairs):
                problem("发布时，每个语言版本都需同时填写标题与正文 / Each published translation requires a title and content")
        category = body.get("category_id", old.get("category_id"))
        if category in ("", None):
            category = None
        elif isinstance(category, bool) or not isinstance(category, int) or not 1 <= category <= 9223372036854775807 or not db().execute("SELECT 1 FROM categories WHERE id=?", (category,)).fetchone():
            problem("分类无效 / Invalid category")
        result["category_id"] = category
        tags = body.get("tags", json.loads(old.get("tags", "[]")))
        if not isinstance(tags, list) or len(tags) > 20 or any(not isinstance(t, str) or not 1 <= len(t.strip()) <= 40 for t in tags):
            problem("标签最多 20 个，每个 1–40 字符 / Invalid tags")
        result["tags"] = json.dumps(list(dict.fromkeys(t.strip() for t in tags)), ensure_ascii=False)
        cover = text_field(body, "cover_url", 2048, old.get("cover_url", ""))
        try:
            parsed = urlsplit(cover)
            # Accessing .port also validates malformed or out-of-range ports.
            parsed.port
        except ValueError:
            problem("封面需为已上传图片或 HTTPS 地址 / Invalid cover URL")
        if cover and not (cover.startswith("/uploads/") and ".." not in cover or parsed.scheme == "https" and parsed.hostname and parsed.username is None and parsed.password is None):
            problem("封面需为已上传图片或 HTTPS 地址 / Invalid cover URL")
        result["cover_url"] = cover
        result["published_at"] = parse_date(body.get("published_at", old.get("published_at")))
        if result["status"] == "published" and not result["published_at"]:
            result["published_at"] = now()
        result["updated_at"] = now()
        return result

    @app.get("/api/admin/articles")
    def admin_articles():
        page, size = pagination()
        where, args = [], []
        status = request.args.get("status")
        if status:
            if status not in ("draft", "published"):
                problem("状态无效 / Invalid status")
            where.append("status=?")
            args.append(status)
        q = request.args.get("q", "").strip()[:200]
        if q:
            where.append("(title_zh LIKE ? OR title_en LIKE ? OR slug LIKE ? OR content_zh LIKE ? OR content_en LIKE ?)")
            args.extend(["%" + q + "%"] * 5)
        condition = " WHERE " + " AND ".join(where) if where else ""
        total = db().execute("SELECT COUNT(*) FROM articles" + condition, args).fetchone()[0]
        rows = db().execute("SELECT * FROM articles" + condition + " ORDER BY updated_at DESC,id DESC LIMIT ? OFFSET ?", [*args, size, (page - 1) * size]).fetchall()
        return page_result([admin_article(row) for row in rows], total, page, size)

    @app.post("/api/admin/articles")
    def create_article():
        values = article_body(payload())
        values["created_at"] = now()
        columns = list(values)
        cursor = db().execute("INSERT INTO articles (" + ",".join(columns) + ") VALUES (" + ",".join("?" for _ in columns) + ")", list(values.values()))
        db().commit()
        return jsonify(admin_article(db().execute("SELECT * FROM articles WHERE id=?", (cursor.lastrowid,)).fetchone())), 201

    @app.route("/api/admin/articles/<int(max=9223372036854775807):ident>", methods=["GET", "PUT", "DELETE"])
    def manage_article(ident):
        row = db().execute("SELECT * FROM articles WHERE id=?", (ident,)).fetchone()
        if not row:
            problem("文章不存在 / Article not found", 404)
        if request.method == "GET":
            return jsonify(admin_article(row))
        if request.method == "DELETE":
            db().execute("DELETE FROM articles WHERE id=?", (ident,))
            db().commit()
            return jsonify(ok=True)
        body = payload()
        if body.get("updated_at") and body["updated_at"] != row["updated_at"]:
            problem("文章已被其他窗口更新，请重新加载 / Article changed; reload before saving", 409)
        values = article_body(body, row)
        keys = list(values)
        cursor = db().execute("UPDATE articles SET " + ",".join(k + "=?" for k in keys) + " WHERE id=? AND updated_at=?", [*values.values(), ident, row["updated_at"]])
        if cursor.rowcount != 1:
            db().rollback()
            problem("文章已更新，请重新加载 / Article changed; reload before saving", 409)
        db().commit()
        return jsonify(admin_article(db().execute("SELECT * FROM articles WHERE id=?", (ident,)).fetchone()))

    @app.post("/api/admin/preview")
    def preview():
        content = text_field(payload(), "content", 500000)
        return jsonify(html=render_markdown(content))

    @app.get("/api/admin/stats")
    def stats():
        row = db().execute("SELECT COUNT(*) AS articles,COALESCE(SUM(status='draft'),0) AS drafts,COALESCE(SUM(status='published'),0) AS published,COALESCE(SUM(views),0) AS views FROM articles").fetchone()
        return jsonify(**dict(row), images=db().execute("SELECT COUNT(*) FROM images").fetchone()[0])

    def image_json(row):
        return {k: row[k] for k in ("id", "filename", "width", "height", "size", "created_at")} | {"url": "/uploads/" + row["stored_name"]}

    @app.get("/api/admin/images")
    def images():
        rows = db().execute("SELECT * FROM images ORDER BY id DESC").fetchall()
        return jsonify(items=[image_json(row) for row in rows])

    def serialize_upload(function):
        @wraps(function)
        def wrapped(*args, **kwargs):
            # Keep peak decoded-image memory bounded on the small production host.
            with upload_lock:
                return function(*args, **kwargs)
        return wrapped

    @app.post("/api/admin/images")
    @serialize_upload
    def upload_image():
        upload = request.files.get("file")
        if not upload or not upload.filename:
            problem("请选择图片 / Choose an image")
        content = upload.read(10 * 1024 * 1024 + 1)
        if len(content) > 10 * 1024 * 1024:
            problem("图片不能超过 10MB / Image exceeds 10MB", 413)
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("error", Image.DecompressionBombWarning)
                with Image.open(io.BytesIO(content)) as image:
                    image.verify()
                with Image.open(io.BytesIO(content)) as source:
                    if source.format not in ("JPEG", "PNG", "WEBP", "GIF"):
                        problem("只支持 JPEG、PNG、WebP 和 GIF / Unsupported image format")
                    if source.width > 10000 or source.height > 10000:
                        problem("图片尺寸过大 / Image dimensions too large")
                    ImageOps.exif_transpose(source, in_place=True)
                    width, height = source.size
                    output = io.BytesIO()
                    # Re-encode pixels to remove executable trailers and metadata.
                    if source.format == "JPEG":
                        source.convert("RGB").save(output, format="JPEG", quality=90)
                        extension = "jpg"
                    else:
                        source.convert("RGBA").save(output, format="PNG", optimize=True)
                        extension = "png"
        except (UnidentifiedImageError, OSError, SyntaxError, Image.DecompressionBombError, Image.DecompressionBombWarning, ValueError):
            problem("文件不是有效图片 / Invalid image")
        filename = secrets.token_hex(20) + "." + extension
        stored = data_dir / "uploads" / filename
        content = output.getvalue()
        stored.write_bytes(content)
        os.chmod(stored, 0o600)
        try:
            cursor = db().execute("INSERT INTO images(filename,stored_name,width,height,size,created_at) VALUES (?,?,?,?,?,?)", (Path(upload.filename).name[:200], filename, width, height, len(content), now()))
            db().commit()
        except Exception:
            stored.unlink(missing_ok=True)
            raise
        return jsonify(image_json(db().execute("SELECT * FROM images WHERE id=?", (cursor.lastrowid,)).fetchone())), 201

    @app.delete("/api/admin/images/<int(max=9223372036854775807):ident>")
    def delete_image(ident):
        row = db().execute("SELECT * FROM images WHERE id=?", (ident,)).fetchone()
        if not row:
            problem("图片不存在 / Image not found", 404)
        url = "/uploads/" + row["stored_name"]
        used = db().execute("SELECT 1 FROM articles WHERE instr(cover_url,?)>0 OR instr(content_zh,?)>0 OR instr(content_en,?)>0 LIMIT 1", (url, url, url)).fetchone()
        if used:
            problem("图片正被文章引用，请先移除引用 / Image is in use by an article", 409)
        db().execute("DELETE FROM images WHERE id=?", (ident,))
        db().commit()
        (data_dir / "uploads" / row["stored_name"]).unlink(missing_ok=True)
        return jsonify(ok=True)

    @app.get("/uploads/<filename>")
    def serve_upload(filename):
        if not re.fullmatch(r"[a-f0-9]{40}\.(?:jpg|png)", filename):
            abort(404)
        if not db().execute("SELECT 1 FROM images WHERE stored_name=?", (filename,)).fetchone():
            abort(404)
        response = send_from_directory(data_dir / "uploads", filename, max_age=86400)
        response.headers["Content-Security-Policy"] = "default-src 'none'; sandbox"
        return response

    @app.get("/api/admin/users")
    def users():
        require_user(admin=True)
        return jsonify(items=[dict(row) for row in db().execute("SELECT id,username,role,active,created_at FROM users ORDER BY id")])

    @app.post("/api/admin/users")
    def create_user():
        require_user(admin=True)
        body = payload()
        username = text_field(body, "username", 64)
        role = body.get("role", "editor")
        if not USERNAME.fullmatch(username) or role not in ("admin", "editor"):
            problem("账号格式或角色无效 / Invalid username or role")
        hashed = password_hash(body.get("password"))
        db().execute("BEGIN IMMEDIATE")
        require_user(admin=True)
        cursor = db().execute("INSERT INTO users(username,password_hash,role,created_at) VALUES (?,?,?,?)", (username, hashed, role, now()))
        db().commit()
        return jsonify(dict(db().execute("SELECT id,username,role,active,created_at FROM users WHERE id=?", (cursor.lastrowid,)).fetchone())), 201

    @app.route("/api/admin/users/<int(max=9223372036854775807):ident>", methods=["PATCH", "DELETE"])
    def manage_user(ident):
        caller = require_user(admin=True)
        # Serialize last-administrator checks with the update/delete operation.
        db().execute("BEGIN IMMEDIATE")
        caller = require_user(admin=True)
        row = db().execute("SELECT * FROM users WHERE id=?", (ident,)).fetchone()
        if not row:
            problem("账号不存在 / Account not found", 404)
        body = payload() if request.method == "PATCH" else {}
        role = body.get("role", row["role"])
        active = body.get("active", row["active"])
        if role not in ("admin", "editor") or active not in (True, False, 0, 1):
            problem("角色或状态无效 / Invalid role or status")
        unsafe = request.method == "DELETE" or role != "admin" or not active
        if caller["id"] == ident and unsafe:
            problem("不能删除、停用或降级当前账号 / Cannot remove, disable or demote your account", 409)
        if row["role"] == "admin" and row["active"] and unsafe:
            count = db().execute("SELECT COUNT(*) FROM users WHERE role='admin' AND active=1").fetchone()[0]
            if count <= 1:
                problem("必须保留至少一个管理员 / At least one administrator is required", 409)
        if request.method == "DELETE":
            db().execute("DELETE FROM users WHERE id=?", (ident,))
            db().commit()
            return jsonify(ok=True)
        hashed = password_hash(body["password"]) if body.get("password") else None
        db().execute("UPDATE users SET role=?,active=? WHERE id=?", (role, int(active), ident))
        if hashed:
            db().execute("UPDATE users SET password_hash=? WHERE id=?", (hashed, ident))
        if hashed or role != row["role"] or not active:
            db().execute("DELETE FROM sessions WHERE user_id=?", (ident,))
        db().commit()
        return jsonify(dict(db().execute("SELECT id,username,role,active,created_at FROM users WHERE id=?", (ident,)).fetchone()))

    @app.get("/")
    def home():
        return send_from_directory(app.config["PUBLIC_DIR"], "index.html")

    @app.get("/articles")
    @app.get("/articles/")
    def articles_page():
        return send_from_directory(app.config["PUBLIC_DIR"], "articles.html")

    @app.get("/articles/<slug>")
    def article_page(slug):
        published_row(slug)
        return send_from_directory(app.config["PUBLIC_DIR"], "article.html")

    @app.get("/admin")
    @app.get("/admin/")
    @app.get("/admin/<path:subpath>")
    def admin_page(subpath=""):
        response = send_from_directory(app.config["PUBLIC_DIR"], "admin.html")
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
        return response

    @app.get("/assets/<path:filename>")
    def assets(filename):
        if any(part.startswith(".") for part in Path(filename).parts):
            abort(404)
        return send_from_directory(Path(app.config["PUBLIC_DIR"]) / "assets", filename, max_age=86400)

    @app.get("/<filename>")
    def static_file(filename):
        public_files = {"index.html", "about.html", "projects.html", "interests.html", "contact.html", "codex-theme.html", "freeze-nest.html", "articles.html", "article.html", "styles.css", "app.js", "blog.css", "blog.js", "articles.js", "cms.css", "admin.css", "admin.js", "error.js", "robots.txt", "sitemap.xml"}
        if filename not in public_files:
            abort(404)
        return send_from_directory(app.config["PUBLIC_DIR"], filename)

    app.config["DUMMY_PASSWORD_HASH"] = generate_password_hash("unusable:" + secrets.token_urlsafe(32), method="scrypt")
    return app


def initialize_admin(data_dir, username, output):
    if not USERNAME.fullmatch(username):
        raise ValueError("Invalid administrator username")
    app = create_app({"DATA_DIR": data_dir})
    password = secrets.token_urlsafe(24)
    with sqlite3.connect(app.config["DATABASE"]) as connection:
        if connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]:
            raise ValueError("Accounts already exist; use the admin interface to manage them")
        fd = os.open(output, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        try:
            connection.execute("INSERT INTO users(username,password_hash,role,created_at) VALUES (?,?,?,?)", (username, generate_password_hash(password, method="scrypt"), "admin", now()))
            connection.commit()
            with os.fdopen(fd, "w") as f:
                f.write(f"URL: https://xiaoqiuyi.me/admin\nUsername: {username}\nPassword: {password}\nChange this password after first login.\n")
        except Exception:
            os.close(fd)
            raise
    print(f"Administrator created; credentials saved privately to {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)
    initialize = commands.add_parser("init-admin")
    initialize.add_argument("--username", default="admin")
    initialize.add_argument("--data-dir", default=os.environ.get("NEST_DATA_DIR", str(ROOT / "data")))
    initialize.add_argument("--output", required=True)
    args = parser.parse_args()
    if args.command == "init-admin":
        initialize_admin(args.data_dir, args.username, args.output)
