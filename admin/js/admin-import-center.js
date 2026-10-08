WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  let rows = [];
  function parseCsv(text) {
    const rows = [];
    let row = [],
      field = '',
      quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (quoted && text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = !quoted;
      } else if (!quoted && (c === ',' || c === '\n')) {
        row.push(field.replace(/\r$/, ''));
        field = '';
        if (c === '\n') {
          rows.push(row);
          row = [];
        }
      } else field += c;
    }
    if (quoted) throw new Error('Unclosed CSV quote.');
    row.push(field);
    if (row.some(Boolean)) rows.push(row);
    const headers = rows.shift() || [];
    return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h, i) => [h.trim(), r[i] || ''])));
  }
  function validate(rows, entity) {
    if (!Array.isArray(rows)) throw new Error('Expected an array of records.');
    const errors = [];
    rows.forEach((row, i) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) errors.push(`Row ${i + 1}: expected an object.`);else {
        if (!String(row.name || row.branchName || row.organizationName || '').trim()) errors.push(`Row ${i + 1}: name is required.`);
        if (entity === 'branches' && (!row.organizationId || !Number.isFinite(Number(row.accessibilityScore ?? 0)) || Number(row.accessibilityScore ?? 0) < 0 || Number(row.accessibilityScore ?? 0) > 100)) errors.push(`Row ${i + 1}: valid organizationId and score 0–100 are required.`);
        if (entity === 'users' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email || '')) errors.push(`Row ${i + 1}: valid email required.`);
        if (['password', 'passwordHash', 'verifier', 'salt'].some(k => k in row)) errors.push(`Row ${i + 1}: credential fields cannot be imported.`);
      }
    });
    return errors;
  }
  WusoolUI.listen(document.getElementById('previewImport'), 'click', async () => {
    const file = document.getElementById('importFile').files[0];
    if (!file) throw new Error('Select a CSV or JSON file.');
    const text = await file.text();
    rows = file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseCsv(text);
    const errors = validate(rows, document.getElementById('importEntity').value);
    document.getElementById('importPreview').textContent = errors.length ? errors.join('\n') : JSON.stringify(rows.slice(0, 20), null, 2);
    document.getElementById('runImport').disabled = errors.length > 0 || !rows.length;
  });
  WusoolUI.listen(document.getElementById('runImport'), 'click', async () => {
    const entity = document.getElementById('importEntity').value,
      errors = validate(rows, entity);
    if (errors.length) throw new Error(errors.join('\n'));
    if (entity === 'branches') {
      const orgs = await WusoolServices.getOrganizations();
      const bad = rows.find(r => !orgs.some(o => o.id === r.organizationId));
      if (bad) throw new Error('Import references an unknown organization. No records were imported.');
    }
    let count = 0;
    try {
      for (const row of rows) {
        await WusoolServices.save(entity, row);
        count++;
      }
      WusoolAdmin.toast(`${count} records imported.`);
    } catch (error) {
      throw new Error(`${count} records imported before failure: ${error.message}`);
    }
  });
});
