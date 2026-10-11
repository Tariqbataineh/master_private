'use strict';
// bookings: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registerbookings(ctx) {
  ctx.needsAssistant = function needsAssistant(input) {
    return (
      input.requiresAssistant === true ||
      (Array.isArray(input.support) ? input.support : []).some((x) =>
        /staff assistance|person assistance|مرافق|مساعد/i.test(String(x)),
      )
    );
  };
  ctx.jordanInstant = function jordanInstant(date, time) {
    const target = Date.parse(date + 'T' + time + ':00Z');
    if (!Number.isFinite(target)) return NaN;
    let instant = target;
    for (let i = 0; i < 2; i++) {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Amman',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23',
        })
          .formatToParts(new Date(instant))
          .map((x) => [x.type, x.value]),
      );
      const local = Date.parse(
        parts.year +
          '-' +
          parts.month +
          '-' +
          parts.day +
          'T' +
          parts.hour +
          ':' +
          parts.minute +
          ':' +
          parts.second +
          'Z',
      );
      instant += target - local;
    }
    return instant;
  };
  ctx.checkBookingSlot = function checkBookingSlot(data, branch, input, excludeId) {
    const date = input.date || input.visitDate,
      time = input.time || input.visitTime,
      dayDate = new Date(date + 'T00:00:00Z');
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date || '') ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time || '') ||
      !Number.isFinite(+dayDate) ||
      dayDate.toISOString().slice(0, 10) !== date ||
      ctx.jordanInstant(date, time) <= Date.now()
    )
      ctx.fail('INVALID_DATE', 'Choose a future date/time in Jordan (Asia/Amman).');
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      dayDate.getUTCDay()
    ];
    let hours = Array.isArray(branch.workingHours)
      ? branch.workingHours.find((h) => String(h.day || h.name).toLowerCase() === day.toLowerCase())
      : branch.workingHours[day] || branch.workingHours[day.toLowerCase()];
    const approvedSchedule = ctx.hours?.effective(data, branch);
    if (approvedSchedule) {
      hours = approvedSchedule.workingHours[day.toLowerCase()];
    }
    const special = (approvedSchedule?.specialHours || branch.specialHours || []).find(
      (h) => h.date === date,
    );
    if (
      special?.status === 'closed' ||
      (approvedSchedule?.closedDates || branch.closedDates || []).includes(date)
    )
      ctx.fail('HOLIDAY_CLOSED', 'The branch is closed on this holiday/date.');
    if (special?.status === 'custom') hours = special;
    if (approvedSchedule && !ctx.hours.allows(approvedSchedule, date, time))
      ctx.fail('OUTSIDE_HOURS', 'The branch is closed at this approved time.');
    if (
      hours &&
      (hours.isOpen === false ||
        hours.closed === true ||
        hours.isClosed === true ||
        time < (hours.openTime || hours.open || '00:00') ||
        time >= (hours.closeTime || hours.close || '24:00'))
    )
      ctx.fail('OUTSIDE_HOURS', 'The branch is closed at this time.');
    if (
      branch.services.length &&
      input.destination &&
      !branch.services.some((s) => (typeof s === 'string' ? s : s.name) === input.destination)
    )
      ctx.fail('INVALID_SERVICE', 'Select a service provided by this branch.');
    const duration = input.durationMinutes == null ? 30 : Number(input.durationMinutes);
    if (!Number.isInteger(duration) || duration < 15 || duration > 120)
      ctx.fail('INVALID_DURATION', 'Visit duration must be 15–120 minutes.');
    const start = ctx.jordanInstant(date, time),
      end = start + duration * 60000;
    const closing = hours?.closeTime || hours?.close || '23:59';
    if (
      hours &&
      end >
        (closing === '24:00'
          ? ctx.jordanInstant(date, '23:59') + 60000
          : ctx.jordanInstant(date, closing))
    )
      ctx.fail('OUTSIDE_HOURS', 'The full visit must fit within working hours.');
    if (
      input.userId &&
      data.bookings.some(
        (x) =>
          !x.isDeleted &&
          x.id !== excludeId &&
          x.userId === input.userId &&
          ['pending', 'confirmed', 'in-progress', 'waitlisted'].includes(x.status) &&
          start < ctx.jordanInstant(x.date, x.time) + (Number(x.durationMinutes) || 30) * 60000 &&
          end > ctx.jordanInstant(x.date, x.time),
      )
    )
      ctx.fail(
        'BOOKING_OVERLAP',
        'You already have a booking during this visit. Choose a different time.',
      );
    if (
      ctx.needsAssistant(input) &&
      data.bookings.filter(
        (x) =>
          !x.isDeleted &&
          x.id !== excludeId &&
          x.branchId === branch.id &&
          x.date === date &&
          String(x.time).slice(0, 2) === time.slice(0, 2) &&
          ['pending', 'confirmed', 'in-progress'].includes(x.status) &&
          ctx.needsAssistant(x),
      ).length >= 5
    )
      ctx.fail(
        'ASSISTANCE_CAPACITY',
        'All 5 assistance places for this branch/hour are booked. Choose another hour.',
      );
    return {
      date,
      time,
      requiresAssistant: ctx.needsAssistant(input),
    };
  };
  // Ticket services reuse configured branch services; no organization-name inference.
  const serviceList = (branch) => {
    const source = Array.isArray(branch.ticketServices) ? branch.ticketServices : Array.isArray(branch.services) ? branch.services : [];
    const seen = new Set();
    return source.filter(value => !value || typeof value === 'string' || ((!value.branchId || value.branchId === branch.id) && (!value.organizationId || value.organizationId === branch.organizationId))).map((value) => {
      const x = typeof value === 'string' ? { name: value } : value || {};
      let hash = 2166136261;
      for (const char of String(x.name || '')) hash = Math.imul(hash ^ char.codePointAt(0), 16777619) >>> 0;
      return {id: x.id || `service:${branch.id}:${hash.toString(16)}`, branchId: branch.id,
        organizationId: branch.organizationId, name: String(x.name || '').trim(), description: String(x.description || ''),
        active: x.active !== false && !x.isDeleted && !['inactive','disabled','unavailable'].includes(String(x.status || '').toLowerCase()), available: x.available !== false};
    }).filter((x) => x.name && !seen.has(x.id) && seen.add(x.id));
  };
  ctx.ticketServiceSelection = (data, branch, input, previous) => {
    if (input.serviceId === undefined) return {};
    const id = String(input.serviceId || '');
    if (!id) return {serviceId: null, serviceName: '', serviceSnapshot: null};
    // Historical selection stays intact during an unrelated appointment edit.
    if (previous?.serviceId === id && previous.branchId === branch.id)
      return {serviceId: id, serviceName: previous.serviceName || '', serviceSnapshot: previous.serviceSnapshot || null};
    const service = serviceList(branch).find((s) => s.id === id && s.active && s.available);
    if (!service) ctx.fail('INVALID_SERVICE', 'Choose an available service belonging to this branch.');
    return {serviceId: service.id, serviceName: service.name,
      serviceSnapshot: {id: service.id, name: service.name, description: service.description, branchId: branch.id, organizationId: branch.organizationId}};
  };
  ctx.getTicketServices = async (branchId, options = {}) => {
    if (ctx.cfg.mode === 'api') {
      if (!ctx.cfg.ticketServicesApiEnabled) ctx.fail('INTEGRATION_UNAVAILABLE', 'Ticket service API is not configured.');
      return ctx.request('/branches/' + encodeURIComponent(branchId) + '/ticket-services' + (options.manage ? '?manage=true' : ''));
    }
    const data = ctx.db(), branch = data.branches.find((b) => b.id === branchId && !b.isDeleted);
    if (!branch) ctx.fail('NOT_FOUND', 'Branch not found.');
    if (options.manage) {
      const a = ctx.requireAccount(['Organization','Admin']);
      if (!ctx.own(data,a,'branches',branch)) ctx.fail('FORBIDDEN','This branch belongs to another organization.');
    } else if (!ctx.visibleBranch(data,branch)) ctx.fail('INVALID_BRANCH','Select a published branch.');
    return {items: ctx.safe(serviceList(branch).filter(s => options.manage || (s.active && s.available)))};
  };
  ctx.saveTicketServices = async (branchId, input) => {
    if (ctx.cfg.mode === 'api') {
      if (!ctx.cfg.ticketServicesApiEnabled) ctx.fail('INTEGRATION_UNAVAILABLE','Ticket service API is not configured.');
      return ctx.request('/branches/' + encodeURIComponent(branchId) + '/ticket-services',{method:'PUT',body:{items:input}});
    }
    const a = ctx.requireAccount(['Organization','Admin']), data = ctx.db(), branch = data.branches.find(b => b.id === branchId && !b.isDeleted);
    if (!branch || !ctx.own(data,a,'branches',branch)) ctx.fail('FORBIDDEN','Only the branch owner or admin can configure services.');
    if (!Array.isArray(input) || input.length > 50) ctx.fail('VALIDATION_ERROR','Configure at most 50 services.');
    const previous = serviceList(branch), ids = new Set(), names = new Set();
    const items = input.map(x => {
      const name = String(x.name || '').trim(), description = String(x.description || '').trim();
      if (name.length < 2 || name.length > 120 || description.length > 500 || names.has(name.toLowerCase())) ctx.fail('VALIDATION_ERROR','Service names must be unique and 2–120 characters; descriptions at most 500.');
      names.add(name.toLowerCase());
      const id = x.id ? String(x.id) : ctx.id('service');
      if ((x.id && !previous.some(s => s.id === id)) || ids.has(id)) ctx.fail('INVALID_SERVICE','Service IDs must belong to this branch and be unique.');
      ids.add(id);return {id,branchId:branch.id,organizationId:branch.organizationId,name,description,active:x.active!==false,available:x.available!==false};
    });
    branch.ticketServices = items;ctx.audit(data,a,'Configure services','branches',branch.id);ctx.put(data);
    return {items:ctx.safe(items)};
  };
  ctx.createBooking = async function createBooking(input, key) {
    if (!key) ctx.fail('IDEMPOTENCY_REQUIRED', 'Booking retry key is required.');
    if (ctx.cfg.mode === 'api')
      return ctx.request('/bookings', {
        method: 'POST',
        body: {
          ...input,
          timeZone: 'Asia/Amman',
        },
        headers: {
          'Idempotency-Key': key,
        },
      });
    const a = ctx.requireAccount(['User', 'Admin']),
      data = ctx.db(),
      userId = ctx.isAdmin(a) ? input.userId : a.id;
    if (
      !data.users.some(
        (x) => x.id === userId && x.role === 'User' && !x.isDeleted && x.status === 'active',
      )
    )
      ctx.fail('INVALID_REFERENCE', 'Select an active user.');
    const old = data.bookings.find((x) => x.userId === userId && x.idempotencyKey === key);
    if (old) return ctx.safe(old);
    const branch = data.branches.find((x) => x.id === String(input.branchId || input.placeId));
    if (!branch || !ctx.visibleBranch(data, branch))
      ctx.fail('INVALID_REFERENCE', 'Select a published branch.');
    const slot = ctx.checkBookingSlot(data, branch, {
      ...input,
      userId,
    });
    const fields = Object.fromEntries(
      ['purpose', 'visitPurpose', 'destination', 'guidanceMethod', 'support', 'durationMinutes']
        .filter((k) => k in input)
        .map((k) => [k, ctx.copy(ctx.safe(input[k]))]),
    );
    const x = {
      ...ctx.ticketServiceSelection(data, branch, input),
      ...fields,
      ...slot,
      branchName: branch.name,
      locationSnapshot: {
        branchName: branch.name,
        latitude: branch.latitude,
        longitude: branch.longitude,
        address: branch.address,
        city: branch.city,
      },
      id: ctx.id('booking'),
      reference: 'WUS-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
      userId,
      branchId: branch.id,
      organizationId: branch.organizationId,
      status: 'pending',
      journeyState: 'not-started',
      journeyHistory: [],
      revision: 1,
      timeZone: 'Asia/Amman',
      idempotencyKey: key,
      createdAt: ctx.now(),
      updatedAt: ctx.now(),
      isDeleted: false,
    };
    x.journeyHistory = [
      {
        id: ctx.id('history'),
        event: 'booking-created',
        from: null,
        to: 'not-started',
        actorId: a.id,
        actorRole: a.role,
        actorName: a.name,
        reason: '',
        at: ctx.now(),
      },
    ];
    data.bookings.push(x);
    for (const ownerId of new Set([x.userId, x.organizationId]))
      data.notifications.push({
        id: ctx.id('notification'),
        ownerId,
        bookingId: x.id,
        kind: 'visit-journey',
        title: 'Booking awaiting approval',
        message: branch.name + ' · ' + x.date + ' ' + x.time,
        createdAt: ctx.now(),
        status: 'unread',
      });
    ctx.audit(data, a, 'Create', 'bookings', x.id);
    ctx.put(data);
    return ctx.safe(x);
  };
  ctx.updateBooking = async function updateBooking(entityId, input) {
    if (ctx.cfg.mode === 'api')
      return ctx.request('/bookings/' + encodeURIComponent(entityId) + '/appointment', {
        method: 'PATCH',
        body: {
          timeZone: 'Asia/Amman',
          date: input.date,
          time: input.time,
          branchId: input.branchId,
          userId: input.userId,
          ...(input.requiresAssistant !== undefined
            ? {
                requiresAssistant: input.requiresAssistant,
              }
            : {}),
        },
      });
    const a = ctx.requireAccount(['Admin', 'Organization', 'User']),
      data = ctx.db(),
      old = data.bookings.find((x) => x.id === entityId && !x.isDeleted);
    if (!old) ctx.fail('NOT_FOUND', 'Ticket not found.');
    if (!ctx.own(data, a, 'bookings', old))
      ctx.fail('FORBIDDEN', 'This ticket belongs to another organization.');
    if (input.expectedRevision != null && (old.revision || 0) !== input.expectedRevision)
      ctx.fail('STALE_BOOKING', 'The booking changed. Refresh before rescheduling.');
    if (a.role === 'User' && old.status !== 'pending')
      ctx.fail('BOOKING_LOCKED', 'Only pending tickets may be edited by the user.');
    if (!ctx.isAdmin(a) && !['pending', 'confirmed'].includes(old.status))
      ctx.fail('INVALID_TRANSITION', 'This ticket cannot be rescheduled.');
    const branchId = ctx.isAdmin(a) && input.branchId ? input.branchId : old.branchId;
    const branch = data.branches.find((x) => x.id === branchId && !x.isDeleted);
    if (ctx.isAdmin(a) && !ctx.visibleBranch(data, branch || {}))
      ctx.fail('INVALID_REFERENCE', 'Select a published branch.');
    if (!branch) ctx.fail('INVALID_REFERENCE', 'The booked branch is unavailable.');
    const candidate = {
      ...old,
      branchId: branch.id,
      organizationId: branch.organizationId,
      date: input.date || old.date,
      time: input.time || old.time,
    };
    Object.assign(candidate, ctx.ticketServiceSelection(data, branch, input, old));
    if (branch.id !== old.branchId && input.serviceId === undefined) Object.assign(candidate, {serviceId:null,serviceName:'',serviceSnapshot:null});
    if (ctx.isAdmin(a) && input.userId) {
      if (
        !data.users.some(
          (u) =>
            u.id === input.userId && u.role === 'User' && !u.isDeleted && u.status === 'active',
        )
      )
        ctx.fail('INVALID_REFERENCE', 'Select an active user.');
      candidate.userId = input.userId;
    }
    if ((ctx.isAdmin(a) || a.role === 'User') && input.requiresAssistant !== undefined) {
      candidate.requiresAssistant = Boolean(input.requiresAssistant);
      candidate.support = candidate.requiresAssistant ? ['Staff assistance'] : [];
    }
    if (a.role !== 'User' && !String(input.reason || '').trim())
      ctx.fail('REASON_REQUIRED', 'Explain the appointment change.');
    const slot = ctx.checkBookingSlot(
      data,
      branch,
      {
        ...candidate,
        durationMinutes: input.durationMinutes || candidate.durationMinutes,
      },
      old.id,
    );
    delete old.scheduleConflict;
    delete old.scheduleConflictAt;
    delete candidate.scheduleConflict;
    delete candidate.scheduleConflictAt;
    Object.assign(old, candidate, slot, {
      status: 'pending',
      journeyState: 'not-started',
      updatedAt: ctx.now(),
      revision: (old.revision || 0) + 1,
      journeyHistory: [
        ...(old.journeyHistory || []),
        {
          id: ctx.id('history'),
          event: 'reschedule',
          from: old.journeyState || 'not-started',
          to: 'not-started',
          actorId: a.id,
          actorRole: a.role,
          actorName: a.name,
          reason: input.reason || '',
          at: ctx.now(),
        },
      ],
    });
    for (const key of ['departedAt', 'arrivedAt', 'receivedAt', 'completedAt']) delete old[key];
    ctx.audit(data, a, 'Reschedule', 'bookings', old.id);
    data.notifications.push({
      id: ctx.id('notification'),
      ownerId: old.userId,
      title: 'Ticket rescheduled',
      message: old.date + ' ' + old.time + ' · ' + (input.reason || ''),
      status: 'unread',
      createdAt: ctx.now(),
    });
    ctx.put(data);
    return ctx.safe(old);
  };
  ctx.deleteBooking = async function deleteBooking(entityId) {
    if (ctx.cfg.mode === 'api')
      return ctx.request('/bookings/' + encodeURIComponent(entityId), {
        method: 'DELETE',
      });
    const a = ctx.requireAccount(['Admin']),
      data = ctx.db(),
      x = data.bookings.find((x) => x.id === entityId && !x.isDeleted);
    if (!x) ctx.fail('NOT_FOUND', 'Ticket not found.');
    x.isDeleted = true;
    x.status = 'cancelled';
    x.updatedAt = ctx.now();
    ctx.audit(data, a, 'Delete', 'bookings', x.id);
    ctx.put(data);
    return ctx.safe(x);
  };
  ctx.bookingStatus = async function bookingStatus(
    entityId,
    status,
    reason = '',
    expectedRevision,
  ) {
    status = String(status).toLowerCase().replace(' ', '-');
    if (ctx.cfg.mode === 'api')
      return ctx.request(`/bookings/${encodeURIComponent(entityId)}/status`, {
        method: 'PATCH',
        body: {
          status,
          reason,
          expectedRevision,
          timeZone: 'Asia/Amman',
        },
      });
    if (['confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'].includes(status))
      return ctx.api.journey.change(
        entityId,
        {
          confirmed: 'approve',
          'in-progress': 'receive',
          completed: 'finish',
          cancelled: 'cancel',
          'no-show': 'no-show',
        }[status],
        {
          reason,
          expectedRevision,
        },
      );
    const a = ctx.requireAccount(),
      data = ctx.db(),
      x = data.bookings.find((b) => !b.isDeleted && String(b.id) === String(entityId));
    if (!x) ctx.fail('NOT_FOUND', 'Booking not found.');
    if (!ctx.own(data, a, 'bookings', x))
      ctx.fail('FORBIDDEN', 'Booking belongs to another account.');
    if (a.role === 'User' && status !== 'cancelled')
      ctx.fail('FORBIDDEN', 'Only the organization may approve/update progress.');
    const allowed = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    if (status !== x.status && !ctx.isAdmin(a) && !allowed[x.status]?.includes(status))
      ctx.fail('INVALID_TRANSITION', 'This booking status change is unavailable.');
    if (!Object.keys(allowed).includes(status))
      ctx.fail('INVALID_STATUS', 'Unknown booking status.');
    if (status === 'cancelled' && a.role === 'Organization' && !String(reason).trim())
      ctx.fail('REASON_REQUIRED', 'Please enter the cancellation reason.');
    if (status === 'confirmed' && x.status === 'pending') {
      const branch = data.branches.find((b) => b.id === x.branchId && !b.isDeleted);
      if (!branch) ctx.fail('INVALID_REFERENCE', 'Branch unavailable.');
      ctx.checkBookingSlot(data, branch, x, x.id);
    }
    if (status === 'cancelled') {
      x.cancellationReason = String(reason || 'Cancelled by user')
        .trim()
        .slice(0, 1000);
      x.cancelledAt = ctx.now();
    }
    x.status = status;
    x.updatedAt = ctx.now();
    ctx.audit(data, a, 'Status', 'bookings', x.id, reason);
    data.notifications.push({
      id: ctx.id('notification'),
      ownerId: x.userId,
      title:
        status === 'confirmed'
          ? 'Ticket approved'
          : status === 'cancelled'
            ? 'Ticket cancelled'
            : 'Ticket updated',
      message: status === 'cancelled' ? x.cancellationReason : x.date + ' ' + x.time,
      status: 'unread',
      createdAt: ctx.now(),
    });
    ctx.put(data);
    return ctx.safe(x);
  };
});
