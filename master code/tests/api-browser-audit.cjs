// Controlled HTTP server and real Chromium: test double, not a backend implementation.
const { chromium } = require('playwright'),
  http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
  const calls = [],
    errors = [],
    checks = [];
  let actor = {
    id: 'user-api',
    role: 'User',
    status: 'active',
    name: 'API User',
    email: 'visitor@example.test',
    revision: 1,
  };
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname.startsWith('/api/')) {
      let text = '';
      for await (const chunk of req) text += chunk;
      calls.push({
        method: req.method,
        path: u.pathname,
        csrf: req.headers['x-csrf-token'],
        body: text ? JSON.parse(text) : null,
      });
      res.setHeader('Content-Type', 'application/json');
      let result;
      if (u.pathname === '/api/auth/antiforgery') {
        res.setHeader('Set-Cookie', 'anti=test; Path=/; SameSite=Lax');
        result = { requestToken: 'test-csrf' };
      } else if (u.pathname === '/api/auth/me') {
        if (!actor) {
          res
            .writeHead(401)
            .end(JSON.stringify({ title: 'Signed out', code: 'UNAUTHENTICATED', status: 401 }));
          return;
        }
        result = actor;
      } else if (u.pathname === '/api/auth/logout') {
        assert.equal(req.headers['x-csrf-token'], 'test-csrf');
        actor = null;
        res.writeHead(204).end();
        return;
      } else if (u.pathname === '/api/sync/revision') result = { revision: 1 };
      else if (u.pathname === '/api/visit-operations/summary') result = { queue: [], stats: {} };
      else if (u.pathname.includes('/frontend-state/')) result = null;
      else
        result = {
          items: [],
          total: 0,
          page: Number(u.searchParams.get('page') || 1),
          pageSize: 500,
        };
      res.end(JSON.stringify(result));
      return;
    }
    let filename;
    try {
      filename = path.resolve(root, '.' + decodeURIComponent(u.pathname));
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (!filename.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    if (filename.endsWith('/assets/api-config.js')) {
      res.setHeader('Content-Type', 'text/javascript');
      res.end(
        "window.WusoolApiConfig={mode:'api',baseUrl:'/api',credentials:'include',antiforgery:{enabled:true,path:'/auth/antiforgery',headerName:'X-CSRF-TOKEN'},googleMapsProvider:'free-embed'};",
      );
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
        }[path.extname(filename)] || 'application/octet-stream',
      );
      res.end(fs.readFileSync(filename));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext();
    const base = 'http://127.0.0.1:' + server.address().port;
    for (const [role, url, button] of [
      ['User', '/user/html/my-tickets.html', '#logoutUserButton'],
      ['Organization', '/org/html/visitor-tickets.html', '#logoutButton'],
      ['Admin', '/admin/html/admin-tickets.html', '#adminLogoutButton'],
    ]) {
      actor = {
        id: role + '-api',
        role,
        status: 'active',
        approvalStatus: 'approved',
        name: role,
        email: role.toLowerCase() + '@example.test',
        revision: 1,
      };
      const page = await context.newPage();
      page.on('pageerror', (e) => errors.push({ role, message: e.message }));
      await page.goto(base + url, { waitUntil: 'domcontentloaded' });
      await page.locator('#bookingTicketsPanel [data-rows]').waitFor();
      await page.waitForTimeout(350);
      assert.equal(await page.evaluate(() => localStorage.getItem('wusool.database.v2')), null);
      assert.equal(await page.evaluate(() => sessionStorage.getItem('wusool.session.v2')), null);
      await page.keyboard.press('Tab');
      assert.ok(await page.evaluate(() => document.activeElement !== document.body));
      await page.evaluate(() => {
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
      });
      assert.equal(
        await page.locator('html').evaluate((x) => getComputedStyle(x).direction),
        'rtl',
      );
      const before = calls.filter((x) => x.path === '/api/auth/logout').length;
      await page.locator(button).click();
      await page.waitForURL(/login\.html/);
      assert.equal(calls.filter((x) => x.path === '/api/auth/logout').length, before + 1);
      checks.push({
        role,
        cookieHttp: true,
        logout204: true,
        csrf: true,
        noLocalAuthority: true,
        keyboardFocus: true,
        rtl: true,
      });
      await page.close();
    }
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push({ message: e.message }));
    await page.goto(base + '/user/html/my-tickets.html');
    await page.waitForURL(/login\.html/);
    checks.push({ anonymousProtectedRoute: 'redirected after backend 401' });
    await page.close();
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
    fs.writeFileSync(
      path.join(root, 'docs/api-browser-results.json'),
      JSON.stringify(
        { kind: 'Controlled HTTP + real Chromium; not production backend', checks, errors, calls },
        null,
        2,
      ),
    );
  }
  console.log(JSON.stringify({ checks, errors, calls: calls.length }));
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
