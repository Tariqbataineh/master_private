
import {
  header,
  href,
  esc,
  icon,
  empty,
  modal,
  toast,
} from "./components.js";

import {
  store,
  api,
  errorText,
  refreshAccount,
} from "./store.js";

// --------------------------------------------------
// Current page
// --------------------------------------------------

export const page =
  document.body.dataset.page || "user-dashboard";

let pageCleanup = () => {};

// --------------------------------------------------
// Page cleanup
// --------------------------------------------------

export function setCleanup(fn) {
  pageCleanup = fn || (() => {});
}

// --------------------------------------------------
// Application shell
// --------------------------------------------------

export function shell(content, active = page, cls = "") {
  pageCleanup();
  pageCleanup = () => {};

  document.querySelector("#app").innerHTML = `
    <div class="app-shell">
      ${header(active)}

      <main
        id="main-content"
        class="page ${cls}"
        tabindex="-1"
      >
        ${content}
      </main>

      <footer class="user-footer">
        <a href="${href("user-dashboard")}">
          Wusool
        </a>

        <span
          data-en="Accessible visits, together."
          data-ar="زيارات ميسّرة، معًا."
        >
          ${
            document.documentElement.lang === "ar"
              ? "زيارات ميسّرة، معًا."
              : "Accessible visits, together."
          }
        </span>
      </footer>
    </div>
  `;

  bindShared();
}

// --------------------------------------------------
// Page heading
// --------------------------------------------------

export const heading = (title, subtitle = "") => `
  <div class="page-heading">
    <h1>${esc(title)}</h1>

    ${
      subtitle
        ? `<p>${esc(subtitle)}</p>`
        : ""
    }
  </div>
`;

// --------------------------------------------------
// Shared interactions
// --------------------------------------------------

export function bindShared() {
  // Mobile navigation menu
  document
    .querySelector("[data-menu]")
    ?.addEventListener("click", (event) => {
      const opened = document
        .querySelector(".header")
        .classList.toggle("menu-open");

      event.currentTarget.setAttribute(
        "aria-expanded",
        opened,
      );
    });

  // Logout
  document
    .querySelector("[data-logout]")
    ?.addEventListener("click", async () => {
      await store.logout();
    });

  // Notifications navigation
  document
    .querySelector("[data-notifications]")
    ?.addEventListener("click", () => {
      location.assign(href("notifications"));
    });

  // Shared favorite buttons
  bindFavorites();

  // Keyboard navigation for tabs
  document
    .querySelectorAll('[role="tablist"]')
    .forEach((list) => {
      list.addEventListener("keydown", (event) => {
        if (
          ![
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
          ].includes(event.key)
        ) {
          return;
        }

        const buttons = [
          ...list.querySelectorAll('[role="tab"]'),
        ];

        let index = buttons.indexOf(
          document.activeElement,
        );

        if (index < 0) return;

        event.preventDefault();

        index =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : (
                  index +
                  (event.key === "ArrowLeft" ? 1 : -1) +
                  buttons.length
                ) % buttons.length;

        buttons[index].focus();
        buttons[index].click();
      });
    });
}

// --------------------------------------------------
// Favorite buttons
// --------------------------------------------------

export function bindFavorites(
  root = document,
  onChange,
) {
  root
    .querySelectorAll("[data-favorite]")
    .forEach((button) => {
      button.onclick = async () => {
        if (button.disabled) return;

        button.disabled = true;

        try {
          await store.toggleFavorite(
            button.dataset.favorite,
          );

          const selected = store
            .favorites()
            .includes(button.dataset.favorite);

          root
            .querySelectorAll("[data-favorite]")
            .forEach((element) => {
              if (
                element.dataset.favorite !==
                button.dataset.favorite
              ) {
                return;
              }

              element.classList.toggle(
                "selected",
                selected,
              );

              element.setAttribute(
                "aria-pressed",
                selected,
              );

              element.setAttribute(
                "aria-label",
                selected
                  ? "Remove from Favorites"
                  : "Add to Favorites",
              );

              if (
                element.classList.contains("heart")
              ) {
                element.innerHTML = icon(
                  selected
                    ? "heartFill"
                    : "heart",
                );
              }
            });

          onChange?.();

          toast(
            selected
              ? "Added to Favorites"
              : "Removed from Favorites",
          );
        } catch (error) {
          toast(errorText(error));
        } finally {
          button.disabled = false;
        }
      };
    });
}

// --------------------------------------------------
// Search forms
// --------------------------------------------------

export function bindSearch(callback) {
  document
    .querySelectorAll("[data-search-form]")
    .forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        callback(
          form
            .querySelector("input")
            .value.trim(),
        );
      });
    });
}

// --------------------------------------------------
// Tabs
// --------------------------------------------------

export function bindTabs(attribute, callback) {
  document
    .querySelectorAll(`[data-${attribute}]`)
    .forEach((button) => {
      button.onclick = () => {
        document
          .querySelectorAll(`[data-${attribute}]`)
          .forEach((element) => {
            element.classList.toggle(
              "active",
              element === button,
            );

            element.setAttribute(
              "aria-selected",
              element === button,
            );

            element.tabIndex =
              element === button ? 0 : -1;
          });

        callback(
          button.getAttribute(
            "data-" + attribute,
          ),
        );
      };
    });
}

// --------------------------------------------------
// Button loading and error handling
// --------------------------------------------------

export async function busy(button, fn) {
  if (button?.disabled) return;

  if (button) {
    button.disabled = true;

    button.setAttribute(
      "aria-busy",
      "true",
    );
  }

  try {
    return await fn();
  } catch (error) {
    toast(errorText(error));
    return null;
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  }
}

// --------------------------------------------------
// Confirmation popup
// --------------------------------------------------

export const confirmAction = (
  title,
  text,
  action,
) => {
  const dialog = modal(
    title,
    `<p>${esc(text)}</p>`,
    {
      footer: `
        <button
          class="btn primary"
          data-confirm
        >
          Confirm
        </button>
      `,
    },
  );

  dialog.host
    .querySelector("[data-confirm]")
    .onclick = (event) =>
      busy(event.currentTarget, async () => {
        await action();
        dialog.close();
      });

  return dialog;
};

// --------------------------------------------------
// Date formatting
// --------------------------------------------------

export function safeDate(iso) {
  if (!iso) return "";

  const date = new Date(iso);

  if (Number.isNaN(+date)) {
    return "";
  }

  const language =
    document.documentElement.lang === "ar"
      ? "ar"
      : "en";

  return new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
    numberingSystem: "latn",
    timeZone: "Asia/Amman",
  }).format(date);
}
