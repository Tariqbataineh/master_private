WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    if (WusoolServices.mode !== 'local') {
      await WusoolUI.prepareExternalScreen('payments/status');
      return;
    }
    const subscriptions = await WusoolServices.getSubscriptions();
    const sub = subscriptions.find((x) => x.developmentOnly && x.status === 'Active' && x.planId);
    if (!sub) {
      location.href = './subscription-plans.html';
      return;
    }
    const ar = document.documentElement.lang === 'ar';
    const heading = document.querySelector('main h1');
    if (heading)
      heading.textContent = ar
        ? 'تم تفعيل الاشتراك التجريبي'
        : 'Development subscription activated';
    document
      .querySelectorAll('.success-description')
      .forEach(
        (n) =>
          (n.textContent = ar
            ? 'لم يتم دفع أو خصم أي مبلغ. يمكنك متابعة لوحة المؤسسة وإضافة الفروع.'
            : 'No payment was made or charged. Continue to your dashboard and add branches.'),
      );
    const values = {
      transactionId: 'DEVELOPMENT — NO PAYMENT',
      paymentDate: sub.startDate,
      paymentMethod: 'Local simulation',
      paymentAmount: '0 JOD charged',
      planName: sub.planName,
      renewalDate: 'No automatic charge',
    };
    for (const [id, value] of Object.entries(values)) {
      const n = document.getElementById(id);
      if (n) n.textContent = value;
    }
    const receipt = document.getElementById('printReceiptButton');
    if (receipt) {
      receipt.disabled = true;
      receipt.textContent = ar ? 'لا توجد فاتورة دفع' : 'No payment receipt';
    }
    const dashboard = document.getElementById('dashboardButton');
    if (dashboard) dashboard.href = './organization-dashboard.html';
    WusoolUI.message(
      ar
        ? 'اشتراك تجريبي محلي — لا يوجد دفع فعلي.'
        : 'Local development subscription — no real payment.',
      'info',
    );
  });
});
