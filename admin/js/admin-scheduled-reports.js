"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.message('Schedules are saved configuration only. Report execution and delivery require a backend scheduler.', 'info');
  const KEY = "scheduledReports";
  let items = await WusoolFeatureStore.read(KEY, []);
  const list = document.getElementById("schedulesList");
  const persist = async () => await WusoolFeatureStore.write(KEY, items);
  const render = () => {
    WusoolUI.html(list, items.length ? items.map(item => `
            <div class="admin-feature-row">
                <span class="item-icon"><i class="bi bi-calendar2-check"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${WusoolUI.escape(item.report)}</strong>
                    <small class="text-secondary">
                        ${WusoolUI.escape(item.frequency)} · ${WusoolUI.escape(item.recipient)}
                    </small>
                </div>

                <button class="btn btn-sm btn-outline-danger" data-delete="${WusoolUI.escape(item.id)}">
                    Delete
                </button>
            </div>
        `).join("") : `<p class="text-secondary mb-0">No scheduled reports.</p>`);
  };
  WusoolUI.listen(document.getElementById("addSchedule"), "click", async () => {
    const recipient = document.getElementById("scheduleRecipient").value.trim();
    if (!recipient) {
      WusoolAdmin.toast("Enter recipient email.", "warning");
      return;
    }
    items.unshift({
      id: await WusoolFeatureStore.id("schedule"),
      report: document.getElementById("scheduleReport").value,
      frequency: document.getElementById("scheduleFrequency").value,
      recipient
    });
    await persist();
    render();
  });
  WusoolUI.listen(list, "click", async event => {
    const button = event.target.closest("[data-delete]");
    if (button) {
      items = items.filter(x => x.id !== button.dataset.delete);
      await persist();
      render();
    }
  });
  render();
});
