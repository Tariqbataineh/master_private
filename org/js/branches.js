document.addEventListener("DOMContentLoaded", () => {
    if (!protectBranchesPage()) {
        return;
    }

    initializeBranches();
    initializeFilters();
    initializeSidebar();
    initializeAddBranchButtons();
    initializeDeleteBranch();
    initializeLogout();
    loadOrganizationName();
});

const defaultBranches = [
    {
        id: 1,
        name: "Main Branch",
        city: "Amman",
        type: "Main Location",
        score: 92,
        status: "approved",
        updatedAt: "2026-09-20T10:30:00"
    },
    {
        id: 2,
        name: "North Branch",
        city: "Irbid",
        type: "Service Branch",
        score: 78,
        status: "pending-review",
        updatedAt: "2026-09-21T13:15:00"
    },
    {
        id: 3,
        name: "Airport Branch",
        city: "Amman",
        type: "Service Branch",
        score: 64,
        status: "changes-required",
        updatedAt: "2026-09-22T09:45:00"
    },
    {
        id: 4,
        name: "Zarqa Branch",
        city: "Zarqa",
        type: "Service Branch",
        score: null,
        status: "draft",
        updatedAt: "2026-09-22T15:20:00"
    }
];

let organizationBranches = [];
let branchToDeleteId = null;
let deleteBranchModal = null;

const readStoredObject = (storage, key) => {
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

const protectBranchesPage = () => {
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

    const approvalStatus = (
        organization.approvalStatus ||
        localStorage.getItem(
            "wusoolOrganizationStatus"
        ) ||
        "pending"
    ).toLowerCase();

    if (approvalStatus !== "approved") {
        window.location.replace(
            "./registration-pending.html"
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

const getActiveSubscription = () => {
    const organization = readStoredObject(
        sessionStorage,
        "wusoolOrganization"
    );

    return (
        organization?.subscription ||
        readStoredObject(
            localStorage,
            "wusoolActiveSubscription"
        ) ||
        {
            planName: "Multi Branch",
            branchLimit: 5,
            status: "active"
        }
    );
};

const getBranchLimit = () => {
    const subscription = getActiveSubscription();

    return Number(subscription.branchLimit) || 1;
};

const initializeBranches = () => {
    const storedBranches = readStoredObject(
        localStorage,
        "wusoolOrganizationBranches"
    );

    if (Array.isArray(storedBranches)) {
        organizationBranches = storedBranches;
    } else {
        const branchLimit = getBranchLimit();

        organizationBranches =
            defaultBranches.slice(
                0,
                Math.min(
                    branchLimit,
                    defaultBranches.length
                )
            );

        saveBranches();
    }

    populateCityFilter();
    renderBranches();
};

const saveBranches = () => {
    localStorage.setItem(
        "wusoolOrganizationBranches",
        JSON.stringify(organizationBranches)
    );
};

const renderBranches = () => {
    const filteredBranches =
        getFilteredBranches();

    const tableBody = document.getElementById(
        "branchesTableBody"
    );

    const emptyState = document.getElementById(
        "emptyBranchesState"
    );

    tableBody.innerHTML = "";

    filteredBranches.forEach((branch) => {
        tableBody.appendChild(
            createBranchRow(branch)
        );
    });

    const hasResults =
        filteredBranches.length > 0;

    document
        .querySelector(".branches-table")
        .classList.toggle(
            "d-none",
            !hasResults
        );

    emptyState.classList.toggle(
        "d-none",
        hasResults
    );

    document.getElementById(
        "resultsCount"
    ).textContent =
        `${filteredBranches.length} ${
            filteredBranches.length === 1
                ? "branch"
                : "branches"
        }`;

    updateStatistics();
    updateSubscriptionUsage();
    updateAddBranchButton();
};

const createBranchRow = (branch) => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <div class="branch-name">
                <span class="branch-avatar">
                    <i class="bi bi-building"></i>
                </span>

                <div>
                    <strong>
                        ${escapeHtml(branch.name)}
                    </strong>

                    <small>
                        ${escapeHtml(branch.type)}
                    </small>
                </div>
            </div>
        </td>

        <td>
            <i class="bi bi-geo-alt text-secondary me-1"></i>
            ${escapeHtml(branch.city)}
        </td>

        <td>
            ${
                branch.score !== null
                    ? `<span class="score-value">
                           ${branch.score}%
                       </span>`
                    : `<span class="text-secondary">
                           Not scored
                       </span>`
            }
        </td>

        <td>
            ${createStatusBadge(branch.status)}
        </td>

        <td>
            <span class="text-secondary small">
                ${formatDate(branch.updatedAt)}
            </span>
        </td>

        <td class="text-end">
            ${createBranchActions(branch)}
        </td>
    `;

    return row;
};

const createStatusBadge = (status) => {
    const statusInformation = {
        approved: {
            label: "Approved",
            icon: "bi-check-circle-fill"
        },
        "pending-review": {
            label: "Pending Review",
            icon: "bi-hourglass-split"
        },
        "changes-required": {
            label: "Changes Required",
            icon: "bi-exclamation-circle-fill"
        },
        draft: {
            label: "Draft",
            icon: "bi-pencil"
        }
    };

    const currentStatus =
        statusInformation[status] ||
        statusInformation.draft;

    return `
        <span class="
            status-badge
            status-${status}
        ">
            <i class="bi ${currentStatus.icon}"></i>
            ${currentStatus.label}
        </span>
    `;
};

const createBranchActions = (branch) => {
    let primaryLink =
        `./organization-branch-details.html?id=${branch.id}`;

    let primaryLabel = "View";
    let primaryIcon = "bi-eye";

    if (
        branch.status === "draft" ||
        branch.status === "changes-required"
    ) {
        primaryLink =
            `./edit-branch.html?id=${branch.id}`;

        primaryLabel =
            branch.status === "draft"
                ? "Continue"
                : "Edit";

        primaryIcon = "bi-pencil-square";
    }

    if (branch.status === "pending-review") {
        primaryLink =
            `./branch-review-status.html?id=${branch.id}`;

        primaryLabel = "Track";
        primaryIcon = "bi-clock-history";
    }

    const deleteAction =
        branch.status === "draft"
            ? `
                <li>
                    <button
                        type="button"
                        class="dropdown-item text-danger"
                        onclick="openDeleteBranchModal(${branch.id})"
                    >
                        <i class="bi bi-trash me-2"></i>
                        Delete Draft
                    </button>
                </li>
            `
            : "";

    return `
        <div class="d-flex justify-content-end gap-2">
            <a
                href="${primaryLink}"
                class="btn btn-sm btn-outline-wusool"
            >
                <i class="bi ${primaryIcon} me-1"></i>
                ${primaryLabel}
            </a>

            <div class="dropdown">
                <button
                    type="button"
                    class="btn btn-sm action-button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-label="Branch actions"
                >
                    <i class="bi bi-three-dots-vertical"></i>
                </button>

                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <a
                            href="./organization-branch-details.html?id=${branch.id}"
                            class="dropdown-item"
                        >
                            <i class="bi bi-eye me-2"></i>
                            View Details
                        </a>
                    </li>

                    <li>
                        <a
                            href="./branch-review-status.html?id=${branch.id}"
                            class="dropdown-item"
                        >
                            <i class="bi bi-clock-history me-2"></i>
                            Review Status
                        </a>
                    </li>

                    ${deleteAction}
                </ul>
            </div>
        </div>
    `;
};

const getFilteredBranches = () => {
    const searchValue =
        document.getElementById(
            "branchSearch"
        ).value.trim().toLowerCase();

    const selectedCity =
        document.getElementById(
            "cityFilter"
        ).value;

    const selectedStatus =
        document.getElementById(
            "statusFilter"
        ).value;

    const sortValue =
        document.getElementById(
            "sortBranches"
        ).value;

    const filteredBranches =
        organizationBranches.filter((branch) => {
            const matchesSearch =
                branch.name
                    .toLowerCase()
                    .includes(searchValue) ||
                branch.city
                    .toLowerCase()
                    .includes(searchValue);

            const matchesCity =
                selectedCity === "all" ||
                branch.city === selectedCity;

            const matchesStatus =
                selectedStatus === "all" ||
                branch.status === selectedStatus;

            return (
                matchesSearch &&
                matchesCity &&
                matchesStatus
            );
        });

    return sortBranchResults(
        filteredBranches,
        sortValue
    );
};

const sortBranchResults = (
    branches,
    sortValue
) => {
    const sortedBranches = [...branches];

    if (sortValue === "name") {
        return sortedBranches.sort((first, second) => {
            return first.name.localeCompare(
                second.name
            );
        });
    }

    if (sortValue === "score-high") {
        return sortedBranches.sort((first, second) => {
            return (
                (second.score ?? -1) -
                (first.score ?? -1)
            );
        });
    }

    if (sortValue === "score-low") {
        return sortedBranches.sort((first, second) => {
            return (
                (first.score ?? 101) -
                (second.score ?? 101)
            );
        });
    }

    return sortedBranches.sort((first, second) => {
        return (
            new Date(second.updatedAt) -
            new Date(first.updatedAt)
        );
    });
};

const initializeFilters = () => {
    const filterElements = [
        document.getElementById(
            "branchSearch"
        ),
        document.getElementById(
            "cityFilter"
        ),
        document.getElementById(
            "statusFilter"
        ),
        document.getElementById(
            "sortBranches"
        )
    ];

    filterElements.forEach((element) => {
        element.addEventListener(
            element.tagName === "INPUT"
                ? "input"
                : "change",
            renderBranches
        );
    });
};

const populateCityFilter = () => {
    const cityFilter =
        document.getElementById(
            "cityFilter"
        );

    const cities = [
        ...new Set(
            organizationBranches.map(
                (branch) => branch.city
            )
        )
    ].sort();

    cities.forEach((city) => {
        const option =
            document.createElement("option");

        option.value = city;
        option.textContent = city;

        cityFilter.appendChild(option);
    });
};

const updateStatistics = () => {
    const approvedCount =
        organizationBranches.filter(
            (branch) =>
                branch.status === "approved"
        ).length;

    const pendingCount =
        organizationBranches.filter(
            (branch) =>
                branch.status ===
                "pending-review"
        ).length;

    const attentionCount =
        organizationBranches.filter(
            (branch) =>
                branch.status ===
                    "changes-required" ||
                branch.status === "draft"
        ).length;

    document.getElementById(
        "totalBranches"
    ).textContent =
        organizationBranches.length;

    document.getElementById(
        "approvedBranches"
    ).textContent = approvedCount;

    document.getElementById(
        "pendingBranches"
    ).textContent = pendingCount;

    document.getElementById(
        "attentionBranches"
    ).textContent = attentionCount;
};

const updateSubscriptionUsage = () => {
    const subscription =
        getActiveSubscription();

    const branchLimit =
        getBranchLimit();

    const branchCount =
        organizationBranches.length;

    const usagePercentage =
        Math.min(
            (branchCount / branchLimit) * 100,
            100
        );

    document.getElementById(
        "currentPlanName"
    ).textContent =
        `${subscription.planName} Plan`;

    document.getElementById(
        "branchUsageText"
    ).textContent =
        `${branchCount} of ${branchLimit} branches`;

    const progressBar =
        document.getElementById(
            "branchUsageProgress"
        );

    progressBar.style.width =
        `${usagePercentage}%`;

    progressBar.setAttribute(
        "aria-valuenow",
        usagePercentage.toString()
    );

    progressBar.setAttribute(
        "aria-valuemin",
        "0"
    );

    progressBar.setAttribute(
        "aria-valuemax",
        "100"
    );
};

const initializeAddBranchButtons = () => {
    document.getElementById(
        "addBranchButton"
    ).addEventListener(
        "click",
        handleAddBranch
    );

    document.getElementById(
        "emptyStateAddButton"
    ).addEventListener(
        "click",
        handleAddBranch
    );
};

const handleAddBranch = () => {
    const branchLimit =
        getBranchLimit();

    if (
        organizationBranches.length >=
        branchLimit
    ) {
        showToast(
            `Your current plan allows ${branchLimit} ${
                branchLimit === 1
                    ? "branch"
                    : "branches"
            }. Upgrade your subscription to add more.`,
            "warning"
        );

        return;
    }

    window.location.href =
        "./add-branch.html";
};

const updateAddBranchButton = () => {
    const addBranchButton =
        document.getElementById(
            "addBranchButton"
        );

    const limitReached =
        organizationBranches.length >=
        getBranchLimit();

    addBranchButton.innerHTML =
        limitReached
            ? `
                <i class="bi bi-lock me-2"></i>
                Branch Limit Reached
            `
            : `
                <i class="bi bi-plus-lg me-2"></i>
                Add New Branch
            `;

    addBranchButton.classList.toggle(
        "btn-wusool",
        !limitReached
    );

    addBranchButton.classList.toggle(
        "btn-secondary",
        limitReached
    );
};

const initializeDeleteBranch = () => {
    deleteBranchModal =
        new bootstrap.Modal(
            document.getElementById(
                "deleteBranchModal"
            )
        );

    document.getElementById(
        "confirmDeleteButton"
    ).addEventListener(
        "click",
        deleteSelectedBranch
    );
};

const openDeleteBranchModal = (branchId) => {
    const branch =
        organizationBranches.find(
            (item) => item.id === branchId
        );

    if (!branch || branch.status !== "draft") {
        return;
    }

    branchToDeleteId = branchId;

    document.getElementById(
        "deleteBranchName"
    ).textContent = branch.name;

    deleteBranchModal.show();
};

const deleteSelectedBranch = () => {
    if (branchToDeleteId === null) {
        return;
    }

    organizationBranches =
        organizationBranches.filter(
            (branch) =>
                branch.id !== branchToDeleteId
        );

    saveBranches();
    populateCityFilterAgain();
    renderBranches();

    deleteBranchModal.hide();

    branchToDeleteId = null;

    showToast(
        "The branch draft was deleted successfully.",
        "success"
    );
};

const populateCityFilterAgain = () => {
    const cityFilter =
        document.getElementById(
            "cityFilter"
        );

    const selectedValue =
        cityFilter.value;

    cityFilter.innerHTML = `
        <option value="all">
            All Cities
        </option>
    `;

    populateCityFilter();

    const optionExists =
        Array.from(cityFilter.options)
            .some((option) => {
                return option.value ===
                    selectedValue;
            });

    cityFilter.value =
        optionExists
            ? selectedValue
            : "all";
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

    const openButton =
        document.getElementById(
            "openSidebarButton"
        );

    const closeButton =
        document.getElementById(
            "closeSidebarButton"
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

    openButton?.addEventListener(
        "click",
        openSidebar
    );

    closeButton?.addEventListener(
        "click",
        closeSidebar
    );

    overlay.addEventListener(
        "click",
        closeSidebar
    );

    window.addEventListener(
        "resize",
        () => {
            if (window.innerWidth >= 992) {
                closeSidebar();
            }
        }
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

const showToast = (
    message,
    type = "success"
) => {
    const toastElement =
        document.getElementById(
            "branchesToast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );

    toastMessage.textContent = message;

    toastIcon.className =
        type === "warning"
            ? "bi bi-exclamation-triangle-fill text-warning me-2"
            : "bi bi-check-circle-fill text-success me-2";

    const toast =
        bootstrap.Toast.getOrCreateInstance(
            toastElement
        );

    toast.show();
};

const formatDate = (dateValue) => {
    return new Intl.DateTimeFormat(
        "en-JO",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(new Date(dateValue));
};

const escapeHtml = (value) => {
    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent =
        value ?? "";

    return temporaryElement.innerHTML;
};

/*
    Needed because the table action is created
    dynamically using HTML.
*/
window.openDeleteBranchModal =
    openDeleteBranchModal;