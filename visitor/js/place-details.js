const places = [
  {
    id: 1,
    name: "Amman City Hall",
    category: "Government · Public Service",
    address: "King Hussein Street, Amman",
    score: 92,
    scoreDescription: "Excellent accessibility",
    mapQuery: "Amman City Hall",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    name: "Al Noor Medical Center",
    category: "Private · Medical Center",
    address: "Al Madinah Street, Amman",
    score: 88,
    scoreDescription: "Very good accessibility",
    mapQuery: "Al Madinah Street Amman",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    name: "Community Hub",
    category: "Private · Community Center",
    address: "University Street, Amman",
    score: 86,
    scoreDescription: "Very good accessibility",
    mapQuery: "University Street Amman",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    name: "Jordan National Bank",
    category: "Private · Banking",
    address: "Shmeisani, Amman",
    score: 90,
    scoreDescription: "Excellent accessibility",
    mapQuery: "Shmeisani Amman",
    image:
      "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    name: "Public Library",
    category: "Government · Public Library",
    address: "Al Hussein Street, Amman",
    score: 84,
    scoreDescription: "Good accessibility",
    mapQuery: "Al Hussein Street Amman",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 6,
    name: "Government Service Center",
    category: "Government · Public Service",
    address: "Airport Road, Amman",
    score: 89,
    scoreDescription: "Very good accessibility",
    mapQuery: "Airport Road Amman",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  loadPlaceInformation();
  initializeGallery();
});

const loadPlaceInformation = () => {
  const parameters = new URLSearchParams(window.location.search);

  const placeId = Number(parameters.get("id"));

  // البحث عن المكان الذي يحمل نفس ID
  const selectedPlace = places.find((place) => {
    return place.id === placeId;
  });

  // إذا كان ID غير موجود
  if (!selectedPlace) {
    showPlaceNotFound();
    return;
  }

  updateTextContent("placeName", selectedPlace.name);

  updateTextContent("placeCategory", selectedPlace.category);

  updateTextContent("placeAddress", selectedPlace.address);

  updateTextContent("placeScore", `${selectedPlace.score} / 100`);

  updateTextContent("scoreCircle", `${selectedPlace.score}%`);

  updateTextContent("scoreDescription", selectedPlace.scoreDescription);

  updatePlaceImage(selectedPlace);

  updateDirectionsButton(selectedPlace);
  const aiReportLink = document.getElementById("aiReportLink");

  if (aiReportLink) {
    aiReportLink.href = `./ai-accessibility-report.html?id=${selectedPlace.id}`;
  }

  document.title = `${selectedPlace.name} | Wusool`;
};

const updateTextContent = (elementId, value) => {
  const element = document.getElementById(elementId);

  if (element) {
    element.textContent = value;
  }
};

const updatePlaceImage = (selectedPlace) => {
  const placeImage = document.getElementById("placeImage");

  if (!placeImage) {
    return;
  }

  placeImage.src = selectedPlace.image;
  placeImage.alt = selectedPlace.name;
};

const updateDirectionsButton = (selectedPlace) => {
  const directionsButton = document.getElementById("directionsButton");

  if (!directionsButton) {
    return;
  }

  const encodedLocation = encodeURIComponent(selectedPlace.mapQuery);

  directionsButton.href = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
};

const showPlaceNotFound = () => {
  const mainContent = document.querySelector("main");

  if (!mainContent) {
    return;
  }

  mainContent.innerHTML = `
        <section class="container py-5 text-center">
            <div class="place-summary place-not-found-card mx-auto">

                <i class="bi bi-exclamation-circle
                          display-3 text-warning">
                </i>

                <h1 class="mt-4">
                    Place Not Found
                </h1>

                <p class="text-secondary">
                    The requested place does not exist
                    or may have been removed.
                </p>

                <a href="./accessibility-map.html"
                   class="btn btn-wusool mt-3">

                    <i class="bi bi-arrow-left me-2"></i>
                    Back to Accessibility Map
                </a>

            </div>
        </section>
    `;
};

const initializeGallery = () => {
  const mainImage = document.getElementById("placeImage");

  const galleryButtons = document.querySelectorAll(".gallery-image");

  if (!mainImage || galleryButtons.length === 0) {
    return;
  }

  galleryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const newImage = button.dataset.image;

      if (!newImage) {
        return;
      }

      galleryButtons.forEach((galleryButton) => {
        galleryButton.classList.remove("active");
      });

      button.classList.add("active");

      mainImage.style.opacity = "0";

      setTimeout(() => {
        mainImage.src = newImage;
        mainImage.style.opacity = "1";
      }, 200);
    });
  });
};
