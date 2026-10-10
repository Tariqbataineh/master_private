'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    const a = await WusoolServices.getCurrentAccount(),
      [subscriptions, branches] = await Promise.all([
        WusoolServices.list('subscriptions'),
        WusoolServices.list('branches', {
          organizationId: a.id,
        }),
      ]);
    const s =
      subscriptions.items.find((s) => s.status.toLowerCase() === 'active') ||
      subscriptions.items[0];
    const text = (id, v) => {
      const n = document.getElementById(id);
      if (n) n.textContent = v;
    };
    text('organizationName', a.name);
    text('planName', s?.planName || s?.plan || 'No subscription');
    text('billingCycle', s?.billingCycle || 'Not configured');
    text('planBranchLimit', s?.branchLimit ? `${s.branchLimit} branches` : 'Not configured');
    text(
      'planPrice',
      s?.developmentOnly
        ? 'Development fixture — no payment'
        : s?.price == null
          ? 'Not configured'
          : s.price + ' JOD',
    );
    text('planPricePeriod', '');
    text('nextPaymentDate', s?.renewalDate || 'Not configured');
    text(
      'daysUntilRenewal',
      s?.renewalDate
        ? Math.max(0, Math.ceil((new Date(s.renewalDate) - new Date()) / 86400000))
        : '—',
    );
    text('usedBranchesCount', branches.total);
    text(
      'remainingBranchesCount',
      s?.branchLimit ? Math.max(0, s.branchLimit - branches.total) : '—',
    );
    text('branchUsageText', branches.total + (s?.branchLimit ? ' of ' + s.branchLimit : ''));
    text('paymentMethod', s?.paymentMethodLabel || 'No confirmed payment method');
    text('savedCardName', s?.paymentMethodLabel || 'Use hosted payment management');
    text('savedCardExpiry', 'No card details are stored in this frontend.');
    const progress = document.getElementById('branchUsageProgress');
    if (progress) {
      const percent = s?.branchLimit ? Math.min(100, (branches.total / s.branchLimit) * 100) : 0;
      progress.style.width = percent + '%';
      progress.setAttribute('aria-valuenow', String(percent));
    }
    text(
      'branchUsageMessage',
      s?.developmentOnly
        ? 'Explicit local development fixture. No money was processed.'
        : 'Limits and billing are supplied by the backend.',
    );
    const features = document.getElementById('planFeatures');
    if (features)
      WusoolUI.html(
        features,
        (s?.features || []).map((v) => `<li>${WusoolUI.escape(v)}</li>`).join('') ||
          '<li>No configured plan features.</li>',
      );
    const history = document.getElementById('billingHistoryBody');
    if (history)
      WusoolUI.html(
        history,
        (s?.billingHistory || [])
          .map(
            (x) =>
              `<tr><td>${WusoolUI.escape(x.reference)}</td><td>${WusoolUI.escape(x.date)}</td><td>${WusoolUI.escape(x.amount)}</td><td>${WusoolUI.escape(x.status)}</td></tr>`,
          )
          .join(''),
      );
    document
      .getElementById('emptyBillingState')
      ?.classList.toggle('d-none', Boolean(s?.billingHistory?.length));
    document.querySelectorAll('#paymentMethodForm input').forEach((x) => {
      x.disabled = true;
      x.required = false;
      x.value = '';
    });
    const hosted = async (e) => {
      e.preventDefault();
      const result = await WusoolServices.external('payments/customer-portal', {
        subscriptionId: s?.id,
      });
      if (!result?.url) throw new Error('The backend did not return a hosted payment URL.');
      const url = new URL(result.url);
      if (url.protocol !== 'https:') throw new Error('Invalid hosted payment URL.');
      location.assign(url.href);
    };
    WusoolUI.listen(document.getElementById('updatePaymentButton'), 'click', hosted);
    WusoolUI.listen(document.getElementById('paymentMethodForm'), 'submit', hosted);
    const renewal = document.getElementById('autoRenewSwitch');
    if (renewal) {
      renewal.checked = Boolean(s?.autoRenew);
      WusoolUI.listen(renewal, 'change', async () => {
        const desired = renewal.checked;
        try {
          const result = await WusoolServices.external('subscriptions/auto-renew', {
            subscriptionId: s?.id,
            enabled: desired,
          });
          if (result?.autoRenew !== desired) throw new Error('Renewal change was not confirmed.');
        } catch (error) {
          renewal.checked = Boolean(s?.autoRenew);
          throw error;
        }
      });
    }
  });
});
