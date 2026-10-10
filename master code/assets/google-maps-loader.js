'use strict';
window.WusoolMapsLoader = (() => {
  let loading = null,
    failed = false;
  const libraries = new Map(),
    subscribers = new Set();
  const error = (code) => Object.assign(new Error(code), { code });
  const emit = (code) => {
    failed = true;
    subscribers.forEach((fn) => fn(error(code)));
  };
  const load = () => {
    if (failed) return Promise.reject(error('MAP_AUTH_FAILED'));
    if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
    if (loading) return loading;
    const key = window.WusoolApiConfig?.googleMapsJavaScriptKey;
    if (!key) return Promise.reject(error('MAP_KEY_MISSING'));
    loading = new Promise((resolve, reject) => {
      let complete = false;
      const finish = (err) => {
        if (complete) return;
        complete = true;
        clearTimeout(timer);
        err ? reject(err) : resolve(window.google.maps);
      };
      const timer = setTimeout(() => finish(error('MAP_LOAD_TIMEOUT')), 15000);
      const prior = window.gm_authFailure;
      window.gm_authFailure = () => {
        emit('MAP_AUTH_FAILED');
        finish(error('MAP_AUTH_FAILED'));
        if (prior) prior();
      };
      window.WusoolMapsLoaded = () =>
        window.google?.maps?.importLibrary ? finish() : finish(error('MAP_LOAD_FAILED'));
      const existing = document.querySelector('script[data-wusool-google-loader]');
      if (existing) return;
      const script = document.createElement('script');
      script.dataset.wusoolGoogleLoader = 'true';
      script.async = true;
      script.src =
        'https://maps.googleapis.com/maps/api/js?' +
        new URLSearchParams({
          key,
          loading: 'async',
          callback: 'WusoolMapsLoaded',
          v: 'weekly',
          language: document.documentElement.lang === 'ar' ? 'ar' : 'en',
          region: 'JO',
        });
      script.onerror = () => finish(error('MAP_NETWORK_ERROR'));
      document.head.append(script);
    });
    return loading;
  };
  const library = (name) => {
    if (!libraries.has(name))
      libraries.set(
        name,
        load().then((m) => m.importLibrary(name)),
      );
    return libraries.get(name);
  };
  return {
    load,
    library,
    onFailure(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
})();
