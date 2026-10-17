
"use strict";

window.WusoolServiceModules.push(function registerbookings(ctx) {

  ctx.needsAssistant = function needsAssistant(input) {
    return (
      input.requiresAssistant === true ||
      (Array.isArray(input.support) ? input.support : []).some(x =>
        /staff assistance|person assistance|مرافق|مساعد/i.test(String(x))
      )
    );
  };

  // One shared formatter and a small result cache: availability asks for the same instants many times.
  const ammanFormat = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Amman",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const instantCache = new Map();

  ctx.jordanInstant = function jordanInstant(date, time) {
    const cacheKey = date + "T" + time;
    if (instantCache.has(cacheKey)) return instantCache.get(cacheKey);

    const target = Date.parse(date + "T" + time + ":00Z");
    if (!Number.isFinite(target)) return NaN;

    let instant = target;
    for (let i = 0; i < 2; i++) {
      const parts = Object.fromEntries(
        ammanFormat.formatToParts(new Date(instant)).map(x => [x.type, x.value])
      );

      const local = Date.parse(
        `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`
      );
      instant += target - local;
    }

    if (instantCache.size > 5000) instantCache.clear();
    instantCache.set(cacheKey, instant);
    return instant;
  };

  const toMinutes = value => {
    if (value === "24:00") return 1440;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value))) return NaN;
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  };

  ctx.checkBookingSlot = function checkBookingSlot(data, branch, input, excludeId) {
    if('requiresAssistant' in input && typeof input.requiresAssistant!=='boolean') ctx.fail('VALIDATION_ERROR','Assistance must be true or false.');
    if (branch?.bookingEnabled === false) {
      ctx.fail("EXTERNAL_BOOKING_REQUIRED", "Online booking is disabled for this branch.");
    }

    if(!branch || !ctx.visibleBranch(data,branch)) ctx.fail('INVALID_BRANCH','Select a published branch.');
    const date = input.date || input.visitDate;
    const time = input.time || input.visitTime;
    const dayDate = new Date(date + "T00:00:00Z");

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date || "") ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "") ||
      !Number.isFinite(+dayDate) ||
      dayDate.toISOString().slice(0, 10) !== date ||
      ctx.jordanInstant(date, time) <= Date.now()
    ) {
      ctx.fail("INVALID_DATE", "Choose a valid future appointment date and time in Jordan time.");
    }

    const day = [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday"
    ][dayDate.getUTCDay()];

    let hours = Array.isArray(branch.workingHours)
      ? branch.workingHours.find(h =>
          String(h.day || h.name).toLowerCase() === day.toLowerCase()
        )
      : branch.workingHours?.[day] ||
        branch.workingHours?.[day.toLowerCase()];

    const approvedSchedule = ctx.hours?.effective(data, branch);

    if (approvedSchedule) {
      hours = approvedSchedule.workingHours?.[day.toLowerCase()];
    }

    const special = (
      approvedSchedule?.specialHours ||
      branch.specialHours ||
      []
    ).find(h => h.date === date);

    if (
      special?.status === "closed" ||
      (
        approvedSchedule?.closedDates ||
        branch.closedDates ||
        []
      ).includes(date)
    ) {
      ctx.fail("HOLIDAY_CLOSED", "This branch is closed on the selected date.");
    }

    if (special?.status === "custom") hours = special;

    if (!hours) {
      ctx.fail("OUTSIDE_HOURS", "Working hours have not been configured for this day.");
    }

    if (
      hours.isOpen === false ||
      hours.closed === true ||
      hours.isClosed === true
    ) {
      ctx.fail("OUTSIDE_HOURS", "This branch is closed at the selected time.");
    }

    const selected = serviceList(branch).find(s => s.id === input.serviceId && bookable(s));
    if (!selected) ctx.fail("INVALID_SERVICE", "Select a published service for this branch.");
    const duration = selected.durationMinutes;
    const buffer = selected.bufferMinutes;

    if (!Number.isInteger(duration) || duration < 15 || duration > 120) {
      ctx.fail("INVALID_DURATION", "The visit duration must be between 15 and 120 minutes.");
    }

    if(!Number.isInteger(buffer)||buffer<0||buffer>120) ctx.fail('INVALID_SERVICE','Configure the service buffer.');
    const visitStart = toMinutes(time);
    const visitEnd = visitStart + duration + buffer;

    const periods = Array.isArray(hours.periods) && hours.periods.length
      ? hours.periods
      : [{
          openTime: hours.openTime || hours.open,
          closeTime: hours.closeTime || hours.close
        }];

    const fitsWorkingHours = periods.some(period => {
      const opening = toMinutes(period.openTime);
      const closing = toMinutes(period.closeTime);

      return (
        Number.isFinite(opening) &&
        Number.isFinite(closing) &&
        opening < closing &&
        visitStart >= opening &&
        visitEnd <= closing
      );
    });

    if (!fitsWorkingHours) {
      ctx.fail(
        "OUTSIDE_HOURS",
        "The entire appointment must fit within branch working hours and outside break periods."
      );
    }

    if (approvedSchedule && !ctx.hours.allows(approvedSchedule, date, time, duration + buffer)) {
      ctx.fail("OUTSIDE_HOURS", "The appointment is unavailable under the approved working schedule.");
    }

    if (
      Array.isArray(branch.services) &&
      branch.services.length &&
      input.destination &&
      !branch.services.some(s =>
        (typeof s === "string" ? s : s.name) === input.destination
      )
    ) {
      ctx.fail("INVALID_SERVICE", "Select a service available at this branch.");
    }

    if(selected.closedDates?.includes(date)||selected.specialHours?.some(x=>x.date===date&&x.status==='closed')) ctx.fail('HOLIDAY_CLOSED','Service closed on this date.');
    if(selected.workingHours || selected.specialHours?.some(x=>x.date===date)) {
      const schedule=ctx.hours.normalize({...selected,workingHours:selected.workingHours||approvedSchedule?.workingHours},false);
      if(!ctx.hours.allows(schedule,date,time,duration+buffer)) ctx.fail('OUTSIDE_HOURS','Outside service operating periods.');
    }
    const start = ctx.jordanInstant(date, time);
    for(const [key,multiplier] of [['minAdvanceMinutes',60000],['maxAdvanceDays',86400000]]) {
      if(branch[key]!=null && (!Number.isFinite(branch[key])||branch[key]<0)) ctx.fail('VALIDATION_ERROR','Invalid booking limit: '+key);
      if(branch[key]!=null && (key==='minAdvanceMinutes' ? start-Date.now()<branch[key]*multiplier : start-Date.now()>branch[key]*multiplier)) ctx.fail('OUTSIDE_HOURS','Outside configured booking window.');
    }
    const end = start + (duration + buffer) * 60000;

    if (
      input.userId &&
      data.bookings.some(x =>
        !x.isDeleted &&
        x.id !== excludeId &&
        x.userId === input.userId &&
        ["pending", "confirmed", "in-progress", "waitlisted"].includes(x.status) &&
        start < ctx.jordanInstant(x.date, x.time) +
          ((Number(x.durationMinutes ?? x.serviceSnapshot?.durationMinutes)||30) + (Number(x.bufferMinutes ?? x.serviceSnapshot?.bufferMinutes)||0)) * 60000 &&
        end > ctx.jordanInstant(x.date, x.time)
      )
    ) {
      ctx.fail(
        "BOOKING_OVERLAP",
        "You have another booking at this time. Choose a different appointment."
      );
    }

    const occupied = data.bookings.filter(x => !x.isDeleted && x.id !== excludeId &&
      x.branchId === branch.id && ["pending","confirmed","in-progress"].includes(x.status) &&
      start < ctx.jordanInstant(x.date,x.time) + ((Number(x.durationMinutes)||30)+(Number(x.bufferMinutes)||0))*60000 &&
      end > ctx.jordanInstant(x.date,x.time));
    const peak = rows => Math.max(0,...[start,...rows.map(x=>Math.max(start,ctx.jordanInstant(x.date,x.time)))].map(t=>rows.filter(x=>ctx.jordanInstant(x.date,x.time)<=t && t<ctx.jordanInstant(x.date,x.time)+((Number(x.durationMinutes)||30)+(Number(x.bufferMinutes)||0))*60000).length));
    if (peak(occupied.filter(x => x.serviceId === selected.id)) >= selected.capacity)
      ctx.fail("SERVICE_CAPACITY", "This time slot is fully booked for the selected service.");
    if (branch.capacity!=null && peak(occupied)>=branch.capacity) ctx.fail('SERVICE_CAPACITY','Branch capacity is full.');
    if (ctx.needsAssistant(input) && (!Number.isInteger(branch.assistanceCapacity)||branch.assistanceCapacity<1)) ctx.fail('ASSISTANCE_CAPACITY','Assistance capacity is not configured.');
    if (ctx.needsAssistant(input) && branch.assistanceHours && !ctx.hours.allows(ctx.hours.normalize({workingHours:branch.assistanceHours},false),date,time,duration+buffer)) ctx.fail('ASSISTANCE_CAPACITY','Assistance is unavailable during this interval.');
    if (ctx.needsAssistant(input) && peak(occupied.filter(x => ctx.needsAssistant(x))) >= branch.assistanceCapacity)
      ctx.fail("ASSISTANCE_CAPACITY", "Assistance is not available for the full appointment duration.");

    let assistantResourceId = null;
    if (ctx.needsAssistant(input) && Array.isArray(branch.assistanceResources) && branch.assistanceResources.length) {
      const resources = branch.assistanceResources.filter(r => r && r.active !== false && r.id && (!r.branchIds || r.branchIds.includes(branch.id)));
      const requested = input.assistantResourceId;
      if (requested && !resources.some(r => r.id === requested)) ctx.fail('INVALID_REFERENCE', 'Assistant is not assigned to this branch.');
      const free = resources.filter(r => !requested || r.id === requested).find(r => {
        if (r.workingHours && !ctx.hours.allows(ctx.hours.normalize(r, false), date, time, duration + buffer)) return false;
        return !data.bookings.some(x => !x.isDeleted && x.id !== excludeId && (x.branchId === branch.id || (r.branchIds?.length > 1 && r.branchIds.includes(x.branchId))) && x.assistantResourceId === r.id && ['pending','confirmed','in-progress'].includes(x.status) && start < ctx.jordanInstant(x.date,x.time) + ((Number(x.durationMinutes)||30)+(Number(x.bufferMinutes)||0))*60000 && end > ctx.jordanInstant(x.date,x.time));
      });
      if (!free) ctx.fail('ASSISTANCE_CAPACITY', 'No assigned assistant is available for the full appointment.');
      assistantResourceId = free.id;
    }

    return {
      date,
      time,
      durationMinutes: duration,
      bufferMinutes: buffer,
      requiresAssistant: ctx.needsAssistant(input),
      assistantResourceId
    };
  };

  const serviceList = branch => (Array.isArray(branch.ticketServices) ? branch.ticketServices : [])
    .filter(x=>x && typeof x==='object' && x.id && (!x.branchId||x.branchId===branch.id) && (!x.organizationId||x.organizationId===branch.organizationId))
    .map(x=>({...ctx.copy(x),branchId:branch.id,organizationId:branch.organizationId,active:x.active===true&&!x.isDeleted,
      available:x.available===true,
      configured:x.branchId===branch.id&&x.organizationId===branch.organizationId&&Number.isInteger(x.durationMinutes)&&x.durationMinutes>=15&&x.durationMinutes<=120&&Number.isInteger(x.capacity)&&x.capacity>=1&&Number.isInteger(x.bufferMinutes)&&x.bufferMinutes>=0}));

  const bookable = s => s.active && s.available && s.configured && s.isPublished!==false && !['draft','disabled','inactive','archived'].includes(s.status);
  ctx.publishedBranchServices = (data, branch) => {
    const sub = ctx.subscriptionFor?.(data, branch.organizationId);
    return serviceList(branch).filter(s => s.active && s.isPublished !== false && !['draft','disabled','inactive','archived'].includes(s.status)).map(s => {
      const reason = !bookable(s) ? 'SERVICE_UNAVAILABLE' : branch.bookingEnabled === false ? 'BRANCH_BOOKING_DISABLED' : !ctx.hours.effective(data, branch) ? 'HOURS_UNAVAILABLE' : sub?.entitlements && (ctx.api.subscriptionState(sub) !== 'active' || !sub.entitlements.bookingManagement) ? 'SUBSCRIPTION_RESTRICTED' : null;
      return { ...s, bookingEligible: !reason, unbookableReason: reason };
    });
  };

  ctx.ticketServiceSelection = (data, branch, input, previous) => {
    const subscription=ctx.subscriptionFor?.(data,branch.organizationId);
    if(subscription?.entitlements&&(ctx.api.subscriptionState(subscription)!=='active'||subscription.entitlements.bookingManagement!==true))ctx.fail('SUBSCRIPTION_REQUIRED','Booking is unavailable under this institution subscription. Existing visits are preserved.');
    const id = String(input.serviceId ?? previous?.serviceId ?? '');
    if (!id) ctx.fail('INVALID_SERVICE', 'Select a published service for this branch.');
    const service = serviceList(branch).find(s =>
      s.id === id && bookable(s)
    );

    if (!service) {
      ctx.fail("INVALID_SERVICE", "Select an available service belonging to this branch.");
    }

    return {
      serviceId: service.id,
      serviceName: service.name,
      serviceSnapshot: {
        id: service.id,
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        bufferMinutes: service.bufferMinutes,
        capacity: service.capacity,
        instructions: service.instructions,
        requiredDocuments: service.requiredDocuments,
        branchId: branch.id,
        organizationId: branch.organizationId
      }
    };
  };

  ctx.getTicketServices = async (branchId, options = {}) => {
    if (ctx.cfg.mode === "api") {
      if (!ctx.cfg.ticketServicesApiEnabled) {
        ctx.fail("INTEGRATION_UNAVAILABLE", "Ticket service API is not configured.");
      }
      return ctx.request(
        "/branches/" + encodeURIComponent(branchId) +
        "/ticket-services" +
        (options.manage ? "?manage=true" : options.published ? '?published=true' : "")
      );
    }

    const data = ctx.db();
    const branch = data.branches.find(b =>
      b.id === branchId && !b.isDeleted
    );

    if (!branch) ctx.fail("NOT_FOUND", "Branch not found.");

    if (options.manage) {
      const a = ctx.requireAccount(["Organization", "Admin"]);
      if (!ctx.own(data, a, "branches", branch)) {
        ctx.fail("FORBIDDEN", "This branch belongs to another organization.");
      }
    } else if (!ctx.visibleBranch(data, branch)) {
      ctx.fail("INVALID_BRANCH", "Select a published branch.");
    }

    if (options.published && !options.manage) return { items: ctx.safe(ctx.publishedBranchServices(data, branch)) };
    return {
      items: ctx.safe(
        serviceList(branch).filter(s =>
          options.manage || (options.published ? s.active&&s.isPublished!==false&&!['draft','disabled','inactive','archived'].includes(s.status) : bookable(s))
        ).map(s=>{
          if(options.manage)return s;
          const sub=ctx.subscriptionFor?.(data,branch.organizationId);
          const reason=!bookable(s)?'SERVICE_UNAVAILABLE':branch.bookingEnabled===false?'BRANCH_BOOKING_DISABLED':!ctx.hours.effective(data,branch)?'HOURS_UNAVAILABLE':sub?.entitlements&&(ctx.api.subscriptionState(sub)!=='active'||!sub.entitlements.bookingManagement)?'SUBSCRIPTION_RESTRICTED':null;
          return {...s,bookingEligible:!reason,unbookableReason:reason};
        })
      )
    };
  };

  ctx.saveTicketServices = async (branchId, input) => {
    if (ctx.cfg.mode === "api") {
      if (!ctx.cfg.ticketServicesApiEnabled) {
        ctx.fail("INTEGRATION_UNAVAILABLE", "Ticket service API is not configured.");
      }
      return ctx.request(
        "/branches/" + encodeURIComponent(branchId) + "/ticket-services",
        { method: "PUT", body: { items: input } }
      );
    }

    const a = ctx.requireAccount(["Organization", "Admin"]);
    const data = ctx.db();
    const branch = data.branches.find(b =>
      b.id === branchId && !b.isDeleted
    );

    if (!branch || !ctx.own(data, a, "branches", branch)) {
      ctx.fail("FORBIDDEN", "Only the branch owner or admin can configure services.");
    }
    ctx.requireEntitlement?.(data,a,'serviceManagement');

    const organization=data.organizations.find(o=>o.id===branch.organizationId&&!o.isDeleted);
    if(!organization || (a.role==='Organization' && (organization.status!=='active'||organization.approvalStatus!=='approved'))) ctx.fail('ORGANIZATION_PENDING','Active approved organization required.');
    if (!Array.isArray(input) || input.length > 50) {
      ctx.fail("VALIDATION_ERROR", "Configure at most 50 services.");
    }

    const previous = serviceList(branch);
    const ids = new Set();
    const names = new Set();

    const items = input.map(x => {
      if(!x||typeof x!=="object"||Array.isArray(x)) ctx.fail("VALIDATION_ERROR","Each service must be an object.");
      const name = String(x.name || "").trim();
      const description = String(x.description || "").trim();

      if (
        name.length < 2 ||
        name.length > 120 ||
        description.length > 500 ||
        names.has(name.toLowerCase())
      ) {
        ctx.fail("VALIDATION_ERROR", "Invalid or duplicate service name.");
      }

      for (const [value, min, max] of [[x.durationMinutes,15,120],[x.capacity,1,100],[x.bufferMinutes,0,120]]) {
        if(value==null && (x.status==='draft'||x.active===false||x.available===false||x.isPublished===false)) continue;
        if(value==null) ctx.fail('VALIDATION_ERROR','Published bookable services require duration, capacity and buffer.');
        if (value === "" || typeof value === "boolean" || !Number.isInteger(Number(value)) || Number(value)<min || Number(value)>max)
          ctx.fail("VALIDATION_ERROR", "Check the service duration, capacity, and preparation buffer.");
      }
      for(const flag of ['active','available','isPublished']) if(flag in x && typeof x[flag]!=='boolean')
        ctx.fail('VALIDATION_ERROR',flag+' must be true or false.');
      if(x.branchId && x.branchId!==branch.id || x.organizationId && x.organizationId!==branch.organizationId)
        ctx.fail('INVALID_REFERENCE','Service ownership cannot be changed.');
      if(x.status && !['draft','published','archived','disabled'].includes(x.status)) ctx.fail('VALIDATION_ERROR','Unknown service status.');
      if(x.workingHours || x.specialHours || x.closedDates) ctx.hours.normalize(x,false);
      const sourceUrl=String(x.sourceUrl||'').trim();
      if(sourceUrl){let u;try{u=new URL(sourceUrl);}catch{ctx.fail('VALIDATION_ERROR','Invalid service source URL.');}if(!['https:','http:'].includes(u.protocol)||u.username||u.password)ctx.fail('VALIDATION_ERROR','Use an HTTP(S) service source.');}
      const verificationStatus=x.verificationStatus||'unknown';
      if(!['unknown','pending','official-source','institution-confirmed'].includes(verificationStatus))ctx.fail('VALIDATION_ERROR','Invalid service verification state.');
      if(x.verifiedAt&&!Number.isFinite(Date.parse(x.verifiedAt)))ctx.fail('VALIDATION_ERROR','Invalid verification date.');
      if(['official-source','institution-confirmed'].includes(verificationStatus)&&(!sourceUrl||!x.verifiedAt))ctx.fail('VALIDATION_ERROR','Verified service coverage requires a source and review date.');
      if(x.fee!=null&&(!Number.isFinite(x.fee)||x.fee<0||!sourceUrl||!['official-source','institution-confirmed'].includes(verificationStatus)))ctx.fail('VALIDATION_ERROR','Fees require a verified source and a non-negative numeric amount.');
      if(x.currency&&!/^[A-Z]{3}$/.test(x.currency))ctx.fail('VALIDATION_ERROR','Use an ISO currency code.');
      names.add(name.toLowerCase());

      const id = x.id ? String(x.id) : ctx.id("service");

      if (
        (x.id && !previous.some(s => s.id === id)) ||
        ids.has(id)
      ) {
        ctx.fail("INVALID_SERVICE", "Service IDs must be unique and belong to this branch.");
      }

      ids.add(id);

      return {
        ...(previous.find(s=>s.id===id)||{}),
        id,
        branchId: branch.id,
        organizationId: branch.organizationId,
        name,
        description,
        nameAr: String(x.nameAr || ''), nameEn: String(x.nameEn || ''),
        descriptionAr: String(x.descriptionAr || ''), descriptionEn: String(x.descriptionEn || ''),
        instructions: String(x.instructions || ''),
        sourceUrl, verificationStatus, verifiedAt:x.verifiedAt||null,
        verifiedBy:['official-source','institution-confirmed'].includes(verificationStatus)?a.accountId||a.id:null,
        fee:x.fee??null,currency:x.fee!=null?(x.currency||'JOD'):null,
        configurationSource:'wusool-administrator', configuredBy:a.accountId||a.id, configuredAt:ctx.now(),
        operationalPolicyOfficial:false,
        status: x.status || 'published', isPublished: x.isPublished ?? true,
        workingHours: x.workingHours ? ctx.copy(x.workingHours) : null,
        specialHours: ctx.copy(x.specialHours || []), closedDates: ctx.copy(x.closedDates || []),
        durationMinutes: x.durationMinutes==null?null:Number(x.durationMinutes),
        capacity: x.capacity==null?null:Number(x.capacity),
        bufferMinutes: x.bufferMinutes==null?null:Number(x.bufferMinutes),
        requiredDocuments: Array.isArray(x.requiredDocuments) ? x.requiredDocuments.map(String) : [],
        active: x.active !== false,
        available: x.available !== false
      };
    });

    branch.ticketServices = items;
    ctx.audit(data, a, "Configure services", "branches", branch.id);
    ctx.put(data);

    return { items: ctx.safe(items) };
  };

  ctx.createBooking = async function createBooking(input, key) {
    if (!key) {
      ctx.fail("IDEMPOTENCY_REQUIRED", "Booking retry key is required.");
    }

    if (ctx.cfg.mode === "api") {
      return ctx.request("/bookings", {
        method: "POST",
        body: { ...input, timeZone: "Asia/Amman" },
        headers: { "Idempotency-Key": key }
      });
    }

    const a = ctx.requireAccount(["User", "Admin"]);
    const data = ctx.db();
    const userId = ctx.isAdmin(a) ? input.userId : a.id;

    if (!data.users.some(x =>
      x.id === userId &&
      x.role === "User" &&
      !x.isDeleted &&
      x.status === "active"
    )) {
      ctx.fail("INVALID_REFERENCE", "Select an active user.");
    }

    // Same key + same request returns the original booking; same key + different request is a conflict.
    const requestHash = JSON.stringify([
      String(input.branchId || input.placeId || ""),
      String(input.serviceId || ""),
      input.date || input.visitDate || "",
      input.time || input.visitTime || "",
      ctx.needsAssistant(input),
      String(input.purpose || input.visitPurpose || "")
    ]);

    const old = data.bookings.find(x =>
      x.userId === userId &&
      x.idempotencyKey === key
    );

    if (old) {
      if (old.requestHash && old.requestHash !== requestHash) {
        ctx.fail("IDEMPOTENCY_CONFLICT", "This retry key was already used for a different booking request.");
      }
      return ctx.safe(old);
    }

    const branch = data.branches.find(x =>
      x.id === String(input.branchId || input.placeId)
    );

    if (!branch || !ctx.visibleBranch(data, branch)) {
      ctx.fail("INVALID_REFERENCE", "Select a published branch.");
    }

    if (branch.bookingEnabled === false) {
      ctx.fail("EXTERNAL_BOOKING_REQUIRED", "Online booking is disabled for this branch.");
    }

    const slot = ctx.checkBookingSlot(data, branch, {
      ...input,
      userId
    });

    const fields = Object.fromEntries(
      [
        "purpose", "visitPurpose", "destination",
        "guidanceMethod", "support", "durationMinutes"
      ]
        .filter(k => k in input)
        .map(k => [k, ctx.copy(ctx.safe(input[k]))])
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
        city: branch.city
      },
      id: ctx.id("booking"),
      reference: "WUS-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      userId,
      branchId: branch.id,
      organizationId: branch.organizationId,
      status: "pending",
      holdExpiresAt: ctx.holdExpiration(data, branch),
      journeyState: "not-started",
      journeyHistory: [],
      revision: 1,
      timeZone: "Asia/Amman",
      idempotencyKey: key,
      requestHash,
      createdAt: ctx.now(),
      updatedAt: ctx.now(),
      isDeleted: false
    };

    x.journeyHistory = [{
      id: ctx.id("history"),
      event: "booking-created",
      from: null,
      to: "not-started",
      actorId: a.id,
      actorRole: a.role,
      actorName: a.name,
      reason: "",
      at: ctx.now()
    }];

    data.bookings.push(x);

    for (const ownerId of new Set([x.userId, x.organizationId])) {
      data.notifications.push({
        id: ctx.id("notification"),
        ownerId,
        bookingId: x.id,
        kind: "visit-journey",
        title: "Booking awaiting approval",
        message: branch.name + " · " + x.date + " " + x.time,
        createdAt: ctx.now(),
        status: "unread"
      });
    }

    ctx.audit(data, a, "Create", "bookings", x.id);
    ctx.put(data);
    return ctx.safe(x);
  };

  ctx.updateBooking = async function updateBooking(entityId, input) {
    if (ctx.cfg.mode === "api") {
      return ctx.request(
        "/bookings/" + encodeURIComponent(entityId) + "/appointment",
        {
          method: "PATCH",
          body: {
            timeZone: "Asia/Amman",
            date: input.date,
            time: input.time,
            branchId: input.branchId,
            userId: input.userId,
            ...(input.requiresAssistant !== undefined
              ? { requiresAssistant: input.requiresAssistant }
              : {})
          }
        }
      );
    }

    const a = ctx.requireAccount(["Admin", "Organization", "User"]);
    const data = ctx.db();
    const old = data.bookings.find(x =>
      x.id === entityId && !x.isDeleted
    );

    if (!old) ctx.fail("NOT_FOUND", "Ticket not found.");

    if (!ctx.own(data, a, "bookings", old)) {
      ctx.fail("FORBIDDEN", "This ticket belongs to another organization.");
    }
    ctx.requireEntitlement?.(data,a,'bookingManagement');

    if (
      input.expectedRevision != null &&
      (old.revision || 0) !== input.expectedRevision
    ) {
      ctx.fail("STALE_BOOKING", "The booking changed. Refresh before rescheduling.");
    }

    if (a.role === "User" && old.status !== "pending") {
      ctx.fail("BOOKING_LOCKED", "Only pending tickets may be edited by the user.");
    }

    if (
      !ctx.isAdmin(a) &&
      !["pending", "confirmed"].includes(old.status)
    ) {
      ctx.fail("INVALID_TRANSITION", "This ticket cannot be rescheduled.");
    }

    const branchId =
      ctx.isAdmin(a) && input.branchId
        ? input.branchId
        : old.branchId;

    const branch = data.branches.find(x =>
      x.id === branchId && !x.isDeleted
    );

    if (ctx.isAdmin(a) && !ctx.visibleBranch(data, branch || {})) {
      ctx.fail("INVALID_REFERENCE", "Select a published branch.");
    }

    if (!branch) {
      ctx.fail("INVALID_REFERENCE", "The booked branch is unavailable.");
    }

    const candidate = {
      ...old,
      branchId: branch.id,
      organizationId: branch.organizationId,
      date: input.date || old.date,
      time: input.time || old.time
    };

    Object.assign(
      candidate,
      ctx.ticketServiceSelection(data, branch, input, old)
    );

    if (branch.id !== old.branchId && input.serviceId === undefined) {
      Object.assign(candidate, {
        serviceId: null,
        serviceName: "",
        serviceSnapshot: null
      });
    }

    if (ctx.isAdmin(a) && input.userId) {
      if (!data.users.some(u =>
        u.id === input.userId &&
        u.role === "User" &&
        !u.isDeleted &&
        u.status === "active"
      )) {
        ctx.fail("INVALID_REFERENCE", "Select an active user.");
      }
      candidate.userId = input.userId;
    }

    if (
      (ctx.isAdmin(a) || a.role === "User") &&
      input.requiresAssistant !== undefined
    ) {
      candidate.requiresAssistant = Boolean(input.requiresAssistant);
      candidate.support = candidate.requiresAssistant
        ? ["Staff assistance"]
        : [];
    }

    if (a.role !== "User" && !String(input.reason || "").trim()) {
      ctx.fail("REASON_REQUIRED", "Explain the appointment change.");
    }

    const slot = ctx.checkBookingSlot(
      data,
      branch,
      {
        ...candidate,
        durationMinutes: input.durationMinutes || candidate.durationMinutes
      },
      old.id
    );

    delete old.scheduleConflict;
    delete old.scheduleConflictAt;
    delete candidate.scheduleConflict;
    delete candidate.scheduleConflictAt;

    Object.assign(old, candidate, slot, {
      status: "pending",
      holdExpiresAt: ctx.holdExpiration(data, branch),
      journeyState: "not-started",
      updatedAt: ctx.now(),
      revision: (old.revision || 0) + 1,
      journeyHistory: [
        ...(old.journeyHistory || []),
        {
          id: ctx.id("history"),
          event: "reschedule",
          from: old.journeyState || "not-started",
          to: "not-started",
          actorId: a.id,
          actorRole: a.role,
          actorName: a.name,
          reason: input.reason || "",
          at: ctx.now()
        }
      ]
    });

    for (const key of [
      "departedAt", "arrivedAt", "receivedAt", "completedAt"
    ]) {
      delete old[key];
    }

    ctx.audit(data, a, "Reschedule", "bookings", old.id);

    data.notifications.push({
      id: ctx.id("notification"),
      ownerId: old.userId,
      title: "Ticket rescheduled",
      message: old.date + " " + old.time + " · " + (input.reason || ""),
      status: "unread",
      createdAt: ctx.now()
    });

    ctx.put(data);
    return ctx.safe(old);
  };

  ctx.deleteBooking = async function deleteBooking(entityId) {
    if (ctx.cfg.mode === "api") {
      return ctx.request(
        "/bookings/" + encodeURIComponent(entityId),
        { method: "DELETE" }
      );
    }

    const a = ctx.requireAccount(["Admin"]);
    const data = ctx.db();
    const x = data.bookings.find(x =>
      x.id === entityId && !x.isDeleted
    );

    if (!x) ctx.fail("NOT_FOUND", "Ticket not found.");

    if (x.interviewId) {
      ctx.fail(
        "INTERVIEW_MANAGED",
        "Retain interview visits for audit; cancel the interview through Recruitment."
      );
    }

    x.isDeleted = true;
    x.status = "cancelled";
    x.updatedAt = ctx.now();

    ctx.audit(data, a, "Delete", "bookings", x.id);
    ctx.put(data);
    return ctx.safe(x);
  };

  ctx.bookingStatus = async function bookingStatus(
    entityId,
    status,
    reason = "",
    expectedRevision
  ) {
    status = String(status).toLowerCase().replace(" ", "-");

    if (ctx.cfg.mode === "api") {
      return ctx.request(
        `/bookings/${encodeURIComponent(entityId)}/status`,
        {
          method: "PATCH",
          body: {
            status,
            reason,
            expectedRevision,
            timeZone: "Asia/Amman"
          }
        }
      );
    }

    if (
      ["confirmed", "in-progress", "completed", "cancelled", "no-show"]
        .includes(status)
    ) {
      return ctx.api.journey.change(
        entityId,
        {
          confirmed: "approve",
          "in-progress": "receive",
          completed: "finish",
          cancelled: "cancel",
          "no-show": "no-show"
        }[status],
        { reason, expectedRevision }
      );
    }

    const a = ctx.requireAccount();
    const data = ctx.db();
    const x = data.bookings.find(b =>
      !b.isDeleted &&
      String(b.id) === String(entityId)
    );

    if (!x) ctx.fail("NOT_FOUND", "Booking not found.");

    if (!ctx.own(data, a, "bookings", x)) {
      ctx.fail("FORBIDDEN", "Booking belongs to another account.");
    }
    ctx.requireEntitlement?.(data,a,'bookingManagement');

    if (a.role === "User" && status !== "cancelled") {
      ctx.fail("FORBIDDEN", "Only the organization may approve/update progress.");
    }

    const allowed = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["in-progress", "cancelled"],
      "in-progress": ["completed", "cancelled"],
      completed: [],
      cancelled: []
    };

    if (
      status !== x.status &&
      !ctx.isAdmin(a) &&
      !allowed[x.status]?.includes(status)
    ) {
      ctx.fail(
        "INVALID_TRANSITION",
        "This booking status change is unavailable."
      );
    }

    if (!Object.keys(allowed).includes(status)) {
      ctx.fail("INVALID_STATUS", "Unknown booking status.");
    }

    if (
      status === "cancelled" &&
      a.role === "Organization" &&
      !String(reason).trim()
    ) {
      ctx.fail("REASON_REQUIRED", "Please enter the cancellation reason.");
    }

    if (status === "confirmed" && x.status === "pending") {
      const branch = data.branches.find(b =>
        b.id === x.branchId && !b.isDeleted
      );
      if (!branch) ctx.fail("INVALID_REFERENCE", "Branch unavailable.");
      ctx.checkBookingSlot(data, branch, x, x.id);
    }

    if (status === "cancelled") {
      x.cancellationReason = String(reason || "Cancelled by user")
        .trim()
        .slice(0, 1000);
      x.cancelledAt = ctx.now();
    }

    x.status = status;
    x.updatedAt = ctx.now();

    ctx.audit(data, a, "Status", "bookings", x.id, reason);

    data.notifications.push({
      id: ctx.id("notification"),
      ownerId: x.userId,
      title:
        status === "confirmed"
          ? "Ticket approved"
          : status === "cancelled"
            ? "Ticket cancelled"
            : "Ticket updated",
      message:
        status === "cancelled"
          ? x.cancellationReason
          : x.date + " " + x.time,
      status: "unread",
      createdAt: ctx.now()
    });

    ctx.put(data);
    return ctx.safe(x);
  };
});
