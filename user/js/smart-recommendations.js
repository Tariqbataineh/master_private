"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const recommendationPlaces = (await WusoolServices.places()).items;
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
    "rest-areas": "Rest areas"
  };
  WusoolUI.ready(async () => {
    const recommendationsContainer = document.getElementById("recommendationsContainer");
    const activePreferences = document.getElementById("activePreferences");
    const guidanceMethod = document.getElementById("guidanceMethod");
    const categoryFilter = document.getElementById("categoryFilter");
    const cityFilter = document.getElementById("cityFilter");
    const sortFilter = document.getElementById("sortFilter");
    const resultCount = document.getElementById("resultCount");
    const emptyRecommendations = document.getElementById("emptyRecommendations");
    const resetFilters = document.getElementById("resetFilters");
    const navbarUserName = document.getElementById("navbarUserName");
    navbarUserName.textContent = (await WusoolServices.rawRead("wusool-user-name")) || "User";
    const defaultPreferences = {
      accessibilityNeeds: [],
      routePreferences: ["avoid-stairs", "prefer-elevator", "step-free-route", "wide-pathways"],
      guidanceMethod: "both"
    };
    const getPreferences = async () => {
      const savedPreferences = await WusoolServices.rawRead("wusool-accessibility-preferences");
      if (!savedPreferences) {
        return defaultPreferences;
      }
      try {
        return {
          ...defaultPreferences,
          ...JSON.parse(savedPreferences)
        };
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        return defaultPreferences;
      }
    };
    const userPreferences = await getPreferences();
    const getActiveRequirements = () => {
      return [...userPreferences.accessibilityNeeds, ...userPreferences.routePreferences];
    };
    const getGuidanceLabel = () => {
      const guidanceLabels = {
        text: "Text Guidance",
        voice: "Voice Guidance",
        both: "Voice and Text"
      };
      return guidanceLabels[userPreferences.guidanceMethod] || "Voice and Text";
    };
    const renderPreferenceSummary = () => {
      const requirements = getActiveRequirements();
      WusoolUI.html(activePreferences, "");
      if (requirements.length === 0) {
        const emptyTag = document.createElement("span");
        emptyTag.className = "preference-tag";
        emptyTag.textContent = "General accessibility";
        activePreferences.appendChild(emptyTag);
      }
      requirements.forEach(requirement => {
        const preferenceTag = document.createElement("span");
        preferenceTag.className = "preference-tag";
        preferenceTag.textContent = preferenceLabels[requirement] || requirement;
        activePreferences.appendChild(preferenceTag);
      });
      guidanceMethod.textContent = getGuidanceLabel();
    };
    const calculatePlaceMatch = place => {
      const requirements = getActiveRequirements();
      if (requirements.length === 0) {
        return place.accessibilityScore;
      }
      const matchedRequirements = requirements.filter(requirement => {
        return (place.supports||[]).includes(requirement);
      });
      return Math.round(matchedRequirements.length / requirements.length * 100);
    };
    const getMatchedReasons = place => {
      const requirements = getActiveRequirements();
      const matchedRequirements = requirements.filter(requirement => {
        return (place.supports||[]).includes(requirement);
      });
      if (matchedRequirements.length === 0) {
        return ["Accessibility claims — see evidence status", `${place.accessibilityScore}% accessibility score`];
      }
      return matchedRequirements.slice(0, 3).map(requirement => {
        return preferenceLabels[requirement];
      });
    };
    const createReasons = place => {
      return getMatchedReasons(place).map(reason => {
        return `
          <li class="match-reason">
            <i class="bi bi-check-circle-fill"></i>
            <span>${reason}</span>
          </li>
        `;
      }).join("");
    };
    const isPlaceSaved = async placeId => ((await WusoolServices.getCurrentAccount()).savedPlaces||[]).includes(placeId);
    const createRecommendationCard = async place => {
      const matchPercentage = calculatePlaceMatch(place);
      const savedClass = (await isPlaceSaved(place.id)) ? "saved" : "";
      const savedIcon = (await isPlaceSaved(place.id)) ? "bi-bookmark-fill" : "bi-bookmark";
      const column = document.createElement("div");
      column.className = "col-12 col-md-6 col-xl-4";
      WusoolUI.html(column, `
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
    `);
      return column;
    };
    const getFilteredPlaces = () => {
      const selectedCategory = categoryFilter.value;
      const selectedCity = cityFilter.value;
      const selectedSort = sortFilter.value;
      const places = recommendationPlaces.filter(place => {
        const categoryMatches = selectedCategory === "all" || place.category === selectedCategory;
        const cityMatches = selectedCity === "all" || place.city === selectedCity;
        return categoryMatches && cityMatches;
      });
      if (selectedSort === "match") {
        places.sort((firstPlace, secondPlace) => {
          return calculatePlaceMatch(secondPlace) - calculatePlaceMatch(firstPlace);
        });
      }
      if (selectedSort === "score") {
        places.sort((firstPlace, secondPlace) => {
          return secondPlace.accessibilityScore - firstPlace.accessibilityScore;
        });
      }
      if (selectedSort === "name") {
        places.sort((firstPlace, secondPlace) => {
          return firstPlace.name.localeCompare(secondPlace.name);
        });
      }
      return places;
    };
    const addSaveButtonEvents = () => {
      const saveButtons = document.querySelectorAll("[data-save-id]");
      saveButtons.forEach(button => {
        WusoolUI.listen(button, "click", async () => {
          const placeId = String(button.dataset.saveId);
          const saved = await isPlaceSaved(placeId);
          await WusoolServices.setSavedPlace(placeId, !saved);
          await renderRecommendations();
          showStatusMessage(saved ? 'Place removed from saved places.' : 'Place saved.');
        });
      });
    };
    const renderRecommendations = async () => {
      const places = getFilteredPlaces();
      WusoolUI.html(recommendationsContainer, "");
      resultCount.textContent = places.length;
      if (places.length === 0) {
        emptyRecommendations.classList.remove("d-none");
        return;
      }
      emptyRecommendations.classList.add("d-none");
      await WusoolUI.each(places, async place => {
        recommendationsContainer.appendChild(await createRecommendationCard(place));
      });
      addSaveButtonEvents();
    };
    WusoolUI.listen(categoryFilter, "change", renderRecommendations);
    WusoolUI.listen(cityFilter, "change", renderRecommendations);
    WusoolUI.listen(sortFilter, "change", renderRecommendations);
    WusoolUI.listen(resetFilters, "click", async () => {
      categoryFilter.value = "all";
      cityFilter.value = "all";
      sortFilter.value = "match";
      await renderRecommendations();
    });
    renderPreferenceSummary();
    await renderRecommendations();
  });
});
