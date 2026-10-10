'use strict';
// entities: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registerentities(ctx) {
  ctx.normalize = function normalize(kind, input, old, a) {
    const x = {
      ...ctx.copy(old || {}),
      ...ctx.copy(ctx.safe(input)),
      id: String(input.id || old?.id || ctx.id(kind.slice(0, -1))),
      createdAt: old?.createdAt || ctx.now(),
      updatedAt: ctx.now(),
      isDeleted: input.isDeleted ?? old?.isDeleted ?? false,
    };
    for (const key of Object.keys(x))
      if (/password|credential|verifier|^salt$|cvv|cardNumber|securityCode/i.test(key))
        delete x[key];
    if (kind === 'users') {
      x.name = x.name || x.fullName || 'User';
      x.phone = x.phone || x.phoneNumber || '';
      x.role = old?.role || 'User';
      x.status = String(x.status || 'active').toLowerCase();
      x.accessibilityPreferences = x.accessibilityPreferences || [];
      x.savedPlaces = x.savedPlaces || [];
    }
    if (kind === 'organizations') {
      x.name =
        input.organizationName && input.organizationName !== old?.organizationName
          ? input.organizationName
          : input.name || x.organizationName || x.name || 'Organization';
      x.organizationName = x.name;
      x.status = String(x.status || 'active').toLowerCase();
      x.approvalStatus = x.approvalStatus || 'pending';
      x.phone = x.phone || x.phoneNumber || '';
    }
    if (kind === 'branches') {
      x.name =
        input.branchName && input.branchName !== old?.branchName
          ? input.branchName
          : input.name || x.branchName || x.name || '';
      x.branchName = x.name;
      x.organizationId =
        old?.organizationId || (a?.role === 'Organization' ? a.id : x.organizationId);
      if (!old) {
        x.status = 'draft';
        x.completedSteps = {
          details: false,
          workingHours: false,
          accessibility: false,
          photos: false,
          aiReview: false,
        };
      }
      x.status = x.status || 'draft';
      x.status =
        {
          'pending-review': 'pending',
          'needs review': 'pending',
        }[x.status] || x.status;
      if (
        input.accessibilityScore != null &&
        (!Number.isFinite(Number(input.accessibilityScore)) ||
          Number(input.accessibilityScore) < 0 ||
          Number(input.accessibilityScore) > 100)
      )
        ctx.fail('INVALID_SCORE', 'Accessibility score must be between 0 and 100.');
      x.accessibilityScore = ['ai', 'demo'].includes(old?.scoreSource)
        ? old.accessibilityScore
        : null;
      x.score = x.accessibilityScore;
      x.scoreSource = ['ai', 'demo'].includes(old?.scoreSource) ? old.scoreSource : null;
      x.photos = x.photos || [];
      x.services = Array.isArray(x.services)
        ? x.services
        : typeof x.services === 'string'
          ? x.services
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean)
          : x.destinations || [];
      x.workingHours = x.workingHours || {};
      if (
        old &&
        ['photos', 'accessibility'].some(
          (k) => k in input && JSON.stringify(input[k]) !== JSON.stringify(old[k]),
        )
      ) {
        x.completedSteps = {
          ...x.completedSteps,
          aiReview: false,
        };
        x.aiReview = null;
        x.accessibilityScore = null;
        x.score = null;
        x.scoreSource = null;
        if (['approved', 'published'].includes(x.status)) x.status = 'draft';
      }
      if (
        x.accessibilityScore != null &&
        (!Number.isFinite(x.accessibilityScore) ||
          x.accessibilityScore < 0 ||
          x.accessibilityScore > 100)
      )
        ctx.fail('INVALID_SCORE', 'Accessibility score must be between 0 and 100.');
      x.evidenceStatus =
        ctx.isAdmin(a) && input.evidenceStatus === 'approved'
          ? 'approved'
          : old?.evidenceStatus || 'unverified';
      if (
        a?.role === 'Organization' &&
        ['approved', 'published'].includes(x.status) &&
        x.status !== old?.status
      )
        ctx.fail('FORBIDDEN', 'Only an administrator can approve a branch.');
      if (a?.role === 'Organization') {
        x.evidenceStatus = 'unverified';
        if (
          old &&
          ['approved', 'published'].includes(old.status) &&
          ['name', 'branchName', 'address', 'city', 'phone', 'latitude', 'longitude'].some(
            (k) => k in input && String(input[k] ?? '') !== String(old[k] ?? ''),
          )
        )
          x.status = 'draft';
        const o = ctx.db().organizations.find((o) => o.id === a.id);
        if (o?.approvalStatus !== 'approved')
          ctx.fail('ORGANIZATION_PENDING', 'Organization approval is required.');
      }
    }
    if (kind === 'documents') {
      x.ownerId = old?.ownerId || a.id;
      x.status = x.status || 'preview-only';
      x.uploaded = false;
    }
    if (kind === 'notifications') {
      x.ownerId = old?.ownerId || (ctx.isAdmin(a) ? x.ownerId : a.id) || a.id;
      x.status = x.read ? 'read' : x.status || 'unread';
    }
    if (kind === 'tickets') {
      x.requesterId = old?.requesterId || a.id;
      x.kind = x.kind || old?.kind || 'support';
      x.branchId = x.branchId || (x.kind === 'accessibility-report' ? x.placeId : null);
      x.subject = x.subject || x.title || x.issueType || 'Support request';
      x.description = x.description || x.message || '';
      x.status = x.status || 'Open';
      x.messages = (input.responses || input.messages || old?.messages || []).map((m, i) =>
        i < (old?.messages?.length || 0)
          ? old.messages[i]
          : {
              ...m,
              sender: a.name,
              actorId: a.id,
              createdAt: ctx.now(),
            },
      );
      const linked = ctx.db().branches.find((b) => b.id === x.branchId);
      if (linked) x.organizationId = linked.organizationId;
    }
    if (kind === 'reviews') {
      x.userId = old?.userId || (ctx.isAdmin(a) ? x.userId : a.id);
      x.branchId = x.branchId || x.placeId;
      x.visitId = x.visitId || x.bookingId;
      x.rating = Number(x.rating);
      if (!Number.isInteger(x.rating) || x.rating < 1 || x.rating > 5)
        ctx.fail('INVALID_RATING', 'Rating must be an integer from 1 to 5.');
      if (!ctx.isAdmin(a)) x.status = 'Pending';
      x.status =
        {
          Published: 'Visible',
          Hidden: 'Hidden',
          Rejected: 'Rejected',
          Pending: 'Pending',
          Visible: 'Visible',
        }[x.status || 'Pending'] || x.status;
      if (!ctx.isAdmin(a)) {
        x.moderationLocked = Boolean(old?.moderationLocked);
        x.approvedAt = old?.approvedAt;
        x.approvedBy = old?.approvedBy;
      }
      x.flagged = Boolean(x.flagged);
      const branch = ctx.db().branches.find(b => b.id === x.branchId);
      x.organizationId = branch?.organizationId;
      if (ctx.isAdmin(a) && x.status === 'Visible') {
        x.moderationLocked = true;
        x.approvedAt = old?.approvedAt || ctx.now();
        x.approvedBy = old?.approvedBy || a.id;
      }
    }
    if (
      ['branches', 'organizations'].includes(kind) &&
      ('latitude' in input || 'longitude' in input)
    ) {
      const same =
        old &&
        String(('latitude' in input ? input.latitude : old.latitude) ?? '') ===
          String(old.latitude ?? '') &&
        String(('longitude' in input ? input.longitude : old.longitude) ?? '') ===
          String(old.longitude ?? '');
      const point = same
        ? window.WusoolLocation.pair(x.latitude, x.longitude)
        : window.WusoolLocation.validate(x.latitude, x.longitude);
      x.latitude = point?.latitude ?? null;
      x.longitude = point?.longitude ?? null;
      x.countryCode = point ? 'JO' : null;
      if (
        kind === 'branches' &&
        old &&
        a?.role === 'Organization' &&
        !same &&
        ['approved', 'published'].includes(old.status)
      ) {
        x.status = 'pending';
        x.evidenceStatus = 'unverified';
      }
    }
    return x;
  };
  ctx.list = async function list(kind, options = {}) {
    if (ctx.cfg.mode === 'api')
      return ctx.request(
        '/' +
          kind +
          '?' +
          new URLSearchParams(
            Object.entries(options).filter(
              ([key, value]) => key !== 'signal' && value !== undefined && value !== null,
            ),
          ),
        { signal: options.signal },
      );
    const data = ctx.db();
    let a = null;
    if (kind === 'branches' || kind === 'reviews' || kind === 'organizations') a = ctx.current();
    else a = ctx.requireAccount();
    let items = data[kind];
    if (!Array.isArray(items)) ctx.fail('INVALID_ENTITY', 'Unknown entity.');
    items = items.filter((x) => options.includeDeleted || !x.isDeleted);
    if (kind === 'bookings' && !ctx.isAdmin(a))
      items = items.filter(
        (x) =>
          x.status !== 'cancelled' ||
          Date.now() - Date.parse(x.cancelledAt || x.updatedAt) < 86400000,
      );
    if (!ctx.isAdmin(a)) {
      if (kind === 'branches')
        items = items.filter((x) => ctx.visibleBranch(data, x) || ctx.own(data, a, kind, x));
      else if (kind === 'reviews')
        items = items.filter((x) => a?.role === 'Organization'
          ? data.branches.some(b => b.id === x.branchId && b.organizationId === a.id)
          : x.status === 'Visible' || ctx.own(data, a, kind, x));
      else if (kind === 'organizations')
        items = items.filter(
          (x) =>
            (x.approvalStatus === 'approved' && x.status === 'active') || ctx.own(data, a, kind, x),
        );
      else items = items.filter((x) => ctx.own(data, a, kind, x));
    }
    if (kind === 'reviews') items = items.map(x => ({ ...x, organizationId: data.branches.find(b => b.id === x.branchId)?.organizationId || x.organizationId }));
    for (const k of ['status', 'organizationId', 'branchId', 'userId', 'requesterId', 'kind'])
      if (options[k])
        items = items.filter(
          (x) => String(x[k]).toLowerCase() === String(options[k]).toLowerCase(),
        );
    if (options.flagged != null) items = items.filter((x) => x.flagged === options.flagged);
    if (options.search) {
      const q = options.search.toLowerCase();
      items = items.filter((x) =>
        [x.name, x.email, x.subject, x.title, x.comment, x.city]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    const total = items.length,
      page = Math.max(1, Number(options.page) || 1),
      pageSize = Math.min(500, Math.max(1, Number(options.pageSize) || 500));
    return {
      items: items
        .slice((page - 1) * pageSize, page * pageSize)
        .map((x) =>
          kind === 'organizations' && !ctx.own(data, a, kind, x)
            ? ctx.safe(
                Object.fromEntries(
                  [
                    'id',
                    'name',
                    'organizationName',
                    'type',
                    'organizationType',
                    'city',
                    'address',
                    'latitude',
                    'longitude',
                    'governorate',
                    'countryCode',
                    'status',
                    'approvalStatus',
                    'website',
                    'phone',
                  ]
                    .filter((k) => k in x)
                    .map((k) => [k, x[k]]),
                ),
              )
            : ['users', 'organizations'].includes(kind)
              ? ctx.accountDto(x)
              : ctx.safe(x),
        ),
      total,
      page,
      pageSize,
    };
  };
  ctx.listAll = async function listAll(kind, options = {}) {
    const first = await ctx.list(kind, {
      ...options,
      page: 1,
      pageSize: 500,
    });
    if (
      !first ||
      !Array.isArray(first.items) ||
      !Number.isFinite(first.total) ||
      !Number.isFinite(first.pageSize) ||
      first.pageSize < 1 ||
      first.total < 0 ||
      first.items.length > first.total
    )
      ctx.fail('INVALID_RESPONSE', 'The backend returned an invalid paginated list.');
    const items = [...first.items];
    let page = 1;
    while (items.length < first.total) {
      const next = await ctx.list(kind, {
        ...options,
        page: ++page,
        pageSize: first.pageSize,
        ...(first.snapshot ? { snapshot: first.snapshot } : {}),
      });
      if (!next || !Array.isArray(next.items) || !next.items.length)
        ctx.fail('INVALID_RESPONSE', 'The backend pagination ended before the advertised total.');
      if (next.total !== first.total || (first.snapshot && next.snapshot !== first.snapshot))
        ctx.fail('CONFLICT', 'The collection changed during pagination. Reload the list.');
      const ids = new Set(items.filter((x) => x?.id != null).map((x) => String(x.id)));
      if (next.items.some((x) => x?.id != null && ids.has(String(x.id))))
        ctx.fail('INVALID_RESPONSE', 'The server repeated records during pagination.');
      items.push(...next.items);
    }
    return {
      ...first,
      items,
    };
  };
  ctx.get = async function get(kind, entityId) {
    if (ctx.cfg.mode === 'api') return ctx.request(`/${kind}/${encodeURIComponent(entityId)}`);
    return (
      (
        await ctx.listAll(kind, {
          includeDeleted: ctx.current()?.role === 'Admin',
        })
      ).items.find((x) => String(x.id) === String(entityId)) || null
    );
  };
  ctx.save = async function save(kind, input) {
    if (
      ctx.cfg.mode === 'api' &&
      ['branches', 'organizations'].includes(kind) &&
      ('latitude' in input || 'longitude' in input)
    )
      input = {
        ...input,
        ...window.WusoolLocation.fields(input),
      };
    if (ctx.cfg.mode === 'api' && kind === 'branches') {
      input = {
        ...input,
      };
      for (const key of [
        'accessibilityScore',
        'score',
        'scoreSource',
        'analysisId',
        'aiReview',
        'reviewedBy',
        'reviewedAt',
        'approvedAt',
        'evidenceStatus',
        'demoPublication',
        'isPublished',
        'statusLabel',
      ])
        delete input[key];
      if (!input.id) input.status = 'draft';
    }
    if (ctx.cfg.mode === 'api')
      return ctx.request('/' + kind + (input.id ? '/' + encodeURIComponent(input.id) : ''), {
        method: input.id ? 'PUT' : 'POST',
        body: input,
      });
    const a = ctx.requireAccount(),
      data = ctx.db(),
      old = data[kind]?.find((x) => String(x.id) === String(input.id));
    if (old && !ctx.own(data, a, kind, old))
      ctx.fail('FORBIDDEN', 'Record belongs to another account.');
    if (
      !old &&
      !ctx.isAdmin(a) &&
      !['branches', 'tickets', 'reviews', 'documents', 'notifications'].includes(kind)
    )
      ctx.fail('FORBIDDEN', 'Administrator access is required.');
    if (kind === 'bookings')
      ctx.fail('USE_BOOKING_API', 'Use the booking create, reschedule or status operation.');
    if (kind === 'reviews' && a.role === 'Organization')
      ctx.fail('FORBIDDEN', 'Organizations can read visit reviews but cannot change visitor feedback.');
    if (kind === 'reviews' && old && !ctx.isAdmin(a) &&
        (old.moderationLocked || old.approvedAt || ['visible','published','approved'].includes(String(old.status).toLowerCase())))
      ctx.fail('REVIEW_LOCKED', 'This review was approved by Admin and can no longer be changed or deleted.');
    const x = ctx.normalize(kind, input, old, a);
    if (
      kind === 'branches' &&
      ['pending', 'approved', 'published'].includes(x.status) &&
      !window.WusoolBranchWorkflow.complete(x)
    )
      ctx.fail('BRANCH_INCOMPLETE', window.WusoolBranchWorkflow.explain(x));
    if (
      kind === 'users' &&
      old?.role === 'Admin' &&
      (x.isDeleted ||
        x.status !== 'active' ||
        String(x.email).trim().toLowerCase() !== 'admin@wusool.com' ||
        (input.role && input.role !== 'Admin'))
    )
      ctx.fail(
        'ADMIN_PROTECTED',
        'The administrator account cannot be blocked, disabled, deleted, renamed or demoted.',
      );
    if (kind === 'organizations' && old && !ctx.isAdmin(a)) {
      x.approvalStatus = old.approvalStatus;
      x.status = old.status;
    }
    if (old && !ctx.isAdmin(a))
      for (const field of ['userId', 'requesterId', 'organizationId', 'ownerId'])
        if (old[field]) x[field] = old[field];
    if (['users', 'organizations'].includes(kind)) {
      x.email = String(x.email || '')
        .trim()
        .toLowerCase();
      if (x.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email))
        ctx.fail('VALIDATION_ERROR', 'Enter a valid email.');
      if (
        !x.isDeleted &&
        x.email &&
        [...data.users, ...data.organizations].some(
          (y) => !y.isDeleted && y.id !== x.id && y.email === x.email,
        )
      )
        ctx.fail('EMAIL_EXISTS', 'An account already exists for this email.');
      if (
        ['blocked', 'suspended', 'disabled'].includes(x.status) &&
        x.status !== old?.status &&
        !String(input.reason || '').trim()
      )
        ctx.fail('VALIDATION_ERROR', 'An administrator reason is required.');
    }
    const statuses = window.WusoolConstants.entityStatuses;
    if (statuses[kind] && !statuses[kind].includes(x.status))
      ctx.fail('INVALID_STATUS', 'Unsupported status value.');
    if (
      kind === 'branches' &&
      a.role === 'Organization' &&
      old &&
      x.status !== old.status &&
      !window.WusoolConstants.branchTransitions[old.status]?.includes(x.status)
    )
      ctx.fail('INVALID_TRANSITION', 'Unsupported branch transition.');
    if (
      kind === 'branches' &&
      !data.organizations.some((o) => o.id === x.organizationId && !o.isDeleted)
    )
      ctx.fail('INVALID_REFERENCE', 'Organization does not exist.');
    if (kind === 'branches' && a.role === 'Organization' && !old) {
      const subscription = data.subscriptions.find(
        (t) =>
          t.organizationId === a.id && !t.isDeleted && String(t.status).toLowerCase() === 'active',
      );
      if (!subscription)
        ctx.fail(
          'SUBSCRIPTION_REQUIRED',
          'An active subscription or explicit development fixture is required to create a branch.',
        );
      if (
        Number.isFinite(Number(subscription.branchLimit)) &&
        data.branches.filter((b) => b.organizationId === a.id && !b.isDeleted).length >=
          Number(subscription.branchLimit)
      )
        ctx.fail('BRANCH_LIMIT', 'The subscription branch limit has been reached.');
    }
    if (
      kind === 'tickets' &&
      x.branchId &&
      !data.branches.some((b) => b.id === x.branchId && !b.isDeleted)
    )
      ctx.fail('INVALID_REFERENCE', 'Support branch does not exist.');
    if (kind === 'reviews') {
      if (old && !ctx.isAdmin(a) && (x.branchId !== old.branchId || x.visitId !== old.visitId))
        ctx.fail('INVALID_REFERENCE', 'An existing review cannot be moved to another visit.');
      if (
        !data.users.some((u) => u.id === x.userId && !u.isDeleted) ||
        !data.branches.some((b) => b.id === x.branchId && !b.isDeleted)
      )
        ctx.fail('INVALID_REFERENCE', 'User or branch does not exist.');
      {
        const booking = data.bookings.find(
          (b) =>
            String(b.id) === String(x.visitId) &&
            b.userId === x.userId &&
            b.branchId === x.branchId &&
            b.status === 'completed',
        );
        if (!booking)
          ctx.fail('REVIEW_INELIGIBLE', 'A completed visit is required before reviewing.');
        if (
          !old &&
          data.reviews.some(
            (r) => !r.isDeleted && r.userId === x.userId && String(r.visitId) === String(x.visitId),
          )
        )
          ctx.fail('DUPLICATE_REVIEW', 'Edit your existing review for this visit.');
        if (!ctx.isAdmin(a) && !x.isDeleted) {
          x.comment = String(x.comment || '').trim();
          x.title = String(x.title || '').trim();
          if (x.comment.length < 3 || x.comment.length > 500 || x.title.length > 120)
            ctx.fail('VALIDATION_ERROR', 'Review comment must be 3–500 characters; title must be at most 120 characters.');
        }
      }
    }
    if (kind === 'branches' && ctx.isAdmin(a) && x.status !== old?.status) {
      x.reviewedBy = a.id;
      x.reviewedAt = ctx.now();
      x.statusUpdatedAt = x.reviewedAt;
      x.adminFeedback = input.reason || '';
      if (['approved', 'published'].includes(x.status)) x.approvedAt = x.reviewedAt;
    }
    if (old) data[kind][data[kind].indexOf(old)] = x;
    else data[kind].push(x);
    ctx.audit(data, a, old ? 'Update' : 'Create', kind, x.id, input.reason || '');
    if (
      (['users', 'organizations'].includes(kind) &&
        ['blocked', 'suspended', 'disabled'].includes(x.status)) ||
      x.isDeleted
    )
      data.revocations[x.id] = (data.revocations[x.id] || 0) + 1;
    if (kind === 'organizations' && ctx.isAdmin(a)) {
      if (x.status === 'active' && old?.approvalStatus !== 'approved')
        x.approvalStatus = 'approved';
      if (x.status === 'rejected') x.approvalStatus = 'rejected';
      if (x.approvalStatus !== old?.approvalStatus) {
        for (const app of data.applications.filter((t) => t.organizationId === x.id)) {
          app.status = x.approvalStatus;
          app.reviewedBy = a.id;
          app.reviewedAt = ctx.now();
          app.reason = input.reason || '';
        }
        data.notifications.push({
          id: ctx.id('notification'),
          ownerId: x.id,
          title: 'Application decision',
          message: x.approvalStatus,
          status: 'unread',
          createdAt: ctx.now(),
        });
      }
    }
    if (kind === 'reviews' && !x.isDeleted) {
      const targets = !ctx.isAdmin(a) ? data.users.filter(u => u.role === 'Admin' && !u.isDeleted).map(u => u.id) : old && old.status !== x.status ? [x.userId] : [];
      for (const ownerId of targets) data.notifications.push({
        id: ctx.id('notification'), ownerId, reviewId: x.id, branchId: x.branchId,
        title: ctx.isAdmin(a) ? 'Review moderation decision' : 'Visit review awaiting approval',
        message: ctx.isAdmin(a) ? 'Your visit review is ' + x.status + (x.moderationLocked ? '. Approved reviews cannot be edited.' : '.') : 'A visitor submitted or updated a review for Admin moderation.',
        status: 'unread', createdAt: ctx.now()
      });
    }
    ctx.put(data);
    if (
      ctx.session()?.id === x.id &&
      (['blocked', 'suspended', 'disabled'].includes(x.status) || x.isDeleted)
    )
      ctx.clearSession();
    return ctx.safe(x);
  };
  ctx.setStatus = async function setStatus(kind, entityId, status, reason = '') {
    const old = await ctx.get(kind, entityId);
    if (!old) ctx.fail('NOT_FOUND', 'Record was not found.');
    return ctx.save(kind, {
      ...old,
      status,
      reason,
    });
  };
  ctx.branchFeatures = function branchFeatures(b) {
    const aliases = {
      'accessible-entrance': 'ramp',
      'entrance-ramp': 'ramp',
      'accessible-parking': 'parking',
      'accessible-restroom': 'restroom',
      'wide-pathways': 'wide-path',
      'staff-assistance': 'assistance',
      accessibleEntrance: 'ramp',
      entranceRamp: 'ramp',
      accessibleParking: 'parking',
      accessibleRestroom: 'restroom',
      widePathways: 'wide-path',
      staffAssistance: 'assistance',
      hearingSupport: 'hearing',
      elevator: 'elevator',
    };
    const source = b.accessibility || b.accessibilityFeatures || {};
    const values = Array.isArray(source)
      ? source.map((x) => [x.key || x.id, x.status || x.value])
      : Object.entries(source).map(([k, v]) => [
          k,
          typeof v === 'object' ? v.status || v.value : v,
        ]);
    return [
      ...new Set(
        values
          .filter(([k, v]) =>
            typeof b.operationalAvailability?.[k]?.available === 'boolean'
              ? b.operationalAvailability[k].available
              : v === true || ['available', 'yes'].includes(String(v).toLowerCase()),
          )
          .map(([k]) => aliases[k] || k),
      ),
    ];
  };
  ctx.places = async function places() {
    if (ctx.cfg.mode === 'api') return ctx.listAll('places');
    const data = ctx.db();
    return {
      items: data.branches
        .filter((b) => ctx.visibleBranch(data, b))
        .map((b) => {
          const o = data.organizations.find((o) => o.id === b.organizationId),
            reviews = data.reviews.filter(
              (r) => r.branchId === b.id && r.status === 'Visible' && !r.isDeleted,
            ),
            rating = reviews.length
              ? reviews.reduce((v, r) => v + r.rating, 0) / reviews.length
              : 0;
          return {
            ...ctx.safe(b),
            name: o.name + ' — ' + b.name,
            organizationName: o.name,
            placeId: b.id,
            branchName: b.name,
            branch: b.name,
            score: b.accessibilityScore,
            rating,
            reviewCount: reviews.length,
            branches: [b.name],
            destinations: b.services.map((s) => (typeof s === 'string' ? s : s.name)),
            features: ctx.branchFeatures(b),
            supports: ctx.branchFeatures(b),
            accessibilityFeatures: ctx.branchFeatures(b),
            category: o.type || o.organizationType || 'Other',
            scoreSource: b.scoreSource,
            scoreDescription:
              b.scoreSource === 'demo'
                ? 'Demo checklist estimate — not AI verified'
                : b.evidenceStatus === 'approved'
                  ? 'Approved accessibility evidence'
                  : 'Organization claim — unverified',
            mapQuery: b.address || b.city,
            type: o.type || o.organizationType || 'Other',
            image:
              b.photos[0]?.url ||
              b.photos[0]?.imageData ||
              '../../assets/images/wusool-login-campus.png',
            latitude: window.WusoolLocation.number(b.latitude),
            longitude: window.WusoolLocation.number(b.longitude),
          };
        }),
      total: data.branches.filter((b) => ctx.visibleBranch(data, b)).length,
      page: 1,
      pageSize: 500,
    };
  };
  ctx.bookingDto = function bookingDto(x, data = null, portal = 'user') {
    const b = data?.branches?.find((b) => b.id === x.branchId),
      o = data?.organizations?.find((o) => o.id === x.organizationId),
      u = data?.users?.find((u) => u.id === x.userId);
    return {
      ...ctx.safe(x),
      placeId: x.branchId,
      placeName: o?.name || x.placeName || x.organizationName || '',
      branch: b?.name || x.branchName || x.locationSnapshot?.branchName || x.branch || '',
      branchName: b?.name || x.branchName || x.locationSnapshot?.branchName || x.branch || '',
      visitorName: u?.name || x.visitorName || '',
      visitorEmail: u?.email || x.visitorEmail || '',
      visitorPhone: u?.phone || x.visitorPhone || '',
      date: x.date,
      time: x.time,
      visitDate: x.date,
      visitTime: x.time,
      purpose: x.purpose || '',
      visitPurpose: x.purpose || '',
      support: x.support || [],
      reviewed: data
        ? data.reviews.some((r) => r.visitId === x.id && !r.isDeleted)
        : Boolean(x.reviewed),
      guidance: x.guidanceMethod || 'both',
      status:
        portal === 'org'
          ? x.status
          : {
              pending: 'Pending',
              confirmed: 'Confirmed',
              'in-progress': 'In Progress',
              completed: 'Completed',
              cancelled: 'Cancelled',
            }[x.status] || x.status,
    };
  };
});
