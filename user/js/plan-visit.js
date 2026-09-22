"use strict";

const visitPlaces = [
  {
    id: 1,
    name: "Amman City Hall",
    branches: [
      "Main Branch - Amman",
      "West Amman Branch",
    ],
    destinations: [
      "Reception",
      "Customer Service",
      "Document Department",
      "Main Hall",
      "Accessible Restroom",
    ],
  },
  {
    id: 2,
    name: "Al Noor Medical Center",
    branches: [
      "Main Medical Center",
      "North Amman Clinic",
    ],
    destinations: [
      "Reception",
      "Appointments Department",
      "Laboratory",
      "Radiology",
      "Pharmacy",
    ],
  },
  {
    id: 3,
    name: "Community Hub",
    branches: [
      "Amman Community Hub",
    ],
    destinations: [
      "Reception",
      "Training Hall",
      "Meeting Room",
      "Support Office",
    ],
  },
  {
    id: 4,
    name: "Jordan National Bank",
    branches: [
      "Main Branch",
      "Shmeisani Branch",
      "Abdoun Branch",
    ],
    destinations: [
      "Reception",
      "Customer Service",
      "Teller",
      "Loans Department",
      "Accounts Department",
    ],
  },
  {
    id: 5,
    name: "Knowledge Center",
    branches: [
      "Irbid Main Center",
    ],
    destinations: [
      "Reception",
      "Library",
      "Training Room",
      "Computer Lab",
    ],
  },
  {
    id: 6,
    name: "Public Services Center",
    branches: [
      "Zarqa Main Branch",
    ],
    destinations: [
      "Reception",
      "Application Department",
      "Payment Department",
      "Customer Service",
    ],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const visitForm =
    document.getElementById("visitForm");

  const placeSelect =
    document.getElementById("placeSelect");

  const branchSelect =
    document.getElementById("branchSelect");

  const destinationSelect =
    document.getElementById(
      "destinationSelect",
    );

  const visitPurpose =
    document.getElementById("visitPurpose");

  const visitDate =
    document.getElementById("visitDate");

  const visitTime =
    document.getElementById("visitTime");

  const visitNotes =
    document.getElementById("visitNotes");

  const supportInputs =
    document.querySelectorAll(
      'input[name="visitSupport"]',
    );

  const guidanceInputs =
    document.querySelectorAll(
      'input[name="guidanceMethod"]',
    );

  const useSavedPreferences =
    document.getElementById(
      "useSavedPreferences",
    );

  const summaryPlace =
    document.getElementById("summaryPlace");

  const summaryBranch =
    document.getElementById("summaryBranch");

  const summaryDestination =
    document.getElementById(
      "summaryDestination",
    );

  const summaryDate =
    document.getElementById("summaryDate");

  const summaryTime =
    document.getElementById("summaryTime");

  const summarySupport =
    document.getElementById("summarySupport");

  const summaryGuidance =
    document.getElementById(
      "summaryGuidance",
    );

  const navbarUserName =
    document.getElementById("navbarUserName");

  navbarUserName.textContent =
    localStorage.getItem(
      "wusool-user-name",
    ) || "User";

  const parameters =
    new URLSearchParams(
      window.location.search,
    );

  const requestedPlaceId =
    Number(parameters.get("placeId")) || 1;

  const setMinimumDate = () => {
    const today = new Date();

    const formattedDate =
      today.toISOString().split("T")[0];

    visitDate.min = formattedDate;
  };

  const populatePlaces = () => {
    placeSelect.innerHTML = "";

    visitPlaces.forEach((place) => {
      const option =
        document.createElement("option");

      option.value = place.id;
      option.textContent = place.name;

      placeSelect.appendChild(option);
    });

    const placeExists =
      visitPlaces.some((place) => {
        return place.id ===
          requestedPlaceId;
      });

    placeSelect.value = placeExists
      ? requestedPlaceId
      : visitPlaces[0].id;
  };

  const getSelectedPlace = () => {
    return visitPlaces.find((place) => {
      return (
        place.id ===
        Number(placeSelect.value)
      );
    });
  };

  const populateBranches = () => {
    const selectedPlace =
      getSelectedPlace();

    branchSelect.innerHTML = "";

    selectedPlace.branches.forEach(
      (branch) => {
        const option =
          document.createElement(
            "option",
          );

        option.value = branch;
        option.textContent = branch;

        branchSelect.appendChild(option);
      },
    );
  };

  const populateDestinations = () => {
    const selectedPlace =
      getSelectedPlace();

    destinationSelect.innerHTML = "";

    selectedPlace.destinations.forEach(
      (destination) => {
        const option =
          document.createElement(
            "option",
          );

        option.value = destination;
        option.textContent =
          destination;

        destinationSelect.appendChild(
          option,
        );
      },
    );
  };

  const getSelectedSupport = () => {
    return Array.from(supportInputs)
      .filter((input) => input.checked)
      .map((input) => input.value);
  };

  const getSelectedGuidanceMethod = () => {
    const selectedGuidance =
      document.querySelector(
        'input[name="guidanceMethod"]:checked',
      );

    return selectedGuidance?.value || "both";
  };

  const getGuidanceLabel = (method) => {
    const labels = {
      text: "Text",
      voice: "Voice",
      both: "Text & Voice",
    };

    return labels[method] || labels.both;
  };

  const selectGuidanceMethod = (method) => {
    const validMethods = ["text", "voice", "both"];
    const selectedMethod = validMethods.includes(method)
      ? method
      : "both";

    guidanceInputs.forEach((input) => {
      input.checked = input.value === selectedMethod;
    });
  };

  const getSavedPreferences = () => {
    const savedPreferences = localStorage.getItem(
      "wusool-accessibility-preferences",
    );

    if (!savedPreferences) {
      return null;
    }

    try {
      return JSON.parse(savedPreferences);
    } catch {
      return null;
    }
  };

  const getDefaultGuidanceMethod = (preferences) => {
    if (
      ["text", "voice", "both"].includes(
        preferences?.guidanceMethod,
      )
    ) {
      return preferences.guidanceMethod;
    }

    const normalizedNeeds = (
      preferences?.accessibilityNeeds || []
    )
      .join(" ")
      .toLowerCase();

    const hasVisualNeed =
      normalizedNeeds.includes("visual") ||
      normalizedNeeds.includes("blind") ||
      normalizedNeeds.includes("low-vision");

    const hasHearingNeed =
      normalizedNeeds.includes("hearing") ||
      normalizedNeeds.includes("deaf");

    if (hasVisualNeed && hasHearingNeed) {
      return "both";
    }

    if (hasVisualNeed) {
      return "voice";
    }

    if (hasHearingNeed) {
      return "text";
    }

    return "both";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not selected";
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ).format(
      new Date(`${dateValue}T00:00:00`),
    );
  };

  const formatTime = (timeValue) => {
    if (!timeValue) {
      return "Not selected";
    }

    const [hours, minutes] =
      timeValue.split(":");

    const timeDate = new Date();

    timeDate.setHours(
      Number(hours),
      Number(minutes),
    );

    return new Intl.DateTimeFormat(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    ).format(timeDate);
  };

  const updateSummary = () => {
    const selectedPlace =
      getSelectedPlace();

    const selectedSupport =
      getSelectedSupport();

    summaryPlace.textContent =
      selectedPlace?.name ||
      "Not selected";

    summaryBranch.textContent =
      branchSelect.value ||
      "Not selected";

    summaryDestination.textContent =
      destinationSelect.value ||
      "Not selected";

    summaryDate.textContent =
      formatDate(visitDate.value);

    summaryTime.textContent =
      formatTime(visitTime.value);

    summarySupport.textContent =
      selectedSupport.length > 0
        ? selectedSupport.join(", ")
        : "No support selected";

    summaryGuidance.textContent = getGuidanceLabel(
      getSelectedGuidanceMethod(),
    );
  };

  const applySavedPreferences = () => {
    const preferences = getSavedPreferences();

    if (!preferences) {
      showStatusMessage(
        "No saved accessibility preferences were found.",
      );

      return;
    }

    const needs =
      preferences.accessibilityNeeds ||
      [];

    const routes =
      preferences.routePreferences ||
      [];

    document.getElementById(
      "wheelchairSupport",
    ).checked =
      needs.includes("wheelchair");

    document.getElementById(
      "staffAssistance",
    ).checked =
      needs.includes(
        "staff-assistance",
      );

    document.getElementById(
      "accessibleParking",
    ).checked =
      routes.includes(
        "accessible-parking",
      );

    document.getElementById(
      "visualNavigation",
    ).checked = true;

    selectGuidanceMethod(
      getDefaultGuidanceMethod(preferences),
    );

    updateSummary();

    showStatusMessage(
      "Saved accessibility preferences applied.",
    );
  };

  const collectVisitData = () => {
    const selectedPlace =
      getSelectedPlace();

    return {
      id: Date.now(),
      placeId: selectedPlace.id,
      placeName: selectedPlace.name,
      branch: branchSelect.value,
      destination:
        destinationSelect.value,
      purpose: visitPurpose.value,
      date: visitDate.value,
      time: visitTime.value,
      support: getSelectedSupport(),
      guidanceMethod: getSelectedGuidanceMethod(),
      notes: visitNotes.value.trim(),
      status: "Pending Review",
    };
  };

  placeSelect.addEventListener(
    "change",
    () => {
      populateBranches();
      populateDestinations();
      updateSummary();
    },
  );

  branchSelect.addEventListener(
    "change",
    updateSummary,
  );

  destinationSelect.addEventListener(
    "change",
    updateSummary,
  );

  visitDate.addEventListener(
    "change",
    updateSummary,
  );

  visitTime.addEventListener(
    "change",
    updateSummary,
  );

  supportInputs.forEach((input) => {
    input.addEventListener(
      "change",
      updateSummary,
    );
  });

  guidanceInputs.forEach((input) => {
    input.addEventListener("change", updateSummary);
  });

  useSavedPreferences.addEventListener(
    "click",
    applySavedPreferences,
  );

  visitForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      if (!visitForm.checkValidity()) {
        visitForm.classList.add(
          "was-validated",
        );

        showStatusMessage(
          "Complete the required visit information.",
        );

        return;
      }

      const visitData =
        collectVisitData();

      localStorage.setItem(
        "wusool-pending-visit",
        JSON.stringify(visitData),
      );

      window.location.href =
        "./visit-summary.html";
    },
  );

  setMinimumDate();
  populatePlaces();
  populateBranches();
  populateDestinations();
  selectGuidanceMethod(
    getDefaultGuidanceMethod(getSavedPreferences()),
  );
  updateSummary();
});
