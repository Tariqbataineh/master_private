'use strict';
window.WusoolTicketPlaceDetails = {
  render(place, ar = false) {
    const t = (a, e) => (ar ? a : e),
      esc = window.WusoolUI.escape;
    if (!place)
      return `<p class="text-secondary">${t('اختر مكانًا لتظهر التفاصيل هنا.', 'Select a place to see its details here.')}</p>`;
    const label = {
      ramp: t('منحدر وصول', 'Access ramp'),
      parking: t('مواقف مهيأة', 'Accessible parking'),
      restroom: t('دورة مياه مهيأة', 'Accessible restroom'),
      'wide-path': t('ممرات واسعة', 'Wide paths'),
      assistance: t('مساعدة الموظفين', 'Staff assistance'),
      elevator: t('مصعد', 'Elevator'),
      hearing: t('دعم سمعي', 'Hearing support'),
    };
    const facilityLabels = {
      accessibleEntrance: t('مدخل مهيأ', 'Accessible entrance'),
      entranceRamp: t('منحدر الدخول', 'Entrance ramp'),
      widePathways: t('ممرات واسعة', 'Wide pathways'),
      elevator: t('مصعد', 'Elevator'),
      accessibleParking: t('مواقف مهيأة', 'Accessible parking'),
      accessibleRestroom: t('دورة مياه مهيأة', 'Accessible restroom'),
      staffAssistance: t('مساعدة الموظفين', 'Staff assistance'),
      hearingSupport: t('دعم سمعي', 'Hearing support'),
      automaticDoors: t('أبواب آلية', 'Automatic doors'),
      tactilePaving: t('مسارات أرضية ملموسة', 'Tactile paving'),
      brailleSigns: t('لوحات برايل', 'Braille signs'),
      wheelchairAvailable: t('كرسي متحرك متاح', 'Wheelchair available'),
      simpleInstructions: t('تعليمات مبسطة', 'Simple instructions'),
      restAreas: t('أماكن استراحة', 'Rest areas'),
    };
    const features = Array.isArray(place.features) ? place.features : [];
    const services = Array.isArray(place.services) ? place.services : place.destinations || [];
    const hours = Array.isArray(place.workingHours)
      ? place.workingHours.map((x) => [x.day || x.name, x])
      : Object.entries(place.workingHours || {});
    const days = {
      sunday: 'الأحد',
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت',
    };
    const photoUrl = (value) => {
      if (typeof value !== 'string') return null;
      if (/^data:image\/(png|jpeg|webp);base64,/i.test(value)) return value;
      try {
        const url = new URL(value, location.href);
        return ['http:', 'https:', 'blob:'].includes(url.protocol) ? url.href : null;
      } catch {
        return null;
      }
    };
    const photos = (place.photos || [])
      .map((x) => photoUrl(typeof x === 'string' ? x : x.url || x.imageData))
      .filter(Boolean)
      .slice(0, 4);
    const score = place.accessibilityScore ?? place.score;
    let fit = [];
    try {
      fit = window.WusoolServices.visits?.fit(place) || [];
    } catch {}
    const fitHtml = fit.length
      ? `<h4>${t('مدى توافق المكان مع احتياجاتك', 'Fit for your saved accessibility needs')}</h4><ul>${fit.map((x) => `<li>${esc(facilityLabels[x.key] || x.key)}: ${esc(x.status === 'available' ? t('متوفر', 'Available') : x.status === 'unavailable' ? t('غير متوفر — تحقق قبل الحجز', 'Unavailable · check before booking') : t('غير معروف — تواصل مع المؤسسة', 'Unknown · contact the organization'))}</li>`).join('')}</ul>`
      : '';
    const alerts = Object.entries(place.operationalAvailability || {})
      .filter(([, v]) => v.available === false)
      .map(([key, v]) => `${facilityLabels[key] || key}: ${v.reason}`);
    const alertHtml = alerts.length
      ? `<p class="alert alert-warning">${esc(alerts.join(' · '))}</p>`
      : '';
    return `<article class="ticket-place-preview"><h3>${esc(place.name || place.branchName)}</h3><p>${esc([place.address, place.city].filter(Boolean).join(' · ')) || t('العنوان غير مسجل', 'Address not provided')}</p><div class="d-flex gap-3 flex-wrap"><strong>${t('تقييم الزوار', 'Visitor rating')}: ${place.reviewCount > 0 && Number.isFinite(place.rating) ? esc(place.rating.toFixed(1)) + '/5 (' + esc(place.reviewCount) + ')' : t('لا توجد تقييمات بعد', 'No reviews yet')}</strong><strong>${t('سكور الوصول', 'Accessibility score')}: ${Number.isFinite(score) ? esc(score) + '/100' + (place.scoreSource === 'demo' ? ' — ' + t('تجريبي', 'Demo') : '') : t('لم يُقيّم بعد', 'Not scored yet')}</strong></div><h4>${t('التسهيلات المتوفرة', 'Available accessibility facilities')}</h4><p>${features.length ? features.map((x) => esc(label[x] || x)).join(' · ') : t('لم تُسجل تسهيلات متوفرة.', 'No available facilities recorded.')}</p>${fitHtml}${alertHtml}<h4>${t('الخدمات', 'Services')}</h4><p>${services.length ? services.map((x) => esc(typeof x === 'string' ? x : x.name)).join(' · ') : t('الخدمات غير مسجلة.', 'Services not provided.')}</p><h4>${t('أوقات العمل', 'Working hours')}</h4>${hours.length ? `<ul>${hours.map(([day, h]) => `<li>${esc(ar ? days[String(day).toLowerCase()] || day : day)}: ${h.isClosed || h.closed || h.isOpen === false ? t('مغلق', 'Closed') : esc(h.openTime || h.open || '—') + ' – ' + esc(h.closeTime || h.close || '—')}</li>`).join('')}</ul>` : `<p>${t('أوقات العمل غير مسجلة.', 'Working hours not provided.')}</p>`}${photos.length ? `<div class="ticket-place-photos">${photos.map((url) => `<img src="${esc(url)}" alt="${esc(t('صورة المكان', 'Place photo'))}" loading="lazy">`).join('')}</div>` : `<p>${t('لا توجد صور للمكان بعد.', 'No place photos yet.')}</p>`}</article>`;
  },
};
