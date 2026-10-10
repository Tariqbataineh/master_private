'use strict';

/* =========================================
   Wusool Behavior Runtime
========================================= */
WusoolUI.enqueue(async () => {
  (() => {
    const service = window.WusoolBehaviorService;
    if (!service) {
      return;
    }
    const showImpersonationBar = async () => {
      const session = await service.getImpersonation();
      if (!session) {
        return;
      }
      if (document.getElementById('wusoolImpersonationBar')) {
        return;
      }
      const bar = document.createElement('div');
      bar.id = 'wusoolImpersonationBar';
      bar.className = 'wusool-impersonation-bar';
      WusoolUI.html(
        bar,
        `
            <div>
                <strong>
                    Admin Preview Mode
                </strong>

                <span>
                    Viewing as ${session.type}: ${session.name}
                </span>
            </div>

            <button
                type="button"
                id="wusoolExitImpersonation"
            >
                Exit Preview
            </button>
        `,
      );
      document.body.prepend(bar);
      WusoolUI.listen(document.getElementById('wusoolExitImpersonation'), 'click', async () => {
        await service.stopImpersonation();
        window.location.href = '../../admin/html/admin-impersonation.html';
      });
    };
    const applyPermissionVisibility = async () => {
      const role = (await WusoolServices.rawRead('wusoolAdminRole')) || 'super-admin';
      await WusoolUI.each(document.querySelectorAll('[data-permission]'), async (element) => {
        const permission = element.dataset.permission;
        if (!(await service.hasPermission(role, permission))) {
          element.style.display = 'none';
        }
      });
    };
    WusoolUI.ready(async () => {
      await showImpersonationBar();
      await applyPermissionVisibility();
    });
  })();
});
