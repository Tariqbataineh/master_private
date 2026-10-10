WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    if (WusoolServices.mode !== 'local') {
      await WusoolUI.prepareExternalScreen('payments/checkout');
      return;
    }
    const account = await WusoolServices.getCurrentAccount();
    if (account.approvalStatus !== 'approved') {
      location.href = './registration-pending.html';
      return;
    }
    let plan;
    try {
      plan = JSON.parse((await WusoolServices.rawRead('wusoolSelectedPlan')) || 'null');
    } catch {}
    if (!plan) {
      location.href = './subscription-plans.html';
      return;
    }
    const ar = document.documentElement.lang === 'ar',
      t = (a, e) => (ar ? a : e);
    const description = document.querySelector('.hero-description');
    if (description)
      description.textContent = t(
        'راجع الباقة وفعّل اشتراكًا تجريبيًا بدون دفع.',
        'Review your plan and activate a development subscription without payment.',
      );
    const form = document.getElementById('checkoutForm');
    WusoolUI.html(
      form,
      `<h2>${t('إكمال الاشتراك التجريبي', 'Complete development subscription')}</h2><p>${t('تابع دورة المؤسسة بدون دفع فعلي. لن يتم خصم أي مبلغ، ولا تحتاج بيانات بطاقة.', 'Continue the organization cycle without a real payment. No money is charged and no card details are needed.')}</p><div class="alert alert-info">${WusoolUI.escape(account.name)} · ${WusoolUI.escape(plan.name)}<br>${t('هذا اشتراك تجريبي محلي فقط.', 'This is a local development subscription only.')}</div><label class="d-flex gap-2 my-4"><input id="demoTerms" type="checkbox" required> ${t('أوافق على تفعيل الاشتراك التجريبي', 'I agree to activate a development subscription')}</label><button type="submit" class="btn btn-wusool w-100">${t('تفعيل تجريبي ومتابعة', 'Activate demo and continue')}</button>`,
    );
    for (const [id, value] of Object.entries({
      planName: plan.name,
      branchLimit: plan.branchLimit,
      billingCycle: plan.billingCycle,
      planPrice: plan.totalPrice + ' JOD',
      totalPrice: '0 JOD — development',
    })) {
      const n = document.getElementById(id);
      if (n) n.textContent = String(value);
    }
    WusoolUI.listen(form, 'submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity() || !document.getElementById('demoTerms').checked) return;
      await WusoolServices.activateDevelopmentSubscription();
      location.href = './payment-success.html?development=1';
    });
  });
});
