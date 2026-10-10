# Working hours, booking confirmation and visit reviews

The source is the approved Wusool_Approved_Fixes.zip version. Home and all unrelated pages retain their design.

## Organization hours
Initial branch draft hours can be updated while setup is incomplete. Established approved schedules remain active while a proposal is pending. Organizations see proposed hours, can amend the same pending request, and must submit expectedRequestRevision with amendPending. Stale organization writes and stale administrator approval decisions fail rather than overwrite newer data. Decisions update the organization status automatically without overwriting form edits. Native open/closed switches have explicit visual states and keyboard focus.

## Confirm Visit
Confirmation stores a persistent retry key before sending a booking. Invalid slots, unavailable branches or capacity errors leave the draft intact and show the service's reason beside the button. Successful confirmation creates one pending booking and redirects to My Tickets. Jordan branch schedules continue to apply; out-of-hours visits are not silently accepted.

## Visit reviews
The Organization sidebar includes Visit Reviews: statistics, search, branch/status/rating filters, escaped feedback, Jordan timestamps and automatic updates. Organizations have read-only access to their own branches' visitor reviews. Ratings require an integer 1–5, a completed owned visit and one review per visit. Visitor comments require 3–500 characters; title max 120. Pending reviews can be edited. Once Admin approves a review, the visitor cannot edit/delete it, including direct URLs and service calls; hiding an approved review does not remove its moderation lock. Admin remains responsible for moderation. Moderation notifications and source changes synchronize through the existing shared live service.

## Backend handoff
No Node backend was added. The existing local service demonstrates behavior; API mode remains the .NET integration boundary. Enforce role scoping, immutable approved reviews and revision guards in the .NET backend as described in docs/openapi.json and docs/api-endpoints.json. Local automatic synchronization covers tabs in the same browser. Cross-device realtime synchronization requires the backend event channel/polling implementation.

## Verification
See visit-review-browser-results.json and verification-v14 screenshots for actual Chromium workflow, desktop, mobile and dark mode evidence. Unit/service results are captured separately in release-validation-v14.json.
