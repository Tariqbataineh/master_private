'use strict';

// Read-only Organization visitor feedback. Review approval/locking is enforced by WusoolServices.
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    const account = await WusoolServices.getCurrentAccount();
    if (account?.role !== 'Organization') {
      WusoolUI.message('Organization access required.');
      return;
    }

    const grid = document.getElementById('visitReviewsGrid');
    const empty = document.getElementById('reviewEmpty');
    const search = document.getElementById('reviewSearch');
    const branchFilter = document.getElementById('reviewBranchFilter');
    const statusFilter = document.getElementById('reviewStatusFilter');
    const ratingFilter = document.getElementById('reviewRatingFilter');
    const esc = value => WusoolUI.escape(String(value ?? ''));
    const ar = () => document.documentElement.lang === 'ar';
    const t = (en, arabic) => ar() ? arabic : en;
    const status = review => {
      const raw = String(review.status || 'pending').toLowerCase().trim();
      if (['visible', 'published', 'approved'].includes(raw)) return 'Visible';
      if (['pending', 'pending-review', 'submitted', 'awaiting-approval'].includes(raw)) return 'Pending';
      if (raw === 'rejected') return 'Rejected';
      if (raw === 'hidden') return 'Hidden';
      return 'Other';
    };
    const validRating = review => {
      const raw = review.rating;
      if (raw === null || raw === undefined || raw === '') return null;
      const n = Number(raw);
      return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
    };
    const branchName = (review, branchById) => {
      const branch = branchById.get(String(review.branchId));
      return branch?.name || branch?.branchName || review.placeName || t('Branch', 'الفرع');
    };
    const dateLabel = date => {
      const timestamp = Date.parse(date);
      if (!Number.isFinite(timestamp)) return t('Date unavailable', 'التاريخ غير متوفر');
      return new Intl.DateTimeFormat(ar() ? 'ar-JO' : 'en-JO', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Amman',
      }).format(timestamp);
    };
    const number = value => new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO').format(value);
    let reviews = [];
    let branches = [];
    let generation = 0;

    const render = () => {
      const approved = reviews.filter(review => status(review) === 'Visible');
      const rated = approved.map(validRating).filter(value => value !== null);
      const average = rated.length ? rated.reduce((sum, rating) => sum + rating, 0) / rated.length : null;
      document.getElementById('reviewsTotal').textContent = number(reviews.length);
      document.getElementById('reviewsApproved').textContent = number(approved.length);
      document.getElementById('reviewsPending').textContent = number(reviews.filter(review => status(review) === 'Pending').length);
      document.getElementById('reviewsAverage').textContent = average === null
        ? '—'
        : `${new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(average)} / 5`;

      const q = search.value.trim().toLocaleLowerCase();
      const branchById = new Map(branches.map(branch => [String(branch.id), branch]));
      const rows = reviews.filter(review => {
        const name = branchName(review, branchById);
        return (!branchFilter.value || String(review.branchId) === branchFilter.value)
          && (!statusFilter.value || status(review).toLowerCase() === statusFilter.value.toLowerCase())
          && (!ratingFilter.value || validRating(review) === Number(ratingFilter.value))
          && [review.name, name, review.placeName, review.title, review.comment]
            .some(value => String(value || '').toLocaleLowerCase().includes(q));
      });

      document.getElementById('reviewResults').textContent = t(
        `${number(rows.length)} of ${number(reviews.length)} reviews · Automatic updates`,
        `عرض ${number(rows.length)} من أصل ${number(reviews.length)} تقييمًا · تحديث تلقائي`,
      );
      empty.hidden = rows.length > 0;
      empty.textContent = reviews.length
        ? t('No reviews match these filters. Try changing the search or selections.',
            'لا توجد تقييمات مطابقة لهذه الفلاتر. جرّب تعديل البحث أو الخيارات.')
        : t('No visit reviews yet. Feedback appears after visitors complete a visit and submit a review.',
            'لا توجد تقييمات زيارات بعد. تظهر التقييمات بعد إكمال الزيارة وإرسال الملاحظات.');

      WusoolUI.html(grid, rows.map(review => {
        const reviewStatus = status(review);
        const rating = validRating(review);
        const label = reviewStatus === 'Visible'
          ? t('Approved · Read-only', 'معتمد · للقراءة فقط')
          : ({ Pending: t('Pending', 'قيد المراجعة'), Rejected: t('Rejected', 'مرفوض'),
            Hidden: t('Hidden', 'مخفي'), Other: t('Other status', 'حالة أخرى') })[reviewStatus];
        const badge = reviewStatus === 'Visible' ? 'success' : reviewStatus === 'Rejected' ? 'danger' : 'secondary';
        const stars = rating === null
          ? `<span class="text-secondary">${t('Not rated', 'غير مقيّم')}</span>`
          : `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
        const ratingLabel = rating === null
          ? t('No rating recorded', 'لم يتم تسجيل تقييم')
          : t(`${rating} out of 5 stars`, `${rating} من 5 نجوم`);
        const name = branchName(review, branchById);
        return `<article class="visit-review-card">
          <header><div class="review-author"><span class="review-avatar" aria-hidden="true">${esc(String(review.name || t('Visitor', 'زائر')).slice(0, 1))}</span>
          <div><strong>${esc(review.name || t('Visitor', 'زائر'))}</strong><small class="d-block text-secondary">${esc(name)}</small></div></div>
          <span class="badge text-bg-${badge}">${esc(label)}</span></header>
          <div class="review-stars" aria-label="${esc(ratingLabel)}">${stars}</div>
          <h2>${esc(review.title || t('Visit experience', 'تجربة الزيارة'))}</h2>
          <p class="review-comment">${esc(review.comment || t('No written comment.', 'لا يوجد تعليق مكتوب.'))}</p>
          <footer><i class="bi bi-patch-check" aria-hidden="true"></i> ${t('Completed visit', 'زيارة مكتملة')} · ${esc(dateLabel(review.createdAt))}</footer>
        </article>`;
      }).join(''));
    };

    const refresh = async () => {
      const current = ++generation;
      try {
        const [nextReviews, nextBranches] = await Promise.all([
          WusoolServices.getReviews({ organizationId: account.id }),
          WusoolServices.getBranches({ organizationId: account.id }),
        ]);
        if (current !== generation) return;
        branches = (Array.isArray(nextBranches) ? nextBranches : []).filter(branch => !branch.isDeleted);
        const ids = new Set(branches.map(branch => String(branch.id)));
        reviews = (Array.isArray(nextReviews) ? nextReviews : [])
          .filter(review => !review.isDeleted && ids.has(String(review.branchId)))
          .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
        const selected = branchFilter.value;
        branchFilter.replaceChildren(new Option(t('All branches', 'كل الفروع'), ''),
          ...branches.map(branch => new Option(branch.name || branch.branchName, String(branch.id))));
        if (ids.has(selected)) branchFilter.value = selected;
        render();
      } catch (error) {
        if (current !== generation) return;
        console.error('Unable to load visit reviews:', error);
        document.getElementById('reviewResults').textContent = t('Unable to load reviews.', 'تعذّر تحميل التقييمات.');
        empty.hidden = false;
        empty.textContent = t('Please try refreshing the page.', 'يرجى تحديث الصفحة والمحاولة مجددًا.');
      }
    };

    WusoolUI.listen(search, 'input', render);
    for (const filter of [branchFilter, statusFilter, ratingFilter]) WusoolUI.listen(filter, 'change', render);
    WusoolUI.listen(window, 'wxi:language', () => {
      const selected = branchFilter.value;
      branchFilter.replaceChildren(new Option(t('All branches', 'كل الفروع'), ''),
        ...branches.map(branch => new Option(branch.name || branch.branchName, String(branch.id))));
      if (branches.some(branch => String(branch.id) === selected)) branchFilter.value = selected;
      render();
    });
    window.WusoolLive?.watch('organization-visit-reviews', refresh);
    await refresh();
  });
});
