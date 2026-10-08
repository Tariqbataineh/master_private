"use strict";

/* ========================================
   Wusool - Shared JavaScript
======================================== */
WusoolUI.enqueue(async () => {
  const body = document.body;
  const increaseFontButton = document.getElementById("increaseFont") || document.getElementById("increaseText");
  const decreaseFontButton = document.getElementById("decreaseFont") || document.getElementById("decreaseText");
  const highContrastButton = document.getElementById("highContrast") || document.getElementById("contrastButton");
  const readPageButton = document.getElementById("readPage");
  const voiceSearchButton = document.getElementById("voiceSearch");

  /* ========================================
     Status Message
  ======================================== */

  const showStatusMessage = message => {
    let statusMessage = document.getElementById("statusMessage");
    if (!statusMessage) {
      statusMessage = document.createElement("div");
      statusMessage.id = "statusMessage";
      statusMessage.className = "position-fixed bottom-0 end-0 m-3 " + "alert alert-dark shadow";
      statusMessage.setAttribute("role", "status");
      statusMessage.setAttribute("aria-live", "polite");
      document.body.appendChild(statusMessage);
    }
    statusMessage.textContent = message;
    statusMessage.classList.remove("d-none");
    setTimeout(() => {
      statusMessage.classList.add("d-none");
    }, 3000);
  };

  /* ========================================
     Increase Font Size
  ======================================== */

  WusoolUI.listen(increaseFontButton, "click", async () => {
    body.classList.remove("small-text");
    body.classList.add("large-text");
    await WusoolServices.rawWrite("wusool-font-size", "large");
    showStatusMessage("Text size increased.");
  });

  /* ========================================
     Decrease Font Size
  ======================================== */

  WusoolUI.listen(decreaseFontButton, "click", async () => {
    body.classList.remove("large-text");
    body.classList.add("small-text");
    await WusoolServices.rawWrite("wusool-font-size", "small");
    showStatusMessage("Text size decreased.");
  });

  /* ========================================
     High Contrast Mode
  ======================================== */

  WusoolUI.listen(highContrastButton, "click", async () => {
    body.classList.toggle("high-contrast");
    const highContrastEnabled = body.classList.contains("high-contrast");
    await WusoolServices.rawWrite("wusool-high-contrast", highContrastEnabled ? "enabled" : "disabled");
    highContrastButton.setAttribute("aria-pressed", highContrastEnabled);
    showStatusMessage(highContrastEnabled ? "High contrast mode enabled." : "High contrast mode disabled.");
  });

  /* ========================================
     Bilingual Read Page + Voice Search
  ======================================== */

  const wusoolSpeechLanguage = async () => {
    const language = (await WusoolServices.rawRead("wusool-language")) || document.documentElement.lang || "en";
    return language.toLowerCase().startsWith("ar") ? "ar" : "en";
  };
  const wusoolSpeechLocale = async () => (await wusoolSpeechLanguage()) === "ar" ? "ar-JO" : "en-US";
  const wusoolMessage = async (english, arabic) => showStatusMessage((await wusoolSpeechLanguage()) === "ar" ? arabic : english);
  WusoolUI.listen(readPageButton, "click", async () => {
    if (!("speechSynthesis" in window)) {
      await wusoolMessage("Read aloud is not supported in this browser.", "القراءة الصوتية غير مدعومة في هذا المتصفح.");
      return;
    }
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      readPageButton.setAttribute("aria-pressed", "false");
      await wusoolMessage("Page reading stopped.", "تم إيقاف قراءة الصفحة.");
      return;
    }
    const mainContent = document.querySelector("main");
    const pageText = mainContent?.innerText.trim();
    if (!pageText) {
      await wusoolMessage("No readable content was found.", "لم يتم العثور على محتوى قابل للقراءة.");
      return;
    }
    const speech = new SpeechSynthesisUtterance(pageText);
    speech.lang = await wusoolSpeechLocale();
    speech.rate = 0.94;
    speech.pitch = 1;
    speech.volume = 1;
    const matchingVoice = await WusoolUI.findAsync(window.speechSynthesis.getVoices(), async voice => voice.lang.toLowerCase().startsWith(await wusoolSpeechLanguage()));
    if (matchingVoice) speech.voice = matchingVoice;
    speech.onend = () => readPageButton.setAttribute("aria-pressed", "false");
    speech.onerror = async () => {
      readPageButton.setAttribute("aria-pressed", "false");
      await wusoolMessage("Page reading could not start. Please try again.", "تعذرت قراءة الصفحة. حاول مرة أخرى.");
    };
    readPageButton.setAttribute("aria-pressed", "true");
    window.speechSynthesis.speak(speech);
    await wusoolMessage("Reading the page. Press again to stop.", "تتم قراءة الصفحة. اضغط مرة أخرى للإيقاف.");
  });
  let activeWusoolRecognition = null;
  WusoolUI.listen(voiceSearchButton, "click", async () => {
    if (activeWusoolRecognition) {
      activeWusoolRecognition.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      await wusoolMessage("Voice search is not supported in this browser. Try Chrome or Edge.", "البحث الصوتي غير مدعوم في هذا المتصفح. جرّب Chrome أو Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    activeWusoolRecognition = recognition;
    recognition.lang = await wusoolSpeechLocale();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    voiceSearchButton.setAttribute("aria-pressed", "true");
    WusoolUI.listen(recognition, "start", async () => await wusoolMessage("Listening. Say a place or service.", "أستمع إليك. قل اسم مكان أو خدمة."));
    WusoolUI.listen(recognition, "result", async event => {
      const spokenText = event.results?.[0]?.[0]?.transcript?.trim();
      const searchInput = document.getElementById("searchInput");
      if (!spokenText || !searchInput) {
        await wusoolMessage("I couldn't find a search phrase. Please try again.", "لم أتمكن من تحديد عبارة للبحث. حاول مرة أخرى.");
        return;
      }
      searchInput.value = spokenText;
      await wusoolMessage(`Searching for: ${spokenText}`, `جارٍ البحث عن: ${spokenText}`);
      document.getElementById("searchForm")?.requestSubmit();
    });
    WusoolUI.listen(recognition, "error", async event => {
      const messages = {
        "not-allowed": ["Allow microphone access to use voice search.", "اسمح باستخدام الميكروفون لتفعيل البحث الصوتي."],
        "no-speech": ["No speech was detected. Please try again.", "لم يتم التقاط صوت. حاول مرة أخرى."]
      };
      const pair = messages[event.error] || ["Voice search could not start. Please try again.", "تعذر بدء البحث الصوتي. حاول مرة أخرى."];
      await wusoolMessage(pair[0], pair[1]);
    });
    WusoolUI.listen(recognition, "end", () => {
      activeWusoolRecognition = null;
      voiceSearchButton.setAttribute("aria-pressed", "false");
    });
    try {
      recognition.start();
    } catch (_) {
      if (WusoolServices.mode === "api") throw _;
      activeWusoolRecognition = null;
      voiceSearchButton.setAttribute("aria-pressed", "false");
      await wusoolMessage("Voice search could not start. Please try again.", "تعذر بدء البحث الصوتي. حاول مرة أخرى.");
    }
  });
  /* ========================================
     Restore Saved Accessibility Settings
  ======================================== */

  const savedFontSize = await WusoolServices.rawRead("wusool-font-size");
  if (savedFontSize === "large") {
    body.classList.add("large-text");
  }
  if (savedFontSize === "small") {
    body.classList.add("small-text");
  }
  const savedHighContrast = await WusoolServices.rawRead("wusool-high-contrast");
  if (savedHighContrast === "enabled") {
    body.classList.add("high-contrast");
    highContrastButton?.setAttribute("aria-pressed", "true");
  }
  /* ========================================
     Stop Speech Before Leaving Page
  ======================================== */

  WusoolUI.listen(window, "beforeunload", () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  });
  window.showStatusMessage = showStatusMessage;
  window.wusoolSpeechLanguage = wusoolSpeechLanguage;
  window.wusoolSpeechLocale = wusoolSpeechLocale;
  window.wusoolMessage = wusoolMessage;
});
