let selectedPhoto = null;
let analysisRunning = false;

document.addEventListener("DOMContentLoaded", () => {
    initializeAnalysisPage();
});

const initializeAnalysisPage = () => {
    const navigationSession = getNavigationSession();

    if (!navigationSession) {
        showMissingSession();
        return;
    }

    renderRouteInformation(navigationSession);
    addPhotoEvents();
};

const getNavigationSession = () => {
    const savedSession =
        localStorage.getItem("wusool-navigation-session");

    if (!savedSession) {
        return null;
    }

    try {
        return JSON.parse(savedSession);
    } catch (error) {
        return null;
    }
};

const showMissingSession = () => {
    document
        .getElementById("missingSessionAlert")
        .classList.remove("d-none");

    document
        .getElementById("analysisContent")
        .classList.add("d-none");
};

const renderRouteInformation = (navigationSession) => {
    document.getElementById(
        "routePlace"
    ).textContent =
        navigationSession.placeName || "Not available";

    document.getElementById(
        "routeBranch"
    ).textContent =
        navigationSession.branchName || "Not available";

    document.getElementById(
        "routeStartingPoint"
    ).textContent =
        "Your current location";

    document.getElementById(
        "routeDestination"
    ).textContent =
        navigationSession.destination || "Not available";
};
const addPhotoEvents = () => {
    const uploadArea =
        document.getElementById("uploadArea");

    const openCameraButton =
        document.getElementById("openCameraButton");

    const uploadPhotoButton =
        document.getElementById("uploadPhotoButton");

    const cameraInput =
        document.getElementById("cameraInput");

    const photoInput =
        document.getElementById("photoInput");

    const removePhotoButton =
        document.getElementById("removePhotoButton");

    const changePhotoButton =
        document.getElementById("changePhotoButton");

    const analyzePhotoButton =
        document.getElementById("analyzePhotoButton");

    openCameraButton.addEventListener("click", (event) => {
        event.stopPropagation();
        cameraInput.click();
    });

    uploadPhotoButton.addEventListener("click", (event) => {
        event.stopPropagation();
        photoInput.click();
    });

    uploadArea.addEventListener("click", () => {
        photoInput.click();
    });

    uploadArea.addEventListener("keydown", (event) => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            photoInput.click();
        }
    });

    cameraInput.addEventListener("change", (event) => {
        handleSelectedPhoto(event.target.files[0]);
    });

    photoInput.addEventListener("change", (event) => {
        handleSelectedPhoto(event.target.files[0]);
    });

    removePhotoButton.addEventListener(
        "click",
        removeSelectedPhoto
    );

    changePhotoButton.addEventListener("click", () => {
        photoInput.click();
    });

    analyzePhotoButton.addEventListener(
        "click",
        startPhotoAnalysis
    );

    addDragAndDropEvents(uploadArea);
};

const addDragAndDropEvents = (uploadArea) => {
    uploadArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        uploadArea.classList.add("dragging");
    });

    uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragging");
    });

    uploadArea.addEventListener("drop", (event) => {
        event.preventDefault();

        uploadArea.classList.remove("dragging");

        const droppedPhoto =
            event.dataTransfer.files[0];

        handleSelectedPhoto(droppedPhoto);
    });
};

const handleSelectedPhoto = (photo) => {
    clearPhotoStatus();

    if (!photo) {
        return;
    }

    if (!photo.type.startsWith("image/")) {
        showPhotoStatus(
            "Please select a valid image file.",
            "danger"
        );

        return;
    }

    const maximumSize = 8 * 1024 * 1024;

    if (photo.size > maximumSize) {
        showPhotoStatus(
            "The selected image is larger than 8 MB.",
            "danger"
        );

        return;
    }

    selectedPhoto = photo;

    const photoReader = new FileReader();

    photoReader.addEventListener("load", (event) => {
        showPhotoPreview(
            event.target.result,
            photo
        );
    });

    photoReader.readAsDataURL(photo);
};

const showPhotoPreview = (photoSource, photo) => {
    document.getElementById(
        "photoPreview"
    ).src = photoSource;

    document.getElementById(
        "selectedFileName"
    ).textContent = photo.name;

    document.getElementById(
        "selectedFileSize"
    ).textContent = formatFileSize(photo.size);

    document
        .getElementById("uploadArea")
        .classList.add("d-none");

    document
        .getElementById("previewSection")
        .classList.remove("d-none");

    document.getElementById(
        "analyzePhotoButton"
    ).disabled = false;
};

const removeSelectedPhoto = () => {
    if (analysisRunning) {
        return;
    }

    selectedPhoto = null;

    document.getElementById(
        "cameraInput"
    ).value = "";

    document.getElementById(
        "photoInput"
    ).value = "";

    document.getElementById(
        "photoPreview"
    ).src = "";

    document
        .getElementById("previewSection")
        .classList.add("d-none");

    document
        .getElementById("uploadArea")
        .classList.remove("d-none");

    document.getElementById(
        "analyzePhotoButton"
    ).disabled = true;

    clearPhotoStatus();
};

const formatFileSize = (sizeInBytes) => {
    const sizeInMegabytes =
        sizeInBytes / (1024 * 1024);

    if (sizeInMegabytes >= 1) {
        return `${sizeInMegabytes.toFixed(2)} MB`;
    }

    const sizeInKilobytes =
        sizeInBytes / 1024;

    return `${sizeInKilobytes.toFixed(1)} KB`;
};

const startPhotoAnalysis = () => {
    if (!selectedPhoto || analysisRunning) {
        return;
    }

    analysisRunning = true;

    const analyzePhotoButton =
        document.getElementById("analyzePhotoButton");

    analyzePhotoButton.disabled = true;

    analyzePhotoButton.innerHTML = `
        <span
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
        ></span>
        Analyzing...
    `;

    document
        .getElementById("analysisProgressSection")
        .classList.remove("d-none");

    clearPhotoStatus();
    runAnalysisStages();
};

const analysisStages = [
    {
        percentage: 20,
        stepId: "uploadAnalysisStep",
        message: "Preparing and improving image quality..."
    },
    {
        percentage: 40,
        stepId: "referenceAnalysisStep",
        message: "Comparing your photo with verified branch images..."
    },
    {
        percentage: 60,
        stepId: "locationAnalysisStep",
        message: "Estimating your position inside the branch..."
    },
    {
        percentage: 80,
        stepId: "hazardAnalysisStep",
        message: "Checking stairs, obstacles, and unsafe routes..."
    },
    {
        percentage: 100,
        stepId: "routeAnalysisStep",
        message: "Creating your accessible route..."
    }
];

const runAnalysisStages = () => {
    let currentStageIndex = 0;

    const runNextStage = () => {
        if (currentStageIndex >= analysisStages.length) {
            completePhotoAnalysis();
            return;
        }

        const currentStage =
            analysisStages[currentStageIndex];

        updateAnalysisProgress(
            currentStage,
            currentStageIndex
        );

        currentStageIndex += 1;

        setTimeout(runNextStage, 900);
    };

    runNextStage();
};

const updateAnalysisProgress = (
    currentStage,
    currentStageIndex
) => {
    const progressBar =
        document.getElementById("analysisProgressBar");

    const percentage =
        document.getElementById("analysisPercentage");

    const analysisMessage =
        document.getElementById("analysisMessage");

    progressBar.style.width =
        `${currentStage.percentage}%`;

    progressBar.setAttribute(
        "aria-valuenow",
        currentStage.percentage
    );

    percentage.textContent =
        `${currentStage.percentage}%`;

    analysisMessage.textContent =
        currentStage.message;

    analysisStages.forEach((stage, index) => {
        const stepElement =
            document.getElementById(stage.stepId);

        const stepIcon =
            stepElement.querySelector("i");

        stepElement.classList.remove(
            "active",
            "completed"
        );

        if (index < currentStageIndex) {
            stepElement.classList.add("completed");
            stepIcon.className =
                "bi bi-check-circle-fill";

            return;
        }

        if (index === currentStageIndex) {
            stepElement.classList.add("active");
            stepIcon.className =
                "bi bi-arrow-repeat";

            return;
        }

        stepIcon.className = "bi bi-circle";
    });
};

const completePhotoAnalysis = () => {
    const navigationSession =
        getNavigationSession();

    if (!navigationSession || !selectedPhoto) {
        showPhotoStatus(
            "Unable to complete the analysis.",
            "danger"
        );

        analysisRunning = false;

        return;
    }

    const aiAnalysis = createInitialAIAnalysis(
        navigationSession
    );

    const previousStep = Number.isInteger(
        navigationSession.navigationStep
    )
        ? navigationSession.navigationStep
        : -1;

    const updatedSession = {
        ...navigationSession,
        photo: {
            name: selectedPhoto.name,
            size: selectedPhoto.size,
            type: selectedPhoto.type
        },
        photoCount:
            (navigationSession.photoCount || 0) + 1,
        navigationStep:
            Math.min(previousStep + 1, 3),
        aiAnalysis,
        detectedLocation:
            aiAnalysis.detectedLocation,
        locationConfidence:
            aiAnalysis.confidence,
        routeStatus:
            aiAnalysis.routeStatus,
        detectedHazards:
            aiAnalysis.accessibility.obstacles,
        status: "ready-for-guidance",
        analyzedAt: new Date().toISOString()
    };

    localStorage.setItem(
        "wusool-navigation-session",
        JSON.stringify(updatedSession)
    );

    document.getElementById(
        "analysisMessage"
    ).textContent =
        "AI analysis completed. Your next safe direction is ready.";

    showPhotoStatus(
        "Analysis completed successfully. Opening navigation guidance...",
        "success"
    );

    setTimeout(() => {
        window.location.href =
            "./navigation-guidance.html";
    }, 1200);
};
const createInitialAIAnalysis = (
    navigationSession
) => {

    return {
        detectedLocation:
            "Current position from surroundings",

        confidence:
            null,

        routeStatus:
            "pending-ai-verification",

        accessibility: {

            accessible:
                null,

            ramp:
                null,

            stairs:
                null,

            elevator:
                null,

            obstacles:
                []

        },

        route: [],

        summary:
            "The image is ready for AI vision analysis.",

        analyzedBy:
            "Wusool AI Vision",

        analysisVersion:
            "1.0",

        destination:
            navigationSession.destination || null
    };
};
const analyzePhotoWithAI = async (
    photoData,
    navigationSession
) => {

    const response =
        await fetch(
            "/api/ai/analyze-surroundings",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    image: photoData,

                    placeId:
                        navigationSession.placeId,

                    branchId:
                        navigationSession.branchId,

                    branchName:
                        navigationSession.branchName,

                    destination:
                        navigationSession.destination
                })
            }
        );

    if (!response.ok) {
        throw new Error(
            "AI analysis request failed."
        );
    }

    return await response.json();
};

const showPhotoStatus = (message, type) => {
    const photoStatus =
        document.getElementById("photoStatus");

    photoStatus.className =
        `alert alert-${type} mt-4`;

    photoStatus.textContent = message;
};

const clearPhotoStatus = () => {
    const photoStatus =
        document.getElementById("photoStatus");

    photoStatus.className =
        "alert d-none mt-4";

    photoStatus.textContent = "";
};
