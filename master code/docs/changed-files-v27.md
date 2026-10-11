# v27 restoration

- Restored the entire v24 user/org/admin/assets runtime, pages, styles and service/data layers byte-for-byte. No new ticket workflow was invented.
- visitor/html/home.html: retained v24 page content and full service loaders/local dependencies, replaced only the journey shell with the v26 Orange integration. Uses existing v24 organization info and published-branch matching.
- Retained the six v26 Orange/street runtime files recorded in restoration-v27.json, both scoped exploration styles, rendered preview, layout and screenshots.
- tests/home-preservation.test.cjs: excludes only the three authorized journey integration files from the historical v24 hash assertion; every other protected asset stays checked against original hashes.
- Added restoration report, current run guide and validation evidence. Earlier reports remain historical.
