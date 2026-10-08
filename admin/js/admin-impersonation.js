WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.message('Account impersonation requires an audited backend session. Local preview does not change your role or session.', 'info');
  const users = await WusoolServices.getUsers(),
    organizations = await WusoolServices.getOrganizations();
  const root = document.querySelector('main') || document.body;
  const list = document.createElement('div');
  list.className = 'row g-3';
  for (const account of [...users, ...organizations]) {
    const button = document.createElement('button');
    button.className = 'btn btn-outline-wusool';
    button.textContent = 'Request audited access: ' + account.name;
    WusoolUI.listen(button, 'click', async () => {
      await WusoolServices.external('admin/impersonation', {
        accountId: account.id
      });
    });
    list.append(button);
  }
  root.append(list);
});
