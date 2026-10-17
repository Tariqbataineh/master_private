
import { api, errorText, refreshBookings, statusLabel } from "./store.js";
import { institutions, branches } from "./data.js";
import {
  esc,
  icon,
  asset,
  favoriteButton,
  modal,
  toast,
} from "./components.js";
import { bindFavorites, busy, safeDate } from "./ui.js";
import { mapMarkup, mountMap, point } from "./map.js";

let activeClose = null;

// Translate presentation labels only. The stored booking, branch, IDs,
// journey events, and API payloads remain unchanged.
const englishStatuses = {
  pending: "Pending approval",
  confirmed: "Confirmed",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No show",
  waitlisted: "Waitlisted",
};

const historyLabels = {
  approve: "Organization approval",
  depart: "On the way",
  arrive: "Checked in",
  receive: "Visitor received",
  finish: "Visit completed",
  cancel: "Visit cancelled",
  "booking-created": "Booking created",
  "queue-called": "Your turn was called",
};

function displayHistoryReason(event) {
  if (event.reasonEn) return event.reasonEn;
  if (event.reason === "رد المستخدم من بوابة الزيارة") {
    return "User response from the visit portal";
  }
  return event.reason || "";
}

export async function tracking(booking, onChange = () => {}) {
  activeClose?.();

  let dialog = null;
  let liveMap = null;
  let timer = null;
  let closed = false;
  let current = null;
  let refreshing = false;
  let previousRevision = null;

  function stop() {
    if (closed) return;
    closed = true;

    clearInterval(timer);
    liveMap?.destroy();

    window.removeEventListener("storage", onStorage);
    window.removeEventListener("wusool:data-changed", update);
    document.removeEventListener("visibilitychange", onVisibility);

    activeClose = null;

    [...document.querySelectorAll("[data-track]")]
      .find((element) => element.dataset.track === booking.id)
      ?.focus();
  }

  const onStorage = (event) => {
    if (event.key === "wusool.database.v2") update();
  };

  const onVisibility = () => {
    if (!document.hidden) update();
  };

  try {
    current = await api().getVisitTracking(booking.id);

    dialog = modal(
      "Track Visit",
      `
        <div class="tracking-columns">
          <section>
            <div id="visit-timeline" class="timeline" aria-live="polite"></div>
            <div id="visit-actions" class="tracking-actions"></div>
            <p class="validation" role="status" id="visit-error"></p>
          </section>

          <div class="tracking-map">
            ${mapMarkup("visit-live-map")}

            <div class="location-actions">
              <button class="btn soft" data-live-location>
                ${icon("locate")} Enable Location & Route
              </button>
              <small class="muted">
                With your permission, your device's location is used to
                calculate a route through the map provider. Location tracking
                stops when this window is closed.
              </small>
            </div>

            <div id="tracking-place"></div>
          </div>
        </div>

        <details class="history-panel">
          <summary>Visit Update History</summary>
          <div id="visit-history"></div>
        </details>

        <div class="form-actions">
          <button class="btn outline" type="button" data-close-tracking>
            Cancel
          </button>
        </div>
      `,
      { wide: true, onClose: stop },
    );

    activeClose = dialog.close;
    dialog.host.querySelector("[data-close-tracking]").onclick = () =>
      dialog.close();

    draw(true);

    liveMap = mountMap(dialog.host, {
      destination: current.branch,
      tracking: true,
    });

    dialog.host.querySelector("[data-live-location]").onclick = () =>
      liveMap.locate();

    timer = setInterval(update, 5000);
    window.addEventListener("storage", onStorage);
    window.addEventListener("wusool:data-changed", update);
    document.addEventListener("visibilitychange", onVisibility);
  } catch (error) {
    stop();
    toast(errorText(error));
    return;
  }

  async function update() {
    if (closed || refreshing || document.hidden) return;
    refreshing = true;

    try {
      const value = await api().getVisitTracking(booking.id);
      if (closed) return;

      const signature = JSON.stringify([
        value.booking.revision,
        value.queue,
        value.canDepart,
        value.canArrive,
        value.notice,
      ]);

      current = value;

      if (signature !== previousRevision) {
        previousRevision = signature;
        draw();
        await refreshBookings();
        onChange();
      }
    } catch (error) {
      if (!closed) {
        dialog.host.querySelector("#visit-error").textContent =
          errorText(error);

        if (
          ["FORBIDDEN", "UNAUTHENTICATED", "ACCOUNT_BLOCKED", "NOT_FOUND"]
            .includes(error.code)
        ) {
          dialog.close();
          toast(errorText(error));
        }
      }
    } finally {
      refreshing = false;
    }
  }

  function draw(initial = false) {
    const visit = current.booking;
    const journeyState = visit.journeyState || "not-started";
    const status = String(visit.status).toLowerCase().replaceAll(" ", "-");
    const queue = current.queue || {};

    const cancelled = ["cancelled", "no-show"].includes(status);
    const confirmed = ["confirmed", "in-progress", "completed"].includes(status);

    const steps = [
      [
        "Appointment Confirmation",
        confirmed
          ? visit.journeyHistory?.find((event) => event.event === "approve")?.at ||
              visit.updatedAt
          : visit.createdAt,
        confirmed ? "done" : "current",
        confirmed ? "Appointment confirmed" : "Awaiting organization approval",
        confirmed ? "check" : "clock",
      ],
      [
        "On the Way",
        visit.departedAt,
        ["on-the-way", "arrived", "serving", "completed"].includes(journeyState)
          ? "done"
          : "",
        'Displayed after selecting "I\'m on My Way"',
        "route",
      ],
      [
        "Arrival at Branch",
        visit.arrivedAt,
        ["arrived", "serving", "completed"].includes(journeyState)
          ? "done"
          : "",
        "Confirm your arrival when you reach the branch",
        "pin",
      ],
      [
        "Waiting in Queue",
        visit.calledAt,
        journeyState === "arrived"
          ? "current"
          : ["serving", "completed"].includes(journeyState)
            ? "done"
            : "",
        queue.position
          ? `Your queue position: ${queue.position} • ${queue.ahead} ahead of you • Estimated wait: ${queue.estimatedMinutes ?? "—"} minutes`
          : queue.called
            ? "Your number has been called. Please go to reception."
            : "Your queue position will appear after check-in",
        "wait",
      ],
      [
        "Receiving Service",
        visit.receivedAt,
        journeyState === "serving"
          ? "current"
          : journeyState === "completed"
            ? "done"
            : "",
        journeyState === "completed"
          ? "Your visit has been completed"
          : "This status is updated by organization staff",
        "service",
      ],
    ];

    const statusText = englishStatuses[status] || statusLabel(status);
    const notice = current.noticeEn || current.notice || "";

    dialog.host.querySelector("#visit-timeline").innerHTML = `
      <p class="tracking-status">
        ${esc(statusText)}${cancelled ? " — Visit closed" : ""}
      </p>
      ${steps
        .map(
          ([title, at, className, description, stepIcon]) => `
            <div class="timeline-step ${cancelled ? "" : className}">
              <span>${icon(className === "done" ? "check" : stepIcon)}</span>
              <div>
                <h3>${esc(title)}</h3>
                <p>${esc(description)}</p>
                ${at ? `<small class="muted">${esc(safeDate(at))}</small>` : ""}
              </div>
            </div>
          `,
        )
        .join("")}
      ${notice ? `<p class="notice">${esc(notice)}</p>` : ""}
    `;

    const actions = dialog.host.querySelector("#visit-actions");

    actions.innerHTML = `
      ${
        current.canDepart
          ? '<button class="btn primary" data-journey="depart">I\'m on My Way</button>'
          : ""
      }
      ${
        current.canArrive
          ? '<button class="btn primary" data-journey="arrive">I Have Arrived</button>'
          : ""
      }
      ${
        status === "confirmed"
          ? '<button class="btn outline" data-pass>Visit QR Pass</button>'
          : ""
      }
      ${
        !current.canDepart &&
        journeyState === "not-started" &&
        status === "confirmed"
          ? '<p class="muted">"I\'m on My Way" becomes available on the appointment date, from two hours before the appointment until its start time.</p>'
          : ""
      }
      ${
        visit.appointmentProposal
          ? `
            <div class="notice">
              <p>
                Proposed appointment:
                <bdi>${esc(visit.appointmentProposal.date)} ${esc(visit.appointmentProposal.time)}</bdi>
              </p>
              <button class="btn primary" data-proposal="yes">Accept Appointment</button>
              <button class="btn outline" data-proposal="no">Decline Appointment</button>
            </div>
          `
          : ""
      }
    `;

    actions.querySelectorAll("[data-journey]").forEach((button) => {
      button.onclick = (event) =>
        busy(event.currentTarget, async () => {
          await api().journey.change(visit.id, button.dataset.journey, {
            expectedRevision: visit.revision,
          });
          await update();
          toast("Your visit status has been updated.");
        });
    });

    actions.querySelectorAll("[data-proposal]").forEach((button) => {
      button.onclick = (event) =>
        busy(event.currentTarget, async () => {
          await api().visits.respond(
            visit.id,
            button.dataset.proposal === "yes",
            "رد المستخدم من بوابة الزيارة",
            visit.revision,
          );
          await update();
        });
    });

    actions.querySelector("[data-pass]")?.addEventListener("click", (event) =>
      busy(event.currentTarget, async () => {
        const pass = await api().visits.pass(visit.id);

        const popup = modal(
          "Visit QR Pass",
          `
            <div class="visit-pass">
              <div data-qr></div>
              <strong>${esc(pass.reference || visit.reference)}</strong>
              <p><bdi>${esc(visit.date)} ${esc(visit.time)}</bdi></p>
              <p>Show this QR code to reception staff only.</p>
            </div>
          `,
        );

        const code = window.qrcode(0, "M");
        code.addData(pass.payload);
        code.make();
        popup.host.querySelector("[data-qr]").innerHTML = code.createSvgTag(5, 0);
      }),
    );

    dialog.host.querySelector("#visit-history").innerHTML =
      (visit.journeyHistory || [])
        .map(
          (event) => `
            <div class="history-row">
              <strong>${esc(historyLabels[event.event] || "Visit updated")}</strong>
              <span>${esc(safeDate(event.at))}</span>
              ${
                event.reason || event.reasonEn
                  ? `<p>${esc(displayHistoryReason(event))}</p>`
                  : ""
              }
            </div>
          `,
        )
        .join("") || "<p>No visit updates have been recorded yet.</p>";

    if (initial) {
      const destination = current.branch;
      const catalogBranch = branches.find((item) => item.id === destination.id);
      const organizationId =
        destination.organizationId || visit.organizationId || booking.organizationId;
      const catalogOrganization = institutions.find(
        (item) => item.id === organizationId,
      );

      const branchName =
        catalogBranch?.branchName ||
        destination.branchNameEn ||
        destination.nameEn ||
        destination.branchName ||
        destination.name ||
        booking.branch ||
        "Branch";

      const organizationName =
        catalogOrganization?.name ||
        destination.organizationNameEn ||
        destination.organizationName ||
        booking.placeName ||
        "Organization";

      const address =
        catalogBranch?.address || destination.addressEn || destination.address;
      const city = catalogBranch?.city || destination.cityEn || destination.city;
      const firstPhoto = destination.photos?.[0];
      const photo =
        typeof firstPhoto === "string"
          ? firstPhoto
          : firstPhoto?.url || firstPhoto?.imageData;

      const coordinates = point(destination);
      const url = coordinates
        ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [
              destination.organizationName,
              destination.name,
              destination.address,
              destination.city,
            ]
              .filter(Boolean)
              .join(" "),
          )}`;

      dialog.host.querySelector("#tracking-place").innerHTML = `
        <article class="tracking-place">
          ${
            photo
              ? `<img src="${asset(photo)}" alt="${esc(branchName)}">`
              : ""
          }
          <div>
            <h3>${esc(organizationName)}</h3>
            <p>${esc(branchName)}</p>
            <p>${esc([address, city].filter(Boolean).join(", "))}</p>
            ${
              !coordinates
                ? '<p class="muted">Branch coordinates are unavailable.</p>'
                : ""
            }
            <a
              class="btn soft"
              href="${esc(url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${icon("pin")} Open in Google Maps
            </a>
          </div>
          ${favoriteButton(visit.organizationId)}
        </article>
      `;

      bindFavorites(dialog.host);
    }
  }
}
