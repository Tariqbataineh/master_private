'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const STORAGE_KEY = 'wusoolFeatureFlags';
  const defaultFlags = {
    aiAssistant: true,
    booking: true,
    jobs: false,
    voiceAssistance: true,
    equipment: false,
  };
  const readFlags = async () => {
    try {
      return {
        ...defaultFlags,
        ...JSON.parse((await WusoolServices.rawRead(STORAGE_KEY)) || '{}'),
      };
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      return {
        ...defaultFlags,
      };
    }
  };
  const flags = await readFlags();
  const mapping = [
    {
      key: 'aiAssistant',
      name: 'AI Assistant',
      description: 'Enable AI assistance and smart recommendations.',
    },
    {
      key: 'booking',
      name: 'Visit Booking',
      description: 'Allow users to plan accessibility visits.',
    },
    {
      key: 'jobs',
      name: 'Jobs Module',
      description: 'Show employment features when the module is ready.',
    },
    {
      key: 'voiceAssistance',
      name: 'Voice Assistance',
      description: 'Enable supported voice interactions.',
    },
    {
      key: 'equipment',
      name: 'Equipment Requests',
      description: 'Allow accessibility equipment requests.',
    },
  ];
  const flagsContainer = document.getElementById('flagsContainer');
  const render = () => {
    WusoolUI.html(
      flagsContainer,
      mapping
        .map(
          (item) => `
                    <div class="flag-row">
                        <div>
                            <strong class="d-block">
                                ${WusoolUI.escape(item.name)}
                            </strong>

                            <span class="text-secondary">
                                ${WusoolUI.escape(item.description)}
                            </span>
                        </div>

                        <div class="form-check form-switch fs-4">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                role="switch"
                                data-flag="${WusoolUI.escape(item.key)}"
                                ${flags[item.key] !== false ? 'checked' : ''}
                            >
                        </div>
                    </div>
                `,
        )
        .join(''),
    );
  };
  WusoolUI.listen(flagsContainer, 'change', (event) => {
    const control = event.target.closest('[data-flag]');
    if (!control) {
      return;
    }
    flags[control.dataset.flag] = control.checked;
  });
  WusoolUI.listen(document.getElementById('saveFlagsButton'), 'click', async () => {
    await WusoolServices.rawWrite(STORAGE_KEY, JSON.stringify(flags));
    WusoolAdmin?.toast?.('Feature flags published.');
  });
  render();
});
