'use strict';
window.WusoolUI = (() => {
  let chain = Promise.resolve();
  const readyHandlers = [];
  let started = false;
  const listeners = new WeakMap();
  const activeEventLocks = new WeakMap();
  const routes = window.WusoolConstants.routes;
  const root = location.pathname.replace(/\/(?:visitor|user|org|admin)\/html\/.*$/, '');
  const escape = (x) =>
    String(x ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  function message(text, type = 'danger') {
    let node = document.getElementById('wusoolServiceStatus');
    if (!node) {
      node = document.createElement('div');
      node.id = 'wusoolServiceStatus';
      node.className = 'alert m-3';
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      document.body.prepend(node);
    }
    node.className = `alert alert-${type} m-3`;
    node.textContent = text;
  }
  function error(e) {
    document.documentElement.style.visibility = '';
    console.error(e);
    message(e.message || 'Unable to complete this operation.');
    if (['UNAUTHENTICATED', 'ACCOUNT_BLOCKED', 'SESSION_EXPIRED'].includes(e.code)) redirectLogin();
  }
  function redirectLogin() {
    const section = location.pathname.includes('/org/')
        ? 'org'
        : location.pathname.includes('/admin/')
          ? 'admin'
          : 'visitor',
      login =
        section === 'org'
          ? 'organization-login.html'
          : section === 'admin'
            ? 'admin-login.html'
            : 'login.html';
    if (location.pathname.endsWith('/' + login)) return;
    location.replace(
      root +
        '/' +
        section +
        '/html/' +
        login +
        '?returnTo=' +
        encodeURIComponent(location.pathname + location.search),
    );
  }
  function destination(value, role) {
    const fallback =
      root +
      (role === 'Organization'
        ? '/org/html/organization-dashboard.html'
        : role === 'Admin'
          ? '/admin/html/admin-dashboard.html'
          : '/user/html/user-dashboard.html');
    if (!value) return fallback;
    try {
      const url = new URL(value, location.origin);
      if (url.origin !== location.origin || url.username || url.password || /[\\]/.test(value))
        return fallback;
      const sections =
        role === 'Organization'
          ? ['org', 'visitor']
          : role === 'Admin'
            ? ['admin', 'visitor']
            : ['user', 'visitor'];
      if (
        !sections.some((s) => url.pathname.startsWith(root + '/' + s + '/html/')) ||
        !routes.includes(url.pathname.slice(root.length)) ||
        /login|register/.test(url.pathname)
      )
        return fallback;
      return url.pathname + url.search;
    } catch {
      return fallback;
    }
  }
  async function guard() {
    const path = location.pathname,
      section = path.match(/\/(user|org|admin)\/html\//)?.[1];
    if (!section || /login|register|forgot-password|reset-password/.test(path)) return true;
    const a = await WusoolServices.getCurrentAccount();
    if (!a) {
      redirectLogin();
      return false;
    }
    if (a.requiresInitialSetup) {
      redirectLogin();
      return false;
    }
    const role = { user: 'User', org: 'Organization', admin: 'Admin' }[section];
    if (a.role !== role) {
      message('This page requires a different account role.');
      return false;
    }
    if(role==='Organization'){
      const access=await WusoolServices.getOrganizationAccess();
      if(access.state==='representative-required') {message(access.message);return false;}
    }
    return true;
  }
  async function completeFirstLogin(account, temporaryPassword) {
    if (!account.requiresInitialSetup) return true;
    const ar = document.documentElement.lang === 'ar';
    const t = (arabic, english) => (ar ? arabic : english);
    return new Promise((resolve) => {
      const previous = document.activeElement;
      const dialog = document.createElement('dialog');
      dialog.className = 'wusool-initial-dialog';
      dialog.setAttribute('aria-labelledby', 'initialSetupTitle');
      dialog.innerHTML = `<form><h2 id="initialSetupTitle">${t('إنشاء كلمة مرور جديدة', 'Create your new password')}</h2><p>${t('قبل الدخول لحسابك، استبدل كلمة المرور المؤقتة بكلمة خاصة بك.', 'Replace your temporary password before continuing to your account.')}</p><label for="initialNewPassword">${t('كلمة المرور الجديدة', 'New password')}</label><input class="form-control" id="initialNewPassword" type="password" autocomplete="new-password" required minlength="6"><label for="initialConfirmPassword">${t('تأكيد كلمة المرور', 'Confirm password')}</label><input class="form-control" id="initialConfirmPassword" type="password" autocomplete="new-password" required><small>${t('٦ أحرف على الأقل، حرف كبير، رقم، و @ أو _', '6+ characters, an uppercase letter, a number, and @ or _')}</small><p data-error role="alert"></p><div class="initial-actions"><button type="button" class="btn btn-outline-secondary" data-cancel>${t('إلغاء الدخول', 'Cancel sign in')}</button><button type="submit" class="btn btn-wusool">${t('حفظ ومتابعة', 'Save and continue')}</button></div></form>`;
      document.body.appendChild(dialog);
      const form = dialog.querySelector('form'),
        password = dialog.querySelector('#initialNewPassword'),
        confirm = dialog.querySelector('#initialConfirmPassword'),
        error = dialog.querySelector('[data-error]'),
        submit = dialog.querySelector('[type="submit"]');
      let busy = false;
      const finish = (value) => {
        dialog.close();
        dialog.remove();
        previous?.focus();
        resolve(value);
      };
      const cancel = async () => {
        if (busy) return;
        try {
          await WusoolServices.logout();
        } catch (e) {
          error.textContent = e.message;
        } finally {
          finish(false);
        }
      };
      dialog.querySelector('[data-cancel]').addEventListener('click', cancel);
      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        cancel();
      });
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (busy || !form.reportValidity()) return;
        error.textContent = '';
        if (password.value !== confirm.value) {
          error.textContent = t('كلمتا المرور غير متطابقتين.', 'Passwords do not match.');
          return;
        }
        busy = true;
        submit.disabled = true;
        try {
          await WusoolServices.changeInitialPassword(temporaryPassword, password.value);
          finish(true);
        } catch (e) {
          error.textContent = e.message;
          busy = false;
          submit.disabled = false;
        }
      });
      dialog.showModal();
      password.focus();
    });
  }
  function enqueue(fn) {
    chain = chain.then(async () => {
      try {
        await fn();
      } catch (e) {
        error(e);
      }
    });
    return chain;
  }
  function ready(fn) {
    if (started) enqueue(fn);
    else readyHandlers.push(fn);
  }
  async function start() {
    document.body.setAttribute('aria-busy', 'true');
    await chain;
    started = true;
    for (const fn of readyHandlers) await enqueue(fn);
    document.body.setAttribute('aria-busy', 'false');
    window.dispatchEvent(new CustomEvent('wusool:ready'));
  }
  document.addEventListener('DOMContentLoaded', start, { once: true });
  function listen(target, type, fn, options) {
    if (!target || !fn) return;
    const registered = listeners.get(target) || new Map();
    const handlers = registered.get(type) || new Set();
    if (handlers.has(fn)) return;
    handlers.add(fn);
    registered.set(type, handlers);
    listeners.set(target, registered);
    const handlerToken={};
    target.addEventListener(
      type,
      async function (event) {
        const lock =
          type === 'submit'
            ? this
            : type === 'click'
              ? event.target.closest?.('button') || this
              : null;
        // Share one lock across listeners handling the SAME dispatch. A delegated
        // observer must not suppress an unrelated action simply by running first.
        let record=lock?activeEventLocks.get(lock):null;
        if(record&&record.event!==event||!record&&lock?.dataset?.wusoolBusy==='true'){
          event.preventDefault();return;
        }
        if(!record){
          const buttons=type==='submit'?Array.from(this.querySelectorAll('button[type="submit"],input[type="submit"]')):lock?.tagName==='BUTTON'?[lock]:[];
          record={event,count:0,seen:new Set(),buttons,states:buttons.map(b=>b.disabled),labels:buttons.map(b=>b.innerHTML)};
          if(lock)activeEventLocks.set(lock,record);
          if(lock?.dataset)lock.dataset.wusoolBusy='true';
          buttons.forEach(b=>b.disabled=true);
        }
        if(record.seen.has(handlerToken)){event.preventDefault();return;}
        record.seen.add(handlerToken);record.count++;
        const {buttons,states,labels}=record;
        if(type==='submit')event.preventDefault();
        try {
          await fn.call(this, event);
        } catch (e) {
          buttons.forEach((b, i) => html(b, labels[i]));
          if (type === 'submit') validation(this, e);
          error(e);
        } finally {
          if(--record.count===0){if(lock?.dataset)delete lock.dataset.wusoolBusy;if(lock)activeEventLocks.delete(lock);buttons.forEach((b,i)=>b.disabled=states[i]);}
        }
      },
      options,
    );
  }
  function validation(form, error) {
    for (const [key, messages] of Object.entries(error.fields || {})) {
      const field = Array.from(form.elements || []).find(
        (node) => (node.name || node.id || '').toLowerCase() === key.split('.').pop().toLowerCase(),
      );
      if (field) {
        field.setCustomValidity(Array.isArray(messages) ? messages.join(' ') : String(messages));
        field.reportValidity();
        field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
      }
    }
  }
  function html(node, value) {
    const template = document.createElement('template');
    template.innerHTML = String(value ?? '');
    template.content
      .querySelectorAll('script,iframe,object,embed,base,meta,link')
      .forEach((x) => x.remove());
    template.content.querySelectorAll('*').forEach((x) => {
      for (const a of [...x.attributes]) {
        if (
          /^on/i.test(a.name) ||
          a.name === 'srcdoc' ||
          (['href', 'src', 'action', 'formaction'].includes(a.name) &&
            /^\s*(javascript|vbscript|data:text\/html):/i.test(a.value))
        )
          x.removeAttribute(a.name);
      }
    });
    node.replaceChildren(template.content);
  }
  window.addEventListener('wusool:auth-error', () => {
    if (/\/(user|org|admin)\/html\//.test(location.pathname)) redirectLogin();
  });
  window.addEventListener('wusool:session-changed', () => {
    if (
      /\/(user|org|admin)\/html\//.test(location.pathname) &&
      WusoolServices.mode === 'local' &&
      !WusoolServices.hasLocalSession() &&
      !/login|register|forgot-password|reset-password/.test(location.pathname)
    )
      redirectLogin();
  });

  document.addEventListener('change', (e) => {
    if (e.target.type === 'file' && e.target.files.length) {
      message(
        WusoolServices.mode === 'local'
          ? 'Selected files are local previews. No server upload occurred.'
          : 'Selected files are previews until the server confirms an upload.',
        'info',
      );
    }
  });
  ready(() => {
    if (WusoolServices.mode === 'local')
      message(
        'Local development mode — records belong to this browser. Payments, email and real AI require backend configuration. Branch analysis has a labelled local demo.',
        'info',
      );
  });
  async function mapAsync(items, fn) {
    return Promise.all(Array.from(items).map(fn));
  }
  async function each(items, fn) {
    for (const [i, x] of Array.from(items).entries()) await fn(x, i);
  }
  async function filterAsync(items, fn) {
    const xs = Array.from(items),
      flags = await mapAsync(xs, fn);
    return xs.filter((_, i) => flags[i]);
  }
  async function findAsync(items, fn) {
    for (const x of items) if (await fn(x)) return x;
  }
  async function someAsync(items, fn) {
    return Boolean(await findAsync(items, fn));
  }
  async function everyAsync(items, fn) {
    for (const x of items) if (!(await fn(x))) return false;
    return true;
  }
  async function reduceAsync(items, fn, initial) {
    let v = initial;
    for (const [i, x] of Array.from(items).entries()) v = await fn(v, x, i);
    return v;
  }
  function insertHTML(node, position, value) {
    const holder = document.createElement('div');
    html(holder, value);
    node.insertAdjacentHTML(position, holder.innerHTML);
  }
  async function prepareExternalScreen(kind) {
    return window.WusoolExternalScreen(kind);
  }
  return {
    prepareExternalScreen,
    completeFirstLogin,
    enqueue,
    ready,
    listen,
    guard,
    error,
    message,
    escape,
    html,
    insertHTML,
    destination,
    root,
    mapAsync,
    each,
    filterAsync,
    findAsync,
    someAsync,
    everyAsync,
    reduceAsync,
  };
})();
