'use strict';
// core: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registercore(ctx) {
  ctx.cfg = window.WusoolApiConfig;
  ctx.DB = 'wusool.database.v2';
  ctx.SESSION = 'wusool.session.v2';
  ctx.copy = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
  ctx.id = (prefix) => `${prefix}-${crypto.randomUUID()}`;
  ctx.now = () => new Date().toISOString();
  ctx.fail = (code, message) => {
    throw Object.assign(new Error(message), {
      code: window.WusoolConstants.errors[code] || code,
    });
  };
  ctx.safe = (a) => {
    if (a == null) return a;
    if (Array.isArray(a)) return a.map(ctx.safe);
    if (typeof a !== 'object') return a;
    return Object.fromEntries(
      Object.entries(a)
        .filter(
          ([k]) =>
            !/password|credential|verifier|^salt$|cvv|cardNumber|securityCode|^qrToken$|^token$/i.test(
              k,
            ),
        )
        .map(([k, v]) => [k, ctx.safe(v)]),
    );
  };
  ctx.accountDto = (a) =>
    a == null
      ? null
      : ctx.safe(
          Object.fromEntries(
            [
              'id',
              'revision',
              'role',
              'name',
              'fullName',
              'organizationName',
              'email',
              'phone',
              'phoneNumber',
              'type',
              'organizationType',
              'organizationCategory',
              'city',
              'address',
              'latitude',
              'longitude',
              'governorate',
              'countryCode',
              'googlePlaceId',
              'website',
              'status',
              'approvalStatus',
              'isDeleted',
              'createdAt',
              'updatedAt',
              'accessibilityPreferences',
              'savedPlaces',
              'profile',
              'preferences',
              'settings',
              'representativeName',
              'jobTitle',
              'managerName',
              'managerPosition',
              'managerEmail',
              'managerPhone',
              'registrationNumber',
              'logo',
              'documentName',
              'documentId',
              'documentStatus',
              'workingHours',
              'specialHours',
              'closedDates',
              'hoursRevision',
              'hoursUpdatedAt',
              'requiresInitialSetup',
            ]
              .filter((k) => k in a)
              .map((k) => [k, a[k]]),
          ),
        );
  ctx.audit = function audit(data, a, action, entityType, entityId, reason = '') {
    data.audit.unshift({
      id: ctx.id('audit'),
      actorId: a?.id || null,
      actor: a?.name || 'Unauthenticated registration',
      action,
      entityType,
      entityId,
      reason,
      timestamp: ctx.now(),
      status: data[entityType]?.find?.((x) => x.id === entityId)?.status,
      score: data[entityType]?.find?.((x) => x.id === entityId)?.accessibilityScore,
    });
  };
  ctx.isAdmin = (a) => a?.role === 'Admin';
  ctx.visibleBranch = function visibleBranch(data, b) {
    const o = data.organizations.find((x) => x.id === b.organizationId);
    return (
      window.WusoolBranchWorkflow.complete(b) &&
      !b.isDeleted &&
      ['approved', 'published'].includes(b.status) &&
      o &&
      !o.isDeleted &&
      o.status === 'active' &&
      o.approvalStatus === 'approved'
    );
  };
  ctx.own = function own(data, a, kind, x) {
    if (ctx.isAdmin(a)) return true;
    if (kind === 'branches' || kind === 'subscriptions' || kind === 'applications')
      return a?.role === 'Organization' && x.organizationId === a.id;
    if (kind === 'memberships')
      return a?.role === 'Organization' && x.organizationId === a.id && x.accountId === a.id;
    if (kind === 'organizations') return a?.role === 'Organization' && x.id === a.id;
    if (kind === 'users') return a?.id === x.id;
    if (kind === 'bookings')
      return a?.id === x.userId || (a?.role === 'Organization' && x.organizationId === a.id);
    if (kind === 'reviews') return a?.id === x.userId;
    if (kind === 'tickets')
      return a?.id === x.requesterId || (a?.role === 'Organization' && x.organizationId === a.id);
    if (kind === 'notifications' || kind === 'documents') return a?.id === x.ownerId;
    return false;
  };
});
