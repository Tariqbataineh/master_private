const reviews = [
    {
        id: 1,
        name: "Ahmad",
        rating: 5,
        date: "Recent visit",
        verified: true,
        text: "Clear entrance ramp and helpful staff assistance."
    },
    {
        id: 2,
        name: "Sara",
        rating: 4,
        date: "Verified visit",
        verified: true,
        text: "Accessible parking was available, but the main pathway was crowded."
    },
    {
        id: 3,
        name: "Lina",
        rating: 5,
        date: "2 weeks ago",
        verified: true,
        text: "The elevator was easy to reach and the staff provided clear directions."
    },
    {
        id: 4,
        name: "Omar",
        rating: 4,
        date: "3 weeks ago",
        verified: false,
        text: "The entrance was accessible and the doors were wide enough."
    },
    {
        id: 5,
        name: "Noor",
        rating: 3,
        date: "1 month ago",
        verified: true,
        text: "Good accessibility, but more signs are needed near the parking area."
    },
    {
        id: 6,
        name: "Yousef",
        rating: 5,
        date: "1 month ago",
        verified: true,
        text: "A comfortable visit with excellent staff support."
    }
];

let visibleReviews = 2;
let displayedReviews = [...reviews];

document.addEventListener("DOMContentLoaded", () => {
    renderReviews();
    initializeSorting();
    initializeSearch();
    initializeVoiceSearch();
});

const createStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
};

const createReviewElement = (review) => {
    const reviewElement = document.createElement("article");

    reviewElement.className = "review-item";

    reviewElement.innerHTML = `
        <div class="review-user">

            <div class="user-avatar">
                ${review.name.charAt(0)}
            </div>

            <div>
                <strong>${review.name}</strong>
                <small>${review.date}</small>
            </div>

            ${
                review.verified
                    ? `
                        <span class="verified-review">
                            <i class="bi bi-patch-check-fill"></i>
                            Verified Visit
                        </span>
                    `
                    : ""
            }

        </div>

        <div class="review-stars"
             aria-label="${review.rating} out of 5 stars">
            ${createStars(review.rating)}
        </div>

        <p>${review.text}</p>
    `;

    return reviewElement;
};

const renderReviews = () => {
    const reviewsContainer =
        document.getElementById("reviewsContainer");

    const emptyReviews =
        document.getElementById("emptyReviews");

    const loadMoreButton =
        document.getElementById("loadMoreButton");

    reviewsContainer.innerHTML = "";

    if (displayedReviews.length === 0) {
        emptyReviews.classList.remove("d-none");
        loadMoreButton.classList.add("d-none");
        return;
    }

    emptyReviews.classList.add("d-none");

    displayedReviews
        .slice(0, visibleReviews)
        .forEach((review) => {
            reviewsContainer.appendChild(
                createReviewElement(review)
            );
        });

    loadMoreButton.classList.toggle(
        "d-none",
        visibleReviews >= displayedReviews.length
    );
};

document
    .getElementById("loadMoreButton")
    .addEventListener("click", () => {
        visibleReviews += 2;
        renderReviews();
    });

const initializeSorting = () => {
    const reviewSort =
        document.getElementById("reviewSort");

    reviewSort.addEventListener("change", () => {
        const selectedSort = reviewSort.value;

        if (selectedSort === "highest") {
            displayedReviews.sort(
                (firstReview, secondReview) =>
                    secondReview.rating - firstReview.rating
            );
        } else if (selectedSort === "lowest") {
            displayedReviews.sort(
                (firstReview, secondReview) =>
                    firstReview.rating - secondReview.rating
            );
        } else {
            displayedReviews.sort(
                (firstReview, secondReview) =>
                    firstReview.id - secondReview.id
            );
        }

        visibleReviews = 2;
        renderReviews();
    });
};

const initializeSearch = () => {
    const searchForm =
        document.getElementById("reviewSearchForm");

    const searchInput =
        document.getElementById("reviewSearch");

    const cityFilter =
        document.getElementById("cityFilter");

    const typeFilter =
        document.getElementById("typeFilter");

    const searchMessage =
        document.getElementById("searchMessage");

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const searchValue =
            searchInput.value.trim();

        const city =
            cityFilter.options[cityFilter.selectedIndex].text;

        const placeType =
            typeFilter.options[typeFilter.selectedIndex].text;

        searchMessage.textContent =
            searchValue || city !== "All Cities" ||
            placeType !== "All Types"
                ? `Showing reviews for: ${
                    searchValue || "all places"
                } · ${city} · ${placeType}`
                : "Showing all community reviews.";

        searchMessage.classList.remove("d-none");

        visibleReviews = 2;
        renderReviews();
    });
};

const initializeVoiceSearch = () => {
    const voiceButton =
        document.getElementById("voiceSearchButton");

    const searchInput =
        document.getElementById("reviewSearch");

    voiceButton.addEventListener("click", () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert(
                "Voice search is not supported in this browser."
            );

            return;
        }

        const recognition =
            new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.start();

        voiceButton.innerHTML =
            '<i class="bi bi-mic-fill me-1"></i> Listening...';

        recognition.addEventListener(
            "result",
            (event) => {
                searchInput.value =
                    event.results[0][0].transcript;

                voiceButton.innerHTML =
                    '<i class="bi bi-mic me-1"></i> Voice Search';
            }
        );

        recognition.addEventListener("end", () => {
            voiceButton.innerHTML =
                '<i class="bi bi-mic me-1"></i> Voice Search';
        });
    });
};