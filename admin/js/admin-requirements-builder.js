"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const KEY = "wusoolAccessibilityRequirements";
  let requirements = structuredClone(await WusoolAccessibilityConfig.getRequirements());
  const requirementsList = document.getElementById("requirementsList");
  const persist = async () => {
    await WusoolServices.rawWrite(KEY, JSON.stringify(requirements));
  };
  const render = () => {
    WusoolUI.html(requirementsList, requirements.length ? requirements.map((item, index) => `
                        <div class="requirement-item">

                            <span class="builder-icon">
                                <i class="bi ${WusoolUI.escape(item.icon || "bi-universal-access")}"></i>
                            </span>

                            <div>
                                <div class="d-flex flex-wrap gap-2 align-items-center">
                                    <strong>
                                        ${WusoolUI.escape(item.title)}
                                    </strong>

                                    <span class="requirement-weight">
                                        W${WusoolUI.escape(item.weight)}
                                    </span>

                                    <span class="badge text-bg-light border">
                                        ${WusoolUI.escape(item.category)}
                                    </span>

                                    ${item.required ? `
                                                <span class="badge badge-soft-warning">
                                                    Required
                                                </span>
                                            ` : ""}

                                    ${item.enabled === false ? `
                                                <span class="badge badge-soft-danger">
                                                    Hidden
                                                </span>
                                            ` : ""}
                                </div>

                                <p class="text-secondary mb-0 mt-2">
                                    ${WusoolUI.escape(item.description)}
                                </p>
                            </div>

                            <div class="d-flex flex-column gap-2">

                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    data-up="${WusoolUI.escape(item.id)}"
                                >
                                    <i class="bi bi-arrow-up"></i>
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    data-down="${WusoolUI.escape(item.id)}"
                                >
                                    <i class="bi bi-arrow-down"></i>
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-warning"
                                    data-toggle="${WusoolUI.escape(item.id)}"
                                >
                                    ${item.enabled === false ? "Show" : "Hide"}
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    data-delete="${WusoolUI.escape(item.id)}"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>

                            </div>

                        </div>
                    `).join("") : `
                <div class="text-center py-5 text-secondary">
                    No accessibility requirements.
                </div>
            `);
  };
  WusoolUI.listen(document.getElementById("addRequirement"), "click", () => {
    const title = document.getElementById("requirementTitle").value.trim();
    if (!title) {
      WusoolAdmin.toast("Enter a requirement name.", "warning");
      return;
    }
    const id = `requirement-${Date.now()}`;
    requirements.push({
      id,
      key: id,
      title,
      description: document.getElementById("requirementDescription").value.trim(),
      category: document.getElementById("requirementCategory").value,
      weight: Number(document.getElementById("requirementWeight").value),
      icon: document.getElementById("requirementIcon").value.trim() || "bi-universal-access",
      required: document.getElementById("requirementRequired").checked,
      enabled: true
    });
    document.getElementById("requirementTitle").value = "";
    document.getElementById("requirementDescription").value = "";
    render();
  });
  WusoolUI.listen(requirementsList, "click", event => {
    const up = event.target.closest("[data-up]");
    const down = event.target.closest("[data-down]");
    const toggle = event.target.closest("[data-toggle]");
    const remove = event.target.closest("[data-delete]");
    const move = (id, delta) => {
      const index = requirements.findIndex(item => item.id === id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= requirements.length) {
        return;
      }
      const [item] = requirements.splice(index, 1);
      requirements.splice(target, 0, item);
      render();
    };
    if (up) {
      move(up.dataset.up, -1);
    }
    if (down) {
      move(down.dataset.down, 1);
    }
    if (toggle) {
      const item = requirements.find(entry => entry.id === toggle.dataset.toggle);
      if (item) {
        item.enabled = item.enabled === false;
        render();
      }
    }
    if (remove) {
      requirements = requirements.filter(item => item.id !== remove.dataset.delete);
      render();
    }
  });
  WusoolUI.listen(document.getElementById("publishRequirements"), "click", async () => {
    await WusoolVersionService.createVersion({
      area: "Accessibility Checklist",
      description: "Published accessibility requirement changes"
    });
    await persist();
    WusoolAdmin.toast("Checklist published. Organization accessibility pages now use it.");
  });
  WusoolUI.listen(document.getElementById("resetRequirements"), "click", () => {
    if (!WusoolAdmin.confirm("Restore the default accessibility checklist?")) {
      return;
    }
    requirements = structuredClone(WusoolAccessibilityConfig.defaults);
    render();
  });
  render();
});
