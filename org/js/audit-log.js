"use strict";

const auditStorageKey = "wusoolOrganizationAuditLog";

const defaultAuditActivities = [
    {
        id: 1,
        type: "authentication",
        action: "Account Login",
        actor: "Organization Manager",
        target: "Organization Account",
        description:
            "A successful login was made to the organization portal.",
        createdAt: "2026-09-23T09:15:00",
        ipAddress: "192.168.1.25",
        device: "Chrome on Windows"
    },
    {
        id: 2,
        type: "branch",
        action: "Branch Updated",
        actor: "Organization Manager",
        target: "Main Branch",
        description:
            "Working hours and contact information were updated.",
        createdAt: "2026-09-23T08:40:00",
        ipAddress: "192.168.1.25",
        device: "Chrome on Windows"
    },
    {
        id: 3,
        type: "photos",
        action: "Branch Photos Uploaded",
        actor: "Organization Manager",
        target: "Main Branch",
        description:
            "Four accessibility photos were uploaded for AI review.",
        createdAt: "2026-09-22T14:20:00",
        ipAddress: "192.168.1.25",
        device: "Chrome on Windows"
    },
    {
        id: 4,
        type: "review",
        action: "AI Report Completed",
        actor: "Wusool System",
        target: "Amman Branch",
        description:
            "The accessibility photo analysis report was completed.",
        createdAt: "2026-09-22T14:26:00",
        ipAddress: "System Action",
        device: "Wusool AI Service"
    },
    {
        id: 5,
        type: "ticket",
        action: "Ticket Status Updated",
        actor: "Organization Manager",
        target: "Ticket #WT-1024",
        description:
            "The visitor ticket status was changed to resolved.",
        createdAt: "2026-09-21T11:10:00",
        ipAddress: "192.168.1.25",
        device: "Chrome on Windows"
    },
    {
        id: 6,
        type: "subscription",
        action: "Subscription Renewed",
        actor: "Organization Manager",
        target: "Professional Plan",
        description:
            "The organization subscription was successfully renewed.",
        createdAt: "2026-09-20T10:05:00",
        ipAddress: "192.168.1.25",
        device: "Chrome on Windows"
    },
    {
        id: 7,
        type: "settings",
        action: "Profile Information Updated",
        actor: "Organization Manager",
        target: "Organization Profile",
        description:
            "The organization phone number and address were updated.",
        createdAt: "2026-09-18T13:45:00",
        ipAddress: "192.168.1.25",
        device: "Chrome on Windows"
    },
    {
        id: 8,
        type: "branch",
        action: "New Branch Added",
        actor: "Organization Manager",
        target: "Irbid Branch",
        description:
            "A new organization branch was created and submitted.",
        createdAt: "2026-09-16T12:30:00",
        ipAddress: "192.168.1.25",
        device: "Chrome on Windows"
    }
];

let auditActivities = [];
let filteredActivities = [];
let auditDetailsModal = null;

document.addEventListener("DOMContentLoaded", () => {
    initializeAuditLog();
});

const initializeAuditLog = () => {
    auditActivities = loadAuditActivities();
    filteredActivities = [...auditActivities];

    const modalElement =
        document.getElementById("auditDetailsModal");

    if (modalElement) {
        auditDetailsModal =
            new bootstrap.Modal(modalElement);
    }

    updateStatistics();
    renderAuditActivities(filteredActivities);
    connectAuditEvents();
};

const loadAuditActivities = () => {
    const savedActivities =
        localStorage.getItem(auditStorageKey);

    if (savedActivities) {
        try {
            const parsedActivities =
                JSON.parse(savedActivities);

            if (Array.isArray(parsedActivities)) {
                return parsedActivities;
            }
        } catch (error) {
            console.error(
                "Unable to read audit activities:",
                error
            );
        }
    }

    localStorage.setItem(
        auditStorageKey,
        JSON.stringify(defaultAuditActivities)
    );

    return [...defaultAuditActivities];
};

const connectAuditEvents = () => {
    document
        .getElementById("auditSearch")
        .addEventListener("input", applyAuditFilters);

    document
        .getElementById("actionTypeFilter")
        .addEventListener("change", applyAuditFilters);

    document
        .getElementById("dateFilter")
        .addEventListener("change", applyAuditFilters);

    document
        .getElementById("clearFiltersButton")
        .addEventListener("click", resetAuditFilters);

    document
        .getElementById("emptyResetButton")
        .addEventListener("click", resetAuditFilters);

    document
        .getElementById("exportAuditButton")
        .addEventListener("click", exportAuditLog);
};

const applyAuditFilters = () => {
    const searchValue = document
        .getElementById("auditSearch")
        .value
        .trim()
        .toLowerCase();

    const selectedType = document
        .getElementById("actionTypeFilter")
        .value;

    const selectedDate = document
        .getElementById("dateFilter")
        .value;

    filteredActivities = auditActivities.filter((activity) => {
        const searchableContent = [
            activity.action,
            activity.actor,
            activity.target,
            activity.description,
            activity.type
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            searchableContent.includes(searchValue);

        const matchesType =
            selectedType === "all" ||
            activity.type === selectedType;

        const matchesDate =
            checkDateFilter(activity.createdAt, selectedDate);

        return matchesSearch && matchesType && matchesDate;
    });

    renderAuditActivities(filteredActivities);
};

const checkDateFilter = (createdAt, selectedDate) => {
    if (selectedDate === "all") {
        return true;
    }

    const activityDate = new Date(createdAt);
    const currentDate = new Date();

    if (selectedDate === "today") {
        return (
            activityDate.getFullYear() ===
                currentDate.getFullYear() &&
            activityDate.getMonth() ===
                currentDate.getMonth() &&
            activityDate.getDate() ===
                currentDate.getDate()
        );
    }

    const days =
        selectedDate === "7-days" ? 7 : 30;

    const minimumDate = new Date();
    minimumDate.setDate(minimumDate.getDate() - days);

    return activityDate >= minimumDate;
};

const resetAuditFilters = () => {
    document.getElementById("auditSearch").value = "";
    document.getElementById("actionTypeFilter").value = "all";
    document.getElementById("dateFilter").value = "all";

    filteredActivities = [...auditActivities];

    renderAuditActivities(filteredActivities);
};

const renderAuditActivities = (activities) => {
    const tableCard =
        document.getElementById("auditTableCard");

    const tableBody =
        document.getElementById("auditTableBody");

    const emptyState =
        document.getElementById("emptyState");

    const resultsCount =
        document.getElementById("resultsCount");

    resultsCount.textContent = activities.length;
    tableBody.innerHTML = "";

    if (activities.length === 0) {
        tableCard.classList.add("d-none");
        emptyState.classList.remove("d-none");
        return;
    }

    tableCard.classList.remove("d-none");
    emptyState.classList.add("d-none");

    activities.forEach((activity) => {
        const typeInformation =
            getTypeInformation(activity.type);

        const formattedDate =
            formatDateTime(activity.createdAt);

        const tableRow =
            document.createElement("tr");

        tableRow.innerHTML = `
            <td>
                <div class="activity-date">
                    <strong>${formattedDate.date}</strong>
                    <span>${formattedDate.time}</span>
                </div>
            </td>

            <td>
                <div class="activity-cell">
                    <div class="activity-icon ${activity.type}">
                        <i class="bi ${typeInformation.icon}"></i>
                    </div>

                    <div>
                        <div class="activity-name">
                            ${escapeHtml(activity.action)}
                        </div>

                        <div class="activity-type">
                            ${typeInformation.label}
                        </div>
                    </div>
                </div>
            </td>

            <td>
                ${escapeHtml(activity.actor)}
            </td>

            <td>
                <span class="fw-semibold">
                    ${escapeHtml(activity.target)}
                </span>
            </td>

            <td>
                <p class="activity-description mb-0">
                    ${escapeHtml(activity.description)}
                </p>
            </td>

            <td class="text-end">
                <button
                    type="button"
                    class="details-button"
                    data-activity-id="${activity.id}"
                    aria-label="View ${escapeHtml(activity.action)} details"
                >
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(tableRow);
    });

    connectDetailsButtons();
};

const connectDetailsButtons = () => {
    const detailsButtons =
        document.querySelectorAll("[data-activity-id]");

    detailsButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const activityId =
                Number(button.dataset.activityId);

            showActivityDetails(activityId);
        });
    });
};

const showActivityDetails = (activityId) => {
    const selectedActivity =
        auditActivities.find((activity) => {
            return activity.id === activityId;
        });

    if (!selectedActivity) {
        return;
    }

    const typeInformation =
        getTypeInformation(selectedActivity.type);

    const formattedDate =
        formatDateTime(selectedActivity.createdAt);

    const modalIcon =
        document.getElementById("modalActivityIcon");

    modalIcon.className =
        `activity-icon ${selectedActivity.type}`;

    modalIcon.innerHTML = `
        <i class="bi ${typeInformation.icon}"></i>
    `;

    document.getElementById("modalAction").textContent =
        selectedActivity.action;

    document.getElementById("modalType").textContent =
        typeInformation.label;

    document.getElementById("modalDate").textContent =
        `${formattedDate.date} at ${formattedDate.time}`;

    document.getElementById("modalActor").textContent =
        selectedActivity.actor;

    document.getElementById("modalTarget").textContent =
        selectedActivity.target;

    document.getElementById("modalDescription").textContent =
        selectedActivity.description;

    document.getElementById("modalIpAddress").textContent =
        selectedActivity.ipAddress;

    document.getElementById("modalDevice").textContent =
        selectedActivity.device;

    auditDetailsModal.show();
};

const updateStatistics = () => {
    const todayCount =
        auditActivities.filter((activity) => {
            return checkDateFilter(
                activity.createdAt,
                "today"
            );
        }).length;

    const changeTypes = [
        "branch",
        "photos",
        "ticket",
        "subscription",
        "settings"
    ];

    const changesCount =
        auditActivities.filter((activity) => {
            return changeTypes.includes(activity.type);
        }).length;

    const securityCount =
        auditActivities.filter((activity) => {
            return activity.type === "authentication";
        }).length;

    document.getElementById("totalActivities").textContent =
        auditActivities.length;

    document.getElementById("todayActivities").textContent =
        todayCount;

    document.getElementById("changeActivities").textContent =
        changesCount;

    document.getElementById("securityActivities").textContent =
        securityCount;
};

const getTypeInformation = (type) => {
    const activityTypes = {
        authentication: {
            label: "Authentication",
            icon: "bi-shield-lock"
        },
        branch: {
            label: "Branch Management",
            icon: "bi-building"
        },
        photos: {
            label: "Branch Photos",
            icon: "bi-images"
        },
        review: {
            label: "AI Report",
            icon: "bi-stars"
        },
        ticket: {
            label: "Visitor Ticket",
            icon: "bi-ticket-perforated"
        },
        subscription: {
            label: "Subscription",
            icon: "bi-credit-card"
        },
        settings: {
            label: "Settings",
            icon: "bi-gear"
        }
    };

    return (
        activityTypes[type] || {
            label: "General Activity",
            icon: "bi-clock-history"
        }
    );
};

const formatDateTime = (dateValue) => {
    const date = new Date(dateValue);

    const formattedDate =
        new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);

    const formattedTime =
        new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit"
        }).format(date);

    return {
        date: formattedDate,
        time: formattedTime
    };
};

const exportAuditLog = () => {
    if (filteredActivities.length === 0) {
        return;
    }

    const headings = [
        "Date",
        "Time",
        "Activity",
        "Type",
        "Actor",
        "Target",
        "Description",
        "IP Address",
        "Device"
    ];

    const rows = filteredActivities.map((activity) => {
        const formattedDate =
            formatDateTime(activity.createdAt);

        const typeInformation =
            getTypeInformation(activity.type);

        return [
            formattedDate.date,
            formattedDate.time,
            activity.action,
            typeInformation.label,
            activity.actor,
            activity.target,
            activity.description,
            activity.ipAddress,
            activity.device
        ];
    });

    const csvContent = [
        headings,
        ...rows
    ]
        .map((row) => {
            return row
                .map((value) => escapeCsvValue(value))
                .join(",");
        })
        .join("\n");

    const csvFile = new Blob(
        [csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const downloadUrl =
        URL.createObjectURL(csvFile);

    const downloadLink =
        document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download =
        `wusool-audit-log-${getCurrentDateValue()}.csv`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(downloadUrl);
};

const escapeCsvValue = (value) => {
    const safeValue =
        String(value ?? "").replaceAll('"', '""');

    return `"${safeValue}"`;
};

const getCurrentDateValue = () => {
    const currentDate = new Date();

    return currentDate
        .toISOString()
        .split("T")[0];
};

const escapeHtml = (value) => {
    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent =
        String(value ?? "");

    return temporaryElement.innerHTML;
};