# Server rules still required

The database supports persistence; these rules need authenticated backend commands and transactions. No frontend flag or SQL FK replaces authorization.

## Accounts / Identity
- Keep opaque string IDs; store existing valid IDs unchanged, never derive ownership from prefixes. This design permits up to 128 characters; reject oversized imports explicitly, never truncate.
- Identity handles password hashing, lockout, token generation and verification. The frontend's demo salt/verifier is NOT an Identity password hash. Do not import it into PasswordHash; require secure password setup/reset.
- RoleCode supports the frontend's User/Organization/Admin enum; synchronize it with Identity role membership in the same server command. RoleCode alone must not replace validated Identity authorization.
- Organization Id == its owner AccountId preserves the current account/organization convention. Staff/membership expansion is supported by the table, but do not silently enable new staff permissions: the current frontend owns organization resources by account ID.
- Check blocking and deletion before login and on every protected request. Cookie security-stamp validation intervals alone do not guarantee immediate blocking. Issue/revoke DeviceSessions in the server authentication lifecycle.
- AccountAccess.CanSignInAsync does NOT verify passwords and does NOT authenticate a caller.
- Recover/initial-password/OTP challenges need random tokens, hashed storage or Identity protected tokens, expiry, attempt limits, one-time consumption, and real email outbox/provider integration. Store no raw password, OTP or QR token in public DTOs.
- Admin creation is server-side with UserManager/CreateAsync/AddToRoleAsync and a secure bootstrap process; no seeded default administrator/password is supplied.

## Branches / evidence / approval
- Use OrganizationAccount eligibility, existing workflow stages, approved schedules, evidence and publication checks. Setting a status alone must not publish an incomplete branch.
- CompletedSteps DTO is generated from DetailsCompleted/HoursCompleted/AccessibilityCompleted/PhotosCompleted/AiReviewCompleted. Verify evidence when changing these flags.
- All 7 hours rows must exist for a completed schedule. Sunday = 0 through Saturday = 6. Closed rows use NULL times; DTO uses empty strings.
- All enabled accessibility requirements need an answer, matching the current frontend, even when the requirement's Required flag is false.
- Four required photo category keys are main-entrance, entrance-route, internal-pathway, destination-area. File storage URLs/ownership must be verified before approval; API must reject local base64 imageData.
- CurrentAnalysis references a retained BranchAnalyses record belonging to that same branch. Never overwrite historical analyses when generating another report.
- Legacy branch.services/destinations and ticketServices remain separate. TicketServicesConfigured=false means the compatibility adapter may expose validated legacy services; true with zero active records means explicit empty configuration. Do not accidentally re-enable legacy choices.
- BranchServices.OrganizationId DTO is derived from the branch, not a second independent owner. Normalize service names with the server's consistent case-normalization policy; enforce current 2–120 chars, description <=500, maximum 50 services. SQL unique index prevents duplicates; the maximum count still needs an atomic service command.

## Booking vs support ticket
- /bookings and visitor tickets are Booking rows; /tickets are support/accessibility-report/place-suggestion requests. Do not merge them into one status model.
- Derive user and organization ownership from authenticated account and stored branch. Validate current branch publication, organization eligibility, and service status.
- Preserve serviceName/serviceSnapshotJson and locationSnapshotJson at booking time. A service rename must not rewrite historical bookings.
- An unchanged historical service selection may remain when editing a booking in the same branch, even if retired; a new selection must be active and available.
- Duration is 15–120 minutes, default 30. Local visit date/time are Asia/Amman DateOnly/TimeOnly; instants use UTC DateTimeOffset. Convert with an OS-supported Jordan timezone; never hardcode a UTC offset.
- Overlapping active bookings for one user are not prevented by a simple unique index. In a SERIALIZABLE transaction, lock the relevant user/date range, check interval overlap, and insert atomically. Handle visits extending past midnight by rejecting them outside the supported hours; inspect neighboring-date intervals when importing historical values.
- Assistance capacity is 5 per branch/calendar hour in the existing implementation, counting pending/confirmed/in-progress visits needing assistance. A configuration JSON cannot silently change that rule. Lock the branch/date/hour range and check capacity in the same transaction as booking.
- Waitlisted bookings are counted for user overlap; they do not occupy assistance capacity until promoted.
- Use IdempotencyRecords scoped by authenticated account + operation + key; compare RequestHash to reject reuse with different inputs. Insert booking + notifications + audit + outbox/idempotency result in one transaction.
- RowVersion and Revision support concurrency. Compare the client's expectedRevision with the stored value before changing a tracked entity. ChangeTracking increments Revision; do not increment it twice. Map DbUpdateConcurrencyException to the existing conflict code/409.
- With SQL retry enabled, wrap explicit transactions inside db.Database.CreateExecutionStrategy().ExecuteAsync(...), preserving idempotency.

## Visit journey / proposals / queue / QR
- Copy exact allowed transitions and ownership from assets/services/journey.js and visits.js; do not invent a generic status switch. Preserve departure/arrival eligibility windows, lateness vs no-show distinction, assistance limits, cancellation policy and user-controlled arrival.
- Store status and journeyState separately with history snapshots; do not let them drift under concurrent updates.
- Proposals are historical rows; only one live pending proposal per booking. Acceptance atomically revalidates its expiry, branch, service, hours, ownership, booking revision, overlap and assistance capacity. Rejection/expiry retains history and does not replace the current appointment.
- Generate QR passes server-side, store TokenHash, validate expiry, account, booking day and arrived state. Consume/verify atomically to prevent replay. Rotate/revoke passes after relevant appointment changes. Passes are not eagerly included in public booking responses.
- The frontend's queue.position/estimatedMinutes are derived from arrived, confirmed, non-blocked visits ordered by arrivedAt + id, and service-duration history. QueueNumber is optional storage support, not a new authoritative queue algorithm. Do not persist a position that becomes stale as the queue changes.
- Call-next locks/selects the correct branch's next eligible booking and records the event. Background automation is a server job, not a browser tab timer.

## Reviews
- FK (BookingId,UserId,BranchId) ensures the review belongs to the correct visit/user/branch. Unique filtered BookingId index prevents multiple non-deleted reviews per visit, matching the frontend's soft-delete behavior.
- A completed booking is still required by the write command; SQL FK/check constraints cannot validate another row's status. Use a transaction to validate eligibility and insert.
- Publish only Visible, non-deleted reviews; average/count are derived, never trusted from client-supplied ratings or cached UI values. Retain moderation events/permissions and locked moderation fields.

## Schedule approvals
- Pending change does not modify approved hours. Store BeforeJson and ProposedJson validated against the original ApprovedSchedule schema.
- BranchId NULL means organization schedule; otherwise composite FK guarantees branch ownership. resourceKind/resourceId are generated DTO fields.
- On decision, atomically compare request Revision AND resource HoursRevision. Detect affected visits, preserve their IDs via HoursAffectedBookings, commit the approved schedule/revision, notifications and audit together. Repeated/stale decisions must fail.
- SpecialDates represents closedDates/holidays and custom dates with distinct DTO serialization; ClosuresJson retains bounded legacy closures. Resolve conflicting inputs explicitly rather than silently merging incompatible dates.

## Files / subscription / payments / integrations
- Documents stores metadata and file references, not file bytes/base64. Use durable server storage with owner authorization; check file type/size and return stable URLs.
- Plans copied from local fixtures are optional seed values, not confirmed production prices. Subscription price/branchLimit/planName are historical snapshots computed by the server.
- PaymentOperations stores external provider references and minimal verified results; no card numbers/CVV or raw credentials. Validate webhook authenticity/idempotency before changing a subscription. Real checkout cannot be fabricated by writing paymentStatus='paid'.
- AI, maps, guidance, email and payment integrations need real providers. ExternalJobs tracks their bounded requests/results; it does not implement those integrations.

## Admin configuration / logs / lifecycle
- FrontendStates is for bounded allowlisted settings, builder schemas, feature templates and drafts already used by /frontend-state/{key}; it is NOT a replacement for normalized accounts/bookings/reviews/documents.
- Scope/account keys must be derived by the server. Do not expose arbitrary keys, other users' profiles or whole database collections. Keep provider secrets in server configuration.
- Roles builder JSON does not grant authorization. Server claims/policies must implement the intended permissions.
- AuditEvents is append-only from the application's perspective. Do not provide arbitrary client edit/delete APIs; database administrative retention is separate.
- Increment SyncRevisions for committed business changes; /sync/revision reads it. Exports/reports/heatmaps are authorized derived queries, not duplicate datasets.
- Identity and business relations use NO ACTION to avoid SQL Server multiple-cascade paths and loss of audit/history. Use soft deletion/restoration and deliberate retention workflows.
- AsSplitQuery may observe changes between its SQL queries. For a strict consistent read, select suitable snapshot isolation/transaction semantics after configuring SQL Server; do not assume a split query is one atomic snapshot.
