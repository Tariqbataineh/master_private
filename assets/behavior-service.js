'use strict';

/* =========================================
   Wusool Platform Behavior Service
   Rules + Automations + Workflows + Roles
========================================= */
WusoolUI.enqueue(async () => {
  window.WusoolBehaviorService = (() => {
    const KEYS = {
      rules: 'wusoolBusinessRules',
      automations: 'wusoolAutomations',
      workflows: 'wusoolWorkflows',
      roles: 'wusoolRolesPermissions',
      impersonation: 'wusoolImpersonationSession',
      notifications: 'wusoolNotifications',
      announcements: 'wusoolAnnouncements',
    };
    const read = async (key, fallback) => {
      try {
        return JSON.parse((await WusoolServices.rawRead(key)) || JSON.stringify(fallback));
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        return fallback;
      }
    };
    const write = async (key, value) => {
      await WusoolServices.rawWrite(key, JSON.stringify(value));
      return value;
    };
    const nowIso = () => new Date().toISOString();
    const defaultRules = [
      {
        id: 'rule-low-score',
        name: 'Low Accessibility Score',
        enabled: true,
        entity: 'Branch',
        field: 'accessibilityScore',
        operator: 'lessThan',
        value: 60,
        action: 'setStatus',
        actionValue: 'needs review',
      },
      {
        id: 'rule-critical-ticket',
        name: 'Critical Ticket Alert',
        enabled: true,
        entity: 'Ticket',
        field: 'priority',
        operator: 'equals',
        value: 'High',
        action: 'notifyAdmin',
        actionValue: 'High priority support ticket created.',
      },
    ];
    const defaultAutomations = [
      {
        id: 'auto-org-register',
        name: 'Organization Registration Alert',
        enabled: true,
        trigger: 'organization.created',
        action: 'notifyAdmin',
        message: 'A new organization was created.',
      },
      {
        id: 'auto-branch-review',
        name: 'Branch Review Alert',
        enabled: true,
        trigger: 'branch.status.pending',
        action: 'notifyAdmin',
        message: 'A branch is waiting for review.',
      },
    ];
    const defaultWorkflows = {
      branchApproval: {
        id: 'branchApproval',
        name: 'Branch Approval',
        entity: 'Branch',
        stages: ['Draft', 'AI Review', 'Submitted', 'Admin Review', 'Approved'],
      },
      organizationApproval: {
        id: 'organizationApproval',
        name: 'Organization Approval',
        entity: 'Organization',
        stages: ['Registration', 'Pending Review', 'Approved'],
      },
    };
    const defaultRoles = [
      {
        id: 'super-admin',
        name: 'Super Admin',
        permissions: ['*'],
      },
      {
        id: 'reviewer',
        name: 'Reviewer',
        permissions: [
          'branches.view',
          'branches.edit',
          'branches.approve',
          'reviews.view',
          'reviews.moderate',
          'ai.view',
          'ai.override',
        ],
      },
      {
        id: 'support-admin',
        name: 'Support Admin',
        permissions: [
          'users.view',
          'tickets.view',
          'tickets.edit',
          'tickets.assign',
          'tickets.resolve',
        ],
      },
      {
        id: 'content-manager',
        name: 'Content Manager',
        permissions: [
          'content.view',
          'content.edit',
          'content.publish',
          'media.manage',
          'theme.edit',
        ],
      },
    ];
    const getRules = async () => {
      const rules = await read(KEYS.rules, null);
      if (Array.isArray(rules)) {
        return rules;
      }
      await write(KEYS.rules, defaultRules);
      return structuredClone(defaultRules);
    };
    const saveRules = async (rules) => await write(KEYS.rules, rules);
    const getAutomations = async () => {
      const items = await read(KEYS.automations, null);
      if (Array.isArray(items)) {
        return items;
      }
      await write(KEYS.automations, defaultAutomations);
      return structuredClone(defaultAutomations);
    };
    const saveAutomations = async (items) => await write(KEYS.automations, items);
    const getWorkflows = async () => {
      const data = await read(KEYS.workflows, null);
      if (data && typeof data === 'object') {
        return data;
      }
      await write(KEYS.workflows, defaultWorkflows);
      return structuredClone(defaultWorkflows);
    };
    const saveWorkflows = async (data) => await write(KEYS.workflows, data);
    const getRoles = async () => {
      const roles = await read(KEYS.roles, null);
      if (Array.isArray(roles)) {
        return roles;
      }
      await write(KEYS.roles, defaultRoles);
      return structuredClone(defaultRoles);
    };
    const saveRoles = async (roles) => await write(KEYS.roles, roles);
    const getNotifications = async () => await read(KEYS.notifications, []);
    const pushNotification = async ({ title, message, type = 'info', target = 'admin' }) => {
      const notifications = await getNotifications();
      notifications.unshift({
        id: `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title,
        message,
        type,
        target,
        read: false,
        createdAt: nowIso(),
      });
      await write(KEYS.notifications, notifications.slice(0, 100));
    };
    const compare = (actual, operator, expected) => {
      if (operator === 'equals') {
        return String(actual).toLowerCase() === String(expected).toLowerCase();
      }
      if (operator === 'notEquals') {
        return String(actual).toLowerCase() !== String(expected).toLowerCase();
      }
      if (operator === 'lessThan') {
        return Number(actual) < Number(expected);
      }
      if (operator === 'greaterThan') {
        return Number(actual) > Number(expected);
      }
      if (operator === 'contains') {
        return String(actual).toLowerCase().includes(String(expected).toLowerCase());
      }
      return false;
    };
    const executeRuleAction = async (rule, entity) => {
      if (rule.action === 'setStatus') {
        if (rule.entity === 'Branch') {
          await window.WusoolDataService?.setBranchStatus(entity.id, rule.actionValue);
        }
        if (rule.entity === 'Organization') {
          await window.WusoolDataService?.setOrganizationStatus(entity.id, rule.actionValue);
        }
        if (rule.entity === 'Ticket') {
          await window.WusoolDataService?.setTicketStatus(entity.id, rule.actionValue);
        }
        return;
      }
      if (rule.action === 'notifyAdmin') {
        await pushNotification({
          title: rule.name,
          message: rule.actionValue || `Rule matched for ${rule.entity} ${entity.id}`,
          type: 'warning',
        });
      }
    };
    const evaluateEntity = async (entityType, entity) => {
      await WusoolUI.each(
        (await getRules()).filter((rule) => rule.enabled && rule.entity === entityType),
        async (rule) => {
          if (compare(entity[rule.field], rule.operator, rule.value)) {
            await executeRuleAction(rule, entity);
          }
        },
      );
    };
    const triggerAutomation = async (trigger, context = {}) => {
      let performed = 0;
      await WusoolUI.each(
        (await getAutomations()).filter((item) => item.enabled && item.trigger === trigger),
        async (item) => {
          if (item.action === 'notifyAdmin') {
            await pushNotification({
              title: item.name,
              message: item.message || `Automation triggered: ${trigger}`,
              type: 'info',
            });
            performed++;
          }
          if (item.action === 'setStatus') {
            const entity = context.entity;
            if (!entity) {
              return;
            }
            if (context.entityType === 'Branch') {
              await window.WusoolDataService.setBranchStatus(entity.id, item.actionValue);
              performed++;
            }
            if (context.entityType === 'Organization') {
              await window.WusoolDataService.setOrganizationStatus(entity.id, item.actionValue);
              performed++;
            }
          }
        },
      );
      return { performed, trigger, execution: 'frontend-trigger' };
    };
    const startImpersonation = async (input) =>
      await WusoolServices.external('admin/impersonation', input);
    const stopImpersonation = async () => {
      await WusoolServices.rawRemove(KEYS.impersonation);
    };
    const getImpersonation = async () => {
      try {
        return JSON.parse((await WusoolServices.rawRead(KEYS.impersonation)) || 'null');
      } catch (error) {
        if (WusoolServices.mode === 'api') throw error;
        return null;
      }
    };
    const hasPermission = async (roleId, permission) => {
      const role = (await getRoles()).find((item) => item.id === roleId);
      if (!role) {
        return false;
      }
      return role.permissions.includes('*') || role.permissions.includes(permission);
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
      getImpersonation,
    };
  })();
});
