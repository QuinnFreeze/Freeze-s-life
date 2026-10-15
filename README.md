# Freeze-s-life

**Freeze’s Nest · 秋易的小窝**，李秋易 / Quinn Freeze 的个人数字空间。

以手机访问为主，沿用 Firefly 风格的圆角导航、玻璃卡片、浅色联系按钮与胶囊标签。展示已确认的名字、题词、生日、自动计算的年龄、兴趣、公开项目和原有联系入口。支持中文与英文切换，不增加运行时依赖。

保留现有手绘壁纸与透明玻璃视觉。壁纸使用 `object-fit: cover` 铺满视口，卡片、导航和内容区域随屏幕宽度调整，手机以单栏阅读为主。首页提供简短入口，关于、项目、兴趣和联系使用独立页面，公开项目另有详情页。

## 设计参考与许可

参考 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)，源码快照为 `91cbbefe53716e70b77ca9c41e27af10f5b27cab`。当前版本在原生 HTML/CSS/JavaScript 中适配其前景组件设计，不导入博客示例、头像或完整框架。

Firefly 的 MIT 版权与许可声明保留在 [`dist/assets/firefly-license.txt`](dist/assets/firefly-license.txt)。该第三方声明用于相应的参考/改编代码，不将现有壁纸归为 Firefly 素材。

## 网站文件

- `site/layout.html`：各页共用的 HTML 框架、页头与导航
- `site/pages.json`：页面文件名、导航归属、标题与 SEO 描述
- `site/pages/*.html`：七个页面的正文源片段
- `scripts/build.mjs`：使用 Node.js 内置模块生成完整静态页面
- `dist/index.html`：首页
- `dist/about.html`、`dist/projects.html`、`dist/interests.html`、`dist/contact.html`：关于、项目、兴趣与联系
- `dist/codex-theme.html`、`dist/freeze-nest.html`：两个已核实公开项目的详情
- `dist/styles.css`：响应式样式
- `dist/app.js`：语言切换与自动年龄
- `dist/assets/`：背景图片与图标
- `dist/sitemap.xml`、`dist/robots.txt`：由构建生成，只列出真实公开页面
- `.github/workflows/pages.yml`：GitHub Pages 自动部署

网站仍可直接使用 `dist/`，无需安装依赖。共享布局只在构建时展开，线上是七个可直接访问的 HTML 页面，不需要 Node.js 运行服务。资源与站内链接采用相对路径，兼容 GitHub Pages 的仓库子路径。即使不启用 JavaScript，中文基本资料、项目与联系链接仍可使用；年龄显示为 `—` 并提示启用 JavaScript，避免展示过时的固定年龄。首页原有的 `#profile`、`#projects`、`#interests` 和 `#contact` 锚点继续保留。

语言按钮切换中文与英文，浏览器可用时保存偏好；`?lang=zh` 或 `?lang=en` 可指定分享链接的语言。存储被禁用时仍可切换。年龄按 `Asia/Shanghai` 日期和生日 `2009-01-21` 计算。

WhatsApp 保留原有账号 `@xiaoqiuyi`，使用官方用户名分享格式 `https://wa.me/xiaoqiuyi`，与其他社交入口一样直接跳转。

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

网站当前地址为 [xiaoqiuyi.me](https://xiaoqiuyi.me/)，由 GitHub Pages 发布。现有域名绑定与部署工作流保持不变。

修改页面源片段或共享布局后，先执行 `npm run build` 与 `npm test`，再把生成的 `dist/` 页面与源文件一同提交。GitHub Actions 仍直接上传 `dist/`，不在发布时另行运行模板构建。

## 本地预览

在仓库目录执行：

```bash
python3 -I -m http.server 8000 --directory dist
```

然后访问 `http://localhost:8000`。

## 本地验证

使用 Node.js 22 或更新版本执行，无需 `npm install`：

```bash
npm run build
npm test
```

测试覆盖生日与时区边界、双语交互、存储不可用时的回退，以及七个页面的导航、标题、canonical、内部深链接、项目来源、原有联系方式和 WhatsApp 用户名链接。构建校验页面元数据与脚本语法，生成 `dist/` 下的七个 HTML、站点地图和 robots 文件，再检查所有页面引用的本地资源与跨页锚点。

构建保留 `dist/` 中的样式、脚本、图片和其他现有文件，只清理被 Git 忽略的 `.build/` 后复制部署文件用于本地检查。执行构建不会推送、调用部署或修改 GitHub Actions。

## 修改与备份

页面正文编辑 `site/pages/`，共用页头、页脚编辑 `site/layout.html`，标题与描述编辑 `site/pages.json`；然后执行构建更新 `dist/`。样式、交互和图片仍在 `dist/` 下维护。不要仅修改生成的 HTML，下一次构建会覆盖它。可从仓库的 **Code → Download ZIP** 下载完整源码包。
