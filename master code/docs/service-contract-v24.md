# Ticket services — v24 contract addendum

This is a frontend and explicit local adapter. No server endpoint is implemented. Existing authentication, publication, booking schedules, assistance limits and status transitions remain authoritative. Read this addendum alongside `openapi.json`.

## Actual model

Configured `branch.services` strings/objects remain untouched. If `branch.ticketServices` is absent, the ticket service adapter normalizes those existing records; it never infers services from an organization's name. A legacy string gets a deterministic branch-qualified ID from its exact name. Configuring that record preserves its ID through subsequent renames. Newly created records get opaque IDs from the existing ID generator.

`branch.ticketServices` is the smallest explicit ticket configuration extension. When present, it is authoritative **for ticket service selection**; `[]` is a real empty configuration. The legacy branch service/destination fields used by other workflows are not rewritten. Do not remove `ticketServices` to reactivate older choices unintentionally.

```json
{
  "id": "service-opaque-id",
  "branchId": "branch-opaque-id",
  "organizationId": "organization-opaque-id",
  "name": "Actual configured service name",
  "description": "Optional actual description",
  "active": true,
  "available": true
}
```

No example here is inserted as production data. The manager is on Organization → Visitor Bookings → Manage branch services; Admin has the same authorized tool. Only owned branches can be managed by an organization. Retire records with Active/Available flags. New names are unique (case-insensitive), 2–120 characters; descriptions at most 500; at most 50 records. Unknown or foreign IDs are rejected. Management rechecks the active account and existing ownership and logs the existing audit event.

Public selection reads only eligible published branches and filters inactive/unavailable/deleted or mismatched records. The UI validates response shape and ownership, requires a branch first, clears incompatible selections and uses native accessible radios. If configured choices exist, new tickets require a selection in the modal. An empty configuration allows the original booking without a service. Loading/errors block modal submission; Retry is explicit. Existing callers that omit `serviceId` retain their original behavior.

## Ticket persistence

Create/update inputs add only `serviceId`. The adapter validates it against the final branch and computes trusted `serviceName` and `serviceSnapshot` (id, name, description, branchId, organizationId). Caller-supplied names cannot override the computed fields. The snapshot preserves the name when an organization later renames or deactivates a service. An unrelated edit may retain the same historical selection in the same branch; a new selection must currently be active and available. Branch changes cannot retain another branch's service.

Old bookings without these fields remain valid. No migration regenerates services or edits existing bookings. Selection never changes duration, price, hours, availability, assistance capacity or transitions. Appointment proposals carry service fields and apply them through the original response workflow. Tracking explicitly displays the saved name; existing visit details use the DTO's destination display fallback, preferring the selected service when present.

## Proposed API additions — disabled by default

`assets/api-config.js`: `mode` still chooses local/API explicitly. `ticketServicesApiEnabled` defaults to false. Enable it only after implementing the following backend endpoints; otherwise the frontend returns INTEGRATION_UNAVAILABLE. Network/backend errors never read or write demo records as a fallback.

| Method and path | Request | Response and authorization |
| --- | --- | --- |
| GET `/branches/{branchId}/ticket-services` | No body | `{ "items": TicketServiceDto[] }`; published discovery only; active/available records |
| GET same path with `?manage=true` | No body | All configuration records; branch owner Organization or Admin |
| PUT `/branches/{branchId}/ticket-services` | `{ "items": [...] }` | `{ "items": TicketServiceDto[] }`; branch owner or Admin; new records may omit ID |
| Existing POST `/bookings` | Original body + optional `serviceId`; original Idempotency-Key | Original booking DTO + optional trusted service fields |
| Existing booking/appointment update endpoints | Original body + optional `serviceId` | Original semantics, permissions, revisions and proposal response flow |

Backend responsibilities: derive ownership from authenticated accounts and stored branch ownership, validate service IDs on create/update, respect blocked/deleted accounts, preserve snapshots and old proposals, enforce CSRF/idempotency/concurrency, and return authoritative DTOs. Never trust a requested organization ID, name, rating, price or availability. Native radio requirements are UX, not production authorization. Proposed OpenAPI additions and the endpoint inventory are included.

## Discovery map configuration

`googleMapsProvider` stays `free-embed` for the existing location pickers. New `googleMapsDiscoveryProvider: 'javascript'` selects the supported discovery integration only. Existing browser Maps key values are reused; no secret/server credentials or new key is added. The tracking integration already used the JavaScript loader and continues doing so.

The discovery and tracking maps explicitly use raster rendering, inline POI-label/transit-icon styles and `clickableIcons:false`. No map ID is applied to these raster maps, because inline styling must remain effective. Custom red markers use the supported legacy Marker class; it is deprecated. A later move to AdvancedMarkerElement requires a configured map ID and corresponding cloud styling; do not apply DEMO_MAP_ID and assume inline POI styling still works.

Source references: [Google hiding-features example](https://developers.google.com/maps/documentation/javascript/examples/hiding-features), [Map reference](https://developers.google.com/maps/documentation/javascript/reference/map), [marker deprecations](https://developers.google.com/maps/deprecations).

Pins come from existing filtered `places()` discovery records, use IDs and saved valid coordinates, deduplicate IDs and skip missing coordinates. Ratings use Visible, non-deleted reviews via the existing place service. API mode must return authoritative published averages/counts. Records with no published reviews say No reviews yet. Card strings use textContent; photo URL schemes are restricted. Existing detail/plan routes preserve guest discovery and protected booking. Google attribution is never covered or removed.

The iframe fallback is honest: it cannot implement system-only markers/POI hiding. External Maps JavaScript tiles, key authorization/billing/referrers, provider POI rendering, live routing and cross-device updates remain externally dependent. The current environment's real load returned ERR_EMPTY_RESPONSE; test-double screenshots are labeled and are not proof of a working geographic basemap.
