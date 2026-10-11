> Historical v26 update. For the current system restoration, use ../validation-v27.md and ../../START_HERE.md.

# v26 — restored street and smoother Orange scrolling

Restores the approved v24 Bank al Etihad, Irbid Specialty Hospital, Ministry of Digital Economy and Entrepreneurship, and Civil Status and Passports Department models, signs, supporting artwork and read-only information cards. They appear as four native-scroll stops before the existing Wusool sections and Orange. Physical placement stays fixed in Arabic. Orange is relocated farther down the extended street; its conceptual interior layout is unchanged.

Scrolling now eases progress along the existing clear camera paths, then uses elapsed-time camera damping. Wheel pixel/line/page units are normalized. Mouse, touch, keyboard and buttons share the existing bounded navigation and transition guards. Return preserves parent corridor progress. Static reduced-motion navigation remains immediate. Static street meshes are batched by material.

Validation: 1,002 navigation assertions passed; 21 browser checks passed, including 2,408 sampled poses clear of registered solids with a 0.22-unit envelope. Six restored-stop and camera smoothing checks passed; results are in street-validation.json. Business source preservation is recorded in preservation-v26.json. These checks do not certify every device or every business workflow; account/booking code was preserved, not externally exercised.

Limitations: architectural dimensions are estimated; Orange is a conceptual reference-informed reconstruction. The four restored organization models/artwork retain their previous illustrative status. Software WebGL testing is not a real-device performance benchmark. See LAYOUT_AND_REFERENCES.md for reference observations and estimates.

Run: extract ZIP, open a terminal in master code, run python3 -m http.server 8000, then visit http://localhost:8000/visitor/html/home.html . No new runtime dependencies or backend.
