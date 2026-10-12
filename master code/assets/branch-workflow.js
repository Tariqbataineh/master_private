'use strict';
window.WusoolBranchWorkflow = (() => {
  const status = (b) =>
    String(b.status || b.approvalStatus || 'draft')
      .toLowerCase()
      .replace(/ /g, '-');
  const stages = [
    ['details', 'edit-branch.html'],
    ['workingHours', 'branch-working-hours.html'],
    ['accessibility', 'branch-accessibility.html'],
    ['photos', 'branch-photos.html'],
    ['aiReview', 'branch-ai-review.html'],
  ];
  const labels = {
    details: ['بيانات الفرع', 'Branch details'],
    workingHours: ['أوقات العمل', 'Working hours'],
    accessibility: ['معلومات الإتاحة', 'Accessibility information'],
    photos: ['صور الفرع (اختيارية)', 'Branch photos (optional)'],
    aiReview: ['مراجعة التحليل', 'Analysis review'],
  };
  function checks(b = {}) {
    const steps = b.completedSteps || {},
      hours = b.workingHours || {},
      access = b.accessibility || b.accessibilityFeatures || {};
    const photos = Array.isArray(b.photos) ? b.photos : [];
    const requirements = window.WusoolAccessibilityConfig?.getRequirements?.() || [];
    const requiredAccess = requirements.length
      ? requirements.map((x) => x.key || x.id)
      : [
          'accessibleEntrance',
          'entranceRamp',
          'accessibleParking',
          'elevator',
          'accessibleRestroom',
          'widePathways',
          'automaticDoors',
          'tactilePaving',
          'brailleSigns',
          'hearingSupport',
          'wheelchairAvailable',
          'staffAssistance',
        ];
    const answers = Array.isArray(access)
      ? Object.fromEntries(access.map((x) => [x.key, x.status]))
      : access;
    return {
      details:
        !!String(b.name || b.branchName || '').trim() &&
        !!String(b.city || '').trim() &&
        !!String(b.address || '').trim() &&
        !!String(b.phone || b.phoneNumber || '').trim(),
      workingHours:
        steps.workingHours === true &&
        Object.keys(hours).length === 7 &&
        Object.values(hours).every(
          (day) =>
            day &&
            typeof day === 'object' &&
            (day.closed === true ||
              day.isClosed === true ||
              day.isOpen === false ||
              day.enabled === false ||
              day.openTime ||
              day.open ||
              day.from),
        ),
      accessibility:
        steps.accessibility === true &&
        requiredAccess.every((key) => {
          const v = answers[key];
          return ['available', 'not-available', 'not-sure', 'yes', 'no', 'unknown'].includes(
            String(v?.status || v).toLowerCase(),
          );
        }),
      photos: photos.some(p=>p.processingState!=='failed'&&!!(p.imageData||p.url||p.blobId)),
      aiReview:
        steps.aiReview === true &&
        !!b.aiReview &&
        b.aiReview.score != null &&
        Number.isFinite(Number(b.aiReview.score)),
    };
  }
  const missing = (b) => {
    const c = checks(b);
    return stages.filter(([key]) => !['photos','aiReview'].includes(key)&&!c[key]).map(([key]) => key);
  };
  const complete = (b) => missing(b).length === 0;
  const route = (b) =>
    './' +
    (stages.find(([key]) => missing(b).includes(key))?.[1] || 'branch-submit-review.html') +
    '?id=' +
    encodeURIComponent(b.id);
  const ar = () => typeof document !== 'undefined' && document.documentElement.lang === 'ar';
  const explain = (b) =>
    (ar()
      ? 'أكمل الخطوات قبل إرسال الفرع أو نشره: '
      : 'Complete these steps before submitting or publishing: ') +
    missing(b)
      .map((key) => labels[key][ar() ? 0 : 1])
      .join('، ');
  const canPublish = (b) =>
    complete(b) &&
    ['approved', 'published'].includes(status(b)) &&
    !b.isDeleted &&
    b.active !== false &&
    b.isPublished !== false;
  // Legacy public names remain asynchronous aliases, with no independent dataset.
  const sync = (b) => window.WusoolServices.saveBranch(b);
  const putLegacy = sync;
  const publicBranches = async () => (await window.WusoolServices.places()).items;
  const catalog = publicBranches;
  return {
    checks,
    missing,
    complete,
    route,
    explain,
    canPublish,
    putLegacy,
    sync,
    publicBranches,
    catalog,
  };
})();
