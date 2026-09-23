const storageKeys = {
    organization: "wusoolOrganization",
    registration: "wusoolOrganizationRegistration",
    subscription: "wusoolActiveSubscription",
    selectedPlan: "wusoolSelectedPlan",
    payment: "wusoolPayment",
    branches: "wusoolOrganizationBranches",
    billingHistory: "wusoolBillingHistory",
    loggedIn: "wusoolOrganizationLoggedIn"
};

const planFeatures = {
    Starter: [
        "Manage up to 1 branch",
        "Accessibility checklist",
        "Branch working hours",
        "Basic AI accessibility report",
        "Visitor booking information"
    ],

    Professional: [
        "Manage up to 5 branches",
        "Advanced AI accessibility reports",
        "Reference photo management",
        "Visitor tickets and bookings",
        "Accessibility improvement suggestions",
        "Priority support"
    ],

    Enterprise: [
        "Manage up to 15 branches",
        "Advanced AI accessibility analysis",
        "Full visitor ticket management",
        "Detailed accessibility reports",
        "Priority organization support",
        "Multiple branch performance tracking"
    ]
};

let activeSubscription = null;
let branches = [];
let billingHistory = [];
let paymentModal = null;

document.addEventListener("DOMContentLoaded", () => {
    protectPage();
    loadOrganizationInformation();
    loadSubscription();
    loadBranches();
    loadBillingHistory();
    renderSubscription();
    configureAutoRenewal();
    configurePaymentMethod();
    configureSidebar();
});

const protectPage = () => {
    const isLoggedIn =
        sessionStorage.getItem(storageKeys.loggedIn) === "true";

    if (!isLoggedIn) {
        window.location.href =
            "./organization-login.html";

        return;
    }

    if (!getStoredObject(storageKeys.subscription, null)) {
        window.location.href =
            "./subscription-plans.html";
    }
};

const loadOrganizationInformation = () => {
    const organization =
        getStoredObject(storageKeys.organization, {});

    const registration =
        getStoredObject(storageKeys.registration, {});

    setText(
        "organizationName",
        organization.organizationName ||
        organization.name ||
        registration.organizationName ||
        registration.name ||
        "Organization"
    );
};

const loadSubscription = () => {
    const storedSubscription =
        getStoredObject(storageKeys.subscription, {});

    const selectedPlan =
        getStoredObject(storageKeys.selectedPlan, {});

    const payment =
        getStoredObject(storageKeys.payment, {});

    const planName =
        storedSubscription.planName ||
        storedSubscription.name ||
        selectedPlan.planName ||
        selectedPlan.name ||
        "Professional";

    const billingCycle =
        storedSubscription.billingCycle ||
        selectedPlan.billingCycle ||
        "monthly";

    const branchLimit =
        Number(
            storedSubscription.branchLimit ||
            selectedPlan.branchLimit ||
            getDefaultBranchLimit(planName)
        );

    const price =
        Number(
            storedSubscription.price ||
            selectedPlan.price ||
            getDefaultPrice(planName, billingCycle)
        );

    activeSubscription = {
        ...storedSubscription,
        planName,
        billingCycle,
        branchLimit,
        price,

        status:
            storedSubscription.status ||
            "active",

        autoRenew:
            storedSubscription.autoRenew !== false,

        startedAt:
            storedSubscription.startedAt ||
            storedSubscription.createdAt ||
            payment.paidAt ||
            new Date().toISOString(),

        nextPaymentDate:
            storedSubscription.nextPaymentDate ||
            calculateNextPaymentDate(
                billingCycle,
                storedSubscription.startedAt
            ),

        paymentMethod:
            storedSubscription.paymentMethod ||
            payment.paymentMethod ||
            "Visa",

        lastFour:
            storedSubscription.lastFour ||
            payment.lastFour ||
            "4242",

        cardExpiry:
            storedSubscription.cardExpiry ||
            payment.cardExpiry ||
            "12/30"
    };

    saveSubscription();
};

const loadBranches = () => {
    branches =
        getStoredObject(storageKeys.branches, []);
};

const loadBillingHistory = () => {
    const storedHistory =
        getStoredObject(
            storageKeys.billingHistory,
            null
        );

    if (Array.isArray(storedHistory)) {
        billingHistory = storedHistory;
        return;
    }

    billingHistory = [
        {
            id: `INV-${Date.now()
                .toString()
                .slice(-6)}`,
            date: activeSubscription.startedAt,
            planName: activeSubscription.planName,
            amount: activeSubscription.price,
            status: "Paid"
        }
    ];

    localStorage.setItem(
        storageKeys.billingHistory,
        JSON.stringify(billingHistory)
    );
};

const renderSubscription = () => {
    renderPlanInformation();
    renderStatistics();
    renderBranchUsage();
    renderFeatures();
    renderPaymentInformation();
    renderBillingHistory();
};

const renderPlanInformation = () => {
    const cycle =
        normalizeBillingCycle(
            activeSubscription.billingCycle
        );

    setText(
        "planName",
        `${activeSubscription.planName} Plan`
    );

    setText(
        "billingCycle",
        capitalize(cycle)
    );

    setText(
        "planBranchLimit",
        `${activeSubscription.branchLimit} Branches`
    );

    setText(
        "planPrice",
        `${formatPrice(activeSubscription.price)} JOD`
    );

    setText(
        "planPricePeriod",
        cycle === "annual"
            ? "/ year"
            : "/ month"
    );

    setText(
        "nextPaymentDate",
        formatDate(
            activeSubscription.nextPaymentDate
        )
    );

    document.getElementById(
        "autoRenewSwitch"
    ).checked = activeSubscription.autoRenew;
};

const renderStatistics = () => {
    const usedBranches =
        branches.length;

    const remainingBranches =
        Math.max(
            activeSubscription.branchLimit -
            usedBranches,
            0
        );

    setText(
        "usedBranchesCount",
        usedBranches
    );

    setText(
        "remainingBranchesCount",
        remainingBranches
    );

    setText(
        "paymentMethod",
        `${activeSubscription.paymentMethod} •••• ${activeSubscription.lastFour}`
    );

    setText(
        "daysUntilRenewal",
        calculateDaysUntil(
            activeSubscription.nextPaymentDate
        )
    );
};

const renderBranchUsage = () => {
    const usedBranches =
        branches.length;

    const branchLimit =
        activeSubscription.branchLimit;

    const usagePercentage =
        branchLimit > 0
            ? Math.min(
                (usedBranches / branchLimit) * 100,
                100
            )
            : 0;

    const progressBar =
        document.getElementById(
            "branchUsageProgress"
        );

    const alert =
        document.getElementById(
            "branchUsageAlert"
        );

    setText(
        "branchUsageText",
        `${usedBranches} of ${branchLimit}`
    );

    progressBar.style.width =
        `${usagePercentage}%`;

    progressBar.className =
        "progress-bar";

    alert.className =
        "alert usage-alert mt-4 mb-0";

    if (usedBranches >= branchLimit) {
        progressBar.classList.add("full");
        alert.classList.add("full");

        setText(
            "branchUsageMessage",
            "You reached the branch limit. Upgrade your plan to add another branch."
        );

        return;
    }

    if (usagePercentage >= 80) {
        progressBar.classList.add("warning");
        alert.classList.add("warning");

        setText(
            "branchUsageMessage",
            "You are close to the branch limit of your current plan."
        );

        return;
    }

    setText(
        "branchUsageMessage",
        `You can add ${
            branchLimit - usedBranches
        } more branch(es) to this plan.`
    );
};

const renderFeatures = () => {
    const container =
        document.getElementById(
            "planFeatures"
        );

    const features =
        planFeatures[
            activeSubscription.planName
        ] ||
        planFeatures.Professional;

    container.innerHTML =
        features.map((feature) => {
            return `
                <li>
                    <i class="bi bi-check-circle-fill"></i>
                    <span>${escapeHtml(feature)}</span>
                </li>
            `;
        }).join("");
};

const renderPaymentInformation = () => {
    setText(
        "savedCardName",
        `${activeSubscription.paymentMethod} ending in ${activeSubscription.lastFour}`
    );

    setText(
        "savedCardExpiry",
        `Expires ${activeSubscription.cardExpiry}`
    );

    renderRenewalAlert();
};

const renderBillingHistory = () => {
    const tableBody =
        document.getElementById(
            "billingHistoryBody"
        );

    const emptyState =
        document.getElementById(
            "emptyBillingState"
        );

    if (billingHistory.length === 0) {
        tableBody.innerHTML = "";
        emptyState.classList.remove("d-none");
        return;
    }

    emptyState.classList.add("d-none");

    tableBody.innerHTML =
        billingHistory.map((invoice) => {
            return `
                <tr>
                    <td>
                        <strong>
                            ${escapeHtml(invoice.id)}
                        </strong>
                    </td>

                    <td>
                        ${formatDate(invoice.date)}
                    </td>

                    <td>
                        ${escapeHtml(invoice.planName)}
                    </td>

                    <td>
                        ${formatPrice(invoice.amount)} JOD
                    </td>

                    <td>
                        <span class="payment-status">
                            ${escapeHtml(invoice.status)}
                        </span>
                    </td>

                    <td class="text-end">
                        <button
                            type="button"
                            class="receipt-button"
                            title="Receipt preview"
                            aria-label="View receipt ${escapeHtml(
                                invoice.id
                            )}"
                            data-receipt="${escapeHtml(
                                invoice.id
                            )}"
                        >
                            <i class="bi bi-download"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

    tableBody
        .querySelectorAll("[data-receipt]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                showToast(
                    `Receipt ${button.dataset.receipt} will be downloaded from the backend later.`
                );
            });
        });
};

const configureAutoRenewal = () => {
    const switchInput =
        document.getElementById(
            "autoRenewSwitch"
        );

    switchInput.addEventListener(
        "change",
        () => {
            activeSubscription.autoRenew =
                switchInput.checked;

            saveSubscription();
            renderRenewalAlert();

            showToast(
                switchInput.checked
                    ? "Automatic renewal enabled."
                    : "Automatic renewal disabled."
            );
        }
    );
};

const renderRenewalAlert = () => {
    const alert =
        document.getElementById(
            "renewalAlert"
        );

    if (activeSubscription.autoRenew) {
        alert.className =
            "alert renewal-alert mt-4 mb-0";

        alert.textContent =
            `Your subscription will renew automatically on ${formatDate(
                activeSubscription.nextPaymentDate
            )}.`;

        return;
    }

    alert.className =
        "alert alert-warning mt-4 mb-0";

    alert.textContent =
        `Automatic renewal is disabled. Your plan will end on ${formatDate(
            activeSubscription.nextPaymentDate
        )}.`;
};

const configurePaymentMethod = () => {
    paymentModal =
        new bootstrap.Modal(
            document.getElementById(
                "paymentMethodModal"
            )
        );

    document.getElementById(
        "updatePaymentButton"
    ).addEventListener("click", () => {
        document.getElementById(
            "cardholderName"
        ).value = "";

        document.getElementById(
            "cardNumber"
        ).value = "";

        document.getElementById(
            "cardExpiry"
        ).value = activeSubscription.cardExpiry;

        document.getElementById(
            "cardCvv"
        ).value = "";

        paymentModal.show();
    });

    const cardNumberInput =
        document.getElementById(
            "cardNumber"
        );

    cardNumberInput.addEventListener(
        "input",
        () => {
            const digits =
                cardNumberInput.value
                    .replace(/\D/g, "")
                    .slice(0, 16);

            cardNumberInput.value =
                digits.replace(
                    /(\d{4})(?=\d)/g,
                    "$1 "
                );
        }
    );

    document.getElementById(
        "paymentMethodForm"
    ).addEventListener(
        "submit",
        savePaymentMethod
    );
};

const savePaymentMethod = (event) => {
    event.preventDefault();

    const cardNumber =
        document.getElementById(
            "cardNumber"
        ).value.replace(/\D/g, "");

    const expiry =
        document.getElementById(
            "cardExpiry"
        ).value.trim();

    if (cardNumber.length !== 16) {
        showToast(
            "Enter a valid 16-digit card number."
        );

        return;
    }

    activeSubscription.lastFour =
        cardNumber.slice(-4);

    activeSubscription.cardExpiry =
        expiry;

    activeSubscription.paymentMethod =
        getCardBrand(cardNumber);

    saveSubscription();
    renderStatistics();
    renderPaymentInformation();

    paymentModal.hide();

    showToast(
        "Payment method updated successfully."
    );
};

const saveSubscription = () => {
    localStorage.setItem(
        storageKeys.subscription,
        JSON.stringify(activeSubscription)
    );
};

const getDefaultBranchLimit = (planName) => {
    const limits = {
        Starter: 1,
        Professional: 5,
        Enterprise: 15
    };

    return limits[planName] || 5;
};

const getDefaultPrice = (
    planName,
    billingCycle
) => {
    const monthlyPrices = {
        Starter: 15,
        Professional: 39,
        Enterprise: 89
    };

    const monthlyPrice =
        monthlyPrices[planName] || 39;

    return normalizeBillingCycle(billingCycle) === "annual"
        ? Math.round(monthlyPrice * 12 * 0.9)
        : monthlyPrice;
};

const calculateNextPaymentDate = (
    billingCycle,
    startDateValue
) => {
    const date =
        startDateValue
            ? new Date(startDateValue)
            : new Date();

    if (
        normalizeBillingCycle(billingCycle) ===
        "annual"
    ) {
        date.setFullYear(
            date.getFullYear() + 1
        );
    } else {
        date.setMonth(
            date.getMonth() + 1
        );
    }

    return date.toISOString();
};

const calculateDaysUntil = (dateValue) => {
    const targetDate =
        new Date(dateValue);

    const today =
        new Date();

    const difference =
        targetDate.getTime() -
        today.getTime();

    return Math.max(
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        ),
        0
    );
};

const normalizeBillingCycle = (value) => {
    const normalized =
        String(value || "")
            .toLowerCase();

    return (
        normalized === "annual" ||
        normalized === "yearly"
    )
        ? "annual"
        : "monthly";
};

const getCardBrand = (cardNumber) => {
    if (cardNumber.startsWith("4")) {
        return "Visa";
    }

    if (/^5[1-5]/.test(cardNumber)) {
        return "Mastercard";
    }

    return "Card";
};

const formatPrice = (value) => {
    return Number(value || 0).toFixed(2);
};

const formatDate = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

const capitalize = (value) => {
    return (
        String(value).charAt(0).toUpperCase() +
        String(value).slice(1)
    );
};

const showToast = (message) => {
    setText("toastMessage", message);

    bootstrap.Toast
        .getOrCreateInstance(
            document.getElementById(
                "subscriptionToast"
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

const setText = (id, value) => {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
};

const escapeHtml = (value) => {
    const element =
        document.createElement("div");

    element.textContent =
        String(value || "");

    return element.innerHTML;
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