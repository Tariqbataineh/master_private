'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const notificationsStorageKey = 'wusoolOrganizationNotifications';
  let organizationNotifications = [];
  let filteredNotifications = [];
  let notificationToDeleteId = null;
  let deleteNotificationModal = null;
  let notificationToast = null;
  WusoolUI.ready(async () => {
    initializeBootstrapComponents();
    await loadNotifications();
    configureFilters();
    configureActions();
    renderPage();
    window.WusoolLive?.watch('organization-notifications', async () => {
      await loadNotifications();
      filterNotifications();
    });
  });
  const defaultNotifications = [];
  const initializeBootstrapComponents = () => {
    const modalElement = document.getElementById('deleteNotificationModal');
    const toastElement = document.getElementById('notificationToast');
    deleteNotificationModal = bootstrap.Modal.getOrCreateInstance(modalElement);
    notificationToast = bootstrap.Toast.getOrCreateInstance(toastElement);
  };
  const loadNotifications = async () => {
    const storedNotifications = await WusoolServices.rawRead(notificationsStorageKey);
    if (!storedNotifications) {
      organizationNotifications = [...defaultNotifications];
      await saveNotifications();
    } else {
      try {
        organizationNotifications = JSON.parse(storedNotifications);
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        console.error('Unable to load notifications:', error);
        organizationNotifications = [...defaultNotifications];
      }
    }
    sortNotifications();
    filteredNotifications = [...organizationNotifications];
  };
  const saveNotifications = async () => {
    await WusoolServices.rawWrite(
      notificationsStorageKey,
      JSON.stringify(organizationNotifications),
    );
  };
  const sortNotifications = () => {
    organizationNotifications.sort((firstNotification, secondNotification) => {
      return new Date(secondNotification.createdAt) - new Date(firstNotification.createdAt);
    });
  };
  const configureFilters = () => {
    WusoolUI.listen(document.getElementById('notificationSearch'), 'input', filterNotifications);
    WusoolUI.listen(
      document.getElementById('notificationTypeFilter'),
      'change',
      filterNotifications,
    );
    WusoolUI.listen(document.getElementById('readStatusFilter'), 'change', filterNotifications);
    WusoolUI.listen(document.getElementById('clearFiltersButton'), 'click', clearFilters);
    WusoolUI.listen(document.getElementById('emptyClearButton'), 'click', clearFilters);
  };
  const configureActions = () => {
    WusoolUI.listen(
      document.getElementById('markAllReadButton'),
      'click',
      markAllNotificationsAsRead,
    );
    WusoolUI.listen(document.getElementById('deleteReadButton'), 'click', deleteReadNotifications);
    WusoolUI.listen(
      document.getElementById('confirmDeleteButton'),
      'click',
      confirmDeleteNotification,
    );
    WusoolUI.listen(document, 'click', async (event) => {
      const readButton = event.target.closest('[data-read-notification]');
      const deleteButton = event.target.closest('[data-delete-notification]');
      const actionLink = event.target.closest('[data-notification-link]');
      if (readButton) {
        const notificationId = String(readButton.dataset.readNotification);
        await markNotificationAsRead(notificationId);
      }
      if (deleteButton) {
        notificationToDeleteId = String(deleteButton.dataset.deleteNotification);
        deleteNotificationModal.show();
      }
      if (actionLink) {
        const notificationId = String(actionLink.dataset.notificationLink);
        await markNotificationAsRead(notificationId, false);
      }
    });
  };
  const filterNotifications = () => {
    const searchValue = document.getElementById('notificationSearch').value.trim().toLowerCase();
    const selectedType = document.getElementById('notificationTypeFilter').value;
    const selectedReadStatus = document.getElementById('readStatusFilter').value;
    filteredNotifications = organizationNotifications.filter((notification) => {
      const searchableText = `
                    ${notification.title}
                    ${notification.message}
                `.toLowerCase();
      const matchesSearch = searchableText.includes(searchValue);
      const matchesType = selectedType === 'all' || notification.type === selectedType;
      const matchesReadStatus =
        selectedReadStatus === 'all' ||
        (selectedReadStatus === 'unread' && !notification.isRead) ||
        (selectedReadStatus === 'read' && notification.isRead);
      return matchesSearch && matchesType && matchesReadStatus;
    });
    renderNotifications();
  };
  const clearFilters = () => {
    document.getElementById('notificationSearch').value = '';
    document.getElementById('notificationTypeFilter').value = 'all';
    document.getElementById('readStatusFilter').value = 'all';
    filteredNotifications = [...organizationNotifications];
    renderNotifications();
  };
  const renderPage = () => {
    renderStatistics();
    renderNotifications();
  };
  const renderStatistics = () => {
    const unreadCount = organizationNotifications.filter((notification) => {
      return !notification.isRead;
    }).length;
    const branchCount = organizationNotifications.filter((notification) => {
      return notification.type === 'branch';
    }).length;
    const visitCount = organizationNotifications.filter((notification) => {
      return notification.type === 'visit';
    }).length;
    setTextContent('totalNotifications', organizationNotifications.length);
    setTextContent('unreadNotifications', unreadCount);
    setTextContent('branchNotifications', branchCount);
    setTextContent('visitNotifications', visitCount);
    updatePageTitle(unreadCount);
  };
  const updatePageTitle = (unreadCount) => {
    document.title =
      unreadCount > 0 ? `(${unreadCount}) Notifications | Wusool` : 'Notifications | Wusool';
  };
  const renderNotifications = () => {
    const notificationsContainer = document.getElementById('notificationsContainer');
    const emptyState = document.getElementById('emptyState');
    const resultsText = document.getElementById('resultsText');
    WusoolUI.html(notificationsContainer, '');
    resultsText.textContent =
      `Showing ${filteredNotifications.length} ` +
      `${filteredNotifications.length === 1 ? 'notification' : 'notifications'}`;
    if (filteredNotifications.length === 0) {
      notificationsContainer.classList.add('d-none');
      emptyState.classList.remove('d-none');
      return;
    }
    notificationsContainer.classList.remove('d-none');
    emptyState.classList.add('d-none');
    filteredNotifications.forEach((notification) => {
      WusoolUI.insertHTML(
        notificationsContainer,
        'beforeend',
        createNotificationCard(notification),
      );
    });
  };
  const createNotificationCard = (notification) => {
    const typeInformation = getTypeInformation(notification.type);
    const unreadClass = notification.isRead ? '' : 'unread';
    const readButton = notification.isRead
      ? ''
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
    const actionLink = notification.actionUrl
      ? `
                <a
                    href="${escapeHtml(notification.actionUrl)}"
                    class="notification-link"
                    data-notification-link="${notification.id}"
                >
                    ${escapeHtml(notification.actionText || 'View Details')}

                    <i class="bi bi-arrow-right ms-1"></i>
                </a>
            `
      : '';
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
                            ${escapeHtml(notification.title)}
                        </h3>

                        <span class="notification-time">
                            <i class="bi bi-clock me-1"></i>

                            ${formatRelativeTime(notification.createdAt)}
                        </span>
                    </div>
                </div>

                <p class="text-secondary mb-2">
                    ${escapeHtml(notification.message)}
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
  const markNotificationAsRead = async (notificationId, showMessage = true) => {
    const notification = organizationNotifications.find((item) => {
      return item.id === notificationId;
    });
    if (!notification || notification.isRead) {
      return;
    }
    notification.isRead = true;
    await saveNotifications();
    applyCurrentFilters();
    renderStatistics();
    if (showMessage) {
      showToast('Notification marked as read.');
    }
  };
  const markAllNotificationsAsRead = async () => {
    const hasUnreadNotifications = organizationNotifications.some((notification) => {
      return !notification.isRead;
    });
    if (!hasUnreadNotifications) {
      showToast('All notifications are already read.');
      return;
    }
    organizationNotifications = organizationNotifications.map((notification) => {
      return {
        ...notification,
        isRead: true,
      };
    });
    await saveNotifications();
    applyCurrentFilters();
    renderStatistics();
    showToast('All notifications marked as read.');
  };
  const confirmDeleteNotification = async () => {
    if (notificationToDeleteId === null) {
      return;
    }
    organizationNotifications = organizationNotifications.filter((notification) => {
      return notification.id !== notificationToDeleteId;
    });
    notificationToDeleteId = null;
    await saveNotifications();
    applyCurrentFilters();
    renderStatistics();
    deleteNotificationModal.hide();
    showToast('Notification deleted.');
  };
  const deleteReadNotifications = async () => {
    const readNotificationsExist = organizationNotifications.some((notification) => {
      return notification.isRead;
    });
    if (!readNotificationsExist) {
      showToast('There are no read notifications to delete.');
      return;
    }
    organizationNotifications = organizationNotifications.filter((notification) => {
      return !notification.isRead;
    });
    await saveNotifications();
    applyCurrentFilters();
    renderStatistics();
    showToast('Read notifications deleted.');
  };
  const applyCurrentFilters = () => {
    const searchEvent = new Event('input');
    document.getElementById('notificationSearch').dispatchEvent(searchEvent);
  };
  const getTypeInformation = (type) => {
    const types = {
      branch: {
        icon: 'bi-building-check',
      },
      visit: {
        icon: 'bi-calendar-check',
      },
      report: {
        icon: 'bi-stars',
      },
      subscription: {
        icon: 'bi-credit-card',
      },
      system: {
        icon: 'bi-gear',
      },
    };
    return types[type] || types.system;
  };
  const formatRelativeTime = (dateValue) => {
    const notificationDate = new Date(dateValue);
    const currentDate = new Date();
    const difference = currentDate - notificationDate;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (difference < minute) {
      return 'Just now';
    }
    if (difference < hour) {
      const minutes = Math.floor(difference / minute);
      return `${minutes} minutes ago`;
    }
    if (difference < day) {
      const hours = Math.floor(difference / hour);
      return `${hours} hours ago`;
    }
    const days = Math.floor(difference / day);
    if (days <= 7) {
      return `${days} days ago`;
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(notificationDate);
  };
  const setTextContent = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  };
  const showToast = (message) => {
    setTextContent('toastMessage', message);
    notificationToast.show();
  };
  const escapeHtml = (value) => {
    const temporaryElement = document.createElement('div');
    temporaryElement.textContent = String(value || '');
    return temporaryElement.innerHTML;
  };
});
