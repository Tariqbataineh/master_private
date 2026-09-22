const navigationPlaces = [
    {
        id: 1,
        name: "Amman City Hall",
        branches: [
            {
                id: 101,
                name: "Main Branch - Downtown",
                startingPoints: [
                    "Main Entrance",
                    "Accessible Parking",
                    "Reception Area",
                    "Elevator Entrance"
                ],
                destinations: [
                    "Customer Service",
                    "Licensing Department",
                    "Payment Office",
                    "Accessible Restroom",
                    "Elevator",
                    "Meeting Hall"
                ]
            },
            {
                id: 102,
                name: "West Amman Branch",
                startingPoints: [
                    "Main Entrance",
                    "Accessible Parking",
                    "Reception Area"
                ],
                destinations: [
                    "Customer Service",
                    "Information Desk",
                    "Payment Office",
                    "Accessible Restroom"
                ]
            }
        ]
    },
    {
        id: 2,
        name: "Al Noor Medical Center",
        branches: [
            {
                id: 201,
                name: "Main Medical Center",
                startingPoints: [
                    "Main Entrance",
                    "Emergency Entrance",
                    "Accessible Parking",
                    "Reception Area"
                ],
                destinations: [
                    "Reception",
                    "Emergency Department",
                    "Radiology",
                    "Laboratory",
                    "Pharmacy",
                    "Accessible Restroom",
                    "Elevator"
                ]
            },
            {
                id: 202,
                name: "North Clinic",
                startingPoints: [
                    "Main Entrance",
                    "Accessible Parking",
                    "Reception Area"
                ],
                destinations: [
                    "General Clinic",
                    "Dental Clinic",
                    "Laboratory",
                    "Pharmacy"
                ]
            }
        ]
    },
    {
        id: 3,
        name: "Community Hub",
        branches: [
            {
                id: 301,
                name: "Irbid Community Branch",
                startingPoints: [
                    "Main Entrance",
                    "Accessible Parking",
                    "Reception Area"
                ],
                destinations: [
                    "Training Room",
                    "Community Hall",
                    "Employment Office",
                    "Accessible Restroom",
                    "Elevator"
                ]
            }
        ]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    initializeNavigationPage();
});

const initializeNavigationPage = () => {
    renderPlaces();
    preloadNavigationInformation();
    addNavigationEvents();
    updateNavigationSummary();
};

const renderPlaces = () => {
    const placeSelect =
        document.getElementById("placeSelect");

    navigationPlaces.forEach((place) => {
        const option = document.createElement("option");

        option.value = place.id;
        option.textContent = place.name;

        placeSelect.appendChild(option);
    });
};

const addNavigationEvents = () => {
    const navigationForm =
        document.getElementById("navigationSetupForm");

    const placeSelect =
        document.getElementById("placeSelect");

    const branchSelect =
        document.getElementById("branchSelect");

    const startingPointSelect =
        document.getElementById("startingPointSelect");

    const destinationSelect =
        document.getElementById("destinationSelect");

    const guidanceInputs =
        document.querySelectorAll(
            'input[name="guidanceMethod"]'
        );

    placeSelect.addEventListener("change", () => {
        renderBranches();
        clearNavigationStatus();
        updateNavigationSummary();
    });

    branchSelect.addEventListener("change", () => {
        renderBranchLocations();
        clearNavigationStatus();
        updateNavigationSummary();
    });

    startingPointSelect.addEventListener(
        "change",
        updateNavigationSummary
    );

    destinationSelect.addEventListener(
        "change",
        updateNavigationSummary
    );

    guidanceInputs.forEach((guidanceInput) => {
        guidanceInput.addEventListener(
            "change",
            updateNavigationSummary
        );
    });

    navigationForm.addEventListener(
        "submit",
        handleNavigationSubmit
    );
};

const renderBranches = () => {
    const placeSelect =
        document.getElementById("placeSelect");

    const branchSelect =
        document.getElementById("branchSelect");

    resetSelect(
        branchSelect,
        "Select a branch"
    );

    resetLocationSelects();

    const selectedPlace = getSelectedPlace();

    if (!selectedPlace) {
        branchSelect.disabled = true;
        return;
    }

    selectedPlace.branches.forEach((branch) => {
        const option = document.createElement("option");

        option.value = branch.id;
        option.textContent = branch.name;

        branchSelect.appendChild(option);
    });

    branchSelect.disabled = false;
};

const renderBranchLocations = () => {
    const startingPointSelect =
        document.getElementById("startingPointSelect");

    const destinationSelect =
        document.getElementById("destinationSelect");

    resetLocationSelects();

    const selectedBranch = getSelectedBranch();

    if (!selectedBranch) {
        return;
    }

    selectedBranch.startingPoints.forEach(
        (startingPoint) => {
            const option =
                document.createElement("option");

            option.value = startingPoint;
            option.textContent = startingPoint;

            startingPointSelect.appendChild(option);
        }
    );

    selectedBranch.destinations.forEach(
        (destination) => {
            const option =
                document.createElement("option");

            option.value = destination;
            option.textContent = destination;

            destinationSelect.appendChild(option);
        }
    );

    startingPointSelect.disabled = false;
    destinationSelect.disabled = false;
};

const resetLocationSelects = () => {
    const startingPointSelect =
        document.getElementById("startingPointSelect");

    const destinationSelect =
        document.getElementById("destinationSelect");

    resetSelect(
        startingPointSelect,
        "Select your starting point"
    );

    resetSelect(
        destinationSelect,
        "Select a destination"
    );

    startingPointSelect.disabled = true;
    destinationSelect.disabled = true;
};

const resetSelect = (selectElement, defaultText) => {
    selectElement.innerHTML = `
        <option value="">
            ${defaultText}
        </option>
    `;
};

const getSelectedPlace = () => {
    const placeId = Number(
        document.getElementById("placeSelect").value
    );

    return navigationPlaces.find((place) => {
        return place.id === placeId;
    });
};

const getSelectedBranch = () => {
    const selectedPlace = getSelectedPlace();

    const branchId = Number(
        document.getElementById("branchSelect").value
    );

    if (!selectedPlace) {
        return null;
    }

    return selectedPlace.branches.find((branch) => {
        return branch.id === branchId;
    });
};

const getSelectedGuidance = () => {
    const selectedGuidance =
        document.querySelector(
            'input[name="guidanceMethod"]:checked'
        );

    const guidanceLabels = {
        text: "Text",
        voice: "Voice",
        both: "Text & Voice"
    };

    return selectedGuidance
        ? guidanceLabels[selectedGuidance.value]
        : "Not selected";
};

const updateNavigationSummary = () => {
    const selectedPlace = getSelectedPlace();
    const selectedBranch = getSelectedBranch();

    const startingPoint =
        document.getElementById(
            "startingPointSelect"
        ).value;

    const destination =
        document.getElementById(
            "destinationSelect"
        ).value;

    document.getElementById(
        "summaryPlace"
    ).textContent = selectedPlace
        ? selectedPlace.name
        : "Not selected";

    document.getElementById(
        "summaryBranch"
    ).textContent = selectedBranch
        ? selectedBranch.name
        : "Not selected";

    document.getElementById(
        "summaryStartingPoint"
    ).textContent = startingPoint || "Not selected";

    document.getElementById(
        "summaryDestination"
    ).textContent = destination || "Not selected";

    document.getElementById(
        "summaryGuidance"
    ).textContent = getSelectedGuidance();
};

const handleNavigationSubmit = (event) => {
    event.preventDefault();

    const navigationForm = event.currentTarget;

    if (!navigationForm.checkValidity()) {
        navigationForm.classList.add("was-validated");

        showNavigationStatus(
            "Please complete all required navigation information.",
            "danger"
        );

        return;
    }

    const selectedPlace = getSelectedPlace();
    const selectedBranch = getSelectedBranch();

    const selectedGuidance =
        document.querySelector(
            'input[name="guidanceMethod"]:checked'
        );

    const navigationSession = {
        sessionId: Date.now(),
        placeId: selectedPlace.id,
        placeName: selectedPlace.name,
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,

        startingPoint:
            document.getElementById(
                "startingPointSelect"
            ).value,

        destination:
            document.getElementById(
                "destinationSelect"
            ).value,

        guidanceMethod: selectedGuidance.value,

        usePreferences:
            document.getElementById(
                "usePreferences"
            ).checked,

        locationAllowed:
            document.getElementById(
                "allowLocation"
            ).checked,

        status: "waiting-for-photo",
        createdAt: new Date().toISOString()
    };

    localStorage.setItem(
        "wusool-navigation-session",
        JSON.stringify(navigationSession)
    );

    showNavigationStatus(
        "Navigation setup saved. Opening photo analysis...",
        "success"
    );

    setTimeout(() => {
        window.location.href =
            "./analyze-surroundings.html";
    }, 700);
};

const preloadNavigationInformation = () => {
    const parameters =
        new URLSearchParams(window.location.search);

    const placeId =
        Number(parameters.get("placeId"));

    const visitId =
        Number(parameters.get("visitId"));

    if (visitId) {
        preloadFromVisit(visitId);
        return;
    }

    if (placeId) {
        selectPlace(placeId);
    }
};

const preloadFromVisit = (visitId) => {
    const savedVisits =
        JSON.parse(
            localStorage.getItem("wusool-visits")
        ) || [];

    const selectedVisit =
        savedVisits.find((visit) => {
            return Number(visit.id) === visitId;
        });

    if (!selectedVisit) {
        return;
    }

    const matchingPlace =
        navigationPlaces.find((place) => {
            return place.name === selectedVisit.placeName;
        });

    if (!matchingPlace) {
        return;
    }

    selectPlace(matchingPlace.id);

    const matchingBranch =
        matchingPlace.branches.find((branch) => {
            return branch.name === selectedVisit.branchName;
        });

    if (matchingBranch) {
        document.getElementById(
            "branchSelect"
        ).value = matchingBranch.id;

        renderBranchLocations();
        updateNavigationSummary();
    }
};

const selectPlace = (placeId) => {
    const matchingPlace =
        navigationPlaces.find((place) => {
            return place.id === placeId;
        });

    if (!matchingPlace) {
        return;
    }

    document.getElementById(
        "placeSelect"
    ).value = matchingPlace.id;

    renderBranches();
    updateNavigationSummary();
};

const showNavigationStatus = (message, type) => {
    const navigationStatus =
        document.getElementById("navigationStatus");

    navigationStatus.className =
        `alert alert-${type} mt-4`;

    navigationStatus.textContent = message;
};

const clearNavigationStatus = () => {
    const navigationStatus =
        document.getElementById("navigationStatus");

    navigationStatus.className =
        "alert d-none mt-4";

    navigationStatus.textContent = "";
};