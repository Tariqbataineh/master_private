'use strict';

/* =========================================
   Wusool Draft / Publish / Version Service
========================================= */
WusoolUI.enqueue(async () => {
  window.WusoolVersionService = (() => {
    const VERSION_KEY = 'wusoolPlatformVersions';
    const DRAFT_KEY = 'wusoolPlatformDrafts';
    const TRACKED_KEYS = [
      'wusoolPlatformTheme',
      'wusoolPageOverrides',
      'wusoolPageInsertions',
      'wusoolSectionOrders',
      'wusoolNavigationConfig',
      'wusoolAnnouncements',
      'wusoolFeatureFlags',
      'wusoolDynamicFormSchemas',
      'wusoolAccessibilityRequirements',
      'wusoolMediaLibrary',
    ];
    const readJson = async (key, fallback) => {
      try {
        return JSON.parse((await WusoolServices.rawRead(key)) || JSON.stringify(fallback));
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        return fallback;
      }
    };
    const writeJson = async (key, value) => {
      await WusoolServices.rawWrite(key, JSON.stringify(value));
    };
    const snapshot = async () => {
      const data = {};
      await WusoolUI.each(TRACKED_KEYS, async (key) => {
        data[key] = await readJson(key, null);
      });
      return data;
    };
    const createVersion = async ({
      area = 'Platform',
      description = 'Published changes',
      actor = 'System Admin',
    } = {}) => {
      const versions = await readJson(VERSION_KEY, []);
      const version = {
        id: `version-${Date.now()}`,
        area,
        description,
        actor: (await WusoolServices.getCurrentAccount())?.name || 'Unknown account',
        actorId: (await WusoolServices.getCurrentAccount())?.id || null,
        createdAt: new Date().toISOString(),
        snapshot: await snapshot(),
      };
      versions.unshift(version);

      /*
          Keep the frontend demo reasonably small.
          Backend later stores complete version history.
      */
      await writeJson(VERSION_KEY, versions.slice(0, 30));
      return version;
    };
    const getVersions = async () => {
      return await readJson(VERSION_KEY, []);
    };
    const restoreVersion = async (versionId) => {
      const version = (await getVersions()).find((item) => item.id === versionId);
      if (!version) {
        return false;
      }
      await createVersion({
        area: 'System',
        description: `Automatic backup before restoring ${versionId}`,
      });
      await WusoolUI.each(Object.entries(version.snapshot || {}), async ([key, value]) => {
        if (value === null || value === undefined) {
          await WusoolServices.rawRemove(key);
        } else {
          await writeJson(key, value);
        }
      });
      return true;
    };
    const deleteVersion = async (versionId) => {
      const versions = (await getVersions()).filter((item) => item.id !== versionId);
      await writeJson(VERSION_KEY, versions);
    };
    const saveDraft = async (draftId, data) => {
      const drafts = await readJson(DRAFT_KEY, {});
      drafts[draftId] = {
        data,
        updatedAt: new Date().toISOString(),
      };
      await writeJson(DRAFT_KEY, drafts);
      return drafts[draftId];
    };
    const getDraft = async (draftId) => {
      return (await readJson(DRAFT_KEY, {}))[draftId] || null;
    };
    const removeDraft = async (draftId) => {
      const drafts = await readJson(DRAFT_KEY, {});
      delete drafts[draftId];
      await writeJson(DRAFT_KEY, drafts);
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
      removeDraft,
    };
  })();
});
