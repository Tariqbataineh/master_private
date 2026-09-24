
"use strict";

const STORAGE_KEY =
    "wusoolFeatureFlags";

const defaultFlags = {
    aiAssistant: true,
    booking: true,
    jobs: false,
    voiceAssistance: true,
    equipment: false
};

const readFlags = () => {
    try {
        return {
            ...defaultFlags,
            ...JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "{}"
            )
        };
    } catch {
        return {
            ...defaultFlags
        };
    }
};

const flags =
    readFlags();

const mapping = [
    {
        key: "aiAssistant",
        name: "AI Assistant",
        description:
            "Enable AI assistance and smart recommendations."
    },
    {
        key: "booking",
        name: "Visit Booking",
        description:
            "Allow users to plan accessibility visits."
    },
    {
        key: "jobs",
        name: "Jobs Module",
        description:
            "Show employment features when the module is ready."
    },
    {
        key: "voiceAssistance",
        name: "Voice Assistance",
        description:
            "Enable supported voice interactions."
    },
    {
        key: "equipment",
        name: "Equipment Requests",
        description:
            "Allow accessibility equipment requests."
    }
];

const flagsContainer =
    document.getElementById(
        "flagsContainer"
    );

const render = () => {
    flagsContainer.innerHTML =
        mapping
            .map(
                (item) => `
                    <div class="flag-row">
                        <div>
                            <strong class="d-block">
                                ${item.name}
                            </strong>

                            <span class="text-secondary">
                                ${item.description}
                            </span>
                        </div>

                        <div class="form-check form-switch fs-4">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                role="switch"
                                data-flag="${item.key}"
                                ${flags[item.key] !== false ? "checked" : ""}
                            >
                        </div>
                    </div>
                `
            )
            .join("");
};

flagsContainer.addEventListener(
    "change",
    (event) => {
        const control =
            event.target.closest(
                "[data-flag]"
            );

        if (!control) {
            return;
        }

        flags[
            control.dataset.flag
        ] =
            control.checked;
    }
);

document.getElementById(
    "saveFlagsButton"
).addEventListener(
    "click",
    () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                flags
            )
        );

        WusoolAdmin?.toast?.(
            "Feature flags published."
        );
    }
);

render();
