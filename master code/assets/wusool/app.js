
import {
  institutions,
  services,
  branches,
  categories,
  categoryLabel,
} from "./data.js";

import {
  store,
  api,
  requireUser,
  refreshAccount,
  refreshCatalog,
  refreshBookings,
  applySettings,
  errorText,
  isPastVisit,
} from "./store.js";

import {
  asset,
  href,
  esc,
  icon,
  logo,
  search,
  badge,
  institutionCard,
  serviceCard,
  directoryBranchCard,
  officialUrl,
  empty,
  modal,
  toast,
} from "./components.js";

import {
  shell,
  heading,
  bindFavorites,
  bindSearch,
  bindTabs,
  busy,
  safeDate,
  page,
  setCleanup,
} from "./ui.js";

import { renderWizard } from "./booking.js";
import { tracking } from "./tracking.js";
import { mapMarkup, mountMap, point } from "./map.js";
import { renderRecruitment } from "./recruitment.js";
import { sortRecords, sortControl } from "./sort.js";

await import("../interaction-theme.js");

if (!document.querySelector('link[href$="preferences.css"]')) {
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = new URL("../preferences.css", import.meta.url).href;
  document.head.append(style);
}

if (!window.WusoolPreferences) {
  const script = document.createElement("script");
  script.src = new URL("../preferences.js", import.meta.url).href;
  document.head.append(script);
}

const params = new URLSearchParams(location.search);

const state = {
  query: params.get("q") || "",
  category: categoryLabel(params.get("category") || "All Categories"),
  limit: 12,
  orgTab: "الخدمات",
  orgCategory: "All Services",
  bookingTab: "الكل",
  favoriteTab: "المؤسسات",
  institutionSort: "name-asc",
  serviceSort: "name-asc",
  bookingSort: "upcoming",
};

const orgById = (id) =>
  institutions.find((item) => item.id === id);

const serviceName = (booking) =>
  booking.serviceName ||
  booking.serviceSnapshot?.name ||
  booking.destination ||
  booking.purpose ||
  "Branch Visit";

const orgName = (booking) =>
  orgById(booking.institutionId || booking.organizationId)?.name ||
  booking.placeName ||
  booking.organizationName ||
  "Organization";

const orgLogo = (booking) =>
  logo(
    orgById(booking.institutionId || booking.organizationId) || {
      name: orgName(booking),
    }
  );

// Internal Arabic tab keys remain unchanged for compatibility.
const tabDisplayNames = {
  "نبذة عامة": "Overview",
  "الخدمات": "Services",
  "معلومات الوصول": "Access Information",
  "الفروع": "Branches",
  "التسهيلات وتحليل AI": "Accessibility & AI Analysis",
  "التقييمات": "Reviews",
  "الكل": "All",
  "القادمة": "Upcoming",
  "السابقة": "Past",
  "ملغاة": "Cancelled",
  "المؤسسات": "Organizations",
};

function englishTabs(labels, active, attr = "tab") {
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

let currentRender = null;

// ==================================================
// HOME
// ==================================================

function renderHome() {
  const homeCategories = [
    ["Government", "government"],
    ["Finance", "finance"],
    ["Telecommunications", "telecom"],
    ["Education", "education"],
    ["Healthcare", "health"],
    ["All Categories", "calendar"],
    ["Recruitment", "user"],
  ];

  shell(
    `
      <section class="hero">
        <img
          src="${asset("hero-city.jpg")}"
          alt="Amman city"
          fetchpriority="high"
        >

        <h1>Discover Services with Ease</h1>

        <p>
          Organizations • Services • Bookings •
          Accessible Experiences for Everyone
        </p>

        ${search(
          "Search for an organization or service...",
          "",
          "home-search"
        )}
      </section>

      <div class="home-categories">
        ${homeCategories
          .map(
            ([name, categoryIcon]) => `
              <a
                class="home-category"
                href="${href(
                  name === "Recruitment"
                    ? "recruitment"
                    : "service-directory",
                  name === "All Categories" || name === "Recruitment"
                    ? {}
                    : { category: name }
                )}"
              >
                <span class="category-circle">
                  ${icon(categoryIcon)}
                </span>
                ${name}
              </a>
            `
          )
          .join("")}
      </div>

      <section>
        <div class="section-heading">
          <h2>Featured Organizations</h2>
          <a class="btn outline" href="${href("institutions")}">
            View All ${icon("back")}
          </a>
        </div>

        <div class="featured-wrap">
          <div class="institution-grid" id="featured-grid">
            ${
              institutions.length
                ? institutions
                    .slice(0, 4)
                    .map(institutionCard)
                    .join("")
                : empty(
                    "No organizations with published branches are available yet."
                  )
            }
          </div>

          ${
            institutions.length > 4
              ? `
                <button
                  class="icon-btn carousel-prev"
                  data-carousel
                  aria-label="Next organizations"
                >
                  ${icon("back")}
                </button>
              `
              : ""
          }
        </div>
      </section>

      <div class="portal-shortcuts">
        <a href="${href("saved-places")}">
          ${icon("heart")} Favorites
        </a>

        <a href="${href("recruitment")}">
          ${icon("user")} Recruitment & Applications
        </a>

        <a href="${href("my-tickets")}">
          ${icon("calendar")} My Bookings & Visits
        </a>

        <a href="${href("help-support")}">
          ${icon("help")} Account Services
        </a>
      </div>
    `,
    "user-dashboard",
    "home-page"
  );

  bindSearch((query) => {
    location.assign(href("service-directory", { q: query }));
  });

  let offset = 0;

  document
    .querySelector("[data-carousel]")
    ?.addEventListener("click", () => {
      offset = (offset + 4) % institutions.length;

      const list = Array.from(
        { length: Math.min(4, institutions.length) },
        (_, index) =>
          institutions[(offset + index) % institutions.length]
      );

      document.querySelector("#featured-grid").innerHTML =
        list.map(institutionCard).join("");
    });
}

// ==================================================
// ORGANIZATIONS
// ==================================================

function renderInstitutions() {
  shell(
    `
      ${heading(
        "Organizations",
        "Approved organizations with published branches"
      )}

      ${search("Search for an organization...", state.query)}

      ${sortControl(
        state.institutionSort,
        [
          { value: "name-asc", en: "Name A–Z", ar: "Name A–Z" },
          { value: "name-desc", en: "Name Z–A", ar: "Name Z–A" },
          { value: "newest", en: "Recently added", ar: "Recently added" },
        ],
        "institution-sort"
      )}

      <div
        class="institution-grid"
        style="margin-top:24px"
        id="institution-results"
      ></div>
    `,
    "institutions"
  );

  function update() {
    const filtered = institutions.filter((organization) =>
      `${organization.name} ${organization.tagline}`
        .toLowerCase()
        .includes(state.query.toLowerCase())
    );

    const rules =
      state.institutionSort === "name-desc"
        ? [{ field: "name", direction: "desc" }]
        : state.institutionSort === "newest"
          ? [{ field: "createdAt", type: "date", direction: "desc" }]
          : [{ field: "name" }];

    const list = sortRecords(filtered, rules);

    document.querySelector("#institution-results").innerHTML =
      list.length
        ? list.map(institutionCard).join("")
        : empty();
  }

  update();

  document.querySelector("#search").oninput = (event) => {
    state.query = event.target.value.trim();
    update();
  };

  document.querySelector("#institution-sort").onchange = (event) => {
    state.institutionSort = event.target.value;
    update();
  };

  bindSearch((query) => {
    state.query = query;
    update();
  });
}

// ==================================================
// SERVICES
// ==================================================

function renderServices() {
  shell(
    `
      ${heading(
        "Explore Services",
        "Find available services at published organizations and branches"
      )}

      ${search("Search for a service or organization...", state.query)}

      <div class="category-chips">
        ${categories
          .map(
            (category) => `
              <button
                class="chip ${
                  state.category === category ? "active" : ""
                }"
                data-category="${esc(category)}"
                aria-pressed="${state.category === category}"
              >
                ${esc(category)}
              </button>
            `
          )
          .join("")}
      </div>

      ${sortControl(
        state.serviceSort,
        [
          { value: "name-asc", en: "Alphabetical", ar: "Alphabetical" },
          { value: "newest", en: "Recently added", ar: "Recently added" },
        ],
        "service-sort"
      )}

      <p
        class="result-count"
        id="result-count"
        role="status"
      ></p>

      <div class="service-grid" id="service-results"></div>

      <button class="btn outline load-more" data-load-more>
        Load More
      </button>
    `,
    "service-directory"
  );

  function update() {
    const filtered = services.filter(
      (service) =>
        (
          state.category === "All Categories" ||
          service.category === state.category
        ) &&
        `${
          service.name
        } ${
          orgById(service.institutionId)?.name || ""
        } ${
          service.branchName || ""
        }`
          .toLowerCase()
          .includes(state.query.toLowerCase())
    );

    const rules =
      state.serviceSort === "newest"
        ? [{ field: "createdAt", type: "date", direction: "desc" }]
        : [{ field: "name" }];

    const list = sortRecords(filtered, rules);

    document.querySelector("#result-count").textContent =
      `${list.length} results`;

    document.querySelector("#service-results").innerHTML =
      list.length
        ? list
            .slice(0, state.limit)
            .map(serviceCard)
            .join("")
        : empty("No matching services are available.");

    document.querySelector("[data-load-more]").hidden =
      list.length <= state.limit;

    bindFavorites();
  }

  update();

  document.querySelector("#search").oninput = (event) => {
    state.query = event.target.value;
    state.limit = 12;
    update();
  };

  document.querySelector("#service-sort").onchange = (event) => {
    state.serviceSort = event.target.value;
    state.limit = 12;
    update();
  };

  bindSearch((query) => {
    state.query = query;
    update();
  });

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.onclick = () => {
      state.category = button.dataset.category;
      state.limit = 12;

      document.querySelectorAll("[data-category]").forEach((element) => {
        element.classList.toggle("active", element === button);
        element.setAttribute("aria-pressed", element === button);
      });

      update();
    };
  });

  document.querySelector("[data-load-more]").onclick = () => {
    state.limit += 12;
    update();
  };
}

// ==================================================
// ORGANIZATION DETAILS
// ==================================================

function renderInstitution() {
  const organization = orgById(
    params.get("id") || params.get("institution")
  );

  if (!organization) {
    shell(
      `
        ${heading("Organization")}
        ${empty(
          "This organization is unavailable or has no published branches."
        )}
        <a
          class="btn outline"
          href="${href("institutions")}"
        >
          View Organizations
        </a>
      `,
      "institutions"
    );
    return;
  }

  const rating = organization.reviewCount
    ? `
      <span
        class="stars"
        aria-label="${organization.rating.toFixed(1)} out of 5"
      >
        ${"★".repeat(Math.round(organization.rating))}
      </span>

      <small>
        (${organization.reviewCount} reviews)
      </small>
    `
    : "<small>No approved reviews yet</small>";

  shell(
    `
      <div class="breadcrumb">
        <a href="${href("user-dashboard")}">Home</a>
        /
        <a href="${href("institutions")}">Organizations</a>
        /
        ${esc(organization.name)}
      </div>

      <section class="institution-banner">
        <div class="institution-intro">

          <div class="institution-title">
            ${logo(organization)}
            <div>
              <h1>${esc(organization.name)}</h1>
              <div class="rating">${rating}</div>
            </div>
          </div>

          <h2>Making Access Easier for Everyone</h2>

          <p>
            ${esc(
              organization.tagline ||
              "Explore this organization's services and branches, and book your visit."
            )}
          </p>

          <div class="banner-actions">
            ${
              organization.directoryOnly
                ? `
                  <a
                    class="btn primary"
                    href="${officialUrl(
                      organization.website || organization.sourceUrl
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ${icon("building")} Official Website
                  </a>
                `
                : `
                  <a
                    class="btn primary"
                    href="${href("plan-visit", {
                      institution: organization.id,
                    })}"
                  >
                    ${icon("calendar")} Book Now
                  </a>
                `
            }

            <button
              class="btn outline"
              data-org-favorite
              aria-pressed="${
                store.favorites().includes(organization.id)
              }"
            >
              ${icon(
                store.favorites().includes(organization.id)
                  ? "heartFill"
                  : "heart"
              )}
              Add to Favorites
            </button>
          </div>
        </div>

        <div class="banner-photo">
          ${
            organization.image
              ? `
                <img
                  src="${asset(organization.image)}"
                  alt="${esc(organization.name)}"
                >
              `
              : '<div class="neutral-photo"></div>'
          }
        </div>
      </section>

      <div class="institution-tabs">
        ${englishTabs(
          [
            "نبذة عامة",
            "الخدمات",
            "معلومات الوصول",
            "الفروع",
            "التسهيلات وتحليل AI",
            "التقييمات",
          ],
          state.orgTab,
          "org-tab"
        )}
      </div>

      <div id="org-content" role="tabpanel"></div>
    `,
    "institutions"
  );

  document.querySelector("[data-org-favorite]").onclick = (event) =>
    busy(event.currentTarget, async () => {
      await store.toggleFavorite(organization.id);

      const selected = store.favorites().includes(organization.id);

      event.currentTarget.setAttribute("aria-pressed", selected);

      toast(
        selected
          ? "Added to favorites"
          : "Removed from favorites"
      );
    });

  let localVersion = 0;

  async function content() {
    const revision = ++localVersion;
    const target = document.querySelector("#org-content");

    if (!target) return;

    target.setAttribute(
      "aria-labelledby",
      `tab-${state.orgTab.replaceAll(" ", "-")}`
    );

    if (state.orgTab === "الخدمات") {
      const available = services.filter(
        (service) => service.institutionId === organization.id
      );

      target.innerHTML = `
        ${
          organization.institutionServices?.length
            ? `
              <section class="panel plain-content">
                <h2>Organization Service Guide</h2>
                <p>
                  Check each service for its location.
                  Not all services are available at every branch.
                </p>

                <div class="directory-service-guide">
                  ${organization.institutionServices
                    .map(
                      (service) => `
                        <details>
                          <summary>${esc(service.name)}</summary>

                          ${Object.entries(service.facts || {})
                            .map(
                              ([key, value]) => `
                                <p>
                                  <strong>${esc(key)}:</strong>
                                  ${esc(value)}
                                </p>
                              `
                            )
                            .join("")}

                          <a
                            href="${officialUrl(service.sourceUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Official Requirements,
                            Documents & Procedures
                          </a>
                        </details>
                      `
                    )
                    .join("")}
                </div>
              </section>
            `
            : ""
        }

        <div class="institution-services-head">
          <h2>Available Services</h2>

          ${search(
            `Search ${organization.name} services...`,
            "",
            "org-search"
          )}
        </div>

        <div class="institution-services-layout">
          <div class="detail-grid" id="org-service-grid"></div>

          <aside class="filter-sidebar" aria-label="Branches">
            <button data-org-branch="" class="active">
              ${icon("building")} All Branches
            </button>

            ${organization.branches
              .map(
                (branch) => `
                  <button data-org-branch="${esc(branch.id)}">
                    ${icon("pin")}
                    ${esc(branch.branchName)}
                  </button>
                `
              )
              .join("")}
          </aside>
        </div>
      `;

      let selectedBranch = params.get("branch") || "";
      let serviceLimit = 36;

      const more = document.createElement("button");
      more.className = "btn outline load-more";
      more.textContent = "Load More";

      more.onclick = () => {
        serviceLimit += 36;
        update();
      };

      target.append(more);

      const update = () => {
        const query = target.querySelector("#org-search").value;

        const list = available.filter(
          (service) =>
            service.name
              .toLowerCase()
              .includes(query.toLowerCase()) &&
            (!selectedBranch || service.branchId === selectedBranch)
        );

        target.querySelector("#org-service-grid").innerHTML =
          list.length
            ? list
                .slice(0, serviceLimit)
                .map((service) => serviceCard(service, true))
                .join("")
            : empty("No services match your selection.");

        more.hidden = list.length <= serviceLimit;

        target.querySelectorAll("[data-org-branch]").forEach((element) => {
          element.classList.toggle(
            "active",
            element.dataset.orgBranch === selectedBranch
          );
        });
      };

      update();

      target.querySelector("#org-search").oninput = update;

      target.querySelector("form").onsubmit = (event) => {
        event.preventDefault();
        update();
      };

      target.querySelectorAll("[data-org-branch]").forEach((button) => {
        button.onclick = () => {
          selectedBranch = button.dataset.orgBranch;
          serviceLimit = 36;
          update();
        };
      });
    } else if (state.orgTab === "التسهيلات وتحليل AI") {
      const labels = {
        accessibleEntrance: "Accessible Entrance",
        entranceRamp: "Entrance Ramp",
        widePathways: "Wide Pathways",
        elevator: "Elevator",
        accessibleParking: "Accessible Parking",
        accessibleRestroom: "Accessible Restroom",
        staffAssistance: "Staff Assistance",
        hearingSupport: "Hearing Assistance",
        automaticDoors: "Automatic Doors",
        tactilePaving: "Tactile Paving",
        brailleSigns: "Braille Signs",
        wheelchairAvailable: "Wheelchair Available",
      };

      target.innerHTML = `
        <section class="panel plain-content">
          <h2>Accessibility & AI Analysis</h2>

          <label>
            Select Branch

            <select class="form-select" id="facility-branch">
              ${organization.branches
                .map(
                  (branch) => `
                    <option value="${esc(branch.id)}">
                      ${esc(branch.branchName)}
                    </option>
                  `
                )
                .join("")}
            </select>
          </label>

          <div id="facility-content"></div>
        </section>
      `;

      const renderFacilities = () => {
        const selected = organization.branches.find(
          (branch) =>
            branch.id === target.querySelector("#facility-branch").value
        );

        const box = target.querySelector("#facility-content");

        if (!selected) {
          box.innerHTML = empty("No published branches are available.");
          return;
        }

        const source =
          selected.accessibility ||
          selected.accessibilityFeatures ||
          {};

        const accessibility = Array.isArray(source)
          ? Object.fromEntries(
              source.map((item) => [
                item.key || item.id,
                item.status || item.value,
              ])
            )
          : source;

        const review = selected.aiReview;

        const demoReview =
          review?.source === "demo" &&
          review?.status === "completed";

        const actual =
          review &&
          ["completed", "uncertain", "failed", "unavailable"].includes(
            review.status
          ) &&
          selected.scoreSource !== "demo";

        const facilityBadges = Object.entries(labels)
          .map(([key, name]) => {
            const raw = accessibility[key];

            const value =
              raw && typeof raw === "object"
                ? raw.status || raw.value
                : raw;

            const status =
              value === "available" || value === true
                ? "Available"
                : value === "not-available" || value === false
                  ? "Unavailable"
                  : "Unknown";

            return badge(`${name} — ${status}`);
          })
          .join("");

        let fitMarkup = "";

        try {
          const matches = api().visits.fit(selected);

          fitMarkup =
            matches
              .map(
                (item) =>
                  badge(
                    `${labels[item.key] || item.key} — ${
                      {
                        available: "Compatible",
                        unavailable: "Unavailable",
                        unknown: "Unknown",
                      }[item.status] || "Unknown"
                    }`
                  )
              )
              .join("") ||
            "<p>You have not specified accessibility requirements in your preferences.</p>";
        } catch {
          fitMarkup = "<p>Accessibility compatibility is unavailable.</p>";
        }

        const photos = (selected.photos || [])
          .map((photo) => {
            const src =
              typeof photo === "string"
                ? photo
                : photo.url || photo.imageData;

            if (
              !src ||
              !/^(https?:|data:image\/|\.\.?\/|\/)/i.test(src)
            ) {
              return "";
            }

            return `
              <img
                src="${esc(src)}"
                alt="${esc(
                  photo.caption ||
                    photo.categoryKey ||
                    "Branch evidence"
                )}"
                style="max-width:180px"
              >
            `;
          })
          .join("");

        const locations = esc(
          (selected.services || [])
            .map((item) =>
              typeof item === "string"
                ? item
                : [item.name, item.floor].filter(Boolean).join(" — ")
            )
            .join(", ") || "Location details have not been provided."
        );

        const aiResult = actual
          ? `
            <p>Status: ${esc(review.status)}</p>
            <p>
              Source:
              ${esc(review.source || review.provider || "Not provided")}
            </p>
            <p>
              Analysis date:
              ${esc(
                review.analyzedAt ||
                review.createdAt ||
                "Not provided"
              )}
            </p>
            <p>${esc(review.summary || review.message || "")}</p>

            ${(review.recommendations || [])
              .map((recommendation) => `<p>${esc(recommendation)}</p>`)
              .join("")}

            <small>
              Automated findings based on branch data;
              no on-site verification was performed.
            </small>
          `
          : demoReview
            ? `
              <div role="note">
                <strong>
                  Demo Simulation — Not an Actual AI Result
                </strong>
                <p>${esc(review.summary)}</p>
                <p>
                  Date:
                  ${esc(review.analyzedAt || "Not provided")}
                </p>
                <p>
                  No verified score, image analysis,
                  or on-site verification is available.
                </p>
              </div>
            `
            : `
              <p>
                No completed AI analysis is available
                for this branch yet.
              </p>
            `;

        box.innerHTML = `
          <h3>
            ${
              selected.accessibilitySource === "imported"
                ? "Accessibility data from a reference source — not verified by the organization"
                : "Accessibility features reported by the organization"
            }
          </h3>

          <div class="career-tags">${facilityBadges}</div>

          <h3>Compatibility with Your Needs</h3>
          ${fitMarkup}

          <h3>Evidence & Directions</h3>
          ${photos}
          <p>${locations}</p>

          <h3>AI Analysis</h3>
          ${aiResult}
        `;
      };

      target.querySelector("#facility-branch").onchange =
        renderFacilities;

      renderFacilities();
    } else if (state.orgTab === "نبذة عامة") {
      target.innerHTML = `
        <section
          class="panel plain-content"
          style="margin-top:24px"
        >
          <h2>${esc(organization.name)}</h2>

          <p>
            ${esc(
              organization.tagline ||
              "This organization has not provided a description yet."
            )}
          </p>

          <p>
            ${
              organization.branches.length
                ? `${organization.branches.length} published locations`
                : "Branches and services are not available yet."
            }
          </p>

          ${
            organization.directoryOnly
              ? `
                <p>${esc(organization.coverageNote)}</p>
                <p>
                  This is reference information from organizations,
                  not a live connection to their booking or queue systems.
                  Use official channels for appointments.
                </p>

                ${
                  organization.imageCaption
                    ? `<small>${esc(organization.imageCaption)}</small>`
                    : ""
                }

                <p>
                  <a
                    href="${officialUrl(organization.sourceUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official Directory Source
                  </a>
                  · Data retrieved 2026-10-14
                </p>
              `
              : ""
          }
        </section>
      `;
    } else if (
      state.orgTab === "الفروع" ||
      state.orgTab === "معلومات الوصول"
    ) {
      target.innerHTML = `
        <div class="branch-grid">
          ${organization.branches
            .map((branch) =>
              branch.directoryOnly
                ? directoryBranchCard(branch, organization)
                : `
                  <section class="panel plain-content">
                    <h2>${esc(branch.branchName)}</h2>

                    <p>
                      ${esc(
                        [branch.address, branch.city]
                          .filter(Boolean)
                          .join(", ")
                      )}
                    </p>

                    <p>
                      ${esc(
                        branch.scoreDescription ||
                        "Accessibility information provided by the organization."
                      )}
                    </p>

                    ${
                      branch.features?.length
                        ? `
                          <div class="career-tags">
                            ${branch.features
                              .map((feature) =>
                                badge(
                                  typeof feature === "string"
                                    ? feature
                                    : feature.name || ""
                                )
                              )
                              .join("")}
                          </div>
                        `
                        : `
                          <p>
                            No accessibility details have been published.
                          </p>
                        `
                    }

                    <a
                      class="btn soft"
                      href="${href("plan-visit", {
                        institution: organization.id,
                        branch: branch.id,
                      })}"
                    >
                      Book at This Branch
                    </a>

                    <a
                      class="btn outline"
                      href="${href("explore-places", {
                        branch: branch.id,
                      })}"
                    >
                      Map
                    </a>
                  </section>
                `
            )
            .join("")}
        </div>
      `;
    } else {
      target.innerHTML = `
        <p style="padding:24px">
          Loading reviews...
        </p>
      `;

      try {
        const reviews = (await api().getReviews()).filter(
          (review) =>
            organization.branches.some(
              (branch) => branch.id === review.branchId
            ) &&
            ["visible", "published", "approved"].includes(
              String(review.status).toLowerCase()
            )
        );

        if (revision !== localVersion || !target.isConnected) return;

        target.innerHTML = `
          <section
            class="panel plain-content"
            style="margin-top:24px"
          >
            <h2>Approved Reviews</h2>

            ${
              reviews.length
                ? reviews
                    .map(
                      (review) => `
                        <article class="review-row">
                          <strong>${esc(review.name || "User")}</strong>

                          <div class="stars">
                            ${"★".repeat(
                              Math.max(
                                0,
                                Math.min(
                                  5,
                                  Math.round(Number(review.rating) || 0)
                                )
                              )
                            )}
                          </div>

                          <p>
                            ${esc(
                              review.comment ||
                              review.feedback ||
                              review.text ||
                              ""
                            )}
                          </p>

                          <small>
                            ${safeDate(review.createdAt)}
                          </small>
                        </article>
                      `
                    )
                    .join("")
                : empty("No approved reviews")
            }
          </section>
        `;
      } catch (error) {
        if (target.isConnected) {
          target.innerHTML = empty(errorText(error));
        }
      }
    }
  }

  content();

  bindTabs("org-tab", (tab) => {
    state.orgTab = tab;
    content();
  });
}

// ==================================================
// MY BOOKINGS
// ==================================================

function renderBookings() {
  shell(
    `
      ${heading("My Bookings")}

      <div class="booking-create-action">
        <a
          class="btn primary"
          href="${href("plan-visit")}"
        >
          ${icon("calendar")} Create New Booking
        </a>
      </div>

      ${sortControl(
        state.bookingSort,
        [
          { value: "upcoming", en: "Upcoming first", ar: "Upcoming first" },
          { value: "newest", en: "Newest created", ar: "Newest created" },
          { value: "oldest", en: "Oldest created", ar: "Oldest created" },
          { value: "status", en: "Status", ar: "Status" },
        ],
        "booking-sort"
      )}

      <div class="bookings-tabs">
        ${englishTabs(
          ["الكل", "القادمة", "السابقة", "ملغاة"],
          state.bookingTab,
          "booking-tab"
        )}
      </div>

      <div
        class="booking-list"
        id="booking-results"
        role="tabpanel"
      ></div>
    `,
    "my-visits"
  );

  function update() {
    const filtered = store.bookings().filter((booking) =>
      state.bookingTab === "الكل" || state.bookingTab === "ملغاة"
        ? state.bookingTab === "الكل" ||
          booking.statusCode === "cancelled"
        : state.bookingTab === "القادمة"
          ? ["pending", "confirmed", "in-progress", "waitlisted"].includes(
              booking.statusCode
            ) && !isPastVisit(booking)
          : ["completed", "no-show"].includes(booking.statusCode) ||
            isPastVisit(booking)
    );

    const rules =
      state.bookingSort === "newest"
        ? [{ field: "createdAt", type: "date", direction: "desc" }]
        : state.bookingSort === "oldest"
          ? [{ field: "createdAt", type: "date" }]
          : state.bookingSort === "status"
            ? [
                { field: "statusCode" },
                { field: "date", type: "date" },
                { field: "time" },
              ]
            : [
                { field: "date", type: "date" },
                { field: "time" },
              ];

    const list = sortRecords(filtered, rules);
    const target = document.querySelector("#booking-results");

    if (!target) return;

    target.setAttribute(
      "aria-labelledby",
      `tab-${state.bookingTab}`
    );

    target.innerHTML = list.length
      ? list
          .map(
            (booking) => `
              <article class="booking-row">
                ${orgLogo(booking)}

                <div>
                  <h3>${esc(serviceName(booking))}</h3>

                  <p>
                    ${esc(orgName(booking))} -
                    ${esc(booking.branch)}
                  </p>

                  <small>
                    ${icon("calendar")}
                    ${esc(booking.day)} -
                    <bdi>
                      ${esc(booking.date)} · ${esc(booking.time)}
                    </bdi>
                  </small>

                  ${
                    booking.interviewId
                      ? `
                        <small class="block">
                          Job Interview Visit
                        </small>
                      `
                      : ""
                  }
                </div>

                ${badge(
                  booking.status,
                  `status ${
                    booking.statusCode === "cancelled"
                      ? "cancelled"
                      : ""
                  }`
                )}

                <div class="row-actions">
                  <button
                    class="btn soft"
                    data-track="${esc(booking.id)}"
                  >
                    ${icon("pin")} Track Visit
                  </button>
                </div>

                ${
                  ["pending", "confirmed", "waitlisted"].includes(
                    booking.statusCode
                  ) && !booking.interviewId
                    ? `
                      <button
                        class="icon-btn row-menu"
                        data-booking-menu="${esc(booking.id)}"
                        aria-label="Booking Options"
                        aria-expanded="false"
                      >
                        ${icon("more")}
                      </button>
                    `
                    : ""
                }
              </article>
            `
          )
          .join("")
      : empty("No bookings in this section.");

    target.querySelectorAll("[data-track]").forEach((button) => {
      button.onclick = (event) =>
        busy(event.currentTarget, () =>
          tracking(
            store.bookings().find(
              (booking) => booking.id === button.dataset.track
            ),
            update
          )
        );
    });

    target.querySelectorAll("[data-booking-menu]").forEach((button) => {
      button.onclick = () => {
        const booking = store.bookings().find(
          (item) => item.id === button.dataset.bookingMenu
        );

        if (!booking) return;

        const dialog = modal(
          "Booking Options",
          `
            <h3>${esc(serviceName(booking))}</h3>

            <div class="form-actions">
              ${
                booking.statusCode === "pending"
                  ? `
                    <a
                      class="btn soft"
                      href="${href("reschedule-visit", {
                        id: booking.id,
                      })}"
                    >
                      Reschedule Appointment
                    </a>
                  `
                  : ""
              }

              <button
                class="btn danger"
                data-cancel-booking
              >
                Cancel Booking
              </button>
            </div>
          `
        );

        dialog.host.querySelector("[data-cancel-booking]").onclick =
          () => {
            dialog.close();
            cancelBooking(booking, update);
          };
      };
    });
  }

  document.querySelector("#booking-sort").onchange = (event) => {
    state.bookingSort = event.target.value;
    update();
  };

  update();

  bindTabs("booking-tab", (tab) => {
    state.bookingTab = tab;
    update();
  });

  let running = false;

  const refresh = async () => {
    if (running || document.hidden) return;

    running = true;

    try {
      await refreshBookings();
      update();
    } catch (error) {
      toast(errorText(error));
    } finally {
      running = false;
    }
  };

  const timer = setInterval(refresh, 10000);

  setCleanup(() => clearInterval(timer));

  if (params.has("created")) {
    toast(
      "Your booking was submitted and is awaiting organization approval."
    );

    history.replaceState(null, "", location.pathname);
  }

  const tracked = params.get("track");

  if (tracked) {
    const record = store.bookings().find(
      (booking) => booking.id === tracked
    );

    if (record) tracking(record, update);
  }
}

function cancelBooking(booking, onChange) {
  const dialog = modal(
    "Cancel Booking",
    `
      <form id="cancel-form">
        <p>
          Your visit will be cancelled and the organization
          will be notified.
        </p>

        <label class="field">
          Cancellation Reason

          <textarea
            name="reason"
            maxlength="1000"
            required
          ></textarea>
        </label>

        <button class="btn danger" type="submit">
          Confirm Cancellation
        </button>
      </form>
    `
  );

  dialog.host.querySelector("form").onsubmit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    busy(form.querySelector("button"), async () => {
      await store.cancelBooking(
        booking.id,
        new FormData(form).get("reason"),
        booking.revision
      );

      dialog.close();
      onChange();

      toast("Your booking has been cancelled.");
    });
  };
}

// ==================================================
// FAVORITES
// ==================================================

function renderFavorites() {
  const ids = store.favorites();
  const isOrg = state.favoriteTab === "المؤسسات";

  const list = isOrg
    ? institutions.filter((organization) =>
        ids.includes(organization.id)
      )
    : services.filter((service) =>
        ids.includes(service.favoriteId || service.id)
      );

  shell(
    `
      <div class="favorites-heading">
        <h1>Favorites</h1>

        ${englishTabs(
          ["المؤسسات", "الخدمات"],
          state.favoriteTab,
          "favorite-tab"
        )}
      </div>

      <div
        class="${isOrg ? "institution-grid" : "service-grid"}"
        role="tabpanel"
        aria-labelledby="tab-${state.favoriteTab}"
      >
        ${
          list.length
            ? list
                .map((item) =>
                  isOrg
                    ? institutionCard(item, true)
                    : serviceCard(item)
                )
                .join("")
            : empty("No available favorites yet.")
        }
      </div>
    `
  );

  bindFavorites(document, renderFavorites);

  bindTabs("favorite-tab", (tab) => {
    state.favoriteTab = tab;
    renderFavorites();
  });
}

// ==================================================
// PROFILE MENU
// ==================================================

function profileMenu(active) {
  const links = [
    ["Personal Information", "user-profile", "user"],
    ["Accessibility Settings", "accessibility-preferences", "access"],
    ["Favorites", "saved-places", "heart"],
    ["Recruitment", "recruitment", "user"],
    ["Notifications", "notifications", "bell"],
    ["Account Services", "help-support", "help"],
    ["Language & Appearance", "account-settings", "globe"],
  ];

  return `
    <aside class="profile-menu" aria-label="Account Settings">
      ${links
        .map(
          ([title, route, itemIcon]) => `
            <a
              class="${active === route ? "active" : ""}"
              href="${href(route)}"
            >
              ${icon(itemIcon)}
              ${title}
            </a>
          `
        )
        .join("")}
    </aside>
  `;
}

// ==================================================
// PROFILE
// ==================================================

function renderProfile() {
  const profile = store.profile();
  const career = profile.career || {};

  const fields = [
    ["city", "City"],
    ["educationLevel", "Education Level"],
    ["university", "University"],
    ["major", "Major"],
    ["graduationYear", "Graduation Year"],
    ["gpa", "GPA"],
    ["employmentStatus", "Employment Status"],
    ["yearsExperience", "Years of Experience"],
    ["skills", "Skills"],
    ["linkedinUrl", "LinkedIn Profile URL"],
    ["portfolioUrl", "Portfolio URL"],
  ];

  shell(
    `
      ${heading("My Profile")}

      <div class="profile-layout">
        ${profileMenu("user-profile")}

        <section class="panel profile-card">
          <div class="profile-avatar">
            <span class="avatar-initial large-avatar">
              ${esc(profile.name.charAt(0))}
            </span>

            <div>
              <h3>${esc(profile.name)}</h3>
              <p>${esc(profile.email)}</p>
            </div>

            <button class="btn primary" data-edit-profile>
              Edit Profile
            </button>
          </div>

          <form class="profile-fields" id="profile-form">
            <h2>Personal Information</h2>

            <label class="field">
              Name
              <input
                name="name"
                value="${esc(profile.name)}"
                required
                maxlength="80"
                readonly
                autocomplete="name"
              >
            </label>

            <label class="field">
              Email
              <input
                name="email"
                type="email"
                value="${esc(profile.email)}"
                required
                readonly
                dir="ltr"
                autocomplete="email"
              >
            </label>

            <label class="field">
              Phone Number
              <input
                name="phone"
                type="tel"
                value="${esc(profile.phone)}"
                required
                minlength="8"
                maxlength="25"
                readonly
                dir="ltr"
                autocomplete="tel"
              >
            </label>

            <details
              id="career-profile"
              ${
                params.get("section") === "career"
                  ? "open"
                  : ""
              }
            >
              <summary>Career Profile for Recruitment</summary>

              <p class="muted">
                This information is used to preview your
                job application and is shared only with your consent.
              </p>

              <div class="career-profile-grid">
                ${fields
                  .map(
                    ([key, title]) => `
                      <label class="field">
                        ${title}

                        <input
                          name="career:${key}"
                          value="${esc(career[key] || "")}"
                          ${
                            /Url$/.test(key)
                              ? 'type="url" dir="ltr"'
                              : ""
                          }
                          readonly
                        >
                      </label>
                    `
                  )
                  .join("")}
              </div>

              <label class="field">
                Professional Summary

                <textarea
                  name="career:professionalSummary"
                  readonly
                  maxlength="4000"
                >${esc(career.professionalSummary || "")}</textarea>
              </label>

              <label class="field" data-cv-field hidden>
                CV / Resume

                <input
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                >
              </label>

              <p class="muted">
                ${
                  career.cvDocument?.uploaded === true
                    ? "Uploaded CV: " +
                      esc(
                        career.cvFileName ||
                        career.cvDocument.name
                      )
                    : "No CV has been uploaded to the file service."
                }
              </p>
            </details>

            <div class="profile-save form-actions" hidden>
              <button class="btn primary" type="submit">
                Save Changes
              </button>

              <button
                class="btn outline"
                type="button"
                data-profile-cancel
              >
                Cancel
              </button>
            </div>

            <p
              class="validation"
              role="alert"
              data-profile-error
            ></p>
          </form>
        </section>
      </div>
    `
  );

  const form = document.querySelector("#profile-form");

  document.querySelector("[data-edit-profile]").onclick = (event) => {
    form.querySelectorAll("input,textarea").forEach((element) => {
      element.readOnly = false;
    });

    form.querySelector(".profile-save").hidden = false;
    form.querySelector("[data-cv-field]").hidden = false;

    event.currentTarget.hidden = true;

    form.querySelector("input").focus();
  };

  document.querySelector("[data-profile-cancel]").onclick =
    renderProfile;

  form.onsubmit = (event) => {
    event.preventDefault();

    busy(form.querySelector('[type="submit"]'), async () => {
      const formData = new FormData(form);

      const name = String(formData.get("name") || "").trim();
      const phone = String(formData.get("phone") || "").trim();

      if (!name || !phone) {
        form.querySelector("[data-profile-error]").textContent =
          "Please enter valid information.";
        return;
      }

      const value = {
        name,
        email: formData.get("email"),
        phone,

        career: {
          ...career,

          ...Object.fromEntries(
            [...formData]
              .filter(([key]) => key.startsWith("career:"))
              .map(([key, fieldValue]) => [
                key.slice(7),
                String(fieldValue).trim(),
              ])
          ),

          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" "),
          phoneNumber: phone,
          emailAddress: formData.get("email"),
        },
      };

      const cv = formData.get("cv");

      if (cv?.size) {
        const result = await api().upload(cv, {
          kind: "recruitment-cv",
        });

        if (result.uploaded === true) {
          value.career.cvDocument = result;
          value.career.cvFileName = result.name || cv.name;
        } else {
          toast(
            "File uploads are unavailable. Your profile will be saved without a CV attachment."
          );
        }
      }

      await store.saveProfile(value);

      renderProfile();

      toast("Your profile has been saved.");
    });
  };
}

// ==================================================
// ACCESSIBILITY
// ==================================================

function renderAccessibility() {
  const settings = store.settings();

  shell(
    `
      ${heading("Accessibility Preferences")}

      <div class="settings-layout">
        <form class="panel" id="accessibility-form">
          <h2>Font Size</h2>

          <div
            class="size-options"
            role="group"
            aria-label="Font Size"
          >
            ${[
              ["normal", "Normal"],
              ["large", "Large"],
              ["xlarge", "Extra Large"],
            ]
              .map(
                ([size, label]) => `
                  <button
                    type="button"
                    data-size="${size}"
                    class="${
                      settings.size === size ? "active" : ""
                    }"
                    aria-pressed="${settings.size === size}"
                  >
                    ${label}
                  </button>
                `
              )
              .join("")}
          </div>

          ${[
            ["magnify", "Magnify Text on Hover"],
            ["contrast", "High Contrast"],
            ["motion", "Reduce Motion"],
            ["focus", "Focus Mode"],
          ]
            .map(
              ([key, label]) => `
                <label class="switch-row">
                  <span>${label}</span>

                  <input
                    class="switch"
                    type="checkbox"
                    role="switch"
                    name="${key}"
                    ${settings[key] ? "checked" : ""}
                  >
                </label>
              `
            )
            .join("")}

          <button
            class="btn primary settings-save"
            type="submit"
          >
            Save Changes
          </button>
        </form>

        <aside class="panel preview-card">
          <h2>Preview</h2>

          <div class="preview-box">
            This is a preview text.
          </div>

          <p class="helper">
            Make sure these settings work for you.
          </p>
        </aside>
      </div>
    `
  );

  const draft = { ...settings };

  document.querySelectorAll("[data-size]").forEach((button) => {
    button.onclick = () => {
      draft.size = button.dataset.size;

      document.querySelectorAll("[data-size]").forEach((element) => {
        element.classList.toggle("active", element === button);
        element.setAttribute("aria-pressed", element === button);
      });

      applySettings(draft);
    };
  });

  document
    .querySelectorAll("#accessibility-form input")
    .forEach((input) => {
      input.onchange = () => {
        draft[input.name] = input.checked;
        applySettings(draft);
      };
    });

  document.querySelector("#accessibility-form").onsubmit = (event) => {
    event.preventDefault();

    busy(
      event.currentTarget.querySelector('[type="submit"]'),
      async () => {
        await store.saveSettings(draft);

        toast("Your accessibility settings have been saved.");
      }
    );
  };
}

// ==================================================
// MAP
// ==================================================

function renderMap() {
  shell(
    `
      ${heading(
        "Explore Map",
        "Explore published branch locations and search by organization or branch"
      )}

      ${search(
        "Search for an organization or branch...",
        state.query
      )}

      <div
        class="map-page-content"
        style="margin-top:20px"
      >
        ${mapMarkup("discovery-map")}
      </div>

      <div class="location-actions">
        <button class="btn soft" data-location>
          ${icon("locate")} My Location
        </button>

        <span class="muted" id="map-count"></span>
      </div>

      <div class="map-list" id="map-results"></div>
    `,
    "explore-places",
    "map-page"
  );

  let live = null;

  const update = () => {
    live?.destroy();

    const filtered = branches.filter((branch) =>
      `${
        branch.organizationName
      } ${
        branch.branchName
      } ${
        branch.address || ""
      } ${
        branch.city || ""
      }`
        .toLowerCase()
        .includes(state.query.toLowerCase())
    );

    const selected = filtered.find(
      (branch) => branch.id === params.get("branch")
    );

    live = mountMap(document, {
      records: filtered,
      destination: selected,
    });

    const omitted = filtered.filter(
      (branch) => !point(branch)
    ).length;

    document.querySelector("#map-count").textContent =
      `${filtered.length - omitted} branches on the map${
        omitted ? ` • ${omitted} without coordinates` : ""
      }`;

    document.querySelector("#map-results").innerHTML =
      filtered.length
        ? filtered
            .map(
              (branch) => `
                <a
                  href="${href("organization-services", {
                    id: branch.organizationId,
                    branch: branch.id,
                  })}"
                >
                  ${logo(orgById(branch.organizationId))}

                  <span>
                    ${esc(branch.organizationName)}

                    <small class="block">
                      ${esc(branch.branchName)}
                    </small>

                    ${
                      !point(branch)
                        ? `
                          <small class="block muted">
                            Location unavailable
                          </small>
                        `
                        : ""
                    }
                  </span>
                </a>
              `
            )
            .join("")
        : empty("No matching branches found.");
  };

  update();

  document.querySelector("#search").oninput = (event) => {
    state.query = event.target.value;
    update();
  };

  bindSearch((query) => {
    state.query = query;
    update();
  });

  document.querySelector("[data-location]").onclick = () =>
    live.locate();

  setCleanup(() => live?.destroy());
}

// ==================================================
// NOTIFICATIONS
// ==================================================

async function renderNotifications() {
  shell(
    `
      ${heading("Notifications")}

      <div class="profile-layout">
        ${profileMenu("notifications")}

        <section
          class="panel plain-content"
          id="notifications-results"
        >
          <p>Loading notifications...</p>
        </section>
      </div>
    `
  );

  try {
    const account = store.profile();

    const rows = (await api().listAll("notifications")).items
      .filter((notification) => notification.ownerId === account.id);

    const root = document.querySelector("#notifications-results");

    if (!root) return;

    root.innerHTML = rows.length
      ? rows
          .sort(
            (a, b) =>
              Date.parse(b.createdAt) - Date.parse(a.createdAt)
          )
          .map(
            (notification) => `
              <article class="review-row">
                <h3>${esc(notification.title)}</h3>

                <p>
                  ${esc(notification.message || "")}
                </p>

                <small>
                  ${safeDate(notification.createdAt)}
                </small>

                <div>
                  ${
                    notification.bookingId
                      ? `
                        <a
                          class="btn soft"
                          href="${href("my-visits", {
                            track: notification.bookingId,
                          })}"
                        >
                          View Visit
                        </a>
                      `
                      : notification.kind === "recruitment"
                        ? `
                          <a
                            class="btn soft"
                            href="${href("recruitment")}"
                          >
                            Recruitment
                          </a>
                        `
                        : ""
                  }
                </div>
              </article>
            `
          )
          .join("")
      : empty("No notifications yet.");
  } catch (error) {
    const root = document.querySelector("#notifications-results");

    if (root) {
      root.innerHTML = empty(errorText(error));
    }
  }
}

// ==================================================
// HELP
// ==================================================

function renderHelp() {
  const links = [
    ["Recruitment & Applications", "recruitment", "user"],
    ["My Bookings & Visits", "my-visits", "calendar"],
    ["Favorites", "saved-places", "heart"],
    ["My Reviews", "my-reviews", "star"],
    ["My Reports", "my-reports", "shield"],
    ["Report an Accessibility Issue", "report-accessibility-issue", "access"],
    ["Add a Place", "add-place", "building"],
    ["Accessibility Preferences", "accessibility-preferences", "access"],
  ];

  shell(
    `
      ${heading("Help & Account Services")}

      <div class="career-grid">
        ${links
          .map(
            ([name, route, linkIcon]) => `
              <a
                class="panel shortcut-card"
                href="${href(route)}"
              >
                ${icon(linkIcon)}
                <h2>${name}</h2>
              </a>
            `
          )
          .join("")}
      </div>

      <section
        class="panel plain-content"
        style="margin-top:24px"
      >
        <h2>Booking & Visit Tracking</h2>

        <p>
          Select an organization, branch, service, and available time.
          After approval, you can indicate you are on your way
          and check in. Queue updates and service progress
          depend on the organization.
        </p>

        <p>
          For account help, use the support request form.
        </p>

        <a
          class="btn soft"
          href="${href("support-request")}"
        >
          Submit Support Request
        </a>
      </section>
    `,
    "help-support"
  );
}

// ==================================================
// SUPPORT
// ==================================================

function renderSupport() {
  shell(
    `
      ${heading("Support Request")}

      <form class="panel" id="support-form">
        <label class="field">
          Subject
          <input
            name="subject"
            required
            maxlength="120"
          >
        </label>

        <label class="field">
          Request Details
          <textarea
            name="description"
            required
            maxlength="4000"
          ></textarea>
        </label>

        <button class="btn primary" type="submit">
          Submit Request
        </button>
      </form>
    `,
    "help-support"
  );

  document.querySelector("form").onsubmit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    busy(form.querySelector("button"), async () => {
      const formData = new FormData(form);

      await api().saveTicket({
        kind: "support",
        category: formData.get("subject"),
        subject: formData.get("subject"),
        title: formData.get("subject"),
        description: formData.get("description"),
        requesterId: store.profile().id,
        status: "Open",
      });

      form.reset();

      toast("Your support request has been submitted.");
    });
  };
}

// ==================================================
// RESCHEDULE
// ==================================================

async function renderReschedule() {
  const booking = store.bookings().find(
    (item) => item.id === params.get("id")
  );

  if (
    !booking ||
    booking.statusCode !== "pending" ||
    booking.interviewId
  ) {
    shell(
      `
        ${heading("Reschedule Appointment")}
        ${empty(
          "This booking cannot be changed. Only pending bookings can be rescheduled."
        )}
      `
    );
    return;
  }

  shell(
    `
      ${heading("Reschedule Appointment")}

      <form class="panel" id="reschedule-form">
        <h2>${esc(serviceName(booking))}</h2>

        <label class="field">
          Date
          <input
            type="date"
            name="date"
            required
            value="${esc(booking.date)}"
          >
        </label>

        <label class="field">
          Time

          <select name="time" required>
            <option value="">Select a date first</option>
          </select>
        </label>

        <button class="btn primary" type="submit">
          Submit Reschedule Request
        </button>

        <p
          class="validation"
          data-error
          role="alert"
        ></p>
      </form>
    `,
    "my-visits"
  );

  const form = document.querySelector("form");
  let revision = 0;

  const availability = async () => {
    const version = ++revision;

    form.querySelector("select").innerHTML =
      '<option value="">Loading available times...</option>';

    try {
      const result = await api().getBookingAvailability(
        booking.branchId,
        form.elements.date.value,
        booking.serviceId,
        {
          requiresAssistant: booking.requiresAssistant,
          excludeBookingId: booking.id,
        }
      );

      if (version !== revision) return;

      form.querySelector("select").innerHTML =
        '<option value="">Select a time</option>' +
        result.slots
          .map(
            (time) => `
              <option value="${esc(time)}">
                ${esc(time)}
              </option>
            `
          )
          .join("");

      if (!result.slots.length) {
        form.querySelector("[data-error]").textContent =
          "No appointment slots are available on the selected date.";
      }
    } catch (error) {
      form.querySelector("[data-error]").textContent =
        errorText(error);
    }
  };

  form.elements.date.onchange = availability;

  form.onsubmit = (event) => {
    event.preventDefault();

    busy(form.querySelector("button"), async () => {
      await api().updateBooking(booking.id, {
        date: form.elements.date.value,
        time: form.elements.time.value,
        expectedRevision: booking.revision,
        requiresAssistant: booking.requiresAssistant,
        serviceId: booking.serviceId,
      });

      location.assign(href("my-visits"));
    });
  };

  availability();
}

// ==================================================
// LANGUAGE AND THEME
// ==================================================

function renderAccount() {
  const language =
    document.documentElement.lang === "ar" ? "ar" : "en";

  const mode = window.WusoolTheme?.preference || "system";

  shell(
    `
      ${heading("Language & Appearance")}

      <div class="profile-layout">
        ${profileMenu("account-settings")}

        <section class="panel plain-content">
          <h2>Display Preferences</h2>

          <label class="field" for="account-language">
            Language

            <select id="account-language">
              <option
                value="en"
                ${language === "en" ? "selected" : ""}
              >
                English
              </option>

              <option
                value="ar"
                ${language === "ar" ? "selected" : ""}
              >
                Arabic
              </option>
            </select>
          </label>

          <label class="field" for="account-theme">
            Theme

            <select id="account-theme">
              <option
                value="light"
                ${mode === "light" ? "selected" : ""}
              >
                Light
              </option>

              <option
                value="dark"
                ${mode === "dark" ? "selected" : ""}
              >
                Dark
              </option>

              <option
                value="system"
                ${mode === "system" ? "selected" : ""}
              >
                System
              </option>
            </select>
          </label>

          <a
            class="btn primary"
            href="${href("accessibility-preferences")}"
          >
            Accessibility Preferences
          </a>
        </section>
      </div>
    `
  );

  document.querySelector("#account-language").onchange =
    async (event) => {
      await window.WusoolPreferences?.setLanguage(
        event.target.value
      );

      renderAccount();
    };

  document.querySelector("#account-theme").onchange =
    (event) =>
      window.WusoolTheme?.set(
        event.target.value,
        event.target
      );
}

// ==================================================
// ROUTES
// ==================================================

const renders = {
  "user-dashboard": renderHome,
  institutions: renderInstitutions,
  "service-directory": renderServices,
  "organization-services": renderInstitution,
  "plan-visit": renderWizard,
  "my-visits": renderBookings,
  "my-tickets": renderBookings,
  "saved-places": renderFavorites,
  "user-profile": renderProfile,
  "accessibility-preferences": renderAccessibility,
  "explore-places": renderMap,
  "help-support": renderHelp,
  notifications: renderNotifications,
  "account-settings": renderAccount,
  recruitment: renderRecruitment,
  "reschedule-visit": renderReschedule,
  "support-request": renderSupport,
};

// ==================================================
// INITIALIZATION
// ==================================================

try {
  if (await store.initialize()) {
    services.forEach((service) => {
      service.favoriteId =
        `service:${service.branchId}:${service.id}`;

      service.branchName =
        branches.find(
          (branch) => branch.id === service.branchId
        )?.branchName || "";
    });

    applySettings();

    currentRender = renders[page] || renderHome;

    await currentRender();
  }
} catch (error) {
  document.querySelector("#app").innerHTML = `
    <main class="page">
      <section class="panel">
        <h1>Unable to Load the User Portal</h1>

        <p>${esc(errorText(error))}</p>

        <button
          class="btn primary"
          onclick="location.reload()"
        >
          Try Again
        </button>
      </section>
    </main>
  `;
}

// ==================================================
// AUTHENTICATION REFRESH
// ==================================================

let authRunning = false;

const displayedAccountId = store.profile().id;

async function recheck() {
  if (authRunning) return;

  authRunning = true;

  try {
    if (!(await requireUser())) {
      document.querySelector("#app").replaceChildren();
    } else if (
      displayedAccountId &&
      store.profile().id !== displayedAccountId
    ) {
      document.querySelector("#app").replaceChildren();
      location.reload();
    }
  } finally {
    authRunning = false;
  }
}

window.addEventListener("storage", (event) => {
  if (event.key === "wusool.database.v2") {
    recheck();
  }
});

window.addEventListener("wusool:auth-error", recheck);
window.addEventListener("wusool:account-changed", recheck);
window.addEventListener("wusool:session-changed", recheck);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) recheck();
});

setInterval(recheck, 15000);

// ==================================================
// LIVE CATALOG REFRESH
// ==================================================

let catalogUpdating = false;

async function refreshPublishedViews() {
  if (
    catalogUpdating ||
    document.hidden ||
    document.querySelector(".modal-backdrop") ||
    document.activeElement?.matches("input,textarea,select")
  ) {
    return;
  }

  if (
    ![
      "user-dashboard",
      "service-directory",
      "institutions",
      "organization-services",
      "saved-places",
      "plan-visit",
    ].includes(page)
  ) {
    return;
  }

  catalogUpdating = true;

  try {
    const selections = [
      ...document.querySelectorAll("select"),
    ].map((element) => ({
      id: element.id,
      name: element.name,
      value: element.value,
    }));

    const before = JSON.stringify([
      institutions,
      services,
      store.favorites(),
    ]);

    await refreshAccount();
    await refreshCatalog();

    const after = JSON.stringify([
      institutions,
      services,
      store.favorites(),
    ]);

    if (before !== after) {
      await currentRender?.();

      for (const saved of selections) {
        const element = saved.id
          ? document.getElementById(saved.id)
          : [
              ...document.querySelectorAll("select"),
            ].find((item) => item.name === saved.name);

        if (
          element &&
          [...element.options].some(
            (option) => option.value === saved.value
          )
        ) {
          element.value = saved.value;
          element.dispatchEvent(new Event("change"));
        }
      }
    }
  } catch (error) {
    if (
      !["UNAUTHENTICATED", "ACCOUNT_BLOCKED"].includes(
        error.code
      )
    ) {
      toast(errorText(error));
    }
  } finally {
    catalogUpdating = false;
  }
}

window.addEventListener("storage", (event) => {
  if (event.key === "wusool.database.v2") {
    refreshPublishedViews();
  }
});

window.addEventListener(
  "wusool:data-changed",
  refreshPublishedViews
);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    refreshPublishedViews();
  }
});

setInterval(refreshPublishedViews, 30000);
