document.addEventListener("DOMContentLoaded", () => {
    initializeBillingCycle();
    initializePlanButtons();
    restoreBillingPreference();
});

const annualDiscount = 0.10;

const getSelectedBillingCycle = () => {
    const selectedBillingInput =
        document.querySelector(
            'input[name="billingCycle"]:checked'
        );

    return selectedBillingInput
        ? selectedBillingInput.value
        : "monthly";
};

const calculatePlanPrice = (
    monthlyPrice,
    billingCycle
) => {
    if (billingCycle === "annual") {
        const annualPrice = monthlyPrice * 12;

        return annualPrice * (1 - annualDiscount);
    }

    return monthlyPrice;
};

const formatPrice = (price) => {
    return Number.isInteger(price)
        ? price.toString()
        : price.toFixed(2);
};

const updateDisplayedPrices = () => {
    const billingCycle =
        getSelectedBillingCycle();

    const planCards =
        document.querySelectorAll(".plan-card");

    planCards.forEach((planCard) => {
        const monthlyPrice =
            Number(planCard.dataset.monthlyPrice);

        const priceValue =
            planCard.querySelector(".price-value");

        const pricePeriod =
            planCard.querySelector(".price-period");

        const annualTotal =
            planCard.querySelector(".annual-total");

        const annualTotalValue =
            planCard.querySelector(
                ".annual-total-value"
            );

        if (billingCycle === "annual") {
            const annualPrice =
                calculatePlanPrice(
                    monthlyPrice,
                    "annual"
                );

            const monthlyEquivalent =
                annualPrice / 12;

            priceValue.textContent =
                formatPrice(monthlyEquivalent);

            pricePeriod.textContent =
                "/ month";

            annualTotalValue.textContent =
                formatPrice(annualPrice);

            annualTotal.classList.remove("d-none");
        } else {
            priceValue.textContent =
                formatPrice(monthlyPrice);

            pricePeriod.textContent =
                "/ month";

            annualTotal.classList.add("d-none");
        }
    });

    localStorage.setItem(
        "wusoolBillingCycle",
        billingCycle
    );
};

const initializeBillingCycle = () => {
    const billingInputs =
        document.querySelectorAll(
            'input[name="billingCycle"]'
        );

    billingInputs.forEach((billingInput) => {
        billingInput.addEventListener(
            "change",
            updateDisplayedPrices
        );
    });
};

const restoreBillingPreference = () => {
    const savedBillingCycle =
        localStorage.getItem(
            "wusoolBillingCycle"
        );

    if (savedBillingCycle === "annual") {
        document.getElementById(
            "annualBilling"
        ).checked = true;
    } else {
        document.getElementById(
            "monthlyBilling"
        ).checked = true;
    }

    updateDisplayedPrices();
};

const createSelectedPlan = (planCard) => {
    const billingCycle =
        getSelectedBillingCycle();

    const monthlyPrice =
        Number(planCard.dataset.monthlyPrice);

    const totalPrice =
        calculatePlanPrice(
            monthlyPrice,
            billingCycle
        );

    const monthlyEquivalent =
        billingCycle === "annual"
            ? totalPrice / 12
            : monthlyPrice;

    return {
        id: planCard.dataset.planId,
        name: planCard.dataset.planName,
        billingCycle,
        monthlyPrice,
        monthlyEquivalent,
        totalPrice,
        branchLimit: Number(
            planCard.dataset.branchLimit
        ),
        discount:
            billingCycle === "annual"
                ? annualDiscount * 100
                : 0,
        currency: "JOD",
        selectedAt: new Date().toISOString()
    };
};

const selectPlan = (planCard) => {
    const selectedPlan =
        createSelectedPlan(planCard);

    localStorage.setItem(
        "wusoolSelectedPlan",
        JSON.stringify(selectedPlan)
    );

    localStorage.setItem(
        "wusoolRegistrationStep",
        "checkout"
    );

    window.location.href =
        "./subscription-checkout.html";
};

const initializePlanButtons = () => {
    const selectPlanButtons =
        document.querySelectorAll(
            ".select-plan-button"
        );

    selectPlanButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const planCard =
                button.closest(".plan-card");

            selectPlan(planCard);
        });
    });
};