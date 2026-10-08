WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const storageKeys = {
    organization: "wusoolOrganization",
    registration: "wusoolOrganizationRegistration",
    notificationSettings: "wusoolOrganizationNotificationSettings",
    password: "wusoolOrganizationPassword",
    loggedIn: "wusoolOrganizationLoggedIn"
  };
  let organizationData = {};
  let registrationData = {};
  let notificationSettings = {};
  WusoolUI.ready(async () => {
    await loadStoredData();
    populateOrganizationForm();
    populateManagerForm();
    populateNotificationSettings();
    configureForms();
    openRequestedProfile();
    configurePasswordVisibility();
    configureSidebar();
  });
  const loadStoredData = async () => {
    organizationData = await getStoredObject(storageKeys.organization, {});
    registrationData = await getStoredObject(storageKeys.registration, {});
    notificationSettings = await getStoredObject(storageKeys.notificationSettings, {
      branchReviews: true,
      bookings: true,
      reports: true,
      payments: true,
      emails: true
    });
  };
  const populateOrganizationForm = () => {
    const organizationName = organizationData.organizationName || organizationData.name || registrationData.organizationName || registrationData.name || "Wusool Organization";
    setInputValue("organizationName", organizationName);
    setInputValue("organizationType", organizationData.organizationType || registrationData.organizationType || registrationData.type || "Private Company");
    setInputValue("registrationNumber", organizationData.registrationNumber || registrationData.registrationNumber || registrationData.registrationId || "Not provided");
    setInputValue("organizationEmail", organizationData.email || organizationData.organizationEmail || registrationData.email || "");
    setInputValue("organizationPhone", organizationData.phone || organizationData.phoneNumber || registrationData.phone || "");
    setInputValue("organizationAddress", organizationData.address || registrationData.address || "");
    setInputValue("organizationWebsite", organizationData.website || "");
    setInputValue("organizationDescription", organizationData.description || "");
    setText("headerOrganizationName", organizationName);
  };
  const populateManagerForm = () => {
    const managerName = organizationData.managerName || registrationData.managerName || registrationData.contactPersonName || registrationData.fullName || "Organization Manager";
    setInputValue("managerFullName", managerName);
    setInputValue("managerPosition", organizationData.managerPosition || registrationData.managerPosition || "Organization Manager");
    setInputValue("managerEmail", organizationData.managerEmail || registrationData.managerEmail || registrationData.email || "");
    setInputValue("managerPhone", organizationData.managerPhone || registrationData.managerPhone || registrationData.phone || "");
    updateManagerSummary(managerName);
  };
  const populateNotificationSettings = () => {
    document.getElementById("branchReviewNotifications").checked = notificationSettings.branchReviews !== false;
    document.getElementById("bookingNotifications").checked = notificationSettings.bookings !== false;
    document.getElementById("reportNotifications").checked = notificationSettings.reports !== false;
    document.getElementById("paymentNotifications").checked = notificationSettings.payments !== false;
    document.getElementById("emailNotifications").checked = notificationSettings.emails !== false;
  };
  const configureForms = () => {
    WusoolUI.listen(document.getElementById("organizationForm"), "submit", saveOrganizationProfile);
    WusoolUI.listen(document.getElementById("managerForm"), "submit", saveManagerProfile);
    WusoolUI.listen(document.getElementById("notificationsForm"), "submit", saveNotificationSettings);
    WusoolUI.listen(document.getElementById("passwordForm"), "submit", updatePassword);
  };
  const saveOrganizationProfile = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    organizationData = {
      ...organizationData,
      organizationName: getInputValue("organizationName"),
      name: getInputValue("organizationName"),
      organizationType: getInputValue("organizationType"),
      registrationNumber: getInputValue("registrationNumber"),
      email: getInputValue("organizationEmail"),
      phone: getInputValue("organizationPhone"),
      address: getInputValue("organizationAddress"),
      website: getInputValue("organizationWebsite"),
      description: getInputValue("organizationDescription"),
      updatedAt: new Date().toISOString()
    };
    await saveOrganizationData();
    setText("headerOrganizationName", organizationData.organizationName);
    showToast("Organization profile saved successfully.");
  };
  const saveManagerProfile = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    const managerName = getInputValue("managerFullName");
    organizationData = {
      ...organizationData,
      managerName,
      managerPosition: getInputValue("managerPosition"),
      managerEmail: getInputValue("managerEmail"),
      managerPhone: getInputValue("managerPhone"),
      updatedAt: new Date().toISOString()
    };
    await saveOrganizationData();
    updateManagerSummary(managerName);
    showToast("Manager profile saved successfully.");
  };
  const saveNotificationSettings = async event => {
    event.preventDefault();
    notificationSettings = {
      branchReviews: document.getElementById("branchReviewNotifications").checked,
      bookings: document.getElementById("bookingNotifications").checked,
      reports: document.getElementById("reportNotifications").checked,
      payments: document.getElementById("paymentNotifications").checked,
      emails: document.getElementById("emailNotifications").checked,
      updatedAt: new Date().toISOString()
    };
    await WusoolServices.rawWrite(storageKeys.notificationSettings, JSON.stringify(notificationSettings));
    showToast("Notification preferences saved.");
  };
  const updatePassword = async event => {
    event.preventDefault();
    await WusoolServices.external('auth/change-password', {
      currentPassword: getInputValue('currentPassword'),
      newPassword: getInputValue('newPassword')
    });
    event.currentTarget.reset();
    showToast('Password change confirmed by server.');
  };
  const showPasswordError = message => {
    const errorElement = document.getElementById("passwordError");
    errorElement.textContent = message;
    errorElement.classList.remove("d-none");
  };
  const isStrongPassword = password => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordPattern.test(password);
  };
  const configurePasswordVisibility = () => {
    document.querySelectorAll("[data-password-target]").forEach(button => {
      WusoolUI.listen(button, "click", () => {
        const input = document.getElementById(button.dataset.passwordTarget);
        const icon = button.querySelector("i");
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        icon.className = isHidden ? "bi bi-eye-slash" : "bi bi-eye";
      });
    });
  };
  const updateManagerSummary = managerName => {
    setText("managerSummaryName", managerName);
    setText("managerAvatar", getInitials(managerName));
  };
  const saveOrganizationData = async () => {
    await WusoolServices.rawWrite(storageKeys.organization, JSON.stringify(organizationData));
  };
  const showToast = message => {
    setText("toastMessage", message);
    bootstrap.Toast.getOrCreateInstance(document.getElementById("settingsToast")).show();
  };
  const configureSidebar = () => {
    const sidebar = document.getElementById("organizationSidebar");
    const toggle = document.getElementById("sidebarToggle");
    const backdrop = document.getElementById("sidebarBackdrop");
    const closeSidebar = () => {
      sidebar.classList.remove("show");
      backdrop.classList.remove("show");
    };
    WusoolUI.listen(toggle, "click", () => {
      sidebar.classList.toggle("show");
      backdrop.classList.toggle("show");
    });
    WusoolUI.listen(backdrop, "click", closeSidebar);
    WusoolUI.listen(document.getElementById("logoutButton"), "click", async () => {
      await WusoolServices.rawRemove(storageKeys.loggedIn);
      window.location.href = "./organization-login.html";
    });
    WusoolUI.listen(window, "resize", () => {
      if (window.innerWidth >= 992) {
        closeSidebar();
      }
    });
  };
  const getInitials = fullName => {
    return String(fullName).trim().split(/\s+/).slice(0, 2).map(word => word.charAt(0)).join("").toUpperCase() || "OM";
  };
  const getInputValue = id => {
    return document.getElementById(id).value.trim();
  };
  const openRequestedProfile = () => {
    if (window.location.hash !== "#manager-profile") {
      return;
    }
    const managerTab = document.getElementById("manager-tab");
    if (!managerTab) {
      return;
    }
    const tab = bootstrap.Tab.getOrCreateInstance(managerTab);
    tab.show();
    document.getElementById("manager-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };
  const setInputValue = (id, value) => {
    document.getElementById(id).value = value || "";
  };
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  };
  const getStoredObject = async (key, fallback) => {
    try {
      const value = await WusoolServices.rawRead(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      if (WusoolServices.mode === "api") throw error;
      console.error(`Unable to read ${key}:`, error);
      return fallback;
    }
  };
});
