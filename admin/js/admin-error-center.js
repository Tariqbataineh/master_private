"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const list = document.getElementById("errorsList");
  const render = () => {
    const errors = WusoolErrorRuntime.read();
    WusoolUI.html(list, errors.length ? errors.map(item => `
            <div class="admin-feature-row">
                <span class="item-icon text-danger"><i class="bi bi-bug"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${WusoolUI.escape(item.type)}: ${WusoolUI.escape(item.message)}</strong>
                    <small class="text-secondary">
                        ${WusoolUI.escape(item.source || "")} ${item.line ? `· line ${WusoolUI.escape(item.line)}` : ""}
                    </small>
                </div>

                <small class="text-secondary">
                    ${new Date(item.createdAt).toLocaleString()}
                </small>
            </div>
        `).join("") : `<div class="alert alert-success mb-0">No captured runtime errors.</div>`);
  };
  WusoolUI.listen(document.getElementById("clearErrors"), "click", async () => {
    await WusoolServices.rawRemove(WusoolErrorRuntime.KEY);
    render();
  });
  render();
});
