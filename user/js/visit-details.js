"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const detailsContent =
    document.getElementById(
      "detailsContent",
    );

  const missingVisit =
    document.getElementById(
      "missingVisit",
    );

  const navbarUserName =
    document.getElementById(
      "navbarUserName",
    );

  const visitReference =
    document.getElementById(
      "visitReference",
    );

  const headingPlaceName =
    document.getElementById(
      "headingPlaceName",
    );

  const visitStatus =
    document.getElementById(
      "visitStatus",
    );

  const placeName =
    document.getElementById("placeName");

  const branchName =
    document.getElementById("branchName");

  const visitDate =
    document.getElementById("visitDate");

  const visitTime =
    document.getElementById("visitTime");

  const destination =
    document.getElementById("destination");

  const visitPurpose =
    document.getElementById(
      "visitPurpose",
    );

  const supportList =
    document.getElementById("supportList");

  const notesCard =
    document.getElementById("notesCard");

  const visitNotes =
    document.getElementById("visitNotes");

  const visitActions =
    document.getElementById(
      "visitActions",
    );

  const placeDetailsButton =
    document.getElementById(
      "placeDetailsButton",
    );

  const directionsButton =
    document.getElementById(
      "directionsButton",
    );

  const confirmCancelButton =
    document.getElementById(
      "confirmCancelButton",
    );

  const cancelModal =
    new bootstrap.Modal(
      document.getElementById(
        "cancelVisitModal",
      ),
    );

  navbarUserName.textContent =
    localStorage.getItem(
      "wusool-user-name",
    ) || "User";

  const parameters =
    new URLSearchParams(
      window.location.search,
    );

  const visitId =
    Number(parameters.get("id"));

  const getVisits = () => {
    const savedVisits =
      localStorage.getItem(
        "wusool-visits",
      );

    if (!savedVisits) {
      return [];
    }

    try {
      return JSON.parse(savedVisits);
    } catch {
      return [];
    }
  };

  const getSelectedVisit = () => {
    return getVisits().find((visit) => {
      return visit.id === visitId;
    });
  };

  const formatDate = (dateValue) => {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        weekday: "long",
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

  const renderSupport = (support) => {
    supportList.innerHTML = "";

    if (!support || support.length === 0) {
      supportList.innerHTML = `
        <span class="text-secondary">
          No additional support selected.
        </span>
      `;

      return;
    }

    support.forEach((supportItem) => {
      const supportTag =
        document.createElement("span");

      supportTag.className =
        "support-tag";

      supportTag.innerHTML = `
        <i class="bi bi-check-circle-fill me-1"></i>
        ${supportItem}
      `;

      supportList.appendChild(
        supportTag,
      );
    });
  };

  const saveGuidanceMethod = (
    selectedVisitId,
    guidanceMethod,
  ) => {
    const updatedVisits = getVisits().map((storedVisit) => {
      if (storedVisit.id === selectedVisitId) {
        return {
          ...storedVisit,
          guidanceMethod,
        };
      }

      return storedVisit;
    });

    localStorage.setItem(
      "wusool-visits",
      JSON.stringify(updatedVisits),
    );
  };

  const renderActions = (visit) => {
    if (visit.status === "Confirmed") {
      visitActions.innerHTML = `
  <div class="guidance-selection">
    <h3 class="h6 fw-bold mb-3">
      How would you like to receive guidance?
    </h3>

    <div class="d-grid gap-2">

      <button
        class="btn btn-outline-secondary guidance-method ${
          (visit.guidanceMethod || "both") === "text"
            ? "active"
            : ""
        }"
        type="button"
        data-guidance="text"
      >
        <i class="bi bi-chat-left-text me-2"></i>
        Text
      </button>

      <button
        class="btn btn-outline-secondary guidance-method ${
          (visit.guidanceMethod || "both") === "voice"
            ? "active"
            : ""
        }"
        type="button"
        data-guidance="voice"
      >
        <i class="bi bi-volume-up me-2"></i>
        Voice
      </button>

      <button
        class="btn btn-outline-secondary guidance-method ${
          (visit.guidanceMethod || "both") === "both"
            ? "active"
            : ""
        }"
        type="button"
        data-guidance="both"
      >
        <i class="bi bi-stars me-2"></i>
        Text & Voice
      </button>

    </div>
  </div>

  <button
    class="btn btn-wusool"
    id="arrivedButton"
    type="button"
  >
    <i class="bi bi-geo-alt-fill me-2"></i>
    I Have Arrived – Start AI Navigation
  </button>

  <a
    class="btn btn-wusool-outline"
    href="./plan-visit.html?placeId=${visit.placeId}"
  >
    <i class="bi bi-calendar-event me-2"></i>
    Reschedule Visit
  </a>

  <button
    class="btn btn-outline-danger"
    id="cancelVisitButton"
    type="button"
  >
    <i class="bi bi-x-circle me-2"></i>
    Cancel Visit
  </button>
`;
document
  .getElementById(
    "cancelVisitButton",
  )
  .addEventListener(
    "click",
    () => {
      cancelModal.show();
    },
  );
  let selectedGuidanceMethod =
    visit.guidanceMethod || "both";

const guidanceButtons =
  document.querySelectorAll(
    ".guidance-method",
  );

guidanceButtons.forEach((button) => {
  button.addEventListener(
    "click",
    () => {
      guidanceButtons.forEach(
        (item) => {
          item.classList.remove(
            "active",
          );
        },
      );

      button.classList.add(
        "active",
      );

      selectedGuidanceMethod =
        button.dataset.guidance;

      saveGuidanceMethod(
        visit.id,
        selectedGuidanceMethod,
      );
    },
  );
});
const arrivedButton =
  document.getElementById(
    "arrivedButton",
  );

arrivedButton.addEventListener(
  "click",
  () => {
    const navigationSession = {
      sessionId: Date.now(),

      visitId: visit.id,

      placeId: visit.placeId,

      placeName: visit.placeName,

      branchName: visit.branch,

      destination: visit.destination,

      guidanceMethod:
        selectedGuidanceMethod,

      status:
        "waiting-for-photo",

      navigationStep: -1,

      createdAt:
        new Date().toISOString(),
    };

    localStorage.setItem(
      "wusool-navigation-session",
      JSON.stringify(
        navigationSession,
      ),
    );

    window.location.href =
      `./analyze-surroundings.html?visitId=${visit.id}`;
  },
);

      return;
    }

    if (visit.status === "Completed") {
      visitActions.innerHTML = `
        <a
          class="btn btn-wusool"
          href="./write-review.html?visitId=${visit.id}"
        >
          <i class="bi bi-star me-2"></i>
          Write Review
        </a>

        <a
          class="btn btn-wusool-outline"
          href="./plan-visit.html?placeId=${visit.placeId}"
        >
          Plan Another Visit
        </a>

        <a
          class="btn btn-outline-danger"
          href="./report-accessibility-issue.html?placeId=${visit.placeId}&visitId=${visit.id}"
        >
          <i class="bi bi-flag me-2"></i>
          Report Accessibility Issue
        </a>
      `;

      return;
    }

    visitActions.innerHTML = `
      <a
        class="btn btn-wusool"
        href="./plan-visit.html?placeId=${visit.placeId}"
      >
        Plan Again
      </a>

      <a
        class="btn btn-light"
        href="./my-visits.html"
      >
        Return to My Visits
      </a>
    `;
  };

  const renderVisit = (visit) => {
    visitReference.textContent =
      `WUSOOL-${visit.id}`;

    headingPlaceName.textContent =
      visit.placeName;

    placeName.textContent =
      visit.placeName;

    branchName.textContent =
      visit.branch;

    visitDate.textContent =
      formatDate(visit.date);

    visitTime.textContent =
      formatTime(visit.time);

    destination.textContent =
      visit.destination;

    visitPurpose.textContent =
      visit.purpose;

    visitStatus.textContent =
      visit.status;

    visitStatus.className =
      `visit-status ${getStatusClass(visit.status)}`;

    placeDetailsButton.href =
      `./user-place-details.html?id=${visit.placeId}`;

    const directionsQuery =
      encodeURIComponent(
        `${visit.placeName} ${visit.branch}`,
      );

    directionsButton.href =
      `https://www.google.com/maps/search/?api=1&query=${directionsQuery}`;

    renderSupport(visit.support);
    renderActions(visit);

    if (visit.notes) {
      visitNotes.textContent =
        visit.notes;

      notesCard.classList.remove(
        "d-none",
      );
    } else {
      notesCard.classList.add(
        "d-none",
      );
    }

    document.title =
      `${visit.placeName} Visit | Wusool`;
  };

  const cancelVisit = () => {
    const visits = getVisits();

    const updatedVisits =
      visits.map((visit) => {
        if (visit.id === visitId) {
          return {
            ...visit,
            status: "Cancelled",
          };
        }

        return visit;
      });

    localStorage.setItem(
      "wusool-visits",
      JSON.stringify(updatedVisits),
    );

    cancelModal.hide();

    const updatedVisit =
      updatedVisits.find((visit) => {
        return visit.id === visitId;
      });

    renderVisit(updatedVisit);

    showStatusMessage(
      "Visit cancelled successfully.",
    );
  };

  confirmCancelButton.addEventListener(
    "click",
    cancelVisit,
  );

  const selectedVisit =
    getSelectedVisit();

  if (!selectedVisit) {
    detailsContent.classList.add(
      "d-none",
    );

    missingVisit.classList.remove(
      "d-none",
    );
  } else {
    renderVisit(selectedVisit);
  }
});
