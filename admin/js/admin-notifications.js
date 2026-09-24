
"use strict";

const list = document.getElementById("notificationList");

const render = () => {
    const items = WusoolBehaviorService.getNotifications();

    list.innerHTML = items.length
        ? items.map((item) => `
            <div class="admin-list-item">
                <span class="item-icon">
                    <i class="bi bi-bell${item.read ? "" : "-fill"}"></i>
                </span>

                <div class="flex-grow-1">
                    <strong class="d-block">${item.title}</strong>
                    <p class="text-secondary mb-1">${item.message}</p>
                    <small class="text-secondary">
                        ${new Date(item.createdAt).toLocaleString()}
                    </small>
                </div>

                <span class="badge ${item.read ? "text-bg-light border" : "badge-soft-info"}">
                    ${item.read ? "Read" : "New"}
                </span>
            </div>
        `).join("")
        : `<p class="text-secondary mb-0">No notifications yet.</p>`;
};

document.getElementById("createNotification").addEventListener("click", () => {
    const title = document.getElementById("notificationTitle").value.trim();
    const message = document.getElementById("notificationMessage").value.trim();

    if (!title || !message) {
        WusoolAdmin.toast("Enter title and message.", "warning");
        return;
    }

    WusoolBehaviorService.pushNotification({
        title,
        message
    });

    document.getElementById("notificationTitle").value = "";
    document.getElementById("notificationMessage").value = "";

    render();
});

document.getElementById("markAllRead").addEventListener("click", () => {
    const items = WusoolBehaviorService.getNotifications();

    items.forEach((item) => {
        item.read = true;
    });

    localStorage.setItem(
        WusoolBehaviorService.KEYS.notifications,
        JSON.stringify(items)
    );

    render();
});

render();
