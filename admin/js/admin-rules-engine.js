'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  let rules = await WusoolBehaviorService.getRules();
  const list = document.getElementById('rulesList');
  const render = () => {
    WusoolUI.html(
      list,
      rules
        .map(
          (rule) => `
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
                    THEN ${rule.action} → ${rule.actionValue || '-'}
                </small>
            </div>

            <div class="d-flex flex-column gap-2">
                <button class="btn btn-sm btn-outline-warning" data-toggle="${rule.id}">
                    ${rule.enabled ? 'Disable' : 'Enable'}
                </button>

                <button class="btn btn-sm btn-outline-danger" data-delete="${rule.id}">
                    Delete
                </button>
            </div>
        </div>
    `,
        )
        .join(''),
    );
  };
  WusoolUI.listen(document.getElementById('addRuleButton'), 'click', async () => {
    rules.push({
      id: `rule-${Date.now()}`,
      name: document.getElementById('ruleName').value.trim() || 'Rule',
      enabled: true,
      entity: document.getElementById('ruleEntity').value,
      field: document.getElementById('ruleField').value,
      operator: document.getElementById('ruleOperator').value,
      value: document.getElementById('ruleValue').value.trim(),
      action: document.getElementById('ruleAction').value,
      actionValue: document.getElementById('ruleActionValue').value.trim(),
    });
    await WusoolBehaviorService.saveRules(rules);
    render();
  });
  WusoolUI.listen(list, 'click', async (event) => {
    const toggle = event.target.closest('[data-toggle]');
    const remove = event.target.closest('[data-delete]');
    if (toggle) {
      const rule = rules.find((x) => x.id === toggle.dataset.toggle);
      if (rule) {
        rule.enabled = !rule.enabled;
        await WusoolBehaviorService.saveRules(rules);
        render();
      }
    }
    if (remove) {
      rules = rules.filter((x) => x.id !== remove.dataset.delete);
      await WusoolBehaviorService.saveRules(rules);
      render();
    }
  });
  WusoolUI.listen(document.getElementById('runRulesButton'), 'click', async () => {
    await WusoolUI.each(
      await WusoolDataService.getBranches(),
      async (item) => await WusoolBehaviorService.evaluateEntity('Branch', item),
    );
    await WusoolUI.each(
      await WusoolDataService.getOrganizations(),
      async (item) => await WusoolBehaviorService.evaluateEntity('Organization', item),
    );
    await WusoolUI.each(
      await WusoolDataService.getTickets(),
      async (item) => await WusoolBehaviorService.evaluateEntity('Ticket', item),
    );
    WusoolAdmin.toast('Rules executed against current platform data.');
  });
  render();
});
