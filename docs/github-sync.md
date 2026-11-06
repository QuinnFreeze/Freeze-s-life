# 生产源码自动上传

## 已配置的行为

- 仓库：<https://github.com/QuinnFreeze/Freeze-s-life>，分支 `main`。
- 同步工作区：`/opt/freeze-nest/source-repository`。
- 来源：运行中 `freeze-nest-nest-1` 容器镜像标签所对应的 `/opt/freeze-nest/releases/<release>/`。
- 检查间隔：每分钟一次，开机后自动恢复。
- 上传范围：后端、公开资源、依赖、Dockerfile、构建 wheel、部署脚本、测试与相关操作说明。
- 生产 README 保存为 `docs/production.md`；根 README 说明仓库和同步方式。

仅提交实际改变的源码；无变更不产生提交。网络临时失败时保留本地提交，下次运行重试。远端出现分歧时停止并记录错误，不强制推送。工具使用文件锁，避免定时任务和手动同步同时运行。

同步方向是本机生产源码 → GitHub。推送不会修改线上容器，也不会把 GitHub 的新代码自动部署到生产。新上线版本必须保留对应的 release 源码目录；工具不会从 Docker 镜像反向恢复丢失的源码。

## 后续修改

在开发目录修改代码并验证，部署 `freeze-nest:<release>`，同时保存对应的 `/opt/freeze-nest/releases/<release>/` 源码。定时器会在下一次检查时识别新版本并上传。

直接修改当前 release 目录里的受管源码也会被检测到；这类文件修改本身不会更新已经构建的运行中镜像，因此应通过正常构建和部署流程让网站生效。其他未部署的工作目录不在自动同步范围。

## 查看和手动运行

```bash
systemctl status freeze-nest-github-sync.timer
systemctl status freeze-nest-github-sync.service
journalctl -u freeze-nest-github-sync.service -n 50 --no-pager
systemctl start freeze-nest-github-sync.service
```

先预览变更：

```bash
python3 /opt/freeze-nest/source-repository/tools/sync-production.py --dry-run
```

暂停或恢复自动上传：

```bash
systemctl disable --now freeze-nest-github-sync.timer
systemctl enable --now freeze-nest-github-sync.timer
```

任务使用本机 root 用户已有的 `gh` GitHub 登录和专用仓库内的提交身份，不在仓库或服务文件中保存 token。若登录失效，重新运行 `gh auth login` 后再启动同步服务。

服务执行经审核安装的固定副本 `/usr/local/libexec/freeze-nest-github-sync.py`。GitHub 上修改同步工具不会直接改变 root 定时任务的执行代码；更新工具后，审核并测试，再重新安装：

```bash
install -m 755 /opt/freeze-nest/source-repository/tools/sync-production.py /usr/local/libexec/freeze-nest-github-sync.py
```

## 不上传的数据

`data/`、`secrets/`、`backups/`、`uploads/`、`.env*`、`release.env`、`deployment.json`、SQLite 文件、密码文件、私钥和备份归档不上传。同步只读取明确允许的源码路径，拒绝符号链接并检查明显的私钥及 token。

文章正文、草稿、网站设置和账号属于数据库，后台上传图片也属于私人持久化数据，继续由 `freeze-nest-backup.timer` 本地备份；不要把备份归档放到公开 GitHub。
