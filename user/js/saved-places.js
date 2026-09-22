"use strict";

const savedPlaces = [
  {
    id: 1,
    name: "Amman City Hall",
    category: "Government",
    city: "Amman",
    score: 92,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    features: [
      "Step-free entrance",
      "Accessible parking",
      "Elevator",
    ],
  },
  {
    id: 2,
    name: "Al Noor Medical Center",
    category: "Medical",
    city: "Amman",
    score: 88,
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
    features: [
      "Accessible entrance",
      "Wide reception",
      "Elevator",
    ],
  },
  {
    id: 3,
    name: "Community Hub",
    category: "Community",
    city: "Amman",
    score: 86,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    features: [
      "Wide pathways",
      "Staff assistance",
      "Clear signs",
    ],
  },
  {
    id: 4,
    name: "Jordan National Bank",
    category: "Bank",
    city: "Amman",
    score: 90,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    features: [
      "Entrance ramp",
      "Accessible counter",
      "Reserved parking",
    ],
  },
  {
    id: 5,
    name: "Knowledge Center",
    category: "Education",
    city: "Irbid",
    score: 84,
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80",
    features: [
      "Elevator",
      "Accessible restroom",
      "Wide doors",
    ],
  },
  {
    id: 6,
    name: "Public Services Center",
    category: "Government",
    city: "Zarqa",
    score: 82,
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
    features: [
      "Step-free entrance",
      "Waiting area",
      "Staff support",
    ],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const savedPlacesContainer =
    document.getElementById(
      "savedPlacesContainer",
    );

  const emptySavedPlaces =
    document.getElementById(
      "emptySavedPlaces",
    );

  const savedPlacesCount =
    document.getElementById(
      "savedPlacesCount",
    );

  const searchInput =
    document.getElementById("searchInput");

  const categoryFilter =
    document.getElementById(
      "categoryFilter",
    );

  const sortFilter =
    document.getElementById("sortFilter");

  const compareButton =
    document.getElementById(
      "compareSelectedButton",
    );

  const navbarUserName =
    document.getElementById(
      "navbarUserName",
    );

  let selectedPlaceIds = [];

  const savedUserName =
    localStorage.getItem(
      "wusool-user-name",
    ) || "User";

  navbarUserName.textContent =
    savedUserName;

  const getRemovedPlaceIds = () => {
    const savedIds =
      localStorage.getItem(
        "wusool-removed-saved-places",
      );

    if (!savedIds) {
      return [];
    }

    try {
      return JSON.parse(savedIds);
    } catch {
      return [];
    }
  };

  const saveRemovedPlaceIds = (
    removedPlaceIds,
  ) => {
    localStorage.setItem(
      "wusool-removed-saved-places",
      JSON.stringify(removedPlaceIds),
    );
  };

  const getAvailablePlaces = () => {
    const removedPlaceIds =
      getRemovedPlaceIds();

    return savedPlaces.filter((place) => {
      return !removedPlaceIds.includes(
        place.id,
      );
    });
  };

  const getScoreClass = (score) => {
    return score >= 85
      ? "score-excellent"
      : "score-good";
  };

  const createFeatures = (features) => {
    return features
      .map((feature) => {
        return `
          <span class="place-feature">
            <i class="bi bi-check-circle-fill me-1"></i>
            ${feature}
          </span>
        `;
      })
      .join("");
  };

  const createPlaceCard = (place) => {
    const column =
      document.createElement("div");

    column.className =
      "col-12 col-md-6 col-xl-4";

    column.innerHTML = `
      <article class="saved-place-card h-100">
        <div class="saved-place-image">
          <img
            src="${place.image}"
            alt="${place.name}"
          />

          <span class="saved-place-category">
            ${place.category}
          </span>

          <button
            class="remove-saved-button"
            type="button"
            data-remove-id="${place.id}"
            aria-label="Remove ${place.name} from saved places"
          >
            <i class="bi bi-bookmark-fill"></i>
          </button>
        </div>

        <div class="p-4">
          <div
            class="d-flex justify-content-between align-items-start gap-3 mb-2"
          >
            <h3 class="h5 mb-0">
              ${place.name}
            </h3>

            <span
              class="score-badge ${getScoreClass(place.score)}"
            >
              ${place.score}%
            </span>
          </div>

          <p class="text-secondary mb-3">
            <i class="bi bi-geo-alt me-1"></i>
            ${place.city}
          </p>

            
          

          <div class="compare-check mb-3">
            <div class="form-check">
              <input
                class="form-check-input compare-place-input"
                id="comparePlace${place.id}"
                type="checkbox"
                value="${place.id}"
              />

              <label
                class="form-check-label fw-semibold"
                for="comparePlace${place.id}"
              >
                Add to comparison
              </label>
            </div>
          </div>

          <div class="d-flex gap-2">
            <a
              class="btn btn-wusool flex-grow-1"
              href="./user-place-details.html?id=${place.id}"
            >
              View Details
            </a>

            <a
              class="btn btn-wusool-outline"
              href="./plan-visit.html?placeId=${place.id}"
              aria-label="Plan a visit to ${place.name}"
            >
              <i class="bi bi-calendar-plus"></i>
            </a>
          </div>
        </div>
      </article>
    `;

    return column;
  };

  const getFilteredPlaces = () => {
    const searchValue =
      searchInput.value
        .trim()
        .toLowerCase();

    const selectedCategory =
      categoryFilter.value;

    const selectedSort =
      sortFilter.value;

    const filteredPlaces =
      getAvailablePlaces().filter(
        (place) => {
          const matchesSearch =
            place.name
              .toLowerCase()
              .includes(searchValue) ||
            place.city
              .toLowerCase()
              .includes(searchValue) ||
            place.category
              .toLowerCase()
              .includes(searchValue);

          const matchesCategory =
            selectedCategory === "all" ||
            place.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        },
      );

    if (selectedSort === "score-high") {
      filteredPlaces.sort(
        (firstPlace, secondPlace) => {
          return (
            secondPlace.score -
            firstPlace.score
          );
        },
      );
    }

    if (selectedSort === "score-low") {
      filteredPlaces.sort(
        (firstPlace, secondPlace) => {
          return (
            firstPlace.score -
            secondPlace.score
          );
        },
      );
    }

    if (selectedSort === "name") {
      filteredPlaces.sort(
        (firstPlace, secondPlace) => {
          return firstPlace.name.localeCompare(
            secondPlace.name,
          );
        },
      );
    }

    return filteredPlaces;
  };

  const updateCompareButton = () => {
    compareButton.disabled =
      selectedPlaceIds.length < 2;

    compareButton.innerHTML = `
      <i class="bi bi-bar-chart me-2"></i>
      Compare Selected (${selectedPlaceIds.length})
    `;
  };

  const addCardEvents = () => {
    const removeButtons =
      document.querySelectorAll(
        "[data-remove-id]",
      );

    const compareInputs =
      document.querySelectorAll(
        ".compare-place-input",
      );

    removeButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const placeId =
            Number(
              button.dataset.removeId,
            );

          const removedPlaceIds =
            getRemovedPlaceIds();

          if (
            !removedPlaceIds.includes(
              placeId,
            )
          ) {
            removedPlaceIds.push(
              placeId,
            );
          }

          saveRemovedPlaceIds(
            removedPlaceIds,
          );

          selectedPlaceIds =
            selectedPlaceIds.filter(
              (id) => id !== placeId,
            );

          renderSavedPlaces();

          showStatusMessage(
            "Place removed from saved places.",
          );
        },
      );
    });

    compareInputs.forEach((input) => {
      input.addEventListener(
        "change",
        () => {
          const placeId =
            Number(input.value);

          if (input.checked) {
            if (
              selectedPlaceIds.length >= 3
            ) {
              input.checked = false;

              showStatusMessage(
                "You can compare up to three places.",
              );

              return;
            }

            selectedPlaceIds.push(
              placeId,
            );
          } else {
            selectedPlaceIds =
              selectedPlaceIds.filter(
                (id) => id !== placeId,
              );
          }

          updateCompareButton();
        },
      );
    });
  };

  const renderSavedPlaces = () => {
    const filteredPlaces =
      getFilteredPlaces();

    savedPlacesContainer.innerHTML = "";

    savedPlacesCount.textContent =
      getAvailablePlaces().length;

    if (filteredPlaces.length === 0) {
      emptySavedPlaces.classList.remove(
        "d-none",
      );

      return;
    }

    emptySavedPlaces.classList.add(
      "d-none",
    );

    filteredPlaces.forEach((place) => {
      savedPlacesContainer.appendChild(
        createPlaceCard(place),
      );
    });

    addCardEvents();
    updateCompareButton();
  };

  searchInput.addEventListener(
    "input",
    renderSavedPlaces,
  );

  categoryFilter.addEventListener(
    "change",
    renderSavedPlaces,
  );

  sortFilter.addEventListener(
    "change",
    renderSavedPlaces,
  );

  compareButton.addEventListener(
    "click",
    () => {
      const selectedIds =
        selectedPlaceIds.join(",");

      window.location.href =
        `./compare-places.html?ids=${selectedIds}`;
    },
  );

  renderSavedPlaces();
});