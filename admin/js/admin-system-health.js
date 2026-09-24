
"use strict";

const checks = [
    {
        name: "Unified Data Layer",
        icon: "bi-database",
        healthy: Boolean(window.WusoolDataService),
        detail: "Frontend data service"
    },
    {
        name: "Version Service",
        icon: "bi-clock-history",
        healthy: Boolean(window.WusoolVersionService),
        detail: "Drafts and rollback"
    },
    {
        name: "Behavior Service",
        icon: "bi-lightning-charge",
        healthy: Boolean(window.WusoolBehaviorService),
        detail: "Rules and automation"
    },
    {
        name: "Browser Storage",
        icon: "bi-device-ssd",
        healthy: (() => {
            try {
                localStorage.setItem("__wusool_test", "1");
                localStorage.removeItem("__wusool_test");
                return true;
            } catch {
                return false;
            }
        })(),
        detail: "Current frontend persistence"
    }
];

document.getElementById("healthGrid").innerHTML = checks.map((item) => `
    <div class="col-12 col-md-6 col-xl-3">
        <article class="stat-card">
            <span class="stat-icon"><i class="bi ${item.icon}"></i></span>
            <h2 class="h5 fw-bold mt-4">${item.name}</h2>
            <span class="badge ${item.healthy ? "badge-soft-success" : "badge-soft-danger"}">
                ${item.healthy ? "Healthy" : "Unavailable"}
            </span>
            <p class="text-secondary mt-3 mb-0">${item.detail}</p>
        </article>
    </div>
`).join("");
