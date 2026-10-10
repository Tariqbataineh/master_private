# Local UI dependencies

These existing frontend dependencies are now packaged locally instead of relying on CDN requests. Versions are preserved per page:

- Bootstrap 5.3.3 and 5.3.8 — MIT; LICENSE in each directory.
- Bootstrap Icons 1.11.3 — MIT; LICENSE, CSS and font files included.
- GSAP 3.12.5 and ScrollTrigger — original package headers and README/license information retained.
- Leaflet 1.9.4 — BSD-2-Clause; LICENSE and marker images included.

The existing QR modules are documented separately in QR-DEPENDENCIES.md. Google Maps embeds, map tiles, actual email/payment/AI APIs and other remote services still require network connectivity; packaging UI libraries does not make those services offline.
