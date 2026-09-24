
"use strict";

const userSearch = document.getElementById("userImpersonationSearch");
const orgSearch = document.getElementById("orgImpersonationSearch");
const userList = document.getElementById("userImpersonationList");
const orgList = document.getElementById("orgImpersonationList");

const renderUsers = () => {
    const users = WusoolDataService.getUsers({
        search: userSearch.value.trim()
    });

    userList.innerHTML = users.map((user) => `
        <div class="admin-list-item">
            <span class="avatar-box">
                ${user.name.split(" ").map((x) => x[0]).join("").slice(0,2).toUpperCase()}
            </span>

            <div class="flex-grow-1">
                <strong class="d-block">${user.name}</strong>
                <small class="text-secondary">${user.email || user.id}</small>
            </div>

            <button class="btn btn-sm btn-outline-primary" data-view-user="${user.id}">
                View As
            </button>
        </div>
    `).join("");
};

const renderOrganizations = () => {
    const items = WusoolDataService.getOrganizations({
        search: orgSearch.value.trim()
    });

    orgList.innerHTML = items.map((item) => `
        <div class="admin-list-item">
            <span class="item-icon">
                <i class="bi bi-building"></i>
            </span>

            <div class="flex-grow-1">
                <strong class="d-block">${item.name}</strong>
                <small class="text-secondary">${item.type} · ${item.city}</small>
            </div>

            <button class="btn btn-sm btn-outline-primary" data-view-org="${item.id}">
                View As
            </button>
        </div>
    `).join("");
};

userList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view-user]");

    if (!button) {
        return;
    }

    const user = WusoolDataService.getUserById(button.dataset.viewUser);

    if (!user) {
        return;
    }

    WusoolBehaviorService.startImpersonation({
        type: "User",
        id: user.id,
        name: user.name,
        redirectUrl: "../../user/html/user-dashboard.html"
    });
});

orgList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view-org]");

    if (!button) {
        return;
    }

    const organization = WusoolDataService.getOrganizationById(button.dataset.viewOrg);

    if (!organization) {
        return;
    }

    WusoolBehaviorService.startImpersonation({
        type: "Organization",
        id: organization.id,
        name: organization.name,
        redirectUrl: "../../org/html/organization-dashboard.html"
    });
});

userSearch.addEventListener("input", renderUsers);
orgSearch.addEventListener("input", renderOrganizations);

renderUsers();
renderOrganizations();
