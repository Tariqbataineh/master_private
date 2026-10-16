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
              'accountId','organizationId','branchIds','permissions','membershipRole',
            ]
              .filter((k) => k in a)
              .map((k) => [k, a[k]]),
          ),
        );
  ctx.audit = function audit(data, a, action, entityType, entityId, reason = '') {
    data.audit.unshift({
      id: ctx.id('audit'),
      actorId: a?.accountId || a?.id || null,
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
  ctx.publicBranchDto = b => ctx.safe(Object.fromEntries(Object.entries(b).filter(([key])=>!['ticketServices','notes','adminNotes','adminFeedback','navigationDraft','navigationVersions','reviewedBy','approvedBy'].includes(key))));
  ctx.visibleBranch = function visibleBranch(data, b) {
    const o = data.organizations.find((x) => x.id === b.organizationId);
    return (
      !!String(b.name || b.branchName || "").trim() &&
      !!String(b.city || b.address || "").trim() &&
      b.active !== false && b.isPublished !== false &&
      !b.isDeleted &&
      ['approved', 'published'].includes(b.status) &&
      o &&
      !o.isDeleted &&
      o.status === 'active' &&
      o.approvalStatus === 'approved'
    );
  };
  ctx.holdExpiration = (data, branch) => {
    const minutes=Object.hasOwn(branch,'pendingHoldMinutes')?branch.pendingHoldMinutes:Object.hasOwn(data.settings,'pendingHoldMinutes')?data.settings.pendingHoldMinutes:ctx.cfg.pendingHoldMinutes??null;
    if(minutes===null) return null; // Explicit manual approval: holds remain until staff decide.
    if(!Number.isInteger(minutes)||minutes<1||minutes>43200) ctx.fail('VALIDATION_ERROR','Pending hold must be 1–43200 minutes or null for manual approval.');
    return new Date(Date.now()+minutes*60000).toISOString();
  };
  ctx.expireHolds = data => {
    let changed=false;
    for(const b of data.bookings) if(!b.isDeleted&&b.status==='pending'&&b.holdExpiresAt&&Date.parse(b.holdExpiresAt)<=Date.now()) {
      b.status='cancelled';b.cancelledAt=ctx.now();b.updatedAt=b.cancelledAt;b.cancellationReason='Pending approval hold expired';b.revision=(b.revision||0)+1;
      b.journeyHistory=[...(b.journeyHistory||[]),{id:ctx.id('history'),event:'hold-expired',actorRole:'System',at:b.cancelledAt}];
      for(const ownerId of new Set([b.userId,b.organizationId])) {
        const automationKey='hold-expired:'+b.id+':'+b.holdExpiresAt;
        if(!data.notifications.some(n=>n.ownerId===ownerId&&n.automationKey===automationKey)) data.notifications.push({id:ctx.id('notification'),ownerId,bookingId:b.id,automationKey,title:'Reservation hold expired',message:b.reference||b.id,status:'unread',createdAt:b.cancelledAt});
      }
      ctx.audit(data,{id:'system',name:'Automation'},'hold-expired','bookings',b.id);changed=true;
    }
    return changed;
  };
  ctx.own = function own(data, a, kind, x) {
    if (ctx.isAdmin(a)) return true;
    if(a?.role==='Organization'&&Array.isArray(a.branchIds)&&kind==='branches'&&!a.branchIds.includes(x.id))return false;
    if(a?.role==='Organization'&&Array.isArray(a.branchIds)&&['bookings','tickets','reviews'].includes(kind)&&x.branchId&&!a.branchIds.includes(x.branchId))return false;
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
