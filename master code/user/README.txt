WUSOOL USER FRONT-END
=====================

Technology:
- HTML5
- CSS3
- Bootstrap 5.3.3
- Vanilla JavaScript

Shared user layout:
- css/user-layout.css contains the responsive registered-user sidebar design.
- js/user-layout.js builds the same sidebar on every user page.
- Desktop uses a fixed sidebar; tablet and mobile use an accessible slide-out menu.

Start page:
html/user-dashboard.html

Explore places flow:
1. explore-places.html
2. user-place-details.html
3. community-reviews.html or ai-accessibility-report.html

All Explore Places links stay inside the registered-user area, so the
responsive sidebar remains visible instead of opening the visitor navbar.

Authentication and logout:
- visitor/js/login.js creates the demo user session and redirects to the user dashboard.
- Every user page checks the session before displaying protected content.
- The sidebar Log Out button clears the session and returns to the visitor home page.
- Extract both the user and visitor folders from this ZIP into the master project.

Visit and AI navigation flow:
1. plan-visit.html
2. visit-summary.html
3. my-visits.html
4. visit-details.html
5. analyze-surroundings.html
6. navigation-guidance.html
7. Repeat photo analysis and guidance until the final step
8. navigation-complete.html

Reviews and reports:
- Completed visits can open write-review.html.
- Published reviews are managed in my-reviews.html.
- Accessibility issues are submitted through report-accessibility-issue.html.
- Submitted reports are tracked in my-reports.html.

User profile:
- The CV section remains available in user-profile.html as a future-ready feature.

Important:
- Keep this user folder inside the master project beside the shared assets and visitor folders.
- Pages expect the shared files at ../../assets/site.css and ../../assets/site.js.
- Front-end demo data is stored in localStorage until the backend is connected.
- The real AI endpoint can later replace the prototype analysis in js/analyze-surroundings.js.
