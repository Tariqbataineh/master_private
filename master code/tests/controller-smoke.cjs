const fs = require('fs'),
  path = require('path');
const { env, scenario } = require('./test-helpers.cjs');
const { mount } = require('./controller-helpers.cjs');
(async () => {
  const fixture = await scenario();
  const store = fixture.e.local.getItem('wusool.database.v2');
  const report = [];
  const source = JSON.parse(store);
  const mode = process.argv[2] || 'local';
  const root = path.join(__dirname, '..');
  for (const section of ['user', 'org', 'admin', 'visitor'])
    for (const name of fs
      .readdirSync(root + '/' + section + '/html')
      .filter((x) => x.endsWith('.html'))) {
      const rel = section + '/html/' + name;
      const html = fs.readFileSync(root + '/' + rel, 'utf8');
      const scripts = [...html.matchAll(/<script[^>]*src="\.\.\/js\/([^"]+)"/g)]
        .map((m) => m[1])
        .filter(
          (s) =>
            ![
              'admin-core.js',
              'admin-sidebar.js',
              'admin-page-catalog.js',
              'organization-sidebar.js',
              'user-layout.js',
              'journey-world.js',
              'premium-home.js',
              'journey-home.js',
            ].includes(s),
        );
      for (const script of scripts) {
        const e = env(
          undefined,
          mode === 'api'
            ? { mode: 'api', baseUrl: '/api' }
            : { mode: 'local', demoSubscription: true },
        );
        if (mode === 'empty') {
          const empty = {
            ...source,
            branches: [],
            reviews: [],
            bookings: [],
            tickets: [],
            notifications: [],
            audit: [],
          };
          e.local.setItem('wusool.database.v2', JSON.stringify(empty));
        } else if (mode === 'local') e.local.setItem('wusool.database.v2', store);
        if (mode === 'api') {
          const actor =
            section === 'admin'
              ? source.users.find((u) => u.role === 'Admin')
              : section === 'org'
                ? source.organizations[0]
                : section === 'user'
                  ? source.users.find((u) => u.role === 'User')
                  : null;
          const safeActor = actor
            ? {
                ...actor,
                role: section === 'org' ? 'Organization' : section === 'admin' ? 'Admin' : 'User',
              }
            : null;
          e.ctx.fetch = async (url, init = {}) => {
            const u = new URL(url, 'http://localhost'),
              route = u.pathname.replace('/api', ''),
              kind = route.split('/')[1],
              key = route.split('/')[2];
            let result;
            if (route === '/auth/me' || route === '/auth/login') result = safeActor;
            else if (route.endsWith('/hours'))
              result = {
                schedule: { workingHours: {}, specialHours: [], closedDates: [] },
                hoursRevision: 0,
                pending: null,
                hasSchedule: false,
              };
            else if (kind === 'hours-change-requests')
              result = { items: [], total: 0, page: 1, pageSize: 500 };
            else if (route === '/admin/errors') result = [];
            else if (route === '/admin/sessions')
              result = { items: [], total: 0, page: 1, pageSize: 500 };
            else if (route === '/admin/system-health') result = { components: [] };
            else if (kind === 'frontend-state') {
              result =
                decodeURIComponent(key) === 'wusoolSelectedPlan'
                  ? { id: 'single' }
                  : decodeURIComponent(key) === 'wusoolBillingCycle'
                    ? 'monthly'
                    : null;
              if (decodeURIComponent(key) === 'wusoolCurrentBranchDraft')
                result = source.branches[0] ? { branchId: source.branches[0].id } : null;
            } else if (kind === 'plans') result = await fixture.s.getPlans();
            else if (kind === 'audit') result = source.audit;
            else if (kind === 'places') result = await fixture.s.places();
            else if (Array.isArray(source[kind])) {
              let rows = source[kind];
              if (actor?.role !== 'Admin' && section !== 'admin')
                rows = rows.filter(
                  (x) =>
                    kind === 'branches' ||
                    kind === 'reviews' ||
                    kind === 'organizations' ||
                    x.userId === actor?.id ||
                    x.ownerId === actor?.id ||
                    x.organizationId === actor?.id ||
                    x.requesterId === actor?.id,
                );
              result = key
                ? rows.find((x) => x.id === key) || null
                : { items: rows, total: rows.length, page: 1, pageSize: 500 };
            } else result = null;
            return { ok: true, status: 200, json: async () => result };
          };
        }
        const s = e.api;
        if (section === 'admin') await s.login('admin@wusool.com', 'WusoolAdmin2026@', 'Admin');
        if (section === 'org') await s.login(fixture.org.email, 'Password123@', 'Organization');
        if (section === 'user') await s.login(fixture.user.email, 'Password123@');
        if (section === 'org' && mode === 'local')
          await s.rawWrite('wusoolCurrentBranchDraft', JSON.stringify(fixture.branch));
        let query = '?id=' + fixture.branch.id + '&placeId=' + fixture.branch.id;
        try {
          await mount(e, section + '/js/' + script, query, { html: rel, dependencies: true });
          report.push({ page: rel, script, status: 'initialized in DOM double' });
        } catch (err) {
          report.push({ page: rel, script, status: 'failed', error: err.message });
        }
      }
    }
  fs.writeFileSync(
    root + '/docs/controller-smoke-' + mode + '.json',
    JSON.stringify(report, null, 2),
  );
  console.log(
    'SMOKE',
    mode,
    report.length,
    'FAILED',
    report.filter((x) => x.status === 'failed'),
  );
  if (report.some((x) => x.status === 'failed')) process.exitCode = 1;
})();
