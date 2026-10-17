'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const visitPlaces = (await WusoolServices.places()).items;
  if (!visitPlaces.length) {
    WusoolUI.message('No published branches are available for booking.', 'info');
    document.querySelectorAll('#visitForm button[type=submit]').forEach((x) => (x.disabled = true));
    return;
  }
  WusoolUI.ready(async () => {
    const visitForm = document.getElementById('visitForm');
    const placeSelect = document.getElementById('placeSelect');
    const branchSelect = document.getElementById('branchSelect');
    const destinationSelect = document.getElementById('destinationSelect');
    const visitPurpose = document.getElementById('visitPurpose');
    const visitDate = document.getElementById('visitDate');
    const visitTime = document.getElementById('visitTime');
    const visitNotes = document.getElementById('visitNotes');
    const supportInputs = document.querySelectorAll('input[name="visitSupport"]');
    const guidanceInputs = document.querySelectorAll('input[name="guidanceMethod"]');
    const useSavedPreferences = document.getElementById('useSavedPreferences');
    const summaryPlace = document.getElementById('summaryPlace');
    const summaryBranch = document.getElementById('summaryBranch');
    const summaryDestination = document.getElementById('summaryDestination');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summarySupport = document.getElementById('summarySupport');
    const summaryGuidance = document.getElementById('summaryGuidance');
    const navbarUserName = document.getElementById('navbarUserName');
    if (navbarUserName) navbarUserName.textContent = (await WusoolServices.rawRead('wusool-user-name')) || 'User';
    const parameters = new URLSearchParams(window.location.search);
    const requestedPlaceId = parameters.get('placeId') || 1;
    // Optional service preselection from the institution portal. Never bypass existing validation.
    const requestedService = parameters.get('service') || '';
    const setMinimumDate = () => {
      const formattedDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      visitDate.min = formattedDate;
    };
    const populatePlaces = () => {
      WusoolUI.html(placeSelect, '');
      visitPlaces.forEach((place) => {
        const option = document.createElement('option');
        option.value = place.id;
        option.textContent = place.name;
        placeSelect.appendChild(option);
      });
      const placeExists = visitPlaces.some((place) => {
        return String(place.id) === String(requestedPlaceId);
      });
      placeSelect.value = placeExists ? requestedPlaceId : visitPlaces[0].id;
    };
    const getSelectedPlace = () => {
      return visitPlaces.find((place) => {
        return String(place.id) === String(placeSelect.value);
      });
    };
    const populateBranches = () => {
      const selectedPlace = getSelectedPlace();
      WusoolUI.html(branchSelect, '');
      selectedPlace.branches.forEach((branch) => {
        const option = document.createElement('option');
        option.value = branch;
        option.textContent = branch;
        branchSelect.appendChild(option);
      });
    };
    const populateDestinations = () => {
      const selectedPlace = getSelectedPlace();
      WusoolUI.html(destinationSelect, '');
      selectedPlace.destinations.forEach((destination) => {
        const option = document.createElement('option');
        option.value = destination;
        option.textContent = destination;
        destinationSelect.appendChild(option);
      });
      // Preselect only an option that this selected place actually offers.
      if (requestedService && Array.from(destinationSelect.options).some((option) => option.value === requestedService)) {
        destinationSelect.value = requestedService;
      }
    };
    const getSelectedSupport = () => {
      return Array.from(supportInputs)
        .filter((input) => input.checked)
        .map((input) => input.value);
    };
    const getSelectedGuidanceMethod = () => {
      const selectedGuidance = document.querySelector('input[name="guidanceMethod"]:checked');
      return selectedGuidance?.value || 'both';
    };
    const getGuidanceLabel = (method) => {
      const labels = {
        text: 'Text',
        voice: 'Voice',
        both: 'Text & Voice',
      };
      return labels[method] || labels.both;
    };
    const selectGuidanceMethod = (method) => {
      const validMethods = ['text', 'voice', 'both'];
      const selectedMethod = validMethods.includes(method) ? method : 'both';
      guidanceInputs.forEach((input) => {
        input.checked = input.value === selectedMethod;
      });
    };
    const getSavedPreferences = async () => {
      const savedPreferences = await WusoolServices.rawRead('wusool-accessibility-preferences');
      if (!savedPreferences) {
        return null;
      }
      try {
        return JSON.parse(savedPreferences);
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        return null;
      }
    };
    const getDefaultGuidanceMethod = (preferences) => {
      if (['text', 'voice', 'both'].includes(preferences?.guidanceMethod)) {
        return preferences.guidanceMethod;
      }
      const normalizedNeeds = (preferences?.accessibilityNeeds || []).join(' ').toLowerCase();
      const hasVisualNeed =
        normalizedNeeds.includes('visual') ||
        normalizedNeeds.includes('blind') ||
        normalizedNeeds.includes('low-vision');
      const hasHearingNeed =
        normalizedNeeds.includes('hearing') || normalizedNeeds.includes('deaf');
      if (hasVisualNeed && hasHearingNeed) {
        return 'both';
      }
      if (hasVisualNeed) {
        return 'voice';
      }
      if (hasHearingNeed) {
        return 'text';
      }
      return 'both';
    };
    const formatDate = (dateValue) => {
      if (!dateValue) {
        return 'Not selected';
      }
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${dateValue}T00:00:00`));
    };
    const formatTime = (timeValue) => {
      if (!timeValue) {
        return 'Not selected';
      }
      const [hours, minutes] = timeValue.split(':');
      const timeDate = new Date();
      timeDate.setHours(Number(hours), Number(minutes));
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(timeDate);
    };
    const updateSummary = () => {
      const selectedPlace = getSelectedPlace();
      const selectedSupport = getSelectedSupport();
      summaryPlace.textContent = selectedPlace?.name || 'Not selected';
      summaryBranch.textContent = branchSelect.value || 'Not selected';
      summaryDestination.textContent = destinationSelect.value || 'Not selected';
      summaryDate.textContent = formatDate(visitDate.value);
      summaryTime.textContent = formatTime(visitTime.value);
      summarySupport.textContent =
        selectedSupport.length > 0 ? selectedSupport.join(', ') : 'No support selected';
      summaryGuidance.textContent = getGuidanceLabel(getSelectedGuidanceMethod());
    };
    const applySavedPreferences = async () => {
      const preferences = await getSavedPreferences();
      if (!preferences) {
        showStatusMessage('No saved accessibility preferences were found.');
        return;
      }
      const needs = preferences.accessibilityNeeds || [];
      const routes = preferences.routePreferences || [];
      document.getElementById('wheelchairSupport').checked = needs.includes('wheelchair');
      document.getElementById('staffAssistance').checked = needs.includes('staff-assistance');
      document.getElementById('accessibleParking').checked = routes.includes('accessible-parking');
      document.getElementById('visualNavigation').checked = true;
      selectGuidanceMethod(getDefaultGuidanceMethod(preferences));
      updateSummary();
      showStatusMessage('Saved accessibility preferences applied.');
    };
    const collectVisitData = () => {
      const selectedPlace = getSelectedPlace();
      return {
        id: Date.now(),
        placeId: selectedPlace.id,
        placeName: selectedPlace.name,
        branch: branchSelect.value,
        destination: destinationSelect.value,
        purpose: visitPurpose.value,
        date: visitDate.value,
        time: visitTime.value,
        support: getSelectedSupport(),
        guidanceMethod: getSelectedGuidanceMethod(),
        notes: visitNotes.value.trim(),
        status: 'Pending Review',
      };
    };
    WusoolUI.listen(placeSelect, 'change', () => {
      populateBranches();
      populateDestinations();
      updateSummary();
    });
    WusoolUI.listen(branchSelect, 'change', updateSummary);
    WusoolUI.listen(destinationSelect, 'change', updateSummary);
    WusoolUI.listen(visitDate, 'change', updateSummary);
    WusoolUI.listen(visitTime, 'change', updateSummary);
    supportInputs.forEach((input) => {
      WusoolUI.listen(input, 'change', updateSummary);
    });
    guidanceInputs.forEach((input) => {
      WusoolUI.listen(input, 'change', updateSummary);
    });
    WusoolUI.listen(useSavedPreferences, 'click', applySavedPreferences);
    WusoolUI.listen(visitForm, 'submit', async (event) => {
      event.preventDefault();
      if (!visitForm.checkValidity()) {
        visitForm.classList.add('was-validated');
        showStatusMessage('Complete the required visit information.');
        return;
      }
      const visitData = collectVisitData();
      await WusoolServices.rawWrite('wusool-pending-visit', JSON.stringify(visitData));
      window.location.href = './visit-summary.html';
    });
    setMinimumDate();
    populatePlaces();
    populateBranches();
    populateDestinations();
    selectGuidanceMethod(getDefaultGuidanceMethod(await getSavedPreferences()));
    updateSummary();
  });
});
