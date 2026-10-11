# Wusool Home refinement — v22

Based on the approved Wusool_Orange_Scroll_Interior_v21 project.

## Changes
- visitor/css/home-refinement.css: centered introduction; larger stop links; removed visible floating wordmark/search/status notices and featured-place cards; removed large section backing plates; translucent individual cards with solid hover/focus backgrounds; Light/Dark responsive styling.
- visitor/html/home.html: added the presentation stylesheet and made the removed featured cards inert and hidden from assistive technologies.
- assets/preferences.css: hides the High Contrast shortcut. Existing shared Light / Dark / System preference selectors remain in the public navbar and role sidebars; no duplicated selectors.

Every JavaScript file, service, route destination, image asset, building model and camera implementation is byte-identical to v21. No original files were deleted. The invisible featured chapter retains its original footprint to preserve the existing road timing and camera progression. It is no longer interactive or announced. The conceptual showcase disclaimer inside organization panels remains; the small floating disclaimer was hidden as requested.

## Validation
16 targeted browser checks passed. No observed page errors or missing local assets in these checks.
- Browser checks cover unchanged desktop/mobile chapter heights, building order and sides, forward and reverse scroll, Orange interior, removed controls, working theme options, reduced motion, and English/Arabic at 1440/768/390 widths.
- Checked role sidebar preference controls in user, organization and admin pages.
- 122 full HTML pages: no missing local references or duplicate IDs. Shared injected sidebar fragments resolve links relative to their hosting pages.
- Diff check: no JavaScript or asset changes; no deleted original files.

## Limits
Desktop Chromium software rendering and responsive emulation were used, not physical mobile devices. External payment/email/AI/Google Maps integrations were not retested in this presentation-only task. Existing saved high-contrast preferences and underlying handlers have not been changed; only their shortcut is hidden, in accordance with the instruction to preserve logic.
