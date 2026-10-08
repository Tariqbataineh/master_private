"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const account = await WusoolServices.getCurrentAccount();
  const savedPlaces = (await WusoolServices.places()).items.filter(p => (account.savedPlaces || []).includes(p.id));
  WusoolUI.ready(async () => {
    const savedPlacesContainer = document.getElementById("savedPlacesContainer");
    const emptySavedPlaces = document.getElementById("emptySavedPlaces");
    const savedPlacesCount = document.getElementById("savedPlacesCount");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");
    const compareButton = document.getElementById("compareSelectedButton");
    const navbarUserName = document.getElementById("navbarUserName");
    let selectedPlaceIds = [];
    const savedUserName = (await WusoolServices.rawRead("wusool-user-name")) || "User";
    navbarUserName.textContent = savedUserName;
    const getAvailablePlaces = async () => {
      const current = await WusoolServices.getCurrentAccount();
      return savedPlaces.filter(place => (current.savedPlaces || []).includes(place.id));
    };
    const getScoreClass = score => {
      return score >= 85 ? "score-excellent" : "score-good";
    };
    const createFeatures = features => {
      return features.map(feature => {
        return `
          <span class="place-feature">
            <i class="bi bi-check-circle-fill me-1"></i>
            ${feature}
          </span>
        `;
      }).join("");
    };
    const createPlaceCard = place => {
      const column = document.createElement("div");
      column.className = "col-12 col-md-6 col-xl-4";
      WusoolUI.html(column, `
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
    `);
      return column;
    };
    const getFilteredPlaces = async () => {
      const searchValue = searchInput.value.trim().toLowerCase();
      const selectedCategory = categoryFilter.value;
      const selectedSort = sortFilter.value;
      const filteredPlaces = (await getAvailablePlaces()).filter(place => {
        const matchesSearch = place.name.toLowerCase().includes(searchValue) || place.city.toLowerCase().includes(searchValue) || place.category.toLowerCase().includes(searchValue);
        const matchesCategory = selectedCategory === "all" || place.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
      if (selectedSort === "score-high") {
        filteredPlaces.sort((firstPlace, secondPlace) => {
          return secondPlace.score - firstPlace.score;
        });
      }
      if (selectedSort === "score-low") {
        filteredPlaces.sort((firstPlace, secondPlace) => {
          return firstPlace.score - secondPlace.score;
        });
      }
      if (selectedSort === "name") {
        filteredPlaces.sort((firstPlace, secondPlace) => {
          return firstPlace.name.localeCompare(secondPlace.name);
        });
      }
      return filteredPlaces;
    };
    const updateCompareButton = () => {
      compareButton.disabled = selectedPlaceIds.length < 2;
      WusoolUI.html(compareButton, `
      <i class="bi bi-bar-chart me-2"></i>
      Compare Selected (${selectedPlaceIds.length})
    `);
    };
    const addCardEvents = () => {
      const removeButtons = document.querySelectorAll("[data-remove-id]");
      const compareInputs = document.querySelectorAll(".compare-place-input");
      removeButtons.forEach(button => {
        WusoolUI.listen(button, "click", async () => {
          const placeId = button.dataset.removeId;
          await WusoolServices.setSavedPlace(placeId, false);
          selectedPlaceIds = selectedPlaceIds.filter(id => id !== placeId);
          await renderSavedPlaces();
          showStatusMessage("Place removed from saved places.");
        });
      });
      compareInputs.forEach(input => {
        WusoolUI.listen(input, "change", () => {
          const placeId = String(input.value);
          if (input.checked) {
            if (selectedPlaceIds.length >= 3) {
              input.checked = false;
              showStatusMessage("You can compare up to three places.");
              return;
            }
            selectedPlaceIds.push(placeId);
          } else {
            selectedPlaceIds = selectedPlaceIds.filter(id => id !== placeId);
          }
          updateCompareButton();
        });
      });
    };
    const renderSavedPlaces = async () => {
      const filteredPlaces = await getFilteredPlaces();
      WusoolUI.html(savedPlacesContainer, "");
      savedPlacesCount.textContent = (await getAvailablePlaces()).length;
      if (filteredPlaces.length === 0) {
        emptySavedPlaces.classList.remove("d-none");
        return;
      }
      emptySavedPlaces.classList.add("d-none");
      filteredPlaces.forEach(place => {
        savedPlacesContainer.appendChild(createPlaceCard(place));
      });
      addCardEvents();
      updateCompareButton();
    };
    WusoolUI.listen(searchInput, "input", renderSavedPlaces);
    WusoolUI.listen(categoryFilter, "change", renderSavedPlaces);
    WusoolUI.listen(sortFilter, "change", renderSavedPlaces);
    WusoolUI.listen(compareButton, "click", () => {
      const selectedIds = selectedPlaceIds.join(",");
      window.location.href = `./compare-places.html?ids=${selectedIds}`;
    });
    await renderSavedPlaces();
  });
});
