WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const navigationPlaces = (await WusoolServices.places()).items.map(p => ({
    ...p,
    branches: [{
      id: p.id,
      name: p.branchName,
      startingPoints: p.startingPoints || [],
      destinations: p.destinations
    }]
  }));
  WusoolUI.ready(async () => {
    await initializeNavigationPage();
  });
  const initializeNavigationPage = async () => {
    WusoolUI.message('Navigation needs backend route data and AI configuration. This screen only prepares your request.', 'info');
    renderPlaces();
    await preloadNavigationInformation();
    addNavigationEvents();
    updateNavigationSummary();
  };
  const renderPlaces = () => {
    const placeSelect = document.getElementById("placeSelect");
    navigationPlaces.forEach(place => {
      const option = document.createElement("option");
      option.value = place.id;
      option.textContent = place.name;
      placeSelect.appendChild(option);
    });
  };
  const addNavigationEvents = () => {
    const navigationForm = document.getElementById("navigationSetupForm");
    const placeSelect = document.getElementById("placeSelect");
    const branchSelect = document.getElementById("branchSelect");
    const startingPointSelect = document.getElementById("startingPointSelect");
    const destinationSelect = document.getElementById("destinationSelect");
    const guidanceInputs = document.querySelectorAll('input[name="guidanceMethod"]');
    WusoolUI.listen(placeSelect, "change", () => {
      renderBranches();
      clearNavigationStatus();
      updateNavigationSummary();
    });
    WusoolUI.listen(branchSelect, "change", () => {
      renderBranchLocations();
      clearNavigationStatus();
      updateNavigationSummary();
    });
    WusoolUI.listen(startingPointSelect, "change", updateNavigationSummary);
    WusoolUI.listen(destinationSelect, "change", updateNavigationSummary);
    guidanceInputs.forEach(guidanceInput => {
      WusoolUI.listen(guidanceInput, "change", updateNavigationSummary);
    });
    WusoolUI.listen(navigationForm, "submit", handleNavigationSubmit);
  };
  const renderBranches = () => {
    const placeSelect = document.getElementById("placeSelect");
    const branchSelect = document.getElementById("branchSelect");
    resetSelect(branchSelect, "Select a branch");
    resetLocationSelects();
    const selectedPlace = getSelectedPlace();
    if (!selectedPlace) {
      branchSelect.disabled = true;
      return;
    }
    selectedPlace.branches.forEach(branch => {
      const option = document.createElement("option");
      option.value = branch.id;
      option.textContent = branch.name;
      branchSelect.appendChild(option);
    });
    branchSelect.disabled = false;
  };
  const renderBranchLocations = () => {
    const startingPointSelect = document.getElementById("startingPointSelect");
    const destinationSelect = document.getElementById("destinationSelect");
    resetLocationSelects();
    const selectedBranch = getSelectedBranch();
    if (!selectedBranch) {
      return;
    }
    selectedBranch.startingPoints.forEach(startingPoint => {
      const option = document.createElement("option");
      option.value = startingPoint;
      option.textContent = startingPoint;
      startingPointSelect.appendChild(option);
    });
    selectedBranch.destinations.forEach(destination => {
      const option = document.createElement("option");
      option.value = destination;
      option.textContent = destination;
      destinationSelect.appendChild(option);
    });
    startingPointSelect.disabled = false;
    destinationSelect.disabled = false;
  };
  const resetLocationSelects = () => {
    const startingPointSelect = document.getElementById("startingPointSelect");
    const destinationSelect = document.getElementById("destinationSelect");
    resetSelect(startingPointSelect, "Select your starting point");
    resetSelect(destinationSelect, "Select a destination");
    startingPointSelect.disabled = true;
    destinationSelect.disabled = true;
  };
  const resetSelect = (selectElement, defaultText) => {
    WusoolUI.html(selectElement, `
        <option value="">
            ${defaultText}
        </option>
    `);
  };
  const getSelectedPlace = () => {
    const placeId = String(document.getElementById("placeSelect").value);
    return navigationPlaces.find(place => {
      return place.id === placeId;
    });
  };
  const getSelectedBranch = () => {
    const selectedPlace = getSelectedPlace();
    const branchId = String(document.getElementById("branchSelect").value);
    if (!selectedPlace) {
      return null;
    }
    return selectedPlace.branches.find(branch => {
      return branch.id === branchId;
    });
  };
  const getSelectedGuidance = () => {
    const selectedGuidance = document.querySelector('input[name="guidanceMethod"]:checked');
    const guidanceLabels = {
      text: "Text",
      voice: "Voice",
      both: "Text & Voice"
    };
    return selectedGuidance ? guidanceLabels[selectedGuidance.value] : "Not selected";
  };
  const updateNavigationSummary = () => {
    const selectedPlace = getSelectedPlace();
    const selectedBranch = getSelectedBranch();
    const startingPoint = document.getElementById("startingPointSelect").value;
    const destination = document.getElementById("destinationSelect").value;
    document.getElementById("summaryPlace").textContent = selectedPlace ? selectedPlace.name : "Not selected";
    document.getElementById("summaryBranch").textContent = selectedBranch ? selectedBranch.name : "Not selected";
    document.getElementById("summaryStartingPoint").textContent = startingPoint || "Not selected";
    document.getElementById("summaryDestination").textContent = destination || "Not selected";
    document.getElementById("summaryGuidance").textContent = getSelectedGuidance();
  };
  const handleNavigationSubmit = async event => {
    event.preventDefault();
    const navigationForm = event.currentTarget;
    if (!navigationForm.checkValidity()) {
      navigationForm.classList.add("was-validated");
      showNavigationStatus("Please complete all required navigation information.", "danger");
      return;
    }
    const selectedPlace = getSelectedPlace();
    const selectedBranch = getSelectedBranch();
    const selectedGuidance = document.querySelector('input[name="guidanceMethod"]:checked');
    const navigationSession = {
      sessionId: Date.now(),
      placeId: selectedPlace.id,
      placeName: selectedPlace.name,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      startingPoint: document.getElementById("startingPointSelect").value,
      destination: document.getElementById("destinationSelect").value,
      guidanceMethod: selectedGuidance.value,
      usePreferences: document.getElementById("usePreferences").checked,
      locationAllowed: document.getElementById("allowLocation").checked,
      status: "waiting-for-photo",
      createdAt: new Date().toISOString()
    };
    await WusoolServices.rawWrite("wusool-navigation-session", JSON.stringify(navigationSession));
    showNavigationStatus("Navigation setup saved. Opening photo analysis...", "success");
    window.location.href = "./analyze-surroundings.html";
  };
  const preloadNavigationInformation = async () => {
    const parameters = new URLSearchParams(window.location.search);
    const placeId = parameters.get("placeId");
    const visitId = parameters.get("visitId");
    if (visitId) {
      await preloadFromVisit(visitId);
      return;
    }
    if (placeId) {
      selectPlace(placeId);
    }
  };
  const preloadFromVisit = async visitId => {
    const savedVisits = JSON.parse(await WusoolServices.rawRead("wusool-visits")) || [];
    const selectedVisit = savedVisits.find(visit => {
      return String(visit.id) === String(visitId);
    });
    if (!selectedVisit) {
      return;
    }
    const matchingPlace = navigationPlaces.find(place => {
      return place.id === selectedVisit.branchId;
    });
    if (!matchingPlace) {
      return;
    }
    selectPlace(matchingPlace.id);
    const matchingBranch = matchingPlace.branches.find(branch => {
      return branch.name === selectedVisit.branchName;
    });
    if (matchingBranch) {
      document.getElementById("branchSelect").value = matchingBranch.id;
      renderBranchLocations();
      updateNavigationSummary();
    }
  };
  const selectPlace = placeId => {
    const matchingPlace = navigationPlaces.find(place => {
      return place.id === placeId;
    });
    if (!matchingPlace) {
      return;
    }
    document.getElementById("placeSelect").value = matchingPlace.id;
    renderBranches();
    updateNavigationSummary();
  };
  const showNavigationStatus = (message, type) => {
    const navigationStatus = document.getElementById("navigationStatus");
    navigationStatus.className = `alert alert-${type} mt-4`;
    navigationStatus.textContent = message;
  };
  const clearNavigationStatus = () => {
    const navigationStatus = document.getElementById("navigationStatus");
    navigationStatus.className = "alert d-none mt-4";
    navigationStatus.textContent = "";
  };
});
