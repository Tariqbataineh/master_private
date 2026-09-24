
"use strict";

/* =========================================
   Wusool Dynamic Form Runtime
   Admin-created fields are rendered without HTML edits.
========================================= */

(() => {
    const SCHEMA_KEY =
        "wusoolDynamicFormSchemas";

    const RESPONSES_KEY =
        "wusoolDynamicFormResponses";

    const readJson = (
        key,
        fallback
    ) => {
        try {
            return JSON.parse(
                localStorage.getItem(key) ||
                JSON.stringify(fallback)
            );
        } catch {
            return fallback;
        }
    };

    const writeJson = (
        key,
        value
    ) => {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    };

    const pageKey = () => {
        const path =
            window.location.pathname
                .replace(/\\/g, "/");

        const match =
            path.match(
                /(?:^|\/)(user|org|visitor)\/html\/([^/?#]+)$/i
            );

        return match
            ? `${match[1].toLowerCase()}/html/${match[2]}`
            : path.split("/").filter(Boolean).slice(-3).join("/");
    };

    const getSchema = () => {
        const schemas =
            readJson(
                SCHEMA_KEY,
                {}
            );

        return (
            schemas[pageKey()] ||
            []
        );
    };

    const makeField = (
        field
    ) => {
        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            field.width === "half"
                ? "col-12 col-md-6"
                : "col-12";

        wrapper.dataset
            .wusoolDynamicField =
            field.id;

        const label =
            document.createElement(
                "label"
            );

        label.className =
            "form-label";

        label.htmlFor =
            `dynamic-${field.id}`;

        label.textContent =
            field.label;

        if (field.required) {
            const mark =
                document.createElement(
                    "span"
                );

            mark.className =
                "text-danger ms-1";

            mark.textContent = "*";
            label.appendChild(mark);
        }

        wrapper.appendChild(label);

        let control;

        if (
            field.type ===
            "Textarea"
        ) {
            control =
                document.createElement(
                    "textarea"
                );

            control.rows =
                Number(field.rows || 3);
        } else if (
            field.type ===
            "Select"
        ) {
            control =
                document.createElement(
                    "select"
                );

            const placeholder =
                document.createElement(
                    "option"
                );

            placeholder.value = "";
            placeholder.textContent =
                field.placeholder ||
                "Select an option";

            control.appendChild(
                placeholder
            );

            (
                field.options || []
            ).forEach(
                (optionValue) => {
                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        optionValue;

                    option.textContent =
                        optionValue;

                    control.appendChild(
                        option
                    );
                }
            );
        } else if (
            field.type ===
            "Checkbox"
        ) {
            control =
                document.createElement(
                    "input"
                );

            control.type =
                "checkbox";

            control.className =
                "form-check-input";
        } else {
            control =
                document.createElement(
                    "input"
                );

            const typeMap = {
                Text:
                    "text",
                Email:
                    "email",
                Number:
                    "number",
                Date:
                    "date",
                File:
                    "file",
                Phone:
                    "tel"
            };

            control.type =
                typeMap[field.type] ||
                "text";
        }

        control.id =
            `dynamic-${field.id}`;

        control.name =
            `dynamic-${field.id}`;

        if (
            field.type !==
            "Checkbox"
        ) {
            control.classList.add(
                "form-control"
            );
        }

        if (
            field.type ===
            "Select"
        ) {
            control.classList.remove(
                "form-control"
            );

            control.classList.add(
                "form-select"
            );
        }

        if (field.required) {
            control.required = true;
        }

        if (
            field.placeholder &&
            ![
                "Select",
                "Checkbox",
                "File"
            ].includes(
                field.type
            )
        ) {
            control.placeholder =
                field.placeholder;
        }

        wrapper.appendChild(
            control
        );

        if (field.helpText) {
            const help =
                document.createElement(
                    "small"
                );

            help.className =
                "text-secondary d-block mt-1";

            help.textContent =
                field.helpText;

            wrapper.appendChild(
                help
            );
        }

        return wrapper;
    };

    const findForm = () => {
        const explicit =
            document.querySelector(
                "[data-dynamic-form-target]"
            );

        if (explicit) {
            return explicit;
        }

        return (
            document.querySelector(
                "#organizationRegisterForm"
            ) ||
            document.querySelector(
                "main form"
            ) ||
            document.querySelector(
                "form"
            )
        );
    };

    const injectFields = () => {
        const fields =
            getSchema();

        if (!fields.length) {
            return;
        }

        const form =
            findForm();

        if (!form) {
            return;
        }

        let container =
            form.querySelector(
                "[data-wusool-dynamic-fields-container]"
            );

        if (!container) {
            container =
                document.createElement(
                    "div"
                );

            container.className =
                "row g-3 mb-4";

            container.dataset
                .wusoolDynamicFieldsContainer =
                "true";

            /*
                Put custom fields before the last action/terms area
                where possible, otherwise append to the form.
            */
            const actionArea =
                form.querySelector(
                    ".form-actions, .terms-check, [type='submit']"
                );

            if (
                actionArea &&
                actionArea.parentElement
            ) {
                const anchor =
                    actionArea.closest(
                        ".mb-4, .row, div"
                    ) ||
                    actionArea;

                form.insertBefore(
                    container,
                    anchor
                );
            } else {
                form.appendChild(
                    container
                );
            }
        }

        container.innerHTML = "";

        fields
            .filter(
                (field) =>
                    field.enabled !==
                    false
            )
            .sort(
                (a, b) =>
                    Number(
                        a.order || 0
                    ) -
                    Number(
                        b.order || 0
                    )
            )
            .forEach(
                (field) => {
                    container.appendChild(
                        makeField(
                            field
                        )
                    );
                }
            );

        form.addEventListener(
            "submit",
            () => {
                const responses =
                    readJson(
                        RESPONSES_KEY,
                        {}
                    );

                const values = {};

                fields.forEach(
                    (field) => {
                        const control =
                            form.querySelector(
                                `#dynamic-${CSS.escape(field.id)}`
                            );

                        if (!control) {
                            return;
                        }

                        if (
                            field.type ===
                            "Checkbox"
                        ) {
                            values[field.id] =
                                control.checked;
                        } else if (
                            field.type ===
                            "File"
                        ) {
                            values[field.id] =
                                control.files?.[0]
                                    ?.name ||
                                "";
                        } else {
                            values[field.id] =
                                control.value;
                        }
                    }
                );

                responses[
                    pageKey()
                ] =
                    responses[
                        pageKey()
                    ] ||
                    [];

                responses[
                    pageKey()
                ].push({
                    id:
                        `response-${Date.now()}`,
                    values,
                    submittedAt:
                        new Date()
                            .toISOString()
                });

                writeJson(
                    RESPONSES_KEY,
                    responses
                );
            },
            {
                capture: true
            }
        );
    };

    document.addEventListener(
        "DOMContentLoaded",
        injectFields
    );

    window.WusoolDynamicForms = {
        SCHEMA_KEY,
        RESPONSES_KEY,
        getSchema,
        injectFields
    };
})();
