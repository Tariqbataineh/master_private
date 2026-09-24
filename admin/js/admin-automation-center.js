
"use strict";

let automations = WusoolBehaviorService.getAutomations();
const list = document.getElementById("automationList");

const render = () => {
    list.innerHTML = automations.map((item) => `
        <div class="admin-list-item">
            <span class="item-icon">
                <i class="bi bi-lightning-charge"></i>
            </span>

            <div class="flex-grow-1">
                <strong class="d-block">${item.name}</strong>
                <small class="text-secondary d-block mt-1">
                    WHEN ${item.trigger}
                </small>
                <small class="text-secondary">
                    THEN ${item.action} ${item.message || item.actionValue || ""}
                </small>
            </div>

            <div class="d-flex flex-column gap-2">
                <button class="btn btn-sm btn-outline-warning" data-toggle="${item.id}">
                    ${item.enabled ? "Disable" : "Enable"}
                </button>

                <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">
                    Delete
                </button>
            </div>
        </div>
    `).join("");
};

document.getElementById("addAutomationButton").addEventListener("click", () => {
    const action = document.getElementById("automationAction").value;
    const message = document.getElementById("automationMessage").value.trim();

    automations.push({
        id: `automation-${Date.now()}`,
        name: document.getElementById("automationName").value.trim() || "Automation",
        enabled: true,
        trigger: document.getElementById("automationTrigger").value,
        action,
        message: action === "notifyAdmin" ? message : "",
        actionValue: action === "setStatus" ? message : ""
    });

    WusoolBehaviorService.saveAutomations(automations);
    render();
});

list.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle]");
    const remove = event.target.closest("[data-delete]");

    if (toggle) {
        const item = automations.find((x) => x.id === toggle.dataset.toggle);
        if (item) {
            item.enabled = !item.enabled;
            WusoolBehaviorService.saveAutomations(automations);
            render();
        }
    }

    if (remove) {
        automations = automations.filter((x) => x.id !== remove.dataset.delete);
        WusoolBehaviorService.saveAutomations(automations);
        render();
    }
});

document.getElementById("testAutomation").addEventListener("click", () => {
    WusoolBehaviorService.triggerAutomation(
        "ticket.created",
        {
            entityType: "Ticket",
            entity: WusoolDataService.getTickets()[0] || null
        }
    );

    WusoolAdmin.toast("Test trigger executed.");
});

render();
