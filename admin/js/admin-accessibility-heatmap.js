
"use strict";

const branches = WusoolDataService.getBranches();
const grouped = {};

branches.forEach((branch) => {
    grouped[branch.city] = grouped[branch.city] || [];
    grouped[branch.city].push(branch);
});

const cityData = Object.entries(grouped)
    .map(([city, items]) => ({
        city,
        branches: items.length,
        score: Math.round(
            items.reduce((sum, x) => sum + Number(x.accessibilityScore || 0), 0) /
            items.length
        )
    }))
    .sort((a, b) => b.score - a.score);

document.getElementById("cityStats").innerHTML = [
    ["Cities", cityData.length, "bi-map"],
    ["Branches", branches.length, "bi-geo-alt"],
    ["Highest Avg", cityData[0]?.score ? `${cityData[0].score}%` : "0%", "bi-graph-up"],
    ["Lowest Avg", cityData.length ? `${cityData[cityData.length - 1].score}%` : "0%", "bi-graph-down"]
].map(([label, value, icon]) => `
    <div class="col-12 col-sm-6 col-xl-3">
        <article class="stat-card">
            <div class="d-flex justify-content-between">
                <div>
                    <p class="text-secondary mb-2">${label}</p>
                    <div class="metric-number">${value}</div>
                </div>
                <span class="stat-icon"><i class="bi ${icon}"></i></span>
            </div>
        </article>
    </div>
`).join("");

document.getElementById("heatmapGrid").innerHTML = cityData.length
    ? cityData.map((item) => `
        <div class="col-12 col-md-6 col-xl-4">
            <article class="builder-card">
                <h3 class="h5 fw-bold">${item.city}</h3>
                <div class="metric-number">${item.score}%</div>
                <p class="text-secondary">${item.branches} branches</p>
                <div class="progress">
                    <div class="progress-bar" style="width:${item.score}%"></div>
                </div>
            </article>
        </div>
    `).join("")
    : `<div class="col-12"><p class="text-secondary">No branch data available.</p></div>`;
