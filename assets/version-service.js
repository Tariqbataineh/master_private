
"use strict";

/* =========================================
   Wusool Draft / Publish / Version Service
========================================= */

window.WusoolVersionService = (() => {
    const VERSION_KEY = "wusoolPlatformVersions";
    const DRAFT_KEY = "wusoolPlatformDrafts";

    const TRACKED_KEYS = [
        "wusoolPlatformTheme",
        "wusoolPageOverrides",
        "wusoolPageInsertions",
        "wusoolSectionOrders",
        "wusoolNavigationConfig",
        "wusoolAnnouncements",
        "wusoolFeatureFlags",
        "wusoolDynamicFormSchemas",
        "wusoolAccessibilityRequirements",
        "wusoolMediaLibrary"
    ];

    const readJson = (key, fallback) => {
        try {
            return JSON.parse(
                localStorage.getItem(key) || JSON.stringify(fallback)
            );
        } catch {
            return fallback;
        }
    };

    const writeJson = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const snapshot = () => {
        const data = {};

        TRACKED_KEYS.forEach((key) => {
            data[key] = readJson(key, null);
        });

        return data;
    };

    const createVersion = ({
        area = "Platform",
        description = "Published changes",
        actor = "System Admin"
    } = {}) => {
        const versions = readJson(VERSION_KEY, []);

        const version = {
            id: `version-${Date.now()}`,
            area,
            description,
            actor,
            createdAt: new Date().toISOString(),
            snapshot: snapshot()
        };

        versions.unshift(version);

        /*
            Keep the frontend demo reasonably small.
            Backend later stores complete version history.
        */
        writeJson(
            VERSION_KEY,
            versions.slice(0, 30)
        );

        return version;
    };

    const getVersions = () => {
        return readJson(VERSION_KEY, []);
    };

    const restoreVersion = (versionId) => {
        const version =
            getVersions()
                .find((item) => item.id === versionId);

        if (!version) {
            return false;
        }

        createVersion({
            area: "System",
            description:
                `Automatic backup before restoring ${versionId}`
        });

        Object.entries(version.snapshot || {})
            .forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    localStorage.removeItem(key);
                } else {
                    writeJson(key, value);
                }
            });

        return true;
    };

    const deleteVersion = (versionId) => {
        const versions =
            getVersions()
                .filter((item) => item.id !== versionId);

        writeJson(VERSION_KEY, versions);
    };

    const saveDraft = (draftId, data) => {
        const drafts = readJson(DRAFT_KEY, {});

        drafts[draftId] = {
            data,
            updatedAt: new Date().toISOString()
        };

        writeJson(DRAFT_KEY, drafts);

        return drafts[draftId];
    };

    const getDraft = (draftId) => {
        return readJson(DRAFT_KEY, {})[draftId] || null;
    };

    const removeDraft = (draftId) => {
        const drafts = readJson(DRAFT_KEY, {});
        delete drafts[draftId];
        writeJson(DRAFT_KEY, drafts);
    };

    return {
        VERSION_KEY,
        DRAFT_KEY,
        TRACKED_KEYS,
        snapshot,
        createVersion,
        getVersions,
        restoreVersion,
        deleteVersion,
        saveDraft,
        getDraft,
        removeDraft
    };
})();
