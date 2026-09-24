
"use strict";

const KEY =
    "wusoolAccessibilityRequirements";

let requirements =
    structuredClone(
        WusoolAccessibilityConfig
            .getRequirements()
    );

const requirementsList =
    document.getElementById(
        "requirementsList"
    );


const persist = () => {
    localStorage.setItem(
        KEY,
        JSON.stringify(
            requirements
        )
    );
};


const render = () => {
    requirementsList.innerHTML =
        requirements.length
            ? requirements
                .map(
                    (item, index) => `
                        <div class="requirement-item">

                            <span class="builder-icon">
                                <i class="bi ${item.icon || "bi-universal-access"}"></i>
                            </span>

                            <div>
                                <div class="d-flex flex-wrap gap-2 align-items-center">
                                    <strong>
                                        ${item.title}
                                    </strong>

                                    <span class="requirement-weight">
                                        W${item.weight}
                                    </span>

                                    <span class="badge text-bg-light border">
                                        ${item.category}
                                    </span>

                                    ${
                                        item.required
                                            ? `
                                                <span class="badge badge-soft-warning">
                                                    Required
                                                </span>
                                            `
                                            : ""
                                    }

                                    ${
                                        item.enabled === false
                                            ? `
                                                <span class="badge badge-soft-danger">
                                                    Hidden
                                                </span>
                                            `
                                            : ""
                                    }
                                </div>

                                <p class="text-secondary mb-0 mt-2">
                                    ${item.description}
                                </p>
                            </div>

                            <div class="d-flex flex-column gap-2">

                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    data-up="${item.id}"
                                >
                                    <i class="bi bi-arrow-up"></i>
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    data-down="${item.id}"
                                >
                                    <i class="bi bi-arrow-down"></i>
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-warning"
                                    data-toggle="${item.id}"
                                >
                                    ${item.enabled === false ? "Show" : "Hide"}
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    data-delete="${item.id}"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>

                            </div>

                        </div>
                    `
                )
                .join("")
            : `
                <div class="text-center py-5 text-secondary">
                    No accessibility requirements.
                </div>
            `;
};


document.getElementById(
    "addRequirement"
).addEventListener(
    "click",
    () => {
        const title =
            document.getElementById(
                "requirementTitle"
            ).value.trim();

        if (!title) {
            WusoolAdmin.toast(
                "Enter a requirement name.",
                "warning"
            );

            return;
        }

        const id =
            `requirement-${Date.now()}`;

        requirements.push({
            id,
            key: id,
            title,
            description:
                document.getElementById(
                    "requirementDescription"
                ).value.trim(),
            category:
                document.getElementById(
                    "requirementCategory"
                ).value,
            weight:
                Number(
                    document.getElementById(
                        "requirementWeight"
                    ).value
                ),
            icon:
                document.getElementById(
                    "requirementIcon"
                ).value.trim() ||
                "bi-universal-access",
            required:
                document.getElementById(
                    "requirementRequired"
                ).checked,
            enabled:
                true
        });

        document.getElementById(
            "requirementTitle"
        ).value = "";

        document.getElementById(
            "requirementDescription"
        ).value = "";

        render();
    }
);


requirementsList.addEventListener(
    "click",
    (event) => {
        const up =
            event.target.closest(
                "[data-up]"
            );

        const down =
            event.target.closest(
                "[data-down]"
            );

        const toggle =
            event.target.closest(
                "[data-toggle]"
            );

        const remove =
            event.target.closest(
                "[data-delete]"
            );

        const move = (
            id,
            delta
        ) => {
            const index =
                requirements.findIndex(
                    (item) =>
                        item.id === id
                );

            const target =
                index + delta;

            if (
                index < 0 ||
                target < 0 ||
                target >=
                    requirements.length
            ) {
                return;
            }

            const [item] =
                requirements.splice(
                    index,
                    1
                );

            requirements.splice(
                target,
                0,
                item
            );

            render();
        };

        if (up) {
            move(
                up.dataset.up,
                -1
            );
        }

        if (down) {
            move(
                down.dataset.down,
                1
            );
        }

        if (toggle) {
            const item =
                requirements.find(
                    (entry) =>
                        entry.id ===
                        toggle.dataset.toggle
                );

            if (item) {
                item.enabled =
                    item.enabled ===
                    false;

                render();
            }
        }

        if (remove) {
            requirements =
                requirements.filter(
                    (item) =>
                        item.id !==
                        remove.dataset.delete
                );

            render();
        }
    }
);


document.getElementById(
    "publishRequirements"
).addEventListener(
    "click",
    () => {
        WusoolVersionService
            .createVersion({
                area:
                    "Accessibility Checklist",
                description:
                    "Published accessibility requirement changes"
            });

        persist();

        WusoolAdmin.toast(
            "Checklist published. Organization accessibility pages now use it."
        );
    }
);


document.getElementById(
    "resetRequirements"
).addEventListener(
    "click",
    () => {
        if (
            !WusoolAdmin.confirm(
                "Restore the default accessibility checklist?"
            )
        ) {
            return;
        }

        requirements =
            structuredClone(
                WusoolAccessibilityConfig
                    .defaults
            );

        render();
    }
);


render();
