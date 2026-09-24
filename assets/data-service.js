
"use strict";

/* =========================================
   Wusool Unified Data Service
   Frontend storage today, API-ready tomorrow.
========================================= */

window.WusoolDataService = (() => {
    const KEYS = {
        organizations: "wusoolOrganizations",
        branches: "wusoolBranches",
        users: "wusoolUsers",
        tickets: "wusoolTickets",
        reviews: "wusoolReviews",
        subscriptions: "wusoolSubscriptions",
        documents: "wusoolDocuments",
        audit: "wusoolAuditLog"
    };

    const read = (key, fallback = []) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error(`Failed to read ${key}`, error);
            return fallback;
        }
    };

    const write = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
    };

    const nowIso = () => new Date().toISOString();

    const nextId = (prefix) => {
        return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    };

    const clone = (value) => {
        return JSON.parse(JSON.stringify(value));
    };

    const addAudit = ({
        action,
        entityType,
        entityId,
        oldValue = null,
        newValue = null,
        reason = ""
    }) => {
        const items = read(KEYS.audit, []);

        items.unshift({
            id: nextId("audit"),
            actor: "System Admin",
            action,
            entityType,
            entityId,
            oldValue,
            newValue,
            reason,
            timestamp: nowIso()
        });

        write(KEYS.audit, items);
    };

    const normalizeOrganization = (item = {}) => {
        const now = nowIso();

        return {
            id: item.id || nextId("org"),
            name:
                item.name ||
                item.organizationName ||
                "Unnamed Organization",
            type: item.type || item.organizationType || "Bank",
            email: item.email || "",
            phone: item.phone || "",
            website: item.website || "",
            city: item.city || "Amman",
            address: item.address || "",
            status: item.status || "active",
            logo: item.logo || "",
            notes: item.notes || "",
            createdAt: item.createdAt || now,
            updatedAt: item.updatedAt || now,
            isDeleted: Boolean(item.isDeleted)
        };
    };

    const normalizeBranch = (item = {}) => {
        const now = nowIso();

        return {
            id: item.id || nextId("branch"),
            organizationId:
                item.organizationId ||
                item.orgId ||
                "",
            name:
                item.name ||
                item.branchName ||
                "Unnamed Branch",
            city: item.city || "Amman",
            address: item.address || "",
            phone: item.phone || "",
            status: item.status || "approved",
            accessibilityScore:
                Number(
                    item.accessibilityScore ??
                    item.score ??
                    0
                ),
            photos:
                Array.isArray(item.photos)
                    ? item.photos
                    : [],
            workingHours:
                item.workingHours || {},
            services:
                Array.isArray(item.services)
                    ? item.services
                    : [],
            notes: item.notes || "",
            createdAt: item.createdAt || now,
            updatedAt: item.updatedAt || now,
            isDeleted: Boolean(item.isDeleted)
        };
    };

    const normalizeUser = (item = {}) => {
        const now = nowIso();

        return {
            id: item.id || nextId("user"),
            name:
                item.name ||
                item.fullName ||
                "Unnamed User",
            email: item.email || "",
            phone: item.phone || "",
            city: item.city || "Amman",
            role: item.role || "User",
            status: item.status || "active",
            accessibilityPreferences:
                Array.isArray(item.accessibilityPreferences)
                    ? item.accessibilityPreferences
                    : [],
            savedPlaces:
                Array.isArray(item.savedPlaces)
                    ? item.savedPlaces
                    : [],
            notes: item.notes || "",
            createdAt: item.createdAt || now,
            updatedAt: item.updatedAt || now,
            lastLoginAt: item.lastLoginAt || "",
            isDeleted: Boolean(item.isDeleted)
        };
    };

    const normalizeTicket = (item = {}) => {
        const now = nowIso();

        return {
            id: item.id || nextId("ticket"),
            requesterType: item.requesterType || "User",
            requesterId: item.requesterId || "",
            organizationId: item.organizationId || "",
            branchId: item.branchId || "",
            subject: item.subject || "Untitled Ticket",
            description: item.description || "",
            category: item.category || "General",
            priority: item.priority || "Medium",
            status: item.status || "Open",
            assignedTo: item.assignedTo || "",
            resolution: item.resolution || "",
            createdAt: item.createdAt || now,
            updatedAt: item.updatedAt || now,
            isDeleted: Boolean(item.isDeleted)
        };
    };

    const normalizeReview = (item = {}) => {
        const now = nowIso();

        return {
            id: item.id || nextId("review"),
            userId: item.userId || "",
            branchId: item.branchId || "",
            rating: Number(item.rating ?? 5),
            title: item.title || "",
            comment: item.comment || "",
            status: item.status || "Visible",
            flagged: Boolean(item.flagged),
            adminNote: item.adminNote || "",
            createdAt: item.createdAt || now,
            updatedAt: item.updatedAt || now,
            isDeleted: Boolean(item.isDeleted)
        };
    };

    const normalizeSubscription = (item = {}) => {
        const now = nowIso();

        return {
            id: item.id || nextId("sub"),
            organizationId: item.organizationId || "",
            plan: item.plan || "Standard",
            status: item.status || "Active",
            branchLimit: Number(item.branchLimit ?? 5),
            price: Number(item.price ?? 0),
            billingCycle: item.billingCycle || "Monthly",
            startDate:
                item.startDate ||
                now.slice(0, 10),
            endDate:
                item.endDate ||
                "",
            autoRenew:
                item.autoRenew !== false,
            notes: item.notes || "",
            createdAt: item.createdAt || now,
            updatedAt: item.updatedAt || now,
            isDeleted: Boolean(item.isDeleted)
        };
    };

    const ensureSeedData = () => {
        let organizations = read(KEYS.organizations, []);
        let branches = read(KEYS.branches, []);
        let users = read(KEYS.users, []);
        let tickets = read(KEYS.tickets, []);
        let reviews = read(KEYS.reviews, []);
        let subscriptions = read(KEYS.subscriptions, []);

        if (!organizations.length) {
            organizations = [
                normalizeOrganization({
                    id: "org-bank-etihad",
                    name: "Bank Al Etihad",
                    type: "Bank",
                    email: "info@bankaletihad.com",
                    phone: "+962 6 560 0444",
                    city: "Amman",
                    status: "active"
                }),
                normalizeOrganization({
                    id: "org-housing-bank",
                    name: "Housing Bank",
                    type: "Bank",
                    email: "info@hbtf.com.jo",
                    city: "Amman",
                    status: "pending"
                }),
                normalizeOrganization({
                    id: "org-gov-demo",
                    name: "Government Services Center",
                    type: "Government",
                    city: "Amman",
                    status: "active"
                })
            ];

            write(KEYS.organizations, organizations);
        }

        if (!branches.length) {
            branches = [
                normalizeBranch({
                    id: "branch-etihad-shmeisani",
                    organizationId: "org-bank-etihad",
                    name: "Shmeisani Branch",
                    city: "Amman",
                    address: "Shmeisani, Amman",
                    status: "approved",
                    accessibilityScore: 86
                }),
                normalizeBranch({
                    id: "branch-etihad-abdoun",
                    organizationId: "org-bank-etihad",
                    name: "Abdoun Branch",
                    city: "Amman",
                    address: "Abdoun, Amman",
                    status: "pending",
                    accessibilityScore: 72
                }),
                normalizeBranch({
                    id: "branch-housing-irbid",
                    organizationId: "org-housing-bank",
                    name: "Irbid Branch",
                    city: "Irbid",
                    address: "Irbid",
                    status: "approved",
                    accessibilityScore: 78
                })
            ];

            write(KEYS.branches, branches);
        }

        if (!users.length) {
            users = [
                normalizeUser({
                    id: "user-001",
                    name: "Ahmad Khalil",
                    email: "ahmad@example.com",
                    phone: "+962790000001",
                    city: "Amman",
                    status: "active",
                    accessibilityPreferences: ["Wheelchair Access", "Accessible Parking"],
                    savedPlaces: ["branch-etihad-shmeisani"]
                }),
                normalizeUser({
                    id: "user-002",
                    name: "Sara Ali",
                    email: "sara@example.com",
                    phone: "+962790000002",
                    city: "Irbid",
                    status: "active",
                    accessibilityPreferences: ["Elevator", "Low Counter"]
                }),
                normalizeUser({
                    id: "user-003",
                    name: "Omar Naser",
                    email: "omar@example.com",
                    city: "Zarqa",
                    status: "suspended"
                })
            ];

            write(KEYS.users, users);
        }

        if (!tickets.length) {
            tickets = [
                normalizeTicket({
                    id: "ticket-1001",
                    requesterType: "User",
                    requesterId: "user-001",
                    branchId: "branch-etihad-abdoun",
                    subject: "Entrance ramp information is outdated",
                    description: "The branch page shows a ramp but the latest photo is unclear.",
                    category: "Accessibility Information",
                    priority: "High",
                    status: "Open"
                }),
                normalizeTicket({
                    id: "ticket-1002",
                    requesterType: "Organization",
                    organizationId: "org-bank-etihad",
                    subject: "Branch approval follow-up",
                    description: "Please review Abdoun branch submission.",
                    category: "Approval",
                    priority: "Medium",
                    status: "In Progress"
                })
            ];

            write(KEYS.tickets, tickets);
        }

        if (!reviews.length) {
            reviews = [
                normalizeReview({
                    id: "review-001",
                    userId: "user-001",
                    branchId: "branch-etihad-shmeisani",
                    rating: 5,
                    title: "Good accessibility",
                    comment: "Entrance and parking were easy to use.",
                    status: "Visible"
                }),
                normalizeReview({
                    id: "review-002",
                    userId: "user-002",
                    branchId: "branch-housing-irbid",
                    rating: 3,
                    title: "Needs improvement",
                    comment: "The entrance was good but interior navigation could be clearer.",
                    status: "Visible",
                    flagged: true
                })
            ];

            write(KEYS.reviews, reviews);
        }

        if (!subscriptions.length) {
            subscriptions = [
                normalizeSubscription({
                    id: "sub-etihad",
                    organizationId: "org-bank-etihad",
                    plan: "Enterprise",
                    status: "Active",
                    branchLimit: 50,
                    price: 199,
                    billingCycle: "Monthly",
                    startDate: "2026-09-01",
                    endDate: "2026-10-01"
                }),
                normalizeSubscription({
                    id: "sub-housing",
                    organizationId: "org-housing-bank",
                    plan: "Standard",
                    status: "Active",
                    branchLimit: 10,
                    price: 79,
                    billingCycle: "Monthly",
                    startDate: "2026-09-05",
                    endDate: "2026-10-05"
                })
            ];

            write(KEYS.subscriptions, subscriptions);
        }
    };

    const filterItems = (items, {
        includeDeleted = false,
        status = "",
        search = "",
        searchFields = []
    } = {}) => {
        let result = items;

        if (!includeDeleted) {
            result = result.filter((item) => !item.isDeleted);
        }

        if (status) {
            result = result.filter(
                (item) =>
                    String(item.status).toLowerCase() ===
                    String(status).toLowerCase()
            );
        }

        if (search) {
            const query = search.toLowerCase();

            result = result.filter((item) => {
                return searchFields
                    .map((field) => item[field] ?? "")
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            });
        }

        return result;
    };

    const createCrud = ({
        key,
        entityType,
        prefix,
        normalize,
        searchFields
    }) => {
        const getAll = (options = {}) => {
            ensureSeedData();

            const items = read(key, [])
                .map(normalize);

            return filterItems(items, {
                ...options,
                searchFields
            });
        };

        const getById = (id) => {
            return getAll({ includeDeleted: true })
                .find((item) => item.id === id) || null;
        };

        const save = (input) => {
            ensureSeedData();

            const items = read(key, [])
                .map(normalize);

            const existingIndex = items.findIndex(
                (item) => item.id === input.id
            );

            if (existingIndex >= 0) {
                const oldValue = clone(items[existingIndex]);

                const updated = normalize({
                    ...items[existingIndex],
                    ...input,
                    updatedAt: nowIso()
                });

                items[existingIndex] = updated;
                write(key, items);

                addAudit({
                    action: "Update",
                    entityType,
                    entityId: updated.id,
                    oldValue,
                    newValue: updated
                });

                return updated;
            }

            const created = normalize({
                ...input,
                id: input.id || nextId(prefix)
            });

            items.unshift(created);
            write(key, items);

            addAudit({
                action: "Create",
                entityType,
                entityId: created.id,
                newValue: created
            });

            window.WusoolBehaviorService?.evaluateEntity?.(
                entityType,
                created
            );

            const triggerMap = {
                Organization: "organization.created",
                Ticket: "ticket.created"
            };

            if (triggerMap[entityType]) {
                window.WusoolBehaviorService?.triggerAutomation?.(
                    triggerMap[entityType],
                    {
                        entityType,
                        entity: created
                    }
                );
            }

            return created;
        };

        const softDelete = (id, reason = "") => {
            const items = read(key, [])
                .map(normalize);

            const index = items.findIndex(
                (item) => item.id === id
            );

            if (index < 0) {
                return false;
            }

            const oldValue = clone(items[index]);

            items[index].isDeleted = true;
            items[index].updatedAt = nowIso();

            write(key, items);

            addAudit({
                action: "Soft Delete",
                entityType,
                entityId: id,
                oldValue,
                newValue: items[index],
                reason
            });

            return true;
        };

        const restore = (id) => {
            const items = read(key, [])
                .map(normalize);

            const index = items.findIndex(
                (item) => item.id === id
            );

            if (index < 0) {
                return false;
            }

            const oldValue = clone(items[index]);

            items[index].isDeleted = false;
            items[index].updatedAt = nowIso();

            write(key, items);

            addAudit({
                action: "Restore",
                entityType,
                entityId: id,
                oldValue,
                newValue: items[index]
            });

            return true;
        };

        const setStatus = (id, status, reason = "") => {
            const item = getById(id);

            if (!item) {
                return null;
            }

            return save({
                ...item,
                status,
                notes:
                    reason ||
                    item.notes ||
                    item.adminNote ||
                    ""
            });
        };

        return {
            getAll,
            getById,
            save,
            softDelete,
            restore,
            setStatus
        };
    };

    const organizationsCrud = createCrud({
        key: KEYS.organizations,
        entityType: "Organization",
        prefix: "org",
        normalize: normalizeOrganization,
        searchFields: ["name", "email", "phone", "city", "type"]
    });

    const branchesCrud = createCrud({
        key: KEYS.branches,
        entityType: "Branch",
        prefix: "branch",
        normalize: normalizeBranch,
        searchFields: ["name", "city", "address", "phone", "status"]
    });

    const usersCrud = createCrud({
        key: KEYS.users,
        entityType: "User",
        prefix: "user",
        normalize: normalizeUser,
        searchFields: ["name", "email", "phone", "city", "role", "status"]
    });

    const ticketsCrud = createCrud({
        key: KEYS.tickets,
        entityType: "Ticket",
        prefix: "ticket",
        normalize: normalizeTicket,
        searchFields: ["subject", "description", "category", "priority", "status"]
    });

    const reviewsCrud = createCrud({
        key: KEYS.reviews,
        entityType: "Review",
        prefix: "review",
        normalize: normalizeReview,
        searchFields: ["title", "comment", "status"]
    });

    const subscriptionsCrud = createCrud({
        key: KEYS.subscriptions,
        entityType: "Subscription",
        prefix: "sub",
        normalize: normalizeSubscription,
        searchFields: ["plan", "status", "billingCycle"]
    });

    const getOrganizations = (options = {}) => {
        return organizationsCrud.getAll(options);
    };

    const getBranches = ({
        includeDeleted = false,
        status = "",
        search = "",
        organizationId = ""
    } = {}) => {
        let items = branchesCrud.getAll({
            includeDeleted,
            status,
            search
        });

        if (organizationId) {
            items = items.filter(
                (item) =>
                    item.organizationId === organizationId
            );
        }

        return items;
    };

    const getUsers = (options = {}) => {
        return usersCrud.getAll(options);
    };

    const getTickets = ({
        includeDeleted = false,
        status = "",
        search = "",
        priority = "",
        requesterId = "",
        organizationId = "",
        branchId = ""
    } = {}) => {
        let items = ticketsCrud.getAll({
            includeDeleted,
            status,
            search
        });

        if (priority) {
            items = items.filter(
                (item) =>
                    item.priority.toLowerCase() ===
                    priority.toLowerCase()
            );
        }

        if (requesterId) {
            items = items.filter(
                (item) =>
                    item.requesterId === requesterId
            );
        }

        if (organizationId) {
            items = items.filter(
                (item) =>
                    item.organizationId === organizationId
            );
        }

        if (branchId) {
            items = items.filter(
                (item) =>
                    item.branchId === branchId
            );
        }

        return items;
    };

    const getReviews = ({
        includeDeleted = false,
        status = "",
        search = "",
        userId = "",
        branchId = "",
        flagged = null
    } = {}) => {
        let items = reviewsCrud.getAll({
            includeDeleted,
            status,
            search
        });

        if (userId) {
            items = items.filter(
                (item) => item.userId === userId
            );
        }

        if (branchId) {
            items = items.filter(
                (item) => item.branchId === branchId
            );
        }

        if (flagged !== null) {
            items = items.filter(
                (item) => item.flagged === flagged
            );
        }

        return items;
    };

    const getSubscriptions = ({
        includeDeleted = false,
        status = "",
        search = "",
        organizationId = ""
    } = {}) => {
        let items = subscriptionsCrud.getAll({
            includeDeleted,
            status,
            search
        });

        if (organizationId) {
            items = items.filter(
                (item) =>
                    item.organizationId === organizationId
            );
        }

        return items;
    };

    const getDashboardSnapshot = () => {
        const organizations = getOrganizations();
        const branches = getBranches();
        const users = getUsers();
        const tickets = getTickets();
        const reviews = getReviews();
        const subscriptions = getSubscriptions();

        return {
            organizations: organizations.length,
            branches: branches.length,
            users: users.length,
            pendingBranches:
                branches.filter((item) =>
                    ["pending", "needs review"]
                        .includes(item.status.toLowerCase())
                ).length,
            openTickets:
                tickets.filter((item) =>
                    !["resolved", "closed"]
                        .includes(item.status.toLowerCase())
                ).length,
            flaggedReviews:
                reviews.filter((item) => item.flagged).length,
            activeSubscriptions:
                subscriptions.filter((item) =>
                    item.status.toLowerCase() === "active"
                ).length
        };
    };

    ensureSeedData();

    return {
        KEYS,

        getOrganizations,
        getOrganizationById: organizationsCrud.getById,
        saveOrganization: organizationsCrud.save,
        deleteOrganization: organizationsCrud.softDelete,
        restoreOrganization: organizationsCrud.restore,
        setOrganizationStatus: organizationsCrud.setStatus,

        getBranches,
        getBranchById: branchesCrud.getById,
        saveBranch: branchesCrud.save,
        deleteBranch: branchesCrud.softDelete,
        restoreBranch: branchesCrud.restore,
        setBranchStatus: branchesCrud.setStatus,

        getUsers,
        getUserById: usersCrud.getById,
        saveUser: usersCrud.save,
        deleteUser: usersCrud.softDelete,
        restoreUser: usersCrud.restore,
        setUserStatus: usersCrud.setStatus,

        getTickets,
        getTicketById: ticketsCrud.getById,
        saveTicket: ticketsCrud.save,
        deleteTicket: ticketsCrud.softDelete,
        restoreTicket: ticketsCrud.restore,
        setTicketStatus: ticketsCrud.setStatus,

        getReviews,
        getReviewById: reviewsCrud.getById,
        saveReview: reviewsCrud.save,
        deleteReview: reviewsCrud.softDelete,
        restoreReview: reviewsCrud.restore,
        setReviewStatus: reviewsCrud.setStatus,

        getSubscriptions,
        getSubscriptionById: subscriptionsCrud.getById,
        saveSubscription: subscriptionsCrud.save,
        deleteSubscription: subscriptionsCrud.softDelete,
        restoreSubscription: subscriptionsCrud.restore,
        setSubscriptionStatus: subscriptionsCrud.setStatus,

        getAuditLog: () => read(KEYS.audit, []),
        getDashboardSnapshot
    };
})();
