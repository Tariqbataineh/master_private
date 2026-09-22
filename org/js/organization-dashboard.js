(() => {
    document.documentElement.style.visibility =
        "hidden";

    const readStoredObject = (
        storage,
        key
    ) => {
        try {
            const storedValue =
                storage.getItem(key);

            return storedValue
                ? JSON.parse(storedValue)
                : null;
        } catch (error) {
            console.error(
                `Unable to read ${key}:`,
                error
            );

            return null;
        }
    };

    const redirectTo = (page) => {
        window.location.replace(page);
    };

    const getOrganizationSession = () => {
        return readStoredObject(
            sessionStorage,
            "wusoolOrganization"
        );
    };

    const getActiveSubscription = (
        organization
    ) => {
        return (
            organization?.subscription ||
            readStoredObject(
                localStorage,
                "wusoolActiveSubscription"
            )
        );
    };

    const getApprovalStatus = (
        organization
    ) => {
        return (
            organization?.approvalStatus ||
            localStorage.getItem(
                "wusoolOrganizationStatus"
            ) ||
            "pending"
        ).toLowerCase();
    };

    const getSubscriptionStatus = (
        organization
    ) => {
        return (
            organization?.subscriptionStatus ||
            localStorage.getItem(
                "wusoolSubscriptionStatus"
            ) ||
            "inactive"
        ).toLowerCase();
    };

    const subscriptionIsExpired = (
        subscription
    ) => {
        if (!subscription?.renewalDate) {
            return false;
        }

        const renewalDate =
            new Date(subscription.renewalDate);

        const currentDate =
            new Date();

        return renewalDate < currentDate;
    };

    const redirectInactiveSubscription = () => {
        const registrationStep = (
            localStorage.getItem(
                "wusoolRegistrationStep"
            ) || "approved"
        ).toLowerCase();

        const selectedPlan =
            readStoredObject(
                localStorage,
                "wusoolSelectedPlan"
            );

        if (
            registrationStep ===
            "payment-failed"
        ) {
            redirectTo(
                "./payment-failed.html"
            );

            return;
        }

        if (
            registrationStep === "checkout" &&
            selectedPlan
        ) {
            redirectTo(
                "./subscription-checkout.html"
            );

            return;
        }

        redirectTo(
            "./organization-approved.html"
        );
    };

    const protectDashboard = () => {
        const organization =
            getOrganizationSession();

        const loggedIn =
            sessionStorage.getItem(
                "wusoolOrganizationLoggedIn"
            ) === "true";

        /*
            The organization must log in first.
        */
        if (!organization || !loggedIn) {
            redirectTo(
                "./organization-login.html"
            );

            return false;
        }

        const approvalStatus =
            getApprovalStatus(organization);

        /*
            The organization is still waiting
            for administrator approval.
        */
        if (approvalStatus === "pending") {
            redirectTo(
                "./registration-pending.html"
            );

            return false;
        }

        /*
            Any status other than approved
            cannot access the dashboard.
        */
        if (approvalStatus !== "approved") {
            redirectTo(
                "./organization-login.html"
            );

            return false;
        }

        const subscriptionStatus =
            getSubscriptionStatus(
                organization
            );

        /*
            Approved organization without
            an active subscription.
        */
        if (
            subscriptionStatus !== "active"
        ) {
            redirectInactiveSubscription();

            return false;
        }

        const activeSubscription =
            getActiveSubscription(
                organization
            );

        /*
            Check whether the subscription
            renewal date has passed.
        */
        if (
            subscriptionIsExpired(
                activeSubscription
            )
        ) {
            localStorage.setItem(
                "wusoolSubscriptionStatus",
                "expired"
            );

            localStorage.setItem(
                "wusoolRegistrationStep",
                "subscription-expired"
            );

            const updatedOrganization = {
                ...organization,
                subscriptionStatus:
                    "expired"
            };

            sessionStorage.setItem(
                "wusoolOrganization",
                JSON.stringify(
                    updatedOrganization
                )
            );

            redirectTo(
                "./subscription-plans.html"
            );

            return false;
        }

        /*
            All access requirements are valid.
        */
        document.documentElement.style.visibility =
            "visible";

        return true;
    };

    const initializeSecureLogout = () => {
        document.addEventListener(
            "DOMContentLoaded",
            () => {
                const logoutButton =
                    document.querySelector(
                        "#logoutButton, " +
                        "#organizationLogout, " +
                        "[data-organization-logout]"
                    );

                if (!logoutButton) {
                    return;
                }

                logoutButton.addEventListener(
                    "click",
                    (event) => {
                        event.preventDefault();

                        /*
                            Remove login session only.
                            Do not delete account,
                            payment, or subscription data.
                        */
                        sessionStorage.removeItem(
                            "wusoolOrganization"
                        );

                        sessionStorage.removeItem(
                            "wusoolOrganizationLoggedIn"
                        );

                        window.location.replace(
                            "./organization-login.html"
                        );
                    }
                );
            }
        );
    };

    const accessGranted =
        protectDashboard();

    if (accessGranted) {
        initializeSecureLogout();
    }
})();
document.addEventListener("DOMContentLoaded", () => {
    const organizationSidebar =
        document.getElementById(
            "organizationSidebar"
        );

    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );

    const sidebarToggleButton =
        document.getElementById(
            "sidebarToggleButton"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const dropdownLogoutButton =
        document.getElementById(
            "dropdownLogoutButton"
        );

    const sidebarOrganizationName =
        document.getElementById(
            "sidebarOrganizationName"
        );

    const topbarOrganizationName =
        document.getElementById(
            "topbarOrganizationName"
        );

    const welcomeOrganizationName =
        document.getElementById(
            "welcomeOrganizationName"
        );

    const sidebarOrganizationInitials =
        document.getElementById(
            "sidebarOrganizationInitials"
        );

    const topbarOrganizationInitials =
        document.getElementById(
            "topbarOrganizationInitials"
        );

    const currentDate =
        document.getElementById(
            "currentDate"
        );

    const branchSearch =
        document.getElementById(
            "branchSearch"
        );

    const branchesTable =
        document.getElementById(
            "branchesTable"
        );

    const noBranchesMessage =
        document.getElementById(
            "noBranchesMessage"
        );

    const loginPage =
        "./organization-login.html";

    const sessionStorageKey =
        "wusoolOrganization";

    loadOrganizationDashboard();

    sidebarToggleButton.addEventListener(
        "click",
        () => {
            toggleSidebar();
        }
    );

    sidebarOverlay.addEventListener(
        "click",
        () => {
            closeSidebar();
        }
    );

    logoutButton.addEventListener(
        "click",
        () => {
            logoutOrganization();
        }
    );

    dropdownLogoutButton.addEventListener(
        "click",
        () => {
            logoutOrganization();
        }
    );

    branchSearch.addEventListener(
        "input",
        () => {
            filterBranches();
        }
    );

    window.addEventListener(
        "resize",
        () => {
            if (window.innerWidth >= 992) {
                closeSidebar();
            }
        }
    );

    function loadOrganizationDashboard() {
        const session =
            getOrganizationSession();

        if (!session) {
            redirectToLogin();
            return;
        }

        const organizationName =
            getOrganizationName(session);

        const organizationInitials =
            createInitials(
                organizationName
            );

        displayOrganizationInformation(
            organizationName,
            organizationInitials
        );

        displayCurrentDate();
    }

    function getOrganizationSession() {
        const savedSession =
            sessionStorage.getItem(
                sessionStorageKey
            );

        if (!savedSession) {
            return null;
        }

        try {
            return JSON.parse(
                savedSession
            );
        } catch (error) {
            console.error(
                "Unable to read organization session:",
                error
            );

            sessionStorage.removeItem(
                sessionStorageKey
            );

            return null;
        }
    }

    function getOrganizationName(session) {
        const registrationData =
            getRegistrationData();

        if (
            registrationData &&
            registrationData.organizationName
        ) {
            return registrationData
                .organizationName;
        }

        if (session.organizationName) {
            return session.organizationName;
        }

        return "Organization";
    }

    function getRegistrationData() {
        const savedRegistration =
            localStorage.getItem(
                "wusoolOrganizationRegistration"
            );

        if (!savedRegistration) {
            return null;
        }

        try {
            return JSON.parse(
                savedRegistration
            );
        } catch (error) {
            console.error(
                "Unable to read registration data:",
                error
            );

            return null;
        }
    }

    function displayOrganizationInformation(
        organizationName,
        initials
    ) {
        sidebarOrganizationName.textContent =
            organizationName;

        topbarOrganizationName.textContent =
            organizationName;

        welcomeOrganizationName.textContent =
            organizationName;

        sidebarOrganizationInitials.textContent =
            initials;

        topbarOrganizationInitials.textContent =
            initials;
    }

    function createInitials(name) {
        const nameParts =
            name
                .trim()
                .split(/\s+/)
                .filter((part) => {
                    return part.length > 0;
                });

        if (nameParts.length === 0) {
            return "OR";
        }

        if (nameParts.length === 1) {
            return nameParts[0]
                .slice(0, 2)
                .toUpperCase();
        }

        return (
            nameParts[0].charAt(0) +
            nameParts[1].charAt(0)
        ).toUpperCase();
    }

    function displayCurrentDate() {
        const today =
            new Date();

        currentDate.textContent =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            ).format(today);
    }

    function toggleSidebar() {
        const sidebarIsOpen =
            organizationSidebar
                .classList
                .toggle("open");

        sidebarOverlay.classList.toggle(
            "show",
            sidebarIsOpen
        );

        sidebarToggleButton.setAttribute(
            "aria-expanded",
            String(sidebarIsOpen)
        );

        document.body.classList.toggle(
            "sidebar-open",
            sidebarIsOpen
        );
    }

    function closeSidebar() {
        organizationSidebar.classList.remove(
            "open"
        );

        sidebarOverlay.classList.remove(
            "show"
        );

        sidebarToggleButton.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "sidebar-open"
        );
    }

    function filterBranches() {
        const searchValue =
            branchSearch.value
                .trim()
                .toLowerCase();

        const branchRows =
            branchesTable.querySelectorAll(
                "tbody tr"
            );

        let visibleRows =
            0;

        branchRows.forEach((row) => {
            const rowText =
                row.textContent
                    .toLowerCase();

            const rowMatches =
                rowText.includes(
                    searchValue
                );

            row.classList.toggle(
                "d-none",
                !rowMatches
            );

            if (rowMatches) {
                visibleRows += 1;
            }
        });

        noBranchesMessage.classList.toggle(
            "d-none",
            visibleRows !== 0
        );
    }

    function logoutOrganization() {
        sessionStorage.removeItem(
            sessionStorageKey
        );

        window.location.href =
            loginPage;
    }

    function redirectToLogin() {
        window.location.replace(
            `${loginPage}?return=dashboard`
        );
    }
});