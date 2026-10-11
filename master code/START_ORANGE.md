> Current unified version: v27. See START_HERE.md for restored latest ticket/account/services behavior. This guide describes the retained Orange tour.

# Wusool — Orange exploration update

1. Extract the complete ZIP. Open a terminal in `master code`.
2. Run `python3 -m http.server 8000` (Windows: `py -m http.server 8000`).
3. Open http://localhost:8000/visitor/html/home.html . Use a local server, not `file://`, because Three.js uses ES modules.
4. Continue the original street journey to Orange. Select **Explore the building in 3D**. Scroll/swipe in the scene or use the Forward/Backward buttons and arrow keys.
5. At reception choose **Classroom & Offices** or **Kitchen & Restrooms**. Approach a labelled door; select **Explore** to enter. Backward scrolling reverses the tour. Pause at its beginning and use a new backward gesture to return, or use **Return to corridor**. The corridor pose is restored.
6. **Return to reception** retraces the corridor; backward travel continues toward the courtyard. **Skip exploration** or Escape returns to the normal page at any time. User and Organization login links stay visible in the tour.

Arabic/English controls are in the exploration toolbar; the existing site language switch also updates the interface. World placement is fixed. Progress survives resizing and is retained in a dedicated session key when a language switch reloads the page. OS/browser reduced motion provides static views and a direct location selector. WebGL failure provides the labelled plan and direct navigation rather than a blank canvas.

Version 26 restores the four previously approved organization stops and smooths Orange movement. Business code is restored byte-for-byte from the latest approved v24 system; see docs/restoration-v27.json. See docs/orange/UPDATE_V26.md and CHANGED_FILES_V26.md for the current update.

## Included evidence
- `docs/orange/floor-plan.svg` and `.png`: conceptual fixed layout.
- `docs/orange/screenshots/`: actual rendered exterior, reception, both corridors, six rooms, Arabic/mobile and fallback screenshots.
- `docs/orange/LAYOUT_AND_REFERENCES.md`: footage observations, intended paths and architectural estimates.
- `docs/orange/VALIDATION.md`, JSON reports and changed-file list.

## Re-run checks
`node tests/orange/navigation.test.mjs`

Optional browser checks require Node and Playwright: `npm install --no-save --package-lock=false playwright`, then `npx playwright install chromium`, then `node tests/orange/browser-validation.cjs`. For an existing Chromium installation, set `CHROMIUM_PATH`. The test serves the project temporarily on localhost:8126. Capture all scenes with `node tests/orange/capture-scenes.cjs` (localhost:8125). These dependencies are test-only; runtime still uses the existing local Three.js.

## Limits
This is a reference-informed conceptual reconstruction, not a measured digital twin. Generic people have economical stylized geometry and restrained asynchronous movement. Hidden dimensions and the requested kitchen/restroom fixtures are estimates. The building has not been verified for accessibility certification. Existing CDN dependencies and all original data/authentication configuration remain as supplied. There is no new backend.

Restored street checks: `node tests/orange/restored-street.cjs` (same Playwright setup; localhost:8130).
