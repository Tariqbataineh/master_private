"use strict";

const recommendationPlaces = [
  {
    id: 1,
    name: "Amman City Hall",
    category: "Government",
    city: "Amman",
    accessibilityScore: 92,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    supports: [
      "wheelchair",
      "limited-mobility",
      "staff-assistance",
      "avoid-stairs",
      "prefer-elevator",
      "step-free-route",
      "wide-pathways",
      "accessible-parking",
      "rest-areas",
    ],
  },
  {
    id: 2,
    name: "Al Noor Medical Center",
    category: "Medical",
    city: "Amman",
    accessibilityScore: 88,
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
    supports: [
      "wheelchair",
      "limited-mobility",
      "visual-support",
      "staff-assistance",
      "avoid-stairs",
      "prefer-elevator",
      "step-free-route",
      "wide-pathways",
      "accessible-parking",
    ],
  },
  {
    id: 3,
    name: "Community Hub",
    category: "Community",
    city: "Amman",
    accessibilityScore: 86,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    supports: [
      "limited-mobility",
      "hearing-support",
      "simple-instructions",
      "staff-assistance",
      "step-free-route",
      "wide-pathways",
      "rest-areas",
    ],
  },
  {
    id: 4,
    name: "Jordan National Bank",
    category: "Bank",
    city: "Amman",
    accessibilityScore: 90,
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    supports: [
      "wheelchair",
      "visual-support",
      "hearing-support",
      "staff-assistance",
      "avoid-stairs",
      "prefer-elevator",
      "step-free-route",
      "accessible-parking",
    ],
  },
  {
    id: 5,
    name: "Knowledge Center",
    category: "Education",
    city: "Irbid",
    accessibilityScore: 84,
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80",
    supports: [
      "wheelchair",
      "visual-support",
      "simple-instructions",
      "avoid-stairs",
      "prefer-elevator",
      "wide-pathways",
      "rest-areas",
    ],
  },
  {
    id: 6,
    name: "Public Services Center",
    category: "Government",
    city: "Zarqa",
    accessibilityScore: 82,
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
    supports: [
      "limited-mobility",
      "staff-assistance",
      "step-free-route",
      "wide-pathways",
      "rest-areas",
    ],
  },
];

const preferenceLabels = {
  wheelchair: "Wheelchair access",
  "limited-mobility": "Limited mobility support",
  "visual-support": "Visual support",
  "hearing-support": "Hearing support",
  "simple-instructions": "Simple instructions",
  "staff-assistance": "Staff assistance",
  "avoid-stairs": "Avoid stairs",
  "prefer-elevator": "Elevator available",
  "step-free-route": "Step-free route",
  "wide-pathways": "Wide pathways",
  "accessible-parking": "Accessible parking",
  "rest-areas": "Rest areas",
};

document.addEventListener("DOMContentLoaded", () => {
  const recommendationsContainer =
    document.getElementById(
      "recommendationsContainer",
    );

  const activePreferences =
    document.getElementById(
      "activePreferences",
    );

  const guidanceMethod =
    document.getElementById(
      "guidanceMethod",
    );

  const categoryFilter =
    document.getElementById(
      "categoryFilter",
    );

  const cityFilter =
    document.getElementById("cityFilter");

  const sortFilter =
    document.getElementById("sortFilter");

  const resultCount =
    document.getElementById("resultCount");

  const emptyRecommendations =
    document.getElementById(
      "emptyRecommendations",
    );

  const resetFilters =
    document.getElementById(
      "resetFilters",
    );

  const navbarUserName =
    document.getElementById(
      "navbarUserName",
    );

  navbarUserName.textContent =
    localStorage.getItem(
      "wusool-user-name",
    ) || "User";

  const defaultPreferences = {
    accessibilityNeeds: [],
    routePreferences: [
      "avoid-stairs",
      "prefer-elevator",
      "step-free-route",
      "wide-pathways",
    ],
    guidanceMethod: "both",
  };

  const getPreferences = () => {
    const savedPreferences =
      localStorage.getItem(
        "wusool-accessibility-preferences",
      );

    if (!savedPreferences) {
      return defaultPreferences;
    }

    try {
      return {
        ...defaultPreferences,
        ...JSON.parse(savedPreferences),
      };
    } catch {
      return defaultPreferences;
    }
  };

  const userPreferences =
    getPreferences();

  const getActiveRequirements = () => {
    return [
      ...userPreferences.accessibilityNeeds,
      ...userPreferences.routePreferences,
    ];
  };

  const getGuidanceLabel = () => {
    const guidanceLabels = {
      text: "Text Guidance",
      voice: "Voice Guidance",
      both: "Voice and Text",
    };

    return (
      guidanceLabels[
        userPreferences.guidanceMethod
      ] || "Voice and Text"
    );
  };

  const renderPreferenceSummary = () => {
    const requirements =
      getActiveRequirements();

    activePreferences.innerHTML = "";

    if (requirements.length === 0) {
      const emptyTag =
        document.createElement("span");

      emptyTag.className =
        "preference-tag";

      emptyTag.textContent =
        "General accessibility";

      activePreferences.appendChild(
        emptyTag,
      );
    }

    requirements.forEach(
      (requirement) => {
        const preferenceTag =
          document.createElement("span");

        preferenceTag.className =
          "preference-tag";

        preferenceTag.textContent =
          preferenceLabels[requirement] ||
          requirement;

        activePreferences.appendChild(
          preferenceTag,
        );
      },
    );

    guidanceMethod.textContent =
      getGuidanceLabel();
  };

  const calculatePlaceMatch = (place) => {
    const requirements =
      getActiveRequirements();

    if (requirements.length === 0) {
      return place.accessibilityScore;
    }

    const matchedRequirements =
      requirements.filter(
        (requirement) => {
          return place.supports.includes(
            requirement,
          );
        },
      );

    return Math.round(
      (matchedRequirements.length /
        requirements.length) *
        100,
    );
  };

  const getMatchedReasons = (place) => {
    const requirements =
      getActiveRequirements();

    const matchedRequirements =
      requirements.filter(
        (requirement) => {
          return place.supports.includes(
            requirement,
          );
        },
      );

    if (matchedRequirements.length === 0) {
      return [
        "Verified accessibility information",
        `${place.accessibilityScore}% accessibility score`,
      ];
    }

    return matchedRequirements
      .slice(0, 3)
      .map((requirement) => {
        return preferenceLabels[
          requirement
        ];
      });
  };

  const createReasons = (place) => {
    return getMatchedReasons(place)
      .map((reason) => {
        return `
          <li class="match-reason">
            <i class="bi bi-check-circle-fill"></i>
            <span>${reason}</span>
          </li>
        `;
      })
      .join("");
  };

  const isPlaceSaved = (placeId) => {
    const removedIds =
      JSON.parse(
        localStorage.getItem(
          "wusool-removed-saved-places",
        ) || "[]",
      );

    return !removedIds.includes(placeId);
  };

  const createRecommendationCard = (
    place,
  ) => {
    const matchPercentage =
      calculatePlaceMatch(place);

    const savedClass =
      isPlaceSaved(place.id)
        ? "saved"
        : "";

    const savedIcon =
      isPlaceSaved(place.id)
        ? "bi-bookmark-fill"
        : "bi-bookmark";

    const column =
      document.createElement("div");

    column.className =
      "col-12 col-md-6 col-xl-4";

    column.innerHTML = `
      <article class="recommendation-card h-100">
        <div class="recommendation-image">
          <img
            src="${place.image}"
            alt="${place.name}"
          />

          <span class="match-badge">
            ${matchPercentage}% Match
          </span>

          <button
            class="save-place-button ${savedClass}"
            type="button"
            data-save-id="${place.id}"
            aria-label="Save ${place.name}"
          >
            <i class="bi ${savedIcon}"></i>
          </button>
        </div>

        <div class="p-4">
          <div
            class="d-flex justify-content-between align-items-start gap-3 mb-2"
          >
            <div>
              <span class="small text-secondary">
                ${place.category}
              </span>

              <h3 class="h5 mt-1 mb-0">
                ${place.name}
              </h3>
            </div>

            <span class="accessibility-score">
              ${place.accessibilityScore}%
            </span>
          </div>

          <p class="text-secondary mb-3">
            <i class="bi bi-geo-alt me-1"></i>
            ${place.city}
          </p>

          <section class="why-match p-3 mb-4">
            <h4 class="h6 mb-3">
              Why this matches you
            </h4>

            <ul class="d-grid gap-2 mb-0">
              ${createReasons(place)}
            </ul>
          </section>

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
    const selectedCategory =
      categoryFilter.value;

    const selectedCity =
      cityFilter.value;

    const selectedSort =
      sortFilter.value;

    const places =
      recommendationPlaces.filter(
        (place) => {
          const categoryMatches =
            selectedCategory === "all" ||
            place.category ===
              selectedCategory;

          const cityMatches =
            selectedCity === "all" ||
            place.city === selectedCity;

          return (
            categoryMatches &&
            cityMatches
          );
        },
      );

    if (selectedSort === "match") {
      places.sort(
        (firstPlace, secondPlace) => {
          return (
            calculatePlaceMatch(
              secondPlace,
            ) -
            calculatePlaceMatch(
              firstPlace,
            )
          );
        },
      );
    }

    if (selectedSort === "score") {
      places.sort(
        (firstPlace, secondPlace) => {
          return (
            secondPlace.accessibilityScore -
            firstPlace.accessibilityScore
          );
        },
      );
    }

    if (selectedSort === "name") {
      places.sort(
        (firstPlace, secondPlace) => {
          return firstPlace.name.localeCompare(
            secondPlace.name,
          );
        },
      );
    }

    return places;
  };

  const addSaveButtonEvents = () => {
    const saveButtons =
      document.querySelectorAll(
        "[data-save-id]",
      );

    saveButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const placeId =
            Number(
              button.dataset.saveId,
            );

          let removedIds =
            JSON.parse(
              localStorage.getItem(
                "wusool-removed-saved-places",
              ) || "[]",
            );

          const placeIsSaved =
            !removedIds.includes(placeId);

          if (placeIsSaved) {
            removedIds =
              removedIds.filter(
                (id) => id !== placeId,
              );
          } else {
            removedIds =
              removedIds.filter(
                (id) => id !== placeId,
              );
          }

          localStorage.setItem(
            "wusool-removed-saved-places",
            JSON.stringify(removedIds),
          );

          button.classList.add("saved");

          button
            .querySelector("i")
            .className =
            "bi bi-bookmark-fill";

          showStatusMessage(
            "Place added to your saved places.",
          );
        },
      );
    });
  };

  const renderRecommendations = () => {
    const places =
      getFilteredPlaces();

    recommendationsContainer.innerHTML =
      "";

    resultCount.textContent =
      places.length;

    if (places.length === 0) {
      emptyRecommendations.classList.remove(
        "d-none",
      );

      return;
    }

    emptyRecommendations.classList.add(
      "d-none",
    );

    places.forEach((place) => {
      recommendationsContainer.appendChild(
        createRecommendationCard(place),
      );
    });

    addSaveButtonEvents();
  };

  categoryFilter.addEventListener(
    "change",
    renderRecommendations,
  );

  cityFilter.addEventListener(
    "change",
    renderRecommendations,
  );

  sortFilter.addEventListener(
    "change",
    renderRecommendations,
  );

  resetFilters.addEventListener(
    "click",
    () => {
      categoryFilter.value = "all";
      cityFilter.value = "all";
      sortFilter.value = "match";

      renderRecommendations();
    },
  );

  renderPreferenceSummary();
  renderRecommendations();
});