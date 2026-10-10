'use strict';
// Composition root. Business controllers retain one asynchronous public boundary.
window.WusoolServices = (() => {
  if (window.WusoolServices) return window.WusoolServices;
  const ctx = { storage: window.WusoolStorage };
  ctx.request = async (path, options) => {
    try {
      return ctx.safe(await window.WusoolHttp.request(path, options));
    } catch (error) {
      if (['ACCOUNT_BLOCKED', 'UNAUTHENTICATED', 'SESSION_EXPIRED'].includes(error.code)) {
        ctx.clearSession();
        window.dispatchEvent(
          new CustomEvent('wusool:auth-error', { detail: { code: error.code } }),
        );
      }
      throw error;
    }
  };
  for (const register of window.WusoolServiceModules) register(ctx);
  ctx.api.localRevision = () => window.WusoolStorage.businessSignature();
  ctx.api.hasLocalSession = () => Boolean(ctx.session());
  if (ctx.cfg.mode === 'api' && typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('wusool-api-auth');
    let channelClosed = false;
    for (const event of ['wusool:account-changed', 'wusool:session-changed'])
      window.addEventListener(event, () => {
        if (!channelClosed) channel.postMessage({ type: event });
      });
    channel.onmessage = () => {
      window.WusoolHttp.invalidate();
      window.dispatchEvent(
        new CustomEvent('wusool:auth-error', { detail: { code: 'SESSION_CHANGED' } }),
      );
    };
    window.addEventListener(
      'pagehide',
      () => {
        channelClosed = true;
        channel.close();
      },
      { once: true },
    );
  }
  return Object.freeze(ctx.api);
})();
