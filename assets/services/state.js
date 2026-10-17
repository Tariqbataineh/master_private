'use strict';
// state: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registerstate(ctx) {
  const accountVersions = new Map();
  const compatibilitySnapshots = new Map();
  const compatibilityKey = (key, account) => `${key}:${account?.id || 'anonymous'}`;
  const collectionFingerprint = items => JSON.stringify((items || []).map(item => [String(item.id), item]));
  const selectedSubscription=async(a)=>ctx.cfg.mode==='local'&&ctx.subscriptionFor?ctx.subscriptionFor(ctx.db(),a.id):(await ctx.list('subscriptions')).items.find(s=>ctx.api.subscriptionState?.(s)==='active')||null;
  ctx.entityKeys = {
    wusoolOrganizations: 'organizations',
    wusoolBranches: 'branches',
    wusoolUsers: 'users',
    wusoolTickets: 'tickets',
    wusoolReviews: 'reviews',
    wusoolSubscriptions: 'subscriptions',
    wusoolDocuments: 'documents',
    'wusoolAdminFeature:documents': 'documents',
    wusoolMediaLibrary: 'documents',
    wusoolOrganizationBranches: 'branches',
    'wusool-visits': 'bookings',
    wusoolVisitorTickets: 'bookings',
    wusoolUserTickets: 'tickets',
    'wusool-user-reviews': 'reviews',
    'wusool-support-requests': 'tickets',
    wusoolSupportRequests: 'tickets',
    'wusool-accessibility-reports': 'tickets',
    'wusool-place-suggestions': 'tickets',
    wusoolNotifications: 'notifications',
    wusoolOrganizationNotifications: 'notifications',
  };
  ctx.preferenceKeys = new Set([
    'wusool-language',
    'wusool-font-size',
    'wusool-high-contrast',
    'wusool-motion-enabled',
    'wusoolRememberedEmail',
    'wusoolRememberedOrganizationEmail',
    'wusoolCursorLight',
  ]);
  ctx.ticketKinds = {
    'wusool-accessibility-reports': 'accessibility-report',
    'wusool-place-suggestions': 'place-suggestion',
    'wusool-support-requests': 'support',
    wusoolSupportRequests: 'support',
  };
  ctx.userKeys = {
    'wusool-user-profile': 'profile',
    'wusool-accessibility-preferences': 'preferences',
    'wusool-account-settings': 'settings',
    'wusool-removed-saved-places': 'removedSavedPlaces',
  };
  ctx.accountKeys = new Set([
    'wusoolDemoUser',
    'wusool-current-user',
    'wusoolOrganization',
    'wusoolOrganizationRegistration',
    'organizationRegistration',
    'wusoolRegisteredUser',
  ]);
  ctx.flagKeys = new Set([
    'wusoolOrganizationLoggedIn',
    'wusoolAdminLoggedIn',
    'wusool-is-authenticated',
  ]);
  ctx.rawRead = async function rawRead(key) {
    if(key==='wusoolCurrentOrganization'){
      const a=await ctx.getCurrentAccount();if(!a)return null;
      if(ctx.cfg.mode==='api')return ctx.request('/frontend-state/selected-organization');
      const data=ctx.db(),selected=data.drafts[a.id]?.selectedOrganizationId;
      const record=data.organizations.find(o=>o.id===selected&&!o.isDeleted);
      return record?JSON.stringify(ctx.accountDto(record)):null;
    }
    if (ctx.preferenceKeys.has(key)) return ctx.storage.local.getItem(key);
    const needsAccount =
      ctx.accountKeys.has(key) ||
      ctx.flagKeys.has(key) ||
      key === 'wusoolAdminRole' ||
      key === 'wusoolAdminProfile' ||
      key === 'wusool-user-name' ||
      key === 'wusoolOrganizationStatus' ||
      key === 'wusoolSubscriptionStatus' ||
      key === 'wusoolActiveSubscription' ||
      Boolean(ctx.userKeys[key]) ||
      key === 'wusoolCurrentBranchDraft' ||
      key === 'wusoolOrganizationBranches' ||
      key === 'wusool-user-reviews' ||
      Boolean(ctx.ticketKinds[key]);
    const a = ctx.cfg.mode === 'api' && !needsAccount ? null : await ctx.getCurrentAccount();
    if (ctx.cfg.mode === 'api' && a && (ctx.accountKeys.has(key) || ctx.userKeys[key]))
      accountVersions.set(key, a.revision);
    if (ctx.accountKeys.has(key)) {
      if (!a) return null;
      let x = {
        ...a,
        fullName: a.name,
        organizationName: a.name,
        approvalStatus: a.approvalStatus,
      };
      if (a.role === 'Organization') {
        x.subscription = await selectedSubscription(a);
        x.subscriptionStatus =
          ctx.api.subscriptionState?.(x.subscription) || 'inactive';
      }
      return JSON.stringify(x);
    }
    if (ctx.flagKeys.has(key)) return a ? 'true' : null;
    if (key === 'wusoolAdminRole') return a?.role === 'Admin' ? 'super-admin' : null;
    if (key === 'wusoolAdminProfile') return a?.role === 'Admin' ? JSON.stringify(a) : null;
    if (key === 'wusool-user-name') return a?.name || null;
    if (key === 'wusoolOrganizationStatus') return a?.approvalStatus || null;
    if (key === 'wusoolSubscriptionStatus')return a?.role==='Organization'?ctx.api.subscriptionState(await selectedSubscription(a)):'inactive';
    if (key === 'wusoolActiveSubscription')
      return JSON.stringify(a?await selectedSubscription(a):null);
    if (key === 'wusoolAuditLog') return JSON.stringify(await ctx.api.getAuditLog());
    if (key === 'wusoolOrganizationAuditLog')
      return JSON.stringify(
        (await ctx.api.getAuditLog()).map((x) => ({
          ...x,
          createdAt: x.timestamp,
          target: x.entityId,
          description: x.reason,
          type: x.entityType,
        })),
      );
    if (key === 'wusoolBranchReviewHistory') {
      const [events, branches] = await Promise.all([ctx.api.getAuditLog(), ctx.api.getBranches()]);
      return JSON.stringify(
        events
          .filter((x) => x.entityType === 'branches' && x.actorId !== a?.id)
          .map((x) => {
            const b = branches.find((b) => b.id === x.entityId);
            return {
              ...x,
              reference: x.entityId,
              branchName: b?.name || x.entityId,
              city: b?.city || '',
              submittedAt: x.timestamp,
              reviewedAt: x.timestamp,
              reviewedBy: x.actor,
              status: x.status || b?.status || 'pending',
              score: x.score ?? b?.accessibilityScore,
              notes: x.reason,
            };
          }),
      );
    }
    if (ctx.entityKeys[key]) {
      const kind = ctx.entityKeys[key],
        options =
          key === 'wusoolOrganizationBranches'
            ? {
                organizationId: a?.id,
              }
            : key === 'wusool-user-reviews'
              ? {
                  userId: a?.id,
                }
              : ctx.ticketKinds[key]
                ? {
                    kind: ctx.ticketKinds[key],
                    requesterId: a?.id,
                  }
                : {};
      const result = await ctx.listAll(kind, options);
      let items = result.items;
      if (key === 'wusoolOrganizationBranches')
        compatibilitySnapshots.set(compatibilityKey(key, a), collectionFingerprint(items));
      if (kind === 'bookings') {
        const actor = a || (await ctx.getCurrentAccount());
        items = items.map((x) =>
          ctx.bookingDto(
            x,
            ctx.cfg.mode === 'local' ? ctx.db() : null,
            actor?.role === 'Organization' ? 'org' : 'user',
          ),
        );
      }
      if (key === 'wusoolOrganizationBranches')
        items = items.map((x) => ({
          ...x,
          score: x.accessibilityScore,
          status: x.status === 'pending' ? 'pending-review' : x.status,
        }));
      if (key === 'wusoolUserTickets' && ctx.cfg.mode === 'local')
        items = items.map((x) => {
          const data = ctx.db(),
            u = data.users.find((u) => u.id === x.requesterId),
            b = data.branches.find((b) => b.id === x.branchId);
          return {
            ...x,
            number: x.id,
            type: x.category || 'Support',
            user: {
              name: u?.name || 'Requester',
              email: u?.email || '',
              phone: u?.phone || '',
            },
            branch: {
              id: b?.id || '',
              name: b?.name || '',
              location: b?.address || '',
            },
            images: x.images || [],
            responses: x.messages || [],
          };
        });
      if (kind === 'reviews')
        items = items.map((x) => ({
          ...x,
          placeId: x.branchId,
          status: x.status === 'Visible' ? 'Published' : x.status,
        }));
      return JSON.stringify(items);
    }
    if (ctx.userKeys[key]) {
      if (!a) return null;
      return a[ctx.userKeys[key]] == null ? null : JSON.stringify(a[ctx.userKeys[key]]);
    }
    if (/Password|Credential/.test(key)) return null;
    if (ctx.cfg.mode === 'api') {
      const state = await ctx.request('/frontend-state/' + encodeURIComponent(key));
      if (key === 'wusoolCurrentBranchDraft') {
        if (!state?.branchId) return null;
        return JSON.stringify(await ctx.get('branches', state.branchId));
      }
      return state == null ? null : typeof state === 'string' ? state : JSON.stringify(state);
    }
    const data = ctx.db();
    if (key === 'wusoolCurrentBranchDraft') {
      if (!a) return null;
      const draftId = data.drafts[a.id]?.branchId;
      return JSON.stringify(
        data.branches.find((x) => x.id === draftId && x.organizationId === a.id) || null,
      );
    }
    if (
      [
        'wusool-search',
        'wusool-pending-visit',
        'wusool-navigation-session',
        'wusool-last-visit',
        'wusool-selected-place',
        'wusoolSelectedPlan',
        'wusoolBillingCycle',
        'wusoolRegistrationStep',
      ].includes(key)
    )
      return data.drafts[a?.id || 'visitor']?.[key] ?? null;
    return (
      data.settings[
        a?.role === 'Organization' && key === 'wusoolOrganizationNotificationSettings'
          ? a.id + ':' + key
          : key
      ] ?? null
    );
  };
  ctx.rawWrite = async function rawWrite(key, raw) {
    if(key==='wusoolCurrentOrganization'){
      const a=await ctx.getCurrentAccount();if(!a)ctx.fail('UNAUTHENTICATED','Sign in first.');
      if(a.role!=='Admin')ctx.fail('FORBIDDEN','Administrator selection required.');
      const input=JSON.parse(raw);if(ctx.cfg.mode==='api')return ctx.request('/frontend-state/selected-organization',{method:'PUT',body:{organizationId:input.id}});
      const data=ctx.db();if(!data.organizations.some(o=>o.id===input.id&&!o.isDeleted))ctx.fail('NOT_FOUND','Selected organization was deleted or not found.');
      data.drafts[a.id]={...data.drafts[a.id],selectedOrganizationId:input.id};ctx.put(data);return;
    }
    if (ctx.preferenceKeys.has(key)) {
      ctx.storage.local.setItem(key, raw);
      return;
    }
    const a = await ctx.getCurrentAccount();
    if (ctx.accountKeys.has(key)) {
      if (!a) ctx.fail('UNAUTHENTICATED', 'Sign in first.');
      let input;
      try {
        input = JSON.parse(raw);
      } catch {
        ctx.fail('VALIDATION_ERROR', 'Invalid account data.');
      }
      const allowed = [
        'latitude',
        'longitude',
        'countryCode',
        'governorate',
        'googlePlaceId',
        'name',
        'organizationName',
        'email',
        'phone',
        'phoneNumber',
        'city',
        'address',
        'latitude',
        'longitude',
        'governorate',
        'countryCode',
        'googlePlaceId',
        'website',
        'type',
        'representativeName',
        'managerName',
        'managerPosition',
        'managerEmail',
        'managerPhone',
        'logo',
      ];
      const changes = Object.fromEntries(
        allowed.filter((k) => k in input).map((k) => [k, input[k]]),
      );
      return ctx.save(a.role === 'Organization' ? 'organizations' : 'users', {
        ...a,
        ...changes,
        ...(ctx.cfg.mode === 'api' && accountVersions.get(key) != null
          ? { expectedRevision: accountVersions.get(key) }
          : {}),
      });
    }
    if (
      ctx.flagKeys.has(key) ||
      key === 'wusoolAdminRole' ||
      key === 'wusoolAdminProfile' ||
      key === 'wusool-user-name'
    )
      return;
    if (/Password|Credential/.test(key))
      ctx.fail('UNAVAILABLE', 'Password changes require the authentication API.');
    if (
      [
        'wusoolPayment',
        'wusoolFailedPayment',
        'wusoolActiveSubscription',
        'wusoolSubscriptionStatus',
        'wusoolOrganizationStatus',
      ].includes(key)
    )
      ctx.fail(
        'INTEGRATION_UNAVAILABLE',
        'Payments and approval cannot be simulated by this page.',
      );
    if (ctx.entityKeys[key]) {
      const kind = ctx.entityKeys[key];
      let values;
      try {
        values = JSON.parse(raw);
      } catch {
        ctx.fail('VALIDATION_ERROR', 'Expected a JSON list.');
      }
      if (!Array.isArray(values)) ctx.fail('VALIDATION_ERROR', 'Expected a list of records.');
      const scope =
        key === 'wusoolOrganizationBranches'
          ? {
              organizationId: a?.id,
            }
          : key === 'wusool-user-reviews'
            ? {
                userId: a?.id,
              }
            : ctx.ticketKinds[key]
              ? {
                  kind: ctx.ticketKinds[key],
                  requesterId: a?.id,
                }
              : {};
      const before = (await ctx.listAll(kind, scope)).items;
      if (key === 'wusoolOrganizationBranches') {
        const snapshotKey = compatibilityKey(key, a);
        const expected = compatibilitySnapshots.get(snapshotKey);
        // Whole-list compatibility writes must be based on a known, current read.
        // Without a snapshot the legacy adapter could silently overwrite/delete records.
        if (expected == null)
          ctx.fail('CONFLICT', 'Load the current branch list before saving changes. No branch records were modified.');
        if (expected !== collectionFingerprint(before))
          ctx.fail('CONFLICT', 'Branch records changed in another tab. Reload before saving so newer changes are preserved.');
        compatibilitySnapshots.delete(snapshotKey);
      }
      for (const x of values) {
        if (ctx.ticketKinds[key]) x.kind = ctx.ticketKinds[key];
        if (kind === 'bookings') {
          const old = await ctx.get('bookings', x.id);
          if (!old) {
            await ctx.createBooking(x, String(x.id));
            continue;
          }
          if (String(x.status).toLowerCase().replace(' ', '-') !== old.status)
            await ctx.bookingStatus(old.id, x.status);
        } else {
          if (kind === 'reviews') {
            const old = (await ctx.api.getReviews()).find(
              (r) => String(r.visitId) === String(x.visitId),
            );
            await ctx.save('reviews', {
              ...x,
              id: old?.id || x.id,
              branchId: x.branchId || x.placeId,
              status: ctx.isAdmin(a) && x.status === 'Published' ? 'Visible' : x.status,
            });
          } else await ctx.save(kind, x);
        }
      }
      if (
        ['branches', 'reviews', 'documents', 'notifications'].includes(kind) ||
        (kind === 'tickets' && Boolean(ctx.ticketKinds[key]))
      ) {
        for (const old of before)
          if (
            !values.some((x) => String(x.id) === String(old.id)) &&
            ctx.own(ctx.cfg.mode === 'local' ? ctx.db() : {}, a, kind, old)
          )
            await ctx.save(kind, {
              ...old,
              isDeleted: true,
            });
      }
      // A successful write becomes the baseline for a subsequent legitimate
      // action on the same page. Another tab's change will still conflict.
      if (key === 'wusoolOrganizationBranches')
        compatibilitySnapshots.set(
          compatibilityKey(key, a),
          collectionFingerprint((await ctx.listAll(kind, scope)).items),
        );
      return;
    }
    if (ctx.userKeys[key]) {
      if (!a) ctx.fail('UNAUTHENTICATED', 'Sign in first.');
      const value = JSON.parse(raw);
      await ctx.save('users', {
        ...a,
        [ctx.userKeys[key]]: value,
        ...(ctx.cfg.mode === 'api' && accountVersions.get(key) != null
          ? { expectedRevision: accountVersions.get(key) }
          : {}),
        ...(key === 'wusool-user-profile'
          ? {
              name: [value.firstName, value.lastName].filter(Boolean).join(' ') || a.name,
              phone: value.phoneNumber || a.phone,
              city: value.city || a.city,
            }
          : {}),
        ...(key === 'wusool-account-settings'
          ? {
              name: value.fullName || a.name,
            }
          : {}),
      });
      return;
    }
    if (key === 'wusoolCurrentBranchDraft') {
      const x = JSON.parse(raw);
      if (!x) return;
      const saved = await ctx.save('branches', x);
      if (ctx.cfg.mode === 'api') {
        await ctx.request('/frontend-state/wusoolCurrentBranchDraft', {
          method: 'PUT',
          body: { value: { branchId: saved.id } },
        });
      }
      if (ctx.cfg.mode === 'local') {
        const data = ctx.db();
        data.drafts[a.id] = {
          ...data.drafts[a.id],
          branchId: saved.id,
        };
        ctx.put(data);
      }
      return;
    }
    if (
      [
        'wusool-search',
        'wusool-pending-visit',
        'wusool-navigation-session',
        'wusool-last-visit',
        'wusool-selected-place',
        'wusoolSelectedPlan',
        'wusoolBillingCycle',
        'wusoolRegistrationStep',
      ].includes(key)
    ) {
      if (ctx.cfg.mode === 'api')
        return ctx.request('/frontend-state/' + encodeURIComponent(key), {
          method: 'PUT',
          body: {
            value: raw,
          },
        });
      if (!a && key !== 'wusool-search') ctx.fail('UNAUTHENTICATED', 'Sign in first.');
      const data = ctx.db();
      data.drafts[a?.id || 'visitor'] = {
        ...data.drafts[a?.id || 'visitor'],
        [key]: raw,
      };
      ctx.put(data);
      return;
    }
    if (ctx.cfg.mode === 'api')
      return ctx.request('/frontend-state/' + encodeURIComponent(key), {
        method: 'PUT',
        body: {
          value: raw,
        },
      });
    if (!a) ctx.fail('UNAUTHENTICATED', 'Sign in first.');
    if (a.role !== 'Admin' && !['wusoolOrganizationNotificationSettings'].includes(key))
      ctx.fail('FORBIDDEN', 'Administrator access is required.');
    const data = ctx.db();
    data.settings[a.role === 'Admin' ? key : a.id + ':' + key] = raw;
    ctx.audit(data, a, 'Update', 'settings', key);
    ctx.put(data);
  };
  ctx.rawRemove = async function rawRemove(key) {
    if(key==='wusoolCurrentOrganization'){
      const a=await ctx.getCurrentAccount();if(!a)ctx.fail('UNAUTHENTICATED','Sign in first.');
      if(ctx.cfg.mode==='api')return ctx.request('/frontend-state/selected-organization',{method:'DELETE'});
      const data=ctx.db();if(data.drafts[a.id])delete data.drafts[a.id].selectedOrganizationId;
      ctx.storage.session.removeItem(key);ctx.put(data);return;
    }
    if (ctx.preferenceKeys.has(key)) {
      ctx.storage.local.removeItem(key);
      return;
    }
    if (ctx.flagKeys.has(key) || ctx.accountKeys.has(key)) {
      await ctx.logout();
      return;
    }
    if (ctx.cfg.mode === 'api')
      return ctx.request('/frontend-state/' + encodeURIComponent(key), {
        method: 'DELETE',
      });
    const a = key === 'wusool-search' ? ctx.current() : ctx.requireAccount(),
      data = ctx.db();
    if (data.drafts[a?.id || 'visitor']) delete data.drafts[a?.id || 'visitor'][key];
    if (ctx.isAdmin(a)) delete data.settings[key];
    ctx.put(data);
  };
  ctx.api.getLocationDraft = async () => {
    if (ctx.cfg.mode === 'api') return ctx.request('/frontend-state/organization-location');
    return ctx.copy(ctx.db().drafts[ctx.current()?.id || 'visitor']?.organizationLocation || null);
  };
  ctx.api.saveLocationDraft = async (input) => {
    const value = {
      ...window.WusoolLocation.fields(input),
      address: String(input.address || ''),
      governorate: input.governorate || '',
    };
    if (ctx.cfg.mode === 'api')
      return ctx.request('/frontend-state/organization-location', {
        method: 'PUT',
        body: {
          value,
        },
      });
    const data = ctx.db(),
      key = ctx.current()?.id || 'visitor';
    data.drafts[key] = {
      ...data.drafts[key],
      organizationLocation: value,
    };
    ctx.put(data);
    return value;
  };
  ctx.api.clearLocationDraft = async () => {
    if (ctx.cfg.mode === 'api')
      return ctx.request('/frontend-state/organization-location', {
        method: 'DELETE',
      });
    const data = ctx.db(),
      key = ctx.current()?.id || 'visitor';
    if (data.drafts[key]) delete data.drafts[key].organizationLocation;
    ctx.put(data);
  };
  Object.assign(ctx.api, {
    rawRead: ctx.rawRead,
    rawWrite: ctx.rawWrite,
    rawRemove: ctx.rawRemove,
  });
});
