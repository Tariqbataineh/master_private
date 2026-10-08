WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const reviews = await WusoolServices.getReviews({
    status: "Visible"
  });
  let visibleReviews = 2;
  let displayedReviews = [...reviews];
  WusoolUI.ready(() => {
    renderReviews();
    initializeSorting();
    initializeSearch();
    initializeVoiceSearch();
  });
  const createStars = rating => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };
  const createReviewElement = review => {
    const reviewElement = document.createElement("article");
    reviewElement.className = "review-item";
    WusoolUI.html(reviewElement, `
        <div class="review-user">

            <div class="user-avatar">
                ${review.name.charAt(0)}
            </div>

            <div>
                <strong>${WusoolUI.escape(review.name)}</strong>
                <small>${WusoolUI.escape(review.date)}</small>
            </div>

            ${review.verified ? `
                        <span class="verified-review">
                            <i class="bi bi-patch-check-fill"></i>
                            Verified Visit
                        </span>
                    ` : ""}

        </div>

        <div class="review-stars"
             aria-label="${WusoolUI.escape(review.rating)} out of 5 stars">
            ${createStars(review.rating)}
        </div>

        <p>${WusoolUI.escape(review.text)}</p>
    `);
    return reviewElement;
  };
  const renderReviews = () => {
    const reviewsContainer = document.getElementById("reviewsContainer");
    const emptyReviews = document.getElementById("emptyReviews");
    const loadMoreButton = document.getElementById("loadMoreButton");
    WusoolUI.html(reviewsContainer, "");
    if (displayedReviews.length === 0) {
      emptyReviews.classList.remove("d-none");
      loadMoreButton.classList.add("d-none");
      return;
    }
    emptyReviews.classList.add("d-none");
    displayedReviews.slice(0, visibleReviews).forEach(review => {
      reviewsContainer.appendChild(createReviewElement(review));
    });
    loadMoreButton.classList.toggle("d-none", visibleReviews >= displayedReviews.length);
  };
  WusoolUI.listen(document.getElementById("loadMoreButton"), "click", () => {
    visibleReviews += 2;
    renderReviews();
  });
  const initializeSorting = () => {
    const reviewSort = document.getElementById("reviewSort");
    WusoolUI.listen(reviewSort, "change", () => {
      const selectedSort = reviewSort.value;
      if (selectedSort === "highest") {
        displayedReviews.sort((firstReview, secondReview) => secondReview.rating - firstReview.rating);
      } else if (selectedSort === "lowest") {
        displayedReviews.sort((firstReview, secondReview) => firstReview.rating - secondReview.rating);
      } else {
        displayedReviews.sort((firstReview, secondReview) => firstReview.id - secondReview.id);
      }
      visibleReviews = 2;
      renderReviews();
    });
  };
  const initializeSearch = () => {
    const searchForm = document.getElementById("reviewSearchForm");
    const searchInput = document.getElementById("reviewSearch");
    const cityFilter = document.getElementById("cityFilter");
    const typeFilter = document.getElementById("typeFilter");
    const searchMessage = document.getElementById("searchMessage");
    WusoolUI.listen(searchForm, "submit", event => {
      event.preventDefault();
      const searchValue = searchInput.value.trim();
      const city = cityFilter.options[cityFilter.selectedIndex].text;
      const placeType = typeFilter.options[typeFilter.selectedIndex].text;
      searchMessage.textContent = searchValue || city !== "All Cities" || placeType !== "All Types" ? `Showing reviews for: ${searchValue || "all places"} · ${city} · ${placeType}` : "Showing all community reviews.";
      searchMessage.classList.remove("d-none");
      visibleReviews = 2;
      renderReviews();
    });
  };
  const initializeVoiceSearch = () => {
    const voiceButton = document.getElementById("voiceSearchButton");
    const searchInput = document.getElementById("reviewSearch");
    WusoolUI.listen(voiceButton, "click", () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Voice search is not supported in this browser.");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.start();
      WusoolUI.html(voiceButton, '<i class="bi bi-mic-fill me-1"></i> Listening...');
      WusoolUI.listen(recognition, "result", event => {
        searchInput.value = event.results[0][0].transcript;
        WusoolUI.html(voiceButton, '<i class="bi bi-mic me-1"></i> Voice Search');
      });
      WusoolUI.listen(recognition, "end", () => {
        WusoolUI.html(voiceButton, '<i class="bi bi-mic me-1"></i> Voice Search');
      });
    });
  };
});
