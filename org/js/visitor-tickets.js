'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const ticketsStorageKey = 'wusoolVisitorTickets';
  let visitorTickets = [];
  let filteredTickets = [];
  let selectedTicketId = null;
  let ticketDetailsModal = null;
  let ticketToast = null;
  WusoolUI.ready(async () => {
    initializeBootstrapComponents();
    await loadTickets();
    populateBranchFilter();
    configureFilters();
    configureTicketActions();
    renderPage();
  });
  const defaultTickets = [];
  const initializeBootstrapComponents = () => {
    const modalElement = document.getElementById('ticketDetailsModal');
    const toastElement = document.getElementById('ticketToast');
    ticketDetailsModal = bootstrap.Modal.getOrCreateInstance(modalElement);
    ticketToast = bootstrap.Toast.getOrCreateInstance(toastElement);
  };
  const loadTickets = async () => {
    const storedTickets = await WusoolServices.rawRead(ticketsStorageKey);
    if (!storedTickets) {
      visitorTickets = [...defaultTickets];
      await saveTickets();
    } else {
      try {
        visitorTickets = JSON.parse(storedTickets);
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        console.error('Unable to load visitor tickets:', error);
        visitorTickets = [...defaultTickets];
      }
    }
    filteredTickets = [...visitorTickets];
  };
  const saveTickets = async () => {
    await WusoolServices.rawWrite(ticketsStorageKey, JSON.stringify(visitorTickets));
  };
  const populateBranchFilter = () => {
    const branchFilter = document.getElementById('branchFilter');
    const branchNames = [
      ...new Set(
        visitorTickets.map((ticket) => {
          return ticket.branchName;
        }),
      ),
    ];
    branchNames.forEach((branchName) => {
      const option = document.createElement('option');
      option.value = branchName;
      option.textContent = branchName;
      branchFilter.appendChild(option);
    });
  };
  const configureFilters = () => {
    WusoolUI.listen(document.getElementById('ticketSearch'), 'input', filterTickets);
    WusoolUI.listen(document.getElementById('branchFilter'), 'change', filterTickets);
    WusoolUI.listen(document.getElementById('statusFilter'), 'change', filterTickets);
    WusoolUI.listen(document.getElementById('clearFiltersButton'), 'click', clearFilters);
    WusoolUI.listen(document.getElementById('emptyClearButton'), 'click', clearFilters);
    WusoolUI.listen(document.getElementById('refreshTicketsButton'), 'click', async () => {
      await loadTickets();
      renderPage();
      showToast('User tickets refreshed.');
    });
  };
  const configureTicketActions = () => {
    WusoolUI.listen(document, 'click', (event) => {
      const detailsButton = event.target.closest('[data-ticket-id]');
      if (!detailsButton) {
        return;
      }
      const ticketId = detailsButton.dataset.ticketId;
      openTicketDetails(ticketId);
    });
    WusoolUI.listen(document.getElementById('saveTicketStatusButton'), 'click', updateTicketStatus);
  };
  const filterTickets = () => {
    const searchValue = document.getElementById('ticketSearch').value.trim().toLowerCase();
    const selectedBranch = document.getElementById('branchFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;
    filteredTickets = visitorTickets.filter((ticket) => {
      const searchableText = `
                    ${WusoolUI.escape(ticket.reference)}
                    ${WusoolUI.escape(ticket.visitorName)}
                    ${WusoolUI.escape(ticket.visitorEmail)}
                    ${WusoolUI.escape(ticket.branchName)}
                `.toLowerCase();
      const matchesSearch = searchableText.includes(searchValue);
      const matchesBranch = selectedBranch === 'all' || ticket.branchName === selectedBranch;
      const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
      return matchesSearch && matchesBranch && matchesStatus;
    });
    renderTickets();
  };
  const clearFilters = () => {
    document.getElementById('ticketSearch').value = '';
    document.getElementById('branchFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    filteredTickets = [...visitorTickets];
    renderTickets();
  };
  const renderPage = () => {
    renderStatistics();
    renderTickets();
  };
  const renderStatistics = () => {
    setTextContent('totalTickets', visitorTickets.length);
    setTextContent('confirmedTickets', countTicketsByStatus('confirmed'));
    setTextContent('activeTickets', countTicketsByStatus('in-progress'));
    setTextContent('completedTickets', countTicketsByStatus('completed'));
  };
  const countTicketsByStatus = (status) => {
    return visitorTickets.filter((ticket) => {
      return ticket.status === status;
    }).length;
  };
  const renderTickets = () => {
    const tableBody = document.getElementById('ticketsTableBody');
    const cardsContainer = document.getElementById('ticketsCardsContainer');
    const emptyState = document.getElementById('emptyState');
    const resultsText = document.getElementById('resultsText');
    WusoolUI.html(tableBody, '');
    WusoolUI.html(cardsContainer, '');
    resultsText.textContent =
      `Showing ${filteredTickets.length} ` +
      `${filteredTickets.length === 1 ? 'ticket' : 'tickets'}`;
    if (filteredTickets.length === 0) {
      emptyState.classList.remove('d-none');
      return;
    }
    emptyState.classList.add('d-none');
    filteredTickets.forEach((ticket) => {
      WusoolUI.insertHTML(tableBody, 'beforeend', createTicketRow(ticket));
      WusoolUI.insertHTML(cardsContainer, 'beforeend', createTicketCard(ticket));
    });
  };
  const createTicketRow = (ticket) => {
    const statusInformation = getStatusInformation(ticket.status);
    return `
        <tr>
            <td>
                <strong>
                    ${escapeHtml(ticket.reference)}
                </strong>
            </td>

            <td>
                <div class="d-flex align-items-center gap-2">
                    <span class="visitor-avatar">
                        ${getInitials(ticket.visitorName)}
                    </span>

                    <div>
                        <strong class="d-block">
                            ${escapeHtml(ticket.visitorName)}
                        </strong>

                        <small class="text-secondary">
                            ${escapeHtml(ticket.visitorEmail)}
                        </small>
                    </div>
                </div>
            </td>

            <td>
                ${escapeHtml(ticket.branchName)}
            </td>

            <td>
                <strong class="d-block">
                    ${formatDate(ticket.visitDate)}
                </strong>

                <small class="text-secondary">
                    ${formatTime(ticket.visitTime)}
                </small>
            </td>

            <td>
                ${escapeHtml(ticket.destination)}
            </td>

            <td>
                <i class="bi ${getGuidanceIcon(ticket.guidance)} me-1"></i>

                ${escapeHtml(ticket.guidance)}
            </td>

            <td>
                <span
                    class="ticket-status ${WusoolUI.escape(ticket.status)}"
                >
                    <i class="bi ${statusInformation.icon}"></i>
                    ${statusInformation.label}
                </span>
            </td>

            <td class="text-end">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-wusool"
                    data-ticket-id="${WusoolUI.escape(ticket.id)}"
                >
                    View
                </button>
            </td>
        </tr>
    `;
  };
  const createTicketCard = (ticket) => {
    const statusInformation = getStatusInformation(ticket.status);
    return `
        <div class="col-12">
            <article class="ticket-card">

                <div
                    class="d-flex justify-content-between align-items-start gap-3 mb-3"
                >
                    <div>
                        <small class="text-secondary">
                            ${escapeHtml(ticket.reference)}
                        </small>

                        <h2 class="h5 fw-bold mb-0">
                            ${escapeHtml(ticket.visitorName)}
                        </h2>
                    </div>

                    <span
                        class="ticket-status ${WusoolUI.escape(ticket.status)}"
                    >
                        <i class="bi ${statusInformation.icon}"></i>
                        ${statusInformation.label}
                    </span>
                </div>

                <div class="ticket-information mb-3">

                    <div>
                        <small>Branch</small>
                        <strong>
                            ${escapeHtml(ticket.branchName)}
                        </strong>
                    </div>

                    <div>
                        <small>Date</small>
                        <strong>
                            ${formatDate(ticket.visitDate)}
                        </strong>
                    </div>

                    <div>
                        <small>Time</small>
                        <strong>
                            ${formatTime(ticket.visitTime)}
                        </strong>
                    </div>

                    <div>
                        <small>Destination</small>
                        <strong>
                            ${escapeHtml(ticket.destination)}
                        </strong>
                    </div>

                </div>

                <button
                    type="button"
                    class="btn btn-outline-wusool w-100"
                    data-ticket-id="${WusoolUI.escape(ticket.id)}"
                >
                    View Ticket Details
                </button>

            </article>
        </div>
    `;
  };
  const openTicketDetails = (ticketId) => {
    const selectedTicket = visitorTickets.find((ticket) => {
      return ticket.id === ticketId;
    });
    if (!selectedTicket) {
      return;
    }
    selectedTicketId = ticketId;
    const statusInformation = getStatusInformation(selectedTicket.status);
    setTextContent('modalTicketReference', selectedTicket.reference);
    setTextContent('modalVisitorName', selectedTicket.visitorName);
    setTextContent('modalVisitorEmail', selectedTicket.visitorEmail);
    setTextContent('modalVisitorPhone', selectedTicket.visitorPhone);
    setTextContent('modalAccessibilityNeed', selectedTicket.accessibilityNeed);
    setTextContent('modalBranchName', selectedTicket.branchName);
    setTextContent('modalVisitDate', formatDate(selectedTicket.visitDate));
    setTextContent('modalVisitTime', formatTime(selectedTicket.visitTime));
    setTextContent('modalDestination', selectedTicket.destination);
    setTextContent('modalGuidance', selectedTicket.guidance);
    setTextContent('modalStartingPoint', selectedTicket.startingPoint);
    setTextContent('modalVisitPurpose', selectedTicket.visitPurpose);
    const modalStatus = document.getElementById('modalTicketStatus');
    modalStatus.className = `ticket-status ${WusoolUI.escape(selectedTicket.status)}`;
    WusoolUI.html(
      modalStatus,
      `
        <i class="bi ${statusInformation.icon}"></i>
        ${statusInformation.label}
    `,
    );
    document.getElementById('modalStatusSelect').value = selectedTicket.status;
    ticketDetailsModal.show();
  };
  const updateTicketStatus = async () => {
    const status = document.getElementById('modalStatusSelect').value;
    const reason =
      status === 'cancelled'
        ? await window.WusoolBookingConfirm('Enter cancellation reason', true)
        : '';
    if (reason === false) return;
    await WusoolServices.bookingStatus(selectedTicketId, status, reason);
    await loadTickets();
    renderPage();
    ticketDetailsModal.hide();
    showToast('Booking status updated.');
  };
  const getStatusInformation = (status) => {
    const statuses = {
      pending: { label: 'Pending approval', icon: 'bi-hourglass-split' },
      confirmed: {
        label: 'Confirmed',
        icon: 'bi-calendar-check-fill',
      },
      'in-progress': {
        label: 'In Progress',
        icon: 'bi-person-walking',
      },
      completed: {
        label: 'Completed',
        icon: 'bi-check-circle-fill',
      },
      cancelled: {
        label: 'Cancelled',
        icon: 'bi-x-circle-fill',
      },
    };
    return statuses[status] || statuses.confirmed;
  };
  const getGuidanceIcon = (guidance) => {
    if (guidance === 'Voice') {
      return 'bi-volume-up';
    }
    if (guidance === 'Text') {
      return 'bi-chat-left-text';
    }
    return 'bi-stars';
  };
  const formatDate = (dateValue) => {
    const date = new Date(`${dateValue}T00:00:00`);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  const formatTime = (timeValue) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };
  const getInitials = (name) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => {
        return word.charAt(0).toUpperCase();
      })
      .join('');
  };
  const setTextContent = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value || '—';
    }
  };
  const showToast = (message) => {
    setTextContent('toastMessage', message);
    ticketToast.show();
  };
  const escapeHtml = (value) => {
    const temporaryElement = document.createElement('div');
    temporaryElement.textContent = String(value || '');
    return temporaryElement.innerHTML;
  };
});
