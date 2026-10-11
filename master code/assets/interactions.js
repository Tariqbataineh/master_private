'use strict';
(() => {
  if (window.WusoolInteractions) return;
  const pad = (n) => String(n).padStart(2, '0');
  const dateValue = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null;
    const [y, m, d] = s.split('-').map(Number),
      v = new Date(y, m - 1, d, 12);
    return dateValue(v) === s ? v : null;
  };
  const add = (s, days) => {
    const d = parse(s);
    d.setDate(d.getDate() + days);
    return dateValue(d);
  };
  const ordered = (a, b) => (a <= b ? [a, b] : [b, a]);
  const allowed = (v, input) =>
    Boolean(parse(v)) &&
    (!input.min || v >= input.min) &&
    (!input.max || v <= input.max) &&
    !(input.dataset.unavailableDates || '').split(',').includes(v) &&
    !input.disabled &&
    !input.readOnly;
  const text = (key, values = {}) => {
    const lang =
      document.documentElement.lang?.startsWith('ar') || document.documentElement.dir === 'rtl'
        ? 'ar'
        : 'en';
    let s = window.WusoolInteractionCopy[lang][key] || key;
    for (const [k, v] of Object.entries(values)) s = s.replace('{' + k + '}', v);
    return s;
  };
  const locale = () => (document.documentElement.dir === 'rtl' ? 'ar-JO' : 'en-GB');
  const el = (tag, cls, content) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (content != null) n.textContent = content;
    return n;
  };
  const button = (label, fn) => {
    const b = el('button', 'wxi-button', text(label));
    b.type = 'button';
    b.dataset.wxiCopy = label;
    b.addEventListener('click', fn);
    return b;
  };
  const dispatch = (input) => {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  let sequence = 0;
  function calendar(input, end) {
    if (input.dataset.wxiCalendar) return;
    input.dataset.wxiCalendar = 'true';
    if (end) end.dataset.wxiCalendar = 'true';
    const host = el('div', 'wxi-calendar'),
      toggle = button('calendar', () => open()),
      dialog = el('div', 'wxi-calendar-dialog'),
      head = el('div', 'wxi-calendar-head'),
      title = el('strong'),
      weekdays = el('div', 'wxi-weekdays'),
      grid = el('div', 'wxi-calendar-grid'),
      summary = el('p', 'wxi-calendar-summary'),
      footer = el('div', 'wxi-calendar-footer');
    dialog.id = 'wxi-calendar-' + ++sequence;
    dialog.hidden = true;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'false');
    toggle.setAttribute('aria-controls', dialog.id);
    toggle.setAttribute('aria-expanded', 'false');
    grid.setAttribute('role', 'grid');
    summary.setAttribute('aria-live', 'polite');
    let month = parse(input.value) || parse(input.min) || new Date(),
      start = input.value,
      finish = end?.value || '',
      hover = '',
      cursor = start || dateValue(new Date()),
      selectingEnd = false;
    const format = (v) =>
      parse(v)?.toLocaleDateString(locale(), { year: 'numeric', month: 'short', day: 'numeric' }) ||
      '';
    const write = (node, value) => {
      node.value = value;
      dispatch(node);
    };
    const close = (focus) => {
      dialog.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      hover = '';
      if (focus) toggle.focus();
    };
    function pick(v) {
      if (!allowed(v, selectingEnd && end ? end : input)) return;
      if (end) {
        if (selectingEnd) {
          const [a, b] = ordered(start, v);
          if (!allowed(a, input) || !allowed(b, end)) return;
          write(input, a);
          write(end, b);
          start = a;
          finish = b;
          selectingEnd = false;
          close(true);
        } else {
          write(input, v);
          write(end, '');
          start = v;
          finish = '';
          selectingEnd = true;
        }
      } else {
        write(input, v);
        start = v;
        close(true);
      }
      cursor = v;
      paint();
    }
    function paint(focus = false) {
      title.textContent = month.toLocaleDateString(locale(), { month: 'long', year: 'numeric' });
      dialog.setAttribute('aria-label', text(end ? 'range' : 'calendar'));
      weekdays.replaceChildren(
        ...Array.from({ length: 7 }, (_, i) => {
          const label = el(
            'span',
            null,
            new Date(2023, 0, 1 + i, 12).toLocaleDateString(locale(), { weekday: 'short' }),
          );
          label.setAttribute('aria-hidden', 'true');
          return label;
        }),
      );
      grid.replaceChildren();
      const first = new Date(month.getFullYear(), month.getMonth(), 1, 12),
        offset = first.getDay(),
        base = new Date(first);
      base.setDate(1 - offset);
      const preview = end && start && !finish && hover ? ordered(start, hover) : null;
      for (let i = 0; i < 42; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        const v = dateValue(d),
          b = el('button', 'wxi-day', String(d.getDate()));
        b.type = 'button';
        b.dataset.date = v;
        b.setAttribute('role', 'gridcell');
        b.setAttribute('aria-label', d.toLocaleDateString(locale(), { dateStyle: 'full' }));
        b.disabled = !allowed(v, selectingEnd && end ? end : input);
        b.tabIndex = v === cursor ? 0 : -1;
        b.classList.toggle('wxi-outside', d.getMonth() !== month.getMonth());
        b.classList.toggle('wxi-today', v === dateValue(new Date()));
        if (v === dateValue(new Date())) b.setAttribute('aria-current', 'date');
        const selected = v === start || v === finish || (end && finish && v > start && v < finish);
        b.setAttribute('aria-selected', String(Boolean(selected)));
        b.classList.toggle('wxi-selected', Boolean(selected));
        b.classList.toggle('wxi-preview', Boolean(preview && v >= preview[0] && v <= preview[1]));
        b.addEventListener('click', () => pick(v));
        b.addEventListener('mouseenter', () => {
          if (end && selectingEnd && !b.disabled) {
            hover = v;
            previewPaint();
          }
        });
        b.addEventListener('focus', () => {
          cursor = v;
          if (end && selectingEnd) {
            hover = v;
            previewPaint();
          }
        });
        grid.append(b);
      }
      const cells = Array.from(grid.children);
      if (!cells.some((b) => b.tabIndex === 0 && !b.disabled)) {
        const b = cells.find((b) => !b.disabled && !b.classList.contains('wxi-outside'));
        if (b) {
          b.tabIndex = 0;
          cursor = b.dataset.date;
        }
      }
      summary.textContent =
        (start
          ? text('selection') + ': ' + format(start) + (finish ? ' — ' + format(finish) : '')
          : '') +
        (preview
          ? ' · ' + text('preview') + ': ' + format(preview[0]) + ' — ' + format(preview[1])
          : '');
      if (focus) grid.querySelector('[tabindex="0"]')?.focus();
    }
    function previewPaint() {
      const range = start && hover ? ordered(start, hover) : null;
      for (const b of grid.children)
        b.classList.toggle(
          'wxi-preview',
          Boolean(range && b.dataset.date >= range[0] && b.dataset.date <= range[1]),
        );
      summary.textContent =
        text('preview') + ': ' + format(range?.[0]) + ' — ' + format(range?.[1]);
    }
    function open() {
      start = input.value;
      finish = end?.value || '';
      selectingEnd = false;
      hover = '';
      month = parse(start) || parse(input.min) || new Date();
      cursor = start || dateValue(month);
      dialog.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      paint(true);
    }
    function moveMonth(n) {
      month = new Date(month.getFullYear(), month.getMonth() + n, 1, 12);
      cursor = dateValue(month);
      paint(true);
    }
    head.append(
      button('previous', () => moveMonth(-1)),
      title,
      button('next', () => moveMonth(1)),
      weekdays,
    );
    footer.append(
      button('clear', () => {
        write(input, '');
        if (end) write(end, '');
        start = finish = hover = '';
        selectingEnd = false;
        paint();
      }),
      button('close', () => close(true)),
    );
    dialog.append(head, grid, summary, footer);
    host.append(toggle, dialog);
    input.after(host);
    grid.addEventListener('mouseleave', () => {
      hover = '';
      paint();
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key === 'PageUp' || e.key === 'PageDown') {
        e.preventDefault();
        moveMonth(e.key === 'PageUp' ? -1 : 1);
        return;
      }
      const rtl = document.documentElement.dir === 'rtl',
        delta = {
          ArrowLeft: rtl ? 1 : -1,
          ArrowRight: rtl ? -1 : 1,
          ArrowUp: -7,
          ArrowDown: 7,
          Home: -parse(cursor).getDay(),
          End: 6 - parse(cursor).getDay(),
        }[e.key];
      if (delta != null) {
        e.preventDefault();
        cursor = add(cursor, delta);
        month = parse(cursor);
        paint(true);
      }
    });
    document.addEventListener('wxi:language', () => {
      if (!dialog.hidden) paint();
    });
    document.addEventListener('pointerdown', (e) => {
      if (!host.contains(e.target)) close(false);
    });
    input.addEventListener('change', () => {
      if (dialog.hidden) {
        start = input.value;
        finish = end?.value || '';
      }
    });
  }
  function password(input, profile, confirmation) {
    if (input.dataset.wxiPassword) return;
    input.dataset.wxiPassword = 'true';
    const host = el('div', 'wxi-password'),
      heading = el('strong', null, text('password')),
      meter = el('div', 'wxi-password-meter'),
      status = el('p'),
      list = el('ul'),
      match = el('p');
    status.setAttribute('aria-live', 'polite');
    match.setAttribute('aria-live', 'polite');
    host.setAttribute('translate', 'no');
    host.append(heading, meter, status, list, match);
    const group = input.closest('.input-group');
    if (group) group.after(host);
    else input.after(host);
    const rules = WusoolPasswordPolicy.rules(profile);
    const rows = rules.map((r) => {
      const segment = el('span'),
        row = el('li');
      meter.append(segment);
      list.append(row);
      return { r, segment, row };
    });
    const update = () => {
      const value = input.value,
        ok = WusoolPasswordPolicy.accepts(value, profile);
      input.setCustomValidity(value && !ok ? text('incomplete') : '');
      heading.textContent = text('password');
      status.textContent = text(!value ? 'empty' : ok ? 'compliant' : 'incomplete');
      for (const { r, segment, row } of rows) {
        const pass = value && r.test(value);
        segment.classList.toggle('wxi-met', Boolean(pass));
        row.textContent = (pass ? '✓ ' : value ? '○ ' : '— ') + text(r.key, { n: r.length });
      }
      if (confirmation) {
        const same = confirmation.value === value;
        match.textContent = !confirmation.value
          ? text('confirm')
          : text(same ? 'matching' : 'mismatch');
        confirmation.setCustomValidity(confirmation.value && !same ? text('mismatch') : '');
      }
    };
    input.addEventListener('input', update);
    confirmation?.addEventListener('input', update);
    input.form?.addEventListener('reset', () => setTimeout(update, 0));
    document.addEventListener('wxi:language', update);
    update();
  }
  const carousels = new WeakMap();
  function carousel(container, label = 'places') {
    const old = carousels.get(container);
    if (old) {
      const current = Array.from(container.children).filter(
        (n) => n.querySelector('article,img') && !n.querySelector('.empty-message'),
      );
      if (current.length === old.cards.length && current.every((n, i) => n === old.cards[i]))
        return;
      old.abort.abort();
      old.controls.remove();
      delete container.dataset.wxiCarousel;
      carousels.delete(container);
    }
    const cards = Array.from(container.children).filter(
      (n) => n.querySelector('article,img') && !n.querySelector('.empty-message'),
    );
    if (!cards.length) {
      container.classList.remove('wxi-carousel');
      container.removeAttribute('aria-roledescription');
      return;
    }
    container.dataset.wxiCarousel = 'true';
    container.classList.add('wxi-carousel');
    container.setAttribute('role', 'region');
    container.setAttribute('aria-roledescription', 'carousel');
    container.setAttribute('aria-label', text(label));
    const controls = el('div', 'wxi-carousel-controls'),
      position = el('span');
    position.setAttribute('aria-live', 'polite');
    let index = 0,
      startX = null,
      suppressClick = false;
    const clamp = (n) => Math.max(0, Math.min(cards.length - 1, n));
    const move = (n) => {
      index = clamp(n);
      paint();
    };
    const previous = button('previous', () => move(index - 1)),
      next = button('next', () => move(index + 1));
    controls.append(previous, position, next);
    container.after(controls);
    container.tabIndex = 0;
    const abort = new AbortController();
    carousels.set(container, { cards, controls, abort });
    const on = (node, event, fn, extra = {}) =>
      node.addEventListener(event, fn, { ...extra, signal: abort.signal });
    function paint() {
      cards.forEach((card, i) => {
        card.classList.add('wxi-slide');
        card.style.setProperty('--wxi-distance', i - index);
        card.classList.toggle('wxi-slide-active', i === index);
        card.inert = i !== index;
        card.setAttribute('aria-hidden', String(i !== index));
        card.setAttribute('aria-label', text('position', { n: i + 1, total: cards.length }));
      });
      previous.disabled = index === 0;
      next.disabled = index === cards.length - 1;
      position.textContent = text('position', { n: index + 1, total: cards.length });
      controls.hidden = cards.length < 2;
      container.dispatchEvent(new CustomEvent('wxi:slide', { detail: { index } }));
    }
    on(container, 'keydown', (e) => {
      if (e.target !== container) return;
      const rtl = document.documentElement.dir === 'rtl';
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        move(
          e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? cards.length - 1
              : index + (e.key === 'ArrowRight' ? (rtl ? -1 : 1) : rtl ? 1 : -1),
        );
      }
    });
    on(container, 'pointerdown', (e) => {
      if (e.isPrimary && e.button === 0) startX = e.clientX;
    });
    on(container, 'pointerup', (e) => {
      if (startX == null) return;
      const delta = e.clientX - startX;
      startX = null;
      if (Math.abs(delta) > 50) {
        suppressClick = true;
        setTimeout(() => {
          suppressClick = false;
        }, 250);
        move(index + (delta < 0 ? 1 : -1) * (document.documentElement.dir === 'rtl' ? -1 : 1));
      }
    });
    on(container, 'pointercancel', () => {
      startX = null;
    });
    on(
      container,
      'click',
      (e) => {
        if (suppressClick) {
          suppressClick = false;
          e.preventDefault();
          e.stopPropagation();
        }
      },
      { capture: true },
    );
    for (const img of container.querySelectorAll('img'))
      on(
        img,
        'error',
        () => {
          img.hidden = true;
          const note = el('span', 'wxi-image-failed', text('imageFailed'));
          img.after(note);
        },
        { once: true },
      );
    on(document, 'wxi:language', () => {
      container.setAttribute('aria-label', text(label));
      paint();
    });
    paint();
  }
  const galleryListeners = new WeakMap();
  function safeImage(value) {
    try {
      const u = new URL(value, location.href);
      return ['http:', 'https:'].includes(u.protocol) ||
        /^data:image\/(png|jpeg|webp);base64,/.test(value)
        ? value
        : null;
    } catch {
      return null;
    }
  }
  function placeGallery(place) {
    const main = document.getElementById('placeImage');
    if (!main) return;
    const container = main.closest('.col-lg-7')?.querySelector('.row');
    if (!container) return;
    const previousListener = galleryListeners.get(container);
    if (previousListener) container.removeEventListener('wxi:slide', previousListener);
    galleryListeners.delete(container);
    const photos = (place.photos || [])
      .map((p) => ({ url: safeImage(p.url || p.imageData || ''), name: p.name || place.name }))
      .filter((p) => p.url);
    container.replaceChildren();
    if (!photos.length) {
      main.hidden = true;
      container.append(el('p', null, text('noPhotos')));
      carousel(container, 'photos');
      return;
    }
    main.hidden = false;
    photos.forEach((photo) => {
      const card = el('div', 'col-4'),
        b = el('button', 'gallery-image'),
        img = el('img');
      b.type = 'button';
      b.dataset.image = photo.url;
      img.src = photo.url;
      img.alt = photo.name;
      b.append(img);
      b.addEventListener('click', () => {
        main.src = photo.url;
        main.alt = photo.name;
      });
      card.append(b);
      container.append(card);
    });
    const onSlide = (e) => {
      const photo = photos[e.detail.index];
      if (photo) {
        main.src = photo.url;
        main.alt = photo.name;
      }
    };
    container.addEventListener('wxi:slide', onSlide);
    galleryListeners.set(container, onSlide);
    carousel(container, 'photos');
  }
  function navbar(nav) {
    if (nav.dataset.wxiNav) return;
    nav.dataset.wxiNav = 'true';
    nav.classList.add('wxi-nav');
    const row = nav.querySelector('.navbar-nav');
    if (!row) return;
    const links = Array.from(row.querySelectorAll('a.nav-link')),
      indicator = el('span', 'wxi-nav-indicator');
    indicator.setAttribute('aria-hidden', 'true');
    row.append(indicator);
    let active = null;
    const update = () => {
      active = null;
      links.forEach((a) => {
        const u = new URL(a.href, location.href),
          yes =
            u.pathname === location.pathname &&
            (u.hash ? u.hash === location.hash : !location.hash);
        a.classList.toggle('active', yes);
        if (yes) {
          a.setAttribute('aria-current', u.hash ? 'location' : 'page');
          active = a;
        } else a.removeAttribute('aria-current');
      });
      show(active);
    };
    function show(a) {
      if (!a || !a.getClientRects().length) {
        indicator.hidden = true;
        return;
      }
      indicator.hidden = false;
      const box = a.getBoundingClientRect(),
        parent = row.getBoundingClientRect();
      indicator.style.width = box.width + 'px';
      indicator.style.transform = `translateX(${box.left - parent.left}px)`;
      indicator.style.top = box.bottom - parent.top - 2 + 'px';
    }
    links.forEach((a) => {
      a.addEventListener('mouseenter', () => show(a));
      a.addEventListener('focus', () => show(a));
    });
    row.addEventListener('mouseleave', () => show(active));
    row.addEventListener('focusout', () =>
      requestAnimationFrame(() =>
        show(row.contains(document.activeElement) ? document.activeElement : active),
      ),
    );
    window.addEventListener('hashchange', update);
    if (window.ResizeObserver) new ResizeObserver(() => show(active)).observe(row);
    nav.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        nav
          .querySelectorAll('.dropdown-toggle')
          .forEach((b) => window.bootstrap?.Dropdown.getInstance(b)?.hide());
        const collapse = nav.querySelector('.navbar-collapse.show');
        if (collapse) {
          window.bootstrap?.Collapse.getInstance(collapse)?.hide();
          nav.querySelector('.navbar-toggler')?.focus();
        }
      }
    });
    update();
  }
  const api = {
    dateValue,
    parse,
    add,
    ordered,
    allowed,
    calendar,
    password,
    carousel,
    placeGallery,
    navbar,
    text,
  };
  window.WusoolInteractions = api;
  const scan = () => {
    document
      .querySelectorAll('input[type="date"]')
      .forEach((input) =>
        calendar(
          input,
          input.id === 'subscriptionStart' ? document.getElementById('subscriptionEnd') : null,
        ),
      );
    document.querySelectorAll('nav.navbar,nav.main-navbar').forEach(navbar);
    document
      .querySelectorAll('#featuredPlaces .row[data-wxi-records-ready],#photosContainer')
      .forEach((c) => carousel(c, c.id === 'photosContainer' ? 'photos' : 'places'));
  };
  function init() {
    // The approved scroll-street Home owns its layout and controls.
    if (document.querySelector('.wusool-journey')) return;
    scan();
    const path = location.pathname;
    if (
      /login\.html$/.test(path) ||
      /register\.html$/.test(path) ||
      /reset-password\.html$/.test(path) ||
      /organization-settings\.html$/.test(path)
    ) {
      const input =
          document.getElementById('newPassword') ||
          document.getElementById('password') ||
          document.getElementById('adminPassword'),
        confirm = document.getElementById('confirmPassword');
      if (input)
        password(
          input,
          path.includes('login')
            ? 'login'
            : path.includes('/visitor/')
              ? 'userRegistration'
              : path.includes('organization-register')
                ? 'organizationRegistration'
                : path.includes('reset')
                  ? 'reset'
                  : 'change',
          confirm,
        );
    }
    if (window.WusoolPreferences) {
      window.WusoolPreferences.refresh();
      let queued = false;
      new MutationObserver(() => { if (!queued) { queued=true; queueMicrotask(() => { queued=false; scan(); }); } }).observe(document.body, {childList:true,subtree:true});
      return;
    }
    const panel = el('div', 'wxi-theme-controls'),
      toggle = button('theme', () => {
        WusoolTheme.set(WusoolTheme.mode === 'dark' ? 'light' : 'dark', toggle).then(syncTheme);
      }),
      select = el('select');
    select.setAttribute('aria-label', text('theme'));
    for (const value of ['system', 'light', 'dark']) {
      const option = el('option', null, text(value));
      option.value = value;
      select.append(option);
    }
    select.value = WusoolTheme.preference;
    select.addEventListener('change', () => {
      WusoolTheme.set(select.value, toggle).then(syncTheme);
    });
    panel.append(toggle, select);
    document.body.append(panel);
    function syncTheme() {
      toggle.textContent = text('theme') + ': ' + text(WusoolTheme.mode);
      toggle.setAttribute('aria-pressed', String(WusoolTheme.mode === 'dark'));
      select.value = WusoolTheme.preference;
    }
    const language = () => {
      document
        .querySelectorAll('[data-wxi-copy]')
        .forEach((n) => (n.textContent = text(n.dataset.wxiCopy)));
      for (const option of select.options) option.textContent = text(option.value);
      select.setAttribute('aria-label', text('theme'));
      syncTheme();
      document.dispatchEvent(new Event('wxi:language'));
    };
    new MutationObserver(language).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'dir'],
    });
    new MutationObserver(syncTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-wusool-color-mode'],
    });
    syncTheme();
    let queued = false;
    new MutationObserver(() => {
      if (!queued) {
        queued = true;
        queueMicrotask(() => {
          queued = false;
          scan();
        });
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
