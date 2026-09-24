
"use strict";

const KEY = "wusoolContentManager";

const defaults = {
    user: {
        "User Home": {
            heroTitle: "Find Accessible Places",
            heroDescription: "Discover places that match your accessibility needs.",
            primaryButton: "Explore Places"
        },
        "User Dashboard": {
            pageTitle: "Welcome Back",
            pageDescription: "Manage your visits, recommendations and requests."
        }
    },
    organization: {
        "Organization Dashboard": {
            pageTitle: "Organization Dashboard",
            pageDescription: "Manage your branches and accessibility information."
        },
        "Help & Support": {
            pageTitle: "How Can We Help?",
            pageDescription: "Find answers or send a support request to the Wusool team."
        }
    }
};

let contentState = {
    ...defaults,
    ...WusoolFeatureStore.read(KEY, {})
};

const portalSelect = document.getElementById("portalSelect");
const pageSelect = document.getElementById("pageSelect");
const contentFields = document.getElementById("contentFields");
const contentPageTitle = document.getElementById("contentPageTitle");

const formatLabel = (key) => {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letter) => letter.toUpperCase());
};

const renderPages = () => {
    const pages = Object.keys(contentState[portalSelect.value]);

    pageSelect.innerHTML = pages
        .map((page) => `<option value="${page}">${page}</option>`)
        .join("");

    renderFields();
};

const renderFields = () => {
    const fields = contentState[portalSelect.value][pageSelect.value];

    contentPageTitle.textContent = pageSelect.value;

    contentFields.innerHTML = Object.entries(fields)
        .map(([key, value]) => `
            <div class="content-field">
                <label class="form-label fw-semibold">${formatLabel(key)}</label>
                <textarea
                    class="form-control"
                    data-content-key="${key}"
                    rows="2"
                >${value}</textarea>
            </div>
        `)
        .join("");
};

const collect = () => {
    const target = contentState[portalSelect.value][pageSelect.value];

    document.querySelectorAll("[data-content-key]").forEach((field) => {
        target[field.dataset.contentKey] = field.value.trim();
    });
};

document.getElementById("saveDraftButton").addEventListener("click", () => {
    collect();

    WusoolVersionService.saveDraft(
        `content:${portalSelect.value}:${pageSelect.value}`,
        contentState[portalSelect.value][pageSelect.value]
    );

    WusoolAdmin.toast("Content draft saved.");
});

document.getElementById("publishButton").addEventListener("click", () => {
    collect();

    WusoolVersionService.createVersion({
        area: "Content Manager",
        description: `Published ${portalSelect.value} / ${pageSelect.value}`
    });

    WusoolFeatureStore.write(KEY, contentState);
    WusoolAdmin.toast("Content published.");
});

portalSelect.addEventListener("change", renderPages);
pageSelect.addEventListener("change", renderFields);

renderPages();
