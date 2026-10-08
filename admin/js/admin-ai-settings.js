"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const KEY = "aiSettings";
  let settings = {
    enabled: true,
    confidenceThreshold: 75,
    humanReview: true,
    generateSuggestions: true,
    ...(await WusoolFeatureStore.read(KEY, {}))
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
  WusoolUI.listen(threshold, "input", () => {
    confidenceLabel.textContent = threshold.value;
  });
  WusoolUI.listen(document.getElementById("saveAiSettings"), "click", async () => {
    settings = {
      enabled: enabled.checked,
      confidenceThreshold: Number(threshold.value),
      humanReview: humanReview.checked,
      generateSuggestions: generateSuggestions.checked
    };
    await WusoolFeatureStore.write(KEY, settings);
    WusoolAdmin.toast("AI settings saved.");
  });
});
