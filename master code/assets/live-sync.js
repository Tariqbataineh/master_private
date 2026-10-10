'use strict';
window.WusoolLive = (() => {
  if (/(?:login|register|forgot-password|reset-password)\.html$/.test(location.pathname))
    return { watch: () => () => {}, refresh: () => {}, saved: () => {} };
  const watches = new Map(),
    key = 'wusool.database.v2',
    restoreKey = 'wusool.live-view:' + location.pathname + location.search;
  let timer = null,
    pending = false,
    editing = false,
    last = null,
    stopped = false;
  const signature = () => window.WusoolServices.localRevision();
  last = signature();
  const isFilter = (n) =>
    n?.type === 'search' || /search|filter|sort/i.test(n?.id || n?.name || '');
  const blocked = () =>
    document.querySelector('dialog[open],.modal.show,[data-wusool-busy="true"]') || editing;
  const report = (error) => window.WusoolUI?.error(error);
  async function run(entry) {
    if (entry.running) {
      entry.again = true;
      return;
    }
    entry.running = true;
    try {
      do {
        entry.again = false;
        await entry.fn();
      } while (entry.again && !stopped);
    } catch (e) {
      report(e);
    } finally {
      entry.running = false;
    }
  }
  function preserve() {
    const fields = {};
    document.querySelectorAll('input,select').forEach((n) => {
      if (n.id && isFilter(n)) fields[n.id] = n.value;
    });
    sessionStorage.setItem(restoreKey, JSON.stringify({ fields, scroll: window.scrollY || 0 }));
  }
  function flush() {
    clearTimeout(timer);
    timer = null;
    if (stopped) return;
    if (watches.size) {
      pending = false;
      for (const entry of watches.values()) run(entry);
      return;
    }
    if (!pending || blocked()) return;
    pending = false;
    preserve();
    location.reload();
  }
  function schedule() {
    pending = true;
    clearTimeout(timer);
    timer = setTimeout(flush, 180);
  }
  function changed(force = false) {
    const next = signature();
    if (next === last && (!force || !watches.size)) return;
    last = next;
    schedule();
  }
  function watch(name, fn) {
    const entry = { fn, running: false, again: false };
    watches.set(name, entry);
    return () => watches.delete(name);
  }
  document.addEventListener('input', (e) => {
    if (!isFilter(e.target) && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))
      editing = true;
  });
  document.addEventListener('change', (e) => {
    if (!isFilter(e.target) && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))
      editing = true;
  });
  document.addEventListener('reset', () => {
    editing = false;
    setTimeout(flush, 0);
  });
  document.addEventListener('hidden.bs.modal', () => {
    editing = false;
    flush();
  });
  document.addEventListener('close', () => flush(), true);
  window.addEventListener('wusool:data-changed', () => changed());
  window.addEventListener('storage', (e) => {
    if (e.key === key || e.key === null) changed();
  });
  window.addEventListener('focus', () => changed(true));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) changed(true);
  });
  let apiRevision = null;
  const poll = setInterval(async () => {
    if (document.hidden || stopped) return;
    if (window.WusoolServices?.mode === 'api') {
      if (watches.size) {
        schedule();
        return;
      }
      try {
        const value = await WusoolServices.request('/sync/revision');
        if (value?.revision != null) {
          if (apiRevision !== null && apiRevision !== value.revision) schedule();
          apiRevision = value.revision;
        }
      } catch {
        /* optional backend revision endpoint; no local fallback */
      }
    } else {
      try {
        if (window.WusoolServices?.visits && (await window.WusoolServices.getCurrentAccount()))
          await window.WusoolServices.visits.process();
      } catch {
        /* Session/login handling stays with the page guard. */
      }
      changed();
      if (pending) flush();
    }
  }, 10000);
  window.addEventListener(
    'pagehide',
    () => {
      stopped = true;
      clearTimeout(timer);
      clearInterval(poll);
    },
    { once: true },
  );
  window.WusoolUI?.ready(() => {
    let saved;
    try {
      saved = JSON.parse(sessionStorage.getItem(restoreKey) || 'null');
    } catch {}
    sessionStorage.removeItem(restoreKey);
    if (saved)
      setTimeout(() => {
        for (const [id, value] of Object.entries(saved.fields || {})) {
          const n = document.getElementById(id);
          if (n) {
            n.value = value;
            n.dispatchEvent(
              new Event(n.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }),
            );
          }
        }
        window.scrollTo(0, saved.scroll || 0);
      }, 100);
  });
  return {
    watch,
    refresh: () => changed(true),
    saved: () => {
      editing = false;
      flush();
    },
  };
})();
