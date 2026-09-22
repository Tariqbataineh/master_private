document.addEventListener("DOMContentLoaded", () => {
    initializeOrganizationLogin();
    initializePasswordToggle();
    restoreRememberedEmail();
});

const getElement = (...selectors) => {
    for (const selector of selectors) {
        const element =
            document.querySelector(selector);

        if (element) {
            return element;
        }
    }

    return null;
};

const getStoredObject = (storage, key) => {
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

const getRegisteredOrganization = () => {
    const possibleOrganizations = [
        getStoredObject(
            localStorage,
            "wusoolOrganizationRegistration"
        ),

        getStoredObject(
            localStorage,
            "organizationRegistration"
        ),

        getStoredObject(
            localStorage,
            "wusoolOrganization"
        ),

        getStoredObject(
            sessionStorage,
            "wusoolOrganization"
        )
    ];

    return possibleOrganizations.find(
        (organization) => {
            return organization !== null;
        }
    ) || null;
};

const getOrganizationEmail = (
    organization
) => {
    return (
        organization?.email ||
        organization?.organizationEmail ||
        organization?.adminEmail ||
        ""
    );
};

const getOrganizationPassword = (
    organization
) => {
    return (
        organization?.password ||
        organization?.organizationPassword ||
        organization?.adminPassword ||
        ""
    );
};

const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};

const initializeOrganizationLogin = () => {
    const loginForm = getElement(
        "#organizationLoginForm",
        "#loginForm",
        "form"
    );

    if (!loginForm) {
        console.error(
            "Organization login form was not found."
        );

        return;
    }

    loginForm.addEventListener(
        "submit",
        handleLoginSubmit
    );
};

const handleLoginSubmit = (event) => {
    event.preventDefault();

    const loginForm = event.currentTarget;

    loginForm.classList.add(
        "was-validated"
    );

    if (!loginForm.checkValidity()) {
        return;
    }

    const emailInput = getElement(
        "#organizationEmail",
        "#email",
        'input[type="email"]'
    );

    const passwordInput = getElement(
        "#organizationPassword",
        "#password",
        'input[type="password"]'
    );

    if (!emailInput || !passwordInput) {
        showLoginMessage(
            "The email or password field was not found.",
            "danger"
        );

        return;
    }

    const enteredEmail =
        normalizeEmail(emailInput.value);

    const enteredPassword =
        passwordInput.value;

    const organization =
        getRegisteredOrganization();

    if (!organization) {
        showLoginMessage(
            "No organization account was found. Please register your organization first.",
            "danger"
        );

        return;
    }

    const registeredEmail =
        normalizeEmail(
            getOrganizationEmail(organization)
        );

    const registeredPassword =
        getOrganizationPassword(organization);

    const isEmailCorrect =
        enteredEmail === registeredEmail;

    /*
        If a password was saved during registration,
        it will be checked.

        If the old registration page did not save
        the password, any non-empty password will
        be accepted for the Front-End demonstration.
    */
    const isPasswordCorrect =
        registeredPassword
            ? enteredPassword === registeredPassword
            : enteredPassword.length > 0;

    if (!isEmailCorrect || !isPasswordCorrect) {
        showLoginMessage(
            "The email or password is incorrect.",
            "danger"
        );

        return;
    }

    handleRememberMe(enteredEmail);
    createOrganizationSession(organization);
    completeOrganizationLogin();
};

const createOrganizationSession = (
    organization
) => {
    const approvalStatus =
        getApprovalStatus(organization);

    const subscriptionStatus =
        getSubscriptionStatus(organization);

    const sessionOrganization = {
        ...organization,
        approvalStatus,
        subscriptionStatus,
        isLoggedIn: true,
        loginTime:
            new Date().toISOString()
    };

    sessionStorage.setItem(
        "wusoolOrganization",
        JSON.stringify(sessionOrganization)
    );

    sessionStorage.setItem(
        "wusoolOrganizationLoggedIn",
        "true"
    );
};

const getApprovalStatus = (
    organization
) => {
    const storedStatus =
        localStorage.getItem(
            "wusoolOrganizationStatus"
        );

    return (
        storedStatus ||
        organization.approvalStatus ||
        organization.status ||
        "pending"
    ).toLowerCase();
};

const getSubscriptionStatus = (
    organization
) => {
    const storedSubscriptionStatus =
        localStorage.getItem(
            "wusoolSubscriptionStatus"
        );

    return (
        storedSubscriptionStatus ||
        organization.subscriptionStatus ||
        "inactive"
    ).toLowerCase();
};

const getRegistrationStep = () => {
    return (
        localStorage.getItem(
            "wusoolRegistrationStep"
        ) || "pending"
    ).toLowerCase();
};

const determineNextPage = () => {
    const organization =
        getRegisteredOrganization() || {};

    const approvalStatus =
        getApprovalStatus(organization);

    const subscriptionStatus =
        getSubscriptionStatus(organization);

    const registrationStep =
        getRegistrationStep();

    /*
        Organization is still waiting
        for the platform administrator.
    */
    if (approvalStatus === "pending") {
        return "./registration-pending.html";
    }

    /*
        Subscription is already active.
        Organization may enter its dashboard.
    */
    if (
        approvalStatus === "approved" &&
        subscriptionStatus === "active"
    ) {
        return "./organization-dashboard.html";
    }

    /*
        Previous payment attempt failed.
    */
    if (
        approvalStatus === "approved" &&
        registrationStep === "payment-failed"
    ) {
        return "./payment-failed.html";
    }

    /*
        A plan was selected and the organization
        still needs to complete payment.
    */
    if (
        approvalStatus === "approved" &&
        registrationStep === "checkout"
    ) {
        const selectedPlan =
            getStoredObject(
                localStorage,
                "wusoolSelectedPlan"
            );

        if (selectedPlan) {
            return "./subscription-checkout.html";
        }
    }

    /*
        Payment was completed successfully.
    */
    if (
        approvalStatus === "approved" &&
        registrationStep === "payment-successful"
    ) {
        return "./payment-success.html";
    }

    /*
        Organization is approved but has
        not selected a subscription yet.
    */
    if (approvalStatus === "approved") {
        return "./organization-approved.html";
    }

    return "./registration-pending.html";
};

const completeOrganizationLogin = () => {
    setLoginLoading(true);

    showLoginMessage(
        "Login successful. Redirecting...",
        "success"
    );

    const nextPage =
        determineNextPage();

    setTimeout(() => {
        window.location.href = nextPage;
    }, 900);
};

const handleRememberMe = (email) => {
    const rememberMeInput = getElement(
        "#rememberMe",
        'input[name="rememberMe"]'
    );

    if (rememberMeInput?.checked) {
        localStorage.setItem(
            "wusoolRememberedOrganizationEmail",
            email
        );
    } else {
        localStorage.removeItem(
            "wusoolRememberedOrganizationEmail"
        );
    }
};

const restoreRememberedEmail = () => {
    const rememberedEmail =
        localStorage.getItem(
            "wusoolRememberedOrganizationEmail"
        );

    if (!rememberedEmail) {
        return;
    }

    const emailInput = getElement(
        "#organizationEmail",
        "#email",
        'input[type="email"]'
    );

    const rememberMeInput = getElement(
        "#rememberMe",
        'input[name="rememberMe"]'
    );

    if (emailInput) {
        emailInput.value =
            rememberedEmail;
    }

    if (rememberMeInput) {
        rememberMeInput.checked = true;
    }
};

const initializePasswordToggle = () => {
    const passwordInput = getElement(
        "#organizationPassword",
        "#password",
        'input[type="password"]'
    );

    const passwordToggle = getElement(
        "#passwordToggle",
        "#togglePassword",
        "[data-password-toggle]"
    );

    if (!passwordInput || !passwordToggle) {
        return;
    }

    passwordToggle.addEventListener(
        "click",
        () => {
            const passwordIsHidden =
                passwordInput.type === "password";

            passwordInput.type =
                passwordIsHidden
                    ? "text"
                    : "password";

            passwordToggle.innerHTML =
                passwordIsHidden
                    ? '<i class="bi bi-eye-slash"></i>'
                    : '<i class="bi bi-eye"></i>';

            passwordToggle.setAttribute(
                "aria-label",
                passwordIsHidden
                    ? "Hide password"
                    : "Show password"
            );
        }
    );
};

const setLoginLoading = (isLoading) => {
    const loginButton = getElement(
        "#loginButton",
        'button[type="submit"]'
    );

    if (!loginButton) {
        return;
    }

    loginButton.disabled = isLoading;

    if (isLoading) {
        loginButton.dataset.originalContent =
            loginButton.innerHTML;

        loginButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
            ></span>
            Signing In...
        `;
    } else if (
        loginButton.dataset.originalContent
    ) {
        loginButton.innerHTML =
            loginButton.dataset.originalContent;
    }
};

const showLoginMessage = (
    message,
    type = "danger"
) => {
    let loginAlert = getElement(
        "#loginAlert"
    );

    if (!loginAlert) {
        const loginForm = getElement(
            "#organizationLoginForm",
            "#loginForm",
            "form"
        );

        loginAlert =
            document.createElement("div");

        loginAlert.id = "loginAlert";

        loginForm.prepend(loginAlert);
    }

    loginAlert.className =
        `alert alert-${type} d-flex align-items-center gap-2`;

    const icon =
        type === "success"
            ? "bi-check-circle-fill"
            : "bi-exclamation-circle-fill";

    loginAlert.innerHTML = `
        <i class="bi ${icon}"></i>
        <span>${message}</span>
    `;

    loginAlert.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
};