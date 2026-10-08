"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const service = WusoolDataService;
  const tbody = document.getElementById("usersTableBody");
  const search = document.getElementById("userSearch");
  const statusFilter = document.getElementById("userStatusFilter");
  const stats = document.getElementById("userStats");
  const userModal = new bootstrap.Modal(document.getElementById("userModal"));
  const detailsModal = new bootstrap.Modal(document.getElementById("userDetailsModal"));
  const badgeClass = status => {
    const normalized = String(status).toLowerCase();
    if (normalized === "active") {
      return "badge-soft-success";
    }
    if (normalized === "suspended") {
      return "badge-soft-warning";
    }
    return "badge-soft-danger";
  };
  const renderStats = async () => {
    const users = await service.getUsers();
    const active = users.filter(item => item.status === "active").length;
    const suspended = users.filter(item => item.status === "suspended").length;
    const openTickets = (await service.getTickets()).filter(item => !["resolved", "closed"].includes(item.status.toLowerCase())).length;
    const cards = [["Users", users.length, "bi-people"], ["Active", active, "bi-person-check"], ["Suspended", suspended, "bi-person-dash"], ["Open Tickets", openTickets, "bi-ticket-perforated"]];
    WusoolUI.html(stats, cards.map(([label, value, icon]) => `
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
    `).join(""));
  };
  const render = async () => {
    const users = await service.getUsers({
      search: search.value.trim(),
      status: statusFilter.value
    });
    WusoolUI.html(tbody, users.length ? (await WusoolUI.mapAsync(users, async item => {
      const ticketCount = (await service.getTickets({
        requesterId: item.id
      })).length;
      const reviewCount = (await service.getReviews({
        userId: item.id
      })).length;
      return `
                <tr>
                    <td>
                        <div class="d-flex gap-3 align-items-center">
                            <span class="avatar-box">
                                ${item.name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase()}
                            </span>

                            <div>
                                <strong class="d-block">${WusoolUI.escape(item.name)}</strong>
                                <small class="text-secondary">${WusoolUI.escape(item.email || "No email")}</small>
                            </div>
                        </div>
                    </td>

                    <td>${WusoolUI.escape(item.city || "-")}</td>

                    <td>
                        <span class="badge ${badgeClass(item.status)} text-capitalize">
                            ${WusoolUI.escape(item.status)}
                        </span>
                    </td>

                    <td>${WusoolUI.escape(item.accessibilityPreferences.length)}</td>
                    <td>${ticketCount}</td>
                    <td>${reviewCount}</td>

                    <td>
                        <div class="action-menu">
                            <button class="btn btn-sm btn-outline-secondary" data-view="${WusoolUI.escape(item.id)}">
                                View
                            </button>

                            <button class="btn btn-sm btn-outline-primary" data-edit="${WusoolUI.escape(item.id)}">
                                Edit
                            </button>

                            ${item.status === "active" ? `
                                        <button class="btn btn-sm btn-outline-warning" data-status="${WusoolUI.escape(item.id)}" data-value="suspended">
                                            Suspend
                                        </button>
                                    ` : `
                                        <button class="btn btn-sm btn-outline-success" data-status="${WusoolUI.escape(item.id)}" data-value="active">
                                            Activate
                                        </button>
                                    `}

                            <button class="btn btn-sm btn-outline-danger" data-delete="${WusoolUI.escape(item.id)}">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
    })).join("") : `
            <tr>
                <td colspan="7" class="text-center py-5 text-secondary">
                    No users found.
                </td>
            </tr>
        `);
  };
  const clearForm = () => {
    document.getElementById("userModalTitle").textContent = "Add User";
    document.getElementById("userId").value = "";
    document.getElementById("userName").value = "";
    document.getElementById("userEmail").value = "";
    document.getElementById("userPhone").value = "";
    document.getElementById("userCity").value = "Amman";
    document.getElementById("userRole").value = "User";
    document.getElementById("userStatus").value = "active";
    document.getElementById("userPreferences").value = "";
    document.getElementById("userNotes").value = "";
  };
  const fillForm = item => {
    document.getElementById("userModalTitle").textContent = "Edit User";
    document.getElementById("userId").value = item.id;
    document.getElementById("userName").value = item.name;
    document.getElementById("userEmail").value = item.email;
    document.getElementById("userPhone").value = item.phone;
    document.getElementById("userCity").value = item.city;
    document.getElementById("userRole").value = item.role;
    document.getElementById("userStatus").value = item.status;
    document.getElementById("userPreferences").value = item.accessibilityPreferences.join(", ");
    document.getElementById("userNotes").value = item.notes;
  };
  WusoolUI.listen(document.getElementById("addUserButton"), "click", () => {
    clearForm();
    userModal.show();
  });
  WusoolUI.listen(document.getElementById("userForm"), "submit", async event => {
    event.preventDefault();
    const reason=WusoolAdmin.statusReason(document.getElementById("userStatus").value);if(reason===null)return;
    await service.saveUser({
      reason,
      id: document.getElementById("userId").value || undefined,
      name: document.getElementById("userName").value.trim(),
      email: document.getElementById("userEmail").value.trim(),
      phone: document.getElementById("userPhone").value.trim(),
      city: document.getElementById("userCity").value.trim(),
      role: document.getElementById("userRole").value,
      status: document.getElementById("userStatus").value,
      accessibilityPreferences: document.getElementById("userPreferences").value.split(",").map(item => item.trim()).filter(Boolean),
      notes: document.getElementById("userNotes").value.trim()
    });
    userModal.hide();
    await renderStats();
    await render();
    WusoolAdmin.toast("User saved successfully.");
  });
  WusoolUI.listen(tbody, "click", async event => {
    const view = event.target.closest("[data-view]");
    const edit = event.target.closest("[data-edit]");
    const status = event.target.closest("[data-status]");
    const remove = event.target.closest("[data-delete]");
    if (view) {
      const user = await service.getUserById(view.dataset.view);
      if (!user) {
        return;
      }
      const tickets = await service.getTickets({
        requesterId: user.id
      });
      const reviews = await service.getReviews({
        userId: user.id
      });
      document.getElementById("userDetailsTitle").textContent = user.name;
      WusoolUI.html(document.getElementById("userDetailsContent"), `
            <div class="row g-4">
                <div class="col-12 col-xl-4">
                    <article class="content-card h-100">
                        <p class="page-label mb-1">PROFILE</p>
                        <h3 class="h5 fw-bold">Account Overview</h3>

                        <dl class="row mt-4 mb-0">
                            <dt class="col-5">Email</dt>
                            <dd class="col-7">${WusoolUI.escape(user.email || "-")}</dd>

                            <dt class="col-5">Phone</dt>
                            <dd class="col-7">${WusoolUI.escape(user.phone || "-")}</dd>

                            <dt class="col-5">City</dt>
                            <dd class="col-7">${WusoolUI.escape(user.city || "-")}</dd>

                            <dt class="col-5">Status</dt>
                            <dd class="col-7">
                                <span class="badge ${badgeClass(user.status)}">${WusoolUI.escape(user.status)}</span>
                            </dd>
                        </dl>
                    </article>
                </div>

                <div class="col-12 col-xl-8">
                    <article class="content-card mb-4">
                        <p class="page-label mb-1">ACCESSIBILITY PREFERENCES</p>
                        <div class="d-flex flex-wrap gap-2 mt-3">
                            ${user.accessibilityPreferences.length ? user.accessibilityPreferences.map(item => `
                                        <span class="badge text-bg-light border">${item}</span>
                                    `).join("") : `<span class="text-secondary">No preferences saved.</span>`}
                        </div>
                    </article>

                    <div class="row g-4">
                        <div class="col-md-6">
                            <article class="content-card h-100">
                                <p class="page-label mb-1">TICKETS</p>
                                <div class="metric">${tickets.length}</div>
                                <p class="text-secondary mb-0">
                                    Support and accessibility requests.
                                </p>
                            </article>
                        </div>

                        <div class="col-md-6">
                            <article class="content-card h-100">
                                <p class="page-label mb-1">REVIEWS</p>
                                <div class="metric">${reviews.length}</div>
                                <p class="text-secondary mb-0">
                                    Branch reviews submitted by this user.
                                </p>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
        `);
      detailsModal.show();
    }
    if (edit) {
      const user = await service.getUserById(edit.dataset.edit);
      if (!user) {
        return;
      }
      fillForm(user);
      userModal.show();
    }
    if (status) {
      const reason=WusoolAdmin.statusReason(status.dataset.value);if(reason===null)return;
      await service.setUserStatus(status.dataset.status, status.dataset.value, reason);
      await renderStats();
      await render();
      WusoolAdmin.toast("User status updated.");
    }
    if (remove) {
      const user = await service.getUserById(remove.dataset.delete);
      if (!user || !WusoolAdmin.confirm(`Move ${WusoolUI.escape(user.name)} to Recovery Center?`)) {
        return;
      }
      await service.deleteUser(user.id, "Deleted from Admin Users");
      await renderStats();
      await render();
      WusoolAdmin.toast("User moved to Recovery Center.");
    }
  });
  WusoolUI.listen(search, "input", render);
  WusoolUI.listen(statusFilter, "change", render);
  await renderStats();
  await render();
});
