'use strict';
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    if (WusoolServices.mode !== 'local') {
      // Remote checkout capacity transport remains a documented backend blocker.
      await WusoolUI.prepareExternalScreen('payments/checkout');
      return;
    }
    const account = await WusoolServices.getCurrentAccount();
    if (account.approvalStatus !== 'approved') { location.href = './registration-pending.html'; return; }
    let plan;
    try { plan = JSON.parse((await WusoolServices.rawRead('wusoolSelectedPlan')) || 'null'); } catch {}
    if (!plan) { location.href = './subscription-plans.html'; return; }
    const change = new URLSearchParams(location.search).get('mode') === 'change';
    const ar = () => document.documentElement.lang === 'ar';
    const t = (en, arabic) => ar() ? arabic : en;
    const money = value => new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO', { style: 'currency', currency: 'JOD', minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(value);
    const copy = (el, value) => { if (el) { el.setAttribute('data-no-translate', ''); if (el.textContent !== value) el.textContent = value; } };
    const source = (await WusoolServices.getPlans()).items.find(p => p.id === plan.id && p.active !== false);
    if (!source) throw new Error(t('Selected plan is no longer available.', 'الخطة المحددة لم تعد متاحة.'));
    const quote = WusoolServices.quoteSubscription(source, plan.branchLimit, plan.billingCycle);
    plan = { ...plan, totalPrice: quote.totalPrice, monthlyPrice: quote.monthlyPrice, pricingSnapshot: quote };
    await WusoolServices.rawWrite('wusoolSelectedPlan', JSON.stringify(plan));
    const usage = (await WusoolServices.list('branches', { organizationId: account.id })).total;
    const form = document.getElementById('checkoutForm');
    WusoolUI.html(form, `<h2 id="demoCheckoutTitle" data-no-translate></h2><p id="demoCheckoutHelp" data-no-translate></p><div class="alert alert-info" id="demoCheckoutNotice" data-no-translate></div><label class="d-flex gap-2 my-4"><input id="demoTerms" type="checkbox" required aria-describedby="demoCheckoutHelp"><span id="demoConsentText" data-no-translate></span></label><p id="demoCheckoutError" role="alert" data-no-translate></p><button type="submit" id="demoActivationButton" class="btn btn-wusool w-100" data-no-translate></button>`);
    const submit = document.getElementById('demoActivationButton');
    const planLabel = () => { const names = { 'Enterprise': ['Enterprise', 'المؤسسات الكبرى'], 'Multi Branch': ['Multi Branch', 'عدة فروع'], 'Single Branch': ['Single Branch', 'فرع واحد'] }; return names[plan.name] ? t(...names[plan.name]) : plan.name; };
    let busy = false;
    let errorCode = '';
    function render() {
      copy(document.querySelector('title'), t('Development subscription confirmation | Wusool', 'تأكيد الاشتراك التجريبي | وصول'));
      copy(document.querySelector('main h1'), change ? t('Confirm development capacity change', 'تأكيد تغيير السعة التجريبي') : t('Development subscription activation', 'تفعيل اشتراك تجريبي'));
      copy(document.querySelector('.hero-description'), t('Review the quote before explicit development activation. No real payment is collected.', 'راجع عرض السعر قبل التفعيل التجريبي الصريح. لا يُحصّل أي دفع فعلي.'));
      copy(document.querySelector('.secure-checkout'), t('Development activation — no real payment', 'تفعيل تجريبي — دون دفع فعلي'));
      copy(document.getElementById('demoCheckoutTitle'), t('Confirm development activation', 'تأكيد التفعيل التجريبي'));
      copy(document.getElementById('demoCheckoutHelp'), t('This local demonstration changes subscription capacity only after your confirmation. No card, invoice, automatic charge or email delivery is involved.', 'يغيّر هذا العرض المحلي سعة الاشتراك بعد تأكيدك فقط. لا يتضمن بطاقة أو فاتورة أو خصمًا تلقائيًا أو إرسال بريد.'));
      copy(document.getElementById('demoCheckoutNotice'), account.name + ' · ' + planLabel());
      copy(document.getElementById('demoConsentText'), t('I agree to activate this development subscription without payment.', 'أوافق على تفعيل هذا الاشتراك التجريبي دون دفع.'));
      const blocked = quote.capacity < usage;
      submit.disabled = busy || blocked; submit.setAttribute('aria-busy', String(busy));
      copy(submit, busy ? t('Activating development subscription…', 'جارٍ تفعيل الاشتراك التجريبي…') : t('Activate demo and continue', 'تفعيل تجريبي ومتابعة'));
      const errors = { PRICE_CHANGED: ['Pricing changed. Reload and review the quote before confirming.', 'تغيّر السعر. أعد تحميل الصفحة وراجع عرض السعر قبل التأكيد.'], ADMIN_GRANT_REQUIRED: ['Contact Admin to change an audited grant. The current grant is preserved.', 'تواصل مع الأدمن لتغيير المنحة الإدارية. المنحة الحالية محفوظة.'], CAPACITY_BELOW_USAGE: ['Capacity must cover current branch usage.', 'يجب أن تغطي السعة استخدام الفروع الحالي.'] };
      copy(document.getElementById('demoCheckoutError'), blocked ? t(...errors.CAPACITY_BELOW_USAGE) : errorCode ? errors[errorCode] ? t(...errors[errorCode]) : t('Activation was not confirmed. Review the subscription and try again.', 'لم يتم تأكيد التفعيل. راجع الاشتراك وحاول مجددًا.') : '');
      for (const [id, value] of Object.entries({ planName: planLabel(), branchLimit: new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO').format(quote.capacity), billingCycle: plan.billingCycle === 'annual' ? t('Annual', 'سنوي') : t('Monthly', 'شهري'), billingCycleText: plan.billingCycle === 'annual' ? t('Annual quote', 'عرض سعر سنوي') : t('Monthly quote', 'عرض سعر شهري'), planPrice: money(quote.totalPrice), totalPrice: money(0), renewalText: t('No automatic payment is scheduled', 'لا توجد دفعة تلقائية مجدولة'), planBadge: t('Development', 'تجريبي') })) copy(document.getElementById(id), value);
      copy(document.querySelector('.total-row > div > span'), t('Amount collected in development', 'المبلغ المُحصّل في الوضع التجريبي'));
      const discount = document.getElementById('discountRow'); discount.classList.toggle('d-none', plan.billingCycle !== 'annual' || !source.annualDiscount);
      copy(document.getElementById('discountAmount'), new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO', { style: 'percent' }).format(source.annualDiscount));
      const notes = [...document.querySelectorAll('.summary-information p')];
      [t('Activation requires explicit confirmation.', 'يتطلب التفعيل تأكيدًا صريحًا.'), t('Capacity checks count existing non-deleted branches.', 'يحتسب فحص السعة الفروع الحالية غير المحذوفة.'), t('This quote is not a payment receipt.', 'عرض السعر هذا ليس إيصال دفع.')].forEach((value, i) => copy(notes[i], value));
      if (change) document.querySelector('.registration-progress').hidden = true;
      document.querySelectorAll('a[href="./subscription-plans.html"]').forEach(link => { link.href = './subscription-plans.html' + (change ? '?mode=change' : ''); });
      if (change) { const back = document.querySelector('.checkout-hero a[href*="subscription-plans"], .checkout-hero a[href*="subscription-management"]'); if (back) { back.href = './subscription-management.html'; copy(back, t('Back to subscription', 'الرجوع إلى الاشتراك')); } }
    }
    WusoolUI.listen(form, 'submit', async event => {
      event.preventDefault();
      if (busy || quote.capacity < usage || !form.reportValidity() || !document.getElementById('demoTerms').checked) return;
      busy = true; errorCode = ''; render();
      try { await WusoolServices.activateDevelopmentSubscription(); location.href = './payment-success.html?development=1'; }
      catch (error) { busy = false; errorCode = error.code || 'UNCONFIRMED'; render(); }
    });
    document.addEventListener('wxi:language', render);
    render();
  });
});
