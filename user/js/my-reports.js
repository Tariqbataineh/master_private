"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const reportsKey =
        "wusool-accessibility-reports";

    const reportsContainer =
        document.getElementById(
            "reportsContainer"
        );

    const emptyReports =
        document.getElementById(
            "emptyReports"
        );

    const emptyTitle =
        document.getElementById(
            "emptyTitle"
        );

    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );

    const reportSearch =
        document.getElementById(
            "reportSearch"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const detailsContent =
        document.getElementById(
            "reportDetailsContent"
        );

    const confirmDeleteReport =
        document.getElementById(
            "confirmDeleteReport"
        );

    const detailsModal =
        new bootstrap.Modal(
            document.getElementById(
                "reportDetailsModal"
            )
        );

    const deleteModal =
        new bootstrap.Modal(
            document.getElementById(
                "deleteReportModal"
            )
        );

    let selectedReportId = null;

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

    const saveReports = (reports) => {
        localStorage.setItem(
            reportsKey,
            JSON.stringify(reports)
        );
    };

    const escapeHtml = (value) => {
        const temporaryElement =
            document.createElement("div");

        temporaryElement.textContent =
            String(value || "");

        return temporaryElement.innerHTML;
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Not available";
        }

        return new Intl.DateTimeFormat(
            "en-US",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(
            new Date(dateValue)
        );
    };

    const getStatusClass = (status) => {
        const statusClasses = {
            "Pending Review":
                "text-bg-warning",

            Approved:
                "text-bg-success",

            Rejected:
                "text-bg-danger"
        };

        return (
            statusClasses[status] ||
            "text-bg-secondary"
        );
    };

    const getSeverityClass = (
        severity
    ) => {
        const severityClasses = {
            Low:
                "text-bg-info",

            Moderate:
                "text-bg-warning",

            High:
                "text-bg-danger",

            Critical:
                "severity-critical"
        };

        return (
            severityClasses[severity] ||
            "text-bg-secondary"
        );
    };

    const updateStatistics = (
        reports
    ) => {
        document.getElementById(
            "totalReports"
        ).textContent =
            reports.length;

        document.getElementById(
            "pendingReports"
        ).textContent =
            reports.filter(
                (report) => {
                    return (
                        report.status ===
                        "Pending Review"
                    );
                }
            ).length;

        document.getElementById(
            "approvedReports"
        ).textContent =
            reports.filter(
                (report) => {
                    return (
                        report.status ===
                        "Approved"
                    );
                }
            ).length;

        document.getElementById(
            "rejectedReports"
        ).textContent =
            reports.filter(
                (report) => {
                    return (
                        report.status ===
                        "Rejected"
                    );
                }
            ).length;
    };

    const filterReports = (
        reports
    ) => {
        const searchValue =
            reportSearch.value
                .trim()
                .toLowerCase();

        const selectedStatus =
            statusFilter.value;

        return reports.filter(
            (report) => {
                const searchableText = [
                    report.placeName,
                    report.branch,
                    report.issueType,
                    report.description
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    searchableText.includes(
                        searchValue
                    );

                const matchesStatus =
                    selectedStatus === "all" ||
                    report.status ===
                        selectedStatus;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    };

    const createReportCard = (
        report
    ) => {
        const column =
            document.createElement("div");

        column.className =
            "col-12 col-lg-6";

        const pendingActions =
            report.status ===
            "Pending Review"
                ? `
                    <a
                        class="btn btn-wusool-outline"
                        href="./report-accessibility-issue.html?reportId=${report.id}"
                    >
                        <i class="bi bi-pencil me-1"></i>
                        Edit
                    </a>

                    <button
                        class="btn btn-outline-danger"
                        type="button"
                        data-delete-report="${report.id}"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                `
                : "";

        column.innerHTML = `
            <article class="report-card p-4 h-100">

                <header
                    class="d-flex justify-content-between
                           align-items-start gap-3 mb-3"
                >

                    <div>

                        <span class="section-label">
                            REPORT #${report.id}
                        </span>

                        <h2 class="h4 fw-bold mt-2 mb-1">
                            ${escapeHtml(
                                report.placeName
                            )}
                        </h2>

                        <p class="text-secondary mb-0">
                            ${escapeHtml(
                                report.branch
                            )}
                        </p>

                    </div>

                    <span
                        class="badge ${getStatusClass(
                            report.status
                        )}"
                    >
                        ${escapeHtml(
                            report.status
                        )}
                    </span>

                </header>

                <div class="d-flex flex-wrap gap-2 mb-3">

                    <span
                        class="badge ${getSeverityClass(
                            report.severity
                        )}"
                    >
                        ${escapeHtml(
                            report.severity
                        )}
                    </span>

                    <span class="badge text-bg-light">
                        ${escapeHtml(
                            report.issueType
                        )}
                    </span>

                </div>

                <p class="text-secondary report-description">
                    ${escapeHtml(
                        report.description
                    )}
                </p>

                <dl class="row small">

                    <dt class="col-6 text-secondary">
                        Observed
                    </dt>

                    <dd class="col-6 text-end">
                        ${formatDate(
                            report.observedDate
                        )}
                    </dd>

                    <dt class="col-6 text-secondary">
                        Submitted
                    </dt>

                    <dd class="col-6 text-end">
                        ${formatDate(
                            report.submittedAt
                        )}
                    </dd>

                </dl>

                <footer class="d-flex flex-wrap gap-2">

                    <button
                        class="btn btn-wusool flex-grow-1"
                        type="button"
                        data-view-report="${report.id}"
                    >
                        View Details
                    </button>

                    ${pendingActions}

                </footer>

            </article>
        `;

        return column;
    };

    const renderReports = () => {
        const allReports =
            getReports();

        updateStatistics(
            allReports
        );

        const filteredReports =
            filterReports(
                allReports
            ).sort(
                (
                    firstReport,
                    secondReport
                ) => {
                    return (
                        new Date(
                            secondReport.submittedAt
                        ) -
                        new Date(
                            firstReport.submittedAt
                        )
                    );
                }
            );

        reportsContainer.innerHTML =
            "";

        if (
            filteredReports.length === 0
        ) {
            emptyReports.classList.remove(
                "d-none"
            );

            if (allReports.length > 0) {
                emptyTitle.textContent =
                    "No Matching Reports";

                emptyMessage.textContent =
                    "Try changing the search or status filter.";
            } else {
                emptyTitle.textContent =
                    "No Reports Yet";

                emptyMessage.textContent =
                    "You have not submitted any accessibility reports.";
            }

            return;
        }

        emptyReports.classList.add(
            "d-none"
        );

        filteredReports.forEach(
            (report) => {
                reportsContainer.appendChild(
                    createReportCard(
                        report
                    )
                );
            }
        );

        addReportEvents();
    };

    const addReportEvents = () => {
        document
            .querySelectorAll(
                "[data-view-report]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        showReportDetails(
                            Number(
                                button.dataset
                                    .viewReport
                            )
                        );
                    }
                );
            });

        document
            .querySelectorAll(
                "[data-delete-report]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        selectedReportId =
                            Number(
                                button.dataset
                                    .deleteReport
                            );

                        deleteModal.show();
                    }
                );
            });
    };

    const showReportDetails = (
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

        if (!report) {
            return;
        }

        const adminResponse =
            report.adminResponse
                ? `
                    <div class="alert alert-info mt-4">

                        <strong>
                            Reviewer Response
                        </strong>

                        <p class="mb-0 mt-1">
                            ${escapeHtml(
                                report.adminResponse
                            )}
                        </p>

                    </div>
                `
                : `
                    <div class="alert alert-light mt-4 mb-0">
                        No reviewer response is available yet.
                    </div>
                `;

        detailsContent.innerHTML = `
            <div class="row g-4">

                <div class="col-12 col-md-6">

                    <span class="section-label">
                        PLACE
                    </span>

                    <h3 class="h4 fw-bold mt-2">
                        ${escapeHtml(
                            report.placeName
                        )}
                    </h3>

                    <p class="text-secondary">
                        ${escapeHtml(
                            report.branch
                        )}
                    </p>

                </div>

                <div class="col-12 col-md-6 text-md-end">

                    <span
                        class="badge ${getStatusClass(
                            report.status
                        )}"
                    >
                        ${escapeHtml(
                            report.status
                        )}
                    </span>

                </div>

                <div class="col-12">

                    <dl class="row">

                        <dt class="col-sm-4">
                            Issue Type
                        </dt>

                        <dd class="col-sm-8">
                            ${escapeHtml(
                                report.issueType
                            )}
                        </dd>

                        <dt class="col-sm-4">
                            Severity
                        </dt>

                        <dd class="col-sm-8">
                            ${escapeHtml(
                                report.severity
                            )}
                        </dd>

                        <dt class="col-sm-4">
                            Issue Location
                        </dt>

                        <dd class="col-sm-8">
                            ${escapeHtml(
                                report.issueLocation ||
                                "Not specified"
                            )}
                        </dd>

                        <dt class="col-sm-4">
                            Date Observed
                        </dt>

                        <dd class="col-sm-8">
                            ${formatDate(
                                report.observedDate
                            )}
                        </dd>

                    </dl>

                    <h4 class="h6 fw-bold">
                        Description
                    </h4>

                    <p class="text-secondary">
                        ${escapeHtml(
                            report.description
                        )}
                    </p>

                    ${adminResponse}

                </div>

            </div>
        `;

        detailsModal.show();
    };

    confirmDeleteReport.addEventListener(
        "click",
        () => {
            const reports =
                getReports();

            const selectedReport =
                reports.find(
                    (report) => {
                        return (
                            report.id ===
                            selectedReportId
                        );
                    }
                );

            if (
                !selectedReport ||
                selectedReport.status !==
                    "Pending Review"
            ) {
                deleteModal.hide();
                return;
            }

            const updatedReports =
                reports.filter(
                    (report) => {
                        return (
                            report.id !==
                            selectedReportId
                        );
                    }
                );

            saveReports(
                updatedReports
            );

            selectedReportId = null;

            deleteModal.hide();

            renderReports();
        }
    );

    reportSearch.addEventListener(
        "input",
        renderReports
    );

    statusFilter.addEventListener(
        "change",
        renderReports
    );

    renderReports();
});