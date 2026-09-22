"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const sessionKey = "wusool-navigation-session";
  const visitsKey = "wusool-visits";

  const routeData = [
    {
      icon: "bi-geo-alt",
      title: "Start from your detected location",
      description:
        "AI matched your photo with the verified images of this branch.",
    },
    {
      icon: "bi-arrow-right",
      title: "Move forward carefully",
      description:
        "Continue along the clear accessible path shown by the latest analysis.",
    },
    {
      icon: "bi-signpost",
      title: "Follow the accessible corridor",
      description:
        "Stay on the verified route and take another photo before the next turn.",
    },
    {
      icon: "bi-door-open",
      title: "Your destination is ahead",
      description:
        "Continue a short distance, then confirm arrival at your destination.",
    },
  ];

  const elements = {
    routePlace: document.getElementById("routePlace"),
    routeBranch: document.getElementById("routeBranch"),
    routeDestination: document.getElementById("routeDestination"),
    routeGuidance: document.getElementById("routeGuidance"),
    routeSteps: document.getElementById("routeSteps"),
    currentInstruction: document.getElementById("currentInstruction"),
    instructionDetails: document.getElementById("instructionDetails"),
    instructionIcon: document.getElementById("instructionIcon"),
    aiAnalysisResult: document.getElementById("aiAnalysisResult"),
    hazardAlert: document.getElementById("hazardAlert"),
    hazardMessage: document.getElementById("hazardMessage"),
    nextButton: document.getElementById("nextInstructionButton"),
    repeatButton: document.getElementById("repeatInstructionButton"),
    arrivedButton: document.getElementById("arrivedButton"),
    guidanceStatus: document.getElementById("guidanceStatus"),
    navbarUserName: document.getElementById("navbarUserName"),
  };

  const getSession = () => {
    try {
      return JSON.parse(localStorage.getItem(sessionKey));
    } catch {
      return null;
    }
  };

  const session = getSession();

  if (!session) {
    showMissingSession();
    return;
  }

  const currentStep = Number.isInteger(session.navigationStep)
    ? Math.min(Math.max(session.navigationStep, 0), routeData.length - 1)
    : 0;

  const guidanceMethod = session.guidanceMethod || "both";

  const guidanceLabels = {
    text: "Text",
    voice: "Voice",
    both: "Text & Voice",
  };

  const speak = (message) => {
    if (
      guidanceMethod === "text" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "en-US";
    speech.rate = 0.95;
    window.speechSynthesis.speak(speech);
  };

  const renderRoute = () => {
    elements.routePlace.textContent = session.placeName || "Not available";
    elements.routeBranch.textContent = session.branchName || "Not available";
    elements.routeDestination.textContent = session.destination || "Not available";
    elements.routeGuidance.textContent = guidanceLabels[guidanceMethod];

    elements.routeSteps.innerHTML = routeData
      .map((step, index) => {
        const stateClass =
          index < currentStep
            ? "completed"
            : index === currentStep
              ? "active"
              : "";

        return `
          <article class="route-step ${stateClass}">
            <span class="route-step-icon">
              <i class="bi ${index < currentStep ? "bi-check-lg" : step.icon}"></i>
            </span>
            <div>
              <h3 class="h6 fw-bold mb-1">${step.title}</h3>
              <p class="small text-secondary mb-0">${step.description}</p>
            </div>
          </article>
        `;
      })
      .join("");
  };

  const renderAnalysis = () => {
    const analysis = session.aiAnalysis || {};
    const hazards = session.detectedHazards || [];

    elements.aiAnalysisResult.innerHTML = `
      <div class="d-flex gap-3 align-items-start">
        <span class="section-icon flex-shrink-0">
          <i class="bi bi-stars"></i>
        </span>
        <div>
          <h3 class="h6 fw-bold mb-1">Location matched</h3>
          <p class="text-secondary mb-0">
            ${analysis.summary || "Your latest photo was checked against verified branch images."}
          </p>
        </div>
      </div>
    `;

    if (hazards.length > 0) {
      elements.hazardMessage.textContent = hazards.join(" • ");
      elements.hazardAlert.classList.remove("d-none");
    } else {
      elements.hazardAlert.classList.add("d-none");
    }
  };

  const renderInstruction = () => {
    const instruction = routeData[currentStep];

    elements.currentInstruction.textContent = instruction.title;
    elements.instructionDetails.textContent = instruction.description;
    elements.instructionIcon.className = `bi ${instruction.icon}`;

    const isFinalStep = currentStep === routeData.length - 1;

    elements.nextButton.classList.toggle("d-none", isFinalStep);
    elements.arrivedButton.disabled = !isFinalStep;

    elements.guidanceStatus.innerHTML = `
      <i class="bi bi-camera me-2"></i>
      Photo ${session.photoCount || currentStep + 1} Analyzed
    `;

    speak(`${instruction.title}. ${instruction.description}`);
  };

  const startNextAnalysis = () => {
    localStorage.setItem(
      sessionKey,
      JSON.stringify({ ...session, status: "waiting-for-next-photo" }),
    );

    window.location.href = `./analyze-surroundings.html?visitId=${session.visitId}`;
  };

  const finishNavigation = () => {
    const completedAt = new Date().toISOString();
    const visits = JSON.parse(localStorage.getItem(visitsKey) || "[]");

    const updatedVisits = visits.map((visit) =>
      visit.id === session.visitId
        ? { ...visit, status: "Completed", completedAt }
        : visit,
    );

    localStorage.setItem(visitsKey, JSON.stringify(updatedVisits));
    localStorage.setItem(
      sessionKey,
      JSON.stringify({ ...session, status: "arrived", arrivedAt: completedAt }),
    );

    window.location.href = "./navigation-complete.html";
  };

  elements.repeatButton.addEventListener("click", () => {
    const instruction = routeData[currentStep];
    speak(`${instruction.title}. ${instruction.description}`);
    elements.currentInstruction.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });

  elements.nextButton.addEventListener("click", startNextAnalysis);
  elements.arrivedButton.addEventListener("click", finishNavigation);

  elements.navbarUserName.textContent =
    localStorage.getItem("wusool-user-name") || "User";

  renderRoute();
  renderAnalysis();
  renderInstruction();

  function showMissingSession() {
    const mainContent = document.getElementById("mainContent");

    mainContent.innerHTML = `
      <section class="container py-5 text-center">
        <i class="bi bi-exclamation-circle display-3 text-warning"></i>
        <h1 class="h3 fw-bold mt-3">No Active Navigation</h1>
        <p class="text-secondary">
          Open a confirmed visit and select “I Have Arrived” to begin.
        </p>
        <a class="btn btn-wusool" href="./my-visits.html">My Visits</a>
      </section>
    `;
  }
});
