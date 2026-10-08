# Wusool frontend handoff

This archive changes the supplied frontend only. No backend, database, migration or server project was built.

## Authoritative tree

Use the top-level `visitor`, `user`, `org`, `admin` and `assets` folders. The supplied `master_private` copy is preserved unchanged and is not part of the active script graph. `docs/initial-inventory.json` records the original comparison (190 differing files) and page/script/storage inventory. Existing SQL reference material is preserved; no new SQL was generated.

## Run

Use an HTTP static server instead of opening HTML via file://. For example, from the project folder:

```sh
python -m http.server 8080
```

Open `/visitor/html/home.html`. Register a user at `/visitor/html/register.html`. Register an organization at `/org/html/organization-register.html`. The local account needs a password of at least eight characters, and the page may impose stronger validation.

Open `/admin/html/admin-login.html` to initialize the **local-only** administrator fixture:

- Email: `admin@wusool.local`
- Password: `WusoolDemo2026!`

An organization starts with a pending application. The administrator activates/approves the organization in the organization screen. The organization then creates a branch, enters its hours and accessibility claims, adds preview photo metadata and submits it for administrator review. AI review is optional and can be skipped using Continue. Administrator approval makes the same branch discoverable. Users book that branch; its organization sees the same booking ID on Visitor Tickets (the route is retained). The organization advances it to in-progress and completed. The user then reviews it; moderation to Visible makes it count toward the public rating.

`demoSubscription: true` creates an explicitly named development-only subscription fixture for each new organization. No payment was processed. This fixture does not approve the organization or branch. Switch it off to test the no-subscription state. It is not a production entitlement policy.

The canonical local database is `wusool.database.v2`. Old legacy data is intentionally not automatically imported: old independent IDs and plaintext credentials are not trusted. An empty collection stays empty. Local credential verification uses PBKDF2-SHA256 with a per-account salt and 100,000 iterations; it is isolated to local development and is not production authentication. Browser data is editable by the browser owner.

## API mode

Change `assets/api-config.js` to `mode: 'api'`, set `baseUrl`, and disable `demoSubscription`. Implement the contract in `BACKEND-INTEGRATION-CONTRACT.md`. API mode calls the server and never reads local business records as fallback. The server must supply cookie authentication, authorization, pagination, consistent DTOs and the API endpoints before API mode works. Configure HTTPS, CORS/credentials and CSRF protection on the server.

Payments, recovery, password changes, AI analysis, navigation and impersonation have explicit server-dependent states. Selected files are previews until an upload response confirms success. Opening payment-success does not grant approval, authenticate an organization or activate a subscription. Local notices are not confirmed email delivery. Saved report schedules are configuration, not running jobs. Device entries are browser metadata, not real server sessions.

## Tests and limits

Run from this project folder (Node.js 18+ and Python 3):

```sh
node --test tests/app-services.test.cjs tests/page-integration.test.cjs tests/runtime.test.cjs
node tests/controller-smoke.cjs local
node tests/controller-smoke.cjs empty
node tests/controller-smoke.cjs api
python tests/verify-project.py
```

Actual final results: **37 tests passed, zero failures**; **123 controller/page initializations passed in each of local, empty and stubbed API modes** (369 checks). The action tests exercise the original registration/login, organization decision view, branch creation/admin review, submission, booking, organization booking updates, review, saved places, public map and external-operation screens against a small DOM double. Runtime tests cover guards, return destinations, sanitizer and submission locking. `docs/test-results.txt` contains the actual test runner output. The structural checker found zero missing scripts, host-resolved links, syntax errors, shared script-order errors or direct controller browser-storage calls.

**Verification limitation:** Chromium could not be installed in this environment, and the cloud browser cannot reach the local project. No actual browser rendering, keyboard/screen-reader, visual RTL, vendor-map or full sidebar interaction test was performed. DOM doubles and API stubs cannot establish those results. API mode was tested without a real backend; hosted checkout, persistent uploads, email, AI/navigation providers, session revocation and server jobs remain backend/configuration dependencies. Local guards are development behavior, not production security or cross-device revocation; browser storage cannot guarantee booking capacity or cross-tab atomicity.

The archive includes all changed source files, tests, the final API contract, a page-by-page inventory/checklist, original comparison inventory, structural reports and a changed-file manifest. `master_private` remains unchanged. The duplicate files under `user/css` are unused source copies, not additional active business-data pages. Do not load `user/css/my-reviews.js`; use `user/js/my-reviews.js`.
