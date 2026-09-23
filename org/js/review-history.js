"use strict";

const reviewHistoryStorageKey =
    "wusoolBranchReviewHistory";

let reviewHistory = [];
let filteredReviews = [];
let reviewDetailsModal = null;

document.addEventListener("DOMContentLoaded", () => {
    initializeModal();
    loadReviewHistory();
    populateBranchFilter();
    configureFilters();
    configureReviewActions();
    renderPage();
});

const defaultReviewHistory = [
    {
        id: 1,
        reference: "REV-2026-001",
        branchId: 1,
        branchName: "Main Branch",
        city: "Amman",
        submittedAt: "2026-09-15T09:30:00",
        reviewedAt: "2026-09-17T14:20:00",
        score: 92,
        status: "approved",
        feedback: [
            "Accessible entrance was verified.",
            "Elevator and accessible parking were confirmed.",
            "Branch accessibility information is complete."
        ]
    },
    {
        id: 2,
        reference: "REV-2026-002",
        branchId: 2,
        branchName: "North Branch",
        city: "Irbid",
        submittedAt: "2026-09-18T11:00:00",
        reviewedAt: "2026-09-20T10:15:00",
        score: 74,
        status: "changes-required",
        feedback: [
            "Upload a clearer photo of the main entrance.",
            "Add accessible parking information.",
            "Confirm the width of the internal pathways."
        ]
    },
    {
        id: 3,
        reference: "REV-2026-003",
        branchId: 3,
        branchName: "Zarqa Branch",
        city: "Zarqa",
        submittedAt: "2026-09-22T13:45:00",
        reviewedAt: null,
        score: null,
        status: "pending",
        feedback: [
            "The submission is waiting for reviewer assessment."
        ]
    },
    {
        id: 4,
        reference: "REV-2026-004",
        branchId: 1,
        branchName: "Main Branch",
        city: "Amman",
        submittedAt: "2026-08-30T08:20:00",
        reviewedAt: "2026-09-01T12:40:00",
        score: 81,
        status: "changes-required",
        feedback: [
            "Additional elevator photos were requested.",
            "Accessible restroom information was incomplete."
        ]
    },
    {
        id: 5,
        reference: "REV-2026-005",
        branchId: 4,
        branchName: "Airport Branch",
        city: "Amman",
        submittedAt: "2026-08-25T10:00:00",
        reviewedAt: "2026-08-27T15:30:00",
        score: 48,
        status: "rejected",
        feedback: [
            "Required entrance photos were missing.",
            "The submitted location did not match the branch address.",
            "Submit a new review after completing branch information."
        ]
    }
];

const initializeModal = () => {
    const modalElement =
        document.getElementById(
            "reviewDetailsModal"
        );

    reviewDetailsModal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );
};

const loadReviewHistory = () => {
    const storedReviews =
        localStorage.getItem(
            reviewHistoryStorageKey
        );

    if (!storedReviews) {
        reviewHistory = [
            ...defaultReviewHistory
        ];

        saveReviewHistory();
    } else {
        try {
            reviewHistory =
                JSON.parse(storedReviews);
        } catch (error) {
            console.error(
                "Unable to load review history:",
                error
            );

            reviewHistory = [
                ...defaultReviewHistory
            ];
        }
    }

    reviewHistory.sort(
        (firstReview, secondReview) => {
            return (
                new Date(
                    secondReview.submittedAt
                ) -
                new Date(
                    firstReview.submittedAt
                )
            );
        }
    );

    filteredReviews = [
        ...reviewHistory
    ];
};

const saveReviewHistory = () => {
    localStorage.setItem(
        reviewHistoryStorageKey,
        JSON.stringify(reviewHistory)
    );
};

const populateBranchFilter = () => {
    const branchFilter =
        document.getElementById(
            "branchFilter"
        );

    const branchNames = [
        ...new Set(
            reviewHistory.map(
                (review) => {
                    return review.branchName;
                }
            )
        )
    ];

    branchNames.forEach(
        (branchName) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value = branchName;
            option.textContent =
                branchName;

            branchFilter.appendChild(
                option
            );
        }
    );
};

const configureFilters = () => {
    document.getElementById(
        "reviewSearch"
    ).addEventListener(
        "input",
        filterReviews
    );

    document.getElementById(
        "branchFilter"
    ).addEventListener(
        "change",
        filterReviews
    );

    document.getElementById(
        "statusFilter"
    ).addEventListener(
        "change",
        filterReviews
    );

    document.getElementById(
        "clearFiltersButton"
    ).addEventListener(
        "click",
        clearFilters
    );

    document.getElementById(
        "emptyClearButton"
    ).addEventListener(
        "click",
        clearFilters
    );
};

const configureReviewActions = () => {
    document.addEventListener(
        "click",
        (event) => {
            const reviewButton =
                event.target.closest(
                    "[data-review-id]"
                );

            if (!reviewButton) {
                return;
            }

            openReviewDetails(
                Number(
                    reviewButton.dataset
                        .reviewId
                )
            );
        }
    );
};

const filterReviews = () => {
    const searchValue =
        document
            .getElementById(
                "reviewSearch"
            )
            .value
            .trim()
            .toLowerCase();

    const selectedBranch =
        document.getElementById(
            "branchFilter"
        ).value;

    const selectedStatus =
        document.getElementById(
            "statusFilter"
        ).value;

    filteredReviews =
        reviewHistory.filter(
            (review) => {
                const searchableText = `
                    ${review.reference}
                    ${review.branchName}
                    ${review.city}
                `.toLowerCase();

                const matchesSearch =
                    searchableText.includes(
                        searchValue
                    );

                const matchesBranch =
                    selectedBranch === "all" ||
                    review.branchName ===
                        selectedBranch;

                const matchesStatus =
                    selectedStatus === "all" ||
                    review.status ===
                        selectedStatus;

                return (
                    matchesSearch &&
                    matchesBranch &&
                    matchesStatus
                );
            }
        );

    renderReviews();
};

const clearFilters = () => {
    document.getElementById(
        "reviewSearch"
    ).value = "";

    document.getElementById(
        "branchFilter"
    ).value = "all";

    document.getElementById(
        "statusFilter"
    ).value = "all";

    filteredReviews = [
        ...reviewHistory
    ];

    renderReviews();
};

const renderPage = () => {
    renderStatistics();
    renderReviews();
};

const renderStatistics = () => {
    setTextContent(
        "totalReviews",
        reviewHistory.length
    );

    setTextContent(
        "approvedReviews",
        countReviewsByStatus(
            "approved"
        )
    );

    setTextContent(
        "pendingReviews",
        countReviewsByStatus(
            "pending"
        )
    );

    setTextContent(
        "changesReviews",
        countReviewsByStatus(
            "changes-required"
        )
    );
};

const countReviewsByStatus = (
    status
) => {
    return reviewHistory.filter(
        (review) => {
            return review.status === status;
        }
    ).length;
};

const renderReviews = () => {
    const tableBody =
        document.getElementById(
            "reviewsTableBody"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const tableCard =
        document.querySelector(
            ".reviews-table-card"
        );

    tableBody.innerHTML = "";

    setTextContent(
        "resultsText",
        `Showing ${filteredReviews.length} ${
            filteredReviews.length === 1
                ? "review"
                : "reviews"
        }`
    );

    if (filteredReviews.length === 0) {
        tableCard.classList.add(
            "d-none"
        );

        emptyState.classList.remove(
            "d-none"
        );

        return;
    }

    tableCard.classList.remove(
        "d-none"
    );

    emptyState.classList.add(
        "d-none"
    );

    filteredReviews.forEach(
        (review) => {
            tableBody.insertAdjacentHTML(
                "beforeend",
                createReviewRow(review)
            );
        }
    );
};

const createReviewRow = (
    review
) => {
    const statusInformation =
        getStatusInformation(
            review.status
        );

    const score =
        typeof review.score === "number"
            ? `${review.score}%`
            : "—";

    return `
        <tr>
            <td>
                <strong>
                    ${escapeHtml(
                        review.reference
                    )}
                </strong>
            </td>

            <td>
                <strong class="d-block">
                    ${escapeHtml(
                        review.branchName
                    )}
                </strong>

                <small class="text-secondary">
                    <i class="bi bi-geo-alt me-1"></i>
                    ${escapeHtml(
                        review.city
                    )}
                </small>
            </td>

            <td>
                ${formatDateTime(
                    review.submittedAt
                )}
            </td>

            <td>
                <span class="table-score">
                    ${score}
                </span>
            </td>

            <td>
                <span
                    class="review-status ${review.status}"
                >
                    <i class="bi ${statusInformation.icon}"></i>
                    ${statusInformation.label}
                </span>
            </td>

            <td>
                ${review.reviewedAt
                    ? formatDateTime(
                        review.reviewedAt
                    )
                    : "Not reviewed"
                }
            </td>

            <td class="text-end">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-wusool"
                    data-review-id="${review.id}"
                >
                    View Details
                </button>
            </td>
        </tr>
    `;
};

const openReviewDetails = (
    reviewId
) => {
    const selectedReview =
        reviewHistory.find(
            (review) => {
                return review.id === reviewId;
            }
        );

    if (!selectedReview) {
        return;
    }

    const statusInformation =
        getStatusInformation(
            selectedReview.status
        );

    setTextContent(
        "modalReviewReference",
        selectedReview.reference
    );

    setTextContent(
        "modalBranchName",
        selectedReview.branchName
    );

    setTextContent(
        "modalBranchCity",
        selectedReview.city
    );

    setTextContent(
        "modalSubmittedDate",
        formatDateTime(
            selectedReview.submittedAt
        )
    );

    setTextContent(
        "modalReviewedDate",
        selectedReview.reviewedAt
            ? formatDateTime(
                selectedReview.reviewedAt
            )
            : "Not reviewed"
    );

    const scoreValue =
        typeof selectedReview.score ===
        "number"
            ? `${selectedReview.score}%`
            : "—";

    setTextContent(
        "modalScore",
        scoreValue
    );

    setTextContent(
        "modalScoreLabel",
        getScoreLabel(
            selectedReview.score
        )
    );

    const statusElement =
        document.getElementById(
            "modalReviewStatus"
        );

    statusElement.className =
        `review-status ${selectedReview.status}`;

    statusElement.innerHTML = `
        <i class="bi ${statusInformation.icon}"></i>
        ${statusInformation.label}
    `;

    renderFeedback(
        selectedReview.feedback
    );

    document.getElementById(
        "openReviewStatusLink"
    ).href =
        `./branch-review-status.html?id=${encodeURIComponent(
            selectedReview.branchId
        )}`;

    reviewDetailsModal.show();
};

const renderFeedback = (
    feedbackItems
) => {
    const feedbackList =
        document.getElementById(
            "modalFeedbackList"
        );

    feedbackList.innerHTML = "";

    feedbackItems.forEach(
        (feedbackItem) => {
            const listItem =
                document.createElement(
                    "li"
                );

            listItem.innerHTML = `
                <i class="bi bi-check-circle"></i>

                <span>
                    ${escapeHtml(
                        feedbackItem
                    )}
                </span>
            `;

            feedbackList.appendChild(
                listItem
            );
        }
    );
};

const getStatusInformation = (
    status
) => {
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

    return statuses[status] ||
        statuses.pending;
};

const getScoreLabel = (
    score
) => {
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

const formatDateTime = (
    dateValue
) => {
    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(
        new Date(dateValue)
    );
};

const setTextContent = (
    elementId,
    value
) => {
    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.textContent =
            value || "—";
    }
};

const escapeHtml = (
    value
) => {
    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent =
        String(value || "");

    return temporaryElement.innerHTML;
};