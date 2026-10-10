'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    const preferencesForm = document.getElementById('preferencesForm');
    const needsInputs = document.querySelectorAll('input[name="accessibilityNeeds"]');
    const routeInputs = document.querySelectorAll('input[name="routePreferences"]');
    const guidanceInputs = document.querySelectorAll('input[name="guidanceMethod"]');
    const needsSummary = document.getElementById('needsSummary');
    const routesSummary = document.getElementById('routesSummary');
    const guidanceSummary = document.getElementById('guidanceSummary');
    const guidanceLanguage = document.getElementById('guidanceLanguage');
    const speechRate = document.getElementById('speechRate');
    const speechRateValue = document.getElementById('speechRateValue');
    const hazardAlerts = document.getElementById('hazardAlerts');
    const vibrationAlerts = document.getElementById('vibrationAlerts');
    const resetButton = document.getElementById('resetPreferences');
    const navbarUserName = document.getElementById('navbarUserName');
    const defaultPreferences = {
      accessibilityNeeds: [],
      routePreferences: ['avoid-stairs', 'prefer-elevator', 'step-free-route', 'wide-pathways'],
      guidanceMethod: 'both',
      guidanceLanguage: 'English',
      speechRate: '2',
      hazardAlerts: true,
      vibrationAlerts: false,
    };
    const savedUserName = (await WusoolServices.rawRead('wusool-user-name')) || 'User';
    navbarUserName.textContent = savedUserName;
    const getSavedPreferences = async () => {
      const savedPreferences = await WusoolServices.rawRead('wusool-accessibility-preferences');
      if (!savedPreferences) {
        return defaultPreferences;
      }
      try {
        return {
          ...defaultPreferences,
          ...JSON.parse(savedPreferences),
        };
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        return defaultPreferences;
      }
    };
    const setCheckedValues = (inputs, selectedValues) => {
      inputs.forEach((input) => {
        input.checked = selectedValues.includes(input.value);
      });
    };
    const getCheckedValues = (inputs) => {
      return Array.from(inputs)
        .filter((input) => input.checked)
        .map((input) => input.value);
    };
    const getCheckedLabels = (inputs) => {
      return Array.from(inputs)
        .filter((input) => input.checked)
        .map((input) => input.dataset.label);
    };
    const renderSummaryList = (container, labels) => {
      WusoolUI.html(container, '');
      if (labels.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'text-secondary';
        emptyItem.textContent = 'No options selected';
        container.appendChild(emptyItem);
        return;
      }
      labels.forEach((label) => {
        const listItem = document.createElement('li');
        listItem.textContent = label;
        container.appendChild(listItem);
      });
    };
    const getSelectedGuidance = () => {
      const selectedGuidance = document.querySelector('input[name="guidanceMethod"]:checked');
      return selectedGuidance ? selectedGuidance.value : 'both';
    };
    const formatGuidanceMethod = (guidanceMethod) => {
      const guidanceLabels = {
        text: 'Text Guidance',
        voice: 'Voice Guidance',
        both: 'Voice and Text',
      };
      return guidanceLabels[guidanceMethod];
    };
    const updateSpeechRateLabel = () => {
      const speechRateLabels = {
        1: 'Slow',
        2: 'Normal',
        3: 'Fast',
      };
      speechRateValue.textContent = speechRateLabels[speechRate.value];
    };
    const updateSummary = () => {
      const needLabels = getCheckedLabels(needsInputs);
      const routeLabels = getCheckedLabels(routeInputs);
      renderSummaryList(needsSummary, needLabels);
      renderSummaryList(routesSummary, routeLabels);
      guidanceSummary.textContent = formatGuidanceMethod(getSelectedGuidance());
    };
    const fillPreferences = (preferences) => {
      setCheckedValues(needsInputs, preferences.accessibilityNeeds);
      setCheckedValues(routeInputs, preferences.routePreferences);
      guidanceInputs.forEach((input) => {
        input.checked = input.value === preferences.guidanceMethod;
      });
      guidanceLanguage.value = preferences.guidanceLanguage;
      speechRate.value = preferences.speechRate;
      hazardAlerts.checked = preferences.hazardAlerts;
      vibrationAlerts.checked = preferences.vibrationAlerts;
      updateSpeechRateLabel();
      updateSummary();
    };
    const collectPreferences = () => {
      return {
        accessibilityNeeds: getCheckedValues(needsInputs),
        routePreferences: getCheckedValues(routeInputs),
        guidanceMethod: getSelectedGuidance(),
        guidanceLanguage: guidanceLanguage.value,
        speechRate: speechRate.value,
        hazardAlerts: hazardAlerts.checked,
        vibrationAlerts: vibrationAlerts.checked,
      };
    };
    const allPreferenceInputs = document.querySelectorAll(
      '#preferencesForm input, #preferencesForm select',
    );
    allPreferenceInputs.forEach((input) => {
      WusoolUI.listen(input, 'change', () => {
        updateSpeechRateLabel();
        updateSummary();
      });
    });
    WusoolUI.listen(speechRate, 'input', updateSpeechRateLabel);
    WusoolUI.listen(preferencesForm, 'submit', async (event) => {
      event.preventDefault();
      const preferences = collectPreferences();
      await WusoolServices.rawWrite(
        'wusool-accessibility-preferences',
        JSON.stringify(preferences),
      );
      showStatusMessage('Accessibility preferences saved successfully.');
    });
    WusoolUI.listen(resetButton, 'click', () => {
      fillPreferences(defaultPreferences);
      showStatusMessage('Preferences were reset to default.');
    });
    fillPreferences(await getSavedPreferences());
  });
});
