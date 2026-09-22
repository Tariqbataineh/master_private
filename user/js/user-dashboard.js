"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const savedUserName = localStorage.getItem("wusool-user-name") || "Tariq";
  const welcomeUserName = document.getElementById("welcomeUserName");
  const navbarUserName = document.getElementById("navbarUserName");
  const currentDate = document.getElementById("currentDate");
  const searchForm = document.getElementById("dashboardSearchForm");
  const searchInput = document.getElementById("searchInput");
  const savedButtons = document.querySelectorAll(".saved-button");

  welcomeUserName.textContent = savedUserName;
  navbarUserName.textContent = savedUserName;

  currentDate.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchValue = searchInput.value.trim();

    if (!searchValue) {
      searchInput.focus();
      showStatusMessage("Enter a place or service to search.");
      return;
    }

    const searchParameters = new URLSearchParams({ search: searchValue });

    window.location.href = `../../visitor/html/accessibility-map.html?${searchParameters.toString()}`;
  });

  savedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const icon = button.querySelector("i");
      const isSaved = icon.classList.contains("bi-bookmark-fill");

      icon.classList.toggle("bi-bookmark-fill", !isSaved);
      icon.classList.toggle("bi-bookmark", isSaved);
      button.setAttribute(
        "aria-label",
        isSaved ? "Save this place" : "Remove this place from saved places",
      );

      showStatusMessage(
        isSaved ? "Place removed from saved places." : "Place saved.",
      );
    });
  });
});
