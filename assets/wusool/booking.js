
import { institutions, services, branches } from "./data.js";
import { store, api, errorText, refreshBookings } from "./store.js";
import { shell, heading, busy } from "./ui.js";
import { esc, icon, logo, href, empty, toast } from "./components.js";

export function jordanToday() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Amman",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );

  return `${p.year}-${p.month}-${p.day}`;
}

function nextDay() {
  const d = new Date(jordanToday() + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

let draft = null,
  version = 0;

const org = () =>
  institutions.find((x) => x.id === draft.institutionId);

const branch = () =>
  branches.find(
    (x) =>
      x.id === draft.branchId &&
      x.organizationId === draft.institutionId,
  );

const service = () =>
  services.find(
    (x) =>
      x.id === draft.serviceId &&
      x.branchId === draft.branchId,
  );

const bookingUrl = (b) => {
  const url = b?.officialUrl || b?.sourceUrl || "";
  return /^https?:\/\//i.test(url) ? url : "";
};

const externalNotice = (b) =>
  `<div class="empty-state">
    ${icon("search")}
    <p>
      This branch accepts bookings through its official website.
      ${
        bookingUrl(b)
          ? `<a
              href="${esc(bookingUrl(b))}"
              target="_blank"
              rel="noopener noreferrer"
            >Open Official Website</a>`
          : ""
      }
    </p>
  </div>`;

// English display labels for booking availability reasons.
const unavailableReasons = {
  SERVICE_UNAVAILABLE:
    "This service is not available for booking.",
  BRANCH_BOOKING_DISABLED:
    "Online booking is disabled for this branch.",
  HOURS_UNAVAILABLE:
    "The branch's working hours have not been configured.",
  SUBSCRIPTION_RESTRICTED:
    "Online booking is temporarily unavailable.",
};


const unavailableReason = (code) => {
  if (unavailableReasons[code]) {
    return unavailableReasons[code];
  }

  // Preserve descriptive English configuration reasons.
  // Unknown codes and untranslated text use a safe fallback.
  if (
    typeof code === "string" &&
    /[a-z]/.test(code) &&
    /^[\x20-\x7E]+$/.test(code)
  ) {
    return code.trim();
  }

  return "Booking is currently unavailable for this service.";
};


// Keep the booking draft synchronized with the branch radio selection.
// Reset downstream selections when a different branch is chosen.
function resetBranch(id) {
  draft.branchId = id;
  draft.serviceId = null;
  draft.time = null;
  draft.slots = [];
  draft.key = crypto.randomUUID();
}

function prepare() {
  if (draft) return;

  const q = new URLSearchParams(location.search);

  const selectedService = services.find(
    (x) =>
      x.id === q.get("service") &&
      (!q.get("branch") || x.branchId === q.get("branch")),
  );

  const selectedBranch = branches.find(
    (x) =>
      x.id ===
      (q.get("branch") || selectedService?.branchId),
  );

  const selectedOrg =
    institutions.find(
      (x) =>
        x.id ===
        (q.get("institution") ||
          selectedService?.institutionId ||
          selectedBranch?.organizationId),
    ) || institutions[0];

  const date = nextDay();

  const contextual =
    selectedService &&
    selectedBranch &&
    selectedService.branchId === selectedBranch.id &&
    selectedService.institutionId === selectedOrg?.id &&
    selectedBranch.organizationId === selectedOrg?.id;

  draft = {
    step: contextual
      ? 4
      : selectedOrg && q.has("institution")
        ? 2
        : 1,

    context: contextual
      ? {
          institutionId: selectedOrg.id,
          branchId: selectedBranch.id,
          serviceId: selectedService.id,
        }
      : null,

    institutionId: selectedOrg?.id || null,

    branchId:
      selectedBranch?.organizationId === selectedOrg?.id
        ? selectedBranch.id
        : null,

    serviceId:
      selectedService?.institutionId === selectedOrg?.id
        ? selectedService.id
        : null,

    date,
    time: null,

    month: Number(date.slice(5, 7)) - 1,
    year: Number(date.slice(0, 4)),

    notes: "",
    assistance: false,
    key: crypto.randomUUID(),
    slots: [],
  };
}

function calendar() {
  const offset = new Date(
    Date.UTC(draft.year, draft.month, 1),
  ).getUTCDay();

  const count = new Date(
    Date.UTC(draft.year, draft.month + 1, 0),
  ).getUTCDate();

  const name = new Intl.DateTimeFormat("en", {
    month: "long",
    timeZone: "UTC",
  }).format(
    new Date(Date.UTC(draft.year, draft.month, 1)),
  );

  const today = jordanToday();

  let cells = "<span></span>".repeat(offset);

  for (let day = 1; day <= count; day++) {
    const date =
      `${draft.year}-${String(draft.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    cells += `
      <button
        data-date="${date}"
        class="${draft.date === date ? "active" : ""}"
        ${date < today ? "disabled" : ""}
        aria-pressed="${draft.date === date}"
        aria-label="${day} ${name} ${draft.year}"
      >
        ${day}
      </button>
    `;
  }

  return `
    <div class="calendar">

      <div class="calendar-header">
        <button
          class="icon-btn"
          data-month="-1"
          aria-label="Previous month"
        >
          ${icon("back")}
        </button>

        <strong>${name} ${draft.year}</strong>

        <button
          class="icon-btn"
          data-month="1"
          aria-label="Next month"
        >
          ${icon("arrow")}
        </button>
      </div>

      <div class="calendar-grid">
        ${[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ]
          .map((day) => `<small>${day}</small>`)
          .join("")}

        ${cells}
      </div>

    </div>
  `;
}

function content() {
  const o = org();
  const b = branch();
  const s = service();

  // STEP 1: Select Organization
  if (draft.step === 1) {
    return `
      <h2>Select Organization</h2>

      <div class="wizard-options">
        ${institutions
          .filter(
            (x) =>
              !draft.context ||
              x.id === draft.context.institutionId,
          )
          .map(
            (x) => `
              <label class="option">
                ${logo(x)}

                <input
                  type="radio"
                  name="institution"
                  value="${esc(x.id)}"
                  ${x.id === draft.institutionId ? "checked" : ""}
                >

                ${esc(x.name)}
              </label>
            `,
          )
          .join("")}
      </div>
    `;
  }

  // STEP 2: Select Branch
  if (draft.step === 2) {
    return `
      <h2>Select Branch</h2>

      <div class="wizard-options">
        ${
          branches
            .filter(
              (x) =>
                x.organizationId === o?.id &&
                (!draft.context ||
                  x.id === draft.context.branchId),
            )
            .map(
              (x) => `
                <label class="option">
                  <input
                    type="radio"
                    name="branch"
                    value="${esc(x.id)}"
                    ${x.id === draft.branchId ? "checked" : ""}
                  >

                  <span>
                    ${esc(x.branchName)}

                    <small class="muted block">
                      ${esc(x.address || x.city || "")}
                    </small>

                    ${
                      x.bookingEnabled === false
                        ? `<small class="muted block">
                            Booking is available through the branch's official website.
                          </small>`
                        : ""
                    }
                  </span>
                </label>
              `,
            )
            .join("") ||
          empty(
            "No published branches are available for this organization.",
          )
        }
      </div>
    `;
  }

  // STEP 3: Select Service
  if (draft.step === 3) {
    return `
      <h2>Select Service</h2>

      <div class="wizard-options">
        ${
          services
            .filter(
              (x) =>
                x.branchId === b?.id &&
                (!draft.context ||
                  x.id === draft.context.serviceId),
            )
            .map(
              (x) => `
                <label class="option">
                  <input
                    type="radio"
                    name="service"
                    value="${esc(x.id)}"
                    ${x.id === draft.serviceId ? "checked" : ""}
                  >

                  <span>
                    ${esc(x.name)}

                    <small class="muted block">
                      ${esc(x.description)}
                    </small>

                    ${
                      x.bookingEligible === false
                        ? `<small class="muted block">
                            ${esc(
                              unavailableReason(x.unbookableReason),
                            )}
                          </small>`
                        : ""
                    }
                  </span>
                </label>
              `,
            )
            .join("") ||
          empty(
            "No available services have been published for this branch.",
          )
        }
      </div>
    `;
  }

  // STEP 4: Choose Date & Time
  if (draft.step === 4) {
    return `
      <h2>Choose Date & Time</h2>

      <div class="calendar-slot-layout">
        <div>
          <label class="field">
            Date

            <input
              type="date"
              id="booking-date"
              min="${jordanToday()}"
              value="${draft.date}"
              required
            >
          </label>

          <p class="muted">
            Available appointments follow the branch's
            working hours • Jordan time
          </p>

          <label class="option">
            <input
              id="booking-assistance"
              type="checkbox"
              ${draft.assistance ? "checked" : ""}
            >

            I need assistance during my visit
          </label>

          <p class="muted">
            Assistance depends on branch capacity
            at the selected time.
          </p>

          <div
            class="time-slots"
            id="available-slots"
            aria-live="polite"
          >
            <p>Loading available times...</p>
          </div>
        </div>

        ${calendar()}
      </div>
    `;
  }

  // STEP 5: Additional Details
  if (draft.step === 5) {
    return `
      <h2>Additional Details</h2>

      <label class="field">
        Notes

        <textarea
          id="booking-notes"
          maxlength="1000"
          placeholder="Add any details that may help the organization prepare for your visit"
        >${esc(draft.notes)}</textarea>
      </label>
    `;
  }

  // STEP 6: Confirm Booking
  return `
    <h2>Confirm Booking</h2>

    <div class="plain-content">
      <h3>${esc(s?.name)}</h3>

      <p>
        ${esc(o?.name)} — ${esc(b?.branchName)}
      </p>

      <p>
        <bdi>${draft.date} ${draft.time}</bdi>
        • Jordan time
      </p>

      ${
        draft.notes
          ? `<p>${esc(draft.notes)}</p>`
          : ""
      }

      ${
        draft.assistance
          ? `<p>Assistance has been requested for this visit.</p>`
          : ""
      }

      <p>
        Your booking will be sent to the organization
        for approval. It will only be confirmed after
        they approve it.
      </p>

      <label class="option">
        <input
          type="checkbox"
          id="booking-consent"
        >

        I confirm that the booking details are correct
      </label>
    </div>
  `;
}

export function renderWizard() {
  prepare();

  if (!institutions.length) {
    shell(
      `${heading("Book Appointment")}${empty(
        "There are no organizations with published branches available for booking.",
      )}`,
    );

    return;
  }

  const o = org();
  const b = branch();
  const s = service();

  const steps = [
    "Select Organization",
    "Select Branch",
    "Select Service",
    "Choose Date & Time",
    "Additional Details",
    "Confirm Booking",
  ];

  shell(
    `
      ${heading("Book Appointment")}

      <div class="stepper" aria-label="Booking steps">
        ${steps
          .map(
            (text, i) => `
              <div
                class="step ${
                  i + 1 === draft.step
                    ? "active"
                    : i + 1 < draft.step
                      ? "complete"
                      : ""
                }"
                ${
                  i + 1 === draft.step
                    ? 'aria-current="step"'
                    : ""
                }
              >
                <span>${i + 1}</span>
                ${text}
              </div>
            `,
          )
          .join("")}
      </div>

      <div class="wizard-layout">
        <section class="panel">
          ${
            draft.step > 1
              ? `<button
                  class="btn outline wizard-back"
                  data-previous
                >Previous</button>`
              : ""
          }

          ${content()}

          <p
            class="validation"
            id="wizard-error"
            role="alert"
          ></p>
        </section>

        <aside class="panel booking-summary">
          <h2>Booking Summary</h2>

          <div class="summary-org">
            ${logo(o)}
            <span>${esc(o?.name)}</span>
          </div>

          <h3>${esc(s?.name || "Select a service")}</h3>

          <p>${esc(b?.branchName || "Select a branch")}</p>

          <div class="summary-date">
            ${icon("calendar")}

            <bdi>
              ${draft.date} ${draft.time || "—"}
            </bdi>
          </div>

          <button
            class="btn ${
              draft.step === 6 ? "primary" : "soft"
            }"
            data-next
          >
            ${
              draft.step === 6
                ? "Submit Booking"
                : "Next"
            }
          </button>
        </aside>
      </div>
    `,
    "",
    "booking-page",
  );

  const capture = () => {
    draft.notes =
      document.querySelector("#booking-notes")?.value ??
      draft.notes;

    draft.assistance =
      document.querySelector("#booking-assistance")?.checked ??
      draft.assistance;
  };

  const fail = (text) =>
    (document.querySelector("#wizard-error").textContent = text);

  // Previous button
  document
    .querySelector("[data-previous]")
    ?.addEventListener("click", () => {
      capture();
      version++;
      draft.step--;
      renderWizard();
    });

  // Next / Submit button
  document.querySelector("[data-next]").onclick = (e) =>
    busy(e.currentTarget, async () => {
      capture();

      if (draft.step === 1 && !org()) {
        return fail("Please select an organization.");
      }

      if (draft.step === 2 && !branch()) {
        return fail("Please select a published branch.");
      }

      if (
        draft.step === 2 &&
        branch().bookingEnabled === false
      ) {
        return fail(
          "This branch accepts bookings through its official website and cannot be booked here.",
        );
      }

      if (draft.step === 3 && !service()) {
        return fail(
          "Please select an available service at this branch.",
        );
      }

      if (
        draft.step === 4 &&
        (!draft.time || !draft.slots.includes(draft.time))
      ) {
        return fail(
          "Please choose an available appointment time.",
        );
      }

      if (draft.step === 6) {
        if (
          !document.querySelector("#booking-consent").checked
        ) {
          return fail(
            "Please confirm that your booking details are correct.",
          );
        }

        const result = await store.createBooking(
          draft,
          draft.key,
        );

        location.assign(
          href("my-visits", { created: result.id }),
        );

        return;
      }

      draft.step++;
      renderWizard();
    });

  // Organization selection
  for (
    const input of document.querySelectorAll(
      '[name="institution"]',
    )
  ) {
    input.onchange = () => {
      draft.institutionId = input.value;
      resetBranch(null);
      renderWizard();
    };
  }

  // Branch selection
  for (
    const input of document.querySelectorAll(
      '[name="branch"]',
    )
  ) {
    input.onchange = () => {
      resetBranch(input.value);
      renderWizard();
    };
  }

  // Service selection
  for (
    const input of document.querySelectorAll(
      '[name="service"]',
    )
  ) {
    input.onchange = () => {
      draft.serviceId = input.value;
      draft.time = null;
      renderWizard();
    };
  }

  // Calendar date buttons
  for (
    const btn of document.querySelectorAll("[data-date]")
  ) {
    btn.onclick = () => selectDate(btn.dataset.date);
  }

  document
    .querySelector("#booking-date")
    ?.addEventListener("change", (e) => {
      if (e.target.reportValidity()) {
        selectDate(e.target.value);
      }
    });

  // Calendar month navigation
  for (
    const btn of document.querySelectorAll("[data-month]")
  ) {
    btn.onclick = () => {
      version++;

      const d = new Date(
        Date.UTC(
          draft.year,
          draft.month + Number(btn.dataset.month),
          1,
        ),
      );

      draft.year = d.getUTCFullYear();
      draft.month = d.getUTCMonth();

      renderWizard();
    };
  }

  // Accessibility assistance
  document
    .querySelector("#booking-assistance")
    ?.addEventListener("change", (e) => {
      draft.assistance = e.target.checked;
      draft.time = null;
      draft.slots = [];

      renderWizard();
    });

  if (draft.step === 4) {
    loadSlots();
  }
}

function selectDate(date) {
  draft.date = date;
  draft.time = null;
  draft.slots = [];

  draft.year = Number(date.slice(0, 4));
  draft.month = Number(date.slice(5, 7)) - 1;

  renderWizard();
}

async function loadSlots() {
  const revision = ++version;

  try {
    const result = await api().getBookingAvailability(
      draft.branchId,
      draft.date,
      draft.serviceId,
      {
        requiresAssistant: draft.assistance,
      },
    );

    if (
      revision !== version ||
      draft.step !== 4
    ) {
      return;
    }

    // External booking provider
    if (result.externalBooking) {
      draft.slots = [];
      draft.time = null;

      const box = document.querySelector(
        "#available-slots",
      );

      if (box) {
        box.innerHTML = externalNotice({
          ...branch(),
          officialUrl: result.officialUrl,
        });
      }

      return;
    }

    draft.slots = result.slots || [];

    draft.availabilityReason = result.reason || "";

    if (!draft.slots.includes(draft.time)) {
      draft.time = null;
    }

    const target = document.querySelector(
      "#available-slots",
    );

    if (!target) return;

    target.innerHTML = draft.slots.length
      ? draft.slots
          .map(
            (time) => `
              <button
                class="time-slot ${
                  time === draft.time ? "active" : ""
                }"
                data-time="${time}"
                aria-pressed="${time === draft.time}"
              >
                ${time}
              </button>
            `,
          )
          .join("")
      : empty(
          draft.availabilityReason === "HOURS_UNAVAILABLE"
            ? "The organization has not configured working hours for this branch yet."
            : "No appointments are available on this day. Please choose another date.",
        );

    target
      .querySelectorAll("[data-time]")
      .forEach((btn) => {
        btn.onclick = () => {
          draft.time = btn.dataset.time;

          target
            .querySelectorAll("[data-time]")
            .forEach((el) => {
              el.classList.toggle(
                "active",
                el === btn,
              );

              el.setAttribute(
                "aria-pressed",
                el === btn,
              );
            });

          document.querySelector(
            ".summary-date bdi",
          ).textContent = `${draft.date} ${draft.time}`;
        };
      });
  } catch (error) {
    if (revision !== version) return;

    draft.slots = [];

    const target = document.querySelector(
      "#available-slots",
    );

    if (target) {
      target.innerHTML = empty(errorText(error));
    }
  }
}
