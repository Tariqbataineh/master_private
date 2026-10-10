const test = require('node:test'),
  assert = require('node:assert/strict');
const { env } = require('./test-helpers.cjs');
const response = (status, body, headers = { 'Content-Type': 'application/json' }) =>
  new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
function setup(config = {}) {
  const e = env(undefined, { mode: 'api', baseUrl: '/api', ...config });
  const calls = [];
  e.ctx.fetch = async (url, options) => {
    calls.push({ url, options });
    return response(200, {});
  };
  return { ...e, calls };
}
test('cookie writes acquire CSRF once, omit multipart boundary and renew after authentication changes', async () => {
  const e = setup({
    antiforgery: { enabled: true, path: '/auth/antiforgery', headerName: 'X-CSRF-TOKEN' },
  });
  let token = 0;
  e.ctx.fetch = async (url, options) => {
    e.calls.push({ url, options });
    return response(
      200,
      url.endsWith('antiforgery')
        ? { requestToken: 'csrf-' + ++token }
        : { id: 'file-1', uploaded: true, status: 'uploaded' },
    );
  };
  await e.api.request('/tickets', { method: 'POST', body: { subject: 'Test' } });
  assert.equal(e.calls[1].options.headers['X-CSRF-TOKEN'], 'csrf-1');
  assert.equal(e.calls[1].options.credentials, 'include');
  await e.api.upload(new File(['file'], 'test.pdf', { type: 'application/pdf' }), {
    purpose: 'support',
  });
  assert.equal(e.calls.length, 3);
  assert.ok(e.calls[2].options.body instanceof FormData);
  assert.equal(e.calls[2].options.headers['Content-Type'], undefined);
  e.window.WusoolHttp.invalidate();
  await e.api.request('/tickets', { method: 'POST', body: { subject: 'Again' } });
  assert.equal(token, 2);
});
test('ValidationProblemDetails preserves field arrays, status and trace identifier', async () => {
  const e = setup();
  e.ctx.fetch = async () =>
    response(400, {
      type: 'https://example.test/validation',
      title: 'Validation failed',
      status: 400,
      errors: { email: ['Invalid email'] },
      code: 'VALIDATION_ERROR',
      traceId: 'trace-1',
    });
  await assert.rejects(e.api.register({ email: 'a@b.co', password: 'Password123@' }), (error) => {
    assert.equal(error.code, 'VALIDATION_ERROR');
    assert.equal(error.status, 400);
    assert.deepEqual(JSON.parse(JSON.stringify(error.fields)), { email: ['Invalid email'] });
    assert.equal(error.traceId, 'trace-1');
    return true;
  });
  assert.equal(e.local.getItem('wusool.database.v2'), null);
});
test('HTTP 204 succeeds as null, non-JSON success and malformed list fail honestly', async () => {
  const e = setup();
  e.ctx.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await e.api.request('/auth/logout', { method: 'POST' }), null);
  e.ctx.fetch = async () => new Response('<html>Proxy</html>', { status: 200 });
  await assert.rejects(e.api.getUsers(), { code: 'INVALID_RESPONSE' });
  e.ctx.fetch = async () => response(200, { items: [], total: 2, page: 1, pageSize: 1 });
  await assert.rejects(e.api.getUsers(), { code: 'INVALID_RESPONSE' });
});
test('HTML server errors, conflicts and forbidden responses remain failures without local data', async () => {
  for (const [status, code] of [
    [500, 'API_ERROR'],
    [409, 'CONFLICT'],
    [403, 'FORBIDDEN'],
  ]) {
    const e = setup();
    e.ctx.fetch = async () => new Response('Upstream unavailable', { status });
    await assert.rejects(e.api.getUsers(), { code });
    assert.equal(e.local.getItem('wusool.database.v2'), null);
  }
});
test('request cancellation and timeout preserve input and do not retry writes', async () => {
  const e = setup();
  let calls = 0;
  e.ctx.fetch = (url, { signal }) =>
    new Promise((resolve, reject) => {
      calls++;
      if (signal.aborted) reject(new Error('aborted'));
      else signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    });
  const abort = new AbortController(),
    promise = e.api.request('/tickets', {
      method: 'POST',
      body: { subject: 'Unsaved' },
      signal: abort.signal,
    });
  abort.abort();
  await assert.rejects(promise, { code: 'REQUEST_CANCELLED' });
  await assert.rejects(
    e.api.request('/tickets', { method: 'POST', body: { subject: 'Unsaved' }, timeoutMs: 10 }),
    { code: 'TIMEOUT' },
  );
  assert.equal(calls, 2);
});
test('late responses from the previous API account are rejected after logout/account switching', async () => {
  const e = setup();
  let resolve;
  e.ctx.fetch = () => new Promise((done) => (resolve = done));
  const pending = e.api.getUsers();
  e.window.WusoolHttp.invalidate();
  resolve(response(200, { items: [{ id: 'old-user' }], total: 1, page: 1, pageSize: 500 }));
  await assert.rejects(pending, { code: 'STALE_SESSION' });
});
test('backend identity is authoritative; incomplete authentication and blocked me never become login success', async () => {
  const e = setup();
  e.ctx.sessionStorage.setItem('wusool.session.v2', JSON.stringify({ id: 'fake', role: 'Admin' }));
  e.ctx.fetch = async () =>
    response(200, { id: 'real', role: 'User', authenticationStatus: 'challenge-required' });
  await assert.rejects(e.api.login('test@example.com', 'Password123@'), {
    code: 'AUTHENTICATION_INCOMPLETE',
  });
  e.ctx.fetch = async () => response(200, { id: 'real', role: 'Organization', status: 'blocked' });
  await assert.rejects(e.api.getCurrentAccount(), { code: 'ACCOUNT_BLOCKED' });
  assert.equal(e.ctx.sessionStorage.getItem('wusool.session.v2'), null);
  e.ctx.fetch = async () => response(200, { id: 'real', role: 'User', status: 'active' });
  await e.api.login('test@example.com', 'Password123@');
  assert.equal(e.ctx.sessionStorage.getItem('wusool.session.v2'), null);
  assert.equal((await e.api.getCurrentAccount()).id, 'real');
});
test('ACCOUNT_BLOCKED ProblemDetails invalidates local UI session and never seeds local admin data', async () => {
  const e = setup();
  e.ctx.sessionStorage.setItem('wusool.session.v2', '{}');
  e.ctx.fetch = async () => response(403, { title: 'Blocked', code: 'ACCOUNT_BLOCKED' });
  await assert.rejects(e.api.saveBranch({ name: 'Test' }), { code: 'ACCOUNT_BLOCKED' });
  assert.equal(e.ctx.sessionStorage.getItem('wusool.session.v2'), null);
  assert.equal(e.local.getItem('wusool.database.v2'), null);
});
test('pagination preserves server totals and filters; null/undefined filters and signal are not serialized', async () => {
  const e = setup();
  e.ctx.fetch = async (url, options) => {
    e.calls.push({ url, options });
    const page = Number(new URL(url, 'http://test').searchParams.get('page'));
    return response(200, { items: [{ id: 'p' + page }], total: 2, page: page || 1, pageSize: 1 });
  };
  const result = await e.api.listAll('branches', {
    organizationId: 'org/a',
    status: null,
    search: undefined,
    signal: new AbortController().signal,
  });
  assert.equal(result.total, 2);
  assert.equal(result.pageSize, 1);
  assert.equal(result.items.length, 2);
  assert.ok(e.calls.every((x) => !/[?&](signal|status|search)=/.test(x.url)));
  assert.match(e.calls[0].url, /organizationId=org%2Fa/);
});
test('frontend state scalars and serialized JSON round-trip without double encoding', async () => {
  const e = setup();
  e.ctx.fetch = async (url, options) =>
    response(200, url.endsWith('wusoolBillingCycle') ? 'annual' : '{"id":"multi"}');
  assert.equal(await e.api.rawRead('wusoolBillingCycle'), 'annual');
  assert.equal(JSON.parse(await e.api.rawRead('wusoolSelectedPlan')).id, 'multi');
});
test('hosted checkout sends only plan contract with idempotency; no PAN/CVV or local activation', async () => {
  const e = setup();
  e.ctx.fetch = async (url, options) => {
    e.calls.push({ url, options });
    return response(200, {
      checkoutId: 'check-1',
      url: 'https://pay.example.test/checkout/1',
      status: 'pending',
    });
  };
  await e.api.external(
    'payments/checkout',
    {
      planId: 'multi',
      billingCycle: 'monthly',
      termsAccepted: true,
      quotedPrice: 75,
      cardNumber: 'unsafe',
    },
    { idempotencyKey: 'retry-1' },
  );
  const call = e.calls[0];
  assert.equal(call.options.headers['Idempotency-Key'], 'retry-1');
  assert.deepEqual(JSON.parse(call.options.body), {
    planId: 'multi',
    billingCycle: 'monthly',
    termsAccepted: true,
  });
  await assert.rejects(
    e.api.external('payments/checkout', {
      planId: 'multi',
      billingCycle: 'monthly',
      termsAccepted: true,
    }),
    { code: 'IDEMPOTENCY_REQUIRED' },
  );
  await assert.rejects(
    e.api.request('/payments/checkout', { method: 'POST', body: { cvv: '123' } }),
    { code: 'UNSAFE_PAYMENT_DATA' },
  );
  assert.equal(e.local.getItem('wusool.database.v2'), null);
});
test('no arbitrary external paths, URL injection or silent API fallback', async () => {
  const e = setup();
  await assert.rejects(e.api.external('unknown/fake', {}), { code: 'INVALID_ENDPOINT' });
  await assert.rejects(e.api.request('//evil.test/api'), { code: 'INVALID_ENDPOINT' });
  assert.equal(e.calls.length, 0);
  e.ctx.fetch = async () => {
    throw new Error('offline');
  };
  await assert.rejects(e.api.getPlans(), { code: 'NETWORK_ERROR' });
  assert.equal(e.local.getItem('wusool.database.v2'), null);
});
test('strong ETag is echoed on writes and cleared with the identity cache', async () => {
  const e = setup();
  e.ctx.fetch = async (url, options) => {
    e.calls.push({ url, options });
    return response(200, { id: 'u1' }, { 'Content-Type': 'application/json', ETag: '"v1"' });
  };
  await e.api.request('/users/u1');
  await e.api.request('/users/u1', { method: 'PUT', body: { name: 'Updated' } });
  assert.equal(e.calls[1].options.headers['If-Match'], '"v1"');
  e.window.WusoolHttp.invalidate();
  await e.api.request('/users/u1', { method: 'PUT', body: { name: 'Again' } });
  assert.equal(e.calls[2].options.headers['If-Match'], undefined);
});
test('API draft state is only a pointer to the canonical branch', async () => {
  const e = setup();
  e.ctx.fetch = async (url, options) => {
    e.calls.push({ url, options });
    return response(
      200,
      url.endsWith('/auth/me')
        ? { id: 'org1', role: 'Organization', status: 'active' }
        : url.includes('frontend-state')
          ? { branchId: 'b1' }
          : { id: 'b1', name: 'Canonical', organizationId: 'org1' },
    );
  };
  assert.equal(JSON.parse(await e.api.rawRead('wusoolCurrentBranchDraft')).name, 'Canonical');
  assert.ok(e.calls.some((x) => x.url.endsWith('/branches/b1')));
  assert.equal(e.local.getItem('wusool.database.v2'), null);
});
test('profile update preserves the revision initially shown to the editor', async () => {
  const e = setup();
  let revision = 4;
  e.ctx.fetch = async (url, options) => {
    e.calls.push({ url, options });
    return response(200, { id: 'u1', role: 'User', status: 'active', revision, name: 'Existing' });
  };
  await e.api.rawRead('wusool-current-user');
  revision = 9;
  await e.api.rawWrite('wusool-current-user', JSON.stringify({ name: 'Changed' }));
  const write = e.calls.find((x) => x.options.method === 'PUT');
  assert.ok(write);
  assert.equal(JSON.parse(write.options.body).expectedRevision, 4);
});
test('invalid plan metadata and changing list snapshots do not fabricate display data', async () => {
  const e = setup();
  e.ctx.fetch = async () =>
    response(200, {
      items: [{ id: 'bad', name: 'Bad', price: -1, branchLimit: 1, currency: 'JOD' }],
      total: 1,
      page: 1,
      pageSize: 500,
    });
  await assert.rejects(e.api.getPlans(), { code: 'INVALID_RESPONSE' });
  e.ctx.fetch = async (url) =>
    response(
      200,
      new URL(url, 'http://test').searchParams.get('page') === '2'
        ? { items: [{ id: 'two' }], total: 2, page: 2, pageSize: 1, snapshot: 'new' }
        : { items: [{ id: 'one' }], total: 2, page: 1, pageSize: 1, snapshot: 'old' },
    );
  await assert.rejects(e.api.listAll('branches'), (error) =>
    ['INVALID_RESPONSE', 'CONFLICT'].includes(error.code),
  );
});
