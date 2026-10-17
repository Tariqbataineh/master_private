'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const recommendations = [];
  const pendingBranches = (await WusoolDataService.getBranches()).filter((x) =>
    ['pending', 'needs review'].includes(x.status.toLowerCase()),
  );
  const lowScores = (await WusoolDataService.getBranches()).filter(
    (x) => Number(x.accessibilityScore) < 60,
  );
  const openHighTickets = (await WusoolDataService.getTickets()).filter(
    (x) => x.priority === 'High' && !['Resolved', 'Closed'].includes(x.status),
  );
  const pendingOrganizations = await WusoolDataService.getOrganizations({
    status: 'pending',
  });
  if (pendingBranches.length) {
    recommendations.push({
      icon: 'bi-building-check',
      title: `${pendingBranches.length} branches need review`,
      text: 'Open Branches and review pending submissions.',
      href: './admin-branches.html',
    });
  }
  if (lowScores.length) {
    recommendations.push({
      icon: 'bi-universal-access',
      title: `${lowScores.length} branches have score below 60%`,
      text: 'Review accessibility data and improvement actions.',
      href: './admin-ai-management.html',
    });
  }
  if (openHighTickets.length) {
    recommendations.push({
      icon: 'bi-exclamation-triangle',
      title: `${openHighTickets.length} high-priority tickets are open`,
      text: 'Assign or resolve support issues.',
      href: './admin-tickets.html',
    });
  }
  if (pendingOrganizations.length) {
    recommendations.push({
      icon: 'bi-buildings',
      title: `${pendingOrganizations.length} organizations await approval`,
      text: 'Review organization registration information.',
      href: './admin-organizations.html',
    });
  }
  WusoolUI.html(
    document.getElementById('recommendationsList'),
    recommendations.length
      ? recommendations
          .map(
            (item) => `
        <a href="${WusoolUI.escape(item.href)}" class="admin-feature-row text-reset text-decoration-none">
            <span class="item-icon"><i class="bi ${WusoolUI.escape(item.icon)}"></i></span>
            <div>
                <strong class="d-block">${WusoolUI.escape(item.title)}</strong>
                <small class="text-secondary">${WusoolUI.escape(item.text)}</small>
            </div>
        </a>
    `,
          )
          .join('')
      : `<div class="alert alert-success mb-0">No urgent recommended actions right now.</div>`,
  );
});
