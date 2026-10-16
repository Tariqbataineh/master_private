
import { api, errorText } from "./store.js";
import { sortRecords, sortControl } from "./sort.js";
import {
  shell,
  heading,
  bindTabs,
  busy,
  confirmAction as originalConfirmAction,
  setCleanup,
} from "./ui.js";
import {
  esc,
  icon,
  href,
  badge,
  tabs,
  empty,
  modal as createModal,
  toast,
} from "./components.js";

let activeTab = "الوظائف المتاحة";
let order = "newest";
let query = "";
let records = [];
let loadVersion = 0;

const kinds = {
  "الوظائف المتاحة": "vacancies",
  "طلباتي": "applications",
  "الامتحانات": "exams",
  "المقابلات": "interviews",
  "العروض": "offers",
};

const tabTitles = {
  "الوظائف المتاحة": "Available Jobs",
  "طلباتي": "My Applications",
  "الامتحانات": "Exams",
  "المقابلات": "Interviews",
  "العروض": "Offers",
};

const labels = {
  pending: "Awaiting organization",
  accepted: "Accepted",
  rejected: "Rejected",
  published: "Published",
  issued: "Awaiting your response",
  declined: "Declined",
  withdrawn: "Withdrawn",
  invited: "Interview invitation",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  ended: "Interview ended",
  sent: "Waiting for exam",
  "in-progress": "Exam in progress",
  "under-review": "Awaiting review",
  reviewed: "Exam reviewed",
  failed: "Exam not passed",
  "proceed-to-offer": "Awaiting job offer",
  "awaiting-start": "Awaiting work start",
  "start-confirmed": "Work start confirmed",
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

const label = (value) => labels[value] || value || "";

function safeDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Amman",
  }).format(date);
}

function englishModalControls(host, confirmation = false) {
  host.querySelectorAll("[data-close]").forEach((button) => {
    button.setAttribute("aria-label", "Close");

    if (button.classList.contains("btn")) {
      button.textContent = confirmation ? "Cancel" : "Close";
    }
  });

  const confirmButton = host.querySelector("[data-confirm]");

  if (confirmButton) {
    confirmButton.textContent = "Confirm";
  }
}

function modal(title, body, options) {
  const dialog = createModal(title, body, options);
  englishModalControls(dialog.host);
  return dialog;
}

function confirmAction(title, message, action) {
  const dialog = originalConfirmAction(title, message, action);
  englishModalControls(dialog.host, true);
  return dialog;
}

export async function renderRecruitment() {
  shell(
    `
    ${heading(
      "Recruitment",
      "Explore jobs, track applications, and manage exams and interviews in one place."
    )}

    <div class="career-toolbar">
      <a
        class="btn outline"
        href="${href("user-profile", { section: "career" })}"
      >
        ${icon("user")}
        My Career Profile
      </a>

      <label class="search-box career-search">
        ${icon("search")}

        <input
          type="search"
          id="career-search"
          value="${esc(query)}"
          placeholder="Search jobs or organizations"
          aria-label="Search recruitment"
        >
      </label>
    </div>

    <div class="career-tabs">
      ${tabs(Object.keys(kinds), activeTab, "career-tab")}
    </div>

    <div
      id="career-results"
      role="tabpanel"
      aria-live="polite"
    >
      <p>Loading recruitment data...</p>
    </div>
    `,
    "recruitment"
  );

  document
    .querySelectorAll("[data-career-tab]")
    .forEach((button) => {
      button.textContent =
        tabTitles[button.dataset.careerTab] ||
        button.textContent;
    });

  bindTabs("career-tab", (tab) => {
    activeTab = tab;

    order = ["الامتحانات", "المقابلات"].includes(tab)
      ? "upcoming"
      : "newest";

    renderSort();
    load();
  });

  const sortOptions = [
    {
      value: "newest",
      ar: "Newest first",
      en: "Newest first",
    },
    {
      value: "oldest",
      ar: "Oldest first",
      en: "Oldest first",
    },
    {
      value: "name",
      ar: "Name",
      en: "Name",
    },
    {
      value: "status",
      ar: "Status",
      en: "Status",
    },
  ];

  function renderSort() {
    document
      .querySelector("#career-sort")
      ?.closest("label")
      ?.remove();

    const choices = ["الامتحانات", "المقابلات"].includes(activeTab)
      ? [
          {
            value: "upcoming",
            ar: "Upcoming first",
            en: "Upcoming first",
          },
          ...sortOptions,
        ]
      : sortOptions;

    document
      .querySelector("#career-results")
      .insertAdjacentHTML(
        "beforebegin",
        sortControl(order, choices, "career-sort")
      );

    document.querySelector("#career-sort").onchange = (event) => {
      order = event.target.value;
      draw();
    };
  }

  renderSort();

  document.querySelector("#career-search").oninput = (event) => {
    query = event.target.value;
    draw();
  };

  const refresh = () => {
    if (!document.hidden) {
      load();
    }
  };

  const storage = (event) => {
    if (
      event.key === "wusool.database.v2" ||
      event.key === null
    ) {
      refresh();
    }
  };

  window.addEventListener("wusool:data-changed", refresh);
  window.addEventListener("storage", storage);
  document.addEventListener("visibilitychange", refresh);

  const poll =
    api().mode === "api"
      ? setInterval(refresh, 15000)
      : null;

  setCleanup(() => {
    window.removeEventListener("wusool:data-changed", refresh);
    window.removeEventListener("storage", storage);
    document.removeEventListener("visibilitychange", refresh);
    clearInterval(poll);
  });

  await load();
}

async function load() {
  const revision = ++loadVersion;

  try {
    let result = await api().recruitment.list(
      kinds[activeTab],
      { current: true }
    );

    if (activeTab === "العروض") {
      const applications = await api().recruitment.list(
        "applications",
        { current: true }
      );

      const existingOfferApplications = new Set(
        result.map((offer) => offer.applicationId)
      );

      const accepted = applications
        .filter(
          (application) =>
            application.decision === "accepted" &&
            !existingOfferApplications.has(application.id)
        )
        .map((application) => ({
          ...application,
          acceptedApplication: true,
        }));

      result = [...result, ...accepted];
    }

    if (revision !== loadVersion) return;

    records = result;
    draw();
  } catch (error) {
    const root = document.querySelector("#career-results");

    if (revision === loadVersion && root) {
      root.innerHTML = empty(errorText(error));
    }
  }
}

function acceptedEmploymentCard(application) {
  if (application.decision !== "accepted") return "";

  const startText = application.employmentStartAt
    ? safeDate(application.employmentStartAt)
    : "To be confirmed";

  const jobTitle = esc(
    application.employmentJobTitle ||
    application.title ||
    "Assigned position"
  );

  const branchName = esc(
    application.employmentBranchSnapshot?.name ||
    application.branchName ||
    "Assigned branch"
  );

  const noteText = esc(
    application.candidateMessage ||
    application.employmentNotes ||
    "Please report to your assigned branch on time and follow the organization instructions."
  );

  return `
    <div class="employment-offer-card">

      <p>
        <strong>Job Title:</strong>
        ${jobTitle}
      </p>

      <p>
        <strong>Branch:</strong>
        ${branchName}
      </p>

      <p>
        <strong>Employment Status:</strong>
        ${esc(label(application.employmentStatus || "awaiting-start"))}
      </p>

      <p>
        <strong>Start Date & Time:</strong>
        <bdi>${startText}</bdi>
      </p>

      ${
        application.employmentSchedule
          ? `
            <p>
              <strong>Work Schedule:</strong>
              ${esc(application.employmentSchedule)}
            </p>
          `
          : ""
      }

      ${
        application.employmentInstructions
          ? `
            <p>
              <strong>Instructions:</strong>
              ${esc(application.employmentInstructions)}
            </p>
          `
          : ""
      }

      <p>
        <strong>Message:</strong>
        ${noteText}
      </p>

    </div>
  `;
}

function draw() {
  const root = document.querySelector("#career-results");
  if (!root) return;

  let items = records.filter((record) =>
    `${record.title || ""} ${record.organizationName || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  if (activeTab === "الوظائف المتاحة") {
    items = items.filter(
      (record) =>
        record.status === "published" &&
        Date.parse(record.closingDate + "T23:59:59+03:00") >
          Date.now()
    );
  }

  const sortRules =
    order === "upcoming"
      ? [{ field: "startAt", type: "date" }]
      : order === "name"
        ? [{ field: "title" }]
        : order === "status"
          ? [{ field: "status" }, { field: "decision" }]
          : [
              {
                field: "createdAt",
                type: "date",
                direction: order === "newest" ? "desc" : "asc",
              },
            ];

  items = sortRecords(items, sortRules);

  root.setAttribute(
    "aria-labelledby",
    `tab-${activeTab.replaceAll(" ", "-")}`
  );

  // Offers use a separate, compact card layout.
  if (activeTab === "العروض") {
    root.innerHTML = items.length
      ? `
        <div class="career-grid">
          ${items
            .map(
              (record) => `
              <article class="panel career-card offer-summary-card">

                <div class="career-card-head">
                  ${badge(
                    record.acceptedApplication
                      ? "Accepted"
                      : label(record.status)
                  )}
                </div>

                <h2>
                  ${esc(
                    record.employmentJobTitle ||
                    record.title ||
                    "Job Offer"
                  )}
                </h2>

                <button
                  type="button"
                  class="btn primary"
                  data-offer-result="${esc(record.id)}"
                >
                  ${
                    record.acceptedApplication
                      ? "View Result"
                      : "View Offer"
                  }
                </button>

              </article>
            `
            )
            .join("")}
        </div>
      `
      : empty("No offers available yet.");

    root.querySelectorAll("[data-offer-result]").forEach((button) => {
      button.onclick = () => {
        const record = items.find(
          (item) => item.id === button.dataset.offerResult
        );

        if (!record) return;

        if (record.acceptedApplication) {
          showAcceptanceResult(record);
        } else {
          offer(record);
        }
      };
    });

    return;
  }

  root.innerHTML = items.length
    ? `
      <div class="career-grid">
        ${items
          .map((record) => {
            const availableJobs = activeTab === "الوظائف المتاحة";
            const applications = activeTab === "طلباتي";
            const exams = activeTab === "الامتحانات";
            const interviews = activeTab === "المقابلات";

            let content = "";

            if (availableJobs) {
              content = `
                <div class="career-tags">
                  ${badge(label(record.employmentType))}
                  ${badge(label(record.workArrangement))}
                </div>

                <p class="line-clamp">
                  ${esc(record.description)}
                </p>

                <small>
                  Application deadline:
                  <bdi>${esc(record.closingDate)}</bdi>
                </small>
              `;
            } else if (interviews) {
              content = `
                <p>${safeDate(record.startAt)}</p>

                <p>
                  ${
                    record.mode === "online"
                      ? "Online interview"
                      : "In-person interview"
                  }
                </p>
              `;
            } else if (exams) {
              content = `
                <p>
                  Duration:
                  ${Number(record.durationMinutes) || 0} minutes
                </p>

                <p>
                  Opens: ${safeDate(record.startAt)}
                </p>

                ${
                  record.revealScore === true &&
                  record.score != null
                    ? `
                      <p class="exam-score">
                        <strong>
                          Score: ${Number(record.score)}
                          ${
                            record.maxScore != null
                              ? ` / ${Number(record.maxScore)}`
                              : ""
                          }
                        </strong>
                      </p>
                    `
                    : ""
                }
              `;
            } else if (applications) {
              content = `
                <p>
                  ${esc(
                    record.candidateMessage ||
                    "The organization's response will appear here."
                  )}
                </p>

                ${acceptedEmploymentCard(record)}
              `;
            }

            return `
              <article class="panel career-card">

                <div class="career-card-head">
                  ${badge(label(record.decision || record.status))}
                  <small>${safeDate(record.createdAt)}</small>
                </div>

                <h2>
                  ${esc(record.title || "Job Application")}
                </h2>

                <p>${esc(record.organizationName || "")}</p>

                ${content}

                <button
                  class="btn ${availableJobs ? "primary" : "soft"}"
                  data-career-details="${esc(record.id)}"
                >
                  ${
                    availableJobs
                      ? "View Job & Apply"
                      : applications
                        ? "Track Application"
                        : "View Details"
                  }
                </button>

              </article>
            `;
          })
          .join("")}
      </div>
    `
    : empty(
        activeTab === "الوظائف المتاحة"
          ? "No available job openings at the moment."
          : "No records in this section."
      );

  root.querySelectorAll("[data-career-details]").forEach((button) => {
    button.onclick = (event) =>
      busy(event.currentTarget, async () => {
        const record = records.find(
          (item) => item.id === button.dataset.careerDetails
        );

        if (!record) return;

        if (activeTab === "الوظائف المتاحة") {
          vacancy(record);
        } else if (activeTab === "طلباتي") {
          await application(record);
        } else if (activeTab === "المقابلات") {
          interview(record);
        } else if (activeTab === "الامتحانات") {
          examDetails(record);
        } else {
          offer(record);
        }
      });
  });
}

function vacancy(vacancyRecord) {
  const dialog = modal(
    vacancyRecord.title,
    `
      <div class="plain-content">

        <p>${esc(vacancyRecord.organizationName)}</p>

        <h3>Job Description</h3>
        <p>${esc(vacancyRecord.description)}</p>

        <h3>Qualifications</h3>
        <p>${esc(vacancyRecord.qualifications)}</p>

        ${
          vacancyRecord.responsibilities
            ? `
              <h3>Responsibilities</h3>
              <p>${esc(vacancyRecord.responsibilities)}</p>
            `
            : ""
        }

        ${
          vacancyRecord.skills
            ? `
              <h3>Skills</h3>
              <p>${esc(vacancyRecord.skills)}</p>
            `
            : ""
        }

        ${
          vacancyRecord.accommodations
            ? `
              <h3>Accessibility Accommodations</h3>
              <p>${esc(vacancyRecord.accommodations)}</p>
            `
            : ""
        }

        <p>
          ${esc(
            vacancyRecord.branchSnapshot?.name ||
            label(vacancyRecord.workArrangement)
          )}
        </p>

      </div>
    `,
    {
      footer: `
        <button class="btn primary" data-apply-preview>
          Review Application
        </button>
      `,
    }
  );

  dialog.host.querySelector("[data-apply-preview]").onclick = (event) =>
    busy(event.currentTarget, async () => {
      const profile = await api().recruitment.profile();

      dialog.close();

      const preview = modal(
        "Review Your Application",
        `
          <form id="application-form">

            <p class="notice">
              The following information will be shared with the
              organization. Review it before submitting your application.
            </p>

            <dl class="career-preview">
              ${[
                [
                  "Name",
                  [profile.firstName, profile.lastName]
                    .filter(Boolean)
                    .join(" "),
                ],
                ["Email", profile.emailAddress],
                ["Phone", profile.phoneNumber],
                ["Major", profile.major],
                ["University", profile.university],
                ["Skills", profile.skills],
                ["Professional Summary", profile.professionalSummary],
                [
                  "CV / Resume",
                  profile.cvDocument?.uploaded === true
                    ? profile.cvFileName || profile.cvDocument.name
                    : "No CV or resume uploaded",
                ],
              ]
                .map(
                  ([title, value]) => `
                    <dt>${title}</dt>
                    <dd>${esc(value || "Not provided")}</dd>
                  `
                )
                .join("")}
            </dl>

            ${
              !profile.phoneNumber
                ? `
                  <label class="field">
                    Phone Number
                    <input
                      name="missingPhone"
                      type="tel"
                      required
                      autocomplete="tel"
                    >
                  </label>
                `
                : ""
            }

            ${(vacancyRecord.questions || [])
              .map(
                (question) => `
                  <label class="field">
                    ${esc(question.label)}

                    <textarea
                      name="question:${esc(question.id)}"
                      ${question.required ? "required" : ""}
                      maxlength="3000"
                    ></textarea>
                  </label>
                `
              )
              .join("")}

            <label class="option">
              <input
                type="checkbox"
                name="consent"
                required
              >
              I consent to sharing the application information
              shown with the organization.
            </label>

            <div class="form-actions">
              <a
                class="btn outline"
                href="${href("user-profile", { section: "career" })}"
              >
                Edit Career Profile
              </a>

              <button
                class="btn primary"
                type="submit"
              >
                Submit Application
              </button>
            </div>

            <p
              class="validation"
              role="alert"
              data-error
            ></p>

          </form>
        `
      );

      preview.host.querySelector("form").onsubmit = (event) => {
        event.preventDefault();

        const form = event.currentTarget;

        busy(
          form.querySelector('[type="submit"]'),
          async () => {
            const formData = new FormData(form);

            const answers = Object.fromEntries(
              (vacancyRecord.questions || []).map((question) => [
                question.id,
                formData.get("question:" + question.id) || "",
              ])
            );

            try {
              await api().recruitment.apply(vacancyRecord.id, {
                answers,
                consent: formData.get("consent") === "on",
                missing: {
                  phoneNumber: formData.get("missingPhone") || "",
                },
                profileFingerprint: JSON.stringify(profile),
              });

              preview.close();

              activeTab = "طلباتي";

              await renderRecruitment();

              toast(
                "Your application has been sent to the organization."
              );
            } catch (error) {
              preview.host.querySelector(
                "[data-error]"
              ).textContent = errorText(error);
            }
          }
        );
      };
    });
}

async function application(record) {
  const track = await api().recruitment.trackApplication(record.id);
  const applicationRecord = track.application;

  const stepTitles = {
    applied: "Submit Application",
    exam: "Exam",
    interview: "Interview",
    decision: "Organization Decision",
    offer: "Job Offer",
    start: "Start Work",
  };

  const dialog = modal(
    "Application Tracking",
    `
      <h3>${esc(applicationRecord.title)}</h3>

      <div class="application-steps">
        ${track.steps
          .map(
            (step) => `
              <div class="application-step ${
                step.done ? "done" : step.active ? "current" : ""
              }">

                <span>
                  ${icon(step.done ? "check" : "clock")}
                </span>

                <div>
                  <strong>
                    ${stepTitles[step.key] || ""}
                  </strong>

                  <p>
                    ${
                      step.done
                        ? "Completed"
                        : step.active
                          ? "Awaiting action"
                          : "Not started"
                    }
                  </p>
                </div>

              </div>
            `
          )
          .join("")}
      </div>

      <p class="notice">
        ${esc(
          applicationRecord.candidateMessage ||
          label(applicationRecord.decision)
        )}
      </p>

      ${
        applicationRecord.employmentStartAt
          ? `
            <p>
              Work start date:
              ${safeDate(applicationRecord.employmentStartAt)}
            </p>

            <p>
              ${esc(
                applicationRecord.employmentBranchSnapshot?.name || ""
              )}
            </p>

            <p class="preserve-lines">
              ${esc(applicationRecord.employmentInstructions || "")}
            </p>
          `
          : ""
      }

      <div class="form-actions">
        ${
          track.exams.length
            ? `
              <button class="btn soft" data-goto="الامتحانات">
                Exams
              </button>
            `
            : ""
        }

        ${
          track.interviews.length
            ? `
              <button class="btn soft" data-goto="المقابلات">
                Interviews
              </button>
            `
            : ""
        }

        ${
          track.offers.length
            ? `
              <button class="btn soft" data-goto="العروض">
                Offers
              </button>
            `
            : ""
        }
      </div>
    `
  );

  dialog.host.querySelectorAll("[data-goto]").forEach((button) => {
    button.onclick = async () => {
      activeTab = button.dataset.goto;
      dialog.close();
      await renderRecruitment();
    };
  });
}

function interview(interviewRecord) {
  let timer;
  let poll;
  let syncing = false;
  let currentInterview = interviewRecord;

  const sync = async () => {
    if (
      syncing ||
      document.hidden ||
      !dialog.host.isConnected
    ) {
      return;
    }

    syncing = true;

    try {
      const interviews = await api().recruitment.list(
        "interviews",
        { current: false }
      );

      const updated = interviews.find(
        (record) => record.id === currentInterview.id
      );

      if (updated) {
        currentInterview = updated;
        refreshEntry();
      }
    } catch (error) {
      toast(errorText(error));
    } finally {
      syncing = false;
    }
  };

  const storage = (event) => {
    if (
      event.key === "wusool.database.v2" ||
      event.key === null
    ) {
      sync();
    }
  };

  const dialog = modal(
    "Interview Details",
    `
      <div class="plain-content">

        <h3>${esc(currentInterview.title)}</h3>

        <p>
          Date & Time:
          ${safeDate(currentInterview.startAt)}
        </p>

        <p>
          ${
            currentInterview.mode === "online"
              ? "Remote"
              : esc(
                  currentInterview.location ||
                  currentInterview.branchSnapshot?.address ||
                  ""
                )
          }
        </p>

        <p>
          Status:
          <span data-interview-status>
            ${esc(label(currentInterview.status))}
          </span>
        </p>

        <p>${esc(currentInterview.candidateMessage || "")}</p>

        <p data-entry-message></p>

        ${
          currentInterview.visitId
            ? `
              <a
                class="btn soft"
                href="${href("my-visits", {
                  track: currentInterview.visitId,
                })}"
              >
                Track Interview Visit
              </a>
            `
            : ""
        }

      </div>
    `,
    {
      onClose: () => {
        clearInterval(timer);
        clearInterval(poll);

        window.removeEventListener("wusool:data-changed", sync);
        window.removeEventListener("storage", storage);
        document.removeEventListener("visibilitychange", sync);
      },

      footer: `
        ${
          currentInterview.status === "invited" &&
          Date.now() < Date.parse(currentInterview.startAt)
            ? `
              <button
                class="btn primary"
                data-interview-response="confirmed"
              >
                Confirm Attendance
              </button>

              <button
                class="btn outline"
                data-interview-response="declined"
              >
                Decline Invitation
              </button>
            `
            : ""
        }

        ${
          currentInterview.status === "confirmed" &&
          Date.now() < Date.parse(currentInterview.startAt)
            ? `
              <button
                class="btn outline"
                data-interview-response="declined"
              >
                Decline Attendance
              </button>
            `
            : ""
        }

        ${
          currentInterview.mode === "online"
            ? `
              <button
                class="btn primary"
                data-join
              >
                Open Meeting
              </button>
            `
            : ""
        }
      `,
    }
  );

  function refreshEntry() {
    const joinButton = dialog.host.querySelector("[data-join]");
    const message = dialog.host.querySelector("[data-entry-message]");
    const status = dialog.host.querySelector("[data-interview-status]");

    const closed = ["ended", "cancelled", "declined"].includes(
      currentInterview.status
    );

    const allowed =
      !closed &&
      window.WusoolRecruitmentPolicy.joinable(currentInterview) &&
      Boolean(currentInterview.meeting?.linkAvailable);

    if (joinButton) {
      joinButton.disabled = !allowed;
      joinButton.hidden = closed;
    }

    if (status) {
      status.textContent = label(currentInterview.status);
    }

    if (message) {
      message.textContent = closed
        ? "The interview has ended. Meeting access is closed."
        : allowed
          ? "You can join the interview now."
          : "Meeting access is available after confirmation and during the interview window.";
    }
  }

  refreshEntry();

  timer = setInterval(refreshEntry, 1000);

  window.addEventListener("wusool:data-changed", sync);
  window.addEventListener("storage", storage);
  document.addEventListener("visibilitychange", sync);

  poll = setInterval(sync, 2000);

  dialog.host
    .querySelectorAll("[data-interview-response]")
    .forEach((button) => {
      button.onclick = () =>
        confirmAction(
          "Confirm Response",
          "Send your response to the organization?",
          async () => {
            await api().recruitment.respond(
              currentInterview.id,
              currentInterview.revision,
              button.dataset.interviewResponse
            );

            dialog.close();
            await load();

            toast("Your interview response has been updated.");
          }
        );
    });

  dialog.host
    .querySelector("[data-join]")
    ?.addEventListener("click", (event) =>
      busy(event.currentTarget, async () => {
        const result = await api().recruitment.join(
          currentInterview.id
        );

        const url = new URL(result.joinUrl);

        if (url.protocol !== "https:") {
          throw new Error("Invalid interview link");
        }

        modal(
          "Open Meeting",
          `
            <p>
              The external interview meeting link
              will open in a new tab.
            </p>

            <a
              class="btn primary"
              style="margin-top:16px"
              href="${esc(url.href)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Interview
            </a>
          `
        );
      })
    );
}

function showAcceptanceResult(application) {
  const startTime = Date.parse(application.employmentStartAt || "");

  const formattedStart = Number.isFinite(startTime)
    ? `${new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Amman",
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(startTime))} (Jordan time)`
    : "To be confirmed";

  const detail = (name, value) => `
    <div class="offer-result-detail">

      <span>${name}</span>

      <strong>
        <bdi>${esc(value || "To be confirmed")}</bdi>
      </strong>

    </div>
  `;

  const body = `
    <div class="offer-result" lang="en" dir="ltr">

      <div class="offer-result-hero">

        <span
          class="offer-result-check"
          aria-hidden="true"
        >
          ✓
        </span>

        <span class="offer-result-eyebrow">
          YOUR NEXT CHAPTER BEGINS
        </span>

        <h3>Congratulations! You're Hired!</h3>

        <p>
          We're delighted to confirm your acceptance.
          Here are the details for your first day.
          We look forward to welcoming you to the team!
        </p>

      </div>

      <div class="offer-result-details">

        ${detail(
          "Position",
          application.employmentJobTitle || application.title
        )}

        ${detail(
          "Branch",
          application.employmentBranchSnapshot?.name
        )}

        ${detail("Start date & time", formattedStart)}

        ${detail(
          "Work hours",
          application.workdayStart && application.workdayEnd
            ? `${application.workdayStart} – ${application.workdayEnd}`
            : null
        )}

        ${detail(
          "Status",
          application.employmentStatus === "start-confirmed"
            ? "Employment started"
            : "Awaiting first day"
        )}

      </div>

      ${
        application.employmentInstructions
          ? `
            <div class="offer-result-note">
              <strong>First-day instructions</strong>
              <p>${esc(application.employmentInstructions)}</p>
            </div>
          `
          : ""
      }

      ${
        application.candidateMessage
          ? `
            <div class="offer-result-note">
              <strong>Message from the organization</strong>
              <p>${esc(application.candidateMessage)}</p>
            </div>
          `
          : ""
      }

      <p class="offer-result-signoff">
        Welcome aboard! ✨
      </p>

    </div>
  `;

  modal("Your Employment Result", body);
}

function offer(offerRecord) {
  const dialog = modal(
    "Job Offer",
    `
      <div class="plain-content">

        <h3>${esc(offerRecord.title)}</h3>

        <p class="preserve-lines">
          ${esc(offerRecord.terms)}
        </p>

        <p>${esc(label(offerRecord.status))}</p>

        ${
          offerRecord.employmentStatus
            ? `
              <p>
                ${esc(label(offerRecord.employmentStatus))}
              </p>
            `
            : ""
        }

      </div>
    `,
    {
      footer:
        offerRecord.status === "issued"
          ? `
            <button
              class="btn primary"
              data-offer="accepted"
            >
              Accept Offer
            </button>

            <button
              class="btn outline"
              data-offer="declined"
            >
              Decline Offer
            </button>
          `
          : "",
    }
  );

  dialog.host.querySelectorAll("[data-offer]").forEach((button) => {
    button.onclick = () =>
      confirmAction(
        "Respond to Job Offer",
        "Do you want to submit your response to this offer?",
        async () => {
          await api().recruitment.offerAction(
            offerRecord.id,
            offerRecord.revision,
            button.dataset.offer
          );

          dialog.close();
          await load();

          toast("Your offer response has been submitted.");
        }
      );
  });
}

function examDetails(examRecord) {
  if (examRecord.status === "in-progress") {
    examWorkspace(examRecord);
    return;
  }

  let currentExam = examRecord;
  let clock;
  let poll;
  let updating = false;

  const result = () =>
    currentExam.revealScore && currentExam.score != null
      ? `
        <p>
          Score: ${Number(currentExam.score)}
          / ${Number(currentExam.maxScore)}
        </p>

        ${
          currentExam.passScore != null
            ? `
              <p>
                ${
                  Number(currentExam.score) >=
                  Number(currentExam.passScore)
                    ? "Passed"
                    : "Failed"
                }
              </p>
            `
            : ""
        }

        ${
          currentExam.publishedAt
            ? `
              <p>
                Published at:
                ${safeDate(currentExam.publishedAt)}
              </p>
            `
            : ""
        }
      `
      : `
        <p>
          Results appear after publication by the organization.
        </p>
      `;

  const refresh = async () => {
    if (
      updating ||
      !dialog.host.isConnected ||
      document.hidden
    ) {
      return;
    }

    updating = true;

    try {
      const exams = await api().recruitment.list(
        "exams",
        { current: false }
      );

      const updated = exams.find(
        (record) => record.id === currentExam.id
      );

      if (updated) {
        currentExam = updated;

        dialog.host.querySelector(
          "[data-exam-result]"
        ).innerHTML = result();

        tick();
      }
    } catch (error) {
      toast(errorText(error));
    } finally {
      updating = false;
    }
  };

  const storage = (event) => {
    if (
      event.key === "wusool.database.v2" ||
      event.key === null
    ) {
      refresh();
    }
  };

  const dialog = modal(
    "Exam Details",
    `
      <div class="plain-content">

        <h3>
          ${esc(currentExam.title || "Recruitment Exam")}
        </h3>

        <p>
          Status: ${esc(label(currentExam.status))}
        </p>

        <p>
          Opens: ${safeDate(currentExam.startAt)}
        </p>

        <p>
          Closes: ${safeDate(currentExam.deadlineAt)}
        </p>

        <p>
          Duration:
          ${Number(currentExam.durationMinutes) || 0} minutes
        </p>

        <div data-exam-result>
          ${result()}
        </div>

      </div>
    `,
    {
      onClose: () => {
        clearInterval(clock);
        clearInterval(poll);

        window.removeEventListener("wusool:data-changed", refresh);
        window.removeEventListener("storage", storage);
        document.removeEventListener("visibilitychange", refresh);
      },

      footer:
        currentExam.status === "sent"
          ? `
            <p
              data-exam-countdown
              role="timer"
            ></p>

            <button
              class="btn primary"
              data-start-exam
              disabled
            >
              Start Exam
            </button>
          `
          : "",
    }
  );

  function tick() {
    const button = dialog.host.querySelector("[data-start-exam]");
    const counter = dialog.host.querySelector("[data-exam-countdown]");

    if (!button) return;

    const now = Date.now();
    const start = Date.parse(currentExam.startAt);
    const end = Date.parse(currentExam.deadlineAt);

    button.disabled = !(
      currentExam.status === "sent" &&
      now >= start &&
      now < end
    );

    button.textContent = "Start Exam";

    const countdown =
      window.WusoolRecruitmentPolicy.countdown(
        currentExam.startAt,
        now
      ) || { days: 0, time: "—" };

    counter.textContent =
      now >= end
        ? "Exam closed"
        : now >= start
          ? "Exam is open"
          : "Exam starts in: " +
            (countdown.days ? `${countdown.days} days ` : "") +
            countdown.time;
  }

  tick();

  clock = setInterval(tick, 1000);

  window.addEventListener("wusool:data-changed", refresh);
  window.addEventListener("storage", storage);
  document.addEventListener("visibilitychange", refresh);

  if (api().mode === "api") {
    poll = setInterval(refresh, 15000);
  }

  dialog.host
    .querySelector("[data-start-exam]")
    ?.addEventListener("click", (event) =>
      busy(event.currentTarget, async () => {
        const started = await api().recruitment.startExam(
          currentExam.id,
          currentExam.revision
        );

        dialog.close();
        examWorkspace(started);
      })
    );
}

function examWorkspace(initialExam) {
  let currentExam = initialExam;
  let saving = Promise.resolve();
  let dirty = false;
  let saveTimer = null;
  let clock = null;
  let closed = false;
  let submitting = false;

  const finishTime = () =>
    Math.min(
      Date.parse(currentExam.deadlineAt),
      Date.parse(currentExam.startedAt) +
        Number(currentExam.durationMinutes) * 60000
    );

  const dialog = modal(
    "Recruitment Exam",
    `
      <p
        class="exam-clock"
        data-clock
        role="timer"
      ></p>

      <form id="exam-form">

        ${(currentExam.questions || [])
          .map(
            (question, index) => `
              <fieldset class="exam-question">

                <legend>
                  ${index + 1}. ${esc(question.text)}
                </legend>

                ${question.options
                  .map(
                    (option) => `
                      <label class="option">

                        <input
                          type="radio"
                          name="${esc(question.id)}"
                          value="${esc(option)}"
                          ${
                            currentExam.savedAnswers?.[question.id] ===
                            option
                              ? "checked"
                              : ""
                          }
                        >

                        ${esc(option)}

                      </label>
                    `
                  )
                  .join("")}

              </fieldset>
            `
          )
          .join("")}

        <p
          class="muted"
          data-save-status
        >
          Your answers are saved while you work.
        </p>

        <div class="form-actions">

          <button
            class="btn outline"
            type="button"
            data-save-exam
          >
            Save Answers
          </button>

          <button
            class="btn primary"
            type="submit"
          >
            Submit Exam
          </button>

        </div>

        <p
          class="validation"
          data-error
          role="alert"
        ></p>

      </form>
    `,
    {
      wide: true,

      onClose: () => {
        closed = true;

        clearInterval(clock);
        clearTimeout(saveTimer);

        if (dirty && Date.now() < finishTime()) {
          save();
        }
      },
    }
  );

  const answers = () =>
    Object.fromEntries(
      new FormData(dialog.host.querySelector("form"))
    );

  function save() {
    if (!dirty) return saving;

    const snapshot = answers();
    dirty = false;

    saving = saving
      .catch(() => {})
      .then(async () => {
        if (Date.now() >= finishTime()) return;

        try {
          currentExam = await api().recruitment.saveExamAnswers(
            currentExam.id,
            currentExam.revision,
            { answers: snapshot }
          );

          if (!closed) {
            dialog.host.querySelector(
              "[data-save-status]"
            ).textContent = "Answers saved.";
          }
        } catch (error) {
          dirty = true;

          if (!closed) {
            dialog.host.querySelector(
              "[data-error]"
            ).textContent = errorText(error);
          }

          throw error;
        }
      });

    saving.catch(() => {});
    return saving;
  }

  async function submit(expired = false) {
    if (submitting) return;

    submitting = true;

    try {
      clearTimeout(saveTimer);

      if (!expired) {
        await save();
      } else {
        await saving.catch(() => {});
      }

      currentExam = await api().recruitment.submitExam(
        currentExam.id,
        currentExam.revision,
        expired ? {} : { answers: answers() }
      );

      dialog.close();

      toast(
        expired
          ? "Time is up. Your saved answers were submitted."
          : "Your exam was submitted to the organization."
      );

      await load();
    } catch (error) {
      if (!closed) {
        dialog.host.querySelector(
          "[data-error]"
        ).textContent = errorText(error);
      }

      submitting = false;
    }
  }

  dialog.host.querySelector("form").onchange = () => {
    dirty = true;

    clearTimeout(saveTimer);

    saveTimer = setTimeout(
      () => save().catch(() => {}),
      800
    );
  };

  dialog.host.querySelector("[data-save-exam]").onclick = (event) =>
    busy(event.currentTarget, () => save());

  dialog.host.querySelector("form").onsubmit = (event) => {
    event.preventDefault();

    confirmAction(
      "Submit Exam",
      "You cannot change your answers after submission.",
      () => submit()
    );
  };

  function tick() {
    if (closed) return;

    const remaining = Math.max(
      0,
      finishTime() - Date.now()
    );

    const minutes = String(
      Math.floor(remaining / 60000)
    ).padStart(2, "0");

    const seconds = String(
      Math.floor((remaining % 60000) / 1000)
    ).padStart(2, "0");

    dialog.host.querySelector("[data-clock]").textContent =
      `Time remaining: ${minutes}:${seconds}`;

    if (!remaining) {
      dialog.host
        .querySelectorAll("input,button")
        .forEach((element) => {
          element.disabled = true;
        });

      submit(true);
    }
  }

  tick();

  clock = setInterval(tick, 1000);
}
