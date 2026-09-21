"use strict";

/* ========================================
   Wusool - Shared JavaScript
======================================== */

const body = document.body;

const increaseFontButton =
    document.getElementById("increaseFont") ||
    document.getElementById("increaseText");

const decreaseFontButton =
    document.getElementById("decreaseFont") ||
    document.getElementById("decreaseText");

const highContrastButton =
    document.getElementById("highContrast") ||
    document.getElementById("contrastButton");

const readPageButton =
    document.getElementById("readPage");

const voiceSearchButton =
    document.getElementById("voiceSearch");

/* ========================================
   Status Message
======================================== */

const showStatusMessage = (message) => {
    let statusMessage =
        document.getElementById("statusMessage");

    if (!statusMessage) {
        statusMessage = document.createElement("div");

        statusMessage.id = "statusMessage";
        statusMessage.className =
            "position-fixed bottom-0 end-0 m-3 " +
            "alert alert-dark shadow";

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

increaseFontButton?.addEventListener("click", () => {
    body.classList.remove("small-text");
    body.classList.add("large-text");

    localStorage.setItem(
        "wusool-font-size",
        "large"
    );

    showStatusMessage("Text size increased.");
});

/* ========================================
   Decrease Font Size
======================================== */

decreaseFontButton?.addEventListener("click", () => {
    body.classList.remove("large-text");
    body.classList.add("small-text");

    localStorage.setItem(
        "wusool-font-size",
        "small"
    );

    showStatusMessage("Text size decreased.");
});

/* ========================================
   High Contrast Mode
======================================== */

highContrastButton?.addEventListener("click", () => {
    body.classList.toggle("high-contrast");

    const highContrastEnabled =
        body.classList.contains("high-contrast");

    localStorage.setItem(
        "wusool-high-contrast",
        highContrastEnabled ? "enabled" : "disabled"
    );

    highContrastButton.setAttribute(
        "aria-pressed",
        highContrastEnabled
    );

    showStatusMessage(
        highContrastEnabled
            ? "High contrast mode enabled."
            : "High contrast mode disabled."
    );
});

/* ========================================
   Read Page
======================================== */

readPageButton?.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
        showStatusMessage(
            "Text-to-speech is not supported by this browser."
        );

        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();

        showStatusMessage("Page reading stopped.");

        return;
    }

    const mainContent =
        document.querySelector("main");

    if (!mainContent) {
        showStatusMessage(
            "No readable content was found."
        );

        return;
    }

    const pageText =
        mainContent.innerText.trim();

    const speech =
        new SpeechSynthesisUtterance(pageText);

    speech.lang =
        document.documentElement.lang === "ar"
            ? "ar-JO"
            : "en-US";

    speech.rate = 0.95;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);

    showStatusMessage(
        "The page is being read. Press again to stop."
    );
});

/* ========================================
   Voice Search
======================================== */

voiceSearchButton?.addEventListener("click", () => {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        showStatusMessage(
            "Voice search is not supported by this browser."
        );

        return;
    }

    const recognition =
        new SpeechRecognition();

    recognition.lang =
        document.documentElement.lang === "ar"
            ? "ar-JO"
            : "en-US";

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener("start", () => {
        showStatusMessage(
            "Listening... say a place or service."
        );
    });

    recognition.addEventListener(
        "result",
        (event) => {
            const spokenText =
                event.results[0][0].transcript;

            const searchInput =
                document.getElementById("searchInput");

            if (searchInput) {
                searchInput.value = spokenText;
                searchInput.focus();

                showStatusMessage(
                    `Voice search: ${spokenText}`
                );
            }
        }
    );

    recognition.addEventListener("error", () => {
        showStatusMessage(
            "Voice search could not start. Try again."
        );
    });

    recognition.start();
});

/* ========================================
   Restore Saved Accessibility Settings
======================================== */

const savedFontSize =
    localStorage.getItem("wusool-font-size");

if (savedFontSize === "large") {
    body.classList.add("large-text");
}

if (savedFontSize === "small") {
    body.classList.add("small-text");
}

const savedHighContrast =
    localStorage.getItem(
        "wusool-high-contrast"
    );

if (savedHighContrast === "enabled") {
    body.classList.add("high-contrast");

    highContrastButton?.setAttribute(
        "aria-pressed",
        "true"
    );
}

/* ========================================
   Stop Speech Before Leaving Page
======================================== */

window.addEventListener("beforeunload", () => {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
});