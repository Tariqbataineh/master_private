'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const service = window.WusoolDataService;
  const tableBody = document.getElementById('organizationsTableBody');
  const searchInput = document.getElementById('organizationSearch');
  const statusFilter = document.getElementById('organizationStatusFilter');
  const countLabel = document.getElementById('organizationCount');
  const statsContainer = document.getElementById('organizationStats');
  const modalElement = document.getElementById('organizationModal');
  const organizationModal = new bootstrap.Modal(modalElement);
  const detailsModal = new bootstrap.Modal(document.getElementById('organizationDetailsModal'));
  const formatDate = (value) => {
    if (!value) {
      return '-';
    }
    return new Date(value).toLocaleDateString();
  };
  const badgeClass = (status) => {
    const map = {
      active: 'badge-soft-success',
      pending: 'badge-soft-warning',
      suspended: 'badge-soft-danger',
      rejected: 'badge-soft-danger',
    };
    return map[String(status).toLowerCase()] || 'badge-soft-info';
  };
  const getFiltered = async () => {
    return await service.getOrganizations({
      search: searchInput.value.trim(),
      status: statusFilter.value,
    });
  };
  const renderStats = async () => {
    const all = await service.getOrganizations();
    const active = all.filter((item) => item.status === 'active').length;
    const pending = all.filter((item) => item.status === 'pending').length;
    const branches = (await service.getBranches()).length;
    const cards = [
      {
        label: 'Organizations',
        value: all.length,
        icon: 'bi-buildings',
      },
      {
        label: 'Active',
        value: active,
        icon: 'bi-check-circle',
      },
      {
        label: 'Pending',
        value: pending,
        icon: 'bi-hourglass-split',
      },
      {
        label: 'Total Branches',
        value: branches,
        icon: 'bi-geo-alt',
      },
    ];
    WusoolUI.html(
      statsContainer,
      cards
        .map(
          (card) => `
                    <div class="col-12 col-sm-6 col-xl-3">
                        <article class="stat-card">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <p class="text-secondary mb-2">
                                        ${card.label}
                                    </p>

                                    <div class="metric">
                                        ${card.value}
                                    </div>
                                </div>

                                <span class="stat-icon">
                                    <i class="bi ${card.icon}"></i>
                                </span>
                            </div>
                        </article>
                    </div>
                `,
        )
        .join(''),
    );
  };
  const renderTable = async () => {
    const organizations = await getFiltered();
    countLabel.textContent = `${organizations.length} organization${organizations.length === 1 ? '' : 's'}`;
    WusoolUI.html(
      tableBody,
      organizations.length
        ? (
            await WusoolUI.mapAsync(organizations, async (item) => {
              const branchCount = (
                await service.getBranches({
                  organizationId: item.id,
                })
              ).length;
              return `
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="organization-avatar">
                                            ${item.name
                                              .split(' ')
                                              .map((part) => part[0])
                                              .join('')
                                              .slice(0, 2)
                                              .toUpperCase()}
                                        </span>

                                        <div>
                                            <strong class="d-block">
                                                ${WusoolUI.escape(item.name)}
                                            </strong>

                                            <small class="text-secondary">
                                                ${WusoolUI.escape(item.email || 'No email')}
                                            </small>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    ${WusoolUI.escape(item.type)}
                                </td>

                                <td>
                                    ${WusoolUI.escape(item.city || '-')}
                                </td>

                                <td>
                                    <span class="badge ${badgeClass(item.status)} text-capitalize">
                                        ${WusoolUI.escape(item.status)}
                                    </span>
                                </td>

                                <td>
                                    ${branchCount}
                                </td>

                                <td>
                                    ${formatDate(item.updatedAt)}
                                </td>

                                <td>
                                    <div class="action-menu"><button class="btn btn-sm btn-outline-primary" type="button" data-edit-hours-id="${WusoolUI.escape(item.id)}" data-hours-kind="organizations"><i class="bi bi-clock" aria-hidden="true"></i> Working hours</button>
                                        <button
                                            class="btn btn-sm btn-outline-secondary"
                                            data-view-id="${WusoolUI.escape(item.id)}"
                                        >
                                            View
                                        </button>

                                        <button
                                            class="btn btn-sm btn-outline-primary"
                                            data-edit-id="${WusoolUI.escape(item.id)}"
                                        >
                                            Edit
                                        </button>

<button class="btn btn-sm btn-outline-info" data-reset-access="${WusoolUI.escape(item.id)}" data-account-kind="organizations">Reset login access</button>
                                        ${
                                          item.status !== 'active'
                                            ? `
                                                    <button
                                                        class="btn btn-sm btn-outline-success"
                                                        data-status-id="${WusoolUI.escape(item.id)}"
                                                        data-status-value="active"
                                                    >
                                                        Approve
                                                    </button>
                                                `
                                            : `
                                                    <button
                                                        class="btn btn-sm btn-outline-warning"
                                                        data-status-id="${WusoolUI.escape(item.id)}"
                                                        data-status-value="suspended"
                                                    >
                                                        Suspend
                                                    </button>
                                                `
                                        }

                                        <button
                                            class="btn btn-sm btn-outline-danger"
                                            data-delete-id="${WusoolUI.escape(item.id)}"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
            })
          ).join('')
        : `
                <tr>
                    <td
                        colspan="7"
                        class="text-center py-5 text-secondary"
                    >
                        No organizations found.
                    </td>
                </tr>
            `,
    );
  };
  const renderAll = async () => {
    await renderStats();
    await renderTable();
  };
  const clearForm = () => {
    document
      .getElementById('organizationForm')
      .querySelectorAll('input,select,textarea')
      .forEach((field) => field.setCustomValidity(''));
    WusoolAdmin.formError(document.getElementById('organizationForm'), '');
    document.getElementById('organizationModalTitle').textContent = 'Add Organization';
    document.getElementById('saveOrganizationButton').textContent = 'Create Organization';
    document.getElementById('organizationId').value = '';
    document.getElementById('organizationName').value = '';
    document.getElementById('organizationType').value = 'Bank';
    document.getElementById('organizationEmail').value = '';
    document.getElementById('organizationPhone').value = '';
    document.getElementById('organizationCity').value = 'Amman';
    document.getElementById('organizationStatus').value = 'active';
    document.getElementById('organizationAddress').value = '';
    document.getElementById('organizationWebsite').value = '';
    document.getElementById('organizationNotes').value = '';
  };
  const fillForm = (item) => {
    document
      .getElementById('organizationForm')
      .querySelectorAll('input,select,textarea')
      .forEach((field) => field.setCustomValidity(''));
    WusoolAdmin.formError(document.getElementById('organizationForm'), '');
    document.getElementById('organizationModalTitle').textContent = 'Edit Organization';
    document.getElementById('saveOrganizationButton').textContent = 'Save Changes';
    document.getElementById('organizationId').value = item.id;
    document.getElementById('organizationName').value = item.name;
    document.getElementById('organizationType').value = item.type;
    document.getElementById('organizationEmail').value = item.email;
    document.getElementById('organizationPhone').value = item.phone;
    document.getElementById('organizationCity').value = item.city;
    document.getElementById('organizationStatus').value = item.status;
    document.getElementById('organizationAddress').value = item.address;
    document.getElementById('organizationWebsite').value = item.website;
    document.getElementById('organizationNotes').value = item.notes;
  };
  WusoolUI.listen(document.getElementById('addOrganizationButton'), 'click', () => {
    clearForm();
    organizationModal.show();
  });
  WusoolUI.listen(document.getElementById('organizationForm'), 'input', (event) =>
    event.target.setCustomValidity?.(''),
  );
  WusoolUI.listen(document.getElementById('organizationForm'), 'submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      if (!(await WusoolAdmin.validateAccountForm('organization'))) return;
      const editing = Boolean(document.getElementById('organizationId').value);
      const name = document.getElementById('organizationName').value.trim();
      if (
        !(await WusoolAdmin.confirm(
          editing ? `Save changes to ${name}?` : `Are you sure you want to register ${name}?`,
        ))
      )
        return;
      const reason = await WusoolAdmin.statusReason(
        document.getElementById('organizationStatus').value,
      );
      if (reason === null) return;
      const creating = !document.getElementById('organizationId').value;
      const savedResult = await (
        creating
          ? service.createManagedAccount.bind(service, 'organizations')
          : service.saveOrganization.bind(service)
      )({
        reason,
        id: document.getElementById('organizationId').value || undefined,
        name: document.getElementById('organizationName').value.trim(),
        type: document.getElementById('organizationType').value,
        email: document.getElementById('organizationEmail').value.trim(),
        phone: document.getElementById('organizationPhone').value.trim(),
        city: document.getElementById('organizationCity').value.trim(),
        status: document.getElementById('organizationStatus').value,
        address: document.getElementById('organizationAddress').value.trim(),
        ...window.WusoolLocation.fields({
          googlePlaceId: document.querySelector('[data-location-place-id]')?.value,
          governorate: document.querySelector('[data-location-governorate]')?.value,
          latitude: document.getElementById('organizationLatitude')?.value,
          longitude: document.getElementById('organizationLongitude')?.value,
        }),
        website: document.getElementById('organizationWebsite').value.trim(),
        notes: document.getElementById('organizationNotes').value.trim(),
      });
      const saved = creating ? savedResult.account : savedResult;
      if (creating) {
        searchInput.value = '';
        statusFilter.value = '';
      }
      await renderAll();
      organizationModal.hide();
      WusoolAdmin.toast(`${saved.name} saved successfully.`);
      if (creating) await WusoolAdmin.showInvitation(savedResult);
    } catch (error) {
      WusoolAdmin.formError(form, error.message);
    }
  });
  WusoolUI.listen(tableBody, 'click', async (event) => {
    const editButton = event.target.closest('[data-edit-id]');
    const deleteButton = event.target.closest('[data-delete-id]');
    const statusButton = event.target.closest('[data-status-id]');
    const viewButton = event.target.closest('[data-view-id]');
    if (editButton) {
      const item = await service.getOrganizationById(editButton.dataset.editId);
      if (!item) {
        return;
      }
      fillForm(item);
      organizationModal.show();
    }
    if (deleteButton) {
      const item = await service.getOrganizationById(deleteButton.dataset.deleteId);
      if (!item || !(await WusoolAdmin.confirm(`Move ${item.name} to Recovery Center?`))) {
        return;
      }
      await service.deleteOrganization(item.id, 'Deleted from Admin Organizations');
      await renderAll();
      WusoolAdmin.toast('Organization moved to Recovery Center.');
    }
    if (statusButton) {
      const id = statusButton.dataset.statusId;
      const status = statusButton.dataset.statusValue;
      if (!(await WusoolAdmin.confirm(`Change organization status to ${status}?`))) return;
      const reason = await WusoolAdmin.statusReason(status);
      if (reason === null) return;
      await service.setOrganizationStatus(id, status, reason);
      await renderAll();
      WusoolAdmin.toast(`Organization status changed to ${status}.`);
    }
    if (viewButton) {
      await showDetails(viewButton.dataset.viewId);
    }
  });
  const showDetails = async (id) => {
    const item = await service.getOrganizationById(id);
    if (!item) {
      return;
    }
    const branches = await service.getBranches({
      organizationId: item.id,
    });
    document.getElementById('organizationDetailsTitle').textContent = item.name;
    WusoolUI.html(
      document.getElementById('organizationDetailsContent'),
      `
        <header class="organization-profile-hero mb-4"><span class="organization-profile-avatar"><i class="bi bi-buildings" aria-hidden="true"></i></span><div class="flex-grow-1"><p class="page-label mb-1">ORGANIZATION PROFILE</p><h3 class="h3 fw-bold mb-2">${WusoolUI.escape(item.name)}</h3><p class="mb-0">${WusoolUI.escape(item.city || 'Location not supplied')} · ${branches.length} branches</p></div><span class="badge ${badgeClass(item.status)}">${WusoolUI.escape(item.status)}</span></header>
        <div class="row g-4 organization-profile-grid">
            <div class="col-12 col-xl-4">
                <article class="content-card h-100">
                    <p class="page-label mb-1">
                        OVERVIEW
                    </p>

                    <h3 class="h5 fw-bold">
                        Organization Details
                    </h3>

                    <dl class="row mb-0 mt-4">
                        <dt class="col-5">
                            Type
                        </dt>

                        <dd class="col-7">
                            ${WusoolUI.escape(item.type)}
                        </dd>

                        <dt class="col-5">
                            Status
                        </dt>

                        <dd class="col-7">
                            <span class="badge ${badgeClass(item.status)}">
                                ${WusoolUI.escape(item.status)}
                            </span>
                        </dd>

                        <dt class="col-5">
                            City
                        </dt>

                        <dd class="col-7">
                            ${WusoolUI.escape(item.city || '-')}
                        </dd>

                        <dt class="col-5">
                            Email
                        </dt>

                        <dd class="col-7">
                            ${WusoolUI.escape(item.email || '-')}
                        </dd>
                        <dt class="col-5">Phone</dt><dd class="col-7">${WusoolUI.escape(item.phone || '—')}</dd>
                        <dt class="col-5">Address</dt><dd class="col-7">${WusoolUI.escape(item.address || '—')}</dd>
                    </dl>
                </article>
            </div>

            <div class="col-12 col-xl-8">
                <article class="content-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <p class="page-label mb-1">
                                BRANCHES
                            </p>

                            <h3 class="h5 fw-bold mb-0">
                                ${branches.length} Branches
                            </h3>
                        </div>

                        <a
                            href="./admin-branches.html?organizationId=${WusoolUI.escape(item.id)}"
                            class="btn btn-sm btn-outline-primary"
                        >
                            Manage Branches
                        </a>
                    </div>

                    ${
                      branches.length
                        ? branches
                            .map(
                              (branch) => `
                                        <div class="admin-list-item">
                                            <span class="item-icon">
                                                <i class="bi bi-geo-alt"></i>
                                            </span>

                                            <div class="flex-grow-1">
                                                <strong class="d-block">
                                                    ${WusoolUI.escape(branch.name)}
                                                </strong>

                                                <small class="text-secondary">
                                                    ${WusoolUI.escape(branch.city)} · Score ${WusoolUI.escape(branch.accessibilityScore)}%
                                                </small>
                                            </div>

                                            <span class="badge ${badgeClass(branch.status)}">
                                                ${WusoolUI.escape(branch.status)}
                                            </span>
                                        </div>
                                    `,
                            )
                            .join('')
                        : `
                                <p class="text-secondary mb-0">
                                    No branches yet.
                                </p>
                            `
                    }
                </article>
            </div>
        </div>
    `,
    );
    if (window.WusoolLocationUI) {
      const host = document.createElement('section');
      document.getElementById('organizationDetailsContent').append(host);
      const preview = window.WusoolLocationUI.mount(host, { value: item });
      document
        .getElementById('organizationDetailsModal')
        ?.addEventListener('hidden.bs.modal', () => preview.destroy(), { once: true });
    }
    detailsModal.show();
  };
  WusoolUI.listen(searchInput, 'input', renderTable);
  WusoolUI.listen(statusFilter, 'change', renderTable);
  window.WusoolLive?.watch('admin-organizations', async () => {
    await renderAll();
  });
  await renderAll();
});
