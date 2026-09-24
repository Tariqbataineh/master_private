
"use strict";

const KEY = "deviceSessions";

let sessions = WusoolFeatureStore.read(KEY, []);

if (!sessions.length) {
    sessions = [
        {
            id: "current-browser",
            device: navigator.userAgent,
            active: true,
            current: true,
            lastActive: new Date().toISOString()
        }
    ];

    WusoolFeatureStore.write(KEY, sessions);
}

const list = document.getElementById("sessionsList");

const render = () => {
    list.innerHTML = sessions.map((item) => `
        <div class="admin-feature-row">
            <span class="item-icon"><i class="bi bi-laptop"></i></span>

            <div class="flex-grow-1">
                <strong class="d-block">
                    ${item.current ? "Current Browser" : "Saved Session"}
                </strong>
                <small class="text-secondary">${item.device}</small>
            </div>

            <span class="badge ${item.active ? "badge-soft-success" : "badge-soft-danger"}">
                ${item.active ? "Active" : "Ended"}
            </span>
        </div>
    `).join("");
};

document.getElementById("terminateDemoSessions").addEventListener("click", () => {
    sessions = sessions.map((item) => ({
        ...item,
        active: item.current
    }));

    WusoolFeatureStore.write(KEY, sessions);
    render();
    WusoolAdmin.toast("Other sessions terminated.");
});

render();
