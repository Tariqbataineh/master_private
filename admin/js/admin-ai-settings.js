
"use strict";

const KEY = "aiSettings";

let settings = {
    enabled: true,
    confidenceThreshold: 75,
    humanReview: true,
    generateSuggestions: true,
    ...WusoolFeatureStore.read(KEY, {})
};

const enabled = document.getElementById("aiEnabled");
const threshold = document.getElementById("confidenceThreshold");
const confidenceLabel = document.getElementById("confidenceLabel");
const humanReview = document.getElementById("humanReview");
const generateSuggestions = document.getElementById("generateSuggestions");

enabled.checked = settings.enabled;
threshold.value = settings.confidenceThreshold;
confidenceLabel.textContent = settings.confidenceThreshold;
humanReview.checked = settings.humanReview;
generateSuggestions.checked = settings.generateSuggestions;

threshold.addEventListener("input", () => {
    confidenceLabel.textContent = threshold.value;
});

document.getElementById("saveAiSettings").addEventListener("click", () => {
    settings = {
        enabled: enabled.checked,
        confidenceThreshold: Number(threshold.value),
        humanReview: humanReview.checked,
        generateSuggestions: generateSuggestions.checked
    };

    WusoolFeatureStore.write(KEY, settings);
    WusoolAdmin.toast("AI settings saved.");
});
