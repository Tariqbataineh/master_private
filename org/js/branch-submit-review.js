const storageKeys = {
    branches: "wusoolOrganizationBranches",
    currentDraft: "wusoolCurrentBranchDraft",
    organization: "wusoolOrganization",
    registration: "wusoolOrganizationRegistration",
    loggedIn: "wusoolOrganizationLoggedIn",
    subscription: "wusoolActiveSubscription"
};

const daysOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const featureDefinitions = [
    {
        key: "accessible-entrance",
        title: "Accessible Entrance"
    },
    {
        key: "entrance-ramp",
        title: "Entrance Ramp"
    },
    {
        key: "accessible-parking",
        title: "Accessible Parking"
    },
    {
        key: "elevator",
        title: "Elevator"
    },
    {
        key: "accessible-restroom",
        title: "Accessible Restroom"
    },
    {
        key: "wide-pathways",
        title: "Wide Pathways"
    },
    {
        key: "automatic-doors",
        title: "Automatic Doors"
    },
    {
        key: "tactile-paving",
        title: "Tactile Paving"
    },
    {
        key: "braille-signs",
        title: "Braille Signs"
    },
    {
        key: "hearing-support",
        title: "Hearing Support"
    },
    {
        key: "wheelchair-service",
        title: "Wheelchair Service"
    },
    {
        key: "staff-assistance",
        title: "Staff Assistance"
    }
];

let currentBranch = null;
let submitModal = null;

document.addEventListener("DOMContentLoaded", () => {
    protectPage();
    loadOrganizationInformation();
    loadCurrentBranch();
    renderBranchDetails();
    renderWorkingHours();
    renderAccessibility();
    renderPhotos();
    renderAiScore();
    renderSubmissionChecklist();
    configureNavigation();
    configureSubmission();
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
        `${getBranchName()} Final Review | Wusool`;
};

const renderBranchDetails = () => {
    setText(
        "branchName",
        getBranchName()
    );

    setText(
        "branchCode",
        currentBranch.branchCode ||
        currentBranch.code ||
        "Not provided"
    );

    setText(
        "branchType",
        currentBranch.branchType ||
        currentBranch.type ||
        "Not provided"
    );

    setText(
        "branchCity",
        joinValues([
            currentBranch.city,
            currentBranch.district
        ]) || "Not provided"
    );

    setText(
        "branchAddress",
        currentBranch.address ||
        currentBranch.fullAddress ||
        "Not provided"
    );

    setText(
        "branchPhone",
        currentBranch.phone ||
        currentBranch.phoneNumber ||
        "Not provided"
    );

    setText(
        "branchEmail",
        currentBranch.email ||
        currentBranch.branchEmail ||
        "Not provided"
    );
};

const renderWorkingHours = () => {
    const container =
        document.getElementById(
            "workingHoursContainer"
        );

    const hours =
        currentBranch.workingHours || {};

    container.innerHTML =
        daysOrder.map((day) => {
            const dayData =
                getDayHours(hours, day);

            const isClosed =
                dayData.isClosed === true ||
                dayData.closed === true ||
                dayData.isOpen === false;

            const openingTime =
                dayData.openTime ||
                dayData.open ||
                "09:00";

            const closingTime =
                dayData.closeTime ||
                dayData.close ||
                "17:00";

            return `
                <div class="working-hours-item">

                    <span class="day-name">
                        ${day}
                    </span>

                    <span class="day-hours">
                        ${
                            isClosed
                                ? "Closed all day"
                                : `${formatTime(openingTime)} – ${formatTime(closingTime)}`
                        }
                    </span>

                    <span class="
                        ${isClosed
                            ? "closed-badge"
                            : "open-badge"
                        }
                    ">
                        ${isClosed ? "Closed" : "Open"}
                    </span>

                </div>
            `;
        }).join("");
};

const renderAccessibility = () => {
    const container =
        document.getElementById(
            "accessibilityContainer"
        );

    const features =
        normalizeAccessibilityFeatures();

    container.innerHTML =
        features.map((feature) => {
            const icon =
                getAccessibilityIcon(feature.status);

            const label =
                getAccessibilityLabel(feature.status);

            return `
                <div class="col-12 col-md-6">

                    <div class="
                        accessibility-result
                        ${feature.status}
                    ">

                        <span class="accessibility-status-icon">
                            <i class="bi ${icon}"></i>
                        </span>

                        <div>
                            <strong>
                                ${escapeHtml(feature.title)}
                            </strong>

                            <small>
                                ${label}
                            </small>
                        </div>

                    </div>

                </div>
            `;
        }).join("");
};

const renderPhotos = () => {
    const container =
        document.getElementById("photosContainer");

    const photos =
        Array.isArray(currentBranch.photos)
            ? currentBranch.photos
            : [];

    if (photos.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-message">
                    <i class="bi bi-image fs-3"></i>

                    <p class="mb-0 mt-2">
                        No branch photos have been added.
                    </p>
                </div>
            </div>
        `;

        return;
    }

    const groupedPhotos =
        photos.reduce((groups, photo) => {
            const category =
                photo.categoryTitle ||
                photo.categoryKey ||
                "Branch Photo";

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(photo);

            return groups;
        }, {});

    container.innerHTML =
        Object.entries(groupedPhotos)
            .map(([category, categoryPhotos]) => {
                return `
                    <div class="col-12 col-md-6">

                        <div class="photo-summary-card">

                            <span class="photo-summary-icon">
                                <i class="bi bi-images"></i>
                            </span>

                            <div>
                                <strong>
                                    ${escapeHtml(category)}
                                </strong>

                                <small>
                                    ${categoryPhotos.length}
                                    photo(s) uploaded
                                </small>
                            </div>

                        </div>

                    </div>
                `;
            })
            .join("");
};

const renderAiScore = () => {
    const aiReview =
        currentBranch.aiReview || {};

    const score =
        Number(
            aiReview.score ??
            currentBranch.accessibilityScore ??
            0
        );

    const scoreDegrees = score * 3.6;

    setText("aiScore", score);

    setText(
        "scoreLabel",
        aiReview.scoreLabel ||
        getScoreLabel(score)
    );

    document.getElementById(
        "scoreCircle"
    ).style.background = `
        conic-gradient(
            ${getScoreColor(score)} ${scoreDegrees}deg,
            #dcebea ${scoreDegrees}deg
        )
    `;
};

const renderSubmissionChecklist = () => {
    const completedSteps =
        currentBranch.completedSteps || {};

    const checklistItems = [
        {
            title: "Branch Details",
            icon: "bi-building",
            complete: hasBranchDetails()
        },
        {
            title: "Working Hours",
            icon: "bi-clock",
            complete:
                Boolean(currentBranch.workingHours) ||
                completedSteps.workingHours === true
        },
        {
            title: "Accessibility Information",
            icon: "bi-universal-access",
            complete:
                Boolean(
                    currentBranch.accessibility ||
                    currentBranch.accessibilityFeatures
                ) ||
                completedSteps.accessibility === true
        },
        {
            title: "Branch Photos",
            icon: "bi-images",
            complete:
                Array.isArray(currentBranch.photos) &&
                currentBranch.photos.length > 0
        },
        {
            title: "AI Review",
            icon: "bi-stars",
            complete:
                Boolean(currentBranch.aiReview) ||
                completedSteps.aiReview === true
        }
    ];

    const container =
        document.getElementById(
            "submissionChecklist"
        );

    container.innerHTML =
        checklistItems.map((item) => {
            return `
                <div class="checklist-item">

                    <span class="checklist-name">
                        <i class="bi ${item.icon}"></i>
                        ${item.title}
                    </span>

                    <span class="
                        checklist-status
                        ${item.complete
                            ? "complete"
                            : "incomplete"
                        }
                    ">
                        ${item.complete
                            ? "Complete"
                            : "Incomplete"
                        }
                    </span>

                </div>
            `;
        }).join("");
};

const configureNavigation = () => {
    const branchId =
        encodeURIComponent(currentBranch.id);

    document.getElementById(
        "editDetailsLink"
    ).href = `./add-branch.html?id=${branchId}`;

    document.getElementById(
        "editHoursLink"
    ).href =
        `./branch-working-hours.html?id=${branchId}`;

    document.getElementById(
        "editAccessibilityLink"
    ).href =
        `./branch-accessibility.html?id=${branchId}`;

    document.getElementById(
        "editPhotosLink"
    ).href =
        `./branch-photos.html?id=${branchId}`;

    document.getElementById(
        "viewAiReviewLink"
    ).href =
        `./branch-ai-review.html?id=${branchId}`;

    document.getElementById(
        "backButton"
    ).href =
        `./branch-ai-review.html?id=${branchId}`;

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

const configureSubmission = () => {
    const confirmationCheckbox =
        document.getElementById(
            "informationConfirmation"
        );

    const submitButton =
        document.getElementById(
            "submitBranchButton"
        );

    const confirmButton =
        document.getElementById(
            "confirmSubmissionButton"
        );

    submitModal = new bootstrap.Modal(
        document.getElementById(
            "submitConfirmationModal"
        )
    );

    confirmationCheckbox.addEventListener(
        "change",
        () => {
            submitButton.disabled =
                !confirmationCheckbox.checked;

            if (confirmationCheckbox.checked) {
                document
                    .getElementById(
                        "confirmationAlert"
                    )
                    .classList.add("d-none");
            }
        }
    );

    submitButton.addEventListener("click", () => {
        if (!confirmationCheckbox.checked) {
            document
                .getElementById(
                    "confirmationAlert"
                )
                .classList.remove("d-none");

            return;
        }

        submitModal.show();
    });

    confirmButton.addEventListener(
        "click",
        submitBranch
    );
};

const submitBranch = () => {
    const confirmButton =
        document.getElementById(
            "confirmSubmissionButton"
        );

    confirmButton.disabled = true;

    confirmButton.innerHTML = `
        <span
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
        ></span>
        Submitting...
    `;

    const branchReference =
        createBranchReference();

    const submittedBranch = {
        ...currentBranch,

        status: "pending-review",

        statusLabel: "Pending Review",

        referenceNumber: branchReference,

        submittedAt: new Date().toISOString(),

        isPublished: false,

        completedSteps: {
            ...(currentBranch.completedSteps || {}),
            submitted: true
        },

        updatedAt: new Date().toISOString()
    };

    const branches =
        getStoredObject(storageKeys.branches, []);

    const branchIndex =
        branches.findIndex((branch) => {
            return String(branch.id) ===
                   String(currentBranch.id);
        });

    if (branchIndex >= 0) {
        branches[branchIndex] = submittedBranch;
    } else {
        branches.push(submittedBranch);
    }

    localStorage.setItem(
        storageKeys.branches,
        JSON.stringify(branches)
    );

    localStorage.setItem(
        storageKeys.currentDraft,
        JSON.stringify(submittedBranch)
    );

    window.setTimeout(() => {
        submitModal.hide();

        window.location.href =
            `./branch-submission-success.html?id=${encodeURIComponent(
                submittedBranch.id
            )}`;
    }, 900);
};

const normalizeAccessibilityFeatures = () => {
    const accessibility =
        currentBranch.accessibility ||
        currentBranch.accessibilityFeatures ||
        {};

    if (Array.isArray(accessibility)) {
        return accessibility.map(
            (feature, index) => {
                const fallback =
                    featureDefinitions[index] || {};

                return {
                    key:
                        feature.key ||
                        feature.id ||
                        fallback.key ||
                        `feature-${index}`,

                    title:
                        feature.title ||
                        feature.name ||
                        fallback.title ||
                        "Accessibility Feature",

                    status: normalizeStatus(
                        feature.status ||
                        feature.value ||
                        feature.availability
                    )
                };
            }
        );
    }

    return featureDefinitions.map((feature) => {
        const storedValue =
            accessibility[feature.key] ??
            accessibility[toCamelCase(feature.key)] ??
            accessibility[feature.title];

        return {
            ...feature,
            status: normalizeStatus(storedValue)
        };
    });
};

const normalizeStatus = (value) => {
    if (
        value === true ||
        value === "available" ||
        value === "Available" ||
        value === "yes" ||
        value === "Yes"
    ) {
        return "available";
    }

    if (
        value === false ||
        value === "not-available" ||
        value === "Not Available" ||
        value === "no" ||
        value === "No"
    ) {
        return "not-available";
    }

    return "not-sure";
};

const getAccessibilityIcon = (status) => {
    if (status === "available") {
        return "bi-check-lg";
    }

    if (status === "not-available") {
        return "bi-x-lg";
    }

    return "bi-question-lg";
};

const getAccessibilityLabel = (status) => {
    if (status === "available") {
        return "Available";
    }

    if (status === "not-available") {
        return "Not Available";
    }

    return "Not Sure";
};

const getDayHours = (hours, day) => {
    const lowercaseDay =
        day.toLowerCase();

    if (Array.isArray(hours)) {
        return (
            hours.find((item) => {
                return String(
                    item.day || item.name
                ).toLowerCase() === lowercaseDay;
            }) || {}
        );
    }

    return (
        hours[day] ||
        hours[lowercaseDay] ||
        {}
    );
};

const formatTime = (timeValue) => {
    if (!timeValue) {
        return "—";
    }

    const [hourValue, minuteValue] =
        timeValue.split(":");

    const date = new Date();

    date.setHours(
        Number(hourValue),
        Number(minuteValue || 0)
    );

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
};

const hasBranchDetails = () => {
    return Boolean(
        currentBranch.branchName ||
        currentBranch.name
    );
};

const getBranchName = () => {
    return (
        currentBranch.branchName ||
        currentBranch.name ||
        "New Branch"
    );
};

const getScoreLabel = (score) => {
    if (score >= 85) {
        return "Excellent Accessibility";
    }

    if (score >= 70) {
        return "Very Good Accessibility";
    }

    if (score >= 55) {
        return "Good Accessibility";
    }

    if (score >= 40) {
        return "Needs Improvement";
    }

    return "Major Improvements Required";
};

const getScoreColor = (score) => {
    if (score >= 70) {
        return "#087f78";
    }

    if (score >= 50) {
        return "#e99a13";
    }

    return "#cf3f4f";
};

const createBranchReference = () => {
    const timePart =
        Date.now()
            .toString()
            .slice(-8);

    return `BR-${timePart}`;
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

const setText = (elementId, value) => {
    const element =
        document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
};

const joinValues = (values) => {
    return values.filter(Boolean).join(", ");
};

const toCamelCase = (value) => {
    return value.replace(
        /-([a-z])/g,
        (_, character) => character.toUpperCase()
    );
};

const escapeHtml = (value) => {
    const element =
        document.createElement("div");

    element.textContent =
        String(value || "");

    return element.innerHTML;
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