
"use strict";

const service = WusoolDataService;

const statsContainer = document.getElementById("statsContainer");
const attentionContainer = document.getElementById("attentionContainer");
const activityContainer = document.getElementById("activityContainer");
const attentionCount = document.getElementById("attentionCount");
const dashboardRange = document.getElementById("dashboardRange");
const globalSearch = document.getElementById("globalSearch");

const loadDashboardData = () => {
    const snapshot = service.getDashboardSnapshot();

    const stats = [
        {
            label: "Users",
            value: snapshot.users,
            icon: "bi-people",
            href: "./admin-users.html"
        },
        {
            label: "Organizations",
            value: snapshot.organizations,
            icon: "bi-buildings",
            href: "./admin-organizations.html"
        },
        {
            label: "Branches",
            value: snapshot.branches,
            icon: "bi-geo-alt",
            href: "./admin-branches.html"
        },
        {
            label: "Pending Branches",
            value: snapshot.pendingBranches,
            icon: "bi-hourglass-split",
            href: "./admin-branches.html?status=pending"
        },
        {
            label: "Open Tickets",
            value: snapshot.openTickets,
            icon: "bi-ticket-perforated",
            href: "./admin-tickets.html"
        },
        {
            label: "Active Subscriptions",
            value: snapshot.activeSubscriptions,
            icon: "bi-credit-card",
            href: "./admin-subscriptions.html"
        },
        {
            label: "Flagged Reviews",
            value: snapshot.flaggedReviews,
            icon: "bi-flag",
            href: "./admin-reviews.html"
        }
    ];

    const attention = [];

    if (snapshot.pendingBranches) {
        attention.push({
            title: `${snapshot.pendingBranches} branches require review`,
            text: "Review pending or needs-review branches.",
            icon: "bi-building-check",
            href: "./admin-branches.html"
        });
    }

    if (snapshot.openTickets) {
        attention.push({
            title: `${snapshot.openTickets} support tickets are still open`,
            text: "Review assignment, priority and current ticket status.",
            icon: "bi-ticket-perforated",
            href: "./admin-tickets.html"
        });
    }

    if (snapshot.flaggedReviews) {
        attention.push({
            title: `${snapshot.flaggedReviews} reviews are flagged`,
            text: "Moderate flagged review content.",
            icon: "bi-flag",
            href: "./admin-reviews.html"
        });
    }

    const activity = service.getAuditLog()
        .slice(0, 6)
        .map((entry) => ({
            title: `${entry.action} ${entry.entityType}`,
            text: entry.entityId,
            time: new Date(entry.timestamp).toLocaleString(),
            icon: "bi-clock-history"
        }));

    return {
        stats,
        attention,
        activity
    };
};

const renderDashboard = () => {
    const data = loadDashboardData();

    statsContainer.innerHTML = data.stats.map((item) => `
        <div class="col-12 col-sm-6 col-xl-3">
            <a class="stat-link" href="${item.href}">
                <article class="stat-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="text-secondary mb-2">${item.label}</p>
                            <p class="stat-number mb-0">${item.value}</p>
                        </div>

                        <span class="stat-icon">
                            <i class="bi ${item.icon}"></i>
                        </span>
                    </div>
                </article>
            </a>
        </div>
    `).join("");

    attentionCount.textContent = data.attention.length;

    attentionContainer.innerHTML = data.attention.length
        ? data.attention.map((item) => `
            <a href="${item.href}" class="attention-item text-decoration-none text-reset">
                <span class="attention-icon text-danger">
                    <i class="bi ${item.icon}"></i>
                </span>

                <span>
                    <strong class="d-block">${item.title}</strong>
                    <small class="text-secondary">${item.text}</small>
                </span>
            </a>
        `).join("")
        : `
            <p class="text-secondary mb-0">
                Nothing critical requires attention right now.
            </p>
        `;

    activityContainer.innerHTML = data.activity.length
        ? data.activity.map((item) => `
            <div class="activity-item">
                <span class="activity-icon">
                    <i class="bi ${item.icon}"></i>
                </span>

                <div>
                    <strong class="d-block">${item.title}</strong>
                    <span class="text-secondary d-block">${item.text}</span>
                    <small class="text-secondary">${item.time}</small>
                </div>
            </div>
        `).join("")
        : `
            <p class="text-secondary mb-0">
                No activity yet.
            </p>
        `;
};

dashboardRange?.addEventListener("change", renderDashboard);

globalSearch?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
        return;
    }

    const query = globalSearch.value.trim();

    if (!query) {
        return;
    }

    window.location.href =
        `./admin-global-search.html?q=${encodeURIComponent(query)}`;
});

renderDashboard();
