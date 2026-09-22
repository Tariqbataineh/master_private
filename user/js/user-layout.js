"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const getAuthenticatedUser = () => {
    try {
      return JSON.parse(sessionStorage.getItem("wusoolDemoUser"));
    } catch (error) {
      sessionStorage.removeItem("wusoolDemoUser");
      return null;
    }
  };

  const authenticatedUser = getAuthenticatedUser();

  if (!authenticatedUser) {
    window.location.replace("../../visitor/html/login.html");
    return;
  }

  const currentPage = window.location.pathname.split("/").pop() || "user-dashboard.html";
  const userName =
    authenticatedUser.name ||
    authenticatedUser.fullName ||
    localStorage.getItem("wusool-user-name") ||
    "User";

  const activePageMap = {
    "user-place-details.html": "explore-places.html",
    "community-reviews.html": "explore-places.html",
    "ai-accessibility-report.html": "explore-places.html",
    "plan-visit.html": "my-visits.html",
    "visit-summary.html": "my-visits.html",
    "visit-details.html": "my-visits.html",
    "analyze-surroundings.html": "my-visits.html",
    "navigation-guidance.html": "my-visits.html",
    "navigation-complete.html": "my-visits.html",
    "write-review.html": "my-reviews.html",
    "report-accessibility-issue.html": "my-reports.html",
  };

  const activePage = activePageMap[currentPage] || currentPage;

  const navigationGroups = [
    {
      label: "MAIN",
      links: [
        { href: "./user-dashboard.html", page: "user-dashboard.html", icon: "bi-grid", text: "Dashboard" },
        { href: "./explore-places.html", page: "explore-places.html", icon: "bi-map", text: "Explore Places" },
        { href: "./my-visits.html", page: "my-visits.html", icon: "bi-calendar-check", text: "My Visits" },
        { href: "./saved-places.html", page: "saved-places.html", icon: "bi-bookmark-heart", text: "Saved Places" },
      ],
    },
    {
      label: "DISCOVER",
      links: [
        { href: "./compare-places.html", page: "compare-places.html", icon: "bi-columns-gap", text: "Compare Places" },
        { href: "./smart-recommendations.html", page: "smart-recommendations.html", icon: "bi-stars", text: "Recommendations" },
        { href: "./add-place.html", page: "add-place.html", icon: "bi-geo-alt", text: "Suggest a Place" },
      ],
    },
    {
      label: "ACTIVITY",
      links: [
        { href: "./my-reviews.html", page: "my-reviews.html", icon: "bi-star", text: "My Reviews" },
        { href: "./my-reports.html", page: "my-reports.html", icon: "bi-flag", text: "My Reports" },
        { href: "./notifications.html", page: "notifications.html", icon: "bi-bell", text: "Notifications" },
      ],
    },
    {
      label: "ACCOUNT",
      links: [
        { href: "./user-profile.html", page: "user-profile.html", icon: "bi-person", text: "Profile & CV" },
        { href: "./accessibility-preferences.html", page: "accessibility-preferences.html", icon: "bi-universal-access", text: "Accessibility" },
        { href: "./account-settings.html", page: "account-settings.html", icon: "bi-gear", text: "Settings" },
        { href: "./help-support.html", page: "help-support.html", icon: "bi-question-circle", text: "Help & Support" },
      ],
    },
  ];

  const createNavigation = () => {
    return navigationGroups
      .map((group) => {
        const links = group.links
          .map((link) => {
            const isActive = link.page === activePage;

            return `
              <a
                class="user-sidebar-link${isActive ? " active" : ""}"
                href="${link.href}"
                ${isActive ? 'aria-current="page"' : ""}
              >
                <i class="bi ${link.icon}" aria-hidden="true"></i>
                <span>${link.text}</span>
              </a>
            `;
          })
          .join("");

        return `
          <section class="user-sidebar-group" aria-label="${group.label}">
            <p class="user-sidebar-label">${group.label}</p>
            <nav class="user-sidebar-nav">${links}</nav>
          </section>
        `;
      })
      .join("");
  };

  const sidebar = document.createElement("aside");
  sidebar.className = "user-sidebar";
  sidebar.id = "userSidebar";
  sidebar.setAttribute("aria-label", "User navigation");
  sidebar.innerHTML = `
    <header class="user-sidebar-header d-flex align-items-center justify-content-between gap-3">
      <a class="user-sidebar-brand" href="./user-dashboard.html">
        <span class="user-sidebar-logo" aria-hidden="true">
          <i class="bi bi-universal-access"></i>
        </span>
        <span>Wusool</span>
      </a>

      <button
        class="btn user-sidebar-close"
        id="closeUserSidebar"
        type="button"
        aria-label="Close navigation menu"
      >
        <i class="bi bi-x-lg"></i>
      </button>
    </header>

    <div class="user-sidebar-scroll">
      ${createNavigation()}
    </div>

    <footer class="user-sidebar-footer">
      <a class="user-sidebar-profile" href="./user-profile.html">
        <span class="user-sidebar-avatar" aria-hidden="true">
          <i class="bi bi-person-fill"></i>
        </span>
        <span class="flex-grow-1 overflow-hidden">
          <span class="user-sidebar-name">${userName}</span>
          <span class="user-sidebar-role">Registered User</span>
        </span>
        <i class="bi bi-chevron-right" aria-hidden="true"></i>
      </a>

      <button class="user-sidebar-logout" id="logoutUserButton" type="button">
        <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
        <span>Log Out</span>
      </button>
    </footer>
  `;

  const overlay = document.createElement("div");
  overlay.className = "user-sidebar-overlay";
  overlay.id = "userSidebarOverlay";

  const mobileTopbar = document.createElement("div");
  mobileTopbar.className = "user-mobile-topbar";
  mobileTopbar.innerHTML = `
    <a class="user-mobile-brand" href="./user-dashboard.html">
      <span class="user-sidebar-logo" aria-hidden="true">
        <i class="bi bi-universal-access"></i>
      </span>
      <span>Wusool</span>
    </a>

    <button
      class="user-mobile-menu"
      id="openUserSidebar"
      type="button"
      aria-controls="userSidebar"
      aria-expanded="false"
      aria-label="Open navigation menu"
    >
      <i class="bi bi-list fs-4"></i>
    </button>
  `;

  document.body.classList.add("user-sidebar-layout");
  const skipLink = document.querySelector(".skip-link");

  if (skipLink) {
    skipLink.insertAdjacentElement("afterend", mobileTopbar);
    mobileTopbar.insertAdjacentElement("afterend", sidebar);
    sidebar.insertAdjacentElement("afterend", overlay);
  } else {
    document.body.prepend(overlay);
    document.body.prepend(sidebar);
    document.body.prepend(mobileTopbar);
  }

  const openButton = document.getElementById("openUserSidebar");
  const closeButton = document.getElementById("closeUserSidebar");
  const logoutButton = document.getElementById("logoutUserButton");

  const openSidebar = () => {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-visible");
    document.body.classList.add("sidebar-open");
    openButton.setAttribute("aria-expanded", "true");
    closeButton.focus();
  };

  const closeSidebar = () => {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    document.body.classList.remove("sidebar-open");
    openButton.setAttribute("aria-expanded", "false");
  };

  openButton.addEventListener("click", openSidebar);
  closeButton.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("wusoolDemoUser");
    sessionStorage.removeItem("wusool-current-user");
    localStorage.removeItem("wusool-is-authenticated");

    window.location.href = "../../visitor/html/home.html";
  });

  sidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
      closeSidebar();
      openButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1200) {
      closeSidebar();
    }
  });
});
