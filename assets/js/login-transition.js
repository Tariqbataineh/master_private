WusoolUI.enqueue(async () => {
  /* Shared post-authentication UI. Authentication/session ownership stays in each form. */
  (() => {
    'use strict';

    const assetURL = new URL('../images/login-journey.svg', document.currentScript.src).href;
    let active = null;
    async function start(destination, {
      onCancel = () => {}
    } = {}) {
      if (active) return;
      const url = new URL(destination, location.href);
      if (url.origin !== location.origin) throw new Error('Invalid dashboard destination.');
      const overlay = document.createElement('div');
      overlay.className = 'wusool-login-transition';
      overlay.lang = 'en';
      overlay.setAttribute('translate', 'no');
      WusoolUI.html(overlay, `<div class="wlt-content"><div class="wlt-brand" aria-hidden="true">Wusool<span>.</span></div><img class="wlt-illustration" src="${assetURL}" alt="" aria-hidden="true" width="420" height="260"><div class="wlt-status" role="status" aria-live="polite" aria-atomic="true"></div><p class="wlt-error" role="alert" hidden></p><div class="wlt-actions" hidden><button type="button">Retry dashboard</button><button type="button">Back to login</button></div></div>`);
      const previousFocus = document.activeElement;
      const siblings = [...document.body.children].filter(el => !['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName)).map(el => [el, el.inert]);
      siblings.forEach(([el]) => {
        el.inert = true;
      });
      document.body.appendChild(overlay);
      document.body.classList.add('wlt-open');
      const status = overlay.querySelector('.wlt-status'),
        error = overlay.querySelector('.wlt-error'),
        actions = overlay.querySelector('.wlt-actions');
      const [retry, back] = actions.querySelectorAll('button');
      let timer = null,
        controller = null,
        generation = 0;
      const close = () => {
        generation++;
        clearTimeout(timer);
        controller?.abort();
        overlay.remove();
        siblings.forEach(([el, inert]) => {
          el.inert = inert;
        });
        document.body.classList.remove('wlt-open');
        active = null;
        onCancel();
        previousFocus?.focus();
      };
      const fail = () => {
        clearTimeout(timer);
        controller?.abort();
        status.setAttribute('aria-live', 'off');
        status.querySelector('p').textContent = 'Your account is signed in.';
        error.textContent = 'Your login succeeded, but we couldn’t open your destination. Please retry or return to login.';
        error.hidden = false;
        actions.hidden = false;
        retry.disabled = false;
        retry.focus();
      };
      async function navigate() {
        const attempt = ++generation;
        clearTimeout(timer);
        controller?.abort();
        controller = new AbortController();
        error.hidden = true;
        actions.hidden = true;
        retry.disabled = true;
        const message = status.querySelector('p');
        if (message) message.textContent = 'Preparing your experience…';
        // Give the browser a paint opportunity, without a showcase delay.
        await new Promise(resolve => {
          const fallback = setTimeout(resolve, 100);
          requestAnimationFrame(() => requestAnimationFrame(() => {
            clearTimeout(fallback);
            resolve();
          }));
        });
        timer = setTimeout(() => {
          if (attempt === generation) {
            generation++;
            fail();
          }
        }, 6000);
        try {
          const response = await fetch(url.href, {
            method: 'HEAD',
            credentials: 'same-origin',
            signal: controller.signal,
            cache: 'no-store'
          });
          if (!response.ok && response.status !== 405) throw new Error('Destination unavailable');
          if (attempt !== generation) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            if (attempt === generation) {
              generation++;
              fail();
            }
          }, 8000);
          window.location.assign(url.href);
        } catch (_) {
          if (WusoolServices.mode === "api") throw _;
          if (attempt === generation) {
            generation++;
            fail();
          }
        }
      }
      WusoolUI.listen(retry, 'click', navigate);
      WusoolUI.listen(back, 'click', close);
      active = {
        close
      };
      // Insert one live-region update after it is mounted; retries don't reannounce it.
      WusoolUI.html(status, '<h1>Welcome to Wusool.</h1><p>Preparing your experience…</p>');
      await navigate();
    }
    window.WusoolLoginTransition = Object.freeze({
      start
    });
    addEventListener('pageshow', event => {
      if (event.persisted && active) active.close();
    });
  })();
});
