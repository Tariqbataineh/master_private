'use strict';
// visits: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registervisits(ctx) {
  ctx.api.visits = (() => {
    const active = (b) =>
      !b.isDeleted && ['pending', 'confirmed', 'in-progress', 'waitlisted'].includes(b.status);
    const stamp = () => new Date().toISOString(),
      token = () =>
        Array.from(crypto.getRandomValues(new Uint8Array(24)), (v) =>
          v.toString(16).padStart(2, '0'),
        ).join('');
    const local = () => {
      if (ctx.cfg.mode !== 'local')
        ctx.fail('INTEGRATION_UNAVAILABLE', 'Use the configured visit endpoint.');
      return ctx.requireAccount();
    };
    const scoped = (data, a, bookingId) => {
      const b = data.bookings.find((b) => b.id === bookingId && !b.isDeleted);
      if (!b) ctx.fail('NOT_FOUND', 'Booking not found.');
      if (!ctx.own(data, a, 'bookings', b))
        ctx.fail('FORBIDDEN', 'Booking belongs to another account.');
      ctx.requireEntitlement?.(data,a,'bookingManagement');
      return b;
    };
    const revision = (b, r) => {
      if (r != null && r !== (b.revision || 0))
        ctx.fail('STALE_BOOKING', 'Booking changed. Refresh and retry.');
    };
    const notify = (data, b, title, message, key) => {
      for (const ownerId of new Set([b.userId, b.organizationId]))
        if (
          !key ||
          !data.notifications.some((n) => n.ownerId === ownerId && n.automationKey === key)
        )
          data.notifications.push({
            id: ctx.id('notification'),
            ownerId,
            bookingId: b.id,
            kind: 'visit-journey',
            title,
            message,
            automationKey: key,
            createdAt: stamp(),
            status: 'unread',
          });
    };
    const commit = (data, a, b, event, reason = '') => {
      b.revision = (b.revision || 0) + 1;
      b.updatedAt = stamp();
      b.journeyHistory = [
        ...(b.journeyHistory || []),
        {
          id: ctx.id('history'),
          event,
          from: b.journeyState || 'not-started',
          to: b.journeyState || 'not-started',
          actorId: a.id,
          actorRole: a.role,
          actorName: a.name,
          reason,
          at: b.updatedAt,
        },
      ];
      ctx.audit(data, a, event, 'bookings', b.id, reason);
      ctx.put(data);
      return ctx.bookingDto(b, data, 'org');
    };
    const rotate = (b) => {
      b.qrToken = token();
      delete b.reminderFlags;
      delete b.nearTurnNotified;
      delete b.qrVerified;
      delete b.qrUsedAt;
      delete b.calledAt;
      delete b.arrivedAt;
      delete b.receivedAt;
      delete b.departedAt;
    };
    let writes=Promise.resolve();
    const locked = fn => {
      const run=()=>typeof navigator!=='undefined'&&navigator.locks ? navigator.locks.request('wusool-booking-write',fn) : fn();
      const result=writes.then(run,run); writes=result.catch(()=>{}); return result;
    };
    const baseCreate = ctx.api.createBooking,
      baseUpdate = ctx.api.updateBooking,
      baseDelete = ctx.api.deleteBooking,
      baseGet = ctx.api.getBookings,
      baseChange = ctx.api.journey.change;
    ctx.api.createBooking = (input, key) =>
      locked(async () => {
        const x = await baseCreate(input, key);
        if (ctx.cfg.mode !== 'local') return x;
        const data = ctx.db(),
          b = data.bookings.find((b) => b.id === x.id);
        if (!b.qrToken) {
          b.qrToken = token();
          b.durationMinutes = x.durationMinutes || 30;
          ctx.put(data);
        }
        return ctx.bookingDto(b, data, 'org');
      });
    ctx.api.updateBooking = (bookingId, input) =>
      locked(async () => {
        if (ctx.cfg.mode === 'api')
          return ctx.request('/bookings/' + encodeURIComponent(bookingId) + '/appointment', {
            method: 'PATCH',
            body: {
              ...input,
              timeZone: 'Asia/Amman',
            },
          });
        const a = local(),
          data = ctx.db(),
          b = scoped(data, a, bookingId);
        if (b.interviewId) ctx.fail('INTERVIEW_MANAGED', 'Interview timing is managed by the organization in Recruitment.');
        revision(b, input.expectedRevision);
        if (a.role !== 'User' && b.status === 'confirmed') {
          if (!String(input.reason || '').trim())
            ctx.fail('REASON_REQUIRED', 'Explain the proposed appointment.');
          if (input.userId && input.userId !== b.userId)
            ctx.fail(
              'BOOKING_LOCKED',
              'Changing the visitor is unavailable for a confirmed booking. Cancel and create a new booking.',
            );
          const candidate = {
            ...b,
            ...input,
            branchId: a.role === 'Admin' && input.branchId ? input.branchId : b.branchId,
            userId: a.role === 'Admin' && input.userId ? input.userId : b.userId,
          };
          const branch = data.branches.find(
            (p) => p.id === candidate.branchId && ctx.visibleBranch(data, p),
          );
          if (!branch) ctx.fail('INVALID_BRANCH', 'Select a published branch.');
          Object.assign(candidate, ctx.ticketServiceSelection(data, branch, input, b));
          if(branch.id !== b.branchId && input.serviceId === undefined) Object.assign(candidate,{serviceId:null,serviceName:'',serviceSnapshot:null});
          Object.assign(candidate, ctx.checkBookingSlot(data, branch, candidate, b.id));
          b.appointmentProposal = {
            serviceId: candidate.serviceId ?? null, serviceName: candidate.serviceName || '', serviceSnapshot: candidate.serviceSnapshot || null,
            date: candidate.date,
            time: candidate.time,
            branchId: branch.id,
            organizationId: branch.organizationId,
            userId: candidate.userId,
            requiresAssistant: candidate.requiresAssistant,
            durationMinutes: candidate.durationMinutes,
            bufferMinutes: candidate.bufferMinutes,
            reason: input.reason,
            createdAt: stamp(),
            expiresAt: new Date(
              Math.min(Date.now() + 86400000, ctx.jordanInstant(candidate.date, candidate.time)),
            ).toISOString(),
          };
          notify(
            data,
            b,
            'New appointment proposed',
            candidate.date + ' ' + candidate.time + ' · ' + input.reason,
          );
          return commit(data, a, b, 'appointment-proposed', input.reason);
        }
        const result = await baseUpdate(bookingId, input),
          fresh = ctx.db(),
          saved = fresh.bookings.find((x) => x.id === bookingId);
        saved.durationMinutes = saved.durationMinutes || 30;
        rotate(saved);
        delete saved.appointmentProposal;
        ctx.put(fresh);
        return {
          ...result,
          revision: saved.revision,
        };
      });
    ctx.api.deleteBooking = async (bookingId) => {
      const result = await baseDelete(bookingId);
      await process();
      return result;
    };
    ctx.api.journey.change = (bookingId, action, options = {}, instant = Date.now()) => {
      if (ctx.cfg.mode !== 'local')
        return ctx.request('/bookings/' + encodeURIComponent(bookingId) + '/journey', {
          method: 'POST',
          body: {
            action,
            ...options,
            timeZone: 'Asia/Amman',
          },
        });
      const a = local(),
        data = ctx.db(),
        b = scoped(data, a, bookingId);
      if(['receive','finish','call','serve'].includes(action))ctx.requireEntitlement?.(data,a,'queueManagement');
      if (b.interviewId && ['cancel','reschedule','correct'].includes(action)) ctx.fail('INTERVIEW_MANAGED', 'Use Recruitment to change or cancel this interview and its linked visit.');
      if (action === 'receive') {
        const verification = b.qrVerified;
        if (
          !verification ||
          verification.actorId !== a.id ||
          verification.token !== b.qrToken ||
          instant - Date.parse(verification.at) > 600000 ||
          b.qrUsedAt
        )
          ctx.fail(
            'QR_REQUIRED',
            'Verify this visitor’s QR before reception. Verification lasts 10 minutes.',
          );
      }
      if (action === 'cancel' && a.role === 'User')
        return cancel(bookingId, options.reason, options.expectedRevision);
      if (action === 'approve' && b.appointmentProposal)
        ctx.fail('PROPOSAL_PENDING', 'The visitor must respond to the proposed appointment first.');
      if (
        action === 'depart' &&
        ctx.api.journey.timing(b, instant).canDepart &&
        b.appointmentProposal
      )
        ctx.fail('PROPOSAL_PENDING', 'Respond to the proposed appointment before departing.');
      let approvedSlot;
      if (action === 'approve') {
        const branch = data.branches.find((p) => p.id === b.branchId);
        approvedSlot = {...ctx.ticketServiceSelection(data,branch,b),...ctx.checkBookingSlot(data, branch, b, b.id)};
      }
      if (action === 'reschedule')
        ctx.fail(
          'USE_APPOINTMENT_FLOW',
          'Use the appointment editor so visitor consent is preserved.',
        );
      if (action === 'correct' && options.patch?.journeyState === 'serving')
        ctx.fail('QR_REQUIRED', 'Use QR verification and Receive visitor to record reception.');
      const result = baseChange(bookingId, action, options, instant);
      if (['cancel', 'no-show', 'finish'].includes(action))
        void process().catch((error) =>
          ctx
            .reportRuntimeError({
              message: error.message,
              source: 'visit-automation',
            })
            .catch(() => {}),
        );
      if(approvedSlot){const fresh=ctx.db(),saved=fresh.bookings.find(x=>x.id===bookingId);Object.assign(saved,approvedSlot);ctx.put(fresh);Object.assign(result,ctx.bookingDto(saved,fresh,'org'));}
      if (action === 'receive') {
        const fresh = ctx.db(),
          saved = fresh.bookings.find((x) => x.id === bookingId);
        saved.qrUsedAt = new Date(instant).toISOString();
        ctx.put(fresh);
      }
      return result;
    };
    ctx.api.getBookings = async (options) => {
      const items = await baseGet(options);
      if (ctx.cfg.mode !== 'local') return items;
      const a = local();
      return items.map((b) => {
        const value = {
          ...b,
        };
        delete value.qrToken;
        if (value.qrVerified)
          value.qrVerified = {
            actorId: value.qrVerified.actorId,
            at: value.qrVerified.at,
          };
        if (a.role !== 'Admin') {
          delete value.visitorPhone;
          delete value.visitorEmail;
          value.journeyHistory = (value.journeyHistory || []).map((h) => ({
            ...h,
            actorId: undefined,
          }));
        }
        return value;
      });
    };
    function cancel(bookingId, reason, r) {
      if (ctx.cfg.mode === 'api')
        return ctx.request('/bookings/' + encodeURIComponent(bookingId) + '/cancel', {
          method: 'POST',
          body: {
            reason,
            expectedRevision: r,
          },
        });
      const a = local(),
        data = ctx.db(),
        b = scoped(data, a, bookingId);
      if (b.interviewId) ctx.fail('INTERVIEW_MANAGED', 'Decline the interview through Recruitment to release its associated visit.');
      revision(b, r);
      if (!active(b) || b.status === 'in-progress')
        ctx.fail('BOOKING_CLOSED', 'This booking cannot be cancelled here.');
      if (!String(reason || '').trim()) ctx.fail('REASON_REQUIRED', 'Enter a cancellation reason.');
      b.status = 'cancelled';
      b.journeyState = 'cancelled';
      b.cancelledAt = stamp();
      b.cancellationReason = String(reason).trim().slice(0, 1000);
      delete b.appointmentProposal;
      delete b.qrVerified;
      notify(data, b, 'Booking cancelled', b.cancellationReason);
      const result = commit(data, a, b, 'cancel', b.cancellationReason);
      void process().catch((error) =>
        ctx
          .reportRuntimeError({
            message: error.message,
            source: 'visit-automation',
          })
          .catch(() => {}),
      );
      return result;
    }
    function pass(bookingId) {
      if (ctx.cfg.mode === 'api')
        return ctx.request('/bookings/' + encodeURIComponent(bookingId) + '/pass');
      const a = local(),
        data = ctx.db(),
        b = scoped(data, a, bookingId);
      if (a.role !== 'User' || b.userId !== a.id)
        ctx.fail('FORBIDDEN', 'Only the visitor can display their pass.');
      if (b.status !== 'confirmed')
        ctx.fail('PASS_UNAVAILABLE', 'The QR appears after appointment approval.');
      if (!b.qrToken) {
        b.qrToken = token();
        ctx.put(data);
      }
      return {
        payload: 'WUSOOL:1:' + b.id + ':' + b.qrToken,
        reference: b.reference,
        date: b.date,
        time: b.time,
      };
    }
    function verify(payload, expectedRevision, bookingId) {
      if (ctx.cfg.mode === 'api')
        return ctx.request('/visits/verify', {
          method: 'POST',
          body: {
            payload,
            expectedRevision,
            bookingId,
          },
        });
      const a = local();
      if (!['Admin', 'Organization'].includes(a.role))
        ctx.fail('FORBIDDEN', 'Reception access is required.');
      const match = /^WUSOOL:1:([^:]+):([a-f0-9]{48})$/.exec(String(payload || '').trim());
      if (!match) ctx.fail('INVALID_QR', 'Invalid Wusool QR.');
      if (bookingId && match[1] !== bookingId)
        ctx.fail('INVALID_QR', 'This QR belongs to another booking. Open the correct booking.');
      const data = ctx.db(),
        b = scoped(data, a, match[1]);
      revision(b, expectedRevision);
      if (match[2] !== b.qrToken)
        ctx.fail('INVALID_QR', 'This QR is invalid or was replaced after rescheduling.');
      if (b.qrUsedAt) ctx.fail('QR_USED', 'This visitor was already received.');
      if (
        b.scheduleBlocked ||
        b.status !== 'confirmed' ||
        b.journeyState !== 'arrived' ||
        b.date !== ctx.api.journey.day(Date.now())
      )
        ctx.fail(
          'QR_NOT_READY',
          'The visitor must report arrival on the confirmed appointment day.',
        );
      b.qrVerified = {
        actorId: a.id,
        at: stamp(),
        token: b.qrToken,
      };
      return commit(data, a, b, 'qr-verified', 'Visitor pass verified at reception');
    }
    async function respond(bookingId, accept, reason, r) {
      return locked(async () => {
        if (ctx.cfg.mode === 'api')
          return ctx.request(
            '/bookings/' + encodeURIComponent(bookingId) + '/appointment/response',
            {
              method: 'POST',
              body: {
                accept,
                reason,
                expectedRevision: r,
              },
            },
          );
        const a = local(),
          data = ctx.db(),
          b = scoped(data, a, bookingId);
        if (a.role !== 'User') ctx.fail('FORBIDDEN', 'The visitor must respond.');
        revision(b, r);
        const p = b.appointmentProposal;
        if (b.status !== 'confirmed')
          ctx.fail('BOOKING_CLOSED', 'This booking no longer accepts appointment proposals.');
        if (!p) ctx.fail('NOT_FOUND', 'No proposed appointment.');
        if (accept) {
          if (Date.parse(p.expiresAt) <= Date.now())
            ctx.fail('PROPOSAL_EXPIRED', 'This proposal expired. Ask for an alternative.');
          const candidate = {
            ...b,
            ...p,
          };
          const branch = data.branches.find((x) => x.id === p.branchId);
          Object.assign(candidate, ctx.checkBookingSlot(data, branch, candidate, b.id));
          for (const k of [
            'serviceId', 'serviceName', 'serviceSnapshot',
            'date',
            'time',
            'branchId',
            'organizationId',
            'requiresAssistant',
            'durationMinutes', 'bufferMinutes',
          ])
            b[k] = candidate[k];
          rotate(b);
          b.status = 'confirmed';
          b.journeyState = 'not-started';
          delete b.scheduleBlocked;
          delete b.scheduleConflict;
          delete b.scheduleConflictAt;
          delete b.nearTurnNotified;
          b.reminderFlags = {};
        } else if (!String(reason || '').trim())
          ctx.fail('REASON_REQUIRED', 'Explain the alternative you need.');
        delete b.appointmentProposal;
        notify(
          data,
          b,
          accept ? 'New appointment accepted' : 'Alternative appointment requested',
          accept ? b.date + ' ' + b.time : String(reason),
        );
        return commit(
          data,
          a,
          b,
          accept ? 'proposal-accepted' : 'proposal-declined',
          reason || p.reason,
        );
      });
    }
    async function joinWaitlist(input, key) {
      return locked(async () => {
        if (ctx.cfg.mode === 'api')
          return ctx.request('/bookings/waitlist', {
            method: 'POST',
            body: {
              ...input,
              timeZone: 'Asia/Amman',
            },
            headers: {
              'Idempotency-Key': key,
            },
          });
        const a = local();
        if (!['User', 'Admin'].includes(a.role))
          ctx.fail('FORBIDDEN', 'Only visitors or admins may join.');
        if (!key) ctx.fail('IDEMPOTENCY_REQUIRED', 'Retry key required.');
        const data = ctx.db(),
          userId = a.role === 'Admin' ? input.userId : a.id,
          branch = data.branches.find((x) => x.id === input.branchId && ctx.visibleBranch(data, x));
        if (
          !branch ||
          !data.users.some(
            (u) => u.id === userId && u.role === 'User' && !u.isDeleted && u.status === 'active',
          )
        )
          ctx.fail('INVALID_REFERENCE', 'Choose an active visitor and branch.');
        const requestHash = JSON.stringify(['waitlist', String(input.branchId), String(input.serviceId),
          String(input.date), String(input.time), String(input.purpose || '')]);
        const prior = data.bookings.find((b) => b.userId === userId && b.idempotencyKey === key);
        if (prior) {
          const previous = prior.requestHash || JSON.stringify(['waitlist', String(prior.branchId),
            String(prior.serviceId), String(prior.date), String(prior.time), String(prior.purpose || '')]);
          if (prior.status !== 'waitlisted' || previous !== requestHash)
            ctx.fail('IDEMPOTENCY_CONFLICT', 'This retry key belongs to a different request.');
          return ctx.safe(prior);
        }
        try {
          ctx.checkBookingSlot(data, branch, {
            ...input,
            userId,
          });
          ctx.fail('WAITLIST_NOT_NEEDED', 'A booking slot is available. Reserve it directly.');
        } catch (e) {
          if (e.code !== 'ASSISTANCE_CAPACITY') throw e;
        }
        const fields = Object.fromEntries(
          ['purpose', 'destination', 'guidanceMethod', 'support']
            .filter((k) => k in input)
            .map((k) => [k, ctx.safe(input[k])]),
        );
        const b = {
          ...ctx.ticketServiceSelection(data, branch, input),
          ...fields,
          date: input.date,
          time: input.time,
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
          organizationId: branch.organizationId,
          branchId: branch.id,
          status: 'waitlisted',
          journeyState: 'not-started',
          requiresAssistant: true,
          durationMinutes: ctx.ticketServiceSelection(data,branch,input).serviceSnapshot.durationMinutes,
          bufferMinutes: ctx.ticketServiceSelection(data,branch,input).serviceSnapshot.bufferMinutes,
          revision: 1,
          idempotencyKey: key,
          requestHash,
          createdAt: stamp(),
          updatedAt: stamp(),
          qrToken: token(),
          isDeleted: false,
        };
        data.bookings.push(b);
        notify(
          data,
          b,
          'Joined booking waitlist',
          'A released slot will become pending approval automatically.',
        );
        ctx.audit(data, a, 'waitlist-joined', 'bookings', b.id);
        ctx.put(data);
        return ctx.safe(b);
      });
    }
    function queue(bookingId) {
      const a = local(),
        data = ctx.db(),
        b = scoped(data, a, bookingId),
        list = data.bookings
          .filter(
            (x) =>
              !x.isDeleted &&
              x.branchId === b.branchId &&
              x.date === ctx.api.journey.day(Date.now()) &&
              x.status === 'confirmed' &&
              x.journeyState === 'arrived' &&
              !x.scheduleBlocked,
          )
          .sort(
            (x, y) => Date.parse(x.arrivedAt) - Date.parse(y.arrivedAt) || x.id.localeCompare(y.id),
          );
      const position = list.findIndex((x) => x.id === b.id) + 1,
        completed = data.bookings
          .filter((x) => x.branchId === b.branchId && x.completedAt && x.receivedAt)
          .slice(-20)
          .map((x) => (Date.parse(x.completedAt) - Date.parse(x.receivedAt)) / 60000)
          .filter((x) => x > 1 && x < 180),
        average = Math.round(
          completed.length
            ? completed.reduce((sum, x) => sum + x, 0) / completed.length
            : b.durationMinutes || 30,
        ),
        serving = data.bookings.filter(
          (x) => x.branchId === b.branchId && x.status === 'in-progress' && !x.isDeleted,
        ),
        remaining = serving.length
          ? Math.max(
              1,
              average - Math.floor((Date.now() - Date.parse(serving[0].receivedAt)) / 60000),
            )
          : 0;
      return {
        position,
        ahead: Math.max(0, position - 1),
        estimatedMinutes: position ? Math.max(0, (position - 1) * average + remaining) : null,
        waitingMinutes: b.arrivedAt
          ? Math.max(0, Math.floor((Date.now() - Date.parse(b.arrivedAt)) / 60000))
          : 0,
        called: !!b.calledAt,
        estimateOnly: true,
      };
    }
    function callNext(branchId) {
      if (ctx.cfg.mode === 'api')
        return ctx.request('/branches/' + encodeURIComponent(branchId) + '/queue/call-next', {
          method: 'POST',
        });
      const a = local(),
        data = ctx.db();
      if (
        !['Admin', 'Organization'].includes(a.role) ||
        !data.branches.some(
          (p) => p.id === branchId && ctx.own(data,a,'branches',p),
        )
      )
        ctx.fail('FORBIDDEN', 'Branch reception access required.');
      ctx.requireEntitlement?.(data,a,'queueManagement');
      const list = data.bookings
        .filter(
          (b) =>
            b.branchId === branchId &&
            !b.isDeleted &&
            b.status === 'confirmed' &&
            b.journeyState === 'arrived' &&
            b.date === ctx.api.journey.day(Date.now()) &&
            !b.scheduleBlocked,
        )
        .sort((x, y) => Date.parse(x.arrivedAt) - Date.parse(y.arrivedAt));
      if (!list.length) ctx.fail('EMPTY_QUEUE', 'No visitors are waiting.');
      const b = list[0];
      if (b.calledAt) return ctx.bookingDto(b, data, 'org');
      b.calledAt = stamp();
      notify(
        data,
        b,
        'Your turn at reception',
        'Please present your QR to reception.',
        'called:' + b.id + ':' + b.date,
      );
      return commit(data, a, b, 'queue-called');
    }
    async function branchNotice(branchId, { date, reason, facility, available, reopen = false }) {
      if (ctx.cfg.mode === 'api')
        return ctx.request('/branches/' + encodeURIComponent(branchId) + '/visit-notice', {
          method: 'POST',
          body: {
            date,
            reason,
            facility,
            available,
            reopen,
          },
        });
      const a = local(),
        data = ctx.db(),
        branch = data.branches.find((p) => p.id === branchId && !p.isDeleted);
      if (
        !branch ||
        !['Admin', 'Organization'].includes(a.role) ||
        (a.role === 'Organization' && !ctx.own(data,a,'branches',branch))
      )
        ctx.fail('FORBIDDEN', 'Manage your own branch.');
      if (!String(reason || '').trim())
        ctx.fail('REASON_REQUIRED', 'Explain the closure or facility change.');
      if (date) {
        const valid = Date.parse(date + 'T00:00:00Z');
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          !Number.isFinite(valid) ||
          new Date(valid).toISOString().slice(0, 10) !== date
        )
          ctx.fail('INVALID_DATE', 'Choose a valid closure date.');
        if (reopen) {
          branch.closedDates = (branch.closedDates || []).filter((x) => x !== date);
          delete branch.closureReasons?.[date];
        } else {
          branch.closedDates = [...new Set([...(branch.closedDates || []), date])];
          branch.closureReasons = {
            ...branch.closureReasons,
            [date]: reason,
          };
        }
      } else {
        if (!Object.hasOwn(branch.accessibility || {}, facility) || typeof available !== 'boolean')
          ctx.fail('INVALID_FACILITY', 'Choose a recorded facility.');
        branch.operationalAvailability = {
          ...branch.operationalAvailability,
          [facility]: {
            available,
            reason,
            at: stamp(),
          },
        };
      }
      const affected = data.bookings.filter(
        (b) => b.branchId === branchId && active(b) && (!date || b.date === date),
      );
      for (const b of affected) {
        if (date) {
          b.scheduleBlocked = !reopen;
          delete b.qrVerified;
          delete b.appointmentProposal;
        }
        notify(
          data,
          b,
          date
            ? reopen
              ? 'Branch reopened'
              : 'Branch closed — new appointment needed'
            : 'Accessibility facility update',
          reason,
        );
        b.revision = (b.revision || 0) + 1;
        b.updatedAt = stamp();
        b.journeyHistory = [
          ...(b.journeyHistory || []),
          {
            id: ctx.id('history'),
            event: date ? (reopen ? 'branch-reopened' : 'branch-closed') : 'facility-update',
            actorId: a.id,
            actorRole: a.role,
            actorName: a.name,
            reason,
            at: stamp(),
          },
        ];
      }
      ctx.audit(
        data,
        a,
        date ? (reopen ? 'reopen' : 'closure') : 'facility-update',
        'branches',
        branchId,
        reason,
      );
      ctx.put(data);
      return {
        affected: affected.length,
      };
    }
    async function process() {
      return locked(async () => {
        if (ctx.cfg.mode !== 'local')
          return ctx.request('/visits/automation', {
            method: 'POST',
          });
        const a = local(),
          data = ctx.db();
        let changed = false;
        const instant = Date.now();
        for (const b of data.bookings.filter(active)) {
          if (b.status === 'waitlisted' && ctx.jordanInstant(b.date, b.time) <= instant) {
            b.status = 'cancelled';
            b.cancelledAt = stamp();
            b.cancellationReason = 'Waitlist appointment passed';
            changed = true;
          }
          if (b.status === 'confirmed' && !b.scheduleBlocked) {
            const slot = ctx.jordanInstant(b.date, b.time);
            for (const [name, limit] of [
              ['day', 86400000],
              ['departure', 7200000],
              ['soon', 1800000],
            ])
              if (slot > instant && slot - instant <= limit && !b.reminderFlags?.[name]) {
                b.reminderFlags = {
                  ...b.reminderFlags,
                  [name]: true,
                };
                notify(
                  data,
                  b,
                  name === 'departure' ? 'Departure button is ready' : 'Upcoming appointment',
                  b.date + ' ' + b.time + ' · Jordan time',
                  'reminder:' + b.id + ':' + b.date + ':' + b.time + ':' + name,
                );
                changed = true;
              }
          }
          if (b.appointmentProposal && Date.parse(b.appointmentProposal.expiresAt) <= instant) {
            delete b.appointmentProposal;
            notify(
              data,
              b,
              'Appointment proposal expired',
              'Contact the organization for another appointment.',
            );
            b.revision = (b.revision || 0) + 1;
            changed = true;
          }
        }
        for (const b of data.bookings
          .filter((b) => !b.isDeleted && b.status === 'waitlisted')
          .sort((x, y) => Date.parse(x.createdAt) - Date.parse(y.createdAt))) {
          const branch = data.branches.find((p) => p.id === b.branchId);
          if (!branch || !ctx.visibleBranch(data, branch)) continue;
          try {
            Object.assign(b,ctx.ticketServiceSelection(data,branch,b),ctx.checkBookingSlot(data,branch,b,b.id));
            b.status = 'pending';
            b.holdExpiresAt = ctx.holdExpiration(data,branch);
            b.revision = (b.revision || 0) + 1;
            b.updatedAt = stamp();
            notify(
              data,
              b,
              'Waitlist slot reserved',
              'Your released slot is now awaiting organization approval.',
            );
            ctx.audit(
              data,
              {
                id: 'system',
                role: 'System',
                name: 'Automation',
              },
              'waitlist-promoted',
              'bookings',
              b.id,
            );
            changed = true;
          } catch {
            /* Remain in FIFO waitlist while closed/full/overlapping. */
          }
        }
        for (const b of data.bookings.filter(
          (b) =>
            !b.isDeleted &&
            b.status === 'confirmed' &&
            b.journeyState === 'arrived' &&
            b.date === ctx.api.journey.day(instant),
        )) {
          const ahead = data.bookings.filter(
            (x) =>
              !x.isDeleted &&
              x.branchId === b.branchId &&
              x.date === b.date &&
              x.journeyState === 'arrived' &&
              x.status === 'confirmed' &&
              Date.parse(x.arrivedAt) < Date.parse(b.arrivedAt),
          ).length;
          if (ahead <= 1 && !b.nearTurnNotified) {
            b.nearTurnNotified = true;
            notify(
              data,
              b,
              'Your turn is approaching',
              'Keep your QR ready for reception.',
              'near-turn:' + b.id + ':' + b.date,
            );
            changed = true;
          }
        }
        if (changed) ctx.put(data);
        return {
          changed,
        };
      });
    }
    function exportData() {
      if (ctx.cfg.mode === 'api') return ctx.request('/exports/me');
      const a = local(),
        data = ctx.db();
      ctx.requireEntitlement?.(data,a,'reporting');
      const result = {
        format: 'wusool-portable-v1',
        exportedAt: stamp(),
        timeZone: 'Asia/Amman',
        role: a.role,
      };
      if (a.role === 'Admin')
        return {
          ...result,
          data: ctx.safe({ ...data, credentials: undefined }),
          containsCredentialHashes: false,
        };
      return {
        ...result,
        account: ctx.accountDto(a),
        branches: data.branches
          .filter((b) => a.role === 'Organization' && ctx.own(data,a,'branches',b))
          .map(ctx.safe),
        bookings: data.bookings
          .filter((b) => ctx.own(data, a, 'bookings', b))
          .map((b) => {
            const x = ctx.bookingDto(b, data, 'org');
            delete x.qrToken;
            delete x.visitorEmail;
            delete x.visitorPhone;
            return x;
          }),
        notifications: data.notifications.filter((n) => n.ownerId === a.id).map(ctx.safe),
      };
    }
    function fit(place) {
      const a = local(),
        raw =
          a.preferences?.accessibilityNeeds || a.preferences?.routePreferences
            ? a.preferences
            : a.accessibilityPreferences || [],
        selected = Array.isArray(raw)
          ? raw
          : [
              ...(raw.accessibilityNeeds || []),
              ...(raw.routePreferences || []),
              ...(raw.requiredFeatures || raw.features || []),
            ];
      const mapping = {
        wheelchair: ['accessibleEntrance', 'entranceRamp', 'widePathways', 'accessibleRestroom'],
        'limited-mobility': ['accessibleEntrance', 'elevator'],
        'visual-support': ['brailleSigns', 'tactilePaving'],
        'hearing-support': ['hearingSupport'],
        'simple-instructions': ['simpleInstructions'],
        'staff-assistance': ['staffAssistance'],
        'avoid-stairs': ['entranceRamp', 'elevator'],
        'prefer-elevator': ['elevator'],
        'step-free-route': ['accessibleEntrance', 'entranceRamp'],
        'wide-pathways': ['widePathways'],
        'accessible-parking': ['accessibleParking'],
        'rest-areas': ['restAreas'],
      };
      return [...new Set(selected.flatMap((key) => mapping[key] || [key]))].map((key) => {
        const live = place.operationalAvailability?.[key]?.available,
          value =
            typeof live === 'boolean'
              ? live
                ? 'available'
                : 'not-available'
              : (()=>{const a=place.accessibility||place.accessibilityFeatures||{},raw=Array.isArray(a)?a.find(x=>(x.key||x.id)===key):a[key],v=raw&&typeof raw==='object'?raw.status||raw.value:raw;return v===true?'available':v===false?'not-available':v;})();
        return {
          key,
          status:
            value === 'available'
              ? 'available'
              : value === 'not-available'
                ? 'unavailable'
                : 'unknown',
        };
      });
    }
    return {
      pass,
      verify,
      respond,
      cancel,
      joinWaitlist,
      queue,
      callNext,
      branchNotice,
      process,
      exportData,
      fit,
    };
  })();
});
