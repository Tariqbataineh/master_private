
"use strict";

const query = new URLSearchParams(window.location.search).get("q") || "";
const service = WusoolDataService;

const container = document.querySelector(
    ".container-fluid.px-3.px-md-4.px-xl-5.py-4"
);

const organizations = service.getOrganizations({ search: query });
const branches = service.getBranches({ search: query });
const users = service.getUsers({ search: query });
const tickets = service.getTickets({ search: query });
const reviews = service.getReviews({ search: query });
const subscriptions = service.getSubscriptions({ search: query });

const groups = [
    ["Organizations", organizations, "name", "./admin-organizations.html"],
    ["Branches", branches, "name", "./admin-branches.html"],
    ["Users", users, "name", "./admin-users.html"],
    ["Tickets", tickets, "subject", "./admin-tickets.html"],
    ["Reviews", reviews, "title", "./admin-reviews.html"],
    ["Subscriptions", subscriptions, "plan", "./admin-subscriptions.html"]
];

if (container) {
    container.innerHTML = `
        <article class="content-card mb-4">
            <label class="form-label fw-semibold" for="globalSearchBox">
                Search Wusool
            </label>

            <div class="input-group">
                <input
                    class="form-control"
                    id="globalSearchBox"
                    value="${query.replace(/"/g, "&quot;")}"
                    placeholder="Search users, organizations, branches, tickets..."
                >

                <button class="btn btn-wusool" id="globalSearchButton">
                    Search
                </button>
            </div>
        </article>

        ${groups.map(([label, items, field, href]) => `
            <article class="content-card mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="h5 fw-bold mb-0">${label}</h2>
                    <span class="badge text-bg-light border">${items.length}</span>
                </div>

                ${
                    items.length
                        ? items.slice(0, 8).map((item) => `
                            <a class="admin-list-item text-reset text-decoration-none" href="${href}">
                                <span class="item-icon"><i class="bi bi-search"></i></span>

                                <div>
                                    <strong class="d-block">${item[field] || item.id}</strong>
                                    <small class="text-secondary">${item.id}</small>
                                </div>
                            </a>
                        `).join("")
                        : `<p class="text-secondary mb-0">No matches.</p>`
                }
            </article>
        `).join("")}
    `;

    document.getElementById("globalSearchButton").addEventListener("click", () => {
        const value = document.getElementById("globalSearchBox").value.trim();
        window.location.href = `./admin-global-search.html?q=${encodeURIComponent(value)}`;
    });

    document.getElementById("globalSearchBox").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            document.getElementById("globalSearchButton").click();
        }
    });
}
