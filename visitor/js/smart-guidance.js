"use strict";

const guidancePlaces = {
  1: {
    name: "Amman City Hall",
    steps: {
      wheelchair: [
        "Use the accessible parking area near the main entrance.",
        "Follow the marked ramp on the right side.",
        "Enter through the automatic main door.",
      ],
      parking: [
        "Enter from King Hussein Street.",
        "Use the marked accessible parking spaces.",
        "Follow the signs toward the main entrance.",
      ],
      elevator: [
        "Enter through the main accessible entrance.",
        "Continue through the reception area.",
        "The elevator is located on the left.",
      ],
      assistance: [
        "Enter through the main entrance.",
        "Go to the priority service desk.",
        "Ask the available employee for assistance.",
      ],
    },
  },

  2: {
    name: "Al Noor Medical Center",
    steps: {
      wheelchair: [
        "Use the level entrance beside the parking area.",
        "Follow the wide pathway toward reception.",
        "Use the elevator for upper floors.",
      ],
      parking: [
        "Use the medical center parking entrance.",
        "Park in the reserved accessible space.",
        "Follow the covered pathway to reception.",
      ],
      elevator: [
        "Enter through the level main entrance.",
        "Continue past the reception desk.",
        "The elevator is beside the main corridor.",
      ],
      assistance: [
        "Enter through the main entrance.",
        "Visit the reception desk.",
        "Request a staff member or wheelchair.",
      ],
    },
  },
};

const defaultSteps = {
  wheelchair: [
    "Use the marked accessible parking area.",
    "Follow the step-free entrance route.",
    "Continue through the accessible main entrance.",
  ],
  parking: [
    "Follow signs toward accessible parking.",
    "Use the nearest marked accessible space.",
    "Continue through the accessible pathway.",
  ],
  elevator: [
    "Enter through the accessible entrance.",
    "Follow the internal directional signs.",
    "Use the elevator to reach your floor.",
  ],
  assistance: [
    "Enter through the main entrance.",
    "Go to the reception or information desk.",
    "Request assistance from an available employee.",
  ],
};

const guidanceForm = document.getElementById("guidanceForm");

const guidanceSteps = document.getElementById("guidanceSteps");

const selectedPlaceName = document.getElementById("selectedPlaceName");

const placeDetailsLink = document.getElementById("placeDetailsLink");

const speakGuidanceButton = document.getElementById("speakGuidance");

let currentGuidanceText = "";

const renderGuidance = () => {
  const selectedPlaceId = document.getElementById("guidancePlace").value;

  const selectedNeed = document.getElementById("guidanceNeed").value;

  const selectedOption = document.querySelector(
    `#guidancePlace option[value="${selectedPlaceId}"]`,
  );

  const place = guidancePlaces[selectedPlaceId];

  const steps = place?.steps[selectedNeed] || defaultSteps[selectedNeed];

  selectedPlaceName.textContent = selectedOption.textContent.trim();

  placeDetailsLink.href = `./place-details.html?id=${selectedPlaceId}`;

  guidanceSteps.innerHTML = "";

  steps.forEach((step, index) => {
    const stepElement = document.createElement("article");

    stepElement.className = "guidance-step";

    stepElement.innerHTML = `
            <span class="step-number">
                ${index + 1}
            </span>

            <div>
                <h3>Step ${index + 1}</h3>
                <p>${step}</p>
            </div>
        `;

    guidanceSteps.appendChild(stepElement);
  });

  currentGuidanceText =
    `Guidance for ${selectedOption.textContent.trim()}. ` + steps.join(". ");
};

guidanceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderGuidance();
});

speakGuidanceButton.addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-speech is not supported by this browser.");

    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(currentGuidanceText);

  speech.lang = "en-US";
  speech.rate = 0.9;

  window.speechSynthesis.speak(speech);
});

renderGuidance();
