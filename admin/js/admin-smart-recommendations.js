
"use strict";

const recommendations = [];

const pendingBranches = WusoolDataService.getBranches()
    .filter((x) => ["pending", "needs review"].includes(x.status.toLowerCase()));

const lowScores = WusoolDataService.getBranches()
    .filter((x) => Number(x.accessibilityScore) < 60);

const openHighTickets = WusoolDataService.getTickets()
    .filter((x) =>
        x.priority === "High" &&
        !["Resolved", "Closed"].includes(x.status)
    );

const pendingOrganizations = WusoolDataService.getOrganizations({
    status: "pending"
});

if (pendingBranches.length) {
    recommendations.push({
        icon: "bi-building-check",
        title: `${pendingBranches.length} branches need review`,
        text: "Open Branches and review pending submissions.",
        href: "./admin-branches.html"
    });
}

if (lowScores.length) {
    recommendations.push({
        icon: "bi-universal-access",
        title: `${lowScores.length} branches have score below 60%`,
        text: "Review accessibility data and improvement actions.",
        href: "./admin-ai-management.html"
    });
}

if (openHighTickets.length) {
    recommendations.push({
        icon: "bi-exclamation-triangle",
        title: `${openHighTickets.length} high-priority tickets are open`,
        text: "Assign or resolve support issues.",
        href: "./admin-tickets.html"
    });
}

if (pendingOrganizations.length) {
    recommendations.push({
        icon: "bi-buildings",
        title: `${pendingOrganizations.length} organizations await approval`,
        text: "Review organization registration information.",
        href: "./admin-organizations.html"
    });
}

document.getElementById("recommendationsList").innerHTML = recommendations.length
    ? recommendations.map((item) => `
        <a href="${item.href}" class="admin-feature-row text-reset text-decoration-none">
            <span class="item-icon"><i class="bi ${item.icon}"></i></span>
            <div>
                <strong class="d-block">${item.title}</strong>
                <small class="text-secondary">${item.text}</small>
            </div>
        </a>
    `).join("")
    : `<div class="alert alert-success mb-0">No urgent recommended actions right now.</div>`;
