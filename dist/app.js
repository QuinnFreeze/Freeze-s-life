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
      projectsPageIntro: '从桌面主题到个人网站，这里是我动手做的一些尝试。',
      projectsCollectionTitle: '公开作品',
      projectsCollectionIntro: '两个项目的源码都放在 GitHub 上，欢迎看看。',
      themeRepoName: 'Codex 玻璃主题',
      nestRepoName: '秋易的小窝',
      projectDetailsLink: '了解这个项目',
      themeCatalogDetail: '这是我探索桌面界面的一次尝试，包含本地设置页、壁纸预览和独立加载工具。',
      nestCatalogDetail: '我想给自己留一处网上的小窝，用 HTML、CSS 和 JavaScript 实现了中英文切换和手机适配。',
      projectBack: '返回项目目录',
      projectFeaturesTitle: '主要功能',
      projectTechnologyTitle: '技术构成',
      projectSourceTitle: '公开源码',
      readProjectGuide: '阅读项目说明',
      readPluginGuide: '查看插件说明',
      browseProjectSource: '浏览源码目录',
      themePageMetaTitle: 'Codex 玻璃主题 · Freeze’s Nest',
      themePageMetaDescription: '我为 macOS Codex 制作的玻璃主题：自定义壁纸、本地设置页和独立加载工具，源码公开在 codex-theme。',
      themePageTitle: 'Codex 玻璃主题',
      themePageIntro: '这是我为 macOS Codex 制作的玻璃主题。它把壁纸和玻璃界面放在一起，也是我探索桌面外观的一次尝试。',
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
      themeSourceText: '我把主题、插件、设置页面和安装说明放在 codex-theme 仓库。安装前可以先看看文档中的要求与兼容性说明。',
      nestPageMetaTitle: '秋易的小窝 · 个人项目',
      nestPageMetaDescription: '我用 HTML、CSS 和 JavaScript 制作的双语个人网站，支持手机阅读，源码公开在 Freeze-s-life。',
      nestPageTitle: '秋易的小窝',
      nestPageIntro: '我做了这个小窝，想在网上有一处介绍自己、整理兴趣和作品的地方。源码放在 Freeze-s-life 仓库。',
      nestProfileTitle: '基本资料与兴趣',
      nestProfileText: '这里有我的姓名、格言、兴趣和简短介绍，年龄按生日自动计算。',
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
      nestSourceText: '我用 HTML、CSS 和 JavaScript 搭起了这个网站。Freeze-s-life 仓库也包含本地检查脚本和 GitHub Pages 配置。',
      techPython: 'Python',
      techJavaScript: 'JavaScript',
      techCss: 'CSS',
      techHtml: 'HTML',
      techNode: 'Node.js',
      techObjectiveC: 'Objective-C',
      homeNameTitle: '李秋易 / Quinn Freeze',
      homeLead: '这里放着我做的东西和感兴趣的事。',
      homeExplore: '从这里开始',
      homeAboutLink: '认识我',
      homeProjectLink: '看看作品',
      homeInterestLink: '了解我的兴趣',
      homeContactLink: '联系我',
      homeAboutSummary: '我的基本资料与学习经历。',
      homeProjectSummary: 'Codex 主题和这个网站。',
      homeInterestSummary: '历史、技术、阅读和策略游戏。',
      homeContactSummary: '邮箱和社交账号。',
      homeMetaDescription: '李秋易（Quinn Freeze）的个人小窝，分享兴趣、制作的小工具与公开项目。',
      aboutPageTitle: '关于我 · Freeze’s Nest',
      aboutPageHeading: '关于我',
      aboutPageLead: '我是李秋易，也叫 Quinn Freeze。',
      aboutDetailsTitle: '基本资料',
      aboutDirectionsTitle: '学习与阅读',
      aboutDirectionsLead: '我在学习英语，也喜欢阅读历史。遇到感兴趣的问题，会找不同的材料来看看。',
      aboutNestTitle: '把想法做出来',
      aboutNestBody: '探索技术时，我喜欢借助 AI 编程，把想法做成自己能用的工具。Codex 玻璃主题和这个网站，都是这样的尝试。',
      aboutMottoTitle: '一句题词',
      aboutMottoBody: '问史哪得信如许，唯有实录奠根基。',
      aboutNext: '我也在这个过程中熟悉代码，慢慢改进做出来的东西。',
      aboutMetaDescription: '关于李秋易（Quinn Freeze）：基本资料，以及学习英语、阅读历史和借助 AI 制作工具的经历。',
      interestsPageTitle: '兴趣与关注 · Freeze’s Nest',
      interestsPageHeading: '兴趣与关注',
      interestsPageLead: '我喜欢追问事情的来由，也喜欢动手试一试。',
      historyFocus: '近现代史 · 史料可靠性 · 制度与社会',
      techFocus: 'AI 编程 · 小工具 · 实际使用',
      readingFocus: '英语 · 阅读 · 探索世界',
      strategyFocus: '维多利亚3 · 群星 · 钢铁雄心4',
      historyBody: '我更关注近现代史，想知道事件为何发生、制度怎样影响社会。读到一种说法时，我会留意史料的来源和可靠性，也试着比较不同记述。',
      techBody: '我喜欢借助 AI 编程，把想法做成小工具。遇到问题就查资料、改代码，再看看实际用起来怎么样。对我来说，做出能用的东西很有意思。',
      readingBody: '我在学习英语，也喜欢从阅读里接触不同的观点，思考哲学、经济和个人选择。以后想去更多地方旅行，亲眼看看书本和屏幕之外的世界。',
      strategyBody: '我喜欢《维多利亚3》《群星》和《钢铁雄心4》这类策略游戏。吸引我的是经营、选择和长期取舍，也能顺着游戏里的问题继续读历史、了解制度。',
      interestsToProjects: '看看我做的东西',
      interestsMetaDescription: '我的兴趣：近现代史与史料、制度与社会、AI 编程、阅读和策略游戏，也向往去更多地方旅行。',
      contactPageTitle: '联系我 · Freeze’s Nest',
      contactPageHeading: '联系我',
      contactPageLead: '想聊聊历史、技术或游戏，欢迎联系我。',
      contactEmailNote: '有想说的，可以写邮件给我。',
      contactGithubNote: '我做的东西和源码。',
      contactXNote: '也可以在 X 上找到我。',
      contactWhatsAppNote: '复制账号后查找。',
      contactElsewhereTitle: '再逛一会儿',
      contactElsewhereBody: '我的兴趣和作品也在这里。',
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
      intro: '我喜欢读历史、探索技术，也爱玩策略游戏。',
      history: '历史',
      politics: '政治',
      technology: '技术',
      philosophy: '哲学',
      economics: '经济',
      mottoTranslation: '',
      projectsTitle: '个人项目',
      projectsIntro: '一些公开在 GitHub 上的作品。',
      themeDescription: 'codex-theme 是我为 macOS Codex 制作的玻璃主题，支持自定义壁纸和调整界面透明度。',
      websiteDescription: 'Freeze-s-life 是这个网站的源码，用来放我的介绍、兴趣和作品。',
      viewProject: '查看 GitHub',
      newTab: '（在新标签页打开）',
      stackAria: '技术栈',
      interestsTitle: '兴趣与关注',
      interestsAria: '兴趣',
      interestsIntro: '几个持续感兴趣的方向。',
      historyPoliticsTitle: '历史与社会',
      historyPoliticsDescription: '从历史记录与政治议题出发，理解社会与制度。',
      technologyTitle: '技术与编程',
      technologyDescription: '关注技术，尝试通过编程实现自己的想法。',
      readingTitle: '阅读与远方',
      readingDescription: '通过阅读探索哲学与经济，保持思考。',
      strategyTitle: '策略游戏',
      strategyDescription: '喜欢在规则、选择与取舍之间推演。',
      programming: '编程',
      reading: '阅读',
      strategyGames: '策略游戏',
      contactTitle: '联系我',
      contactIntro: '我的邮箱和账号：',
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
      projectsPageMetaDescription: 'My two public projects: Codex Glass Theme (codex-theme) and Freeze’s Nest (Freeze-s-life).',
      projectsPageTitle: 'Projects',
      projectsPageIntro: 'From a desktop theme to this website, these are a few things I’ve made.',
      projectsCollectionTitle: 'Public work',
      projectsCollectionIntro: 'Both projects have public source code on GitHub. Feel free to take a look.',
      themeRepoName: 'Codex Glass Theme',
      nestRepoName: 'Freeze’s Nest',
      projectDetailsLink: 'Explore this project',
      themeCatalogDetail: 'It is one of my experiments with desktop interfaces, with a local settings page, wallpaper previews, and a separate launcher.',
      nestCatalogDetail: 'I wanted my own little place on the web. I built it with HTML, CSS, and JavaScript, with Chinese and English text and a layout for phones.',
      projectBack: 'Back to projects',
      projectFeaturesTitle: 'Features',
      projectTechnologyTitle: 'Technical foundations',
      projectSourceTitle: 'Public source',
      readProjectGuide: 'Read the project guide',
      readPluginGuide: 'Read the plugin guide',
      browseProjectSource: 'Browse the source',
      themePageMetaTitle: 'Codex Glass Theme · Freeze’s Nest',
      themePageMetaDescription: 'My glass-style theme for Codex on macOS, with custom wallpapers, local settings, and a separate launcher. Source: codex-theme.',
      themePageTitle: 'Codex Glass Theme',
      themePageIntro: 'I made this glass-style theme for Codex on macOS. It brings wallpapers and glass panels together as one of my experiments with desktop interfaces.',
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
      themeSourceText: 'I’ve shared the theme, plugin, settings page, and installation guide in codex-theme. The documentation explains the requirements and compatibility.',
      nestPageMetaTitle: 'Freeze’s Nest · Projects',
      nestPageMetaDescription: 'My bilingual personal website, built with HTML, CSS, and JavaScript for reading on phones too. Source: Freeze-s-life.',
      nestPageTitle: 'Freeze’s Nest',
      nestPageIntro: 'I built this little space to introduce myself and share my interests and projects. The source is in the Freeze-s-life repository.',
      nestProfileTitle: 'Introduction and interests',
      nestProfileText: 'Here are my name, motto, interests, and a short introduction. My age is calculated from my birthday.',
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
      nestSourceText: 'I built this website with HTML, CSS, and JavaScript. The Freeze-s-life repository also includes local checks and GitHub Pages settings.',
      techPython: 'Python',
      techJavaScript: 'JavaScript',
      techCss: 'CSS',
      techHtml: 'HTML',
      techNode: 'Node.js',
      techObjectiveC: 'Objective-C',
      homeNameTitle: '李秋易 / Quinn Freeze',
      homeLead: 'Here are the things I make and the things I enjoy.',
      homeExplore: 'Explore the nest',
      homeAboutLink: 'About me',
      homeProjectLink: 'See my projects',
      homeInterestLink: 'See my interests',
      homeContactLink: 'Get in touch',
      homeAboutSummary: 'A little about me and what I’m learning.',
      homeProjectSummary: 'A Codex theme and this website.',
      homeInterestSummary: 'History, technology, books, and strategy games.',
      homeContactSummary: 'My email and social accounts.',
      homeMetaDescription: 'The personal website of 李秋易 · Quinn Freeze, with my interests, tools, and public projects.',
      aboutPageTitle: 'About me · Freeze’s Nest',
      aboutPageHeading: 'About me',
      aboutPageLead: 'I’m 李秋易, also known as Quinn Freeze.',
      aboutDetailsTitle: 'The basics',
      aboutDirectionsTitle: 'Learning and reading',
      aboutDirectionsLead: 'I’m learning English and enjoy reading history. When a question interests me, I look for different sources to learn more.',
      aboutNestTitle: 'Making things',
      aboutNestBody: 'I like exploring technology and coding with help from AI to make tools I can use. My Codex glass theme and this website are two examples.',
      aboutMottoTitle: 'A motto',
      aboutMottoBody: '问史哪得信如许，唯有实录奠根基。',
      aboutNext: 'Along the way, I’m learning how the code works and improving what I make.',
      aboutMetaDescription: 'About 李秋易 · Quinn Freeze: basic details, learning English, reading history, and making tools with help from AI.',
      interestsPageTitle: 'Interests · Freeze’s Nest',
      interestsPageHeading: 'Interests & curiosities',
      interestsPageLead: 'I like asking why things happen and trying ideas for myself.',
      historyFocus: 'Modern history · Reliable sources · Institutions and society',
      techFocus: 'Coding with AI · Small tools · Everyday use',
      readingFocus: 'English · Reading · Exploring the world',
      strategyFocus: 'Victoria 3 · Stellaris · Hearts of Iron IV',
      historyBody: 'I’m especially interested in modern history: why events happen and how institutions shape society. When I read a claim, I look at where the sources come from, how reliable they are, and how other accounts compare.',
      techBody: 'I enjoy coding with help from AI to make small tools. When something goes wrong, I look things up, change the code, and try it again. Making something useful is part of the fun.',
      readingBody: 'I’m learning English and enjoy finding different views through reading, including ideas about philosophy, economics, and personal choices. I’d also like to travel to more places and see the world beyond books and screens.',
      strategyBody: 'I like strategy games such as Victoria 3, Stellaris, and Hearts of Iron IV. I enjoy managing things, making choices, and seeing their effects over time. Questions from these games also lead me to read more about history and institutions.',
      interestsToProjects: 'See what I’ve made',
      interestsMetaDescription: 'My interests include modern history, reliable sources, institutions and society, coding with AI, reading, strategy games, and travel.',
      contactPageTitle: 'Contact · Freeze’s Nest',
      contactPageHeading: 'Get in touch',
      contactPageLead: 'Want to talk about history, technology, or games? Feel free to get in touch.',
      contactEmailNote: 'You’re welcome to send me an email.',
      contactGithubNote: 'Things I make and their source code.',
      contactXNote: 'You can also find me on X.',
      contactWhatsAppNote: 'Copy the handle to find me.',
      contactElsewhereTitle: 'Keep exploring',
      contactElsewhereBody: 'You can also look around my interests and projects.',
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
      intro: 'I like reading history, exploring technology, and playing strategy games.',
      history: 'History',
      politics: 'Politics',
      technology: 'Technology',
      philosophy: 'Philosophy',
      economics: 'Economics',
      mottoTranslation: 'History earns trust through faithful records.',
      projectsTitle: 'Projects',
      projectsIntro: 'Public projects on GitHub.',
      themeDescription: 'codex-theme is a glass-style theme I made for Codex on macOS, with custom wallpapers and adjustable transparency.',
      websiteDescription: 'Freeze-s-life is the source of this website, where I share a little about myself, my interests, and my projects.',
      viewProject: 'View on GitHub',
      newTab: '(opens in a new tab)',
      stackAria: 'Technology stack',
      interestsTitle: 'Interests & curiosities',
      interestsAria: 'Interests',
      interestsIntro: 'A few things that keep me curious.',
      historyPoliticsTitle: 'History and society',
      historyPoliticsDescription: 'Exploring society and institutions through history and political questions.',
      technologyTitle: 'Technology & programming',
      technologyDescription: 'Following technology and exploring ideas through programming.',
      readingTitle: 'Books and places',
      readingDescription: 'Exploring philosophy and economics through reading and reflection.',
      strategyTitle: 'Strategy games',
      strategyDescription: 'Enjoying the interplay of rules, choices, and trade-offs.',
      programming: 'Programming',
      reading: 'Reading',
      strategyGames: 'Strategy games',
      contactTitle: 'Contact',
      contactIntro: 'My email and accounts:',
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
