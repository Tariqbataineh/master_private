// Actual local three-portal browser workflow, not a backend test.
const { chromium } = require('playwright'),
  { scenario } = require('./test-helpers.cjs');
const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
  const { e, user, org, branch } = await scenario(),
    data = JSON.parse(e.local.getItem('wusool.database.v2'));
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + decodeURIComponent(u.pathname));
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      res.setHeader(
        'Content-Type',
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.svg': 'image/svg+xml',
        }[path.extname(file)] || 'application/octet-stream',
      );
      res.end(fs.readFileSync(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const report = { kind: 'Local real Chromium hours approval workflow', checks: [], errors: [] };
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }),
      base = 'http://127.0.0.1:' + server.address().port;
    await context.addInitScript(
      ({ data, user, org }) => {
        if (window.top !== window || location.hostname !== '127.0.0.1') return;
        if (!localStorage.getItem('wusool.database.v2'))
          localStorage.setItem('wusool.database.v2', JSON.stringify(data));
        const role = location.pathname.startsWith('/admin/')
            ? 'Admin'
            : location.pathname.startsWith('/org/')
              ? 'Organization'
              : 'User',
          id = role === 'Admin' ? 'admin-local' : role === 'Organization' ? org.id : user.id;
        sessionStorage.setItem(
          'wusool.session.v2',
          JSON.stringify({ id, role, version: data.revocations[id] || 0 }),
        );
      },
      { data, user, org },
    );
    const organization = await context.newPage(),
      admin = await context.newPage(),
      visitor = await context.newPage();
    for (const [role, page] of Object.entries({ organization, admin, visitor }))
      page.on('pageerror', (error) => report.errors.push({ role, message: error.message }));
    await organization.goto(base + '/org/html/organization-settings.html');
    await organization
      .locator('#hoursApprovalCenter [data-hours-resource] option')
      .first()
      .waitFor({ state: 'attached' });
    await admin.goto(base + '/admin/html/admin-organizations.html');
    await admin
      .locator('#hoursApprovalCenter [data-hours-resource] option')
      .first()
      .waitFor({ state: 'attached' });
    await visitor.goto(base + '/user/html/explore-places.html');
    await visitor.waitForFunction(() => Boolean(window.WusoolServices));
    await organization.locator('[data-hours-resource]').selectOption('branches:' + branch.id);
    await organization.locator('[data-hours-current]').waitFor({ state: 'visible' });
    await organization.waitForFunction(() =>
      document.querySelector('[data-hours-current]').textContent.includes('00:00'),
    );
    await organization.locator('[data-hours-edit]').click();
    await organization.locator('dialog [data-hour-day=monday] [data-start]').fill('09:00');
    await organization.locator('dialog [name=reason]').fill('Monday opens later');
    await organization.locator('dialog button[type=submit]').click();
    await organization.locator('dialog').waitFor({ state: 'detached' });
    await admin.locator('[data-hours-review]').first().waitFor();
    assert.equal(
      await visitor.evaluate(
        async (id) => (await WusoolServices.getBranchById(id)).workingHours.Monday.openTime,
        branch.id,
      ),
      '00:00',
    );
    assert.equal(
      await visitor.evaluate(
        async (id) => (await WusoolServices.getBranchById(id)).status,
        branch.id,
      ),
      'approved',
    );
    report.checks.push(
      'Organization change pending; visitor still sees old approved hours and published branch',
    );
    await admin.locator('[data-hours-review]').first().click();
    await admin.locator('dialog .hours-changed').waitFor();
    assert.ok((await admin.locator('dialog .hours-changed').textContent()).includes('09:00'));
    await admin.locator('dialog [name=reason]').fill('Approved by Admin');
    await admin.locator('dialog [data-decision=approved]').click();
    await admin.locator('dialog').waitFor({ state: 'detached' });
    await organization.waitForFunction(() =>
      document.querySelector('[data-hours-current]').textContent.includes('09:00'),
    );
    assert.equal(
      await visitor.evaluate(
        async (id) => (await WusoolServices.getBranchById(id)).workingHours.monday.openTime,
        branch.id,
      ),
      '09:00',
    );
    report.checks.push(
      'Admin before/after comparison approval updates all three portal reads automatically',
    );
    await organization.locator('[data-hours-edit]').click();
    await organization.locator('dialog [data-hour-day=monday] [data-start]').fill('10:00');
    await organization.locator('dialog button[type=submit]').click();
    await organization.locator('dialog').waitFor({ state: 'detached' });
    await admin.locator('[data-hours-review]').first().waitFor();
    await admin.locator('[data-hours-review]').first().click();
    await admin.locator('dialog [data-decision=rejected]').click();
    await admin.locator('[data-hours-dialog-error]:not([hidden])').waitFor();
    await admin.locator('dialog [name=reason]').fill('Keep approved Monday hours');
    await admin.locator('dialog [data-decision=rejected]').click();
    await admin.locator('dialog').waitFor({ state: 'detached' });
    await organization.waitForFunction(() => !document.querySelector('[data-hours-edit]').disabled);
    await organization.locator('[data-hours-filter]').selectOption('');
    await organization.waitForFunction(() =>
      document.querySelector('[data-hours-requests]').textContent.includes('Rejected'),
    );
    assert.equal(
      await visitor.evaluate(
        async (id) => (await WusoolServices.getBranchById(id)).workingHours.monday.openTime,
        branch.id,
      ),
      '09:00',
    );
    report.checks.push(
      'Rejection requires a reason; organization sees decision and approved hours remain unchanged',
    );
    await admin.locator('[data-edit-hours-id="' + org.id + '"]').click();
    await admin.locator('dialog [data-hour-day=monday] [data-start]').fill('08:00');
    await admin.locator('dialog button[type=submit]').click();
    await admin.locator('dialog').waitFor({ state: 'detached' });
    assert.equal(
      await admin.evaluate(
        async (id) => (await WusoolServices.getOrganizationById(id)).workingHours.monday.openTime,
        org.id,
      ),
      '08:00',
    );
    report.checks.push('Admin row action directly edits organization hours');
    const adminBranches = await context.newPage();
    adminBranches.on('pageerror', (error) =>
      report.errors.push({ role: 'adminBranches', message: error.message }),
    );
    await adminBranches.goto(base + '/admin/html/admin-branches.html');
    await adminBranches.locator('[data-edit-hours-id="' + branch.id + '"]').waitFor();
    await adminBranches.locator('[data-edit-hours-id="' + branch.id + '"]').click();
    await adminBranches.locator('dialog [data-hour-day=monday] [data-start]').fill('08:30');
    await adminBranches.locator('dialog button[type=submit]').click();
    await adminBranches.locator('dialog').waitFor({ state: 'detached' });
    await organization.waitForFunction(() =>
      document.querySelector('[data-hours-current]').textContent.includes('08:30'),
    );
    report.checks.push(
      'Admin branch row action directly applies approved hours with live organization update',
    );
    await organization.evaluate(() => window.WusoolTheme.set('dark'));
    await organization.setViewportSize({ width: 390, height: 844 });
    await organization.locator('[data-hours-edit]').click();
    assert.equal(
      await organization.locator('dialog').getAttribute('aria-labelledby'),
      'hoursDialogTitle',
    );
    await organization.keyboard.press('Escape');
    await organization.locator('dialog').waitFor({ state: 'detached' });
    assert.equal(
      await organization.evaluate(() => document.activeElement.hasAttribute('data-hours-edit')),
      true,
    );
    report.checks.push('Dark/mobile native dialog, Escape and trigger focus restoration');
    assert.deepEqual(report.errors, []);
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
    fs.writeFileSync(
      path.join(root, 'docs/hours-browser-results.json'),
      JSON.stringify(report, null, 2),
    );
  }
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
