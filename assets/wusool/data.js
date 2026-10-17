
/*
 * Wusool User Portal - Data Collections
 *
 * English is the default display language.
 * Data is populated dynamically from WusoolServices.
 *
 * Do not change entity IDs or relationships.
 */

// --------------------------------------------------
// Dynamic Data Collections
// --------------------------------------------------

export const institutions = [];

export const services = [];

export const branches = [];

// --------------------------------------------------
// Service Categories
// --------------------------------------------------

export const categories = [
  "All Categories",
  "Government",
  "Finance",
  "Healthcare",
  "Education",
  "Telecommunications",
  "Digital Services",
  "Municipal Services",
  "Other",
];

// --------------------------------------------------
// Category Display Labels
// --------------------------------------------------

export function categoryLabel(type = "") {
  const value = String(type || "").trim();
  const t = value.toLowerCase();

  if (!t) return "Other";

  // All Categories
  if (/^(all categories|كل الفئات)$/.test(t)) {
    return "All Categories";
  }

  // Finance
  if (/bank|financ|بنك|مالية/.test(t)) {
    return "Finance";
  }

  // Government
  if (/govern|civil|حكوم|مدني|وزارة/.test(t)) {
    return "Government";
  }

  // Healthcare
  if (/health|hospital|صح|مستشفى/.test(t)) {
    return "Healthcare";
  }

  // Education
  if (/educ|school|تعليم|جامعة|اكاديم|أكاديم/.test(t)) {
    return "Education";
  }

  // Telecommunications
  if (/telecom|اتصال/.test(t)) {
    return "Telecommunications";
  }

  // Municipal Services
  if (/municip|بلدي/.test(t)) {
    return "Municipal Services";
  }

  // Digital Services
  if (/digital|رقمي/.test(t)) {
    return "Digital Services";
  }

  // Other
  if (/^(other|أخرى|اخرى)$/.test(t)) {
    return "Other";
  }

  // Preserve unknown categories instead of changing data.
  return value;
}
