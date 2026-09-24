
"use strict";

const service = window.WusoolDataService;

const tableBody =
    document.getElementById(
        "organizationsTableBody"
    );

const searchInput =
    document.getElementById(
        "organizationSearch"
    );

const statusFilter =
    document.getElementById(
        "organizationStatusFilter"
    );

const countLabel =
    document.getElementById(
        "organizationCount"
    );

const statsContainer =
    document.getElementById(
        "organizationStats"
    );

const modalElement =
    document.getElementById(
        "organizationModal"
    );

const organizationModal =
    new bootstrap.Modal(
        modalElement
    );

const detailsModal =
    new bootstrap.Modal(
        document.getElementById(
            "organizationDetailsModal"
        )
    );


const formatDate = (
    value
) => {
    if (!value) {
        return "-";
    }

    return new Date(value)
        .toLocaleDateString();
};


const badgeClass = (
    status
) => {
    const map = {
        active:
            "badge-soft-success",
        pending:
            "badge-soft-warning",
        suspended:
            "badge-soft-danger",
        rejected:
            "badge-soft-danger"
    };

    return (
        map[
            String(status)
                .toLowerCase()
        ] ||
        "badge-soft-info"
    );
};


const getFiltered = () => {
    return service
        .getOrganizations({
            search:
                searchInput.value
                    .trim(),
            status:
                statusFilter.value
        });
};


const renderStats = () => {
    const all =
        service.getOrganizations();

    const active =
        all.filter(
            (item) =>
                item.status ===
                "active"
        ).length;

    const pending =
        all.filter(
            (item) =>
                item.status ===
                "pending"
        ).length;

    const branches =
        service.getBranches()
            .length;

    const cards = [
        {
            label:
                "Organizations",
            value:
                all.length,
            icon:
                "bi-buildings"
        },
        {
            label:
                "Active",
            value:
                active,
            icon:
                "bi-check-circle"
        },
        {
            label:
                "Pending",
            value:
                pending,
            icon:
                "bi-hourglass-split"
        },
        {
            label:
                "Total Branches",
            value:
                branches,
            icon:
                "bi-geo-alt"
        }
    ];

    statsContainer.innerHTML =
        cards
            .map(
                (card) => `
                    <div class="col-12 col-sm-6 col-xl-3">
                        <article class="stat-card">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <p class="text-secondary mb-2">
                                        ${card.label}
                                    </p>

                                    <div class="metric">
                                        ${card.value}
                                    </div>
                                </div>

                                <span class="stat-icon">
                                    <i class="bi ${card.icon}"></i>
                                </span>
                            </div>
                        </article>
                    </div>
                `
            )
            .join("");
};


const renderTable = () => {
    const organizations =
        getFiltered();

    countLabel.textContent =
        `${organizations.length} organization${organizations.length === 1 ? "" : "s"}`;

    tableBody.innerHTML =
        organizations.length
            ? organizations
                .map(
                    (item) => {
                        const branchCount =
                            service
                                .getBranches({
                                    organizationId:
                                        item.id
                                })
                                .length;

                        return `
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="organization-avatar">
                                            ${item.name
                                                .split(" ")
                                                .map((part) => part[0])
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </span>

                                        <div>
                                            <strong class="d-block">
                                                ${item.name}
                                            </strong>

                                            <small class="text-secondary">
                                                ${item.email || "No email"}
                                            </small>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    ${item.type}
                                </td>

                                <td>
                                    ${item.city || "-"}
                                </td>

                                <td>
                                    <span class="badge ${badgeClass(item.status)} text-capitalize">
                                        ${item.status}
                                    </span>
                                </td>

                                <td>
                                    ${branchCount}
                                </td>

                                <td>
                                    ${formatDate(item.updatedAt)}
                                </td>

                                <td>
                                    <div class="action-menu">
                                        <button
                                            class="btn btn-sm btn-outline-secondary"
                                            data-view-id="${item.id}"
                                        >
                                            View
                                        </button>

                                        <button
                                            class="btn btn-sm btn-outline-primary"
                                            data-edit-id="${item.id}"
                                        >
                                            Edit
                                        </button>

                                        ${
                                            item.status !== "active"
                                                ? `
                                                    <button
                                                        class="btn btn-sm btn-outline-success"
                                                        data-status-id="${item.id}"
                                                        data-status-value="active"
                                                    >
                                                        Approve
                                                    </button>
                                                `
                                                : `
                                                    <button
                                                        class="btn btn-sm btn-outline-warning"
                                                        data-status-id="${item.id}"
                                                        data-status-value="suspended"
                                                    >
                                                        Suspend
                                                    </button>
                                                `
                                        }

                                        <button
                                            class="btn btn-sm btn-outline-danger"
                                            data-delete-id="${item.id}"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }
                )
                .join("")
            : `
                <tr>
                    <td
                        colspan="7"
                        class="text-center py-5 text-secondary"
                    >
                        No organizations found.
                    </td>
                </tr>
            `;
};


const renderAll = () => {
    renderStats();
    renderTable();
};


const clearForm = () => {
    document.getElementById(
        "organizationModalTitle"
    ).textContent =
        "Add Organization";

    document.getElementById(
        "organizationId"
    ).value = "";

    document.getElementById(
        "organizationName"
    ).value = "";

    document.getElementById(
        "organizationType"
    ).value = "Bank";

    document.getElementById(
        "organizationEmail"
    ).value = "";

    document.getElementById(
        "organizationPhone"
    ).value = "";

    document.getElementById(
        "organizationCity"
    ).value = "Amman";

    document.getElementById(
        "organizationStatus"
    ).value = "active";

    document.getElementById(
        "organizationAddress"
    ).value = "";

    document.getElementById(
        "organizationWebsite"
    ).value = "";

    document.getElementById(
        "organizationNotes"
    ).value = "";
};


const fillForm = (
    item
) => {
    document.getElementById(
        "organizationModalTitle"
    ).textContent =
        "Edit Organization";

    document.getElementById(
        "organizationId"
    ).value =
        item.id;

    document.getElementById(
        "organizationName"
    ).value =
        item.name;

    document.getElementById(
        "organizationType"
    ).value =
        item.type;

    document.getElementById(
        "organizationEmail"
    ).value =
        item.email;

    document.getElementById(
        "organizationPhone"
    ).value =
        item.phone;

    document.getElementById(
        "organizationCity"
    ).value =
        item.city;

    document.getElementById(
        "organizationStatus"
    ).value =
        item.status;

    document.getElementById(
        "organizationAddress"
    ).value =
        item.address;

    document.getElementById(
        "organizationWebsite"
    ).value =
        item.website;

    document.getElementById(
        "organizationNotes"
    ).value =
        item.notes;
};


document.getElementById(
    "addOrganizationButton"
).addEventListener(
    "click",
    () => {
        clearForm();
        organizationModal.show();
    }
);


document.getElementById(
    "organizationForm"
).addEventListener(
    "submit",
    (event) => {
        event.preventDefault();

        const saved =
            service.saveOrganization({
                id:
                    document.getElementById(
                        "organizationId"
                    ).value ||
                    undefined,

                name:
                    document.getElementById(
                        "organizationName"
                    ).value.trim(),

                type:
                    document.getElementById(
                        "organizationType"
                    ).value,

                email:
                    document.getElementById(
                        "organizationEmail"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "organizationPhone"
                    ).value.trim(),

                city:
                    document.getElementById(
                        "organizationCity"
                    ).value.trim(),

                status:
                    document.getElementById(
                        "organizationStatus"
                    ).value,

                address:
                    document.getElementById(
                        "organizationAddress"
                    ).value.trim(),

                website:
                    document.getElementById(
                        "organizationWebsite"
                    ).value.trim(),

                notes:
                    document.getElementById(
                        "organizationNotes"
                    ).value.trim()
            });

        organizationModal.hide();
        renderAll();

        WusoolAdmin.toast(
            `${saved.name} saved successfully.`
        );
    }
);


tableBody.addEventListener(
    "click",
    (event) => {
        const editButton =
            event.target.closest(
                "[data-edit-id]"
            );

        const deleteButton =
            event.target.closest(
                "[data-delete-id]"
            );

        const statusButton =
            event.target.closest(
                "[data-status-id]"
            );

        const viewButton =
            event.target.closest(
                "[data-view-id]"
            );

        if (editButton) {
            const item =
                service
                    .getOrganizationById(
                        editButton.dataset.editId
                    );

            if (!item) {
                return;
            }

            fillForm(item);
            organizationModal.show();
        }

        if (deleteButton) {
            const item =
                service
                    .getOrganizationById(
                        deleteButton.dataset.deleteId
                    );

            if (
                !item ||
                !WusoolAdmin.confirm(
                    `Move ${item.name} to Recovery Center?`
                )
            ) {
                return;
            }

            service.deleteOrganization(
                item.id,
                "Deleted from Admin Organizations"
            );

            renderAll();

            WusoolAdmin.toast(
                "Organization moved to Recovery Center."
            );
        }

        if (statusButton) {
            const id =
                statusButton
                    .dataset
                    .statusId;

            const status =
                statusButton
                    .dataset
                    .statusValue;

            service.setOrganizationStatus(
                id,
                status
            );

            renderAll();

            WusoolAdmin.toast(
                `Organization status changed to ${status}.`
            );
        }

        if (viewButton) {
            showDetails(
                viewButton.dataset.viewId
            );
        }
    }
);


const showDetails = (
    id
) => {
    const item =
        service
            .getOrganizationById(id);

    if (!item) {
        return;
    }

    const branches =
        service
            .getBranches({
                organizationId:
                    item.id
            });

    document.getElementById(
        "organizationDetailsTitle"
    ).textContent =
        item.name;

    document.getElementById(
        "organizationDetailsContent"
    ).innerHTML = `
        <div class="row g-4">
            <div class="col-12 col-xl-4">
                <article class="content-card h-100">
                    <p class="page-label mb-1">
                        OVERVIEW
                    </p>

                    <h3 class="h5 fw-bold">
                        Organization Details
                    </h3>

                    <dl class="row mb-0 mt-4">
                        <dt class="col-5">
                            Type
                        </dt>

                        <dd class="col-7">
                            ${item.type}
                        </dd>

                        <dt class="col-5">
                            Status
                        </dt>

                        <dd class="col-7">
                            <span class="badge ${badgeClass(item.status)}">
                                ${item.status}
                            </span>
                        </dd>

                        <dt class="col-5">
                            City
                        </dt>

                        <dd class="col-7">
                            ${item.city || "-"}
                        </dd>

                        <dt class="col-5">
                            Email
                        </dt>

                        <dd class="col-7">
                            ${item.email || "-"}
                        </dd>
                    </dl>
                </article>
            </div>

            <div class="col-12 col-xl-8">
                <article class="content-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <p class="page-label mb-1">
                                BRANCHES
                            </p>

                            <h3 class="h5 fw-bold mb-0">
                                ${branches.length} Branches
                            </h3>
                        </div>

                        <a
                            href="./admin-branches.html?organizationId=${item.id}"
                            class="btn btn-sm btn-outline-primary"
                        >
                            Manage Branches
                        </a>
                    </div>

                    ${
                        branches.length
                            ? branches
                                .map(
                                    (branch) => `
                                        <div class="admin-list-item">
                                            <span class="item-icon">
                                                <i class="bi bi-geo-alt"></i>
                                            </span>

                                            <div class="flex-grow-1">
                                                <strong class="d-block">
                                                    ${branch.name}
                                                </strong>

                                                <small class="text-secondary">
                                                    ${branch.city} · Score ${branch.accessibilityScore}%
                                                </small>
                                            </div>

                                            <span class="badge ${badgeClass(branch.status)}">
                                                ${branch.status}
                                            </span>
                                        </div>
                                    `
                                )
                                .join("")
                            : `
                                <p class="text-secondary mb-0">
                                    No branches yet.
                                </p>
                            `
                    }
                </article>
            </div>
        </div>
    `;

    detailsModal.show();
};


searchInput.addEventListener(
    "input",
    renderTable
);

statusFilter.addEventListener(
    "change",
    renderTable
);

renderAll();
