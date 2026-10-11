# Wusool v23 — booking map and visit tracking

Based on the approved Home Clean v22. All Home files, street assets, buildings, camera code, service modules, account blocking, authorization, storage models and booking transition rules remain unchanged.

## Use

Open **Track visit & map** in the existing booking action group. The shared interface is available on User My Tickets, My Visits and Visit Details, Organization Visitor Tickets and Admin Tickets.

Google Maps displays the real branch coordinates. Pan, zoom and fullscreen are native map controls. **My location & route** requests device location only after a click; draws a suggested driving route when the configured Google project supports the route service. It does not broadcast coordinates to other accounts, move a fictitious visitor marker, or imply wheelchair suitability of a driving route.

Visit stages: booking request → confirmed appointment → on the way → arrived → being served → completed. Drag a stop onto another stop, swipe the stage rail on touch devices, click a stage or use Previous/Next/Current stage to inspect it. These controls select a preview, never commit a state transition. The current stage stays marked independently of the selected preview. History contains recorded events and Jordan timestamps; unrecorded stages have no invented timestamps.

Actions are copied from the currently rendered, authorized booking row with their original disabled conditions. Clicking an action closes tracking and dispatches the existing action, including its existing confirmation, validation and service call. QR reception, departure window and role restrictions remain in the existing implementation. Updates reuse the existing live refresh and a presentation observer; closing removes the observer, timer and map overlays.

## Changed files

- `assets/booking-tracking-map.js`: shared map, stage navigation, permitted action presentation, language updates and cleanup.
- `assets/booking-tracking-map.css`: responsive dialog, stage rail, readable Light/Dark/high contrast surfaces.
- `assets/booking-tickets.js`: presentation hook in existing history dialog, cleanup and tracking button label; no modified business rules.
- `assets/api-config.js`: fills the existing Google Maps key fields with the key supplied in the conversation. No new endpoints or contracts.
- Five existing HTML pages listed above: include the two new shared assets.
- This delivery note.

## Validation actually performed

35 browser checks passed across User, Organization and Admin, with no observed application page errors or failed local asset responses in those runs. Checks cover branch coordinates, native drag/drop, button preview without data mutation, legacy and modern route adapters, exact authorized actions/disabled states, 1440/768/390 widths in English and Arabic, Dark appearance, dialog cleanup, API-error fallback, real service approval via original confirmation, current stage after approval and automatic cancellation updates in an open dialog.

Google API success and geolocation coordinates in these integration checks used test doubles. A separate actual Google Maps load attempt from this environment did **not** render a map and displayed the unavailable fallback. This is not evidence that the supplied key is valid or invalid. Actual Google Cloud API enablement, key restrictions, quotas, billing eligibility, route response and permission-granted GPS remain unverified externally. No free-use guarantee is made. Open directions remains available through the existing service URL if embedded map loading fails.

Seven existing service regression tests passed for role permissions, pending edits, Jordan timing, arrival/reception boundaries, stale revisions, cancellation and branch publication. Those service source files were verified byte-identical to this delivery. New JavaScript syntax checks passed. Existing injected sidebar fragments contain relative links resolved in their host page; do not audit these as standalone pages.

## References

- Modern route computation and minimal requested fields: https://developers.google.com/maps/documentation/javascript/routes/get-a-route
- Route rendering reference: https://developers.google.com/maps/documentation/javascript/reference/route
- Existing-project legacy fallback: https://developers.google.com/maps/documentation/javascript/legacy/directions

## Boundaries

Cross-device live GPS sharing requires a backend and is deliberately not simulated. The real geographic map and the conceptual booking-stage rail are separate. Cancelled/waitlisted/no-show bookings retain their actual status and history; the rail does not manufacture a completed visit. The approved homepage was not restyled or rebuilt in this version.
