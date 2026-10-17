'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const comparisonPlaces = (await WusoolServices.places()).items;
  const comparisonFeatures = [
    {
      label: 'Accessibility Score',
      property: 'score',
      type: 'score',
    },
    {
      label: 'Category',
      property: 'category',
      type: 'text',
    },
    {
      label: 'City',
      property: 'city',
      type: 'text',
    },
    {
      label: 'Accessible Entrance',
      property: 'entrance',
      type: 'boolean',
    },
    {
      label: 'Entrance Ramp',
      property: 'ramp',
      type: 'boolean',
    },
    {
      label: 'Elevator',
      property: 'elevator',
      type: 'boolean',
    },
    {
      label: 'Accessible Parking',
      property: 'parking',
      type: 'boolean',
    },
    {
      label: 'Accessible Restroom',
      property: 'restroom',
      type: 'boolean',
    },
    {
      label: 'Wide Pathways',
      property: 'widePathways',
      type: 'boolean',
    },
    {
      label: 'Staff Assistance',
      property: 'staffAssistance',
      type: 'boolean',
    },
    {
      label: 'Clear Visual Signs',
      property: 'visualSigns',
      type: 'boolean',
    },
  ];
  WusoolUI.ready(async () => {
    const placeSelector = document.getElementById('placeSelector');
    const addPlaceButton = document.getElementById('addPlaceButton');
    const clearComparisonButton = document.getElementById('clearComparisonButton');
    const selectedPlacesContainer = document.getElementById('selectedPlaces');
    const comparisonHead = document.getElementById('comparisonHead');
    const comparisonBody = document.getElementById('comparisonBody');
    const comparisonContent = document.getElementById('comparisonContent');
    const comparisonEmpty = document.getElementById('comparisonEmpty');
    const navbarUserName = document.getElementById('navbarUserName');
    navbarUserName.textContent = (await WusoolServices.rawRead('wusool-user-name')) || 'User';
    const parameters = new URLSearchParams(window.location.search);
    const queryIds =
      parameters
        .get('ids')
        ?.split(',')
        .map(String)
        .filter((id) => {
          return comparisonPlaces.some((place) => place.id === id);
        }) || [];
    let selectedPlaceIds = [...new Set(queryIds)].slice(0, 3);
    if (selectedPlaceIds.length === 0) {
      selectedPlaceIds = comparisonPlaces.slice(0, 2).map((p) => p.id);
    }
    const getSelectedPlaces = () => {
      return selectedPlaceIds
        .map((placeId) => {
          return comparisonPlaces.find((place) => {
            return place.id === placeId;
          });
        })
        .filter(Boolean);
    };
    const getBestPlaceId = () => {
      const selectedPlaces = getSelectedPlaces();
      if (selectedPlaces.length === 0) {
        return null;
      }
      return selectedPlaces.reduce((bestPlace, currentPlace) => {
        return currentPlace.score > bestPlace.score ? currentPlace : bestPlace;
      }).id;
    };
    const updateUrl = () => {
      const newUrl = `${window.location.pathname}?ids=${selectedPlaceIds.join(',')}`;
      window.history.replaceState({}, '', newUrl);
    };
    const renderPlaceSelector = () => {
      WusoolUI.html(placeSelector, '');
      const availablePlaces = comparisonPlaces.filter((place) => {
        return !selectedPlaceIds.includes(place.id);
      });
      if (selectedPlaceIds.length >= 3 || availablePlaces.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'Maximum three places selected';
        option.value = '';
        placeSelector.appendChild(option);
        placeSelector.disabled = true;
        addPlaceButton.disabled = true;
        return;
      }
      placeSelector.disabled = false;
      addPlaceButton.disabled = false;
      availablePlaces.forEach((place) => {
        const option = document.createElement('option');
        option.value = place.id;
        option.textContent = `${place.name} — ${place.city}`;
        placeSelector.appendChild(option);
      });
    };
    const renderSelectedPlaces = () => {
      WusoolUI.html(selectedPlacesContainer, '');
      getSelectedPlaces().forEach((place) => {
        const selectedPlace = document.createElement('span');
        selectedPlace.className = 'selected-place';
        WusoolUI.html(
          selectedPlace,
          `
          ${place.name}

          <button
            class="remove-place"
            type="button"
            data-remove-id="${place.id}"
            aria-label="Remove ${place.name}"
          >
            <i class="bi bi-x"></i>
          </button>
        `,
        );
        selectedPlacesContainer.appendChild(selectedPlace);
      });
      const removeButtons = document.querySelectorAll('[data-remove-id]');
      removeButtons.forEach((button) => {
        WusoolUI.listen(button, 'click', () => {
          const placeId = button.dataset.removeId;
          selectedPlaceIds = selectedPlaceIds.filter((id) => id !== placeId);
          renderComparison();
          showStatusMessage('Place removed from comparison.');
        });
      });
    };
    const createBooleanValue = (isAvailable) => {
      if (isAvailable) {
        return `
        <span
          class="facility-available"
          aria-label="Available"
        >
          <i class="bi bi-check-circle-fill"></i>
        </span>
      `;
      }
      return `
      <span
        class="facility-unavailable"
        aria-label="Not available"
      >
        <i class="bi bi-x-circle-fill"></i>
      </span>
    `;
    };
    const createFeatureValue = (place, feature) => {
      const value = place[feature.property];
      if (feature.type === 'boolean') {
        return createBooleanValue(value);
      }
      if (feature.type === 'score') {
        return `
        <span class="score-circle">
          ${value}%
        </span>
      `;
      }
      return value;
    };
    const renderComparisonHead = () => {
      const selectedPlaces = getSelectedPlaces();
      const bestPlaceId = getBestPlaceId();
      WusoolUI.html(
        comparisonHead,
        `
      <tr>
        <th scope="col">
          Feature
        </th>

        ${selectedPlaces
          .map((place) => {
            const bestMatch = place.id === bestPlaceId;
            return `
              <th
                scope="col"
                class="${bestMatch ? 'best-match-column' : ''}"
              >
                ${
                  bestMatch
                    ? `
                      <span class="best-match-badge">
                        Best Accessibility
                      </span>
                    `
                    : ''
                }

                <span class="comparison-place-name d-block">
                  ${place.name}
                </span>

                <small class="text-secondary">
                  ${place.city}
                </small>
              </th>
            `;
          })
          .join('')}
      </tr>
    `,
      );
    };
    const renderComparisonBody = () => {
      const selectedPlaces = getSelectedPlaces();
      const bestPlaceId = getBestPlaceId();
      const featureRows = comparisonFeatures
        .map((feature) => {
          return `
            <tr>
              <th scope="row">
                ${feature.label}
              </th>

              ${selectedPlaces
                .map((place) => {
                  const bestMatch = place.id === bestPlaceId;
                  return `
                    <td
                      class="${bestMatch ? 'best-match-column' : ''}"
                    >
                      ${createFeatureValue(place, feature)}
                    </td>
                  `;
                })
                .join('')}
            </tr>
          `;
        })
        .join('');
      const actionRow = `
      <tr>
        <th scope="row">
          Actions
        </th>

        ${selectedPlaces
          .map((place) => {
            return `
              <td>
                <div class="d-grid gap-2">
                  <a
                    class="btn btn-wusool"
                    href="./user-place-details.html?id=${place.id}"
                  >
                    View Details
                  </a>

                  <a
                    class="btn btn-wusool-outline"
                    href="./plan-visit.html?placeId=${place.id}"
                  >
                    Plan Visit
                  </a>
                </div>
              </td>
            `;
          })
          .join('')}
      </tr>
    `;
      WusoolUI.html(comparisonBody, featureRows + actionRow);
    };
    const renderComparison = () => {
      updateUrl();
      renderPlaceSelector();
      renderSelectedPlaces();
      if (selectedPlaceIds.length < 2) {
        comparisonContent.classList.add('d-none');
        comparisonEmpty.classList.remove('d-none');
        return;
      }
      comparisonContent.classList.remove('d-none');
      comparisonEmpty.classList.add('d-none');
      renderComparisonHead();
      renderComparisonBody();
    };
    WusoolUI.listen(addPlaceButton, 'click', () => {
      const selectedId = placeSelector.value;
      if (!selectedId) {
        return;
      }
      if (selectedPlaceIds.length >= 3) {
        showStatusMessage('You can compare up to three places.');
        return;
      }
      selectedPlaceIds.push(selectedId);
      renderComparison();
      showStatusMessage('Place added to comparison.');
    });
    WusoolUI.listen(clearComparisonButton, 'click', () => {
      selectedPlaceIds = [];
      renderComparison();
      showStatusMessage('Comparison cleared.');
    });
    renderComparison();
  });
});
