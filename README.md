# Freeze-s-life

Wynn Freeze 的个人空间，从 Sites 导出的手机版静态网站。

保留原来的手绘背景、浅色磨砂界面，以及首页、关于、创作和项目详情交互。

## 网站文件

- `dist/index.html`：页面与文案
- `dist/styles.css`：响应式样式
- `dist/app.js`：页面切换与弹窗
- `dist/assets/`：原始背景图片与图标
- `.github/workflows/pages.yml`：GitHub Pages 自动部署

无需安装依赖或运行构建命令。资源采用相对路径，兼容 GitHub Pages 的仓库子路径。

## 部署

在仓库的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
然后在 **Actions → Deploy website to GitHub Pages → Run workflow** 运行部署。
此后向 `main` 推送网站文件或部署配置的更新，会自动重新部署。

GitHub Free 支持公开仓库的 Pages。私有个人仓库需要支持该功能的 GitHub Pro 方案；如果设置页要求升级，可以由仓库所有者决定升级或公开仓库。

默认部署地址预计为：https://quinnfreeze.github.io/Freeze-s-life/ 。实际地址以 Pages 设置页或部署结果为准。

## 本地预览

在仓库目录执行：

```sh
python3 -m http.server 8000 --directory dist
```

然后访问 `http://localhost:8000`。

## 修改与备份

直接编辑 `dist/` 下的文件即可。可从仓库的 **Code → Download ZIP** 下载完整源码包。
仓库中未包含 Sites 的项目配置、访问凭据或构建缓存。
