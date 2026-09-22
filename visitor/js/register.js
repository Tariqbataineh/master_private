document.addEventListener("DOMContentLoaded", () => {
  initializeAccountTypes();

  initializePasswordToggle("password", "togglePassword", "passwordIcon");

  initializePasswordToggle(
    "confirmPassword",
    "toggleConfirmPassword",
    "confirmPasswordIcon",
  );

  initializePasswordStrength();
  initializePhoneInput();
  initializeRegisterForm();
});

const initializeAccountTypes = () => {
  const accountInputs = document.querySelectorAll('input[name="accountType"]');

  accountInputs.forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelectorAll(".account-type-card").forEach((card) => {
        card.classList.remove("active");
      });

      input.closest(".account-type-card").classList.add("active");
    });
  });
};

const initializePasswordToggle = (inputId, buttonId, iconId) => {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  const icon = document.getElementById(iconId);

  if (!input || !button || !icon) {
    return;
  }

  button.addEventListener("click", () => {
    const passwordIsHidden = input.type === "password";

    input.type = passwordIsHidden ? "text" : "password";

    icon.className = passwordIsHidden ? "bi bi-eye-slash" : "bi bi-eye";

    button.setAttribute(
      "aria-label",
      passwordIsHidden ? "Hide password" : "Show password",
    );
  });
};

const initializePhoneInput = () => {
  const phoneInput = document.getElementById("phoneNumber");

  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "");
  });
};

const initializePasswordStrength = () => {
  const passwordInput = document.getElementById("password");

  passwordInput.addEventListener("input", () => {
    updatePasswordStrength(passwordInput.value);
  });
};

const updatePasswordStrength = (password) => {
  const strengthBar = document.getElementById("strengthBar");

  const strengthText = document.getElementById("strengthText");

  let strength = 0;

  if (password.length >= 8) {
    strength++;
  }

  if (/[A-Z]/.test(password)) {
    strength++;
  }

  if (/[0-9]/.test(password)) {
    strength++;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    strength++;
  }

  const strengthSettings = [
    {
      width: "0%",
      text: "Not entered",
      className: "",
    },
    {
      width: "25%",
      text: "Weak",
      className: "bg-danger",
    },
    {
      width: "50%",
      text: "Fair",
      className: "bg-warning",
    },
    {
      width: "75%",
      text: "Good",
      className: "bg-info",
    },
    {
      width: "100%",
      text: "Strong",
      className: "bg-success",
    },
  ];

  const setting = strengthSettings[strength];

  strengthBar.style.width = setting.width;

  strengthBar.className = `progress-bar ${setting.className}`;

  strengthText.textContent = setting.text;
};

const initializeRegisterForm = () => {
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    clearFormErrors();

    const formData = getFormData();
    const validation = validateForm(formData);

    if (!validation.isValid) {
      showAlert("Please check the required fields.", "danger");

      return;
    }

    if (formData.accountType === "organization") {
      showAlert(
        "Organization registration page will be available soon.",
        "info",
      );

      return;
    }

    simulateRegistration(formData);
  });
};

const getFormData = () => {
  return {
    accountType: document.querySelector('input[name="accountType"]:checked')
      .value,

    fullName: document.getElementById("fullName").value.trim(),

    phoneNumber: document.getElementById("phoneNumber").value.trim(),

    email: document.getElementById("email").value.trim(),

    password: document.getElementById("password").value,

    confirmPassword: document.getElementById("confirmPassword").value,

    terms: document.getElementById("terms").checked,
  };
};

const validateForm = (formData) => {
  let isValid = true;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const phonePattern = /^07\d{8}$/;

  const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (formData.fullName.length < 3) {
    showFieldError("fullName", "fullNameError");

    isValid = false;
  }

  if (!phonePattern.test(formData.phoneNumber)) {
    showFieldError("phoneNumber", "phoneError");

    isValid = false;
  }

  if (!emailPattern.test(formData.email)) {
    showFieldError("email", "emailError");

    isValid = false;
  }

  if (!passwordPattern.test(formData.password)) {
    showFieldError("password", "passwordError");

    isValid = false;
  }

  if (formData.confirmPassword !== formData.password) {
    showFieldError("confirmPassword", "confirmPasswordError");

    isValid = false;
  }

  if (!formData.terms) {
    document.getElementById("terms").classList.add("is-invalid");

    document.getElementById("termsError").classList.add("show");

    isValid = false;
  }

  return {
    isValid,
  };
};

const showFieldError = (inputId, errorId) => {
  document.getElementById(inputId).classList.add("is-invalid");

  document.getElementById(errorId).classList.add("show");
};

const clearFormErrors = () => {
  document.querySelectorAll(".is-invalid").forEach((element) => {
    element.classList.remove("is-invalid");
  });

  document.querySelectorAll(".invalid-feedback").forEach((element) => {
    element.classList.remove("show");
  });
};

const simulateRegistration = (formData) => {
  setLoadingState(true);

  setTimeout(() => {
    const demoUser = {
      id: Date.now(),
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      role: "User",
    };

    localStorage.setItem("wusoolRegisteredUser", JSON.stringify(demoUser));

    showAlert(
      "Account created successfully! Redirecting to login...",
      "success",
    );

    setLoadingState(false);

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1300);
  }, 900);
};

const setLoadingState = (isLoading) => {
  const registerButton = document.getElementById("registerButton");

  const buttonText = document.getElementById("registerButtonText");

  const spinner = document.getElementById("registerSpinner");

  registerButton.disabled = isLoading;

  buttonText.textContent = isLoading ? "Creating account..." : "Create Account";

  spinner.classList.toggle("d-none", !isLoading);
};

const showAlert = (message, type) => {
  const registerAlert = document.getElementById("registerAlert");

  registerAlert.textContent = message;

  registerAlert.className = `alert alert-${type}`;

  registerAlert.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};
