document.addEventListener("DOMContentLoaded", () => {
    const resetFormSection =
        document.getElementById(
            "resetFormSection"
        );

    const invalidRequestSection =
        document.getElementById(
            "invalidRequestSection"
        );

    const invalidRequestMessage =
        document.getElementById(
            "invalidRequestMessage"
        );

    const successSection =
        document.getElementById(
            "successSection"
        );

    const resetPasswordForm =
        document.getElementById(
            "resetPasswordForm"
        );

    const organizationEmail =
        document.getElementById(
            "organizationEmail"
        );

    const newPassword =
        document.getElementById(
            "newPassword"
        );

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );

    const confirmPasswordFeedback =
        document.getElementById(
            "confirmPasswordFeedback"
        );

    const toggleNewPasswordButton =
        document.getElementById(
            "toggleNewPasswordButton"
        );

    const toggleConfirmPasswordButton =
        document.getElementById(
            "toggleConfirmPasswordButton"
        );

    const newPasswordIcon =
        document.getElementById(
            "newPasswordIcon"
        );

    const confirmPasswordIcon =
        document.getElementById(
            "confirmPasswordIcon"
        );

    const passwordStrengthBar =
        document.getElementById(
            "passwordStrengthBar"
        );

    const passwordStrengthText =
        document.getElementById(
            "passwordStrengthText"
        );

    const resetAlert =
        document.getElementById(
            "resetAlert"
        );

    const resetButton =
        document.getElementById(
            "resetButton"
        );

    const resetButtonText =
        document.getElementById(
            "resetButtonText"
        );

    const resetButtonIcon =
        document.getElementById(
            "resetButtonIcon"
        );

    const resetSpinner =
        document.getElementById(
            "resetSpinner"
        );

    const passwordRules = {
        length:
            document.getElementById(
                "lengthRule"
            ),

        uppercase:
            document.getElementById(
                "uppercaseRule"
            ),

        lowercase:
            document.getElementById(
                "lowercaseRule"
            ),

        number:
            document.getElementById(
                "numberRule"
            ),

        special:
            document.getElementById(
                "specialRule"
            )
    };

    const resetRequestStorageKey =
        "wusoolOrganizationResetRequest";

    const passwordStorageKey =
        "wusoolOrganizationDemoPassword";

    let resetRequest =
        null;

    validateResetRequest();

    newPassword.addEventListener(
        "input",
        () => {
            updatePasswordRules();
            updatePasswordStrength();
            validatePasswordMatch();
        }
    );

    confirmPassword.addEventListener(
        "input",
        () => {
            validatePasswordMatch();
        }
    );

    toggleNewPasswordButton.addEventListener(
        "click",
        () => {
            togglePasswordVisibility(
                newPassword,
                newPasswordIcon,
                toggleNewPasswordButton
            );
        }
    );

    toggleConfirmPasswordButton.addEventListener(
        "click",
        () => {
            togglePasswordVisibility(
                confirmPassword,
                confirmPasswordIcon,
                toggleConfirmPasswordButton
            );
        }
    );

    resetPasswordForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            hideAlert();

            const passwordIsStrong =
                isPasswordStrong(
                    newPassword.value
                );

            const passwordsMatch =
                validatePasswordMatch();

            if (
                !resetPasswordForm.checkValidity() ||
                !passwordIsStrong ||
                !passwordsMatch
            ) {
                resetPasswordForm.classList.add(
                    "was-validated"
                );

                if (!passwordIsStrong) {
                    showAlert(
                        "Your password must meet all security requirements.",
                        "danger"
                    );
                }

                return;
            }

            resetPasswordForm.classList.remove(
                "was-validated"
            );

            resetOrganizationPassword();
        }
    );

    function validateResetRequest() {
        const savedRequest =
            sessionStorage.getItem(
                resetRequestStorageKey
            );

        if (!savedRequest) {
            showInvalidRequest(
                "No password reset request was found. Please request a new reset link."
            );

            return;
        }

        try {
            resetRequest =
                JSON.parse(
                    savedRequest
                );
        } catch (error) {
            showInvalidRequest(
                "The password reset request is invalid."
            );

            return;
        }

        if (resetRequest.used) {
            showInvalidRequest(
                "This password reset link has already been used."
            );

            return;
        }

        const currentTime =
            new Date().getTime();

        const expiryTime =
            new Date(
                resetRequest.expiresAt
            ).getTime();

        if (
            Number.isNaN(expiryTime) ||
            currentTime > expiryTime
        ) {
            showInvalidRequest(
                "This password reset link has expired. Please request a new one."
            );

            return;
        }

        organizationEmail.textContent =
            resetRequest.email;

        showResetForm();
    }

    function showResetForm() {
        invalidRequestSection.classList.add(
            "d-none"
        );

        successSection.classList.add(
            "d-none"
        );

        resetFormSection.classList.remove(
            "d-none"
        );
    }

    function showInvalidRequest(message) {
        resetFormSection.classList.add(
            "d-none"
        );

        successSection.classList.add(
            "d-none"
        );

        invalidRequestSection.classList.remove(
            "d-none"
        );

        invalidRequestMessage.textContent =
            message;
    }

    function togglePasswordVisibility(
        passwordInput,
        icon,
        button
    ) {
        const passwordIsHidden =
            passwordInput.type === "password";

        passwordInput.type =
            passwordIsHidden
                ? "text"
                : "password";

        icon.className =
            passwordIsHidden
                ? "bi bi-eye-slash"
                : "bi bi-eye";

        button.setAttribute(
            "aria-label",
            passwordIsHidden
                ? "Hide password"
                : "Show password"
        );
    }

    function getPasswordChecks(passwordValue) {
        return {
            length:
                passwordValue.length >= 8,

            uppercase:
                /[A-Z]/.test(
                    passwordValue
                ),

            lowercase:
                /[a-z]/.test(
                    passwordValue
                ),

            number:
                /[0-9]/.test(
                    passwordValue
                ),

            special:
                /[^A-Za-z0-9]/.test(
                    passwordValue
                )
        };
    }

    function updatePasswordRules() {
        const passwordChecks =
            getPasswordChecks(
                newPassword.value
            );

        Object.entries(
            passwordChecks
        ).forEach(([ruleName, isValid]) => {
            const ruleElement =
                passwordRules[ruleName];

            ruleElement.classList.toggle(
                "valid",
                isValid
            );

            const ruleIcon =
                ruleElement.querySelector(
                    "i"
                );

            ruleIcon.className =
                isValid
                    ? "bi bi-check-circle-fill"
                    : "bi bi-circle";
        });
    }

    function updatePasswordStrength() {
        const passwordChecks =
            getPasswordChecks(
                newPassword.value
            );

        const strengthScore =
            Object.values(
                passwordChecks
            ).filter(Boolean).length;

        const strengthSettings = [
            {
                width: "0%",
                text: "Enter a secure password.",
                color: "bg-secondary"
            },
            {
                width: "20%",
                text: "Very weak password.",
                color: "bg-danger"
            },
            {
                width: "40%",
                text: "Weak password.",
                color: "bg-danger"
            },
            {
                width: "60%",
                text: "Medium password.",
                color: "bg-warning"
            },
            {
                width: "80%",
                text: "Strong password.",
                color: "bg-info"
            },
            {
                width: "100%",
                text: "Very strong password.",
                color: "bg-success"
            }
        ];

        const setting =
            strengthSettings[
                strengthScore
            ];

        passwordStrengthBar.style.width =
            setting.width;

        passwordStrengthBar.className =
            `progress-bar ${setting.color}`;

        passwordStrengthText.textContent =
            setting.text;
    }

    function isPasswordStrong(
        passwordValue
    ) {
        const passwordChecks =
            getPasswordChecks(
                passwordValue
            );

        return Object.values(
            passwordChecks
        ).every(Boolean);
    }

    function validatePasswordMatch() {
        if (
            confirmPassword.value === ""
        ) {
            confirmPassword.setCustomValidity(
                ""
            );

            return false;
        }

        const passwordsMatch =
            newPassword.value ===
            confirmPassword.value;

        if (!passwordsMatch) {
            confirmPassword.setCustomValidity(
                "Passwords do not match."
            );

            confirmPasswordFeedback.textContent =
                "Passwords must match.";

            return false;
        }

        confirmPassword.setCustomValidity(
            ""
        );

        return true;
    }

    function resetOrganizationPassword() {
        setLoadingState(true);

        window.setTimeout(() => {
            const demoPasswordData = {
                email:
                    resetRequest.email,

                password:
                    newPassword.value,

                changedAt:
                    new Date().toISOString()
            };

            /*
                Temporary front-end storage only.
                The real backend must never store
                plain passwords in localStorage.
            */
            localStorage.setItem(
                passwordStorageKey,
                JSON.stringify(
                    demoPasswordData
                )
            );

            resetRequest.used =
                true;

            sessionStorage.setItem(
                resetRequestStorageKey,
                JSON.stringify(
                    resetRequest
                )
            );

            sessionStorage.removeItem(
                "wusoolOrganization"
            );

            setLoadingState(false);
            showSuccessSection();
        }, 900);
    }

    function showSuccessSection() {
        resetFormSection.classList.add(
            "d-none"
        );

        invalidRequestSection.classList.add(
            "d-none"
        );

        successSection.classList.remove(
            "d-none"
        );
    }

    function setLoadingState(isLoading) {
        resetButton.disabled =
            isLoading;

        resetButtonText.textContent =
            isLoading
                ? "Updating Password..."
                : "Reset Password";

        resetSpinner.classList.toggle(
            "d-none",
            !isLoading
        );

        resetButtonIcon.classList.toggle(
            "d-none",
            isLoading
        );
    }

    function showAlert(message, type) {
        resetAlert.textContent =
            message;

        resetAlert.className =
            `alert alert-${type}`;

        resetAlert.classList.remove(
            "d-none"
        );
    }

    function hideAlert() {
        resetAlert.textContent =
            "";

        resetAlert.className =
            "alert d-none";
    }
});