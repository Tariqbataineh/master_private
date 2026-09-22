"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const reviewsKey =
        "wusool-user-reviews";

    const visitsKey =
        "wusool-visits";

    const reviewsContainer =
        document.getElementById(
            "reviewsContainer"
        );

    const emptyReviews =
        document.getElementById(
            "emptyReviews"
        );

    const emptyTitle =
        document.getElementById(
            "emptyTitle"
        );

    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );

    const reviewSearch =
        document.getElementById(
            "reviewSearch"
        );

    const ratingFilter =
        document.getElementById(
            "ratingFilter"
        );

    const reviewSort =
        document.getElementById(
            "reviewSort"
        );

    const totalReviews =
        document.getElementById(
            "totalReviews"
        );

    const averageRating =
        document.getElementById(
            "averageRating"
        );

    const recommendedCount =
        document.getElementById(
            "recommendedCount"
        );

    const confirmDeleteReview =
        document.getElementById(
            "confirmDeleteReview"
        );

    const deleteModalElement =
        document.getElementById(
            "deleteReviewModal"
        );

    const navbarUserName =
        document.getElementById(
            "navbarUserName"
        );

    const deleteModal =
        new bootstrap.Modal(
            deleteModalElement
        );

    let selectedReviewId = null;

    navbarUserName.textContent =
        localStorage.getItem(
            "wusool-user-name"
        ) || "User";

    const getReviews = () => {
        try {
            return JSON.parse(
                localStorage.getItem(
                    reviewsKey
                )
            ) || [];
        } catch {
            return [];
        }
    };

    const saveReviews = (reviews) => {
        localStorage.setItem(
            reviewsKey,
            JSON.stringify(reviews)
        );
    };

    const getVisits = () => {
        try {
            return JSON.parse(
                localStorage.getItem(
                    visitsKey
                )
            ) || [];
        } catch {
            return [];
        }
    };

    const escapeHtml = (value) => {
        const temporaryElement =
            document.createElement("div");

        temporaryElement.textContent =
            String(value || "");

        return temporaryElement.innerHTML;
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Not available";
        }

        return new Intl.DateTimeFormat(
            "en-US",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(
            new Date(dateValue)
        );
    };

    const createStars = (rating) => {
        let stars = "";

        for (
            let index = 1;
            index <= 5;
            index += 1
        ) {
            if (index <= rating) {
                stars += `
                    <i
                        class="bi bi-star-fill"
                        aria-hidden="true"
                    ></i>
                `;
            } else {
                stars += `
                    <i
                        class="bi bi-star-fill empty-star"
                        aria-hidden="true"
                    ></i>
                `;
            }
        }

        return stars;
    };

    const createFeatureTags = (
        features
    ) => {
        if (
            !features ||
            features.length === 0
        ) {
            return `
                <span class="text-secondary small">
                    No accessibility features selected
                </span>
            `;
        }

        return features
            .map((feature) => {
                return `
                    <span class="review-feature">
                        <i class="bi bi-check-circle-fill me-1"></i>
                        ${escapeHtml(feature)}
                    </span>
                `;
            })
            .join("");
    };

    const createReviewCard = (
        review
    ) => {
        const column =
            document.createElement("div");

        column.className =
            "col-12 col-lg-6";

        const recommendation =
            review.recommended === "Yes"
                ? `
                    <span
                        class="badge recommendation-badge"
                    >
                        <i class="bi bi-hand-thumbs-up me-1"></i>
                        Recommended
                    </span>
                `
                : `
                    <span class="badge text-bg-light">
                        Not Recommended
                    </span>
                `;

        column.innerHTML = `
            <article
                class="review-card p-4 h-100
                       d-flex flex-column"
            >

                <header
                    class="d-flex justify-content-between
                           align-items-start gap-3 mb-3"
                >

                    <div>

                        <span class="section-label">
                            ${escapeHtml(
                                review.branch
                            )}
                        </span>

                        <h2 class="h4 fw-bold mt-2 mb-1">
                            ${escapeHtml(
                                review.placeName
                            )}
                        </h2>

                        <p class="small text-secondary mb-0">
                            Reviewed on
                            ${formatDate(
                                review.createdAt
                            )}
                        </p>

                    </div>

                    ${recommendation}

                </header>

                <div
                    class="review-stars d-flex gap-1 mb-3"
                    aria-label="${review.rating} out of 5 stars"
                >
                    ${createStars(
                        review.rating
                    )}
                </div>

                <h3 class="h5 fw-bold">
                    ${escapeHtml(
                        review.title
                    )}
                </h3>

                <p class="text-secondary">
                    ${escapeHtml(
                        review.comment
                    )}
                </p>

                <div class="d-flex flex-wrap gap-2 mb-4">
                    ${createFeatureTags(
                        review.accessibilityFeatures
                    )}
                </div>

                <dl class="row small mt-auto mb-4">

                    <dt class="col-6 text-secondary">
                        Information
                    </dt>

                    <dd class="col-6 text-end fw-semibold">
                        ${escapeHtml(
                            review.informationAccuracy
                        )}
                    </dd>

                    <dt class="col-6 text-secondary">
                        Status
                    </dt>

                    <dd class="col-6 text-end mb-0">
                        <span class="badge text-bg-success">
                            ${escapeHtml(
                                review.status
                            )}
                        </span>
                    </dd>

                </dl>

                <footer
                    class="d-flex flex-column
                           flex-sm-row gap-2"
                >

                    <a
                        class="btn btn-wusool flex-grow-1"
                        href="./write-review.html?visitId=${review.visitId}"
                    >
                        <i class="bi bi-pencil me-1"></i>
                        Edit Review
                    </a>

                    <a
                        class="btn btn-wusool-outline"
                        href="../../visitor/html/place-details.html?id=${review.placeId}"
                    >
                        View Place
                    </a>

                    <button
                        class="btn btn-outline-danger"
                        type="button"
                        data-delete-review="${review.id}"
                        aria-label="Delete review for ${escapeHtml(
                            review.placeName
                        )}"
                    >
                        <i class="bi bi-trash"></i>
                    </button>

                </footer>

            </article>
        `;

        return column;
    };

    const updateStatistics = (
        reviews
    ) => {
        totalReviews.textContent =
            reviews.length;

        if (reviews.length === 0) {
            averageRating.textContent =
                "0.0";

            recommendedCount.textContent =
                "0";

            return;
        }

        const totalRating =
            reviews.reduce(
                (
                    currentTotal,
                    review
                ) => {
                    return (
                        currentTotal +
                        Number(
                            review.rating
                        )
                    );
                },
                0
            );

        const average =
            totalRating /
            reviews.length;

        averageRating.textContent =
            average.toFixed(1);

        recommendedCount.textContent =
            reviews.filter(
                (review) => {
                    return (
                        review.recommended ===
                        "Yes"
                    );
                }
            ).length;
    };

    const filterReviews = (
        reviews
    ) => {
        const searchValue =
            reviewSearch.value
                .trim()
                .toLowerCase();

        const selectedRating =
            ratingFilter.value;

        return reviews.filter(
            (review) => {
                const searchableText = [
                    review.placeName,
                    review.branch,
                    review.title,
                    review.comment
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    searchableText.includes(
                        searchValue
                    );

                const matchesRating =
                    selectedRating === "all" ||
                    Number(
                        selectedRating
                    ) ===
                        Number(
                            review.rating
                        );

                return (
                    matchesSearch &&
                    matchesRating
                );
            }
        );
    };

    const sortReviews = (
        reviews
    ) => {
        const sortValue =
            reviewSort.value;

        const sortedReviews =
            [...reviews];

        if (sortValue === "oldest") {
            sortedReviews.sort(
                (
                    firstReview,
                    secondReview
                ) => {
                    return (
                        new Date(
                            firstReview.createdAt
                        ) -
                        new Date(
                            secondReview.createdAt
                        )
                    );
                }
            );
        }

        if (sortValue === "highest") {
            sortedReviews.sort(
                (
                    firstReview,
                    secondReview
                ) => {
                    return (
                        secondReview.rating -
                        firstReview.rating
                    );
                }
            );
        }

        if (sortValue === "lowest") {
            sortedReviews.sort(
                (
                    firstReview,
                    secondReview
                ) => {
                    return (
                        firstReview.rating -
                        secondReview.rating
                    );
                }
            );
        }

        if (sortValue === "newest") {
            sortedReviews.sort(
                (
                    firstReview,
                    secondReview
                ) => {
                    return (
                        new Date(
                            secondReview.createdAt
                        ) -
                        new Date(
                            firstReview.createdAt
                        )
                    );
                }
            );
        }

        return sortedReviews;
    };

    const renderReviews = () => {
        const allReviews =
            getReviews();

        updateStatistics(
            allReviews
        );

        const filteredReviews =
            filterReviews(
                allReviews
            );

        const sortedReviews =
            sortReviews(
                filteredReviews
            );

        reviewsContainer.innerHTML =
            "";

        if (
            sortedReviews.length === 0
        ) {
            emptyReviews.classList.remove(
                "d-none"
            );

            if (allReviews.length > 0) {
                emptyTitle.textContent =
                    "No Matching Reviews";

                emptyMessage.textContent =
                    "Try changing your search or rating filter.";
            } else {
                emptyTitle.textContent =
                    "No Reviews Yet";

                emptyMessage.textContent =
                    "Complete a visit and share your accessibility experience.";
            }

            return;
        }

        emptyReviews.classList.add(
            "d-none"
        );

        sortedReviews.forEach(
            (review) => {
                reviewsContainer.appendChild(
                    createReviewCard(
                        review
                    )
                );
            }
        );

        addDeleteEvents();
    };

    const addDeleteEvents = () => {
        const deleteButtons =
            document.querySelectorAll(
                "[data-delete-review]"
            );

        deleteButtons.forEach(
            (button) => {
                button.addEventListener(
                    "click",
                    () => {
                        selectedReviewId =
                            Number(
                                button.dataset
                                    .deleteReview
                            );

                        deleteModal.show();
                    }
                );
            }
        );
    };

    const updateVisitStatus = (
        visitId
    ) => {
        const visits =
            getVisits();

        const updatedVisits =
            visits.map((visit) => {
                if (
                    visit.id === visitId
                ) {
                    return {
                        ...visit,
                        reviewed: false
                    };
                }

                return visit;
            });

        localStorage.setItem(
            visitsKey,
            JSON.stringify(
                updatedVisits
            )
        );
    };

    confirmDeleteReview.addEventListener(
        "click",
        () => {
            const reviews =
                getReviews();

            const selectedReview =
                reviews.find(
                    (review) => {
                        return (
                            review.id ===
                            selectedReviewId
                        );
                    }
                );

            const updatedReviews =
                reviews.filter(
                    (review) => {
                        return (
                            review.id !==
                            selectedReviewId
                        );
                    }
                );

            saveReviews(
                updatedReviews
            );

            if (selectedReview) {
                updateVisitStatus(
                    selectedReview.visitId
                );
            }

            selectedReviewId = null;

            deleteModal.hide();

            renderReviews();
        }
    );

    reviewSearch.addEventListener(
        "input",
        renderReviews
    );

    ratingFilter.addEventListener(
        "change",
        renderReviews
    );

    reviewSort.addEventListener(
        "change",
        renderReviews
    );

    renderReviews();
});