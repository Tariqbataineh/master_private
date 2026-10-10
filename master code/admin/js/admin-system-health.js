'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.message(
    'Local mode checks frontend capabilities only. API mode uses the backend health endpoint.',
    'info',
  );
  const backend =
    WusoolServices.mode === 'api' ? await WusoolServices.request('/admin/system-health') : null;
  if (backend && !Array.isArray(backend.components))
    throw new Error('Invalid backend health response.');
  const checks = backend
    ? backend.components.map((x) => ({
        name: x.name,
        icon: 'bi-hdd-network',
        healthy: x.status === 'healthy',
        detail: x.message || x.status,
      }))
    : [
        {
          name: 'Unified Data Layer',
          icon: 'bi-database',
          healthy: Boolean(window.WusoolDataService),
          detail: 'Frontend data service',
        },
        {
          name: 'Version Service',
          icon: 'bi-clock-history',
          healthy: Boolean(window.WusoolVersionService),
          detail: 'Drafts and rollback',
        },
        {
          name: 'Behavior Service',
          icon: 'bi-lightning-charge',
          healthy: Boolean(window.WusoolBehaviorService),
          detail: 'Rules and automation',
        },
        {
          name: 'Browser Storage',
          icon: 'bi-device-ssd',
          healthy: await (async () => {
            try {
              await WusoolServices.rawWrite('__wusool_test', '1');
              await WusoolServices.rawRemove('__wusool_test');
              return true;
            } catch (error) {
              if (WusoolServices.mode === 'api') throw error;
              return false;
            }
          })(),
          detail: 'Current frontend persistence',
        },
      ];
  WusoolUI.html(
    document.getElementById('healthGrid'),
    checks
      .map(
        (item) => `
    <div class="col-12 col-md-6 col-xl-3">
        <article class="stat-card">
            <span class="stat-icon"><i class="bi ${WusoolUI.escape(item.icon)}"></i></span>
            <h2 class="h5 fw-bold mt-4">${WusoolUI.escape(item.name)}</h2>
            <span class="badge ${item.healthy ? 'badge-soft-success' : 'badge-soft-danger'}">
                ${item.healthy ? 'Available' : 'Unavailable'}
            </span>
            <p class="text-secondary mt-3 mb-0">${WusoolUI.escape(item.detail)}</p>
        </article>
    </div>
`,
      )
      .join(''),
  );
});
