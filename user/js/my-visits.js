"use strict";

const demoVisits = [
  {
    id: 1001,
    placeId: 2,
    placeName: "Al Noor Medical Center",
    branch: "Main Medical Center",
    destination: "Appointments Department",
    purpose: "Medical Visit",
    date: "2026-10-05",
    time: "10:30",
    support: [
      "Wheelchair support",
      "AI visual navigation",
    ],
    notes: "",
    status: "Confirmed",
  },
  {
    id: 1002,
    placeId: 1,
    placeName: "Amman City Hall",
    branch: "Main Branch - Amman",
    destination: "Customer Service",
    purpose: "Document Submission",
    date: "2026-08-15",
    time: "09:00",
    support: [
      "Staff assistance",
    ],
    notes: "",
    status: "Completed",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const visitsContainer =
    document.getElementById(
      "visitsContainer",
    );

  const emptyVisits =
    document.getElementById(
      "emptyVisits",
    );

  const visitSearch =
    document.getElementById(
      "visitSearch",
    );

  const filterButtons =
    document.querySelectorAll(
      "[data-filter]",
    );

  const upcomingCount =
    document.getElementById(
      "upcomingCount",
    );

  const completedCount =
    document.getElementById(
      "completedCount",
    );

  const cancelledCount =
    document.getElementById(
      "cancelledCount",
    );

  const confirmCancelButton =
    document.getElementById(
      "confirmCancelVisit",
    );

  const cancelModalElement =
    document.getElementById(
      "cancelVisitModal",
    );

  const navbarUserName =
    document.getElementById(
      "navbarUserName",
    );

  navbarUserName.textContent =
    localStorage.getItem(
      "wusool-user-name",
    ) || "User";

  const cancelModal =
    new bootstrap.Modal(
      cancelModalElement,
    );

  let activeFilter = "all";
  let selectedVisitId = null;

  const initializeVisits = () => {
    const storedVisits =
      localStorage.getItem(
        "wusool-visits",
      );

    if (!storedVisits) {
      localStorage.setItem(
        "wusool-visits",
        JSON.stringify(demoVisits),
      );
    }
  };

  const getVisits = () => {
    const storedVisits =
      localStorage.getItem(
        "wusool-visits",
      );

    if (!storedVisits) {
      return [];
    }

    try {
      return JSON.parse(storedVisits);
    } catch {
      return [];
    }
  };

  const saveVisits = (visits) => {
    localStorage.setItem(
      "wusool-visits",
      JSON.stringify(visits),
    );
  };

  const formatDate = (dateValue) => {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ).format(
      new Date(`${dateValue}T00:00:00`),
    );
  };

  const formatTime = (timeValue) => {
    const [hours, minutes] =
      timeValue.split(":");

    const timeDate = new Date();

    timeDate.setHours(
      Number(hours),
      Number(minutes),
    );

    return new Intl.DateTimeFormat(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    ).format(timeDate);
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      Confirmed: "status-confirmed",
      Completed: "status-completed",
      Cancelled: "status-cancelled",
    };

    return (
      statusClasses[status] ||
      "status-confirmed"
    );
  };

  const createSupportTags = (
    support,
  ) => {
    if (!support || support.length === 0) {
      return `
        <span class="text-secondary small">
          No additional support
        </span>
      `;
    }

    return support
      .map((supportItem) => {
        return `
          <span class="support-tag">
            ${supportItem}
          </span>
        `;
      })
      .join("");
  };

  const createVisitActions = (visit) => {
    if (visit.status === "Confirmed") {
      return `
        <a
          class="btn btn-wusool"
          href="./visit-details.html?id=${visit.id}"
        >
          View Details
        </a>

        <a
          class="btn btn-wusool-outline"
          href="./visual-navigation-start.html?placeId=${visit.placeId}&visitId=${visit.id}"
        >
          Start Navigation
        </a>

        <button
          class="btn btn-outline-danger"
          type="button"
          data-cancel-id="${visit.id}"
        >
          Cancel
        </button>
      `;
    }

    if (visit.status === "Completed") {
      return `
        <a
          class="btn btn-wusool"
          href="./visit-details.html?id=${visit.id}"
        >
          View Details
        </a>

        <a
          class="btn btn-wusool-outline"
          href="./write-review.html?visitId=${visit.id}"
        >
          Write Review
        </a>
      `;
    }

    return `
      <a
        class="btn btn-light"
        href="./visit-details.html?id=${visit.id}"
      >
        View Details
      </a>

      <a
        class="btn btn-wusool-outline"
        href="./plan-visit.html?placeId=${visit.placeId}"
      >
        Plan Again
      </a>
    `;
  };

  const createVisitCard = (visit) => {
    const column =
      document.createElement("div");

    column.className =
      "col-12 col-xl-6";

    column.innerHTML = `
      <article class="visit-card h-100">
        <div
          class="d-flex justify-content-between align-items-start gap-3 mb-4"
        >
          <div class="d-flex gap-3">
            <span class="place-icon">
              <i class="bi bi-building"></i>
            </span>

            <div>
              <h2 class="h5 mb-1">
                ${visit.placeName}
              </h2>

              <p class="text-secondary mb-0">
                ${visit.branch}
              </p>
            </div>
          </div>

          <span
            class="visit-status ${getStatusClass(visit.status)}"
          >
            ${visit.status}
          </span>
        </div>

        <ul class="visit-information mb-4">
          <li>
            <i class="bi bi-geo-alt-fill"></i>
            ${visit.destination}
          </li>

          <li>
            <i class="bi bi-calendar3"></i>
            ${formatDate(visit.date)}
          </li>

          <li>
            <i class="bi bi-clock"></i>
            ${formatTime(visit.time)}
          </li>

          <li>
            <i class="bi bi-briefcase"></i>
            ${visit.purpose}
          </li>
        </ul>

        <div class="support-list mb-4">
          ${createSupportTags(visit.support)}
        </div>

        <div class="d-flex flex-wrap gap-2 mt-auto">
          ${createVisitActions(visit)}
        </div>
      </article>
    `;

    return column;
  };

  const updateStatistics = () => {
    const visits = getVisits();

    upcomingCount.textContent =
      visits.filter((visit) => {
        return visit.status === "Confirmed";
      }).length;

    completedCount.textContent =
      visits.filter((visit) => {
        return visit.status === "Completed";
      }).length;

    cancelledCount.textContent =
      visits.filter((visit) => {
        return visit.status === "Cancelled";
      }).length;
  };

  const getFilteredVisits = () => {
    const searchValue =
      visitSearch.value
        .trim()
        .toLowerCase();

    return getVisits().filter((visit) => {
      const matchesFilter =
        activeFilter === "all" ||
        visit.status === activeFilter;

      const matchesSearch =
        visit.placeName
          .toLowerCase()
          .includes(searchValue) ||
        visit.branch
          .toLowerCase()
          .includes(searchValue) ||
        visit.destination
          .toLowerCase()
          .includes(searchValue);

      return (
        matchesFilter &&
        matchesSearch
      );
    });
  };

  const addCancelEvents = () => {
    const cancelButtons =
      document.querySelectorAll(
        "[data-cancel-id]",
      );

    cancelButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          selectedVisitId =
            Number(
              button.dataset.cancelId,
            );

          cancelModal.show();
        },
      );
    });
  };

  const renderVisits = () => {
    const filteredVisits =
      getFilteredVisits();

    visitsContainer.innerHTML = "";

    if (filteredVisits.length === 0) {
      emptyVisits.classList.remove(
        "d-none",
      );

      return;
    }

    emptyVisits.classList.add(
      "d-none",
    );

    filteredVisits.forEach((visit) => {
      visitsContainer.appendChild(
        createVisitCard(visit),
      );
    });

    addCancelEvents();
  };

  filterButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        filterButtons.forEach(
          (filterButton) => {
            filterButton.classList.remove(
              "active",
            );
          },
        );

        button.classList.add("active");

        activeFilter =
          button.dataset.filter;

        renderVisits();
      },
    );
  });

  visitSearch.addEventListener(
    "input",
    renderVisits,
  );

  confirmCancelButton.addEventListener(
    "click",
    () => {
      const visits = getVisits();

      const updatedVisits =
        visits.map((visit) => {
          if (
            visit.id === selectedVisitId
          ) {
            return {
              ...visit,
              status: "Cancelled",
            };
          }

          return visit;
        });

      saveVisits(updatedVisits);

      cancelModal.hide();

      updateStatistics();
      renderVisits();

      showStatusMessage(
        "Visit cancelled successfully.",
      );
    },
  );

  initializeVisits();
  updateStatistics();
  renderVisits();

  const parameters =
    new URLSearchParams(
      window.location.search,
    );

  if (
    parameters.get("confirmed") ===
    "true"
  ) {
    showStatusMessage(
      "Your visit was confirmed successfully.",
    );
  }
});