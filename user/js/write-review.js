"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const visitsKey = "wusool-visits";
    const reviewsKey = "wusool-user-reviews";

    const reviewContent =
        document.getElementById("reviewContent");

    const missingVisit =
        document.getElementById("missingVisit");

    const reviewSuccess =
        document.getElementById("reviewSuccess");

    const reviewForm =
        document.getElementById("reviewForm");

    const ratingButtons =
        document.querySelectorAll(".rating-star");

    const overallRating =
        document.getElementById("overallRating");

    const ratingMessage =
        document.getElementById("ratingMessage");

    const reviewComment =
        document.getElementById("reviewComment");

    const commentCounter =
        document.getElementById("commentCounter");

    const reviewPhoto =
        document.getElementById("reviewPhoto");

    const photoPreviewContainer =
        document.getElementById(
            "photoPreviewContainer"
        );

    const photoPreview =
        document.getElementById("photoPreview");

    const photoName =
        document.getElementById("photoName");

    const removePhotoButton =
        document.getElementById(
            "removePhotoButton"
        );

    const photoError =
        document.getElementById("photoError");

    const formStatus =
        document.getElementById("formStatus");

    const navbarUserName =
        document.getElementById(
            "navbarUserName"
        );

    let selectedRating = 0;
    let selectedPhoto = null;
    let existingPhoto = null;
    let selectedVisit = null;

    navbarUserName.textContent =
        localStorage.getItem(
            "wusool-user-name"
        ) || "User";

    const getVisitId = () => {
        const parameters =
            new URLSearchParams(
                window.location.search
            );

        return Number(
            parameters.get("visitId")
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

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Not available";
        }

        return new Intl.DateTimeFormat(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(
            new Date(
                `${dateValue}T00:00:00`
            )
        );
    };

    const findSelectedVisit = () => {
        const visitId = getVisitId();

        selectedVisit =
            getVisits().find((visit) => {
                return visit.id === visitId;
            });

        if (
            !selectedVisit ||
            selectedVisit.status !== "Completed"
        ) {
            showMissingVisit();
            return;
        }

        renderVisit(selectedVisit);
        loadExistingReview(selectedVisit.id);
    };

    const showMissingVisit = () => {
        reviewContent.classList.add(
            "d-none"
        );

        missingVisit.classList.remove(
            "d-none"
        );
    };

    const renderVisit = (visit) => {
        document.getElementById(
            "placeName"
        ).textContent =
            visit.placeName ||
            "Place Name";

        document.getElementById(
            "branchName"
        ).textContent =
            visit.branch ||
            "Not available";

        document.getElementById(
            "visitDestination"
        ).textContent =
            visit.destination ||
            "Not available";

        document.getElementById(
            "visitDate"
        ).textContent =
            formatDate(visit.date);

        document.getElementById(
            "visitDetailsLink"
        ).href =
            `./visit-details.html?id=${visit.id}`;

        document.getElementById(
            "cancelReviewLink"
        ).href =
            `./visit-details.html?id=${visit.id}`;

        document.getElementById(
            "successVisitLink"
        ).href =
            `./visit-details.html?id=${visit.id}`;

        document.title =
            `Review ${visit.placeName} | Wusool`;
    };

    const selectRating = (rating) => {
        selectedRating = rating;

        overallRating.value =
            String(rating);

        ratingButtons.forEach(
            (button) => {
                const buttonRating =
                    Number(
                        button.dataset.rating
                    );

                button.classList.toggle(
                    "is-selected",
                    buttonRating <= rating
                );

                button.setAttribute(
                    "aria-pressed",
                    buttonRating === rating
                );
            }
        );

        const ratingLabels = {
            1: "Poor",
            2: "Fair",
            3: "Good",
            4: "Very Good",
            5: "Excellent"
        };

        ratingMessage.textContent =
            `${rating} out of 5 — ${ratingLabels[rating]}`;
    };

    ratingButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                selectRating(
                    Number(
                        button.dataset.rating
                    )
                );
            }
        );
    });

    reviewComment.addEventListener(
        "input",
        () => {
            commentCounter.textContent =
                `${reviewComment.value.length} / 500`;
        }
    );

    reviewPhoto.addEventListener(
        "change",
        () => {
            const photo =
                reviewPhoto.files[0];

            validatePhoto(photo);
        }
    );

    const validatePhoto = (photo) => {
        clearPhotoError();

        if (!photo) {
            return;
        }

        const acceptedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        const maximumSize =
            8 * 1024 * 1024;

        if (
            !acceptedTypes.includes(
                photo.type
            )
        ) {
            showPhotoError(
                "Select a JPG, PNG, or WEBP image."
            );

            reviewPhoto.value = "";
            return;
        }

        if (photo.size > maximumSize) {
            showPhotoError(
                "The selected image must be smaller than 8 MB."
            );

            reviewPhoto.value = "";
            return;
        }

        selectedPhoto = photo;

        const photoReader =
            new FileReader();

        photoReader.addEventListener(
            "load",
            (event) => {
                photoPreview.src =
                    event.target.result;

                photoName.textContent =
                    photo.name;

                photoPreviewContainer.classList.remove(
                    "d-none"
                );
            }
        );

        photoReader.readAsDataURL(
            photo
        );
    };

    removePhotoButton.addEventListener(
        "click",
        () => {
        selectedPhoto = null;
        existingPhoto = null;
            reviewPhoto.value = "";
            photoPreview.src = "";
            photoName.textContent = "";

            photoPreviewContainer.classList.add(
                "d-none"
            );

            clearPhotoError();
        }
    );

    const showPhotoError = (message) => {
        photoError.textContent = message;

        photoError.classList.remove(
            "d-none"
        );
    };

    const clearPhotoError = () => {
        photoError.textContent = "";

        photoError.classList.add(
            "d-none"
        );
    };

    const getSelectedFeatures = () => {
        return Array.from(
            document.querySelectorAll(
                'input[name="features"]:checked'
            )
        ).map((input) => {
            return input.value;
        });
    };

    const getSelectedRecommendation = () => {
        const selectedOption =
            document.querySelector(
                'input[name="recommendPlace"]:checked'
            );

        return selectedOption
            ? selectedOption.value
            : "";
    };

    const createReview = () => {
        return {
            id: Date.now(),

            visitId:
                selectedVisit.id,

            placeId:
                selectedVisit.placeId,

            placeName:
                selectedVisit.placeName,

            branch:
                selectedVisit.branch,

            rating:
                selectedRating,

            title:
                document.getElementById(
                    "reviewTitle"
                ).value.trim(),

            comment:
                reviewComment.value.trim(),

            informationAccuracy:
                document.getElementById(
                    "informationAccuracy"
                ).value,

            accessibilityFeatures:
                getSelectedFeatures(),

            recommended:
                getSelectedRecommendation(),

            photo:
                selectedPhoto
                    ? {
                        name:
                            selectedPhoto.name,

                        size:
                            selectedPhoto.size,

                        type:
                            selectedPhoto.type
                    }
                    : existingPhoto,

            status:
                "Published",

            createdAt:
                new Date().toISOString()
        };
    };

    const updateVisitReviewStatus = (
        visitId
    ) => {
        const updatedVisits =
            getVisits().map((visit) => {
                if (visit.id === visitId) {
                    return {
                        ...visit,
                        reviewed: true
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

    const saveReview = (review) => {
        const reviews =
            getReviews();

        const existingReviewIndex =
            reviews.findIndex(
                (savedReview) => {
                    return (
                        savedReview.visitId ===
                        review.visitId
                    );
                }
            );

        if (existingReviewIndex >= 0) {
            review.id =
                reviews[
                    existingReviewIndex
                ].id;

            review.createdAt =
                reviews[
                    existingReviewIndex
                ].createdAt;

            review.updatedAt =
                new Date().toISOString();

            reviews[
                existingReviewIndex
            ] = review;
        } else {
            reviews.push(review);
        }

        localStorage.setItem(
            reviewsKey,
            JSON.stringify(reviews)
        );

        updateVisitReviewStatus(
            review.visitId
        );
    };

    const loadExistingReview = (
        visitId
    ) => {
        const existingReview =
            getReviews().find(
                (review) => {
                    return (
                        review.visitId ===
                        visitId
                    );
                }
            );

        if (!existingReview) {
            return;
        }

        existingPhoto =
            existingReview.photo || null;

        selectRating(
            existingReview.rating
        );

        document.getElementById(
            "reviewTitle"
        ).value =
            existingReview.title || "";

        reviewComment.value =
            existingReview.comment || "";

        commentCounter.textContent =
            `${reviewComment.value.length} / 500`;

        document.getElementById(
            "informationAccuracy"
        ).value =
            existingReview
                .informationAccuracy || "";

        document
            .querySelectorAll(
                'input[name="features"]'
            )
            .forEach((input) => {
                input.checked =
                    existingReview
                        .accessibilityFeatures
                        ?.includes(
                            input.value
                        ) || false;
            });

        const recommendationInput =
            document.querySelector(
                `input[name="recommendPlace"][value="${existingReview.recommended}"]`
            );

        if (recommendationInput) {
            recommendationInput.checked =
                true;
        }

        const submitButton =
            reviewForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            Update Review
        `;
    };

    reviewForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            formStatus.classList.add(
                "d-none"
            );

            if (selectedRating === 0) {
                formStatus.textContent =
                    "Select an overall rating.";

                formStatus.classList.remove(
                    "d-none"
                );

                ratingButtons[0].focus();
                return;
            }

            if (
                !reviewForm.checkValidity()
            ) {
                reviewForm.classList.add(
                    "was-validated"
                );

                formStatus.textContent =
                    "Complete the required review information.";

                formStatus.classList.remove(
                    "d-none"
                );

                return;
            }

            const review =
                createReview();

            saveReview(review);

            reviewContent.classList.add(
                "d-none"
            );

            reviewSuccess.classList.remove(
                "d-none"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );

    findSelectedVisit();
});
