'use strict';
// journey: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registerjourney(ctx) {
  ctx.api.journey = (() => {
    const NOTICE = 'journey';
    const read = (storage, key, fallback) => {
      try {
        return JSON.parse(storage.getItem(key) || 'null') || fallback;
      } catch {
        return fallback;
      }
    };
    const rows = () => ctx.db().bookings;
    const error = (code, message) => {
      throw Object.assign(new Error(message), {
        code,
      });
    };
    const normalize = (s) =>
      ({
        'pending review': 'pending',
        'in progress': 'in-progress',
        'no show': 'no-show',
      })[String(s).toLowerCase()] || String(s || 'pending').toLowerCase();
    const nowParts = (instant) =>
      Object.fromEntries(
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
    const day = (instant) => {
      const p = nowParts(instant);
      return p.year + '-' + p.month + '-' + p.day;
    };
    function appointment(b) {
      const date = b.date || b.visitDate,
        time = b.time || b.visitTime;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || ''))
        error('INVALID_DATE', 'Booking date and time are missing.');
      const [y, m, d] = date.split('-').map(Number),
        [h, n] = time.split(':').map(Number);
      if (h > 23 || n > 59) error('INVALID_DATE', 'Invalid booking time.');
      const wall = Date.UTC(y, m - 1, d, h, n);
      let instant = wall;
      for (let i = 0; i < 3; i++) {
        const p = nowParts(instant),
          observed = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
        instant += wall - observed;
      }
      if (day(instant) !== date) error('INVALID_DATE', 'Invalid booking date.');
      return instant;
    }
    function actor() {
      if (ctx.cfg.mode !== 'local')
        ctx.fail('INTEGRATION_UNAVAILABLE', 'Configure the journey API before using API mode.');
      return ctx.requireAccount();
    }
    const branch = (b) =>
      ctx.cfg.mode !== 'local'
        ? null
        : ctx
            .db()
            .branches.find((x) => String(x.id) === String(b.branchId || b.placeId) && !x.isDeleted);
    const owns = (a, b) =>
      a.role === 'Admin' ||
      (a.role === 'User' && String(a.id) === String(b.userId)) ||
      (a.role === 'Organization' &&
        String(a.id) === String(b.organizationId || branch(b)?.organizationId));
    const list = () => {
      const a = actor();
      return rows()
        .filter(
          (b) =>
            owns(a, b) &&
            !b.isDeleted &&
            (a.role === 'Admin' ||
              normalize(b.status) !== 'cancelled' ||
              Date.now() - Date.parse(b.cancelledAt || b.updatedAt) < 86400000),
        )
        .map((b) => ctx.bookingDto(b, ctx.db(), 'org'));
    };
    function directions(b) {
      const p = branch(b) || b.locationSnapshot || {},
        finite = (x) => x != null && String(x).trim() !== '' && Number.isFinite(Number(x));
      const exact =
        finite(p.latitude) &&
        finite(p.longitude) &&
        Math.abs(Number(p.latitude)) <= 90 &&
        Math.abs(Number(p.longitude)) <= 180;
      const destination = exact
        ? Number(p.latitude) + ',' + Number(p.longitude)
        : [p.address, p.city, 'Jordan'].filter(Boolean).join(', ');
      return {
        exact,
        available: exact || !!p.address,
        url:
          'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(destination),
      };
    }
    function timing(b, now = Date.now()) {
      const slot = appointment(b),
        status = normalize(b.status),
        active = ['confirmed', 'in-progress'].includes(status),
        state = b.journeyState || 'not-started';
      return {
        slot,
        sameDay: day(now) === day(slot),
        canDepart:
          status === 'confirmed' &&
          state === 'not-started' &&
          day(now) === day(slot) &&
          now >= slot - 7200000 &&
          now <= slot,
        late:
          active && !['arrived', 'serving', 'completed'].includes(state) && now >= slot + 900000,
        canNoShow:
          active && !['arrived', 'serving', 'completed'].includes(state) && now >= slot + 1800000,
      };
    }
    function history(b, a, event, from, to, reason, now) {
      return [
        ...(b.journeyHistory || []),
        {
          id: crypto.randomUUID(),
          event,
          from,
          to,
          actorId: a.id,
          actorRole: a.role,
          actorName: a.name || a.fullName || '',
          reason: reason || '',
          at: new Date(now).toISOString(),
        },
      ];
    }
    function persist(b, a, event, from, to, reason, instant) {
      const data = ctx.db(),
        index = data.bookings.findIndex((x) => String(x.id) === String(b.id)),
        record = {
          ...b,
          revision: (b.revision || 0) + 1,
          updatedAt: new Date(instant).toISOString(),
          journeyHistory: history(b, a, event, from, to, reason, instant),
        };
      if (record.status === 'cancelled') record.cancelledAt = record.updatedAt;
      if (index < 0) data.bookings.push(record);
      else data.bookings[index] = record;
      for (const ownerId of new Set([record.userId, record.organizationId].filter(Boolean)))
        data.notifications.push({
          id: crypto.randomUUID(),
          ownerId,
          kind: 'visit-journey',
          bookingId: b.id,
          userId: b.userId,
          organizationId: b.organizationId,
          title: event,
          message:
            event === 'cancel'
              ? reason
              : [to, record.date, record.time, reason].filter(Boolean).join(' · '),
          journeyState: to,
          reason: reason || '',
          date: record.date,
          time: record.time,
          branchName: record.branchName || branch(record)?.name,
          at: record.updatedAt,
          createdAt: record.updatedAt,
          readBy: [],
          status: 'unread',
        });
      ctx.audit(data, a, event, 'bookings', b.id, reason);
      ctx.put(data);
      return ctx.bookingDto(record, data, 'org');
    }
    function validateSchedule(b) {
      const p = branch(b);
      if (!p) error('INVALID_BRANCH', 'Booking branch is unavailable.');
      const date = b.date || b.visitDate,
        time = b.time || b.visitTime,
        special = (p.specialHours || []).find((x) => x.date === date);
      if (special?.status === 'closed' || (p.closedDates || []).includes(date))
        error('BRANCH_CLOSED', 'The branch is closed on this date.');
      const weekday = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Amman',
        weekday: 'long',
      })
        .format(new Date(appointment(b)))
        .toLowerCase();
      const hours =
        special?.status === 'custom'
          ? special
          : Array.isArray(p.workingHours)
            ? p.workingHours.find((x) => String(x.day || x.name).toLowerCase() === weekday)
            : Object.entries(p.workingHours || {}).find(
                ([key]) => key.toLowerCase() === weekday,
              )?.[1];
      if (hours) {
        if (hours.isOpen === false || hours.isClosed || hours.closed)
          error('BRANCH_CLOSED', 'The branch is closed on this day.');
        if (
          time < (hours.openTime || hours.open || '00:00') ||
          time >= (hours.closeTime || hours.close || '24:00')
        )
          error('OUTSIDE_HOURS', 'Choose a time during branch working hours.');
      }
      const assisted = b.requiresAssistant || (b.support || []).includes('Staff assistance');
      if (
        assisted &&
        rows().filter(
          (x) =>
            String(x.id) !== String(b.id) &&
            String(x.branchId || x.placeId) === String(b.branchId || b.placeId) &&
            (x.date || x.visitDate) === date &&
            String(x.time || x.visitTime).slice(0, 2) === time.slice(0, 2) &&
            (x.requiresAssistant || (x.support || []).includes('Staff assistance')) &&
            ['pending', 'confirmed', 'in-progress'].includes(normalize(x.status)) &&
            !x.isDeleted,
        ).length >= 5
      )
        error('ASSISTANCE_FULL', 'This branch already has 5 assisted bookings in this clock hour.');
    }
    const create = (input) =>
      ctx.createBooking(input, input.idempotencyKey || String(input.id || crypto.randomUUID()));
    function change(
      id,
      action,
      { reason = '', expectedRevision, patch = {} } = {},
      now = Date.now(),
    ) {
      const a = actor(),
        b = rows().find((x) => String(x.id) === String(id));
      if (!b || b.isDeleted) error('NOT_FOUND', 'Booking not found.');
      if (!owns(a, b)) error('FORBIDDEN', 'This booking belongs to another account.');
      if (expectedRevision != null && (b.revision || 0) !== expectedRevision)
        error('STALE_BOOKING', 'Booking changed. Refresh and try again.');
      const state = b.journeyState || 'not-started',
        status = normalize(b.status),
        staff = ['Admin', 'Organization'].includes(a.role);
      let next = {
          ...b,
        },
        to = state;
      if (['approve', 'receive', 'finish', 'no-show', 'cancel'].includes(action) && !staff)
        error('FORBIDDEN', 'Only staff may update this booking state.');
      if (['cancelled', 'completed', 'no-show'].includes(status) && action !== 'correct')
        error('BOOKING_CLOSED', 'This booking is closed.');
      if (b.scheduleBlocked && ['depart', 'arrive', 'receive', 'approve'].includes(action))
        error(
          'BRANCH_CLOSED',
          'This appointment is affected by a branch closure. Choose a new appointment.',
        );
      if (action === 'depart') {
        if (a.role !== 'User') error('FORBIDDEN', 'Only the visitor can report being on the way.');
        if (!timing(b, now).canDepart)
          error(
            'NOT_AVAILABLE',
            'I am on my way is available on the booking day, from two hours before the confirmed appointment until its start.',
          );
        to = 'on-the-way';
        next.departedAt = new Date(now).toISOString();
      } else if (action === 'arrive') {
        if (a.role !== 'User') error('FORBIDDEN', 'Only the visitor can report arrival.');
        if (state !== 'on-the-way' || status !== 'confirmed' || day(now) !== day(appointment(b)))
          error('INVALID_TRANSITION', 'Mark on the way first, on your booking day.');
        to = 'arrived';
        next.arrivedAt = new Date(now).toISOString();
      } else if (action === 'approve') {
        if (!staff || status !== 'pending')
          error('INVALID_TRANSITION', 'Only staff can approve a pending booking.');
        if (appointment(b) <= now)
          error('PAST_DATE', 'The appointment has passed. Reschedule before approval.');
        validateSchedule(b);
        next.status = 'confirmed';
        to = 'not-started';
      } else if (action === 'receive') {
        if (!staff || state !== 'arrived' || status !== 'confirmed')
          error('INVALID_TRANSITION', 'The visitor must report arrival before reception.');
        next.status = 'in-progress';
        to = 'serving';
        next.receivedAt = new Date(now).toISOString();
      } else if (action === 'finish') {
        if (!staff || state !== 'serving' || status !== 'in-progress')
          error('INVALID_TRANSITION', 'Receive the visitor before completing the visit.');
        next.status = 'completed';
        to = 'completed';
        next.completedAt = new Date(now).toISOString();
      } else if (action === 'no-show') {
        if (!staff || !timing(b, now).canNoShow || !reason.trim())
          error(
            'INVALID_TRANSITION',
            'No-show requires 30 minutes after the appointment, no arrival and a reason.',
          );
        next.status = 'no-show';
        to = 'no-show';
      } else if (action === 'cancel') {
        if (!staff || !reason.trim())
          error('REASON_REQUIRED', 'Staff must provide a cancellation reason.');
        next.status = 'cancelled';
        to = 'cancelled';
        next.cancellationReason = reason;
      } else if (action === 'reschedule') {
        if (!['pending', 'confirmed'].includes(status))
          error('INVALID_TRANSITION', 'Only pending or confirmed bookings can be rescheduled.');
        if (!staff && !(a.role === 'User' && status === 'pending'))
          error('FORBIDDEN', 'Only staff can reschedule a confirmed booking.');
        if (staff && !reason.trim()) error('REASON_REQUIRED', 'Explain the changed appointment.');
        next = {
          ...next,
          date: patch.date,
          time: patch.time,
        };
        if (patch.branchId && String(patch.branchId) !== String(b.branchId)) {
          if (a.role !== 'Admin') error('FORBIDDEN', 'Only the admin can change the branch.');
          const p = ctx
            .db()
            .branches.filter((x) => ctx.visibleBranch(ctx.db(), x))
            .find((x) => String(x.id) === String(patch.branchId));
          if (!p) error('INVALID_BRANCH', 'Choose an approved branch.');
          next.branchId = p.id;
          next.organizationId = p.organizationId;
          next.branchName = p.name;
          next.locationSnapshot = {
            latitude: p.latitude,
            longitude: p.longitude,
            address: p.address,
            city: p.city,
          };
        }
        if (appointment(next) <= now) error('PAST_DATE', 'New booking time must be in the future.');
        validateSchedule(next);
        next.status = 'pending';
        to = 'not-started';
        for (const key of ['departedAt', 'arrivedAt', 'receivedAt', 'completedAt'])
          delete next[key];
      } else if (action === 'correct') {
        if (a.role !== 'Admin' || !reason.trim())
          error('FORBIDDEN', 'Admin correction requires a reason.');
        if (
          ![
            'not-started',
            'on-the-way',
            'arrived',
            'serving',
            'completed',
            'cancelled',
            'no-show',
          ].includes(patch.journeyState)
        )
          error('INVALID_STATE', 'Choose a valid journey state.');
        to = patch.journeyState;
        for (const key of ['departedAt', 'arrivedAt', 'receivedAt', 'completedAt'])
          delete next[key];
        if (to === 'on-the-way') next.departedAt = new Date(now).toISOString();
        if (to === 'arrived') next.arrivedAt = new Date(now).toISOString();
        if (to === 'serving') next.receivedAt = new Date(now).toISOString();
        if (to === 'completed') next.completedAt = new Date(now).toISOString();
        next.status =
          to === 'serving'
            ? 'in-progress'
            : ['completed', 'cancelled', 'no-show'].includes(to)
              ? to
              : 'confirmed';
      } else error('INVALID_ACTION', 'Unsupported journey action.');
      next.journeyState = to;
      return persist(next, a, action, state, to, reason, now);
    }
    const notifications = () => {
      const a = actor();
      return ctx
        .db()
        .notifications.filter(
          (n) => n.kind === 'visit-journey' && (a.role === 'Admin' || n.ownerId === a.id),
        );
    };
    const markNotificationsRead = () => {
      const a = actor(),
        data = ctx.db();
      data.notifications.forEach((n) => {
        if (n.kind === 'visit-journey' && (a.role === 'Admin' || n.ownerId === a.id)) {
          n.status = 'read';
          n.readBy = [...new Set([...(n.readBy || []), a.role + ':' + a.id])];
        }
      });
      ctx.put(data);
    };
    return {
      markNotificationsRead,
      actor,
      list,
      create,
      change,
      branch,
      directions,
      timing,
      appointment,
      day,
      notifications,
      normalize,
    };
  })();
});
