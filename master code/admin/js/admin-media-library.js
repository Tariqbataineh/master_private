'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const STORAGE_KEY = 'wusoolMediaLibrary';
  const readMedia = async () => {
    try {
      const saved = JSON.parse((await WusoolServices.rawRead(STORAGE_KEY)) || '[]');
      if (Array.isArray(saved)) {
        return saved;
      }
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
    } // Fall through to defaults.
    return [];
  };
  let mediaItems = await readMedia();
  const mediaGrid = document.getElementById('mediaGrid');
  const mediaSearch = document.getElementById('mediaSearch');
  const mediaUpload = document.getElementById('mediaUpload');
  const persist = async () => {
    /*
        Frontend demo only.
        Backend later replaces Data URLs with real file storage.
    */
    await WusoolServices.rawWrite(STORAGE_KEY, JSON.stringify(mediaItems));
  };
  const renderMedia = () => {
    const query = mediaSearch.value.trim().toLowerCase();
    const filtered = mediaItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.usedIn || '').toLowerCase().includes(query),
    );
    WusoolUI.html(
      mediaGrid,
      filtered
        .map(
          (item) => `
                    <div class="col-12 col-sm-6 col-xl-3">
                        <article class="media-card">
                            <div class="media-preview">
                                ${item.src ? `<img src="${WusoolUI.escape(item.src)}" alt="${WusoolUI.escape(item.name)}" class="w-100 h-100 object-fit-cover">` : `<i class="bi bi-image"></i>`}
                            </div>

                            <div class="media-card-body">
                                <strong class="d-block text-truncate">
                                    ${WusoolUI.escape(item.name)}
                                </strong>

                                <small class="text-secondary d-block">
                                    ${WusoolUI.escape(item.type)} · ${WusoolUI.escape(item.usedIn || '')} · ${WusoolUI.escape(item.status || 'metadata-only')}
                                </small>

                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger mt-3"
                                    data-delete-id="${WusoolUI.escape(item.id)}"
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    </div>
                `,
        )
        .join(''),
    );
  };
  WusoolUI.listen(mediaSearch, 'input', renderMedia);
  WusoolUI.listen(mediaUpload, 'change', async () => {
    for (const file of Array.from(mediaUpload.files)) {
      const upload = await WusoolServices.upload(file, { purpose: 'media-library' });
      const src = file.type.startsWith('image/')
        ? upload.url ||
          (await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('File preview failed.'));
            reader.readAsDataURL(file);
          }))
        : '';
      mediaItems.push({
        ...upload,
        id: upload.id || 'document-' + crypto.randomUUID(),
        name: file.name,
        type: file.type,
        usedIn: 'Admin media library',
        src,
        status: upload.status,
        uploaded: upload.uploaded,
      });
      await persist();
      renderMedia();
    }
    mediaUpload.value = '';
    WusoolUI.message(
      WusoolServices.mode === 'local'
        ? 'File previews saved locally. No server upload occurred.'
        : 'Uploads confirmed by the backend.',
      'info',
    );
  });
  WusoolUI.listen(mediaGrid, 'click', async (event) => {
    const button = event.target.closest('[data-delete-id]');
    if (!button) {
      return;
    }
    mediaItems = mediaItems.filter((item) => String(item.id) !== String(button.dataset.deleteId));
    await persist();
    renderMedia();
  });
  renderMedia();
});
