
import { institutions } from "./data.js";
import { store } from "./store.js";

export const base = new URL("../../", import.meta.url);

// --------------------------------------------------
// URLs and assets
// --------------------------------------------------

export function esc(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]
  );
}

export function asset(name) {
  if (!name) return "";

  const value = String(name);

  if (/^data:image\/(png|jpeg|webp|gif);base64,/i.test(value)) {
    return esc(value);
  }

  if (/^(https?:|blob:)/i.test(value)) {
    return esc(value);
  }

  if (value.includes("/") && !value.startsWith("logo-")) {
    return esc(
      new URL(value.replace(/^(\.\.\/)+/, ""), base).href
    );
  }

  return esc(new URL(`public/images/${value}`, base).href);
}

export const href = (page, params = {}) => {
  const url = new URL(`user/html/${page}.html`, base);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.href;
};

export function officialUrl(value) {
  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol)
      ? esc(url.href)
      : "#";
  } catch {
    return "#";
  }
}

// --------------------------------------------------
// Icons
// --------------------------------------------------

const icons = {
  search: "search",
  bell: "bell-fill",
  user: "person-fill",
  heart: "heart",
  heartFill: "heart-fill",
  bookmark: "bookmark",
  calendar: "calendar3",
  pin: "geo-alt-fill",
  arrow: "chevron-left",
  back: "chevron-right",
  close: "x-lg",
  check: "check-lg",
  clock: "clock",
  government: "bank",
  finance: "person-vcard",
  health: "clipboard2-pulse",
  education: "book",
  telecom: "broadcast",
  digital: "phone",
  more: "three-dots",
  access: "universal-access",
  settings: "sliders",
  globe: "globe2",
  menu: "list",
  map: "map",
  locate: "crosshair",
  plus: "plus",
  minus: "dash",
  help: "question-circle",
  logout: "box-arrow-right",
  star: "star-fill",
  home: "house",
  route: "signpost-2",
  wait: "hourglass-split",
  service: "flag",
  chat: "chat-dots",
  building: "buildings",
  shield: "shield-check",
  mail: "envelope",
  phone: "telephone",
};

export const icon = (name, cls = "") => `
  <i
    class="bi bi-${icons[name] || name} ${cls}"
    aria-hidden="true"
  ></i>
`;

// --------------------------------------------------
// Shared UI components
// --------------------------------------------------

export const logo = (org, cls = "") =>
  org?.logo
    ? `
      <img
        class="org-logo ${cls}"
        src="${asset(org.logo)}"
        alt="${esc(org.name)} logo"
        width="60"
        height="60"
      >
    `
    : `
      <span
        class="org-logo logo-placeholder ${cls}"
        aria-label="${esc(org?.name || "Organization")}"
      >
        ${icon("building")}
      </span>
    `;

export const button = (
  text,
  action,
  style = "primary",
  ic = ""
) => `
  <button
    type="button"
    class="btn ${style}"
    ${action}
  >
    ${ic ? icon(ic) : ""}
    ${text}
  </button>
`;

export function search(
  placeholder,
  value = "",
  id = "search",
  label = "Search"
) {
  return `
    <form
      class="search-box"
      role="search"
      data-search-form
    >
      <label
        class="sr-only"
        for="${esc(id)}"
      >
        ${esc(label)}
      </label>

      <button
        class="icon-btn"
        aria-label="Search"
        type="submit"
      >
        ${icon("search")}
      </button>

      <input
        id="${esc(id)}"
        type="search"
        placeholder="${esc(placeholder)}"
        value="${esc(value)}"
        autocomplete="off"
      >
    </form>
  `;
}

export const badge = (text, cls = "") => `
  <span class="badge ${cls}">
    ${esc(text)}
  </span>
`;

export function favoriteButton(id, heart = false) {
  const selected = store.favorites().includes(id);

  return `
    <button
      type="button"
      class="icon-btn favorite ${heart ? "heart" : ""}
        ${selected ? "selected" : ""}"
      data-favorite="${esc(id)}"
      aria-label="${selected ? "Remove from favorites" : "Add to favorites"}"
      aria-pressed="${selected}"
    >
      ${icon(
        heart
          ? selected
            ? "heartFill"
            : "heart"
          : "bookmark"
      )}
    </button>
  `;
}

// --------------------------------------------------
// Institution cards
// --------------------------------------------------

export function institutionCard(org, favorite = false) {
  return `
    <article class="institution-card">

      ${
        org.image
          ? `
            <img
              class="institution-photo"
              src="${asset(org.image)}"
              alt="${esc(org.name)} ${
                org.directoryOnly
                  ? "directory photo"
                  : "building"
              }"
              loading="lazy"
            >
          `
          : `
            <div class="neutral-photo"></div>
          `
      }

      ${logo(org)}

      ${favorite ? favoriteButton(org.id, true) : ""}

      <div class="institution-copy">

        <h3>${esc(org.name)}</h3>

        <p>${esc(org.tagline)}</p>

        <a
          class="btn white"
          href="${href("organization-services", {
            id: org.id,
          })}"
        >
          Explore Services
        </a>

      </div>

    </article>
  `;
}

// --------------------------------------------------
// Service cards
// --------------------------------------------------

export function serviceCard(service, detail = false) {
  const org = institutions.find(
    (item) => item.id === service.institutionId
  );

  if (!org) return "";

  const serviceName = service.name || "";

  const serviceIcon =
    /إنترنت|internet/i.test(serviceName)
      ? "router"
      : /شريحة|sim/i.test(serviceName)
        ? "sim"
        : /خط|line/i.test(serviceName)
          ? "phone"
          : "service";

  const bookingErrors = {
    SERVICE_UNAVAILABLE: "Service is unavailable for booking",
    BRANCH_BOOKING_DISABLED: "Branch booking is disabled",
    HOURS_UNAVAILABLE: "Working hours are not available",
    SUBSCRIPTION_RESTRICTED:
      "The organization's subscription needs review",
  };

  const duration =
    service.durationMinutes == null
      ? "Not specified"
      : `${esc(service.duration || service.durationMinutes)} minutes`;

  let actions = "";

  if (service.directoryOnly) {
    actions = `
      <small class="service-branch">
        ${esc(service.provider || service.branchName || "")}
      </small>

      ${
        detail && service.hoursText
          ? `
            <p class="directory-hours">
              ${esc(service.hoursText)}
            </p>
          `
          : ""
      }

      <a
        class="btn ${detail ? "primary" : "soft"}"
        href="${officialUrl(
          service.officialUrl || service.sourceUrl
        )}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Official Service Details
        ${icon("arrow")}
      </a>

      ${
        detail && service.documentsUrl
          ? `
            <a
              class="btn outline"
              href="${officialUrl(service.documentsUrl)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Required Documents
            </a>
          `
          : ""
      }
    `;
  } else if (service.bookingEligible === false) {
    actions = `
      <p role="status">
        Booking unavailable:
        ${esc(
          bookingErrors[service.unbookableReason] ||
          service.unbookableReason ||
          "Service is currently unavailable"
        )}
      </p>
    `;
  } else {
    actions = `
      <a
        class="btn ${detail ? "primary" : "soft"}"
        href="${href("plan-visit", {
          institution: org.id,
          service: service.id,
          branch: service.branchId,
        })}"
      >
        Book Now
      </a>
    `;
  }

  return `
    <article
      data-branch="${esc(service.branchId)}"
      class="service-card ${detail ? "detail-service" : ""}"
    >

      ${!detail
        ? favoriteButton(service.favoriteId || service.id)
        : ""}

      ${
        detail
          ? `
            <span class="service-illustration">
              ${icon(serviceIcon)}
            </span>
          `
          : logo(org)
      }

      <h3>${esc(service.name)}</h3>

      <p>
        ${detail
          ? esc(service.description)
          : esc(org.name)}
      </p>

      ${
        !detail
          ? `
            <small class="service-branch">
              ${esc(service.branchName || "")}
            </small>
          `
          : ""
      }

      ${badge(service.category)}

      ${
        detail && !service.directoryOnly
          ? `
            <small class="duration">
              ${icon("clock")}
              ${duration} — Wusool Setup
            </small>
          `
          : ""
      }

      ${actions}

    </article>
  `;
}

// --------------------------------------------------
// Tabs
// --------------------------------------------------

// Keep existing tab IDs for compatibility with page logic.
const tabDisplayNames = {
  "الوظائف المتاحة": "Available Jobs",
  "طلباتي": "My Applications",
  "الامتحانات": "Exams",
  "المقابلات": "Interviews",
  "العروض": "Offers",
};

export function tabs(labels, active, attr = "tab") {
  return `
    <div class="tabs" role="tablist">
      ${labels
        .map(
          (value) => `
            <button
              type="button"
              role="tab"
              id="tab-${esc(value).replaceAll(" ", "-")}"
              aria-selected="${value === active}"
              tabindex="${value === active ? 0 : -1}"
              class="${value === active ? "active" : ""}"
              data-${attr}="${esc(value)}"
            >
              ${esc(tabDisplayNames[value] || value)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

// --------------------------------------------------
// Header and navigation
// --------------------------------------------------

export function header(active) {
  const profile = store.profile();
  const fullName = String(profile?.name || "User");
  const firstName = fullName.split(" ")[0];

  const links = [
    ["Home", "user-dashboard"],
    ["Organizations", "institutions"],
    ["Services", "service-directory"],
    ["My Bookings", "my-visits"],
    ["Recruitment", "recruitment"],
    ["Explore Map", "explore-places"],
    ["Help & Support", "help-support"],
  ];

  return `
    <header class="header">

      <a
        class="brand"
        href="${new URL("visitor/html/home.html", base).href}"
        aria-label="Wusool public homepage"
      >
        <strong>Wusool</strong>
        <span>Portal</span>
      </a>

      <nav
        class="main-nav"
        aria-label="Main navigation"
      >
        ${links
          .map(
            ([name, page]) => `
              <a
                href="${href(page)}"
                ${
                  page === active
                    ? 'aria-current="page"'
                    : ""
                }
              >
                ${name}
              </a>
            `
          )
          .join("")}
      </nav>

      <div class="header-tools">

        <a
          class="icon-btn"
          href="${href("service-directory")}"
          aria-label="Search"
        >
          ${icon("search")}
        </a>

        <button
          class="icon-btn notification-trigger"
          data-notifications
          aria-label="Notifications"
        >
          ${icon("bell")}
          <span class="notification-dot"></span>
        </button>

        <a
          class="user-link"
          href="${href("user-profile")}"
        >

          <span
            class="avatar-initial"
            aria-hidden="true"
          >
            ${esc(fullName.charAt(0))}
          </span>

          <span>
            Hello, ${esc(firstName)}
            <small>Personal Account</small>
          </span>

          <span class="user-circle">
            ${icon("user")}
          </span>

        </a>

        <button
          class="icon-btn"
          data-logout
          aria-label="Log out"
        >
          ${icon("logout")}
        </button>

      </div>

      <button
        class="icon-btn mobile-menu"
        data-menu
        aria-label="Open menu"
        aria-expanded="false"
      >
        ${icon("menu")}
      </button>

    </header>
  `;
}

// --------------------------------------------------
// Empty state
// --------------------------------------------------

export function empty(text = "No results found") {
  return `
    <div class="empty-state">
      ${icon("search")}
      <p>${esc(text)}</p>
    </div>
  `;
}

// --------------------------------------------------
// Modals and dialogs
// --------------------------------------------------

let modalPageOverflow = "";

export function modal(
  title,
  body,
  { wide = false, footer = "", onClose } = {}
) {
  const dialogId = "dialog-" + crypto.randomUUID();
  const previous = document.activeElement;
  const host = document.createElement("div");

  host.className = "modal-backdrop";

  host.innerHTML = `
    <section
      class="modal ${wide ? "landscape" : ""}"
      role="dialog"
      aria-modal="true"
      aria-labelledby="${dialogId}"
      tabindex="-1"
    >

      <div class="modal-header">

        <h2 id="${dialogId}">
          ${esc(title)}
        </h2>

        <button
          class="icon-btn"
          data-close
          aria-label="Close"
        >
          ${icon("close")}
        </button>

      </div>

      <div class="modal-body">
        ${body}
      </div>

      <div class="modal-footer">
        ${footer}

        <button class="btn outline" data-close>
          Cancel
        </button>
      </div>

    </section>
  `;

  if (!document.querySelector(".modal-backdrop")) {
    modalPageOverflow = document.body.style.overflow;
  }

  document.body.append(host);

  let isClosed = false;

  document.body.style.overflow = "hidden";

  function close() {
    if (isClosed) return;

    isClosed = true;
    host.remove();

    document.body.style.overflow =
      document.querySelector(".modal-backdrop")
        ? "hidden"
        : modalPageOverflow;

    document.removeEventListener("keydown", keydown);

    if (previous?.isConnected) {
      previous.focus();
    } else {
      [...document.querySelectorAll(
        ".modal-backdrop [data-close]"
      )]
        .at(-1)
        ?.focus();
    }

    onClose?.();
  }

  function keydown(event) {
    const topDialog = [
      ...document.querySelectorAll(".modal-backdrop"),
    ].at(-1);

    if (topDialog !== host) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }

    if (event.key !== "Tab") return;

    const focusable = [
      ...host.querySelectorAll(
        'button,a[href],input,select,textarea,[tabindex="0"]'
      ),
    ].filter(
      (element) =>
        !element.disabled &&
        element.getClientRects().length
    );

    const first = focusable[0];
    const last = focusable.at(-1);

    if (
      event.shiftKey &&
      (
        document.activeElement === first ||
        !host.contains(document.activeElement)
      )
    ) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first?.focus();
    }
  }

  host.addEventListener("click", (event) => {
    if (
      event.target === host ||
      event.target.closest("[data-close]")
    ) {
      close();
    }
  });

  document.addEventListener("keydown", keydown);

  host.querySelector("[data-close]").focus();

  return { host, close };
}

// --------------------------------------------------
// Toast notifications
// --------------------------------------------------

export function toast(text) {
  let element = document.querySelector(".toast");

  if (!element) {
    element = document.createElement("div");
    element.className = "toast";
    element.setAttribute("role", "status");
    document.body.append(element);
  }

  element.textContent = text;

  clearTimeout(window.wusoolToast);

  window.wusoolToast = setTimeout(
    () => element.remove(),
    3500
  );
}

// --------------------------------------------------
// Directory branch card
// --------------------------------------------------

export function directoryBranchCard(branch, org) {
  const image = branch.photos?.[0];

  const branchTypes = {
    atm: "ATM",
    "government-service-centre": "Government Service Center",
    headquarters: "Headquarters",
  };

  const branchType =
    branchTypes[branch.kind] || "Branch";

  const serviceScopeMessage =
    branch.serviceScope === "institution"
      ? "These services are institution-wide. Check the official service directory for this location."
      : "Services are based on the official directory for this location.";

  return `
    <section
      class="panel plain-content directory-branch"
      data-directory-branch="${esc(branch.id)}"
    >

      ${
        image
          ? `
            <figure>
              <img
                src="${asset(image.url)}"
                alt="${esc(image.caption || branch.branchName)}"
                loading="lazy"
              >

              <figcaption>
                ${esc(
                  image.caption ||
                  "Photo published by the official source"
                )}
              </figcaption>
            </figure>
          `
          : ""
      }

      <div class="career-tags">

        ${badge(branchType)}

        ${
          branch.operatingStatus === "temporarily-closed"
            ? badge("Temporarily Closed")
            : ""
        }

      </div>

      <h2>${esc(branch.branchName)}</h2>

      <p>
        ${esc(
          [branch.address, branch.city]
            .filter(Boolean)
            .join(", ")
        )}
      </p>

      ${
        branch.phone
          ? `
            <p>
              Phone:
              <bdi>${esc(branch.phone)}</bdi>
            </p>
          `
          : `
            <p class="muted">
              No branch phone number is published by the source.
            </p>
          `
      }

      <p class="directory-hours">
        ${esc(branch.hoursText)}
      </p>

      ${
        branch.hoursNote
          ? `<small>${esc(branch.hoursNote)}</small>`
          : ""
      }

      ${
        branch.bookingNote
          ? `<p>${esc(branch.bookingNote)}</p>`
          : ""
      }

      <p class="muted">
        ${serviceScopeMessage}
        Accessibility facilities have not been
        independently assessed by Wusool.
      </p>

      <div class="banner-actions">

        <a
          class="btn soft"
          href="${officialUrl(
            branch.officialUrl || branch.sourceUrl
          )}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Official Organization Page
        </a>

        ${
          branch.mapUrl
            ? `
              <a
                class="btn outline"
                href="${officialUrl(branch.mapUrl)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Official Location
              </a>
            `
            : ""
        }

        <a
          class="btn outline"
          href="${href("explore-places", {
            branch: branch.id,
          })}"
        >
          View on Wusool Map
        </a>

      </div>

      <small class="directory-source">

        Source:

        <a
          href="${officialUrl(branch.sourceUrl)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${esc(branch.sourcePublisher || org.name)}
        </a>

        · Retrieved:
        <bdi>${esc(branch.retrievedAt)}</bdi>

        ${
          branch.latitude == null ||
          branch.longitude == null
            ? " · Verified coordinates are unavailable"
            : ""
        }

      </small>

    </section>
  `;
}
