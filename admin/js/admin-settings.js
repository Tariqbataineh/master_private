
"use strict";

const KEY = "systemSettings";

const defaults = {
    platformName: "Wusool",
    supportEmail: "support@wusool.local",
    supportPhone: "",
    defaultLanguage: "en",
    maxUploadMb: 10,
    defaultCity: "Amman",
    requireBranchApproval: true,
    enableAiByDefault: true,
    allowPublicReviews: true
};

let settings = {
    ...defaults,
    ...WusoolFeatureStore.read(KEY, {})
};

const fields = [
    "platformName",
    "supportEmail",
    "supportPhone",
    "defaultLanguage",
    "maxUploadMb",
    "defaultCity"
];

fields.forEach((id) => {
    document.getElementById(id).value = settings[id];
});

["requireBranchApproval", "enableAiByDefault", "allowPublicReviews"]
    .forEach((id) => {
        document.getElementById(id).checked = Boolean(settings[id]);
    });

document.getElementById("saveSettings").addEventListener("click", () => {
    WusoolVersionService.createVersion({
        area: "System Settings",
        description: "Global settings changed"
    });

    fields.forEach((id) => {
        settings[id] = document.getElementById(id).value;
    });

    settings.maxUploadMb = Number(settings.maxUploadMb);

    ["requireBranchApproval", "enableAiByDefault", "allowPublicReviews"]
        .forEach((id) => {
            settings[id] = document.getElementById(id).checked;
        });

    WusoolFeatureStore.write(KEY, settings);
    WusoolAdmin.toast("System settings saved.");
});
