"use strict";

const places = [
  {
    id: 1,
    name: "Amman City Hall",
    type: "government",
    score: 92,
    location: "Amman",
    features: ["ramp", "elevator", "parking", "restroom", "wide-path"],
  },
  {
    id: 2,
    name: "Al Noor Medical Center",
    type: "medical",
    score: 88,
    location: "Amman",
    features: ["elevator", "parking", "assistance", "wide-path"],
  },
  {
    id: 3,
    name: "Community Hub",
    type: "community",
    score: 86,
    location: "Amman",
    features: ["ramp", "assistance", "wide-path"],
  },
  {
    id: 4,
    name: "Jordan National Bank",
    type: "bank",
    score: 90,
    location: "Amman",
    features: ["ramp", "elevator", "parking"],
  },
  {
    id: 5,
    name: "Public Library",
    type: "government",
    score: 84,
    location: "Amman",
    features: ["ramp", "restroom", "wide-path"],
  },
  {
    id: 6,
    name: "Government Service Center",
    type: "government",
    score: 89,
    location: "Amman",
    features: ["ramp", "parking", "assistance"],
  },
];

const featureNames = {
  ramp: "Entrance Ramp",
  elevator: "Elevator",
  parking: "Accessible Parking",
  restroom: "Accessible Restroom",
  assistance: "Staff Assistance",
  "wide-path": "Wide Pathways",
};

const matchForm = document.getElementById("matchForm");

const matchResults = document.getElementById("matchResults");

const matchStatus = document.getElementById("matchStatus");

matchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedType = document.getElementById("placeType").value;

  const selectedNeeds = [
    ...document.querySelectorAll('input[name="accessibilityNeed"]:checked'),
  ].map((checkbox) => checkbox.value);

  const results = places
    .filter((place) => {
      return selectedType === "all" || place.type === selectedType;
    })
    .map((place) => {
      const matchedNeeds = selectedNeeds.filter((need) => {
        return place.features.includes(need);
      });

      return {
        ...place,
        matchedNeeds,
        matchCount: matchedNeeds.length,
      };
    })
    .filter((place) => {
      return selectedNeeds.length === 0 || place.matchCount > 0;
    })
    .sort((firstPlace, secondPlace) => {
      if (secondPlace.matchCount !== firstPlace.matchCount) {
        return secondPlace.matchCount - firstPlace.matchCount;
      }

      return secondPlace.score - firstPlace.score;
    });

  displayResults(results, selectedNeeds.length);
});

const displayResults = (results, selectedNeedsCount) => {
  matchResults.innerHTML = "";

  if (results.length === 0) {
    matchStatus.textContent = "No matching places were found.";

    matchResults.innerHTML = `
            <div class="col-12">
                <div class="alert alert-light border">
                    Try changing the place type or selecting
                    fewer accessibility requirements.
                </div>
            </div>
        `;

    return;
  }

  matchStatus.textContent = `${results.length} suitable places found.`;

  results.forEach((place) => {
    const matchedPercentage =
      selectedNeedsCount === 0
        ? place.score
        : Math.round((place.matchCount / selectedNeedsCount) * 100);

    const column = document.createElement("div");

    column.className = "col-md-6 col-lg-4";

    const tags = place.features
      .map((feature) => {
        return `<span>${featureNames[feature]}</span>`;
      })
      .join("");

    column.innerHTML = `
            <article class="match-card">

                <div class="match-score">
                    ${matchedPercentage}%
                </div>

                <h3>${place.name}</h3>

                <p>
                    <i class="bi bi-geo-alt"></i>
                    ${place.location}
                </p>

                <div class="match-tags">
                    ${tags}
                </div>

                <a href="./place-details.html?id=${place.id}"
                   class="btn btn-wusool w-100">

                    View Place Details
                    <i class="bi bi-arrow-right"></i>

                </a>

            </article>
        `;

    matchResults.appendChild(column);
  });
};
