
import { institutions, services, branches, categoryLabel } from "./data.js";

let account = null;
let bookings = [];
let favorites = [];

let settings = {
  size: "normal",
  contrast: false,
  motion: false,
  focus: false,
  magnify: false,
};

export const api = () => window.WusoolServices;
export const signedAccount = () => account;
export const rootUrl = new URL("../../", import.meta.url);

const preferenceKeys = {
  size: "wusool-font-size",
  contrast: "wusool-high-contrast",
  motion: "wusool-reduce-motion",
  focus: "wusool-focus-mode",
  magnify: "wusool-magnify",
};

// English display names.
// These mappings do not modify original database records.
const knownEnglishNames = new Map([
  ["بنك الاتحاد", "Bank al Etihad"],
  ["بنك الإتحاد", "Bank al Etihad"],
  ["أورنج", "Orange Jordan"],
  ["اورنج", "Orange Jordan"],
  ["أكاديمية أورنج للبرمجة", "Orange Coding Academy"],
  ["اكاديمية اورنج للبرمجة", "Orange Coding Academy"],
  [
    "وزارة الاقتصاد الرقمي والريادة",
    "Ministry of Digital Economy and Entrepreneurship",
  ],
  ["دائرة الأحوال المدنية", "Civil Status Department"],
  [
    "دائرة الأحوال المدنية والجوازات",
    "Civil Status and Passports Department",
  ],
  ["فتح حساب بنكي", "Open a Bank Account"],
  ["إصدار بطاقة شخصية", "National ID Card Issuance"],
]);

const englishCities = new Map([
  ["عمّان", "Amman"],
  ["عمان", "Amman"],
  ["إربد", "Irbid"],
  ["اربد", "Irbid"],
  ["الزرقاء", "Zarqa"],
  ["السلط", "Salt"],
  ["جرش", "Jerash"],
  ["المفرق", "Mafraq"],
  ["العقبة", "Aqaba"],
  ["مادبا", "Madaba"],
  ["عجلون", "Ajloun"],
  ["الكرك", "Karak"],
  ["معان", "Ma'an"],
  ["الطفيلة", "Tafilah"],
  ["الرمثا", "Ramtha"],
]);

// Read an English field when the service provides one.
function englishField(record, field, fallback = "") {
  const suffix = field.charAt(0).toUpperCase() + field.slice(1);

  const options = [
    record?.[`${field}En`],
    record?.[`${field}_en`],
    record?.[`english${suffix}`],
    record?.translations?.en?.[field],
    record?.[field]?.en,
    fallback,
  ];

  return (
    options.find(
      (value) =>
        typeof value === "string" &&
        value.trim()
    ) || ""
  );
}

function englishName(value) {
  if (typeof value !== "string") {
    return value || "";
  }

  return knownEnglishNames.get(value.trim()) || value;
}

function englishCity(value) {
  if (typeof value !== "string") {
    return value || "";
  }

  return englishCities.get(value.trim()) || value;
}

function englishBranch(value) {
  if (typeof value !== "string") {
    return value || "";
  }

  const trimmed = value.trim();
  const match = /^فرع\s+(.+)$/.exec(trimmed);

  if (match && englishCities.has(match[1].trim())) {
    return `${englishCities.get(match[1].trim())} Branch`;
  }

  return englishName(trimmed);
}

// --------------------------------------------------
// Accessibility preferences
// --------------------------------------------------

function preferredSettings(fallback = settings) {
  const result = { ...fallback };

  for (const [name, key] of Object.entries(preferenceKeys)) {
    let saved;

    try {
      saved = localStorage.getItem(key);
    } catch {
      continue;
    }

    if (saved === null) continue;

    if (name === "size") {
      result.size = ["normal", "large", "xlarge"].includes(saved)
        ? saved
        : saved === "small"
          ? "normal"
          : result.size;
    } else {
      result[name] = ["enabled", "true"].includes(saved);
    }
  }

  return result;
}

function writeSettings(value) {
  for (const [name, key] of Object.entries(preferenceKeys)) {
    try {
      localStorage.setItem(
        key,
        name === "size"
          ? value.size
          : value[name]
            ? "enabled"
            : "disabled"
      );
    } catch {
      // Storage may be unavailable in private browsing mode.
    }
  }
}

// --------------------------------------------------
// Authentication
// --------------------------------------------------

export function loginUrl() {
  const url = new URL("visitor/html/login.html", rootUrl);

  url.searchParams.set(
    "returnTo",
    location.pathname + location.search
  );

  return url.href;
}

export async function requireUser() {
  try {
    account = await api().getCurrentAccount();

    if (!account || account.requiresInitialSetup) {
      location.replace(loginUrl());
      return false;
    }

    if (account.role !== "User") {
      const route =
        account.role === "Admin"
          ? "admin/html/admin-dashboard.html"
          : "org/html/organization-dashboard.html";

      location.replace(new URL(route, rootUrl));
      return false;
    }

    return true;
  } catch {
    location.replace(loginUrl());
    return false;
  }
}

// --------------------------------------------------
// Organization images
// --------------------------------------------------

function photo(org, list) {
  const original =
    org.image ||
    list.find((branch) => branch.photos?.length)?.photos?.[0];

  const image =
    typeof original === "string"
      ? original
      : original?.url || original?.imageData;

  return {
    image: image || null,
    logo: org.logo || null,
  };
}

// --------------------------------------------------
// Organizations, branches and services
// --------------------------------------------------

export async function refreshCatalog() {
  const result = await api().places();

  const places = Array.isArray(result)
    ? result
    : result.items || [];

  // Prepare branch data for the English User Portal.
  branches.splice(
    0,
    branches.length,

    ...places.map((branch) => ({
      ...branch,

      id: branch.id || branch.placeId,

      branchName: englishBranch(
        englishField(
          branch,
          "branchName",
          branch.branchName ||
            branch.branch ||
            branch.name ||
            ""
        )
      ),

      organizationName: englishName(
        englishField(
          branch,
          "organizationName",
          branch.organizationName || ""
        )
      ),

      city: englishCity(
        englishField(
          branch,
          "city",
          branch.city || ""
        )
      ),

      // Use official English values where available.
      address: englishField(
        branch,
        "address",
        branch.address || ""
      ),

      description: englishField(
        branch,
        "description",
        branch.description || ""
      ),

      hoursText: englishField(
        branch,
        "hoursText",
        branch.hoursText || ""
      ),

      hoursNote: englishField(
        branch,
        "hoursNote",
        branch.hoursNote || ""
      ),

      bookingNote: englishField(
        branch,
        "bookingNote",
        branch.bookingNote || ""
      ),
    }))
  );

  // Load published organizations.
  const organizationResponse = await api().portal.organizations();

  const grouped = new Map(
    organizationResponse.items.map((org) => [
      org.id,
      {
        ...org,

        name: englishName(
          englishField(org, "name", org.name || "")
        ),

        description: englishField(
          org,
          "description",
          org.description || ""
        ),

        category: categoryLabel(org.type),

        tagline: englishField(
          org,
          "description",
          org.description || ""
        ),

        branches: [],
        ratingTotal: 0,
        reviewCount: 0,
      },
    ])
  );

  // Connect branches to organizations.
  for (const branch of branches) {
    if (!branch.organizationId) continue;

    const rawOrganization =
      branch.organizationProfile || {
        id: branch.organizationId,
        name: branch.organizationName,
      };

    const organization = {
      ...rawOrganization,

      name: englishName(
        englishField(
          rawOrganization,
          "name",
          rawOrganization.name || ""
        )
      ),

      description: englishField(
        rawOrganization,
        "description",
        rawOrganization.description || ""
      ),
    };

    const list = grouped.get(branch.organizationId) || {
      ...organization,

      directoryOnly: false,

      id: branch.organizationId,

      name:
        organization.name ||
        branch.organizationName,

      category: categoryLabel(
        branch.category || branch.type
      ),

      tagline: organization.description || "",

      branches: [],
      ratingTotal: 0,
      reviewCount: 0,
    };

    list.branches.push(branch);

    list.ratingTotal +=
      (Number(branch.rating) || 0) *
      (Number(branch.reviewCount) || 0);

    list.reviewCount +=
      Number(branch.reviewCount) || 0;

    grouped.set(branch.organizationId, list);
  }

  institutions.splice(
    0,
    institutions.length,

    ...[...grouped.values()].map((org) => ({
      ...org,
      ...photo(org, org.branches),

      branch:
        org.branches[0]?.branchName || "",

      rating: org.reviewCount
        ? org.ratingTotal / org.reviewCount
        : 0,
    }))
  );

  // Load published services.
  const published =
    await api().getPublishedServiceCatalog?.();

  const servicesByBranch = published
    ? new Map()
    : null;

  for (const service of published?.items || []) {
    if (!servicesByBranch.has(service.branchId)) {
      servicesByBranch.set(service.branchId, []);
    }

    servicesByBranch
      .get(service.branchId)
      .push(service);
  }

  const lists = await Promise.all(
    branches.map(async (branch) => {
      try {
        const response = servicesByBranch
          ? {
              items:
                servicesByBranch.get(branch.id) || [],
            }
          : await api().getTicketServices(
              branch.id,
              { published: true }
            );

        return (response.items || response || [])
          .filter(
            (service) =>
              service.active !== false
          )
          .map((service) => ({
            ...service,

            id: service.id,

            branchId: branch.id,

            institutionId: branch.organizationId,

            name: englishName(
              englishField(
                service,
                "name",
                service.name || ""
              )
            ),

            description: englishField(
              service,
              "description",
              service.description || ""
            ),

            category:
              institutions.find(
                (org) =>
                  org.id === branch.organizationId
              )?.category || "Other",

            duration: service.durationMinutes,

            directoryOnly: false,

            sourceUrl:
              service.sourceUrl ||
              branch.sourceUrl,

            officialUrl:
              service.officialUrl ||
              branch.officialUrl ||
              branch.sourceUrl,

            branchName: branch.branchName,

            favoriteId:
              `service:${branch.id}:${service.id}`,
          }));
      } catch (error) {
        if (
          ["INVALID_BRANCH", "NOT_FOUND"].includes(
            error.code
          )
        ) {
          return [];
        }

        throw error;
      }
    })
  );

  services.splice(
    0,
    services.length,
    ...lists.flat()
  );
}

// --------------------------------------------------
// Account and favorites
// --------------------------------------------------

function accountFavorites(value) {
  const legacy = (value?.savedPlaces || [])
    .map(
      (id) =>
        branches.find(
          (branch) => branch.id === id
        )?.organizationId
    )
    .filter(Boolean);

  return [
    ...new Set([
      ...(value?.settings?.portalFavorites || []),
      ...legacy,
    ]),
  ];
}

export async function refreshAccount() {
  account = await api().getCurrentAccount();

  if (
    !account ||
    account.role !== "User" ||
    account.requiresInitialSetup
  ) {
    location.replace(loginUrl());

    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  settings = preferredSettings({
    ...settings,
    ...account.preferences?.portalAccessibility,
  });

  favorites = accountFavorites(account);

  return account;
}

// --------------------------------------------------
// Bookings
// --------------------------------------------------

export async function refreshBookings() {
  bookings = (await api().getBookings())
    .filter(
      (booking) =>
        !booking.isDeleted &&
        booking.userId === account.id
    )
    .map((booking) => ({
      ...booking,

      institutionId: booking.organizationId,

      branch: englishBranch(
        englishField(
          booking,
          "branchName",
          booking.branchName ||
            booking.branch ||
            ""
        )
      ),

      day: new Intl.DateTimeFormat("en", {
        weekday: "long",
        timeZone: "UTC",
      }).format(
        new Date(booking.date + "T12:00:00Z")
      ),

      statusCode: String(booking.status)
        .toLowerCase()
        .replaceAll(" ", "-"),

      status: statusLabel(booking.status),
    }));

  return bookings;
}

export function statusLabel(value) {
  const key = String(value)
    .toLowerCase()
    .replaceAll(" ", "-");

  const labels = {
    pending: "Pending approval",
    confirmed: "Confirmed",
    "in-progress": "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    "no-show": "No show",
    waitlisted: "Waitlisted",
  };

  return labels[key] || value;
}

// Determine whether an appointment is in the past.
export function isPastVisit(
  booking,
  now = Date.now()
) {
  if (
    !["pending", "confirmed", "waitlisted"].includes(
      booking.statusCode
    )
  ) {
    return false;
  }

  if (
    ["arrived", "serving"].includes(
      booking.journeyState
    )
  ) {
    return false;
  }

  try {
    return (
      api().journey.appointment(booking) +
        (Number(booking.durationMinutes) || 30) *
          60000 <
      now
    );
  } catch {
    return false;
  }
}

// --------------------------------------------------
// Save settings
// --------------------------------------------------

let favoriteWrite = Promise.resolve();

async function persistSettings(patch) {
  const latest =
    await api().getCurrentAccount();

  account = await api().saveUser({
    id: latest.id,
    expectedRevision: latest.revision,

    settings: {
      ...latest.settings,
      ...patch,
    },
  });

  favorites = accountFavorites(account);

  return true;
}

// --------------------------------------------------
// User Portal Store
// --------------------------------------------------

export const store = {
  async initialize() {
    if (!(await requireUser())) {
      return false;
    }

    await refreshAccount();

    await Promise.all([
      refreshCatalog(),
      refreshBookings(),
    ]);

    favorites = accountFavorites(account);

    return true;
  },

  bookings: () => bookings,

  favorites: () => favorites,

  profile: () => ({
    ...account,

    name: account?.name || "",
    email: account?.email || "",
    phone: account?.phone || "",
    career: account?.profile || {},
  }),

  settings: () => settings,

  async toggleFavorite(id) {
    const run = async () => {
      await refreshAccount();

      const removing =
        favorites.includes(id);

      const candidate = removing
        ? favorites.filter(
            (item) => item !== id
          )
        : [...favorites, id];

      const institution =
        institutions.find(
          (org) => org.id === id
        );

      if (institution) {
        for (
          const branch of branches.filter(
            (item) =>
              item.organizationId === id
          )
        ) {
          const saved = (
            account.savedPlaces || []
          ).includes(branch.id);

          if (saved === removing) {
            await api().setSavedPlace(
              branch.id,
              !removing
            );
          }
        }
      }

      await persistSettings({
        portalFavorites: candidate,
      });

      return favorites;
    };

    const result =
      favoriteWrite.then(run, run);

    favoriteWrite =
      result.catch(() => {});

    return result;
  },

  async createBooking(input, key) {
    const result =
      await api().createBooking(
        {
          branchId: input.branchId,
          serviceId: input.serviceId,
          date: input.date,
          time: input.time,
          purpose: input.notes || "",

          requiresAssistant:
            input.assistance === true,

          support: input.assistance
            ? ["Staff assistance"]
            : [],
        },
        key
      );

    await refreshBookings();

    return result;
  },

  async cancelBooking(
    id,
    reason,
    revision
  ) {
    await api().visits.cancel(
      id,
      reason,
      revision
    );

    await refreshBookings();

    return true;
  },

  async saveProfile(value) {
    const latest =
      await api().getCurrentAccount();

    account = await api().saveUser({
      id: latest.id,
      expectedRevision:
        latest.revision,

      name: value.name,
      email: value.email,
      phone: value.phone,

      profile: {
        ...latest.profile,
        ...value.career,
      },
    });

    return true;
  },

  async saveSettings(value) {
    const latest =
      await api().getCurrentAccount();

    account = await api().saveUser({
      id: latest.id,

      expectedRevision:
        latest.revision,

      preferences: {
        ...latest.preferences,
        portalAccessibility: value,
      },
    });

    settings = {
      ...settings,
      ...value,
    };

    writeSettings(settings);
    applySettings(settings);

    return true;
  },

  async logout() {
    await api().logout();

    account = null;
    bookings = [];
    favorites = [];

    location.replace(
      new URL(
        "visitor/html/login.html",
        rootUrl
      )
    );
  },
};

// --------------------------------------------------
// Accessibility
// --------------------------------------------------

export function applySettings(
  value = store.settings()
) {
  document.documentElement.style.fontSize =
    {
      normal: "16px",
      large: "18px",
      xlarge: "20px",
    }[value.size] || "16px";

  for (
    const key of [
      "contrast",
      "motion",
      "focus",
      "magnify",
    ]
  ) {
    document.documentElement.classList.toggle(
      `a11y-${key}`,
      Boolean(value[key])
    );
  }
}

// --------------------------------------------------
// Error messages
// --------------------------------------------------

export function errorText(error) {
  const messages = {
    UNAUTHENTICATED:
      "Please sign in first.",

    FORBIDDEN:
      "You do not have permission to perform this action.",

    INVALID_DATE:
      "Please select a future date and time.",

    OUTSIDE_HOURS:
      "The selected time is outside working hours.",

    HOLIDAY_CLOSED:
      "This branch is closed on the selected date.",

    BOOKING_OVERLAP:
      "You already have a booking that overlaps this time.",

    ASSISTANCE_CAPACITY:
      "Assistance is fully booked at this time. Please choose another slot.",

    INVALID_SERVICE:
      "This service is unavailable at the selected branch.",

    STALE_BOOKING:
      "Your booking has changed. Refresh and try again.",

    CONFLICT:
      "The information has changed. Refresh the page and try again.",

    IDEMPOTENCY_CONFLICT:
      "This request was previously submitted with different details. Check My Bookings before trying again.",

    DUPLICATE_APPLICATION:
      "You have already applied for this job.",

    CONSENT_REQUIRED:
      "Please consent to sharing your application details.",

    NOT_AVAILABLE:
      "This action is currently unavailable.",

    INVALID_TRANSITION:
      "You cannot move to this status right now.",

    INVALID_STATE:
      "This action is not available in the current status.",

    EXAM_EXPIRED:
      "The exam time has expired.",

    INVALID_BRANCH:
      "This branch is no longer available for booking.",

    CREDENTIAL_CHANGE_REQUIRED:
      "Please change your temporary password first.",
  };

  return (
    messages[error?.code] ||
    error?.message ||
    "Unable to complete this action. Please try again."
  );
}
