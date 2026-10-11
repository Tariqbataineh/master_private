# Actual v27 validation

- 189 system tests passed; zero failed. Includes booking creation, service selection, capacity/assistance, role/ownership checks, rescheduling, cancellation, reviews, authentication/account lifecycle, branch publication, HTTP contracts and local storage behavior.
- 54 ticket/page browser checks passed. Created a ticket with a configured branch service, verified its saved service in tracking, opened original reschedule and cancellation controls, exercised organization/admin tracking and checked English/Arabic, mobile and dark mode. Fixtures are isolated test records, not production organization data.
- 21 Orange browser checks and 6 restored-street/smoothing checks passed; zero application page errors in these tested flows.
- 1,002 Orange navigation assertions passed. Sampled camera paths stay clear of registered walls/furniture within a 0.22-unit envelope; no claim of exhaustive collision detection.
- 465 v24 files under assets/user/org/admin are byte-identical. Six Orange/street runtime files are byte-identical to v26. Home intentionally combines current scene shell with latest service loaders/content.
- The historical Home hash test was updated only to exempt the three explicitly authorized journey integration files. The first run failed that obsolete preservation expectation; after scoping it to current requirements, the full 189-test suite passed. Other protected assets remain checked against original hashes.

Evidence: validation-results-v27.json, restoration-v27.json, test-output-v27.txt, browser-results-v24.json, docs/orange/browser-validation.json and street-validation.json. Current ticket screenshots are in screenshots-v24; retained Orange views and updated mobile/fallback shots are in orange/screenshots.

Limits: frontend-only project, same API/local mode settings as v24. Google Maps is tested with clearly documented API doubles/failure handling; live Google key/billing and external backend behavior are unverified. No production account actions or data changes were performed. Software Chromium checks are not physical-device performance benchmarks. Architecture remains a conceptual reconstruction with estimated dimensions.
