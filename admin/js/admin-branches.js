
"use strict";

const service = window.WusoolDataService;

const tableBody =
    document.getElementById(
        "branchesTableBody"
    );

const searchInput =
    document.getElementById(
        "branchSearch"
    );

const statusFilter =
    document.getElementById(
        "branchStatusFilter"
    );

const organizationFilter =
    document.getElementById(
        "branchOrganizationFilter"
    );

const countLabel =
    document.getElementById(
        "branchCount"
    );

const statsContainer =
    document.getElementById(
        "branchStats"
    );

const branchOrganization =
    document.getElementById(
        "branchOrganization"
    );

const branchModal =
    new bootstrap.Modal(
        document.getElementById(
            "branchModal"
        )
    );

const detailsModal =
    new bootstrap.Modal(
        document.getElementById(
            "branchDetailsModal"
        )
    );


const formatDate = (
    value
) => {
    return value
        ? new Date(value)
            .toLocaleDateString()
        : "-";
};


const badgeClass = (
    status
) => {
    const normalized =
        String(status)
            .toLowerCase();

    if (
        normalized ===
        "approved"
    ) {
        return "badge-soft-success";
    }

    if (
        normalized ===
        "pending" ||
        normalized ===
        "needs review"
    ) {
        return "badge-soft-warning";
    }

    return "badge-soft-danger";
};


const getOrganizationName = (
    organizationId
) => {
    return (
        service
            .getOrganizationById(
                organizationId
            )
            ?.name ||
        "Unknown Organization"
    );
};


const loadOrganizationOptions = () => {
    const organizations =
        service.getOrganizations();

    const options =
        organizations
            .map(
                (item) => `
                    <option value="${item.id}">
                        ${item.name}
                    </option>
                `
            )
            .join("");

    branchOrganization.innerHTML =
        options;

    organizationFilter.innerHTML =
        `
            <option value="">
                All Organizations
            </option>
        ` +
        options;

    const queryOrganizationId =
        WusoolAdmin.getQuery(
            "organizationId"
        );

    if (
        queryOrganizationId
    ) {
        organizationFilter.value =
            queryOrganizationId;
    }
};


const getFiltered = () => {
    return service
        .getBranches({
            search:
                searchInput.value
                    .trim(),

            status:
                statusFilter.value,

            organizationId:
                organizationFilter.value
        });
};


const renderStats = () => {
    const all =
        service.getBranches();

    const approved =
        all.filter(
            (item) =>
                item.status ===
                "approved"
        ).length;

    const pending =
        all.filter(
            (item) =>
                item.status ===
                "pending"
        ).length;

    const average =
        all.length
            ? Math.round(
                all.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.accessibilityScore ||
                            0
                        ),
                    0
                ) /
                all.length
            )
            : 0;

    const cards = [
        {
            label:
                "Branches",
            value:
                all.length,
            icon:
                "bi-geo-alt"
        },
        {
            label:
                "Approved",
            value:
                approved,
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
                "Average Score",
            value:
                `${average}%`,
            icon:
                "bi-speedometer2"
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
    const branches =
        getFiltered();

    countLabel.textContent =
        `${branches.length} branch${branches.length === 1 ? "" : "es"}`;

    tableBody.innerHTML =
        branches.length
            ? branches
                .map(
                    (item) => `
                        <tr>
                            <td>
                                <div>
                                    <strong class="d-block">
                                        ${item.name}
                                    </strong>

                                    <small class="text-secondary">
                                        ${item.address || "No address"}
                                    </small>
                                </div>
                            </td>

                            <td>
                                ${getOrganizationName(item.organizationId)}
                            </td>

                            <td>
                                ${item.city || "-"}
                            </td>

                            <td>
                                <span class="score-pill">
                                    ${item.accessibilityScore}%
                                </span>
                            </td>

                            <td>
                                <span class="badge ${badgeClass(item.status)} text-capitalize">
                                    ${item.status}
                                </span>
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
                                        item.status !== "approved"
                                            ? `
                                                <button
                                                    class="btn btn-sm btn-outline-success"
                                                    data-status-id="${item.id}"
                                                    data-status-value="approved"
                                                >
                                                    Approve
                                                </button>
                                            `
                                            : `
                                                <button
                                                    class="btn btn-sm btn-outline-warning"
                                                    data-status-id="${item.id}"
                                                    data-status-value="needs review"
                                                >
                                                    Needs Review
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
                    `
                )
                .join("")
            : `
                <tr>
                    <td
                        colspan="7"
                        class="text-center py-5 text-secondary"
                    >
                        No branches found.
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
        "branchModalTitle"
    ).textContent =
        "Add Branch";

    document.getElementById(
        "branchId"
    ).value = "";

    document.getElementById(
        "branchName"
    ).value = "";

    document.getElementById(
        "branchCity"
    ).value = "Amman";

    document.getElementById(
        "branchPhone"
    ).value = "";

    document.getElementById(
        "branchAddress"
    ).value = "";

    document.getElementById(
        "branchScore"
    ).value = "0";

    document.getElementById(
        "branchStatus"
    ).value = "approved";

    document.getElementById(
        "branchNotes"
    ).value = "";

    const queryOrganizationId =
        WusoolAdmin.getQuery(
            "organizationId"
        );

    if (
        queryOrganizationId
    ) {
        branchOrganization.value =
            queryOrganizationId;
    }
};


const fillForm = (
    item
) => {
    document.getElementById(
        "branchModalTitle"
    ).textContent =
        "Edit Branch";

    document.getElementById(
        "branchId"
    ).value =
        item.id;

    document.getElementById(
        "branchName"
    ).value =
        item.name;

    branchOrganization.value =
        item.organizationId;

    document.getElementById(
        "branchCity"
    ).value =
        item.city;

    document.getElementById(
        "branchPhone"
    ).value =
        item.phone;

    document.getElementById(
        "branchAddress"
    ).value =
        item.address;

    document.getElementById(
        "branchScore"
    ).value =
        item.accessibilityScore;

    document.getElementById(
        "branchStatus"
    ).value =
        item.status;

    document.getElementById(
        "branchNotes"
    ).value =
        item.notes;
};


document.getElementById(
    "addBranchButton"
).addEventListener(
    "click",
    () => {
        clearForm();
        branchModal.show();
    }
);


document.getElementById(
    "branchForm"
).addEventListener(
    "submit",
    (event) => {
        event.preventDefault();

        const saved =
            service.saveBranch({
                id:
                    document.getElementById(
                        "branchId"
                    ).value ||
                    undefined,

                organizationId:
                    branchOrganization.value,

                name:
                    document.getElementById(
                        "branchName"
                    ).value.trim(),

                city:
                    document.getElementById(
                        "branchCity"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "branchPhone"
                    ).value.trim(),

                address:
                    document.getElementById(
                        "branchAddress"
                    ).value.trim(),

                accessibilityScore:
                    Number(
                        document.getElementById(
                            "branchScore"
                        ).value
                    ),

                status:
                    document.getElementById(
                        "branchStatus"
                    ).value,

                notes:
                    document.getElementById(
                        "branchNotes"
                    ).value.trim()
            });

        branchModal.hide();
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
                    .getBranchById(
                        editButton.dataset.editId
                    );

            if (!item) {
                return;
            }

            fillForm(item);
            branchModal.show();
        }

        if (deleteButton) {
            const item =
                service
                    .getBranchById(
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

            service.deleteBranch(
                item.id,
                "Deleted from Admin Branches"
            );

            renderAll();

            WusoolAdmin.toast(
                "Branch moved to Recovery Center."
            );
        }

        if (statusButton) {
            const id =
                statusButton.dataset
                    .statusId;

            const status =
                statusButton.dataset
                    .statusValue;

            service.setBranchStatus(
                id,
                status
            );

            renderAll();

            WusoolAdmin.toast(
                `Branch status changed to ${status}.`
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
            .getBranchById(id);

    if (!item) {
        return;
    }

    const organization =
        service
            .getOrganizationById(
                item.organizationId
            );

    document.getElementById(
        "branchDetailsTitle"
    ).textContent =
        item.name;

    document.getElementById(
        "branchDetailsContent"
    ).innerHTML = `
        <div class="row g-4">

            <div class="col-12 col-xl-4">
                <article class="content-card h-100">
                    <p class="page-label mb-1">
                        OVERVIEW
                    </p>

                    <h3 class="h5 fw-bold">
                        Branch Information
                    </h3>

                    <dl class="row mb-0 mt-4">
                        <dt class="col-5">
                            Organization
                        </dt>

                        <dd class="col-7">
                            ${organization?.name || "-"}
                        </dd>

                        <dt class="col-5">
                            City
                        </dt>

                        <dd class="col-7">
                            ${item.city || "-"}
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
                            Score
                        </dt>

                        <dd class="col-7">
                            <strong>
                                ${item.accessibilityScore}%
                            </strong>
                        </dd>
                    </dl>
                </article>
            </div>

            <div class="col-12 col-xl-8">
                <article class="content-card">
                    <p class="page-label mb-1">
                        BRANCH CONTROL
                    </p>

                    <h3 class="h5 fw-bold mb-4">
                        Connected Management Areas
                    </h3>

                    <div class="row g-3">
                        ${[
                            ["bi-clock","Working Hours"],
                            ["bi-universal-access","Accessibility Checklist"],
                            ["bi-images","Photos"],
                            ["bi-stars","AI Analysis"],
                            ["bi-briefcase","Services"],
                            ["bi-ticket-perforated","Tickets"]
                        ]
                            .map(
                                ([icon, label]) => `
                                    <div class="col-12 col-md-6">
                                        <div class="border rounded-3 p-3">
                                            <i class="bi ${icon} me-2"></i>
                                            ${label}
                                        </div>
                                    </div>
                                `
                            )
                            .join("")}
                    </div>
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

organizationFilter.addEventListener(
    "change",
    renderTable
);

loadOrganizationOptions();
renderAll();
