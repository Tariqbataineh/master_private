WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const places = (await WusoolServices.places()).items;
  WusoolUI.ready(() => {
    loadPlaceInformation();
    initializeGallery();
  });
  const loadPlaceInformation = () => {
    const parameters = new URLSearchParams(window.location.search);
    const placeId = parameters.get("id");

    // البحث عن المكان الذي يحمل نفس ID
    const selectedPlace = places.find(place => {
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
    updateTextContent("placeScore", `${WusoolUI.escape(selectedPlace.score)} / 100`);
    updateTextContent("scoreCircle", `${WusoolUI.escape(selectedPlace.score)}%`);
    updateTextContent("scoreDescription", selectedPlace.scoreDescription);
    updatePlaceImage(selectedPlace);
    updateDirectionsButton(selectedPlace);
    const aiReportLink = document.getElementById("aiReportLink");
    if (aiReportLink) {
      aiReportLink.href = `./ai-accessibility-report.html?id=${WusoolUI.escape(selectedPlace.id)}`;
    }
    document.title = `${selectedPlace.name} | Wusool`;
  };
  const updateTextContent = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  };
  const updatePlaceImage = selectedPlace => {
    const placeImage = document.getElementById("placeImage");
    if (!placeImage) {
      return;
    }
    placeImage.src = selectedPlace.image;
    placeImage.alt = selectedPlace.name;
  };
  const updateDirectionsButton = selectedPlace => {
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
    WusoolUI.html(mainContent, `
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
    `);
  };
  const initializeGallery = () => {
    const mainImage = document.getElementById("placeImage");
    const galleryButtons = document.querySelectorAll(".gallery-image");
    if (!mainImage || galleryButtons.length === 0) {
      return;
    }
    galleryButtons.forEach(button => {
      WusoolUI.listen(button, "click", () => {
        const newImage = button.dataset.image;
        if (!newImage) {
          return;
        }
        galleryButtons.forEach(galleryButton => {
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
});
