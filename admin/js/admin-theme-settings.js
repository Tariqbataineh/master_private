
"use strict";

const STORAGE_KEY =
    "wusoolPlatformTheme";

const defaultTheme = {
    primaryColor: "#087f75",
    primaryDarkColor: "#075f59",
    secondaryColor: "#168bea",
    sidebarColor: "#0b2a43",
    backgroundColor: "#f8fbfb",
    textColor: "#0b2545",
    cardRadius: 16,
    buttonRadius: 10
};

const readTheme = () => {
    try {
        return {
            ...defaultTheme,
            ...JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "{}"
            )
        };
    } catch {
        return {
            ...defaultTheme
        };
    }
};

const controls = {
    primaryColor:
        document.getElementById(
            "primaryColor"
        ),
    sidebarColor:
        document.getElementById(
            "sidebarColor"
        ),
    backgroundColor:
        document.getElementById(
            "backgroundColor"
        ),
    cardRadius:
        document.getElementById(
            "cardRadius"
        )
};

const radiusValue =
    document.getElementById(
        "radiusValue"
    );

const themePreview =
    document.getElementById(
        "themePreview"
    );

const loadControls = () => {
    const theme =
        readTheme();

    controls.primaryColor.value =
        theme.primaryColor;

    controls.sidebarColor.value =
        theme.sidebarColor;

    controls.backgroundColor.value =
        theme.backgroundColor;

    controls.cardRadius.value =
        theme.cardRadius;

    applyPreview();
};

const getThemeFromControls = () => {
    const previous =
        readTheme();

    return {
        ...previous,
        primaryColor:
            controls.primaryColor.value,
        sidebarColor:
            controls.sidebarColor.value,
        backgroundColor:
            controls.backgroundColor.value,
        cardRadius:
            Number(
                controls.cardRadius.value
            )
    };
};

const applyPreview = () => {
    const theme =
        getThemeFromControls();

    themePreview?.style.setProperty(
        "--preview-primary",
        theme.primaryColor
    );

    themePreview?.style.setProperty(
        "--preview-sidebar",
        theme.sidebarColor
    );

    themePreview?.style.setProperty(
        "--preview-bg",
        theme.backgroundColor
    );

    themePreview?.style.setProperty(
        "--preview-radius",
        `${theme.cardRadius}px`
    );

    if (radiusValue) {
        radiusValue.textContent =
            theme.cardRadius;
    }
};

Object.values(controls)
    .forEach(
        (control) => {
            control?.addEventListener(
                "input",
                applyPreview
            );
        }
    );

document.getElementById(
    "resetTheme"
)?.addEventListener(
    "click",
    () => {
        controls.primaryColor.value =
            defaultTheme.primaryColor;

        controls.sidebarColor.value =
            defaultTheme.sidebarColor;

        controls.backgroundColor.value =
            defaultTheme.backgroundColor;

        controls.cardRadius.value =
            defaultTheme.cardRadius;

        applyPreview();
    }
);

document.getElementById(
    "saveThemeDraft"
)?.addEventListener(
    "click",
    () => {
        sessionStorage.setItem(
            "wusoolThemeDraft",
            JSON.stringify(
                getThemeFromControls()
            )
        );

        WusoolAdmin?.toast?.(
            "Theme draft saved for this session."
        );
    }
);

document.getElementById(
    "publishTheme"
)?.addEventListener(
    "click",
    () => {
        const theme =
            getThemeFromControls();

        /* Theme Studio publish backup */
        WusoolVersionService
            ?.createVersion({
                area: "Theme Studio",
                description: "Published global theme changes"
            });

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                theme
            )
        );

        WusoolAdmin?.toast?.(
            "Theme published to User, Organization and Visitor pages."
        );
    }
);

loadControls();
