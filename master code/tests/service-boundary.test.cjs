const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const root = path.resolve(__dirname, '..');
test('all active data pages load the same module boundary in dependency order', () => {
  const pages = JSON.parse(fs.readFileSync(path.join(root, 'docs/page-service-inventory.json')));
  const rows = Array.isArray(pages) ? pages : pages.pages;
  assert.equal(rows.length, 121);
  let integrated = 0;
  for (const row of rows) {
    const page = row.page || row.path || row.route;
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    if (!html.includes('app-services.js')) {
      assert.ok(/(reset-data|organization-sidebar)\.html$/.test(page), page);
      continue;
    }
    integrated++;
    for (const file of [
      'service-registry.js',
      'storage-adapter.js',
      'http-client.js',
      'services/core.js',
      'services/local.js',
      'services/entities.js',
      'services/auth.js',
      'services/state.js',
      'services/visits.js',
      'services/hours.js',
    ])
      assert.ok(
        html.indexOf(file) >= 0 && html.indexOf(file) < html.indexOf('app-services.js'),
        page + ' ' + file,
      );
    assert.ok(html.indexOf('app-services.js') < html.indexOf('page-runtime.js'), page);
  }
  assert.equal(integrated, 119);
});
test('business storage and API role authority are centralized', () => {
  for (const file of fs
    .readdirSync(path.join(root, 'assets/services'))
    .filter((x) => x.endsWith('.js'))) {
    const code = fs.readFileSync(path.join(root, 'assets/services', file), 'utf8');
    assert.ok(
      !/(?<!\.)\b(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)/.test(code),
      file,
    );
  }
  const page = fs.readFileSync(path.join(root, 'assets/page-runtime.js'), 'utf8');
  assert.match(page, /hasLocalSession/);
  assert.match(page, /mode/);
  const admin = fs.readFileSync(path.join(root, 'admin/js/admin-sidebar.js'), 'utf8');
  assert.match(admin, /await WusoolServices\.logout\(\)/);
});
