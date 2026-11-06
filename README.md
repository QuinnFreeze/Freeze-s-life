# Freeze’s Nest · 秋易的小窝

[线上网站](https://xiaoqiuyi.me/) · [文章](https://xiaoqiuyi.me/articles) · [管理后台](https://xiaoqiuyi.me/admin)

个人网站，提供中英文介绍、项目、兴趣、联系方式和文章内容管理。当前生产版本使用原生 HTML/CSS/JavaScript、Python 3.12、Flask、Gunicorn 与 SQLite，由本机 Docker 和 Caddy 提供服务。

本仓库现已包含实际生产应用源码。代码上传到 GitHub 不会自动部署或重启线上服务。

## 文件结构

- `server.py`：后端、文章 API、账号权限与图片处理。
- `public/`：当前线上页面、样式、脚本及网站自带图片。
- `requirements.txt`、`requirements-dev.txt`：锁定的运行与开发依赖。
- `Dockerfile`、`.vendor/`：生产镜像构建及经过校验的 pip wheel。
- `deploy/`：应用部署、备份与 GitHub 源码同步的服务模板。
- `tests/`：应用回归测试和同步工具测试。
- `docs/production.md`：随生产版本同步的操作说明。
- `docs/github-sync.md`：自动上传的范围、运行方式与故障检查。
- `tools/sync-production.py`：本机生产源码自动提交和推送工具。

`site/`、`dist/`、`scripts/build.mjs`、`package.json` 和 Node.js 测试保留自早期静态站。当前生产网站使用 `public/` 和 `server.py`；旧 GitHub Pages 工作流仅支持手动发布早期静态版本，无法运行文章后台。

## 本地开发

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python server.py init-admin --data-dir .qa-data --username local-admin --output .qa-data/credentials.txt
NEST_DATA_DIR=.qa-data NEST_COOKIE_SECURE=0 NEST_ORIGIN=http://127.0.0.1:8765 .venv/bin/gunicorn --bind 127.0.0.1:8765 --workers 1 --threads 2 'server:create_app()'
```

管理员初始密码写入本地 `.qa-data/credentials.txt`。请仅用独立的本地数据目录开发测试。

```bash
.venv/bin/python -m pytest -q tests
```

部署方式及现有生产环境约束见 [生产说明](docs/production.md)。

## 自动上传

生产主机上的 `freeze-nest-github-sync.timer` 每分钟检查当前运行版本的源码。有变更时自动提交并推送到本仓库 `main`；无变更不创建提交。新部署使用 `freeze-nest:<release>` 镜像，并将对应源码放入 `/opt/freeze-nest/releases/<release>/`，同步工具会自动识别。

同步的是生产 release 目录内的代码，不会扫描整台机器或上传聊天工作目录。未部署的其他目录改动不会被自动上传。站点后台中的文章、账号和设置属于数据库内容，不在 GitHub 源码同步范围内。

数据库、会话密钥、初始密码、环境文件、用户上传图片与备份归档均不进入本公开仓库，继续由现有的本地备份任务管理。详见 [自动同步说明](docs/github-sync.md)。

## 许可

前景组件参考 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)，相关 MIT 许可见 `public/assets/firefly-license.txt`。网站自带壁纸不属于 Firefly 素材。
