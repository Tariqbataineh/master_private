document.addEventListener("DOMContentLoaded", () => {
    if (!protectPage()) {
        return;
    }

    const branch = getCurrentBranch();

    if (!branch) {
        window.location.replace(
            "./branches.html"
        );

        return;
    }

    initializeWeeklyHours(branch);
    initializeSpecialHours(branch);
    initializeForm(branch);
    initializeSidebar();
    initializeLogout();
    loadOrganizationInformation(branch);
});

const weekDays = [
    {
        key: "sunday",
        label: "Sunday",
        defaultOpen: true
    },
    {
        key: "monday",
        label: "Monday",
        defaultOpen: true
    },
    {
        key: "tuesday",
        label: "Tuesday",
        defaultOpen: true
    },
    {
        key: "wednesday",
        label: "Wednesday",
        defaultOpen: true
    },
    {
        key: "thursday",
        label: "Thursday",
        defaultOpen: true
    },
    {
        key: "friday",
        label: "Friday",
        defaultOpen: false
    },
    {
        key: "saturday",
        label: "Saturday",
        defaultOpen: false
    }
];

let specialHours = [];

const readStoredObject = (storage, key) => {
    try {
        const value = storage.getItem(key);

        return value
            ? JSON.parse(value)
            : null;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const protectPage = () => {
    const organization = readStoredObject(
        sessionStorage,
        "wusoolOrganization"
    );

    const loggedIn =
        sessionStorage.getItem(
            "wusoolOrganizationLoggedIn"
        ) === "true";

    if (!organization || !loggedIn) {
        window.location.replace(
            "./organization-login.html"
        );

        return false;
    }

    const subscriptionStatus = (
        organization.subscriptionStatus ||
        localStorage.getItem(
            "wusoolSubscriptionStatus"
        ) ||
        "inactive"
    ).toLowerCase();

    if (subscriptionStatus !== "active") {
        window.location.replace(
            "./subscription-plans.html"
        );

        return false;
    }

    return true;
};

const getBranchId = () => {
    const parameters =
        new URLSearchParams(
            window.location.search
        );

    return Number(parameters.get("id"));
};

const getCurrentBranch = () => {
    const branchId = getBranchId();

    const branches =
        readStoredObject(
            localStorage,
            "wusoolOrganizationBranches"
        ) || [];

    return (
        branches.find((branch) => {
            return Number(branch.id) === branchId;
        }) ||
        readStoredObject(
            localStorage,
            "wusoolCurrentBranchDraft"
        )
    );
};

const getDefaultHours = () => {
    return weekDays.reduce(
        (hours, day) => {
            hours[day.key] = {
                isOpen: day.defaultOpen,
                openTime: "09:00",
                closeTime: "16:00"
            };

            return hours;
        },
        {}
    );
};

const initializeWeeklyHours = (branch) => {
    const savedHours =
        branch.workingHours ||
        getDefaultHours();

    const container =
        document.getElementById(
            "weeklyHoursContainer"
        );

    container.innerHTML = "";

    weekDays.forEach((day) => {
        const dayHours =
            savedHours[day.key] || {
                isOpen: day.defaultOpen,
                openTime: "09:00",
                closeTime: "16:00"
            };

        container.appendChild(
            createDayRow(day, dayHours)
        );
    });

    document.querySelectorAll(
        ".day-toggle"
    ).forEach((toggle) => {
        toggle.addEventListener(
            "change",
            () => {
                updateDayRowState(
                    toggle.closest(".day-row")
                );
            }
        );
    });

    document.getElementById(
        "copyWeekdaysButton"
    ).addEventListener(
        "click",
        copySundayHours
    );
};

const createDayRow = (
    day,
    hours
) => {
    const row =
        document.createElement("article");

    row.className =
        `day-row ${
            hours.isOpen ? "" : "closed"
        }`;

    row.dataset.day = day.key;

    row.innerHTML = `
        <div>
            <span class="day-name">
                ${day.label}
            </span>

            <span class="day-status d-block">
                ${hours.isOpen ? "Open" : "Closed"}
            </span>
        </div>

        <div class="form-check form-switch m-0">
            <input
                type="checkbox"
                class="form-check-input day-toggle"
                role="switch"
                aria-label="Toggle ${day.label}"
                ${hours.isOpen ? "checked" : ""}
            >
        </div>

        <input
            type="time"
            class="form-control opening-time"
            value="${hours.openTime}"
            aria-label="${day.label} opening time"
            ${hours.isOpen ? "" : "disabled"}
        >

        <span class="time-separator">
            to
        </span>

        <input
            type="time"
            class="form-control closing-time"
            value="${hours.closeTime}"
            aria-label="${day.label} closing time"
            ${hours.isOpen ? "" : "disabled"}
        >
    `;

    return row;
};

const updateDayRowState = (row) => {
    const toggle =
        row.querySelector(".day-toggle");

    const status =
        row.querySelector(".day-status");

    const timeInputs =
        row.querySelectorAll(
            'input[type="time"]'
        );

    row.classList.toggle(
        "closed",
        !toggle.checked
    );

    status.textContent =
        toggle.checked ? "Open" : "Closed";

    timeInputs.forEach((input) => {
        input.disabled = !toggle.checked;
    });
};

const copySundayHours = () => {
    const sundayRow =
        document.querySelector(
            '[data-day="sunday"]'
        );

    const sundayOpen =
        sundayRow.querySelector(
            ".day-toggle"
        ).checked;

    const sundayOpenTime =
        sundayRow.querySelector(
            ".opening-time"
        ).value;

    const sundayCloseTime =
        sundayRow.querySelector(
            ".closing-time"
        ).value;

    [
        "monday",
        "tuesday",
        "wednesday",
        "thursday"
    ].forEach((day) => {
        const row =
            document.querySelector(
                `[data-day="${day}"]`
            );

        row.querySelector(
            ".day-toggle"
        ).checked = sundayOpen;

        row.querySelector(
            ".opening-time"
        ).value = sundayOpenTime;

        row.querySelector(
            ".closing-time"
        ).value = sundayCloseTime;

        updateDayRowState(row);
    });

    showToast(
        "Sunday hours copied to weekdays."
    );
};

const initializeSpecialHours = (branch) => {
    specialHours =
        Array.isArray(branch.specialHours)
            ? [...branch.specialHours]
            : [];

    const statusSelect =
        document.getElementById(
            "specialStatus"
        );

    statusSelect.addEventListener(
        "change",
        updateSpecialHoursInputs
    );

    document.getElementById(
        "addSpecialHoursButton"
    ).addEventListener(
        "click",
        addSpecialHours
    );

    renderSpecialHours();
};

const updateSpecialHoursInputs = () => {
    const isCustom =
        document.getElementById(
            "specialStatus"
        ).value === "custom";

    document.getElementById(
        "specialOpenGroup"
    ).classList.toggle(
        "d-none",
        !isCustom
    );

    document.getElementById(
        "specialCloseGroup"
    ).classList.toggle(
        "d-none",
        !isCustom
    );
};

const addSpecialHours = () => {
    const dateInput =
        document.getElementById(
            "specialDate"
        );

    const status =
        document.getElementById(
            "specialStatus"
        ).value;

    const openTime =
        document.getElementById(
            "specialOpenTime"
        ).value;

    const closeTime =
        document.getElementById(
            "specialCloseTime"
        ).value;

    const errorElement =
        document.getElementById(
            "specialHoursError"
        );

    errorElement.classList.add("d-none");

    if (!dateInput.value) {
        showSpecialError(
            "Select a special date."
        );

        return;
    }

    if (
        status === "custom" &&
        openTime >= closeTime
    ) {
        showSpecialError(
            "Closing time must be later than opening time."
        );

        return;
    }

    const existingIndex =
        specialHours.findIndex(
            (item) =>
                item.date === dateInput.value
        );

    const specialDate = {
        date: dateInput.value,
        status,
        openTime:
            status === "custom"
                ? openTime
                : null,
        closeTime:
            status === "custom"
                ? closeTime
                : null
    };

    if (existingIndex >= 0) {
        specialHours[existingIndex] =
            specialDate;
    } else {
        specialHours.push(specialDate);
    }

    specialHours.sort((first, second) => {
        return first.date.localeCompare(
            second.date
        );
    });

    dateInput.value = "";
    renderSpecialHours();
};

const showSpecialError = (message) => {
    const errorElement =
        document.getElementById(
            "specialHoursError"
        );

    errorElement.textContent = message;
    errorElement.classList.remove("d-none");
};

const renderSpecialHours = () => {
    const list =
        document.getElementById(
            "specialHoursList"
        );

    const emptyState =
        document.getElementById(
            "noSpecialHours"
        );

    list.innerHTML = "";

    specialHours.forEach((item, index) => {
        const article =
            document.createElement("article");

        article.className =
            "special-hours-item";

        const scheduleText =
            item.status === "closed"
                ? "Closed all day"
                : `${formatTime(item.openTime)} – ${formatTime(item.closeTime)}`;

        article.innerHTML = `
            <div>
                <strong>
                    ${formatDate(item.date)}
                </strong>

                <small>
                    ${scheduleText}
                </small>
            </div>

            <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                aria-label="Remove special date"
                data-special-index="${index}"
            >
                <i class="bi bi-trash"></i>
            </button>
        `;

        article.querySelector("button")
            .addEventListener(
                "click",
                () => {
                    specialHours.splice(
                        index,
                        1
                    );

                    renderSpecialHours();
                }
            );

        list.appendChild(article);
    });

    emptyState.classList.toggle(
        "d-none",
        specialHours.length > 0
    );
};

const collectWeeklyHours = () => {
    const workingHours = {};

    document.querySelectorAll(
        ".day-row"
    ).forEach((row) => {
        const day = row.dataset.day;

        workingHours[day] = {
            isOpen:
                row.querySelector(
                    ".day-toggle"
                ).checked,

            openTime:
                row.querySelector(
                    ".opening-time"
                ).value,

            closeTime:
                row.querySelector(
                    ".closing-time"
                ).value
        };
    });

    return workingHours;
};

const validateWeeklyHours = (
    workingHours
) => {
    const invalidDay =
        weekDays.find((day) => {
            const hours =
                workingHours[day.key];

            return (
                hours.isOpen &&
                (
                    !hours.openTime ||
                    !hours.closeTime ||
                    hours.openTime >=
                        hours.closeTime
                )
            );
        });

    const message =
        document.getElementById(
            "hoursValidationMessage"
        );

    if (invalidDay) {
        message.textContent =
            `${invalidDay.label}: Closing time must be later than opening time.`;

        message.classList.remove("d-none");

        return false;
    }

    message.classList.add("d-none");

    return true;
};

const initializeForm = (branch) => {
    document.getElementById(
        "workingHoursForm"
    ).addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            if (!saveWorkingHours(branch)) {
                return;
            }

            window.location.href =
                `./branch-accessibility.html?id=${branch.id}`;
        }
    );

    document.getElementById(
        "saveHoursDraftButton"
    ).addEventListener(
        "click",
        () => {
            if (saveWorkingHours(branch)) {
                showToast(
                    "Working hours saved successfully."
                );
            }
        }
    );

    document.getElementById(
        "backButton"
    ).href =
        `./add-branch.html?id=${branch.id}`;
};

const saveWorkingHours = (branch) => {
    const workingHours =
        collectWeeklyHours();

    if (
        !validateWeeklyHours(
            workingHours
        )
    ) {
        return false;
    }

    const branches =
        readStoredObject(
            localStorage,
            "wusoolOrganizationBranches"
        ) || [];

    const updatedBranch = {
        ...branch,
        workingHours,
        specialHours,
        completedSteps: {
            ...branch.completedSteps,
            details: true,
            workingHours: true
        },
        updatedAt:
            new Date().toISOString()
    };

    const branchIndex =
        branches.findIndex((item) => {
            return Number(item.id) ===
                Number(branch.id);
        });

    if (branchIndex >= 0) {
        branches[branchIndex] =
            updatedBranch;
    }

    localStorage.setItem(
        "wusoolOrganizationBranches",
        JSON.stringify(branches)
    );

    localStorage.setItem(
        "wusoolCurrentBranchDraft",
        JSON.stringify(updatedBranch)
    );

    return true;
};

const loadOrganizationInformation = (
    branch
) => {
    const organization =
        readStoredObject(
            sessionStorage,
            "wusoolOrganization"
        );

    document.getElementById(
        "sidebarOrganizationName"
    ).textContent =
        organization?.organizationName ||
        organization?.companyName ||
        organization?.name ||
        "Organization";

    document.getElementById(
        "pageTitle"
    ).textContent =
        `${branch.name} Working Hours`;

    document.getElementById(
        "summaryBranchName"
    ).textContent = branch.name;

    document.getElementById(
        "summaryBranchCity"
    ).textContent = branch.city || "—";

    document.getElementById(
        "summaryBranchType"
    ).textContent = branch.type || "—";
};

const initializeSidebar = () => {
    const sidebar =
        document.getElementById(
            "organizationSidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );

    const closeSidebar = () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        document.body.classList.remove(
            "overflow-hidden"
        );
    };

    document.getElementById(
        "openSidebarButton"
    )?.addEventListener(
        "click",
        () => {
            sidebar.classList.add("open");
            overlay.classList.add("show");

            document.body.classList.add(
                "overflow-hidden"
            );
        }
    );

    document.getElementById(
        "closeSidebarButton"
    )?.addEventListener(
        "click",
        closeSidebar
    );

    overlay.addEventListener(
        "click",
        closeSidebar
    );
};

const initializeLogout = () => {
    document.getElementById(
        "logoutButton"
    ).addEventListener(
        "click",
        () => {
            sessionStorage.removeItem(
                "wusoolOrganization"
            );

            sessionStorage.removeItem(
                "wusoolOrganizationLoggedIn"
            );

            window.location.replace(
                "./organization-login.html"
            );
        }
    );
};

const formatDate = (dateValue) => {
    return new Intl.DateTimeFormat(
        "en-JO",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(
        new Date(`${dateValue}T00:00:00`)
    );
};

const formatTime = (timeValue) => {
    const [hours, minutes] =
        timeValue.split(":");

    const date = new Date();

    date.setHours(
        Number(hours),
        Number(minutes)
    );

    return new Intl.DateTimeFormat(
        "en-JO",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
};

const showToast = (message) => {
    document.getElementById(
        "toastMessage"
    ).textContent = message;

    bootstrap.Toast
        .getOrCreateInstance(
            document.getElementById(
                "workingHoursToast"
            )
        )
        .show();
};