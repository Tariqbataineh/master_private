/* WUSOOL Database Atlas. Buildless, offline, schema-only documentation. */
(() => {
  'use strict';
  const D = window.WUSOOL_DATABASE;
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const q = value => `[${String(value).replace(/]/g, ']]')}]`;
  const full = t => `${q(t.schema)}.${q(t.name)}`;
  const number = n => new Intl.NumberFormat('en-US').format(n);
  const objects = new Map([...D.tables, ...D.views].map(t => [t.id, t]));
  const tables = new Map(D.tables.map(t => [t.id, t]));
  const groups = new Map(D.groups.map(g => [g.id, g]));
  const viewIds = new Set(D.views.map(v => v.id));
  const originalLayouts = JSON.parse(JSON.stringify(D.layouts));
  const originalNeighborhoods = JSON.parse(JSON.stringify(D.neighborhoodLayouts));
  const state = { tab: 'er', group: 'bookings', relation: 'all', neighbors: false, selected: null, explorerKind: 'tables', explorerId: 'dbo.Bookings', search: '', explorerGroup: 'all', rulesPage: 0, scale: 1, x: 0, y: 0, visible: [], visibleRelationships: [], theme: 'auto' };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let animation = 0, toastTimer, drag = null, initializedDiagram = false;
  const columnType = c => {
    const type = c.baseType;
    if (['nvarchar', 'nchar', 'varchar', 'char', 'varbinary', 'binary'].includes(type)) return `${type}(${c.maxLength < 0 ? 'max' : /^(nchar|nvarchar)$/.test(type) ? c.maxLength / 2 : c.maxLength})`;
    if (['decimal', 'numeric'].includes(type)) return `${type}(${c.precision},${c.scale})`;
    if (['datetimeoffset', 'datetime2', 'time'].includes(type)) return `${type}(${c.scale})`;
    return type;
  };
  const links = t => D.relationships.filter(r => r.child === t.id || r.parent === t.id);
  const childLinks = t => D.relationships.filter(r => r.child === t.id);
  const parentLinks = t => D.relationships.filter(r => r.parent === t.id);
  const keys = (t, c) => {
    const indexes = t.indexes || [];
    return {
      pk: indexes.some(i => i.primaryKey && i.columns.some(k => k.name === c.name && !k.included)),
      fk: childLinks(t).some(r => r.columns.some(k => k.childColumn === c.name)),
      uq: indexes.some(i => i.unique && !i.primaryKey && i.columns.some(k => k.name === c.name && !k.included))
    };
  };
  const badges = (t, c) => Object.entries(keys(t, c)).filter(([, yes]) => yes).map(([k]) => `<span class="key-badge ${k}" title="${k === 'pk' ? 'Primary key column' : k === 'fk' ? 'Foreign key column' : 'Part of a unique key or index; inspect its complete column set'}">${k.toUpperCase()}</span>`).join(' ');
  const groupOf = t => viewIds.has(t.id) ? 'views' : t.group;
  const groupLabel = t => viewIds.has(t.id) ? 'Compatibility view' : groups.get(t.group).label;
  const tag = t => `<span class="object-tag g-${groupOf(t)}"><span class="domain-dot"></span>${esc(groupLabel(t))}</span>`;
  const matches = (t, text) => !text || [t.name, t.schema, t.guide, ...t.columns.map(c => `${c.name} ${columnType(c)}`)].join(' ').toLowerCase().includes(text.toLowerCase());

  function toast(message) {
    clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3200);
  }
  function applyTheme(mode) {
    state.theme = mode;
    const dark = mode === 'dark' || mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $('#themeButton').innerHTML = icon(dark ? 'moon' : 'sun');
    $('#themeButton').setAttribute('aria-label', `Theme: ${mode}. Activate to cycle light, dark and automatic.`);
    $('#themeButton').title = `Theme: ${mode}`;
  }
  try { applyTheme(localStorage.getItem('wusool-atlas-theme') || 'auto'); } catch { applyTheme('auto'); }
  $('#themeButton').addEventListener('click', () => {
    const order = ['auto', 'light', 'dark']; applyTheme(order[(order.indexOf(state.theme) + 1) % 3]);
    try { localStorage.setItem('wusool-atlas-theme', state.theme); } catch { /* Storage is optional, including file://. */ }
    toast(`Color theme: ${state.theme}`);
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (state.theme === 'auto') applyTheme('auto'); });

  function validateData() {
    if (D.tables.length !== 136 || D.views.length !== 20 || D.relationships.length !== 253 || D.tables.reduce((n, t) => n + t.columns.length, 0) !== 1439) throw new Error('Schema snapshot counts do not match the deployed database.');
    if (objects.size !== D.tables.length + D.views.length) throw new Error('Duplicate schema object IDs.');
    for (const t of [...D.tables, ...D.views]) {
      if (!D.layouts.er[t.id] || !D.layouts.schema[t.id]) throw new Error(`Missing layout: ${t.id}`);
      if (new Set(t.columns.map(c => c.name)).size !== t.columns.length) throw new Error(`Duplicate column: ${t.id}`);
      for (const i of t.indexes || []) for (const c of i.columns) if (!t.columns.some(x => x.name === c.name)) throw new Error(`Unresolved index column: ${i.name}`);
    }
    for (const r of D.relationships) for (const c of r.columns) {
      if (!tables.get(r.child)?.columns.some(x => x.name === c.childColumn) || !tables.get(r.parent)?.columns.some(x => x.name === c.parentColumn)) throw new Error(`Unresolved foreign key: ${r.name}`);
    }
  }
  validateData();
  $('#metrics').innerHTML = [
    ['table', D.counts.tables, 'Physical tables', 'DEPLOYED'], ['schema', D.counts.columns, 'Table columns', 'TYPED'], ['link', D.counts.relationships, 'FK relationships', 'VERIFIED'], ['layers', D.counts.views, 'Compatibility views', 'SEPARATE']
  ].map(([i, value, label, note]) => `<div class="metric"><span class="metric-icon">${icon(i)}</span><div><div class="metric-value">${number(value)}</div><div class="metric-label">${label}</div></div><span class="metric-note">${note}</span></div>`).join('');
  $('#tableKindCount').textContent = D.counts.tables; $('#viewKindCount').textContent = D.counts.views;
  $('#sqlScope option[value="all"]').textContent = `All ${D.counts.tables} physical tables`;
  $('#sqlScope option[value="views"]').textContent = `${D.counts.views} compatibility views`;
  const domainOptions = `<option value="all">All physical tables · ${D.counts.tables}</option>` + D.groups.map(g => `<option value="${g.id}">${esc(g.label)}</option>`).join('');
  $('#groupSelect').innerHTML = domainOptions + `<option value="views">Compatibility views · ${D.counts.views}</option>`;
  $('#groupSelect').value = state.group;
  $('#explorerGroup').innerHTML = domainOptions;
  function renderGroups() {
    const list = [{ id: 'all', label: 'All physical tables' }, ...D.groups, { id: 'views', label: 'Compatibility views' }];
    $('#groupList').innerHTML = list.map(g => `<button class="domain-button g-${g.id}${state.group === g.id ? ' active' : ''}" data-group="${g.id}" aria-pressed="${state.group === g.id}"><span class="domain-dot"></span><span>${esc(g.label)}</span><small>${g.id === 'all' ? D.tables.length : g.id === 'views' ? D.views.length : D.tables.filter(t => t.group === g.id).length}</small></button>`).join('');
  }
  renderGroups();

  function setTab(tab, focus = false) {
    state.tab = tab;
    for (const b of $$('.tabs [role=tab]')) { b.setAttribute('aria-selected', b.dataset.tab === tab); b.tabIndex = b.dataset.tab === tab ? 0 : -1; }
    $('#panel-diagram').hidden = !['er', 'schema'].includes(tab);
    for (const name of ['explorer', 'sql', 'rules']) $(`#panel-${name}`).hidden = name !== tab;
    if (tab === 'er' || tab === 'schema') {
      $('#panel-diagram').setAttribute('aria-labelledby', `tab-${tab}`);
      $('#diagramEyebrow').textContent = tab === 'er' ? 'ENTITY RELATIONSHIP MAP' : 'FULL COLUMN SCHEMA';
      renderDiagram(); requestAnimationFrame(() => fitDiagram(false)); initializedDiagram = true;
    }
    if (tab === 'explorer') renderExplorer();
    if (tab === 'sql') renderSql();
    if (tab === 'rules') renderRules();
    if (focus) $(`#tab-${tab}`).focus();
    try { history.replaceState(null, '', `#${tab}`); } catch { /* Local file navigation still works. */ }
  }
  for (const b of $$('.tabs [role=tab]')) {
    b.addEventListener('click', () => setTab(b.dataset.tab));
    b.addEventListener('keydown', e => {
      const all = $$('.tabs [role=tab]'); let i = all.indexOf(b);
      if (e.key === 'ArrowRight') i = (i + 1) % all.length; else if (e.key === 'ArrowLeft') i = (i + all.length - 1) % all.length; else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = all.length - 1; else return;
      e.preventDefault(); setTab(all[i].dataset.tab, true);
    });
  }
  function setGroup(group) {
    state.group = group; state.selected = null; $('#inspector').hidden = true; $('#groupSelect').value = group;
    renderGroups(); renderDiagram(); requestAnimationFrame(() => fitDiagram(true));
  }
  $('#groupList').addEventListener('click', e => { const b = e.target.closest('[data-group]'); if (b) setGroup(b.dataset.group); });
  $('#groupSelect').addEventListener('change', e => setGroup(e.target.value));
  $('#relationshipFilter').addEventListener('change', e => { state.relation = e.target.value; renderDiagram(); });
  $('#neighborsButton').addEventListener('click', () => { state.neighbors = !state.neighbors; $('#neighborsButton').setAttribute('aria-pressed', state.neighbors); renderDiagram(); fitDiagram(true); });

  const svg = $('#diagram'), viewport = $('#viewport');
  const layout = id => (state.neighbors && D.neighborhoodLayouts[state.group] ? D.neighborhoodLayouts[state.group] : D.layouts)[state.tab === 'schema' ? 'schema' : 'er'][id];
  function visibleObjects() {
    if (state.group === 'views') return D.views;
    const base = state.group === 'all' ? D.tables : D.tables.filter(t => t.group === state.group);
    if (!state.neighbors || state.group === 'all') return base;
    const ids = new Set(base.map(t => t.id));
    const extra = new Set(D.relationships.filter(r => ids.has(r.child) || ids.has(r.parent)).flatMap(r => [r.child, r.parent]));
    return D.tables.filter(t => extra.has(t.id) || ids.has(t.id));
  }
  function renderDiagram() {
    if (!['er', 'schema'].includes(state.tab)) return;
    const visible = visibleObjects(), ids = new Set(visible.map(t => t.id)); state.visible = visible;
    const rels = D.relationships.filter(r => ids.has(r.child) && ids.has(r.parent) && (state.relation === 'all' || state.relation === 'optional' && r.optional || state.relation === 'required' && !r.optional || state.relation === 'unique' && r.uniqueChild));
    state.visibleRelationships = rels;
    const neighbors = new Set(state.selected ? D.relationships.filter(r => r.child === state.selected || r.parent === state.selected).flatMap(r => [r.child, r.parent]) : []);
    $('#diagramTitle').textContent = state.group === 'all' ? 'The complete physical model' : state.group === 'views' ? 'Compatibility views' : groups.get(state.group).label;
    $('#canvasCount').textContent = `${visible.length} of ${state.group === 'views' ? D.views.length : D.tables.length} ${state.group === 'views' ? 'views' : 'tables'} · ${rels.length} ${state.group === 'views' ? 'physical FKs' : 'of ' + D.relationships.length + ' relationships'}`;
    $('#neighborsButton').hidden = state.group === 'views' || state.group === 'all';
    $('#canvasEmpty').hidden = visible.length > 0;
    const labelMarkup = (state.group === 'all' || state.neighbors) ? D.groups.map(g => {
      const ts = visible.filter(t => t.group === g.id); if (!ts.length) return '';
      const x = Math.min(...ts.map(t => layout(t.id).x)), y = Math.min(...ts.map(t => layout(t.id).y));
      return `<text class="domain-label" x="${x}" y="${y - 24}">${esc(g.label.toUpperCase())}</text>`;
    }).join('') : '';
    $('#nodes').innerHTML = labelMarkup + visible.map(t => {
      const p = layout(t.id), dim = state.selected && t.id !== state.selected && !neighbors.has(t.id), view = viewIds.has(t.id);
      const pk = (t.indexes || []).find(i => i.primaryKey)?.columns.filter(c => !c.included).map(c => c.name).join(', ') || (view ? 'SQL-backed projection' : 'No primary key');
      const fk = childLinks(t).length;
      let body;
      if (state.tab === 'er') body = `<rect class="node-badge" x="15" y="49" width="22" height="16" rx="3"/><text class="node-key" x="26" y="60" text-anchor="middle">${view ? 'V' : 'PK'}</text><text class="node-meta" x="44" y="60">${esc(pk.length > 30 ? pk.slice(0, 29) + '…' : pk)}</text><text class="node-subtitle" x="16" y="80">${t.columns.length} columns</text><text class="node-subtitle" x="${p.width - 16}" y="80" text-anchor="end">${view ? 'VIEW · NOT A TABLE' : fk + ' outgoing FK' + (fk === 1 ? '' : 's')}</text>`;
      else body = t.columns.map((c, index) => {
        const k = keys(t, c), flags = [k.pk && 'PK', k.fk && 'FK', k.uq && 'UQ'].filter(Boolean).join(' '), y = 44 + index * 25;
        const name = c.name;
        const type = columnType(c); const shortType = type.length > 21 ? type.slice(0, 20) + '…' : type;
        return `<g class="column-row"><title>${esc(c.name + ' · ' + type + ' · ' + (c.nullable ? 'NULL allowed' : 'NOT NULL') + (flags ? ' · ' + flags : ''))}</title><rect x="2" y="${y}" width="${p.width - 4}" height="25"/><text class="column-flag" x="11" y="${y + 16}">${flags}</text><text class="column-name" x="${flags.length > 5 ? 67 : 45}" y="${y + 16}">${esc(name)}</text><text class="column-type" x="${p.width - 12}" y="${y + 16}" text-anchor="end">${esc(shortType)}${c.nullable ? ' ?' : ''}</text></g>`;
      }).join('');
      return `<g class="node g-${groupOf(t)}${state.selected === t.id ? ' selected' : ''}${dim ? ' dimmed' : ''}" transform="translate(${p.x} ${p.y})" tabindex="0" role="button" aria-label="${esc(t.name)}, ${t.columns.length} columns${view ? ', compatibility view' : ''}. Enter for details." aria-pressed="${state.selected === t.id}" data-object="${esc(t.id)}"><title>${esc(t.name + ' — ' + t.guide)}</title><rect class="node-body" width="${p.width}" height="${p.height}" rx="8"/><rect class="node-accent" x="0" y="13" width="3" height="19" rx="1.5"/><text class="node-title" x="16" y="27">${esc(t.name.length > 32 ? t.name.slice(0, 31) + '…' : t.name)}</text><line class="node-divider" x1="0" y1="39" x2="${p.width}" y2="39"/>${body}</g>`;
    }).join('');
    drawEdges();
    $('#diagramStatus').textContent = state.group === 'views' ? 'Views are projections, not additional physical tables' : state.selected ? `${objects.get(state.selected)?.name || ''} highlighted · its related tables stay visible` : 'Read-only snapshot · select a table to follow its connections';
  }
  function edgePath(r) {
    const parent = layout(r.parent), child = layout(r.child);
    const parentTable = tables.get(r.parent), childTable = tables.get(r.child);
    const row = (t, column) => state.tab === 'schema' ? 56 + t.columns.findIndex(c => c.name === column) * 25 : 39;
    let py = parent.y + row(parentTable, r.columns[0].parentColumn), cy = child.y + row(childTable, r.columns[0].childColumn);
    const forward = child.x >= parent.x + parent.width;
    let px = parent.x + (forward ? parent.width : 0), cx = child.x + (forward ? 0 : child.width);
    if (r.parent === r.child) { px = parent.x + parent.width; cx = px; cy = py + 25; return `M${px} ${py} C${px + 65} ${py - 30},${px + 65} ${cy + 30},${cx} ${cy}`; }
    if (Math.abs(child.x - parent.x) < 10) { px = parent.x + parent.width; cx = child.x + child.width; const side = px + 43 + (D.relationships.indexOf(r) % 4) * 9; return `M${px} ${py} C${side} ${py},${side} ${cy},${cx} ${cy}`; }
    const bend = Math.max(40, Math.abs(cx - px) * .45), sign = forward ? 1 : -1;
    return `M${px} ${py} C${px + bend * sign} ${py},${cx - bend * sign} ${cy},${cx} ${cy}`;
  }
  function drawEdges() {
    $('#edges').innerHTML = state.visibleRelationships.map(r => {
      const selected = state.selected && (r.child === state.selected || r.parent === state.selected), dim = state.selected && !selected;
      return `<g data-relationship="${esc(r.name)}"><path class="edge${selected ? ' highlighted' : ''}${dim ? ' dimmed' : ''}" d="${edgePath(r)}" marker-start="url(#${r.optional ? 'm-optional' : 'm-one'})" marker-end="url(#${r.uniqueChild ? 'm-optional' : 'm-many'})"/><path class="edge-hit" d="${edgePath(r)}"><title>${esc(r.name + ': ' + r.parentTable + ' → ' + r.childTable + ' · ' + (r.optional ? 'optional' : 'required') + ' parent')}</title></path></g>`;
    }).join('');
  }
  function transform() { viewport.setAttribute('transform', `translate(${state.x} ${state.y}) scale(${state.scale})`); $('#zoomLevel').textContent = `${Math.round(state.scale * 100)}%`; }
  function animateTo(x, y, scale, smooth) {
    cancelAnimationFrame(animation);
    if (!smooth || reducedMotion.matches) { Object.assign(state, { x, y, scale }); transform(); return; }
    const old = { x: state.x, y: state.y, scale: state.scale }, start = performance.now();
    const frame = now => { const t = Math.min(1, (now - start) / 240), ease = 1 - (1 - t) ** 3; state.x = old.x + (x - old.x) * ease; state.y = old.y + (y - old.y) * ease; state.scale = old.scale + (scale - old.scale) * ease; transform(); if (t < 1) animation = requestAnimationFrame(frame); };
    animation = requestAnimationFrame(frame);
  }
  function fitDiagram(smooth = true) {
    if (!state.visible.length || svg.clientWidth === 0) return;
    const ps = state.visible.map(t => layout(t.id));
    const minX = Math.min(...ps.map(p => p.x)) - 27, minY = Math.min(...ps.map(p => p.y)) - 42;
    const width = Math.max(...ps.map(p => p.x + p.width)) - minX + 38, height = Math.max(...ps.map(p => p.y + p.height)) - minY + 25;
    const scale = Math.min(1.12, (svg.clientWidth - 65) / width, (svg.clientHeight - 115) / height);
    animateTo((svg.clientWidth - width * scale) / 2 - minX * scale, 51 + (svg.clientHeight - 115 - height * scale) / 2 - minY * scale, Math.max(.012, scale), smooth);
  }
  function zoom(factor, x = svg.clientWidth / 2, y = svg.clientHeight / 2, smooth = true) {
    const scale = Math.max(.012, Math.min(2.8, state.scale * factor));
    animateTo(x - (x - state.x) * scale / state.scale, y - (y - state.y) * scale / state.scale, scale, smooth);
  }
  $('#zoomIn').addEventListener('click', () => zoom(1.25)); $('#zoomOut').addEventListener('click', () => zoom(.8)); $('#fitButton').addEventListener('click', () => fitDiagram());
  $('#resetLayout').addEventListener('click', () => { D.layouts = JSON.parse(JSON.stringify(originalLayouts)); D.neighborhoodLayouts = JSON.parse(JSON.stringify(originalNeighborhoods)); renderDiagram(); fitDiagram(); toast('Original data-defined layout restored'); });
  svg.addEventListener('wheel', e => { e.preventDefault(); const box = svg.getBoundingClientRect(); zoom(Math.exp(-Math.max(-100, Math.min(100, e.deltaY)) * .003), e.clientX - box.left, e.clientY - box.top, false); }, { passive: false });
  svg.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    cancelAnimationFrame(animation); const node = e.target.closest('[data-object]');
    const id = node?.dataset.object, p = id && layout(id);
    drag = { id, startX: e.clientX, startY: e.clientY, x: state.x, y: state.y, nodeX: p?.x, nodeY: p?.y, moved: false, pointer: e.pointerId };
    svg.setPointerCapture(e.pointerId); svg.classList.add('dragging');
  });
  svg.addEventListener('pointermove', e => {
    if (!drag || drag.pointer !== e.pointerId) return;
    const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    if (!drag.moved) return;
    if (drag.id) {
      const p = layout(drag.id); p.x = drag.nodeX + dx / state.scale; p.y = drag.nodeY + dy / state.scale;
      const node = $$('[data-object]', svg).find(n => n.dataset.object === drag.id); node?.setAttribute('transform', `translate(${p.x} ${p.y})`); drawEdges();
    } else { state.x = drag.x + dx; state.y = drag.y + dy; transform(); }
  });
  svg.addEventListener('pointerup', e => {
    if (!drag || drag.pointer !== e.pointerId) return;
    const prior = drag; drag = null; svg.classList.remove('dragging'); svg.releasePointerCapture(e.pointerId);
    if (!prior.moved) {
      if (prior.id) selectTable(prior.id);
      else if (!e.target.closest('[data-relationship]')) closeInspector();
      else showRelationship(e.target.closest('[data-relationship]').dataset.relationship);
    }
  });
  svg.addEventListener('pointercancel', () => { drag = null; svg.classList.remove('dragging'); });
  svg.addEventListener('keydown', e => {
    const node = e.target.closest('[data-object]');
    if (node && ['Enter', ' '].includes(e.key)) { e.preventDefault(); selectTable(node.dataset.object); $('#closeInspector').focus(); return; }
    if (node && /^Arrow/.test(e.key)) {
      e.preventDefault(); const p = layout(node.dataset.object), axis = /Left|Right/.test(e.key) ? 'x' : 'y', sign = /Left|Up/.test(e.key) ? -1 : 1;
      const next = state.visible.filter(t => t.id !== node.dataset.object).map(t => ({ id: t.id, p: layout(t.id) })).filter(t => (t.p[axis] - p[axis]) * sign > 10).sort((a, b) => {
        const score = t => Math.abs(t.p[axis] - p[axis]) + 2 * Math.abs(t.p[axis === 'x' ? 'y' : 'x'] - p[axis === 'x' ? 'y' : 'x']); return score(a) - score(b);
      })[0];
      if (next) $$('[data-object]', svg).find(n => n.dataset.object === next.id)?.focus(); return;
    }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoom(1.25); } else if (e.key === '-') { e.preventDefault(); zoom(.8); } else if (e.key === '0') { e.preventDefault(); fitDiagram(); } else if (e.key === 'Escape') closeInspector();
  });
  new ResizeObserver(() => { if (initializedDiagram && !$('#panel-diagram').hidden) fitDiagram(false); }).observe($('#canvasShell'));

  function selectTable(id) {
    state.selected = id; const t = objects.get(id); if (!t) return;
    $('#inspector').hidden = false;
    const rel = links(t), columnList = t.columns.slice(0, 8);
    $('#inspectorContent').innerHTML = `${tag(t)}<h3>${esc(t.name)}</h3><p class="detail-description">${esc(t.guide)}</p><div class="detail-stats"><span><strong>${t.columns.length}</strong>columns</span><span><strong>${rel.length}</strong>links</span></div><h4 class="small-section-title">${t.columns.length > 8 ? 'First 8 columns' : 'Columns'}</h4><ul class="mini-columns">${columnList.map(c => `<li><code>${esc(c.name)}</code>${badges(t, c)}<small>${esc(columnType(c))}</small></li>`).join('')}</ul><button class="button primary" data-explore="${esc(id)}">Explore ${t.columns.length} columns ${icon('arrow')}</button>${viewIds.has(id) ? `<p class="detail-description">${t.dependencies.length ? 'Reads from: ' + t.dependencies.map(x => esc(x.name)).join(', ') : 'Empty typed view; canonical hours workflow remains authoritative.'}</p>` : `<h4 class="small-section-title">Connected tables</h4>${rel.length ? rel.slice(0, 12).map(r => relationshipMarkup(r, t)).join('') : '<p class="detail-description">No declared foreign-key relationships.</p>'}${rel.length > 12 ? `<p class="detail-description">${rel.length - 12} more links in Tables Explorer.</p>` : ''}`}`;
    renderDiagram();
  }
  function closeInspector() { state.selected = null; $('#inspector').hidden = true; renderDiagram(); }
  $('#closeInspector').addEventListener('click', () => { const id = state.selected; closeInspector(); $$('[data-object]', svg).find(n => n.dataset.object === id)?.focus(); });
  function relationshipMarkup(r, t) {
    const outgoing = r.child === t.id, other = outgoing ? r.parent : r.child;
    return `<div class="relationship-item"><button class="text-button" data-explore="${esc(other)}">${outgoing ? '↗' : '↙'} ${esc(objects.get(other).name)}</button><p>${outgoing ? 'References parent' : 'Referenced by child'} · ${r.optional ? 'optional parent' : 'required parent'} · ${r.uniqueChild ? 'at most one child' : 'zero or more children'}</p><p>${r.columns.map(c => `<code>${esc(c.childColumn)}</code> → <code>${esc(c.parentColumn)}</code>`).join('<br>')}</p></div>`;
  }
  function openExplorer(id) {
    state.explorerKind = viewIds.has(id) ? 'views' : 'tables'; state.explorerId = id; state.search = ''; state.explorerGroup = 'all'; $('#explorerSearch').value = ''; $('#explorerGroup').value = 'all'; setTab('explorer');
  }
  document.addEventListener('click', e => {
    const explore = e.target.closest('[data-explore]'); if (explore) openExplorer(explore.dataset.explore);
    const sql = e.target.closest('[data-sql]'); if (sql) { $('#sqlScope').value = sql.dataset.sql; setTab('sql'); }
    const focus = e.target.closest('[data-focus-table]'); if (focus) {
      const id = focus.dataset.focusTable, t = objects.get(id); state.group = groupOf(t); $('#groupSelect').value = state.group; state.selected = null; renderGroups(); setTab('er'); selectTable(id); requestAnimationFrame(() => fitDiagram(true));
    }
  });

  function renderExplorer() {
    for (const b of $$('.segmented [data-kind]')) { const on = b.dataset.kind === state.explorerKind; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); }
    $('#explorerGroup').disabled = state.explorerKind === 'views';
    const source = state.explorerKind === 'views' ? D.views : D.tables;
    const filtered = source.filter(t => (state.explorerKind === 'views' || state.explorerGroup === 'all' || t.group === state.explorerGroup) && matches(t, state.search));
    if (!filtered.some(t => t.id === state.explorerId)) state.explorerId = filtered[0]?.id || null;
    $('#explorerCount').textContent = `${filtered.length} ${state.explorerKind === 'views' ? 'compatibility views · not physical tables' : 'physical tables'}`;
    $('#objectList').innerHTML = filtered.length ? filtered.map(t => `<button data-list-object="${esc(t.id)}" class="g-${groupOf(t)}${state.explorerId === t.id ? ' active' : ''}" aria-current="${state.explorerId === t.id ? 'true' : 'false'}"><span class="domain-dot"></span><span>${esc(t.name)}</span><small>${t.columns.length}</small></button>`).join('') : '<p class="empty-state">No matching objects.<br>Try a column name or a different domain.</p>';
    renderDetail(state.explorerId);
  }
  $('#objectList').addEventListener('click', e => { const b = e.target.closest('[data-list-object]'); if (b) { state.explorerId = b.dataset.listObject; renderExplorer(); } });
  for (const b of $$('.segmented [data-kind]')) b.addEventListener('click', () => { state.explorerKind = b.dataset.kind; state.explorerId = null; renderExplorer(); });
  $('#explorerSearch').addEventListener('input', e => { state.search = e.target.value; renderExplorer(); });
  $('#explorerGroup').addEventListener('change', e => { state.explorerGroup = e.target.value; renderExplorer(); });
  function columnNotes(t, c) {
    const parts = [];
    if (c.description) parts.push(esc(c.description));
    if (c.identitySeed !== undefined) parts.push(`Auto-number: seed ${esc(c.identitySeed)}, step ${esc(c.identityIncrement)}.`);
    if (c.defaultDefinition !== undefined) parts.push(`Default <code>${esc(c.defaultDefinition)}</code>`);
    if (c.computedDefinition) parts.push(`Computed${c.persisted ? ' & stored' : ''}: <code>${esc(c.computedDefinition)}</code>`);
    for (const r of childLinks(t).filter(r => r.columns.some(k => k.childColumn === c.name))) parts.push(`References <button class="text-button" data-explore="${esc(r.parent)}">${esc(r.parentTable)}</button> <code>${esc(r.columns.find(k => k.childColumn === c.name).parentColumn)}</code>`);
    if (c.collation && !parts.length) parts.push(`<span title="SQL Server text comparison and sorting rules">${esc(c.collation)}</span>`);
    return parts.join('<br>') || '—';
  }
  function renderDetail(id) {
    const t = objects.get(id), mount = $('#objectDetail');
    if (!t) { mount.innerHTML = `<div class="empty-state">${icon('search')}No matching object. Adjust your search or domain filter.</div>`; return; }
    const view = viewIds.has(id), allLinks = links(t);
    mount.innerHTML = `<div class="detail-topline">${tag(t)}<button class="button secondary" data-sql="${view ? 'views' : esc(t.id)}">${icon('code')}View SQL</button></div><h2>${esc(t.name)}</h2><code class="inline-code">${esc(t.schema)}.${esc(t.name)}</code><p class="detail-description">${esc(t.guide)}</p>${view ? '<div class="rule-guide-note">Compatibility view · not one of the 136 physical tables. Its projected columns do not contribute to the physical-column count.</div>' : ''}<div class="detail-stats"><span><strong>${t.columns.length}</strong>columns</span><span><strong>${allLinks.length}</strong>foreign-key links</span><span><strong>${(t.indexes || []).length}</strong>indexes</span>${view ? '' : `<button class="text-button" data-focus-table="${esc(t.id)}">Find on diagram ${icon('arrow')}</button>`}</div><section class="detail-section"><h3>Columns <span class="rule-summary-count">/ ${t.columns.length}</span></h3><div class="detail-table-wrap"><table class="detail-table"><thead><tr><th>#</th><th>Column</th><th>SQL Server type</th><th>Keys</th><th>Nullability</th><th>Definition &amp; references</th></tr></thead><tbody>${t.columns.map(c => `<tr><td class="column-number">${c.ordinal}</td><td><code>${esc(c.name)}</code></td><td><code>${esc(columnType(c))}</code></td><td>${badges(t, c) || '<span class="nullable">—</span>'}</td><td><span class="${c.nullable ? 'nullable' : 'not-null'}">${c.nullable ? 'NULL allowed' : 'NOT NULL'}</span></td><td class="column-details">${columnNotes(t, c)}</td></tr>`).join('')}</tbody></table></div><p class="detail-description">PK = primary key · FK = foreign key · UQ = part of a unique constraint or index. Composite keys enforce the whole column combination, not each column individually.</p></section>${view ? `<section class="detail-section"><h3>Underlying objects</h3>${t.dependencies.length ? t.dependencies.map(dep => `<div class="relationship-item"><button class="text-button" data-explore="${esc(dep.schema + '.' + dep.name)}">${icon('table')}${esc(dep.schema)}.${esc(dep.name)}</button></div>`).join('') : '<p class="detail-description">This is an empty typed compatibility shape; it does not read a retired physical table.</p>'}<h3 class="small-section-title">Actual view definition</h3><pre class="view-definition">${esc(t.definition)}</pre></section>` : `<section class="detail-section"><h3>Relationships <span class="rule-summary-count">/ ${allLinks.length}</span></h3><div class="detail-link-grid">${allLinks.length ? allLinks.map(r => relationshipMarkup(r, t)).join('') : '<p class="detail-description">No declared SQL foreign keys. Application-level associations are not invented here.</p>'}</div></section><section class="detail-section"><h3>Keys &amp; indexes <span class="rule-summary-count">/ ${t.indexes.length}</span></h3>${t.indexes.map(i => `<div class="constraint-item"><strong>${esc(i.name)}</strong><p>${i.primaryKey ? 'Primary key' : i.uniqueConstraint ? 'Unique constraint' : i.unique ? 'Unique index' : 'Index'} · ${esc(i.type.toLowerCase())}${i.disabled ? ' · DISABLED' : ''}</p><code>${esc(i.columns.filter(c => !c.included).map(c => c.name + (c.descendingKey ? ' DESC' : ' ASC')).join(', '))}</code>${i.columns.some(c => c.included) ? `<p>Included: ${esc(i.columns.filter(c => c.included).map(c => c.name).join(', '))}</p>` : ''}${i.filterDefinition ? `<p>Only rows matching: <code>${esc(i.filterDefinition)}</code></p>` : ''}</div>`).join('')}</section><section class="detail-section"><h3>Check constraints <span class="rule-summary-count">/ ${t.checks.length}</span></h3>${t.checks.map(c => `<div class="constraint-item"><strong>${esc(c.name)}</strong><code>${esc(c.definition)}</code><p>${c.notTrusted ? 'Not trusted' : 'Trusted'} · ${c.disabled ? 'Disabled' : 'Enabled'}</p></div>`).join('') || '<p class="detail-description">No declared CHECK constraints.</p>'}</section>${D.triggers.some(tr => tr.parentSchema + '.' + tr.parentName === t.id) ? `<section class="detail-section"><h3>Trigger rules</h3>${D.triggers.filter(tr => tr.parentSchema + '.' + tr.parentName === t.id).map(tr => `<details class="rule-card"><summary><h3>${esc(tr.name)}</h3></summary><pre class="view-definition">${esc(tr.definition)}</pre></details>`).join('')}</section>` : ''}`}`;
  }

  $('#globalSearch').addEventListener('input', e => {
    const search = e.target.value.trim(); $('#suggestions').hidden = !search; e.target.setAttribute('aria-expanded', !!search);
    if (!search) return;
    const found = [...D.tables, ...D.views].filter(t => matches(t, search)).sort((a, b) => Number(b.name.toLowerCase().includes(search.toLowerCase())) - Number(a.name.toLowerCase().includes(search.toLowerCase()))).slice(0, 8);
    $('#suggestions').innerHTML = found.length ? found.map(t => `<button data-explore="${esc(t.id)}">${esc(t.name)}<small>${viewIds.has(t.id) ? 'Compatibility view' : groupLabel(t)} · ${t.columns.length} columns</small></button>`).join('') : '<p>No matching tables, views or columns.</p>';
  });
  $('#globalSearch').addEventListener('keydown', e => {
    if (e.key === 'Escape') { $('#suggestions').hidden = true; e.target.setAttribute('aria-expanded', false); }
    if (e.key === 'ArrowDown') { e.preventDefault(); $('#suggestions button')?.focus(); }
    if (e.key === 'Enter') {
      const search = e.target.value; state.search = search; state.explorerKind = 'tables'; state.explorerGroup = 'all'; $('#explorerSearch').value = search; $('#explorerGroup').value = 'all'; setTab('explorer'); $('#suggestions').hidden = true; e.target.setAttribute('aria-expanded', false);
    }
  });
  $('#suggestions').addEventListener('click', () => { $('#suggestions').hidden = true; $('#globalSearch').setAttribute('aria-expanded', false); });
  document.addEventListener('click', e => { if (!e.target.closest('.global-search')) { $('#suggestions').hidden = true; $('#globalSearch').setAttribute('aria-expanded', false); } });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { e.preventDefault(); if (getComputedStyle($('.global-search')).display !== 'none') $('#globalSearch').focus(); else { setTab('explorer'); $('#explorerSearch').focus(); } }
    if (e.key === 'Escape' && !$('#infoDialog').open) { $('#suggestions').hidden = true; if (state.selected) closeInspector(); }
  });

  function indexColumns(i) { return i.columns.filter(c => !c.included).map(c => `${q(c.name)} ${c.descendingKey ? 'DESC' : 'ASC'}`).join(', '); }
  function columnSql(c) {
    if (c.computedDefinition) return `  ${q(c.name)} AS ${c.computedDefinition}${c.persisted ? ' PERSISTED' : ''}`;
    let sql = `  ${q(c.name)} ${columnType(c)}`;
    if (c.collation) sql += ` COLLATE ${c.collation}`;
    if (c.identitySeed !== undefined) sql += ` IDENTITY(${c.identitySeed},${c.identityIncrement})`;
    if (c.rowGuid) sql += ' ROWGUIDCOL'; if (c.sparse) sql += ' SPARSE';
    sql += c.nullable ? ' NULL' : ' NOT NULL';
    if (c.defaultDefinition !== undefined) sql += ` CONSTRAINT ${q(c.defaultName)} DEFAULT ${c.defaultDefinition}`;
    return sql;
  }
  function createTableSql(t) {
    const definitions = t.columns.map(columnSql);
    for (const i of t.indexes.filter(i => i.primaryKey || i.uniqueConstraint)) definitions.push(`  CONSTRAINT ${q(i.name)} ${i.primaryKey ? 'PRIMARY KEY' : 'UNIQUE'} ${i.type} (${indexColumns(i)})`);
    // Checks are added afterward so their trust/disabled state can be preserved exactly.
    return `-- ${t.name}\nCREATE TABLE ${full(t)} (\n${definitions.join(',\n')}\n);\nGO`;
  }
  function createIndexesSql(t) {
    return t.indexes.filter(i => !i.primaryKey && !i.uniqueConstraint).map(i => {
      const included = i.columns.filter(c => c.included);
      const opts = [`IGNORE_DUP_KEY = ${i.ignoreDupKey ? 'ON' : 'OFF'}`, `ALLOW_ROW_LOCKS = ${i.allowRowLocks ? 'ON' : 'OFF'}`, `ALLOW_PAGE_LOCKS = ${i.allowPageLocks ? 'ON' : 'OFF'}`];
      if (i.fillFactor) opts.push(`FILLFACTOR = ${i.fillFactor}`);
      return `CREATE ${i.unique ? 'UNIQUE ' : ''}${i.type} INDEX ${q(i.name)}\nON ${full(t)} (${indexColumns(i)})${included.length ? '\nINCLUDE (' + included.map(c => q(c.name)).join(', ') + ')' : ''}${i.filterDefinition ? '\nWHERE ' + i.filterDefinition : ''}\nWITH (${opts.join(', ')});${i.disabled ? '\nALTER INDEX ' + q(i.name) + ' ON ' + full(t) + ' DISABLE;' : ''}\nGO`;
    }).join('\n\n');
  }
  function checkSql(t, c) { return `ALTER TABLE ${full(t)} WITH ${c.notTrusted ? 'NOCHECK' : 'CHECK'} ADD CONSTRAINT ${q(c.name)} CHECK${c.notForReplication ? ' NOT FOR REPLICATION' : ''} ${c.definition};\nALTER TABLE ${full(t)} ${c.disabled ? 'NOCHECK' : 'CHECK'} CONSTRAINT ${q(c.name)};\nGO`; }
  function foreignKeySql(r) {
    const action = s => s.replace(/_/g, ' ');
    return `ALTER TABLE ${q(r.childSchema)}.${q(r.childTable)} WITH ${r.notTrusted ? 'NOCHECK' : 'CHECK'} ADD CONSTRAINT ${q(r.name)}\nFOREIGN KEY (${r.columns.map(c => q(c.childColumn)).join(', ')})\nREFERENCES ${q(r.parentSchema)}.${q(r.parentTable)} (${r.columns.map(c => q(c.parentColumn)).join(', ')})\nON DELETE ${action(r.onDelete)} ON UPDATE ${action(r.onUpdate)}${r.notForReplication ? ' NOT FOR REPLICATION' : ''};\nALTER TABLE ${q(r.childSchema)}.${q(r.childTable)} ${r.disabled ? 'NOCHECK' : 'CHECK'} CONSTRAINT ${q(r.name)};\nGO`;
  }
  const sqlHeader = `-- WUSOOL — وصول | ${D.databaseName}\n-- Read-only schema snapshot: ${D.capturedAt}\n-- Source: SQL Server system catalogs; ${D.counts.tables} physical tables, ${D.counts.columns} table columns, ${D.counts.relationships} foreign keys.\n-- Reference DDL only. No business rows. Not a backup or a full deployment script.\n-- Triggers and compatibility CUD procedures are not included in table DDL.\n-- The application must retain its existing Identity, security and authorized service configuration.\n\nSET ANSI_NULLS ON;\nSET QUOTED_IDENTIFIER ON;\nSET ANSI_PADDING ON;\nSET ANSI_WARNINGS ON;\nSET ARITHABORT ON;\nSET CONCAT_NULL_YIELDS_NULL ON;\nSET NUMERIC_ROUNDABORT OFF;\nGO\n\n`;
  function generateSql(scope = 'all') {
    if (scope === 'views') return sqlHeader + '-- COMPATIBILITY VIEWS — separate from physical tables.\n-- Underlying canonical tables must already exist. View triggers/CUD procedures are documented separately.\n\n' + D.views.map(v => `${v.definition.trim().replace(/;?$/, ';')}\nGO`).join('\n\n');
    const selected = scope === 'all' ? D.tables : [tables.get(scope)].filter(Boolean), ids = new Set(selected.map(t => t.id));
    return sqlHeader + (scope !== 'all' ? '-- SINGLE TABLE: referenced parent tables must already exist.\n\n' : '') + '-- 01 / PHYSICAL TABLES AND CANDIDATE KEYS\n\n' + selected.map(createTableSql).join('\n\n') + '\n\n-- 02 / INDEXES (unique indexes are created before foreign keys)\n\n' + selected.map(createIndexesSql).filter(Boolean).join('\n\n') + '\n\n-- 03 / CHECK CONSTRAINTS\n\n' + selected.flatMap(t => t.checks.map(c => checkSql(t, c))).join('\n\n') + '\n\n-- 04 / FOREIGN KEYS\n\n' + D.relationships.filter(r => ids.has(r.child)).map(foreignKeySql).join('\n\n') + '\n';
  }
  // Expose a read-only testing/export surface; it cannot connect to or modify SQL Server.
  window.WusoolAtlas = Object.freeze({ generateSql, validate: validateData, counts: Object.freeze({ ...D.counts }) });
  $('#sqlScope').insertAdjacentHTML('beforeend', D.groups.map(g => `<optgroup label="${esc(g.label)}">${D.tables.filter(t => t.group === g.id).map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</optgroup>`).join(''));
  let currentSql = '';
  function safeSqlMarkup(sql) {
    const pattern = /--[^\n]*|'(?:''|[^'])*'|\[(?:\]\]|[^\]])*\]|\b(?:CREATE|TABLE|CONSTRAINT|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|UNIQUE|INDEX|CLUSTERED|NONCLUSTERED|DEFAULT|CHECK|NOCHECK|WITH|ALTER|GO|ON|DELETE|UPDATE|NO|ACTION|CASCADE|SET|AS|PERSISTED|IDENTITY|COLLATE|INCLUDE|WHERE|ASC|DESC|VIEW|SELECT|FROM|AND|OR|CAST|CASE|WHEN|THEN|ELSE|END|OFF|DISABLE)\b|\b(?:nvarchar|varchar|varbinary|binary|uniqueidentifier|datetimeoffset|decimal|date|float|bit|int|bigint)\b|\b\d+\b/gi;
    let cursor = 0, result = ''; for (const match of sql.matchAll(pattern)) {
      result += esc(sql.slice(cursor, match.index)); const token = match[0];
      const cls = token.startsWith('--') ? 'sql-comment' : token.startsWith("'") ? 'sql-string' : token.startsWith('[') ? '' : /^\d+$/.test(token) ? 'sql-number' : /^(nvarchar|varchar|varbinary|binary|uniqueidentifier|datetimeoffset|decimal|date|float|bit|int|bigint)$/i.test(token) ? 'sql-type' : 'sql-keyword';
      result += cls ? `<span class="${cls}">${esc(token)}</span>` : esc(token); cursor = match.index + token.length;
    } return result + esc(sql.slice(cursor));
  }
  function renderSql() {
    const scope = $('#sqlScope').value; currentSql = generateSql(scope);
    $('#sqlCode').innerHTML = safeSqlMarkup(currentSql); $('#sqlPre').scrollTop = 0;
    $('#sqlFilename').textContent = scope === 'all' ? 'wusool-schema.sql' : scope === 'views' ? 'wusool-compatibility-views.sql' : `${tables.get(scope).name}.sql`;
    $('#sqlMeta').textContent = `${number(currentSql.split('\n').length)} lines · ${number(new TextEncoder().encode(currentSql).length)} bytes`;
  }
  $('#sqlScope').addEventListener('change', renderSql);
  function downloadSql(scope = $('#sqlScope').value) {
    const sql = generateSql(scope), blob = new Blob([sql], { type: 'text/plain;charset=utf-8' }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = scope === 'all' ? 'wusool-schema.sql' : scope === 'views' ? 'wusool-compatibility-views.sql' : `${tables.get(scope).name}.sql`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 15000); toast('SQL reference downloaded');
  }
  $('#downloadSql').addEventListener('click', () => downloadSql()); $('#exportButton').addEventListener('click', () => downloadSql('all'));
  $('#copySql').addEventListener('click', async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(currentSql);
      else { const selection = getSelection(), range = document.createRange(); range.selectNodeContents($('#sqlCode')); selection.removeAllRanges(); selection.addRange(range); const copied = document.execCommand('copy'); selection.removeAllRanges(); if (!copied) throw new Error('Clipboard unavailable'); }
      toast('SQL copied to clipboard');
    } catch { toast('Clipboard permission unavailable. Select the script or use Download .sql.'); }
  });

  const rules = [];
  function addRule(category, title, subtitle, explanation, sql = '', tableId = null) { rules.push({ category, title, subtitle, explanation, sql, tableId }); }
  addRule('guide', 'Start here: a table is a collection of records', 'The simple mental model', 'A table is like a structured worksheet. Each row is one record and each column is a named field with a fixed SQL Server type. A primary key identifies a record. A foreign key connects a child record to a real parent. This atlas exports definitions only, never the records themselves.');
  addRule('guide', 'How to read crow’s-foot relationships', 'One parent, zero or more children', 'The straight-line end identifies the parent. The crow’s foot identifies the many side. A circle means zero is allowed. NOT NULL foreign-key columns make the parent mandatory for a child. Nullable keys can make the parent optional. SQL Server does not require every parent to have a child. A unique child key limits the child side to at most one. Composite keys are evaluated as a combination.');
  addRule('guide', 'Tenant boundaries stay attached to the relationship', 'Composite keys preserve the complete owner identity', 'Where a foreign key includes an organization or branch column alongside an ID, SQL Server checks the whole tuple. A matching ID alone is not sufficient. These constraints support ownership boundaries; application authorization and roles are still enforced by the existing backend.');
  addRule('guide', 'Canonical storage, compatible application shapes', '136 physical tables + 20 separate views', 'The twenty v136_ objects are SQL views, not extra storage tables. They project canonical tables into familiar application shapes. Their INSTEAD OF triggers and CUD procedures preserve the compatibility write contract. The three legacy-hours views are empty typed projections; canonical operating schedules remain authoritative.');
  addRule('guide', 'Inline components have explicit presence', 'Career, proposal and entitlement data', 'UserProfiles, Bookings and Subscriptions retain inline component columns. Presence flags distinguish an absent component from an existing component with nullable fields. The actual CHECK expressions and enabled parent-delete guard triggers are documented below. Clear the child component through the authorized workflow before deleting its parent.');
  addRule('guide', 'Deletion follows the declared foreign-key action', 'NO ACTION is a protection, not a missing feature', 'ON DELETE NO ACTION rejects a parent deletion while a referencing child remains. It does not silently erase dependent records. CASCADE, SET NULL and SET DEFAULT act only where the actual relationship explicitly declares them. Inspect any foreign key below to see its exact deletion and update actions.');
  addRule('guide', 'Unique means the complete key combination', 'Filtered indexes apply only to matching rows', 'A unique index on multiple columns prevents repeated combinations, not repeated values in every individual column. If an index has a WHERE clause, its uniqueness applies only to the matching subset. UQ badges indicate participation; the complete key definition is available in Tables Explorer.');
  addRule('guide', 'Eager loading keeps query counts predictable', 'An application query pattern, not a SQL constraint', 'The existing EF Core application disables lazy loading. Include graphs and SQL-translated projections fetch related data together instead of issuing a new query for every row. Migration verification sampled eager reads at limits 1, 10 and 100 and catalog listings used a fixed count-plus-data pair. This is bounded-query evidence on available data, not a claim that every possible workflow was load-tested.');
  addRule('guide', 'Keep database rules and application rules distinct', 'Trust the definition, not an inferred story', 'Foreign keys, NOT NULL, keys, defaults, CHECK constraints and triggers below come from the deployed SQL catalog. Guide descriptions explain names and architecture evidence; they do not invent status transitions, payment policies or authorization rules. Application-only rules and immutable-history protections still live in the backend and are not automatically implied by a column name.');
  for (const r of D.relationships) addRule('relationship', r.name, `${r.childTable} → ${r.parentTable}`, `Each child uses ${r.columns.map(c => c.childColumn).join(' + ')} to reference ${r.columns.map(c => c.parentColumn).join(' + ')} on ${r.parentTable}. ${r.optional ? 'At least one FK component accepts NULL, so an incomplete nullable tuple is not required to match a parent.' : 'All FK components are NOT NULL, so a parent is required.'} ${r.uniqueChild ? 'A unique child key allows at most one child per matching key.' : 'Multiple children can reference the same parent.'} Delete action: ${r.onDelete.replace(/_/g, ' ')}. Update action: ${r.onUpdate.replace(/_/g, ' ')}. ${r.notTrusted ? 'Not trusted.' : 'Trusted and validated.'}`, foreignKeySql(r), r.child);
  for (const t of D.tables) {
    for (const c of t.checks) addRule('check', c.name, t.name, 'SQL Server rejects changes when this CHECK expression evaluates to FALSE. UNKNOWN from nullable values can pass a CHECK; NOT NULL constraints and the full expression determine what is allowed. Read the actual expression below rather than assuming a column name defines a policy.', c.definition, t.id);
    for (const i of t.indexes.filter(i => i.unique)) addRule('unique', i.name, `${t.name} · ${i.primaryKey ? 'primary key' : i.uniqueConstraint ? 'unique constraint' : 'unique index'}`, `${i.primaryKey ? 'Identifies each record and requires non-null key columns.' : 'Prevents duplicate values for this complete key combination.'} Columns: ${i.columns.filter(c => !c.included).map(c => c.name).join(' + ')}.${i.filterDefinition ? ' Only rows matching the filter are covered.' : ''}`, `${i.primaryKey ? 'PRIMARY KEY' : 'UNIQUE'} ${i.type} (${indexColumns(i)})${i.filterDefinition ? '\nWHERE ' + i.filterDefinition : ''}`, t.id);
    for (const c of t.columns) {
      if (c.defaultDefinition !== undefined) addRule('default', c.defaultName, `${t.name}.${c.name}`, 'If an INSERT omits this column, SQL Server supplies the default expression below. A default does not overwrite values explicitly supplied by the application, and it is not a validation constraint.', `DEFAULT ${c.defaultDefinition} FOR ${q(c.name)}`, t.id);
      if (c.computedDefinition) addRule('computed', `${t.name}.${c.name}`, `${t.name} · computed column`, `SQL Server derives this field from the expression below; applications do not supply a normal stored value.${c.persisted ? ' PERSISTED means the calculated result is physically stored.' : ''}`, `${c.computedDefinition}${c.persisted ? ' PERSISTED' : ''}`, t.id);
    }
  }
  for (const tr of D.triggers) addRule('trigger', tr.name, `${tr.parentName} · ${tr.disabled ? 'disabled' : 'enabled'}`, /DeleteGuard/.test(tr.name) ? 'Blocks deleting a parent while its retained inline child component is present. The guard runs for direct SQL and multirow statements as well as normal application writes.' : /blocked/.test(tr.name) ? 'Rejects writes to the empty legacy-hours compatibility view. Use the canonical operating-schedule workflow.' : 'Implements the deployed compatibility write behavior for this view. It applies the real SQL mapping and rejects mismatched row counts or invalid changes. The complete deployed trigger definition appears below.', tr.definition, objects.has(`${tr.parentSchema}.${tr.parentName}`) ? `${tr.parentSchema}.${tr.parentName}` : null);
  const ruleLabels = { guide: 'Guide', relationship: 'Foreign key', check: 'Check', unique: 'Unique / PK', default: 'Default', computed: 'Computed', trigger: 'Trigger' };
  $('#rulesOverview').innerHTML = [
    ['link', `${D.counts.relationships} real connections`, 'Foreign keys connect actual columns. Composite keys keep ownership and scope together.'],
    ['shield', `${D.counts.checks} check constraints`, 'SQL expressions protect valid combinations, presence flags and allowed values.'],
    ['key', 'Identity stays intact', 'Users, roles and permissions remain in their original Identity and security tables.']
  ].map(([i, title, body]) => `<div class="rule-overview-card">${icon(i)}<h3>${esc(title)}</h3><p>${esc(body)}</p></div>`).join('');
  function renderRules() {
    const category = $('#rulesCategory').value, search = $('#rulesSearch').value.toLowerCase().trim();
    const found = rules.filter(r => (category === 'all' || r.category === category) && (!search || `${r.title} ${r.subtitle} ${r.explanation} ${r.sql}`.toLowerCase().includes(search)));
    const size = 30, pages = Math.max(1, Math.ceil(found.length / size)); state.rulesPage = Math.min(state.rulesPage, pages - 1);
    $('#rulesCount').textContent = `${found.length} entries`;
    $('#rulesList').innerHTML = found.slice(state.rulesPage * size, (state.rulesPage + 1) * size).map(r => `<details class="rule-card"><summary><span class="rule-label">${ruleLabels[r.category]}</span><div><h3>${esc(r.title)}</h3><p>${esc(r.subtitle)}</p></div></summary><div class="rule-body"><p>${esc(r.explanation)}</p>${r.sql ? `<pre>${esc(r.sql)}</pre>` : ''}${r.tableId ? `<button class="button secondary" data-explore="${esc(r.tableId)}">Explore ${esc(objects.get(r.tableId).name)} ${icon('arrow')}</button>` : ''}</div></details>`).join('') || `<div class="empty-state">${icon('search')}No matching rules. Try a table name or choose another rule type.</div>`;
    if (pages > 1) $('#rulesList').insertAdjacentHTML('beforeend', `<nav class="pagination" aria-label="Rule pages"><button class="button secondary" id="rulesPrev"${state.rulesPage === 0 ? ' disabled' : ''}>← Previous</button><span>Page ${state.rulesPage + 1} of ${pages}</span><button class="button secondary" id="rulesNext"${state.rulesPage === pages - 1 ? ' disabled' : ''}>Next →</button></nav>`);
    $('#rulesPrev')?.addEventListener('click', () => { state.rulesPage--; renderRules(); $('#rulesList').scrollIntoView({ block: 'start', behavior: 'instant' }); });
    $('#rulesNext')?.addEventListener('click', () => { state.rulesPage++; renderRules(); $('#rulesList').scrollIntoView({ block: 'start', behavior: 'instant' }); });
  }
  $('#rulesSearch').addEventListener('input', () => { state.rulesPage = 0; renderRules(); }); $('#rulesCategory').addEventListener('change', () => { state.rulesPage = 0; renderRules(); });

  function showDialog(title, body, eyebrow = 'DATABASE ATLAS') { $('#dialogTitle').textContent = title; $('#dialogEyebrow').textContent = eyebrow; $('#dialogContent').innerHTML = body; $('#infoDialog').showModal(); }
  function showSnapshot() {
    showDialog('A snapshot you can trace.', `<p>This atlas describes the actual deployed <strong>${esc(D.databaseName)}</strong> SQL Server schema. It is a static, offline-capable reference and never connects to the database.</p><div class="snapshot-facts"><div>Captured at (UTC)<strong>${esc(new Date(D.capturedAt).toISOString().replace('T', ' ').slice(0, 19))}</strong></div><div>Object inventory<strong>${D.counts.tables} tables / ${D.counts.views} views</strong></div><div>Physical table columns<strong>${number(D.counts.columns)}</strong></div><div>Foreign-key relationships<strong>${D.counts.relationships}</strong></div></div><h3>Validation</h3><p>${esc(D.provenance.crossCheck)}</p><h3>What is included</h3><p>Actual column types and nullability; primary, foreign and unique keys; defaults; computed expressions; indexes; check constraints; compatibility views; and trigger definitions. Diagrams and generated SQL use database-data.js as their source.</p><h3>What is not included</h3><p>${esc(D.provenance.scope)}</p><p>${esc(D.provenance.descriptions)}</p><p>${esc(D.provenance.sqlScope)}</p>`, 'SOURCE & PROVENANCE');
  }
  function showHelp() {
    showDialog('A little orientation.', `<p>Start with a domain for a readable map. <strong>All physical tables</strong> gives the complete overview; zoom in to inspect it. Compatibility views have their own separate map and explorer list.</p><p>Choose a table to highlight its immediate connections. Select <strong>Explore columns</strong> for complete column, key and relationship definitions. Drag table cards to arrange them; Reset restores the layouts in the data file.</p><h3>Relationship notation</h3><p><code>││</code> = exactly one parent. <code>○│</code> = zero or one. <code>○&lt;</code> = zero or many children. One composite foreign key is one relationship, even when it connects several columns. A UQ badge can be part of a composite or filtered key.</p><h3>Keyboard &amp; gestures</h3><div class="keyboard-list"><kbd>/</kbd><span>Search tables and columns</span><kbd>← →</kbd><span>Switch tabs when a tab is focused</span><kbd>Arrow keys</kbd><span>Move between table cards when a card is focused</span><kbd>Enter / Space</kbd><span>Open the focused table</span><kbd>+ / −</kbd><span>Zoom the focused diagram</span><kbd>0</kbd><span>Fit the focused diagram</span><kbd>Escape</kbd><span>Close table details or the dialog</span><kbd>Drag / wheel</kbd><span>Pan / zoom (touch dragging also works)</span></div>`, 'DIAGRAM GUIDE');
  }
  function showRelationship(name) {
    const r = D.relationships.find(x => x.name === name); if (!r) return;
    showDialog(`${r.parentTable} → ${r.childTable}`, `<p><strong>${esc(r.name)}</strong></p><p>${r.optional ? 'Optional parent: a nullable FK tuple may be absent.' : 'Required parent: every FK component is NOT NULL.'} ${r.uniqueChild ? 'The child key is unique, so it allows at most one matching child.' : 'The same parent can have zero or many children.'}</p><pre class="view-definition">${esc(r.columns.map(c => `${r.childTable}.${c.childColumn} → ${r.parentTable}.${c.parentColumn}`).join('\n'))}</pre><p>On delete: <strong>${esc(r.onDelete.replace(/_/g, ' '))}</strong> · On update: <strong>${esc(r.onUpdate.replace(/_/g, ' '))}</strong></p><p>${r.notTrusted ? 'Not trusted' : 'Trusted'} · ${r.disabled ? 'Disabled' : 'Enabled'}</p>`, 'FOREIGN-KEY RELATIONSHIP');
  }
  $('#snapshotButton').addEventListener('click', showSnapshot); $('#footerSnapshot').addEventListener('click', showSnapshot); $('#helpButton').addEventListener('click', showHelp);
  $('#closeDialog').addEventListener('click', () => $('#infoDialog').close());
  $('#infoDialog').addEventListener('click', e => { if (e.target === $('#infoDialog')) { const b = e.target.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) e.target.close(); } });
  const initialTab = location.hash.slice(1); setTab(['er', 'schema', 'explorer', 'sql', 'rules'].includes(initialTab) ? initialTab : 'er');
})();
