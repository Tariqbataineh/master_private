'use strict';
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    if (WusoolServices.mode !== 'local') { await WusoolUI.prepareExternalScreen('payments/status'); return; }
    const subscriptions = await WusoolServices.getSubscriptions();
    const sub = subscriptions.find(row => row.developmentOnly && row.status === 'Active' && row.planId);
    if (!sub) { location.href = './subscription-plans.html'; return; }
    const account = await WusoolServices.getCurrentAccount();
    const ar = () => document.documentElement.lang === 'ar';
    const t = (en, arabic) => ar() ? arabic : en;
    const copy = (el, value) => { if (el) { el.setAttribute('data-no-translate', ''); if (el.textContent !== value) el.textContent = value; } };
    function render() {
      copy(document.querySelector('title'), t('Development Subscription | Wusool', 'الاشتراك التجريبي | وصول'));

      copy(document.querySelector('main h1'), t('Development subscription activated', 'تم تفعيل الاشتراك التجريبي'));
      copy(document.querySelector('.success-card > header .section-label'), t('DEVELOPMENT STATUS', 'حالة التفعيل التجريبي'));
      document.querySelectorAll('.success-description').forEach(el => copy(el, t('No payment was made or charged. Access remains subject to your confirmed subscription capacity.', 'لم يتم دفع أو خصم أي مبلغ. يبقى الوصول خاضعًا لسعة اشتراكك المؤكدة.')));
      copy(document.querySelector('.details-title'), t('Development activation summary', 'ملخص التفعيل التجريبي'));
      copy(document.querySelector('.subscription-status'), t('Development — active', 'تجريبي — نشط'));
      const date = Number.isFinite(Date.parse(sub.startDate)) ? new Intl.DateTimeFormat(ar() ? 'ar-JO' : 'en-JO', { dateStyle: 'medium' }).format(new Date(sub.startDate)) : t('Not available', 'غير متاح');
      const values = { transactionId: t('Not applicable — no payment', 'لا ينطبق — لا يوجد دفع'), paymentDate: date, paymentMethod: t('Local development activation', 'تفعيل تجريبي محلي'), paymentAmount: t('No payment collected', 'لم يُحصّل أي مبلغ'), planName: sub.planName || sub.plan, organizationName: account.name, branchLimit: new Intl.NumberFormat(ar() ? 'ar-JO' : 'en-JO').format(WusoolServices.effectiveBranchCapacity(sub)), billingCycle: sub.billingCycle === 'annual' ? t('Annual quote', 'عرض سعر سنوي') : t('Monthly quote', 'عرض سعر شهري'), renewalDate: t('No automatic payment is scheduled', 'لا توجد دفعة تلقائية مجدولة') };
      for (const [id, value] of Object.entries(values)) copy(document.getElementById(id), value);
      for (const [id, label] of [['transactionId', t('Payment reference', 'مرجع الدفع')], ['paymentDate', t('Activation date', 'تاريخ التفعيل')], ['paymentMethod', t('Activation method', 'طريقة التفعيل')]]) copy(document.getElementById(id)?.previousElementSibling, label);
      const receipt = document.getElementById('printReceiptButton'); receipt.disabled = true; copy(receipt, t('No payment receipt', 'لا يوجد إيصال دفع'));
      const notice = document.querySelector('.email-notice');
      const email = document.getElementById('billingEmail');
      if (notice && email) { email.hidden = true; email.textContent = ''; notice.setAttribute('data-no-translate', ''); notice.replaceChildren(document.createTextNode(t('No payment confirmation email was sent.', 'لم يتم إرسال بريد لتأكيد الدفع.')), email); }
      const dashboard = document.getElementById('dashboardButton'); if (dashboard) dashboard.href = './organization-dashboard.html';
    }
    document.addEventListener('wxi:language', render);
    render();
  });
});
