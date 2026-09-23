const storageKeys = {
    branches: "wusoolOrganizationBranches",
    currentDraft: "wusoolCurrentBranchDraft",
    organization: "wusoolOrganization",
    registration: "wusoolOrganizationRegistration",
    loggedIn: "wusoolOrganizationLoggedIn",
    subscription: "wusoolActiveSubscription"
};

let currentBranch = null;

document.addEventListener("DOMContentLoaded", () => {
    protectPage();
    loadOrganizationInformation();
    loadCurrentBranch();
    renderSubmissionInformation();
    configureNavigation();
    configureSidebar();
});

const protectPage = () => {
    const isLoggedIn =
        sessionStorage.getItem(storageKeys.loggedIn) === "true";

    const subscription =
        getStoredObject(storageKeys.subscription, null);

    if (!isLoggedIn) {
        window.location.href =
            "./organization-login.html";

        return;
    }

    if (!subscription) {
        window.location.href =
            "./subscription-plans.html";
    }
};

const loadOrganizationInformation = () => {
    const organization =
        getStoredObject(storageKeys.organization, {});

    const registration =
        getStoredObject(storageKeys.registration, {});

    const organizationName =
        organization.organizationName ||
        organization.name ||
        registration.organizationName ||
        registration.name ||
        "Organization";

    document.getElementById(
        "organizationName"
    ).textContent = organizationName;
};

const loadCurrentBranch = () => {
    const parameters =
        new URLSearchParams(window.location.search);

    const branchId = parameters.get("id");

    const branches =
        getStoredObject(storageKeys.branches, []);

    currentBranch =
        branches.find((branch) => {
            return String(branch.id) ===
                   String(branchId);
        }) ||
        getStoredObject(storageKeys.currentDraft, null);

    if (!currentBranch) {
        window.location.href = "./branches.html";
        return;
    }

    document.title =
        `${getBranchName()} Submitted | Wusool`;
};

const renderSubmissionInformation = () => {
    const branchName = getBranchName();

    const location =
        [
            currentBranch.city,
            currentBranch.district
        ]
            .filter(Boolean)
            .join(", ") ||
        currentBranch.address ||
        "Location not provided";

    const referenceNumber =
        currentBranch.referenceNumber ||
        createReferenceNumber();

    const submittedAt =
        currentBranch.submittedAt ||
        new Date().toISOString();

    const score =
        currentBranch.aiReview?.score ??
        currentBranch.accessibilityScore ??
        0;

    document.getElementById(
        "branchName"
    ).textContent = branchName;

    document.getElementById(
        "referenceNumber"
    ).textContent = referenceNumber;

    document.getElementById(
        "submittedDate"
    ).textContent = formatDate(submittedAt);

    document.getElementById(
        "branchLocation"
    ).textContent = location;

    document.getElementById(
        "accessibilityScore"
    ).textContent = `${score}%`;

    if (!currentBranch.referenceNumber) {
        updateBranchReference(
            referenceNumber,
            submittedAt
        );
    }
};

const updateBranchReference = (
    referenceNumber,
    submittedAt
) => {
    const branches =
        getStoredObject(storageKeys.branches, []);

    const branchIndex =
        branches.findIndex((branch) => {
            return String(branch.id) ===
                   String(currentBranch.id);
        });

    const updatedBranch = {
        ...currentBranch,
        referenceNumber,
        submittedAt,
        status: "pending-review",
        statusLabel: "Pending Review",
        isPublished: false
    };

    if (branchIndex >= 0) {
        branches[branchIndex] = updatedBranch;
    } else {
        branches.push(updatedBranch);
    }

    localStorage.setItem(
        storageKeys.branches,
        JSON.stringify(branches)
    );

    localStorage.setItem(
        storageKeys.currentDraft,
        JSON.stringify(updatedBranch)
    );

    currentBranch = updatedBranch;
};

const configureNavigation = () => {
    const branchId =
        encodeURIComponent(currentBranch.id);

    document.getElementById(
        "trackStatusLink"
    ).href =
        `./branch-review-status.html?id=${branchId}`;

    document.getElementById(
        "logoutButton"
    ).addEventListener("click", () => {
        sessionStorage.removeItem(
            storageKeys.loggedIn
        );

        window.location.href =
            "./organization-login.html";
    });
};

const configureSidebar = () => {
    const sidebar =
        document.getElementById(
            "organizationSidebar"
        );

    const toggleButton =
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

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("show");
        backdrop.classList.toggle("show");
    });

    backdrop.addEventListener(
        "click",
        closeSidebar
    );

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 992) {
            closeSidebar();
        }
    });
};

const getBranchName = () => {
    return (
        currentBranch.branchName ||
        currentBranch.name ||
        "New Branch"
    );
};

const formatDate = (dateValue) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
};

const createReferenceNumber = () => {
    const number =
        Date.now()
            .toString()
            .slice(-8);

    return `BR-${number}`;
};

const getStoredObject = (
    storageKey,
    fallbackValue
) => {
    try {
        const storedValue =
            localStorage.getItem(storageKey);

        return storedValue
            ? JSON.parse(storedValue)
            : fallbackValue;
    } catch (error) {
        console.error(
            `Unable to read ${storageKey}:`,
            error
        );

        return fallbackValue;
    }
};