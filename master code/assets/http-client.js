'use strict';
// One cookie-authenticated transport. API errors never select the local adapter.
window.WusoolHttp = (() => {
  const config = window.WusoolApiConfig;
  const authErrors = new Set(window.WusoolConstants.authErrors);
  const etags = new Map();
  let epoch = 0,
    csrfToken = null,
    csrfPending = null;
  class ApiError extends Error {
    constructor(code, message, { status = 0, fields = {}, traceId = null } = {}) {
      super(message);
      this.name = 'ApiError';
      this.code = code;
      this.status = status;
      this.fields = fields;
      this.traceId = traceId;
    }
  }
  const error = (code, message, options) => new ApiError(code, message, options);
  function invalidate() {
    epoch++;
    etags.clear();
    csrfToken = null;
    csrfPending = null;
  }
  function url(path) {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\'))
      throw error('INVALID_ENDPOINT', 'Use a relative API endpoint path.');
    return config.baseUrl.replace(/\/$/, '') + path;
  }
  function assertNoCardData(value) {
    if (!value || typeof value !== 'object' || value instanceof FormData) return;
    for (const [key, item] of Object.entries(value)) {
      if (/^(?:cardNumber|pan|cvv|cardCvv|securityCode)$/i.test(key) && item)
        throw error(
          'UNSAFE_PAYMENT_DATA',
          'Use hosted checkout; card data must not enter this application.',
        );
      assertNoCardData(item);
    }
  }
  async function parse(response) {
    if (response.status === 204 || response.status === 205) return null;
    // json-only branch supports controlled test doubles; real responses use text.
    if (typeof response.text !== 'function') return response.json();
    const text = await response.text();
    if (!text.trim()) {
      if (response.ok)
        throw error('INVALID_RESPONSE', 'Expected a JSON response.', { status: response.status });
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      if (!response.ok) return null;
      throw error('INVALID_RESPONSE', 'The server returned a non-JSON response.', {
        status: response.status,
      });
    }
  }
  function responseError(response, problem) {
    const defaults = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
    };
    const code =
      problem?.code ||
      problem?.extensions?.code ||
      problem?.error?.code ||
      defaults[response.status] ||
      'API_ERROR';
    const fields = problem?.errors || problem?.fields || {};
    return error(
      code,
      problem?.detail ||
        problem?.title ||
        problem?.error?.message ||
        problem?.message ||
        `Request failed (${response.status}).`,
      {
        status: response.status,
        fields,
        traceId: problem?.traceId || problem?.extensions?.traceId || null,
      },
    );
  }
  async function send(
    path,
    { method = 'GET', body, headers = {}, signal, timeoutMs = config.timeoutMs || 15000 } = {},
  ) {
    const controller = new AbortController(),
      startEpoch = epoch;
    let timedOut = false;
    const abort = () => controller.abort(signal?.reason);
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    try {
      const multipart = body instanceof FormData;
      assertNoCardData(body);
      const response = await fetch(url(path), {
        method,
        credentials: config.credentials || 'include',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(!['GET', 'HEAD', 'OPTIONS'].includes(method) && etags.has(url(path))
            ? { 'If-Match': etags.get(url(path)) }
            : {}),
          ...(!multipart && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...headers,
        },
        ...(body !== undefined ? { body: multipart ? body : JSON.stringify(body) } : {}),
      });
      const result = await parse(response);
      if (!response.ok) throw responseError(response, result);
      if (startEpoch !== epoch)
        throw error(
          'STALE_SESSION',
          'The account changed while the request was running. Reload the current account data.',
        );
      const etag = response.headers?.get?.('ETag');
      if (etag && !etag.startsWith('W/')) etags.set(url(path), etag);
      return result;
    } catch (cause) {
      if (cause instanceof ApiError) throw cause;
      if (controller.signal.aborted)
        throw error(
          timedOut ? 'TIMEOUT' : 'REQUEST_CANCELLED',
          timedOut
            ? 'The request timed out. Your input is preserved.'
            : 'The request was cancelled.',
        );
      throw error('NETWORK_ERROR', 'Unable to connect. Your input is preserved; try again.');
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  }
  async function antiforgery() {
    if (csrfToken) return csrfToken;
    if (!csrfPending) {
      const startEpoch = epoch;
      csrfPending = send(config.antiforgery?.path || '/auth/antiforgery')
        .then((result) => {
          if (startEpoch !== epoch)
            throw error('STALE_SESSION', 'Account changed while preparing the request.');
          if (typeof result?.requestToken !== 'string' || !result.requestToken)
            throw error(
              'ANTIFORGERY_UNAVAILABLE',
              'The backend did not provide an antiforgery token.',
            );
          csrfToken = result.requestToken;
          return csrfToken;
        })
        .finally(() => {
          if (startEpoch === epoch) csrfPending = null;
        });
    }
    return csrfPending;
  }
  async function request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    let headers = { ...options.headers };
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && config.antiforgery?.enabled !== false) {
      headers[config.antiforgery?.headerName || 'X-CSRF-TOKEN'] = await antiforgery();
    }
    try {
      return await send(path, { ...options, method, headers });
    } catch (e) {
      if (authErrors.has(e.code)) invalidate();
      throw e;
    }
  }
  return Object.freeze({
    request,
    invalidate,
    ApiError,
    get epoch() {
      return epoch;
    },
  });
})();
