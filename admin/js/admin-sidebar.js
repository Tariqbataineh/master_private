
document.addEventListener("DOMContentLoaded", () => {
    loadAdminSidebar();
});

const loadAdminSidebar = async () => {
    const sidebarContainer = document.getElementById("adminSidebarContainer");

    if (!sidebarContainer) {
        return;
    }

    try {
        const response = await fetch("../components/admin-sidebar.html");

        if (!response.ok) {
            throw new Error("Admin sidebar could not be loaded.");
        }

        const sidebarHtml = await response.text();
        sidebarContainer.outerHTML = sidebarHtml;

        setActiveAdminLink();
        setupAdminLogout();
    } catch (error) {
        console.error("Admin sidebar loading error:", error);
    }
};

const setActiveAdminLink = () => {
    const currentPage = window.location.pathname.split("/").pop();

    document
        .querySelectorAll(".admin-sidebar .nav-link")
        .forEach((link) => {
            const linkPage = link.getAttribute("href").split("/").pop();
            const isActive = linkPage === currentPage;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
};

const setupAdminLogout = () => {
    const button = document.getElementById("adminLogoutButton");

    button?.addEventListener("click", async () => {
        /*
            Later:
            await WusoolApi.post("/auth/logout", {});
        */

        window.location.href = "./admin-login.html";
    });
};
