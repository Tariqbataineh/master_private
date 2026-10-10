'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const KEY = 'featureRollouts';
  let items = await WusoolFeatureStore.read(KEY, []);
  const percent = document.getElementById('rolloutPercent');
  const label = document.getElementById('rolloutPercentLabel');
  const list = document.getElementById('rolloutList');
  WusoolUI.listen(percent, 'input', () => {
    label.textContent = percent.value;
  });
  const persist = async () => await WusoolFeatureStore.write(KEY, items);
  const render = () => {
    WusoolUI.html(
      list,
      items.length
        ? items
            .map(
              (item) => `
            <div class="admin-feature-row">
                <span class="item-icon"><i class="bi bi-percent"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${WusoolUI.escape(item.feature)}</strong>
                    <small class="text-secondary">${WusoolUI.escape(item.audience)}</small>

                    <div class="progress mt-2" style="height: 8px;">
                        <div class="progress-bar" style="width:${WusoolUI.escape(item.percentage)}%"></div>
                    </div>
                </div>

                <strong>${WusoolUI.escape(item.percentage)}%</strong>

                <button class="btn btn-sm btn-outline-danger" data-delete="${WusoolUI.escape(item.id)}">
                    Delete
                </button>
            </div>
        `,
            )
            .join('')
        : `<p class="text-secondary mb-0">No rollouts configured.</p>`,
    );
  };
  WusoolUI.listen(document.getElementById('addRollout'), 'click', async () => {
    const feature = document.getElementById('rolloutFeature').value.trim();
    if (!feature) {
      WusoolAdmin.toast('Enter a feature name.', 'warning');
      return;
    }
    items.unshift({
      id: await WusoolFeatureStore.id('rollout'),
      feature,
      audience: document.getElementById('rolloutAudience').value,
      percentage: Number(percent.value),
    });
    await persist();
    render();
  });
  WusoolUI.listen(list, 'click', async (event) => {
    const button = event.target.closest('[data-delete]');
    if (button) {
      items = items.filter((x) => x.id !== button.dataset.delete);
      await persist();
      render();
    }
  });
  render();
});
