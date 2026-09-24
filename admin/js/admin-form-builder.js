
"use strict";

const SCHEMA_KEY =
    "wusoolDynamicFormSchemas";

const formPage =
    document.getElementById(
        "formPage"
    );

const formFieldsList =
    document.getElementById(
        "formFieldsList"
    );

const fieldType =
    document.getElementById(
        "fieldType"
    );

const selectOptionsGroup =
    document.getElementById(
        "selectOptionsGroup"
    );

let schemas = {};
let workingFields = [];


const readSchemas = () => {
    try {
        return JSON.parse(
            localStorage.getItem(
                SCHEMA_KEY
            ) || "{}"
        );
    } catch {
        return {};
    }
};


const loadWorkingFields = () => {
    schemas =
        readSchemas();

    const key =
        formPage.value;

    const draft =
        WusoolVersionService
            .getDraft(
                `form:${key}`
            );

    workingFields =
        structuredClone(
            draft?.data ||
            schemas[key] ||
            []
        );

    renderFields();
};


const renderFields = () => {
    formFieldsList.innerHTML =
        workingFields.length
            ? workingFields
                .map(
                    (field, index) => `
                        <div
                            class="form-field-item"
                            data-field-id="${field.id}"
                        >
                            <span class="drag-handle">
                                <i class="bi bi-grip-vertical"></i>
                            </span>

                            <div>
                                <strong class="d-block">
                                    ${field.label}
                                </strong>

                                <div class="field-badges mt-2">
                                    <span class="badge text-bg-light border">
                                        ${field.type}
                                    </span>

                                    <span class="badge text-bg-light border">
                                        ${field.width === "half" ? "Half Width" : "Full Width"}
                                    </span>

                                    ${
                                        field.required
                                            ? `
                                                <span class="badge badge-soft-warning">
                                                    Required
                                                </span>
                                            `
                                            : ""
                                    }

                                    ${
                                        field.enabled === false
                                            ? `
                                                <span class="badge badge-soft-danger">
                                                    Hidden
                                                </span>
                                            `
                                            : ""
                                    }
                                </div>

                                ${
                                    field.helpText
                                        ? `
                                            <small class="text-secondary d-block mt-2">
                                                ${field.helpText}
                                            </small>
                                        `
                                        : ""
                                }
                            </div>

                            <div class="d-flex flex-column gap-2">
                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    data-up="${field.id}"
                                >
                                    <i class="bi bi-arrow-up"></i>
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-secondary"
                                    data-down="${field.id}"
                                >
                                    <i class="bi bi-arrow-down"></i>
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-warning"
                                    data-toggle="${field.id}"
                                >
                                    ${field.enabled === false ? "Show" : "Hide"}
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    data-delete="${field.id}"
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
                    No dynamic fields on this form yet.
                </div>
            `;
};


const normalizeOrders = () => {
    workingFields.forEach(
        (field, index) => {
            field.order =
                index + 1;
        }
    );
};


fieldType.addEventListener(
    "change",
    () => {
        selectOptionsGroup.classList
            .toggle(
                "d-none",
                fieldType.value !==
                "Select"
            );
    }
);


document.getElementById(
    "addFieldButton"
).addEventListener(
    "click",
    () => {
        const label =
            document.getElementById(
                "fieldLabel"
            ).value.trim();

        if (!label) {
            WusoolAdmin.toast(
                "Enter a field label.",
                "warning"
            );

            return;
        }

        const options =
            document.getElementById(
                "fieldOptions"
            ).value
                .split(",")
                .map(
                    (item) =>
                        item.trim()
                )
                .filter(Boolean);

        workingFields.push({
            id:
                `field-${Date.now()}`,
            label,
            type:
                fieldType.value,
            placeholder:
                document.getElementById(
                    "fieldPlaceholder"
                ).value.trim(),
            helpText:
                document.getElementById(
                    "fieldHelpText"
                ).value.trim(),
            options,
            width:
                document.getElementById(
                    "fieldWidth"
                ).value,
            required:
                document.getElementById(
                    "fieldRequired"
                ).checked,
            enabled:
                true,
            order:
                workingFields.length + 1
        });

        document.getElementById(
            "fieldLabel"
        ).value = "";

        document.getElementById(
            "fieldPlaceholder"
        ).value = "";

        document.getElementById(
            "fieldHelpText"
        ).value = "";

        document.getElementById(
            "fieldOptions"
        ).value = "";

        renderFields();
    }
);


formFieldsList.addEventListener(
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
                workingFields.findIndex(
                    (item) =>
                        item.id === id
                );

            const target =
                index + delta;

            if (
                index < 0 ||
                target < 0 ||
                target >=
                    workingFields.length
            ) {
                return;
            }

            const [item] =
                workingFields.splice(
                    index,
                    1
                );

            workingFields.splice(
                target,
                0,
                item
            );

            normalizeOrders();
            renderFields();
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
                workingFields.find(
                    (field) =>
                        field.id ===
                        toggle.dataset.toggle
                );

            if (item) {
                item.enabled =
                    item.enabled ===
                    false;

                renderFields();
            }
        }

        if (remove) {
            workingFields =
                workingFields.filter(
                    (field) =>
                        field.id !==
                        remove.dataset.delete
                );

            normalizeOrders();
            renderFields();
        }
    }
);


document.getElementById(
    "saveFormDraft"
).addEventListener(
    "click",
    () => {
        WusoolVersionService
            .saveDraft(
                `form:${formPage.value}`,
                workingFields
            );

        WusoolAdmin.toast(
            "Form draft saved."
        );
    }
);


document.getElementById(
    "publishForm"
).addEventListener(
    "click",
    () => {
        WusoolVersionService
            .createVersion({
                area:
                    "Dynamic Form",
                description:
                    `Published form schema for ${formPage.value}`
            });

        schemas =
            readSchemas();

        schemas[
            formPage.value
        ] =
            workingFields;

        localStorage.setItem(
            SCHEMA_KEY,
            JSON.stringify(
                schemas
            )
        );

        WusoolVersionService
            .removeDraft(
                `form:${formPage.value}`
            );

        WusoolAdmin.toast(
            "Form published to the real page."
        );
    }
);


formPage.addEventListener(
    "change",
    loadWorkingFields
);


loadWorkingFields();
