'use strict';
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    if (document.getElementById('hoursApprovalCenter')) return;
    const account = await WusoolServices.getCurrentAccount();
    if (!['Admin', 'Organization'].includes(account?.role)) return;
    const admin = account.role === 'Admin',
      ar = document.documentElement.lang === 'ar',
      t = (a, e) => (ar ? a : e),
      esc = WusoolUI.escape;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const labels = [
      t('الأحد', 'Sunday'),
      t('الاثنين', 'Monday'),
      t('الثلاثاء', 'Tuesday'),
      t('الأربعاء', 'Wednesday'),
      t('الخميس', 'Thursday'),
      t('الجمعة', 'Friday'),
      t('السبت', 'Saturday'),
    ];
    const statuses = {
      pending: t('بانتظار موافقة الأدمن', 'Pending approval'),
      approved: t('معتمد', 'Approved'),
      rejected: t('مرفوض', 'Rejected'),
      superseded: t('استبدله تعديل الأدمن', 'Superseded by Admin'),
    };
    const center = document.createElement('section');
    center.id = 'hoursApprovalCenter';
    center.className = 'hours-center';
    const main = document.querySelector('main');
    main.appendChild(center);
    WusoolUI.html(
      center,
      `<div class="hours-heading"><div><span class="hours-eyebrow">${t('مواعيد معتمدة · توقيت الأردن', 'Approved schedules · Jordan time')}</span><h2>${t('إدارة ومراجعة أوقات الدوام', 'Working hours & change approvals')}</h2><p>${t('التعديلات تبقى معلقة حتى موافقة الأدمن؛ الحجوزات تستخدم الدوام المعتمد. دوام الفرع الخاص يتقدم على دوام المؤسسة الافتراضي.', 'Changes stay pending until Admin approval; bookings use approved hours. Explicit branch hours override organization defaults.')}</p></div><span data-hours-pending class="hours-pill" aria-live="polite"></span></div><div class="hours-toolbar"><label>${t('المؤسسة أو الفرع', 'Organization or branch')}<select class="form-select" data-hours-resource></select></label><button class="btn btn-wusool" type="button" data-hours-edit>${admin ? t('تعديل الدوام مباشرة', 'Edit approved hours') : t('طلب تعديل الدوام', 'Request hours change')}</button></div><div data-hours-current class="hours-current"></div><div data-hours-feedback role="status" aria-live="polite"></div><div class="hours-request-heading"><h3>${t('طلبات تعديل الدوام', 'Hours change requests')}</h3><label>${t('الحالة', 'Status')}<select class="form-select" data-hours-filter><option value="pending">${statuses.pending}</option><option value="">${t('كل الطلبات', 'All requests')}</option>${['approved', 'rejected', 'superseded'].map((s) => `<option value="${s}">${statuses[s]}</option>`).join('')}</select></label></div><div class="table-responsive"><table class="table align-middle"><thead><tr><th>${t('المكان', 'Place')}</th><th>${t('التغييرات', 'Changes')}</th><th>${t('وقت الطلب', 'Requested')}</th><th>${t('الحالة', 'Status')}</th><th>${t('الإجراء', 'Action')}</th></tr></thead><tbody data-hours-requests></tbody></table></div>`,
    );
    const selector = center.querySelector('[data-hours-resource]'),
      filter = center.querySelector('[data-hours-filter]');
    let resources = [],
      requests = [],
      current = null;
    const textHours = (hours) =>
      hours?.isOpen
        ? t(`${hours.openTime} – ${hours.closeTime}`, `${hours.openTime} – ${hours.closeTime}`)
        : t('مغلق', 'Closed');
    function changes(request) {
      const count = days.filter(
        (day) =>
          JSON.stringify(request.before.workingHours[day]) !==
          JSON.stringify(request.proposed.workingHours[day]),
      ).length;
      const special =
        JSON.stringify(request.before.specialHours) !==
          JSON.stringify(request.proposed.specialHours) ||
        JSON.stringify(request.before.closedDates) !== JSON.stringify(request.proposed.closedDates);
      return t(
        `${count} أيام${special ? ' + استثناءات وعطل' : ''}`,
        `${count} days${special ? ' + exceptions/closures' : ''}`,
      );
    }
    const formatDate = (value) =>
      new Intl.DateTimeFormat(ar ? 'ar-JO' : 'en-GB', {
        timeZone: 'Asia/Amman',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value));
    const resourceValue = (r) => r.kind + ':' + r.id;
    async function showCurrent() {
      const target = resources.find((r) => resourceValue(r) === selector.value);
      if (!target) {
        current = null;
        return;
      }
      const view = await WusoolServices.getSchedule(target.kind, target.id);
      if (selector.value !== resourceValue(target)) return;
      current = view;
      WusoolUI.html(
        center.querySelector('[data-hours-current]'),
        `<div class="hours-week">${days.map((day, i) => `<div><strong>${labels[i]}</strong><span>${esc(view.hasSchedule ? textHours(view.schedule.workingHours[day]) : t('لم يحدد بعد', 'Not set'))}</span></div>`).join('')}</div>${view.pending ? `<p class="hours-pending-note">${t('يوجد تعديل معلق. الدوام أعلاه هو المعتمد حاليًا.', 'A change is pending. The hours above remain the approved schedule.')}</p>` : ''}`,
      );
      center.querySelector('[data-hours-edit]').disabled = !admin && Boolean(view.pending);
    }
    async function refresh() {
      const selection = selector.value;
      const organizations = admin
        ? await WusoolServices.getOrganizations()
        : [await WusoolServices.getCurrentAccount()];
      const branches = await WusoolServices.getBranches();
      resources = [
        ...organizations
          .filter((o) => !o.isDeleted)
          .map((o) => ({ kind: 'organizations', id: o.id, name: o.name || o.organizationName })),
        ...branches
          .filter((b) => !b.isDeleted && (admin || b.organizationId === account.id))
          .map((b) => ({ kind: 'branches', id: b.id, name: b.name || b.branchName })),
      ];
      WusoolUI.html(
        selector,
        resources
          .map(
            (r) =>
              `<option value="${esc(resourceValue(r))}">${esc(r.name)} — ${r.kind === 'branches' ? t('فرع', 'Branch') : t('مؤسسة · الدوام الافتراضي', 'Organization · default hours')}</option>`,
          )
          .join(''),
      );
      if (resources.some((r) => resourceValue(r) === selection)) selector.value = selection;
      requests = (await WusoolServices.getHoursChangeRequests()).items;
      center.querySelector('[data-hours-pending]').textContent = t(
        `${requests.filter((r) => r.status === 'pending').length} طلب معلق`,
        `${requests.filter((r) => r.status === 'pending').length} pending`,
      );
      const rows = requests.filter((r) => !filter.value || r.status === filter.value);
      WusoolUI.html(
        center.querySelector('[data-hours-requests]'),
        rows.length
          ? rows
              .map(
                (r) =>
                  `<tr><td><strong>${esc(r.resourceName)}</strong><div class="small">${r.resourceKind === 'branches' ? t('فرع', 'Branch') : t('مؤسسة', 'Organization')}</div></td><td>${esc(changes(r))}</td><td>${esc(formatDate(r.createdAt))}</td><td><span class="hours-pill hours-${esc(r.status)}">${esc(statuses[r.status] || r.status)}</span></td><td><button class="btn btn-sm btn-outline-primary" type="button" data-hours-review="${esc(r.id)}">${admin && r.status === 'pending' ? t('مقارنة ومراجعة', 'Compare & review') : t('عرض التغييرات', 'View changes')}</button></td></tr>`,
              )
              .join('')
          : `<tr><td colspan="5" class="text-center py-4">${t('لا توجد طلبات بهذه الحالة.', 'No requests in this state.')}</td></tr>`,
      );
      await showCurrent();
    }
    function dialog(title, body, triggerOverride) {
      const trigger = triggerOverride || document.activeElement,
        node = document.createElement('dialog');
      node.className = 'hours-dialog';
      node.setAttribute('aria-labelledby', 'hoursDialogTitle');
      WusoolUI.html(
        node,
        `<form><div class="hours-dialog-heading"><h2 id="hoursDialogTitle">${esc(title)}</h2><button class="btn btn-outline-secondary" type="button" data-hours-close aria-label="${t('إغلاق', 'Close')}">×</button></div>${body}<p data-hours-dialog-error class="text-danger" role="alert" hidden></p></form>`,
      );
      document.body.appendChild(node);
      WusoolUI.listen(node.querySelector('[data-hours-close]'), 'click', () => node.close());
      node.addEventListener(
        'close',
        () => {
          node.remove();
          trigger?.focus();
        },
        { once: true },
      );
      node.showModal();
      node.querySelector('input,textarea,button')?.focus();
      return node;
    }
    function specialsText(schedule) {
      return (
        [
          ...schedule.specialHours.map(
            (x) =>
              x.date +
              ': ' +
              (x.status === 'closed' ? t('مغلق', 'Closed') : x.openTime + ' – ' + x.closeTime) +
              (x.note ? ' · ' + x.note : ''),
          ),
          ...schedule.closedDates.map((date) => date + ': ' + t('عطلة', 'Holiday')),
        ].join('\n') || t('لا توجد استثناءات', 'No exceptions')
      );
    }
    async function review(id, trigger) {
      const request = (await WusoolServices.getHoursChangeRequests()).items.find(
        (r) => r.id === id,
      );
      if (!request) throw new Error(t('الطلب لم يعد موجودًا', 'The request no longer exists.'));
      const editable = admin && request.status === 'pending';
      const node = dialog(
        t('مراجعة دوام: ', 'Hours review: ') + request.resourceName,
        `<p>${esc(statuses[request.status])} · ${esc(formatDate(request.createdAt))}</p><div class="table-responsive"><table class="table"><thead><tr><th>${t('اليوم', 'Day')}</th><th>${t('قبل التعديل', 'Before')}</th><th>${t('بعد التعديل المقترح', 'Proposed')}</th></tr></thead><tbody>${days.map((day, i) => `<tr class="${JSON.stringify(request.before.workingHours[day]) !== JSON.stringify(request.proposed.workingHours[day]) ? 'hours-changed' : ''}"><th>${labels[i]}</th><td>${esc(textHours(request.before.workingHours[day]))}</td><td>${esc(textHours(request.proposed.workingHours[day]))}${JSON.stringify(request.before.workingHours[day]) !== JSON.stringify(request.proposed.workingHours[day]) ? ` <strong>${t('تغيير', 'Changed')}</strong>` : ''}</td></tr>`).join('')}</tbody></table></div><div class="hours-diff"><div><h3>${t('الاستثناءات السابقة', 'Previous exceptions')}</h3><p>${esc(specialsText(request.before))}</p></div><div><h3>${t('الاستثناءات المقترحة', 'Proposed exceptions')}</h3><p>${esc(specialsText(request.proposed))}</p></div></div>${request.reason ? `<p>${t('سبب الطلب: ', 'Request reason: ')}${esc(request.reason)}</p>` : ''}${editable ? `<p class="hours-pending-note">${t('الموافقة تطبق التعديل فورًا. أي حجز متأثر يبقى محفوظًا ويصل تنبيه للمعنيين لمراجعة موعده.', 'Approval applies the schedule immediately. Conflicting bookings are retained and participants are notified to review their appointment.')}</p><label class="d-block">${t('ملاحظة القرار · مطلوبة عند الرفض', 'Decision note · required for rejection')}<textarea class="form-control" name="reason" maxlength="500"></textarea></label><div class="hours-dialog-actions"><button class="btn btn-outline-danger" type="submit" data-decision="rejected">${t('رفض مع السبب', 'Reject with reason')}</button><button class="btn btn-wusool" type="submit" data-decision="approved">${t('موافقة وتطبيق التعديل', 'Approve & apply')}</button></div>` : `<p>${esc(request.reviewReason || request.reason || '')}</p>`}`,
        trigger,
      );
      if (editable)
        WusoolUI.listen(node.querySelector('form'), 'submit', async (event) => {
          event.preventDefault();
          try {
            await WusoolServices.reviewHoursChangeRequest(
              request.id,
              event.submitter?.dataset.decision || 'approved',
              node.querySelector('[name=reason]').value,
              request.revision,
            );
            node.close();
            await refresh();
          } catch (error) {
            const output = node.querySelector('[data-hours-dialog-error]');
            output.hidden = false;
            output.textContent = error.message;
          }
        });
      else WusoolUI.listen(node.querySelector('form'), 'submit', (event) => event.preventDefault());
    }
    async function edit(kind, id, trigger) {
      const view = await WusoolServices.getSchedule(kind, id);
      if (view.pending && !admin) {
        await review(view.pending.id, trigger);
        return;
      }
      const schedule = view.hasSchedule
        ? view.schedule
        : {
            workingHours: Object.fromEntries(
              days.map((day, i) => [
                day,
                { isOpen: i < 5, openTime: i < 5 ? '09:00' : '', closeTime: i < 5 ? '17:00' : '' },
              ]),
            ),
            specialHours: [],
            closedDates: [],
          };
      const node = dialog(
        t('تعديل دوام: ', 'Edit working hours: ') + view.name,
        `<p>${admin ? t('تعديل الأدمن يُعتمد مباشرة ويرسل إشعارًا للمؤسسة.', 'Admin edits apply immediately and notify the organization.') : t('تعديل الدوام المعتمد يحتاج موافقة الأدمن. إعداد الفرع الأولي يدخل ضمن مراجعة الفرع الكاملة.', 'Changes to approved hours require Admin approval. Initial draft setup is included in full branch review.')}</p><div class="hours-editor-week">${days.map((day, i) => `<div data-hour-day="${day}"><label><input type="checkbox" data-open ${schedule.workingHours[day].isOpen ? 'checked' : ''}> ${labels[i]}</label><label>${t('من', 'Opens')}<input class="form-control" type="time" data-start value="${esc(schedule.workingHours[day].openTime)}" ${schedule.workingHours[day].isOpen ? 'required' : 'disabled'}></label><label>${t('إلى', 'Closes')}<input class="form-control" type="time" data-end value="${esc(schedule.workingHours[day].closeTime)}" ${schedule.workingHours[day].isOpen ? 'required' : 'disabled'}></label><label>${t('بداية الاستراحة (اختياري)','Break starts (optional)')}<input type="time" class="form-control" data-break-from value="${esc(schedule.workingHours[day].periods?.[0]?.closeTime && schedule.workingHours[day].periods?.length>1?schedule.workingHours[day].periods[0].closeTime:'')}"></label><label>${t('نهاية الاستراحة','Break ends')}<input type="time" class="form-control" data-break-to value="${esc(schedule.workingHours[day].periods?.[1]?.openTime||'')}"></label></div>`).join('')}</div><h3>${t('عطل وأوقات استثنائية', 'Holidays & special hours')}</h3><div data-special-list></div><button type="button" class="btn btn-outline-primary mb-3" data-special-add>${t('إضافة يوم استثنائي', 'Add special date')}</button><label class="d-block">${t('سبب التعديل (اختياري)', 'Reason for change (optional)')}<textarea class="form-control" name="reason" maxlength="500"></textarea></label><div class="hours-dialog-actions"><button class="btn btn-wusool" type="submit">${admin ? t('تأكيد وتطبيق الدوام', 'Confirm & apply hours') : t('إرسال التعديل للمراجعة', 'Submit change for review')}</button></div>`,
        trigger,
      );
      function specialRow(
        value = { date: '', status: 'closed', openTime: '09:00', closeTime: '17:00', note: '' },
      ) {
        const row = document.createElement('div');
        row.className = 'hours-special-row';
        row.dataset.special = '';
        WusoolUI.html(
          row,
          `<label>${t('التاريخ', 'Date')}<input class="form-control" type="date" data-date required value="${esc(value.date)}"></label><label>${t('الحالة', 'State')}<select class="form-select" data-special-state><option value="closed">${t('مغلق', 'Closed')}</option><option value="custom">${t('دوام مخصص', 'Custom hours')}</option></select></label><label>${t('من', 'Opens')}<input class="form-control" type="time" data-start value="${esc(value.openTime || '09:00')}"></label><label>${t('إلى', 'Closes')}<input class="form-control" type="time" data-end value="${esc(value.closeTime || '17:00')}"></label><label>${t('ملاحظة', 'Note')}<input class="form-control" data-note maxlength="300" value="${esc(value.note || '')}"></label><button type="button" class="btn btn-outline-danger" data-remove>${t('إزالة', 'Remove')}</button>`,
        );
        const status = row.querySelector('[data-special-state]');
        status.value = value.status;
        const toggle = () =>
          row.querySelectorAll('[type=time]').forEach((input) => {
            input.disabled = status.value === 'closed';
            input.required = !input.disabled&&!input.hasAttribute('data-break-from')&&!input.hasAttribute('data-break-to');
          });
        toggle();
        WusoolUI.listen(status, 'change', toggle);
        WusoolUI.listen(row.querySelector('[data-remove]'), 'click', () => row.remove());
        node.querySelector('[data-special-list]').appendChild(row);
      }
      for (const value of [
        ...schedule.specialHours,
        ...schedule.closedDates
          .filter((date) => !schedule.specialHours.some((x) => x.date === date))
          .map((date) => ({ date, status: 'closed' })),
      ])
        specialRow(value);
      WusoolUI.listen(node.querySelector('[data-special-add]'), 'click', () => specialRow());
      for (const row of node.querySelectorAll('[data-hour-day]'))
        WusoolUI.listen(row.querySelector('[data-open]'), 'change', () =>
          row.querySelectorAll('[type=time]').forEach((input) => {
            input.disabled = !row.querySelector('[data-open]').checked;
            input.required = !input.disabled&&!input.hasAttribute('data-break-from')&&!input.hasAttribute('data-break-to');
            if (!input.value&&!input.hasAttribute('data-break-from')&&!input.hasAttribute('data-break-to')) input.value = input.hasAttribute('data-start') ? '09:00' : '17:00';
          }),
        );
      WusoolUI.listen(node.querySelector('form'), 'submit', async (event) => {
        event.preventDefault();
        try {
          const workingHours = Object.fromEntries(
            [...node.querySelectorAll('[data-hour-day]')].map((row) => [
              row.dataset.hourDay,
              {
                isOpen: row.querySelector('[data-open]').checked,
                openTime: row.querySelector('[data-start]').value,
                closeTime: row.querySelector('[data-end]').value,
                ...(()=>{const from=row.querySelector('[data-break-from]').value,to=row.querySelector('[data-break-to]').value,old=schedule.workingHours[row.dataset.hourDay];
                  if(old.periods?.length>2&&from===old.periods[0].closeTime&&to===old.periods[1].openTime&&row.querySelector('[data-start]').value===old.openTime&&row.querySelector('[data-end]').value===old.closeTime)return {periods:old.periods};
                  if(!from&&!to)return {};if(!from||!to||from>=to)throw Error(t('حدد بداية ونهاية استراحة صحيحة.','Specify a valid break start and end.'));
                  return {periods:[{openTime:row.querySelector('[data-start]').value,closeTime:from},{openTime:to,closeTime:row.querySelector('[data-end]').value}]};})(),
              },
            ]),
          );
          const specialHours = [...node.querySelectorAll('[data-special]')].map((row) => ({
            date: row.querySelector('[data-date]').value,
            status: row.querySelector('[data-special-state]').value,
            openTime: row.querySelector('[data-start]').value,
            closeTime: row.querySelector('[data-end]').value,
            note: row.querySelector('[data-note]').value,
          }));
          const outcome = await WusoolServices.saveHours(
            kind,
            id,
            { workingHours, specialHours, closedDates: [] },
            {
              expectedHoursRevision: view.hoursRevision,
              reason: node.querySelector('[name=reason]').value,
            },
          );
          center.querySelector('[data-hours-feedback]').textContent =
            outcome.status === 'pending'
              ? t(
                  'تم إرسال التعديل. الدوام السابق مستمر حتى الموافقة.',
                  'Change submitted. Previous approved hours remain active until approval.',
                )
              : t('تم حفظ الدوام وتحديثه بنجاح.', 'Working hours saved successfully.');
          node.close();
          await refresh();
        } catch (error) {
          const output = node.querySelector('[data-hours-dialog-error]');
          output.hidden = false;
          output.textContent = error.message;
        }
      });
    }
    WusoolUI.listen(selector, 'change', showCurrent);
    WusoolUI.listen(filter, 'change', refresh);
    WusoolUI.listen(center.querySelector('[data-hours-edit]'), 'click', (event) => {
      const r = resources.find((r) => resourceValue(r) === selector.value);
      if (r) return edit(r.kind, r.id, event.currentTarget);
    });
    WusoolUI.listen(center, 'click', (event) => {
      const button = event.target.closest('[data-hours-review]');
      if (button) return review(button.dataset.hoursReview, button);
    });
    const editFromRow = async (event) => {
      const button = event.target.closest('[data-edit-hours-id]');
      if (!button || button.disabled) return;
      button.disabled = true;
      try {
        await edit(button.dataset.hoursKind, button.dataset.editHoursId, button);
      } catch (error) {
        WusoolUI.error(error);
      } finally {
        button.disabled = false;
      }
    };
    document.addEventListener('click', editFromRow);
    const stop = window.WusoolLive?.watch('hours-approval', refresh);
    window.addEventListener(
      'pagehide',
      () => {
        stop?.();
        document.removeEventListener('click', editFromRow);
      },
      { once: true },
    );
    await refresh();
  });
});
