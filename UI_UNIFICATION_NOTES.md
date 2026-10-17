# UI unification notes (presentation only)

Logic was not changed. Only these JS lines changed: one template string in `user/js/user-layout.js`
(the brand markup in the shared header: `Wusool / Portal`, same as the portal-shell header).

## What was added
- `assets/wusool/unified-ui.css` (loaded LAST on all 35 `user/html/*.html` pages). One set of tokens for:
  fonts (Inter for English, Cairo for Arabic, self-hosted), type scale, radii (8/12/16/pill), button size (44px),
  card radius/border/shadow/padding, equal-height card grids, one green (`#006653`), header (76px), footer,
  page frame for the Bootstrap pages, and a few fixes (nav/tools overlap, truncated theme select, white-on-white
  card button, hero rows pushing text off screen on two pages).
- `assets/wusool/fonts/` Inter woff2 files (SIL OFL, licence included).

## What was changed
- Removed the Google Fonts `<link>` tags from the user pages and the `@import` from `assets/wusool/styles.css`.
- `assets/wusool/styles.css`, `assets/wusool/user-portal-repair.css`: Sora / Alexandria / Tajawal / Arial font stacks
  now use `var(--u-font)`.
- `user/html/visual-navigation-start.html`: `class="wsp-unified-layout"` on `<body>` (the shared page frame).
- Dark mode still goes through the existing `--wt-*` variables; the unified layer only sets the green for light mode.

## To undo
Remove the `<link ... unified-ui.css>` line from the pages (the other edits are small and listed above).

## Not done / needs a decision
- Header links differ between the two page families (e.g. `My Bookings` opens `my-tickets` on the Bootstrap pages and
  `my-visits` on the portal-shell pages). That is navigation structure, not styling.
- `visual-navigation-start.html` has its own Bootstrap navbar and does not load `user-layout.js` (which contains the
  auth guard), so it keeps its own links; only its look was aligned.
- `service-preview.html` is a small standalone page with no header.
- `assets/wusool-unified-design.css` and `user-portal-repair.css` still exist; they carry `!important` rules that
  the new layer works around. Merging them is a later clean-up.
