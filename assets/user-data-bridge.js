
"use strict";

(() => {
    const service = WusoolDataService;

    if (!service) {
        return;
    }

    const sessionRaw =
        sessionStorage.getItem("wusoolDemoUser");

    let session = {};

    try {
        session = JSON.parse(sessionRaw || "{}");
    } catch {
        session = {};
    }

    let currentUser = null;

    if (session.id) {
        currentUser = service.getUserById(session.id);
    }

    if (!currentUser) {
        currentUser = service.getUsers()[0] || null;
    }

    if (!currentUser) {
        return;
    }

    document.querySelectorAll("[data-current-user-name]")
        .forEach((element) => {
            element.textContent = currentUser.name;
        });

    document.querySelectorAll("[data-user-ticket-count]")
        .forEach((element) => {
            element.textContent =
                service.getTickets({ requesterId: currentUser.id }).length;
        });

    document.querySelectorAll("[data-user-review-count]")
        .forEach((element) => {
            element.textContent =
                service.getReviews({ userId: currentUser.id }).length;
        });
})();
