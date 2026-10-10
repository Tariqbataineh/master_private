'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const service = WusoolDataService;
  const tbody = document.getElementById('ticketsTableBody');
  const search = document.getElementById('ticketSearch');
  const statusFilter = document.getElementById('ticketStatusFilter');
  const priorityFilter = document.getElementById('ticketPriorityFilter');
  const stats = document.getElementById('ticketStats');
  const modal = new bootstrap.Modal(document.getElementById('ticketModal'));
  const badgeClass = (status) => {
    const normalized = String(status).toLowerCase();
    if (normalized === 'resolved' || normalized === 'closed') {
      return 'badge-soft-success';
    }
    if (normalized === 'in progress') {
      return 'badge-soft-warning';
    }
    return 'badge-soft-info';
  };
  const priorityClass = (priority) => {
    return `priority-${String(priority).toLowerCase()}`;
  };
  const loadOptions = async () => {
    const users = await service.getUsers();
    const branches = await service.getBranches();
    WusoolUI.html(
      document.getElementById('ticketRequester'),
      `<option value="">None</option>` +
        users
          .map(
            (item) => `
            <option value="${WusoolUI.escape(item.id)}">${WusoolUI.escape(item.name)}</option>
        `,
          )
          .join(''),
    );
    WusoolUI.html(
      document.getElementById('ticketBranch'),
      `<option value="">None</option>` +
        branches
          .map(
            (item) => `
            <option value="${WusoolUI.escape(item.id)}">${WusoolUI.escape(item.name)}</option>
        `,
          )
          .join(''),
    );
  };
  const renderStats = async () => {
    const tickets = await service.getTickets();
    const open = tickets.filter((item) => item.status === 'Open').length;
    const inProgress = tickets.filter((item) => item.status === 'In Progress').length;
    const high = tickets.filter((item) => item.priority === 'High').length;
    const cards = [
      ['Support Tickets', tickets.length, 'bi-ticket-perforated'],
      ['Open', open, 'bi-inbox'],
      ['In Progress', inProgress, 'bi-arrow-repeat'],
      ['High Priority', high, 'bi-exclamation-triangle'],
    ];
    WusoolUI.html(
      stats,
      cards
        .map(
          ([label, value, icon]) => `
        <div class="col-12 col-sm-6 col-xl-3">
            <article class="stat-card">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <p class="text-secondary mb-2">${label}</p>
                        <div class="metric">${value}</div>
                    </div>
                    <span class="stat-icon"><i class="bi ${icon}"></i></span>
                </div>
            </article>
        </div>
    `,
        )
        .join(''),
    );
  };
  const requesterLabel = async (ticket) => {
    if (ticket.requesterId) {
      return (await service.getUserById(ticket.requesterId))?.name || 'Unknown User';
    }
    if (ticket.organizationId) {
      return (
        (await service.getOrganizationById(ticket.organizationId))?.name || 'Unknown Organization'
      );
    }
    return ticket.requesterType || 'Unknown';
  };
  const render = async () => {
    const tickets = await service.getTickets({
      search: search.value.trim(),
      status: statusFilter.value,
      priority: priorityFilter.value,
    });
    WusoolUI.html(
      tbody,
      tickets.length
        ? (
            await WusoolUI.mapAsync(
              tickets,
              async (item) => `
            <tr>
                <td>
                    <strong class="d-block">${WusoolUI.escape(item.subject)}</strong>
                    <small class="text-secondary">${WusoolUI.escape(item.category)}</small>
                </td>

                <td>${await requesterLabel(item)}</td>

                <td>
                    <span class="badge ${priorityClass(item.priority)}">
                        ${WusoolUI.escape(item.priority)}
                    </span>
                </td>

                <td>
                    <span class="badge ${badgeClass(item.status)}">
                        ${WusoolUI.escape(item.status)}
                    </span>
                </td>

                <td>${WusoolUI.escape(item.assignedTo || 'Unassigned')}</td>
                <td>${new Date(item.updatedAt).toLocaleDateString()}</td>

                <td>
                    <div class="action-menu">
                        <button class="btn btn-sm btn-outline-primary" data-edit="${WusoolUI.escape(item.id)}">
                            Edit
                        </button>

                        ${
                          item.status !== 'Resolved'
                            ? `
                                    <button class="btn btn-sm btn-outline-success" data-resolve="${WusoolUI.escape(item.id)}">
                                        Resolve
                                    </button>
                                `
                            : ''
                        }

                        <button class="btn btn-sm btn-outline-danger" data-delete="${WusoolUI.escape(item.id)}">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `,
            )
          ).join('')
        : `
            <tr>
                <td colspan="7" class="text-center py-5 text-secondary">
                    No tickets found.
                </td>
            </tr>
        `,
    );
  };
  const clearForm = () => {
    document.getElementById('ticketModalTitle').textContent = 'Add Ticket';
    document.getElementById('ticketId').value = '';
    document.getElementById('ticketSubject').value = '';
    document.getElementById('ticketPriority').value = 'Medium';
    document.getElementById('ticketStatus').value = 'Open';
    document.getElementById('ticketCategory').value = 'General';
    document.getElementById('ticketRequester').value = '';
    document.getElementById('ticketBranch').value = '';
    document.getElementById('ticketDescription').value = '';
    document.getElementById('ticketAssignedTo').value = '';
    document.getElementById('ticketResolution').value = '';
  };
  const fillForm = (item) => {
    document.getElementById('ticketModalTitle').textContent = 'Edit Ticket';
    document.getElementById('ticketId').value = item.id;
    document.getElementById('ticketSubject').value = item.subject;
    document.getElementById('ticketPriority').value = item.priority;
    document.getElementById('ticketStatus').value = item.status;
    document.getElementById('ticketCategory').value = item.category;
    document.getElementById('ticketRequester').value = item.requesterId;
    document.getElementById('ticketBranch').value = item.branchId;
    document.getElementById('ticketDescription').value = item.description;
    document.getElementById('ticketAssignedTo').value = item.assignedTo;
    document.getElementById('ticketResolution').value = item.resolution;
  };
  WusoolUI.listen(document.getElementById('addTicketButton'), 'click', () => {
    clearForm();
    modal.show();
  });
  WusoolUI.listen(document.getElementById('ticketForm'), 'submit', async (event) => {
    event.preventDefault();
    await service.saveTicket({
      id: document.getElementById('ticketId').value || undefined,
      subject: document.getElementById('ticketSubject').value.trim(),
      priority: document.getElementById('ticketPriority').value,
      status: document.getElementById('ticketStatus').value,
      category: document.getElementById('ticketCategory').value.trim(),
      requesterId: document.getElementById('ticketRequester').value,
      branchId: document.getElementById('ticketBranch').value,
      description: document.getElementById('ticketDescription').value.trim(),
      assignedTo: document.getElementById('ticketAssignedTo').value.trim(),
      resolution: document.getElementById('ticketResolution').value.trim(),
    });
    modal.hide();
    await renderStats();
    await render();
    WusoolAdmin.toast('Ticket saved successfully.');
  });
  WusoolUI.listen(tbody, 'click', async (event) => {
    const edit = event.target.closest('[data-edit]');
    const resolve = event.target.closest('[data-resolve]');
    const remove = event.target.closest('[data-delete]');
    if (edit) {
      const item = await service.getTicketById(edit.dataset.edit);
      if (!item) {
        return;
      }
      fillForm(item);
      modal.show();
    }
    if (resolve) {
      await service.setTicketStatus(resolve.dataset.resolve, 'Resolved');
      await renderStats();
      await render();
      WusoolAdmin.toast('Ticket resolved.');
    }
    if (remove) {
      const item = await service.getTicketById(remove.dataset.delete);
      if (!item || !(await WusoolAdmin.confirm('Move this ticket to Recovery Center?'))) {
        return;
      }
      await service.deleteTicket(item.id, 'Deleted from Admin Tickets');
      await renderStats();
      await render();
      WusoolAdmin.toast('Ticket moved to Recovery Center.');
    }
  });
  WusoolUI.listen(search, 'input', render);
  WusoolUI.listen(statusFilter, 'change', render);
  WusoolUI.listen(priorityFilter, 'change', render);
  const refreshSupport = async () => {
    await renderStats();
    await render();
  };
  window.addEventListener('wusool:data-changed', () => refreshSupport().catch(WusoolUI.error));
  window.addEventListener('storage', () => refreshSupport().catch(WusoolUI.error));
  await loadOptions();
  await refreshSupport();
});
