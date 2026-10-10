'use strict';
(() => {
  if (window.WusoolTheme) return;
  const key = 'wusool-color-mode',
    system = matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system',
    transition = null;
  try {
    const saved = localStorage.getItem(key);
    if (['light', 'dark', 'system'].includes(saved)) preference = saved;
  } catch {}
  const resolve = () =>
    preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
  const apply = () => {
    document.documentElement.dataset.wusoolColorMode = resolve();
    document.documentElement.dataset.wusoolThemePreference = preference;
  };
  apply();
  system.addEventListener('change', () => {
    if (preference === 'system') apply();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === key) {
      preference = ['light', 'dark', 'system'].includes(e.newValue) ? e.newValue : 'system';
      apply();
    }
  });
  window.WusoolTheme = {
    get preference() {
      return preference;
    },
    get mode() {
      return resolve();
    },
    set(value, origin) {
      if (!['light', 'dark', 'system'].includes(value)) return Promise.resolve();
      preference = value;
      try {
        localStorage.setItem(key, value);
      } catch {}
      if (transition) transition.skipTransition();
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (
        !document.startViewTransition ||
        reduced ||
        document.body?.classList.contains('high-contrast')
      ) {
        apply();
        return Promise.resolve();
      }
      const rect = origin?.getBoundingClientRect(),
        x = rect ? rect.left + rect.width / 2 : innerWidth / 2,
        y = rect ? rect.top + rect.height / 2 : innerHeight / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const root = document.documentElement;
      root.style.setProperty('--wxi-circle-x', x + 'px');
      root.style.setProperty('--wxi-circle-y', y + 'px');
      root.style.setProperty('--wxi-circle-radius', radius + 'px');
      const t = document.startViewTransition(apply);
      transition = t;
      return t.finished
        .catch(() => {})
        .finally(() => {
          if (transition === t) transition = null;
        });
    },
  };
})();
