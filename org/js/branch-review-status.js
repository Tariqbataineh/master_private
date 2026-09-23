const storageKeys = {
    branches: "wusoolOrganizationBranches",
    currentDraft: "wusoolCurrentBranchDraft",
    organization: "wusoolOrganization",
    registration: "wusoolOrganizationRegistration",
    loggedIn: "wusoolOrganizationLoggedIn",
    subscription: "wusoolActiveSubscription"
};

const statusConfigurations = {
    "pending-review": {
        label: "Pending Review",
        title: "Your Branch Is Under Review",
        description:
            "The Wusool admin team is reviewing the branch details, accessibility information, and reference photos.",
        icon: "bi-hourglass-split",
        className: "pending",
        currentMessage: "Waiting for admin decision",
        nextAction:
            "No action is required while the branch is being reviewed."
    },

    "changes-requested": {
        label: "Changes Requested",
        title: "The Branch Requires Updates",
        description:
            "The admin found information that needs to be corrected before the branch can be approved.",
        icon: "bi-pencil-square",
        className: "changes-requested",
        currentMessage: "Action required from your organization",
        nextAction:
            "Review the admin feedback, update the branch information, and resubmit it."
    },

    approved: {
        label: "Approved",
        title: "Your Branch Has Been Approved",
        description:
            "The branch was verified and is now available to Wusool visitors.",
        icon: "bi-patch-check-fill",
        className: "approved",
        currentMessage: "Approved and published",
        nextAction:
            "The branch is active. Keep its accessibility information and photos updated."
    },

    rejected: {
        label: "Rejected",
        title: "The Branch Was Not Approved",
        description:
            "The submitted branch could not be approved. Review the admin decision for more information.",
        icon: "bi-x-circle",
        className: "rejected",
        currentMessage: "Submission closed",
        nextAction:
            "Review the admin feedback and contact Wusool support if you need assistance."
    }
};

let currentBranch = null;
let currentStatus = "pending-review";

document.addEventListener("DOMContentLoaded", () => {
    protectPage();
    loadOrganizationInformation();
    loadCurrentBranch();
    renderBranchInformation();
    renderStatus();
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

    currentStatus =
        normalizeBranchStatus(currentBranch.status);

    document.title =
        `${getBranchName()} Review Status | Wusool`;
};

const renderBranchInformation = () => {
    const location =
        [
            currentBranch.city,
            currentBranch.district
        ]
            .filter(Boolean)
            .join(", ") ||
        currentBranch.address ||
        "Location not provided";

    const score =
        currentBranch.aiReview?.score ??
        currentBranch.accessibilityScore ??
        0;

    setText(
        "branchName",
        getBranchName()
    );

    setText(
        "referenceNumber",
        currentBranch.referenceNumber ||
        "Not available"
    );

    setText(
        "submittedDate",
        formatDate(currentBranch.submittedAt)
    );

    setText(
        "branchLocation",
        location
    );

    setText(
        "accessibilityScore",
        `${score}%`
    );
};

const renderStatus = () => {
    const configuration =
        statusConfigurations[currentStatus];

    renderStatusHero(configuration);
    renderCurrentStatus(configuration);
    renderTimeline();
    renderAdminFeedback();
    renderDynamicAction(configuration);
};

const renderStatusHero = (configuration) => {
    const hero =
        document.getElementById("statusHero");

    hero.className =
        `status-hero ${configuration.className}`;

    document.getElementById(
        "statusMainIcon"
    ).innerHTML =
        `<i class="bi ${configuration.icon}"></i>`;

    const badge =
        document.getElementById("statusBadge");

    badge.className =
        `status-badge ${configuration.className}`;

    badge.textContent =
        configuration.label;

    setText(
        "statusTitle",
        configuration.title
    );

    setText(
        "statusDescription",
        configuration.description
    );
};

const renderCurrentStatus = (configuration) => {
    const statusIcon =
        document.getElementById(
            "currentStatusIcon"
        );

    statusIcon.className =
        `current-status-icon ${configuration.className}`;

    statusIcon.innerHTML =
        `<i class="bi ${configuration.icon}"></i>`;

    setText(
        "currentStatusLabel",
        configuration.label
    );

    setText(
        "currentStatusDate",
        configuration.currentMessage
    );

    setText(
        "nextActionDescription",
        configuration.nextAction
    );
};

const renderTimeline = () => {
    const timeline =
        document.getElementById(
            "reviewTimeline"
        );

    const submittedDate =
        formatDate(currentBranch.submittedAt);

    const reviewedDate =
        formatDate(
            currentBranch.reviewedAt ||
            currentBranch.approvedAt ||
            currentBranch.statusUpdatedAt
        );

    const steps = [
        {
            title: "Branch Submitted",
            description:
                "The organization submitted the branch information.",
            icon: "bi-check-lg",
            state: "completed",
            date: submittedDate
        },
        {
            title: "Admin Review",
            description:
                "The admin verifies branch details, photos, and accessibility information.",
            icon:
                currentStatus === "pending-review"
                    ? "bi-clock"
                    : "bi-check-lg",
            state:
                currentStatus === "pending-review"
                    ? "current"
                    : "completed",
            date:
                currentStatus === "pending-review"
                    ? "Currently in progress"
                    : reviewedDate
        },
        getDecisionTimelineStep(),
        {
            title: "Published to Visitors",
            description:
                currentStatus === "approved"
                    ? "The branch is visible on Wusool."
                    : "The branch will appear after approval.",
            icon:
                currentStatus === "approved"
                    ? "bi-check-lg"
                    : "bi-globe",
            state:
                currentStatus === "approved"
                    ? "completed"
                    : "",
            date:
                currentStatus === "approved"
                    ? reviewedDate
                    : ""
        }
    ];

    timeline.innerHTML =
        steps.map((step) => {
            return `
                <div class="timeline-item ${step.state}">

                    <span class="timeline-marker">
                        <i class="bi ${step.icon}"></i>
                    </span>

                    <div class="timeline-content">
                        <h3>${step.title}</h3>

                        <p>${step.description}</p>

                        ${
                            step.date
                                ? `
                                    <span class="timeline-date">
                                        ${step.date}
                                    </span>
                                `
                                : ""
                        }
                    </div>

                </div>
            `;
        }).join("");
};

const getDecisionTimelineStep = () => {
    if (currentStatus === "approved") {
        return {
            title: "Branch Approved",
            description:
                "The admin approved the branch information.",
            icon: "bi-check-lg",
            state: "completed",
            date: formatDate(
                currentBranch.approvedAt ||
                currentBranch.reviewedAt ||
                currentBranch.statusUpdatedAt
            )
        };
    }

    if (currentStatus === "changes-requested") {
        return {
            title: "Changes Requested",
            description:
                "The admin requested updates before approval.",
            icon: "bi-exclamation-lg",
            state: "error",
            date: formatDate(
                currentBranch.statusUpdatedAt ||
                currentBranch.reviewedAt
            )
        };
    }

    if (currentStatus === "rejected") {
        return {
            title: "Branch Rejected",
            description:
                "The branch submission was not approved.",
            icon: "bi-x-lg",
            state: "error",
            date: formatDate(
                currentBranch.statusUpdatedAt ||
                currentBranch.reviewedAt
            )
        };
    }

    return {
        title: "Admin Decision",
        description:
            "The organization will receive the review decision.",
        icon: "bi-shield-check",
        state: "",
        date: ""
    };
};

const renderAdminFeedback = () => {
    const feedbackCard =
        document.getElementById(
            "adminFeedbackCard"
        );

    const feedbackList =
        document.getElementById(
            "adminFeedbackList"
        );

    const adminFeedback =
        Array.isArray(currentBranch.adminFeedback)
            ? currentBranch.adminFeedback
            : [];

    if (
        currentStatus !== "changes-requested" &&
        currentStatus !== "rejected"
    ) {
        feedbackCard.classList.add("d-none");
        return;
    }

    const feedbackItems =
        adminFeedback.length > 0
            ? adminFeedback
            : [
                "Review the branch information and accessibility evidence.",
                "Upload clearer photos where required.",
                "Correct any missing or inaccurate information."
            ];

    feedbackList.innerHTML =
        feedbackItems.map((feedback, index) => {
            const feedbackText =
                typeof feedback === "string"
                    ? feedback
                    : feedback.message ||
                      feedback.description ||
                      "Update requested.";

            return `
                <div class="feedback-item">

                    <span class="feedback-number">
                        ${index + 1}
                    </span>

                    <p>
                        ${escapeHtml(feedbackText)}
                    </p>

                </div>
            `;
        }).join("");

    feedbackCard.classList.remove("d-none");
};

const renderDynamicAction = (configuration) => {
    const container =
        document.getElementById(
            "dynamicActionContainer"
        );

    const branchId =
        encodeURIComponent(currentBranch.id);

    if (currentStatus === "changes-requested") {
        container.innerHTML = `
            <a
                href="./add-branch.html?id=${branchId}"
                class="btn btn-wusool w-100"
            >
                <i class="bi bi-pencil me-2"></i>
                Make Requested Changes
            </a>
        `;

        return;
    }

    if (currentStatus === "approved") {
        container.innerHTML = `
            <a
                href="./organization-branch-details.html?id=${branchId}"
                class="btn btn-wusool w-100"
            >
                <i class="bi bi-eye me-2"></i>
                View Published Branch
            </a>
        `;

        return;
    }

    if (currentStatus === "rejected") {
        container.innerHTML = `
            <a
                href="./help-support.html"
                class="btn btn-outline-wusool w-100"
            >
                <i class="bi bi-headset me-2"></i>
                Contact Support
            </a>
        `;

        return;
    }

    container.innerHTML = `
        <a
            href="./branches.html"
            class="btn btn-outline-wusool w-100"
        >
            View All Branches
        </a>
    `;
};

const configureNavigation = () => {
    const branchId =
        encodeURIComponent(currentBranch.id);

    document.getElementById(
        "viewBranchLink"
    ).href =
        `./organization-branch-details.html?id=${branchId}`;

    document.getElementById(
        "refreshStatusButton"
    ).addEventListener("click", () => {
        reloadBranchFromStorage();
        renderBranchInformation();
        renderStatus();

        const toast =
            bootstrap.Toast.getOrCreateInstance(
                document.getElementById(
                    "statusToast"
                )
            );

        toast.show();
    });

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

const reloadBranchFromStorage = () => {
    const branches =
        getStoredObject(storageKeys.branches, []);

    const updatedBranch =
        branches.find((branch) => {
            return String(branch.id) ===
                   String(currentBranch.id);
        });

    if (updatedBranch) {
        currentBranch = updatedBranch;

        currentStatus =
            normalizeBranchStatus(
                currentBranch.status
            );
    }
};

const normalizeBranchStatus = (status) => {
    const normalizedStatus =
        String(status || "")
            .toLowerCase()
            .trim()
            .replaceAll("_", "-")
            .replaceAll(" ", "-");

    const statusAliases = {
        pending: "pending-review",
        "under-review": "pending-review",
        "pending-review": "pending-review",
        "changes-required": "changes-requested",
        "correction-requested": "changes-requested",
        "changes-requested": "changes-requested",
        approved: "approved",
        published: "approved",
        rejected: "rejected"
    };

    return (
        statusAliases[normalizedStatus] ||
        "pending-review"
    );
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
        "Branch"
    );
};

const formatDate = (dateValue) => {
    if (!dateValue) {
        return "Not available";
    }

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

const setText = (elementId, value) => {
    const element =
        document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
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