
import { institutions } from "./data.js";
import { serviceCard } from "./components.js";

// Select a display translation without changing the stored record.
function displayText(record, field, language) {
  if (!record || typeof record !== "object") return "";

  const suffix = language === "ar" ? "Ar" : "En";

  const variants = [
    record[`${field}${suffix}`],
    record[`${field}_${language}`],
    record.translations?.[language]?.[field],
    record[field]?.[language],
    record[field],
  ];

  return (
    variants.find(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0,
    ) || ""
  );
}

window.addEventListener("message", (event) => {
  if (
    event.origin !== location.origin ||
    event.source !== parent ||
    event.data?.type !== "wusool-service-preview"
  ) {
    return;
  }

  const language =
    document.documentElement.lang === "ar" ? "ar" : "en";

  const category =
    language === "ar" ? "خدمات" : "Services";

  // This preview-only organization does not modify persisted data.
  institutions.splice(0, institutions.length, {
    id: "preview",
    name:
      displayText(
        event.data,
        "organizationName",
        language,
      ) ||
      String(event.data.organizationName || ""),
    category,
  });

  const items = Array.isArray(event.data.items)
    ? event.data.items
    : [];

  const branchName =
    displayText(event.data, "branchName", language) ||
    String(event.data.branchName || "");

  document.querySelector("#preview").innerHTML = items
    .filter(
      (service) =>
        service && typeof service === "object",
    )
    .map((service) =>
      serviceCard(
        {
          ...service,

          name: displayText(
            service,
            "name",
            language,
          ),

          description: displayText(
            service,
            "description",
            language,
          ),

          institutionId: "preview",
          branchName,
          duration: service.durationMinutes,
          category,
          directoryOnly: false,
        },
        true,
      ),
    )
    .join("");

  // Preview cards must not trigger real navigation or booking actions.
  document.querySelectorAll("a,button").forEach(
    (element) => {
      element.tabIndex = -1;

      element.addEventListener(
        "click",
        (event) => event.preventDefault(),
      );
    },
  );
});
