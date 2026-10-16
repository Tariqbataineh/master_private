'use strict';
// Read-only organization accessibility-review history. A saved demo declaration is NOT an AI result.
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    // API mode continues to use the existing server-backed external-screen contract.
    if (WusoolServices.mode !== 'local') {
      await WusoolUI.prepareExternalScreen('ai/reports');
      return;
    }

    const account = await WusoolServices.getCurrentAccount();
    if (account?.role !== 'Organization') return;

    const byId = id => document.getElementById(id);
    const escape = WusoolUI.escape;
    const local = (ar, en) => document.documentElement.lang?.startsWith('ar') ? ar : en;
    const number = value => new Intl.NumberFormat(
      document.documentElement.lang?.startsWith('ar') ? 'ar-JO' : 'en-JO',
    ).format(value);
    const dateText = value => {
      const parsed = Date.parse(value || '');
      if (!Number.isFinite(parsed)) return local('التاريخ غير متاح', 'Date unavailable');
      return new Intl.DateTimeFormat(
        document.documentElement.lang?.startsWith('ar') ? 'ar-JO' : 'en-JO',
        { dateStyle: 'medium', timeZone: 'Asia/Amman' },
      ).format(parsed);
    };
    const isConfirmedScore = (branch, review) => {
      if (review?.demo === true || review?.source !== 'ai' || review?.status !== 'completed')
        return false;
      const score = review.score ?? branch.accessibilityScore;
      return typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100;
    };
    const reportState = (branch, review) => {
      if (review.demo === true || review.source === 'demo') return 'demo';
      if (['processing', 'analyzing', 'queued', 'in-progress'].includes(review.status)) return 'analyzing';
      if (isConfirmedScore(branch, review)) {
        return (review.score ?? branch.accessibilityScore) < 70 ? 'action-required' : 'ready';
      }
      return 'unverified';
    };
    const labels = state => ({
      demo: local('ملخص تجريبي — ليس تحليل AI', 'Demo summary — not AI'),
      analyzing: local('قيد المعالجة', 'Processing'),
      ready: local('نتيجة AI مسجلة', 'Recorded AI result'),
      'action-required': local('النتيجة تحتاج تحسينًا', 'Result needs improvement'),
      unverified: local('نتيجة غير مؤكدة', 'Unverified result'),
    })[state] || local('غير معروف', 'Unknown');

    const search = byId('reportSearch');
    const statusFilter = byId('reportStatusFilter');
    const scoreFilter = byId('scoreFilter');
    const cards = byId('reportsContainer');
    const empty = byId('emptyState');
    let reports = [];
    let generation = 0;

    function setText(id, value) {
      const element = byId(id);
      if (element) element.textContent = value;
    }
    function render() {
      const scored = reports.filter(item => item.confirmed);
      const average = scored.length
        ? scored.reduce((total, item) => total + item.score, 0) / scored.length : null;
      setText('totalReports', number(reports.length));
      setText('readyReports', number(scored.length));
      setText('improvementReports', number(scored.filter(item => item.score < 70).length));
      setText('averageScore', average === null ? '—' : `${number(Math.round(average))}%`);
      setText('localReportNotice', local(
        'هذه السجلات مستمدة من بيانات فروع مؤسستك المحفوظة. الملخصات التجريبية مجرد تصريحات محفوظة؛ لا تتضمن درجة AI أو تحليل صور أو تحققًا ميدانيًا. لا تظهر درجة إلا لنتيجة AI مسجلة ذات مصدر مؤكد.',
        'These records come from saved branch data. Demo summaries contain saved declarations only: no AI score, image analysis or field verification. Scores appear only for recorded AI-source results.',
      ));
      const query = search.value.trim().toLocaleLowerCase();
      const rows = reports.filter(item => {
        if (statusFilter.value !== 'all' && item.state !== statusFilter.value) return false;
        if (scoreFilter.value !== 'all') {
          if (!item.confirmed) return false;
          if (scoreFilter.value === 'excellent' && item.score < 85) return false;
          if (scoreFilter.value === 'good' && (item.score < 70 || item.score >= 85)) return false;
          if (scoreFilter.value === 'needs-improvement' && item.score >= 70) return false;
        }
        return [item.branch.name, item.branch.branchName, item.branch.city, item.branch.address]
          .some(value => String(value || '').toLocaleLowerCase().includes(query));
      });
      setText('resultsText', local(
        `عرض ${number(rows.length)} من أصل ${number(reports.length)} مراجعة محفوظة`,
        `Showing ${number(rows.length)} of ${number(reports.length)} saved reviews`,
      ));
      empty.classList.toggle('d-none', rows.length > 0);
      cards.replaceChildren();
      for (const item of rows) {
        const branch = item.branch;
        const review = item.review;
        const score = item.confirmed ? `${number(item.score)} / 100` : local('لا توجد درجة مؤكدة', 'No confirmed score');
        const note = item.state === 'demo'
          ? local('تصريحات الفرع المحفوظة فقط. لم تُحلَّل الصور أو تُتحقَّق المرافق ميدانيًا.', 'Saved branch declarations only. Photos and facilities have not been verified.')
          : item.confirmed
            ? local('نتيجة AI مسجلة. لا تمثل شهادة إتاحة ميدانية.', 'Recorded AI result; not a field accessibility certification.')
            : local('هذه المراجعة لا تحتوي على نتيجة AI مؤكدة.', 'This review has no confirmed AI result.');
        const safeId = encodeURIComponent(String(branch.id));
        const card = document.createElement('div');
        card.className = 'col-12 col-lg-6';
        WusoolUI.html(card, `
          <article class="report-card org-ai-report-entry">
            <header class="report-card-header">
              <div class="org-ai-report-title">
                <span class="branch-icon" aria-hidden="true"><i class="bi bi-building"></i></span>
                <div><h3 class="h6 mb-1">${escape(branch.name || branch.branchName || local('فرع', 'Branch'))}</h3>
                  <small>${escape(branch.city || branch.address || local('الموقع غير متاح', 'Location unavailable'))}</small></div>
              </div>
              <span class="report-status ${escape(item.state)}">${escape(labels(item.state))}</span>
            </header>
            <div class="report-card-body">
              <div class="score-section">
                <div><span class="org-ai-report-score-label">${escape(local('درجة الإتاحة', 'Accessibility score'))}</span>
                  <strong class="org-ai-report-score">${escape(score)}</strong></div>
                <span class="org-ai-report-source">${escape(note)}</span>
              </div>
              <p class="org-ai-report-date mb-3">${escape(local('آخر مراجعة:', 'Last review:'))} ${escape(dateText(review.analyzedAt || branch.updatedAt))}</p>
              <a class="btn btn-outline-wusool" href="./organization-branch-details.html?id=${escape(safeId)}">${escape(local('تفاصيل الفرع', 'Branch details'))}<i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>
            </div>
          </article>`);
        cards.append(card);
      }
    }

    async function refresh() {
      const current = ++generation;
      const branches = await WusoolServices.getBranches({ organizationId: account.id });
      if (current !== generation) return;
      reports = branches
        .filter(branch => String(branch.organizationId) === String(account.id) && !branch.isDeleted
          && branch.aiReview && typeof branch.aiReview === 'object')
        .map(branch => {
          const review = branch.aiReview;
          const confirmed = isConfirmedScore(branch, review);
          return {
            branch,
            review,
            confirmed,
            score: confirmed ? (review.score ?? branch.accessibilityScore) : null,
            state: reportState(branch, review),
          };
        })
        .sort((a, b) => (Date.parse(b.review.analyzedAt || '') || 0) - (Date.parse(a.review.analyzedAt || '') || 0));
      render();
    }
    const clear = () => {
      search.value = '';
      statusFilter.value = 'all';
      scoreFilter.value = 'all';
      render();
    };
    WusoolUI.listen(search, 'input', render);
    WusoolUI.listen(statusFilter, 'change', render);
    WusoolUI.listen(scoreFilter, 'change', render);
    for (const id of ['clearFiltersButton', 'emptyClearButton']) WusoolUI.listen(byId(id), 'click', clear);
    WusoolUI.listen(window, 'wxi:language', render);
    window.WusoolLive?.watch('organization-ai-reports', refresh);
    await refresh();
  });
});
