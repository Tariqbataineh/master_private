
"use strict";

const snapshot = WusoolDataService.getDashboardSnapshot();

document.getElementById("reportStats").innerHTML = [
    ["Users", snapshot.users, "bi-people"],
    ["Organizations", snapshot.organizations, "bi-buildings"],
    ["Branches", snapshot.branches, "bi-geo-alt"],
    ["Open Tickets", snapshot.openTickets, "bi-ticket-perforated"]
].map(([label, value, icon]) => `
    <div class="col-12 col-sm-6 col-xl-3">
        <article class="stat-card">
            <div class="d-flex justify-content-between">
                <div>
                    <p class="text-secondary mb-2">${label}</p>
                    <div class="metric-number">${value}</div>
                </div>
                <span class="stat-icon"><i class="bi ${icon}"></i></span>
            </div>
        </article>
    </div>
`).join("");

const summarize = (items, field) => {
    const map = {};

    items.forEach((item) => {
        const key = item[field] || "Unknown";
        map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map);
};

const renderSummary = (target, rows) => {
    document.getElementById(target).innerHTML = rows.length
        ? rows.map(([label, count]) => `
            <div class="admin-feature-row">
                <div class="flex-grow-1">${label}</div>
                <strong>${count}</strong>
            </div>
        `).join("")
        : `<p class="text-secondary mb-0">No data available.</p>`;
};

renderSummary("branchReport", summarize(WusoolDataService.getBranches(), "status"));
renderSummary("ticketReport", summarize(WusoolDataService.getTickets(), "status"));
