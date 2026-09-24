
"use strict";

const KEY = "featureRollouts";
let items = WusoolFeatureStore.read(KEY, []);
const percent = document.getElementById("rolloutPercent");
const label = document.getElementById("rolloutPercentLabel");
const list = document.getElementById("rolloutList");

percent.addEventListener("input", () => {
    label.textContent = percent.value;
});

const persist = () => WusoolFeatureStore.write(KEY, items);

const render = () => {
    list.innerHTML = items.length
        ? items.map((item) => `
            <div class="admin-feature-row">
                <span class="item-icon"><i class="bi bi-percent"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${item.feature}</strong>
                    <small class="text-secondary">${item.audience}</small>

                    <div class="progress mt-2" style="height: 8px;">
                        <div class="progress-bar" style="width:${item.percentage}%"></div>
                    </div>
                </div>

                <strong>${item.percentage}%</strong>

                <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">
                    Delete
                </button>
            </div>
        `).join("")
        : `<p class="text-secondary mb-0">No rollouts configured.</p>`;
};

document.getElementById("addRollout").addEventListener("click", () => {
    const feature = document.getElementById("rolloutFeature").value.trim();

    if (!feature) {
        WusoolAdmin.toast("Enter a feature name.", "warning");
        return;
    }

    items.unshift({
        id: WusoolFeatureStore.id("rollout"),
        feature,
        audience: document.getElementById("rolloutAudience").value,
        percentage: Number(percent.value)
    });

    persist();
    render();
});

list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete]");

    if (button) {
        items = items.filter((x) => x.id !== button.dataset.delete);
        persist();
        render();
    }
});

render();
