# Wusool implemented frontend API contract

## Scope and status

This document describes the actual methods in `assets/app-services.js`. It is a frontend handoff, not a backend implementation or a statement that every page has passed browser testing. `PAGE-INTEGRATION-CHECKLIST.md` gives individual verification status.

A. Implemented frontend: asynchronous service boundary, page migration, shared local records, account guards, central API error handling, explicit unavailable external operations, 37 service/controller/runtime tests and 369 controller initialization checks in a DOM double.

B. Local demonstrations: browser database, PBKDF2 demo login, local administrator and development subscription fixture, preview-only files, frontend configuration builders. These do not provide production security or external delivery.

C. Backend responsibilities: authoritative authentication/roles/ownership, organization memberships, sessions and revocation, transitions, database constraints, file persistence, booking transactions, schedules, moderation and audit.

D. External configuration: hosted payment checkout/webhooks, mail delivery, AI providers, navigation provider, file storage. No secrets belong in frontend configuration.

## Transport and envelope

All calls use `credentials: include`. JSON mutation bodies use Content-Type application/json. Multipart uploads omit that header so the browser sets the boundary. IDs are opaque strings. Dates are YYYY-MM-DD, times HH:mm, timestamps ISO 8601. Return HTTP 204 for empty mutation responses where appropriate.

List operations return `{items: [], total: 0, page: 1, pageSize: 500}`. `list()` preserves this metadata. `listAll()` exhausts server pages while retaining total/page/pageSize. Compatibility helpers `getBranches()`, `getReviews()` etc. use it and return all items for existing non-paginated screens; pagination-aware screens may use `list()`. Public discovery also exhausts the /places pages. Options called in the frontend include `includeDeleted`, `status`, `search`, `organizationId`, `branchId`, `userId`, `requesterId`, `flagged`, `page`, `pageSize`. Authorization must apply before filtering. The local page-size limit is 500 per request; compatibility list views load subsequent pages. Backend totals must describe the same authorized filtered dataset and remain consistent during a list operation. Very large data sets will need page controls rather than loading all records.

Error response: `{error: {code: "ACCOUNT_BLOCKED", message: "Account is blocked."}}`. Central handling clears frontend auth state for ACCOUNT_BLOCKED, UNAUTHENTICATED and SESSION_EXPIRED. HTTP 401 defaults to UNAUTHENTICATED; HTTP 403 defaults to FORBIDDEN. Other implemented local codes: NETWORK_ERROR, API_ERROR, STORAGE_CORRUPT, INVALID_ENTITY, FORBIDDEN, NOT_FOUND, INVALID_REFERENCE, INVALID_SCORE, INVALID_RATING, VALIDATION_ERROR, EMAIL_EXISTS, INVALID_CREDENTIALS, ORGANIZATION_PENDING, REVIEW_INELIGIBLE, DUPLICATE_REVIEW, IDEMPOTENCY_REQUIRED, INVALID_DATE, OUTSIDE_HOURS, INVALID_SERVICE, INVALID_TRANSITION, INVALID_FILE, INTEGRATION_UNAVAILABLE, DEVELOPMENT_ONLY, INVALID_STATUS, INVALID_RESPONSE, SUBSCRIPTION_REQUIRED, BRANCH_LIMIT.

## Called paths and methods

| Operation | Method and path | Body / response |
|---|---|---|
| Register | POST /auth/register | Registration fields plus role; safe account |
| Login | POST /auth/login | email, password, role; safe account |
| Current account | GET /auth/me | Safe account or 401 |
| Logout | POST /auth/logout | 204 |
| List entity | GET /{entity}?filters | Paged envelope |
| Entity details | GET /{entity}/{id} | Entity DTO or 404 |
| Create entity | POST /{entity} | DTO |
| Update entity | PUT /{entity}/{id} | DTO |
| Public discovery | GET /places | Paged PublicPlaceDTO |
| Booking creation | POST /bookings | BookingRequest; Idempotency-Key header |
| Booking progress | PATCH /bookings/{id}/status | status |
| Save / remove place | PUT or DELETE /users/me/saved-places/{branchId} | Safe account |
| Upload | POST /documents/upload | multipart file and JSON-string metadata |
| Audit | GET /audit | Authorized audit array |
| Compatibility state read | GET /frontend-state/{encodedKey} | Decoded JSON value |
| Compatibility state save | PUT /frontend-state/{encodedKey} | `{value: "serialized JSON or scalar"}` |
| Compatibility state remove | DELETE /frontend-state/{encodedKey} | 204 |
| Recovery | POST /auth/recovery | email |
| Password reset | POST /auth/reset-password | Fields from reset form |
| Password change | POST /auth/change-password | currentPassword, newPassword |
| Hosted checkout | POST /payments/checkout | Non-card checkout form fields |
| Payment lookup view | POST /payments/status | Non-card page form fields |
| AI branch review | POST /ai/branch-analysis | `{branchId}`; status, score?, text?, message? |
| AI reports | POST /ai/reports | Current form fields |
| Surroundings | POST /ai/surroundings | Current form fields |
| Accessibility AI | POST /ai/accessibility-report | Current form fields |
| Assistant | POST /ai/assistant | Current form fields |
| Navigation | POST /navigation/guidance or /navigation/status | Current form fields |
| Audited impersonation | POST /admin/impersonation | accountId |
| AI copilot | POST /ai/copilot | `{question}`; `{text}` |
| Billing portal | POST /payments/customer-portal | subscriptionId; `{url}` HTTPS |
| Auto renew | POST /subscriptions/auto-renew | subscriptionId, enabled; `{autoRenew}` equal to enabled |
| Sessions | GET /admin/sessions | Paged server session metadata |
| Revoke sessions | POST /admin/sessions/revoke | `{ids}`; `{revokedCount}` |
| Health | GET /admin/system-health | `{components:[{name,status,message}]}` |
| Runtime errors | GET /admin/errors | Authorized error array |
| Client telemetry | POST /telemetry/errors | id, type, message, source (without query), line, createdAt |

`{entity}` CRUD values currently exposed are organizations, branches, users, tickets, reviews, subscriptions and documents. Generic list/get/save additionally operate on bookings, notifications, applications and memberships as used by compatibility views. Status, soft deletion and restore are represented by PUT of the DTO, not dedicated delete/status endpoints except booking progress. Production implementations may replace this compatibility pattern, but must update the frontend service methods at the same time.

`/frontend-state` supports saved frontend platform settings, templates, themes, navigation, feature flags, rule/workflow/automation configuration, versions/drafts, administrative metadata and private temporary draft state. Treat keys as an allowlist, not arbitrary database access. The actual key mapping is the `entityKeys`, `userKeys`, `accountKeys` and `preferenceKeys` declarations in app-services.js; business aliases are converted to entity operations rather than persisted as parallel records. Non-sensitive language/font/contrast/remembered-email preferences can remain local in API mode.

## Core entities and field relationships

The local adapter preserves additional legacy form fields. These are extensible input properties, **not** a validated production DTO schema. The following is the canonical core; the backend must explicitly whitelist supported extensions rather than binding arbitrary input.

| DTO | Core fields |
|---|---|
| Safe account | id, name, email, phone, city, role, status, isDeleted, createdAt, updatedAt; profile, preferences, settings, savedPlaces where owned |
| Organization | account fields plus organizationName, organizationType/type, approvalStatus, address, website, representativeName, registrationNumber, managerName, managerPosition, managerEmail, managerPhone, logo |
| Application | id, organizationId, status, representativeName, registrationNumber, documentStatus, createdAt, reviewedBy, reviewedAt |
| Membership | id, organizationId, accountId, role |
| Branch | id, organizationId, name, branchName, city, address, phone, email, type, code, latitude, longitude, description, status, accessibilityScore, evidenceStatus, accessibility/accessibilityFeatures, services, workingHours, specialHours, photos, completedSteps, createdAt, updatedAt, isDeleted |
| Booking | id, reference, userId, organizationId, branchId, date, time, destination, purpose, support, guidanceMethod, notes, status, idempotencyKey, createdAt, updatedAt |
| Ticket | id, requesterId, organizationId, branchId, subject, description, category, priority, status, messages, createdAt, updatedAt, isDeleted |
| Review | id, userId, branchId, visitId, rating, title, comment, status, flagged, adminNote, informationAccuracy, accessibilityFeatures, recommended, photo, createdAt, updatedAt, isDeleted |
| Document / photo metadata | id, ownerId, organizationId, name, type, size, status, uploaded, createdAt, updatedAt, isDeleted; server upload result additionally url/storage reference |
| Subscription | id, organizationId, plan, planName, status, branchLimit, price, developmentOnly, billing dates as supplied by backend |
| Notification | id, ownerId, title, message, status, read, createdAt, updatedAt, isDeleted |
| Audit | id, actorId, actor, action, entityType, entityId, reason, timestamp |

Organization -> branches/applications/memberships/subscriptions is one-to-many. User -> bookings/reviews/tickets is one-to-many. Branch -> bookings/reviews is one-to-many. Review.visitId references a completed booking by the same user and branch. Booking is distinct from support Ticket. `visitor-tickets.html` consumes bookings; `user-ticket-details.html` consumes support requests.

Services are an array of service strings or `{name}` objects. The legacy add-branch field supplies a comma-separated string; the boundary splits it into an array. Working hours use weekday keys and `{isOpen, openTime, closeTime}`. Special-hour overrides and time-zone conversion need backend enforcement; the local adapter's basic check uses the browser clock.

PublicPlaceDTO derives id/placeId from branch.id; organizationName, name (`organization — branch`), branchName/branch, city, address, category/type, score/accessibilityScore, scoreDescription, mapQuery, image, latitude/longitude, branches:[branchName], destinations, features/accessibilityFeatures, rating, reviewCount. Unverified accessibility claims are labeled unverified; empty feature arrays do not prove absence of a feature. The public map is a schematic, not actual geographic route navigation.

Booking view aliases: placeId=branchId, placeName=organization name, branch/branchName=branch name, visitorName/Email/Phone from the authorized requester, visitDate=date, visitTime=time, visitPurpose=purpose, guidance=guidanceMethod. User screens receive Confirmed/In Progress/Completed/Cancelled; organization screens receive canonical lowercase statuses. The review public view derives reviewer name/date and branch name; it must not expose private contact information.

No DTO, public list, application, UI or audit response may include password, confirmPassword, passwordHash, salt, verifier, credentials, PAN or CVV. Credential fields stay entirely server-owned in API mode.

## Roles, transitions and publication

Roles: User, Organization, Admin; public visitors have no session. Local organization registration creates an owner membership. Account status: active, blocked, suspended, disabled; isDeleted is separate. Blocking invalidates old local sessions using a revocation version; unblocking requires login. Backend must recheck every private operation and revoke across devices. Browser state cannot override server rejection.

Organization approval is pending -> approved or rejected by an administrator. Account status and subscription status are separate. In the legacy organization admin interface activating a pending organization represents approval; that adapter mapping is explicit. A local development subscription fixture never performs approval.

Branches: draft -> pending (legacy pending-review) -> approved/published or rejected/changes-requested. Administrators own approval; the local adapter prevents organizations from directly granting approval. Organization transitions are draft→pending, pending→draft, rejected/changes-requested→draft or pending, approved/published→draft or pending. Administrators may set any supported branch status; unsupported values fail INVALID_STATUS. Backend must implement equivalent authorization and evidence/version review. New organization branch creation requires an active subscription and remaining branchLimit; the explicit development-only fixture satisfies that requirement without payment. Editing an existing branch does not create a new entitlement. Public discovery requires an approved/published, nondeleted branch whose organization is active, approved and nondeleted.

Bookings: confirmed -> in-progress -> completed, with cancellation from confirmed or in-progress. A User can only cancel their own booking. The owning Organization can advance progress. Terminal statuses cannot reopen through the booking status method. Creation validates published branch, future browser date/time, configured hours and configured service, and requires a stable retry key. Local storage does not guarantee atomicity across tabs. Backend must implement transactions, capacity, timezone correctness, special hours, idempotent retries and concurrent booking constraints.

Review policy: completed owned visit required, integer rating 1–5, one review per user per booking; edit existing review by ID. User submission/edit returns to Pending. Administrator moderation to Visible makes it count publicly. Hidden/Rejected/Pending and deleted reviews do not count. Rating is the arithmetic mean of Visible reviews. Highest-rated places require at least one Visible review; sort by rating descending, then eligible review count descending, then name using browser localeCompare, then ID. Unrated home suggestions are labeled without a fabricated rating. A production locale/collation and minimum larger sample is a business decision.

Accessibility model: score from 0 to 100. The branch accessibility form computes round(100 × available enabled-requirement weights / all enabled-requirement weights), or 0 when no requirement is enabled. An unassessed requirement contributes no earned weight. Scores are organization claims. Branch publication alone does not verify evidence; only an explicit administrator evidenceStatus=approved operation can mark evidence approved. Organization edits reset evidenceStatus to unverified. AI output cannot grant verification. The backend must define evidence review/versioning separately from computed AI suggestions. Local preview files are not persisted server documents.

## Examples

```json
{"email":"user@example.com","password":"user supplied secret","role":"User","name":"Example User"}
```

```http
POST /api/bookings
Idempotency-Key: client-generated-stable-key
Content-Type: application/json
```

```json
{"branchId":"branch-opaque-id","date":"2099-01-01","time":"12:00","destination":"Reception","purpose":"Appointment","support":["Staff assistance"],"guidanceMethod":"both","notes":""}
```

```json
{"items":[{"id":"booking-opaque-id","reference":"WUS-AB123456","userId":"user-id","branchId":"branch-id","organizationId":"org-id","date":"2099-01-01","time":"12:00","status":"confirmed"}],"total":1,"page":1,"pageSize":50}
```

## External response and upload contracts

`prepareExternalScreen(kind)` collects enabled input/select/textarea fields by their HTML name (or ID when no name exists), plus branchId, checkoutId and reset token from allowed page query parameters. Card controls are disabled and excluded. Selected photos first use multipart upload in API mode and contribute documentId. See `docs/form-fields.json` for each current screen's exact field names; validate these through server-specific request DTOs. No provider secrets are included.

AI/navigation response: `{status:"completed|uncertain|unavailable|failed",text?,message?,score?,confidence?,summary?:string[],facilities?:string[],issues?:string[],suggestions?:string[],steps?:string[]}`; score must be a number 0–100 and confidence 0–1. `/ai/copilot` specifically requires nonempty text. `/payments/checkout` requires an HTTPS `url`; `/payments/status` returns status confirmed/pending/failed/unavailable plus transactionId, paidAt, amount and paymentMethodLabel only when confirmed. Neither page updates subscription records. Webhooks and authoritative billing reconciliation belong on the server.

Recovery/reset returns `{status:"queued|sent|accepted|completed",message?}`; queued is not proof of email delivery. Password change must confirm completion. Never return passwords or verifiers. Notifications may be unread/read, queued/sent/failed where delivery applies; read state is independent of transport delivery. Local notifications are in-app records, never sent emails.

Upload selection: JPG/PNG/WEBP, PDF, DOC or DOCX; maximum 8 MB. Local result is `{id:null,name,size,type,status:"preview-only",uploaded:false}`. Multipart POST /documents/upload contains file and metadata JSON string. Confirmed API result must contain `{id,name,size,type,status:"uploaded",uploaded:true,url?}`; missing ID or unconfirmed status rejects INVALID_RESPONSE. The backend must validate content/signatures, authorize references, persist files, protect download URLs and implement removal/orphan cleanup. Local preview removal changes local metadata only.

## DTO extensions and compatibility views

The safe account DTO has an explicit allowlist: id, role, name, fullName, organizationName, email, phone, phoneNumber, type, organizationType, organizationCategory, city, address, website, status, approvalStatus, isDeleted, createdAt, updatedAt, accessibilityPreferences, savedPlaces, profile, preferences, settings, representativeName, jobTitle, managerName, managerPosition, managerEmail, managerPhone, registrationNumber, logo, documentName, documentId, documentStatus. Unknown top-level account properties are not returned by authentication/current-account or local account lists. Public organization DTOs use only id/name/organizationName/type/organizationType/city/status/approvalStatus/website/phone.

Ticket additionally has kind=support|accessibility-report|place-suggestion. Message fields are id, authorId, author, message/text, createdAt as supported by the current form; local writes stamp actual author and timestamp. Administration support views require number=id, type=category, user:{name,email,phone}, branch:{id,name,location}, images and responses=messages. API ticket responses must supply those view aliases to authorized private callers. Public reviews require name/date/placeName/branch aliases without private contact fields. Audit additionally contains status and score snapshots where applicable. Branch review includes reviewedBy/reviewedAt/statusUpdatedAt/approvedAt/adminFeedback.

Client-generated IDs are opaque strings (including prefixed UUIDs). Existing forms create records with client IDs through PUT /entity/id; implement authorized idempotent creation for an unknown client ID, and update for existing IDs. Alternatively change the frontend boundary and this contract together to server-generated POST IDs. SQL Server/Entity Framework/C# entity types and migrations are deliberately left to the backend implementer.

Frontend configuration keys are listed in `docs/frontend-state-keys.json`. Non-entity keys represent scoped settings and private drafts, not a parallel authoritative entity store. `GET /frontend-state/key` returns decoded JSON or null, not a double-encoded string. PUT accepts a serialized value string; server must deserialize, validate, scope and audit. Account roles/configured permissions shown in local tools do not create production RBAC enforcement. Local automation test triggers run only when explicitly clicked and report a performed count; saving a schedule does not run a background job.

## Backend responsibilities and remaining decisions

Implement cookie sessions with CSRF protection, authorization on every operation, cross-device revocation, membership enforcement, unique IDs/email/review constraints, audit with server actor/time, strict request/response DTOs and transactional booking capacity/idempotency. Idempotency keys must be scoped to account, bind a request payload and replay the same response; conflicting reuse must reject. The local implementation deduplicates one browser-context retry but is not atomic across tabs. Enforce timezone, special hours, cancellation deadlines and capacity policies server-side.

Decisions still needed: production subscription entitlements/expiry/grace periods; evidence versioning and moderator requirements; review eligibility for cancelled/no-show visits (current policy completed only); stronger minimum review count and locale tie ordering; provider/configuration choices; import transaction policy (current import validates and reports partial failures); private file retention. Advanced administration builders persist configurations; server scheduling, actual health, real sessions, impersonation and delivery remain server responsibilities. These are explicit unavailable/development states in the frontend, not fabricated successful operations.

Verification: 37 tests passed and 369 DOM-double controller initialization checks passed. Structural script/link/syntax/order checks passed. No real browser or live backend was tested. Browser rendering, full keyboard/screen-reader/RTL/layout interactions and real integration contracts must be verified when those dependencies are available. See the per-page checklist for precise evidence; initialization is not proof that every visible interaction passed.
