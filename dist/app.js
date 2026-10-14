'use strict';

(() => {
  const button = document.getElementById('copy-whatsapp');
  const handle = document.getElementById('whatsapp-handle');
  const status = document.getElementById('contact-status');
  const clipboard = navigator.clipboard;

  if (!button || !handle || !status || !clipboard || typeof clipboard.writeText !== 'function') return;

  button.hidden = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = '';

    try {
      await clipboard.writeText(handle.textContent.trim());
      status.textContent = 'WhatsApp 账号已复制';
    } catch {
      status.textContent = '无法自动复制，请手动选中并复制 WhatsApp 账号 @xiaoqiuyi。';
    } finally {
      button.disabled = false;
    }
  });
})();
