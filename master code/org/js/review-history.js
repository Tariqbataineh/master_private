'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const reviewHistoryStorageKey = 'wusoolBranchReviewHistory';
  let reviewHistory = [];
  let filteredReviews = [];
  let reviewDetailsModal = null;
  WusoolUI.ready(async () => {
    initializeModal();
    await loadReviewHistory();
    populateBranchFilter();
    configureFilters();
    configureReviewActions();
    renderPage();
    window.WusoolLive?.watch('review-history', async () => {
      await loadReviewHistory();
      populateBranchFilter();
      filterReviews();
      renderStatistics();
    });
    WusoolUI.listen(window, 'wxi:language', () => {
      populateBranchFilter();
      filterReviews();
      renderStatistics();
    });
  });
  const defaultReviewHistory = [];
  const isArabic = () => document.documentElement.lang === 'ar';
  const t = (english, arabic) => isArabic() ? arabic : english;
  const decisions = new Set(['approved', 'pending', 'changes-required', 'rejected']);
  const statusKey = (status) => {
    const value = String(status || '').trim().toLowerCase();
    return value === 'changes-requested' ? 'changes-required' : value;
  };
  const initializeModal = () => {
    const modalElement = document.getElementById('reviewDetailsModal');
    reviewDetailsModal = bootstrap.Modal.getOrCreateInstance(modalElement);
  };
  const loadReviewHistory = async () => {
    const storedReviews = await WusoolServices.rawRead(reviewHistoryStorageKey);
    if (!storedReviews) {
      reviewHistory = [...defaultReviewHistory];
      // A read-only audit page must not write a blank history record.
    } else {
      try {
        const parsed = JSON.parse(storedReviews);
        reviewHistory = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        console.error('Unable to load review history:', error);
        reviewHistory = [...defaultReviewHistory];
      }
    }
    reviewHistory.sort((firstReview, secondReview) => {
      return (Date.parse(secondReview.submittedAt) || 0) - (Date.parse(firstReview.submittedAt) || 0);
    });
    filteredReviews = [...reviewHistory];
  };
  const populateBranchFilter = () => {
    const branchFilter = document.getElementById('branchFilter');
    const current = branchFilter.value;
    const branchNames = [...new Set(reviewHistory.map(review => String(review.branchName || '').trim()).filter(Boolean))];
    branchFilter.replaceChildren(
      new Option(t('All branches', 'كل الفروع'), 'all'),
      ...branchNames.map(name => new Option(name, name)),
    );
    branchFilter.value = branchNames.includes(current) ? current : 'all';
  };
  const configureFilters = () => {
    WusoolUI.listen(document.getElementById('reviewSearch'), 'input', filterReviews);
    WusoolUI.listen(document.getElementById('branchFilter'), 'change', filterReviews);
    WusoolUI.listen(document.getElementById('statusFilter'), 'change', filterReviews);
    WusoolUI.listen(document.getElementById('clearFiltersButton'), 'click', clearFilters);
    WusoolUI.listen(document.getElementById('emptyClearButton'), 'click', clearFilters);
  };
  const configureReviewActions = () => {
    WusoolUI.listen(document, 'click', (event) => {
      const reviewButton = event.target.closest('[data-review-id]');
      if (!reviewButton) {
        return;
      }
      openReviewDetails(String(reviewButton.dataset.reviewId));
    });
  };
  const filterReviews = () => {
    const searchValue = document.getElementById('reviewSearch').value.trim().toLowerCase();
    const selectedBranch = document.getElementById('branchFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;
    filteredReviews = reviewHistory.filter((review) => {
      const searchableText = [review.reference, review.branchName, review.city, review.entityId, review.notes, review.reason]
        .map(value => String(value || '')).join(' ').toLowerCase();
      const key = statusKey(review.status);
      const matchesSearch = searchableText.includes(searchValue);
      const matchesBranch = selectedBranch === 'all' || review.branchName === selectedBranch;
      const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'other' ? !decisions.has(key) : key === selectedStatus);
      return matchesSearch && matchesBranch && matchesStatus;
    });
    renderReviews();
  };
  const clearFilters = () => {
    document.getElementById('reviewSearch').value = '';
    document.getElementById('branchFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    filteredReviews = [...reviewHistory];
    renderReviews();
  };
  const renderPage = () => {
    renderStatistics();
    renderReviews();
  };
  const renderStatistics = () => {
    setTextContent('totalReviews', reviewHistory.length);
    setTextContent('approvedReviews', countReviewsByStatus('approved'));
    setTextContent('pendingReviews', countReviewsByStatus('pending'));
    setTextContent('changesReviews', countReviewsByStatus('changes-required'));
    const other = reviewHistory.filter(review => !decisions.has(statusKey(review.status))).length;
    setTextContent('historyScopeNote', other
      ? t(`History contains ${other} entries with other branch states or actions. Counts above show the listed decisions, not every history entry.`,
          `يتضمن السجل ${other} حدثًا بحالات أو إجراءات أخرى للفروع. العدادات أعلاه تخص القرارات الموضحة ولا تغطي جميع الأحداث.`)
      : t('This history is based on saved branch audit events; entries are not necessarily distinct approval reviews.',
          'يعتمد هذا السجل على أحداث تدقيق الفروع المحفوظة؛ وليس بالضرورة أن يكون كل حدث مراجعة موافقة مستقلة.'));
  };
  const countReviewsByStatus = (status) => {
    return reviewHistory.filter((review) => {
      return statusKey(review.status) === status;
    }).length;
  };
  const renderReviews = () => {
    const tableBody = document.getElementById('reviewsTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableCard = document.querySelector('.reviews-table-card');
    WusoolUI.html(tableBody, '');
    setTextContent(
      'resultsText',
      t(`Showing ${filteredReviews.length} of ${reviewHistory.length} history entries`,
        `عرض ${filteredReviews.length} من أصل ${reviewHistory.length} حدثًا في السجل`),
    );
    if (filteredReviews.length === 0) {
      tableCard.classList.add('d-none');
      emptyState.classList.remove('d-none');
      return;
    }
    tableCard.classList.remove('d-none');
    emptyState.classList.add('d-none');
    filteredReviews.forEach((review) => {
      WusoolUI.insertHTML(tableBody, 'beforeend', createReviewRow(review));
    });
  };
  const createReviewRow = (review) => {
    const statusInformation = getStatusInformation(review.status);
    const score = Number.isFinite(review.score) && review.score >= 0 && review.score <= 100 ? `${review.score}%` : '—';
    return `
        <tr>
            <td>
                <strong>
                    <span class="review-reference" title="${escapeHtml(review.reference || review.entityId || '')}">${escapeHtml(review.reference || review.entityId || '—')}</span>
                </strong>
            </td>

            <td>
                <strong class="d-block">
                    ${escapeHtml(review.branchName)}
                </strong>

                <small class="text-secondary">
                    <i class="bi bi-geo-alt me-1"></i>
                    ${escapeHtml(review.city)}
                </small>
            </td>

            <td>
                ${formatDateTime(review.submittedAt)}
            </td>

            <td>
                <span class="table-score">
                    ${score}
                </span>
            </td>

            <td>
                <span
                    class="review-status ${decisions.has(statusKey(review.status)) ? statusKey(review.status) : 'other'}"
                >
                    <i class="bi ${statusInformation.icon}"></i>
                    ${statusInformation.label}
                </span>
            </td>

            <td>
                ${review.reviewedAt ? formatDateTime(review.reviewedAt) : t('Not reviewed', 'لم تُراجع بعد')}
            </td>

            <td class="text-end">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-wusool"
                    data-review-id="${WusoolUI.escape(review.id)}"
                    aria-label="${escapeHtml(t('View event details for', 'عرض تفاصيل الحدث للفرع'))} ${escapeHtml(review.branchName || review.reference || '')}"
                >
                    ${t('View Details', 'عرض التفاصيل')}
                </button>
            </td>
        </tr>
    `;
  };
  const openReviewDetails = (reviewId) => {
    const selectedReview = reviewHistory.find((review) => {
      return String(review.id) === String(reviewId);
    });
    if (!selectedReview) {
      return;
    }
    const statusInformation = getStatusInformation(selectedReview.status);
    setTextContent('modalReviewReference', selectedReview.reference);
    setTextContent('modalBranchName', selectedReview.branchName);
    setTextContent('modalBranchCity', selectedReview.city);
    setTextContent('modalSubmittedDate', formatDateTime(selectedReview.submittedAt));
    setTextContent(
      'modalReviewedDate',
      selectedReview.reviewedAt ? formatDateTime(selectedReview.reviewedAt) : t('Not reviewed', 'لم تُراجع بعد'),
    );
    const scoreValue = Number.isFinite(selectedReview.score) && selectedReview.score >= 0 && selectedReview.score <= 100 ? `${selectedReview.score}%` : '—';
    setTextContent('modalScore', scoreValue);
    setTextContent('modalScoreLabel', getScoreLabel(selectedReview.score));
    const statusElement = document.getElementById('modalReviewStatus');
    statusElement.className = `review-status ${decisions.has(statusKey(selectedReview.status)) ? statusKey(selectedReview.status) : 'other'}`;
    WusoolUI.html(
      statusElement,
      `
        <i class="bi ${statusInformation.icon}"></i>
        ${statusInformation.label}
    `,
    );
    const feedback = [selectedReview.feedback, selectedReview.reviewReason, selectedReview.adminNotes,
      selectedReview.notes, selectedReview.reason].find(item =>
        (Array.isArray(item) && item.length > 0) || (typeof item === 'string' && item.trim()));
    renderFeedback(feedback);
    const link = document.getElementById('openReviewStatusLink');
    const branchId = selectedReview.branchId || selectedReview.entityId;
    link.hidden = !branchId;
    if (branchId) link.href = `./branch-review-status.html?id=${encodeURIComponent(branchId)}`;
    else link.removeAttribute('href');
    reviewDetailsModal.show();
  };
  const renderFeedback = (feedbackItems) => {
    const feedbackList = document.getElementById('modalFeedbackList');
    WusoolUI.html(feedbackList, '');
    const items = Array.isArray(feedbackItems) ? feedbackItems : typeof feedbackItems === 'string' && feedbackItems.trim() ? [feedbackItems] : [];
    if (!items.length) items.push(t('No additional reviewer comments.', 'لا توجد ملاحظات إضافية من المراجع.'));
    items.forEach((feedbackItem) => {
      const listItem = document.createElement('li');
      WusoolUI.html(
        listItem,
        `
                <i class="bi bi-check-circle"></i>

                <span>
                    ${escapeHtml(typeof feedbackItem === 'object' && feedbackItem !== null ? (feedbackItem.message || feedbackItem.text || feedbackItem.comment || '') : feedbackItem)}
                </span>
            `,
      );
      feedbackList.appendChild(listItem);
    });
  };
  const getStatusInformation = (status) => {
    const key = statusKey(status);
    const statuses = {
      approved: { label: t('Approved', 'معتمد'), icon: 'bi-check-circle-fill' },
      pending: { label: t('Pending', 'قيد المراجعة'), icon: 'bi-hourglass-split' },
      'changes-required': { label: t('Changes Required', 'التعديلات مطلوبة'), icon: 'bi-pencil-square' },
      rejected: { label: t('Rejected', 'مرفوض'), icon: 'bi-x-circle-fill' },
      published: { label: t('Published', 'منشور'), icon: 'bi-check-circle' },
    };
    return statuses[key] || { label: t('Other event', 'حدث آخر'), icon: 'bi-clock-history' };
  };
  const getScoreLabel = (score) => {
    if (typeof score !== 'number') {
      return t('Not available', 'غير متوفر');
    }
    if (score >= 85) {
      return t('Excellent Accessibility', 'إمكانية وصول ممتازة');
    }
    if (score >= 70) {
      return t('Good Accessibility', 'إمكانية وصول جيدة');
    }
    return t('Needs Improvement', 'يحتاج إلى تحسين');
  };
  const formatDateTime = (dateValue) => {
    if (!dateValue || !Number.isFinite(Date.parse(dateValue))) return '—';
    return new Intl.DateTimeFormat(isArabic() ? 'ar-JO' : 'en-JO', {
      timeZone: 'Asia/Amman',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateValue));
  };
  const setTextContent = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value ?? '—';
    }
  };
  const escapeHtml = (value) => {
    const temporaryElement = document.createElement('div');
    temporaryElement.textContent = String(value || '');
    return temporaryElement.innerHTML;
  };
});
