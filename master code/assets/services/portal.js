
"use strict";

// Consumer projections and user-scoped preferences.
// Original database records and entity IDs are preserved.

window.WusoolServiceModules.push(function registerConsumerPortal(ctx) {

  const featureKeys = [
    "serviceManagement",
    "bookingManagement",
    "queueManagement",
    "accessibilityEvidence",
    "reporting",
    "auditHistory"
  ];

  function subscriptionState(s) {
    if (!s || s.isDeleted) return "missing";

    const status = String(s.status || "").toLowerCase();

    if (status !== "active") return status;

    if (
      (s.startDate && !Number.isFinite(Date.parse(s.startDate))) ||
      ((s.endDate || s.renewalDate) &&
        !Number.isFinite(Date.parse(s.endDate || s.renewalDate))) ||
      (s.origin === "admin-grant" && !s.nonExpiring && !s.endDate)
    ) {
      return "invalid";
    }

    if (s.startDate && Date.parse(s.startDate) > Date.now()) {
      return "scheduled";
    }

    const end = s.endDate || s.renewalDate;

    if (end && Date.parse(end) <= Date.now()) {
      return "expired";
    }

    return "active";
  }

  ctx.subscriptionFor = (data, id) => {
    const rows = data.subscriptions.filter(
      s => s.organizationId === id && !s.isDeleted
    );

    return (
      rows
        .filter(s => s.origin === "admin-grant")
        .sort((a, b) =>
          String(b.updatedAt).localeCompare(String(a.updatedAt))
        )[0] ||
      rows.find(s => subscriptionState(s) === "active") ||
      rows[0] ||
      null
    );
  };

  ctx.requireEntitlement = (data, actor, feature) => {
    if (actor?.role !== "Organization") return;

    if (
      feature &&
      actor.permissions &&
      actor.permissions[feature] !== true
    ) {
      ctx.fail(
        "FORBIDDEN",
        "Your representative permission does not include " +
          feature +
          ". Contact the organization owner."
      );
    }

    const subscription = ctx.subscriptionFor(data, actor.id);

    if (!subscription?.entitlements) return;

    if (subscriptionState(subscription) !== "active") {
      ctx.fail(
        "SUBSCRIPTION_REQUIRED",
        "Subscription " +
          subscriptionState(subscription) +
          ". Open Subscription Management or contact Admin; your login and history are preserved."
      );
    }

    if (
      feature &&
      subscription.entitlements[feature] !== true
    ) {
      ctx.fail(
        "ENTITLEMENT_REQUIRED",
        "This subscription does not include " +
          feature +
          ". Contact Admin."
      );
    }

    return subscription;
  };

  ctx.api.getOrganizationAccess = async () => {
    const actor = await ctx.api.getCurrentAccount();

    if (actor?.role !== "Organization") {
      ctx.fail("FORBIDDEN", "Organization account required.");
    }

    if (ctx.cfg.mode === "api") {
      return ctx.request("/organizations/me/access");
    }

    const data = ctx.db();

    if (
      !data.memberships.some(
        m =>
          m.accountId === (actor.accountId || actor.id) &&
          m.organizationId === actor.id &&
          !m.isDeleted &&
          m.active !== false
      )
    ) {
      return {
        state: "representative-required",
        message:
          "No authorized representative has been assigned. Ask Admin to assign your representative account."
      };
    }

    if (actor.approvalStatus !== "approved") {
      return {
        state:
          actor.approvalStatus === "pending"
            ? "pending"
            : "approval-required",
        message: "Organization approval required."
      };
    }

    const subscription = ctx.subscriptionFor(data, actor.id);
    const state = subscriptionState(subscription);

    return {
      state: state === "active" ? "ready" : "subscription-required",
      reason: state,
      subscription: ctx.safe(subscription),
      message: "Subscription management"
    };
  };

  ctx.api.grantEnterprise = async ({
    organizationId,
    reason,
    entitlements,
    startDate,
    endDate,
    nonExpiring = false
  }) => {
    if (ctx.cfg.mode === "api") {
      return ctx.request(
        "/organizations/" +
          encodeURIComponent(organizationId) +
          "/enterprise-grant",
        {
          method: "POST",
          body: {
            reason,
            entitlements,
            startDate,
            endDate,
            nonExpiring
          }
        }
      );
    }

    const actor = ctx.requireAccount(["Admin"]);
    const data = ctx.db();

    const org = data.organizations.find(
      x => x.id === organizationId && !x.isDeleted
    );

    if (!org) {
      ctx.fail("INVALID_REFERENCE", "Select an existing organization.");
    }

    if (!String(reason || "").trim()) {
      ctx.fail("VALIDATION_ERROR", "Grant reason is required.");
    }

    if (typeof nonExpiring !== "boolean") {
      ctx.fail("VALIDATION_ERROR", "Select an expiry policy.");
    }

    const start = startDate || ctx.now();
    const end = nonExpiring ? null : endDate;

    if (
      !Number.isFinite(Date.parse(start)) ||
      (!nonExpiring &&
        (!Number.isFinite(Date.parse(end)) ||
          Date.parse(end) <= Date.parse(start)))
    ) {
      ctx.fail(
        "VALIDATION_ERROR",
        "Provide valid start/end dates or an explicit non-expiring grant."
      );
    }

    const snapshot = {};

    for (const key of [
      "branches",
      "organizationUsers",
      "aiAnalysesPerMonth"
    ]) {
      const value = entitlements?.[key];

      if (
        !Number.isSafeInteger(value) ||
        value < (key === "aiAnalysesPerMonth" ? 0 : 1)
      ) {
        ctx.fail(
          "VALIDATION_ERROR",
          "Configure an explicit integer entitlement: " + key
        );
      }

      snapshot[key] = value;
    }

    if (snapshot.branches < data.branches.filter(b => b.organizationId === organizationId && !b.isDeleted).length) {
      ctx.fail('CAPACITY_BELOW_USAGE', 'Grant capacity must cover existing branch usage.');
    }

    for (const key of featureKeys) {
      if (typeof entitlements?.[key] !== "boolean") {
        ctx.fail(
          "VALIDATION_ERROR",
          "Configure entitlement: " + key
        );
      }

      snapshot[key] = entitlements[key];
    }

    const usage = data.branches.filter(
      b => b.organizationId === organizationId && !b.isDeleted
    ).length;

    if (snapshot.branches < usage) {
      ctx.fail(
        "ENTITLEMENT_IN_USE",
        "Branch entitlement cannot be below existing usage."
      );
    }

    const members = data.memberships.filter(
      m =>
        m.organizationId === organizationId &&
        !m.isDeleted &&
        m.active !== false
    ).length;

    if (snapshot.organizationUsers < members) {
      ctx.fail(
        "ENTITLEMENT_IN_USE",
        "User entitlement cannot be below existing membership usage."
      );
    }

    const previous =
      data.subscriptions.find(
        s =>
          s.organizationId === organizationId &&
          s.origin === "admin-grant" &&
          !s.isDeleted
      ) || ctx.subscriptionFor(data, organizationId);

    const record = {
      id: previous?.id || ctx.id("subscription"),
      organizationId,
      plan: "Enterprise",
      planName: "Enterprise",
      origin: "admin-grant",
      paymentStatus: "not-required",
      price: 0,
      billingCycle: "admin-grant",
      status: "Active",
      branchLimit: snapshot.branches,
      entitlements: snapshot,
      startDate: start,
      endDate: end,
      nonExpiring,
      grantedBy: actor.id,
      grantReason: String(reason).trim(),
      createdAt: previous?.createdAt || ctx.now(),
      updatedAt: ctx.now(),
      revision: (previous?.revision || 0) + 1,
      grantHistory: [
        ...(previous?.grantHistory || []),
        {
          actorId: actor.id,
          at: ctx.now(),
          reason,
          entitlements: snapshot,
          startDate: start,
          endDate: end,
          nonExpiring
        }
      ],
      isDeleted: false
    };

    if (previous) {
      if (previous.origin !== "admin-grant") {
        record.priorSubscription = ctx.copy(previous);
      }

      Object.assign(previous, record);
      delete previous.developmentOnly;
    } else {
      data.subscriptions.push(record);
    }

    ctx.audit(
      data,
      actor,
      "Grant Enterprise subscription",
      "subscriptions",
      record.id,
      record.grantReason
    );

    ctx.put(data);

    return ctx.safe(record);
  };

  ctx.api.subscriptionState = subscriptionState;

  ctx.api.assignOrganizationRepresentative = async ({
    organizationId,
    accountId,
    branchIds = null,
    permissions,
    reason,
    primary = false
  }) => {
    if (ctx.cfg.mode === "api") {
      return ctx.request(
        "/organizations/" +
          encodeURIComponent(organizationId) +
          "/representatives",
        {
          method: "POST",
          body: {
            accountId,
            branchIds,
            permissions,
            reason,
            primary
          }
        }
      );
    }

    const actor = ctx.requireAccount(["Admin"]);
    const data = ctx.db();

    const org = data.organizations.find(
      o => o.id === organizationId && !o.isDeleted
    );

    const user = data.users.find(
      u =>
        u.id === accountId &&
        !u.isDeleted &&
        u.role !== "Admin"
    );

    if (!org || !user) {
      ctx.fail(
        "INVALID_REFERENCE",
        "Select an existing institution and a project user account."
      );
    }

    if (
      !String(reason || "").trim() ||
      typeof primary !== "boolean"
    ) {
      ctx.fail(
        "VALIDATION_ERROR",
        "Assignment reason and primary-account choice are required."
      );
    }

    if (
      branchIds !== null &&
      (
        !Array.isArray(branchIds) ||
        new Set(branchIds).size !== branchIds.length ||
        branchIds.some(
          id =>
            !data.branches.some(
              b =>
                b.id === id &&
                b.organizationId === organizationId &&
                !b.isDeleted
            )
        )
      )
    ) {
      ctx.fail(
        "INVALID_REFERENCE",
        "Select only branches belonging to this institution."
      );
    }

    const flags = {};

    for (const key of featureKeys) {
      if (typeof permissions?.[key] !== "boolean") {
        ctx.fail(
          "VALIDATION_ERROR",
          "Configure permission: " + key
        );
      }

      flags[key] = permissions[key];
    }

    if (
      data.memberships.some(
        m =>
          m.accountId === accountId &&
          m.organizationId !== organizationId &&
          !m.isDeleted &&
          m.active !== false
      )
    ) {
      ctx.fail(
        "ORGANIZATION_SELECTION_REQUIRED",
        "This account already represents another institution. Use a distinct representative account."
      );
    }

    const old = data.memberships.find(
      m =>
        m.organizationId === organizationId &&
        m.accountId === accountId
    );

    const subscription = ctx.subscriptionFor(data, organizationId);

    if (
      !old &&
      subscription?.entitlements &&
      data.memberships.filter(
        m =>
          m.organizationId === organizationId &&
          !m.isDeleted &&
          m.active !== false
      ).length >= subscription.entitlements.organizationUsers
    ) {
      ctx.fail(
        "USER_LIMIT",
        "Enterprise representative entitlement reached."
      );
    }

    const row = {
      id: old?.id || ctx.id("membership"),
      organizationId,
      accountId,
      role: primary ? "owner" : "manager",
      branchIds,
      permissions: flags,
      active: true,
      isDeleted: false,
      authorizedBy: actor.id,
      updatedAt: ctx.now()
    };

    if (old) {
      Object.assign(old, row);
    } else {
      data.memberships.push(row);
    }

    if (primary) {
      org.representativeAccountId = accountId;

      for (const oldOwner of data.memberships.filter(
        m =>
          m.organizationId === organizationId &&
          m.accountId === organizationId
      )) {
        oldOwner.active = false;
      }

      data.revocations[organizationId] =
        (data.revocations[organizationId] || 0) + 1;
    }

    org.adoption ||= {
      authorizedBy: actor.id,
      at: ctx.now(),
      reason,
      source: "admin-authorized-representative"
    };

    data.revocations[accountId] =
      (data.revocations[accountId] || 0) + 1;

    ctx.audit(
      data,
      actor,
      "Assign institution representative",
      "memberships",
      row.id,
      reason
    );

    ctx.put(data);
    return ctx.safe(row);
  };

  ctx.api.adoptOrganization = async ({ id, email, reason }) => {
    if (ctx.cfg.mode === "api") {
      return ctx.request(
        "/organizations/" + encodeURIComponent(id) + "/adopt",
        {
          method: "POST",
          body: { email, reason }
        }
      );
    }

    const actor = ctx.requireAccount(["Admin"]);

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "") ||
      !String(reason || "").trim()
    ) {
      ctx.fail(
        "VALIDATION_ERROR",
        "Provide the authorized representative email and adoption reason."
      );
    }

    const data = ctx.db();

    const org = data.organizations.find(
      x => x.id === id && !x.isDeleted
    );

    if (!org) {
      ctx.fail("NOT_FOUND", "Institution unavailable.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = data.users.find(
      x => !x.isDeleted && x.email === normalizedEmail
    );

    if (existingUser) {
      if (existingUser.role === "Admin") {
        ctx.fail(
          "ADMIN_PROTECTED",
          "An administrator cannot be assigned as an organization representative."
        );
      }

      await ctx.api.assignOrganizationRepresentative({
        organizationId: id,
        accountId: existingUser.id,
        permissions: Object.fromEntries(
          featureKeys.map(key => [key, true])
        ),
        reason,
        primary: true
      });

      return ctx.api.resetAccountAccess("organizations", id);
    }

    if (
      data.organizations.some(
        x =>
          !x.isDeleted &&
          x.id !== id &&
          x.email === normalizedEmail
      )
    ) {
      ctx.fail(
        "EMAIL_EXISTS",
        "Email already belongs to an organization account."
      );
    }

    if (
      !org.publicContactEmail &&
      org.email &&
      (org.imported || org.directoryOnly)
    ) {
      org.publicContactEmail = org.email;
    }

    org.email = normalizedEmail;
    org.role = "Organization";
    org.representativeAccountId = id;

    org.adoption = {
      authorizedBy: actor.id,
      at: ctx.now(),
      reason: String(reason).trim(),
      source: "admin-authorized-representative"
    };

    const owner = data.memberships.find(
      m =>
        m.organizationId === id &&
        m.accountId === id
    );

    const subscription = ctx.subscriptionFor(data, id);

    if (
      (!owner || owner.active === false || owner.isDeleted) &&
      subscription?.entitlements &&
      data.memberships.filter(
        m =>
          m.organizationId === id &&
          !m.isDeleted &&
          m.active !== false
      ).length >= subscription.entitlements.organizationUsers
    ) {
      ctx.fail(
        "USER_LIMIT",
        "Representative entitlement reached."
      );
    }

    if (owner) {
      Object.assign(owner, {
        active: true,
        isDeleted: false,
        authorizedBy: actor.id
      });
    } else {
      data.memberships.push({
        id: ctx.id("membership"),
        organizationId: id,
        accountId: id,
        role: "owner",
        active: true,
        authorizedBy: actor.id
      });
    }

    ctx.audit(
      data,
      actor,
      "Authorize imported institution representative",
      "organizations",
      id,
      reason
    );

    ctx.put(data);

    return ctx.api.resetAccountAccess("organizations", id);
  };

  // --------------------------------------------------
  // Public organization projection
  // --------------------------------------------------

  const keyOf = (kind, id) => kind + ":" + String(id);

  async function publicOrganizations() {
    if (ctx.cfg.mode === "api") {
      return ctx.request("/public/organizations");
    }

    return {
      items: ctx.db().organizations
        .filter(
          org =>
            !org.isDeleted &&
            org.status === "active" &&
            org.approvalStatus === "approved"
        )
        .map(org => ({
          id: org.id,

          // Original fields are preserved.
          name: org.name,
          description:
            org.publicDescription ||
            org.description ||
            "",

          // Optional English translations for the User Portal.
          nameEn:
            org.nameEn ||
            org.translations?.en?.name ||
            "",

          descriptionEn:
            org.publicDescriptionEn ||
            org.descriptionEn ||
            org.translations?.en?.publicDescription ||
            org.translations?.en?.description ||
            "",

          type:
            org.type ||
            org.organizationType ||
            "",

          logo: org.logo || "",
          sourceUrl: org.sourceUrl || "",

          directoryOnly:
            !!org.directoryOnly &&
            !org.adoption
        }))
    };
  }

  // --------------------------------------------------
  // Consumer catalog
  // --------------------------------------------------

  async function catalog() {
    const places = await ctx.api.places();

    const organizations = new Map();
    const services = new Map();

    for (const org of (await publicOrganizations()).items) {
      organizationsMapAdd(org);
    }

    function organizationsMapAdd(org) {
      organizations.set(org.id, {
        ...org,
        category: org.type,
        image: "",
        branches: [],
        serviceKeys: [],
        rating: null,
        reviewCount: 0
      });
    }

    const rows = new Array(places.items.length);
    let next = 0;

    await Promise.all(
      Array.from(
        { length: Math.min(6, places.items.length) },
        async () => {
          while (next < places.items.length) {
            const index = next++;
            const place = places.items[index];

            try {
              rows[index] = {
                place,
                services: (
                  await ctx.api.getTicketServices(
                    place.id,
                    { published: true }
                  )
                ).items,
                servicesAvailable: true
              };
            } catch (error) {
              rows[index] = {
                place,
                services: [],
                servicesAvailable: false,
                errorCode: error.code || "UNAVAILABLE"
              };
            }
          }
        }
      )
    );

    for (const row of rows) {
      const place = row.place;

      const organizationId =
        place.organizationId ||
        place.organizationProfile?.id;

      if (!organizationId) continue;

      let organization = organizations.get(organizationId);

      if (!organization) {
        const profile = place.organizationProfile || {};

        organization = {
          id: organizationId,

          name:
            place.organizationName ||
            profile.name,

          description:
            profile.description || "",

          category:
            place.category ||
            profile.type ||
            "",

          logo: profile.logo || "",

          image:
            (place.photos || [])
              .map(photo =>
                typeof photo === "string"
                  ? photo
                  : photo.imageData ||
                    photo.url ||
                    photo.src
              )
              .find(
                image =>
                  image &&
                  !String(image).includes(
                    "wusool-login-campus"
                  )
              ) || "",

          branches: [],
          serviceKeys: [],
          rating: null,
          reviewCount: 0
        };

        organizations.set(organizationId, organization);
      }

      const branch = {
        ...place,
        servicesAvailable: row.servicesAvailable,
        services: []
      };

      organization.branches.push(branch);

      if (
        place.reviewCount > 0 &&
        Number.isFinite(Number(place.rating))
      ) {
        organization.rating =
          (organization.rating || 0) +
          Number(place.rating) *
          Number(place.reviewCount);

        organization.reviewCount +=
          Number(place.reviewCount);
      }

      for (const item of row.services) {
        if (
          item.active === false ||
          !item.id ||
          item.organizationId !== organizationId ||
          item.branchId !== place.id
        ) {
          continue;
        }

        const serviceKey =
          organizationId + ":" + item.id;

        let service = services.get(serviceKey);

        if (!service) {
          service = {
            ...item,
            key: serviceKey,
            organizationName: organization.name,
            category:
              item.category ||
              organization.category ||
              "",
            branchIds: []
          };

          services.set(serviceKey, service);
          organization.serviceKeys.push(serviceKey);
        }

        service.branchIds.push(place.id);

        branch.services.push({
          ...item,
          key: serviceKey
        });
      }
    }

    for (const org of organizations.values()) {
      if (org.reviewCount) {
        org.rating /= org.reviewCount;
      }
    }

    return {
      organizations: [...organizations.values()],
      services: [...services.values()],
      branches:
        [...organizations.values()]
          .flatMap(org => org.branches)
    };
  }

  // --------------------------------------------------
  // Personal portal authorization
  // --------------------------------------------------

  function personalData() {
    const actor = ctx.requireAccount(["User"]);
    const db = ctx.db();

    const user = db.users.find(
      x => x.id === actor.id
    );

    if (!user) {
      ctx.fail("FORBIDDEN", "Account unavailable.");
    }

    return { actor, db, user };
  }

  async function authorize() {
    if (ctx.cfg.mode !== "api") {
      return ctx.requireAccount(["User"]);
    }

    const actor = await ctx.getCurrentAccount();

    if (!actor) {
      ctx.fail(
        "UNAUTHENTICATED",
        "Sign in to continue."
      );
    }

    if (actor.role !== "User") {
      ctx.fail(
        "FORBIDDEN",
        "Citizen account required."
      );
    }

    if (actor.requiresInitialSetup) {
      ctx.fail(
        "CREDENTIAL_CHANGE_REQUIRED",
        "Complete account setup."
      );
    }

    return actor;
  }

  function remote(path, method = "GET", body) {
    if (!ctx.cfg.portalApiEnabled) {
      ctx.fail(
        "INTEGRATION_UNAVAILABLE",
        "Personal portal API is not configured."
      );
    }

    return ctx.request(
      "/users/me/portal" + path,
      { method, body }
    );
  }

  async function state() {
    if (ctx.cfg.mode === "api") {
      await authorize();
      return remote("");
    }

    const { user } = personalData();

    return ctx.copy({
      favorites:
        user.portalPreferences?.favorites || [],
      recent:
        user.portalPreferences?.recent || [],
      savedPlaces:
        user.savedPlaces || []
    });
  }

  // --------------------------------------------------
  // Favorites
  // --------------------------------------------------

  async function setFavorite(kind, id, saved) {
    await authorize();

    if (
      !["organization", "service", "branch"].includes(kind)
    ) {
      ctx.fail(
        "INVALID_INPUT",
        "Unknown favorite type."
      );
    }

    if (ctx.cfg.mode === "api") {
      if (kind !== "branch") {
        return remote(
          "/favorites/" +
            kind +
            "/" +
            encodeURIComponent(id),
          saved ? "PUT" : "DELETE"
        );
      }

      const result =
        await ctx.api.setSavedPlace(id, saved);

      if (ctx.cfg.portalApiEnabled) {
        return state();
      }

      const account =
        Array.isArray(result?.savedPlaces)
          ? result
          : await ctx.getCurrentAccount();

      if (!Array.isArray(account?.savedPlaces)) {
        ctx.fail(
          "INVALID_RESPONSE",
          "Saved places confirmation is unavailable."
        );
      }

      return {
        favorites: [],
        recent: [],
        savedPlaces: account.savedPlaces,
        personalAvailable: false
      };
    }

    if (kind === "branch") {
      await ctx.api.setSavedPlace(id, saved);
      return state();
    }

    const catalogData = await catalog();

    const valid =
      kind === "organization"
        ? catalogData.organizations.some(
            org => org.id === id
          )
        : catalogData.services.some(
            service => service.key === id
          );

    if (saved && !valid) {
      ctx.fail(
        "INVALID_REFERENCE",
        "Published item required."
      );
    }

    const { db, user } = personalData();

    user.portalPreferences ||= {};

    const old =
      user.portalPreferences.favorites || [];

    user.portalPreferences.favorites = saved
      ? [
          ...old.filter(
            item =>
              keyOf(item.kind, item.id) !==
              keyOf(kind, id)
          ),
          { kind, id }
        ]
      : old.filter(
          item =>
            keyOf(item.kind, item.id) !==
            keyOf(kind, id)
        );

    ctx.put(db);

    return state();
  }

  // --------------------------------------------------
  // Recently viewed
  // --------------------------------------------------

  async function recordView(kind, id) {
    await authorize();

    if (!["organization", "service"].includes(kind)) {
      ctx.fail(
        "INVALID_INPUT",
        "Unknown recent item type."
      );
    }

    if (ctx.cfg.mode === "api") {
      return remote("/recent", "POST", { kind, id });
    }

    const catalogData = await catalog();

    const valid =
      kind === "organization"
        ? catalogData.organizations.some(
            org => org.id === id
          )
        : catalogData.services.some(
            service => service.key === id
          );

    if (!valid) {
      ctx.fail(
        "INVALID_REFERENCE",
        "Published item required."
      );
    }

    const { db, user } = personalData();

    user.portalPreferences ||= {};

    user.portalPreferences.recent = [
      {
        kind,
        id,
        at: ctx.now()
      },
      ...(user.portalPreferences.recent || [])
        .filter(
          item =>
            keyOf(item.kind, item.id) !==
            keyOf(kind, id)
        )
    ].slice(0, 20);

    ctx.put(db);

    return state();
  }

  // --------------------------------------------------
  // Booking availability
  // --------------------------------------------------

  async function slots({
    branchId,
    date,
    serviceId,
    requiresAssistant = false
  }) {
    const actor = await authorize();

    if (ctx.cfg.mode === "api") {
      if (!ctx.cfg.portalApiEnabled) {
        ctx.fail(
          "INTEGRATION_UNAVAILABLE",
          "Appointment availability API is not configured."
        );
      }

      return ctx.request(
        "/branches/" +
          encodeURIComponent(branchId) +
          "/booking-availability?" +
          new URLSearchParams({
            date,
            serviceId: serviceId || "",
            requiresAssistant:
              String(requiresAssistant)
          })
      );
    }

    const result =
      await ctx.api.getBookingAvailability(
        branchId,
        date,
        serviceId,
        { requiresAssistant }
      );

    return {
      ...result,
      items: result.slots.map(time => ({ time })),
      known: result.known !== false
    };
  }

  // --------------------------------------------------
  // Serialized updates
  // --------------------------------------------------

  let transaction = Promise.resolve();

  const queued = fn => (...args) => {
    const task = () =>
      window.navigator?.locks?.request
        ? window.navigator.locks.request(
            "wusool-personal-portal",
            () => fn(...args)
          )
        : fn(...args);

    const result =
      transaction.then(task, task);

    transaction = result.catch(() => {});

    return result;
  };

  // --------------------------------------------------
  // Public portal API
  // --------------------------------------------------

  ctx.api.portal = Object.freeze({
    catalog,
    organizations: publicOrganizations,
    state,
    setFavorite: queued(setFavorite),
    recordView: queued(recordView),
    slots
  });

});
