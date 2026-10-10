WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const refresh = async () => {
    const a = await WusoolServices.getCurrentAccount();
    if (!a) return;
    if (
      a.approvalStatus !== 'approved' &&
      location.pathname.endsWith('organization-approved.html')
    ) {
      location.href = './registration-pending.html';
      return;
    }
    for (const key of ['organizationName', 'detailsOrganizationName'])
      if (document.getElementById(key)) document.getElementById(key).textContent = a.name;
    if (document.getElementById('organizationEmail'))
      document.getElementById('organizationEmail').textContent = a.email;
    if (document.getElementById('submissionDate'))
      document.getElementById('submissionDate').textContent = a.createdAt;
    if (document.getElementById('requestReference'))
      document.getElementById('requestReference').textContent = a.id;
    WusoolUI.message(
      'Organization application: ' + a.approvalStatus,
      a.approvalStatus === 'approved' ? 'success' : 'info',
    );
    if (a.approvalStatus === 'approved' && location.pathname.endsWith('registration-pending.html'))
      location.href = './organization-approved.html';
    const button = document.getElementById('continueButton');
    if (button) {
      button.disabled = a.approvalStatus !== 'approved';
      button.href = './subscription-plans.html';
      button.setAttribute('aria-disabled', String(a.approvalStatus !== 'approved'));
      if (a.approvalStatus !== 'approved') button.removeAttribute('href');
    }
  };
  await refresh();
  WusoolUI.listen(document.getElementById('checkStatusButton'), 'click', refresh);
  WusoolUI.listen(document.getElementById('copyReferenceButton'), 'click', async () =>
    navigator.clipboard.writeText((await WusoolServices.getCurrentAccount()).id),
  );
});
