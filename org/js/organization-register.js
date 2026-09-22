document.addEventListener("DOMContentLoaded", () => {
    const registerForm =
        document.getElementById(
            "organizationRegisterForm"
        );

    const organizationType =
        document.getElementById(
            "organizationType"
        );

    const organizationCategory =
        document.getElementById(
            "organizationCategory"
        );

    const organizationName =
        document.getElementById(
            "organizationName"
        );

    const registrationNumber =
        document.getElementById(
            "registrationNumber"
        );

    const representativeName =
        document.getElementById(
            "representativeName"
        );

    const jobTitle =
        document.getElementById(
            "jobTitle"
        );

    const email =
        document.getElementById(
            "email"
        );

    const phoneNumber =
        document.getElementById(
            "phoneNumber"
        );

    const address =
        document.getElementById(
            "address"
        );

    const password =
        document.getElementById(
            "password"
        );

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );

    const confirmPasswordFeedback =
        document.getElementById(
            "confirmPasswordFeedback"
        );

    const togglePasswordButton =
        document.getElementById(
            "togglePasswordButton"
        );

    const passwordIcon =
        document.getElementById(
            "passwordIcon"
        );

    const passwordStrengthBar =
        document.getElementById(
            "passwordStrengthBar"
        );

    const passwordStrengthText =
        document.getElementById(
            "passwordStrengthText"
        );

    const verificationDocument =
        document.getElementById(
            "verificationDocument"
        );

    const documentName =
        document.getElementById(
            "documentName"
        );

    const documentFeedback =
        document.getElementById(
            "documentFeedback"
        );

    const termsCheckbox =
        document.getElementById(
            "termsCheckbox"
        );

    const registerButton =
        document.getElementById(
            "registerButton"
        );

    const registerButtonText =
        document.getElementById(
            "registerButtonText"
        );

    const registerButtonIcon =
        document.getElementById(
            "registerButtonIcon"
        );

    const registerSpinner =
        document.getElementById(
            "registerSpinner"
        );

    const registerAlert =
        document.getElementById(
            "registerAlert"
        );

    const pendingPage =
        "./registration-pending.html";

    const organizationCategories = {
        private: [
            {
                value: "bank",
                label: "Private Bank"
            },
            {
                value: "financial-institution",
                label: "Financial Institution"
            },
            {
                value: "approved-private-service",
                label: "Approved Private Service"
            }
        ],

        government: [
            {
                value: "ministry",
                label: "Ministry"
            },
            {
                value: "municipality",
                label: "Municipality"
            },
            {
                value: "government-department",
                label: "Government Department"
            },
            {
                value: "public-service-center",
                label: "Public Service Center"
            }
        ]
    };

    organizationType.addEventListener(
        "change",
        () => {
            updateOrganizationCategories();
        }
    );

    togglePasswordButton.addEventListener(
        "click",
        () => {
            togglePasswordVisibility();
        }
    );

    password.addEventListener(
        "input",
        () => {
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

    verificationDocument.addEventListener(
        "change",
        () => {
            validateDocument();
        }
    );

    registerForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            hideAlert();

            const documentIsValid =
                validateDocument();

            const passwordsMatch =
                validatePasswordMatch();

            if (
                !registerForm.checkValidity() ||
                !documentIsValid ||
                !passwordsMatch
            ) {
                registerForm.classList.add(
                    "was-validated"
                );

                showAlert(
                    "Please review the required information.",
                    "danger"
                );

                focusFirstInvalidField();
                return;
            }

            registerForm.classList.remove(
                "was-validated"
            );

            submitOrganizationRegistration();
        }
    );

    function updateOrganizationCategories() {
        const selectedType =
            organizationType.value;

        organizationCategory.innerHTML =
            "";

        if (!selectedType) {
            const defaultOption =
                document.createElement("option");

            defaultOption.value =
                "";

            defaultOption.textContent =
                "Select the type first";

            organizationCategory.appendChild(
                defaultOption
            );

            organizationCategory.disabled =
                true;

            return;
        }

        const firstOption =
            document.createElement("option");

        firstOption.value =
            "";

        firstOption.textContent =
            "Select organization category";

        organizationCategory.appendChild(
            firstOption
        );

        organizationCategories[
            selectedType
        ].forEach((category) => {
            const option =
                document.createElement("option");

            option.value =
                category.value;

            option.textContent =
                category.label;

            organizationCategory.appendChild(
                option
            );
        });

        organizationCategory.disabled =
            false;
    }

    function togglePasswordVisibility() {
        const passwordIsHidden =
            password.type === "password";

        password.type =
            passwordIsHidden
                ? "text"
                : "password";

        passwordIcon.className =
            passwordIsHidden
                ? "bi bi-eye-slash"
                : "bi bi-eye";

        togglePasswordButton.setAttribute(
            "aria-label",
            passwordIsHidden
                ? "Hide password"
                : "Show password"
        );
    }

    function updatePasswordStrength() {
        const passwordValue =
            password.value;

        let strengthScore =
            0;

        if (passwordValue.length >= 8) {
            strengthScore += 1;
        }

        if (/[a-z]/.test(passwordValue)) {
            strengthScore += 1;
        }

        if (/[A-Z]/.test(passwordValue)) {
            strengthScore += 1;
        }

        if (/[0-9]/.test(passwordValue)) {
            strengthScore += 1;
        }

        if (
            /[^A-Za-z0-9]/.test(
                passwordValue
            )
        ) {
            strengthScore += 1;
        }

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

    function validatePasswordMatch() {
        const passwordsMatch =
            password.value ===
            confirmPassword.value;

        if (
            confirmPassword.value === ""
        ) {
            confirmPassword.setCustomValidity(
                ""
            );

            return false;
        }

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

        confirmPasswordFeedback.textContent =
            "Passwords must match.";

        return true;
    }

    function validateDocument() {
        const selectedFile =
            verificationDocument.files[0];

        documentFeedback.classList.add(
            "d-none"
        );

        documentName.textContent =
            "";

        verificationDocument.setCustomValidity(
            ""
        );

        if (!selectedFile) {
            verificationDocument.setCustomValidity(
                "Verification document is required."
            );

            return false;
        }

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

        const maximumFileSize =
            5 * 1024 * 1024;

        if (
            !allowedTypes.includes(
                selectedFile.type
            )
        ) {
            showDocumentError(
                "Only PDF, JPG and PNG files are allowed."
            );

            return false;
        }

        if (
            selectedFile.size >
            maximumFileSize
        ) {
            showDocumentError(
                "The document must be smaller than 5 MB."
            );

            return false;
        }

        documentName.textContent =
            `Selected: ${selectedFile.name}`;

        return true;
    }

    function showDocumentError(message) {
        verificationDocument.setCustomValidity(
            message
        );

        documentFeedback.textContent =
            message;

        documentFeedback.classList.remove(
            "d-none"
        );
    }

    function submitOrganizationRegistration() {
        setLoadingState(true);

        const registrationData = {
            organizationType:
                organizationType.value,

            organizationCategory:
                organizationCategory.value,

            organizationName:
                organizationName.value.trim(),

            registrationNumber:
                registrationNumber.value.trim(),

            representativeName:
                representativeName.value.trim(),

            jobTitle:
                jobTitle.value.trim(),

            email:
                email.value.trim().toLowerCase(),

            phoneNumber:
                phoneNumber.value.trim(),

            address:
                address.value.trim(),

            documentName:
                verificationDocument
                    .files[0]
                    .name,

            status:
                "Pending",

            submittedAt:
                new Date().toISOString()
        };

        localStorage.setItem(
            "wusoolOrganizationRegistration",
            JSON.stringify(
                registrationData
            )
        );

        window.setTimeout(() => {
            showAlert(
                "Registration submitted successfully.",
                "success"
            );

            window.setTimeout(() => {
                window.location.href =
                    pendingPage;
            }, 700);
        }, 900);
    }

    function focusFirstInvalidField() {
        const firstInvalidField =
            registerForm.querySelector(
                ":invalid"
            );

        if (firstInvalidField) {
            firstInvalidField.focus();
        }
    }

    function setLoadingState(isLoading) {
        registerButton.disabled =
            isLoading;

        registerButtonText.textContent =
            isLoading
                ? "Submitting..."
                : "Submit Registration";

        registerSpinner.classList.toggle(
            "d-none",
            !isLoading
        );

        registerButtonIcon.classList.toggle(
            "d-none",
            isLoading
        );
    }

    function showAlert(message, type) {
        registerAlert.textContent =
            message;

        registerAlert.className =
            `alert alert-${type}`;

        registerAlert.classList.remove(
            "d-none"
        );

        registerAlert.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function hideAlert() {
        registerAlert.textContent =
            "";

        registerAlert.className =
            "alert d-none";
    }
});