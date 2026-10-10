"use strict";
WusoolUI.enqueue(async () => {
  if (!await WusoolUI.guard()) return;
  WusoolUI.ready(async () => {
    const account = await WusoolServices.getCurrentAccount();
    if (account?.role !== 'Organization') { WusoolUI.message('Organization access required.'); return; }
    const grid = document.getElementById('visitReviewsGrid'), search = document.getElementById('reviewSearch'), branchFilter = document.getElementById('reviewBranchFilter'), statusFilter = document.getElementById('reviewStatusFilter'), ratingFilter = document.getElementById('reviewRatingFilter');
    let reviews = [], branches = [], generation = 0;
    const approved = review => ['visible','published','approved'].includes(String(review.status).toLowerCase());
    const status = review => approved(review) ? 'Visible' : String(review.status || 'Pending');
    const esc = WusoolUI.escape;
    const render = () => {
      const accepted = reviews.filter(approved);
      document.getElementById('reviewsTotal').textContent = reviews.length;
      document.getElementById('reviewsApproved').textContent = accepted.length;
      document.getElementById('reviewsPending').textContent = reviews.filter(r => status(r).toLowerCase() === 'pending').length;
      document.getElementById('reviewsAverage').textContent = accepted.length ? (accepted.reduce((n,r) => n + Number(r.rating), 0) / accepted.length).toFixed(1) + ' / 5' : '—';
      const q = search.value.trim().toLowerCase();
      const rows = reviews.filter(r => (!branchFilter.value || String(r.branchId) === branchFilter.value) && (!statusFilter.value || status(r).toLowerCase() === statusFilter.value.toLowerCase()) && (!ratingFilter.value || Number(r.rating) === Number(ratingFilter.value)) && [r.name,r.placeName,r.title,r.comment].join(' ').toLowerCase().includes(q));
      document.getElementById('reviewResults').textContent = rows.length + ' of ' + reviews.length + ' reviews · Automatic updates';
      document.getElementById('reviewEmpty').hidden = rows.length !== 0;
      WusoolUI.html(grid, rows.map(r => {
        const branch = branches.find(b => String(b.id) === String(r.branchId));
        const value = Math.max(1, Math.min(5, Number(r.rating) || 1));
        const date = Date.parse(r.createdAt);
        const label = approved(r) ? 'Approved · Read-only' : status(r);
        return `<article class="visit-review-card"><header><div class="review-author"><span class="review-avatar" aria-hidden="true">${esc((r.name || 'Visitor').slice(0,1))}</span><div><strong>${esc(r.name || 'Visitor')}</strong><small class="d-block text-secondary">${esc(branch?.name || branch?.branchName || r.placeName || 'Branch')}</small></div></div><span class="badge text-bg-${approved(r) ? 'success' : status(r) === 'Rejected' ? 'danger' : 'secondary'}">${esc(label)}</span></header><div class="review-stars" aria-label="${value} out of 5 stars">${'★'.repeat(value)}${'☆'.repeat(5-value)}</div><h2>${esc(r.title || 'Visit experience')}</h2><p class="review-comment">${esc(r.comment || 'No written comment.')}</p><footer><i class="bi bi-patch-check" aria-hidden="true"></i> Completed visit · ${Number.isFinite(date) ? esc(new Intl.DateTimeFormat('en-JO',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Amman'}).format(date)) : 'Date unavailable'}</footer></article>`;
      }).join(''));
    };
    const refresh = async () => {
      const current = ++generation;
      const [nextReviews, nextBranches] = await Promise.all([WusoolServices.getReviews({organizationId:account.id}), WusoolServices.getBranches({organizationId:account.id})]);
      if (current !== generation) return;
      branches = nextBranches;
      const ids = new Set(branches.map(b => String(b.id)));
      // Defence in depth; the service also limits organization review access.
      reviews = nextReviews.filter(r => !r.isDeleted && ids.has(String(r.branchId))).sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      const selected = branchFilter.value;
      branchFilter.replaceChildren(new Option('All branches',''), ...branches.map(b => new Option(b.name || b.branchName,String(b.id))));
      if (ids.has(selected)) branchFilter.value = selected;
      render();
    };
    WusoolUI.listen(search,'input',render);
    for (const filter of [branchFilter,statusFilter,ratingFilter]) WusoolUI.listen(filter,'change',render);
    window.WusoolLive?.watch('organization-visit-reviews',refresh);
    await refresh();
  });
});
