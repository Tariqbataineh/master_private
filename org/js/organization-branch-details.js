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
    ["accessible-entrance", "Accessible Entrance"],
    ["entrance-ramp", "Entrance Ramp"],
    ["accessible-parking", "Accessible Parking"],
    ["elevator", "Elevator"],
    ["accessible-restroom", "Accessible Restroom"],
    ["wide-pathways", "Wide Pathways"],
    ["automatic-doors", "Automatic Doors"],
    ["tactile-paving", "Tactile Paving"],
    ["braille-signs", "Braille Signs"],
    ["hearing-support", "Hearing Support"],
    ["wheelchair-service", "Wheelchair Service"],
    ["staff-assistance", "Staff Assistance"]
];

let currentBranch = null;

document.addEventListener("DOMContentLoaded", () => {
    protectPage();
    loadOrganizationInformation();
    loadCurrentBranch();
    renderBranchHero();
    renderStatistics();
    renderGeneralInformation();
    renderWorkingHours();
    renderAccessibility();
    renderPhotos();
    renderReviewInformation();
    renderAiResult();
    configureLinks();
    configureSidebar();
});

const protectPage = () => {
    const loggedIn =
        sessionStorage.getItem(storageKeys.loggedIn) === "true";

    if (!loggedIn) {
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

const loadCurrentBranch = () => {
    const branchId =
        new URLSearchParams(
            window.location.search
        ).get("id");

    const branches =
        getStoredObject(storageKeys.branches, []);

    currentBranch =
        branches.find((branch) => {
            return String(branch.id) === String(branchId);
        }) ||
        getStoredObject(storageKeys.currentDraft, null);

    if (!currentBranch) {
        window.location.href = "./branches.html";
        return;
    }

    document.title =
        `${getBranchName()} | Wusool`;
};

const renderBranchHero = () => {
    const status = getBranchStatus();

    const badge =
        document.getElementById(
            "branchStatusBadge"
        );

    badge.className =
        `branch-status-badge ${status}`;

    badge.textContent =
        getStatusLabel(status);

    setText("branchName", getBranchName());

    setText(
        "branchLocation",
        getBranchLocation()
    );

    const editLink =
        document.getElementById(
            "editBranchLink"
        );

    if (status === "pending-review") {
        editLink.classList.add("d-none");
    }
};

const renderStatistics = () => {
    const features =
        normalizeAccessibilityFeatures();

    const availableCount =
        features.filter((feature) => {
            return feature.status === "available";
        }).length;

    const photos =
        Array.isArray(currentBranch.photos)
            ? currentBranch.photos
            : [];

    const score =
        Number(
            currentBranch.aiReview?.score ??
            currentBranch.accessibilityScore ??
            0
        );

    setText(
        "accessibilityScore",
        `${score}%`
    );

    setText("photosCount", photos.length);

    setText(
        "featuresCount",
        availableCount
    );

    setText(
        "upcomingVisits",
        currentBranch.upcomingVisits || 0
    );
};

const renderGeneralInformation = () => {
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
        "serviceType",
        currentBranch.serviceType ||
        currentBranch.service ||
        "Not provided"
    );

    setText(
        "cityDistrict",
        [
            currentBranch.city,
            currentBranch.district
        ].filter(Boolean).join(", ") ||
        "Not provided"
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

    setText(
        "branchDescription",
        currentBranch.description ||
        "No description provided."
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
            const data =
                getDayHours(hours, day);

            const isClosed =
                data.isClosed === true ||
                data.closed === true ||
                data.isOpen === false;

            const opening =
                data.openTime ||
                data.open ||
                "09:00";

            const closing =
                data.closeTime ||
                data.close ||
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
                                : `${formatTime(opening)} – ${formatTime(closing)}`
                        }
                    </span>

                    <span class="${
                        isClosed
                            ? "closed-badge"
                            : "open-badge"
                    }">
                        ${isClosed ? "Closed" : "Open"}
                    </span>

                </div>
            `;
        }).join("");
};

const renderAccessibility = () => {
    const features =
        normalizeAccessibilityFeatures();

    const container =
        document.getElementById(
            "accessibilityContainer"
        );

    container.innerHTML =
        features.map((feature) => {
            const details =
                getStatusDetails(feature.status);

            return `
                <div class="col-12 col-md-6">

                    <div class="
                        accessibility-item
                        ${feature.status}
                    ">

                        <span class="accessibility-icon">
                            <i class="bi ${details.icon}"></i>
                        </span>

                        <div>
                            <strong>
                                ${escapeHtml(feature.title)}
                            </strong>

                            <small>
                                ${details.label}
                            </small>
                        </div>

                    </div>

                </div>
            `;
        }).join("");
};

const renderPhotos = () => {
    const container =
        document.getElementById(
            "photosContainer"
        );

    const photos =
        Array.isArray(currentBranch.photos)
            ? currentBranch.photos
            : [];

    if (photos.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-message">
                    <i class="bi bi-images fs-3"></i>

                    <p class="mb-0 mt-2">
                        No reference photos uploaded.
                    </p>
                </div>
            </div>
        `;

        return;
    }

    container.innerHTML =
        photos.map((photo) => {
            const photoPreview = photo.imageData
                ? `
                    <img
                        src="${photo.imageData}"
                        alt="${escapeHtml(
                            photo.name ||
                            "Branch reference photo"
                        )}"
                        class="branch-photo-image"
                    >
                `
                : `
                    <span class="photo-icon">
                        <i class="bi bi-image"></i>
                    </span>
                `;

            return `
                <div class="col-12 col-md-6">

                    <article class="photo-card">

                        ${photoPreview}

                        <div class="overflow-hidden">
                            <strong>
                                ${escapeHtml(
                                    photo.categoryTitle ||
                                    photo.categoryKey ||
                                    "Branch Photo"
                                )}
                            </strong>

                            <small class="text-truncate">
                                ${escapeHtml(
                                    photo.name ||
                                    "Uploaded photo"
                                )}
                            </small>
                        </div>

                    </article>

                </div>
            `;
        }).join("");
};

const renderReviewInformation = () => {
    const status = getBranchStatus();

    setText(
        "reviewStatus",
        getStatusLabel(status)
    );

    setText(
        "referenceNumber",
        currentBranch.referenceNumber ||
        "Not submitted"
    );

    setText(
        "submittedDate",
        formatDate(currentBranch.submittedAt)
    );
};

const renderAiResult = () => {
    const score =
        Number(
            currentBranch.aiReview?.score ??
            currentBranch.accessibilityScore ??
            0
        );

    const scoreLabel =
        currentBranch.aiReview?.scoreLabel ||
        getScoreLabel(score);

    const scoreDegrees = score * 3.6;

    setText("scoreCircleValue", score);
    setText("scoreLabel", scoreLabel);

    setText(
        "scoreDescription",
        getScoreDescription(score)
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

const configureLinks = () => {
    const branchId =
        encodeURIComponent(currentBranch.id);

    document.getElementById(
        "statusActionLink"
    ).href =
        `./branch-review-status.html?id=${branchId}`;

    document.getElementById(
        "trackReviewLink"
    ).href =
        `./branch-review-status.html?id=${branchId}`;

    document.getElementById(
        "editBranchLink"
    ).href =
        `./edit-branch.html?id=${branchId}`;

    document.getElementById(
        "editHoursLink"
    ).href =
        `./branch-working-hours.html?id=${branchId}`;

    document.getElementById(
        "managePhotosLink"
    ).href =
        `./branch-photos.html?id=${branchId}`;

    document.getElementById(
        "editAccessibilityLink"
    ).href =
        `./branch-accessibility.html?id=${branchId}`;

    document.getElementById(
        "aiReportLink"
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

const normalizeAccessibilityFeatures = () => {
    const storedFeatures =
        currentBranch.accessibility ||
        currentBranch.accessibilityFeatures ||
        {};

    if (Array.isArray(storedFeatures)) {
        return storedFeatures.map(
            (feature, index) => {
                const fallback =
                    featureDefinitions[index] || [];

                return {
                    key:
                        feature.key ||
                        feature.id ||
                        fallback[0] ||
                        `feature-${index}`,

                    title:
                        feature.title ||
                        feature.name ||
                        fallback[1] ||
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

    return featureDefinitions.map(
        ([key, title]) => {
            const value =
                storedFeatures[key] ??
                storedFeatures[toCamelCase(key)] ??
                storedFeatures[title];

            return {
                key,
                title,
                status: normalizeStatus(value)
            };
        }
    );
};

const normalizeStatus = (value) => {
    if (
        value === true ||
        value === "available" ||
        value === "Available" ||
        value === "yes"
    ) {
        return "available";
    }

    if (
        value === false ||
        value === "not-available" ||
        value === "Not Available" ||
        value === "no"
    ) {
        return "not-available";
    }

    return "not-sure";
};

const getStatusDetails = (status) => {
    if (status === "available") {
        return {
            label: "Available",
            icon: "bi-check-lg"
        };
    }

    if (status === "not-available") {
        return {
            label: "Not Available",
            icon: "bi-x-lg"
        };
    }

    return {
        label: "Not Sure",
        icon: "bi-question-lg"
    };
};

const getBranchStatus = () => {
    const status =
        String(currentBranch.status || "draft")
            .toLowerCase()
            .trim()
            .replaceAll("_", "-")
            .replaceAll(" ", "-");

    const aliases = {
        pending: "pending-review",
        "under-review": "pending-review",
        "pending-review": "pending-review",
        approved: "approved",
        published: "approved",
        "changes-required": "changes-requested",
        "changes-requested": "changes-requested",
        rejected: "rejected",
        draft: "draft"
    };

    return aliases[status] || "draft";
};

const getStatusLabel = (status) => {
    const labels = {
        draft: "Draft",
        "pending-review": "Pending Review",
        approved: "Approved",
        "changes-requested": "Changes Requested",
        rejected: "Rejected"
    };

    return labels[status] || "Draft";
};

const getDayHours = (hours, day) => {
    if (Array.isArray(hours)) {
        return (
            hours.find((item) => {
                return String(
                    item.day || item.name
                ).toLowerCase() === day.toLowerCase();
            }) || {}
        );
    }

    return (
        hours[day] ||
        hours[day.toLowerCase()] ||
        {}
    );
};

const formatTime = (value) => {
    if (!value) {
        return "—";
    }

    const [hours, minutes] =
        value.split(":");

    const date = new Date();

    date.setHours(
        Number(hours),
        Number(minutes || 0)
    );

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
};

const formatDate = (value) => {
    if (!value) {
        return "Not submitted";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
};

const getBranchName = () => {
    return (
        currentBranch.branchName ||
        currentBranch.name ||
        "Branch"
    );
};

const getBranchLocation = () => {
    return (
        [
            currentBranch.city,
            currentBranch.district
        ].filter(Boolean).join(", ") ||
        currentBranch.address ||
        "Location not provided"
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

    return score > 0
        ? "Major Improvements Required"
        : "Not Analyzed";
};

const getScoreDescription = (score) => {
    if (score >= 70) {
        return "The branch provides strong accessibility support.";
    }

    if (score >= 50) {
        return "Some accessibility areas should be improved.";
    }

    if (score > 0) {
        return "Important accessibility improvements are required.";
    }

    return "Run the AI analysis to calculate the branch score.";
};

const getScoreColor = (score) => {
    if (score >= 70) {
        return "#087f78";
    }

    if (score >= 50) {
        return "#e99a13";
    }

    return score > 0
        ? "#cf3f4f"
        : "#b8c8c7";
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

const toCamelCase = (value) => {
    return value.replace(
        /-([a-z])/g,
        (_, letter) => letter.toUpperCase()
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