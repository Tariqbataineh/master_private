'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const KEY = 'wusoolAnnouncements';
  const read = async () => {
    try {
      return JSON.parse((await WusoolServices.rawRead(KEY)) || '[]');
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      return [];
    }
  };
  let announcements = await read();
  const list = document.getElementById('announcementsList');
  const render = () => {
    WusoolUI.html(
      list,
      announcements.length
        ? announcements
            .map(
              (item) => `
            <div class="admin-list-item">
                <span class="item-icon">
                    <i class="bi bi-megaphone"></i>
                </span>

                <div class="flex-grow-1">
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        <strong>${WusoolUI.escape(item.title)}</strong>

                        <span class="badge text-bg-light border">
                            ${WusoolUI.escape(item.audience)}
                        </span>

                        <span class="badge ${item.enabled !== false ? 'badge-soft-success' : 'badge-soft-danger'}">
                            ${item.enabled !== false ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    <p class="text-secondary mb-1 mt-2">
                        ${WusoolUI.escape(item.message)}
                    </p>

                    <small class="text-secondary">
                        ${WusoolUI.escape(item.start || 'Now')} → ${WusoolUI.escape(item.end || 'No end date')}
                    </small>
                </div>

                <div class="d-flex flex-column gap-2">
                    <button class="btn btn-sm btn-outline-warning" data-toggle="${WusoolUI.escape(item.id)}">
                        ${item.enabled !== false ? 'Disable' : 'Enable'}
                    </button>

                    <button class="btn btn-sm btn-outline-danger" data-delete="${WusoolUI.escape(item.id)}">
                        Delete
                    </button>
                </div>
            </div>
        `,
            )
            .join('')
        : `
            <div class="text-center py-5 text-secondary">
                No announcements yet.
            </div>
        `,
    );
  };
  WusoolUI.listen(document.getElementById('publishAnnouncement'), 'click', async () => {
    const title = document.getElementById('announcementTitle').value.trim();
    const message = document.getElementById('announcementMessage').value.trim();
    if (!title || !message) {
      WusoolAdmin.toast('Enter title and message.', 'warning');
      return;
    }
    await WusoolVersionService.createVersion({
      area: 'Announcements',
      description: 'Announcement list changed',
    });
    announcements.unshift({
      id: `announcement-${Date.now()}`,
      title,
      message,
      audience: document.getElementById('announcementAudience').value,
      start: document.getElementById('announcementStart').value,
      end: document.getElementById('announcementEnd').value,
      enabled: true,
      createdAt: new Date().toISOString(),
    });
    await WusoolServices.rawWrite(KEY, JSON.stringify(announcements));
    document.getElementById('announcementTitle').value = '';
    document.getElementById('announcementMessage').value = '';
    render();
    WusoolAdmin.toast('Announcement published.');
  });
  WusoolUI.listen(list, 'click', async (event) => {
    const toggle = event.target.closest('[data-toggle]');
    const remove = event.target.closest('[data-delete]');
    if (toggle) {
      const item = announcements.find((x) => x.id === toggle.dataset.toggle);
      if (item) {
        item.enabled = item.enabled === false;
        await WusoolServices.rawWrite(KEY, JSON.stringify(announcements));
        render();
      }
    }
    if (remove) {
      announcements = announcements.filter((x) => x.id !== remove.dataset.delete);
      await WusoolServices.rawWrite(KEY, JSON.stringify(announcements));
      render();
    }
  });
  render();
});
