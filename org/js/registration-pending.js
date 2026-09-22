document.addEventListener("DOMContentLoaded", () => {
    const organizationName =
        document.getElementById(
            "organizationName"
        );

    const organizationEmail =
        document.getElementById(
            "organizationEmail"
        );

    const submissionDate =
        document.getElementById(
            "submissionDate"
        );

    const submittedStepDate =
        document.getElementById(
            "submittedStepDate"
        );

    const requestReference =
        document.getElementById(
            "requestReference"
        );

    const copyReferenceButton =
        document.getElementById(
            "copyReferenceButton"
        );

    const copyReferenceIcon =
        document.getElementById(
            "copyReferenceIcon"
        );

    const checkStatusButton =
        document.getElementById(
            "checkStatusButton"
        );

    const checkStatusText =
        document.getElementById(
            "checkStatusText"
        );

    const checkStatusSpinner =
        document.getElementById(
            "checkStatusSpinner"
        );

    const checkStatusIcon =
        document.getElementById(
            "checkStatusIcon"
        );

    const statusAlert =
        document.getElementById(
            "statusAlert"
        );

    const registrationStorageKey =
        "wusoolOrganizationRegistration";

    loadRegistrationInformation();

    copyReferenceButton.addEventListener(
        "click",
        () => {
            copyRequestReference();
        }
    );

    checkStatusButton.addEventListener(
        "click",
        () => {
            checkRegistrationStatus();
        }
    );

    function loadRegistrationInformation() {
        const registrationData =
            getRegistrationData();

        if (!registrationData) {
            showMissingRegistration();
            return;
        }

        organizationName.textContent =
            registrationData.organizationName;

        organizationEmail.textContent =
            registrationData.email;

        const formattedDate =
            formatDate(
                registrationData.submittedAt
            );

        submissionDate.textContent =
            formattedDate;

        submittedStepDate.textContent =
            formattedDate;

        const savedReference =
            registrationData.requestReference;

        if (savedReference) {
            requestReference.textContent =
                savedReference;

            return;
        }

        const newReference =
            createRequestReference();

        registrationData.requestReference =
            newReference;

        localStorage.setItem(
            registrationStorageKey,
            JSON.stringify(
                registrationData
            )
        );

        requestReference.textContent =
            newReference;
    }

    function getRegistrationData() {
        const savedRegistration =
            localStorage.getItem(
                registrationStorageKey
            );

        if (!savedRegistration) {
            return null;
        }

        try {
            return JSON.parse(
                savedRegistration
            );
        } catch (error) {
            console.error(
                "Unable to read registration data:",
                error
            );

            return null;
        }
    }

    function createRequestReference() {
        const currentYear =
            new Date().getFullYear();

        const randomNumber =
            Math.floor(
                100000 +
                Math.random() * 900000
            );

        return `ORG-${currentYear}-${randomNumber}`;
    }

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Not available";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Not available";
        }

        return new Intl.DateTimeFormat(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        ).format(date);
    }

    async function copyRequestReference() {
        const reference =
            requestReference.textContent.trim();

        try {
            await navigator.clipboard.writeText(
                reference
            );

            showCopiedState();
        } catch (error) {
            copyReferenceFallback(
                reference
            );
        }
    }

    function copyReferenceFallback(reference) {
        const temporaryInput =
            document.createElement(
                "textarea"
            );

        temporaryInput.value =
            reference;

        temporaryInput.style.position =
            "fixed";

        temporaryInput.style.opacity =
            "0";

        document.body.appendChild(
            temporaryInput
        );

        temporaryInput.select();

        document.execCommand(
            "copy"
        );

        temporaryInput.remove();

        showCopiedState();
    }

    function showCopiedState() {
        copyReferenceIcon.className =
            "bi bi-check-lg";

        copyReferenceButton.title =
            "Reference copied";

        window.setTimeout(() => {
            copyReferenceIcon.className =
                "bi bi-copy";

            copyReferenceButton.title =
                "Copy reference";
        }, 1800);
    }

    function checkRegistrationStatus() {
        const registrationData =
            getRegistrationData();

        if (!registrationData) {
            showMissingRegistration();
            return;
        }

        setLoadingState(true);
        hideAlert();

        window.setTimeout(() => {
            const currentStatus =
                registrationData.status ??
                "Pending";

            setLoadingState(false);

            if (currentStatus === "Approved") {
                showAlert(
                    "Your organization account has been approved. You can now log in.",
                    "success"
                );

                enableApprovedLogin();
                return;
            }

            if (
                currentStatus ===
                "ChangesRequired"
            ) {
                showAlert(
                    "The administrator requested changes to your registration information.",
                    "warning"
                );

                return;
            }

            if (
                currentStatus ===
                "Rejected"
            ) {
                showAlert(
                    "Your registration request was not approved. Please contact support.",
                    "danger"
                );

                return;
            }

            showAlert(
                "Your registration is still under review. We will notify you by email after the decision.",
                "warning"
            );
        }, 900);
    }

    function enableApprovedLogin() {
        const loginLink =
            document.querySelector(
                ".btn-outline-wusool"
            );

        loginLink.classList.remove(
            "btn-outline-wusool"
        );

        loginLink.classList.add(
            "btn-wusool"
        );
    }

    function showMissingRegistration() {
        organizationName.textContent =
            "Registration not found";

        organizationEmail.textContent =
            "No email available";

        submissionDate.textContent =
            "Not available";

        submittedStepDate.textContent =
            "Not available";

        requestReference.textContent =
            "Not available";

        copyReferenceButton.disabled =
            true;

        checkStatusButton.disabled =
            true;

        showAlert(
            "No organization registration was found. Please submit a registration request first.",
            "danger"
        );

        addRegistrationButton();
    }

    function addRegistrationButton() {
        const pendingActions =
            document.querySelector(
                ".pending-actions"
            );

        if (
            document.getElementById(
                "newRegistrationLink"
            )
        ) {
            return;
        }

        const registrationLink =
            document.createElement("a");

        registrationLink.id =
            "newRegistrationLink";

        registrationLink.href =
            "./organization-register.html";

        registrationLink.className =
            "btn btn-wusool";

        registrationLink.innerHTML =
            `
                <i class="bi bi-building-add"></i>
                Register Organization
            `;

        pendingActions.prepend(
            registrationLink
        );
    }

    function setLoadingState(isLoading) {
        checkStatusButton.disabled =
            isLoading;

        checkStatusText.textContent =
            isLoading
                ? "Checking..."
                : "Check Status";

        checkStatusSpinner.classList.toggle(
            "d-none",
            !isLoading
        );

        checkStatusIcon.classList.toggle(
            "d-none",
            isLoading
        );
    }

    function showAlert(message, type) {
        statusAlert.textContent =
            message;

        statusAlert.className =
            `alert alert-${type} mx-4 mx-md-5 mt-4 mb-0`;

        statusAlert.classList.remove(
            "d-none"
        );

        statusAlert.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function hideAlert() {
        statusAlert.textContent =
            "";

        statusAlert.className =
            "alert d-none mx-4 mx-md-5 mt-4 mb-0";
    }
});