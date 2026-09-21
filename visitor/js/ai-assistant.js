const assistantResponses = [
    {
        keywords: ["bank", "branch"],
        response:
            "Based on your selected preferences, Amman Main Branch is a strong match.",
        placeName: "Amman Main Branch",
        score: 92,
        features: [
            "Step-free entrance",
            "Accessible parking",
            "Staff assistance",
            "Wide internal pathways"
        ],
        placeId: 1
    },
    {
        keywords: ["wheelchair", "wheelchairs"],
        response:
            "I found a verified location with wheelchair access and an accessible entrance.",
        placeName: "Al Noor Medical Center",
        score: 88,
        features: [
            "Wheelchair entrance",
            "Elevator",
            "Accessible restroom",
            "Staff support"
        ],
        placeId: 2
    },
    {
        keywords: ["parking", "staff"],
        response:
            "Community Hub matches your need for accessible parking and staff assistance.",
        placeName: "Community Hub",
        score: 86,
        features: [
            "Accessible parking",
            "Staff assistance",
            "Step-free entrance"
        ],
        placeId: 3
    },
    {
        keywords: ["score", "explain"],
        response:
            "An accessibility score summarizes verified features such as entrances, parking, elevators, pathways and possible barriers.",
        placeName: null,
        score: null,
        features: [],
        placeId: null
    }
];

document.addEventListener("DOMContentLoaded", () => {
    initializeChat();
    initializePromptButtons();
    initializePreferences();
    initializeSavedProfile();
    initializeVoiceInput();
    initializeNewChat();
    initializeTextarea();
});

const initializeChat = () => {
    const chatForm =
        document.getElementById("chatForm");

    const messageInput =
        document.getElementById("messageInput");

    chatForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const message = messageInput.value.trim();

        if (!message) {
            return;
        }

        sendVisitorMessage(message);

        messageInput.value = "";
        messageInput.style.height = "48px";
    });
};

const sendVisitorMessage = (message) => {
    addMessage(message, "user");

    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();

        const response =
            findAssistantResponse(message);

        addAssistantResponse(response);
    }, 700);
};

const findAssistantResponse = (message) => {
    const normalizedMessage =
        message.toLowerCase();

    const matchingResponse =
        assistantResponses.find((response) => {
            return response.keywords.some((keyword) => {
                return normalizedMessage.includes(keyword);
            });
        });

    if (matchingResponse) {
        return matchingResponse;
    }

    return {
        response:
            "I can help you find accessible banks, government branches and public places. Tell me the city and accessibility features you need.",
        placeName: null,
        score: null,
        features: [],
        placeId: null
    };
};

const addMessage = (message, sender) => {
    const chatMessages =
        document.getElementById("chatMessages");

    const messageElement =
        document.createElement("article");

    messageElement.className =
        `message ${sender}-message`;

    if (sender === "user") {
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }

    chatMessages.appendChild(messageElement);
    scrollChatToBottom();
};

const addAssistantResponse = (response) => {
    const chatMessages =
        document.getElementById("chatMessages");

    const messageElement =
        document.createElement("article");

    messageElement.className =
        "message assistant-message";

    let recommendationHtml = "";

    if (response.placeName) {
        const features = response.features
            .map((feature) => {
                return `<li>${feature}</li>`;
            })
            .join("");

        recommendationHtml = `
            <div class="recommendation-card">

                <div class="d-flex justify-content-between gap-3">

                    <h3>${response.placeName}</h3>

                    <span class="match-score">
                        ${response.score}% Match
                    </span>

                </div>

                <ul>${features}</ul>

                <a href="./place-details.html?id=${response.placeId}"
                   class="btn btn-outline-wusool btn-sm">
                    View Place Details
                </a>

            </div>
        `;
    }

    messageElement.innerHTML = `
        <div class="message-avatar">
            AI
        </div>

        <div class="message-content">

            <p>${response.response}</p>

            ${recommendationHtml}

            <small>Wusool AI Assistant</small>

        </div>
    `;

    chatMessages.appendChild(messageElement);
    scrollChatToBottom();
};

const showTypingIndicator = () => {
    const chatMessages =
        document.getElementById("chatMessages");

    const typingElement =
        document.createElement("article");

    typingElement.className =
        "message assistant-message";

    typingElement.id = "typingIndicator";

    typingElement.innerHTML = `
        <div class="message-avatar">
            AI
        </div>

        <div class="message-content">
            <span class="spinner-grow spinner-grow-sm"></span>
            <span class="spinner-grow spinner-grow-sm"></span>
            <span class="spinner-grow spinner-grow-sm"></span>
        </div>
    `;

    chatMessages.appendChild(typingElement);
    scrollChatToBottom();
};

const removeTypingIndicator = () => {
    document.getElementById("typingIndicator")?.remove();
};

const initializePromptButtons = () => {
    document.querySelectorAll(".prompt-button")
        .forEach((button) => {
            button.addEventListener("click", () => {
                sendVisitorMessage(
                    button.textContent.trim()
                );
            });
        });
};

const initializePreferences = () => {
    const applyButton =
        document.getElementById(
            "applyPreferencesButton"
        );

    applyButton.addEventListener("click", () => {
        const citySelect =
            document.getElementById("city");

        const placeTypeSelect =
            document.getElementById("placeType");

        const city =
            citySelect.options[
                citySelect.selectedIndex
            ].text;

        const placeType =
            placeTypeSelect.options[
                placeTypeSelect.selectedIndex
            ].text;

        const needs = Array.from(
            document.querySelectorAll(
                'input[name="accessibilityNeed"]:checked'
            )
        ).map((input) => {
            return input.value;
        });

        const needsText =
            needs.length > 0
                ? needs.join(", ")
                : "general accessibility";

        sendVisitorMessage(
            `Find a ${placeType} in ${city} with ${needsText}`
        );
    });
};

const initializeSavedProfile = () => {
    const savedProfileButton =
        document.getElementById("savedProfileButton");

    const modalElement =
        document.getElementById(
            "loginRequiredModal"
        );

    const loginModal =
        new bootstrap.Modal(modalElement);

    savedProfileButton.addEventListener(
        "click",
        () => {
            loginModal.show();
        }
    );
};

const initializeVoiceInput = () => {
    const voiceButton =
        document.getElementById("voiceInputButton");

    const messageInput =
        document.getElementById("messageInput");

    voiceButton.addEventListener("click", () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert(
                "Voice input is not supported in this browser."
            );

            return;
        }

        const recognition =
            new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.start();

        voiceButton.innerHTML =
            '<i class="bi bi-mic-fill me-1"></i> Listening...';

        recognition.addEventListener(
            "result",
            (event) => {
                messageInput.value =
                    event.results[0][0].transcript;
            }
        );

        recognition.addEventListener("end", () => {
            voiceButton.innerHTML =
                '<i class="bi bi-mic me-1"></i> Voice Input';
        });
    });
};

const initializeNewChat = () => {
    const newChatButton =
        document.getElementById("newChatButton");

    newChatButton.addEventListener("click", () => {
        const chatMessages =
            document.getElementById("chatMessages");

        chatMessages.innerHTML = `
            <article class="message assistant-message">

                <div class="message-avatar">
                    AI
                </div>

                <div class="message-content">
                    <p>
                        Hello! What accessibility information
                        can I help you find?
                    </p>

                    <small>Wusool AI Assistant</small>
                </div>

            </article>
        `;
    });
};

const initializeTextarea = () => {
    const messageInput =
        document.getElementById("messageInput");

    messageInput.addEventListener("input", () => {
        messageInput.style.height = "48px";

        messageInput.style.height =
            `${Math.min(messageInput.scrollHeight, 120)}px`;
    });

    messageInput.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                document.getElementById("chatForm")
                    .requestSubmit();
            }
        }
    );
};

const scrollChatToBottom = () => {
    const chatMessages =
        document.getElementById("chatMessages");

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
};

const escapeHtml = (text) => {
    const element =
        document.createElement("div");

    element.textContent = text;

    return element.innerHTML;
};