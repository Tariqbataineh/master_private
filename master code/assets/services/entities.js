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
      for(const key of ['assistanceCapacity','capacity','minAdvanceMinutes','maxAdvanceDays','pendingHoldMinutes'])
        if(key in input && input[key]!==null && (!Number.isInteger(input[key])||input[key]<(['pendingHoldMinutes','capacity'].includes(key)?1:0))) ctx.fail('VALIDATION_ERROR','Invalid branch configuration: '+key);
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
      if('accessibility' in input && JSON.stringify(input.accessibility)!==JSON.stringify(old?.accessibility)) {x.accessibilityDeclaredBy=a.id;x.accessibilityDeclaredAt=ctx.now();}
      x.aiReview = old?.aiReview || null;
      x.photos = x.photos || [];
      if (ctx.branchMedia) {
        x.photos=x.photos.map(p=>ctx.branchMedia.metadata(p));
        x.videos=(x.videos||[]).map(p=>ctx.branchMedia.metadata(p));
      }
      // Reviewed route versions cannot be forged through general branch edits.
      x.navigationVersions=old?.navigationVersions||[];
      x.publishedNavigationVersionId=old?.publishedNavigationVersionId||null;
      x.navigationDraft=old?.navigationDraft||{points:[],connections:[],destinations:[]};
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
        // Declared facilities may change without fabricating an approval or AI result.
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
        if(input.isPublished===true && old?.isPublished!==true) ctx.fail('FORBIDDEN','Administrator publication review is required.');
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
    // Authorized users retain their cancelled booking history; ownership is checked below.
    if (!ctx.isAdmin(a)) {
      if (kind === 'branches')
        items = items.filter((x) => ctx.visibleBranch(data, x) || ctx.own(data, a, kind, x));
      else if (kind === 'reviews')
        items = items.filter((x) => a?.role === 'Organization'
          ? data.branches.some(b => b.id === x.branchId && ctx.own(data,a,'branches',b))
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
            : kind==='branches' && !ctx.own(data,a,kind,x) ? ctx.publicBranchDto(x)
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
      if(input.isPublished===true && (await ctx.getCurrentAccount())?.role!=='Admin') ctx.fail('FORBIDDEN','Administrator publication review is required.');
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
    if(kind==='memberships')ctx.fail('USE_ASSIGNMENT_API','Use the audited representative assignment action.');
    if(kind==='organizations' && 'representativeAccountId' in input && input.representativeAccountId!==old?.representativeAccountId)ctx.fail('USE_ASSIGNMENT_API','Use the explicit representative assignment action.');
    if(kind==='subscriptions'&&!old&&(input.origin==='admin-grant'||input.entitlements))ctx.fail('USE_GRANT_API','Use the audited Enterprise grant action.');
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
    for (const key of ['isDeleted','active','isPublished','bookingEnabled'])
      if (key in input && typeof input[key] !== 'boolean') ctx.fail('VALIDATION_ERROR', key + ' must be true or false.');
    if (kind === 'branches' && 'ticketServices' in input && JSON.stringify(input.ticketServices) !== JSON.stringify(old?.ticketServices))
      ctx.fail('USE_SERVICE_API', 'Configure services through the branch service editor.');
    if(['organizations','branches'].includes(kind)) for(const key of ['sourceUrl','source','imported','directoryOnly','provenance','adoption'])
      if(old && key in old && key in input && JSON.stringify(old[key])!==JSON.stringify(input[key])) ctx.fail('VALIDATION_ERROR','Imported provenance must be preserved: '+key);
    if(['organizations','branches'].includes(kind)) {
      for(const key of ['website','officialUrl','sourceUrl']) if(input[key]) {let url;try{url=new URL(input[key]);}catch{ctx.fail('VALIDATION_ERROR','Enter a valid '+key+' URL.');}if(!['https:','http:'].includes(url.protocol))ctx.fail('VALIDATION_ERROR','Use an HTTP or HTTPS '+key+' URL.');}
      for(const key of ['phone','phoneNumber']) if(input[key]&&!/^[+\d\s()-]{7,24}$/.test(String(input[key]))) ctx.fail('VALIDATION_ERROR','Enter a valid contact phone number.');
    }
    if(kind==='branches'&&a.role==='Organization')ctx.requireEntitlement?.(data,a,'serviceManagement');
    if(kind==='documents'&&a.role==='Organization')ctx.requireEntitlement?.(data,a,'accessibilityEvidence');
    if(kind==='subscriptions' && old?.origin==='admin-grant' && ['entitlements','origin','organizationId','grantHistory','grantedBy','startDate','endDate','nonExpiring','plan','branchLimit','paymentStatus','price'].some(k=>k in input&&JSON.stringify(input[k])!==JSON.stringify(old[k])))
      ctx.fail('USE_GRANT_API','Edit an Enterprise grant through the audited grant action.');
    const x = ctx.normalize(kind, input, old, a);
    if (kind === 'subscriptions' && (!old || ctx.effectiveBranchCapacity(x) !== ctx.effectiveBranchCapacity(old))) {
      const usage = data.branches.filter(b => b.organizationId === x.organizationId && !b.isDeleted).length;
      if (ctx.effectiveBranchCapacity(x) < usage)
        ctx.fail('CAPACITY_BELOW_USAGE', 'Subscription capacity cannot be lower than existing branch usage.');
    }
    if (kind === 'branches' && 'assistanceResources' in input) {
      const resources = input.assistanceResources;
      if (!Array.isArray(resources) || resources.length > 100 || new Set(resources.map(r => r?.id)).size !== resources.length)
        ctx.fail('VALIDATION_ERROR', 'Provide at most 100 distinct assistant resources.');
      for (const resource of resources) {
        if (!resource || typeof resource.id !== 'string' || !resource.id.trim() || resource.id.length > 120 || ('active' in resource && typeof resource.active !== 'boolean'))
          ctx.fail('VALIDATION_ERROR', 'Invalid assistant resource.');
        if (resource.branchIds && (!Array.isArray(resource.branchIds) || !resource.branchIds.includes(x.id) || resource.branchIds.some(id => id !== x.id && !data.branches.some(b => b.id === id && b.organizationId === x.organizationId && !b.isDeleted))))
          ctx.fail('INVALID_REFERENCE', 'Assistant branch assignments must belong to this organization.');
        if (resource.workingHours) ctx.hours.normalize(resource);
      }
    }
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
      if(Array.isArray(a.branchIds))ctx.fail('FORBIDDEN','A branch-scoped representative cannot create branches. Contact the organization owner.');
      const subscription = ctx.subscriptionFor ? ctx.subscriptionFor(data,a.id) : data.subscriptions.find(
        (t) =>
          t.organizationId === a.id && !t.isDeleted && String(t.status).toLowerCase() === 'active',
      );
      if (!subscription || (ctx.api.subscriptionState && ctx.api.subscriptionState(subscription)!=='active'))
        ctx.fail(
          'SUBSCRIPTION_REQUIRED',
          'An active subscription is required to create a branch. Open Subscription Management or contact Admin.',
        );
      if (
        ctx.effectiveBranchCapacity(subscription) >= 0 &&
        data.branches.filter((b) => b.organizationId === a.id && !b.isDeleted).length >=
          ctx.effectiveBranchCapacity(subscription)
      )
        ctx.fail('BRANCH_LIMIT', 'The subscription branch limit has been reached.');
    }
    if (kind === 'branches' && !x.isDeleted && !['inactive','archived','suspended','rejected'].includes(x.status)) {
      const wasActive = old && !old.isDeleted && !['inactive','archived','suspended','rejected'].includes(old.status);
      const activeCount = data.branches.filter(b => b.id !== x.id && b.organizationId === x.organizationId && !b.isDeleted && !['inactive','archived','suspended','rejected'].includes(b.status)).length;
      const capacity = ctx.effectiveBranchCapacity(ctx.subscriptionFor(data,x.organizationId));
      if (!wasActive && activeCount >= capacity)
        ctx.fail('BRANCH_LIMIT', 'The confirmed subscription capacity has been reached. / تم بلوغ سعة الاشتراك المؤكدة.');
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
      if (['approved', 'published'].includes(x.status)) {
        x.approvedAt = x.reviewedAt;
        // Approval of a submission publishes it; existing hidden approvals need explicit publication.
        x.isPublished = input.isPublished ?? true;
      } else x.isPublished = false;
    }
    if (old) data[kind][data[kind].indexOf(old)] = x;
    else data[kind].push(x);
    ctx.audit(data, a, old ? 'Update' : 'Create', kind, x.id, input.reason || '');
    if (
      (['users', 'organizations'].includes(kind) &&
        ['blocked', 'suspended', 'disabled'].includes(x.status)) ||
      (['users','organizations'].includes(kind) && x.isDeleted)
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
    if(kind==='organizations'&&x.isDeleted){for(const draft of Object.values(data.drafts||{})){if(draft.selectedOrganizationId===x.id)delete draft.selectedOrganizationId;const selected=data.branches.find(b=>b.id===draft.branchId);if(selected?.organizationId===x.id)delete draft.branchId;}}
    ctx.put(data);
    if (
      ctx.session()?.id === x.id &&
      ((kind==='organizations'&&ctx.session()?.role==='Organization')||(kind==='users'&&ctx.session()?.role!=='Organization')) &&
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
      ...(kind === 'branches' ? {isPublished: ['approved','published'].includes(status)} : {}),
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
            ...ctx.publicBranchDto(b),
            directoryOnly: !!b.directoryOnly&&!o.adoption,
            accessibilitySource: b.accessibilityDeclaredAt?"institution":(b.sourceUrl||o.sourceUrl)?"imported":"institution",
            
            name: o.name + ' — ' + b.name,
            organizationName: o.name,
            organizationProfile: {id:o.id,name:o.name,type:o.type||o.organizationType||'Other',description:o.publicDescription||o.description||'',logo:o.logo||'',address:o.address||'',city:o.city||'',phone:o.phone||''},
            placeId: b.id,
            branchName: b.name,
            branch: b.name,
            score: b.scoreSource==='demo'?null:b.accessibilityScore,
            accessibilityScore: b.scoreSource==='demo'?null:b.accessibilityScore,
            rating,
            reviewCount: reviews.length,
            branches: [b.name],
            destinations: (b.services || []).map((s) => (typeof s === 'string' ? s : s.name)),
            features: ctx.branchFeatures(b),
            supports: ctx.branchFeatures(b),
            accessibilityFeatures: ctx.branchFeatures(b),
            category: o.type || o.organizationType || 'Other',
            scoreSource: b.scoreSource,
            scoreDescription:
              b.directoryOnly ? 'تسهيلات الوصول غير مقيمة ميدانيًا في وصول' : b.scoreSource === 'demo'
                ? 'Demo checklist estimate — not AI verified'
                : b.evidenceStatus === 'approved'
                  ? 'Approved accessibility evidence'
                  : 'Organization claim — unverified',
            mapQuery: b.address || b.city,
            type: o.type || o.organizationType || 'Other',
            image:
              b.photos?.[0]?.url ||
              b.photos?.[0]?.imageData ||
              (b.directoryOnly ? '' : '../../assets/images/wusool-login-campus.png'),
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
      destination: x.serviceName || x.destination || '',
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

'use strict';
// One service boundary; branch metadata lives with the existing branch record.
window.WusoolServiceModules.push(ctx => {
  const fail=(code,message)=>ctx.fail(code,message),copy=x=>JSON.parse(JSON.stringify(x));
  const numeric=(v,min,max,label)=>{if(v==null||v===''||typeof v==='string'&&!v.trim())return null;if(!['string','number'].includes(typeof v))fail('VALIDATION_ERROR',label+' must be numeric.');const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)fail('VALIDATION_ERROR',label+' is outside its valid range.');return n;};
  const metadata=input=>{
    const x={...input};for(const k of ['title','categoryKey','pointId','floor','destinationId','notes'])x[k]=String(x[k]??'').trim()||null;
    x.latitude=numeric(x.latitude,-90,90,'Latitude');x.longitude=numeric(x.longitude,-180,180,'Longitude');
    if((x.latitude===null)!==(x.longitude===null))fail('VALIDATION_ERROR','Supply latitude and longitude together, or omit both.');
    x.accuracy=numeric(x.accuracy,0,100000,'Accuracy');x.heading=numeric(x.heading,0,359.999999,'Heading');
    x.locationTimestamp=x.locationTimestamp||null;x.locationSource=x.locationSource||null;const sources=['device','manual','map-pin','imported'];if(x.locationSource!=null&&!sources.includes(x.locationSource))fail('VALIDATION_ERROR','Unknown location source.');
    if(x.latitude===null){x.accuracy=null;x.locationTimestamp=null;x.locationSource=null;}
    else if(x.locationSource!=='device'&&x.locationSource!=='imported')x.accuracy=null;
    if(x.locationTimestamp&&!Number.isFinite(Date.parse(x.locationTimestamp)))fail('VALIDATION_ERROR','Invalid location timestamp.');
    return x;
  };
  const localBranch=(id,write=false)=>{const a=ctx.requireAccount(write?['Organization','Admin']:[]),data=ctx.db(),b=data.branches.find(x=>String(x.id)===String(id)&&!x.isDeleted);if(!b)fail('NOT_FOUND','Branch not found.');const o=data.organizations.find(x=>String(x.id)===String(b.organizationId)&&!x.isDeleted);if(!o)fail('NOT_FOUND','Organization not found.');if(a.role!=='Admin'&&!ctx.own(data,a,'branches',b))fail('FORBIDDEN','Branch ownership required.');if(write)ctx.requireEntitlement?.(data,a,'accessibilityEvidence');if(write&&a.role==='Organization'&&o.approvalStatus!=='approved')fail('ORGANIZATION_PENDING','Organization approval is required.');return {a,data,b};};
  const fields=b=>({branchId:b.id,photos:(b.photos||[]).map((m,i)=>({...m,id:m.id||'legacy-photo-'+b.id+'-'+i})),videos:(b.videos||[]).map((m,i)=>({...m,id:m.id||'legacy-video-'+b.id+'-'+i})),draft:b.navigationDraft||{points:[],connections:[],destinations:[]},versions:b.navigationVersions||[]});
  const validateRoute=(route,b)=>{
    const r=copy(route),ids=new Set(),media=[...(b.photos||[]),...(b.videos||[])];
    if(!Array.isArray(r.points)||!Array.isArray(r.connections)||!Array.isArray(r.destinations))fail('VALIDATION_ERROR','Points, connections and destinations are required arrays.');
    if(r.points.length>100||r.connections.length>300||r.destinations.length>100)fail('VALIDATION_ERROR','Route exceeds configured limits.');
    for(const p of r.points){if(!p.id||ids.has(p.id)||!String(p.name||'').trim())fail('VALIDATION_ERROR','Each point needs a unique identifier and name.');ids.add(p.id);p.floor=String(p.floor||'');p.references=p.references||[];for(const ref of p.references){if(!media.some(m=>m.id===ref.mediaId))fail('INVALID_REFERENCE','Reference media must belong to this branch.');ref.heading=numeric(ref.heading,0,359.999999,'Reference heading');}}
    const connectionIds=new Set();for(const c of r.connections){if(!c.id||connectionIds.has(c.id)||!ids.has(c.from)||!ids.has(c.to)||c.from===c.to)fail('INVALID_REFERENCE','Invalid connection.');connectionIds.add(c.id);if(!['passage','stairs','ramp','elevator'].includes(c.kind))fail('VALIDATION_ERROR','Unknown passage type.');c.distanceMeters=numeric(c.distanceMeters,0,100000,'Distance');if(c.verified&&!String(c.instruction||'').trim())fail('VALIDATION_ERROR','Verified connections need landmark instructions.');if(c.bidirectional&&!String(c.reverseInstruction||'').trim())fail('VALIDATION_ERROR','Reverse connections require their own verified instruction.');}
    const destIds=new Set();for(const d of r.destinations){if(!d.id||destIds.has(d.id)||!ids.has(d.pointId)||!String(d.name||'').trim())fail('INVALID_REFERENCE','Invalid destination.');destIds.add(d.id);}
    return r;
  };
  const path=(route,start,destination,{stepFree=false}={})=>{
    const target=route.destinations.find(x=>x.id===destination)?.pointId;if(!target||!route.points.some(p=>p.id===start))return null;
    const queue=[[start,[]]],seen=new Set([start]);while(queue.length){const [id,steps]=queue.shift();if(id===target)return steps;for(const c of route.connections){if(!c.verified||c.available===false||stepFree&&(c.kind==='stairs'||c.stepFree!==true))continue;let next,reverse=false;if(c.from===id)next=c.to;else if(c.bidirectional&&c.to===id){next=c.from;reverse=true;}if(next&&!seen.has(next)){seen.add(next);queue.push([next,[...steps,{...c,from:id,to:next,instruction:reverse?c.reverseInstruction:c.instruction}]]);}}}return null;
  };
  const service={metadata,path,validateRoute,
    async read(branchId){if(ctx.cfg.mode==='api'){const result=await ctx.request(`/branches/${encodeURIComponent(branchId)}/media-navigation`);if(String(result.branchId)!==String(branchId))fail('INVALID_RESPONSE','Media branch mismatch.');return result;}const {b}=localBranch(branchId);return copy(fields(b));},
    async upload(branchId,file){if(ctx.cfg.mode!=='api')return {uploaded:false,status:'local-draft'};const limits={photoBytes:5*1048576,videoBytes:100*1048576,...ctx.cfg.branchMediaLimits};const video=file?.type?.startsWith('video/'),allowed=video?['video/mp4','video/webm']:['image/jpeg','image/png','image/webp'];if(!file||!allowed.includes(file.type)||file.size>(video?limits.videoBytes:limits.photoBytes))fail('INVALID_FILE','Unsupported media type or size.');const form=new FormData();form.append('file',file);const result=await ctx.request(`/branches/${encodeURIComponent(branchId)}/media/uploads`,{method:'POST',body:form});if(!result.id||result.uploaded!==true||String(result.branchId)!==String(branchId))fail('INVALID_RESPONSE','Server upload was not confirmed for this branch.');return result;},
    async saveMedia(branchId,items){const photos=items.filter(x=>x.kind!=='video').map(metadata),videos=items.filter(x=>x.kind==='video').map(metadata);if(items.length>(ctx.cfg.branchMediaLimits?.count||60))fail('VALIDATION_ERROR','Branch media count limit reached.');if(ctx.cfg.mode==='api')return ctx.request(`/branches/${encodeURIComponent(branchId)}/media`,{method:'PUT',body:{items:[...photos,...videos]}});const {a,b,data}=localBranch(branchId,true);const points=[...(b.navigationDraft?.points||[]),...(b.navigationVersions||[]).flatMap(r=>r.points||[])],destinations=[...(b.navigationDraft?.destinations||[]),...(b.navigationVersions||[]).flatMap(r=>r.destinations||[])];for(const m of [...photos,...videos]){if(m.pointId&&!points.some(p=>p.id===m.pointId))fail('INVALID_REFERENCE','Media point must belong to this branch.');if(m.destinationId&&!destinations.some(d=>d.id===m.destinationId))fail('INVALID_REFERENCE','Media destination must belong to this branch.');}const retained=new Set(items.map(x=>x.id));for(const r of b.navigationVersions||[])for(const p of r.points)for(const ref of p.references||[])if(!retained.has(ref.mediaId))fail('MEDIA_REFERENCED','A reviewed route still references this media. Keep it or retire the route first.');const changed=JSON.stringify(b.photos||[])!==JSON.stringify(photos);b.photos=photos;b.videos=videos;b.mediaState=!items.length?'not-provided':items.some(m=>['queued','processing'].includes(m.processingState))?'processing':items.every(m=>m.processingState==='failed')?'failed':'completed';b.completedSteps={...b.completedSteps,photos:photos.some(p=>p.processingState!=='failed'&&!!(p.blobId||p.url||p.imageData))};if(changed){b.completedSteps.aiReview=false;b.aiReview=null;b.accessibilityScore=null;b.score=null;b.scoreSource=null;}b.updatedAt=ctx.now();ctx.audit(data,a,'Save branch media','branches',b.id);ctx.put(data);return copy(fields(b));},
    async saveRoute(branchId,route){if(ctx.cfg.mode==='api')return ctx.request(`/branches/${encodeURIComponent(branchId)}/navigation/draft`,{method:'PUT',body:route});const {a,b,data}=localBranch(branchId,true);b.photos=fields(b).photos;b.videos=fields(b).videos;b.navigationDraft=validateRoute(route,b);b.navigationDraft.state='draft';ctx.audit(data,a,'Save navigation draft','branches',b.id);ctx.put(data);return copy(b.navigationDraft);},
    async publishRoute(branchId,{reviewConfirmed=false}={}){if(!reviewConfirmed)fail('REVIEW_REQUIRED','Review the actual landmarks, photos and both travel directions before publishing.');if(ctx.cfg.mode==='api')return ctx.request(`/branches/${encodeURIComponent(branchId)}/navigation/versions`,{method:'POST',body:{reviewConfirmed}});const {a,b,data}=localBranch(branchId,true);const r=validateRoute(b.navigationDraft||{},b);if(!r.points.length||!r.destinations.length||r.connections.some(c=>!c.verified))fail('REVIEW_REQUIRED','A reviewed route needs points, destinations and verified connections.');for(const p of r.points)if(!(p.references||[]).some(ref=>(b.photos||[]).some(m=>m.id===ref.mediaId)))fail('REVIEW_REQUIRED','Every reviewed point needs a branch reference photo.');const version={...r,id:ctx.id('route'),branchId:b.id,state:'published',reviewedBy:a.id,reviewedAt:ctx.now()};b.navigationVersions=[...(b.navigationVersions||[]),version];b.publishedNavigationVersionId=version.id;ctx.audit(data,a,'Publish reviewed navigation','branches',b.id);ctx.put(data);return copy(version);},
    async retireVersion(branchId,id){if(ctx.cfg.mode==='api')return ctx.request(`/branches/${encodeURIComponent(branchId)}/navigation/versions/${encodeURIComponent(id)}/retire`,{method:'POST'});const {b,data,a}=localBranch(branchId,true);const r=b.navigationVersions?.find(x=>x.id===id);if(!r)fail('NOT_FOUND','Route version not found.');r.state='retired';if(b.publishedNavigationVersionId===id)b.publishedNavigationVersionId=null;ctx.audit(data,a,'Retire navigation version','branches',b.id);ctx.put(data);},
    async processing(branchId,mediaId){if(ctx.cfg.mode!=='api')return {state:'unavailable',message:'Server processing unavailable. Original video retained.'};return ctx.request(`/branches/${encodeURIComponent(branchId)}/media/${encodeURIComponent(mediaId)}/processing-jobs`,{method:'POST',body:{operation:'extract-frames'}});},
    async cancelJob(branchId,id){if(ctx.cfg.mode!=='api')return {state:'unavailable'};return ctx.request(`/branches/${encodeURIComponent(branchId)}/processing-jobs/${encodeURIComponent(id)}/cancel`,{method:'POST'});},
    async job(branchId,id){if(ctx.cfg.mode!=='api')return {state:'unavailable'};return ctx.request(`/branches/${encodeURIComponent(branchId)}/processing-jobs/${encodeURIComponent(id)}`);},
    async reviewFrames(branchId,id,acceptedFrameIds){if(ctx.cfg.mode!=='api')return {state:'unavailable'};return ctx.request(`/branches/${encodeURIComponent(branchId)}/processing-jobs/${encodeURIComponent(id)}/review`,{method:'POST',body:{acceptedFrameIds}});},
    async guidance(bookingId,versionId){const bookings=await ctx.api.getBookings(),booking=bookings.find(b=>String(b.id)===String(bookingId));if(!booking)fail('NOT_FOUND','Booking not found or not authorized.');if(ctx.cfg.mode==='api'){const result=await ctx.request(`/bookings/${encodeURIComponent(bookingId)}/navigation${versionId?'?versionId='+encodeURIComponent(versionId):''}`);if(String(result.branchId)!==String(booking.branchId||booking.placeId))fail('INVALID_RESPONSE','Navigation branch does not match booking.');return result;}const data=ctx.db(),b=data.branches.find(x=>String(x.id)===String(booking.branchId||booking.placeId)&&!x.isDeleted);if(!b||!data.organizations.some(o=>String(o.id)===String(b.organizationId)&&!o.isDeleted&&o.status==='active'))fail('NOT_FOUND','Booked branch or organization is unavailable.');const r=(b.navigationVersions||[]).find(x=>x.id===(versionId||b.publishedNavigationVersionId)&&x.state==='published');return {bookingId:booking.id,branchId:b.id,branchName:b.name,route:r?copy(r):null,media:(b.photos||[]).map(x=>copy(x))};},
    async localize(input,image,signal){const info=await service.guidance(input.bookingId,input.routeVersionId);if(!info.route)return {state:'no-route'};if(!info.route.destinations.some(d=>d.id===input.destinationId))fail('INVALID_REFERENCE','Destination not in booked route.');if(ctx.cfg.mode!=='api')return {state:'unavailable',message:'Visual localization backend unavailable. No image uploaded.'};const body=new FormData();body.append('image',image);for(const [k,v] of Object.entries(input))if(v!=null)body.append(k,String(v));const result=await ctx.request(`/bookings/${encodeURIComponent(input.bookingId)}/navigation/localizations`,{method:'POST',body,signal});if(!['matched','orientation-unknown','ambiguous','no-match','no-route','unavailable','failed'].includes(result.state))fail('INVALID_RESPONSE','Unknown localization state.');if(['matched','orientation-unknown'].includes(result.state)){const p=info.route.points.find(p=>p.id===result.pointId);if(!p||result.floor!==undefined&&String(result.floor)!==String(p.floor)||result.routeVersionId!==info.route.id)fail('INVALID_RESPONSE','Unverified localization identifiers.');if(result.state==='matched'&&!p.references?.some(r=>r.orientationId===result.orientationId&&r.heading!=null))return {...result,state:'orientation-unknown',orientationId:null};}return result;}
  };
  ctx.branchMedia=Object.freeze(service);
});

