
"use strict";

const STORAGE = {
    theme: "wusoolPlatformTheme",
    overrides: "wusoolPageOverrides",
    insertions: "wusoolPageInsertions",
    orders: "wusoolSectionOrders"
};

const portalSelect =
    document.getElementById(
        "portalSelect"
    );

const pageSelect =
    document.getElementById(
        "pageSelect"
    );

const frame =
    document.getElementById(
        "pagePreview"
    );

const frameHolder =
    document.getElementById(
        "previewFrameHolder"
    );

const previewPageLabel =
    document.getElementById(
        "previewPageLabel"
    );

const selectionStatus =
    document.getElementById(
        "selectionStatus"
    );

const elementEditor =
    document.getElementById(
        "elementEditor"
    );

let currentPage = null;
let selectedElement = null;
let selectedSelector = null;
let workingOverrides = {};
let workingInsertions = [];
let workingOrders = {};


const readJson = (
    key,
    fallback
) => {
    try {
        return JSON.parse(
            localStorage.getItem(key)
        ) || fallback;
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


const setupPreviewSessions = () => {
    if (
        !sessionStorage.getItem(
            "wusoolDemoUser"
        )
    ) {
        sessionStorage.setItem(
            "wusoolDemoUser",
            JSON.stringify({
                id: "admin-preview-user",
                name: "Preview User",
                fullName: "Preview User",
                email: "preview@wusool.local"
            })
        );
    }

    sessionStorage.setItem(
        "wusoolOrganizationLoggedIn",
        "true"
    );

    if (
        !sessionStorage.getItem(
            "wusoolOrganization"
        )
    ) {
        sessionStorage.setItem(
            "wusoolOrganization",
            JSON.stringify({
                id: "admin-preview-org",
                organizationName:
                    "Wusool Preview Organization",
                name:
                    "Wusool Preview Organization",
                email:
                    "preview-org@wusool.local"
            })
        );
    }
};


const renderPages = () => {
    const portal =
        portalSelect.value;

    const pages =
        window.WUSOOL_PAGE_CATALOG?.[
            portal
        ] || [];

    pageSelect.innerHTML =
        pages
            .map(
                (page, index) => `
                    <option value="${index}">
                        ${page.name}
                    </option>
                `
            )
            .join("");

    loadSelectedPage();
};


const getSelectedPage = () => {
    const pages =
        window.WUSOOL_PAGE_CATALOG?.[
            portalSelect.value
        ] || [];

    return pages[
        Number(
            pageSelect.value || 0
        )
    ] || null;
};


const loadSelectedPage = () => {
    currentPage =
        getSelectedPage();

    if (!currentPage) {
        frame.removeAttribute(
            "src"
        );

        return;
    }

    selectedElement = null;
    selectedSelector = null;

    elementEditor.classList.add(
        "d-none"
    );

    selectionStatus.classList
        .remove(
            "d-none"
        );

    previewPageLabel.textContent =
        currentPage.pageKey;

    const allOverrides =
        readJson(
            STORAGE.overrides,
            {}
        );

    const allInsertions =
        readJson(
            STORAGE.insertions,
            {}
        );

    const allOrders =
        readJson(
            STORAGE.orders,
            {}
        );

    workingOverrides =
        structuredClone(
            allOverrides[
                currentPage.pageKey
            ] || {}
        );

    workingInsertions =
        structuredClone(
            allInsertions[
                currentPage.pageKey
            ] || []
        );

    workingOrders =
        structuredClone(
            allOrders[
                currentPage.pageKey
            ] || {}
        );

    frame.src =
        `${currentPage.src}&editorReload=${Date.now()}`;
};


const clearSelectedOutline = () => {
    const doc =
        frame.contentDocument;

    doc?.querySelectorAll(
        ".wusool-editor-selected"
    )
        .forEach(
            (element) => {
                element.classList.remove(
                    "wusool-editor-selected"
                );
            }
        );
};


const isTextElement = (
    element
) => {
    return [
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "P",
        "SPAN",
        "BUTTON",
        "A",
        "LABEL",
        "SMALL",
        "STRONG",
        "LI"
    ].includes(
        element.tagName
    );
};


const selectElement = (
    element
) => {
    const doc =
        frame.contentDocument;

    if (
        !doc ||
        !element ||
        element ===
            doc.documentElement ||
        element === doc.body
    ) {
        return;
    }

    clearSelectedOutline();

    selectedElement =
        element;

    selectedSelector =
        frame.contentWindow
            .WusoolRuntime
            ?.getStableSelector(
                element
            );

    if (!selectedSelector) {
        return;
    }

    selectedElement.classList.add(
        "wusool-editor-selected"
    );

    selectionStatus.classList.add(
        "d-none"
    );

    elementEditor.classList
        .remove(
            "d-none"
        );

    document.getElementById(
        "selectedElementName"
    ).value =
        `${element.tagName.toLowerCase()} · ${selectedSelector}`;

    const textControls =
        document.getElementById(
            "textControls"
        );

    const imageControls =
        document.getElementById(
            "imageControls"
        );

    const linkControls =
        document.getElementById(
            "linkControls"
        );

    textControls.classList.toggle(
        "d-none",
        !isTextElement(
            element
        )
    );

    imageControls.classList.toggle(
        "d-none",
        element.tagName !==
            "IMG"
    );

    linkControls.classList.toggle(
        "d-none",
        element.tagName !==
            "A"
    );

    document.getElementById(
        "elementText"
    ).value =
        isTextElement(element)
            ? element.textContent
                .trim()
            : "";

    document.getElementById(
        "elementImage"
    ).value =
        element.tagName === "IMG"
            ? element.getAttribute(
                  "src"
              ) || ""
            : "";

    document.getElementById(
        "elementAlt"
    ).value =
        element.tagName === "IMG"
            ? element.getAttribute(
                  "alt"
              ) || ""
            : "";

    document.getElementById(
        "elementHref"
    ).value =
        element.tagName === "A"
            ? element.getAttribute(
                  "href"
              ) || ""
            : "";

    const style =
        frame.contentWindow
            .getComputedStyle(
                element
            );

    document.getElementById(
        "textColor"
    ).value =
        rgbToHex(
            style.color
        ) ||
        "#0b2545";

    document.getElementById(
        "backgroundColor"
    ).value =
        rgbToHex(
            style.backgroundColor
        ) ||
        "#ffffff";

    document.getElementById(
        "fontSize"
    ).value =
        Math.round(
            parseFloat(
                style.fontSize
            ) || 16
        );

    document.getElementById(
        "borderRadius"
    ).value =
        Math.round(
            parseFloat(
                style.borderRadius
            ) || 0
        );

    document.getElementById(
        "elementVisible"
    ).checked =
        element.dataset
            .wusoolAdminHidden !==
            "true";
};


const rgbToHex = (
    rgb
) => {
    if (
        !rgb ||
        rgb ===
            "rgba(0, 0, 0, 0)" ||
        rgb === "transparent"
    ) {
        return null;
    }

    const match =
        rgb.match(
            /\d+/g
        );

    if (
        !match ||
        match.length < 3
    ) {
        return null;
    }

    return (
        "#" +
        match
            .slice(0, 3)
            .map(
                (value) =>
                    Number(value)
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        )
            )
            .join("")
    );
};


const setupFrameEditor = () => {
    const doc =
        frame.contentDocument;

    if (
        !doc ||
        !frame.contentWindow
            .WusoolRuntime
    ) {
        return;
    }

    doc.addEventListener(
        "click",
        (event) => {
            event.preventDefault();
            event.stopPropagation();

            selectElement(
                event.target
            );
        },
        true
    );

    doc.querySelectorAll(
        "a, button, form"
    )
        .forEach(
            (element) => {
                element.addEventListener(
                    "click",
                    (event) => {
                        event.preventDefault();
                    }
                );
            }
        );
};


const setOverride = (
    property,
    value
) => {
    if (!selectedSelector) {
        return;
    }

    if (
        !workingOverrides[
            selectedSelector
        ]
    ) {
        workingOverrides[
            selectedSelector
        ] = {};
    }

    workingOverrides[
        selectedSelector
    ][property] =
        value;
};


const applyElementChanges = () => {
    if (
        !selectedElement ||
        !selectedSelector
    ) {
        return;
    }

    const text =
        document.getElementById(
            "elementText"
        ).value;

    const image =
        document.getElementById(
            "elementImage"
        ).value;

    const alt =
        document.getElementById(
            "elementAlt"
        ).value;

    const href =
        document.getElementById(
            "elementHref"
        ).value;

    const color =
        document.getElementById(
            "textColor"
        ).value;

    const background =
        document.getElementById(
            "backgroundColor"
        ).value;

    const fontSize =
        document.getElementById(
            "fontSize"
        ).value;

    const radius =
        document.getElementById(
            "borderRadius"
        ).value;

    const visible =
        document.getElementById(
            "elementVisible"
        ).checked;

    if (
        isTextElement(
            selectedElement
        )
    ) {
        selectedElement.textContent =
            text;

        setOverride(
            "text",
            text
        );
    }

    if (
        selectedElement.tagName ===
        "IMG"
    ) {
        selectedElement.src =
            image;

        selectedElement.alt =
            alt;

        setOverride(
            "src",
            image
        );

        setOverride(
            "alt",
            alt
        );
    }

    if (
        selectedElement.tagName ===
        "A"
    ) {
        selectedElement.setAttribute(
            "href",
            href || "#"
        );

        setOverride(
            "href",
            href || "#"
        );
    }

    selectedElement.style.color =
        color;

    selectedElement.style
        .backgroundColor =
        background;

    selectedElement.style
        .fontSize =
        `${fontSize}px`;

    selectedElement.style
        .borderRadius =
        `${radius}px`;

    selectedElement.dataset
        .wusoolAdminHidden =
        visible
            ? "false"
            : "true";

    setOverride(
        "color",
        color
    );

    setOverride(
        "backgroundColor",
        background
    );

    setOverride(
        "fontSize",
        `${fontSize}px`
    );

    setOverride(
        "borderRadius",
        `${radius}px`
    );

    setOverride(
        "hidden",
        !visible
    );

    WusoolAdmin.toast(
        "Preview updated. Publish when ready."
    );
};


const saveCurrentParentOrder = (
    parent
) => {
    if (
        !parent ||
        !frame.contentWindow
            .WusoolRuntime
    ) {
        return;
    }

    const runtime =
        frame.contentWindow
            .WusoolRuntime;

    const parentSelector =
        runtime
            .getStableSelector(
                parent
            );

    const childSelectors =
        Array.from(
            parent.children
        )
            .map(
                (child) =>
                    runtime
                        .getStableSelector(
                            child
                        )
            )
            .filter(Boolean);

    workingOrders[
        parentSelector
    ] =
        childSelectors;
};


const moveSelected = (
    direction
) => {
    if (!selectedElement) {
        return;
    }

    const parent =
        selectedElement
            .parentElement;

    if (!parent) {
        return;
    }

    if (
        direction === "up"
    ) {
        const previous =
            selectedElement
                .previousElementSibling;

        if (previous) {
            parent.insertBefore(
                selectedElement,
                previous
            );
        }
    } else {
        const next =
            selectedElement
                .nextElementSibling;

        if (next) {
            parent.insertBefore(
                next,
                selectedElement
            );
        }
    }

    saveCurrentParentOrder(
        parent
    );

    WusoolAdmin.toast(
        "Section order changed in preview."
    );
};


const createSectionHtml = (
    type,
    title,
    text
) => {
    const safeTitle =
        escapeHtml(title);

    const safeText =
        escapeHtml(text);

    const baseClass =
        "wusool-dynamic-section container-fluid px-3 px-md-4 px-xl-5 py-4";

    if (type === "cta") {
        return `
            <section class="${baseClass}">
                <div class="p-4 text-center border rounded-4 bg-white">
                    <h2 class="h3 fw-bold">${safeTitle}</h2>
                    <p class="text-secondary">${safeText}</p>
                    <a href="#" class="btn btn-wusool">Learn More</a>
                </div>
            </section>
        `;
    }

    if (type === "cards") {
        return `
            <section class="${baseClass}">
                <h2 class="h3 fw-bold mb-2">${safeTitle}</h2>
                <p class="text-secondary">${safeText}</p>

                <div class="row g-3 mt-1">
                    <div class="col-md-6">
                        <article class="card h-100 p-3">
                            Dynamic Card One
                        </article>
                    </div>

                    <div class="col-md-6">
                        <article class="card h-100 p-3">
                            Dynamic Card Two
                        </article>
                    </div>
                </div>
            </section>
        `;
    }

    if (type === "stats") {
        return `
            <section class="${baseClass}">
                <h2 class="h3 fw-bold mb-2">${safeTitle}</h2>
                <p class="text-secondary">${safeText}</p>

                <div class="row g-3 mt-1">
                    <div class="col-6">
                        <div class="card p-3">
                            <strong class="fs-3">120+</strong>
                            <span>Accessible Places</span>
                        </div>
                    </div>

                    <div class="col-6">
                        <div class="card p-3">
                            <strong class="fs-3">82%</strong>
                            <span>Accessibility Score</span>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    if (type === "image") {
        return `
            <section class="${baseClass}">
                <div class="row g-4 align-items-center">
                    <div class="col-md-6">
                        <h2 class="h3 fw-bold">${safeTitle}</h2>
                        <p class="text-secondary">${safeText}</p>
                    </div>

                    <div class="col-md-6">
                        <img
                            src="https://via.placeholder.com/900x500?text=Wusool"
                            alt="Wusool section image"
                            class="img-fluid rounded-4"
                        >
                    </div>
                </div>
            </section>
        `;
    }

    return `
        <section class="${baseClass}">
            <h2 class="h3 fw-bold">${safeTitle}</h2>
            <p class="text-secondary mb-0">${safeText}</p>
        </section>
    `;
};


const escapeHtml = (
    value
) => {
    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
};


const addDynamicSection = () => {
    if (
        !currentPage ||
        !frame.contentDocument
    ) {
        return;
    }

    const type =
        document.getElementById(
            "newSectionType"
        ).value;

    const title =
        document.getElementById(
            "newSectionTitle"
        ).value.trim();

    const text =
        document.getElementById(
            "newSectionText"
        ).value.trim();

    const id =
        `admin-section-${Date.now()}`;

    const html =
        createSectionHtml(
            type,
            title,
            text
        );

    const doc =
        frame.contentDocument;

    const parent =
        doc.querySelector(
            "main"
        ) ||
        doc.body;

    const template =
        doc.createElement(
            "template"
        );

    template.innerHTML =
        html.trim();

    const element =
        template.content
            .firstElementChild;

    element.setAttribute(
        "data-wusool-dynamic-id",
        id
    );

    parent.appendChild(
        element
    );

    const runtime =
        frame.contentWindow
            .WusoolRuntime;

    const parentSelector =
        runtime
            ?.getStableSelector(
                parent
            ) ||
        "main";

    workingInsertions.push({
        id,
        parentSelector,
        html
    });

    selectElement(
        element
    );

    saveCurrentParentOrder(
        parent
    );

    WusoolAdmin.toast(
        "New section added to preview."
    );
};


const publishChanges = () => {
    if (!currentPage) {
        return;
    }

    const allOverrides =
        readJson(
            STORAGE.overrides,
            {}
        );

    const allInsertions =
        readJson(
            STORAGE.insertions,
            {}
        );

    const allOrders =
        readJson(
            STORAGE.orders,
            {}
        );

    allOverrides[
        currentPage.pageKey
    ] =
        workingOverrides;

    allInsertions[
        currentPage.pageKey
    ] =
        workingInsertions;

    allOrders[
        currentPage.pageKey
    ] =
        workingOrders;

    writeJson(
        STORAGE.overrides,
        allOverrides
    );

    writeJson(
        STORAGE.insertions,
        allInsertions
    );

    writeJson(
        STORAGE.orders,
        allOrders
    );

    WusoolAdmin.toast(
        "Published. Open the real page to see the changes."
    );
};


const resetPageChanges = () => {
    if (
        !currentPage ||
        !confirm(
            "Remove all Admin page-builder changes for this page?"
        )
    ) {
        return;
    }

    [
        STORAGE.overrides,
        STORAGE.insertions,
        STORAGE.orders
    ].forEach(
        (storageKey) => {
            const data =
                readJson(
                    storageKey,
                    {}
                );

            delete data[
                currentPage.pageKey
            ];

            writeJson(
                storageKey,
                data
            );
        }
    );

    loadSelectedPage();

    WusoolAdmin.toast(
        "Page customizations reset."
    );
};


const applyGlobalTheme = () => {
    const theme =
        readJson(
            STORAGE.theme,
            {}
        );

    theme.primaryColor =
        document.getElementById(
            "globalPrimaryColor"
        ).value;

    theme.sidebarColor =
        document.getElementById(
            "globalSidebarColor"
        ).value;

    theme.backgroundColor =
        document.getElementById(
            "globalBackgroundColor"
        ).value;

    writeJson(
        STORAGE.theme,
        theme
    );

    frame.contentWindow
        ?.WusoolRuntime
        ?.applyAll();

    WusoolAdmin.toast(
        "Global theme saved."
    );
};


const loadThemeControls = () => {
    const theme =
        readJson(
            STORAGE.theme,
            {}
        );

    document.getElementById(
        "globalPrimaryColor"
    ).value =
        theme.primaryColor ||
        "#087f75";

    document.getElementById(
        "globalSidebarColor"
    ).value =
        theme.sidebarColor ||
        "#0b2a43";

    document.getElementById(
        "globalBackgroundColor"
    ).value =
        theme.backgroundColor ||
        "#f8fbfb";
};


document.getElementById(
    "applyElementChanges"
).addEventListener(
    "click",
    applyElementChanges
);


document.getElementById(
    "moveElementUp"
).addEventListener(
    "click",
    () => moveSelected(
        "up"
    )
);


document.getElementById(
    "moveElementDown"
).addEventListener(
    "click",
    () => moveSelected(
        "down"
    )
);


document.getElementById(
    "elementImageFile"
).addEventListener(
    "change",
    (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const reader =
            new FileReader();

        reader.onload = () => {
            document.getElementById(
                "elementImage"
            ).value =
                reader.result;

            if (
                selectedElement?.tagName ===
                "IMG"
            ) {
                selectedElement.src =
                    reader.result;
            }
        };

        reader.readAsDataURL(
            file
        );
    }
);


document.getElementById(
    "addSectionButton"
).addEventListener(
    "click",
    addDynamicSection
);


document.getElementById(
    "publishChanges"
).addEventListener(
    "click",
    publishChanges
);


document.getElementById(
    "resetPageChanges"
).addEventListener(
    "click",
    resetPageChanges
);


document.getElementById(
    "refreshPreview"
).addEventListener(
    "click",
    loadSelectedPage
);


document.getElementById(
    "applyGlobalTheme"
).addEventListener(
    "click",
    applyGlobalTheme
);


document.querySelectorAll(
    "[data-device]"
).forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                document.querySelectorAll(
                    "[data-device]"
                )
                    .forEach(
                        (item) =>
                            item.classList
                                .remove(
                                    "active"
                                )
                    );

                button.classList.add(
                    "active"
                );

                frameHolder.className =
                    `preview-frame-holder device-${button.dataset.device}`;
            }
        );
    }
);


portalSelect.addEventListener(
    "change",
    renderPages
);


pageSelect.addEventListener(
    "change",
    loadSelectedPage
);


frame.addEventListener(
    "load",
    () => {
        /*
            Some pages build navigation after DOMContentLoaded.
            Wait briefly before enabling the visual selector.
        */
        setTimeout(
            setupFrameEditor,
            350
        );
    }
);


setupPreviewSessions();
loadThemeControls();
renderPages();


/* =========================================
   Phase 4: Drafts, Versions & Media Library
========================================= */

const pageDraftId = () => {
    return currentPage
        ? `page-builder:${currentPage.pageKey}`
        : null;
};


const getBuilderDraftPayload = () => {
    return {
        pageKey:
            currentPage?.pageKey ||
            "",
        overrides:
            workingOverrides,
        insertions:
            workingInsertions,
        orders:
            workingOrders
    };
};


const restorePageDraft = () => {
    const id =
        pageDraftId();

    if (!id) {
        return;
    }

    const draft =
        WusoolVersionService
            ?.getDraft(
                id
            );

    if (!draft?.data) {
        return;
    }

    workingOverrides =
        structuredClone(
            draft.data
                .overrides ||
            {}
        );

    workingInsertions =
        structuredClone(
            draft.data
                .insertions ||
            []
        );

    workingOrders =
        structuredClone(
            draft.data
                .orders ||
            {}
        );
};


document.getElementById(
    "savePageDraft"
)?.addEventListener(
    "click",
    () => {
        const id =
            pageDraftId();

        if (!id) {
            return;
        }

        WusoolVersionService
            .saveDraft(
                id,
                getBuilderDraftPayload()
            );

        WusoolAdmin.toast(
            "Page draft saved. Users still see the published version."
        );
    }
);


/*
    Wrap existing publish function with automatic version backup.
*/
const originalPublishChanges =
    publishChanges;

publishChanges = () => {
    WusoolVersionService
        .createVersion({
            area:
                "Visual Page Builder",
            description:
                `Published changes for ${currentPage?.pageKey || "page"}`
        });

    originalPublishChanges();

    const id =
        pageDraftId();

    if (id) {
        WusoolVersionService
            .removeDraft(
                id
            );
    }
};


const setupMediaLibraryPicker = () => {
    const button =
        document.getElementById(
            "openMediaLibrary"
        );

    const grid =
        document.getElementById(
            "builderMediaGrid"
        );

    const modalElement =
        document.getElementById(
            "mediaLibraryModal"
        );

    if (
        !button ||
        !grid ||
        !modalElement
    ) {
        return;
    }

    const modal =
        new bootstrap.Modal(
            modalElement
        );

    const renderMedia = () => {
        let media = [];

        try {
            media =
                JSON.parse(
                    localStorage.getItem(
                        "wusoolMediaLibrary"
                    ) ||
                    "[]"
                );
        } catch {
            media = [];
        }

        const images =
            media.filter(
                (item) =>
                    item.src
            );

        grid.innerHTML =
            images.length
                ? images
                    .map(
                        (item) => `
                            <div class="col-6 col-md-4 col-xl-3">
                                <button
                                    type="button"
                                    class="media-picker-card"
                                    data-media-src="${item.src}"
                                    data-media-name="${item.name || "Image"}"
                                >
                                    <img
                                        src="${item.src}"
                                        alt="${item.name || "Media"}"
                                    >

                                    <span>
                                        ${item.name || "Image"}
                                    </span>
                                </button>
                            </div>
                        `
                    )
                    .join("")
                : `
                    <div class="col-12">
                        <div class="alert alert-light border mb-0">
                            No uploaded images yet. Open Media Library and upload images first.
                        </div>
                    </div>
                `;
    };

    button.addEventListener(
        "click",
        () => {
            renderMedia();
            modal.show();
        }
    );

    grid.addEventListener(
        "click",
        (event) => {
            const card =
                event.target.closest(
                    "[data-media-src]"
                );

            if (!card) {
                return;
            }

            const src =
                card.dataset
                    .mediaSrc;

            document.getElementById(
                "elementImage"
            ).value =
                src;

            if (
                selectedElement?.tagName ===
                "IMG"
            ) {
                selectedElement.src =
                    src;
            }

            modal.hide();

            WusoolAdmin.toast(
                "Image selected. Apply and publish when ready."
            );
        }
    );
};


setupMediaLibraryPicker();
