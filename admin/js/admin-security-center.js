"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  let failed = [];
  try {
    failed = JSON.parse((await WusoolServices.rawRead("wusoolFailedLogins")) || "[]");
  } catch (error) {
    if (WusoolServices.mode === "api") throw error;
    failed = [];
  }
  const activeImpersonation = await WusoolBehaviorService.getImpersonation();
  WusoolUI.html(document.getElementById("securityStats"), [["Failed Logins", failed.length, "bi-shield-exclamation"], ["Active Impersonation", activeImpersonation ? 1 : 0, "bi-person-switch"], ["Admin Role", (await WusoolServices.rawRead("wusoolAdminRole")) || "super-admin", "bi-person-badge"], ["Audit Entries", (await WusoolDataService.getAuditLog()).length, "bi-journal-text"]].map(([label, value, icon]) => `
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
`).join(""));
  WusoolUI.html(document.getElementById("failedLogins"), failed.length ? failed.map(item => `
        <div class="admin-feature-row">
            <span class="item-icon"><i class="bi bi-person-x"></i></span>
            <div class="flex-grow-1">
                <strong>${WusoolUI.escape(item.email || "Unknown email")}</strong>
            </div>
            <small class="text-secondary">${new Date(item.time).toLocaleString()}</small>
        </div>
    `).join("") : `<p class="text-secondary mb-0">No failed login attempts recorded.</p>`);
});
