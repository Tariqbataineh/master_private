WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  await (async () => {
    document.documentElement.style.visibility = "hidden";
    const readStoredObject = async (storage, key) => {
      try {
        const storedValue = await WusoolServices.rawRead(key);
        return storedValue ? JSON.parse(storedValue) : null;
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        console.error(`Unable to read ${key}:`, error);
        return null;
      }
    };
    const redirectTo = page => {
      window.location.replace(page);
    };
    const getOrganizationSession = async () => {
      return await readStoredObject(sessionStorage, "wusoolOrganization");
    };
    const getActiveSubscription = async organization => {
      return organization?.subscription || (await readStoredObject(localStorage, "wusoolActiveSubscription"));
    };
    const getApprovalStatus = async organization => {
      return (organization?.approvalStatus || (await WusoolServices.rawRead("wusoolOrganizationStatus")) || "pending").toLowerCase();
    };
    const getSubscriptionStatus = async organization => {
      return (organization?.subscriptionStatus || (await WusoolServices.rawRead("wusoolSubscriptionStatus")) || "inactive").toLowerCase();
    };
    const subscriptionIsExpired = subscription => {
      if (!subscription?.renewalDate) {
        return false;
      }
      const renewalDate = new Date(subscription.renewalDate);
      const currentDate = new Date();
      return renewalDate < currentDate;
    };
    const redirectInactiveSubscription = async () => {
      const registrationStep = ((await WusoolServices.rawRead("wusoolRegistrationStep")) || "approved").toLowerCase();
      const selectedPlan = await readStoredObject(localStorage, "wusoolSelectedPlan");
      if (registrationStep === "payment-failed") {
        redirectTo("./payment-failed.html");
        return;
      }
      if (registrationStep === "checkout" && selectedPlan) {
        redirectTo("./subscription-checkout.html");
        return;
      }
      redirectTo("./organization-approved.html");
    };
    const protectDashboard = async () => {
      const organization = await getOrganizationSession();
      const loggedIn = (await WusoolServices.rawRead("wusoolOrganizationLoggedIn")) === "true";

      /*
          The organization must log in first.
      */
      if (!organization || !loggedIn) {
        redirectTo("./organization-login.html");
        return false;
      }
      const approvalStatus = await getApprovalStatus(organization);

      /*
          The organization is still waiting
          for administrator approval.
      */
      if (approvalStatus === "pending") {
        redirectTo("./registration-pending.html");
        return false;
      }

      /*
          Any status other than approved
          cannot access the dashboard.
      */
      if (approvalStatus !== "approved") {
        redirectTo("./organization-login.html");
        return false;
      }
      const subscriptionStatus = await getSubscriptionStatus(organization);

      /*
          Approved organization without
          an active subscription.
      */
      if (subscriptionStatus !== "active") {
        await redirectInactiveSubscription();
        return false;
      }
      const activeSubscription = await getActiveSubscription(organization);

      /*
          Check whether the subscription
          renewal date has passed.
      */
      if (subscriptionIsExpired(activeSubscription)) {
        await WusoolServices.rawWrite("wusoolSubscriptionStatus", "expired");
        await WusoolServices.rawWrite("wusoolRegistrationStep", "subscription-expired");
        const updatedOrganization = {
          ...organization,
          subscriptionStatus: "expired"
        };
        await WusoolServices.rawWrite("wusoolOrganization", JSON.stringify(updatedOrganization));
        redirectTo("./subscription-plans.html");
        return false;
      }

      /*
          All access requirements are valid.
      */
      document.documentElement.style.visibility = "visible";
      return true;
    };
    const initializeSecureLogout = () => {
      WusoolUI.ready(() => {
        const logoutButton = document.querySelector("#logoutButton, " + "#organizationLogout, " + "[data-organization-logout]");
        if (!logoutButton) {
          return;
        }
        WusoolUI.listen(logoutButton, "click", async event => {
          event.preventDefault();

          /*
              Remove login session only.
              Do not delete account,
              payment, or subscription data.
          */
          await WusoolServices.rawRemove("wusoolOrganization");
          await WusoolServices.rawRemove("wusoolOrganizationLoggedIn");
          window.location.replace("./organization-login.html");
        });
      });
    };
    const accessGranted = await protectDashboard();
    if (accessGranted) {
      initializeSecureLogout();
    }
  })();
  WusoolUI.ready(async () => {
    const organizationSidebar = document.getElementById("organizationSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarToggleButton = document.getElementById("sidebarToggleButton");
    const logoutButton = document.getElementById("logoutButton");
    const dropdownLogoutButton = document.getElementById("dropdownLogoutButton");
    const sidebarOrganizationName = document.getElementById("sidebarOrganizationName");
    const topbarOrganizationName = document.getElementById("topbarOrganizationName");
    const welcomeOrganizationName = document.getElementById("welcomeOrganizationName");
    const sidebarOrganizationInitials = document.getElementById("sidebarOrganizationInitials");
    const topbarOrganizationInitials = document.getElementById("topbarOrganizationInitials");
    const currentDate = document.getElementById("currentDate");
    const branchSearch = document.getElementById("branchSearch");
    const branchesTable = document.getElementById("branchesTable");
    const noBranchesMessage = document.getElementById("noBranchesMessage");
    const loginPage = "./organization-login.html";
    const sessionStorageKey = "wusoolOrganization";
    await loadOrganizationDashboard();
    WusoolUI.listen(sidebarToggleButton, "click", () => {
      toggleSidebar();
    });
    WusoolUI.listen(sidebarOverlay, "click", () => {
      closeSidebar();
    });
    WusoolUI.listen(logoutButton, "click", async () => {
      await logoutOrganization();
    });
    WusoolUI.listen(dropdownLogoutButton, "click", async () => {
      await logoutOrganization();
    });
    WusoolUI.listen(branchSearch, "input", () => {
      filterBranches();
    });
    WusoolUI.listen(window, "resize", () => {
      if (window.innerWidth >= 992) {
        closeSidebar();
      }
    });
    async function loadOrganizationDashboard() {
      const session = await getOrganizationSession();
      if (!session) {
        redirectToLogin();
        return;
      }
      const organizationName = await getOrganizationName(session);
      const organizationInitials = createInitials(organizationName);
      displayOrganizationInformation(organizationName, organizationInitials);
      displayCurrentDate();
    }
    async function getOrganizationSession() {
      const savedSession = await WusoolServices.rawRead(sessionStorageKey);
      if (!savedSession) {
        return null;
      }
      try {
        return JSON.parse(savedSession);
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        console.error("Unable to read organization session:", error);
        await WusoolServices.rawRemove(sessionStorageKey);
        return null;
      }
    }
    async function getOrganizationName(session) {
      const registrationData = await getRegistrationData();
      if (registrationData && registrationData.organizationName) {
        return registrationData.organizationName;
      }
      if (session.organizationName) {
        return session.organizationName;
      }
      return "Organization";
    }
    async function getRegistrationData() {
      const savedRegistration = await WusoolServices.rawRead("wusoolOrganizationRegistration");
      if (!savedRegistration) {
        return null;
      }
      try {
        return JSON.parse(savedRegistration);
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        console.error("Unable to read registration data:", error);
        return null;
      }
    }
    function displayOrganizationInformation(organizationName, initials) {
      sidebarOrganizationName.textContent = organizationName;
      topbarOrganizationName.textContent = organizationName;
      welcomeOrganizationName.textContent = organizationName;
      sidebarOrganizationInitials.textContent = initials;
      topbarOrganizationInitials.textContent = initials;
    }
    function createInitials(name) {
      const nameParts = name.trim().split(/\s+/).filter(part => {
        return part.length > 0;
      });
      if (nameParts.length === 0) {
        return "OR";
      }
      if (nameParts.length === 1) {
        return nameParts[0].slice(0, 2).toUpperCase();
      }
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    function displayCurrentDate() {
      const today = new Date();
      currentDate.textContent = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(today);
    }
    function toggleSidebar() {
      const sidebarIsOpen = organizationSidebar.classList.toggle("open");
      sidebarOverlay.classList.toggle("show", sidebarIsOpen);
      sidebarToggleButton.setAttribute("aria-expanded", String(sidebarIsOpen));
      document.body.classList.toggle("sidebar-open", sidebarIsOpen);
    }
    function closeSidebar() {
      organizationSidebar.classList.remove("open");
      sidebarOverlay.classList.remove("show");
      sidebarToggleButton.setAttribute("aria-expanded", "false");
      document.body.classList.remove("sidebar-open");
    }
    function filterBranches() {
      const searchValue = branchSearch.value.trim().toLowerCase();
      const branchRows = branchesTable.querySelectorAll("tbody tr");
      let visibleRows = 0;
      branchRows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        const rowMatches = rowText.includes(searchValue);
        row.classList.toggle("d-none", !rowMatches);
        if (rowMatches) {
          visibleRows += 1;
        }
      });
      noBranchesMessage.classList.toggle("d-none", visibleRows !== 0);
    }
    async function logoutOrganization() {
      await WusoolServices.rawRemove(sessionStorageKey);
      window.location.href = loginPage;
    }
    function redirectToLogin() {
      window.location.replace(`${loginPage}?return=dashboard`);
    }
  });
});
WusoolUI.ready(async () => {
  let generation = 0;
  const text = (id, value) => {
    const n = document.getElementById(id);
    if (n) n.textContent = value;
  };
  async function refresh() {
    const serial = ++generation,
      a = await WusoolServices.getCurrentAccount();
    if (a?.role !== 'Organization') return;
    const [branches, bookings, notifications, subscriptions, audit] = await Promise.all([WusoolServices.list('branches', {
      organizationId: a.id
    }), WusoolServices.list('bookings'), WusoolServices.list('notifications'), WusoolServices.list('subscriptions'), WusoolServices.getAuditLog()]);
    if (serial !== generation || (await WusoolServices.getCurrentAccount())?.id !== a.id) return;
    text('totalBranches', branches.total);
    text('pendingBranches', branches.items.filter(b => b.status === 'pending').length);
    text('accessibilityScore', branches.total ? Math.round(branches.items.reduce((sum, b) => sum + b.accessibilityScore, 0) / branches.total) + '%' : '—');
    text('upcomingVisits', bookings.items.filter(b => ['confirmed', 'in-progress'].includes(b.status) && new Date(b.date + 'T' + b.time) > new Date()).length);
    text('topbarNotificationCount', notifications.items.filter(n => n.status !== 'read').length);
    const tbody = document.querySelector('#branchesTable tbody');
    if (tbody) WusoolUI.html(tbody, branches.items.map(b => `<tr><td>${WusoolUI.escape(b.name)}</td><td>${WusoolUI.escape(b.city || '')}</td><td>${b.accessibilityScore}% · ${WusoolUI.escape(b.evidenceStatus || 'unverified')}</td><td><span class="status-badge">${WusoolUI.escape(b.status)}</span></td><td><a class="btn btn-sm btn-outline-wusool" href="./organization-branch-details.html?id=${encodeURIComponent(b.id)}">View</a></td></tr>`).join(''));
    document.getElementById('noBranchesMessage')?.classList.toggle('d-none', branches.total > 0);
    const sub = document.querySelector('.subscription-card'),
      s = subscriptions.items.find(x => x.status.toLowerCase() === 'active');
    if (sub) WusoolUI.html(sub, `<header class="mb-4"><p class="section-label">CURRENT SUBSCRIPTION</p><h2 class="section-title">${WusoolUI.escape(s?.planName || s?.plan || 'No active subscription')}</h2><span class="status-badge">${WusoolUI.escape(s?.status || 'Inactive')}</span></header><p>${s?.developmentOnly ? 'Explicit development fixture — no payment processed.' : 'Subscription status supplied by the service.'}</p><p>Branch usage: ${branches.total}${s?.branchLimit ? ' of ' + s.branchLimit : ''}</p><a class="btn btn-outline-wusool" href="./subscription-management.html">Manage Subscription</a>`);
    const activity = document.querySelector('.activity-list');
    if (activity) WusoolUI.html(activity, audit.slice(0, 5).map(x => `<article class="activity-item"><div><h3>${WusoolUI.escape(x.action)} · ${WusoolUI.escape(x.entityType)}</h3><p>${WusoolUI.escape(x.reason || x.entityId)}</p><small>${WusoolUI.escape(x.timestamp)}</small></div></article>`).join('') || '<p>No activity yet.</p>');
    const list = document.querySelector('.dashboard-notifications');
    if (list) WusoolUI.html(list, notifications.items.slice(0, 5).map(n => `<a href="./notifications.html" class="dashboard-notification"><div><strong>${WusoolUI.escape(n.title || 'Notification')}</strong><small>${WusoolUI.escape(n.message || '')}</small></div></a>`).join('') || '<p>No notifications.</p>');
  }
  await refresh();
  WusoolUI.listen(window, 'wusool:data-changed', refresh);
  WusoolUI.listen(window, 'wusool:account-changed', () => location.reload());
});
