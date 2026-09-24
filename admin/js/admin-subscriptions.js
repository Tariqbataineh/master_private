
"use strict";

const service = WusoolDataService;
const tbody = document.getElementById("subscriptionsTableBody");
const search = document.getElementById("subscriptionSearch");
const statusFilter = document.getElementById("subscriptionStatusFilter");
const stats = document.getElementById("subscriptionStats");
const modal = new bootstrap.Modal(document.getElementById("subscriptionModal"));

const organizationSelect = document.getElementById("subscriptionOrganization");

const badgeClass = (status) => {
    const normalized = String(status).toLowerCase();

    if (normalized === "active") {
        return "badge-soft-success";
    }

    if (normalized === "paused") {
        return "badge-soft-warning";
    }

    return "badge-soft-danger";
};

const loadOrganizations = () => {
    organizationSelect.innerHTML = service.getOrganizations()
        .map((item) => `
            <option value="${item.id}">${item.name}</option>
        `)
        .join("");
};

const renderStats = () => {
    const items = service.getSubscriptions();
    const active = items.filter((item) => item.status === "Active").length;
    const enterprise = items.filter((item) => item.plan === "Enterprise").length;
    const expiring = items.filter((item) => {
        if (!item.endDate) {
            return false;
        }

        const ms = new Date(item.endDate).getTime() - Date.now();
        const days = ms / 86400000;

        return days >= 0 && days <= 7;
    }).length;

    const cards = [
        ["Subscriptions", items.length, "bi-credit-card"],
        ["Active", active, "bi-check-circle"],
        ["Enterprise", enterprise, "bi-stars"],
        ["Expiring Soon", expiring, "bi-calendar-x"]
    ];

    stats.innerHTML = cards.map(([label, value, icon]) => `
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
    `).join("");
};

const render = () => {
    const items = service.getSubscriptions({
        search: search.value.trim(),
        status: statusFilter.value
    });

    tbody.innerHTML = items.length
        ? items.map((item) => {
            const organization = service.getOrganizationById(item.organizationId);

            return `
                <tr>
                    <td>
                        <strong>${organization?.name || "Unknown Organization"}</strong>
                    </td>

                    <td>${item.plan}</td>

                    <td>
                        <span class="badge ${badgeClass(item.status)}">
                            ${item.status}
                        </span>
                    </td>

                    <td>${item.branchLimit}</td>
                    <td>${item.billingCycle}</td>
                    <td>${item.endDate || "-"}</td>

                    <td>
                        <div class="action-menu">
                            <button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">
                                Edit
                            </button>

                            ${
                                item.status === "Active"
                                    ? `
                                        <button class="btn btn-sm btn-outline-warning" data-status="${item.id}" data-value="Paused">
                                            Pause
                                        </button>
                                    `
                                    : `
                                        <button class="btn btn-sm btn-outline-success" data-status="${item.id}" data-value="Active">
                                            Activate
                                        </button>
                                    `
                            }

                            <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("")
        : `
            <tr>
                <td colspan="7" class="text-center py-5 text-secondary">
                    No subscriptions found.
                </td>
            </tr>
        `;
};

const clearForm = () => {
    document.getElementById("subscriptionModalTitle").textContent = "Add Subscription";
    document.getElementById("subscriptionId").value = "";
    document.getElementById("subscriptionPlan").value = "Standard";
    document.getElementById("subscriptionStatus").value = "Active";
    document.getElementById("subscriptionBranchLimit").value = 5;
    document.getElementById("subscriptionPrice").value = 0;
    document.getElementById("subscriptionBilling").value = "Monthly";
    document.getElementById("subscriptionStart").value = new Date().toISOString().slice(0, 10);
    document.getElementById("subscriptionEnd").value = "";
    document.getElementById("subscriptionAutoRenew").checked = true;
    document.getElementById("subscriptionNotes").value = "";
};

const fillForm = (item) => {
    document.getElementById("subscriptionModalTitle").textContent = "Edit Subscription";
    document.getElementById("subscriptionId").value = item.id;
    organizationSelect.value = item.organizationId;
    document.getElementById("subscriptionPlan").value = item.plan;
    document.getElementById("subscriptionStatus").value = item.status;
    document.getElementById("subscriptionBranchLimit").value = item.branchLimit;
    document.getElementById("subscriptionPrice").value = item.price;
    document.getElementById("subscriptionBilling").value = item.billingCycle;
    document.getElementById("subscriptionStart").value = item.startDate;
    document.getElementById("subscriptionEnd").value = item.endDate;
    document.getElementById("subscriptionAutoRenew").checked = item.autoRenew;
    document.getElementById("subscriptionNotes").value = item.notes;
};

document.getElementById("addSubscriptionButton").addEventListener("click", () => {
    clearForm();
    modal.show();
});

document.getElementById("subscriptionForm").addEventListener("submit", (event) => {
    event.preventDefault();

    service.saveSubscription({
        id: document.getElementById("subscriptionId").value || undefined,
        organizationId: organizationSelect.value,
        plan: document.getElementById("subscriptionPlan").value,
        status: document.getElementById("subscriptionStatus").value,
        branchLimit: Number(document.getElementById("subscriptionBranchLimit").value),
        price: Number(document.getElementById("subscriptionPrice").value),
        billingCycle: document.getElementById("subscriptionBilling").value,
        startDate: document.getElementById("subscriptionStart").value,
        endDate: document.getElementById("subscriptionEnd").value,
        autoRenew: document.getElementById("subscriptionAutoRenew").checked,
        notes: document.getElementById("subscriptionNotes").value.trim()
    });

    modal.hide();
    renderStats();
    render();
    WusoolAdmin.toast("Subscription saved.");
});

tbody.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    const status = event.target.closest("[data-status]");
    const remove = event.target.closest("[data-delete]");

    if (edit) {
        const item = service.getSubscriptionById(edit.dataset.edit);
        if (!item) {
            return;
        }

        fillForm(item);
        modal.show();
    }

    if (status) {
        service.setSubscriptionStatus(
            status.dataset.status,
            status.dataset.value
        );

        renderStats();
        render();
        WusoolAdmin.toast("Subscription status updated.");
    }

    if (remove) {
        const item = service.getSubscriptionById(remove.dataset.delete);

        if (!item || !WusoolAdmin.confirm("Move this subscription to Recovery Center?")) {
            return;
        }

        service.deleteSubscription(item.id, "Deleted from Admin Subscriptions");
        renderStats();
        render();
        WusoolAdmin.toast("Subscription moved to Recovery Center.");
    }
});

search.addEventListener("input", render);
statusFilter.addEventListener("change", render);

loadOrganizations();
renderStats();
render();
