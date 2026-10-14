'use strict';

(() => {
  const translations = {
    zh: {
      siteTitle: 'Freeze’s Nest · 秋易的小窝',
      nestSubtitle: '秋易的小窝',
      nestWelcome: '欢迎来到我的数字小窝。',
      nestDescription: '这里放着我的兴趣、公开作品与联系入口。',
      skip: '跳到内容',
      navigation: '页面导航',
      navHome: '首页',
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
      siteTitle: 'Freeze’s Nest · Quinn Freeze',
      nestSubtitle: 'A personal digital space',
      nestWelcome: 'Welcome to my little corner of the web.',
      nestDescription: 'A place for my interests, public projects, and ways to get in touch.',
      skip: 'Skip to content',
      navigation: 'Page navigation',
      navHome: 'Home',
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
