
"use strict";

/* =========================================
   Wusool Dynamic Platform Runtime
========================================= */

(() => {
    const STORAGE = {
        theme: "wusoolPlatformTheme",
        overrides: "wusoolPageOverrides",
        insertions: "wusoolPageInsertions",
        orders: "wusoolSectionOrders",
        navigation: "wusoolNavigationConfig",
        announcements: "wusoolAnnouncements",
        featureFlags: "wusoolFeatureFlags"
    };

    const readJson = (key, fallback) => {
        try {
            const value = localStorage.getItem(key);

            return value
                ? JSON.parse(value)
                : fallback;
        } catch (error) {
            console.warn(
                `Wusool runtime could not read ${key}.`,
                error
            );

            return fallback;
        }
    };

    const getPageKey = () => {
        const path =
            window.location.pathname
                .replace(/\\/g, "/");

        const match =
            path.match(
                /(?:^|\/)(user|org|visitor)\/html\/([^/?#]+)$/i
            );

        if (match) {
            return `${match[1].toLowerCase()}/html/${match[2]}`;
        }

        return path
            .split("/")
            .filter(Boolean)
            .slice(-3)
            .join("/");
    };

    const cssEscape = (value) => {
        if (window.CSS && CSS.escape) {
            return CSS.escape(value);
        }

        return String(value)
            .replace(/["\\]/g, "\\$&");
    };

    const getStableSelector = (element) => {
        if (!element || element === document.body) {
            return "body";
        }

        if (element.id) {
            return `#${cssEscape(element.id)}`;
        }

        const dynamicId =
            element.getAttribute(
                "data-wusool-dynamic-id"
            );

        if (dynamicId) {
            return `[data-wusool-dynamic-id="${cssEscape(dynamicId)}"]`;
        }

        const parts = [];
        let current = element;

        while (
            current &&
            current.nodeType === 1 &&
            current !== document.body
        ) {
            if (current.id) {
                parts.unshift(
                    `#${cssEscape(current.id)}`
                );

                break;
            }

            let selector =
                current.tagName
                    .toLowerCase();

            const parent =
                current.parentElement;

            if (parent) {
                const sameTag =
                    Array.from(parent.children)
                        .filter(
                            (child) =>
                                child.tagName ===
                                current.tagName
                        );

                if (sameTag.length > 1) {
                    const index =
                        sameTag.indexOf(current) + 1;

                    selector +=
                        `:nth-of-type(${index})`;
                }
            }

            parts.unshift(selector);
            current = parent;
        }

        return `body > ${parts.join(" > ")}`;
    };

    const applyTheme = () => {
        const theme =
            readJson(
                STORAGE.theme,
                {}
            );

        const root =
            document.documentElement;

        const values = {
            "--wusool-primary":
                theme.primaryColor,
            "--wusool-primary-runtime":
                theme.primaryColor,
            "--wusool-primary-dark":
                theme.primaryDarkColor,
            "--wusool-secondary-runtime":
                theme.secondaryColor,
            "--wusool-sidebar":
                theme.sidebarColor,
            "--wusool-sidebar-runtime":
                theme.sidebarColor,
            "--wusool-background-runtime":
                theme.backgroundColor,
            "--wusool-text-runtime":
                theme.textColor,
            "--wusool-card-radius-runtime":
                theme.cardRadius != null
                    ? `${theme.cardRadius}px`
                    : null,
            "--wusool-button-radius-runtime":
                theme.buttonRadius != null
                    ? `${theme.buttonRadius}px`
                    : null
        };

        Object.entries(values)
            .forEach(
                ([property, value]) => {
                    if (
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                    ) {
                        root.style.setProperty(
                            property,
                            value
                        );
                    }
                }
            );

        if (theme.backgroundColor) {
            document.body.style
                .setProperty(
                    "background-color",
                    theme.backgroundColor,
                    "important"
                );
        }
    };

    const applyProperty = (
        element,
        property,
        value
    ) => {
        if (!element) {
            return;
        }

        if (property === "text") {
            element.textContent =
                value ?? "";

            return;
        }

        if (
            property === "src" &&
            element.tagName === "IMG"
        ) {
            element.src = value;
            return;
        }

        if (
            property === "alt" &&
            element.tagName === "IMG"
        ) {
            element.alt = value ?? "";
            return;
        }

        if (
            property === "href" &&
            element.tagName === "A"
        ) {
            element.setAttribute(
                "href",
                value || "#"
            );

            return;
        }

        if (property === "hidden") {
            element.dataset
                .wusoolAdminHidden =
                value
                    ? "true"
                    : "false";

            return;
        }

        const styleMap = {
            color: "color",
            backgroundColor:
                "background-color",
            fontSize: "font-size",
            fontWeight: "font-weight",
            textAlign: "text-align",
            borderRadius: "border-radius",
            padding: "padding",
            marginTop: "margin-top",
            marginBottom: "margin-bottom"
        };

        const cssProperty =
            styleMap[property];

        if (cssProperty) {
            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                element.style
                    .removeProperty(
                        cssProperty
                    );
            } else {
                element.style
                    .setProperty(
                        cssProperty,
                        value
                    );
            }
        }
    };

    const applyOverrides = () => {
        const pageKey =
            getPageKey();

        const allOverrides =
            readJson(
                STORAGE.overrides,
                {}
            );

        const pageOverrides =
            allOverrides[pageKey] ||
            {};

        Object.entries(pageOverrides)
            .forEach(
                ([selector, properties]) => {
                    let element = null;

                    try {
                        element =
                            document.querySelector(
                                selector
                            );
                    } catch (error) {
                        console.warn(
                            "Invalid Wusool selector:",
                            selector
                        );
                    }

                    if (!element) {
                        return;
                    }

                    Object.entries(properties)
                        .forEach(
                            ([property, value]) => {
                                applyProperty(
                                    element,
                                    property,
                                    value
                                );
                            }
                        );
                }
            );
    };

    const applyInsertions = () => {
        const pageKey =
            getPageKey();

        const allInsertions =
            readJson(
                STORAGE.insertions,
                {}
            );

        const pageInsertions =
            allInsertions[pageKey] ||
            [];

        pageInsertions.forEach(
            (item) => {
                if (
                    !item ||
                    !item.id ||
                    !item.html
                ) {
                    return;
                }

                if (
                    document.querySelector(
                        `[data-wusool-dynamic-id="${cssEscape(item.id)}"]`
                    )
                ) {
                    return;
                }

                let parent = null;

                try {
                    parent =
                        document.querySelector(
                            item.parentSelector ||
                            "main"
                        );
                } catch (error) {
                    parent = null;
                }

                parent =
                    parent ||
                    document.querySelector(
                        "main"
                    ) ||
                    document.body;

                const template =
                    document.createElement(
                        "template"
                    );

                template.innerHTML =
                    item.html.trim();

                const element =
                    template.content
                        .firstElementChild;

                if (!element) {
                    return;
                }

                element.setAttribute(
                    "data-wusool-dynamic-id",
                    item.id
                );

                element.classList.add(
                    "wusool-dynamic-section"
                );

                parent.appendChild(
                    element
                );
            }
        );
    };

    const applyOrders = () => {
        const pageKey =
            getPageKey();

        const allOrders =
            readJson(
                STORAGE.orders,
                {}
            );

        const pageOrders =
            allOrders[pageKey] ||
            {};

        Object.entries(pageOrders)
            .forEach(
                ([parentSelector, selectors]) => {
                    let parent = null;

                    try {
                        parent =
                            document.querySelector(
                                parentSelector
                            );
                    } catch (error) {
                        return;
                    }

                    if (
                        !parent ||
                        !Array.isArray(selectors)
                    ) {
                        return;
                    }

                    selectors.forEach(
                        (selector) => {
                            let child = null;

                            try {
                                child =
                                    document.querySelector(
                                        selector
                                    );
                            } catch (error) {
                                return;
                            }

                            if (
                                child &&
                                child.parentElement ===
                                parent
                            ) {
                                parent.appendChild(
                                    child
                                );
                            }
                        }
                    );
                }
            );
    };

    const getPortalKey = () => {
        const pageKey =
            getPageKey();

        if (
            pageKey.startsWith(
                "user/"
            )
        ) {
            return "user";
        }

        if (
            pageKey.startsWith(
                "org/"
            )
        ) {
            return "organization";
        }

        return "visitor";
    };

    const applyNavigation = () => {
        const portal =
            getPortalKey();

        const configs =
            readJson(
                STORAGE.navigation,
                {}
            );

        const config =
            configs[portal];

        if (
            !Array.isArray(config)
        ) {
            return;
        }

        config.forEach(
            (item) => {
                if (!item.href) {
                    return;
                }

                const filename =
                    item.href
                        .split("/")
                        .pop();

                document
                    .querySelectorAll(
                        "a[href]"
                    )
                    .forEach(
                        (link) => {
                            const current =
                                link
                                    .getAttribute(
                                        "href"
                                    )
                                    ?.split("/")
                                    .pop();

                            if (
                                current !==
                                filename
                            ) {
                                return;
                            }

                            const textTarget =
                                link.querySelector(
                                    "span"
                                ) ||
                                link;

                            if (
                                item.label
                            ) {
                                if (
                                    textTarget ===
                                    link
                                ) {
                                    link.textContent =
                                        item.label;
                                } else {
                                    textTarget.textContent =
                                        item.label;
                                }
                            }

                            link.dataset
                                .wusoolAdminHidden =
                                item.visible ===
                                false
                                    ? "true"
                                    : "false";
                        }
                    );
            }
        );
    };

    const applyFeatureFlags = () => {
        const flags =
            readJson(
                STORAGE.featureFlags,
                {}
            );

        document
            .querySelectorAll(
                "[data-feature]"
            )
            .forEach(
                (element) => {
                    const feature =
                        element.dataset
                            .feature;

                    if (
                        flags[feature] ===
                        false
                    ) {
                        element.dataset
                            .wusoolAdminHidden =
                            "true";
                    }
                }
            );
    };

    const applyAnnouncements = () => {
        const announcements =
            readJson(
                STORAGE.announcements,
                []
            );

        const portal =
            getPortalKey();

        const now = Date.now();

        const active =
            announcements.find(
                (item) => {
                    if (
                        !item ||
                        item.enabled === false
                    ) {
                        return false;
                    }

                    if (
                        item.audience &&
                        item.audience !==
                        "all" &&
                        item.audience !==
                        portal
                    ) {
                        return false;
                    }

                    const start =
                        item.start
                            ? new Date(
                                  item.start
                              ).getTime()
                            : null;

                    const end =
                        item.end
                            ? new Date(
                                  item.end
                              ).getTime()
                            : null;

                    return (
                        (!start ||
                            now >= start) &&
                        (!end ||
                            now <= end)
                    );
                }
            );

        const old =
            document.querySelector(
                ".wusool-global-announcement"
            );

        old?.remove();

        if (!active) {
            return;
        }

        const banner =
            document.createElement(
                "div"
            );

        banner.className =
            "wusool-global-announcement";

        banner.textContent =
            active.message ||
            active.title ||
            "Wusool announcement";

        document.body.prepend(
            banner
        );
    };

    const applyAll = () => {
        applyTheme();
        applyInsertions();
        applyOverrides();
        applyOrders();
        applyNavigation();
        applyFeatureFlags();
        applyAnnouncements();
    };

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            applyAll();

            /*
                User and Organization sidebars are inserted dynamically.
                Re-apply only lightweight runtime changes after mutations.
            */
            let scheduled = false;

            const observer =
                new MutationObserver(
                    () => {
                        if (scheduled) {
                            return;
                        }

                        scheduled = true;

                        requestAnimationFrame(
                            () => {
                                scheduled = false;
                                applyNavigation();
                                applyFeatureFlags();
                            }
                        );
                    }
                );

            observer.observe(
                document.body,
                {
                    childList: true,
                    subtree: true
                }
            );
        }
    );

    window.addEventListener(
        "storage",
        (event) => {
            if (
                Object.values(STORAGE)
                    .includes(
                        event.key
                    )
            ) {
                window.location.reload();
            }
        }
    );

    window.WusoolRuntime = {
        STORAGE,
        getPageKey,
        getStableSelector,
        applyAll,
        readJson
    };
})();
