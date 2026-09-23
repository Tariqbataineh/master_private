"use strict";

/*
    Create the shared mobile overlay immediately. Page scripts register
    their DOMContentLoaded handlers before this file and can safely find
    the overlay when those handlers run.
*/
if (
    document.getElementById(
        "organizationSidebarContainer"
    )
) {
    findOrCreateSidebarOverlay();
}

initializeSharedOrganizationSidebar();

function initializeSharedOrganizationSidebar() {
    const container = document.getElementById(
        "organizationSidebarContainer"
    );

    if (!container) {
        return;
    }

    try {
        const request = new XMLHttpRequest();
        request.open(
            "GET",
            "../components/organization-sidebar.html",
            false
        );
        request.send();

        if (
            request.status < 200 ||
            request.status >= 300
        ) {
            throw new Error(
                `Unable to load sidebar (${request.status})`
            );
        }

        container.outerHTML = request.responseText;
        document.body.classList.add(
            "has-organization-sidebar"
        );

        setOrganizationSidebarActiveLink();
        loadOrganizationSidebarProfile();
        connectOrganizationSidebarControls();
    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="alert alert-danger m-3" role="alert">
                Navigation could not be loaded. Please refresh the page.
            </div>
        `;
    }
}

function setOrganizationSidebarActiveLink() {
    const currentPage =
        window.location.pathname.split("/").pop() ||
        "organization-dashboard.html";

    const branchPages = new Set([
        "add-branch.html",
        "branch-accessibility.html",
        "branch-ai-review.html",
        "branch-photos.html",
        "branch-review-status.html",
        "branch-submission-success.html",
        "branch-submit-review.html",
        "branch-working-hours.html",
        "organization-branch-details.html"
    ]);

    const activePage = branchPages.has(currentPage)
        ? "branches.html"
        : currentPage;

    document
        .querySelectorAll(
            "#organizationSidebar .sidebar-link[data-page]"
        )
        .forEach((link) => {
            const isActive =
                link.dataset.page === activePage;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
}

function loadOrganizationSidebarProfile() {
    const organization = readOrganizationSession();

    if (!organization) {
        return;
    }

    const organizationName =
        organization.organizationName ||
        organization.name ||
        organization.managerName ||
        "Organization Manager";

    const organizationEmail =
        organization.email ||
        organization.managerEmail ||
        "manager@organization.com";

    const nameElement = document.getElementById(
        "sidebarOrganizationName"
    );
    const emailElement = document.getElementById(
        "sidebarOrganizationEmail"
    );
    const initialsElement = document.getElementById(
        "sidebarOrganizationInitials"
    );

    if (nameElement) {
        nameElement.textContent = organizationName;
    }

    if (emailElement) {
        emailElement.textContent = organizationEmail;
    }

    if (initialsElement) {
        initialsElement.textContent = getOrganizationInitials(
            organizationName
        );
    }
}

function readOrganizationSession() {
    const storageKeys = [
        "wusoolOrganization",
        "wusoolCurrentOrganization",
        "currentOrganization",
        "organizationUser"
    ];

    for (const storageKey of storageKeys) {
        const storages = [sessionStorage, localStorage];

        for (const storage of storages) {
            try {
                const storedValue = storage.getItem(storageKey);

                if (storedValue) {
                    return JSON.parse(storedValue);
                }
            } catch (error) {
                console.warn(
                    `Unable to read ${storageKey}:`,
                    error
                );
            }
        }
    }

    return null;
}

function getOrganizationInitials(name) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("") || "OM";
}

function connectOrganizationSidebarControls() {
    const sidebar = document.getElementById(
        "organizationSidebar"
    );
    const closeButton = document.getElementById(
        "closeOrganizationSidebar"
    );
    const overlay = findOrCreateSidebarOverlay();
    const toggleButtons = document.querySelectorAll(
        [
            "#sidebarToggleButton",
            "#openSidebarButton",
            "#sidebarToggle",
            "[data-sidebar-toggle]",
            "[data-bs-target='#organizationSidebar']"
        ].join(",")
    );

    if (!sidebar) {
        return;
    }

    const openSidebar = () => {
        sidebar.classList.add("open", "show");
        sidebar.setAttribute("aria-modal", "true");
        document.body.classList.add(
            "organization-sidebar-open"
        );

        if (overlay) {
            overlay.classList.add("show");
        }

        toggleButtons.forEach((button) => {
            button.setAttribute("aria-expanded", "true");
        });
    };

    const closeSidebar = () => {
        sidebar.classList.remove("open", "show");
        sidebar.removeAttribute("aria-modal");
        document.body.classList.remove(
            "organization-sidebar-open"
        );

        if (overlay) {
            overlay.classList.remove("show");
        }

        toggleButtons.forEach((button) => {
            button.setAttribute("aria-expanded", "false");
        });
    };

    toggleButtons.forEach((button) => {
        /*
            The shared controller replaces Bootstrap's delegated
            offcanvas controller so the same button cannot toggle
            the sidebar twice.
        */
        if (
            button.getAttribute("data-bs-target") ===
            "#organizationSidebar"
        ) {
            button.removeAttribute("data-bs-toggle");
            button.removeAttribute("data-bs-target");
        }

        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (
                sidebar.classList.contains("open") ||
                sidebar.classList.contains("show")
            ) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    });

    closeButton?.addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        closeSidebar();
    });
    overlay?.addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        closeSidebar();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 992) {
            closeSidebar();
        }
    });

    const logoutButton = document.getElementById(
        "logoutButton"
    );

    logoutButton?.addEventListener("click", () => {
        sessionStorage.removeItem(
            "wusoolOrganizationLoggedIn"
        );
        sessionStorage.removeItem("wusoolOrganization");
    });
}

function findOrCreateSidebarOverlay() {
    const existingOverlay = document.querySelector(
        "#sidebarOverlay, .sidebar-overlay"
    );

    if (existingOverlay) {
        createSidebarBackdropCompatibilityNode();
        return existingOverlay;
    }

    const overlay = document.createElement("div");
    overlay.id = "sidebarOverlay";
    overlay.className = "sidebar-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
    createSidebarBackdropCompatibilityNode();

    return overlay;
}

function createSidebarBackdropCompatibilityNode() {
    if (document.getElementById("sidebarBackdrop")) {
        return;
    }

    const compatibilityNode = document.createElement("div");
    compatibilityNode.id = "sidebarBackdrop";
    compatibilityNode.hidden = true;
    compatibilityNode.setAttribute("aria-hidden", "true");
    document.body.appendChild(compatibilityNode);
}
