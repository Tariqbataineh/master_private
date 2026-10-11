> Original Orange implementation report (v25). For this v26 update, use UPDATE_V26.md, CHANGED_FILES_V26.md and current JSON validation reports.

# Changed files

Existing files (only these three differ from the supplied ZIP):
- `visitor/html/home.html` — adds the Orange-only stylesheet and replaces the Orange preview with an actual scene render.
- `visitor/js/journey-home.js` — mounts readable exploration controls if WebGL initialization fails.
- `visitor/js/journey-world.js` — replaces Orange geometry, removes Orange's flat facade/AI roadside board, integrates its scoped exploration camera, and pauses hidden-page rendering. Pre-Orange street and roadside-community geometry/assets are retained verbatim.

New runtime files:
- `assets/images/orange-exploration-preview.jpg` — actual rendered preview; not used as room geometry.
- `visitor/js/orange-building.js` — facade, courtyard, independently entered rooms, furnishings, procedural materials, lights, doors and generic characters.
- `visitor/js/orange-navigation.mjs` — fixed layout, clear camera paths, state transitions, progress clamps and saved parent corridor.
- `visitor/js/orange-exploration.js` — accessible English/Arabic controls, scroll/touch/keyboard movement, entry/exit transitions, reduced-motion and WebGL fallbacks, session progress.
- `visitor/css/orange-exploration.css` — scoped desktop/mobile, RTL, focus and contrast styling.

Documentation/evidence: `START_ORANGE.md`, `docs/orange/` (reference analysis, schematic SVG/PNG, screenshots/gallery, validation and preservation reports).
Tests: `tests/orange/navigation.test.mjs`, `browser-validation.cjs`, `capture-scenes.cjs`.

No organization, user, admin, SQL, shared business API/storage/authentication or other destination files were edited. No application framework or runtime dependency was added.
