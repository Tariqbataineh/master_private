document.addEventListener("DOMContentLoaded", () => {
    if (!protectAddBranchPage()) {
        return;
    }

    initializeSidebar();
    initializeBranchForm();
    initializeSaveDraft();
    initializeLocationButton();
    initializeDescriptionCounter();
    initializeLogout();
    loadOrganizationName();
    restoreCurrentDraft();
});

const readStoredObject = (storage, key) => {
    try {
        const value = storage.getItem(key);

        return value
            ? JSON.parse(value)
            : null;
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return null;
    }
};

const protectAddBranchPage = () => {
    const organization = readStoredObject(
        sessionStorage,
        "wusoolOrganization"
    );

    const loggedIn =
        sessionStorage.getItem(
            "wusoolOrganizationLoggedIn"
        ) === "true";

    const subscriptionStatus = (
        organization?.subscriptionStatus ||
        localStorage.getItem(
            "wusoolSubscriptionStatus"
        ) ||
        "inactive"
    ).toLowerCase();

    if (!organization || !loggedIn) {
        window.location.replace(
            "./organization-login.html"
        );

        return false;
    }

    if (subscriptionStatus !== "active") {
        window.location.replace(
            "./subscription-plans.html"
        );

        return false;
    }

    const branches =
        readStoredObject(
            localStorage,
            "wusoolOrganizationBranches"
        ) || [];

    const subscription =
        organization.subscription ||
        readStoredObject(
            localStorage,
            "wusoolActiveSubscription"
        );

    const branchLimit =
        Number(subscription?.branchLimit) || 1;

    const currentDraft =
        readStoredObject(
            localStorage,
            "wusoolCurrentBranchDraft"
        );

    const draftAlreadyExists =
        currentDraft &&
        branches.some((branch) => {
            return branch.id === currentDraft.id;
        });

    if (
        branches.length >= branchLimit &&
        !draftAlreadyExists
    ) {
        window.location.replace(
            "./branches.html"
        );

        return false;
    }

    return true;
};

const initializeBranchForm = () => {
    const form =
        document.getElementById(
            "branchForm"
        );

    form.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            form.classList.add(
                "was-validated"
            );

            if (!form.checkValidity()) {
                form.querySelector(
                    ":invalid"
                )?.focus();

                return;
            }

            const savedBranch =
                saveBranchDraft();

            window.location.href =
                `./branch-working-hours.html?id=${savedBranch.id}`;
        }
    );
};

const initializeSaveDraft = () => {
    document.getElementById(
        "saveDraftButton"
    ).addEventListener(
        "click",
        () => {
            const branchName =
                document.getElementById(
                    "branchName"
                ).value.trim();

            if (!branchName) {
                showToast(
                    "Enter the branch name before saving the draft."
                );

                document.getElementById(
                    "branchName"
                ).focus();

                return;
            }

            saveBranchDraft();

            showToast(
                "Branch draft saved successfully."
            );
        }
    );
};

const createBranchData = () => {
    const currentDraft =
        readStoredObject(
            localStorage,
            "wusoolCurrentBranchDraft"
        );

    const branches =
        readStoredObject(
            localStorage,
            "wusoolOrganizationBranches"
        ) || [];

    const nextId =
        branches.length > 0
            ? Math.max(
                ...branches.map(
                    (branch) => Number(branch.id)
                )
            ) + 1
            : 1;

    return {
        id: currentDraft?.id || nextId,
        name: document.getElementById(
            "branchName"
        ).value.trim(),
        code: document.getElementById(
            "branchCode"
        ).value.trim(),
        type: document.getElementById(
            "branchType"
        ).value || "Service Branch",
        services: document.getElementById(
            "branchServices"
        ).value.trim(),
        city: document.getElementById(
            "branchCity"
        ).value,
        district: document.getElementById(
            "branchDistrict"
        ).value.trim(),
        address: document.getElementById(
            "branchAddress"
        ).value.trim(),
        latitude: document.getElementById(
            "latitude"
        ).value,
        longitude: document.getElementById(
            "longitude"
        ).value,
        phone: document.getElementById(
            "branchPhone"
        ).value.trim(),
        email: document.getElementById(
            "branchEmail"
        ).value.trim(),
        description: document.getElementById(
            "branchDescription"
        ).value.trim(),
        score: currentDraft?.score ?? null,
        status: "draft",
        completedSteps: {
            details: true,
            workingHours:
                currentDraft?.completedSteps
                    ?.workingHours || false,
            accessibility:
                currentDraft?.completedSteps
                    ?.accessibility || false,
            photos:
                currentDraft?.completedSteps
                    ?.photos || false,
            review: false
        },
        createdAt:
            currentDraft?.createdAt ||
            new Date().toISOString(),
        updatedAt:
            new Date().toISOString()
    };
};

const saveBranchDraft = () => {
    const branchData =
        createBranchData();

    const branches =
        readStoredObject(
            localStorage,
            "wusoolOrganizationBranches"
        ) || [];

    const existingBranchIndex =
        branches.findIndex((branch) => {
            return branch.id === branchData.id;
        });

    if (existingBranchIndex >= 0) {
        branches[existingBranchIndex] =
            branchData;
    } else {
        branches.push(branchData);
    }

    localStorage.setItem(
        "wusoolOrganizationBranches",
        JSON.stringify(branches)
    );

    localStorage.setItem(
        "wusoolCurrentBranchDraft",
        JSON.stringify(branchData)
    );

    return branchData;
};

const restoreCurrentDraft = () => {
    const currentDraft =
        readStoredObject(
            localStorage,
            "wusoolCurrentBranchDraft"
        );

    if (
        !currentDraft ||
        currentDraft.status !== "draft"
    ) {
        return;
    }

    setInputValue(
        "branchName",
        currentDraft.name
    );

    setInputValue(
        "branchCode",
        currentDraft.code
    );

    setInputValue(
        "branchType",
        currentDraft.type
    );

    setInputValue(
        "branchServices",
        currentDraft.services
    );

    setInputValue(
        "branchCity",
        currentDraft.city
    );

    setInputValue(
        "branchDistrict",
        currentDraft.district
    );

    setInputValue(
        "branchAddress",
        currentDraft.address
    );

    setInputValue(
        "latitude",
        currentDraft.latitude
    );

    setInputValue(
        "longitude",
        currentDraft.longitude
    );

    setInputValue(
        "branchPhone",
        currentDraft.phone
    );

    setInputValue(
        "branchEmail",
        currentDraft.email
    );

    setInputValue(
        "branchDescription",
        currentDraft.description
    );

    updateDescriptionCounter();
};

const setInputValue = (
    elementId,
    value
) => {
    document.getElementById(
        elementId
    ).value = value || "";
};

const initializeLocationButton = () => {
    document.getElementById(
        "useLocationButton"
    ).addEventListener(
        "click",
        requestCurrentLocation
    );
};

const requestCurrentLocation = () => {
    const message =
        document.getElementById(
            "locationMessage"
        );

    if (!navigator.geolocation) {
        message.textContent =
            "Location is not supported by this browser.";

        message.className =
            "d-block text-danger mt-2";

        return;
    }

    message.textContent =
        "Getting your current location...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            document.getElementById(
                "latitude"
            ).value =
                position.coords.latitude.toFixed(6);

            document.getElementById(
                "longitude"
            ).value =
                position.coords.longitude.toFixed(6);

            message.textContent =
                "Current coordinates added successfully.";

            message.className =
                "d-block text-success mt-2";
        },
        () => {
            message.textContent =
                "Location permission was denied. Enter the coordinates manually.";

            message.className =
                "d-block text-danger mt-2";
        }
    );
};

const initializeDescriptionCounter = () => {
    document.getElementById(
        "branchDescription"
    ).addEventListener(
        "input",
        updateDescriptionCounter
    );
};

const updateDescriptionCounter = () => {
    const description =
        document.getElementById(
            "branchDescription"
        ).value;

    document.getElementById(
        "descriptionCounter"
    ).textContent =
        `${description.length} / 500`;
};

const initializeSidebar = () => {
    const sidebar =
        document.getElementById(
            "organizationSidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );

    const openSidebar = () => {
        sidebar.classList.add("open");
        overlay.classList.add("show");

        document.body.classList.add(
            "overflow-hidden"
        );
    };

    const closeSidebar = () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");

        document.body.classList.remove(
            "overflow-hidden"
        );
    };

    document.getElementById(
        "openSidebarButton"
    )?.addEventListener(
        "click",
        openSidebar
    );

    document.getElementById(
        "closeSidebarButton"
    )?.addEventListener(
        "click",
        closeSidebar
    );

    overlay.addEventListener(
        "click",
        closeSidebar
    );
};

const initializeLogout = () => {
    document.getElementById(
        "logoutButton"
    ).addEventListener(
        "click",
        () => {
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
};

const loadOrganizationName = () => {
    const organization =
        readStoredObject(
            sessionStorage,
            "wusoolOrganization"
        );

    const organizationName =
        organization?.organizationName ||
        organization?.companyName ||
        organization?.name ||
        "Organization";

    document.getElementById(
        "sidebarOrganizationName"
    ).textContent = organizationName;
};

const showToast = (message) => {
    document.getElementById(
        "toastMessage"
    ).textContent = message;

    bootstrap.Toast
        .getOrCreateInstance(
            document.getElementById(
                "branchToast"
            )
        )
        .show();
};