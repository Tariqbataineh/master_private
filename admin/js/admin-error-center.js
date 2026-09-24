
"use strict";

const list = document.getElementById("errorsList");

const render = () => {
    const errors = WusoolErrorRuntime.read();

    list.innerHTML = errors.length
        ? errors.map((item) => `
            <div class="admin-feature-row">
                <span class="item-icon text-danger"><i class="bi bi-bug"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${item.type}: ${item.message}</strong>
                    <small class="text-secondary">
                        ${item.source || ""} ${item.line ? `· line ${item.line}` : ""}
                    </small>
                </div>

                <small class="text-secondary">
                    ${new Date(item.createdAt).toLocaleString()}
                </small>
            </div>
        `).join("")
        : `<div class="alert alert-success mb-0">No captured runtime errors.</div>`;
};

document.getElementById("clearErrors").addEventListener("click", () => {
    localStorage.removeItem(WusoolErrorRuntime.KEY);
    render();
});

render();
