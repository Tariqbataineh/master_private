'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const KEY = 'components';
  let items = await WusoolFeatureStore.read(KEY, []);
  const list = document.getElementById('componentsList');
  const persist = async () => await WusoolFeatureStore.write(KEY, items);
  const render = () => {
    WusoolUI.html(
      list,
      items.length
        ? items
            .map(
              (item) => `
            <div class="admin-feature-row">
                <span class="item-icon"><i class="bi bi-boxes"></i></span>

                <div class="flex-grow-1">
                    <strong class="d-block">${WusoolUI.escape(item.name)}</strong>
                    <small class="text-secondary">${WusoolUI.escape(item.type)}</small>
                    <p class="mb-0 mt-2">${WusoolUI.escape(item.content)}</p>
                </div>

                <button class="btn btn-sm btn-outline-danger" data-delete="${WusoolUI.escape(item.id)}">
                    Delete
                </button>
            </div>
        `,
            )
            .join('')
        : `<p class="text-secondary mb-0">No reusable components yet.</p>`,
    );
  };
  WusoolUI.listen(document.getElementById('addComponent'), 'click', async () => {
    const name = document.getElementById('componentName').value.trim();
    if (!name) {
      WusoolAdmin.toast('Enter component name.', 'warning');
      return;
    }
    items.unshift({
      id: await WusoolFeatureStore.id('component'),
      name,
      type: document.getElementById('componentType').value,
      content: document.getElementById('componentContent').value.trim(),
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
