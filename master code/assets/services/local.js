'use strict';
// local: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registerlocal(ctx) {
  ctx.empty = () => ({
    schemaVersion: 2,
    users: [],
    organizations: [],
    applications: [],
    memberships: [],
    branches: [],
    bookings: [],
    tickets: [],
    reviews: [],
    documents: [],
    subscriptions: [],
    notifications: [],
    hoursChangeRequests: [],
    audit: [],
    credentials: {},
    settings: {},
    drafts: {},
    revocations: {},
  });
  ctx.db = function db() {
    const raw = ctx.storage.local.getItem(ctx.DB);
    if (!raw) {
      const data = ctx.empty();
      ctx.storage.local.setItem(ctx.DB, JSON.stringify(data));
      return data;
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      ctx.fail(
        'STORAGE_CORRUPT',
        'Stored data is unreadable. It has not been erased. Export the browser data before repair.',
      );
    }
    if (!data || typeof data !== 'object' || Array.isArray(data))
      ctx.fail(
        'STORAGE_CORRUPT',
        'Stored database has an invalid shape; existing data was preserved.',
      );
    let repaired = false;
    const repairOwnerLinks = data.memberships == null;
    const template = ctx.empty();
    for (const [key, value] of Object.entries(template)) {
      if (data[key] == null) {
        data[key] = ctx.copy(value);
        repaired = true;
        continue;
      }
      if (Array.isArray(value) && !Array.isArray(data[key])) {
        if (
          typeof data[key] === 'object' &&
          Object.values(data[key]).every((x) => x && typeof x === 'object')
        ) {
          data[key] = Object.values(data[key]);
          repaired = true;
        } else
          ctx.fail(
            'STORAGE_CORRUPT',
            'Invalid database collection ' + key + '. Existing data was preserved.',
          );
      }
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        (typeof data[key] !== 'object' || Array.isArray(data[key]))
      )
        ctx.fail(
          'STORAGE_CORRUPT',
          'Invalid database field ' + key + '. Existing data was preserved.',
        );
    }
    for (const kind of ['users', 'organizations'])
      for (const account of data[kind]) {
        if (!account || typeof account !== 'object')
          ctx.fail('STORAGE_CORRUPT', 'Invalid account entry. Existing data was preserved.');
        if (typeof account.email === 'string') {
          const email = account.email.trim().toLowerCase();
          if (email !== account.email) {
            account.email = email;
            repaired = true;
          }
        }
        if (typeof account.status === 'string' && account.status !== account.status.toLowerCase()) {
          account.status = account.status.toLowerCase();
          repaired = true;
        }
        if (account.isDeleted === 'false') {
          account.isDeleted = false;
          repaired = true;
        }
        if (account.isDeleted === 'true') {
          account.isDeleted = true;
          repaired = true;
        }
        if (
          kind === 'organizations' &&
          typeof account.approvalStatus === 'string' &&
          account.approvalStatus !== account.approvalStatus.toLowerCase()
        ) {
          account.approvalStatus = account.approvalStatus.toLowerCase();
          repaired = true;
        }
        if (
          repairOwnerLinks &&
          kind === 'organizations' &&
          account.id &&
          !account.isDeleted &&
          !data.memberships.some(
            (m) => m.organizationId === account.id && m.accountId === account.id,
          )
        ) {
          data.memberships.push({
            id: 'repaired-owner-' + account.id,
            organizationId: account.id,
            accountId: account.id,
            role: 'owner',
          });
          repaired = true;
        }
      }
    for (const booking of data.bookings) {
      if (!booking || typeof booking !== 'object' || Array.isArray(booking))
        ctx.fail('STORAGE_CORRUPT', 'Invalid booking entry. Existing data was preserved.');
      const set = (key, value) => {
        if (value != null && value !== '' && booking[key] !== value) {
          booking[key] = value;
          repaired = true;
        }
      };
      if (!booking.branchId && booking.placeId) set('branchId', String(booking.placeId));
      if (
        !booking.userId &&
        booking.user?.id &&
        data.users.some((u) => u.id === booking.user.id && u.role === 'User')
      )
        set('userId', booking.user.id);
      const branch = data.branches.find((b) => b.id === booking.branchId);
      if (!booking.organizationId && branch?.organizationId)
        set('organizationId', branch.organizationId);
      if (!booking.branchName && (branch?.name || branch?.branchName))
        set('branchName', branch.name || branch.branchName);
      if (!booking.date && booking.visitDate) set('date', booking.visitDate);
      if (!booking.time && booking.visitTime) set('time', booking.visitTime);
      const rawStatus = String(booking.status || 'pending')
          .trim()
          .toLowerCase(),
        status =
          {
            'pending approval': 'pending',
            'pending review': 'pending',
            'in progress': 'in-progress',
            'no show': 'no-show',
            canceled: 'cancelled',
          }[rawStatus] || rawStatus;
      if (
        [
          'pending',
          'confirmed',
          'in-progress',
          'completed',
          'cancelled',
          'no-show',
          'waitlisted',
        ].includes(status)
      )
        set('status', status);
      const terminal = {
        completed: 'completed',
        cancelled: 'cancelled',
        'no-show': 'no-show',
        'in-progress': 'serving',
      }[status];
      if (terminal) set('journeyState', terminal);
      else if (!booking.journeyState) set('journeyState', 'not-started');
      if (booking.isDeleted === 'false') set('isDeleted', false);
      if (booking.isDeleted === 'true') set('isDeleted', true);
    }
    if (repaired) {
      try {
        if (!ctx.storage.local.getItem('wusool.database.v2.before-repair'))
          ctx.storage.local.setItem('wusool.database.v2.before-repair', raw);
      } catch {
        window.WusoolRepairBackupUnavailable = true;
      }
      ctx.storage.local.setItem(ctx.DB, JSON.stringify(data));
    }
    return data;
  };
  ctx.put = (data) => {
    ctx.storage.local.setItem(ctx.DB, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('wusool:data-changed'));
  };
  ctx.clearSession = function clearSession() {
    window.WusoolHttp.invalidate();
    ctx.storage.session.removeItem(ctx.SESSION);
    for (const k of [
      'wusoolDemoUser',
      'wusool-current-user',
      'wusoolOrganization',
      'wusoolOrganizationLoggedIn',
      'wusoolAdminLoggedIn',
      'wusoolAdminRole',
      'wusoolAdminProfile',
    ])
      ctx.storage.session.removeItem(k);
    for (const k of ['wusool-is-authenticated', 'wusoolOrganizationLoggedIn'])
      ctx.storage.local.removeItem(k);
    window.dispatchEvent(new CustomEvent('wusool:session-changed'));
  };
  ctx.session = function session() {
    try {
      return JSON.parse(ctx.storage.session.getItem(ctx.SESSION) || 'null');
    } catch {
      return null;
    }
  };
  ctx.current = function current(data = ctx.db()) {
    const s = ctx.session();
    if (!s) return null;
    const collection = s.role === 'Organization' ? 'organizations' : 'users';
    const a = data[collection].find((x) => String(x.id) === String(s.id));
    if (s.role === 'Admin' && a?.role !== 'Admin') {
      ctx.clearSession();
      ctx.fail('FORBIDDEN', 'Administrator account required.');
    }
    if (
      !a ||
      a.isDeleted ||
      ['blocked', 'suspended', 'disabled'].includes(String(a.status).toLowerCase()) ||
      (data.revocations[a.id] || 0) !== s.version
    ) {
      ctx.clearSession();
      ctx.fail(
        'ACCOUNT_BLOCKED',
        'Account is unavailable. Sign in again after contacting support.',
      );
    }
    return ctx.accountDto({
      ...a,
      role: s.role,
    });
  };
  ctx.requireAccount = function requireAccount(roles = []) {
    const a = ctx.current();
    if (!a) ctx.fail('UNAUTHENTICATED', 'Sign in to continue.');
    if (a.requiresInitialSetup)
      ctx.fail('CREDENTIAL_CHANGE_REQUIRED', 'Set your new password before continuing.');
    if (
      a.role === 'Organization' &&
      !ctx.db().memberships.some((m) => m.organizationId === a.id && m.accountId === a.id)
    )
      ctx.fail('FORBIDDEN', 'Organization membership is required.');
    if (roles.length && !roles.includes(a.role))
      ctx.fail('FORBIDDEN', 'This account cannot perform this operation.');
    return a;
  };
});
