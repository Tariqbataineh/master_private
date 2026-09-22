document.addEventListener("DOMContentLoaded", () => {
    loadFailedPaymentInformation();
    keepSubscriptionInactive();
    initializeRetryButton();
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
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
};

const createDefaultFailureRecord = () => {
    const selectedPlan =
        getStoredObject(
            localStorage,
            "wusoolSelectedPlan"
        );

    if (!selectedPlan) {
        return null;
    }

    const referenceNumber =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return {
        attemptReference:
            `WSL-FAIL-${referenceNumber}`,
        organizationName:
            "Your Organization",
        billingEmail: "",
        plan: selectedPlan,
        cardLastFour: "0000",
        reason:
            "The payment information could not be verified. Check the card information and try again.",
        status: "failed",
        attemptDate:
            new Date().toISOString()
    };
};

const getFailureRecord = () => {
    const savedFailureRecord =
        getStoredObject(
            localStorage,
            "wusoolFailedPayment"
        );

    if (savedFailureRecord) {
        return savedFailureRecord;
    }

    const defaultFailureRecord =
        createDefaultFailureRecord();

    if (defaultFailureRecord) {
        localStorage.setItem(
            "wusoolFailedPayment",
            JSON.stringify(defaultFailureRecord)
        );
    }

    return defaultFailureRecord;
};

const loadFailedPaymentInformation = () => {
    const failureRecord =
        getFailureRecord();

    if (!failureRecord || !failureRecord.plan) {
        window.location.href =
            "./subscription-plans.html";

        return;
    }

    const selectedPlan =
        failureRecord.plan;

    document.getElementById(
        "failureReason"
    ).textContent =
        failureRecord.reason;

    document.getElementById(
        "planName"
    ).textContent =
        selectedPlan.name;

    document.getElementById(
        "paymentAmount"
    ).textContent =
        `${selectedPlan.currency} ${
            formatMoney(selectedPlan.totalPrice)
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
        failureRecord.organizationName;

    document.getElementById(
        "attemptReference"
    ).textContent =
        failureRecord.attemptReference;

    document.getElementById(
        "attemptDate"
    ).textContent =
        formatDate(failureRecord.attemptDate);

    document.getElementById(
        "paymentMethod"
    ).textContent =
        `Card ending in ${
            failureRecord.cardLastFour
        }`;

    document.title =
        `${selectedPlan.name} Payment Failed | Wusool`;
};

const keepSubscriptionInactive = () => {
    localStorage.setItem(
        "wusoolSubscriptionStatus",
        "inactive"
    );

    localStorage.setItem(
        "wusoolRegistrationStep",
        "payment-failed"
    );
};

const initializeRetryButton = () => {
    const retryPaymentButton =
        document.getElementById(
            "retryPaymentButton"
        );

    retryPaymentButton.addEventListener(
        "click",
        () => {
            localStorage.removeItem(
                "wusoolFailedPayment"
            );

            localStorage.setItem(
                "wusoolRegistrationStep",
                "checkout"
            );
        }
    );
};