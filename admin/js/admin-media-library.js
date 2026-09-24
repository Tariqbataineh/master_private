
"use strict";

const STORAGE_KEY =
    "wusoolMediaLibrary";

const readMedia = () => {
    try {
        const saved =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "[]"
            );

        if (
            Array.isArray(saved) &&
            saved.length
        ) {
            return saved;
        }
    } catch {
        // Fall through to defaults.
    }

    return [
        {
            id: 1,
            name:
                "home-hero.jpg",
            type:
                "Hero",
            usedIn:
                "User Home",
            src: ""
        },
        {
            id: 2,
            name:
                "organization-banner.jpg",
            type:
                "Banner",
            usedIn:
                "Organization Portal",
            src: ""
        }
    ];
};

let mediaItems =
    readMedia();

const mediaGrid =
    document.getElementById(
        "mediaGrid"
    );

const mediaSearch =
    document.getElementById(
        "mediaSearch"
    );

const mediaUpload =
    document.getElementById(
        "mediaUpload"
    );

const persist = () => {
    /*
        Frontend demo only.
        Backend later replaces Data URLs with real file storage.
    */
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            mediaItems
        )
    );
};

const renderMedia = () => {
    const query =
        mediaSearch.value
            .trim()
            .toLowerCase();

    const filtered =
        mediaItems.filter(
            (item) =>
                item.name
                    .toLowerCase()
                    .includes(query) ||
                item.usedIn
                    .toLowerCase()
                    .includes(query)
        );

    mediaGrid.innerHTML =
        filtered
            .map(
                (item) => `
                    <div class="col-12 col-sm-6 col-xl-3">
                        <article class="media-card">
                            <div class="media-preview">
                                ${
                                    item.src
                                        ? `<img src="${item.src}" alt="${item.name}" class="w-100 h-100 object-fit-cover">`
                                        : `<i class="bi bi-image"></i>`
                                }
                            </div>

                            <div class="media-card-body">
                                <strong class="d-block text-truncate">
                                    ${item.name}
                                </strong>

                                <small class="text-secondary d-block">
                                    ${item.type} · ${item.usedIn}
                                </small>

                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger mt-3"
                                    data-delete-id="${item.id}"
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    </div>
                `
            )
            .join("");
};

mediaSearch.addEventListener(
    "input",
    renderMedia
);

mediaUpload.addEventListener(
    "change",
    () => {
        const files =
            Array.from(
                mediaUpload.files
            );

        files.forEach(
            (file) => {
                const reader =
                    new FileReader();

                reader.onload =
                    () => {
                        mediaItems.push({
                            id:
                                Date.now() +
                                Math.random(),
                            name:
                                file.name,
                            type:
                                "Uploaded",
                            usedIn:
                                "Available in Admin",
                            src:
                                reader.result
                        });

                        persist();
                        renderMedia();
                    };

                reader.readAsDataURL(
                    file
                );
            }
        );
    }
);

mediaGrid.addEventListener(
    "click",
    (event) => {
        const button =
            event.target.closest(
                "[data-delete-id]"
            );

        if (!button) {
            return;
        }

        mediaItems =
            mediaItems.filter(
                (item) =>
                    String(item.id) !==
                    String(
                        button.dataset
                            .deleteId
                    )
            );

        persist();
        renderMedia();
    }
);

renderMedia();
