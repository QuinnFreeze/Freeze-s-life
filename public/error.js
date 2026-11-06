'use strict';

(() => {
  const code = Number(document.body.dataset.errorCode);
  const messages = {
    zh: {
      400: ['请求无法处理', '请检查链接，或从首页继续浏览。'],
      403: ['暂时无法访问', '你可以返回首页，继续浏览其他公开内容。'],
      404: ['页面不存在', '这个链接可能已变更，或文章尚未发布。你可以返回首页或浏览文章列表。'],
      405: ['请求方式不受支持', '请使用页面中的链接继续浏览。'],
      413: ['提交的内容过大', '请缩小文件或内容后重试。'],
      429: ['请求过于频繁', '请稍等片刻后重试。'],
      fallback: ['页面暂时无法打开', '请稍后重试，或从首页继续浏览。'],
    },
    en: {
      400: ['Unable to process this request', 'Check the link or continue from the homepage.'],
      403: ['This page is unavailable', 'Return home to browse other public content.'],
      404: ['Page not found', 'The link may have changed, or the article may not be published yet. Return home or browse the articles.'],
      405: ['Request method not supported', 'Use the links on this page to continue browsing.'],
      413: ['The submission is too large', 'Use a smaller file or shorten the content and try again.'],
      429: ['Too many requests', 'Please wait a moment and try again.'],
      fallback: ['Unable to open this page', 'Please try again later or return home.'],
    },
  };
  function render() {
    const dictionary = document.documentElement.lang === 'en' ? messages.en : messages.zh;
    const [title, message] = dictionary[code] || dictionary.fallback;
    document.querySelector('[data-error-title]').textContent = title;
    document.querySelector('[data-error-message]').textContent = message;
    document.title = `${code} · ${title} · Freeze’s Nest`;
  }
  document.addEventListener('site-language-change', render);
  render();
})();
