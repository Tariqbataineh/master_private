'use strict';
// facade: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registerfacade(ctx) {
  ctx.singular = {
    organizations: 'Organization',
    branches: 'Branch',
    users: 'User',
    tickets: 'Ticket',
    reviews: 'Review',
    subscriptions: 'Subscription',
    documents: 'Document',
  };
  ctx.api = {
    getTicketServices: ctx.getTicketServices,
    getPublishedServiceCatalog: async () => {
      if (ctx.cfg.mode !== 'local') return null;
      const data = ctx.db();
      return { items: ctx.safe(data.branches.filter(b => ctx.visibleBranch(data, b)).flatMap(b => ctx.publishedBranchServices(data, b))) };
    },
    saveTicketServices: ctx.saveTicketServices,
    getPlans: ctx.getPlans,
    resetAccountAccess: ctx.resetAccountAccess,
    finalizeBranchSetup: ctx.finalizeBranchSetup,
    analyzeBranch: ctx.analyzeBranch,
    activateDevelopmentSubscription: ctx.activateDevelopmentSubscription,
    validateAccountInput: ctx.validateAccountInput,
    createManagedAccount: ctx.createManagedAccount,
    changeInitialPassword: ctx.changeInitialPassword,
    list: ctx.list,
    listAll: ctx.listAll,
    get: ctx.get,
    save: ctx.save,
    setStatus: ctx.setStatus,
    request: ctx.request,
    register: ctx.register,
    login: ctx.login,
    logout: ctx.logout,
    getCurrentAccount: ctx.getCurrentAccount,
    seedAdmin: ctx.seedAdmin,
    places: ctx.places,
    createBooking: ctx.createBooking,
    updateBooking: ctx.updateBooking,
    deleteBooking: ctx.deleteBooking,
    getBookings: async (options) => {
      const items = (await ctx.listAll('bookings', options)).items;
      return ctx.cfg.mode === 'local'
        ? items.map((x) => ctx.bookingDto(x, ctx.db(), 'org'))
        : items;
    },
    bookingStatus: ctx.bookingStatus,
    upload: ctx.upload,
    external: ctx.external,
    bookingDto: ctx.bookingDto,
    getRuntimeErrors: ctx.getRuntimeErrors,
    reportRuntimeError: ctx.reportRuntimeError,
    clearSession: ctx.clearSession,
    mode: ctx.cfg.mode,
    branchMedia: ctx.branchMedia,
  };
  for (const [kind, name] of Object.entries(ctx.singular)) {
    ctx.api['get' + (name === 'Branch' ? 'Branches' : name + 's')] = async (options) =>
      (await ctx.listAll(kind, options)).items;
    ctx.api['get' + name + 'ById'] = (entityId) => ctx.get(kind, entityId);
    ctx.api['save' + name] = (x) => ctx.save(kind, x);
    ctx.api['set' + name + 'Status'] = (entityId, status, reason) =>
      ctx.setStatus(kind, entityId, status, reason);
    ctx.api['delete' + name] = async (entityId, reason) => {
      if (kind === 'branches' && ctx.cfg.mode === 'local') {
        const actor = ctx.requireAccount(['Admin', 'Organization']), data = ctx.db();
        const branch = data.branches.find(b => String(b.id) === String(entityId));
        if (!branch) ctx.fail('NOT_FOUND', 'Branch not found.');
        if (!ctx.own(data, actor, kind, branch)) ctx.fail('FORBIDDEN', 'Branch belongs to another account.');
        ctx.requireEntitlement?.(data, actor, 'serviceManagement');
        if (branch.isDeleted) return ctx.safe(branch);
        // Archiving must not require repairing legacy contact details or destroy linked history.
        branch.isDeleted = true;
        branch.deletedAt = ctx.now();
        branch.updatedAt = ctx.now();
        branch.revision = (branch.revision || 0) + 1;
        ctx.audit(data, actor, 'Archive branch', kind, branch.id, reason || 'Moved to Recovery Center');
        ctx.closeRemovedHoursRequests?.(data, actor, kind, branch.id);
        ctx.put(data);
        return ctx.safe(branch);
      }
      const x = await ctx.get(kind, entityId);
      if (!x) ctx.fail('NOT_FOUND', 'Record not found.');
      return ctx.save(kind, {
        ...x,
        isDeleted: true,
        reason,
      });
    };
    ctx.api['restore' + name] = async (entityId) => {
      const x = await ctx.get(kind, entityId);
      if (!x) ctx.fail('NOT_FOUND', 'Record not found.');
      return ctx.save(kind, {
        ...x,
        isDeleted: false,
      });
    };
  }
  ctx.api.getAuditLog = async () => {
    if (ctx.cfg.mode === 'api') return ctx.request('/audit');
    const a = ctx.requireAccount(),
      data = ctx.db();
    ctx.requireEntitlement?.(data,a,'auditHistory');
    const dataBranchesOwned = (orgId, entityId) =>
      data.branches.some((b) => b.id === entityId && b.organizationId === orgId && ctx.own(data,a,'branches',b));
    return ctx.copy(
      data.audit.filter(
        (x) =>
          ctx.isAdmin(a) ||
          x.actorId === (a.accountId||a.id) ||
          (x.entityId === a.id&&!Array.isArray(a.branchIds)) ||
          (a.role === 'Organization' && dataBranchesOwned(a.id, x.entityId)),
      ),
    );
  };
  ctx.api.getDashboardSnapshot = async () => {
    const [o, b, u, t, r, s] = await Promise.all(
      ['organizations', 'branches', 'users', 'tickets', 'reviews', 'subscriptions'].map((k) =>
        ctx.listAll(k),
      ),
    );
    return {
      organizations: o.total,
      branches: b.total,
      users: u.total,
      openTickets: t.items.filter((x) => !['closed', 'resolved'].includes(x.status.toLowerCase()))
        .length,
      pendingBranches: b.items.filter((x) => x.status === 'pending').length,
      flaggedReviews: r.items.filter((x) => x.flagged).length,
      activeSubscriptions: s.items.filter((x) => x.status === 'Active').length,
    };
  };
  ctx.api.getReviews = async (options) => {
    const rows = (await ctx.listAll('reviews', options)).items;
    if (ctx.cfg.mode === 'api') return rows;
    const data = ctx.db();
    return rows.map((r) => {
      const u = data.users.find((u) => u.id === r.userId),
        b = data.branches.find((b) => b.id === r.branchId);
      return {
        ...r,
        name: u?.name || 'Community member',
        date: r.createdAt?.slice(0, 10) || '',
        placeName: b?.name || '',
        branch: b?.name || '',
      };
    });
  };
  ctx.api.getUserByEmail = async (email) =>
    (await ctx.api.getUsers()).find((x) => x.email === email) || null;
  ctx.api.getOrganizationByEmail = async (email) =>
    (await ctx.api.getOrganizations()).find((x) => x.email === email) || null;
  window.addEventListener('storage', (e) => {
    if (ctx.cfg.mode === 'local' && e.key === ctx.DB) {
      try {
        ctx.current();
      } catch {}
      window.dispatchEvent(new CustomEvent('wusool:data-changed'));
      window.dispatchEvent(new CustomEvent('wusool:remote-change'));
    }
  });
  ctx.api.setSavedPlace = async (branchId, saved) => {
    if (ctx.cfg.mode === 'api')
      return ctx.request('/users/me/saved-places/' + encodeURIComponent(branchId), {
        method: saved ? 'PUT' : 'DELETE',
      });
    const a = ctx.requireAccount(['User']),
      data = ctx.db();
    if (saved && !data.branches.some((b) => b.id === branchId && ctx.visibleBranch(data, b)))
      ctx.fail('INVALID_REFERENCE', 'Published branch required.');
    const u = data.users.find((u) => u.id === a.id);
    u.savedPlaces = saved
      ? [...new Set([...u.savedPlaces, branchId])]
      : u.savedPlaces.filter((v) => v !== branchId);
    ctx.put(data);
    return ctx.accountDto(u);
  };
  ctx.api.highestRatedPlaces = async (limit = 3) => {
    const data = await ctx.places();
    return data.items
      .filter((p) => p.reviewCount >= 1)
      .sort(
        (a, b) =>
          b.rating - a.rating ||
          b.reviewCount - a.reviewCount ||
          a.name.localeCompare(b.name) ||
          a.id.localeCompare(b.id),
      )
      .slice(0, limit);
  };
});
