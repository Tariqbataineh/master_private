# Data inventory

| SQL table | C# entity | Purpose |
|---|---|---|
| AspNetUsers | ApplicationUser | Identity authentication |
| AspNetRoles | IdentityRole | Identity authentication |
| AspNetUserRoles | IdentityUserRole<string> | Identity authentication |
| AspNetUserClaims | IdentityUserClaim<string> | Identity authentication |
| AspNetRoleClaims | IdentityRoleClaim<string> | Identity authentication |
| AspNetUserLogins | IdentityUserLogin<string> | Identity authentication |
| AspNetUserTokens | IdentityUserToken<string> | Identity authentication |
| Organizations | Organization | See schema.json, relationships, and BACKEND_RULES.md |
| OrganizationMemberships | OrganizationMembership | See schema.json, relationships, and BACKEND_RULES.md |
| OrganizationApplications | OrganizationApplication | See schema.json, relationships, and BACKEND_RULES.md |
| Branches | Branch | See schema.json, relationships, and BACKEND_RULES.md |
| OrganizationHours | OrganizationHours | See schema.json, relationships, and BACKEND_RULES.md |
| OrganizationSpecialDates | OrganizationSpecialDate | See schema.json, relationships, and BACKEND_RULES.md |
| BranchHours | BranchHours | See schema.json, relationships, and BACKEND_RULES.md |
| BranchSpecialDates | BranchSpecialDate | See schema.json, relationships, and BACKEND_RULES.md |
| BranchServices | BranchService | See schema.json, relationships, and BACKEND_RULES.md |
| BranchLegacyServices | BranchLegacyService | See schema.json, relationships, and BACKEND_RULES.md |
| BranchDestinations | BranchDestination | See schema.json, relationships, and BACKEND_RULES.md |
| AccessibilityRequirements | AccessibilityRequirement | See schema.json, relationships, and BACKEND_RULES.md |
| BranchAccessibility | BranchAccessibility | See schema.json, relationships, and BACKEND_RULES.md |
| Documents | Document | See schema.json, relationships, and BACKEND_RULES.md |
| BranchPhotos | BranchPhoto | See schema.json, relationships, and BACKEND_RULES.md |
| BranchAnalyses | BranchAnalysis | See schema.json, relationships, and BACKEND_RULES.md |
| Bookings | Booking | See schema.json, relationships, and BACKEND_RULES.md |
| BookingHistory | BookingHistory | See schema.json, relationships, and BACKEND_RULES.md |
| AppointmentProposals | AppointmentProposal | See schema.json, relationships, and BACKEND_RULES.md |
| VisitPasses | VisitPass | See schema.json, relationships, and BACKEND_RULES.md |
| Reviews | Review | See schema.json, relationships, and BACKEND_RULES.md |
| SupportTickets | SupportTicket | See schema.json, relationships, and BACKEND_RULES.md |
| TicketMessages | TicketMessage | See schema.json, relationships, and BACKEND_RULES.md |
| TicketAttachments | TicketAttachment | See schema.json, relationships, and BACKEND_RULES.md |
| Plans | Plan | See schema.json, relationships, and BACKEND_RULES.md |
| Subscriptions | Subscription | See schema.json, relationships, and BACKEND_RULES.md |
| PaymentOperations | PaymentOperation | See schema.json, relationships, and BACKEND_RULES.md |
| HoursChangeRequests | HoursChangeRequest | See schema.json, relationships, and BACKEND_RULES.md |
| HoursAffectedBookings | HoursAffectedBooking | See schema.json, relationships, and BACKEND_RULES.md |
| Notifications | Notification | See schema.json, relationships, and BACKEND_RULES.md |
| NotificationReads | NotificationRead | See schema.json, relationships, and BACKEND_RULES.md |
| SavedPlaces | SavedPlace | See schema.json, relationships, and BACKEND_RULES.md |
| DeviceSessions | DeviceSession | See schema.json, relationships, and BACKEND_RULES.md |
| AccessChallenges | AccessChallenge | See schema.json, relationships, and BACKEND_RULES.md |
| ImpersonationSessions | ImpersonationSession | See schema.json, relationships, and BACKEND_RULES.md |
| AuditEvents | AuditEvent | See schema.json, relationships, and BACKEND_RULES.md |
| FrontendStates | FrontendState | See schema.json, relationships, and BACKEND_RULES.md |
| OutboxMessages | OutboxMessage | See schema.json, relationships, and BACKEND_RULES.md |
| IdempotencyRecords | IdempotencyRecord | See schema.json, relationships, and BACKEND_RULES.md |
| RuntimeErrors | RuntimeError | See schema.json, relationships, and BACKEND_RULES.md |
| ExternalJobs | ExternalJob | See schema.json, relationships, and BACKEND_RULES.md |
| SyncRevisions | SyncRevision | See schema.json, relationships, and BACKEND_RULES.md |
| TicketMessageAttachments | TicketMessageAttachment | See schema.json, relationships, and BACKEND_RULES.md |

## Scope boundaries

- accounts/organizations/applications/memberships/branches/bookings/support/reviews/documents/subscriptions/notifications/hours/audit have relational storage.
- Settings, drafts, page builders, rule/workflow definitions and template configuration retain bounded JSON under FrontendStates, matching the existing state endpoint. Storage does not execute automations or grant permissions.
- UI dashboard counters, comparisons, map pins, queue position, heatmaps and reports are computed from authoritative records.
- 3D models, decorative buildings, traffic, seasons and audio remain frontend assets/settings; they are not fake organization or booking rows.
- Device-local language/theme/remembered-email preferences may stay local; private profiles can use scoped FrontendStates or account JSON fields.
- Actual geocoding, email, payment, AI and navigation services require backend/provider implementation.
