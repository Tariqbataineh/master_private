WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(() => {
    initializeAccountTypes();
    initializePasswordToggle('password', 'togglePassword', 'passwordIcon');
    initializePasswordToggle('confirmPassword', 'toggleConfirmPassword', 'confirmPasswordIcon');
    initializePasswordStrength();
    initializePhoneInput();
    initializeRegisterForm();
  });
  const initializeAccountTypes = () => {
    const accountInputs = document.querySelectorAll('input[name="accountType"]');
    accountInputs.forEach((input) => {
      WusoolUI.listen(input, 'change', () => {
        document.querySelectorAll('.account-type-card').forEach((card) => {
          card.classList.remove('active');
        });
        input.closest('.account-type-card').classList.add('active');
        if (input.value === 'organization')
          location.href = '../../org/html/organization-register.html';
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
    WusoolUI.listen(button, 'click', () => {
      const passwordIsHidden = input.type === 'password';
      input.type = passwordIsHidden ? 'text' : 'password';
      icon.className = passwordIsHidden ? 'bi bi-eye-slash' : 'bi bi-eye';
      button.setAttribute('aria-label', passwordIsHidden ? 'Hide password' : 'Show password');
    });
  };
  const initializePhoneInput = () => {
    const phoneInput = document.getElementById('phoneNumber');
    WusoolUI.listen(phoneInput, 'input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '');
    });
  };
  const initializePasswordStrength = () => {}; // Shared feedback owns this UI.
  const initializeRegisterForm = () => {
    const registerForm = document.getElementById('registerForm');
    WusoolUI.listen(registerForm, 'submit', async (event) => {
      event.preventDefault();
      clearFormErrors();
      const formData = getFormData();
      const validation = validateForm(formData);
      if (!validation.isValid) {
        showAlert('Please check the required fields.', 'danger');
        return;
      }
      if (formData.accountType === 'organization') {
        location.href = '../../org/html/organization-register.html';
        showAlert('Continue to organization registration.', 'info');
        return;
      }
      await submitRegistration(formData);
    });
  };
  const getFormData = () => {
    return {
      accountType: document.querySelector('input[name="accountType"]:checked').value,
      fullName: document.getElementById('fullName').value.trim(),
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value,
      terms: document.getElementById('terms').checked,
    };
  };
  const validateForm = (formData) => {
    let isValid = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^07\d{8}$/;
    const passwordPattern = {
      test: (value) => WusoolPasswordPolicy.accepts(value, 'userRegistration'),
    };
    if (formData.fullName.length < 3) {
      showFieldError('fullName', 'fullNameError');
      isValid = false;
    }
    if (!phonePattern.test(formData.phoneNumber)) {
      showFieldError('phoneNumber', 'phoneError');
      isValid = false;
    }
    if (!emailPattern.test(formData.email)) {
      showFieldError('email', 'emailError');
      isValid = false;
    }
    if (!passwordPattern.test(formData.password)) {
      showFieldError('password', 'passwordError');
      isValid = false;
    }
    if (formData.confirmPassword !== formData.password) {
      showFieldError('confirmPassword', 'confirmPasswordError');
      isValid = false;
    }
    if (!formData.terms) {
      document.getElementById('terms').classList.add('is-invalid');
      document.getElementById('termsError').classList.add('show');
      isValid = false;
    }
    return {
      isValid,
    };
  };
  const showFieldError = (inputId, errorId) => {
    document.getElementById(inputId).classList.add('is-invalid');
    document.getElementById(errorId).classList.add('show');
  };
  const clearFormErrors = () => {
    document.querySelectorAll('.is-invalid').forEach((element) => {
      element.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach((element) => {
      element.classList.remove('show');
    });
  };
  const submitRegistration = async (formData) => {
    setLoadingState(true);
    try {
      await WusoolServices.register(
        {
          ...formData,
          name: formData.fullName,
          phone: formData.phoneNumber,
        },
        'User',
      );
      location.href = './login.html';
    } catch (error) {
      if (WusoolServices.mode === 'api') throw error;
      showAlert(error.message, 'danger');
    } finally {
      setLoadingState(false);
    }
  };
  const setLoadingState = (isLoading) => {
    const registerButton = document.getElementById('registerButton');
    const buttonText = document.getElementById('registerButtonText');
    const spinner = document.getElementById('registerSpinner');
    registerButton.disabled = isLoading;
    buttonText.textContent = isLoading ? 'Creating account...' : 'Create Account';
    spinner.classList.toggle('d-none', !isLoading);
  };
  const showAlert = (message, type) => {
    const registerAlert = document.getElementById('registerAlert');
    registerAlert.textContent = message;
    registerAlert.className = `alert alert-${type}`;
    registerAlert.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };
});
