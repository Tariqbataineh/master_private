const photoCategories = [
    {
        key: "main-entrance",
        title: "Main Entrance",
        description: "Show the main entrance from outside.",
        icon: "bi-door-open",
        required: true
    },
    {
        key: "entrance-route",
        title: "Entrance Route",
        description: "Show the ramp, stairs, or step-free route.",
        icon: "bi-signpost-split",
        required: true
    },
    {
        key: "accessible-parking",
        title: "Accessible Parking",
        description: "Show parking spaces and the route to the entrance.",
        icon: "bi-p-square",
        required: false
    },
    {
        key: "internal-pathway",
        title: "Internal Pathway",
        description: "Show the main path inside the branch.",
        icon: "bi-arrows-move",
        required: true
    },
    {
        key: "reception-counter",
        title: "Reception or Service Counter",
        description: "Show the reception and customer service area.",
        icon: "bi-person-workspace",
        required: false
    },
    {
        key: "elevator",
        title: "Elevator",
        description: "Show the elevator entrance and control buttons.",
        icon: "bi-building-up",
        required: false
    },
    {
        key: "accessible-restroom",
        title: "Accessible Restroom",
        description: "Show the restroom entrance and accessibility signs.",
        icon: "bi-universal-access",
        required: false
    },
    {
        key: "destination-area",
        title: "Destination and Landmarks",
        description: "Show departments, signs, or final service locations.",
        icon: "bi-geo-alt",
        required: true
    }
];

const storageKeys = {
    branches: "wusoolOrganizationBranches",
    currentDraft: "wusoolCurrentBranchDraft",
    organization: "wusoolOrganization",
    loggedIn: "wusoolOrganizationLoggedIn",
    subscription: "wusoolActiveSubscription"
};

const maximumPhotoSize = 5 * 1024 * 1024;
const maximumPhotosPerCategory = 3;

let currentBranch = null;
let uploadedPhotos = [];
let photoDescriptions = {};
let previewUrls = new Map();

document.addEventListener("DOMContentLoaded", () => {
    protectPage();
    loadOrganizationInformation();
    loadCurrentBranch();
    renderPhotoCategories();
    restoreBranchPhotos();
    configureNavigation();
    configureForm();
    configureSidebar();
    updateUploadSummary();
});

const protectPage = () => {
    const isLoggedIn =
        sessionStorage.getItem(storageKeys.loggedIn) === "true";

    const subscription = getStoredObject(
        storageKeys.subscription,
        null
    );

    if (!isLoggedIn) {
        window.location.href = "./organization-login.html";
        return;
    }

    if (!subscription) {
        window.location.href = "./subscription-plans.html";
    }
};

const loadOrganizationInformation = () => {
    const organization =
        getStoredObject(storageKeys.organization, {});

    const registration =
        getStoredObject("wusoolOrganizationRegistration", {});

    const organizationName =
        organization.organizationName ||
        organization.name ||
        registration.organizationName ||
        registration.name ||
        "Organization";

    document.getElementById("organizationName").textContent =
        organizationName;
};

const loadCurrentBranch = () => {
    const parameters =
        new URLSearchParams(window.location.search);

    const branchId = parameters.get("id");

    const branches =
        getStoredObject(storageKeys.branches, []);

    currentBranch =
        branches.find((branch) => {
            return String(branch.id) === String(branchId);
        }) || getStoredObject(storageKeys.currentDraft, null);

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

    const location =
        locationParts.join(", ") ||
        currentBranch.address ||
        "Location not specified";

    document.getElementById("branchNameBadge").textContent =
        branchName;

    document.getElementById("currentBranchName").textContent =
        branchName;

    document.getElementById("currentBranchLocation").textContent =
        location;

    document.title = `${branchName} Photos | Wusool`;
};

const renderPhotoCategories = () => {
    const categoriesContainer =
        document.getElementById("photoCategories");

    categoriesContainer.innerHTML =
        photoCategories.map((category) => {
            const badge = category.required
                ? `<span class="required-badge">Required</span>`
                : `<span class="optional-badge">Optional</span>`;

            return `
                <article class="col-12 col-lg-6">
                    <div
                        class="photo-category-card"
                        id="category-${category.key}"
                    >
                        <header class="photo-category-header">

                            <div class="photo-category-title">

                                <span class="photo-category-icon">
                                    <i class="bi ${category.icon}"></i>
                                </span>

                                <div>
                                    <h3>${category.title}</h3>
                                    <p>${category.description}</p>
                                </div>

                            </div>

                            ${badge}

                        </header>

                        <label
                            class="photo-upload-zone"
                            for="photo-${category.key}"
                        >
                            <i class="bi bi-cloud-arrow-up"></i>

                            <strong>Choose Photos</strong>

                            <small>
                                JPEG, PNG or WebP — up to 3 photos
                            </small>

                            <input
                                type="file"
                                class="photo-input"
                                id="photo-${category.key}"
                                data-category="${category.key}"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                            >
                        </label>

                        <div
                            class="photo-preview-list"
                            id="preview-${category.key}"
                        ></div>

                        <div class="location-label">
                            <label
                                for="description-${category.key}"
                                class="form-label small fw-semibold"
                            >
                                Location or landmark description
                            </label>

                            <input
                                type="text"
                                class="form-control"
                                id="description-${category.key}"
                                data-description="${category.key}"
                                placeholder="Example: Reception, ground floor"
                                maxlength="100"
                            >
                        </div>

                    </div>
                </article>
            `;
        }).join("");

    document
        .querySelectorAll(".photo-input")
        .forEach((input) => {
            input.addEventListener(
                "change",
                handlePhotoSelection
            );
        });

    document
        .querySelectorAll("[data-description]")
        .forEach((input) => {
            input.addEventListener("input", (event) => {
                const categoryKey =
                    event.target.dataset.description;

                photoDescriptions[categoryKey] =
                    event.target.value.trim();
            });
        });

    categoriesContainer.addEventListener(
        "click",
        handlePhotoRemoval
    );
};

const restoreBranchPhotos = () => {
    uploadedPhotos =
        Array.isArray(currentBranch.photos)
            ? currentBranch.photos
            : [];

    photoDescriptions =
        currentBranch.photoDescriptions || {};

    photoCategories.forEach((category) => {
        const descriptionInput =
            document.getElementById(
                `description-${category.key}`
            );

        if (descriptionInput) {
            descriptionInput.value =
                photoDescriptions[category.key] || "";
        }

        renderCategoryPreviews(category.key);
    });
};

const handlePhotoSelection = async (event) => {
    const input = event.target;
    const categoryKey = input.dataset.category;
    const selectedFiles = Array.from(input.files);

    hideValidationAlert();

    const existingCategoryPhotos =
        uploadedPhotos.filter((photo) => {
            return photo.categoryKey === categoryKey;
        });

    const remainingPhotoSlots =
        maximumPhotosPerCategory -
        existingCategoryPhotos.length;

    if (remainingPhotoSlots <= 0) {
        showValidationAlert(
            "You can upload a maximum of three photos for this category."
        );

        input.value = "";
        return;
    }

    const filesToAdd =
        selectedFiles.slice(0, remainingPhotoSlots);

    for (const file of filesToAdd) {
        const validationMessage = validatePhoto(file);

        if (validationMessage) {
            showValidationAlert(validationMessage);
            continue;
        }

        try {
            const photoId = createPhotoId();
            const imageData = await compressPhoto(file);

            const photoMetadata = {
                id: photoId,
                categoryKey,
                categoryTitle:
                    getCategoryTitle(categoryKey),
                name: file.name,
                type: file.type,
                size: file.size,
                imageData,
                uploadedAt: new Date().toISOString()
            };

            uploadedPhotos.push(photoMetadata);
        } catch (error) {
            console.error("Photo processing failed:", error);

            showValidationAlert(
                `${file.name} could not be processed. Please try another image.`
            );
        }
    }

    if (selectedFiles.length > remainingPhotoSlots) {
        showValidationAlert(
            `Only ${remainingPhotoSlots} additional photo(s) were accepted.`
        );
    }

    input.value = "";

    renderCategoryPreviews(categoryKey);
    updateUploadSummary();
};

const compressPhoto = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                const maximumDimension = 1200;
                const scale = Math.min(
                    1,
                    maximumDimension / Math.max(
                        image.naturalWidth,
                        image.naturalHeight
                    )
                );

                const width = Math.max(
                    1,
                    Math.round(image.naturalWidth * scale)
                );

                const height = Math.max(
                    1,
                    Math.round(image.naturalHeight * scale)
                );

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                canvas.width = width;
                canvas.height = height;

                context.drawImage(image, 0, 0, width, height);

                resolve(
                    canvas.toDataURL("image/jpeg", 0.72)
                );
            };

            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const validatePhoto = (file) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        return `${file.name} is not a supported image format.`;
    }

    if (file.size > maximumPhotoSize) {
        return `${file.name} is larger than 5 MB.`;
    }

    return "";
};

const renderCategoryPreviews = (categoryKey) => {
    const previewContainer =
        document.getElementById(`preview-${categoryKey}`);

    const categoryPhotos =
        uploadedPhotos.filter((photo) => {
            return photo.categoryKey === categoryKey;
        });

    if (categoryPhotos.length === 0) {
        previewContainer.innerHTML = "";
        return;
    }

    previewContainer.innerHTML =
        categoryPhotos.map((photo) => {
            const previewUrl =
                photo.imageData ||
                previewUrls.get(photo.id);

            const previewContent = previewUrl
                ? `
                    <img
                        src="${previewUrl}"
                        alt="${escapeHtml(photo.name)}"
                        class="photo-preview-image"
                    >
                `
                : `
                    <div class="photo-placeholder">
                        <i class="bi bi-image"></i>
                    </div>
                `;

            return `
                <article class="photo-preview-item">

                    ${previewContent}

                    <button
                        type="button"
                        class="remove-photo-button"
                        data-remove-photo="${photo.id}"
                        aria-label="Remove ${escapeHtml(photo.name)}"
                    >
                        <i class="bi bi-x-lg"></i>
                    </button>

                    <div class="photo-preview-details">
                        <span class="photo-name">
                            ${escapeHtml(photo.name)}
                        </span>

                        <span class="photo-size">
                            ${formatFileSize(photo.size)}
                        </span>
                    </div>

                </article>
            `;
        }).join("");
};

const handlePhotoRemoval = (event) => {
    const removeButton =
        event.target.closest("[data-remove-photo]");

    if (!removeButton) {
        return;
    }

    const photoId =
        removeButton.dataset.removePhoto;

    const selectedPhoto =
        uploadedPhotos.find((photo) => {
            return photo.id === photoId;
        });

    if (!selectedPhoto) {
        return;
    }

    const previewUrl =
        previewUrls.get(photoId);

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrls.delete(photoId);
    }

    uploadedPhotos =
        uploadedPhotos.filter((photo) => {
            return photo.id !== photoId;
        });

    renderCategoryPreviews(
        selectedPhoto.categoryKey
    );

    updateUploadSummary();
};

const updateUploadSummary = () => {
    const requiredCategories =
        photoCategories.filter((category) => {
            return category.required;
        });

    const completedRequiredCategories =
        requiredCategories.filter((category) => {
            return uploadedPhotos.some((photo) => {
                return photo.categoryKey === category.key;
            });
        });

    const progressPercentage =
        requiredCategories.length > 0
            ? (
                completedRequiredCategories.length /
                requiredCategories.length
            ) * 100
            : 0;

    document.getElementById(
        "uploadedPhotoCount"
    ).textContent = uploadedPhotos.length;

    document.getElementById(
        "requiredPhotoCount"
    ).textContent =
        `${completedRequiredCategories.length} / ` +
        `${requiredCategories.length}`;

    document.getElementById(
        "photoProgressBar"
    ).style.width = `${progressPercentage}%`;

    photoCategories.forEach((category) => {
        const categoryCard =
            document.getElementById(
                `category-${category.key}`
            );

        const hasPhoto =
            uploadedPhotos.some((photo) => {
                return photo.categoryKey === category.key;
            });

        categoryCard.classList.toggle(
            "required-missing",
            category.required &&
            !hasPhoto &&
            !document
                .getElementById("photoValidationAlert")
                .classList.contains("d-none")
        );
    });
};

const configureForm = () => {
    const form =
        document.getElementById("branchPhotosForm");

    const saveDraftButton =
        document.getElementById("saveDraftButton");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!validateRequiredPhotos()) {
            return;
        }

        saveBranchPhotos(true);

        showToast(
            "Photos saved. Opening the AI accessibility review."
        );

        window.setTimeout(() => {
            window.location.href =
                `./branch-ai-review.html?id=${encodeURIComponent(
                    currentBranch.id
                )}`;
        }, 600);
    });

    saveDraftButton.addEventListener("click", () => {
        saveBranchPhotos(false);

        showToast(
            "Branch photo draft saved successfully."
        );
    });
};

const validateRequiredPhotos = () => {
    const missingCategories =
        photoCategories.filter((category) => {
            if (!category.required) {
                return false;
            }

            return !uploadedPhotos.some((photo) => {
                return photo.categoryKey === category.key;
            });
        });

    if (missingCategories.length === 0) {
        hideValidationAlert();
        return true;
    }

    const missingTitles =
        missingCategories
            .map((category) => category.title)
            .join(", ");

    showValidationAlert(
        `Upload at least one photo for: ${missingTitles}.`
    );

    document
        .getElementById(
            `category-${missingCategories[0].key}`
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    return false;
};

const saveBranchPhotos = (isStepCompleted) => {
    collectDescriptions();

    const branches =
        getStoredObject(storageKeys.branches, []);

    const branchIndex =
        branches.findIndex((branch) => {
            return String(branch.id) ===
                   String(currentBranch.id);
        });

    const updatedBranch = {
        ...currentBranch,

        photos: uploadedPhotos,

        photoDescriptions,

        completedSteps: {
            ...(currentBranch.completedSteps || {}),
            photos: isStepCompleted
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

const collectDescriptions = () => {
    document
        .querySelectorAll("[data-description]")
        .forEach((input) => {
            photoDescriptions[
                input.dataset.description
            ] = input.value.trim();
        });
};

const configureNavigation = () => {
    const backButton =
        document.getElementById("backButton");

    backButton.href =
        `./branch-accessibility.html?id=${encodeURIComponent(
            currentBranch.id
        )}`;

    document
        .getElementById("logoutButton")
        .addEventListener("click", () => {
            sessionStorage.removeItem(
                storageKeys.loggedIn
            );

            window.location.href =
                "./organization-login.html";
        });
};

const configureSidebar = () => {
    const sidebar =
        document.getElementById("organizationSidebar");

    const toggleButton =
        document.getElementById("sidebarToggle");

    const backdrop =
        document.getElementById("sidebarBackdrop");

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

const showValidationAlert = (message) => {
    const alert =
        document.getElementById(
            "photoValidationAlert"
        );

    document.getElementById(
        "photoValidationMessage"
    ).textContent = message;

    alert.classList.remove("d-none");

    updateUploadSummary();
};

const hideValidationAlert = () => {
    document
        .getElementById("photoValidationAlert")
        .classList.add("d-none");

    document
        .querySelectorAll(".photo-category-card")
        .forEach((card) => {
            card.classList.remove("required-missing");
        });
};

const showToast = (message) => {
    document.getElementById(
        "toastMessage"
    ).textContent = message;

    const toastElement =
        document.getElementById("saveToast");

    const toast =
        bootstrap.Toast.getOrCreateInstance(
            toastElement
        );

    toast.show();
};

const getCategoryTitle = (categoryKey) => {
    const category =
        photoCategories.find((item) => {
            return item.key === categoryKey;
        });

    return category
        ? category.title
        : "Branch Photo";
};

const createPhotoId = () => {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );
};

const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
    }

    if (sizeInBytes < 1024 * 1024) {
        return `${(
            sizeInBytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        sizeInBytes / (1024 * 1024)
    ).toFixed(1)} MB`;
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

window.addEventListener("beforeunload", () => {
    previewUrls.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
    });
});