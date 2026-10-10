'use strict';
// Browser persistence is a development adapter, never an API identity source.
window.WusoolStorage = (() => {
  const port = (storage) => ({
    getItem: (key) => storage.getItem(key),
    setItem: (key, value) => storage.setItem(key, value),
    removeItem: (key) => storage.removeItem(key),
  });
  const local = port(localStorage),
    session = port(sessionStorage);
  function businessSignature() {
    if (window.WusoolApiConfig.mode !== 'local') return null;
    try {
      const data = JSON.parse(local.getItem('wusool.database.v2') || '{}');
      return JSON.stringify(
        Object.fromEntries(
          Object.entries(data).filter(
            ([key]) => !['drafts', 'settings', 'credentials'].includes(key),
          ),
        ),
      );
    } catch {
      return null;
    }
  }
  return Object.freeze({ local, session, businessSignature });
})();
