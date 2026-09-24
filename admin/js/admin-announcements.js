
"use strict";

const KEY = "wusoolAnnouncements";

const read = () => {
    try {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
        return [];
    }
};

let announcements = read();

const list = document.getElementById("announcementsList");

const render = () => {
    list.innerHTML = announcements.length
        ? announcements.map((item) => `
            <div class="admin-list-item">
                <span class="item-icon">
                    <i class="bi bi-megaphone"></i>
                </span>

                <div class="flex-grow-1">
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        <strong>${item.title}</strong>

                        <span class="badge text-bg-light border">
                            ${item.audience}
                        </span>

                        <span class="badge ${item.enabled !== false ? "badge-soft-success" : "badge-soft-danger"}">
                            ${item.enabled !== false ? "Enabled" : "Disabled"}
                        </span>
                    </div>

                    <p class="text-secondary mb-1 mt-2">
                        ${item.message}
                    </p>

                    <small class="text-secondary">
                        ${item.start || "Now"} → ${item.end || "No end date"}
                    </small>
                </div>

                <div class="d-flex flex-column gap-2">
                    <button class="btn btn-sm btn-outline-warning" data-toggle="${item.id}">
                        ${item.enabled !== false ? "Disable" : "Enable"}
                    </button>

                    <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">
                        Delete
                    </button>
                </div>
            </div>
        `).join("")
        : `
            <div class="text-center py-5 text-secondary">
                No announcements yet.
            </div>
        `;
};

document.getElementById("publishAnnouncement").addEventListener("click", () => {
    const title = document.getElementById("announcementTitle").value.trim();
    const message = document.getElementById("announcementMessage").value.trim();

    if (!title || !message) {
        WusoolAdmin.toast("Enter title and message.", "warning");
        return;
    }

    WusoolVersionService.createVersion({
        area: "Announcements",
        description: "Announcement list changed"
    });

    announcements.unshift({
        id: `announcement-${Date.now()}`,
        title,
        message,
        audience: document.getElementById("announcementAudience").value,
        start: document.getElementById("announcementStart").value,
        end: document.getElementById("announcementEnd").value,
        enabled: true,
        createdAt: new Date().toISOString()
    });

    localStorage.setItem(KEY, JSON.stringify(announcements));

    document.getElementById("announcementTitle").value = "";
    document.getElementById("announcementMessage").value = "";

    render();
    WusoolAdmin.toast("Announcement published.");
});

list.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle]");
    const remove = event.target.closest("[data-delete]");

    if (toggle) {
        const item = announcements.find((x) => x.id === toggle.dataset.toggle);

        if (item) {
            item.enabled = item.enabled === false;
            localStorage.setItem(KEY, JSON.stringify(announcements));
            render();
        }
    }

    if (remove) {
        announcements = announcements.filter((x) => x.id !== remove.dataset.delete);
        localStorage.setItem(KEY, JSON.stringify(announcements));
        render();
    }
});

render();
