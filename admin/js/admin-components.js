
"use strict";

const KEY = "components";
let items = WusoolFeatureStore.read(KEY, []);
const list = document.getElementById("componentsList");

const persist = () => WusoolFeatureStore.write(KEY, items);

const render = () => {
    list.innerHTML = items.length
        ? items.map((item) => `
            <div class="admin-feature-row">
                <span class="item-icon"><i class="bi bi-boxes"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${item.name}</strong>
                    <small class="text-secondary">${item.type}</small>
                    <p class="mb-0 mt-2">${item.content}</p>
                </div>

                <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">
                    Delete
                </button>
            </div>
        `).join("")
        : `<p class="text-secondary mb-0">No reusable components yet.</p>`;
};

document.getElementById("addComponent").addEventListener("click", () => {
    const name = document.getElementById("componentName").value.trim();

    if (!name) {
        WusoolAdmin.toast("Enter component name.", "warning");
        return;
    }

    items.unshift({
        id: WusoolFeatureStore.id("component"),
        name,
        type: document.getElementById("componentType").value,
        content: document.getElementById("componentContent").value.trim()
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
