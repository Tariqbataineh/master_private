'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const list = document.getElementById('notificationList');
  const render = async () => {
    const items = await WusoolBehaviorService.getNotifications();
    WusoolUI.html(
      list,
      items.length
        ? items
            .map(
              (item) => `
            <div class="admin-list-item">
                <span class="item-icon">
                    <i class="bi bi-bell${item.read ? '' : '-fill'}"></i>
                </span>

                <div class="flex-grow-1">
                    <strong class="d-block">${WusoolUI.escape(item.title)}</strong>
                    <p class="text-secondary mb-1">${WusoolUI.escape(item.message)}</p>
                    <small class="text-secondary">
                        ${new Date(item.createdAt).toLocaleString()}
                    </small>
                </div>

                <span class="badge ${item.read ? 'text-bg-light border' : 'badge-soft-info'}">
                    ${item.read ? 'Read' : 'New'}
                </span>
            </div>
        `,
            )
            .join('')
        : `<p class="text-secondary mb-0">No notifications yet.</p>`,
    );
  };
  WusoolUI.listen(document.getElementById('createNotification'), 'click', async () => {
    const title = document.getElementById('notificationTitle').value.trim();
    const message = document.getElementById('notificationMessage').value.trim();
    if (!title || !message) {
      WusoolAdmin.toast('Enter title and message.', 'warning');
      return;
    }
    await WusoolBehaviorService.pushNotification({
      title,
      message,
    });
    document.getElementById('notificationTitle').value = '';
    document.getElementById('notificationMessage').value = '';
    await render();
  });
  WusoolUI.listen(document.getElementById('markAllRead'), 'click', async () => {
    const items = await WusoolBehaviorService.getNotifications();
    items.forEach((item) => {
      item.read = true;
    });
    await WusoolServices.rawWrite(WusoolBehaviorService.KEYS.notifications, JSON.stringify(items));
    await render();
  });
  window.WusoolLive?.watch('admin-notifications', async () => {
    await render();
  });
  await render();
});
