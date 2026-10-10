'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const service = WusoolDataService;
  const groups = [
    {
      type: 'Organization',
      items: (
        await service.getOrganizations({
          includeDeleted: true,
        })
      ).filter((x) => x.isDeleted),
      restore: async (id) => await service.restoreOrganization(id),
    },
    {
      type: 'Branch',
      items: (
        await service.getBranches({
          includeDeleted: true,
        })
      ).filter((x) => x.isDeleted),
      restore: async (id) => await service.restoreBranch(id),
    },
    {
      type: 'User',
      items: (
        await service.getUsers({
          includeDeleted: true,
        })
      ).filter((x) => x.isDeleted),
      restore: async (id) => await service.restoreUser(id),
    },
    {
      type: 'Ticket',
      items: (
        await service.getTickets({
          includeDeleted: true,
        })
      ).filter((x) => x.isDeleted),
      restore: async (id) => await service.restoreTicket(id),
    },
    {
      type: 'Review',
      items: (
        await service.getReviews({
          includeDeleted: true,
        })
      ).filter((x) => x.isDeleted),
      restore: async (id) => await service.restoreReview(id),
    },
    {
      type: 'Subscription',
      items: (
        await service.getSubscriptions({
          includeDeleted: true,
        })
      ).filter((x) => x.isDeleted),
      restore: async (id) => await service.restoreSubscription(id),
    },
  ];
  const container = document.querySelector('.container-fluid.px-3.px-md-4.px-xl-5.py-4');
  if (container) {
    WusoolUI.html(
      container,
      `
        <article class="content-card">
            <div class="mb-4">
                <p class="page-label mb-1">SOFT-DELETED DATA</p>
                <h2 class="h4 fw-bold mb-0">Recovery Center</h2>
            </div>

            ${groups
              .map(
                (group) => `
                <section class="mb-4">
                    <h3 class="h5 fw-bold">${group.type}s</h3>

                    ${
                      group.items.length
                        ? group.items
                            .map(
                              (item) => `
                                <div class="admin-list-item">
                                    <div class="flex-grow-1">
                                        <strong class="d-block">
                                            ${WusoolUI.escape(item.name || item.subject || item.title || item.plan || item.id)}
                                        </strong>

                                        <small class="text-secondary">
                                            ${WusoolUI.escape(item.id)}
                                        </small>
                                    </div>

                                    <button
                                        class="btn btn-sm btn-outline-success"
                                        data-restore-type="${group.type}"
                                        data-restore-id="${WusoolUI.escape(item.id)}"
                                    >
                                        Restore
                                    </button>
                                </div>
                            `,
                            )
                            .join('')
                        : `
                                <p class="text-secondary">
                                    No deleted ${group.type.toLowerCase()}s.
                                </p>
                            `
                    }
                </section>
            `,
              )
              .join('')}
        </article>
    `,
    );
  }
  WusoolUI.listen(document, 'click', async (event) => {
    const button = event.target.closest('[data-restore-id]');
    if (!button) {
      return;
    }
    const group = groups.find((item) => item.type === button.dataset.restoreType);
    if (!group || !(await WusoolAdmin.confirm(`Restore this ${group.type.toLowerCase()}?`))) return;
    await group.restore(button.dataset.restoreId);
    window.location.reload();
  });
});
