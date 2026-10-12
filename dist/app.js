'use strict';

(() => {
  const routes = new Set(['home', 'about', 'creations']);
  const views = [...document.querySelectorAll('[data-view]')];
  const routeLinks = [...document.querySelectorAll('[data-route]')];
  const menu = document.getElementById('menu-dialog');
  const project = document.getElementById('project-dialog');
  const dialogs = [menu, project];
  const menuButton = document.getElementById('menu-button');
  let currentRoute;

  function closeDialogs() {
    for (const dialog of dialogs) if (dialog.open) dialog.close();
    document.body.classList.remove('dialog-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  function showDialog(dialog) {
    closeDialogs();
    dialog.showModal();
    document.body.classList.add('dialog-open');
    if (dialog === menu) menuButton.setAttribute('aria-expanded', 'true');
  }

  function renderRoute(focusContent = true) {
    const hash = window.location.hash.slice(1);
    if (hash === 'content') return;
    const route = routes.has(hash) ? hash : 'home';
    closeDialogs();
    views.forEach(view => { view.hidden = view.dataset.view !== route; });
    routeLinks.forEach(link => {
      if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const changed = currentRoute !== route;
    currentRoute = route;
    document.title = route === 'home' ? 'Wynn Freeze · 个人空间' : `${route === 'about' ? '关于我' : '探索与创作'} · Wynn Freeze`;
    if (changed) window.scrollTo({ top: 0, behavior: 'instant' });
    if (focusContent && changed) {
      const heading = document.querySelector(`[data-view="${route}"] h1`);
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  routeLinks.forEach(link => link.addEventListener('click', () => {
    closeDialogs();
    if (window.location.hash === `#${link.dataset.route}`) {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }));
  menuButton.addEventListener('click', () => showDialog(menu));
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => showDialog(project)));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closeDialogs));
  dialogs.forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });
  window.addEventListener('hashchange', () => renderRoute());
  renderRoute(false);
})();
