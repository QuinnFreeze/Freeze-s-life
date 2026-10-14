'use strict';

(() => {
  const translations = {
    zh: {
      contactDetailsTitle: '联系入口',
      homeHeading: 'Freeze’s Nest',
      aboutInterestsLink: '兴趣与关注',
      backHome: '回到首页',
      returnProjects: '返回项目目录',
      aboutBirthdayName: '姓名与生日',
      projectsPageMetaTitle: '个人项目 · Freeze’s Nest',
      projectsPageMetaDescription: 'Freeze’s Nest 的公开作品目录：Codex Liquid Glass 桌面主题与个人网站源码。',
      projectsPageTitle: '个人项目',
      projectsPageIntro: '从桌面主题到这个小窝，记录一些与界面和技术有关的尝试。',
      projectsCollectionTitle: '公开作品',
      projectsCollectionIntro: '这里收录两个有实际源码的公开项目，可以继续了解功能与技术构成。',
      themeRepoName: 'codex-theme',
      nestRepoName: 'Freeze-s-life',
      projectDetailsLink: '了解这个项目',
      themeCatalogDetail: '把黑白壁纸与玻璃质感带入 macOS Codex，提供本地壁纸设置与主题加载工具。',
      nestCatalogDetail: '承载基本资料、兴趣与公开作品的个人数字空间，兼顾中英文阅读和手机访问。',
      projectBack: '返回项目目录',
      projectFeaturesTitle: '主要功能',
      projectTechnologyTitle: '技术构成',
      projectSourceTitle: '公开源码',
      readProjectGuide: '阅读项目说明',
      readPluginGuide: '查看插件说明',
      browseProjectSource: '浏览源码目录',
      themePageMetaTitle: 'Codex Liquid Glass · Freeze’s Nest',
      themePageMetaDescription: '了解 codex-theme 的玻璃样式、本地壁纸设置、主题加载方式与公开源码。',
      themePageTitle: 'Codex Liquid Glass',
      themePageIntro: '一个面向 macOS Codex 桌面端的主题项目：黑白壁纸、玻璃界面与本地设置。',
      themeWallpaperTitle: '壁纸与画面',
      themeWallpaperText: '支持本地图片，以及位置、填充方式、亮度与模糊等设置。',
      themeGlassTitle: '玻璃界面',
      themeGlassText: '为输入区域、菜单与浮动面板添加玻璃质感，并跟随应用的浅色或深色外观。',
      themeSettingsTitle: '可视化设置',
      themeSettingsText: '通过本地设置页选择和预览壁纸，调整浅色界面透明度，也可以恢复默认壁纸。',
      themeLoaderTitle: '独立加载',
      themeLoaderText: '主题通过独立启动器和本地调试接口加载，保留官方应用及其签名文件。',
      themePythonTitle: 'Python',
      themePythonText: '负责安装、主题管理和本地插件工具。',
      themeJavaScriptTitle: 'JavaScript / Node.js',
      themeJavaScriptText: '负责主题运行器与本地调试连接。',
      themeCssTitle: 'CSS 与 HTML',
      themeCssText: 'CSS 定义玻璃样式；HTML 承载壁纸设置界面。',
      themeNativeTitle: 'Objective-C 与 Shell',
      themeNativeText: '用于 macOS 启动器、观察器与安装启动入口。',
      themeSourceText: '仓库公开了主题、插件、设置页面与安装说明。安装要求与兼容性说明可在项目文档中查看。',
      nestPageMetaTitle: 'Freeze’s Nest 网站 · 个人项目',
      nestPageMetaDescription: '了解 Freeze’s Nest 个人网站的双语内容、响应式布局、自动年龄与原生 HTML、CSS、JavaScript 源码。',
      nestPageTitle: '这个小窝',
      nestPageIntro: 'Freeze’s Nest 是我在网上的一处个人空间，源码公开在 Freeze-s-life 仓库。',
      nestProfileTitle: '基本资料与兴趣',
      nestProfileText: '保留姓名与题词，展示简短介绍、兴趣，以及按生日自动计算的年龄。',
      nestLanguageTitle: '中英文阅读',
      nestLanguageText: '可以切换中文与英文，保存语言偏好，也可用链接指定页面语言。',
      nestResponsiveTitle: '适应不同屏幕',
      nestResponsiveText: '同一套内容适应手机、平板和桌面，保留壁纸与轻量玻璃样式。',
      nestContactTitle: '直接联系',
      nestContactText: '保留邮箱与社交入口；浏览器支持时可以复制 WhatsApp 账号。',
      nestHtmlTitle: 'HTML',
      nestHtmlText: '承载页面结构与实际内容，基本资料和链接无需 JavaScript 也可阅读。',
      nestCssTitle: 'CSS',
      nestCssText: '处理响应式排版、透明玻璃样式，以及减少动态效果和透明度的系统偏好。',
      nestJavaScriptTitle: 'JavaScript',
      nestJavaScriptText: '处理语言切换、自动年龄和账号复制，不依赖前端框架。',
      nestSourceText: '网站内容与样式以原生 HTML、CSS 和 JavaScript 构建。公开仓库还包含本地验证脚本与 GitHub Pages 配置。',
      techPython: 'Python',
      techJavaScript: 'JavaScript',
      techCss: 'CSS',
      techHtml: 'HTML',
      techNode: 'Node.js',
      techObjectiveC: 'Objective-C',
      homeNameTitle: '李秋易 / Quinn Freeze',
      homeLead: '这里是我的个人数字空间。认识我、看看作品，或从兴趣开始逛逛。',
      homeExplore: '从这里开始',
      homeAboutLink: '认识我',
      homeProjectLink: '浏览公开作品',
      homeInterestLink: '看看我关注什么',
      homeContactLink: '找到我',
      homeAboutSummary: '名字、基本资料与兴趣方向。',
      homeProjectSummary: '两个已经公开的项目，和它们各自的想法与功能。',
      homeInterestSummary: '历史、政治、技术、哲学、经济，以及阅读与策略游戏。',
      homeContactSummary: '邮箱、GitHub 与原有社交账号。',
      homeMetaDescription: 'Freeze’s Nest · 秋易的小窝，李秋易（Quinn Freeze）的个人主页。认识我、浏览公开作品，或从兴趣开始探索。',
      aboutPageTitle: '关于我 · Freeze’s Nest',
      aboutPageHeading: '关于我',
      aboutPageLead: '李秋易，也叫 Quinn Freeze。这里是我的数字小窝。',
      aboutDetailsTitle: '基本资料',
      aboutDirectionsTitle: '关注的方向',
      aboutDirectionsLead: '历史、政治、技术、哲学与经济，是我感兴趣的几个方向。',
      aboutNestTitle: '关于这个小窝',
      aboutNestBody: '这个网站把我的基本资料、兴趣、公开项目和联系入口放在一起。你可以从不同的页面慢慢了解。',
      aboutMottoTitle: '一句题词',
      aboutMottoBody: '问史哪得信如许，唯有实录奠根基。',
      aboutNext: '从兴趣或作品继续逛逛。',
      aboutMetaDescription: '关于李秋易（Quinn Freeze）：基本资料、兴趣方向与 Freeze’s Nest 数字小窝。',
      interestsPageTitle: '兴趣与关注 · Freeze’s Nest',
      interestsPageHeading: '兴趣与关注',
      interestsPageLead: '一些让我愿意继续阅读、思考和动手的方向。',
      historyFocus: '史料与叙事 · 历史事件 · 制度与社会',
      techFocus: '编程 · 软件工具 · 用户体验',
      readingFocus: '哲学 · 经济 · 阅读与思考',
      strategyFocus: '规则 · 选择 · 长期取舍',
      historyBody: '我对历史与政治的兴趣，更多在于理解事情发生的背景，以及制度与社会之间的关系。',
      techBody: '技术与编程是把想法变成具体工具的方式。公开作品放在项目页面，可以直接查看源码。',
      readingBody: '阅读提供不同的视角。哲学与经济是我感兴趣的方向，也连接着对个人选择和社会运行的思考。',
      strategyBody: '策略游戏让我感兴趣的，是规则下的选择，以及不同决策带来的长期变化。',
      interestsToProjects: '看看相关的公开作品',
      interestsMetaDescription: '李秋易（Quinn Freeze）关注历史、政治、技术、哲学与经济，也喜欢阅读、编程和策略游戏。',
      contactPageTitle: '联系我 · Freeze’s Nest',
      contactPageHeading: '联系我',
      contactPageLead: '你可以通过以下邮箱或已有社交账号找到我。',
      contactEmailNote: '较长的交流或具体问题，可以通过邮箱联系。',
      contactGithubNote: '这里有公开源码和项目说明。',
      contactXNote: '我的 X 账号。',
      contactWhatsAppNote: '可以复制账号后查找。',
      contactElsewhereTitle: '其他入口',
      contactElsewhereBody: '也欢迎先看看我的兴趣与公开作品。',
      contactMetaDescription: '通过邮箱、GitHub、X 与 WhatsApp 账号联系李秋易（Quinn Freeze）。',
      siteTitle: 'Freeze’s Nest · 秋易的小窝',
      nestSubtitle: '秋易的小窝',
      nestWelcome: '欢迎来到我的数字小窝。',
      nestDescription: '这里放着我的兴趣、公开作品与联系入口。',
      skip: '跳到内容',
      navigation: '页面导航',
      navHome: '首页',
      navAbout: '关于',
      navProjects: '项目',
      navInterests: '兴趣',
      navContact: '联系',
      aboutTitle: '关于我',
      aboutAria: '个人介绍',
      ageLabel: '年龄',
      birthdayLabel: '生日',
      ageUnavailable: '启用 JavaScript 后可显示自动计算的年龄。',
      intro: '对历史、政治、技术、哲学与经济感兴趣，喜欢阅读、编程和策略游戏。',
      history: '历史',
      politics: '政治',
      technology: '技术',
      philosophy: '哲学',
      economics: '经济',
      mottoTranslation: '',
      projectsTitle: '个人项目',
      projectsIntro: '一些公开在 GitHub 上的作品。',
      themeDescription: '用于 Codex 桌面端的 Liquid Glass 主题插件，支持壁纸和玻璃效果设置。',
      websiteDescription: '这个个人主页的源码，使用轻量的 HTML、CSS 和 JavaScript 构建。',
      viewProject: '查看 GitHub',
      newTab: '（在新标签页打开）',
      stackAria: '技术栈',
      interestsTitle: '兴趣与关注',
      interestsAria: '兴趣',
      interestsIntro: '几个持续感兴趣的方向。',
      historyPoliticsTitle: '历史与政治',
      historyPoliticsDescription: '从历史记录与政治议题出发，理解社会与制度。',
      technologyTitle: '技术与编程',
      technologyDescription: '关注技术，尝试通过编程实现自己的想法。',
      readingTitle: '阅读与思考',
      readingDescription: '通过阅读探索哲学与经济，保持思考。',
      strategyTitle: '策略游戏',
      strategyDescription: '喜欢在规则、选择与取舍之间推演。',
      programming: '编程',
      reading: '阅读',
      strategyGames: '策略游戏',
      contactTitle: '联系我',
      contactIntro: '可以在这些地方找到我。',
      emailLabel: '邮箱',
      githubAria: 'GitHub：QuinnFreeze（在新标签页打开）',
      xAria: 'X：@xiaoqiuyi0（在新标签页打开）',
      copyAria: '复制 WhatsApp 账号 @xiaoqiuyi',
      copySuccess: 'WhatsApp 账号已复制',
      copyFailure: '无法自动复制，请手动选中并复制 WhatsApp 账号 @xiaoqiuyi。',
      languageAria: '切换到英文',
      metaDescription: 'Freeze’s Nest · 秋易的小窝，李秋易（Quinn Freeze）的个人主页，分享兴趣、公开作品与联系入口。',
      footer: 'Freeze’s Nest · 李秋易 / Quinn Freeze',
    },
    en: {
      contactDetailsTitle: 'Contact details',
      homeHeading: 'Freeze’s Nest',
      aboutInterestsLink: 'Interests & curiosities',
      backHome: 'Back home',
      returnProjects: 'Back to projects',
      aboutBirthdayName: 'Name & birthday',
      projectsPageMetaTitle: 'Projects · Freeze’s Nest',
      projectsPageMetaDescription: 'Public work from Freeze’s Nest: the Codex Liquid Glass desktop theme and the source of this personal website.',
      projectsPageTitle: 'Projects',
      projectsPageIntro: 'A few explorations of interfaces and technology, from a desktop theme to this little corner of the web.',
      projectsCollectionTitle: 'Public work',
      projectsCollectionIntro: 'Two public projects with source code to explore, including their features and technical foundations.',
      themeRepoName: 'codex-theme',
      nestRepoName: 'Freeze-s-life',
      projectDetailsLink: 'Explore this project',
      themeCatalogDetail: 'Bringing monochrome wallpaper and glass styling to macOS Codex, with local wallpaper settings and theme loading tools.',
      nestCatalogDetail: 'A personal digital space for a short introduction, interests, and public work, with bilingual reading and mobile access.',
      projectBack: 'Back to projects',
      projectFeaturesTitle: 'Features',
      projectTechnologyTitle: 'Technical foundations',
      projectSourceTitle: 'Public source',
      readProjectGuide: 'Read the project guide',
      readPluginGuide: 'Read the plugin guide',
      browseProjectSource: 'Browse the source',
      themePageMetaTitle: 'Codex Liquid Glass · Freeze’s Nest',
      themePageMetaDescription: 'Explore the glass styling, local wallpaper settings, theme loading approach, and public source of codex-theme.',
      themePageTitle: 'Codex Liquid Glass',
      themePageIntro: 'A theme project for macOS Codex Desktop: monochrome wallpaper, a glass interface, and local settings.',
      themeWallpaperTitle: 'Wallpaper and appearance',
      themeWallpaperText: 'Supports local images and settings for position, fit, brightness, and blur.',
      themeGlassTitle: 'Glass styling',
      themeGlassText: 'Adds glass styling to the composer, menus, and floating panels while following the app’s light or dark appearance.',
      themeSettingsTitle: 'Visual settings',
      themeSettingsText: 'A local settings page lets you choose and preview wallpaper, adjust light-mode transparency, and restore the default wallpaper.',
      themeLoaderTitle: 'Separate loading',
      themeLoaderText: 'Loads through a separate launcher and a local debugging interface, preserving the official application and its signed files.',
      themePythonTitle: 'Python',
      themePythonText: 'Handles installation, theme management, and local plugin tools.',
      themeJavaScriptTitle: 'JavaScript / Node.js',
      themeJavaScriptText: 'Powers the theme runtime and local debugging connection.',
      themeCssTitle: 'CSS and HTML',
      themeCssText: 'CSS defines the glass styling; HTML provides the wallpaper settings interface.',
      themeNativeTitle: 'Objective-C and Shell',
      themeNativeText: 'Used for the macOS launcher, observer, and installation and launch entry points.',
      themeSourceText: 'The repository includes the theme, plugin, settings interface, and installation guide. The project documentation covers requirements and compatibility.',
      nestPageMetaTitle: 'Freeze’s Nest website · Projects',
      nestPageMetaDescription: 'Explore this personal website’s bilingual content, responsive layout, automatic age, and native HTML, CSS, and JavaScript source.',
      nestPageTitle: 'This little nest',
      nestPageIntro: 'Freeze’s Nest is my own corner of the web, with its source published in the Freeze-s-life repository.',
      nestProfileTitle: 'Introduction and interests',
      nestProfileText: 'Keeps my name and motto, with a short introduction, interests, and an age calculated from my birthday.',
      nestLanguageTitle: 'Reading in two languages',
      nestLanguageText: 'Switch between Chinese and English, save a language preference, or choose a language through a shared link.',
      nestResponsiveTitle: 'Different screens',
      nestResponsiveText: 'The same content adapts to phones, tablets, and desktop screens, keeping the wallpaper and lightweight glass styling.',
      nestContactTitle: 'Getting in touch',
      nestContactText: 'Keeps email and social links, with WhatsApp handle copying when the browser supports it.',
      nestHtmlTitle: 'HTML',
      nestHtmlText: 'Provides the page structure and content. Basic information and links remain readable without JavaScript.',
      nestCssTitle: 'CSS',
      nestCssText: 'Handles responsive layout, transparent glass styling, and system preferences for reduced motion and transparency.',
      nestJavaScriptTitle: 'JavaScript',
      nestJavaScriptText: 'Handles language switching, automatic age, and handle copying without a frontend framework.',
      nestSourceText: 'The site uses native HTML, CSS, and JavaScript. Its public repository also includes local verification scripts and GitHub Pages configuration.',
      techPython: 'Python',
      techJavaScript: 'JavaScript',
      techCss: 'CSS',
      techHtml: 'HTML',
      techNode: 'Node.js',
      techObjectiveC: 'Objective-C',
      homeNameTitle: '李秋易 / Quinn Freeze',
      homeLead: 'This is my personal digital space. Get to know me, explore my projects, or start with my interests.',
      homeExplore: 'Explore the nest',
      homeAboutLink: 'About me',
      homeProjectLink: 'Explore projects',
      homeInterestLink: 'Explore my interests',
      homeContactLink: 'Get in touch',
      homeAboutSummary: 'My name, basic details, and areas of interest.',
      homeProjectSummary: 'Two public projects, with the ideas and features behind each.',
      homeInterestSummary: 'History, politics, technology, philosophy, economics, reading, and strategy games.',
      homeContactSummary: 'Email, GitHub, and my existing social profiles.',
      homeMetaDescription: 'Freeze’s Nest, the personal homepage of 李秋易 · Quinn Freeze. Get to know me, explore public projects, or start with my interests.',
      aboutPageTitle: 'About me · Freeze’s Nest',
      aboutPageHeading: 'About me',
      aboutPageLead: 'I’m 李秋易, also known as Quinn Freeze. This is my little digital nest.',
      aboutDetailsTitle: 'The basics',
      aboutDirectionsTitle: 'Areas of interest',
      aboutDirectionsLead: 'History, politics, technology, philosophy, and economics are a few of my interests.',
      aboutNestTitle: 'About the nest',
      aboutNestBody: 'This website brings together my basic details, interests, public projects, and contact links. Explore the different pages to get to know me.',
      aboutMottoTitle: 'A motto',
      aboutMottoBody: '问史哪得信如许，唯有实录奠根基。',
      aboutNext: 'Continue exploring my interests or projects.',
      aboutMetaDescription: 'About 李秋易 · Quinn Freeze: basic details, areas of interest, and the Freeze’s Nest personal digital space.',
      interestsPageTitle: 'Interests · Freeze’s Nest',
      interestsPageHeading: 'Interests & curiosities',
      interestsPageLead: 'A few interests that keep me reading, thinking, and making things.',
      historyFocus: 'Historical sources & narratives · Events · Institutions & society',
      techFocus: 'Programming · Software tools · User experience',
      readingFocus: 'Philosophy · Economics · Reading & reflection',
      strategyFocus: 'Rules · Choices · Long-term trade-offs',
      historyBody: 'My interest in history and politics is about understanding the context behind events and the relationship between institutions and society.',
      techBody: 'Technology and programming turn ideas into useful tools. My public projects have their own page, with links to the source code.',
      readingBody: 'Reading offers different perspectives. Philosophy and economics connect my interests in personal choices and how society works.',
      strategyBody: 'What interests me about strategy games is making choices within rules and seeing how decisions shape things over time.',
      interestsToProjects: 'Explore public projects',
      interestsMetaDescription: '李秋易 · Quinn Freeze’s interests in history, politics, technology, philosophy, economics, reading, programming, and strategy games.',
      contactPageTitle: 'Contact · Freeze’s Nest',
      contactPageHeading: 'Get in touch',
      contactPageLead: 'You can reach me through the email address and social profiles below.',
      contactEmailNote: 'For a longer conversation or a specific question, email is a good place to start.',
      contactGithubNote: 'Public source code and project descriptions.',
      contactXNote: 'My profile on X.',
      contactWhatsAppNote: 'Copy the handle to look it up.',
      contactElsewhereTitle: 'Around the nest',
      contactElsewhereBody: 'You’re also welcome to explore my interests and public projects first.',
      contactMetaDescription: 'Contact 李秋易 · Quinn Freeze through email, GitHub, X, and a WhatsApp handle.',
      siteTitle: 'Freeze’s Nest · Quinn Freeze',
      nestSubtitle: 'A personal digital space',
      nestWelcome: 'Welcome to my little corner of the web.',
      nestDescription: 'A place for my interests, public projects, and ways to get in touch.',
      skip: 'Skip to content',
      navigation: 'Page navigation',
      navHome: 'Home',
      navAbout: 'About',
      navProjects: 'Projects',
      navInterests: 'Interests',
      navContact: 'Contact',
      aboutTitle: 'About me',
      aboutAria: 'About me',
      ageLabel: 'Age',
      birthdayLabel: 'Birthday',
      ageUnavailable: 'Enable JavaScript to show the automatically calculated age.',
      intro: 'Interested in history, politics, technology, philosophy, and economics. I enjoy reading, programming, and strategy games.',
      history: 'History',
      politics: 'Politics',
      technology: 'Technology',
      philosophy: 'Philosophy',
      economics: 'Economics',
      mottoTranslation: 'History earns trust through faithful records.',
      projectsTitle: 'Projects',
      projectsIntro: 'Public projects on GitHub.',
      themeDescription: 'A Liquid Glass theme plugin for Codex Desktop, with wallpaper and glass effect settings.',
      websiteDescription: 'The source for this personal homepage, built with lightweight HTML, CSS, and JavaScript.',
      viewProject: 'View on GitHub',
      newTab: '(opens in a new tab)',
      stackAria: 'Technology stack',
      interestsTitle: 'Interests & curiosities',
      interestsAria: 'Interests',
      interestsIntro: 'A few things that keep me curious.',
      historyPoliticsTitle: 'History & politics',
      historyPoliticsDescription: 'Exploring society and institutions through history and political questions.',
      technologyTitle: 'Technology & programming',
      technologyDescription: 'Following technology and exploring ideas through programming.',
      readingTitle: 'Reading & ideas',
      readingDescription: 'Exploring philosophy and economics through reading and reflection.',
      strategyTitle: 'Strategy games',
      strategyDescription: 'Enjoying the interplay of rules, choices, and trade-offs.',
      programming: 'Programming',
      reading: 'Reading',
      strategyGames: 'Strategy games',
      contactTitle: 'Contact',
      contactIntro: 'You can reach me through the links below.',
      emailLabel: 'Email',
      githubAria: 'GitHub: QuinnFreeze (opens in a new tab)',
      xAria: 'X: @xiaoqiuyi0 (opens in a new tab)',
      copyAria: 'Copy WhatsApp handle @xiaoqiuyi',
      copySuccess: 'WhatsApp handle copied',
      copyFailure: 'Unable to copy automatically. Please select and copy the WhatsApp handle @xiaoqiuyi.',
      languageAria: 'Switch to Chinese',
      metaDescription: 'Freeze’s Nest, the personal homepage of 李秋易 · Quinn Freeze: interests, public projects, and ways to get in touch.',
      footer: 'Freeze’s Nest · 李秋易 / Quinn Freeze',
    },
  };

  const preferenceKey = 'homepage-language';
  const languageToggle = document.getElementById('language-toggle');
  const copyButton = document.getElementById('copy-whatsapp');
  const handle = document.getElementById('whatsapp-handle');
  const status = document.getElementById('contact-status');
  let language;
  let languageRevision = 0;

  function isLanguage(value) {
    return value === 'zh' || value === 'en';
  }

  function initialLanguage() {
    const requested = new URL(location.href).searchParams.get('lang');
    if (isLanguage(requested)) return requested;

    try {
      const saved = localStorage.getItem(preferenceKey);
      if (isLanguage(saved)) return saved;
    } catch {
      // Private browsing or browser policy may make storage unavailable.
    }

    return 'zh';
  }

  function currentAge(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(now);
    const date = {};
    for (const part of parts) {
      if (part.type !== 'literal') date[part.type] = Number(part.value);
    }

    const beforeBirthday = date.month === 1 && date.day < 21;
    return date.year - 2009 - Number(beforeBirthday);
  }

  function updateAge() {
    const age = currentAge();
    const value = language === 'zh' ? `${age} 岁` : `${age} years old`;
    document.querySelectorAll('[data-age], [data-i18n="ageValue"]').forEach((element) => {
      element.textContent = value;
    });
  }

  function updatePageLinks() {
    const currentUrl = new URL(location.href);
    document.querySelectorAll('a[data-page-link]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const url = new URL(href, currentUrl);
      if (url.origin !== currentUrl.origin || url.protocol !== currentUrl.protocol) return;
      url.searchParams.set('lang', language);
      link.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
    });
  }

  function applyLanguage(nextLanguage) {
    language = nextLanguage;
    languageRevision += 1;
    const messages = translations[language];
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';

    [
      ['[data-i18n]', 'i18n', null],
      ['[data-i18n-aria]', 'i18nAria', 'aria-label'],
      ['[data-i18n-content]', 'i18nContent', 'content'],
    ].forEach(([selector, dataKey, attribute]) => {
      document.querySelectorAll(selector).forEach((element) => {
        const value = messages[element.dataset[dataKey]];
        if (value === undefined) return;
        if (attribute) element.setAttribute(attribute, value);
        else element.textContent = value;
      });
    });

    updatePageLinks();
    updateAge();
    document.querySelectorAll('[data-birthday]').forEach((element) => {
      element.textContent = language === 'zh' ? '2009 年 1 月 21 日' : 'January 21, 2009';
    });

    if (languageToggle) {
      languageToggle.textContent = language === 'zh' ? 'EN' : '中文';
      languageToggle.setAttribute('aria-label', messages.languageAria);
      languageToggle.hidden = false;
    }
    if (status) status.textContent = '';
  }

  applyLanguage(initialLanguage());

  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      applyLanguage(language === 'zh' ? 'en' : 'zh');
      try {
        localStorage.setItem(preferenceKey, language);
      } catch {
        // Switching still works when a preference cannot be persisted.
      }
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.replaceState(null, '', url);
    });
  }

  // Refresh after returning to a tab left open across a birthday.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateAge();
  });

  const clipboard = navigator.clipboard;
  if (!copyButton || !handle || !status || !clipboard || typeof clipboard.writeText !== 'function') return;

  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    copyButton.disabled = true;
    status.textContent = '';
    const startedRevision = languageRevision;

    try {
      await clipboard.writeText(handle.textContent.trim());
      if (startedRevision === languageRevision) status.textContent = translations[language].copySuccess;
    } catch {
      if (startedRevision === languageRevision) status.textContent = translations[language].copyFailure;
    } finally {
      copyButton.disabled = false;
    }
  });
})();
