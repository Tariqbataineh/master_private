
"use strict";

const STORAGE_KEY =
    "wusoolNavigationConfig";

const defaults = {
    user: [
        {
            label: "Dashboard",
            href: "./user-dashboard.html",
            visible: true
        },
        {
            label: "Explore Places",
            href: "./explore-places.html",
            visible: true
        },
        {
            label: "My Visits",
            href: "./my-visits.html",
            visible: true
        },
        {
            label: "Saved Places",
            href: "./saved-places.html",
            visible: true
        },
        {
            label: "Recommendations",
            href: "./smart-recommendations.html",
            visible: true
        },
        {
            label: "Notifications",
            href: "./notifications.html",
            visible: true
        }
    ],

    organization: [
        {
            label: "Dashboard",
            href: "./organization-dashboard.html",
            visible: true
        },
        {
            label: "Branches",
            href: "./branches.html",
            visible: true
        },
        {
            label: "AI Reports",
            href: "./organization-ai-reports.html",
            visible: true
        },
        {
            label: "Notifications",
            href: "./notifications.html",
            visible: true
        },
        {
            label: "Settings",
            href: "./organization-settings.html",
            visible: true
        },
        {
            label: "Help & Support",
            href: "./help-support.html",
            visible: true
        }
    ],

    visitor: []
};

const readConfig = () => {
    try {
        return {
            ...defaults,
            ...JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "{}"
            )
        };
    } catch {
        return structuredClone(
            defaults
        );
    }
};

let config =
    readConfig();

let currentPortal =
    "user";

const navigationList =
    document.getElementById(
        "navigationList"
    );

const portalSelect =
    document.querySelector(
        "select"
    );

const renderNavigation = () => {
    const items =
        config[currentPortal] ||
        [];

    navigationList.innerHTML =
        items
            .map(
                (item, index) => `
                    <div class="admin-list-item">
                        <span class="item-icon">
                            <i class="bi bi-grip-vertical"></i>
                        </span>

                        <div class="flex-grow-1">
                            <input
                                class="form-control mb-2"
                                data-label-index="${index}"
                                value="${item.label}"
                            >

                            <input
                                class="form-control"
                                data-href-index="${index}"
                                value="${item.href}"
                            >
                        </div>

                        <div>
                            <div class="form-check form-switch">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    data-visible-index="${index}"
                                    ${item.visible !== false ? "checked" : ""}
                                >
                            </div>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger mt-2"
                                data-delete-index="${index}"
                            >
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                `
            )
            .join("");
};

navigationList?.addEventListener(
    "input",
    (event) => {
        const items =
            config[
                currentPortal
            ];

        const labelIndex =
            event.target.dataset
                .labelIndex;

        const hrefIndex =
            event.target.dataset
                .hrefIndex;

        const visibleIndex =
            event.target.dataset
                .visibleIndex;

        if (
            labelIndex !==
            undefined
        ) {
            items[
                Number(labelIndex)
            ].label =
                event.target.value;
        }

        if (
            hrefIndex !==
            undefined
        ) {
            items[
                Number(hrefIndex)
            ].href =
                event.target.value;
        }

        if (
            visibleIndex !==
            undefined
        ) {
            items[
                Number(visibleIndex)
            ].visible =
                event.target.checked;
        }
    }
);

navigationList?.addEventListener(
    "click",
    (event) => {
        const button =
            event.target.closest(
                "[data-delete-index]"
            );

        if (!button) {
            return;
        }

        config[
            currentPortal
        ].splice(
            Number(
                button.dataset
                    .deleteIndex
            ),
            1
        );

        renderNavigation();
    }
);

document.getElementById(
    "addNavItem"
)?.addEventListener(
    "click",
    () => {
        config[
            currentPortal
        ].push({
            label:
                "New Item",
            href: "#",
            visible: true
        });

        renderNavigation();
    }
);

document.getElementById(
    "saveNavigation"
)?.addEventListener(
    "click",
    () => {
        /* Navigation publish backup */
        WusoolVersionService
            ?.createVersion({
                area: "Navigation Manager",
                description: `Published ${currentPortal} navigation`
            });

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                config
            )
        );

        WusoolAdmin?.toast?.(
            "Navigation published to the real portals."
        );
    }
);

portalSelect?.addEventListener(
    "change",
    () => {
        const text =
            portalSelect.value
                .toLowerCase();

        if (
            text.includes(
                "organization"
            )
        ) {
            currentPortal =
                "organization";
        } else if (
            text.includes(
                "public"
            ) ||
            text.includes(
                "visitor"
            )
        ) {
            currentPortal =
                "visitor";
        } else {
            currentPortal =
                "user";
        }

        renderNavigation();
    }
);

renderNavigation();
