"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  let automations = await WusoolBehaviorService.getAutomations();
  const list = document.getElementById("automationList");
  const render = () => {
    WusoolUI.html(list, automations.map(item => `
        <div class="admin-list-item">
            <span class="item-icon">
                <i class="bi bi-lightning-charge"></i>
            </span>

            <div class="flex-grow-1">
                <strong class="d-block">${WusoolUI.escape(item.name)}</strong>
                <small class="text-secondary d-block mt-1">
                    WHEN ${WusoolUI.escape(item.trigger)}
                </small>
                <small class="text-secondary">
                    THEN ${WusoolUI.escape(item.action)} ${WusoolUI.escape(item.message || item.actionValue || "")}
                </small>
            </div>

            <div class="d-flex flex-column gap-2">
                <button class="btn btn-sm btn-outline-warning" data-toggle="${WusoolUI.escape(item.id)}">
                    ${item.enabled ? "Disable" : "Enable"}
                </button>

                <button class="btn btn-sm btn-outline-danger" data-delete="${WusoolUI.escape(item.id)}">
                    Delete
                </button>
            </div>
        </div>
    `).join(""));
  };
  WusoolUI.listen(document.getElementById("addAutomationButton"), "click", async () => {
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
    await WusoolBehaviorService.saveAutomations(automations);
    render();
  });
  WusoolUI.listen(list, "click", async event => {
    const toggle = event.target.closest("[data-toggle]");
    const remove = event.target.closest("[data-delete]");
    if (toggle) {
      const item = automations.find(x => x.id === toggle.dataset.toggle);
      if (item) {
        item.enabled = !item.enabled;
        await WusoolBehaviorService.saveAutomations(automations);
        render();
      }
    }
    if (remove) {
      automations = automations.filter(x => x.id !== remove.dataset.delete);
      await WusoolBehaviorService.saveAutomations(automations);
      render();
    }
  });
  WusoolUI.listen(document.getElementById("testAutomation"), "click", async () => {
    const result = await WusoolBehaviorService.triggerAutomation("ticket.created", {
      entityType: "Ticket",
      entity: (await WusoolDataService.getTickets())[0] || null
    });
    WusoolAdmin.toast(result.performed ? `${result.performed} frontend action(s) completed. This is not a server background job.` : "No matching supported action occurred. No server job ran.");
  });
  render();
});
