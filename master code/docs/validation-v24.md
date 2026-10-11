# Actual validation — v24

## Baseline and scope

Continued the previously approved v23 tree and the partial v24 work in this workspace. The newly supplied `01-master-code.zip` is an older tree with git metadata, an inactive master_private copy and no visit-tracking implementation. Replacing the approved tree with it would remove the accepted 3D interior and tracking; it was inspected as source context, not substituted for v23. The supplied Markdown requirements and both ticket screenshots were inspected before completing the changes.

Only service selection/configuration and discovery markers extend behavior. The table/tracking/modal changes reuse existing actions and services. Authentication, roles/blocking, base ownership, booking timing and assistance capacity, confirmations, reviews and status transitions were not rewritten. No backend/framework migration was added.

## Completed checks

| Check | Actual outcome |
| --- | --- |
| Existing regression tests plus service extension tests and home hashes | **189 passed, 0 failed**, Node test runner, concurrency 1 |
| Targeted Chromium browser checks | **54 passed**, 0 page errors, 0 missing local assets observed |
| HTML references and IDs | **122 pages** checked; 0 missing static local references or duplicate IDs |
| Homepage preservation | **102 files** byte-identical to v23: Home HTML, all visitor scripts/styles, existing shared CSS, image/vendor assets |
| Changed/added runtime JS syntax | 11 files checked with `node --check`; no syntax errors |
| Proposed OpenAPI | Parsed and validated with @apidevtools/swagger-parser; no errors |
| Real Google Maps attempt | SDK and iframe requests failed with **net::ERR_EMPTY_RESPONSE**; no geographic map DOM rendered, no application page error |

The regression set includes existing account lifecycle/blocking, roles, publication, hours, assisted booking capacity, booking transitions, QR reception, reviews and HTTP/no-fallback checks. Added tests cover stable configured service IDs, owner-only management, active/available filtering, invalid/foreign IDs, service persistence/DTO display, historical snapshot preservation, empty configuration and explicit API failures. The service tests use in-memory fixtures.

The browser run uses actual page scripts and local service storage in isolated Chromium pages. It checks:

- One visible tracking action per user row and the correct ticket opened.
- Original actions/disabled states cloned into tracking; stage drag/drop leaves stored booking unchanged.
- Reschedule and cancellation invoke the original editor/reason confirmation; review remains available for a completed historical ticket; organization approval uses the original confirmation/transition.
- 940px desktop creation dialogs; 1440/768/390px widths in EN/AR; Dark surfaces, high contrast and 24px root text with no dialog horizontal overflow.
- Branch changes clearing selections; persisted selected service, 60-minute duration and assistance requirement; display in tracking; organization-owned configuration management.
- Branch-before-service, loading/error/Retry, empty service messages and mismatched owner DTO rejection.
- Published review aggregation, no-review wording, marker deduplication and missing-coordinate handling, existing discovery filters and safe record text rendering.
- Login, registration and each role's dashboard at desktop/mobile without document horizontal overflow.

Map class/library calls, marker clicks, map options and card rendering in targeted checks use **API test doubles**, not Google geographic tiles. The separate real-provider attempt has no interception and is recorded in `live-map-results-v24.json`. The deliberate offline-failure screenshot in the main suite is separate from that real attempt. No working basemap, external routing, billing or key authorization is claimed.

## Evidence and reproducibility

- `browser-results-v24.json`, `structure-results-v24.json`, `syntax-results-v24.json`, `home-preservation-v24.json`, `live-map-results-v24.json`, `regression-results-v24.json`.
- `screenshots-v24/`: paired before/after table, modal, map integration and five representative pages; mobile Arabic Dark modal/service views and provider-failure captures. Names and ratings in these comparisons are explicit **test fixtures**, not production records.
- Screenshots were visually inspected; the mobile language check led to correcting newly added section headings in place.
- `npm install`, `npm test`. For browser verification: `npx playwright install chromium`, `npm run test:browser`. Optional `WUSOOL_BASELINE` points to a v23 folder for paired screenshots; optional `WUSOOL_CHROMIUM` points to an installed executable. The browser harness deliberately substitutes provider APIs and blocks external networking; run your real configured maps separately.

## Remaining limitations

- Chromium headless and simulated viewport sizes were used, not real phones or every browser. 122 pages received static checks and the new stylesheet, but every page/workflow was not individually visually tested.
- Google raster POI visibility, attribution, native marker rendering and real directions must be verified with a network-accessible, authorized/billed key on the deployment domain. Legacy Marker is deprecated; the chosen raster implementation avoids silently ineffective map-ID inline styles. Configuration and migration notes are in the contract addendum.
- Proposed ticket-service API endpoints remain disabled until implemented by the backend owner. Local browser storage does not provide server authorization, cross-device synchronization or production concurrency guarantees.
- Existing provider-dependent payment/email/AI features were not implemented or revalidated.
- No runtime file was deleted because none was demonstrated dead within this change. Existing action sources are retained for delegation, not discarded.

These results are bounded evidence, not a guarantee of a bug-free system. The approved 3D homepage and its scene assets/styles/scripts are unchanged; the narrow shared service/data additions and configuration flag are listed explicitly in the changed-file report.
