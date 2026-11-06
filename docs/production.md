# 秋易的小窝：文章与内容管理

在生产站点原生 HTML、CSS、JavaScript 的基础上增加 Flask、Gunicorn 和 SQLite。保留原来的七个页面、中英文切换、背景、Liquid Glass 样式及动画，并在原导航中增加“文章”。手机端背景固定铺满屏幕，去除上下渐变收边，兼顾浏览器地址栏高度变化。

- 文章入口：<https://xiaoqiuyi.me/articles>
- 后台入口：<https://xiaoqiuyi.me/admin>
- Komari：<https://check.xiaoqiuyi.me>

后台支持中英文文章、Markdown 实时预览、图片插入、草稿、发布／定时公开、分类、标签、封面、搜索、分页、账号和网站设置。编辑账号管理内容；管理员另可管理账号和设置。不开放注册。

## 生产部署

独立 Compose 项目 `freeze-nest`，生产目录 `/opt/freeze-nest`。应用不开放主机端口，仅加入已有 Caddy 的 Docker 网络，Caddy 只为 `xiaoqiuyi.me` 代理至 `freeze-nest:8000`。Komari 的 Compose、数据、容器和端口均沿用原配置。上线时使用 Caddy 的 `validate` 和 `reload`，不重启 Caddy 或 Komari。

服务使用单个 Gunicorn worker 和两个线程，限制 256MB 内存、0.5 CPU；图片转换串行执行。容器以非 root 用户运行，根文件系统只读，数据库与上传文件使用独立持久化目录。

| 内容 | 位置 |
| --- | --- |
| 生产源码快照 | `/opt/freeze-nest/releases/<release>/` |
| 数据库 | `/opt/freeze-nest/data/nest.sqlite3` |
| 图片 | `/opt/freeze-nest/data/uploads/` |
| 首次管理员凭据 | `/opt/freeze-nest/secrets/initial-admin.txt`，仅 root 可读 |
| 部署记录 | `/opt/freeze-nest/deployment.json` |
| 原站与代理配置备份 | `/opt/freeze-nest/backups/pre-deploy-*/` |
| 内容备份 | `/opt/freeze-nest/backups/nest-*.tar.gz` |

首次账号为 `admin`，随机密码保存在上述私密文件中。首次登录后可在“修改密码”中更换，并在“后台账号”创建其他管理员或编辑。初始化工具仅在没有任何账号时允许创建第一个管理员。

运行状态：

```bash
docker compose --env-file /opt/freeze-nest/release.env -f /opt/freeze-nest/compose.yaml ps
docker compose --env-file /opt/freeze-nest/release.env -f /opt/freeze-nest/compose.yaml logs --tail 80 nest
curl -fsS https://xiaoqiuyi.me/healthz
systemctl status freeze-nest-backup.timer
```

## 文章操作

新建文章后分别填写中文和英文页签。可以只发布一种语言；已填写的每种语言都需具备标题和正文。草稿可暂存不完整内容。发布时间留空表示首次发布时使用当前时间，未来时间表示届时自动对外可见。

图片在正文工具栏插入，也可上传为封面；图片库支持复制链接。上传接受 JPEG、PNG、WebP、GIF，原文件至多 10MB、1200 万像素，服务器重新编码并移除元数据，GIF 保存首帧。被文章引用的图片不能直接删除。标签以逗号分隔。

阅读量按同一浏览器、同一文章 24 小时去重；同一文章切换语言不会重复计数。文章列表与详情只返回已到发布时间的公开内容。站点设置用于文章区域的标题、描述与分页；原七个页面的现有内容继续保留。

## 备份与回退

`freeze-nest-backup.timer` 每天 UTC 04:35 后五分钟内运行一次。脚本通过 SQLite 在线备份接口生成数据库快照，校验 `integrity_check`，以硬链接固定对应图片，再释放写锁并压缩。归档包含数据库、对应图片和部署记录，附 SHA256 文件，`latest.json` 记录最新结果。

手动备份：

```bash
sudo python3 /opt/freeze-nest/backup.py
```

回退到原静态站：将部署记录所指备份目录的 `Caddyfile` 恢复至 `/opt/komari-monitor/conf/Caddyfile`，随后执行：

```bash
docker exec komari-monitor-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker exec komari-monitor-caddy-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

原站 `current` 软链接和 release 目录未改动，因此该操作可直接恢复原站；文章数据库仍保留。恢复内容备份时先停止 `freeze-nest` 项目的 `nest` 服务，将归档中的 `data/` 恢复至 `/opt/freeze-nest/data`、设置所有者为 `10001:10001`，再启动该服务。不要停止 Komari 项目。

## 本地开发与验证

Python 3.12，运行依赖均在 `requirements.txt` 锁定版本。开发使用独立虚拟环境与独立数据目录：

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python server.py init-admin --data-dir .qa-data --username qa-admin --output .qa-data/credentials.txt
NEST_DATA_DIR=.qa-data NEST_COOKIE_SECURE=0 NEST_ORIGIN=http://127.0.0.1:8765 .venv/bin/gunicorn --bind 127.0.0.1:8765 --workers 1 --threads 2 'server:create_app()'
.venv/bin/python -m pytest -q tests
```

`tests/browser_qa.py` 验证登录、分类、双语编辑、图片／封面、草稿隔离、发布、搜索、分页、阅读量、账号权限、修改密码、退出和原页面响应式回归，使用 `.qa-data`，不会连接生产数据库。当前环境没有 Browser 插件，因此用项目内 Chromium 和 Playwright；结果与截图位于 `artifacts/`。

生产构建与首次上线：

```bash
docker build -t freeze-nest:<release> .
sudo python3 deploy/deploy.py --release <release>
```

`deploy.py` 在上线前保存原站／代理备份和容器基线；健康检查通过后才改个人域名代理，并验证 Komari、原页面和应用。切换失败会恢复原 Caddy 配置。脚本针对本次从静态站到动态站的首次迁移，后续更新可构建新镜像、修改 `release.env` 后只更新 `nest` 服务。

## 安全实现

密码使用 scrypt；服务端只保存会话令牌摘要，Cookie 采用 `Secure`、`HttpOnly`、`SameSite=Strict` 和 `__Host-` 前缀。写操作验证 CSRF 与请求来源，登录失败次数持久化限流。修改密码、停用账号与修改权限会使相关会话失效，敏感账号操作在取得写锁后重新检查会话，避免旧请求覆盖管理员的密码重置或权限撤销。API 不缓存敏感响应。

匿名会话创建按来源 IP 的 HMAC 摘要限制为每分钟 30 次；新增阅读记录限制为每分钟 60 次，已有有效会话及正常的重复阅读不消耗这些新记录额度。计数持久化、自动过期且限制总量，超限返回 429 和 `Retry-After`。HTTPS 响应包含 HSTS，应用校验受信任的 Host；上传图片使用独立的 CSP 沙箱策略。

Markdown 禁用原始 HTML 并经允许列表净化；图片解码验证后重新编码，手机照片先按 EXIF 方向旋转，再移除元数据；SQL 使用参数绑定。SQLite 启用外键和 WAL，文章编辑使用更新时间进行并发冲突检查。后台退出或认证失效时清除私密编辑内容，即使后续网络刷新失败也不继续显示后台。

部署参考：[Caddy graceful reload](https://caddyserver.com/docs/command-line#caddy-reload)、[Flask security](https://flask.palletsprojects.com/en/stable/web-security/)。
