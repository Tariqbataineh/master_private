"use strict";

const notificationsStorageKey =
    "wusoolOrganizationNotifications";

let organizationNotifications = [];
let filteredNotifications = [];
let notificationToDeleteId = null;
let deleteNotificationModal = null;
let notificationToast = null;

document.addEventListener("DOMContentLoaded", () => {
    initializeBootstrapComponents();
    loadNotifications();
    configureFilters();
    configureActions();
    renderPage();
});

const defaultNotifications = [
    {
        id: 1,
        type: "branch",
        title: "Main Branch was approved",
        message:
            "The accessibility information for Main Branch was reviewed and approved.",
        createdAt: "2026-09-23T10:30:00",
        isRead: false,
        actionText: "View Branch",
        actionUrl:
            "./organization-branch-details.html?id=1"
    },
    {
        id: 2,
        type: "visit",
        title: "New visitor booking",
        message:
            "Ahmad Khalil booked a visit to Main Branch for September 26 at 9:00 AM.",
        createdAt: "2026-09-23T09:15:00",
        isRead: false,
        actionText: "View Ticket",
        actionUrl:
            "./visitor-tickets.html"
    },
    {
        id: 3,
        type: "report",
        title: "AI accessibility report is ready",
        message:
            "The AI accessibility analysis for North Branch has been completed.",
        createdAt: "2026-09-22T16:45:00",
        isRead: false,
        actionText: "View Report",
        actionUrl:
            "./branch-ai-review.html?id=2&mode=view"
    },
    {
        id: 4,
        type: "subscription",
        title: "Subscription renewal reminder",
        message:
            "Your current subscription will renew in seven days.",
        createdAt: "2026-09-22T12:00:00",
        isRead: true,
        actionText: "View Subscription",
        actionUrl:
            "./subscription-management.html"
    },
    {
        id: 5,
        type: "branch",
        title: "Changes required for Zarqa Branch",
        message:
            "The reviewer requested additional entrance and accessible parking photos.",
        createdAt: "2026-09-21T14:20:00",
        isRead: true,
        actionText: "Review Changes",
        actionUrl:
            "./branch-review-status.html?id=3"
    },
    {
        id: 6,
        type: "system",
        title: "Organization profile updated",
        message:
            "Your organization profile information was updated successfully.",
        createdAt: "2026-09-20T11:10:00",
        isRead: true,
        actionText: "Open Settings",
        actionUrl:
            "./organization-settings.html"
    }
];

const initializeBootstrapComponents = () => {
    const modalElement =
        document.getElementById(
            "deleteNotificationModal"
        );

    const toastElement =
        document.getElementById(
            "notificationToast"
        );

    deleteNotificationModal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    notificationToast =
        bootstrap.Toast.getOrCreateInstance(
            toastElement
        );
};

const loadNotifications = () => {
    const storedNotifications =
        localStorage.getItem(
            notificationsStorageKey
        );

    if (!storedNotifications) {
        organizationNotifications = [
            ...defaultNotifications
        ];

        saveNotifications();
    } else {
        try {
            organizationNotifications =
                JSON.parse(
                    storedNotifications
                );
        } catch (error) {
            console.error(
                "Unable to load notifications:",
                error
            );

            organizationNotifications = [
                ...defaultNotifications
            ];
        }
    }

    sortNotifications();

    filteredNotifications = [
        ...organizationNotifications
    ];
};

const saveNotifications = () => {
    localStorage.setItem(
        notificationsStorageKey,
        JSON.stringify(
            organizationNotifications
        )
    );
};

const sortNotifications = () => {
    organizationNotifications.sort(
        (firstNotification, secondNotification) => {
            return (
                new Date(
                    secondNotification.createdAt
                ) -
                new Date(
                    firstNotification.createdAt
                )
            );
        }
    );
};

const configureFilters = () => {
    document.getElementById(
        "notificationSearch"
    ).addEventListener(
        "input",
        filterNotifications
    );

    document.getElementById(
        "notificationTypeFilter"
    ).addEventListener(
        "change",
        filterNotifications
    );

    document.getElementById(
        "readStatusFilter"
    ).addEventListener(
        "change",
        filterNotifications
    );

    document.getElementById(
        "clearFiltersButton"
    ).addEventListener(
        "click",
        clearFilters
    );

    document.getElementById(
        "emptyClearButton"
    ).addEventListener(
        "click",
        clearFilters
    );
};

const configureActions = () => {
    document.getElementById(
        "markAllReadButton"
    ).addEventListener(
        "click",
        markAllNotificationsAsRead
    );

    document.getElementById(
        "deleteReadButton"
    ).addEventListener(
        "click",
        deleteReadNotifications
    );

    document.getElementById(
        "confirmDeleteButton"
    ).addEventListener(
        "click",
        confirmDeleteNotification
    );

    document.addEventListener(
        "click",
        (event) => {
            const readButton =
                event.target.closest(
                    "[data-read-notification]"
                );

            const deleteButton =
                event.target.closest(
                    "[data-delete-notification]"
                );

            const actionLink =
                event.target.closest(
                    "[data-notification-link]"
                );

            if (readButton) {
                const notificationId =
                    Number(
                        readButton.dataset
                            .readNotification
                    );

                markNotificationAsRead(
                    notificationId
                );
            }

            if (deleteButton) {
                notificationToDeleteId =
                    Number(
                        deleteButton.dataset
                            .deleteNotification
                    );

                deleteNotificationModal.show();
            }

            if (actionLink) {
                const notificationId =
                    Number(
                        actionLink.dataset
                            .notificationLink
                    );

                markNotificationAsRead(
                    notificationId,
                    false
                );
            }
        }
    );
};

const filterNotifications = () => {
    const searchValue =
        document
            .getElementById(
                "notificationSearch"
            )
            .value
            .trim()
            .toLowerCase();

    const selectedType =
        document.getElementById(
            "notificationTypeFilter"
        ).value;

    const selectedReadStatus =
        document.getElementById(
            "readStatusFilter"
        ).value;

    filteredNotifications =
        organizationNotifications.filter(
            (notification) => {
                const searchableText = `
                    ${notification.title}
                    ${notification.message}
                `.toLowerCase();

                const matchesSearch =
                    searchableText.includes(
                        searchValue
                    );

                const matchesType =
                    selectedType === "all" ||
                    notification.type ===
                        selectedType;

                const matchesReadStatus =
                    selectedReadStatus === "all" ||
                    (
                        selectedReadStatus ===
                            "unread" &&
                        !notification.isRead
                    ) ||
                    (
                        selectedReadStatus ===
                            "read" &&
                        notification.isRead
                    );

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesReadStatus
                );
            }
        );

    renderNotifications();
};

const clearFilters = () => {
    document.getElementById(
        "notificationSearch"
    ).value = "";

    document.getElementById(
        "notificationTypeFilter"
    ).value = "all";

    document.getElementById(
        "readStatusFilter"
    ).value = "all";

    filteredNotifications = [
        ...organizationNotifications
    ];

    renderNotifications();
};

const renderPage = () => {
    renderStatistics();
    renderNotifications();
};

const renderStatistics = () => {
    const unreadCount =
        organizationNotifications.filter(
            (notification) => {
                return !notification.isRead;
            }
        ).length;

    const branchCount =
        organizationNotifications.filter(
            (notification) => {
                return (
                    notification.type ===
                    "branch"
                );
            }
        ).length;

    const visitCount =
        organizationNotifications.filter(
            (notification) => {
                return (
                    notification.type ===
                    "visit"
                );
            }
        ).length;

    setTextContent(
        "totalNotifications",
        organizationNotifications.length
    );

    setTextContent(
        "unreadNotifications",
        unreadCount
    );

    setTextContent(
        "branchNotifications",
        branchCount
    );

    setTextContent(
        "visitNotifications",
        visitCount
    );

    updatePageTitle(unreadCount);
};

const updatePageTitle = (
    unreadCount
) => {
    document.title =
        unreadCount > 0
            ? `(${unreadCount}) Notifications | Wusool`
            : "Notifications | Wusool";
};

const renderNotifications = () => {
    const notificationsContainer =
        document.getElementById(
            "notificationsContainer"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const resultsText =
        document.getElementById(
            "resultsText"
        );

    notificationsContainer.innerHTML = "";

    resultsText.textContent =
        `Showing ${filteredNotifications.length} ` +
        `${
            filteredNotifications.length === 1
                ? "notification"
                : "notifications"
        }`;

    if (
        filteredNotifications.length === 0
    ) {
        notificationsContainer.classList.add(
            "d-none"
        );

        emptyState.classList.remove(
            "d-none"
        );

        return;
    }

    notificationsContainer.classList.remove(
        "d-none"
    );

    emptyState.classList.add(
        "d-none"
    );

    filteredNotifications.forEach(
        (notification) => {
            notificationsContainer
                .insertAdjacentHTML(
                    "beforeend",
                    createNotificationCard(
                        notification
                    )
                );
        }
    );
};

const createNotificationCard = (
    notification
) => {
    const typeInformation =
        getTypeInformation(
            notification.type
        );

    const unreadClass =
        notification.isRead
            ? ""
            : "unread";

    const readButton =
        notification.isRead
            ? ""
            : `
                <button
                    type="button"
                    class="notification-action"
                    data-read-notification="${notification.id}"
                    aria-label="Mark notification as read"
                    title="Mark as read"
                >
                    <i class="bi bi-check2"></i>
                </button>
            `;

    const actionLink =
        notification.actionUrl
            ? `
                <a
                    href="${escapeHtml(
                        notification.actionUrl
                    )}"
                    class="notification-link"
                    data-notification-link="${notification.id}"
                >
                    ${escapeHtml(
                        notification.actionText ||
                        "View Details"
                    )}

                    <i class="bi bi-arrow-right ms-1"></i>
                </a>
            `
            : "";

    return `
        <article
            class="notification-card ${unreadClass}"
        >
            <span
                class="notification-icon ${notification.type}"
            >
                <i class="bi ${typeInformation.icon}"></i>
            </span>

            <div class="notification-content">
                <div
                    class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2"
                >
                    <div>
                        <h3 class="h6 fw-bold mb-1">
                            ${escapeHtml(
                                notification.title
                            )}
                        </h3>

                        <span class="notification-time">
                            <i class="bi bi-clock me-1"></i>

                            ${formatRelativeTime(
                                notification.createdAt
                            )}
                        </span>
                    </div>
                </div>

                <p class="text-secondary mb-2">
                    ${escapeHtml(
                        notification.message
                    )}
                </p>

                ${actionLink}
            </div>

            <div class="notification-actions">
                ${readButton}

                <button
                    type="button"
                    class="notification-action delete"
                    data-delete-notification="${notification.id}"
                    aria-label="Delete notification"
                    title="Delete notification"
                >
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        </article>
    `;
};

const markNotificationAsRead = (
    notificationId,
    showMessage = true
) => {
    const notification =
        organizationNotifications.find(
            (item) => {
                return (
                    item.id ===
                    notificationId
                );
            }
        );

    if (
        !notification ||
        notification.isRead
    ) {
        return;
    }

    notification.isRead = true;

    saveNotifications();
    applyCurrentFilters();
    renderStatistics();

    if (showMessage) {
        showToast(
            "Notification marked as read."
        );
    }
};

const markAllNotificationsAsRead = () => {
    const hasUnreadNotifications =
        organizationNotifications.some(
            (notification) => {
                return !notification.isRead;
            }
        );

    if (!hasUnreadNotifications) {
        showToast(
            "All notifications are already read."
        );

        return;
    }

    organizationNotifications =
        organizationNotifications.map(
            (notification) => {
                return {
                    ...notification,
                    isRead: true
                };
            }
        );

    saveNotifications();
    applyCurrentFilters();
    renderStatistics();

    showToast(
        "All notifications marked as read."
    );
};

const confirmDeleteNotification = () => {
    if (notificationToDeleteId === null) {
        return;
    }

    organizationNotifications =
        organizationNotifications.filter(
            (notification) => {
                return (
                    notification.id !==
                    notificationToDeleteId
                );
            }
        );

    notificationToDeleteId = null;

    saveNotifications();
    applyCurrentFilters();
    renderStatistics();

    deleteNotificationModal.hide();

    showToast(
        "Notification deleted."
    );
};

const deleteReadNotifications = () => {
    const readNotificationsExist =
        organizationNotifications.some(
            (notification) => {
                return notification.isRead;
            }
        );

    if (!readNotificationsExist) {
        showToast(
            "There are no read notifications to delete."
        );

        return;
    }

    organizationNotifications =
        organizationNotifications.filter(
            (notification) => {
                return !notification.isRead;
            }
        );

    saveNotifications();
    applyCurrentFilters();
    renderStatistics();

    showToast(
        "Read notifications deleted."
    );
};

const applyCurrentFilters = () => {
    const searchEvent =
        new Event("input");

    document
        .getElementById(
            "notificationSearch"
        )
        .dispatchEvent(searchEvent);
};

const getTypeInformation = (
    type
) => {
    const types = {
        branch: {
            icon: "bi-building-check"
        },

        visit: {
            icon: "bi-calendar-check"
        },

        report: {
            icon: "bi-stars"
        },

        subscription: {
            icon: "bi-credit-card"
        },

        system: {
            icon: "bi-gear"
        }
    };

    return types[type] ||
        types.system;
};

const formatRelativeTime = (
    dateValue
) => {
    const notificationDate =
        new Date(dateValue);

    const currentDate =
        new Date();

    const difference =
        currentDate - notificationDate;

    const minute =
        60 * 1000;

    const hour =
        60 * minute;

    const day =
        24 * hour;

    if (difference < minute) {
        return "Just now";
    }

    if (difference < hour) {
        const minutes =
            Math.floor(
                difference / minute
            );

        return `${minutes} minutes ago`;
    }

    if (difference < day) {
        const hours =
            Math.floor(
                difference / hour
            );

        return `${hours} hours ago`;
    }

    const days =
        Math.floor(
            difference / day
        );

    if (days <= 7) {
        return `${days} days ago`;
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(notificationDate);
};

const setTextContent = (
    elementId,
    value
) => {
    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.textContent = value;
    }
};

const showToast = (
    message
) => {
    setTextContent(
        "toastMessage",
        message
    );

    notificationToast.show();
};

const escapeHtml = (
    value
) => {
    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent =
        String(value || "");

    return temporaryElement.innerHTML;
};