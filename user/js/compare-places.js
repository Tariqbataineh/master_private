"use strict";

const comparisonPlaces = [
  {
    id: 1,
    name: "Amman City Hall",
    category: "Government",
    city: "Amman",
    score: 92,
    entrance: true,
    ramp: true,
    elevator: true,
    parking: true,
    restroom: true,
    widePathways: true,
    staffAssistance: true,
    visualSigns: true,
  },
  {
    id: 2,
    name: "Al Noor Medical Center",
    category: "Medical",
    city: "Amman",
    score: 88,
    entrance: true,
    ramp: true,
    elevator: true,
    parking: true,
    restroom: false,
    widePathways: true,
    staffAssistance: true,
    visualSigns: true,
  },
  {
    id: 3,
    name: "Community Hub",
    category: "Community",
    city: "Amman",
    score: 86,
    entrance: true,
    ramp: false,
    elevator: false,
    parking: false,
    restroom: true,
    widePathways: true,
    staffAssistance: true,
    visualSigns: true,
  },
  {
    id: 4,
    name: "Jordan National Bank",
    category: "Bank",
    city: "Amman",
    score: 90,
    entrance: true,
    ramp: true,
    elevator: true,
    parking: true,
    restroom: true,
    widePathways: false,
    staffAssistance: true,
    visualSigns: true,
  },
  {
    id: 5,
    name: "Knowledge Center",
    category: "Education",
    city: "Irbid",
    score: 84,
    entrance: true,
    ramp: true,
    elevator: true,
    parking: false,
    restroom: true,
    widePathways: true,
    staffAssistance: false,
    visualSigns: true,
  },
  {
    id: 6,
    name: "Public Services Center",
    category: "Government",
    city: "Zarqa",
    score: 82,
    entrance: true,
    ramp: false,
    elevator: false,
    parking: true,
    restroom: false,
    widePathways: true,
    staffAssistance: true,
    visualSigns: false,
  },
];

const comparisonFeatures = [
  {
    label: "Accessibility Score",
    property: "score",
    type: "score",
  },
  {
    label: "Category",
    property: "category",
    type: "text",
  },
  {
    label: "City",
    property: "city",
    type: "text",
  },
  {
    label: "Accessible Entrance",
    property: "entrance",
    type: "boolean",
  },
  {
    label: "Entrance Ramp",
    property: "ramp",
    type: "boolean",
  },
  {
    label: "Elevator",
    property: "elevator",
    type: "boolean",
  },
  {
    label: "Accessible Parking",
    property: "parking",
    type: "boolean",
  },
  {
    label: "Accessible Restroom",
    property: "restroom",
    type: "boolean",
  },
  {
    label: "Wide Pathways",
    property: "widePathways",
    type: "boolean",
  },
  {
    label: "Staff Assistance",
    property: "staffAssistance",
    type: "boolean",
  },
  {
    label: "Clear Visual Signs",
    property: "visualSigns",
    type: "boolean",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const placeSelector =
    document.getElementById(
      "placeSelector",
    );

  const addPlaceButton =
    document.getElementById(
      "addPlaceButton",
    );

  const clearComparisonButton =
    document.getElementById(
      "clearComparisonButton",
    );

  const selectedPlacesContainer =
    document.getElementById(
      "selectedPlaces",
    );

  const comparisonHead =
    document.getElementById(
      "comparisonHead",
    );

  const comparisonBody =
    document.getElementById(
      "comparisonBody",
    );

  const comparisonContent =
    document.getElementById(
      "comparisonContent",
    );

  const comparisonEmpty =
    document.getElementById(
      "comparisonEmpty",
    );

  const navbarUserName =
    document.getElementById(
      "navbarUserName",
    );

  navbarUserName.textContent =
    localStorage.getItem(
      "wusool-user-name",
    ) || "User";

  const parameters =
    new URLSearchParams(
      window.location.search,
    );

  const queryIds =
    parameters
      .get("ids")
      ?.split(",")
      .map(Number)
      .filter((id) => {
        return comparisonPlaces.some(
          (place) => place.id === id,
        );
      }) || [];

  let selectedPlaceIds =
    [...new Set(queryIds)].slice(0, 3);

  if (selectedPlaceIds.length === 0) {
    selectedPlaceIds = [1, 2];
  }

  const getSelectedPlaces = () => {
    return selectedPlaceIds
      .map((placeId) => {
        return comparisonPlaces.find(
          (place) => {
            return place.id === placeId;
          },
        );
      })
      .filter(Boolean);
  };

  const getBestPlaceId = () => {
    const selectedPlaces =
      getSelectedPlaces();

    if (selectedPlaces.length === 0) {
      return null;
    }

    return selectedPlaces.reduce(
      (bestPlace, currentPlace) => {
        return currentPlace.score >
          bestPlace.score
          ? currentPlace
          : bestPlace;
      },
    ).id;
  };

  const updateUrl = () => {
    const newUrl =
      `${window.location.pathname}?ids=${selectedPlaceIds.join(",")}`;

    window.history.replaceState(
      {},
      "",
      newUrl,
    );
  };

  const renderPlaceSelector = () => {
    placeSelector.innerHTML = "";

    const availablePlaces =
      comparisonPlaces.filter((place) => {
        return !selectedPlaceIds.includes(
          place.id,
        );
      });

    if (
      selectedPlaceIds.length >= 3 ||
      availablePlaces.length === 0
    ) {
      const option =
        document.createElement("option");

      option.textContent =
        "Maximum three places selected";

      option.value = "";

      placeSelector.appendChild(option);

      placeSelector.disabled = true;
      addPlaceButton.disabled = true;

      return;
    }

    placeSelector.disabled = false;
    addPlaceButton.disabled = false;

    availablePlaces.forEach((place) => {
      const option =
        document.createElement("option");

      option.value = place.id;
      option.textContent =
        `${place.name} — ${place.city}`;

      placeSelector.appendChild(option);
    });
  };

  const renderSelectedPlaces = () => {
    selectedPlacesContainer.innerHTML = "";

    getSelectedPlaces().forEach(
      (place) => {
        const selectedPlace =
          document.createElement("span");

        selectedPlace.className =
          "selected-place";

        selectedPlace.innerHTML = `
          ${place.name}

          <button
            class="remove-place"
            type="button"
            data-remove-id="${place.id}"
            aria-label="Remove ${place.name}"
          >
            <i class="bi bi-x"></i>
          </button>
        `;

        selectedPlacesContainer.appendChild(
          selectedPlace,
        );
      },
    );

    const removeButtons =
      document.querySelectorAll(
        "[data-remove-id]",
      );

    removeButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const placeId =
            Number(
              button.dataset.removeId,
            );

          selectedPlaceIds =
            selectedPlaceIds.filter(
              (id) => id !== placeId,
            );

          renderComparison();

          showStatusMessage(
            "Place removed from comparison.",
          );
        },
      );
    });
  };

  const createBooleanValue = (
    isAvailable,
  ) => {
    if (isAvailable) {
      return `
        <span
          class="facility-available"
          aria-label="Available"
        >
          <i class="bi bi-check-circle-fill"></i>
        </span>
      `;
    }

    return `
      <span
        class="facility-unavailable"
        aria-label="Not available"
      >
        <i class="bi bi-x-circle-fill"></i>
      </span>
    `;
  };

  const createFeatureValue = (
    place,
    feature,
  ) => {
    const value =
      place[feature.property];

    if (feature.type === "boolean") {
      return createBooleanValue(value);
    }

    if (feature.type === "score") {
      return `
        <span class="score-circle">
          ${value}%
        </span>
      `;
    }

    return value;
  };

  const renderComparisonHead = () => {
    const selectedPlaces =
      getSelectedPlaces();

    const bestPlaceId =
      getBestPlaceId();

    comparisonHead.innerHTML = `
      <tr>
        <th scope="col">
          Feature
        </th>

        ${selectedPlaces
          .map((place) => {
            const bestMatch =
              place.id === bestPlaceId;

            return `
              <th
                scope="col"
                class="${bestMatch ? "best-match-column" : ""}"
              >
                ${
                  bestMatch
                    ? `
                      <span class="best-match-badge">
                        Best Accessibility
                      </span>
                    `
                    : ""
                }

                <span class="comparison-place-name d-block">
                  ${place.name}
                </span>

                <small class="text-secondary">
                  ${place.city}
                </small>
              </th>
            `;
          })
          .join("")}
      </tr>
    `;
  };

  const renderComparisonBody = () => {
    const selectedPlaces =
      getSelectedPlaces();

    const bestPlaceId =
      getBestPlaceId();

    const featureRows =
      comparisonFeatures
        .map((feature) => {
          return `
            <tr>
              <th scope="row">
                ${feature.label}
              </th>

              ${selectedPlaces
                .map((place) => {
                  const bestMatch =
                    place.id ===
                    bestPlaceId;

                  return `
                    <td
                      class="${bestMatch ? "best-match-column" : ""}"
                    >
                      ${createFeatureValue(place, feature)}
                    </td>
                  `;
                })
                .join("")}
            </tr>
          `;
        })
        .join("");

    const actionRow = `
      <tr>
        <th scope="row">
          Actions
        </th>

        ${selectedPlaces
          .map((place) => {
            return `
              <td>
                <div class="d-grid gap-2">
                  <a
                    class="btn btn-wusool"
                    href="./user-place-details.html?id=${place.id}"
                  >
                    View Details
                  </a>

                  <a
                    class="btn btn-wusool-outline"
                    href="./plan-visit.html?placeId=${place.id}"
                  >
                    Plan Visit
                  </a>
                </div>
              </td>
            `;
          })
          .join("")}
      </tr>
    `;

    comparisonBody.innerHTML =
      featureRows + actionRow;
  };

  const renderComparison = () => {
    updateUrl();
    renderPlaceSelector();
    renderSelectedPlaces();

    if (selectedPlaceIds.length < 2) {
      comparisonContent.classList.add(
        "d-none",
      );

      comparisonEmpty.classList.remove(
        "d-none",
      );

      return;
    }

    comparisonContent.classList.remove(
      "d-none",
    );

    comparisonEmpty.classList.add(
      "d-none",
    );

    renderComparisonHead();
    renderComparisonBody();
  };

  addPlaceButton.addEventListener(
    "click",
    () => {
      const selectedId =
        Number(placeSelector.value);

      if (!selectedId) {
        return;
      }

      if (selectedPlaceIds.length >= 3) {
        showStatusMessage(
          "You can compare up to three places.",
        );

        return;
      }

      selectedPlaceIds.push(selectedId);

      renderComparison();

      showStatusMessage(
        "Place added to comparison.",
      );
    },
  );

  clearComparisonButton.addEventListener(
    "click",
    () => {
      selectedPlaceIds = [];

      renderComparison();

      showStatusMessage(
        "Comparison cleared.",
      );
    },
  );

  renderComparison();
});