const defaultAccessibilityFeatures = [

    {
        key: "accessibleEntrance",
        title: "Accessible Entrance",
        description: "Step-free main entrance for visitors.",
        icon: "bi-door-open"
    },
    {
        key: "entranceRamp",
        title: "Entrance Ramp",
        description: "Ramp with safe slope and handrails.",
        icon: "bi-signpost-split"
    },
    {
        key: "accessibleParking",
        title: "Accessible Parking",
        description: "Reserved parking near the entrance.",
        icon: "bi-p-square"
    },
    {
        key: "elevator",
        title: "Elevator",
        description: "Accessible elevator for upper floors.",
        icon: "bi-arrow-down-up"
    },
    {
        key: "accessibleRestroom",
        title: "Accessible Restroom",
        description: "Restroom designed for wheelchair users.",
        icon: "bi-person-wheelchair"
    },
    {
        key: "widePathways",
        title: "Wide Pathways",
        description: "Clear internal paths with enough width.",
        icon: "bi-arrows-expand"
    },
    {
        key: "automaticDoors",
        title: "Automatic Doors",
        description: "Automatic or easy-to-open doors.",
        icon: "bi-door-closed"
    },
    {
        key: "tactilePaving",
        title: "Tactile Paving",
        description: "Tactile guidance for visually impaired visitors.",
        icon: "bi-grid-3x3-gap"
    },
    {
        key: "brailleSigns",
        title: "Braille Signs",
        description: "Important signs include Braille information.",
        icon: "bi-badge-3d"
    },
    {
        key: "hearingSupport",
        title: "Hearing Support",
        description: "Visual alerts or hearing assistance available.",
        icon: "bi-ear"
    },
    {
        key: "wheelchairAvailable",
        title: "Wheelchair Available",
        description: "A wheelchair can be requested at the branch.",
        icon: "bi-person-wheelchair"
    },
    {
        key: "staffAssistance",
        title: "Staff Assistance",
        description: "Staff members can provide accessibility support.",
        icon: "bi-people"
    }

];

const accessibilityFeatures =
    window.WusoolAccessibilityConfig
        ?.getRequirements?.()
        ?.map((item) => ({
            key: item.key || item.id,
            title: item.title,
            description: item.description,
            icon: item.icon || "bi-universal-access",
            weight: Number(item.weight || 1),
            required: Boolean(item.required),
            category: item.category || "General"
        }))
        || defaultAccessibilityFeatures;

let currentBranch = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!protectPage()) {
        return;
    }

    currentBranch = getCurrentBranch();

    if (!currentBranch) {
        window.location.replace(
            "./branches.html"
        );

        return;
    }

    renderAccessibilityFeatures();
    restoreAccessibilityData();
    initializeForm();
    initializeNotesCounter();
    initializeSidebar();
    initializeLogout();
    loadPageInformation();
});

const readStoredObject = (storage, key) => {
    try {
        const value = storage.getItem(key);

        return value
            ? JSON.parse(value)
            : null;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const protectPage = () => {
    const organization = readStoredObject(
        sessionStorage,
        "wusoolOrganization"
    );

    const loggedIn =
        sessionStorage.getItem(
            "wusoolOrganizationLoggedIn"
        ) === "true";

    if (!organization || !loggedIn) {
        window.location.replace(
            "./organization-login.html"
        );

        return false;
    }

    const subscriptionStatus = (
        organization.subscriptionStatus ||
        localStorage.getItem(
            "wusoolSubscriptionStatus"
        ) ||
        "inactive"
    ).toLowerCase();

    if (subscriptionStatus !== "active") {
        window.location.replace(
            "./subscription-plans.html"
        );

        return false;
    }

    return true;
};

const getBranchId = () => {
    const parameters =
        new URLSearchParams(
            window.location.search
        );

    return Number(parameters.get("id"));
};

const getCurrentBranch = () => {
    const branchId = getBranchId();

    const branches =
        readStoredObject(
            localStorage,
            "wusoolOrganizationBranches"
        ) || [];

    return (
        branches.find((branch) => {
            return Number(branch.id) === branchId;
        }) ||
        readStoredObject(
            localStorage,
            "wusoolCurrentBranchDraft"
        )
    );
};

const renderAccessibilityFeatures = () => {
    const container =
        document.getElementById(
            "accessibilityFeatures"
        );

    container.innerHTML = "";

    accessibilityFeatures.forEach(
        (feature) => {
            const column =
                document.createElement("div");

            column.className =
                "col-12 col-md-6";

            column.innerHTML = `
                <article
                    class="accessibility-feature"
                    data-feature="${feature.key}"
                >
                    <div class="feature-heading">
                        <span class="feature-icon">
                            <i class="bi ${feature.icon}"></i>
                        </span>

                        <div>
                            <h3>${feature.title}</h3>
                            <p>${feature.description}</p>
                        </div>
                    </div>

                    <div class="feature-options">
                        ${createOption(
                            feature.key,
                            "available",
                            "Available"
                        )}

                        ${createOption(
                            feature.key,
                            "not-available",
                            "Not Available"
                        )}

                        ${createOption(
                            feature.key,
                            "not-sure",
                            "Not Sure"
                        )}
                    </div>
                </article>
            `;

            container.appendChild(column);
        }
    );

    document.getElementById(
        "totalFeatures"
    ).textContent =
        accessibilityFeatures.length;

    document.querySelectorAll(
        '.feature-option input[type="radio"]'
    ).forEach((radio) => {
        radio.addEventListener(
            "change",
            updateCompletionProgress
        );
    });
};

const createOption = (
    featureKey,
    value,
    label
) => {
    const inputId =
        `${featureKey}-${value}`;

    return `
        <div class="feature-option">
            <input
                type="radio"
                id="${inputId}"
                name="${featureKey}"
                value="${value}"
            >

            <label for="${inputId}">
                ${label}
            </label>
        </div>
    `;
};

const restoreAccessibilityData = () => {
    const savedAccessibility =
        currentBranch.accessibility || {};

    accessibilityFeatures.forEach(
        (feature) => {
            const savedValue =
                savedAccessibility[feature.key];

            if (!savedValue) {
                return;
            }

            const radio =
                document.querySelector(
                    `input[name="${feature.key}"]` +
                    `[value="${savedValue}"]`
                );

            if (radio) {
                radio.checked = true;
            }
        }
    );

    document.getElementById(
        "accessibilityNotes"
    ).value =
        currentBranch.accessibilityNotes || "";

    updateCompletionProgress();
    updateNotesCounter();
};

const updateCompletionProgress = () => {
    let completedCount = 0;

    accessibilityFeatures.forEach(
        (feature) => {
            const selectedOption =
                document.querySelector(
                    `input[name="${feature.key}"]:checked`
                );

            const featureCard =
                document.querySelector(
                    `[data-feature="${feature.key}"]`
                );

            featureCard.classList.toggle(
                "completed",
                Boolean(selectedOption)
            );

            if (selectedOption) {
                completedCount += 1;
            }
        }
    );

    const percentage =
        (
            completedCount /
            accessibilityFeatures.length
        ) * 100;

    document.getElementById(
        "completedFeatures"
    ).textContent = completedCount;

    const progressBar =
        document.getElementById(
            "accessibilityProgress"
        );

    progressBar.style.width =
        `${percentage}%`;

    progressBar.setAttribute(
        "aria-valuenow",
        percentage.toString()
    );

    progressBar.setAttribute(
        "aria-valuemin",
        "0"
    );

    progressBar.setAttribute(
        "aria-valuemax",
        "100"
    );

    if (
        completedCount ===
        accessibilityFeatures.length
    ) {
        document.getElementById(
            "accessibilityValidation"
        ).classList.add("d-none");
    }
};

const collectAccessibilityData = () => {
    return accessibilityFeatures.reduce(
        (result, feature) => {
            const selectedOption =
                document.querySelector(
                    `input[name="${feature.key}"]:checked`
                );

            result[feature.key] =
                selectedOption?.value || null;

            return result;
        },
        {}
    );
};

const validateAccessibility = (
    accessibilityData
) => {
    const isComplete =
        accessibilityFeatures.every(
            (feature) => {
                return Boolean(
                    accessibilityData[
                        feature.key
                    ]
                );
            }
        );

    document.getElementById(
        "accessibilityValidation"
    ).classList.toggle(
        "d-none",
        isComplete
    );

    if (!isComplete) {
        document.querySelector(
            ".accessibility-feature:not(.completed)"
        )?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    return isComplete;
};

const initializeForm = () => {
    document.getElementById(
        "accessibilityForm"
    ).addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            const accessibilityData =
                collectAccessibilityData();

            if (
                !validateAccessibility(
                    accessibilityData
                )
            ) {
                return;
            }

            saveAccessibilityData(
                accessibilityData,
                true
            );

            window.location.href =
                `./branch-photos.html?id=${currentBranch.id}`;
        }
    );

    document.getElementById(
        "saveAccessibilityDraftButton"
    ).addEventListener(
        "click",
        () => {
            const accessibilityData =
                collectAccessibilityData();

            saveAccessibilityData(
                accessibilityData,
                false
            );

            showToast(
                "Accessibility information saved as a draft."
            );
        }
    );

    document.getElementById(
        "backButton"
    ).href =
        `./branch-working-hours.html?id=${currentBranch.id}`;
};

const saveAccessibilityData = (
    accessibilityData,
    completed
) => {
    const branches =
        readStoredObject(
            localStorage,
            "wusoolOrganizationBranches"
        ) || [];

    const updatedBranch = {
        ...currentBranch,
        accessibility:
            accessibilityData,
        accessibilityNotes:
            document.getElementById(
                "accessibilityNotes"
            ).value.trim(),
        completedSteps: {
            ...currentBranch.completedSteps,
            details: true,
            workingHours: true,
            accessibility: completed
        },
        updatedAt:
            new Date().toISOString()
    };

    const branchIndex =
        branches.findIndex((branch) => {
            return Number(branch.id) ===
                Number(currentBranch.id);
        });

    if (branchIndex >= 0) {
        branches[branchIndex] =
            updatedBranch;
    }

    localStorage.setItem(
        "wusoolOrganizationBranches",
        JSON.stringify(branches)
    );

    localStorage.setItem(
        "wusoolCurrentBranchDraft",
        JSON.stringify(updatedBranch)
    );

    currentBranch = updatedBranch;
};

const initializeNotesCounter = () => {
    document.getElementById(
        "accessibilityNotes"
    ).addEventListener(
        "input",
        updateNotesCounter
    );
};

const updateNotesCounter = () => {
    const notes =
        document.getElementById(
            "accessibilityNotes"
        ).value;

    document.getElementById(
        "notesCounter"
    ).textContent =
        `${notes.length} / 700`;
};

const loadPageInformation = () => {
    const organization =
        readStoredObject(
            sessionStorage,
            "wusoolOrganization"
        );

    document.getElementById(
        "sidebarOrganizationName"
    ).textContent =
        organization?.organizationName ||
        organization?.companyName ||
        organization?.name ||
        "Organization";

    document.getElementById(
        "pageTitle"
    ).textContent =
        `${currentBranch.name} Accessibility`;

    document.getElementById(
        "summaryBranchName"
    ).textContent =
        currentBranch.name;

    document.getElementById(
        "summaryBranchLocation"
    ).textContent =
        `${currentBranch.city || ""}${
            currentBranch.district
                ? `, ${currentBranch.district}`
                : ""
        }`;
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
        () => {
            sidebar.classList.add("open");
            overlay.classList.add("show");

            document.body.classList.add(
                "overflow-hidden"
            );
        }
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

const showToast = (message) => {
    document.getElementById(
        "toastMessage"
    ).textContent = message;

    bootstrap.Toast
        .getOrCreateInstance(
            document.getElementById(
                "accessibilityToast"
            )
        )
        .show();
};