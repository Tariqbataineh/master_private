document.addEventListener("DOMContentLoaded", () => {
    loadPaymentInformation();
    activateOrganizationSubscription();
    initializeDashboardButton();
    initializePrintButton();
});

const getStoredObject = (storage, key) => {
    try {
        const storedValue = storage.getItem(key);

        return storedValue
            ? JSON.parse(storedValue)
            : null;
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return null;
    }
};

const formatMoney = (amount) => {
    return Number(amount).toFixed(2);
};

const formatDate = (dateValue) => {
    const date = new Date(dateValue);

    return new Intl.DateTimeFormat(
        "en-JO",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(date);
};

const calculateRenewalDate = (
    paymentDate,
    billingCycle
) => {
    const renewalDate = new Date(paymentDate);

    if (billingCycle === "annual") {
        renewalDate.setFullYear(
            renewalDate.getFullYear() + 1
        );
    } else {
        renewalDate.setMonth(
            renewalDate.getMonth() + 1
        );
    }

    return renewalDate;
};

const loadPaymentInformation = () => {
    const paymentRecord =
        getStoredObject(
            localStorage,
            "wusoolPayment"
        );

    if (
        !paymentRecord ||
        paymentRecord.status !== "successful"
    ) {
        window.location.href =
            "./subscription-checkout.html";

        return;
    }

    const selectedPlan =
        paymentRecord.plan;

;

    const renewalDate =
        calculateRenewalDate(
            paymentRecord.paymentDate,
            selectedPlan.billingCycle
        );

    document.getElementById(
        "planName"
    ).textContent = selectedPlan.name;

    document.getElementById(
        "paymentAmount"
    ).textContent =
        `${paymentRecord.currency} ${
            formatMoney(paymentRecord.amount)
        }`;

    document.getElementById(
        "billingCycle"
    ).textContent =
        selectedPlan.billingCycle === "annual"
            ? "Annual billing"
            : "Monthly billing";

    document.getElementById(
        "organizationName"
    ).textContent =
        paymentRecord.organizationName;

    document.getElementById(
        "transactionId"
    ).textContent =
        paymentRecord.transactionId;

    document.getElementById(
        "paymentDate"
    ).textContent =
        formatDate(paymentRecord.paymentDate);

    document.getElementById(
        "paymentMethod"
    ).textContent =
        `Card ending in ${
            paymentRecord.cardLastFour
        }`;

    document.getElementById(
        "branchLimit"
    ).textContent =
        selectedPlan.branchLimit === 1
            ? "1 branch"
            : `Up to ${
                selectedPlan.branchLimit
            } branches`;

    document.getElementById(
        "renewalDate"
    ).textContent =
        formatDate(renewalDate);

    document.getElementById(
        "billingEmail"
    ).textContent =
        paymentRecord.billingEmail;

    document.title =
        `${selectedPlan.name} Activated | Wusool`;
};

const getOrganizationData = () => {
    const organizationSources = [
        getStoredObject(
            sessionStorage,
            "wusoolOrganization"
        ),
        getStoredObject(
            localStorage,
            "wusoolOrganization"
        ),
        getStoredObject(
            localStorage,
            "wusoolOrganizationRegistration"
        ),
        getStoredObject(
            localStorage,
            "organizationRegistration"
        )
    ];

    return organizationSources.find((item) => {
        return item !== null;
    }) || {};
};

const activateOrganizationSubscription = () => {
    const paymentRecord =
        getStoredObject(
            localStorage,
            "wusoolPayment"
        );

    if (!paymentRecord) {
        return;
    }

    const organizationData =
        getOrganizationData();

    const selectedPlan =
        paymentRecord.plan;

    const renewalDate =
        calculateRenewalDate(
            paymentRecord.paymentDate,
            selectedPlan.billingCycle
        );

    const activeSubscription = {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        billingCycle:
            selectedPlan.billingCycle,
        branchLimit:
            selectedPlan.branchLimit,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        status: "active",
        startDate:
            paymentRecord.paymentDate,
        renewalDate:
            renewalDate.toISOString(),
        transactionId:
            paymentRecord.transactionId
    };

    const updatedOrganizationData = {
        ...organizationData,
        organizationName:
            paymentRecord.organizationName,
        email:
            paymentRecord.billingEmail,
        approvalStatus: "approved",
        subscriptionStatus: "active",
        subscription: activeSubscription
    };

    sessionStorage.setItem(
        "wusoolOrganization",
        JSON.stringify(updatedOrganizationData)
    );

    localStorage.setItem(
        "wusoolOrganization",
        JSON.stringify(updatedOrganizationData)
    );

    localStorage.setItem(
        "wusoolActiveSubscription",
        JSON.stringify(activeSubscription)
    );

    localStorage.setItem(
        "wusoolOrganizationStatus",
        "approved"
    );

    localStorage.setItem(
        "wusoolSubscriptionStatus",
        "active"
    );

    localStorage.setItem(
        "wusoolRegistrationStep",
        "completed"
    );
};

const initializeDashboardButton = () => {
    const dashboardButton =
        document.getElementById(
            "dashboardButton"
        );

    dashboardButton.addEventListener(
        "click",
        () => {
            sessionStorage.setItem(
                "wusoolOrganizationLoggedIn",
                "true"
            );
        }
    );
};

const initializePrintButton = () => {
    const printReceiptButton =
        document.getElementById(
            "printReceiptButton"
        );

    printReceiptButton.addEventListener(
        "click",
        () => {
            window.print();
        }
    );
};