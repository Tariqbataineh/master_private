document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordForm =
        document.getElementById(
            "forgotPasswordForm"
        );

    const emailInput =
        document.getElementById(
            "email"
        );

    const forgotAlert =
        document.getElementById(
            "forgotAlert"
        );

    const sendButton =
        document.getElementById(
            "sendButton"
        );

    const sendButtonText =
        document.getElementById(
            "sendButtonText"
        );

    const sendButtonIcon =
        document.getElementById(
            "sendButtonIcon"
        );

    const sendSpinner =
        document.getElementById(
            "sendSpinner"
        );

    const requestSection =
        document.getElementById(
            "requestSection"
        );

    const successSection =
        document.getElementById(
            "successSection"
        );

    const submittedEmail =
        document.getElementById(
            "submittedEmail"
        );

    const resetPasswordLink =
        document.getElementById(
            "resetPasswordLink"
        );

    const resendButton =
        document.getElementById(
            "resendButton"
        );

    const changeEmailButton =
        document.getElementById(
            "changeEmailButton"
        );

    const resetRequestStorageKey =
        "wusoolOrganizationResetRequest";

    loadRememberedOrganizationEmail();

    forgotPasswordForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            hideAlert();

            if (
                !forgotPasswordForm.checkValidity()
            ) {
                forgotPasswordForm.classList.add(
                    "was-validated"
                );

                return;
            }

            forgotPasswordForm.classList.remove(
                "was-validated"
            );

            sendResetInstructions();
        }
    );

    resendButton.addEventListener(
        "click",
        () => {
            resendInstructions();
        }
    );

    changeEmailButton.addEventListener(
        "click",
        () => {
            showRequestSection();
        }
    );

    function loadRememberedOrganizationEmail() {
        const rememberedEmail =
            localStorage.getItem(
                "wusoolOrganizationEmail"
            );

        if (rememberedEmail) {
            emailInput.value =
                rememberedEmail;
        }
    }

    function sendResetInstructions() {
        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        if (!isValidEmail(email)) {
            emailInput.setCustomValidity(
                "Enter a valid email."
            );

            forgotPasswordForm.classList.add(
                "was-validated"
            );

            return;
        }

        emailInput.setCustomValidity(
            ""
        );

        setLoadingState(true);

        window.setTimeout(() => {
            const resetRequest =
                createResetRequest(email);

            sessionStorage.setItem(
                resetRequestStorageKey,
                JSON.stringify(
                    resetRequest
                )
            );

            setLoadingState(false);
            showSuccessSection(email);
        }, 900);
    }

    function createResetRequest(email) {
        const createdAt =
            new Date();

        const expiresAt =
            new Date(
                createdAt.getTime() +
                15 * 60 * 1000
            );

        return {
            email,
            token:
                createDemoResetToken(),

            createdAt:
                createdAt.toISOString(),

            expiresAt:
                expiresAt.toISOString(),

            used:
                false
        };
    }

    function createDemoResetToken() {
        const firstPart =
            Date.now().toString(36);

        const secondPart =
            Math.random()
                .toString(36)
                .slice(2, 12);

        return `${firstPart}-${secondPart}`;
    }

    function showSuccessSection(email) {
        submittedEmail.textContent =
            email;

        resetPasswordLink.href =
            "./reset-password.html";

        requestSection.classList.add(
            "d-none"
        );

        successSection.classList.remove(
            "d-none"
        );

        successSection.focus();
    }

    function showRequestSection() {
        successSection.classList.add(
            "d-none"
        );

        requestSection.classList.remove(
            "d-none"
        );

        hideAlert();

        emailInput.focus();
    }

    function resendInstructions() {
        const resetRequest =
            getResetRequest();

        if (!resetRequest) {
            showRequestSection();
            return;
        }

        resendButton.disabled =
            true;

        resendButton.innerHTML =
            `
                <span
                    class="spinner-border spinner-border-sm"
                ></span>
                Resending...
            `;

        window.setTimeout(() => {
            const updatedRequest =
                createResetRequest(
                    resetRequest.email
                );

            sessionStorage.setItem(
                resetRequestStorageKey,
                JSON.stringify(
                    updatedRequest
                )
            );

            resendButton.disabled =
                false;

            resendButton.innerHTML =
                `
                    <i class="bi bi-check-lg"></i>
                    Instructions Sent Again
                `;

            window.setTimeout(() => {
                resendButton.innerHTML =
                    `
                        <i class="bi bi-arrow-clockwise"></i>
                        Resend Instructions
                    `;
            }, 2500);
        }, 800);
    }

    function getResetRequest() {
        const savedRequest =
            sessionStorage.getItem(
                resetRequestStorageKey
            );

        if (!savedRequest) {
            return null;
        }

        try {
            return JSON.parse(
                savedRequest
            );
        } catch (error) {
            console.error(
                "Unable to read reset request:",
                error
            );

            return null;
        }
    }

    function isValidEmail(email) {
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(
            email
        );
    }

    function setLoadingState(isLoading) {
        sendButton.disabled =
            isLoading;

        sendButtonText.textContent =
            isLoading
                ? "Sending..."
                : "Send Reset Instructions";

        sendSpinner.classList.toggle(
            "d-none",
            !isLoading
        );

        sendButtonIcon.classList.toggle(
            "d-none",
            isLoading
        );
    }

    function hideAlert() {
        forgotAlert.textContent =
            "";

        forgotAlert.className =
            "alert d-none";
    }
});