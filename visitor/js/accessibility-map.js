"use strict";

/* ========================================
   Accessibility Map Page
======================================== */

const searchForm =
    document.getElementById("mapSearchForm");

const searchInput =
    document.getElementById("searchInput");

const locationFilter =
    document.getElementById("locationFilter");

const typeFilter =
    document.getElementById("typeFilter");

const accessibilityFilter =
    document.getElementById(
        "accessibilityFilter"
    );

const scoreFilter =
    document.getElementById("scoreFilter");

const applyFiltersButton =
    document.getElementById("applyFilters");

const clearFiltersButton =
    document.getElementById("clearFilters");

const emptyClearFiltersButton =
    document.getElementById(
        "emptyClearFilters"
    );

const placeResults =
    document.querySelectorAll(".place-result");

const resultsCount =
    document.getElementById("resultsCount");

const mapResultCount =
    document.getElementById("mapResultCount");

const emptyState =
    document.getElementById("emptyState");

const placesGrid =
    document.getElementById("placesGrid");

/* ========================================
   Apply Search and Filters
======================================== */

const applyFilters = () => {
    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedLocation =
        locationFilter.value;

    const selectedType =
        typeFilter.value;

    const selectedFeature =
        accessibilityFilter.value;

    const selectedScore =
        Number(scoreFilter.value);

    let visiblePlaces = 0;

    placeResults.forEach((place) => {
        const placeName =
            place.dataset.name;

        const placeCity =
            place.dataset.city;

        const placeType =
            place.dataset.type;

        const placeFeatures =
            place.dataset.features;

        const placeScore =
            Number(place.dataset.score);

        const matchesSearch =
            searchValue === "" ||
            placeName.includes(searchValue);

        const matchesLocation =
            selectedLocation === "all" ||
            placeCity === selectedLocation;

        const matchesType =
            selectedType === "all" ||
            placeType === selectedType;

        const matchesFeature =
            selectedFeature === "all" ||
            placeFeatures.includes(
                selectedFeature
            );

        const matchesScore =
            placeScore >= selectedScore;

        const shouldShow =
            matchesSearch &&
            matchesLocation &&
            matchesType &&
            matchesFeature &&
            matchesScore;

        place.classList.toggle(
            "d-none",
            !shouldShow
        );

        const placeMarker =
            document.querySelector(
                `[data-place="${place.dataset.id}"]`
            );

        placeMarker?.classList.toggle(
            "d-none",
            !shouldShow
        );

        if (shouldShow) {
            visiblePlaces++;
        }
    });

    resultsCount.textContent =
        `${visiblePlaces} ${
            visiblePlaces === 1
                ? "result"
                : "results"
        }`;

    mapResultCount.textContent =
        `${visiblePlaces} ${
            visiblePlaces === 1
                ? "place"
                : "places"
        }`;

    emptyState.classList.toggle(
        "d-none",
        visiblePlaces !== 0
    );

    placesGrid.classList.toggle(
        "d-none",
        visiblePlaces === 0
    );
};

searchForm?.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();
        applyFilters();
    }
);

applyFiltersButton?.addEventListener(
    "click",
    applyFilters
);

/* ========================================
   Clear Filters
======================================== */

const clearFilters = () => {
    searchInput.value = "";
    locationFilter.value = "all";
    typeFilter.value = "all";
    accessibilityFilter.value = "all";
    scoreFilter.value = "0";

    applyFilters();

    searchInput.focus();
};

clearFiltersButton?.addEventListener(
    "click",
    clearFilters
);

emptyClearFiltersButton?.addEventListener(
    "click",
    clearFilters
);

/* ========================================
   Read Search From Home Page
======================================== */

const savedSearch =
    sessionStorage.getItem("wusool-search");

if (savedSearch) {
    const searchData =
        JSON.parse(savedSearch);

    searchInput.value =
        searchData.query || "";

    if (
        searchData.city &&
        searchData.city !== ""
    ) {
        locationFilter.value =
            searchData.city.toLowerCase();
    }

    if (
        searchData.accessibilityNeed &&
        searchData.accessibilityNeed !== ""
    ) {
        accessibilityFilter.value =
            searchData.accessibilityNeed;
    }

    applyFilters();

    sessionStorage.removeItem(
        "wusool-search"
    );
}

/* ========================================
   Map Marker Information
======================================== */

const markerButtons =
    document.querySelectorAll(
        ".place-marker"
    );

const markerInformation =
    document.getElementById(
        "markerInformation"
    );

const markerPlaceName =
    document.getElementById(
        "markerPlaceName"
    );

const markerPlaceScore =
    document.getElementById(
        "markerPlaceScore"
    );

const closeMarkerInformation =
    document.getElementById(
        "closeMarkerInformation"
    );

markerButtons.forEach((marker) => {
    marker.addEventListener("click", () => {
        const placeId =
            marker.dataset.place;

        const selectedPlace =
            document.querySelector(
                `.place-result[data-id="${placeId}"]`
            );

        if (!selectedPlace) {
            return;
        }

        const placeName =
            selectedPlace.querySelector("h3")
                .textContent;

        const placeScore =
            selectedPlace.dataset.score;

        markerPlaceName.textContent =
            placeName;

        markerPlaceScore.textContent =
            `Accessibility score: ${placeScore}/100`;

        markerInformation.classList.remove(
            "d-none"
        );
    });
});

closeMarkerInformation?.addEventListener(
    "click",
    () => {
        markerInformation.classList.add(
            "d-none"
        );
    }
);

/* ========================================
   Map Zoom
======================================== */

const mapCanvas =
    document.getElementById("mapCanvas");

const zoomInButton =
    document.getElementById("zoomIn");

const zoomOutButton =
    document.getElementById("zoomOut");

let mapZoom = 1;

const updateMapZoom = () => {
    const mapElements =
        mapCanvas.querySelectorAll(
            ".map-pattern, " +
            ".map-line, " +
            ".place-marker"
        );

    mapElements.forEach((element) => {
        element.style.scale = mapZoom;
    });
};

zoomInButton?.addEventListener(
    "click",
    () => {
        if (mapZoom < 1.3) {
            mapZoom += 0.1;
            updateMapZoom();
        }
    }
);

zoomOutButton?.addEventListener(
    "click",
    () => {
        if (mapZoom > 0.8) {
            mapZoom -= 0.1;
            updateMapZoom();
        }
    }
);

/* ========================================
   Save Selected Place
======================================== */

const detailsButtons =
    document.querySelectorAll(
        ".result-card a"
    );

detailsButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const place =
            button.closest(".place-result");

        const selectedPlace = {
            id: place.dataset.id,
            name:
                place.querySelector("h3")
                    .textContent,
            city: place.dataset.city,
            type: place.dataset.type,
            features:
                place.dataset.features,
            score:
                Number(place.dataset.score)
        };

        sessionStorage.setItem(
            "wusool-selected-place",
            JSON.stringify(selectedPlace)
        );
    });
});