
"use strict";

let roles = WusoolBehaviorService.getRoles();
let selectedRoleId = roles[0]?.id || null;

const permissions = [
    ["users.view", "View Users"],
    ["users.edit", "Edit Users"],
    ["branches.view", "View Branches"],
    ["branches.edit", "Edit Branches"],
    ["branches.approve", "Approve Branches"],
    ["tickets.view", "View Tickets"],
    ["tickets.edit", "Edit Tickets"],
    ["tickets.resolve", "Resolve Tickets"],
    ["reviews.view", "View Reviews"],
    ["reviews.moderate", "Moderate Reviews"],
    ["content.view", "View Content"],
    ["content.edit", "Edit Content"],
    ["content.publish", "Publish Content"],
    ["media.manage", "Manage Media"],
    ["theme.edit", "Edit Theme"],
    ["ai.view", "View AI"],
    ["ai.override", "Override AI"],
    ["system.settings", "System Settings"]
];

const rolesList = document.getElementById("rolesList");
const grid = document.getElementById("permissionsGrid");
const title = document.getElementById("selectedRoleTitle");

const selectedRole = () =>
    roles.find((item) => item.id === selectedRoleId);

const renderRoles = () => {
    rolesList.innerHTML = roles.map((role) => `
        <button
            type="button"
            class="btn ${role.id === selectedRoleId ? "btn-wusool" : "btn-outline-secondary"} w-100 mb-2 text-start"
            data-role="${role.id}"
        >
            ${role.name}
        </button>
    `).join("");
};

const renderPermissions = () => {
    const role = selectedRole();

    if (!role) {
        return;
    }

    title.textContent = role.name;

    if (role.permissions.includes("*")) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-success mb-0">
                    This role has full platform access.
                </div>
            </div>
        `;

        return;
    }

    grid.innerHTML = permissions.map(([permission, label]) => `
        <div class="col-12 col-md-6">
            <label class="border rounded-3 p-3 d-flex justify-content-between align-items-center h-100">
                <span>
                    <strong class="d-block">${label}</strong>
                    <small class="text-secondary">${permission}</small>
                </span>

                <input
                    class="form-check-input"
                    type="checkbox"
                    data-permission-key="${permission}"
                    ${role.permissions.includes(permission) ? "checked" : ""}
                >
            </label>
        </div>
    `).join("");
};

rolesList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-role]");

    if (!button) {
        return;
    }

    selectedRoleId = button.dataset.role;
    renderRoles();
    renderPermissions();
});

grid.addEventListener("change", (event) => {
    const permission = event.target.dataset.permissionKey;

    if (!permission) {
        return;
    }

    const role = selectedRole();

    if (event.target.checked) {
        if (!role.permissions.includes(permission)) {
            role.permissions.push(permission);
        }
    } else {
        role.permissions =
            role.permissions.filter((item) => item !== permission);
    }
});

document.getElementById("addRoleButton").addEventListener("click", () => {
    const name = document.getElementById("newRoleName").value.trim();

    if (!name) {
        WusoolAdmin.toast("Enter a role name.", "warning");
        return;
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    roles.push({
        id,
        name,
        permissions: []
    });

    selectedRoleId = id;
    document.getElementById("newRoleName").value = "";

    renderRoles();
    renderPermissions();
});

document.getElementById("saveRolesButton").addEventListener("click", () => {
    WusoolVersionService.createVersion({
        area: "Roles & Permissions",
        description: "Permission matrix updated"
    });

    WusoolBehaviorService.saveRoles(roles);
    WusoolAdmin.toast("Permissions saved.");
});

renderRoles();
renderPermissions();
