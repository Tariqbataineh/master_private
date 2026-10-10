'use strict';
// Approved schedules and change requests have separate authority. Pending never changes booking hours.
window.WusoolServiceModules.push(function registerHours(ctx) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const scheduleKeys = ['workingHours', 'specialHours', 'closedDates'];
  const copy = ctx.copy;
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const dateValid = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
    Number.isFinite(+new Date(value + 'T00:00:00Z')) &&
    new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
  const timeValid = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '');
  function interval(raw, label) {
    const isOpen = raw?.isOpen !== false && raw?.closed !== true && raw?.isClosed !== true;
    const openTime = raw?.openTime || raw?.open || '',
      closeTime = raw?.closeTime || raw?.close || '';
    if (isOpen && (!timeValid(openTime) || !timeValid(closeTime) || openTime >= closeTime))
      ctx.fail('VALIDATION_ERROR', label + ': enter an opening time before the closing time.');
    return { isOpen, openTime: isOpen ? openTime : '', closeTime: isOpen ? closeTime : '' };
  }
  function normalize(input, strict = true) {
    const raw = input?.workingHours || {},
      workingHours = {};
    for (const day of days) {
      const value = Array.isArray(raw)
        ? raw.find((h) => String(h.day || h.name).toLowerCase() === day)
        : Object.entries(raw).find(([key]) => key.toLowerCase() === day)?.[1];
      if (!value && strict)
        ctx.fail('VALIDATION_ERROR', 'Specify open or closed for all seven days.');
      workingHours[day] = value
        ? interval(value, day)
        : { isOpen: false, openTime: '', closeTime: '' };
    }
    const specials = input?.specialHours || [],
      closed = input?.closedDates || [];
    if (
      !Array.isArray(specials) ||
      !Array.isArray(closed) ||
      specials.length > 366 ||
      closed.length > 366
    )
      ctx.fail('VALIDATION_ERROR', 'Use at most 366 special dates or closures.');
    const dates = new Set();
    const specialHours = specials
      .map((raw) => {
        if (
          !dateValid(raw.date) ||
          dates.has(raw.date) ||
          !['closed', 'custom'].includes(raw.status)
        )
          ctx.fail(
            'VALIDATION_ERROR',
            'Each special date must be valid and unique, with closed or custom status.',
          );
        dates.add(raw.date);
        const value =
          raw.status === 'closed'
            ? { isOpen: false, openTime: '', closeTime: '' }
            : interval({ ...raw, isOpen: true }, raw.date);
        return {
          date: raw.date,
          status: raw.status,
          openTime: value.openTime,
          closeTime: value.closeTime,
          note: String(raw.note || '')
            .trim()
            .slice(0, 300),
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    if (closed.some((value) => !dateValid(value)) || new Set(closed).size !== closed.length)
      ctx.fail('VALIDATION_ERROR', 'Closure dates must be valid and unique.');
    return { workingHours, specialHours, closedDates: [...closed].sort() };
  }
  function owns(actor, kind, target) {
    return (
      actor.role === 'Admin' ||
      (actor.role === 'Organization' &&
        (kind === 'organizations' ? target.id === actor.id : target.organizationId === actor.id))
    );
  }
  function targetOf(data, kind, id, actor) {
    if (!['organizations', 'branches'].includes(kind))
      ctx.fail('INVALID_ENTITY', 'Choose an organization or branch.');
    const target = data[kind].find((x) => x.id === id && !x.isDeleted);
    if (!target) ctx.fail('NOT_FOUND', 'The organization or branch was removed.');
    const organization =
      kind === 'organizations'
        ? target
        : data.organizations.find((o) => o.id === target.organizationId && !o.isDeleted);
    if (
      !organization ||
      (actor?.role !== 'Admin' &&
        ['blocked', 'suspended', 'disabled'].includes(organization.status))
    )
      ctx.fail('ACCOUNT_BLOCKED', 'This organization is unavailable.');
    return target;
  }
  function notify(data, ownerId, title, message, requestId) {
    data.notifications.push({
      id: ctx.id('notification'),
      ownerId,
      title,
      message,
      status: 'unread',
      hoursChangeRequestId: requestId || null,
      createdAt: ctx.now(),
    });
  }
  function admins(data, title, message, id) {
    for (const a of data.users.filter((a) => a.role === 'Admin' && !a.isDeleted))
      notify(data, a.id, title, message, id);
  }
  function canonical(target) {
    return normalize(target, false);
  }
  function effective(data, branch) {
    if (Object.keys(branch.workingHours || {}).length) return canonical(branch);
    const org = data.organizations.find((o) => o.id === branch.organizationId);
    return org && Object.keys(org.workingHours || {}).length ? canonical(org) : null;
  }
  function allows(schedule, date, time, duration = 0) {
    if (!schedule) return true;
    if (schedule.closedDates.includes(date)) return false;
    const special = schedule.specialHours.find((x) => x.date === date);
    if (special?.status === 'closed') return false;
    const value =
      special?.status === 'custom'
        ? { ...special, isOpen: true }
        : schedule.workingHours[days[new Date(date + 'T00:00:00Z').getUTCDay()]];
    const minutes = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    return (
      value?.isOpen !== false &&
      time >= (value?.openTime || '00:00') &&
      time < (value?.closeTime || '24:00') &&
      minutes(time) + duration <= minutes(value?.closeTime || '24:00')
    );
  }
  function impact(data, kind, target) {
    const affected = [];
    for (const booking of data.bookings.filter(
      (b) => !b.isDeleted && ['pending', 'confirmed', 'in-progress'].includes(b.status),
    )) {
      const branch = data.branches.find((b) => b.id === booking.branchId);
      if (
        !branch ||
        !(kind === 'branches' ? branch.id === target.id : branch.organizationId === target.id)
      )
        continue;
      if (ctx.jordanInstant(booking.date, booking.time) <= Date.now()) continue;
      const schedule = effective(data, branch);
      if (allows(schedule, booking.date, booking.time, Number(booking.durationMinutes) || 30)) {
        if (booking.scheduleConflict) {
          delete booking.scheduleConflict;
          delete booking.scheduleConflictAt;
          booking.revision = (Number(booking.revision) || 0) + 1;
          notify(
            data,
            booking.userId,
            'Working hours fit your booking',
            booking.reference + ' now fits the approved schedule.',
          );
        }
        continue;
      }
      booking.scheduleConflict = true;
      booking.scheduleConflictAt = ctx.now();
      booking.revision = (Number(booking.revision) || 0) + 1;
      affected.push(booking.id);
      notify(
        data,
        booking.userId,
        'Working hours changed',
        'Your booking ' +
          booking.reference +
          ' is outside the newly approved hours. The organization will contact you to agree a new time.',
      );
      notify(
        data,
        booking.organizationId,
        'Booking needs rescheduling',
        booking.reference +
          ' conflicts with approved working hours. Review it; no automatic cancellation occurred.',
      );
    }
    return affected;
  }
  function apply(data, actor, kind, target, proposed, reason, request) {
    Object.assign(target, copy(proposed), {
      hoursRevision: (Number(target.hoursRevision) || 0) + 1,
      hoursUpdatedAt: ctx.now(),
      hoursUpdatedBy: actor.id,
      updatedAt: ctx.now(),
    });
    if (kind === 'branches')
      target.completedSteps = { ...target.completedSteps, workingHours: true };
    const conflicts = impact(data, kind, target);
    ctx.audit(
      data,
      actor,
      actor.role === 'Admin' ? 'Approve working hours' : 'Set initial draft working hours',
      kind,
      target.id,
      reason,
    );
    notify(
      data,
      kind === 'organizations' ? target.id : target.organizationId,
      actor.role === 'Admin' ? 'Working hours approved' : 'Draft working hours saved',
      (target.name || target.branchName) +
        (actor.role === 'Admin'
          ? ' — approved schedule is now active.'
          : ' — initial schedule is part of branch submission review.'),
      request?.id,
    );
    return conflicts;
  }
  async function getSchedule(kind, id) {
    if (!['organizations', 'branches'].includes(kind))
      ctx.fail('INVALID_ENTITY', 'Choose an organization or branch.');
    if (ctx.cfg.mode === 'api')
      return ctx.request('/' + kind + '/' + encodeURIComponent(id) + '/hours');
    const actor = ctx.requireAccount(['Admin', 'Organization']),
      data = ctx.db(),
      target = targetOf(data, kind, id, actor);
    if (!owns(actor, kind, target)) ctx.fail('FORBIDDEN', 'You do not own this schedule.');
    return {
      resourceKind: kind,
      resourceId: id,
      organizationId: kind === 'organizations' ? id : target.organizationId,
      name: target.name || target.branchName,
      hoursRevision: Number(target.hoursRevision) || 0,
      schedule: canonical(target),
      hasSchedule: Object.keys(target.workingHours || {}).length > 0,
      pending:
        data.hoursChangeRequests.find(
          (r) => r.resourceKind === kind && r.resourceId === id && r.status === 'pending',
        ) || null,
    };
  }
  async function listRequests(options = {}) {
    if (ctx.cfg.mode === 'api') return ctx.listAll('hours-change-requests', options);
    const actor = ctx.requireAccount(['Admin', 'Organization']),
      data = ctx.db();
    let items = data.hoursChangeRequests.filter(
      (r) => actor.role === 'Admin' || r.organizationId === actor.id,
    );
    for (const key of ['status', 'resourceKind', 'resourceId'])
      if (options[key]) items = items.filter((r) => r[key] === options[key]);
    items = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { items: ctx.safe(items), total: items.length, page: 1, pageSize: 500 };
  }
  async function saveHours(kind, id, input, options = {}) {
    const proposed = normalize(input),
      reason = String(options.reason || '').trim();
    if (reason.length > 500) ctx.fail('VALIDATION_ERROR', 'Reason must be at most 500 characters.');
    if (!['organizations', 'branches'].includes(kind))
      ctx.fail('INVALID_ENTITY', 'Choose an organization or branch.');
    if (ctx.cfg.mode === 'api')
      return ctx.request('/' + kind + '/' + encodeURIComponent(id) + '/hours', {
        method: 'PUT',
        body: { schedule: proposed, expectedHoursRevision: options.expectedHoursRevision, expectedRequestRevision: options.expectedRequestRevision, amendPending: Boolean(options.amendPending), reason },
        headers: options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {},
      });
    const actor = ctx.requireAccount(['Admin', 'Organization']),
      data = ctx.db(),
      target = targetOf(data, kind, id, actor);
    if (!owns(actor, kind, target)) ctx.fail('FORBIDDEN', 'You do not own this schedule.');
    const before = canonical(target),
      baseRevision = Number(target.hoursRevision) || 0;
    if (options.expectedHoursRevision != null && options.expectedHoursRevision !== baseRevision)
      ctx.fail('STALE_SCHEDULE', 'Approved hours changed. Reload before submitting.');
    const pending = data.hoursChangeRequests.find(
      (r) => r.resourceKind === kind && r.resourceId === id && r.status === 'pending',
    );
    if (equal(before, proposed) && Object.keys(target.workingHours || {}).length && !(pending && options.amendPending))
      return {
        resource: ctx.safe(target),
        request: pending || null,
        status: pending ? 'pending' : 'unchanged',
        applied: false,
      };
    if (actor.role !== 'Admin' && pending) {
      if (equal(pending.proposed, proposed))
        return {
          resource: ctx.safe(target),
          request: ctx.safe(pending),
          status: 'pending',
          applied: false,
        };
      if (options.amendPending) {
        if (options.expectedRequestRevision !== pending.revision)
          ctx.fail('STALE_SCHEDULE', 'The pending schedule changed. Reload before saving.');
        pending.proposed = proposed;
        pending.reason = reason || pending.reason;
        pending.updatedAt = ctx.now();
        pending.revision++;
        ctx.audit(data, actor, 'Amend pending working hours', 'hoursChangeRequests', pending.id, pending.reason);
        admins(data, 'Working hours request updated', pending.resourceName + ' updated its pending schedule. Review the latest changes.', pending.id);
        ctx.put(data);
        return {resource: ctx.safe(target), request: ctx.safe(pending), status: 'pending', applied: false};
      }
      ctx.fail(
        'HOURS_REQUEST_PENDING',
        'A change is already pending. Wait for its decision before requesting another change.',
      );
    }
    // Initial branch draft hours are evidence in the existing full branch-approval workflow.
    if (
      actor.role === 'Admin' ||
      (kind === 'branches' &&
        target.status === 'draft' &&
        !target.approvedAt)
    ) {
      const conflicts = apply(
        data,
        actor,
        kind,
        target,
        proposed,
        reason ||
          (actor.role === 'Admin'
            ? 'Administrator updated approved hours'
            : 'Initial draft schedule'),
      );
      if (pending) {
        pending.status = 'superseded';
        pending.reviewReason = 'Administrator applied a newer schedule directly.';
        pending.reviewedBy = actor.id;
        pending.reviewedAt = ctx.now();
        pending.revision++;
      }
      ctx.put(data);
      return {
        resource: ctx.safe(target),
        request: pending || null,
        status: 'approved',
        applied: true,
        affectedBookingIds: conflicts,
      };
    }
    const request = {
      id: ctx.id('hours-request'),
      resourceKind: kind,
      resourceId: id,
      resourceName: target.name || target.branchName,
      organizationId: kind === 'organizations' ? id : target.organizationId,
      before,
      proposed,
      baseHoursRevision: baseRevision,
      revision: 1,
      status: 'pending',
      requestedBy: actor.id,
      createdAt: ctx.now(),
      reason,
    };
    data.hoursChangeRequests.push(request);
    ctx.audit(
      data,
      actor,
      'Request working hours change',
      'hoursChangeRequests',
      request.id,
      reason,
    );
    admins(
      data,
      'Working hours change pending',
      request.resourceName +
        ' requested working hours changes. Compare the old and new schedule before approval.',
      request.id,
    );
    notify(
      data,
      request.organizationId,
      'Working hours pending review',
      request.resourceName + ' — the approved hours remain in use until Admin approval.',
      request.id,
    );
    ctx.put(data);
    return {
      resource: ctx.safe(target),
      request: ctx.safe(request),
      status: 'pending',
      applied: false,
    };
  }
  async function reviewRequest(id, decision, reason = '', expectedRevision) {
    if (!['approved', 'rejected'].includes(decision))
      ctx.fail('INVALID_TRANSITION', 'Approve or reject this request.');
    reason = String(reason || '').trim();
    if ((decision === 'rejected' && !reason) || reason.length > 500)
      ctx.fail('VALIDATION_ERROR', 'A rejection reason is required (maximum 500 characters).');
    if (ctx.cfg.mode === 'api')
      return ctx.request('/hours-change-requests/' + encodeURIComponent(id) + '/decision', {
        method: 'POST',
        body: { decision, reason, expectedRevision },
      });
    const actor = ctx.requireAccount(['Admin']),
      data = ctx.db(),
      request = data.hoursChangeRequests.find((r) => r.id === id);
    if (!request) ctx.fail('NOT_FOUND', 'The request no longer exists.');
    if (request.status !== 'pending')
      ctx.fail('REQUEST_ALREADY_REVIEWED', 'The request already has a decision.');
    if (expectedRevision != null && expectedRevision !== request.revision)
      ctx.fail('STALE_SCHEDULE', 'The request changed. Reload the comparison.');
    const target = targetOf(data, request.resourceKind, request.resourceId, actor);
    if (request.baseHoursRevision !== (Number(target.hoursRevision) || 0))
      ctx.fail('STALE_SCHEDULE', 'Approved hours changed after this request.');
    let affectedBookingIds = [];
    if (decision === 'approved')
      affectedBookingIds = apply(
        data,
        actor,
        request.resourceKind,
        target,
        request.proposed,
        reason,
        request,
      );
    else
      notify(
        data,
        request.organizationId,
        'Working hours request rejected',
        request.resourceName + ' — ' + reason,
        request.id,
      );
    Object.assign(request, {
      status: decision,
      reviewedBy: actor.id,
      reviewedAt: ctx.now(),
      reviewReason: reason,
      revision: request.revision + 1,
      affectedBookingIds,
    });
    ctx.audit(data, actor, 'Working hours ' + decision, 'hoursChangeRequests', id, reason);
    ctx.put(data);
    return ctx.safe(request);
  }
  // Route legacy/full-form schedule updates through exactly the same approval boundary.
  const oldSave = ctx.save;
  async function persistEntity(kind, input) {
    const result = await oldSave(kind, input);
    if (ctx.cfg.mode === 'local' && result.isDeleted) {
      const data = ctx.db(),
        actor = ctx.current();
      let changed = false;
      for (const request of data.hoursChangeRequests.filter(
        (r) =>
          r.status === 'pending' &&
          ((r.resourceKind === kind && r.resourceId === result.id) ||
            (kind === 'organizations' && r.organizationId === result.id)),
      )) {
        Object.assign(request, {
          status: 'superseded',
          reviewReason: 'The organization or branch was removed.',
          reviewedBy: actor?.id,
          reviewedAt: ctx.now(),
          revision: request.revision + 1,
        });
        ctx.audit(
          data,
          actor,
          'Close removed resource hours request',
          'hoursChangeRequests',
          request.id,
          request.reviewReason,
        );
        changed = true;
      }
      if (changed) ctx.put(data);
    }
    return result;
  }

  ctx.save = async function saveWithScheduleReview(kind, input) {
    if (!['organizations', 'branches'].includes(kind)) return persistEntity(kind, input);
    const expectedHoursRevision = input.hoursRevision;
    input = { ...input };
    for (const key of [
      'hoursRevision',
      'hoursUpdatedAt',
      'hoursUpdatedBy',
      'hoursChangeRequest',
      'hoursChangeStatus',
    ])
      delete input[key];
    if (!input.id || !scheduleKeys.some((key) => key in input)) return persistEntity(kind, input);
    const old = await ctx.get(kind, input.id);
    if (!old) return persistEntity(kind, input);
    const proposed = normalize({ ...old, ...input }, false),
      before = canonical(old);
    if (equal(before, proposed)) {
      for (const key of scheduleKeys) delete input[key];
      return persistEntity(kind, input);
    }
    const outcome = await saveHours(kind, input.id, proposed, {
      expectedHoursRevision: expectedHoursRevision ?? (Number(old.hoursRevision) || 0),
      reason: input.reason,
    });
    for (const key of scheduleKeys) delete input[key];
    // Schedule-only writes do not invalidate published branch evidence or make a second save.
    const changed = Object.keys(input).some(
      (key) =>
        !['id', 'reason', 'updatedAt', 'completedSteps'].includes(key) &&
        !equal(input[key], old[key]),
    );
    const resource = changed ? await persistEntity(kind, input) : outcome.resource;
    return { ...resource, hoursChangeRequest: outcome.request, hoursChangeStatus: outcome.status };
  };
  ctx.hours = { normalize, effective, allows };
  ctx.api.save = ctx.save;
  Object.assign(ctx.api, {
    getSchedule,
    saveHours,
    getHoursChangeRequests: listRequests,
    reviewHoursChangeRequest: reviewRequest,
  });
});
