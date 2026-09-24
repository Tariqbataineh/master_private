
"use strict";

const conversation = document.getElementById("copilotConversation");
const input = document.getElementById("copilotInput");

const addMessage = (who, html) => {
    conversation.insertAdjacentHTML(
        "beforeend",
        `
            <div class="mb-3">
                <strong class="d-block mb-1">${who}</strong>
                <div>${html}</div>
            </div>
        `
    );

    conversation.scrollTop = conversation.scrollHeight;
};

const answer = (question) => {
    const q = question.toLowerCase();

    if (q.includes("branches") && (q.includes("60") || q.includes("low"))) {
        const items = WusoolDataService.getBranches()
            .filter((x) => x.accessibilityScore < 60);

        return items.length
            ? items.map((x) => `${x.name} (${x.accessibilityScore}%)`).join("<br>")
            : "No branches are currently below 60%.";
    }

    if (q.includes("open") && q.includes("ticket")) {
        const items = WusoolDataService.getTickets()
            .filter((x) => !["resolved", "closed"].includes(x.status.toLowerCase()));

        return items.length
            ? items.map((x) => `${x.subject} — ${x.priority}`).join("<br>")
            : "No open tickets.";
    }

    if (q.includes("pending") && q.includes("organization")) {
        const items = WusoolDataService.getOrganizations({ status: "pending" });

        return items.length
            ? items.map((x) => x.name).join("<br>")
            : "No pending organizations.";
    }

    if (q.includes("flagged") && q.includes("review")) {
        const items = WusoolDataService.getReviews({ flagged: true });

        return items.length
            ? items.map((x) => `${x.title || "Review"} (${x.rating}/5)`).join("<br>")
            : "No flagged reviews.";
    }

    if (q.includes("summary") || q.includes("overview")) {
        const s = WusoolDataService.getDashboardSnapshot();

        return `
            Users: ${s.users}<br>
            Organizations: ${s.organizations}<br>
            Branches: ${s.branches}<br>
            Pending branches: ${s.pendingBranches}<br>
            Open tickets: ${s.openTickets}<br>
            Active subscriptions: ${s.activeSubscriptions}
        `;
    }

    return "This frontend Copilot currently answers platform-data questions. When the backend/AI provider is connected, the same UI can support free-form AI.";
};

const submit = () => {
    const value = input.value.trim();

    if (!value) {
        return;
    }

    addMessage("You", value);
    addMessage("Wusool Copilot", answer(value));
    input.value = "";
};

document.getElementById("copilotSend").addEventListener("click", submit);

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        submit();
    }
});

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-question]");

    if (button) {
        input.value = button.dataset.question;
        submit();
    }
});

addMessage("Wusool Copilot", "Ask me about current Wusool platform data.");
