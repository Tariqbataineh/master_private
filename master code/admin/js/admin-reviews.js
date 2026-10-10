'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const service = WusoolDataService;
  const tbody = document.getElementById('reviewsTableBody');
  const search = document.getElementById('reviewSearch');
  const statusFilter = document.getElementById('reviewStatusFilter');
  const flagFilter = document.getElementById('reviewFlagFilter');
  const stats = document.getElementById('reviewStats');
  const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
  const renderStats = async () => {
    const reviews = await service.getReviews();
    const flagged = reviews.filter((item) => item.flagged).length;
    const visible = reviews.filter((item) => item.status === 'Visible').length;
    const average = reviews.length
      ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
      : '0.0';
    const cards = [
      ['Reviews', reviews.length, 'bi-star'],
      ['Visible', visible, 'bi-eye'],
      ['Flagged', flagged, 'bi-flag'],
      ['Average Rating', average, 'bi-star-fill'],
    ];
    WusoolUI.html(
      stats,
      cards
        .map(
          ([label, value, icon]) => `
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
    `,
        )
        .join(''),
    );
  };
  const render = async () => {
    const reviews = await service.getReviews({
      search: search.value.trim(),
      status: statusFilter.value,
      flagged: flagFilter.value === 'flagged' ? true : null,
    });
    WusoolUI.html(
      tbody,
      reviews.length
        ? (
            await WusoolUI.mapAsync(reviews, async (item) => {
              const user = await service.getUserById(item.userId);
              const branch = await service.getBranchById(item.branchId);
              return `
                <tr>
                    <td>
                        <strong class="d-block">${WusoolUI.escape(item.title || 'Review')}</strong>
                        <small class="text-secondary">${WusoolUI.escape(item.comment)}</small>
                    </td>

                    <td>${WusoolUI.escape(user?.name || 'Unknown User')}</td>
                    <td>${WusoolUI.escape(branch?.name || 'Unknown Branch')}</td>

                    <td>
                        <span class="rating-stars">
                            ${'★'.repeat(Math.max(0, Math.min(5, item.rating)))}
                        </span>
                    </td>

                    <td>
                        <span class="badge ${item.status === 'Visible' ? 'badge-soft-success' : item.status === 'Hidden' ? 'badge-soft-danger' : 'badge-soft-warning'}">
                            ${WusoolUI.escape(item.status)}
                        </span>
                    </td>

                    <td>${item.flagged ? 'Yes' : 'No'}</td>

                    <td>
                        <div class="action-menu">
                            <button class="btn btn-sm btn-outline-primary" data-edit="${WusoolUI.escape(item.id)}">
                                Moderate
                            </button>

                            ${
                              item.status === 'Visible'
                                ? `
                                        <button class="btn btn-sm btn-outline-warning" data-hide="${WusoolUI.escape(item.id)}">
                                            Hide
                                        </button>
                                    `
                                : `
                                        <button class="btn btn-sm btn-outline-success" data-show="${WusoolUI.escape(item.id)}">
                                            Show
                                        </button>
                                    `
                            }

                            <button class="btn btn-sm btn-outline-danger" data-delete="${WusoolUI.escape(item.id)}">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            })
          ).join('')
        : `
            <tr>
                <td colspan="7" class="text-center py-5 text-secondary">
                    No reviews found.
                </td>
            </tr>
        `,
    );
  };
  const openReview = (item) => {
    document.getElementById('reviewModalTitle').textContent = item.title || 'Review';
    document.getElementById('reviewId').value = item.id;
    document.getElementById('reviewComment').value = item.comment;
    document.getElementById('reviewRating').value = item.rating;
    document.getElementById('reviewStatus').value = item.status;
    document.getElementById('reviewFlagged').checked = item.flagged;
    document.getElementById('reviewAdminNote').value = item.adminNote;
    modal.show();
  };
  WusoolUI.listen(document.getElementById('saveReviewButton'), 'click', async () => {
    const id = document.getElementById('reviewId').value;
    const current = await service.getReviewById(id);
    if (!current) {
      return;
    }
    await service.saveReview({
      ...current,
      comment: document.getElementById('reviewComment').value.trim(),
      rating: Number(document.getElementById('reviewRating').value),
      status: document.getElementById('reviewStatus').value,
      flagged: document.getElementById('reviewFlagged').checked,
      adminNote: document.getElementById('reviewAdminNote').value.trim(),
    });
    modal.hide();
    await renderStats();
    await render();
    WusoolAdmin.toast('Review updated.');
  });
  WusoolUI.listen(tbody, 'click', async (event) => {
    const edit = event.target.closest('[data-edit]');
    const hide = event.target.closest('[data-hide]');
    const show = event.target.closest('[data-show]');
    const remove = event.target.closest('[data-delete]');
    if (edit) {
      const item = await service.getReviewById(edit.dataset.edit);
      if (item) {
        openReview(item);
      }
    }
    if (hide) {
      if (!(await WusoolAdmin.confirm('Hide this review from public pages?'))) return;
      await service.setReviewStatus(hide.dataset.hide, 'Hidden');
      await renderStats();
      await render();
    }
    if (show) {
      if (!(await WusoolAdmin.confirm('Make this review publicly visible?'))) return;
      await service.setReviewStatus(show.dataset.show, 'Visible');
      await renderStats();
      await render();
    }
    if (remove) {
      const item = await service.getReviewById(remove.dataset.delete);
      if (!item || !(await WusoolAdmin.confirm('Move this review to Recovery Center?'))) {
        return;
      }
      await service.deleteReview(item.id, 'Deleted from Admin Reviews');
      await renderStats();
      await render();
      WusoolAdmin.toast('Review moved to Recovery Center.');
    }
  });
  WusoolUI.listen(search, 'input', render);
  WusoolUI.listen(statusFilter, 'change', render);
  WusoolUI.listen(flagFilter, 'change', render);
  await renderStats();
  window.WusoolLive?.watch('admin-reviews', async () => {
    await renderStats();
    await render();
  });
  await render();
});
