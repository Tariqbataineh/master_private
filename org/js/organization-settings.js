const storageKeys = {
    organization: "wusoolOrganization",
    registration: "wusoolOrganizationRegistration",
    notificationSettings:
        "wusoolOrganizationNotificationSettings",
    password: "wusoolOrganizationPassword",
    loggedIn: "wusoolOrganizationLoggedIn"
};

let organizationData = {};
let registrationData = {};
let notificationSettings = {};

document.addEventListener("DOMContentLoaded", () => {
    loadStoredData();
    populateOrganizationForm();
    populateManagerForm();
    populateNotificationSettings();
    configureForms();
    openRequestedProfile();
    configurePasswordVisibility();
    configureSidebar();
});

const loadStoredData = () => {
    organizationData =
        getStoredObject(
            storageKeys.organization,
            {}
        );

    registrationData =
        getStoredObject(
            storageKeys.registration,
            {}
        );

    notificationSettings =
        getStoredObject(
            storageKeys.notificationSettings,
            {
                branchReviews: true,
                bookings: true,
                reports: true,
                payments: true,
                emails: true
            }
        );
};

const populateOrganizationForm = () => {
    const organizationName =
        organizationData.organizationName ||
        organizationData.name ||
        registrationData.organizationName ||
        registrationData.name ||
        "Wusool Organization";

    setInputValue(
        "organizationName",
        organizationName
    );

    setInputValue(
        "organizationType",
        organizationData.organizationType ||
        registrationData.organizationType ||
        registrationData.type ||
        "Private Company"
    );

    setInputValue(
        "registrationNumber",
        organizationData.registrationNumber ||
        registrationData.registrationNumber ||
        registrationData.registrationId ||
        "Not provided"
    );

    setInputValue(
        "organizationEmail",
        organizationData.email ||
        organizationData.organizationEmail ||
        registrationData.email ||
        ""
    );

    setInputValue(
        "organizationPhone",
        organizationData.phone ||
        organizationData.phoneNumber ||
        registrationData.phone ||
        ""
    );

    setInputValue(
        "organizationAddress",
        organizationData.address ||
        registrationData.address ||
        ""
    );

    setInputValue(
        "organizationWebsite",
        organizationData.website || ""
    );

    setInputValue(
        "organizationDescription",
        organizationData.description || ""
    );

    setText(
        "headerOrganizationName",
        organizationName
    );
};

const populateManagerForm = () => {
    const managerName =
        organizationData.managerName ||
        registrationData.managerName ||
        registrationData.contactPersonName ||
        registrationData.fullName ||
        "Organization Manager";

    setInputValue(
        "managerFullName",
        managerName
    );

    setInputValue(
        "managerPosition",
        organizationData.managerPosition ||
        registrationData.managerPosition ||
        "Organization Manager"
    );

    setInputValue(
        "managerEmail",
        organizationData.managerEmail ||
        registrationData.managerEmail ||
        registrationData.email ||
        ""
    );

    setInputValue(
        "managerPhone",
        organizationData.managerPhone ||
        registrationData.managerPhone ||
        registrationData.phone ||
        ""
    );

    updateManagerSummary(managerName);
};

const populateNotificationSettings = () => {
    document.getElementById(
        "branchReviewNotifications"
    ).checked =
        notificationSettings.branchReviews !== false;

    document.getElementById(
        "bookingNotifications"
    ).checked =
        notificationSettings.bookings !== false;

    document.getElementById(
        "reportNotifications"
    ).checked =
        notificationSettings.reports !== false;

    document.getElementById(
        "paymentNotifications"
    ).checked =
        notificationSettings.payments !== false;

    document.getElementById(
        "emailNotifications"
    ).checked =
        notificationSettings.emails !== false;
};

const configureForms = () => {
    document.getElementById(
        "organizationForm"
    ).addEventListener(
        "submit",
        saveOrganizationProfile
    );

    document.getElementById(
        "managerForm"
    ).addEventListener(
        "submit",
        saveManagerProfile
    );

    document.getElementById(
        "notificationsForm"
    ).addEventListener(
        "submit",
        saveNotificationSettings
    );

    document.getElementById(
        "passwordForm"
    ).addEventListener(
        "submit",
        updatePassword
    );
};

const saveOrganizationProfile = (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    organizationData = {
        ...organizationData,

        organizationName:
            getInputValue("organizationName"),

        name:
            getInputValue("organizationName"),

        organizationType:
            getInputValue("organizationType"),

        registrationNumber:
            getInputValue("registrationNumber"),

        email:
            getInputValue("organizationEmail"),

        phone:
            getInputValue("organizationPhone"),

        address:
            getInputValue("organizationAddress"),

        website:
            getInputValue("organizationWebsite"),

        description:
            getInputValue(
                "organizationDescription"
            ),

        updatedAt: new Date().toISOString()
    };

    saveOrganizationData();

    setText(
        "headerOrganizationName",
        organizationData.organizationName
    );

    showToast(
        "Organization profile saved successfully."
    );
};

const saveManagerProfile = (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const managerName =
        getInputValue("managerFullName");

    organizationData = {
        ...organizationData,

        managerName,

        managerPosition:
            getInputValue("managerPosition"),

        managerEmail:
            getInputValue("managerEmail"),

        managerPhone:
            getInputValue("managerPhone"),

        updatedAt: new Date().toISOString()
    };

    saveOrganizationData();
    updateManagerSummary(managerName);

    showToast(
        "Manager profile saved successfully."
    );
};

const saveNotificationSettings = (event) => {
    event.preventDefault();

    notificationSettings = {
        branchReviews:
            document.getElementById(
                "branchReviewNotifications"
            ).checked,

        bookings:
            document.getElementById(
                "bookingNotifications"
            ).checked,

        reports:
            document.getElementById(
                "reportNotifications"
            ).checked,

        payments:
            document.getElementById(
                "paymentNotifications"
            ).checked,

        emails:
            document.getElementById(
                "emailNotifications"
            ).checked,

        updatedAt: new Date().toISOString()
    };

    localStorage.setItem(
        storageKeys.notificationSettings,
        JSON.stringify(notificationSettings)
    );

    showToast(
        "Notification preferences saved."
    );
};

const updatePassword = (event) => {
    event.preventDefault();

    const currentPassword =
        getInputValue("currentPassword");

    const newPassword =
        getInputValue("newPassword");

    const confirmPassword =
        getInputValue("confirmPassword");

    const errorElement =
        document.getElementById(
            "passwordError"
        );

    const storedPassword =
        localStorage.getItem(
            storageKeys.password
        );

    errorElement.classList.add("d-none");

    if (
        storedPassword &&
        currentPassword !== storedPassword
    ) {
        showPasswordError(
            "The current password is incorrect."
        );

        return;
    }

    if (!isStrongPassword(newPassword)) {
        showPasswordError(
            "The new password must contain at least 8 characters, uppercase, lowercase, and a number."
        );

        return;
    }

    if (newPassword !== confirmPassword) {
        showPasswordError(
            "The new passwords do not match."
        );

        return;
    }

    localStorage.setItem(
        storageKeys.password,
        newPassword
    );

    event.currentTarget.reset();

    showToast(
        "Password updated successfully."
    );
};

const showPasswordError = (message) => {
    const errorElement =
        document.getElementById(
            "passwordError"
        );

    errorElement.textContent = message;
    errorElement.classList.remove("d-none");
};

const isStrongPassword = (password) => {
    const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    return passwordPattern.test(password);
};

const configurePasswordVisibility = () => {
    document.querySelectorAll(
        "[data-password-target]"
    ).forEach((button) => {
        button.addEventListener("click", () => {
            const input =
                document.getElementById(
                    button.dataset.passwordTarget
                );

            const icon =
                button.querySelector("i");

            const isHidden =
                input.type === "password";

            input.type =
                isHidden ? "text" : "password";

            icon.className =
                isHidden
                    ? "bi bi-eye-slash"
                    : "bi bi-eye";
        });
    });
};

const updateManagerSummary = (managerName) => {
    setText(
        "managerSummaryName",
        managerName
    );

    setText(
        "managerAvatar",
        getInitials(managerName)
    );
};

const saveOrganizationData = () => {
    localStorage.setItem(
        storageKeys.organization,
        JSON.stringify(organizationData)
    );
};

const showToast = (message) => {
    setText("toastMessage", message);

    bootstrap.Toast
        .getOrCreateInstance(
            document.getElementById(
                "settingsToast"
            )
        )
        .show();
};

const configureSidebar = () => {
    const sidebar =
        document.getElementById(
            "organizationSidebar"
        );

    const toggle =
        document.getElementById(
            "sidebarToggle"
        );

    const backdrop =
        document.getElementById(
            "sidebarBackdrop"
        );

    const closeSidebar = () => {
        sidebar.classList.remove("show");
        backdrop.classList.remove("show");
    };

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
        backdrop.classList.toggle("show");
    });

    backdrop.addEventListener(
        "click",
        closeSidebar
    );

    document.getElementById(
        "logoutButton"
    ).addEventListener("click", () => {
        sessionStorage.removeItem(
            storageKeys.loggedIn
        );

        window.location.href =
            "./organization-login.html";
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 992) {
            closeSidebar();
        }
    });
};

const getInitials = (fullName) => {
    return String(fullName)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase() || "OM";
};

const getInputValue = (id) => {
    return document
        .getElementById(id)
        .value
        .trim();
};
const openRequestedProfile = () => {
    if (
        window.location.hash !==
        "#manager-profile"
    ) {
        return;
    }

    const managerTab =
        document.getElementById(
            "manager-tab"
        );

    if (!managerTab) {
        return;
    }

    const tab =
        bootstrap.Tab.getOrCreateInstance(
            managerTab
        );

    tab.show();

    document.getElementById(
        "manager-panel"
    )?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
};

const setInputValue = (id, value) => {
    document.getElementById(id).value =
        value || "";
};

const setText = (id, value) => {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
};

const getStoredObject = (
    key,
    fallback
) => {
    try {
        const value =
            localStorage.getItem(key);

        return value
            ? JSON.parse(value)
            : fallback;
    } catch (error) {
        console.error(
            `Unable to read ${key}:`,
            error
        );

        return fallback;
    }
    
};