'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const branches = await WusoolDataService.getBranches();
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
        items.reduce((sum, x) => sum + Number(x.accessibilityScore || 0), 0) / items.length,
      ),
    }))
    .sort((a, b) => b.score - a.score);
  WusoolUI.html(
    document.getElementById('cityStats'),
    [
      ['Cities', cityData.length, 'bi-map'],
      ['Branches', branches.length, 'bi-geo-alt'],
      ['Highest Avg', cityData[0]?.score ? `${cityData[0].score}%` : '0%', 'bi-graph-up'],
      [
        'Lowest Avg',
        cityData.length ? `${cityData[cityData.length - 1].score}%` : '0%',
        'bi-graph-down',
      ],
    ]
      .map(
        ([label, value, icon]) => `
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
`,
      )
      .join(''),
  );
  WusoolUI.html(
    document.getElementById('heatmapGrid'),
    cityData.length
      ? cityData
          .map(
            (item) => `
        <div class="col-12 col-md-6 col-xl-4">
            <article class="builder-card">
                <h3 class="h5 fw-bold">${WusoolUI.escape(item.city)}</h3>
                <div class="metric-number">${WusoolUI.escape(item.score)}%</div>
                <p class="text-secondary">${WusoolUI.escape(item.branches)} branches</p>
                <div class="progress">
                    <div class="progress-bar" style="width:${WusoolUI.escape(item.score)}%"></div>
                </div>
            </article>
        </div>
    `,
          )
          .join('')
      : `<div class="col-12"><p class="text-secondary">No branch data available.</p></div>`,
  );
});
