/* ORG-6: remove duplicate page titles without replacing controls or their handlers. */
(function () {
  'use strict';
  function unify() {
    const main = document.querySelector('main.organization-content, main.organization-main, main.organization-main-content');
    if (!main) return;
    const header = main.querySelector(':scope > .organization-header');
    const heading = main.querySelector('.page-heading');
    if (!header || !heading || header.dataset.org6Processed) return;
    const title = heading.querySelector('h1,h2,h3');
    if (!title) return; // Never remove a header if there is no replacement title.
    const actions = Array.from(header.children).filter(el => el.matches('a,button') && !el.matches('.sidebar-toggle'));
    const toggle = header.querySelector('.sidebar-toggle');
    if (toggle) {
      toggle.classList.remove('d-lg-none');
      toggle.classList.add('org6-mobile-menu');
      toggle.style.display = '';
      heading.insertBefore(toggle, heading.firstChild);
    }
    if (actions.length) {
      const slot = document.createElement('div');
      slot.className = 'org6-header-actions';
      slot.setAttribute('aria-label', 'Page actions');
      actions.forEach(action => slot.appendChild(action));
      heading.appendChild(slot);
    }
    heading.classList.add('org6-unified-heading');
    header.dataset.org6Processed = 'true';
    header.remove();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', unify);
  else unify();
})();
