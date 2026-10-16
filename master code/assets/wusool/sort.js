
import "../sort-filter.js";

// Sort records using the current interface language.
export const sortRecords = (records, rules) =>
  window.WusoolSort.stable(
    records,
    rules,
    document.documentElement.lang || "en"
  );

// Render the sorting control in the selected language.
export function sortControl(
  value,
  options,
  id = "sort-order"
) {
  const language =
    document.documentElement.lang === "ar"
      ? "ar"
      : "en";

  const label =
    language === "ar"
      ? "ترتيب حسب"
      : "Sort by";

  return `
    <label class="sort-control" for="${id}">
      <span
        data-wusool-en="Sort by"
        data-wusool-ar="ترتيب حسب"
      >
        ${label}
      </span>

      <select id="${id}">
        ${options
          .map((option) => {
            const optionLabel =
              language === "ar"
                ? option.ar || option.en
                : option.en || option.ar;

            return `
              <option
                value="${option.value}"
                ${
                  option.value === value
                    ? "selected"
                    : ""
                }
                data-wusool-en="${option.en || ""}"
                data-wusool-ar="${option.ar || ""}"
              >
                ${optionLabel}
              </option>
            `;
          })
          .join("")}
      </select>
    </label>
  `;
}
