
"use strict";

let rules = WusoolBehaviorService.getRules();
const list = document.getElementById("rulesList");

const render = () => {
    list.innerHTML = rules.map((rule) => `
        <div class="admin-list-item">
            <span class="item-icon">
                <i class="bi bi-diagram-3"></i>
            </span>

            <div class="flex-grow-1">
                <strong class="d-block">${rule.name}</strong>

                <small class="text-secondary d-block mt-1">
                    IF ${rule.entity}.${rule.field}
                    ${rule.operator}
                    ${rule.value}
                </small>

                <small class="text-secondary">
                    THEN ${rule.action} → ${rule.actionValue || "-"}
                </small>
            </div>

            <div class="d-flex flex-column gap-2">
                <button class="btn btn-sm btn-outline-warning" data-toggle="${rule.id}">
                    ${rule.enabled ? "Disable" : "Enable"}
                </button>

                <button class="btn btn-sm btn-outline-danger" data-delete="${rule.id}">
                    Delete
                </button>
            </div>
        </div>
    `).join("");
};

document.getElementById("addRuleButton").addEventListener("click", () => {
    rules.push({
        id: `rule-${Date.now()}`,
        name: document.getElementById("ruleName").value.trim() || "Rule",
        enabled: true,
        entity: document.getElementById("ruleEntity").value,
        field: document.getElementById("ruleField").value,
        operator: document.getElementById("ruleOperator").value,
        value: document.getElementById("ruleValue").value.trim(),
        action: document.getElementById("ruleAction").value,
        actionValue: document.getElementById("ruleActionValue").value.trim()
    });

    WusoolBehaviorService.saveRules(rules);
    render();
});

list.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle]");
    const remove = event.target.closest("[data-delete]");

    if (toggle) {
        const rule = rules.find((x) => x.id === toggle.dataset.toggle);

        if (rule) {
            rule.enabled = !rule.enabled;
            WusoolBehaviorService.saveRules(rules);
            render();
        }
    }

    if (remove) {
        rules = rules.filter((x) => x.id !== remove.dataset.delete);
        WusoolBehaviorService.saveRules(rules);
        render();
    }
});

document.getElementById("runRulesButton").addEventListener("click", () => {
    WusoolDataService.getBranches().forEach(
        (item) => WusoolBehaviorService.evaluateEntity("Branch", item)
    );

    WusoolDataService.getOrganizations().forEach(
        (item) => WusoolBehaviorService.evaluateEntity("Organization", item)
    );

    WusoolDataService.getTickets().forEach(
        (item) => WusoolBehaviorService.evaluateEntity("Ticket", item)
    );

    WusoolAdmin.toast("Rules executed against current platform data.");
});

render();
