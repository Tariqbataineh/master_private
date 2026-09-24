
"use strict";

const list = document.getElementById("aiBranchList");
const stats = document.getElementById("aiStats");
const filter = document.getElementById("aiStatusFilter");

const renderStats = () => {
    const branches = WusoolDataService.getBranches();
    const low = branches.filter((x) => x.accessibilityScore < 60).length;
    const medium = branches.filter((x) => x.accessibilityScore >= 60 && x.accessibilityScore < 80).length;
    const high = branches.filter((x) => x.accessibilityScore >= 80).length;

    stats.innerHTML = [
        ["Analyzed Branches", branches.length, "bi-stars"],
        ["High Score", high, "bi-check-circle"],
        ["Medium Score", medium, "bi-exclamation-circle"],
        ["Needs Review", low, "bi-exclamation-triangle"]
    ].map(([label, value, icon]) => `
        <div class="col-12 col-sm-6 col-xl-3">
            <article class="stat-card">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <p class="text-secondary mb-2">${label}</p>
                        <div class="metric-number">${value}</div>
                    </div>
                    <span class="stat-icon"><i class="bi ${icon}"></i></span>
                </div>
            </article>
        </div>
    `).join("");
};

const render = () => {
    let branches = WusoolDataService.getBranches();

    if (filter.value === "needs-review") {
        branches = branches.filter((x) => x.accessibilityScore < 60);
    }

    if (filter.value === "good") {
        branches = branches.filter((x) => x.accessibilityScore >= 80);
    }

    list.innerHTML = branches.map((branch) => {
        const org = WusoolDataService.getOrganizationById(branch.organizationId);

        return `
            <div class="admin-feature-row">
                <span class="item-icon"><i class="bi bi-stars"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${branch.name}</strong>
                    <small class="text-secondary">
                        ${org?.name || ""} · ${branch.city}
                    </small>
                </div>

                <strong>${branch.accessibilityScore}%</strong>

                <select class="form-select" style="width: 160px;" data-ai-status="${branch.id}">
                    <option value="approved" ${branch.status === "approved" ? "selected" : ""}>Approved</option>
                    <option value="needs review" ${branch.status === "needs review" ? "selected" : ""}>Needs Review</option>
                    <option value="pending" ${branch.status === "pending" ? "selected" : ""}>Pending</option>
                </select>
            </div>
        `;
    }).join("");
};

list.addEventListener("change", (event) => {
    const branchId = event.target.dataset.aiStatus;

    if (branchId) {
        WusoolDataService.setBranchStatus(branchId, event.target.value);
        WusoolAdmin.toast("Branch review status updated.");
    }
});

filter.addEventListener("change", render);

renderStats();
render();
