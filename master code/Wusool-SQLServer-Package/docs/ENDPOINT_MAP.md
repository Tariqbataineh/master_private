# Endpoint → persistence map

| Method | Existing path | Storage / responsibility |
|---|---|---|
| GET | `/auth/antiforgery` | AspNetUsers + Identity tables; AccessChallenges; DeviceSessions; OutboxMessages |
| POST | `/auth/register` | AspNetUsers + Identity tables; AccessChallenges; DeviceSessions; OutboxMessages |
| POST | `/auth/login` | AspNetUsers + Identity tables; AccessChallenges; DeviceSessions; OutboxMessages |
| GET | `/auth/me` | AspNetUsers + Identity tables; AccessChallenges; DeviceSessions; OutboxMessages |
| POST | `/auth/logout` | AspNetUsers + Identity tables; AccessChallenges; DeviceSessions; OutboxMessages |
| POST | `/auth/initial-password` | AspNetUsers + Identity tables; AccessChallenges; DeviceSessions; OutboxMessages |
| POST | `/auth/recovery` | AspNetUsers + Identity tables; AccessChallenges; DeviceSessions; OutboxMessages |
| POST | `/auth/reset-password` | AspNetUsers + Identity tables; AccessChallenges; DeviceSessions; OutboxMessages |
| POST | `/auth/change-password` | AspNetUsers + Identity tables; AccessChallenges; DeviceSessions; OutboxMessages |
| POST | `/admin/accounts` | Accounts/sessions/errors/impersonation + FrontendStates |
| POST | `/users/{id}/reset-access` | AspNetUsers; SavedPlaces; AccessChallenges |
| POST | `/organizations/{id}/reset-access` | AspNetUsers + Organizations + Applications + Memberships + schedules |
| GET | `/users` | AspNetUsers; SavedPlaces; AccessChallenges |
| POST | `/users` | AspNetUsers; SavedPlaces; AccessChallenges |
| GET | `/users/{id}` | AspNetUsers; SavedPlaces; AccessChallenges |
| PUT | `/users/{id}` | AspNetUsers; SavedPlaces; AccessChallenges |
| GET | `/organizations` | AspNetUsers + Organizations + Applications + Memberships + schedules |
| POST | `/organizations` | AspNetUsers + Organizations + Applications + Memberships + schedules |
| GET | `/organizations/{id}` | AspNetUsers + Organizations + Applications + Memberships + schedules |
| PUT | `/organizations/{id}` | AspNetUsers + Organizations + Applications + Memberships + schedules |
| GET | `/branches` | Branches + services/accessibility/photos/analyses/schedules |
| POST | `/branches` | Branches + services/accessibility/photos/analyses/schedules |
| GET | `/branches/{id}` | Branches + services/accessibility/photos/analyses/schedules |
| PUT | `/branches/{id}` | Branches + services/accessibility/photos/analyses/schedules |
| GET | `/tickets` | SupportTickets + TicketMessages + attachments |
| POST | `/tickets` | SupportTickets + TicketMessages + attachments |
| GET | `/tickets/{id}` | SupportTickets + TicketMessages + attachments |
| PUT | `/tickets/{id}` | SupportTickets + TicketMessages + attachments |
| GET | `/reviews` | Reviews + Bookings |
| POST | `/reviews` | Reviews + Bookings |
| GET | `/reviews/{id}` | Reviews + Bookings |
| PUT | `/reviews/{id}` | Reviews + Bookings |
| GET | `/documents` | Documents; external file storage |
| POST | `/documents` | Documents; external file storage |
| GET | `/documents/{id}` | Documents; external file storage |
| PUT | `/documents/{id}` | Documents; external file storage |
| GET | `/subscriptions` | Subscriptions + Plans + PaymentOperations |
| POST | `/subscriptions` | Subscriptions + Plans + PaymentOperations |
| GET | `/subscriptions/{id}` | Subscriptions + Plans + PaymentOperations |
| PUT | `/subscriptions/{id}` | Subscriptions + Plans + PaymentOperations |
| GET | `/notifications` | Notifications + NotificationReads |
| POST | `/notifications` | Notifications + NotificationReads |
| GET | `/notifications/{id}` | Notifications + NotificationReads |
| PUT | `/notifications/{id}` | Notifications + NotificationReads |
| GET | `/bookings` | Bookings + history/proposals/passes + idempotency |
| POST | `/bookings` | Bookings + history/proposals/passes + idempotency |
| GET | `/bookings/{id}` | Bookings + history/proposals/passes + idempotency |
| DELETE | `/bookings/{id}` | Bookings + history/proposals/passes + idempotency |
| PATCH | `/bookings/{id}/appointment` | Bookings + history/proposals/passes + idempotency |
| PATCH | `/bookings/{id}/status` | Bookings + history/proposals/passes + idempotency |
| POST | `/bookings/{id}/journey` | Bookings + history/proposals/passes + idempotency |
| POST | `/bookings/{id}/cancel` | Bookings + history/proposals/passes + idempotency |
| GET | `/bookings/{id}/pass` | Bookings + history/proposals/passes + idempotency |
| POST | `/visits/verify` | Bookings + VisitPasses + history; transaction-based queue/automation |
| POST | `/bookings/{id}/appointment/response` | Bookings + history/proposals/passes + idempotency |
| POST | `/bookings/waitlist` | Bookings + history/proposals/passes + idempotency |
| POST | `/branches/{id}/queue/call-next` | Branches + services/accessibility/photos/analyses/schedules |
| POST | `/branches/{id}/visit-notice` | Branches + services/accessibility/photos/analyses/schedules |
| POST | `/visits/automation` | Bookings + VisitPasses + history; transaction-based queue/automation |
| POST | `/branches/{id}/submit` | Branches + services/accessibility/photos/analyses/schedules |
| GET | `/places` | Derived published Branches; no independent Places table |
| GET | `/plans` | Plans |
| PUT | `/users/me/saved-places/{id}` | AspNetUsers; SavedPlaces; AccessChallenges |
| DELETE | `/users/me/saved-places/{id}` | AspNetUsers; SavedPlaces; AccessChallenges |
| POST | `/documents/upload` | Documents; external file storage |
| GET | `/audit` | AuditEvents |
| GET | `/frontend-state/{key}` | FrontendStates, allowlisted config/drafts only |
| PUT | `/frontend-state/{key}` | FrontendStates, allowlisted config/drafts only |
| DELETE | `/frontend-state/{key}` | FrontendStates, allowlisted config/drafts only |
| POST | `/payments/checkout` | PaymentOperations + provider webhooks + idempotency |
| POST | `/payments/status` | PaymentOperations + provider webhooks + idempotency |
| POST | `/payments/customer-portal` | PaymentOperations + provider webhooks + idempotency |
| POST | `/subscriptions/auto-renew` | Subscriptions + Plans + PaymentOperations |
| GET | `/admin/sessions` | Accounts/sessions/errors/impersonation + FrontendStates |
| POST | `/admin/sessions/revoke` | Accounts/sessions/errors/impersonation + FrontendStates |
| POST | `/admin/impersonation` | Accounts/sessions/errors/impersonation + FrontendStates |
| GET | `/admin/system-health` | Accounts/sessions/errors/impersonation + FrontendStates |
| GET | `/admin/errors` | Accounts/sessions/errors/impersonation + FrontendStates |
| POST | `/telemetry/errors` | RuntimeErrors |
| GET | `/sync/revision` | SyncRevisions |
| GET | `/exports/me` | Derived authorized queries; optional ExternalJobs |
| POST | `/ai/branch-analysis` | ExternalJobs + BranchAnalyses; external provider |
| POST | `/ai/reports` | ExternalJobs + BranchAnalyses; external provider |
| POST | `/ai/accessibility-report` | ExternalJobs + BranchAnalyses; external provider |
| POST | `/ai/surroundings` | ExternalJobs + BranchAnalyses; external provider |
| POST | `/ai/assistant` | ExternalJobs + BranchAnalyses; external provider |
| POST | `/ai/copilot` | ExternalJobs + BranchAnalyses; external provider |
| POST | `/navigation/guidance` | ExternalJobs/Bookings/Branches; external routing provider |
| POST | `/navigation/status` | ExternalJobs/Bookings/Branches; external routing provider |
| GET | `/organizations/{id}/hours` | AspNetUsers + Organizations + Applications + Memberships + schedules |
| PUT | `/organizations/{id}/hours` | AspNetUsers + Organizations + Applications + Memberships + schedules |
| GET | `/branches/{id}/hours` | Branches + services/accessibility/photos/analyses/schedules |
| PUT | `/branches/{id}/hours` | Branches + services/accessibility/photos/analyses/schedules |
| GET | `/hours-change-requests` | HoursChangeRequests + HoursAffectedBookings |
| POST | `/hours-change-requests/{id}/decision` | HoursChangeRequests + HoursAffectedBookings |
| GET | `/branches/{branchId}/ticket-services` | Branches + services/accessibility/photos/analyses/schedules |
| PUT | `/branches/{branchId}/ticket-services` | Branches + services/accessibility/photos/analyses/schedules |
