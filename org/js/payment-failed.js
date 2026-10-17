'use strict';
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    if (WusoolServices.mode !== 'local') { await WusoolUI.prepareExternalScreen('payments/status'); return; }
    const account = await WusoolServices.getCurrentAccount();
    let selected;
    try { selected = JSON.parse((await WusoolServices.rawRead('wusoolSelectedPlan')) || 'null'); } catch {}
    const ar = () => document.documentElement.lang === 'ar';
    const t = (en, arabic) => ar() ? arabic : en;
    const copy = (el, value) => { if (el) { el.setAttribute('data-no-translate', ''); el.textContent = value; } };
    function render() {
      copy(document.querySelector('title'), t('Payment unavailable | Wusool', 'الدفع غير متاح | وصول'));
      copy(document.querySelector('main h1'), t('Real payment is unavailable', 'الدفع الفعلي غير متاح'));
      copy(document.querySelector('.failed-description'), t('This local environment has no configured payment provider. No payment attempt or charge is confirmed by this page.', 'لا تتصل هذه البيئة المحلية بمزود دفع مهيأ. لا تؤكد هذه الصفحة محاولة دفع أو خصم أي مبلغ.'));
      copy(document.querySelector('.secure-payment'), t('Local development', 'تطوير محلي'));
      copy(document.querySelector('.failure-message h2'), t('Backend integration required', 'يلزم ربط خدمات الخادم'));
      copy(document.getElementById('failureReason'), t('Review the development activation flow instead. Your current subscription is unchanged.', 'راجع مسار التفعيل التجريبي بدلًا من ذلك. لم يتغير اشتراكك الحالي.'));
      copy(document.querySelector('.details-title'), t('Development environment', 'بيئة تطوير محلية'));
      copy(document.querySelector('.failed-badge'), t('No payment confirmed', 'لا يوجد دفع مؤكد'));
      const values = { organizationName: account.name, planName: selected?.name || t('No selected plan', 'لا توجد خطة محددة'), paymentAmount: t('No payment collected', 'لم يُحصّل أي مبلغ'), billingCycle: t('Not applicable', 'لا ينطبق'), attemptReference: t('Not available', 'غير متاح'), attemptDate: t('Not available', 'غير متاح'), paymentMethod: t('No payment provider configured', 'لم تتم تهيئة مزود دفع') };
      for (const [id, value] of Object.entries(values)) copy(document.getElementById(id), value);
      copy(document.querySelector('.recommendations h2'), t('Available next steps', 'الخطوات المتاحة'));
      const list = document.querySelector('.recommendations ul'); list.setAttribute('data-no-translate', '');
      WusoolUI.html(list, [t('Review the selected plan and capacity.', 'راجع الخطة والسعة المحددتين.'), t('Development activation requires explicit confirmation and collects no money.', 'يتطلب التفعيل التجريبي تأكيدًا صريحًا ولا يُحصّل أي مبلغ.'), t('Real payments require a configured backend and hosted payment provider.', 'يتطلب الدفع الفعلي خادمًا مهيأً ومزود دفع مستضافًا.')].map(value => `<li>${WusoolUI.escape(value)}</li>`).join(''));
      copy(document.getElementById('retryPaymentButton'), t('Review development activation', 'مراجعة التفعيل التجريبي'));
    }
    document.addEventListener('wxi:language', render); render();
  });
});
