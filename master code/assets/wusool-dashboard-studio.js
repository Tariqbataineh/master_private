/* Wusool Dashboard Studio v2 — visual layout preference only.
   No business entity, API request, routing, or permission is modified.
   Supports pointer drag/drop, keyboard move controls, touch via buttons,
   and personal per-account layout persistence. */
(() => {
  'use strict';
  const role = document.body?.dataset?.wuPortalDashboard;
  if (!['user', 'organization', 'admin'].includes(role)) return;
  const root = document.querySelector(role === 'user' ? '#mainContent' : role === 'organization' ? '.organization-main > .container-fluid' : '.main-content > .container-fluid:last-of-type');
  if (!root) return;
  const ar = () => document.documentElement.lang === 'ar';
  const dictionary = {
    customize: ['Customize Dashboard', 'تخصيص لوحة التحكم'],
    finish: ['Finish Editing', 'إنهاء التعديل'],
    reset: ['Reset Layout', 'استعادة الترتيب'],
    instructions: ['Drag a handle or use the arrow buttons to rearrange widgets. Your layout is saved automatically.', 'اسحب المقبض أو استخدم أزرار الأسهم لترتيب البطاقات. يُحفظ ترتيبك تلقائيًا.'],
    moveUp: ['Move up', 'تحريك للأعلى'],
    moveDown: ['Move down', 'تحريك للأسفل'],
    drag: ['Drag to reorder', 'اسحب لإعادة الترتيب'],
    updated: ['Dashboard layout saved', 'تم حفظ ترتيب لوحة التحكم'],
    restored: ['Default layout restored', 'تمت استعادة الترتيب الافتراضي'],
    edit: ['Edit dashboard layout', 'تعديل ترتيب لوحة التحكم']
  };
  const tr = key => dictionary[key]?.[ar() ? 1 : 0] || key;
  const originalGroups = [];
  const groupByName = new Map();
  const region = role === 'user' ? root.querySelector('.dashboard-hero .col-lg-7') : role === 'organization' ? root.querySelector('.welcome-actions') : document.querySelector('.page-header .container-fluid > div');
  if (!region) return;

  const uidForAccount = async () => {
    try {
      const account = await window.WusoolServices?.getCurrentAccount?.();
      return String(account?.id || account?.userId || account?.email || 'anonymous').slice(0, 150);
    } catch { return 'anonymous'; }
  };
  let storageKey = `wusool.dashboard.layout.v2:${role}:anonymous`;
  let editing = false;
  let dragging = null;
  const store = {
    get() { try { const v = JSON.parse(localStorage.getItem(storageKey) || '{}'); return v && typeof v === 'object' ? v : {}; } catch { return {}; } },
    save(value) { try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* Private mode: layout lasts until refresh. */ } },
    clear() { try { localStorage.removeItem(storageKey); } catch {} }
  };
  const status = document.createElement('span');
  status.className = 'wu-layout-status visually-hidden';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const announce = key => { status.textContent = ''; requestAnimationFrame(() => { status.textContent = tr(key); }); };

  const createControl = (label, icon, handler, extraClass = '') => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `wu-layout-button ${extraClass}`;
    btn.innerHTML = `<i class="bi bi-${icon}" aria-hidden="true"></i><span></span>`;
    btn.querySelector('span').textContent = tr(label);
    btn.dataset.translateKey = label;
    btn.addEventListener('click', handler);
    return btn;
  };
  const panel = document.createElement('div');
  panel.className = 'wu-layout-panel';
  panel.setAttribute('aria-label', tr('edit'));
  const toggle = createControl('customize', 'sliders2-vertical', () => setEditing(!editing), 'wu-layout-toggle');
  const reset = createControl('reset', 'arrow-counterclockwise', () => {
    store.clear();
    originalGroups.forEach(group => applyDefault(group));
    announce('restored');
  }, 'wu-layout-reset');
  reset.hidden = true;
  const help = document.createElement('p');
  help.className = 'wu-layout-help';
  help.textContent = tr('instructions');
  help.hidden = true;
  panel.append(toggle, reset, help, status);
  region.append(panel);

  const childrenFor = group => [...group.container.children].filter(n => n.dataset?.wuLayoutItem === 'true');
  const saveOrder = group => {
    const saved = store.get();
    saved[group.id] = childrenFor(group).map(el => el.dataset.wuLayoutId);
    store.save(saved);
    announce('updated');
  };
  const applySaved = group => {
    const order = store.get()[group.id];
    if (!Array.isArray(order)) return;
    const current = childrenFor(group), byId = new Map(current.map(el => [el.dataset.wuLayoutId, el]));
    order.forEach(id => { if (byId.has(id)) group.container.appendChild(byId.get(id)); });
  };
  const applyDefault = group => {
    const all = childrenFor(group), byId = new Map(all.map(el => [el.dataset.wuLayoutId, el]));
    group.defaults.forEach(id => { if (byId.has(id)) group.container.appendChild(byId.get(id)); });
    setUpDown(group);
  };
  const setUpDown = group => {
    const items = childrenFor(group);
    items.forEach((el, i) => {
      const up = el.querySelector(':scope > .wu-layout-widget-controls [data-move="up"]');
      const down = el.querySelector(':scope > .wu-layout-widget-controls [data-move="down"]');
      if (up) up.disabled = i === 0;
      if (down) down.disabled = i === items.length - 1;
    });
  };
  const move = (group, element, direction) => {
    const all = childrenFor(group), index = all.indexOf(element);
    const other = all[index + direction];
    if (!other) return;
    if (direction < 0) group.container.insertBefore(element, other);
    else group.container.insertBefore(other, element);
    saveOrder(group); setUpDown(group);
    element.querySelector(':scope > .wu-layout-widget-controls [data-move="' + (direction < 0 ? 'up' : 'down') + '"]')?.focus();
  };
  const makeGroup = (id, container, nodes) => {
    if (!container || nodes.length < 2) return;
    const group = { id, container, defaults: [], items: nodes };
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      el.dataset.wuLayoutItem = 'true';
      el.dataset.wuLayoutId = `${id}-${i + 1}`;
      el.classList.add('wu-layout-widget');
      group.defaults.push(el.dataset.wuLayoutId);
      if (el.querySelector(':scope > .wu-layout-widget-controls')) continue;
      const controls = document.createElement('div');
      controls.className = 'wu-layout-widget-controls';
      controls.hidden = !editing;
      const handle = createControl('drag', 'grip-vertical', () => {}, 'wu-drag-handle');
      handle.draggable = editing;
      handle.setAttribute('aria-label', tr('drag'));
      handle.title = tr('drag');
      const up = createControl('moveUp', 'arrow-up', () => move(group, el, -1), 'wu-move-button');
      const down = createControl('moveDown', 'arrow-down', () => move(group, el, 1), 'wu-move-button');
      up.dataset.move = 'up'; down.dataset.move = 'down';
      controls.append(handle, up, down);
      el.prepend(controls);
      handle.addEventListener('dragstart', event => {
        if (!editing) { event.preventDefault(); return; }
        dragging = { group, el };
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', el.dataset.wuLayoutId);
        el.classList.add('wu-is-dragging');
      });
      handle.addEventListener('dragend', () => { el.classList.remove('wu-is-dragging'); dragging = null; });
      // Native HTML drag/drop is inconsistent on phones. Pointer movement on the
      // handle also reorders cards on touch devices, without making cards clickable.
      let touchTarget = null;
      handle.addEventListener('pointerdown', event => {
        if (!editing || !['touch', 'pen'].includes(event.pointerType)) return;
        event.preventDefault();
        touchTarget = null;
        dragging = { group, el };
        el.classList.add('wu-is-dragging');
        try { handle.setPointerCapture(event.pointerId); } catch {}
      });
      handle.addEventListener('pointermove', event => {
        if (!editing || !dragging || dragging.el !== el || !['touch', 'pen'].includes(event.pointerType)) return;
        const hit = document.elementFromPoint(event.clientX, event.clientY);
        const candidate = hit?.closest('[data-wu-layout-item="true"]');
        if (touchTarget !== candidate) touchTarget?.classList.remove('wu-is-touch-target');
        touchTarget = candidate && candidate !== el && candidate.parentElement === group.container ? candidate : null;
        touchTarget?.classList.add('wu-is-touch-target');
      });
      const finishTouch = (event, cancel = false) => {
        if (!dragging || dragging.el !== el || !['touch', 'pen'].includes(event.pointerType)) return;
        if (!cancel && touchTarget) {
          const all = childrenFor(group), from = all.indexOf(el), to = all.indexOf(touchTarget);
          if (from !== -1 && to !== -1) {
            group.container.insertBefore(el, to > from ? touchTarget.nextSibling : touchTarget);
            saveOrder(group); setUpDown(group);
          }
        }
        touchTarget?.classList.remove('wu-is-touch-target'); touchTarget = null;
        el.classList.remove('wu-is-dragging'); dragging = null;
      };
      handle.addEventListener('pointerup', event => finishTouch(event));
      handle.addEventListener('pointercancel', event => finishTouch(event, true));

      el.addEventListener('dragover', event => {
        if (!editing || !dragging || dragging.group !== group || dragging.el === el) return;
        event.preventDefault(); event.dataTransfer.dropEffect = 'move';
      });
      el.addEventListener('drop', event => {
        if (!editing || !dragging || dragging.group !== group || dragging.el === el) return;
        event.preventDefault();
        const active = dragging.el;
        const rect = el.getBoundingClientRect();
        const horizontal = group.id === 'metrics';
        const midpoint = horizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
        const after = horizontal ? event.clientX > midpoint : event.clientY > midpoint;
        const before = after ? el.nextSibling : el;
        group.container.insertBefore(active, before);
        active.classList.remove('wu-is-dragging'); dragging = null;
        saveOrder(group); setUpDown(group);
      });
    }
    groupByName.set(id, group); originalGroups.push(group);
    applySaved(group); setUpDown(group);
  };
  const setEditing = state => {
    editing = Boolean(state);
    document.body.classList.toggle('wu-layout-editing', editing);
    toggle.querySelector('span').textContent = tr(editing ? 'finish' : 'customize');
    toggle.dataset.translateKey = editing ? 'finish' : 'customize';
    toggle.setAttribute('aria-pressed', String(editing));
    reset.hidden = !editing; help.hidden = !editing;
    originalGroups.forEach(group => {
      group.items.forEach(el => {
        const control = el.querySelector(':scope > .wu-layout-widget-controls');
        if (!control) return;
        control.hidden = !editing;
        const handle = control.querySelector('.wu-drag-handle');
        if (handle) handle.draggable = editing;
      });
      setUpDown(group);
    });
  };

  const init = async () => {
    storageKey = `wusool.dashboard.layout.v2:${role}:${await uidForAccount()}`;
    const sections = [...root.children].filter(el => el.matches('section, div.row'));
    // The Welcome/Hero is fixed to keep consistent navigation and branding.
    const movable = role === 'admin' ? sections : sections.slice(1);
    makeGroup('sections', root, movable);
    const metrics = role === 'user'
      ? root.querySelector('[aria-labelledby="overviewTitle"] .row.g-4')
      : role === 'organization'
        ? [...root.children].find(el => el.matches('section.row.g-4'))
        : root.querySelector('#statsContainer');
    if (metrics) {
      const activate = () => {
        if (groupByName.has('metrics')) return;
        const nodes = [...metrics.children].filter(el => el.nodeType === 1);
        if (nodes.length > 1) { makeGroup('metrics', metrics, nodes); setEditing(editing); }
      };
      activate();
      if (role === 'admin' && !groupByName.has('metrics')) {
        const observer = new MutationObserver(() => { activate(); if (groupByName.has('metrics')) observer.disconnect(); });
        observer.observe(metrics, { childList: true });
      }
    }
    setEditing(false);
  };
  init();
  const refresh = () => {
    document.querySelectorAll('[data-translate-key]').forEach(el => {
      const key = el.dataset.translateKey;
      const label = el.querySelector('span');
      if (label) label.textContent = tr(key);
      if (el.classList.contains('wu-drag-handle')) { el.setAttribute('aria-label', tr('drag')); el.title = tr('drag'); }
    });
    help.textContent = tr('instructions'); panel.setAttribute('aria-label', tr('edit'));
  };
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
