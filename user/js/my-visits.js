"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const demoVisits = [];
  WusoolUI.ready(async () => {
    const visitsContainer = document.getElementById("visitsContainer");
    const emptyVisits = document.getElementById("emptyVisits");
    const visitSearch = document.getElementById("visitSearch");
    const filterButtons = document.querySelectorAll("[data-filter]");
    const upcomingCount = document.getElementById("upcomingCount");
    const completedCount = document.getElementById("completedCount");
    const cancelledCount = document.getElementById("cancelledCount");
    const confirmCancelButton = document.getElementById("confirmCancelVisit");
    const cancelModalElement = document.getElementById("cancelVisitModal");
    const navbarUserName = document.getElementById("navbarUserName");
    navbarUserName.textContent = (await WusoolServices.rawRead("wusool-user-name")) || "User";
    const cancelModal = new bootstrap.Modal(cancelModalElement);
    let activeFilter = "all";
    let selectedVisitId = null;
    const initializeVisits = async () => {
      const storedVisits = await WusoolServices.rawRead("wusool-visits");
      if (!storedVisits) {
        await WusoolServices.rawWrite("wusool-visits", JSON.stringify(demoVisits));
      }
    };
    const getVisits = async () => {
      const storedVisits = await WusoolServices.rawRead("wusool-visits");
      if (!storedVisits) {
        return [];
      }
      try {
        return JSON.parse(storedVisits);
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        return [];
      }
    };
    const saveVisits = async visits => {
      await WusoolServices.rawWrite("wusool-visits", JSON.stringify(visits));
    };
    const formatDate = dateValue => {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(`${dateValue}T00:00:00`));
    };
    const formatTime = timeValue => {
      const [hours, minutes] = timeValue.split(":");
      const timeDate = new Date();
      timeDate.setHours(Number(hours), Number(minutes));
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit"
      }).format(timeDate);
    };
    const getStatusClass = status => {
      const statusClasses = {
        Confirmed: "status-confirmed",
        Completed: "status-completed",
        Cancelled: "status-cancelled"
      };
      return statusClasses[status] || "status-confirmed";
    };
    const createSupportTags = support => {
      if (!support || support.length === 0) {
        return `
        <span class="text-secondary small">
          No additional support
        </span>
      `;
      }
      return support.map(supportItem => {
        return `
          <span class="support-tag">
            ${supportItem}
          </span>
        `;
      }).join("");
    };
    const createVisitActions = visit => {
      if (visit.status === "Confirmed") {
        return `
        <a
          class="btn btn-wusool"
          href="./visit-details.html?id=${visit.id}"
        >
          View Details
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
    const createVisitCard = visit => {
      const column = document.createElement("div");
      column.className = "col-12 col-xl-6";
      WusoolUI.html(column, `
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
    `);
      return column;
    };
    const updateStatistics = async () => {
      const visits = await getVisits();
      upcomingCount.textContent = visits.filter(visit => {
        return visit.status === "Confirmed";
      }).length;
      completedCount.textContent = visits.filter(visit => {
        return visit.status === "Completed";
      }).length;
      cancelledCount.textContent = visits.filter(visit => {
        return visit.status === "Cancelled";
      }).length;
    };
    const getFilteredVisits = async () => {
      const searchValue = visitSearch.value.trim().toLowerCase();
      return (await getVisits()).filter(visit => {
        const matchesFilter = activeFilter === "all" || visit.status === activeFilter;
        const matchesSearch = visit.placeName.toLowerCase().includes(searchValue) || visit.branch.toLowerCase().includes(searchValue) || visit.destination.toLowerCase().includes(searchValue);
        return matchesFilter && matchesSearch;
      });
    };
    const addCancelEvents = () => {
      const cancelButtons = document.querySelectorAll("[data-cancel-id]");
      cancelButtons.forEach(button => {
        WusoolUI.listen(button, "click", () => {
          selectedVisitId = String(button.dataset.cancelId);
          cancelModal.show();
        });
      });
    };
    const renderVisits = async () => {
      const filteredVisits = await getFilteredVisits();
      WusoolUI.html(visitsContainer, "");
      if (filteredVisits.length === 0) {
        emptyVisits.classList.remove("d-none");
        return;
      }
      emptyVisits.classList.add("d-none");
      filteredVisits.forEach(visit => {
        visitsContainer.appendChild(createVisitCard(visit));
      });
      addCancelEvents();
    };
    filterButtons.forEach(button => {
      WusoolUI.listen(button, "click", async () => {
        filterButtons.forEach(filterButton => {
          filterButton.classList.remove("active");
        });
        button.classList.add("active");
        activeFilter = button.dataset.filter;
        await renderVisits();
      });
    });
    WusoolUI.listen(visitSearch, "input", renderVisits);
    WusoolUI.listen(confirmCancelButton, "click", async () => {
      const visits = await getVisits();
      const updatedVisits = visits.map(visit => {
        if (visit.id === selectedVisitId) {
          return {
            ...visit,
            status: "Cancelled"
          };
        }
        return visit;
      });
      await saveVisits(updatedVisits);
      cancelModal.hide();
      await updateStatistics();
      await renderVisits();
      showStatusMessage("Visit cancelled successfully.");
    });
    await initializeVisits();
    await updateStatistics();
    await renderVisits();
    const parameters = new URLSearchParams(window.location.search);
    if (parameters.get("confirmed") === "true") {
      showStatusMessage("Your visit was confirmed successfully.");
    }
  });
});
