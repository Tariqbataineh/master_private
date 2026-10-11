# Wusool v21 — Orange scroll interior

## Preserved baseline

Built on Wusool_Approved_Clean_v20.zip, not the older uploaded master code archive. All four showcase buildings, their sides, camera stops, extended road, existing sections, Orange destination cards, public navigation and footer remain. Authentication, blocking, role permissions, bookings, tickets, reviews, storage, API contracts and other pages are unchanged.

## New experience

Continue native scrolling after the existing Orange destination cards: exterior ramp and adjacent stairs → sliding glass doors → reception and visible elevator → training studio with six seated students and a trainer → reverse dolly to the exterior and existing footer. Scrolling upward reverses the same path and gestures. Optional native links provide direct accessible navigation; there are no wheel/touch interception handlers or scroll locks.

This is real local Three.js mesh geometry, not layered interior images. The people are stylized representations, not actual trainers/students, and the interior is an artistic concept rather than a surveyed replica. The elevator is a visible modeled facility, not an interactive elevator ride. Teaching gestures and student head movement follow scroll progress; no audio is included.

## Modified runtime files

- visitor/html/home.html: four additive interior scroll chapters and translated navigation/information.
- visitor/js/journey-home.js: native-scroll interior progress and exclusive, inert inactive panels. Existing service/booking matching code remains unchanged.
- visitor/js/journey-world.js: hollow ground-floor doorway, interior attachment and camera extension after the existing street route.
- visitor/js/academy-interior.js (new): local modeled ramp, rails, stairs, doors, reception, elevator, desks/laptops, students and trainer; static mesh batching, bilingual scene signs and reversible camera choreography.
- visitor/css/academy-interior.css (new): scoped responsive panels, theme/contrast styling and reduced-motion static layout.

START_HERE.md and this report document the new version. 500 of the 503 original runtime files remain byte-identical. Existing assets/vendor licenses and backend configuration documents are retained. No backend or framework migration was added. Node.js was used only for development verification, not for running the delivered website.

## Actual checks

- 179 service/workflow/unit tests passed; zero failures.
- 122 HTML pages scanned: zero missing local references, duplicate IDs or JavaScript syntax errors.
- 23 approved journey regression checks passed, including physical building order/facade directions, original extended road, Orange final arrival/actions, reverse/fast scrolling, refresh, resizing, internal organization data, protected guest booking return, role preference placement, high contrast, reduced motion and WebGL fallback.
- 8 existing translation browser checks passed, including form values/DOM identity, authentication state, ticket hooks and conditions, Arabic mobile layout and persisted portal preferences.
- 15 new interior browser checks passed: four stages, exactly one active panel, open/reversed doors, seven people, halfway refresh, reverse/fast scroll, in-place Arabic without camera movement, Dark mode, tablet/mobile widths, forward exterior return, high contrast and static reduced-motion content.
- No page errors or missing local assets were observed in the targeted browser runs. Screenshots were inspected internally for the entrance, lift/reception, classroom and mobile/Arabic layouts.

## Limits

Browser checks used headless Chromium with software WebGL at desktop, 768px and 390px widths. Real device performance, all browsers and external Google Maps/payment/email/production AI were not revalidated. Models are stylized, not photorealistic. Initial concurrent software-rendering test timing required a sequential rerun; the final browser checks passed. These results are not a guarantee that every possible issue is absent.
