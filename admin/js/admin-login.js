
"use strict";

const loginForm = document.querySelector("form");
const passwordToggle = document.getElementById("togglePassword");
const passwordInput = document.getElementById("adminPassword");
const errorAlert = document.getElementById("loginError");

passwordToggle?.addEventListener("click", () => {
    const hidden = passwordInput.type === "password";
    passwordInput.type = hidden ? "text" : "password";
});

const recordFailedLogin = (email) => {
    const key = "wusoolFailedLogins";
    let items = [];

    try {
        items = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
        items = [];
    }

    items.unshift({
        email,
        time: new Date().toISOString()
    });

    localStorage.setItem(key, JSON.stringify(items.slice(0, 50)));
};

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

const email =
    document
        .getElementById("adminEmail")
        ?.value.trim() || "";

const password =
    document
        .getElementById("adminPassword")
        ?.value || "";

    if (!email || !password) {
        errorAlert?.classList.remove("d-none");

        if (errorAlert) {
            errorAlert.textContent = "Enter email and password.";
        }

        recordFailedLogin(email);
        return;
    }

    /*
        Frontend demo authentication:
        Any non-empty email/password opens Super Admin.
        ASP.NET Core later replaces this with:
        POST /api/auth/admin-login
        + server-side cookie/JWT authorization.
    */
    sessionStorage.setItem("wusoolAdminLoggedIn", "true");
    sessionStorage.setItem("wusoolAdminRole", "super-admin");
    sessionStorage.setItem(
        "wusoolAdminProfile",
        JSON.stringify({
            name: "System Admin",
            email,
            role: "super-admin"
        })
    );

    window.location.href = "./admin-dashboard.html";
});
