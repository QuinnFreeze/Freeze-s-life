# Freeze-s-life

李秋易 / Quinn Freeze 的极简个人网站。

以手机访问为主，参考 Firefly 的圆角导航、个人卡片、浅色联系按钮与胶囊标签。只展示已确认的名字、题词、兴趣和联系入口，不另外列出项目或详细个人经历。

保留现有手绘壁纸文件及其显示方式，不替换、压缩、重新裁剪图片，也不修改壁纸的定位与遮罩。

## 设计参考与许可

参考 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)，源码快照为 `91cbbefe53716e70b77ca9c41e27af10f5b27cab`。当前版本在原生 HTML/CSS/JavaScript 中适配其前景组件设计，不导入博客示例、头像或完整框架。

Firefly 的 MIT 版权与许可声明保留在 [`dist/assets/firefly-license.txt`](dist/assets/firefly-license.txt)。该第三方声明用于相应的参考/改编代码，不将现有壁纸归为 Firefly 素材。

## 网站文件

- `dist/index.html`：个人介绍与联系入口
- `dist/styles.css`：响应式样式
- `dist/app.js`：WhatsApp 账号复制与反馈
- `dist/assets/`：背景图片与图标
- `.github/workflows/pages.yml`：GitHub Pages 自动部署

无需安装依赖或运行构建命令。资源采用相对路径，兼容 GitHub Pages 的仓库子路径。即使不启用 JavaScript，基本内容与联系链接仍可使用。

WhatsApp 只展示提供的账号，浏览器支持时可复制；不生成未经确认的聊天链接。

## 部署

在仓库的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
然后在 **Actions → Deploy website to GitHub Pages → Run workflow** 运行部署。
此后向 `main` 推送网站文件或部署配置的更新，会自动重新部署。

默认部署地址预计为：https://quinnfreeze.github.io/Freeze-s-life/ 。实际地址以 Pages 设置页或部署结果为准。
自定义域名计划使用 `xiaoqiuyi.me`，需另行完成 Pages 域名绑定、Cloudflare DNS 和 HTTPS 验证。

## 本地预览

在仓库目录执行：

```bash
python3 -I -m http.server 8000 --directory dist
```

然后访问 `http://localhost:8000`。

## 修改与备份

直接编辑 `dist/` 下的文件即可。可从仓库的 **Code → Download ZIP** 下载完整源码包。
