const storageKeys = {
    branches: "wusoolOrganizationBranches",
    currentDraft: "wusoolCurrentBranchDraft",
    organization: "wusoolOrganization",
    registration: "wusoolOrganizationRegistration",
    loggedIn: "wusoolOrganizationLoggedIn",
    subscription: "wusoolActiveSubscription"
};

const photoCategories = [
    {
        key: "main-entrance",
        title: "Main Entrance",
        required: true
    },
    {
        key: "entrance-route",
        title: "Entrance Route",
        required: true
    },
    {
        key: "accessible-parking",
        title: "Accessible Parking",
        required: false
    },
    {
        key: "internal-pathway",
        title: "Internal Pathway",
        required: true
    },
    {
        key: "reception-counter",
        title: "Reception or Service Counter",
        required: false
    },
    {
        key: "elevator",
        title: "Elevator",
        required: false
    },
    {
        key: "accessible-restroom",
        title: "Accessible Restroom",
        required: false
    },
    {
        key: "destination-area",
        title: "Destination and Landmarks",
        required: true
    }
];

const defaultFeatures = [
    {
        key: "accessible-entrance",
        title: "Accessible Entrance"
    },
    {
        key: "entrance-ramp",
        title: "Entrance Ramp"
    },
    {
        key: "accessible-parking",
        title: "Accessible Parking"
    },
    {
        key: "elevator",
        title: "Elevator"
    },
    {
        key: "accessible-restroom",
        title: "Accessible Restroom"
    },
    {
        key: "wide-pathways",
        title: "Wide Pathways"
    },
    {
        key: "automatic-doors",
        title: "Automatic Doors"
    },
    {
        key: "tactile-paving",
        title: "Tactile Paving"
    },
    {
        key: "braille-signs",
        title: "Braille Signs"
    },
    {
        key: "hearing-support",
        title: "Hearing Support"
    },
    {
        key: "wheelchair-service",
        title: "Wheelchair Service"
    },
    {
        key: "staff-assistance",
        title: "Staff Assistance"
    }
];

let currentBranch = null;
let analysisResult = null;
let analysisTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    protectPage();
    loadOrganizationInformation();
    loadCurrentBranch();
    configureNavigation();
    configureSidebar();

    startAnalysis();
});

const protectPage = () => {
    const isLoggedIn =
        sessionStorage.getItem(storageKeys.loggedIn) === "true";

    const activeSubscription =
        getStoredObject(storageKeys.subscription, null);

    if (!isLoggedIn) {
        window.location.href =
            "./organization-login.html";

        return;
    }

    if (!activeSubscription) {
        window.location.href =
            "./subscription-plans.html";
    }
};

const loadOrganizationInformation = () => {
    const organization =
        getStoredObject(storageKeys.organization, {});

    const registration =
        getStoredObject(storageKeys.registration, {});

    const organizationName =
        organization.organizationName ||
        organization.name ||
        registration.organizationName ||
        registration.name ||
        "Organization";

    document.getElementById(
        "organizationName"
    ).textContent = organizationName;
};

const loadCurrentBranch = () => {
    const parameters =
        new URLSearchParams(window.location.search);

    const branchId = parameters.get("id");

    const branches =
        getStoredObject(storageKeys.branches, []);

    currentBranch =
        branches.find((branch) => {
            return String(branch.id) ===
                   String(branchId);
        }) ||
        getStoredObject(storageKeys.currentDraft, null);

    if (!currentBranch) {
        window.location.href = "./branches.html";
        return;
    }

    const branchName =
        currentBranch.branchName ||
        currentBranch.name ||
        "New Branch";

    const locationParts = [
        currentBranch.city,
        currentBranch.district
    ].filter(Boolean);

    const branchLocation =
        locationParts.join(", ") ||
        currentBranch.address ||
        "Location not specified";

    document.getElementById(
        "branchNameBadge"
    ).textContent = branchName;

    document.getElementById(
        "currentBranchName"
    ).textContent = branchName;

    document.getElementById(
        "currentBranchLocation"
    ).textContent = branchLocation;

    document.title =
        `${branchName} AI Review | Wusool`;
};

const startAnalysis = () => {
    if (analysisTimer) {
        clearInterval(analysisTimer);
    }

    const loadingSection =
        document.getElementById("analysisLoading");

    const resultsSection =
        document.getElementById("analysisResults");

    loadingSection.classList.remove("d-none");
    resultsSection.classList.add("d-none");

    let progress = 0;

    updateAnalysisProgress(
        0,
        "Reviewing accessibility features..."
    );

    analysisTimer = window.setInterval(() => {
        progress += 10;

        if (progress === 30) {
            updateAnalysisProgress(
                progress,
                "Checking uploaded branch photos..."
            );
        } else if (progress === 60) {
            updateAnalysisProgress(
                progress,
                "Identifying missing information..."
            );
        } else if (progress === 80) {
            updateAnalysisProgress(
                progress,
                "Preparing accessibility suggestions..."
            );
        } else {
            updateAnalysisProgress(progress);
        }

        if (progress >= 100) {
            clearInterval(analysisTimer);

            analysisResult =
                generateAnalysisResult();

            saveAnalysisResult();
            renderAnalysisResult();

            window.setTimeout(() => {
                loadingSection.classList.add("d-none");
                resultsSection.classList.remove("d-none");

                resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 350);
        }
    }, 220);
};

const updateAnalysisProgress = (
    progress,
    message = ""
) => {
    document.getElementById(
        "analysisProgressBar"
    ).style.width = `${progress}%`;

    document.getElementById(
        "analysisPercentage"
    ).textContent = `${progress}%`;

    if (message) {
        document.getElementById(
            "analysisLoadingText"
        ).textContent = message;
    }
};

const generateAnalysisResult = () => {
    const featureResults =
        normalizeAccessibilityFeatures();

    const availableFeatures =
        featureResults.filter((feature) => {
            return feature.status === "available";
        });

    const unavailableFeatures =
        featureResults.filter((feature) => {
            return feature.status === "not-available";
        });

    const uncertainFeatures =
        featureResults.filter((feature) => {
            return feature.status === "not-sure";
        });

    const photos =
        Array.isArray(currentBranch.photos)
            ? currentBranch.photos
            : [];

    const completedPhotoCategories =
        photoCategories.filter((category) => {
            return photos.some((photo) => {
                return photo.categoryKey === category.key;
            });
        });

    const requiredPhotoCategories =
        photoCategories.filter((category) => {
            return category.required;
        });

    const completedRequiredPhotos =
        requiredPhotoCategories.filter((category) => {
            return photos.some((photo) => {
                return photo.categoryKey === category.key;
            });
        });

    const accessibilityPercentage =
        featureResults.length > 0
            ? (
                availableFeatures.length /
                featureResults.length
            ) * 100
            : 0;

    const photoCoveragePercentage =
        photoCategories.length > 0
            ? (
                completedPhotoCategories.length /
                photoCategories.length
            ) * 100
            : 0;

    const requiredCoveragePercentage =
        requiredPhotoCategories.length > 0
            ? (
                completedRequiredPhotos.length /
                requiredPhotoCategories.length
            ) * 100
            : 0;

    const calculatedScore = Math.round(
        accessibilityPercentage * 0.65 +
        photoCoveragePercentage * 0.15 +
        requiredCoveragePercentage * 0.20
    );

    const score = Math.max(
        0,
        Math.min(calculatedScore, 100)
    );

    const warnings = generateWarnings(
        unavailableFeatures,
        uncertainFeatures,
        photos
    );

    const suggestions = generateSuggestions(
        unavailableFeatures,
        uncertainFeatures,
        photos
    );

    return {
        score,
        scoreLabel: getScoreLabel(score),
        availableFeatures,
        unavailableFeatures,
        uncertainFeatures,
        warnings,
        suggestions,
        photoCount: photos.length,
        completedPhotoCategories:
            completedPhotoCategories.map((category) => {
                return category.key;
            }),
        generatedAt: new Date().toISOString()
    };
};

const normalizeAccessibilityFeatures = () => {
    const accessibility =
        currentBranch.accessibility ||
        currentBranch.accessibilityFeatures ||
        currentBranch.features ||
        {};

    if (Array.isArray(accessibility)) {
        return accessibility.map((feature, index) => {
            const fallbackFeature =
                defaultFeatures[index] || {};

            return {
                key:
                    feature.key ||
                    feature.id ||
                    fallbackFeature.key ||
                    `feature-${index + 1}`,

                title:
                    feature.title ||
                    feature.name ||
                    fallbackFeature.title ||
                    `Accessibility Feature ${index + 1}`,

                status: normalizeStatus(
                    feature.status ||
                    feature.value ||
                    feature.availability
                )
            };
        });
    }

    return defaultFeatures.map((feature) => {
        const storedValue =
            accessibility[feature.key] ??
            accessibility[toCamelCase(feature.key)] ??
            accessibility[feature.title];

        return {
            ...feature,
            status: normalizeStatus(storedValue)
        };
    });
};

const normalizeStatus = (value) => {
    if (
        value === true ||
        value === "available" ||
        value === "Available" ||
        value === "yes" ||
        value === "Yes"
    ) {
        return "available";
    }

    if (
        value === false ||
        value === "not-available" ||
        value === "Not Available" ||
        value === "no" ||
        value === "No"
    ) {
        return "not-available";
    }

    return "not-sure";
};

const generateWarnings = (
    unavailableFeatures,
    uncertainFeatures,
    photos
) => {
    const warnings = [];

    unavailableFeatures.forEach((feature) => {
        warnings.push({
            title: `${feature.title} is not available`,
            description:
                "Visitors may need an alternative route or assistance."
        });
    });

    uncertainFeatures.forEach((feature) => {
        warnings.push({
            title: `${feature.title} needs verification`,
            description:
                "Confirm this feature before submitting the branch."
        });
    });

    photoCategories.forEach((category) => {
        const hasPhoto =
            photos.some((photo) => {
                return photo.categoryKey === category.key;
            });

        if (category.required && !hasPhoto) {
            warnings.push({
                title: `${category.title} photo is missing`,
                description:
                    "Upload a clear reference photo for more accurate AI navigation."
            });
        }
    });

    if (warnings.length === 0) {
        warnings.push({
            title: "No major missing information detected",
            description:
                "The submitted branch information appears complete."
        });
    }

    return warnings;
};

const generateSuggestions = (
    unavailableFeatures,
    uncertainFeatures,
    photos
) => {
    const suggestions = [];

    const unavailableKeys =
        unavailableFeatures.map((feature) => {
            return feature.key;
        });

    if (
        unavailableKeys.includes("entrance-ramp") ||
        unavailableKeys.includes("accessible-entrance")
    ) {
        suggestions.push({
            title: "Improve the entrance route",
            description:
                "Consider adding a compliant ramp or a clearly marked step-free entrance."
        });
    }

    if (
        unavailableKeys.includes("accessible-parking")
    ) {
        suggestions.push({
            title: "Add accessible parking",
            description:
                "Reserve a parking space close to the accessible entrance."
        });
    }

    if (
        unavailableKeys.includes("braille-signs") ||
        unavailableKeys.includes("tactile-paving")
    ) {
        suggestions.push({
            title: "Improve guidance for visual disabilities",
            description:
                "Add tactile paths, Braille signs, and high-contrast directional signs."
        });
    }

    if (
        unavailableKeys.includes("hearing-support")
    ) {
        suggestions.push({
            title: "Provide hearing support",
            description:
                "Consider visual queue displays or hearing assistance systems."
        });
    }

    if (uncertainFeatures.length > 0) {
        suggestions.push({
            title: "Verify uncertain accessibility features",
            description:
                "Ask branch staff to confirm all features marked as Not Sure."
        });
    }

    if (photos.length < 8) {
        suggestions.push({
            title: "Add more internal reference photos",
            description:
                "Upload recognizable hallways, signs, intersections, and destinations for accurate AI navigation."
        });
    }

    if (suggestions.length === 0) {
        suggestions.push({
            title: "Maintain the accessible routes",
            description:
                "Keep pathways clear and update branch photos whenever the building layout changes."
        });
    }

    return suggestions;
};

const renderAnalysisResult = () => {
    renderStatistics();
    renderScore();
    renderAvailableFeatures();
    renderWarnings();
    renderSuggestions();
    renderPhotoCoverage();
};

const renderStatistics = () => {
    document.getElementById(
        "accessibilityScore"
    ).textContent = `${analysisResult.score}%`;

    document.getElementById(
        "scoreStatus"
    ).textContent = analysisResult.scoreLabel;

    document.getElementById(
        "uploadedPhotosCount"
    ).textContent = analysisResult.photoCount;

    document.getElementById(
        "availableFeaturesCount"
    ).textContent =
        analysisResult.availableFeatures.length;

    document.getElementById(
        "reviewItemsCount"
    ).textContent =
        analysisResult.warnings.length;
};

const renderScore = () => {
    const score = analysisResult.score;
    const scoreDegrees = score * 3.6;

    document.getElementById(
        "scoreCircleValue"
    ).textContent = score;

    document.getElementById(
        "scoreProgressBar"
    ).style.width = `${score}%`;

    document.getElementById(
        "scoreCircle"
    ).style.background = `
        conic-gradient(
            ${getScoreColor(score)} ${scoreDegrees}deg,
            #dcebea ${scoreDegrees}deg
        )
    `;

    document.getElementById(
        "scoreHeading"
    ).textContent = analysisResult.scoreLabel;

    document.getElementById(
        "scoreDescription"
    ).textContent =
        getScoreDescription(score);
};

const renderAvailableFeatures = () => {
    const container =
        document.getElementById(
            "availableFeaturesContainer"
        );

    if (
        analysisResult.availableFeatures.length === 0
    ) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-result">
                    <i class="bi bi-info-circle fs-3"></i>

                    <p class="mb-0 mt-2">
                        No accessibility features are currently
                        marked as available.
                    </p>
                </div>
            </div>
        `;

        return;
    }

    container.innerHTML =
        analysisResult.availableFeatures
            .map((feature) => {
                return `
                    <div class="col-12 col-md-6">
                        <div class="feature-result">

                            <span class="feature-result-icon">
                                <i class="bi bi-check-lg"></i>
                            </span>

                            <div>
                                <strong>
                                    ${escapeHtml(feature.title)}
                                </strong>

                                <small>
                                    Declared available
                                </small>
                            </div>

                        </div>
                    </div>
                `;
            })
            .join("");
};

const renderWarnings = () => {
    const container =
        document.getElementById(
            "warningsContainer"
        );

    container.innerHTML =
        analysisResult.warnings
            .map((warning, index) => {
                return `
                    <div class="analysis-item warning-item">

                        <span class="analysis-item-number">
                            ${index + 1}
                        </span>

                        <div>
                            <h3>
                                ${escapeHtml(warning.title)}
                            </h3>

                            <p>
                                ${escapeHtml(warning.description)}
                            </p>
                        </div>

                    </div>
                `;
            })
            .join("");
};

const renderSuggestions = () => {
    const container =
        document.getElementById(
            "suggestionsContainer"
        );

    container.innerHTML =
        analysisResult.suggestions
            .map((suggestion, index) => {
                return `
                    <div class="analysis-item suggestion-item">

                        <span class="analysis-item-number">
                            ${index + 1}
                        </span>

                        <div>
                            <h3>
                                ${escapeHtml(suggestion.title)}
                            </h3>

                            <p>
                                ${escapeHtml(
                                    suggestion.description
                                )}
                            </p>
                        </div>

                    </div>
                `;
            })
            .join("");
};

const renderPhotoCoverage = () => {
    const container =
        document.getElementById(
            "photoCoverageContainer"
        );

    container.innerHTML =
        photoCategories.map((category) => {
            const isComplete =
                analysisResult.completedPhotoCategories
                    .includes(category.key);

            return `
                <div class="coverage-item">

                    <span class="coverage-name">
                        <i class="bi bi-image"></i>
                        ${category.title}
                    </span>

                    <span class="
                        coverage-status
                        ${isComplete ? "complete" : "missing"}
                    ">
                        ${isComplete ? "Uploaded" : "Missing"}
                    </span>

                </div>
            `;
        }).join("");
};

const saveAnalysisResult = () => {
    const branches =
        getStoredObject(storageKeys.branches, []);

    const branchIndex =
        branches.findIndex((branch) => {
            return String(branch.id) ===
                   String(currentBranch.id);
        });

    const updatedBranch = {
        ...currentBranch,

        aiReview: analysisResult,

        accessibilityScore:
            analysisResult.score,

        completedSteps: {
            ...(currentBranch.completedSteps || {}),
            aiReview: true
        },

        updatedAt: new Date().toISOString()
    };

    if (branchIndex >= 0) {
        branches[branchIndex] = updatedBranch;
    } else {
        branches.push(updatedBranch);
    }

    localStorage.setItem(
        storageKeys.branches,
        JSON.stringify(branches)
    );

    localStorage.setItem(
        storageKeys.currentDraft,
        JSON.stringify(updatedBranch)
    );

    currentBranch = updatedBranch;
};

const configureNavigation = () => {
    const branchId =
        encodeURIComponent(currentBranch.id);

    document.getElementById(
        "backButton"
    ).href = `./branch-photos.html?id=${branchId}`;

    document.getElementById(
        "runAnalysisButton"
    ).addEventListener("click", () => {
        startAnalysis();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    document.getElementById(
        "continueButton"
    ).addEventListener("click", () => {
        window.location.href =
            `./branch-submit-review.html?id=${branchId}`;
    });

    document.getElementById(
        "logoutButton"
    ).addEventListener("click", () => {
        sessionStorage.removeItem(
            storageKeys.loggedIn
        );

        window.location.href =
            "./organization-login.html";
    });
};

const configureSidebar = () => {
    const sidebar =
        document.getElementById(
            "organizationSidebar"
        );

    const toggleButton =
        document.getElementById(
            "sidebarToggle"
        );

    const backdrop =
        document.getElementById(
            "sidebarBackdrop"
        );

    const closeSidebar = () => {
        sidebar.classList.remove("show");
        backdrop.classList.remove("show");
    };

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("show");
        backdrop.classList.toggle("show");
    });

    backdrop.addEventListener(
        "click",
        closeSidebar
    );

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 992) {
            closeSidebar();
        }
    });
};

const getScoreLabel = (score) => {
    if (score >= 85) {
        return "Excellent Accessibility";
    }

    if (score >= 70) {
        return "Very Good Accessibility";
    }

    if (score >= 55) {
        return "Good Accessibility";
    }

    if (score >= 40) {
        return "Needs Improvement";
    }

    return "Major Improvements Required";
};

const getScoreDescription = (score) => {
    if (score >= 85) {
        return "The branch provides strong accessibility support. Maintain the facilities and keep reference photos updated.";
    }

    if (score >= 70) {
        return "The branch has good accessibility coverage with a few items that should be verified or improved.";
    }

    if (score >= 55) {
        return "The branch includes useful accessibility features, but several areas still require improvement.";
    }

    if (score >= 40) {
        return "Important accessibility facilities or reference information are currently missing.";
    }

    return "The branch needs significant accessibility improvements before providing confident visitor guidance.";
};

const getScoreColor = (score) => {
    if (score >= 70) {
        return "#087f78";
    }

    if (score >= 50) {
        return "#e99a13";
    }

    return "#cf3f4f";
};

const toCamelCase = (value) => {
    return value.replace(
        /-([a-z])/g,
        (_, character) => character.toUpperCase()
    );
};

const escapeHtml = (value) => {
    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent =
        String(value || "");

    return temporaryElement.innerHTML;
};

const getStoredObject = (
    storageKey,
    fallbackValue
) => {
    try {
        const storedValue =
            localStorage.getItem(storageKey);

        return storedValue
            ? JSON.parse(storedValue)
            : fallbackValue;
    } catch (error) {
        console.error(
            `Unable to read ${storageKey}:`,
            error
        );

        return fallbackValue;
    }
};