"use strict";

const reportsStorageKey =
    "wusoolOrganizationAiReports";

let organizationReports = [];
let filteredReports = [];

document.addEventListener("DOMContentLoaded", () => {
    loadReports();
    configureFilters();
    renderPage();
});

const defaultReports = [
    {
        id: 1,
        branchId: 1,
        branchName: "Main Branch",
        city: "Amman",
        score: 92,
        status: "ready",
        detectedFacilities: 8,
        detectedIssues: 1,
        updatedAt: "2026-09-22T10:30:00"
    },
    {
        id: 2,
        branchId: 2,
        branchName: "North Branch",
        city: "Irbid",
        score: 74,
        status: "ready",
        detectedFacilities: 6,
        detectedIssues: 3,
        updatedAt: "2026-09-21T14:15:00"
    },
    {
        id: 3,
        branchId: 3,
        branchName: "Zarqa Branch",
        city: "Zarqa",
        score: 61,
        status: "action-required",
        detectedFacilities: 4,
        detectedIssues: 5,
        updatedAt: "2026-09-20T09:45:00"
    },
    {
        id: 4,
        branchId: 4,
        branchName: "Airport Branch",
        city: "Amman",
        score: null,
        status: "analyzing",
        detectedFacilities: 0,
        detectedIssues: 0,
        updatedAt: "2026-09-23T11:00:00"
    }
];

const loadReports = () => {
    const storedReports =
        localStorage.getItem(
            reportsStorageKey
        );

    if (!storedReports) {
        organizationReports = [
            ...defaultReports
        ];

        saveReports();
    } else {
        try {
            organizationReports =
                JSON.parse(storedReports);
        } catch (error) {
            console.error(
                "Unable to load AI reports:",
                error
            );

            organizationReports = [
                ...defaultReports
            ];
        }
    }

    filteredReports = [
        ...organizationReports
    ];
};

const saveReports = () => {
    localStorage.setItem(
        reportsStorageKey,
        JSON.stringify(
            organizationReports
        )
    );
};

const configureFilters = () => {
    const reportSearch =
        document.getElementById(
            "reportSearch"
        );

    const statusFilter =
        document.getElementById(
            "reportStatusFilter"
        );

    const scoreFilter =
        document.getElementById(
            "scoreFilter"
        );

    const clearFiltersButton =
        document.getElementById(
            "clearFiltersButton"
        );

    const emptyClearButton =
        document.getElementById(
            "emptyClearButton"
        );

    reportSearch.addEventListener(
        "input",
        filterReports
    );

    statusFilter.addEventListener(
        "change",
        filterReports
    );

    scoreFilter.addEventListener(
        "change",
        filterReports
    );

    clearFiltersButton.addEventListener(
        "click",
        clearFilters
    );

    emptyClearButton.addEventListener(
        "click",
        clearFilters
    );
};

const filterReports = () => {
    const searchValue =
        document
            .getElementById(
                "reportSearch"
            )
            .value
            .trim()
            .toLowerCase();

    const selectedStatus =
        document.getElementById(
            "reportStatusFilter"
        ).value;

    const selectedScore =
        document.getElementById(
            "scoreFilter"
        ).value;

    filteredReports =
        organizationReports.filter(
            (report) => {
                const searchableText =
                    `${report.branchName} ${report.city}`
                        .toLowerCase();

                const matchesSearch =
                    searchableText.includes(
                        searchValue
                    );

                const matchesStatus =
                    selectedStatus === "all" ||
                    report.status ===
                        selectedStatus;

                const scoreCategory =
                    getScoreCategory(
                        report.score
                    );

                const matchesScore =
                    selectedScore === "all" ||
                    scoreCategory ===
                        selectedScore;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesScore
                );
            }
        );

    renderReports();
};

const clearFilters = () => {
    document.getElementById(
        "reportSearch"
    ).value = "";

    document.getElementById(
        "reportStatusFilter"
    ).value = "all";

    document.getElementById(
        "scoreFilter"
    ).value = "all";

    filteredReports = [
        ...organizationReports
    ];

    renderReports();
};

const renderPage = () => {
    renderStatistics();
    renderReports();
};

const renderStatistics = () => {
    const readyReports =
        organizationReports.filter(
            (report) => {
                return (
                    report.status ===
                    "ready"
                );
            }
        ).length;

    const improvementReports =
        organizationReports.filter(
            (report) => {
                return (
                    report.status ===
                        "action-required" ||
                    (
                        typeof report.score ===
                            "number" &&
                        report.score < 70
                    )
                );
            }
        ).length;

    const scoredReports =
        organizationReports.filter(
            (report) => {
                return (
                    typeof report.score ===
                    "number"
                );
            }
        );

    const totalScore =
        scoredReports.reduce(
            (total, report) => {
                return total + report.score;
            },
            0
        );

    const averageScore =
        scoredReports.length > 0
            ? Math.round(
                totalScore /
                scoredReports.length
            )
            : 0;

    setTextContent(
        "totalReports",
        organizationReports.length
    );

    setTextContent(
        "readyReports",
        readyReports
    );

    setTextContent(
        "improvementReports",
        improvementReports
    );

    setTextContent(
        "averageScore",
        `${averageScore}%`
    );
};

const renderReports = () => {
    const reportsContainer =
        document.getElementById(
            "reportsContainer"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const resultsText =
        document.getElementById(
            "resultsText"
        );

    reportsContainer.innerHTML = "";

    resultsText.textContent =
        `Showing ${filteredReports.length} ` +
        `${
            filteredReports.length === 1
                ? "report"
                : "reports"
        }`;

    if (filteredReports.length === 0) {
        reportsContainer.classList.add(
            "d-none"
        );

        emptyState.classList.remove(
            "d-none"
        );

        return;
    }

    reportsContainer.classList.remove(
        "d-none"
    );

    emptyState.classList.add(
        "d-none"
    );

    filteredReports.forEach(
        (report) => {
            reportsContainer.insertAdjacentHTML(
                "beforeend",
                createReportCard(report)
            );
        }
    );
};

const createReportCard = (report) => {
    const scoreCategory =
        getScoreCategory(
            report.score
        );

    const scoreLabel =
        getScoreLabel(
            report.score
        );

    const statusInformation =
        getStatusInformation(
            report.status
        );

    const scoreDisplay =
        typeof report.score === "number"
            ? `${report.score}%`
            : "—";

    const reportButton =
        report.status === "analyzing"
            ? `
                <button
                    type="button"
                    class="btn btn-light border"
                    disabled
                >
                    <span
                        class="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                    ></span>
                    Analysis in Progress
                </button>
            `
            : `
                <a
                    href="./branch-ai-review.html?id=${encodeURIComponent(
                        report.branchId
                    )}&mode=view"
                    class="btn btn-wusool"
                >
                    <i class="bi bi-file-earmark-text me-2"></i>
                    View Full Report
                </a>
            `;

    return `
        <div class="col-12 col-md-6 col-xxl-4">
            <article class="report-card">

                <header class="report-card-header">

                    <div class="d-flex align-items-center gap-3">

                        <span class="branch-icon">
                            <i class="bi bi-building"></i>
                        </span>

                        <div>
                            <h2 class="h5 fw-bold mb-1">
                                ${escapeHtml(
                                    report.branchName
                                )}
                            </h2>

                            <p class="small text-secondary mb-0">
                                <i class="bi bi-geo-alt me-1"></i>
                                ${escapeHtml(
                                    report.city
                                )}
                            </p>
                        </div>

                    </div>

                    <span
                        class="report-status ${report.status}"
                    >
                        <i class="bi ${statusInformation.icon}"></i>
                        ${statusInformation.label}
                    </span>

                </header>

                <div class="report-card-body">

                    <div class="score-section mb-3">

                        <span
                            class="score-circle ${scoreCategory}"
                        >
                            ${scoreDisplay}
                        </span>

                        <div>
                            <p class="small text-secondary mb-1">
                                Accessibility Score
                            </p>

                            <h3 class="h6 fw-bold mb-0">
                                ${scoreLabel}
                            </h3>
                        </div>

                    </div>

                    <div class="report-information mb-3">

                        <div class="information-item">
                            <small>
                                Detected Facilities
                            </small>

                            <strong>
                                <i class="bi bi-check-circle text-success me-1"></i>
                                ${report.detectedFacilities}
                            </strong>
                        </div>

                        <div class="information-item">
                            <small>
                                Detected Issues
                            </small>

                            <strong>
                                <i class="bi bi-exclamation-triangle text-warning me-1"></i>
                                ${report.detectedIssues}
                            </strong>
                        </div>

                    </div>

                    <p class="small text-secondary mb-4">
                        <i class="bi bi-clock me-1"></i>
                        Last updated:
                        ${formatDate(
                            report.updatedAt
                        )}
                    </p>

                    <div class="d-grid gap-2">

                        ${reportButton}

                        <a
                            href="./organization-branch-details.html?id=${encodeURIComponent(
                                report.branchId
                            )}"
                            class="btn btn-outline-wusool"
                        >
                            View Branch
                        </a>

                    </div>

                </div>

            </article>
        </div>
    `;
};

const getScoreCategory = (
    score
) => {
    if (typeof score !== "number") {
        return "not-available";
    }

    if (score >= 85) {
        return "excellent";
    }

    if (score >= 70) {
        return "good";
    }

    return "needs-improvement";
};

const getScoreLabel = (
    score
) => {
    if (typeof score !== "number") {
        return "Analysis Not Completed";
    }

    if (score >= 85) {
        return "Excellent Accessibility";
    }

    if (score >= 70) {
        return "Good Accessibility";
    }

    return "Needs Improvement";
};

const getStatusInformation = (
    status
) => {
    const statuses = {
        ready: {
            label: "Ready",
            icon: "bi-check-circle-fill"
        },

        analyzing: {
            label: "Analyzing",
            icon: "bi-hourglass-split"
        },

        "action-required": {
            label: "Action Required",
            icon: "bi-exclamation-triangle-fill"
        }
    };

    return statuses[status] ||
        statuses.ready;
};

const formatDate = (
    dateValue
) => {
    if (!dateValue) {
        return "Not available";
    }

    const date =
        new Date(dateValue);

    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
};

const setTextContent = (
    elementId,
    value
) => {
    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.textContent = value;
    }
};

const escapeHtml = (
    value
) => {
    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent =
        String(value || "");

    return temporaryElement.innerHTML;
};