# Freeze-s-life

**Freeze’s Nest · 秋易的小窝**，李秋易 / Quinn Freeze 的个人数字空间。

以手机访问为主，沿用 Firefly 风格的圆角导航、玻璃卡片、浅色联系按钮与胶囊标签。展示已确认的名字、题词、生日、自动计算的年龄、兴趣、公开项目和原有联系入口。支持中文与英文切换，不增加运行时依赖。

保留现有手绘壁纸文件，不替换、压缩或编辑图片。壁纸使用 `object-fit: cover` 铺满视口；桌面内容展开到页面两侧，平板使用两栏，手机保持单栏。宽桌面将介绍、公开作品、兴趣与联系入口分配到三栏，兴趣使用带说明的文字列表与细分隔线。

## 设计参考与许可

参考 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)，源码快照为 `91cbbefe53716e70b77ca9c41e27af10f5b27cab`。当前版本在原生 HTML/CSS/JavaScript 中适配其前景组件设计，不导入博客示例、头像或完整框架。

Firefly 的 MIT 版权与许可声明保留在 [`dist/assets/firefly-license.txt`](dist/assets/firefly-license.txt)。该第三方声明用于相应的参考/改编代码，不将现有壁纸归为 Firefly 素材。

## 网站文件

- `dist/index.html`：关于我、个人项目、兴趣与联系入口
- `dist/styles.css`：响应式样式
- `dist/app.js`：语言切换、自动年龄、WhatsApp 账号复制与反馈
- `dist/assets/`：背景图片与图标
- `.github/workflows/pages.yml`：GitHub Pages 自动部署

网站仍可直接使用 `dist/`，无需安装依赖。资源采用相对路径，兼容 GitHub Pages 的仓库子路径。即使不启用 JavaScript，中文基本资料、项目与联系链接仍可使用；年龄显示为空并提示启用 JavaScript，避免展示过时的固定年龄。

语言按钮切换中文与英文，浏览器可用时保存偏好；`?lang=zh` 或 `?lang=en` 可指定分享链接的语言。存储被禁用时仍可切换。年龄按 `Asia/Shanghai` 日期和生日 `2009-01-21` 计算。

WhatsApp 只展示提供的账号，浏览器支持时可复制；不生成未经确认的聊天链接。

## 公开项目与隐私

项目资料于 2026-10-15 根据 [QuinnFreeze 的公开仓库](https://github.com/QuinnFreeze?tab=repositories)核实。当前展示以下两个有实际源码的非 Fork 项目：

- [codex-theme](https://github.com/QuinnFreeze/codex-theme)：macOS Codex 主题，技术标签以仓库中的 Python、JavaScript 和 CSS 源码为依据。
- [Freeze-s-life](https://github.com/QuinnFreeze/Freeze-s-life)：本网站，使用 HTML、CSS 和 JavaScript。

个人资料 README 仓库 `QuinnFreeze` 不作为独立项目展示。不显示私有、空白或无关 Fork 仓库，也不声明未核实的项目进度。项目简介是已核实的静态内容，访客加载页面时无需请求 GitHub API；新增作品时需先核实公开源码再更新。

页面仅包含主动提供的基本资料与联系方式，不收集或添加学校、具体位置、家庭、资产和私人情感信息。无分析追踪脚本和第三方字体。

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

## 本地验证

使用 Node.js 22 或更新版本执行，无需 `npm install`：

```bash
npm test
npm run build
```

测试覆盖生日与时区边界、双语交互、存储与剪贴板失败回退，以及保留的联系方式与内部锚点。构建仅校验脚本和资源并复制到被 Git 忽略的 `.build/`；不会推送、调用部署或修改 GitHub Actions。部署仍使用原有 `dist/` 路径。

## 修改与备份

直接编辑 `dist/` 下的文件即可。可从仓库的 **Code → Download ZIP** 下载完整源码包。
