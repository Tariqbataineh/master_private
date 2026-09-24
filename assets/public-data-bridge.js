
"use strict";

/* =========================================
   User / Visitor Branch Data Bridge
========================================= */

(() => {
    const service =
        window.WusoolDataService;

    if (!service) {
        return;
    }

    const branches =
        service
            .getBranches({
                status:
                    "approved"
            });

    const containers =
        document.querySelectorAll(
            "[data-dynamic-branches]"
        );

    containers.forEach(
        (container) => {
            container.innerHTML =
                branches
                    .map(
                        (branch) => {
                            const organization =
                                service
                                    .getOrganizationById(
                                        branch.organizationId
                                    );

                            return `
                                <article class="card h-100 p-3">
                                    <h3 class="h5 fw-bold">
                                        ${branch.name}
                                    </h3>

                                    <p class="text-secondary mb-2">
                                        ${organization?.name || ""}
                                    </p>

                                    <p class="mb-2">
                                        ${branch.city}
                                    </p>

                                    <strong>
                                        Accessibility:
                                        ${branch.accessibilityScore}%
                                    </strong>
                                </article>
                            `;
                        }
                    )
                    .join("");
        }
    );
})();
