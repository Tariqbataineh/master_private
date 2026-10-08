"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  let workflows = await WusoolBehaviorService.getWorkflows();
  const select = document.getElementById("workflowSelect");
  const list = document.getElementById("workflowStages");
  const title = document.getElementById("workflowTitle");
  const renderSelect = () => {
    WusoolUI.html(select, Object.values(workflows).map(workflow => `
            <option value="${workflow.id}">
                ${workflow.name}
            </option>
        `).join(""));
    renderStages();
  };
  const getCurrent = () => workflows[select.value];
  const renderStages = () => {
    const workflow = getCurrent();
    if (!workflow) {
      return;
    }
    title.textContent = workflow.name;
    WusoolUI.html(list, workflow.stages.map((stage, index) => `
            <div class="admin-list-item">
                <span class="builder-icon">
                    ${index + 1}
                </span>

                <div class="flex-grow-1">
                    <input
                        class="form-control"
                        data-stage-index="${index}"
                        value="${stage}"
                    >
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-secondary" data-up="${index}">
                        <i class="bi bi-arrow-up"></i>
                    </button>

                    <button class="btn btn-sm btn-outline-secondary" data-down="${index}">
                        <i class="bi bi-arrow-down"></i>
                    </button>

                    <button class="btn btn-sm btn-outline-danger" data-delete="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join(""));
  };
  WusoolUI.listen(select, "change", renderStages);
  WusoolUI.listen(list, "input", event => {
    const index = event.target.dataset.stageIndex;
    if (index === undefined) {
      return;
    }
    getCurrent().stages[Number(index)] = event.target.value;
  });
  WusoolUI.listen(list, "click", event => {
    const up = event.target.closest("[data-up]");
    const down = event.target.closest("[data-down]");
    const remove = event.target.closest("[data-delete]");
    const stages = getCurrent().stages;
    const move = (index, delta) => {
      const target = index + delta;
      if (target < 0 || target >= stages.length) {
        return;
      }
      [stages[index], stages[target]] = [stages[target], stages[index]];
      renderStages();
    };
    if (up) {
      move(Number(up.dataset.up), -1);
    }
    if (down) {
      move(Number(down.dataset.down), 1);
    }
    if (remove) {
      stages.splice(Number(remove.dataset.delete), 1);
      renderStages();
    }
  });
  WusoolUI.listen(document.getElementById("addWorkflowStage"), "click", () => {
    const value = document.getElementById("workflowStageName").value.trim();
    if (!value) {
      WusoolAdmin.toast("Enter a stage name.", "warning");
      return;
    }
    getCurrent().stages.push(value);
    document.getElementById("workflowStageName").value = "";
    renderStages();
  });
  WusoolUI.listen(document.getElementById("saveWorkflow"), "click", async () => {
    await WusoolVersionService.createVersion({
      area: "Workflow Builder",
      description: `Updated ${getCurrent().name}`
    });
    await WusoolBehaviorService.saveWorkflows(workflows);
    WusoolAdmin.toast("Workflow saved.");
  });
  renderSelect();
});
