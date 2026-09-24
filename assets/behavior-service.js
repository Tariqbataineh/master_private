
"use strict";

/* =========================================
   Wusool Platform Behavior Service
   Rules + Automations + Workflows + Roles
========================================= */

window.WusoolBehaviorService = (() => {
    const KEYS = {
        rules: "wusoolBusinessRules",
        automations: "wusoolAutomations",
        workflows: "wusoolWorkflows",
        roles: "wusoolRolesPermissions",
        impersonation: "wusoolImpersonationSession",
        notifications: "wusoolNotifications",
        announcements: "wusoolAnnouncements"
    };

    const read = (key, fallback) => {
        try {
            return JSON.parse(
                localStorage.getItem(key) || JSON.stringify(fallback)
            );
        } catch {
            return fallback;
        }
    };

    const write = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
    };

    const nowIso = () => new Date().toISOString();

    const defaultRules = [
        {
            id: "rule-low-score",
            name: "Low Accessibility Score",
            enabled: true,
            entity: "Branch",
            field: "accessibilityScore",
            operator: "lessThan",
            value: 60,
            action: "setStatus",
            actionValue: "needs review"
        },
        {
            id: "rule-critical-ticket",
            name: "Critical Ticket Alert",
            enabled: true,
            entity: "Ticket",
            field: "priority",
            operator: "equals",
            value: "High",
            action: "notifyAdmin",
            actionValue: "High priority support ticket created."
        }
    ];

    const defaultAutomations = [
        {
            id: "auto-org-register",
            name: "Organization Registration Alert",
            enabled: true,
            trigger: "organization.created",
            action: "notifyAdmin",
            message: "A new organization was created."
        },
        {
            id: "auto-branch-review",
            name: "Branch Review Alert",
            enabled: true,
            trigger: "branch.status.pending",
            action: "notifyAdmin",
            message: "A branch is waiting for review."
        }
    ];

    const defaultWorkflows = {
        branchApproval: {
            id: "branchApproval",
            name: "Branch Approval",
            entity: "Branch",
            stages: [
                "Draft",
                "AI Review",
                "Submitted",
                "Admin Review",
                "Approved"
            ]
        },
        organizationApproval: {
            id: "organizationApproval",
            name: "Organization Approval",
            entity: "Organization",
            stages: [
                "Registration",
                "Pending Review",
                "Approved"
            ]
        }
    };

    const defaultRoles = [
        {
            id: "super-admin",
            name: "Super Admin",
            permissions: ["*"]
        },
        {
            id: "reviewer",
            name: "Reviewer",
            permissions: [
                "branches.view",
                "branches.edit",
                "branches.approve",
                "reviews.view",
                "reviews.moderate",
                "ai.view",
                "ai.override"
            ]
        },
        {
            id: "support-admin",
            name: "Support Admin",
            permissions: [
                "users.view",
                "tickets.view",
                "tickets.edit",
                "tickets.assign",
                "tickets.resolve"
            ]
        },
        {
            id: "content-manager",
            name: "Content Manager",
            permissions: [
                "content.view",
                "content.edit",
                "content.publish",
                "media.manage",
                "theme.edit"
            ]
        }
    ];

    const getRules = () => {
        const rules = read(KEYS.rules, null);
        if (Array.isArray(rules)) {
            return rules;
        }

        write(KEYS.rules, defaultRules);
        return structuredClone(defaultRules);
    };

    const saveRules = (rules) => write(KEYS.rules, rules);

    const getAutomations = () => {
        const items = read(KEYS.automations, null);
        if (Array.isArray(items)) {
            return items;
        }

        write(KEYS.automations, defaultAutomations);
        return structuredClone(defaultAutomations);
    };

    const saveAutomations = (items) => write(KEYS.automations, items);

    const getWorkflows = () => {
        const data = read(KEYS.workflows, null);
        if (data && typeof data === "object") {
            return data;
        }

        write(KEYS.workflows, defaultWorkflows);
        return structuredClone(defaultWorkflows);
    };

    const saveWorkflows = (data) => write(KEYS.workflows, data);

    const getRoles = () => {
        const roles = read(KEYS.roles, null);
        if (Array.isArray(roles)) {
            return roles;
        }

        write(KEYS.roles, defaultRoles);
        return structuredClone(defaultRoles);
    };

    const saveRoles = (roles) => write(KEYS.roles, roles);

    const getNotifications = () => read(KEYS.notifications, []);

    const pushNotification = ({
        title,
        message,
        type = "info",
        target = "admin"
    }) => {
        const notifications = getNotifications();

        notifications.unshift({
            id: `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title,
            message,
            type,
            target,
            read: false,
            createdAt: nowIso()
        });

        write(KEYS.notifications, notifications.slice(0, 100));
    };

    const compare = (actual, operator, expected) => {
        if (operator === "equals") {
            return String(actual).toLowerCase() ===
                String(expected).toLowerCase();
        }

        if (operator === "notEquals") {
            return String(actual).toLowerCase() !==
                String(expected).toLowerCase();
        }

        if (operator === "lessThan") {
            return Number(actual) < Number(expected);
        }

        if (operator === "greaterThan") {
            return Number(actual) > Number(expected);
        }

        if (operator === "contains") {
            return String(actual).toLowerCase()
                .includes(String(expected).toLowerCase());
        }

        return false;
    };

    const executeRuleAction = (rule, entity) => {
        if (rule.action === "setStatus") {
            if (rule.entity === "Branch") {
                window.WusoolDataService?.setBranchStatus(
                    entity.id,
                    rule.actionValue
                );
            }

            if (rule.entity === "Organization") {
                window.WusoolDataService?.setOrganizationStatus(
                    entity.id,
                    rule.actionValue
                );
            }

            if (rule.entity === "Ticket") {
                window.WusoolDataService?.setTicketStatus(
                    entity.id,
                    rule.actionValue
                );
            }

            return;
        }

        if (rule.action === "notifyAdmin") {
            pushNotification({
                title: rule.name,
                message:
                    rule.actionValue ||
                    `Rule matched for ${rule.entity} ${entity.id}`,
                type: "warning"
            });
        }
    };

    const evaluateEntity = (entityType, entity) => {
        getRules()
            .filter((rule) =>
                rule.enabled &&
                rule.entity === entityType
            )
            .forEach((rule) => {
                if (
                    compare(
                        entity[rule.field],
                        rule.operator,
                        rule.value
                    )
                ) {
                    executeRuleAction(rule, entity);
                }
            });
    };

    const triggerAutomation = (trigger, context = {}) => {
        getAutomations()
            .filter((item) =>
                item.enabled &&
                item.trigger === trigger
            )
            .forEach((item) => {
                if (item.action === "notifyAdmin") {
                    pushNotification({
                        title: item.name,
                        message:
                            item.message ||
                            `Automation triggered: ${trigger}`,
                        type: "info"
                    });
                }

                if (item.action === "setStatus") {
                    const entity = context.entity;

                    if (!entity) {
                        return;
                    }

                    if (context.entityType === "Branch") {
                        window.WusoolDataService?.setBranchStatus(
                            entity.id,
                            item.actionValue
                        );
                    }

                    if (context.entityType === "Organization") {
                        window.WusoolDataService?.setOrganizationStatus(
                            entity.id,
                            item.actionValue
                        );
                    }
                }
            });
    };

    const startImpersonation = ({
        type,
        id,
        name,
        redirectUrl
    }) => {
        const session = {
            type,
            id,
            name,
            startedAt: nowIso()
        };

        sessionStorage.setItem(
            KEYS.impersonation,
            JSON.stringify(session)
        );

        if (type === "User") {
            const user =
                window.WusoolDataService?.getUserById(id);

            if (user) {
                sessionStorage.setItem(
                    "wusoolDemoUser",
                    JSON.stringify(user)
                );
            }
        }

        if (type === "Organization") {
            const organization =
                window.WusoolDataService?.getOrganizationById(id);

            if (organization) {
                sessionStorage.setItem(
                    "wusoolOrganizationLoggedIn",
                    "true"
                );

                sessionStorage.setItem(
                    "wusoolOrganization",
                    JSON.stringify(organization)
                );
            }
        }

        if (redirectUrl) {
            window.location.href = redirectUrl;
        }

        return session;
    };

    const stopImpersonation = () => {
        sessionStorage.removeItem(KEYS.impersonation);
    };

    const getImpersonation = () => {
        try {
            return JSON.parse(
                sessionStorage.getItem(KEYS.impersonation) || "null"
            );
        } catch {
            return null;
        }
    };

    const hasPermission = (roleId, permission) => {
        const role =
            getRoles()
                .find((item) => item.id === roleId);

        if (!role) {
            return false;
        }

        return (
            role.permissions.includes("*") ||
            role.permissions.includes(permission)
        );
    };

    return {
        KEYS,
        getRules,
        saveRules,
        evaluateEntity,
        getAutomations,
        saveAutomations,
        triggerAutomation,
        getWorkflows,
        saveWorkflows,
        getRoles,
        saveRoles,
        hasPermission,
        getNotifications,
        pushNotification,
        startImpersonation,
        stopImpersonation,
        getImpersonation
    };
})();
