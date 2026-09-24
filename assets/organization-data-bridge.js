
"use strict";

(() => {
    const service = WusoolDataService;

    if (!service) {
        return;
    }

    const resolveCurrentOrganization = () => {
        try {
            const session = JSON.parse(
                sessionStorage.getItem("wusoolOrganization") || "{}"
            );

            if (session.id && service.getOrganizationById(session.id)) {
                return service.getOrganizationById(session.id);
            }
        } catch {
            // Use first organization below.
        }

        return service.getOrganizations()[0] || null;
    };

    const organization = resolveCurrentOrganization();

    if (!organization) {
        return;
    }

    const branches = service.getBranches({
        organizationId: organization.id
    });

    const tickets = service.getTickets({
        organizationId: organization.id
    });

    const subscription = service.getSubscriptions({
        organizationId: organization.id
    })[0] || null;

    document.querySelectorAll("[data-organization-name]")
        .forEach((element) => {
            element.textContent = organization.name;
        });

    document.querySelectorAll("[data-branches-count]")
        .forEach((element) => {
            element.textContent = branches.length;
        });

    document.querySelectorAll("[data-organization-ticket-count]")
        .forEach((element) => {
            element.textContent = tickets.length;
        });

    document.querySelectorAll("[data-subscription-plan]")
        .forEach((element) => {
            element.textContent = subscription?.plan || "No plan";
        });

    const path = window.location.pathname.split("/").pop();

    if (path === "branches.html") {
        const tbody = document.querySelector("tbody");

        if (tbody) {
            tbody.innerHTML = branches.map((branch) => `
                <tr>
                    <td><strong>${branch.name}</strong></td>
                    <td>${branch.city}</td>
                    <td>${branch.accessibilityScore}%</td>
                    <td>${branch.status}</td>
                </tr>
            `).join("");
        }
    }
})();
