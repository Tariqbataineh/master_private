'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const KEY = 'documents';
  let documents = await WusoolFeatureStore.read(KEY, []);
  const orgSelect = document.getElementById('documentOrganization');
  const list = document.getElementById('documentsList');
  const search = document.getElementById('documentSearch');
  const loadOrganizations = async () => {
    WusoolUI.html(
      orgSelect,
      (await WusoolDataService.getOrganizations())
        .map(
          (item) =>
            `<option value="${WusoolUI.escape(item.id)}">${WusoolUI.escape(item.name)}</option>`,
        )
        .join(''),
    );
  };
  const persist = async () => await WusoolFeatureStore.write(KEY, documents);
  const render = async () => {
    const q = search.value.trim().toLowerCase();
    const filtered = await WusoolUI.filterAsync(documents, async (item) => {
      const org = await WusoolDataService.getOrganizationById(item.organizationId);
      return [item.name, item.type, item.status, org?.name || '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
    WusoolUI.html(
      list,
      filtered.length
        ? (
            await WusoolUI.mapAsync(filtered, async (item) => {
              const org = await WusoolDataService.getOrganizationById(item.organizationId);
              return `
                <div class="admin-feature-row">
                    <span class="item-icon"><i class="bi bi-file-earmark-text"></i></span>

                    <div class="flex-grow-1">
                        <strong class="d-block">${WusoolUI.escape(item.name)}</strong>
                        <small class="text-secondary">
                            ${WusoolUI.escape(item.type)} · ${WusoolUI.escape(org?.name || 'Unknown organization')}
                            ${item.expiry ? ` · Expires ${WusoolUI.escape(item.expiry)}` : ''}
                        </small>
                    </div>

                    <span class="badge ${item.status === 'Approved' ? 'badge-soft-success' : item.status === 'Rejected' ? 'badge-soft-danger' : 'badge-soft-warning'}">
                        ${WusoolUI.escape(item.status)}
                    </span>

                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-success" data-status="${WusoolUI.escape(item.id)}" data-value="Approved">Approve</button>
                        <button class="btn btn-sm btn-outline-warning" data-status="${WusoolUI.escape(item.id)}" data-value="Pending">Pending</button>
                        <button class="btn btn-sm btn-outline-danger" data-delete="${WusoolUI.escape(item.id)}">Delete</button>
                    </div>
                </div>
            `;
            })
          ).join('')
        : `<p class="text-secondary mb-0">No documents found.</p>`,
    );
  };
  WusoolUI.listen(document.getElementById('addDocument'), 'click', async () => {
    const name = document.getElementById('documentName').value.trim();
    if (!name) {
      WusoolAdmin.toast('Enter a file name.', 'warning');
      return;
    }
    documents.unshift({
      id: await WusoolFeatureStore.id('document'),
      organizationId: orgSelect.value,
      type: document.getElementById('documentType').value,
      name,
      expiry: document.getElementById('documentExpiry').value,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    });
    await persist();
    await render();
  });
  WusoolUI.listen(list, 'click', async (event) => {
    const status = event.target.closest('[data-status]');
    const remove = event.target.closest('[data-delete]');
    if (status) {
      const item = documents.find((x) => x.id === status.dataset.status);
      if (item) {
        item.status = status.dataset.value;
        await persist();
        await render();
      }
    }
    if (remove) {
      documents = documents.filter((x) => x.id !== remove.dataset.delete);
      await persist();
      await render();
    }
  });
  WusoolUI.listen(search, 'input', render);
  await loadOrganizations();
  window.WusoolLive?.watch('admin-documents', async () => {
    documents = await WusoolFeatureStore.read(KEY, []);
    await render();
  });
  await render();
});
