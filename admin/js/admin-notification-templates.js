
"use strict";

const KEY = "notificationTemplates";
let items = WusoolFeatureStore.read(KEY, []);
const list = document.getElementById("templatesList");

const persist = () => WusoolFeatureStore.write(KEY, items);

const render = () => {
    list.innerHTML = items.length
        ? items.map((item) => `
            <div class="admin-feature-row">
                <span class="item-icon"><i class="bi bi-chat-left-text"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${item.name}</strong>
                    <small class="text-secondary d-block">${item.subject}</small>
                    <p class="mb-0 mt-2">${item.message}</p>
                </div>

                <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">
                    Delete
                </button>
            </div>
        `).join("")
        : `<p class="text-secondary mb-0">No templates yet.</p>`;
};

document.getElementById("saveTemplate").addEventListener("click", () => {
    const name = document.getElementById("templateName").value.trim();

    if (!name) {
        WusoolAdmin.toast("Enter template name.", "warning");
        return;
    }

    items.unshift({
        id: WusoolFeatureStore.id("template"),
        name,
        subject: document.getElementById("templateSubject").value.trim(),
        message: document.getElementById("templateMessage").value.trim()
    });

    persist();
    render();
});

list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete]");

    if (button) {
        items = items.filter((x) => x.id !== button.dataset.delete);
        persist();
        render();
    }
});

render();
