'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    let generation = 0;
    const text = (id, value) => {
      const n = document.getElementById(id);
      if (n) n.textContent = value;
    };
    async function refresh() {
      const serial = ++generation,
        a = await WusoolServices.getCurrentAccount();
      const [bookings, reviews, tickets, catalog] = await Promise.all([
        WusoolServices.list('bookings'),
        WusoolServices.list('reviews', {
          userId: a.id,
        }),
        WusoolServices.list('tickets'),
        WusoolServices.places(),
      ]);
      if (serial !== generation || (await WusoolServices.getCurrentAccount())?.id !== a.id) return;
      text('welcomeUserName', a.name);
      text('navbarUserName', a.name);
      const upcoming = bookings.items
        .filter(
          (b) =>
            ['confirmed', 'in-progress'].includes(b.status) &&
            new Date(b.date + 'T' + b.time) > new Date(),
        )
        .sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
      const saved = catalog.items.filter((p) => (a.savedPlaces || []).includes(p.id));
      const values = [
        upcoming.length,
        saved.length,
        'Backend required',
        reviews.total + tickets.total,
      ];
      document.querySelectorAll('.summary-value').forEach((n, i) => (n.textContent = values[i]));
      const next = document.getElementById('visitTitle')?.closest('article');
      if (next) {
        const b = upcoming[0],
          p = catalog.items.find((p) => p.id === b?.branchId);
        WusoolUI.html(
          next,
          b
            ? `<div class="mb-4"><span class="section-label">Next visit</span><h2 class="h3" id="visitTitle">Your upcoming visit</h2></div><h3 class="h4">${WusoolUI.escape(p?.name || b.branchId)}</h3><p>${WusoolUI.escape(b.date)} · ${WusoolUI.escape(b.time)} · ${WusoolUI.escape(b.status)}</p><a class="btn btn-wusool" href="./visit-details.html?id=${encodeURIComponent(b.id)}">View Visit Details</a>`
            : '<h2 class="h3" id="visitTitle">Your upcoming visit</h2><p>No upcoming visits.</p><a class="btn btn-wusool" href="./plan-visit.html">Plan a visit</a>',
        );
      }
      const grid = document.getElementById('savedTitle')?.closest('section')?.querySelector('.row');
      if (grid) {
        WusoolUI.html(
          grid,
          saved.length
            ? saved
                .slice(0, 3)
                .map(
                  (p) =>
                    `<div class="col-12 col-md-6 col-lg-4"><article class="saved-place-card h-100 p-4"><button class="saved-button" type="button" data-place-id="${WusoolUI.escape(p.id)}" aria-label="Remove from saved places"><i class="bi bi-bookmark-fill"></i></button><h3 class="h5 mt-4">${WusoolUI.escape(p.name)}</h3><p class="text-secondary">${WusoolUI.escape(p.city)}</p><span class="score-pill">${p.score}% · ${WusoolUI.escape(p.scoreDescription)}</span><a href="./user-place-details.html?id=${encodeURIComponent(p.id)}">View</a></article></div>`,
                )
                .join('')
            : '<p>No saved places. Save a published branch from its details page.</p>',
        );
        grid.querySelectorAll('.saved-button').forEach((button) =>
          WusoolUI.listen(button, 'click', async () => {
            await WusoolServices.setSavedPlace(button.dataset.placeId, false);
            await refresh();
          }),
        );
      }
      const recommendations = document.querySelector('.recommendation-list');
      if (recommendations)
        WusoolUI.html(
          recommendations,
          '<li>Browse published branches and compare their organization claims and approved evidence.</li>',
        );
    }
    text(
      'currentDate',
      new Intl.DateTimeFormat(document.documentElement.lang || 'en', {
        dateStyle: 'full',
      }).format(new Date()),
    );
    WusoolUI.listen(document.getElementById('dashboardSearchForm'), 'submit', (event) => {
      event.preventDefault();
      const value = document.getElementById('searchInput').value.trim();
      if (!value) {
        WusoolUI.message('Enter a place or service.');
        return;
      }
      location.href = './explore-places.html?search=' + encodeURIComponent(value);
    });
    await refresh();
    window.WusoolLive?.watch('dashboard', refresh);
    WusoolUI.listen(window, 'wusool:account-changed', () => location.reload());
  });
});
