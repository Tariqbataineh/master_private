"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("wusool-user-name") || "User";

  document.querySelectorAll("[data-user-name]").forEach((element) => {
    element.textContent = userName;
  });

  const markAllButton = document.getElementById("markAllRead");

  markAllButton?.addEventListener("click", () => {
    document.querySelectorAll(".notification-item").forEach((item) => {
      item.classList.remove("is-unread");
    });

    markAllButton.disabled = true;
    markAllButton.textContent = "All Read";
  });

  const settingsForm = document.getElementById("accountSettingsForm");

  if (settingsForm) {
    const savedSettings = JSON.parse(
      localStorage.getItem("wusool-account-settings") || "{}",
    );

    settingsForm.elements.fullName.value = savedSettings.fullName || userName;
    settingsForm.elements.email.value = savedSettings.email || "";
    settingsForm.elements.language.value = savedSettings.language || "en";

    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(settingsForm);
      const settings = Object.fromEntries(formData.entries());

      localStorage.setItem("wusool-account-settings", JSON.stringify(settings));
      localStorage.setItem("wusool-user-name", settings.fullName);
      showStatus("settingsStatus", "Account settings saved successfully.");
    });
  }

  const addPlaceForm = document.getElementById("addPlaceForm");

  addPlaceForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const suggestions = JSON.parse(
      localStorage.getItem("wusool-place-suggestions") || "[]",
    );

    const suggestion = Object.fromEntries(new FormData(addPlaceForm).entries());

    suggestions.push({
      ...suggestion,
      id: Date.now(),
      status: "Pending Review",
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(
      "wusool-place-suggestions",
      JSON.stringify(suggestions),
    );

    addPlaceForm.reset();
    showStatus("placeStatus", "Place submitted for admin review.");
  });

  const supportForm = document.getElementById("supportForm");

  supportForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const requests = JSON.parse(
      localStorage.getItem("wusool-support-requests") || "[]",
    );

    requests.push({
      ...Object.fromEntries(new FormData(supportForm).entries()),
      id: Date.now(),
      status: "Open",
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem("wusool-support-requests", JSON.stringify(requests));
    supportForm.reset();
    showStatus("supportStatus", "Your request was sent successfully.");
  });

  function showStatus(elementId, message) {
    const status = document.getElementById(elementId);
    status.textContent = message;
    status.classList.remove("d-none");
  }
});
