'use strict';
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    const account = await WusoolServices.getCurrentAccount();
    const [subscriptions, branches, access, catalog] = await Promise.all([
      WusoolServices.listAll('subscriptions'), WusoolServices.list('branches', { organizationId: account.id }),
      WusoolServices.getOrganizationAccess(), WusoolServices.getPlans().catch(() => ({ items: [] })),
    ]);
    const s = access.subscription || subscriptions.items.find(row => WusoolServices.subscriptionState(row) === 'active') || subscriptions.items[0];
    const capacity = WusoolServices.effectiveBranchCapacity(s);
    const usage = branches.total;
    const over = Math.max(0, usage - capacity);
    const local = WusoolServices.mode === 'local';
    const demonstration = Boolean(s?.developmentOnly);
    const grant = s?.origin === 'admin-grant';
    const ar = () => document.documentElement.lang === 'ar';
    const t = (en, arabic) => ar() ? arabic : en;
    const number = value => new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO', { maximumFractionDigits: 3 }).format(value);
    const money = value => new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO', { style: 'currency', currency: 'JOD', minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(value);
    const date = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat(ar() ? 'ar-JO' : 'en-JO', { dateStyle: 'medium' }).format(new Date(value)) : t('Not available', 'غير متاح');
    const text = (id, value) => { const el = document.getElementById(id); if (el) { el.setAttribute('data-no-translate', ''); if (el.textContent !== String(value)) el.textContent = value; } };
    const esc = WusoolUI.escape;
    const stateLabel = row => {
      const state = WusoolServices.subscriptionState(row);
      const labels = { active: ['Active', 'نشط'], inactive: ['Inactive', 'غير نشط'], cancelled: ['Cancelled', 'ملغى'], canceled: ['Cancelled', 'ملغى'], expired: ['Expired', 'منتهي'], paused: ['Paused', 'موقوف مؤقتًا'], scheduled: ['Scheduled', 'مجدول'], superseded: ['Superseded', 'استُبدل باشتراك أحدث'], invalid: ['Invalid configuration', 'إعدادات غير صالحة'], missing: ['No subscription', 'لا يوجد اشتراك'] };
      return labels[state] ? t(...labels[state]) : state;
    };
    const planLabel = value => { const labels = { 'Enterprise': ['Enterprise', 'المؤسسات الكبرى'], 'Multi Branch': ['Multi Branch', 'عدة فروع'], 'Single Branch': ['Single Branch', 'فرع واحد'] }; return labels[value] ? t(...labels[value]) : value; };
    const cycleLabel = value => value === 'annual' ? t('Annual', 'سنوي') : value === 'monthly' ? t('Monthly', 'شهري') : t('Not available', 'غير متاح');
    const preview = document.createElement('p'); preview.id = 'capacityUpgradePreview'; preview.setAttribute('data-no-translate', '');
    document.getElementById('branchUsageMessage').after(preview);
    const paymentHelp = document.createElement('p'); paymentHelp.id = 'subscriptionPaymentHelp'; paymentHelp.className = 'form-text'; paymentHelp.setAttribute('data-no-translate', '');
    document.getElementById('updatePaymentButton').after(paymentHelp);
    const renewal = document.getElementById('autoRenewSwitch');
    let renewalValue = Boolean(s?.autoRenew);
    let renewalBusy = false;
    const paymentUnavailable = local || grant || !s;
    const featureNames = { branches: ['Branch capacity', 'سعة الفروع'], organizationUsers: ['Organization users', 'مستخدمو المؤسسة'], aiAnalysesPerMonth: ['Monthly analysis allowance', 'حصة التحليل الشهرية'], serviceManagement: ['Service management', 'إدارة الخدمات'], bookingManagement: ['Booking management', 'إدارة الحجوزات'], queueManagement: ['Queue management', 'إدارة الدور'], accessibilityEvidence: ['Accessibility evidence', 'أدلة إمكانية الوصول'], reporting: ['Reporting', 'التقارير'], auditHistory: ['Audit history', 'سجل النشاط'] };
    function render() {
      const state = WusoolServices.subscriptionState(s);
      text('organizationName', account.name);
      document.getElementById('organizationName')?.setAttribute('data-user-content', '');
      text('planName', planLabel(s?.planName || s?.plan) || t('No subscription', 'لا يوجد اشتراك'));
      text('subscriptionStatus', stateLabel(s));
      const badge = document.getElementById('subscriptionStatus');
      badge.dataset.status = state;
      text('subscriptionDescription', state === 'active' ? t('Your subscription is active. Branch usage is checked separately below.', 'اشتراكك نشط. تُعرض حالة استخدام سعة الفروع بشكل منفصل أدناه.') : t('This subscription is not currently active. Existing records are preserved.', 'هذا الاشتراك غير نشط حاليًا. السجلات الحالية محفوظة.'));
      text('billingCycle', cycleLabel(s?.billingCycle));
      text('planBranchLimit', t(`${number(capacity)} branches subscribed`, `سعة الاشتراك: ${number(capacity)} فرعًا`));
      text('autoRenewBadge', demonstration || grant ? t('No automatic billing', 'لا توجد فوترة تلقائية') : renewalValue ? t('Automatic renewal: on', 'التجديد التلقائي: مفعّل') : t('Automatic renewal: off', 'التجديد التلقائي: متوقف'));
      text('planPrice', grant ? t('Admin grant — no payment', 'منحة إدارية — دون دفع') : demonstration ? t('Development subscription — no payment collected', 'اشتراك تجريبي — لم يُحصّل أي مبلغ') : Number.isFinite(s?.price) ? money(s.price) : t('Price not available', 'السعر غير متاح'));
      document.getElementById('planPrice').classList.toggle('descriptive-price', grant || demonstration || !Number.isFinite(s?.price));
      text('planPricePeriod', !grant && !demonstration && Number.isFinite(s?.price) ? (s.billingCycle === 'annual' ? t('/year', '/سنة') : t('/month', '/شهر')) : '');
      const paymentDate = !demonstration && !grant && renewalValue && state === 'active' && Number.isFinite(Date.parse(s?.renewalDate)) ? s.renewalDate : null;
      text('nextPaymentDate', paymentDate ? date(paymentDate) : t('No automatic payment is scheduled', 'لا توجد دفعة تلقائية مجدولة'));
      text('daysUntilRenewal', paymentDate ? number(Math.max(0, Math.ceil((new Date(paymentDate) - new Date()) / 86400000))) : '—');
      text('usedBranchesCount', number(usage)); text('remainingBranchesCount', number(Math.max(0, capacity - usage)));
      text('branchUsageText', t(`${number(usage)} used / ${number(capacity)} subscribed${over ? ` — ${number(over)} over capacity` : ''}`, `${number(usage)} فرعًا مستخدمًا / سعة ${number(capacity)}${over ? ` — تجاوز بمقدار ${number(over)} فرعًا` : ''}`));
      text('branchUsageMessage', over ? t('Existing branches remain available under the current rules. New branches cannot be added until a valid capacity upgrade is explicitly confirmed.', 'تبقى الفروع الحالية متاحة وفق القواعد الحالية. لا يمكن إضافة فروع جديدة حتى تأكيد ترقية سعة صالحة صراحةً.') : t('Branch usage is within the subscribed capacity.', 'استخدام الفروع ضمن سعة الاشتراك.'));
      const alert = document.getElementById('branchUsageAlert'); alert.classList.toggle('full', over > 0);
      const progress = document.getElementById('branchUsageProgress');
      const percent = capacity ? Math.min(100, usage / capacity * 100) : 0;
      progress.style.width = percent + '%'; progress.setAttribute('aria-valuenow', String(percent)); progress.setAttribute('aria-valuetext', document.getElementById('branchUsageText').textContent); progress.classList.toggle('full', over > 0);
      preview.hidden = !over;
      if (over) {
        const plan = catalog.items.find(p => p.id === 'enterprise' && p.active !== false);
        try { const q = WusoolServices.quoteSubscription(plan, Math.max(plan.branchLimit, usage)); preview.textContent = t(`Preview for ${number(q.capacity)} branches: ${money(q.monthlyPrice)}/month. Your subscription is unchanged.`, `معاينة لسعة ${number(q.capacity)} فرعًا: ${money(q.monthlyPrice)}/شهر. لم يتغير اشتراكك.`); }
        catch { preview.textContent = t('An upgrade quote is currently unavailable.', 'معاينة سعر الترقية غير متاحة حاليًا.'); }
      }
      text('paymentMethod', s?.paymentMethodLabel || t('No confirmed payment method', 'لا توجد طريقة دفع مؤكدة'));
      text('savedCardName', s?.paymentMethodLabel || t('Hosted payment management', 'إدارة الدفع عبر البوابة المستضافة'));
      text('savedCardExpiry', t('No card details are stored in this frontend.', 'لا تُخزّن بيانات البطاقة في هذه الواجهة.'));
      const paymentButton = document.getElementById('updatePaymentButton'); paymentButton.disabled = paymentUnavailable; paymentButton.setAttribute('aria-describedby', paymentHelp.id);
      paymentHelp.textContent = paymentUnavailable ? t('Payment-method changes require a configured backend. No payment is collected here.', 'يتطلب تغيير طريقة الدفع خادمًا مهيأً. لا تُحصّل أي دفعة هنا.') : t('Continue to the configured hosted payment portal.', 'انتقل إلى بوابة الدفع المستضافة المهيأة.');
      renewal.checked = renewalValue; renewal.disabled = paymentUnavailable || renewalBusy;
      text('renewalAlert', paymentUnavailable ? t(`Automatic renewal is ${renewalValue ? 'on in the record' : 'off'}. Automatic billing is unavailable in this environment.`, `التجديد التلقائي ${renewalValue ? 'مفعّل في السجل' : 'متوقف'}. الفوترة التلقائية غير متاحة في هذه البيئة.`) : renewalValue ? t('Automatic renewal is on according to the subscription record.', 'التجديد التلقائي مفعّل وفق سجل الاشتراك.') : t('Automatic renewal is off.', 'التجديد التلقائي متوقف.'));
      const features = document.getElementById('planFeatures'); features.setAttribute('data-no-translate', '');
      const values = s?.entitlements ? Object.entries(s.entitlements).map(([key, value]) => `${featureNames[key] ? t(...featureNames[key]) : key}: ${typeof value === 'boolean' ? value ? t('Included', 'مشمول') : t('Not included', 'غير مشمول') : number(value)}`) : s?.features || [];
      WusoolUI.html(features, values.map(value => `<li>${esc(value)}</li>`).join('') || `<li>${esc(t('Plan feature details are not available for this subscription.', 'تفاصيل مزايا هذا الاشتراك غير متاحة.'))}</li>`);
      const history = document.getElementById('billingHistoryBody'); history.setAttribute('data-no-translate', '');
      const missing = t('Not available', 'غير متاح');
      WusoolUI.html(history, (s?.billingHistory || []).map(row => {
        let receipt = esc(missing);
        try { const url = new URL(row.receiptUrl); if (url.protocol === 'https:') receipt = `<a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${esc(t('View receipt', 'عرض الإيصال'))}</a>`; } catch {}
        return `<tr><td>${esc(row.reference || missing)}</td><td>${esc(date(row.date))}</td><td>${esc(planLabel(row.planName || row.plan) || missing)}</td><td>${esc(typeof row.amount === 'number' ? money(row.amount) : row.amount || missing)}</td><td>${esc(row.status || missing)}</td><td>${receipt}</td></tr>`;
      }).join(''));
      document.getElementById('emptyBillingState').classList.toggle('d-none', Boolean(s?.billingHistory?.length));
      text('subscriptionHistoryTitle', t('Recorded subscriptions', 'سجل الاشتراكات'));
      text('subscriptionHistoryHelp', t('Read-only subscription records; these are not payment receipts. Historical prices are unchanged.', 'سجلات اشتراك للعرض فقط وليست إيصالات دفع. الأسعار التاريخية محفوظة.'));
      WusoolUI.html(document.getElementById('subscriptionHistoryHead'), `<tr>${[t('Plan', 'الخطة'), t('Capacity', 'السعة'), t('Started', 'تاريخ البدء'), t('Status', 'الحالة'), t('Recorded quote', 'عرض السعر المسجل')].map(v => `<th scope="col">${esc(v)}</th>`).join('')}</tr>`);
      WusoolUI.html(document.getElementById('subscriptionHistoryBody'), subscriptions.items.filter(row => row.organizationId === account.id).map(row => `<tr><td>${esc(planLabel(row.planName || row.plan) || missing)}</td><td>${esc(number(WusoolServices.effectiveBranchCapacity(row)))}</td><td>${esc(date(row.startDate || row.createdAt))}</td><td>${esc(stateLabel(row))}</td><td>${esc(Number.isFinite(row.quotedPrice) ? money(row.quotedPrice) + ' / ' + cycleLabel(row.billingCycle) : missing)}</td></tr>`).join('') || `<tr><td colspan="5">${esc(t('No subscription records are available.', 'لا توجد سجلات اشتراك متاحة.'))}</td></tr>`);
    }
    document.querySelectorAll('#paymentMethodForm input').forEach(el => { el.disabled = true; el.required = false; el.value = ''; });
    const hosted = async event => {
      event.preventDefault(); if (paymentUnavailable) return;
      const result = await WusoolServices.external('payments/customer-portal', { subscriptionId: s?.id });
      const url = new URL(result?.url); if (url.protocol !== 'https:') throw new Error(t('Invalid hosted payment URL.', 'رابط بوابة الدفع غير صالح.'));
      location.assign(url.href);
    };
    WusoolUI.listen(document.getElementById('updatePaymentButton'), 'click', hosted);
    WusoolUI.listen(document.getElementById('paymentMethodForm'), 'submit', hosted);
    WusoolUI.listen(renewal, 'change', async () => {
      if (paymentUnavailable || renewalBusy) { render(); return; }
      const desired = renewal.checked; renewalBusy = true; renewal.disabled = true;
      try { const result = await WusoolServices.external('subscriptions/auto-renew', { subscriptionId: s?.id, enabled: desired }); if (result?.autoRenew !== desired) throw new Error(t('Renewal change was not confirmed.', 'لم يتم تأكيد تغيير التجديد.')); renewalValue = desired; }
      finally { renewalBusy = false; render(); }
    });
    document.addEventListener('wxi:language', render);
    render();
  });
});
