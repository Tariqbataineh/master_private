document.addEventListener("DOMContentLoaded", () => {
  initializePasswordToggle();
  initializeLoginForm();
  initializeForgotPassword();
  loadRememberedEmail();
});

const initializePasswordToggle = () => {
  const passwordInput = document.getElementById("password");

  const toggleButton = document.getElementById("togglePassword");

  const passwordIcon = document.getElementById("passwordIcon");

  if (!passwordInput || !toggleButton || !passwordIcon) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const passwordIsHidden = passwordInput.type === "password";

    passwordInput.type = passwordIsHidden ? "text" : "password";

    passwordIcon.className = passwordIsHidden ? "bi bi-eye-slash" : "bi bi-eye";

    toggleButton.setAttribute(
      "aria-label",
      passwordIsHidden ? "Hide password" : "Show password",
    );
  });
};

const initializeLoginForm = () => {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    return;
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    clearErrors();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const rememberMe = document.getElementById("rememberMe").checked;

    const emailIsValid = validateEmail(email);
    const passwordIsValid = password.length >= 6;

    if (!emailIsValid) {
      showFieldError("email", "emailError");
    }

    if (!passwordIsValid) {
      showFieldError("password", "passwordError");
    }

    if (!emailIsValid || !passwordIsValid) {
      showAlert("Please check the required fields.", "danger");

      return;
    }

    saveRememberedEmail(email, rememberMe);
    simulateLogin(email);
  });
};

const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
};

const showFieldError = (inputId, errorId) => {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  input.classList.add("is-invalid");
  error.classList.add("show");
};

const clearErrors = () => {
  document.querySelectorAll(".is-invalid").forEach((element) => {
    element.classList.remove("is-invalid");
  });

  document.querySelectorAll(".invalid-feedback").forEach((element) => {
    element.classList.remove("show");
  });
};

const simulateLogin = (email) => {
  setLoadingState(true);

  setTimeout(() => {
    const registeredUser = getRegisteredUser(email);

    const demoUser = {
      id: registeredUser?.id || 1,
      name: registeredUser?.fullName || createNameFromEmail(email),
      email: email,
      role: "User",
    };

    sessionStorage.setItem("wusoolDemoUser", JSON.stringify(demoUser));
    localStorage.setItem("wusool-user-name", demoUser.name);

    showAlert("Login successful! Redirecting to your dashboard...", "success");

    setLoadingState(false);

    setTimeout(() => {
      window.location.href = "../../user/html/user-dashboard.html";
    }, 1200);
  }, 900);
};

const getRegisteredUser = (email) => {
  try {
    const registeredUser = JSON.parse(
      localStorage.getItem("wusoolRegisteredUser"),
    );

    if (registeredUser?.email?.toLowerCase() === email.toLowerCase()) {
      return registeredUser;
    }

    return null;
  } catch (error) {
    return null;
  }
};

const createNameFromEmail = (email) => {
  const emailName = email.split("@")[0].replace(/[._-]+/g, " ");

  return emailName
    .split(" ")
    .filter(Boolean)
    .map((namePart) => {
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    })
    .join(" ") || "Wusool User";
};

const setLoadingState = (isLoading) => {
  const loginButton = document.getElementById("loginButton");

  const buttonText = document.getElementById("loginButtonText");

  const spinner = document.getElementById("loginSpinner");

  loginButton.disabled = isLoading;

  buttonText.textContent = isLoading ? "Signing in..." : "Log in";

  spinner.classList.toggle("d-none", !isLoading);
};

const showAlert = (message, type) => {
  const loginAlert = document.getElementById("loginAlert");

  loginAlert.textContent = message;
  loginAlert.className = `alert alert-${type}`;
};

const saveRememberedEmail = (email, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem("wusoolRememberedEmail", email);

    return;
  }

  localStorage.removeItem("wusoolRememberedEmail");
};

const loadRememberedEmail = () => {
  const savedEmail = localStorage.getItem("wusoolRememberedEmail");

  if (!savedEmail) {
    return;
  }

  document.getElementById("email").value = savedEmail;

  document.getElementById("rememberMe").checked = true;
};

const initializeForgotPassword = () => {
  const forgotButton = document.getElementById("forgotPasswordButton");

  const modalElement = document.getElementById("forgotPasswordModal");

  const sendResetButton = document.getElementById("sendResetButton");

  const resetEmail = document.getElementById("resetEmail");

  const resetMessage = document.getElementById("resetMessage");

  if (!forgotButton || !modalElement || !sendResetButton) {
    return;
  }

  const forgotPasswordModal = new bootstrap.Modal(modalElement);

  forgotButton.addEventListener("click", () => {
    const loginEmail = document.getElementById("email").value.trim();

    resetEmail.value = loginEmail;
    resetMessage.classList.add("d-none");

    forgotPasswordModal.show();
  });

  sendResetButton.addEventListener("click", () => {
    const email = resetEmail.value.trim();

    if (!validateEmail(email)) {
      resetEmail.classList.add("is-invalid");
      return;
    }

    resetEmail.classList.remove("is-invalid");
    resetMessage.classList.remove("d-none");

    sendResetButton.disabled = true;

    setTimeout(() => {
      sendResetButton.disabled = false;
    }, 1500);
  });
};
