'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const STORAGE_KEY = 'wusoolNavigationConfig';
  const defaults = {
    user: [
      {
        label: 'Dashboard',
        href: './user-dashboard.html',
        visible: true,
      },
      {
        label: 'Explore Places',
        href: './explore-places.html',
        visible: true,
      },
      {
        label: 'My Visits',
        href: './my-visits.html',
        visible: true,
      },
      {
        label: 'Saved Places',
        href: './saved-places.html',
        visible: true,
      },
      {
        label: 'Recommendations',
        href: './smart-recommendations.html',
        visible: true,
      },
      {
        label: 'Notifications',
        href: './notifications.html',
        visible: true,
      },
    ],
    organization: [
      {
        label: 'Dashboard',
        href: './organization-dashboard.html',
        visible: true,
      },
      {
        label: 'Branches',
        href: './branches.html',
        visible: true,
      },
      {
        label: 'AI Reports',
        href: './organization-ai-reports.html',
        visible: true,
      },
      {
        label: 'Notifications',
        href: './notifications.html',
        visible: true,
      },
      {
        label: 'Settings',
        href: './organization-settings.html',
        visible: true,
      },
      {
        label: 'Help & Support',
        href: './help-support.html',
        visible: true,
      },
    ],
    visitor: [],
  };
  const readConfig = async () => {
    try {
      return {
        ...defaults,
        ...JSON.parse((await WusoolServices.rawRead(STORAGE_KEY)) || '{}'),
      };
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      return structuredClone(defaults);
    }
  };
  let config = await readConfig();
  let currentPortal = 'user';
  const navigationList = document.getElementById('navigationList');
  const portalSelect = document.querySelector('select');
  const renderNavigation = () => {
    const items = config[currentPortal] || [];
    WusoolUI.html(
      navigationList,
      items
        .map(
          (item, index) => `
                    <div class="admin-list-item">
                        <span class="item-icon">
                            <i class="bi bi-grip-vertical"></i>
                        </span>

                        <div class="flex-grow-1">
                            <input
                                class="form-control mb-2"
                                data-label-index="${index}"
                                value="${WusoolUI.escape(item.label)}"
                            >

                            <input
                                class="form-control"
                                data-href-index="${index}"
                                value="${WusoolUI.escape(item.href)}"
                            >
                        </div>

                        <div>
                            <div class="form-check form-switch">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    data-visible-index="${index}"
                                    ${item.visible !== false ? 'checked' : ''}
                                >
                            </div>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger mt-2"
                                data-delete-index="${index}"
                            >
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                `,
        )
        .join(''),
    );
  };
  WusoolUI.listen(navigationList, 'input', (event) => {
    const items = config[currentPortal];
    const labelIndex = event.target.dataset.labelIndex;
    const hrefIndex = event.target.dataset.hrefIndex;
    const visibleIndex = event.target.dataset.visibleIndex;
    if (labelIndex !== undefined) {
      items[Number(labelIndex)].label = event.target.value;
    }
    if (hrefIndex !== undefined) {
      items[Number(hrefIndex)].href = event.target.value;
    }
    if (visibleIndex !== undefined) {
      items[Number(visibleIndex)].visible = event.target.checked;
    }
  });
  WusoolUI.listen(navigationList, 'click', (event) => {
    const button = event.target.closest('[data-delete-index]');
    if (!button) {
      return;
    }
    config[currentPortal].splice(Number(button.dataset.deleteIndex), 1);
    renderNavigation();
  });
  WusoolUI.listen(document.getElementById('addNavItem'), 'click', () => {
    config[currentPortal].push({
      label: 'New Item',
      href: '#',
      visible: true,
    });
    renderNavigation();
  });
  WusoolUI.listen(document.getElementById('saveNavigation'), 'click', async () => {
    /* Navigation publish backup */
    await WusoolVersionService?.createVersion({
      area: 'Navigation Manager',
      description: `Published ${currentPortal} navigation`,
    });
    await WusoolServices.rawWrite(STORAGE_KEY, JSON.stringify(config));
    WusoolAdmin?.toast?.('Navigation published to the real portals.');
  });
  WusoolUI.listen(portalSelect, 'change', () => {
    const text = portalSelect.value.toLowerCase();
    if (text.includes('organization')) {
      currentPortal = 'organization';
    } else if (text.includes('public') || text.includes('visitor')) {
      currentPortal = 'visitor';
    } else {
      currentPortal = 'user';
    }
    renderNavigation();
  });
  renderNavigation();
});
