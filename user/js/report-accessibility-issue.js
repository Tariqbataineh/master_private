"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const reportsKey =
        "wusool-accessibility-reports";

    const visitsKey =
        "wusool-visits";

    const places = [
        {
            id: 1,
            name: "Amman City Hall",
            branches: [
                "Main Branch - Amman",
                "West Amman Branch"
            ]
        },
        {
            id: 2,
            name: "Al Noor Medical Center",
            branches: [
                "Main Medical Center",
                "North Amman Clinic"
            ]
        },
        {
            id: 3,
            name: "Community Hub",
            branches: [
                "Main Community Center",
                "Irbid Community Branch"
            ]
        }
    ];

    const reportForm =
        document.getElementById(
            "reportForm"
        );

    const reportContent =
        document.getElementById(
            "reportContent"
        );

    const reportSuccess =
        document.getElementById(
            "reportSuccess"
        );

    const placeSelect =
        document.getElementById(
            "placeSelect"
        );

    const branchSelect =
        document.getElementById(
            "branchSelect"
        );

    const observedDate =
        document.getElementById(
            "observedDate"
        );

    const issueDescription =
        document.getElementById(
            "issueDescription"
        );

    const descriptionCounter =
        document.getElementById(
            "descriptionCounter"
        );

    const evidencePhoto =
        document.getElementById(
            "evidencePhoto"
        );

    const photoPreview =
        document.getElementById(
            "photoPreview"
        );

    const photoPreviewContainer =
        document.getElementById(
            "photoPreviewContainer"
        );

    const photoName =
        document.getElementById(
            "photoName"
        );

    const photoError =
        document.getElementById(
            "photoError"
        );

    const removePhotoButton =
        document.getElementById(
            "removePhotoButton"
        );

    const formStatus =
        document.getElementById(
            "formStatus"
        );

    const submitButtonText =
        document.getElementById(
            "submitButtonText"
        );

    const navbarUserName =
        document.getElementById(
            "navbarUserName"
        );

    let selectedPhoto = null;
    let existingPhoto = null;
    let editingReportId = null;

    navbarUserName.textContent =
        localStorage.getItem(
            "wusool-user-name"
        ) || "User";

    const getParameters = () => {
        const parameters =
            new URLSearchParams(
                window.location.search
            );

        return {
            placeId:
                Number(
                    parameters.get("placeId")
                ) || null,

            visitId:
                Number(
                    parameters.get("visitId")
                ) || null,

            reportId:
                Number(
                    parameters.get("reportId")
                ) || null
        };
    };

    const getReports = () => {
        try {
            return JSON.parse(
                localStorage.getItem(
                    reportsKey
                )
            ) || [];
        } catch {
            return [];
        }
    };

    const getVisits = () => {
        try {
            return JSON.parse(
                localStorage.getItem(
                    visitsKey
                )
            ) || [];
        } catch {
            return [];
        }
    };

    const setMaximumDate = () => {
        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        observedDate.max = today;
        observedDate.value = today;
    };

    const populatePlaces = () => {
        places.forEach((place) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value = place.id;
            option.textContent =
                place.name;

            placeSelect.appendChild(
                option
            );
        });
    };

    const populateBranches = (
        selectedBranch = ""
    ) => {
        branchSelect.innerHTML = `
            <option value="">
                Select a branch
            </option>
        `;

        const selectedPlace =
            places.find((place) => {
                return (
                    place.id ===
                    Number(
                        placeSelect.value
                    )
                );
            });

        if (!selectedPlace) {
            branchSelect.disabled =
                true;

            return;
        }

        branchSelect.disabled =
            false;

        selectedPlace.branches.forEach(
            (branch) => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value = branch;
                option.textContent =
                    branch;

                branchSelect.appendChild(
                    option
                );
            }
        );

        if (selectedBranch) {
            branchSelect.value =
                selectedBranch;
        }
    };

    const applyUrlInformation = () => {
        const parameters =
            getParameters();

        if (parameters.visitId) {
            const selectedVisit =
                getVisits().find(
                    (visit) => {
                        return (
                            visit.id ===
                            parameters.visitId
                        );
                    }
                );

            if (selectedVisit) {
                placeSelect.value =
                    String(
                        selectedVisit.placeId
                    );

                populateBranches(
                    selectedVisit.branch
                );
            }
        } else if (parameters.placeId) {
            placeSelect.value =
                String(
                    parameters.placeId
                );

            populateBranches();
        }

        if (parameters.reportId) {
            loadReportForEditing(
                parameters.reportId
            );
        }
    };

    placeSelect.addEventListener(
        "change",
        () => {
            populateBranches();
        }
    );

    issueDescription.addEventListener(
        "input",
        () => {
            descriptionCounter.textContent =
                `${issueDescription.value.length} / 500`;
        }
    );

    evidencePhoto.addEventListener(
        "change",
        () => {
            const photo =
                evidencePhoto.files[0];

            validatePhoto(photo);
        }
    );

    const validatePhoto = (photo) => {
        clearPhotoError();

        if (!photo) {
            return;
        }

        const acceptedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        const maximumSize =
            8 * 1024 * 1024;

        if (
            !acceptedTypes.includes(
                photo.type
            )
        ) {
            showPhotoError(
                "Select a JPG, PNG, or WEBP image."
            );

            evidencePhoto.value = "";
            return;
        }

        if (photo.size > maximumSize) {
            showPhotoError(
                "The photo must be smaller than 8 MB."
            );

            evidencePhoto.value = "";
            return;
        }

        selectedPhoto = photo;

        const photoReader =
            new FileReader();

        photoReader.addEventListener(
            "load",
            (event) => {
                photoPreview.src =
                    event.target.result;

                photoName.textContent =
                    photo.name;

                photoPreviewContainer.classList.remove(
                    "d-none"
                );
            }
        );

        photoReader.readAsDataURL(
            photo
        );
    };

    removePhotoButton.addEventListener(
        "click",
        () => {
        selectedPhoto = null;
        existingPhoto = null;
            evidencePhoto.value = "";
            photoPreview.src = "";
            photoName.textContent = "";

            photoPreviewContainer.classList.add(
                "d-none"
            );

            clearPhotoError();
        }
    );

    const showPhotoError = (message) => {
        photoError.textContent = message;

        photoError.classList.remove(
            "d-none"
        );
    };

    const clearPhotoError = () => {
        photoError.textContent = "";

        photoError.classList.add(
            "d-none"
        );
    };

    const getSelectedPlace = () => {
        return places.find((place) => {
            return (
                place.id ===
                Number(
                    placeSelect.value
                )
            );
        });
    };

    const createReport = () => {
        const selectedPlace =
            getSelectedPlace();

        const parameters =
            getParameters();

        return {
            id:
                editingReportId ||
                Date.now(),

            placeId:
                selectedPlace.id,

            placeName:
                selectedPlace.name,

            branch:
                branchSelect.value,

            visitId:
                parameters.visitId,

            issueLocation:
                document.getElementById(
                    "issueLocation"
                ).value.trim(),

            issueType:
                document.getElementById(
                    "issueType"
                ).value,

            severity:
                document.getElementById(
                    "severity"
                ).value,

            observedDate:
                observedDate.value,

            description:
                issueDescription.value.trim(),

            photo:
                selectedPhoto
                    ? {
                        name:
                            selectedPhoto.name,

                        size:
                            selectedPhoto.size,

                        type:
                            selectedPhoto.type
                    }
                    : existingPhoto,

            status:
                "Pending Review",

            adminResponse: "",

            submittedAt:
                new Date().toISOString()
        };
    };

    const saveReport = (report) => {
        const reports =
            getReports();

        const reportIndex =
            reports.findIndex(
                (storedReport) => {
                    return (
                        storedReport.id ===
                        report.id
                    );
                }
            );

        if (reportIndex >= 0) {
            report.submittedAt =
                reports[
                    reportIndex
                ].submittedAt;

            report.updatedAt =
                new Date().toISOString();

            reports[
                reportIndex
            ] = report;
        } else {
            reports.push(report);
        }

        localStorage.setItem(
            reportsKey,
            JSON.stringify(reports)
        );
    };

    const loadReportForEditing = (
        reportId
    ) => {
        const report =
            getReports().find(
                (storedReport) => {
                    return (
                        storedReport.id ===
                        reportId
                    );
                }
            );

        if (
            !report ||
            report.status !==
                "Pending Review"
        ) {
            return;
        }

        editingReportId =
            report.id;

        existingPhoto =
            report.photo || null;

        placeSelect.value =
            String(
                report.placeId
            );

        populateBranches(
            report.branch
        );

        document.getElementById(
            "issueLocation"
        ).value =
            report.issueLocation || "";

        document.getElementById(
            "issueType"
        ).value =
            report.issueType;

        document.getElementById(
            "severity"
        ).value =
            report.severity;

        observedDate.value =
            report.observedDate;

        issueDescription.value =
            report.description;

        descriptionCounter.textContent =
            `${report.description.length} / 500`;

        submitButtonText.textContent =
            "Update Report";
    };

    reportForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            formStatus.classList.add(
                "d-none"
            );

            if (
                !reportForm.checkValidity()
            ) {
                reportForm.classList.add(
                    "was-validated"
                );

                formStatus.textContent =
                    "Complete the required report information.";

                formStatus.classList.remove(
                    "d-none"
                );

                return;
            }

            const report =
                createReport();

            saveReport(report);

            reportContent.classList.add(
                "d-none"
            );

            reportSuccess.classList.remove(
                "d-none"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );

    setMaximumDate();
    populatePlaces();
    applyUrlInformation();
});
