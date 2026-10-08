"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const reviewHistoryStorageKey = "wusoolBranchReviewHistory";
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
  });
  const defaultReviewHistory = [];
  const initializeModal = () => {
    const modalElement = document.getElementById("reviewDetailsModal");
    reviewDetailsModal = bootstrap.Modal.getOrCreateInstance(modalElement);
  };
  const loadReviewHistory = async () => {
    const storedReviews = await WusoolServices.rawRead(reviewHistoryStorageKey);
    if (!storedReviews) {
      reviewHistory = [...defaultReviewHistory];
      await saveReviewHistory();
    } else {
      try {
        reviewHistory = JSON.parse(storedReviews);
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        console.error("Unable to load review history:", error);
        reviewHistory = [...defaultReviewHistory];
      }
    }
    reviewHistory.sort((firstReview, secondReview) => {
      return new Date(secondReview.submittedAt) - new Date(firstReview.submittedAt);
    });
    filteredReviews = [...reviewHistory];
  };
  const saveReviewHistory = async () => {
    await WusoolServices.rawWrite(reviewHistoryStorageKey, JSON.stringify(reviewHistory));
  };
  const populateBranchFilter = () => {
    const branchFilter = document.getElementById("branchFilter");
    const branchNames = [...new Set(reviewHistory.map(review => {
      return review.branchName;
    }))];
    branchNames.forEach(branchName => {
      const option = document.createElement("option");
      option.value = branchName;
      option.textContent = branchName;
      branchFilter.appendChild(option);
    });
  };
  const configureFilters = () => {
    WusoolUI.listen(document.getElementById("reviewSearch"), "input", filterReviews);
    WusoolUI.listen(document.getElementById("branchFilter"), "change", filterReviews);
    WusoolUI.listen(document.getElementById("statusFilter"), "change", filterReviews);
    WusoolUI.listen(document.getElementById("clearFiltersButton"), "click", clearFilters);
    WusoolUI.listen(document.getElementById("emptyClearButton"), "click", clearFilters);
  };
  const configureReviewActions = () => {
    WusoolUI.listen(document, "click", event => {
      const reviewButton = event.target.closest("[data-review-id]");
      if (!reviewButton) {
        return;
      }
      openReviewDetails(String(reviewButton.dataset.reviewId));
    });
  };
  const filterReviews = () => {
    const searchValue = document.getElementById("reviewSearch").value.trim().toLowerCase();
    const selectedBranch = document.getElementById("branchFilter").value;
    const selectedStatus = document.getElementById("statusFilter").value;
    filteredReviews = reviewHistory.filter(review => {
      const searchableText = `
                    ${WusoolUI.escape(review.reference)}
                    ${WusoolUI.escape(review.branchName)}
                    ${WusoolUI.escape(review.city)}
                `.toLowerCase();
      const matchesSearch = searchableText.includes(searchValue);
      const matchesBranch = selectedBranch === "all" || review.branchName === selectedBranch;
      const matchesStatus = selectedStatus === "all" || review.status === selectedStatus;
      return matchesSearch && matchesBranch && matchesStatus;
    });
    renderReviews();
  };
  const clearFilters = () => {
    document.getElementById("reviewSearch").value = "";
    document.getElementById("branchFilter").value = "all";
    document.getElementById("statusFilter").value = "all";
    filteredReviews = [...reviewHistory];
    renderReviews();
  };
  const renderPage = () => {
    renderStatistics();
    renderReviews();
  };
  const renderStatistics = () => {
    setTextContent("totalReviews", reviewHistory.length);
    setTextContent("approvedReviews", countReviewsByStatus("approved"));
    setTextContent("pendingReviews", countReviewsByStatus("pending"));
    setTextContent("changesReviews", countReviewsByStatus("changes-required"));
  };
  const countReviewsByStatus = status => {
    return reviewHistory.filter(review => {
      return review.status === status;
    }).length;
  };
  const renderReviews = () => {
    const tableBody = document.getElementById("reviewsTableBody");
    const emptyState = document.getElementById("emptyState");
    const tableCard = document.querySelector(".reviews-table-card");
    WusoolUI.html(tableBody, "");
    setTextContent("resultsText", `Showing ${filteredReviews.length} ${filteredReviews.length === 1 ? "review" : "reviews"}`);
    if (filteredReviews.length === 0) {
      tableCard.classList.add("d-none");
      emptyState.classList.remove("d-none");
      return;
    }
    tableCard.classList.remove("d-none");
    emptyState.classList.add("d-none");
    filteredReviews.forEach(review => {
      WusoolUI.insertHTML(tableBody, "beforeend", createReviewRow(review));
    });
  };
  const createReviewRow = review => {
    const statusInformation = getStatusInformation(review.status);
    const score = typeof review.score === "number" ? `${WusoolUI.escape(review.score)}%` : "—";
    return `
        <tr>
            <td>
                <strong>
                    ${escapeHtml(review.reference)}
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
                    class="review-status ${WusoolUI.escape(review.status)}"
                >
                    <i class="bi ${statusInformation.icon}"></i>
                    ${statusInformation.label}
                </span>
            </td>

            <td>
                ${review.reviewedAt ? formatDateTime(review.reviewedAt) : "Not reviewed"}
            </td>

            <td class="text-end">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-wusool"
                    data-review-id="${WusoolUI.escape(review.id)}"
                >
                    View Details
                </button>
            </td>
        </tr>
    `;
  };
  const openReviewDetails = reviewId => {
    const selectedReview = reviewHistory.find(review => {
      return review.id === reviewId;
    });
    if (!selectedReview) {
      return;
    }
    const statusInformation = getStatusInformation(selectedReview.status);
    setTextContent("modalReviewReference", selectedReview.reference);
    setTextContent("modalBranchName", selectedReview.branchName);
    setTextContent("modalBranchCity", selectedReview.city);
    setTextContent("modalSubmittedDate", formatDateTime(selectedReview.submittedAt));
    setTextContent("modalReviewedDate", selectedReview.reviewedAt ? formatDateTime(selectedReview.reviewedAt) : "Not reviewed");
    const scoreValue = typeof selectedReview.score === "number" ? `${selectedReview.score}%` : "—";
    setTextContent("modalScore", scoreValue);
    setTextContent("modalScoreLabel", getScoreLabel(selectedReview.score));
    const statusElement = document.getElementById("modalReviewStatus");
    statusElement.className = `review-status ${selectedReview.status}`;
    WusoolUI.html(statusElement, `
        <i class="bi ${statusInformation.icon}"></i>
        ${statusInformation.label}
    `);
    renderFeedback(selectedReview.feedback);
    document.getElementById("openReviewStatusLink").href = `./branch-review-status.html?id=${encodeURIComponent(selectedReview.branchId)}`;
    reviewDetailsModal.show();
  };
  const renderFeedback = feedbackItems => {
    const feedbackList = document.getElementById("modalFeedbackList");
    WusoolUI.html(feedbackList, "");
    feedbackItems.forEach(feedbackItem => {
      const listItem = document.createElement("li");
      WusoolUI.html(listItem, `
                <i class="bi bi-check-circle"></i>

                <span>
                    ${escapeHtml(feedbackItem)}
                </span>
            `);
      feedbackList.appendChild(listItem);
    });
  };
  const getStatusInformation = status => {
    const statuses = {
      approved: {
        label: "Approved",
        icon: "bi-check-circle-fill"
      },
      pending: {
        label: "Pending",
        icon: "bi-hourglass-split"
      },
      "changes-required": {
        label: "Changes Required",
        icon: "bi-pencil-square"
      },
      rejected: {
        label: "Rejected",
        icon: "bi-x-circle-fill"
      }
    };
    return statuses[status] || statuses.pending;
  };
  const getScoreLabel = score => {
    if (typeof score !== "number") {
      return "Not available";
    }
    if (score >= 85) {
      return "Excellent Accessibility";
    }
    if (score >= 70) {
      return "Good Accessibility";
    }
    return "Needs Improvement";
  };
  const formatDateTime = dateValue => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(dateValue));
  };
  const setTextContent = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value || "—";
    }
  };
  const escapeHtml = value => {
    const temporaryElement = document.createElement("div");
    temporaryElement.textContent = String(value || "");
    return temporaryElement.innerHTML;
  };
});
