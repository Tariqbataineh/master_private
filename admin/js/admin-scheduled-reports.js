
"use strict";

const KEY = "scheduledReports";
let items = WusoolFeatureStore.read(KEY, []);
const list = document.getElementById("schedulesList");

const persist = () => WusoolFeatureStore.write(KEY, items);

const render = () => {
    list.innerHTML = items.length
        ? items.map((item) => `
            <div class="admin-feature-row">
                <span class="item-icon"><i class="bi bi-calendar2-check"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${item.report}</strong>
                    <small class="text-secondary">
                        ${item.frequency} · ${item.recipient}
                    </small>
                </div>

                <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">
                    Delete
                </button>
            </div>
        `).join("")
        : `<p class="text-secondary mb-0">No scheduled reports.</p>`;
};

document.getElementById("addSchedule").addEventListener("click", () => {
    const recipient = document.getElementById("scheduleRecipient").value.trim();

    if (!recipient) {
        WusoolAdmin.toast("Enter recipient email.", "warning");
        return;
    }

    items.unshift({
        id: WusoolFeatureStore.id("schedule"),
        report: document.getElementById("scheduleReport").value,
        frequency: document.getElementById("scheduleFrequency").value,
        recipient
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
