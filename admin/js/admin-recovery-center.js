
"use strict";

const service = WusoolDataService;

const groups = [
    {
        type: "Organization",
        items: service.getOrganizations({ includeDeleted: true }).filter((x) => x.isDeleted),
        restore: (id) => service.restoreOrganization(id)
    },
    {
        type: "Branch",
        items: service.getBranches({ includeDeleted: true }).filter((x) => x.isDeleted),
        restore: (id) => service.restoreBranch(id)
    },
    {
        type: "User",
        items: service.getUsers({ includeDeleted: true }).filter((x) => x.isDeleted),
        restore: (id) => service.restoreUser(id)
    },
    {
        type: "Ticket",
        items: service.getTickets({ includeDeleted: true }).filter((x) => x.isDeleted),
        restore: (id) => service.restoreTicket(id)
    },
    {
        type: "Review",
        items: service.getReviews({ includeDeleted: true }).filter((x) => x.isDeleted),
        restore: (id) => service.restoreReview(id)
    },
    {
        type: "Subscription",
        items: service.getSubscriptions({ includeDeleted: true }).filter((x) => x.isDeleted),
        restore: (id) => service.restoreSubscription(id)
    }
];

const container = document.querySelector(
    ".container-fluid.px-3.px-md-4.px-xl-5.py-4"
);

if (container) {
    container.innerHTML = `
        <article class="content-card">
            <div class="mb-4">
                <p class="page-label mb-1">SOFT-DELETED DATA</p>
                <h2 class="h4 fw-bold mb-0">Recovery Center</h2>
            </div>

            ${groups.map((group) => `
                <section class="mb-4">
                    <h3 class="h5 fw-bold">${group.type}s</h3>

                    ${
                        group.items.length
                            ? group.items.map((item) => `
                                <div class="admin-list-item">
                                    <div class="flex-grow-1">
                                        <strong class="d-block">
                                            ${item.name || item.subject || item.title || item.plan || item.id}
                                        </strong>

                                        <small class="text-secondary">
                                            ${item.id}
                                        </small>
                                    </div>

                                    <button
                                        class="btn btn-sm btn-outline-success"
                                        data-restore-type="${group.type}"
                                        data-restore-id="${item.id}"
                                    >
                                        Restore
                                    </button>
                                </div>
                            `).join("")
                            : `
                                <p class="text-secondary">
                                    No deleted ${group.type.toLowerCase()}s.
                                </p>
                            `
                    }
                </section>
            `).join("")}
        </article>
    `;
}

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-restore-id]");

    if (!button) {
        return;
    }

    const group = groups.find(
        (item) => item.type === button.dataset.restoreType
    );

    group?.restore(button.dataset.restoreId);
    window.location.reload();
});
