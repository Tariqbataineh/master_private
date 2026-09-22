"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const visitContent =
    document.getElementById("visitContent");

  const missingVisit =
    document.getElementById("missingVisit");

  const placeName =
    document.getElementById("placeName");

  const branchName =
    document.getElementById("branchName");

  const destination =
    document.getElementById("destination");

  const visitPurpose =
    document.getElementById("visitPurpose");

  const visitDate =
    document.getElementById("visitDate");

  const visitTime =
    document.getElementById("visitTime");

  const supportList =
    document.getElementById("supportList");

  const guidanceMethod =
    document.getElementById(
      "guidanceMethod",
    );

  const notesContainer =
    document.getElementById("notesContainer");

  const visitNotes =
    document.getElementById("visitNotes");

  const viewPlaceButton =
    document.getElementById("viewPlaceButton");

  const editVisitButton =
    document.getElementById("editVisitButton");

  const backToPlanButton =
    document.getElementById("backToPlanButton");

  const confirmationForm =
    document.getElementById(
      "confirmationForm",
    );

  const confirmInformation =
    document.getElementById(
      "confirmInformation",
    );

  const navbarUserName =
    document.getElementById(
      "navbarUserName",
    );

  navbarUserName.textContent =
    localStorage.getItem(
      "wusool-user-name",
    ) || "User";

  const getPendingVisit = () => {
    const savedVisit =
      localStorage.getItem(
        "wusool-pending-visit",
      );

    if (!savedVisit) {
      return null;
    }

    try {
      return JSON.parse(savedVisit);
    } catch {
      return null;
    }
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

  const renderSupport = (support) => {
    supportList.innerHTML = "";

    if (!support || support.length === 0) {
      const emptySupport =
        document.createElement("span");

      emptySupport.className =
        "text-secondary";

      emptySupport.textContent =
        "No additional support selected.";

      supportList.appendChild(
        emptySupport,
      );

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

  const showMissingVisit = () => {
    visitContent.classList.add("d-none");

    missingVisit.classList.remove(
      "d-none",
    );
  };

  const renderVisit = (visit) => {
    placeName.textContent =
      visit.placeName;

    branchName.textContent =
      visit.branch;

    destination.textContent =
      visit.destination;

    visitPurpose.textContent =
      visit.purpose;

    visitDate.textContent =
      formatDate(visit.date);

    visitTime.textContent =
      formatTime(visit.time);

    renderSupport(visit.support);

    const guidanceLabels = {
      text: "Text",
      voice: "Voice",
      both: "Text & Voice",
    };

    guidanceMethod.textContent =
      guidanceLabels[visit.guidanceMethod] ||
      guidanceLabels.both;

    if (visit.notes) {
      visitNotes.textContent =
        visit.notes;

      notesContainer.classList.remove(
        "d-none",
      );
    } else {
      notesContainer.classList.add(
        "d-none",
      );
    }

    const editUrl =
      `./plan-visit.html?placeId=${visit.placeId}`;

    viewPlaceButton.href =
      `./user-place-details.html?id=${visit.placeId}`;

    editVisitButton.href = editUrl;
    backToPlanButton.href = editUrl;

    document.title =
      `${visit.placeName} Visit Summary | Wusool`;
  };

  const getStoredVisits = () => {
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

  const confirmVisit = (visit) => {
    const storedVisits =
      getStoredVisits();

    const confirmedVisit = {
      ...visit,
      guidanceMethod:
        visit.guidanceMethod || "both",
      status: "Confirmed",
      confirmedAt:
        new Date().toISOString(),
    };

    const visitAlreadyExists =
      storedVisits.some(
        (storedVisit) => {
          return (
            storedVisit.id === visit.id
          );
        },
      );

    if (!visitAlreadyExists) {
      storedVisits.push(
        confirmedVisit,
      );
    }

    localStorage.setItem(
      "wusool-visits",
      JSON.stringify(storedVisits),
    );

    localStorage.removeItem(
      "wusool-pending-visit",
    );

    showStatusMessage(
      "Your visit was confirmed successfully.",
    );

    setTimeout(() => {
      window.location.href =
        "./my-visits.html?confirmed=true";
    }, 1000);
  };

  confirmationForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      if (!confirmInformation.checked) {
        confirmInformation.focus();

        showStatusMessage(
          "Confirm that the visit information is correct.",
        );

        return;
      }

      const pendingVisit =
        getPendingVisit();

      if (!pendingVisit) {
        showMissingVisit();

        return;
      }

      confirmVisit(pendingVisit);
    },
  );

  const pendingVisit =
    getPendingVisit();

  if (!pendingVisit) {
    showMissingVisit();
  } else {
    renderVisit(pendingVisit);
  }
});
