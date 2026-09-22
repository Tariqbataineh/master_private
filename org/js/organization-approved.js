document.addEventListener("DOMContentLoaded", () => {
    loadOrganizationInformation();
    saveApprovalStatus();
    prepareSubscriptionButton();
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

const getOrganizationData = () => {
    const possibleData = [
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

    return possibleData.find((item) => {
        return item !== null;
    }) || {};
};

const getOrganizationName = (organizationData) => {
    return (
        organizationData.organizationName ||
        organizationData.name ||
        organizationData.companyName ||
        "Your Organization"
    );
};

const createApprovalReference = () => {
    const savedReference =
        localStorage.getItem(
            "wusoolApprovalReference"
        );

    if (savedReference) {
        return savedReference;
    }

    const randomNumber =
        Math.floor(100000 + Math.random() * 900000);

    const approvalReference =
        `WSL-ORG-${randomNumber}`;

    localStorage.setItem(
        "wusoolApprovalReference",
        approvalReference
    );

    return approvalReference;
};

const loadOrganizationInformation = () => {
    const organizationData =
        getOrganizationData();

    const organizationName =
        getOrganizationName(organizationData);

    const approvalReference =
        createApprovalReference();

    document.getElementById(
        "organizationName"
    ).textContent = organizationName;

    document.getElementById(
        "detailsOrganizationName"
    ).textContent = organizationName;

    document.getElementById(
        "approvalReference"
    ).textContent = approvalReference;

    document.title =
        `${organizationName} Approved | Wusool`;
};

const saveApprovalStatus = () => {
    localStorage.setItem(
        "wusoolOrganizationStatus",
        "approved"
    );

    const organizationData =
        getOrganizationData();

    const updatedOrganizationData = {
        ...organizationData,
        approvalStatus: "approved",
        subscriptionStatus: (
            organizationData.subscriptionStatus ||
            "inactive"
        )
    };

    sessionStorage.setItem(
        "wusoolOrganization",
        JSON.stringify(updatedOrganizationData)
    );
};

const prepareSubscriptionButton = () => {
    const continueButton =
        document.getElementById("continueButton");

    continueButton.addEventListener(
        "click",
        () => {
            localStorage.setItem(
                "wusoolRegistrationStep",
                "subscription"
            );
        }
    );
};