"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const KEY = "wusoolMaintenanceSettings";
  let settings = {
    user: {
      enabled: false,
      message: "User Portal maintenance in progress."
    },
    organization: {
      enabled: false,
      message: "Organization Portal maintenance in progress."
    },
    visitor: {
      enabled: false,
      message: "Public website maintenance in progress."
    }
  };
  try {
    settings = {
      ...settings,
      ...JSON.parse((await WusoolServices.rawRead(KEY)) || "{}")
    };
  } catch (error) {
    if (WusoolServices.mode === "api") throw error;
  }
  const grid = document.getElementById("maintenanceGrid");
  const render = () => {
    WusoolUI.html(grid, Object.entries(settings).map(([portal, value]) => `
            <div class="col-12 col-md-4">
                <article class="builder-card">
                    <span class="builder-icon">
                        <i class="bi bi-cone-striped"></i>
                    </span>

                    <h3 class="h5 fw-bold mt-4 text-capitalize">${portal} Portal</h3>

                    <textarea
                        class="form-control mb-3"
                        rows="3"
                        data-message="${portal}"
                    >${value.message}</textarea>

                    <div class="form-check form-switch">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            data-maintenance="${portal}"
                            ${value.enabled ? "checked" : ""}
                        >
                        <label class="form-check-label">
                            Maintenance enabled
                        </label>
                    </div>
                </article>
            </div>
        `).join(""));
  };
  WusoolUI.listen(grid, "input", async event => {
    const portal = event.target.dataset.message;
    if (portal) {
      settings[portal].message = event.target.value;
      await WusoolServices.rawWrite(KEY, JSON.stringify(settings));
    }
  });
  WusoolUI.listen(grid, "change", async event => {
    const portal = event.target.dataset.maintenance;
    if (portal) {
      settings[portal].enabled = event.target.checked;
      await WusoolServices.rawWrite(KEY, JSON.stringify(settings));
      WusoolAdmin.toast(`${portal} maintenance updated.`);
    }
  });
  render();
});
