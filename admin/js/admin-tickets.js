
"use strict";

const service = WusoolDataService;
const tbody = document.getElementById("ticketsTableBody");
const search = document.getElementById("ticketSearch");
const statusFilter = document.getElementById("ticketStatusFilter");
const priorityFilter = document.getElementById("ticketPriorityFilter");
const stats = document.getElementById("ticketStats");
const modal = new bootstrap.Modal(document.getElementById("ticketModal"));

const badgeClass = (status) => {
    const normalized = String(status).toLowerCase();

    if (normalized === "resolved" || normalized === "closed") {
        return "badge-soft-success";
    }

    if (normalized === "in progress") {
        return "badge-soft-warning";
    }

    return "badge-soft-info";
};

const priorityClass = (priority) => {
    return `priority-${String(priority).toLowerCase()}`;
};

const loadOptions = () => {
    const users = service.getUsers();
    const branches = service.getBranches();

    document.getElementById("ticketRequester").innerHTML =
        `<option value="">None</option>` +
        users.map((item) => `
            <option value="${item.id}">${item.name}</option>
        `).join("");

    document.getElementById("ticketBranch").innerHTML =
        `<option value="">None</option>` +
        branches.map((item) => `
            <option value="${item.id}">${item.name}</option>
        `).join("");
};

const renderStats = () => {
    const tickets = service.getTickets();
    const open = tickets.filter((item) => item.status === "Open").length;
    const inProgress = tickets.filter((item) => item.status === "In Progress").length;
    const high = tickets.filter((item) => item.priority === "High").length;

    const cards = [
        ["Tickets", tickets.length, "bi-ticket-perforated"],
        ["Open", open, "bi-inbox"],
        ["In Progress", inProgress, "bi-arrow-repeat"],
        ["High Priority", high, "bi-exclamation-triangle"]
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

const requesterLabel = (ticket) => {
    if (ticket.requesterId) {
        return service.getUserById(ticket.requesterId)?.name || "Unknown User";
    }

    if (ticket.organizationId) {
        return service.getOrganizationById(ticket.organizationId)?.name || "Unknown Organization";
    }

    return ticket.requesterType || "Unknown";
};

const render = () => {
    const tickets = service.getTickets({
        search: search.value.trim(),
        status: statusFilter.value,
        priority: priorityFilter.value
    });

    tbody.innerHTML = tickets.length
        ? tickets.map((item) => `
            <tr>
                <td>
                    <strong class="d-block">${item.subject}</strong>
                    <small class="text-secondary">${item.category}</small>
                </td>

                <td>${requesterLabel(item)}</td>

                <td>
                    <span class="badge ${priorityClass(item.priority)}">
                        ${item.priority}
                    </span>
                </td>

                <td>
                    <span class="badge ${badgeClass(item.status)}">
                        ${item.status}
                    </span>
                </td>

                <td>${item.assignedTo || "Unassigned"}</td>
                <td>${new Date(item.updatedAt).toLocaleDateString()}</td>

                <td>
                    <div class="action-menu">
                        <button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">
                            Edit
                        </button>

                        ${
                            item.status !== "Resolved"
                                ? `
                                    <button class="btn btn-sm btn-outline-success" data-resolve="${item.id}">
                                        Resolve
                                    </button>
                                `
                                : ""
                        }

                        <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="7" class="text-center py-5 text-secondary">
                    No tickets found.
                </td>
            </tr>
        `;
};

const clearForm = () => {
    document.getElementById("ticketModalTitle").textContent = "Add Ticket";
    document.getElementById("ticketId").value = "";
    document.getElementById("ticketSubject").value = "";
    document.getElementById("ticketPriority").value = "Medium";
    document.getElementById("ticketStatus").value = "Open";
    document.getElementById("ticketCategory").value = "General";
    document.getElementById("ticketRequester").value = "";
    document.getElementById("ticketBranch").value = "";
    document.getElementById("ticketDescription").value = "";
    document.getElementById("ticketAssignedTo").value = "";
    document.getElementById("ticketResolution").value = "";
};

const fillForm = (item) => {
    document.getElementById("ticketModalTitle").textContent = "Edit Ticket";
    document.getElementById("ticketId").value = item.id;
    document.getElementById("ticketSubject").value = item.subject;
    document.getElementById("ticketPriority").value = item.priority;
    document.getElementById("ticketStatus").value = item.status;
    document.getElementById("ticketCategory").value = item.category;
    document.getElementById("ticketRequester").value = item.requesterId;
    document.getElementById("ticketBranch").value = item.branchId;
    document.getElementById("ticketDescription").value = item.description;
    document.getElementById("ticketAssignedTo").value = item.assignedTo;
    document.getElementById("ticketResolution").value = item.resolution;
};

document.getElementById("addTicketButton").addEventListener("click", () => {
    clearForm();
    modal.show();
});

document.getElementById("ticketForm").addEventListener("submit", (event) => {
    event.preventDefault();

    service.saveTicket({
        id: document.getElementById("ticketId").value || undefined,
        subject: document.getElementById("ticketSubject").value.trim(),
        priority: document.getElementById("ticketPriority").value,
        status: document.getElementById("ticketStatus").value,
        category: document.getElementById("ticketCategory").value.trim(),
        requesterId: document.getElementById("ticketRequester").value,
        branchId: document.getElementById("ticketBranch").value,
        description: document.getElementById("ticketDescription").value.trim(),
        assignedTo: document.getElementById("ticketAssignedTo").value.trim(),
        resolution: document.getElementById("ticketResolution").value.trim()
    });

    modal.hide();
    renderStats();
    render();
    WusoolAdmin.toast("Ticket saved successfully.");
});

tbody.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    const resolve = event.target.closest("[data-resolve]");
    const remove = event.target.closest("[data-delete]");

    if (edit) {
        const item = service.getTicketById(edit.dataset.edit);
        if (!item) {
            return;
        }

        fillForm(item);
        modal.show();
    }

    if (resolve) {
        service.setTicketStatus(resolve.dataset.resolve, "Resolved");
        renderStats();
        render();
        WusoolAdmin.toast("Ticket resolved.");
    }

    if (remove) {
        const item = service.getTicketById(remove.dataset.delete);
        if (!item || !WusoolAdmin.confirm("Move this ticket to Recovery Center?")) {
            return;
        }

        service.deleteTicket(item.id, "Deleted from Admin Tickets");
        renderStats();
        render();
        WusoolAdmin.toast("Ticket moved to Recovery Center.");
    }
});

search.addEventListener("input", render);
statusFilter.addEventListener("change", render);
priorityFilter.addEventListener("change", render);

loadOptions();
renderStats();
render();
