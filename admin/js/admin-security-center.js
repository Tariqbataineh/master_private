
"use strict";

let failed = [];

try {
    failed = JSON.parse(localStorage.getItem("wusoolFailedLogins") || "[]");
} catch {
    failed = [];
}

const activeImpersonation = WusoolBehaviorService.getImpersonation();

document.getElementById("securityStats").innerHTML = [
    ["Failed Logins", failed.length, "bi-shield-exclamation"],
    ["Active Impersonation", activeImpersonation ? 1 : 0, "bi-person-switch"],
    ["Admin Role", sessionStorage.getItem("wusoolAdminRole") || "super-admin", "bi-person-badge"],
    ["Audit Entries", WusoolDataService.getAuditLog().length, "bi-journal-text"]
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

document.getElementById("failedLogins").innerHTML = failed.length
    ? failed.map((item) => `
        <div class="admin-feature-row">
            <span class="item-icon"><i class="bi bi-person-x"></i></span>
            <div class="flex-grow-1">
                <strong>${item.email || "Unknown email"}</strong>
            </div>
            <small class="text-secondary">${new Date(item.time).toLocaleString()}</small>
        </div>
    `).join("")
    : `<p class="text-secondary mb-0">No failed login attempts recorded.</p>`;
