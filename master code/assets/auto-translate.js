'use strict';

WusoolUI.enqueue(async () => {
  const WUSOOL_LANGUAGE_KEY = 'wusool-language';
  function hideGoogleTranslateUI() {
    const selectors = [
      '.goog-te-banner-frame',
      'iframe.goog-te-banner-frame',
      'iframe.skiptranslate',
      '.VIpgJd-ZVi9od-ORHb-OEVmcd',
      '#goog-gt-tt',
      '.goog-te-balloon-frame',
    ];
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.height = '0';
      });
    });
    document.documentElement.style.marginTop = '0px';
    document.documentElement.style.top = '0px';
    if (document.body) {
      document.body.style.top = '0px';
      document.body.style.marginTop = '0px';
    }
  }
  function applyDirection(language) {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }
  async function getSavedLanguage() {
    return (await WusoolServices.rawRead(WUSOOL_LANGUAGE_KEY)) || 'en';
  }
  async function updateLanguageButton() {
    const button = document.getElementById('wusoolLanguageButton');
    if (!button) {
      return;
    }
    const language = await getSavedLanguage();
    button.textContent = language === 'ar' ? 'English' : 'العربية';
    button.setAttribute(
      'aria-label',
      language === 'ar' ? 'Switch language to English' : 'تغيير اللغة إلى العربية',
    );
    button.setAttribute('aria-pressed', String(language === 'ar'));
  }
  async function changeGoogleLanguage(language) {
    await WusoolServices.rawWrite(WUSOOL_LANGUAGE_KEY, language);
    applyDirection(language);
    await updateLanguageButton();
    const select = document.querySelector('.goog-te-combo');
    if (!select) {
      return;
    }
    select.value = language;
    select.dispatchEvent(
      new Event('change', {
        bubbles: true,
      }),
    );
    hideGoogleTranslateUI();
  }
  async function createLanguageButton() {
    const existingButton = document.getElementById('wusoolLanguageButton');
    const button = existingButton || document.createElement('button');
    button.id = 'wusoolLanguageButton';
    button.type = 'button';
    if (!existingButton) {
      button.className = 'accessibility-button wusool-language-button';
    }
    if (button.dataset.languageSwitchReady !== 'true') {
      button.dataset.languageSwitchReady = 'true';
      WusoolUI.listen(button, 'click', async () => {
        const currentLanguage = await getSavedLanguage();
        const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
        await changeGoogleLanguage(newLanguage);
      });
    }
    const toolbar = document.querySelector('.accessibility-toolbar .container');
    if (!existingButton && toolbar) {
      toolbar.appendChild(button);
    } else if (!existingButton) {
      button.style.position = 'fixed';
      button.style.top = '15px';
      button.style.right = '15px';
      button.style.zIndex = '9999';
      document.body.appendChild(button);
    }
    await updateLanguageButton();
  }
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'en,ar',
        autoDisplay: false,
      },
      'google_translate_element',
    );
    setTimeout(async () => {
      const language = await getSavedLanguage();
      applyDirection(language);
      await updateLanguageButton();
      if (language === 'ar') {
        await changeGoogleLanguage('ar');
      }
      hideGoogleTranslateUI();
    }, 700);
  };
  WusoolUI.ready(async () => {
    const hiddenTranslateElement = document.createElement('div');
    hiddenTranslateElement.id = 'google_translate_element';
    document.body.appendChild(hiddenTranslateElement);
    await createLanguageButton();
    const script = document.createElement('script');
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
    applyDirection(await getSavedLanguage());
    const observer = new MutationObserver(() => {
      hideGoogleTranslateUI();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
});
