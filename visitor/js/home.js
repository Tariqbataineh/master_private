"use strict";

/* ========================================
   Wusool Home Page JavaScript
======================================== */

const searchForm =
    document.getElementById("searchForm");

const searchInput =
    document.getElementById("searchInput");

const citySelect =
    document.getElementById("citySelect");

const accessibilityNeed =
    document.getElementById("accessibilityNeed");

/* ========================================
   Home Status Message
======================================== */

const showHomeMessage = (message, type = "success") => {
    const oldMessage =
        document.getElementById("homeMessage");

    if (oldMessage) {
        oldMessage.remove();
    }

    const messageElement =
        document.createElement("div");

    messageElement.id = "homeMessage";

    messageElement.className =
        `alert alert-${type} ` +
        "position-fixed bottom-0 start-50 " +
        "translate-middle-x mb-4 shadow-lg";

    messageElement.style.zIndex = "9999";
    messageElement.style.minWidth = "300px";
    messageElement.style.textAlign = "center";

    messageElement.setAttribute(
        "role",
        "status"
    );

    messageElement.setAttribute(
        "aria-live",
        "polite"
    );

    messageElement.textContent = message;

    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 3500);
};

/* ========================================
   Search Form
======================================== */

searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchValue =
        searchInput.value.trim();

    const selectedCity =
        citySelect.value;

    const selectedNeed =
        accessibilityNeed.value;

    if (searchValue === "") {
        showHomeMessage(
            "Please enter a place or service.",
            "warning"
        );

        searchInput.focus();

        return;
    }

    const searchData = {
        query: searchValue,
        city: selectedCity,
        accessibilityNeed: selectedNeed
    };

    sessionStorage.setItem(
        "wusool-search",
        JSON.stringify(searchData)
    );

    showHomeMessage(
        `Searching for ${searchValue}` +
        `${selectedCity ? ` in ${selectedCity}` : ""}.`
    );

    /*
       بعد إنشاء صفحة الخريطة سنفعل هذا السطر:

       window.location.href =
           `accessibility-map.html?search=${encodeURIComponent(searchValue)}`;
    */
});

/* ========================================
   Smooth Scrolling
======================================== */

const pageLinks =
    document.querySelectorAll('a[href^="#"]');

pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId =
            link.getAttribute("href");

        if (
            !targetId ||
            targetId === "#"
        ) {
            return;
        }

        const targetSection =
            document.querySelector(targetId);

        if (!targetSection) {
            return;
        }

        event.preventDefault();

        targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

/* ========================================
   Close Mobile Navbar
======================================== */

const navbarLinks =
    document.querySelectorAll(
        "#mainNavbar .nav-link"
    );

const navbarCollapse =
    document.getElementById("mainNavbar");

navbarLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (
            navbarCollapse &&
            navbarCollapse.classList.contains("show")
        ) {
            const bootstrapCollapse =
                bootstrap.Collapse.getOrCreateInstance(
                    navbarCollapse
                );

            bootstrapCollapse.hide();
        }
    });
});

/* ========================================
   Active Navbar Link
======================================== */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );

const navigationLinks =
    document.querySelectorAll(
        ".main-navbar .nav-link"
    );

const updateActiveNavigation = () => {
    let currentSection = "";

    sections.forEach((section) => {
        const sectionTop =
            section.offsetTop - 180;

        if (window.scrollY >= sectionTop) {
            currentSection =
                section.getAttribute("id");
        }
    });

    navigationLinks.forEach((link) => {
        link.classList.remove("active");

        const linkTarget =
            link.getAttribute("href");

        if (
            currentSection &&
            linkTarget === `#${currentSection}`
        ) {
            link.classList.add("active");
        }
    });

    if (window.scrollY < 300) {
        navigationLinks.forEach((link) => {
            link.classList.remove("active");
        });

        const homeLink =
            document.querySelector(
                '.main-navbar a[href="home.html"]'
            );

        homeLink?.classList.add("active");
    }
};

window.addEventListener(
    "scroll",
    updateActiveNavigation
);

/* ========================================
   Card Animation
======================================== */

const animatedCards =
    document.querySelectorAll(
        ".process-card, " +
        ".place-card, " +
        ".feature-card, " +
        ".organization-card, " +
        ".stat-card"
    );

animatedCards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform =
        "translateY(25px)";
});

const cardObserver =
    new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.style.transition =
                    "opacity 0.6s ease, " +
                    "transform 0.6s ease";

                entry.target.style.opacity = "1";
                entry.target.style.transform =
                    "translateY(0)";

                observer.unobserve(
                    entry.target
                );
            });
        },
        {
            threshold: 0.15
        }
    );

animatedCards.forEach((card) => {
    cardObserver.observe(card);
});

/* ========================================
   Organization and Feature Buttons
======================================== */



const createAccountButton =
    document.querySelector(
        "#getStarted .btn-outline-light"
    );

createAccountButton?.addEventListener(
    "click",
    () => {
        showHomeMessage(
            "The visitor registration page will open here."
        );
    }
);

/* ========================================
   Store Last Visit
======================================== */

const visitInformation = {
    page: "Home",
    visitedAt: new Date().toISOString()
};

localStorage.setItem(
    "wusool-last-visit",
    JSON.stringify(visitInformation)
);