'use strict';
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const account = await WusoolServices.getCurrentAccount();
  if (!account || account.approvalStatus !== 'approved') {
    location.replace('./registration-pending.html');
    return;
  }
  WusoolUI.ready(async () => {
    const change = new URLSearchParams(location.search).get('mode') === 'change';
    if (!change) {
      const progress = document.querySelector('.registration-progress');
      progress.tabIndex = 0;
      progress.setAttribute('role', 'region');
    }
    const ar = () => document.documentElement.lang === 'ar';
    const t = (en, arabic) => ar() ? arabic : en;
    const number = value => new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO', { maximumFractionDigits: 3 }).format(value);
    const money = value => new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO', { style: 'currency', currency: 'JOD', minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(value);
    const branches = value => ar() ? value === 2 ? 'فرعان' : `${number(value)} ${value === 1 ? 'فرع' : value === 0 || value >= 3 && value <= 10 ? 'فروع' : 'فرعًا'}` : `${number(value)} ${value === 1 ? 'branch' : 'branches'}`;
    const copy = (el, value) => { if (!el) return; el.setAttribute('data-no-translate', ''); if (el.textContent !== value) el.textContent = value; };
    const cards = [...document.querySelectorAll('.plan-card')];
    cards.forEach(card => { card.querySelector('.select-plan-button').disabled = true; card.setAttribute('aria-busy', 'true'); copy(card.querySelector('.price-value'), '—'); });
    const loading = document.createElement('p');
    loading.setAttribute('role', 'status');
    document.getElementById('plansContainer').before(loading);
    const loadingCopy = () => copy(loading, t('Loading current plans and branch usage…', 'جارٍ تحميل الخطط الحالية واستخدام الفروع…'));
    loadingCopy();
    document.addEventListener('wxi:language', loadingCopy);
    let catalog, usageResult;
    try { [catalog, usageResult] = await Promise.all([WusoolServices.getPlans(), WusoolServices.list('branches', { organizationId: account.id })]); }
    catch {
      document.removeEventListener('wxi:language', loadingCopy);
      const showError = () => copy(loading, t('Current plans or branch usage could not be loaded. Reload to try again; your subscription is unchanged.', 'تعذر تحميل الخطط الحالية أو استخدام الفروع. أعد التحميل للمحاولة؛ لم يتغير اشتراكك.'));
      loading.className = 'capacity-error'; loading.setAttribute('role', 'alert');
      cards.forEach(card => card.removeAttribute('aria-busy'));
      document.addEventListener('wxi:language', showError); showError(); return;
    }
    document.removeEventListener('wxi:language', loadingCopy);
    loading.remove();
    let usage = usageResult.total;
    const cycle = () => document.querySelector('input[name="billingCycle"]:checked')?.value || 'monthly';
    const models = cards.map(card => {
      const plan = catalog.items.find(p => p.id === card.dataset.planId && p.active !== false);
      const button = card.querySelector('.select-plan-button');
      if (!plan) { card.removeAttribute('aria-busy'); return { card, button }; }
      card.dataset.monthlyPrice = plan.monthlyPrice;
      card.dataset.branchLimit = plan.branchLimit;
      card.dataset.planName = plan.name;
      card.dataset.annualDiscount = plan.annualDiscount;
      // One owned target; whitespace nodes are never replaced with labels.
      const allowance = card.querySelector('.branch-limit');
      const allowanceText = document.createElement('strong');
      allowanceText.dataset.includedCapacity = '';
      allowance.replaceChildren(allowance.querySelector('i') || document.createElement('span'), allowanceText);
      const feedback = document.createElement('p');
      feedback.className = 'capacity-error'; feedback.id = `capacityError-${plan.id}`;
      feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite'); feedback.setAttribute('data-no-translate', '');
      const model = { card, plan, button, allowanceText, feedback };
      if (plan.id === 'enterprise') {
        const field = document.createElement('div'); field.className = 'enterprise-capacity';
        const label = document.createElement('label'); label.htmlFor = 'enterpriseCapacity'; label.className = 'form-label';
        const input = document.createElement('input'); input.id = 'enterpriseCapacity'; input.type = 'number'; input.required = true;
        input.min = String(Math.max(plan.branchLimit, usage)); input.step = '1'; input.value = input.min;
        input.className = 'form-control'; input.dataset.enterpriseCapacity = '';
        input.setAttribute('aria-describedby', 'enterpriseCapacityHelp capacityError-enterprise');
        const help = document.createElement('p'); help.id = 'enterpriseCapacityHelp'; help.className = 'form-text';
        const preview = document.createElement('dl'); preview.dataset.capacityPreview = ''; preview.className = 'capacity-breakdown'; preview.setAttribute('data-no-translate', '');
        const announcement = document.createElement('p'); announcement.className = 'visually-hidden'; announcement.setAttribute('aria-live', 'polite'); announcement.setAttribute('data-no-translate', '');
        field.append(label, input, help, feedback, preview, announcement); button.before(field);
        Object.assign(model, { input, label, help, preview, announcement });
        input.addEventListener('input', () => render(model, true));
      } else button.before(feedback);
      // Preserve catalogue content; only the default included-capacity feature is UI copy.
      const capacityFeature = [...card.querySelectorAll('.plan-features li')].find(li => /fifteen|خمسة عشر/.test(li.textContent));
      if (capacityFeature) {
        const featureText = document.createElement('span');
        const icon = capacityFeature.querySelector('i');
        capacityFeature.replaceChildren(...(icon ? [icon, featureText] : [featureText]));
        model.capacityFeature = featureText;
      }
      if (plan.description) copy(card.querySelector('.plan-description'), plan.description);
      if (Array.isArray(plan.features)) WusoolUI.html(card.querySelector('.plan-features'), plan.features.map(f => `<li>${WusoolUI.escape(f)}</li>`).join(''));
      card.removeAttribute('aria-busy');
      return model;
    });
    function validate(model) {
      if (!model.plan) return { error: t('This plan is unavailable.', 'هذه الخطة غير متاحة.') };
      const minimum = Math.max(model.plan.branchLimit, usage);
      const value = model.input ? Number(model.input.value) : model.plan.branchLimit;
      if (!model.input && value < usage) return {
        quote: WusoolServices.quoteSubscription(model.plan, value, cycle()),
        error: t(`This plan supports ${branches(value)}; your current usage is ${branches(usage)}. Choose a higher capacity.`, `تدعم هذه الخطة ${branches(value)}؛ استخدامك الحالي ${branches(usage)}. اختر سعة أعلى.`),
      };
      if (model.input) model.input.setCustomValidity('');
      if ((model.input && (!model.input.value.trim() || !model.input.validity.valid)) || !Number.isSafeInteger(value) || value < minimum) {
        return { error: t(`Enter a whole-number capacity of at least ${number(minimum)} branches.`, `أدخل سعة صحيحة لا تقل عن ${branches(minimum)}.`) };
      }
      try { return { quote: WusoolServices.quoteSubscription(model.plan, value, cycle()) }; }
      catch { return { error: t('A reliable quote is unavailable. Review the capacity or try again later.', 'تعذر حساب سعر موثوق. راجع السعة أو حاول لاحقًا.') }; }
    }
    function render(model, announce = false) {
      const { plan, card, button } = model;
      if (!plan) return;
      const { quote, error } = validate(model);
      button.disabled = Boolean(error);
      copy(model.feedback, error || '');
      copy(model.allowanceText, `${t('Included capacity:', 'السعة المشمولة:')} ${branches(plan.branchLimit)}`);
      if (model.capacityFeature?.isConnected) copy(model.capacityFeature, t(`${branches(plan.branchLimit)} included; additional capacity available.`, `${branches(plan.branchLimit)} مشمولة، مع سعة إضافية قابلة للاختيار.`));
      const defaultName = { single: ['Single Branch', 'فرع واحد'], multi: ['Multi Branch', 'عدة فروع'], enterprise: ['Enterprise', 'المؤسسات الكبرى'] }[plan.id];
      copy(card.querySelector('h2'), defaultName && plan.name === defaultName[0] ? t(...defaultName) : plan.name);
      copy(button, change ? t('Continue with this capacity', 'متابعة بهذه السعة') : t('Select plan', 'اختيار الخطة'));
      if (model.input) {
        model.input.setAttribute('aria-invalid', String(Boolean(error)));
        model.input.setCustomValidity(error || '');
        copy(model.label, t('Total branch capacity', 'السعة الإجمالية للفروع'));
        copy(model.help, t(`Current usage: ${branches(usage)}. Minimum: ${branches(Math.max(plan.branchLimit, usage))}.`, `الاستخدام الحالي: ${branches(usage)}. الحد الأدنى: ${branches(Math.max(plan.branchLimit, usage))}.`));
      }
      copy(card.querySelector('.currency'), ar() ? 'دينار أردني' : 'JOD');
      copy(card.querySelector('.price-period'), cycle() === 'annual' ? t('/month equivalent with annual billing', '/شهر كمكافئ للفوترة السنوية') : t('/month', '/شهر'));
      if (!quote) { copy(card.querySelector('.price-value'), '—'); model.preview?.replaceChildren(); if(model.announcement) copy(model.announcement, ''); card.querySelector('.annual-total').classList.add('d-none'); return; }
      copy(card.querySelector('.price-value'), number(cycle() === 'annual' ? quote.totalPrice / 12 : quote.monthlyPrice));
      const annual = card.querySelector('.annual-total');
      const annualValue = annual.querySelector('.annual-total-value');
      annual.setAttribute('data-no-translate', '');
      if (annualValue) { annualValue.textContent = money(quote.totalPrice); annual.replaceChildren(document.createTextNode(t('Billed annually: ', 'الفوترة السنوية: ')), annualValue); }
      annual.classList.toggle('d-none', cycle() !== 'annual');
      if (model.preview) {
        let annualQuote;
        try { annualQuote = WusoolServices.quoteSubscription(plan, quote.capacity, 'annual'); } catch {}
        const entries = [[t('Included branches', 'الفروع المشمولة'), branches(quote.includedCapacity)], [t('Additional branches', 'الفروع الإضافية'), branches(quote.extraBranches)], [t('Price per additional branch / month', 'سعر الفرع الإضافي / شهر'), money(quote.unitPrice)], [t('Base monthly price', 'السعر الشهري الأساسي'), money(quote.basePrice)], [t('Additional monthly cost', 'التكلفة الشهرية الإضافية'), money((Math.round(quote.monthlyPrice * 1000) - Math.round(quote.basePrice * 1000)) / 1000)], [t('Monthly total', 'الإجمالي الشهري'), money(quote.monthlyPrice)], [t('Annual total', 'الإجمالي السنوي'), annualQuote ? money(annualQuote.totalPrice) : t('Not available for this capacity', 'غير متاح لهذه السعة')]];
        WusoolUI.html(model.preview, entries.map(([label, value]) => `<div><dt>${WusoolUI.escape(label)}</dt><dd>${WusoolUI.escape(value)}</dd></div>`).join(''));
        if (announce || model.announcement.textContent) copy(model.announcement, `${t('Monthly total:', 'الإجمالي الشهري:')} ${money(quote.monthlyPrice)}`);
      }
    }
    function renderAll() {
      models.forEach(model => render(model));
      const discounts = [...new Set(catalog.items.filter(p => p.active !== false).map(p => p.annualDiscount))];
      const badge = document.querySelector('.discount-badge');
      if (badge) { badge.hidden = discounts.length === 1 && discounts[0] === 0; copy(badge, discounts.length === 1 ? t(`Save ${number(discounts[0] * 100)}%`, `وفّر ${number(discounts[0] * 100)}٪`) : t('Discount varies by plan', 'يختلف الخصم حسب الخطة')); }
      if (change) {
        copy(document.querySelector('.plans-hero h1'), t('Change subscription capacity', 'تغيير سعة الاشتراك'));
        copy(document.querySelector('.hero-description'), t('Review your usage and a current quote. Your subscription changes only after explicit confirmation.', 'راجع استخدامك والسعر الحالي. لا يتغير اشتراكك إلا بعد تأكيد صريح.'));
        document.querySelector('.registration-progress').hidden = true;
        const back = document.querySelector('.plans-header a[href*="organization-approved"], .plans-header a[href*="subscription-management"]');
        if (back) { back.href = './subscription-management.html'; copy(back, t('Back to subscription', 'الرجوع إلى الاشتراك')); }
      }
      if (WusoolServices.mode === 'local') {
        const info = document.querySelector('.information-item:has(.bi-shield-lock), .information-item:has(.bi-shield-check)');
        if (info) { copy(info.querySelector('h2'), t('Development activation', 'تفعيل تجريبي')); copy(info.querySelector('p'), t('No payment is collected in this local environment.', 'لا تُحصّل أي دفعة في هذه البيئة المحلية.')); }
      }
    }
    const saved = await WusoolServices.rawRead('wusoolBillingCycle');
    document.getElementById(saved === 'annual' ? 'annualBilling' : 'monthlyBilling').checked = true;
    for (const input of document.querySelectorAll('input[name="billingCycle"]')) WusoolUI.listen(input, 'change', async () => { renderAll(); await WusoolServices.rawWrite('wusoolBillingCycle', cycle()); });
    document.addEventListener('wxi:language', renderAll);
    models.forEach(model => WusoolUI.listen(model.button, 'click', async () => {
      usage = (await WusoolServices.list('branches', { organizationId: account.id })).total;
      if (model.input) model.input.min = String(Math.max(model.plan.branchLimit, usage));
      const { quote, error } = validate(model);
      if (error) { render(model); model.input?.focus(); return; }
      const selected = { id: model.plan.id, name: model.plan.name, billingCycle: cycle(), monthlyPrice: quote.monthlyPrice, monthlyEquivalent: cycle() === 'annual' ? quote.totalPrice / 12 : quote.monthlyPrice, totalPrice: quote.totalPrice, branchLimit: quote.capacity, discount: cycle() === 'annual' ? model.plan.annualDiscount * 100 : 0, currency: 'JOD', pricingSnapshot: quote, selectedAt: new Date().toISOString() };
      await WusoolServices.rawWrite('wusoolSelectedPlan', JSON.stringify(selected));
      await WusoolServices.rawWrite('wusoolRegistrationStep', 'checkout');
      location.href = './subscription-checkout.html' + (change ? '?mode=change' : '');
    }));
    renderAll();
  });
});
