# Design specification — outside cinematic Home

The existing shared `presentation.css` and `theme-surfaces.css` remain unchanged. A small `portal-refinement.css` opt-in is loaded by 120 complete non-home pages. Home and the sidebar fragment receive no new stylesheet.

| Element | Specification |
| --- | --- |
| English / Arabic | Existing Segoe UI / Tahoma coordinated system font stacks; offline Arial/sans-serif fallbacks; no font download |
| Body / supporting text | 1rem / .875rem; English line height 1.65, Arabic 1.8 |
| Page / section / card headings | Fluid 2–3rem / existing fluid 1.75–2.5rem / 1.375rem |
| Brand / navy | Existing teal #0f766e, hover #0b5f59, navy #0f2747 |
| Light text / surface / border | Existing #10233f / white / #cbdcda semantic theme tokens |
| Dark | Existing theme tokens: #1b2326 surfaces, #edf5f3 text, #70ddcc focus/accent; mode logic unchanged |
| Spacing | Existing 4/8/12/16/24/32/48/64/96px scale in rem tokens |
| Standard / compact / main CTA controls | Existing 46 / 40 (44 mobile) / 50px minima; 12px radius |
| Cards / dialog | Existing 18 / 24px radii, restrained shared shadows |
| Ticket modal | 940px desktop maximum; viewport-constrained scrollable dialog; 2 columns then 1 column ≤720px; sticky original action footer |
| Service choices | Native radios; 2-column grid then 1 column; explicit checkmark and focus outline; real record names/descriptions |
| Tracking action | One visible teal action per My Tickets row; ≥44px target; original delegated action sources retained in a hidden bank for tracking |
| Feedback | 180ms existing CSS color/border transitions; reduced-motion removes service tile transitions |

No external font or image is introduced. Arabic headings added by this change update in place when switching languages. Native date controls, focus restoration, Escape, unsaved-form behavior and original Cancel/Save handlers remain. No backdrop click-to-dismiss handler is added. Existing high-contrast semantics are retained; new ticket/map surfaces use explicit readable boundaries. Enlarged text was checked at a 24px root size.
