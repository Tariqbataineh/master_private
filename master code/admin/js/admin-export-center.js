'use strict';

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const getters = {
    organizations: async () => await WusoolDataService.getOrganizations(),
    branches: async () => await WusoolDataService.getBranches(),
    users: async () => await WusoolDataService.getUsers(),
    tickets: async () => await WusoolDataService.getTickets(),
    reviews: async () => await WusoolDataService.getReviews(),
    subscriptions: async () => await WusoolDataService.getSubscriptions(),
  };
  const backup = document.createElement('button');
  backup.type = 'button'; backup.className = 'btn btn-outline-primary';
  backup.textContent = document.documentElement.lang === 'ar' ? 'تصدير نسخة بيانات الأعمال (دون كلمات المرور)' : 'Export business data backup (no passwords)';
  document.getElementById('exportButton').after(backup);
  WusoolUI.listen(backup, 'click', async () => {
    const snapshot = await WusoolServices.visits.exportData();
    if (snapshot.role !== 'Admin' || !snapshot.data) throw Error('Administrator business export is unavailable.');
    document.getElementById('businessBackupLink')?.remove();
    const link = document.createElement('a'); link.id = 'businessBackupLink';

link.textContent = document.documentElement.lang === 'ar'
  ? 'تنزيل نسخة بيانات الأعمال الجاهزة'
  : 'Download prepared business backup';
    link.download = 'wusool-business-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    link.href = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], {type:'application/json'}));
    link.className = 'btn btn-success'; backup.after(link);
  });
  const toCsv = (rows) => {
    if (!rows.length) {
      return '';
    }
    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    const escape = (value) => {
      const text = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
      return `"${text.replace(/"/g, '""')}"`;
    };
    return [
      headers.map(escape).join(','),
      ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
    ].join('\n');
  };
  WusoolUI.listen(document.getElementById('exportButton'), 'click', async () => {
    const entity = document.getElementById('exportEntity').value;
    const format = document.getElementById('exportFormat').value;
    const rows = await getters[entity]();
    if (format === 'json') {
      WusoolAdmin.downloadText(`${entity}.json`, JSON.stringify(rows, null, 2), 'application/json');
    } else {
      WusoolAdmin.downloadText(`${entity}.csv`, toCsv(rows), 'text/csv');
    }
  });
});
