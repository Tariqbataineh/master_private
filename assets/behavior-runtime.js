
"use strict";

/* =========================================
   Wusool Behavior Runtime
========================================= */

(() => {
    const service =
        window.WusoolBehaviorService;

    if (!service) {
        return;
    }

    const showImpersonationBar = () => {
        const session =
            service.getImpersonation();

        if (!session) {
            return;
        }

        if (
            document.getElementById(
                "wusoolImpersonationBar"
            )
        ) {
            return;
        }

        const bar =
            document.createElement(
                "div"
            );

        bar.id =
            "wusoolImpersonationBar";

        bar.className =
            "wusool-impersonation-bar";

        bar.innerHTML = `
            <div>
                <strong>
                    Admin Preview Mode
                </strong>

                <span>
                    Viewing as ${session.type}: ${session.name}
                </span>
            </div>

            <button
                type="button"
                id="wusoolExitImpersonation"
            >
                Exit Preview
            </button>
        `;

        document.body.prepend(bar);

        document.getElementById(
            "wusoolExitImpersonation"
        )
            .addEventListener(
                "click",
                () => {
                    service
                        .stopImpersonation();

                    window.location.href =
                        "../../admin/html/admin-impersonation.html";
                }
            );
    };

    const applyPermissionVisibility = () => {
        const role =
            sessionStorage.getItem(
                "wusoolAdminRole"
            ) ||
            "super-admin";

        document
            .querySelectorAll(
                "[data-permission]"
            )
            .forEach(
                (element) => {
                    const permission =
                        element.dataset
                            .permission;

                    if (
                        !service
                            .hasPermission(
                                role,
                                permission
                            )
                    ) {
                        element.style
                            .display =
                            "none";
                    }
                }
            );
    };

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            showImpersonationBar();
            applyPermissionVisibility();
        }
    );
})();
