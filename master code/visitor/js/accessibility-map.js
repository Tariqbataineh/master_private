'use strict';

/* ========================================
   Accessibility Map Page
======================================== */
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const legacyLanguage=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='AR | EN');
  if(legacyLanguage)WusoolUI.listen(legacyLanguage,'click',()=>window.WusoolPreferences?.setLanguage(document.documentElement.lang==='ar'?'en':'ar'));
  const searchForm = document.getElementById('mapSearchForm');
  const searchInput = document.getElementById('searchInput');
  const locationFilter = document.getElementById('locationFilter');
  const typeFilter = document.getElementById('typeFilter');
  const accessibilityFilter = document.getElementById('accessibilityFilter');
  const scoreFilter = document.getElementById('scoreFilter');
  const applyFiltersButton = document.getElementById('applyFilters');
  const clearFiltersButton = document.getElementById('clearFilters');
  const emptyClearFiltersButton = document.getElementById('emptyClearFilters');
  const resultsCount = document.getElementById('resultsCount');
  const mapResultCount = document.getElementById('mapResultCount');
  const emptyState = document.getElementById('emptyState');
  const placesGrid = document.getElementById('placesGrid');

  /* ========================================
     Apply Search and Filters
  ======================================== */

  const applyFilters = () => {
    const searchValue = searchInput.value.trim().toLowerCase();
    const selectedLocation = locationFilter.value;
    const selectedType = typeFilter.value;
    const selectedFeature = accessibilityFilter.value;
    const selectedScore = Number(scoreFilter.value);
    let visiblePlaces = 0;
    const visibleIds = [];
    document.querySelectorAll('.place-result').forEach((place) => {
      const placeName = place.dataset.name;
      const placeCity = place.dataset.city;
      const placeType = place.dataset.type;
      const placeFeatures = place.dataset.features;
      const placeScore = Number(place.dataset.score);
      const matchesSearch = searchValue === '' || placeName.includes(searchValue);
      const matchesLocation = selectedLocation === 'all' || placeCity === selectedLocation;
      const matchesType = selectedType === 'all' || placeType === selectedType;
      const matchesFeature = selectedFeature === 'all' || placeFeatures.includes(selectedFeature);
      const matchesScore = placeScore >= selectedScore;
      const shouldShow =
        matchesSearch && matchesLocation && matchesType && matchesFeature && matchesScore;
      place.classList.toggle('d-none', !shouldShow);
      const placeMarker = document.querySelector(`[data-place="${place.dataset.id}"]`);
      placeMarker?.classList.toggle('d-none', !shouldShow);
      if (shouldShow) {
        visiblePlaces++;
        visibleIds.push(place.dataset.id);
      }
    });
    window.WusoolGoogleMap?.setPlaces(
      (window.WusoolMapPlaces || []).filter((p) => visibleIds.includes(p.id)),
    );
    resultsCount.textContent = `${visiblePlaces} ${visiblePlaces === 1 ? 'result' : 'results'}`;
    mapResultCount.textContent = `${visiblePlaces} ${visiblePlaces === 1 ? 'place' : 'places'}`;
    emptyState.classList.toggle('d-none', visiblePlaces !== 0);
    placesGrid.classList.toggle('d-none', visiblePlaces === 0);
  };
  WusoolUI.listen(searchForm, 'submit', (event) => {
    event.preventDefault();
    applyFilters();
  });
  WusoolUI.listen(applyFiltersButton, 'click', applyFilters);

  /* ========================================
     Clear Filters
  ======================================== */

  const clearFilters = () => {
    searchInput.value = '';
    locationFilter.value = 'all';
    typeFilter.value = 'all';
    accessibilityFilter.value = 'all';
    scoreFilter.value = '0';
    applyFilters();
    searchInput.focus();
  };
  WusoolUI.listen(clearFiltersButton, 'click', clearFilters);
  WusoolUI.listen(emptyClearFiltersButton, 'click', clearFilters);

  /* ========================================
     Read Search From Home Page
  ======================================== */

  const savedSearch = await WusoolServices.rawRead('wusool-search');
  if (savedSearch) {
    const searchData = JSON.parse(savedSearch);
    searchInput.value = searchData.query || '';
    if (searchData.city && searchData.city !== '') {
      locationFilter.value = searchData.city.toLowerCase();
    }
    if (searchData.accessibilityNeed && searchData.accessibilityNeed !== '') {
      accessibilityFilter.value = searchData.accessibilityNeed;
    }
    applyFilters();
    await WusoolServices.rawRemove('wusool-search');
  }

  /* ========================================
     Save Selected Place
  ======================================== */

  WusoolUI.listen(window, 'wusool:catalog-updated', applyFilters);
  applyFilters();
});
