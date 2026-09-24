
"use strict";

const versionsList =
    document.getElementById(
        "versionsList"
    );

const versionDetails =
    document.getElementById(
        "versionDetails"
    );


const render = () => {
    const versions =
        WusoolVersionService
            .getVersions();

    versionsList.innerHTML =
        versions.length
            ? versions
                .map(
                    (item) => `
                        <div class="version-item">

                            <span class="builder-icon">
                                <i class="bi bi-clock-history"></i>
                            </span>

                            <div>
                                <div class="d-flex flex-wrap gap-2 align-items-center">
                                    <strong>
                                        ${item.area}
                                    </strong>

                                    <span class="badge text-bg-light border">
                                        ${new Date(item.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <p class="text-secondary mb-1 mt-2">
                                    ${item.description}
                                </p>

                                <small class="text-secondary">
                                    ${item.actor}
                                </small>
                            </div>

                            <div class="d-flex flex-column gap-2">
                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    data-view-version="${item.id}"
                                >
                                    Details
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-primary"
                                    data-restore-version="${item.id}"
                                >
                                    Restore
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    data-delete-version="${item.id}"
                                >
                                    Delete
                                </button>
                            </div>

                        </div>
                    `
                )
                .join("")
            : `
                <div class="text-center py-5 text-secondary">
                    No versions yet. Publish a Page Builder, Form or Accessibility change first.
                </div>
            `;
};


versionsList.addEventListener(
    "click",
    (event) => {
        const view =
            event.target.closest(
                "[data-view-version]"
            );

        const restore =
            event.target.closest(
                "[data-restore-version]"
            );

        const remove =
            event.target.closest(
                "[data-delete-version]"
            );

        if (view) {
            const version =
                WusoolVersionService
                    .getVersions()
                    .find(
                        (item) =>
                            item.id ===
                            view.dataset.viewVersion
                    );

            if (!version) {
                return;
            }

            const savedAreas =
                Object.entries(
                    version.snapshot ||
                    {}
                )
                    .filter(
                        ([, value]) =>
                            value !==
                            null
                    )
                    .map(
                        ([key]) =>
                            key
                    );

            versionDetails.innerHTML = `
                <h3 class="h5 fw-bold">
                    ${version.area}
                </h3>

                <p class="text-secondary">
                    ${version.description}
                </p>

                <p class="mb-2">
                    <strong>Saved areas:</strong>
                </p>

                <div class="d-flex flex-wrap gap-2">
                    ${
                        savedAreas.length
                            ? savedAreas
                                .map(
                                    (key) => `
                                        <span class="code-chip">
                                            ${key}
                                        </span>
                                    `
                                )
                                .join("")
                            : `
                                <span class="text-secondary">
                                    Empty snapshot
                                </span>
                            `
                    }
                </div>
            `;
        }

        if (restore) {
            if (
                !WusoolAdmin.confirm(
                    "Restore this platform version? A backup of the current state will be created first."
                )
            ) {
                return;
            }

            const restored =
                WusoolVersionService
                    .restoreVersion(
                        restore.dataset
                            .restoreVersion
                    );

            if (restored) {
                WusoolAdmin.toast(
                    "Version restored successfully."
                );

                render();
            }
        }

        if (remove) {
            WusoolVersionService
                .deleteVersion(
                    remove.dataset
                        .deleteVersion
                );

            render();
        }
    }
);


document.getElementById(
    "createManualVersion"
).addEventListener(
    "click",
    () => {
        WusoolVersionService
            .createVersion({
                area:
                    "Manual Snapshot",
                description:
                    "Manual backup created by Super Admin"
            });

        render();

        WusoolAdmin.toast(
            "Platform snapshot created."
        );
    }
);


render();
