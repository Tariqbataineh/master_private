'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    const userName = (await WusoolServices.rawRead('wusool-user-name')) || 'User';
    document.querySelectorAll('[data-user-name]').forEach((element) => {
      element.textContent = userName;
    });
    const markAllButton = document.getElementById('markAllRead');
    if (markAllButton) {
      const container = document.querySelector('.notification-item')?.parentElement;
      const refreshNotifications = async () => {
        const notifications = (await WusoolServices.listAll('notifications')).items;
        if (container)
          WusoolUI.html(
            container,
            notifications
              .map(
                (n) =>
                  `<article class="notification-item ${n.status === 'read' ? '' : 'is-unread'} p-4 border-bottom"><h2 class="h5 fw-bold">${WusoolUI.escape(n.title || 'Notification')}</h2><p class="text-secondary">${WusoolUI.escape(n.message || '')}</p><small>${WusoolUI.escape(n.createdAt || '')}</small></article>`,
              )
              .join('') || '<p class="p-4">No notifications.</p>',
          );
        markAllButton.disabled = !notifications.some((n) => n.status !== 'read');
      };
      await refreshNotifications();
      WusoolUI.listen(markAllButton, 'click', async () => {
        for (const n of (await WusoolServices.listAll('notifications')).items)
          if (n.status !== 'read')
            await WusoolServices.save('notifications', { ...n, status: 'read', read: true });
        await refreshNotifications();
      });
    }
    const settingsForm = document.getElementById('accountSettingsForm');
    if (settingsForm) {
      const savedSettings = JSON.parse(
        (await WusoolServices.rawRead('wusool-account-settings')) || '{}',
      );
      settingsForm.elements.fullName.value = savedSettings.fullName || userName;
      settingsForm.elements.email.value = savedSettings.email || '';
      settingsForm.elements.language.value = savedSettings.language || 'en';
      WusoolUI.listen(settingsForm, 'submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(settingsForm);
        const settings = Object.fromEntries(formData.entries());
        await WusoolServices.rawWrite('wusool-account-settings', JSON.stringify(settings));
        await WusoolServices.rawWrite('wusool-user-name', settings.fullName);
        showStatus('settingsStatus', 'Account settings saved successfully.');
      });
    }
    const addPlaceForm = document.getElementById('addPlaceForm');
    WusoolUI.listen(addPlaceForm, 'submit', async (event) => {
      event.preventDefault();
      const suggestions = JSON.parse(
        (await WusoolServices.rawRead('wusool-place-suggestions')) || '[]',
      );
      const suggestion = Object.fromEntries(new FormData(addPlaceForm).entries());
      suggestions.push({
        ...suggestion,
        id: Date.now(),
        status: 'Pending Review',
        createdAt: new Date().toISOString(),
      });
      await WusoolServices.rawWrite('wusool-place-suggestions', JSON.stringify(suggestions));
      addPlaceForm.reset();
      showStatus('placeStatus', 'Place submitted for admin review.');
    });
    const supportForm = document.getElementById('supportForm');
    WusoolUI.listen(supportForm, 'submit', async (event) => {
      event.preventDefault();
      const requests = JSON.parse(
        (await WusoolServices.rawRead('wusool-support-requests')) || '[]',
      );
      requests.push({
        ...Object.fromEntries(new FormData(supportForm).entries()),
        id: Date.now(),
        status: 'Open',
        createdAt: new Date().toISOString(),
      });
      await WusoolServices.rawWrite('wusool-support-requests', JSON.stringify(requests));
      supportForm.reset();
      showStatus(
        'supportStatus',
        'Your support request was recorded. No email delivery is implied.',
      );
    });
    function showStatus(elementId, message) {
      const status = document.getElementById(elementId);
      status.textContent = message;
      status.classList.remove('d-none');
    }
  });
});
