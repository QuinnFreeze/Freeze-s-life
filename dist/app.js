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
      projectsPageMetaDescription: '我的两个公开项目：Codex 玻璃主题（codex-theme）与秋易的小窝（Freeze-s-life）。',
      projectsPageTitle: '个人项目',
      projectsPageIntro: '我开发的个人工具与网站项目。',
      projectsCollectionTitle: '公开作品',
      projectsCollectionIntro: '项目源码与使用说明均可在 GitHub 查看。',
      themeRepoName: 'Codex 玻璃主题',
      nestRepoName: '秋易的小窝',
      projectDetailsLink: '项目详情',
      themeCatalogDetail: '项目源于我对桌面界面与使用体验的关注，提供本地设置页、壁纸预览和独立加载工具。',
      nestCatalogDetail: '我希望用一个独立网站呈现自己的关注与实践。这个小窝以 HTML、CSS 和 JavaScript 构建，支持双语阅读与响应式布局。',
      projectBack: '返回项目目录',
      projectFeaturesTitle: '主要功能',
      projectTechnologyTitle: '技术构成',
      projectSourceTitle: '公开源码',
      readProjectGuide: '阅读项目说明',
      readPluginGuide: '查看插件说明',
      browseProjectSource: '浏览源码目录',
      themePageMetaTitle: 'Codex 玻璃主题 · Freeze’s Nest',
      themePageMetaDescription: '我为 macOS Codex 开发的玻璃主题，提供自定义壁纸、本地设置与独立加载工具，源码公开在 codex-theme。',
      themePageTitle: 'Codex 玻璃主题',
      themePageIntro: '我为 macOS Codex 开发的玻璃主题，支持自定义壁纸，并提供本地设置页面。',
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
      themeSourceText: '我在 codex-theme 仓库公开了主题、插件、设置界面及安装文档。兼容性和使用要求可在项目说明中查看。',
      nestPageMetaTitle: '秋易的小窝 · 个人项目',
      nestPageMetaDescription: '我用 HTML、CSS 和 JavaScript 构建的双语个人网站，采用响应式布局，源码公开在 Freeze-s-life。',
      nestPageTitle: '秋易的小窝',
      nestPageIntro: '这个小窝是我的个人网站，用于集中展示个人简介、关注方向与公开项目。源码发布在 Freeze-s-life 仓库。',
      nestProfileTitle: '基本资料与兴趣',
      nestProfileText: '展示我的姓名、格言、个人简介与兴趣，并按生日自动计算年龄。',
      nestLanguageTitle: '中英文阅读',
      nestLanguageText: '可以切换中文与英文，保存语言偏好，也可用链接指定页面语言。',
      nestResponsiveTitle: '适应不同屏幕',
      nestResponsiveText: '同一套内容适应手机、平板和桌面，保留壁纸与轻量玻璃样式。',
      nestContactTitle: '直接联系',
      nestContactText: '提供邮箱与社交入口，可通过 WhatsApp 用户名链接联系我。',
      nestHtmlTitle: 'HTML',
      nestHtmlText: '承载页面结构与实际内容，基本资料和链接无需 JavaScript 也可阅读。',
      nestCssTitle: 'CSS',
      nestCssText: '处理响应式排版、透明玻璃样式，以及减少动态效果和透明度的系统偏好。',
      nestJavaScriptTitle: 'JavaScript',
      nestJavaScriptText: '处理语言切换与按生日计算的年龄，不依赖前端框架。',
      nestSourceText: '网站采用原生 HTML、CSS 和 JavaScript 构建。Freeze-s-life 仓库同时提供本地检查脚本与 GitHub Pages 部署配置。',
      techPython: 'Python',
      techJavaScript: 'JavaScript',
      techCss: 'CSS',
      techHtml: 'HTML',
      techNode: 'Node.js',
      techObjectiveC: 'Objective-C',
      homeNameTitle: '李秋易 / Quinn Freeze',
      homeLead: '这里介绍我的学习经历、关注方向与公开项目。',
      homeExplore: '从这里开始',
      homeAboutLink: '个人简介',
      homeProjectLink: '浏览项目',
      homeInterestLink: '了解关注方向',
      homeContactLink: '联系方式',
      homeAboutSummary: '阅读、学习与技术实践。',
      homeProjectSummary: '桌面主题与个人网站的设计和实现。',
      homeInterestSummary: '历史与社会、技术、阅读及策略游戏。',
      homeContactSummary: '公开邮箱与社交账号。',
      homeMetaDescription: '李秋易（Quinn Freeze）的个人小窝，介绍关注方向、阅读与学习经历，以及公开技术项目。',
      aboutPageTitle: '关于我 · Freeze’s Nest',
      aboutPageHeading: '关于我',
      aboutPageLead: '我是民主学社的一名成员，关注历史、社会与技术。',
      aboutDetailsTitle: '基本资料',
      aboutDirectionsTitle: '阅读与学习',
      aboutDirectionsLead: '阅读历史时，我关注史料的来源、不同记述之间的差异，以及事件背后的制度与社会条件。我也在学习英语，希望接触更广泛的资料与观点。',
      aboutNestTitle: '技术与项目实践',
      aboutNestBody: '我借助 AI 编程开发个人工具，根据实际需求改进界面与功能。Codex 玻璃主题和这个小窝，是我在这里展示的两个项目。',
      aboutMottoTitle: '一句题词',
      aboutMottoBody: '问史哪得信如许，唯有实录奠根基。',
      aboutNext: '开发过程中，我逐步理解代码，检查功能、定位问题，再根据实际使用情况完善实现。',
      aboutMetaDescription: '关于李秋易（Quinn Freeze）：基本资料、历史阅读与英语学习，以及借助 AI 进行的技术实践。',
      interestsPageTitle: '兴趣与关注 · Freeze’s Nest',
      interestsPageHeading: '兴趣与关注',
      interestsPageLead: '我的兴趣主要围绕历史与社会，也延伸到技术、阅读和策略游戏。',
      historyFocus: '近现代史 · 史料可靠性 · 制度与社会',
      techFocus: 'AI 辅助编程 · 软件工具 · 界面体验',
      readingFocus: '英语学习 · 哲学与经济 · 旅行',
      strategyFocus: '维多利亚3 · 群星 · 钢铁雄心4',
      historyBody: '我关注近现代史，尤其关心制度、观念与社会条件如何影响历史进程。阅读时，我会区分史料与后来的解释，比较不同叙述，并留意论据是否足以支持结论。',
      techBody: '我借助 AI 进行编程、调试与功能验证，尝试把日常需求转化为可用的软件工具。目前的项目主要涉及桌面界面、主题设置与个人网站。',
      readingBody: '我在阅读中关注个人与社会之间的关系，也对哲学和经济问题感兴趣。我希望通过英语学习和未来的旅行，进一步了解不同地区的历史、文化与日常生活。',
      strategyBody: '我喜欢《维多利亚3》《群星》《钢铁雄心4》等策略游戏，关注其中的资源分配、制度设计与长期决策。游戏中的问题也常成为线索，引导我继续阅读相关的历史与社会材料。',
      interestsToProjects: '查看相关项目',
      interestsMetaDescription: '我的关注方向包括近现代史、史料可靠性、制度与社会、AI 辅助编程、阅读及策略游戏。',
      contactPageTitle: '联系我 · Freeze’s Nest',
      contactPageHeading: '联系我',
      contactPageLead: '欢迎就历史、技术与相关兴趣交流。',
      contactEmailNote: '适合较完整的交流或具体问题。',
      contactGithubNote: '公开项目、源码与使用说明。',
      contactXNote: '我的 X 账号。',
      contactWhatsAppNote: '通过 WhatsApp 联系。',
      contactElsewhereTitle: '更多信息',
      contactElsewhereBody: '关于我的学习经历、关注方向和项目，可继续浏览以下页面。',
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
      intro: '我关注近现代史、制度与社会，重视史料与论据的可靠性，也借助 AI 编程开发个人工具。',
      history: '历史',
      politics: '政治',
      technology: '技术',
      philosophy: '哲学',
      economics: '经济',
      mottoTranslation: '',
      projectsTitle: '个人项目',
      projectsIntro: '一些公开在 GitHub 上的作品。',
      themeDescription: 'codex-theme 是我为 macOS Codex 开发的玻璃主题，支持自定义壁纸与界面透明度调整。',
      websiteDescription: 'Freeze-s-life 是这个个人网站的源码，集中展示我的简介、关注方向与公开项目。',
      viewProject: '查看 GitHub',
      newTab: '（在新标签页打开）',
      stackAria: '技术栈',
      interestsTitle: '兴趣与关注',
      interestsAria: '兴趣',
      interestsIntro: '几个持续感兴趣的方向。',
      historyPoliticsTitle: '历史、制度与社会',
      historyPoliticsDescription: '从历史记录与政治议题出发，理解社会与制度。',
      technologyTitle: '技术与编程',
      technologyDescription: '关注技术，尝试通过编程实现自己的想法。',
      readingTitle: '阅读与视野',
      readingDescription: '通过阅读探索哲学与经济，保持思考。',
      strategyTitle: '策略游戏',
      strategyDescription: '喜欢在规则、选择与取舍之间推演。',
      programming: '编程',
      reading: '阅读',
      strategyGames: '策略游戏',
      contactTitle: '联系我',
      contactIntro: '以下是我的公开联系方式。',
      emailLabel: '邮箱',
      githubAria: 'GitHub：QuinnFreeze（在新标签页打开）',
      xAria: 'X：@xiaoqiuyi0（在新标签页打开）',
      whatsappAria: 'WhatsApp：@xiaoqiuyi（在新标签页打开）',
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
      projectsPageMetaDescription: 'My two public projects: Codex Glass Theme (codex-theme) and Freeze’s Nest (Freeze-s-life).',
      projectsPageTitle: 'Projects',
      projectsPageIntro: 'Personal tools and website projects I develop.',
      projectsCollectionTitle: 'Public work',
      projectsCollectionIntro: 'Source code and project documentation are available on GitHub.',
      themeRepoName: 'Codex Glass Theme',
      nestRepoName: 'Freeze’s Nest',
      projectDetailsLink: 'Project details',
      themeCatalogDetail: 'The project grew from my interest in desktop interfaces and usability. It includes local settings, wallpaper previews, and a separate launcher.',
      nestCatalogDetail: 'I wanted an independent website to present my interests and projects. Freeze’s Nest uses HTML, CSS, and JavaScript, with bilingual content and a responsive layout.',
      projectBack: 'Back to projects',
      projectFeaturesTitle: 'Features',
      projectTechnologyTitle: 'Technical foundations',
      projectSourceTitle: 'Public source',
      readProjectGuide: 'Read the project guide',
      readPluginGuide: 'Read the plugin guide',
      browseProjectSource: 'Browse the source',
      themePageMetaTitle: 'Codex Glass Theme · Freeze’s Nest',
      themePageMetaDescription: 'My glass-style theme for Codex on macOS, with custom wallpapers, local settings, and a separate launcher. Source code is available in codex-theme.',
      themePageTitle: 'Codex Glass Theme',
      themePageIntro: 'I developed this theme for Codex on macOS, with glass-style panels, custom wallpapers, and a local settings page.',
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
      themeSourceText: 'I publish the theme, plugin, settings interface, and installation guide in codex-theme. The documentation describes compatibility and requirements.',
      nestPageMetaTitle: 'Freeze’s Nest · Projects',
      nestPageMetaDescription: 'My bilingual personal website, built with HTML, CSS, and JavaScript. It uses a responsive layout, with source code available in Freeze-s-life.',
      nestPageTitle: 'Freeze’s Nest',
      nestPageIntro: 'Freeze’s Nest is my personal website, bringing together my profile, interests, and public projects. I publish its source code in Freeze-s-life.',
      nestProfileTitle: 'Introduction and interests',
      nestProfileText: 'Presents my name, motto, profile, and interests, with my age calculated from my birthday.',
      nestLanguageTitle: 'Reading in two languages',
      nestLanguageText: 'Switch between Chinese and English, save a language preference, or choose a language through a shared link.',
      nestResponsiveTitle: 'Different screens',
      nestResponsiveText: 'The same content adapts to phones, tablets, and desktop screens, keeping the wallpaper and lightweight glass styling.',
      nestContactTitle: 'Getting in touch',
      nestContactText: 'Links to my email and social accounts, including a WhatsApp username link.',
      nestHtmlTitle: 'HTML',
      nestHtmlText: 'Provides the page structure and content. Basic information and links remain readable without JavaScript.',
      nestCssTitle: 'CSS',
      nestCssText: 'Handles responsive layout, transparent glass styling, and system preferences for reduced motion and transparency.',
      nestJavaScriptTitle: 'JavaScript',
      nestJavaScriptText: 'Handles language switching and age calculation without a frontend framework.',
      nestSourceText: 'The site uses native HTML, CSS, and JavaScript. The Freeze-s-life repository also includes local checks and GitHub Pages deployment settings.',
      techPython: 'Python',
      techJavaScript: 'JavaScript',
      techCss: 'CSS',
      techHtml: 'HTML',
      techNode: 'Node.js',
      techObjectiveC: 'Objective-C',
      homeNameTitle: '李秋易 / Quinn Freeze',
      homeLead: 'An introduction to my learning, interests, and public projects.',
      homeExplore: 'Explore the nest',
      homeAboutLink: 'About me',
      homeProjectLink: 'View projects',
      homeInterestLink: 'Explore my interests',
      homeContactLink: 'Contact details',
      homeAboutSummary: 'Reading, learning, and work with technology.',
      homeProjectSummary: 'A desktop theme and the development of this website.',
      homeInterestSummary: 'History and society, technology, reading, and strategy games.',
      homeContactSummary: 'My public email and social accounts.',
      homeMetaDescription: 'The personal website of 李秋易 · Quinn Freeze, with my interests, reading and learning, and public technology projects.',
      aboutPageTitle: 'About me · Freeze’s Nest',
      aboutPageHeading: 'About me',
      aboutPageLead: 'I’m a member of the Socialist Democracy Historical Research Society, with interests in history, society, and technology.',
      aboutDetailsTitle: 'The basics',
      aboutDirectionsTitle: 'Reading and learning',
      aboutDirectionsLead: 'When reading history, I consider where sources come from, how accounts differ, and the institutions and social conditions behind events. I’m also learning English to access a wider range of sources and views.',
      aboutNestTitle: 'Technology and projects',
      aboutNestBody: 'I use AI to help develop personal tools, improving interfaces and features around practical needs. I present two projects here: my Codex glass theme and Freeze’s Nest.',
      aboutMottoTitle: 'A motto',
      aboutMottoBody: '问史哪得信如许，唯有实录奠根基。',
      aboutNext: 'As I develop these projects, I learn how the code works, check features, investigate problems, and refine the code through everyday use.',
      aboutMetaDescription: 'About 李秋易 · Quinn Freeze: basic details, reading history, learning English, and developing projects with help from AI.',
      interestsPageTitle: 'Interests · Freeze’s Nest',
      interestsPageHeading: 'Interests & curiosities',
      interestsPageLead: 'My main interests are history and society, alongside technology, reading, and strategy games.',
      historyFocus: 'Modern history · Reliable sources · Institutions and society',
      techFocus: 'Coding with AI · Software tools · Interface design',
      readingFocus: 'Learning English · Philosophy and economics · Travel',
      strategyFocus: 'Victoria 3 · Stellaris · Hearts of Iron IV',
      historyBody: 'My interest in modern history focuses on how institutions, ideas, and social conditions shape events. I distinguish historical sources from later interpretations, compare different accounts, and consider whether the evidence supports their conclusions.',
      techBody: 'I use AI to help with coding, debugging, and checking features, turning everyday needs into software tools. My current projects focus on desktop interfaces, theme settings, and this personal website.',
      readingBody: 'My reading often leads me to questions about individuals and society, including philosophy and economics. Through learning English and travelling in the future, I hope to better understand the history, culture, and everyday life of different places.',
      strategyBody: 'I enjoy strategy games such as Victoria 3, Stellaris, and Hearts of Iron IV, especially their resource management, institutions, and long-term decisions. Questions that arise while playing often lead me to further reading on history and society.',
      interestsToProjects: 'View related projects',
      interestsMetaDescription: 'My interests include modern history, reliable sources, institutions and society, coding with AI, reading, and strategy games.',
      contactPageTitle: 'Contact · Freeze’s Nest',
      contactPageHeading: 'Get in touch',
      contactPageLead: 'I welcome conversations about history, technology, and shared interests.',
      contactEmailNote: 'For longer conversations or specific questions.',
      contactGithubNote: 'Public projects, source code, and documentation.',
      contactXNote: 'My account on X.',
      contactWhatsAppNote: 'Contact me on WhatsApp.',
      contactElsewhereTitle: 'Further information',
      contactElsewhereBody: 'The following pages provide more about my learning, interests, and projects.',
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
      intro: 'I’m interested in modern history, institutions, and society. I value reliable sources and evidence, and use AI to help develop personal tools.',
      history: 'History',
      politics: 'Politics',
      technology: 'Technology',
      philosophy: 'Philosophy',
      economics: 'Economics',
      mottoTranslation: 'History earns trust through faithful records.',
      projectsTitle: 'Projects',
      projectsIntro: 'Public projects on GitHub.',
      themeDescription: 'codex-theme is a glass-style theme I develop for Codex on macOS, with custom wallpapers and adjustable interface transparency.',
      websiteDescription: 'Freeze-s-life is the source of this personal website, which brings together my profile, interests, and public projects.',
      viewProject: 'View on GitHub',
      newTab: '(opens in a new tab)',
      stackAria: 'Technology stack',
      interestsTitle: 'Interests & curiosities',
      interestsAria: 'Interests',
      interestsIntro: 'A few things that keep me curious.',
      historyPoliticsTitle: 'History, institutions, and society',
      historyPoliticsDescription: 'Exploring society and institutions through history and political questions.',
      technologyTitle: 'Technology & programming',
      technologyDescription: 'Following technology and exploring ideas through programming.',
      readingTitle: 'Reading and perspectives',
      readingDescription: 'Exploring philosophy and economics through reading and reflection.',
      strategyTitle: 'Strategy games',
      strategyDescription: 'Enjoying the interplay of rules, choices, and trade-offs.',
      programming: 'Programming',
      reading: 'Reading',
      strategyGames: 'Strategy games',
      contactTitle: 'Contact',
      contactIntro: 'My public contact details are listed below.',
      emailLabel: 'Email',
      githubAria: 'GitHub: QuinnFreeze (opens in a new tab)',
      xAria: 'X: @xiaoqiuyi0 (opens in a new tab)',
      whatsappAria: 'WhatsApp: @xiaoqiuyi (opens in a new tab)',
      languageAria: 'Switch to Chinese',
      metaDescription: 'Freeze’s Nest, the personal homepage of 李秋易 · Quinn Freeze: interests, public projects, and ways to get in touch.',
      footer: 'Freeze’s Nest · 李秋易 / Quinn Freeze',
    },
  };

  const preferenceKey = 'homepage-language';
  const languageToggle = document.getElementById('language-toggle');
  let language;

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

})();
