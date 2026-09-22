document.addEventListener("DOMContentLoaded", () => {
    loadSelectedPlan();
    loadOrganizationInformation();
    initializeCardNumberInput();
    initializeExpiryInput();
    initializeSecurityCodeInput();
    initializeSecurityCodeToggle();
    initializeCheckoutForm();
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

const getSelectedPlan = () => {
    return getStoredObject(
        localStorage,
        "wusoolSelectedPlan"
    );
};

const loadSelectedPlan = () => {
    const selectedPlan = getSelectedPlan();

    if (!selectedPlan) {
        window.location.href =
            "./subscription-plans.html";

        return;
    }

    const isAnnual =
        selectedPlan.billingCycle === "annual";

    const originalAnnualPrice =
        selectedPlan.monthlyPrice * 12;

    const discountAmount =
        originalAnnualPrice -
        selectedPlan.totalPrice;

    document.getElementById(
        "planName"
    ).textContent = selectedPlan.name;

    document.getElementById(
        "billingCycleText"
    ).textContent = isAnnual
        ? "Annual billing"
        : "Monthly billing";

    document.getElementById(
        "planBadge"
    ).textContent =
        selectedPlan.branchLimit === 1
            ? "1 branch"
            : `Up to ${selectedPlan.branchLimit} branches`;

    document.getElementById(
        "branchLimit"
    ).textContent =
        selectedPlan.branchLimit === 1
            ? "1 branch"
            : `${selectedPlan.branchLimit} branches`;

    document.getElementById(
        "billingCycle"
    ).textContent = isAnnual
        ? "Annual"
        : "Monthly";

    document.getElementById(
        "planPrice"
    ).textContent = isAnnual
        ? `JOD ${formatMoney(originalAnnualPrice)}`
        : `JOD ${formatMoney(selectedPlan.monthlyPrice)}`;

    document.getElementById(
        "totalPrice"
    ).textContent =
        `JOD ${formatMoney(selectedPlan.totalPrice)}`;

    document.getElementById(
        "renewalText"
    ).textContent = isAnnual
        ? "Renews annually"
        : "Renews monthly";

    const discountRow =
        document.getElementById("discountRow");

    if (isAnnual) {
        discountRow.classList.remove("d-none");

        document.getElementById(
            "discountAmount"
        ).textContent =
            `- JOD ${formatMoney(discountAmount)}`;
    } else {
        discountRow.classList.add("d-none");
    }
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

const loadOrganizationInformation = () => {
    const organizationData =
        getOrganizationData();

    const organizationName =
        organizationData.organizationName ||
        organizationData.companyName ||
        organizationData.name ||
        "";

    const organizationEmail =
        organizationData.email ||
        organizationData.organizationEmail ||
        "";

    const organizationPhone =
        organizationData.phone ||
        organizationData.phoneNumber ||
        "";

    document.getElementById(
        "organizationName"
    ).value = organizationName;

    document.getElementById(
        "billingEmail"
    ).value = organizationEmail;

    document.getElementById(
        "phoneNumber"
    ).value = organizationPhone;
};

const initializeCardNumberInput = () => {
    const cardNumberInput =
        document.getElementById("cardNumber");

    cardNumberInput.addEventListener(
        "input",
        () => {
            const digits =
                cardNumberInput.value
                    .replace(/\D/g, "")
                    .slice(0, 16);

            const groups =
                digits.match(/.{1,4}/g) || [];

            cardNumberInput.value =
                groups.join(" ");

            clearCustomValidation(
                cardNumberInput
            );
        }
    );
};

const initializeExpiryInput = () => {
    const expiryInput =
        document.getElementById("expiryDate");

    expiryInput.addEventListener("input", () => {
        const digits =
            expiryInput.value
                .replace(/\D/g, "")
                .slice(0, 4);

        if (digits.length >= 3) {
            expiryInput.value =
                `${digits.slice(0, 2)}/${digits.slice(2)}`;
        } else {
            expiryInput.value = digits;
        }

        clearCustomValidation(expiryInput);
    });
};

const initializeSecurityCodeInput = () => {
    const securityCodeInput =
        document.getElementById("securityCode");

    securityCodeInput.addEventListener(
        "input",
        () => {
            securityCodeInput.value =
                securityCodeInput.value
                    .replace(/\D/g, "")
                    .slice(0, 4);

            clearCustomValidation(
                securityCodeInput
            );
        }
    );
};

const initializeSecurityCodeToggle = () => {
    const toggleButton =
        document.getElementById(
            "toggleSecurityCode"
        );

    const securityCodeInput =
        document.getElementById(
            "securityCode"
        );

    toggleButton.addEventListener("click", () => {
        const isHidden =
            securityCodeInput.type === "password";

        securityCodeInput.type =
            isHidden ? "text" : "password";

        toggleButton.innerHTML = isHidden
            ? '<i class="bi bi-eye-slash"></i>'
            : '<i class="bi bi-eye"></i>';

        toggleButton.setAttribute(
            "aria-label",
            isHidden
                ? "Hide security code"
                : "Show security code"
        );
    });
};

const validateCardNumber = () => {
    const cardNumberInput =
        document.getElementById("cardNumber");

    const digits =
        cardNumberInput.value.replace(/\D/g, "");

    const isValid = digits.length === 16;

    setCustomValidation(
        cardNumberInput,
        isValid
    );

    return isValid;
};

const validateExpiryDate = () => {
    const expiryInput =
        document.getElementById("expiryDate");

    const expiryParts =
        expiryInput.value.split("/");

    if (expiryParts.length !== 2) {
        setCustomValidation(
            expiryInput,
            false
        );

        return false;
    }

    const month = Number(expiryParts[0]);
    const year = Number(`20${expiryParts[1]}`);

    const currentDate = new Date();
    const currentMonth =
        currentDate.getMonth() + 1;
    const currentYear =
        currentDate.getFullYear();

    const isValidMonth =
        month >= 1 && month <= 12;

    const isFutureDate =
        year > currentYear ||
        (
            year === currentYear &&
            month >= currentMonth
        );

    const isValid =
        isValidMonth && isFutureDate;

    setCustomValidation(expiryInput, isValid);

    return isValid;
};

const validateSecurityCode = () => {
    const securityCodeInput =
        document.getElementById(
            "securityCode"
        );

    const isValid =
        /^\d{3,4}$/.test(
            securityCodeInput.value
        );

    setCustomValidation(
        securityCodeInput,
        isValid
    );

    return isValid;
};

const setCustomValidation = (
    input,
    isValid
) => {
    input.classList.toggle(
        "is-invalid",
        !isValid
    );

    if (input.closest(".input-group")) {
        input.closest(".input-group")
            .classList.toggle(
                "invalid-group",
                !isValid
            );
    }
};

const clearCustomValidation = (input) => {
    input.classList.remove("is-invalid");

    if (input.closest(".input-group")) {
        input.closest(".input-group")
            .classList.remove(
                "invalid-group"
            );
    }
};

const createPaymentRecord = () => {
    const selectedPlan = getSelectedPlan();

    const cardNumber =
        document.getElementById(
            "cardNumber"
        ).value.replace(/\D/g, "");

    const transactionNumber =
        Math.floor(
            10000000 +
            Math.random() * 90000000
        );

    return {
        transactionId:
            `WSL-PAY-${transactionNumber}`,

        organizationName:
            document.getElementById(
                "organizationName"
            ).value.trim(),

        billingEmail:
            document.getElementById(
                "billingEmail"
            ).value.trim(),

        phoneNumber:
            document.getElementById(
                "phoneNumber"
            ).value.trim(),

        country:
            document.getElementById(
                "country"
            ).value,

        city:
            document.getElementById(
                "city"
            ).value,

        plan: selectedPlan,

        cardLastFour:
            cardNumber.slice(-4),

        amount:
            selectedPlan.totalPrice,

        currency:
            selectedPlan.currency,

        status: "successful",

        paymentDate:
            new Date().toISOString()
    };
};

const setPaymentLoading = (isLoading) => {
    const paymentButton =
        document.getElementById(
            "paymentButton"
        );

    const buttonText =
        document.getElementById(
            "paymentButtonText"
        );

    const buttonLoading =
        document.getElementById(
            "paymentButtonLoading"
        );

    paymentButton.disabled = isLoading;

    buttonText.classList.toggle(
        "d-none",
        isLoading
    );

    buttonLoading.classList.toggle(
        "d-none",
        !isLoading
    );
};

const processPayment = () => {
    setPaymentLoading(true);

    const paymentRecord =
        createPaymentRecord();

    const cardNumber =
        document.getElementById(
            "cardNumber"
        ).value.replace(/\D/g, "");

    setTimeout(() => {
        const shouldFail =
            cardNumber.endsWith("0000");

        if (shouldFail) {
            const failureReference =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                );

            const failedPayment = {
                attemptReference:
                    `WSL-FAIL-${failureReference}`,

                organizationName:
                    paymentRecord.organizationName,

                billingEmail:
                    paymentRecord.billingEmail,

                plan:
                    paymentRecord.plan,

                cardLastFour:
                    paymentRecord.cardLastFour,

                reason:
                    "The payment was declined. Check the card information or contact your bank.",

                status: "failed",

                attemptDate:
                    new Date().toISOString()
            };

            localStorage.setItem(
                "wusoolFailedPayment",
                JSON.stringify(failedPayment)
            );

            localStorage.setItem(
                "wusoolSubscriptionStatus",
                "inactive"
            );

            window.location.href =
                "./payment-failed.html";

            return;
        }

        localStorage.setItem(
            "wusoolPayment",
            JSON.stringify(paymentRecord)
        );

        localStorage.removeItem(
            "wusoolFailedPayment"
        );

        localStorage.setItem(
            "wusoolSubscriptionStatus",
            "active"
        );

        localStorage.setItem(
            "wusoolRegistrationStep",
            "payment-successful"
        );

        window.location.href =
            "./payment-success.html";
    }, 1200);
};

const initializeCheckoutForm = () => {
    const checkoutForm =
        document.getElementById(
            "checkoutForm"
        );

    checkoutForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            const isBootstrapValid =
                checkoutForm.checkValidity();

            const isCardNumberValid =
                validateCardNumber();

            const isExpiryValid =
                validateExpiryDate();

            const isSecurityCodeValid =
                validateSecurityCode();

            checkoutForm.classList.add(
                "was-validated"
            );

            const isFormValid =
                isBootstrapValid &&
                isCardNumberValid &&
                isExpiryValid &&
                isSecurityCodeValid;

            if (!isFormValid) {
                const firstInvalidElement =
                    checkoutForm.querySelector(
                        ":invalid, .is-invalid"
                    );

                firstInvalidElement?.focus();

                return;
            }

            processPayment();
        }
    );
};