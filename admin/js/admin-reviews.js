
"use strict";

const service = WusoolDataService;
const tbody = document.getElementById("reviewsTableBody");
const search = document.getElementById("reviewSearch");
const statusFilter = document.getElementById("reviewStatusFilter");
const flagFilter = document.getElementById("reviewFlagFilter");
const stats = document.getElementById("reviewStats");
const modal = new bootstrap.Modal(document.getElementById("reviewModal"));

const renderStats = () => {
    const reviews = service.getReviews();
    const flagged = reviews.filter((item) => item.flagged).length;
    const visible = reviews.filter((item) => item.status === "Visible").length;
    const average = reviews.length
        ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const cards = [
        ["Reviews", reviews.length, "bi-star"],
        ["Visible", visible, "bi-eye"],
        ["Flagged", flagged, "bi-flag"],
        ["Average Rating", average, "bi-star-fill"]
    ];

    stats.innerHTML = cards.map(([label, value, icon]) => `
        <div class="col-12 col-sm-6 col-xl-3">
            <article class="stat-card">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <p class="text-secondary mb-2">${label}</p>
                        <div class="metric">${value}</div>
                    </div>
                    <span class="stat-icon"><i class="bi ${icon}"></i></span>
                </div>
            </article>
        </div>
    `).join("");
};

const render = () => {
    const reviews = service.getReviews({
        search: search.value.trim(),
        status: statusFilter.value,
        flagged: flagFilter.value === "flagged" ? true : null
    });

    tbody.innerHTML = reviews.length
        ? reviews.map((item) => {
            const user = service.getUserById(item.userId);
            const branch = service.getBranchById(item.branchId);

            return `
                <tr>
                    <td>
                        <strong class="d-block">${item.title || "Review"}</strong>
                        <small class="text-secondary">${item.comment}</small>
                    </td>

                    <td>${user?.name || "Unknown User"}</td>
                    <td>${branch?.name || "Unknown Branch"}</td>

                    <td>
                        <span class="rating-stars">
                            ${"★".repeat(Math.max(0, Math.min(5, item.rating)))}
                        </span>
                    </td>

                    <td>
                        <span class="badge ${
                            item.status === "Visible"
                                ? "badge-soft-success"
                                : item.status === "Hidden"
                                    ? "badge-soft-danger"
                                    : "badge-soft-warning"
                        }">
                            ${item.status}
                        </span>
                    </td>

                    <td>${item.flagged ? "Yes" : "No"}</td>

                    <td>
                        <div class="action-menu">
                            <button class="btn btn-sm btn-outline-primary" data-edit="${item.id}">
                                Moderate
                            </button>

                            ${
                                item.status === "Visible"
                                    ? `
                                        <button class="btn btn-sm btn-outline-warning" data-hide="${item.id}">
                                            Hide
                                        </button>
                                    `
                                    : `
                                        <button class="btn btn-sm btn-outline-success" data-show="${item.id}">
                                            Show
                                        </button>
                                    `
                            }

                            <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("")
        : `
            <tr>
                <td colspan="7" class="text-center py-5 text-secondary">
                    No reviews found.
                </td>
            </tr>
        `;
};

const openReview = (item) => {
    document.getElementById("reviewModalTitle").textContent =
        item.title || "Review";

    document.getElementById("reviewId").value = item.id;
    document.getElementById("reviewComment").value = item.comment;
    document.getElementById("reviewRating").value = item.rating;
    document.getElementById("reviewStatus").value = item.status;
    document.getElementById("reviewFlagged").checked = item.flagged;
    document.getElementById("reviewAdminNote").value = item.adminNote;

    modal.show();
};

document.getElementById("saveReviewButton").addEventListener("click", () => {
    const id = document.getElementById("reviewId").value;
    const current = service.getReviewById(id);

    if (!current) {
        return;
    }

    service.saveReview({
        ...current,
        comment: document.getElementById("reviewComment").value.trim(),
        rating: Number(document.getElementById("reviewRating").value),
        status: document.getElementById("reviewStatus").value,
        flagged: document.getElementById("reviewFlagged").checked,
        adminNote: document.getElementById("reviewAdminNote").value.trim()
    });

    modal.hide();
    renderStats();
    render();
    WusoolAdmin.toast("Review updated.");
});

tbody.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    const hide = event.target.closest("[data-hide]");
    const show = event.target.closest("[data-show]");
    const remove = event.target.closest("[data-delete]");

    if (edit) {
        const item = service.getReviewById(edit.dataset.edit);
        if (item) {
            openReview(item);
        }
    }

    if (hide) {
        service.setReviewStatus(hide.dataset.hide, "Hidden");
        renderStats();
        render();
    }

    if (show) {
        service.setReviewStatus(show.dataset.show, "Visible");
        renderStats();
        render();
    }

    if (remove) {
        const item = service.getReviewById(remove.dataset.delete);

        if (!item || !WusoolAdmin.confirm("Move this review to Recovery Center?")) {
            return;
        }

        service.deleteReview(item.id, "Deleted from Admin Reviews");
        renderStats();
        render();
        WusoolAdmin.toast("Review moved to Recovery Center.");
    }
});

search.addEventListener("input", render);
statusFilter.addEventListener("change", render);
flagFilter.addEventListener("change", render);

renderStats();
render();
