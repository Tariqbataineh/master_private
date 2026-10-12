'use strict';
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    const account = await WusoolServices.getCurrentAccount(),
      admin = account.role === 'Admin',
      organization = account.role === 'Organization';
    const ar = document.documentElement.lang === 'ar',
      t = (a, e) => (ar ? a : e),
      esc = WusoolUI.escape;
    const panel = document.createElement('section');
    panel.className = 'booking-workspace mb-4';
    panel.id = 'bookingTicketsPanel';
    const statusLabels = {
      pending: t('بانتظار الموافقة', 'Pending approval'),
      confirmed: t('مؤكد', 'Confirmed'),
      'in-progress': t('قيد التنفيذ', 'In progress'),
      completed: t('مكتمل', 'Completed'),
      cancelled: t('ملغي', 'Cancelled'),
      waitlisted: t('قائمة الانتظار', 'Waitlist'),
    };
    WusoolUI.html(
      panel,
      `<h2 class="h3 fw-bold mb-3">${t(organization ? 'حجوزات الزوار' : admin ? 'إدارة الحجوزات' : 'تذاكري', organization ? 'Visitor Bookings' : admin ? 'Visit Bookings' : 'My Tickets')}</h2><div data-booking-stats class="row g-3 mb-4" aria-live="polite"></div><div data-journey-stats class="row g-3 mb-4" aria-live="polite"></div><article class="booking-table-card"><div class="booking-toolbar"><div class="booking-filters"><input aria-label="${t('بحث في الحجوزات', 'Search bookings')}" class="form-control" data-search type="search" placeholder="${t('ابحث بالاسم أو المرجع أو الفرع…', 'Search bookings…')}"><div class="d-flex gap-2 flex-wrap"><select aria-label="${t('الحالة', 'Status')}" class="form-select" data-status><option value="">${t('كل الحالات', 'All statuses')}</option>${Object.entries(
        statusLabels,
      )
        .map(([v, label]) => `<option value="${v}">${label}</option>`)
        .join(
          '',
        )}</select><select aria-label="${t('الفرع', 'Branch')}" class="form-select" data-branch><option value="">${t('كل الفروع', 'All branches')}</option></select></div></div>${!organization ? `<button class="btn btn-wusool d-inline-flex align-items-center gap-2" data-new><i class="bi bi-plus-lg" aria-hidden="true"></i>${t('إنشاء تيكت', 'Add Ticket')}</button>` : ''}</div><p class="booking-capacity text-secondary small">${t('الحد لكل فرع: ٥ حجوزات مع شخص مساعد خلال الساعة. الحجوزات بدون مساعد لا تدخل بهذا الحد.', 'Each branch accepts 5 assisted bookings per clock hour. Bookings without assistance are not subject to this limit.')}</p><div class="d-flex justify-content-between flex-wrap gap-2 mb-3"><span data-count class="text-secondary small"></span><span data-jordan-clock class="text-secondary small" aria-live="off"></span></div><div data-error role="alert" class="alert alert-danger" hidden></div><div class="table-responsive"><table class="table align-middle"><thead><tr><th>${t('المرجع', 'Reference')}</th><th>${t('الفرع', 'Branch')}</th><th>${t('المستخدم', 'User')}</th><th>${t('الموعد', 'Date/time')}</th><th>${t('مساعد', 'Assistant')}</th><th>${t('الحالة', 'Status')}</th><th>${t('الإجراءات', 'Actions')}</th></tr></thead><tbody data-rows></tbody></table></div></article>`,
    );
    const host = document.querySelector('[data-booking-host]');
    if (host) host.appendChild(panel);
    else document.querySelector('main').appendChild(panel);
    if (organization || admin) {
      const servicesButton = document.createElement('button'); servicesButton.type = 'button';
      servicesButton.className = 'btn btn-outline-primary'; servicesButton.textContent = t('إدارة خدمات الفروع', 'Manage branch services');
      servicesButton.onclick = () => WusoolTicketServicesUI.manage(servicesButton); panel.querySelector('.booking-toolbar').append(servicesButton);
    }
    let bookings = [],
      branches = [],
      users = [],
      placeDetails = [];
    const showError = (e) => {
      const n = panel.querySelector('[data-error]');
      n.hidden = false;
      n.textContent = e.message;
    };
    const labels = {
      pending: t('بانتظار الموافقة', 'Pending approval'),
      confirmed: t('مؤكد', 'Confirmed'),
      'in-progress': t('قيد التنفيذ', 'In progress'),
      completed: t('مكتمل', 'Completed'),
      cancelled: t('ملغي', 'Cancelled'),
      waitlisted: t('قائمة الانتظار', 'Waitlist'),
    };
    const journey = WusoolServices.journey,
      jlabels = {
        'not-started': t('لم ينطلق', 'Not started'),
        'on-the-way': t('بالطريق', 'On the way'),
        arrived: t('وصل — بانتظار الاستقبال', 'Arrived · awaiting reception'),
        serving: t('قيد الخدمة', 'Being served'),
        completed: t('اكتملت الزيارة', 'Completed'),
        cancelled: t('ملغي', 'Cancelled'),
        waitlisted: t('قائمة الانتظار', 'Waitlist'),
        'no-show': t('لم يحضر', 'No-show'),
      };
    const journeyButtons = (b) => {
      let timing;
      try {
        timing = journey.timing(b);
      } catch {
        timing = {};
      }
      let result = `<button class="btn btn-sm btn-outline-secondary" data-journey="history" data-id="${esc(b.id)}">${t('تتبّع الزيارة والخريطة', 'Track visit & map')}</button>`;
      const button = (action, label, enabled = true) =>
        `<button class="btn btn-sm btn-outline-primary" data-journey="${action}" data-id="${esc(b.id)}" ${enabled ? '' : 'disabled'}>${label}</button>`;
      if (account.role === 'User') {
        const d = journey.directions(b);
        if (d.available)
          result += `<a class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer" href="${esc(d.url)}">Get directions${d.exact ? '' : t(' — بحث بالعنوان', ' · address search')}</a>`;
        if (b.status === 'confirmed' && (!b.journeyState || b.journeyState === 'not-started')) {
          result += button('depart', t('أنا بالطريق', 'I am on my way'), Boolean(timing.canDepart));
          if (!timing.canDepart)
            result += `<small class="booking-action-note text-secondary">${t('يتفعّل في يوم الحجز خلال ساعتين قبل الموعد، وحتى بدايته.', 'Available on the booking day, within two hours before the appointment until its start.')}</small>`;
        }
        if (b.status === 'confirmed' && b.journeyState === 'on-the-way')
          result += button('arrive', t('لقد وصلت', 'I have arrived'), Boolean(timing.sameDay));
        if (b.journeyState === 'arrived')
          result += `<small class="d-block text-success">${t('تم إبلاغ المؤسسة بوصولك — بانتظار الاستقبال.', 'The organization has been notified of your arrival · awaiting reception.')}</small>`;
      } else {
        if (['on-the-way', 'arrived'].includes(b.journeyState))
          result += `<small class="d-block text-secondary">${t('حالة أبلغ عنها الزائر', 'Reported by the visitor')}</small>`;
        if (timing.canNoShow) result += button('no-show', t('لم يحضر', 'Mark no-show'));
      }
      if (admin) result += button('correct', t('تصحيح مع سبب', 'Correct with reason'));
      return result;
    };
    const trackingOnly = account.role === 'User' && location.pathname.endsWith('/my-tickets.html');
    panel.classList.toggle('booking-tracking-only', trackingOnly);
    const render = () => {
      const roleCards = organization
        ? ['pending', 'confirmed', 'in-progress']
        : admin
          ? ['pending', 'confirmed', 'cancelled']
          : ['pending', 'confirmed', 'completed'];
      const icons = {
        total: 'bi-ticket-perforated',
        pending: 'bi-inbox',
        confirmed: 'bi-calendar-check',
        'in-progress': 'bi-arrow-repeat',
        completed: 'bi-check-circle',
        cancelled: 'bi-x-circle',
      };
      const cards = [
        [
          'total',
          t(
            admin ? 'كل الحجوزات' : organization ? 'حجوزات المؤسسة' : 'حجوزاتي',
            admin ? 'All bookings' : organization ? 'Organization bookings' : 'My bookings',
          ),
          bookings.length,
        ],
        ...roleCards.map((key) => [
          key,
          labels[key],
          bookings.filter((b) => b.status === key).length,
        ]),
      ];
      WusoolUI.html(
        panel.querySelector('[data-booking-stats]'),
        cards
          .map(
            ([key, label, value]) =>
              `<div class="col-12 col-sm-6 col-xl-3"><article class="booking-stat h-100"><div><p class="text-secondary mb-3">${label}</p><strong class="booking-metric">${value}</strong></div><span class="booking-stat-icon"><i class="bi ${icons[key]}" aria-hidden="true"></i></span></article></div>`,
          )
          .join(''),
      );
      WusoolUI.html(
        panel.querySelector('[data-journey-stats]'),
        ['on-the-way', 'arrived', 'serving']
          .map(
            (key) =>
              `<div class="col-12 col-md-4"><article class="booking-stat"><p>${esc(jlabels[key])}</p><strong class="booking-metric">${bookings.filter((b) => b.journeyState === key).length}</strong></article></div>`,
          )
          .join(''),
      );
      const q = panel.querySelector('[data-search]').value.trim().toLowerCase(),
        status = panel.querySelector('[data-status]').value,
        branchFilter = panel.querySelector('[data-branch]').value;
      const shown = bookings.filter(
        (b) =>
          (!status || b.status === status) &&
          (!branchFilter || b.branchId === branchFilter) &&
          (!q ||
            [
              b.reference,
              b.visitorName,
              b.visitorEmail,
              b.branchName,
              b.locationSnapshot?.branchName,
              branches.find((x) => x.id === b.branchId)?.name,
              users.find((x) => x.id === b.userId)?.name,
            ]
              .join(' ')
              .toLowerCase()
              .includes(q)),
      );
      panel.querySelector('[data-count]').textContent =
        t('الحجوزات المعروضة: ', 'Showing bookings: ') + shown.length + ' / ' + bookings.length;

      WusoolUI.html(
        panel.querySelector('[data-rows]'),
        shown.length
          ? shown
              .map((b) => {
                const branch = branches.find((x) => x.id === b.branchId),
                  user = users.find((x) => x.id === b.userId);
                return `<tr><td>${esc(b.reference || b.id)}</td><td>${esc(b.branchName || b.locationSnapshot?.branchName || branch?.branchName || branch?.name || t('فرع غير متاح حاليًا', 'Branch no longer available'))}</td><td>${esc(user?.name || (!organization && !admin ? account.name : b.visitorName || b.userId))}</td><td>${esc(b.date)} ${esc(b.time)}</td><td>${b.requiresAssistant || (b.support || []).includes('Staff assistance') ? t('نعم', 'Yes') : t('لا', 'No')}</td><td><span class="badge rounded-pill text-bg-${b.status === 'cancelled' ? 'danger' : b.status === 'pending' ? 'warning' : b.status === 'completed' ? 'success' : 'primary'}">${esc(labels[b.status] || b.status)}</span><small class="d-block mt-2">${esc(jlabels[b.journeyState || 'not-started'] || b.journeyState)}</small>${(() => {
                  try {
                    return journey.timing(b).late
                      ? '<small class="text-warning d-block">' +
                          t('متأخر عن الموعد', 'Late for appointment') +
                          '</small>'
                      : '';
                  } catch {
                    return '';
                  }
                })()}${b.scheduleConflict ? `<p class="small mb-0 text-warning">${t('تغيير الدوام: الموعد يحتاج مراجعة', 'Hours changed: appointment needs review')}</p>` : ''}${b.cancellationReason ? `<p class="small mb-0">${esc(b.cancellationReason)}</p>` : ''}</td><td><div class="booking-actions">${!b.interviewId && (admin || (organization && ['pending', 'confirmed'].includes(b.status)) || (!organization && !admin && b.status === 'pending')) ? `<button class="btn btn-sm btn-outline-primary" data-edit="${esc(b.id)}">${t('تعديل الموعد', 'Reschedule')}</button>` : ''}${!b.interviewId && (admin || organization) && ['pending', 'confirmed', 'in-progress'].includes(b.status) ? `<button class="btn btn-sm btn-outline-secondary" data-cancel="${esc(b.id)}">${t('إلغاء', 'Cancel')}</button>` : ''}${(admin || organization) && b.status === 'pending' ? `<button class="btn btn-sm btn-outline-success" data-approve="${esc(b.id)}">${t('موافقة', 'Approve')}</button>` : ''}${(admin || organization) && ((b.journeyState === 'arrived' && b.status === 'confirmed' && b.qrVerified?.actorId === account.id && Date.now() - Date.parse(b.qrVerified.at) < 600000) || (b.journeyState === 'serving' && b.status === 'in-progress')) ? `<button class="btn btn-sm btn-outline-success" data-progress="${esc(b.id)}">${b.status === 'confirmed' ? t('تم استقبال الزائر', 'Receive visitor') : t('إكمال الزيارة', 'Complete visit')}</button>` : ''}${b.interviewId ? `<a class="btn btn-sm btn-outline-primary" href="./recruitment.html?view=interviews">${t("المقابلة", "Interview")}</a>` : ""}${journeyButtons(b)}${window.WusoolVisitUX?.actions(b, account) || ''}${admin && !b.interviewId ? `<button class="btn btn-sm btn-outline-danger" data-delete="${esc(b.id)}">${t('حذف', 'Delete')}</button>` : ''}</div></td></tr>`;
              })
              .join('')
          : `<tr><td colspan="7" class="booking-empty">${t('لا توجد تيكتات بعد.', 'No tickets yet.')}</td></tr>`,
      );
      if (trackingOnly) panel.querySelectorAll('.booking-actions').forEach(group => {
        const bank = document.createElement('span'); bank.hidden = true; bank.dataset.trackingActions = '';
        [...group.children].filter(n => n.dataset.journey !== 'history').forEach(n => bank.append(n));
        group.append(bank); group.querySelector('[data-journey="history"]')?.classList.add('w-track-button');
      });
    };
    const refresh = async () => {
      await WusoolServices.visits?.process();
      placeDetails = (await WusoolServices.places()).items;
      bookings = await WusoolServices.getBookings();
      branches =
        organization || admin
          ? await WusoolServices.getBranches()
          : (await WusoolServices.places()).items;
      users = admin ? await WusoolServices.getUsers() : [];
      const branchSelect = panel.querySelector('[data-branch]'),
        previousBranch = branchSelect.value;
      WusoolUI.html(
        branchSelect,
        `<option value="">${t('كل الفروع', 'All branches')}</option>` +
          branches.map((b) => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join(''),
      );
      branchSelect.value = branches.some((b) => b.id === previousBranch) ? previousBranch : '';
      render();
      window.WusoolVisitUX?.update(bookings, branches);
    };
    window.WusoolVisitUX?.mount(panel, account, refresh);
    panel.querySelector('[data-search]').addEventListener('input', render);
    panel.querySelector('[data-status]').addEventListener('change', render);
    panel.querySelector('[data-branch]').addEventListener('change', render);
    document
      .getElementById('refreshTicketsButton')
      ?.addEventListener('click', () => refresh().catch(showError));
    const editor = async (booking) => {
      const previous = document.activeElement,
        d = document.createElement('dialog');
      d.className = 'wusool-initial-dialog';
      d.setAttribute('aria-labelledby', 'bookingEditorTitle');
      const options = branches
        .filter((b) => ['approved', 'published'].includes(b.status) || (!organization && !admin))
        .map((b) => `<option value="${esc(b.id)}">${esc(b.name)}</option>`)
        .join('');
      WusoolUI.html(
        d,
        `<form><h2 id="bookingEditorTitle">${booking ? t('تعديل موعد التيكت', 'Reschedule ticket') : t('إنشاء تيكت', 'Create ticket')}</h2>${
          !booking || admin
            ? `${
                admin
                  ? `<label>${t('المستخدم', 'User')}<select name="userId" class="form-select" required><option value="">${t('اختر مستخدمًا', 'Select user')}</option>${users
                      .filter((u) => u.role === 'User' && u.status === 'active')
                      .map(
                        (u) =>
                          `<option value="${esc(u.id)}">${esc(u.name)} · ${esc(u.email)}</option>`,
                      )
                      .join('')}</select></label>`
                  : ''
              }<label>${t('الفرع', 'Branch')}<select name="branchId" class="form-select" required><option value="">${t('اختر فرعًا', 'Select branch')}</option>${options}</select></label>`
            : ''
        }<div data-place-details aria-live="polite"></div><label>${t('التاريخ', 'Date')}<input name="date" type="date" class="form-control" required></label><label>${t('الوقت', 'Time')}<input name="time" type="time" class="form-control" required></label>${!organization ? `<label class="d-flex gap-2"><input name="requiresAssistant" type="checkbox">${t('أحتاج شخصًا للمساعدة', 'A person is needed to assist')}</label>` : ''}${booking && (admin || organization) ? `<label>${t('سبب تعديل الموعد', 'Reason for changing appointment')}<textarea name="reason" class="form-control" required minlength="3" maxlength="1000"></textarea></label>` : ''}<label>${t('مدة الزيارة المتوقعة بالدقائق', 'Expected visit duration (minutes)')}<select name="durationMinutes" class="form-select"><option value="30">30</option><option value="15">15</option><option value="60">60</option><option value="90">90</option><option value="120">120</option></select></label><p data-error role="alert"></p><div class="initial-actions"><button type="button" class="btn btn-outline-secondary" data-close>${t('إلغاء', 'Cancel')}</button><button type="submit" class="btn btn-wusool">${t('حفظ', 'Save')}</button></div></form>`,
      );
      document.body.appendChild(d);
      const form = d.querySelector('form');
      if (booking) {
        if (admin) {
          form.elements.userId.value = booking.userId;
          if (booking.status === 'confirmed') form.elements.userId.disabled = true;
          form.elements.branchId.value = booking.branchId;
        }
        form.elements.durationMinutes.value = String(booking.durationMinutes || 30);
        form.elements.date.value = booking.date;
        form.elements.time.value = booking.time;
        if (form.elements.requiresAssistant)
          form.elements.requiresAssistant.checked =
            booking.requiresAssistant || (booking.support || []).includes('Staff assistance');
      }
      const serviceEditor = WusoolTicketServicesUI.editor(d, booking);
      let locationPreview = null;
      let busy = false;
      const close = () => {
        if (busy) return;
        locationPreview?.destroy();
        document.removeEventListener('wxi:language', updateDetails);
        serviceEditor.destroy();
        d.close();
        d.remove();
        previous?.focus();
      };
      d.querySelector('[data-close]').addEventListener('click', close);
      d.addEventListener('cancel', (e) => {
        e.preventDefault();
        close();
      });
      const updateDetails = () => {
        locationPreview?.destroy();
        const selectedId = form.elements.branchId?.value || booking?.branchId;
        const selected =
          placeDetails.find((p) => p.id === selectedId) ||
          branches.find((p) => p.id === selectedId);
        WusoolUI.html(
          d.querySelector('[data-place-details]'),
          WusoolTicketPlaceDetails.render(selected, document.documentElement.lang === 'ar'),
        );
        if (selected && window.WusoolLocationUI) {
          const host = document.createElement('section');
          d.querySelector('[data-place-details]').append(host);
          locationPreview = window.WusoolLocationUI.mount(host, { value: selected });
        }
      };
      form.elements.branchId?.addEventListener('change', updateDetails);
      document.addEventListener('wxi:language', updateDetails);
      updateDetails();
      const validateSchedule = () => {
        const branch =
          placeDetails.find((p) => p.id === (form.elements.branchId?.value || booking?.branchId)) ||
          branches.find((p) => p.id === booking?.branchId);
        const date = form.elements.date,
          time = form.elements.time;
        date.setCustomValidity('');
        time.setCustomValidity('');
        if (!branch || !date.value) return;
        const special = (branch.specialHours || []).find((x) => x.date === date.value);
        if (special?.status === 'closed' || (branch.closedDates || []).includes(date.value)) {
          date.setCustomValidity(t('الفرع مغلق في هذا اليوم', 'The branch is closed on this date'));
          return;
        }
        const day = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' }).format(
          new Date(date.value + 'T00:00:00Z'),
        );
        const hours =
          special?.status === 'custom'
            ? special
            : Array.isArray(branch.workingHours)
              ? branch.workingHours.find(
                  (h) => String(h.day || h.name).toLowerCase() === day.toLowerCase(),
                )
              : branch.workingHours?.[day] || branch.workingHours?.[day.toLowerCase()];
        if (hours && (hours.isClosed || hours.closed || hours.isOpen === false))
          date.setCustomValidity(t('الفرع مغلق في هذا اليوم', 'The branch is closed on this day'));
        else if (
          hours &&
          time.value &&
          (time.value < (hours.openTime || hours.open || '00:00') ||
            time.value >= (hours.closeTime || hours.close || '24:00'))
        )
          time.setCustomValidity(
            t('اختر وقتًا ضمن أوقات عمل الفرع', 'Choose a time during branch working hours'),
          );
      };
      form.elements.date.addEventListener('change', validateSchedule);
      form.elements.time.addEventListener('change', validateSchedule);
      form.elements.branchId?.addEventListener('change', validateSchedule);
      const jordanParts = Object.fromEntries(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Amman',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
          .formatToParts(new Date())
          .map((x) => [x.type, x.value]),
      );
      form.elements.date.min = jordanParts.year + '-' + jordanParts.month + '-' + jordanParts.day;
      const retryKey = crypto.randomUUID();
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        validateSchedule();
        if (busy || !serviceEditor.validate() || !form.reportValidity()) return;
        busy = true;
        const submit = d.querySelector('[type="submit"]');
        submit.disabled = true;
        try {
          const input = {
            ...(booking ? { expectedRevision: booking.revision || 0 } : {}),
            date: form.elements.date.value,
            time: form.elements.time.value,
            durationMinutes: Number(form.elements.durationMinutes.value),
            serviceId: serviceEditor.selection(),
            reason: form.elements.reason?.value.trim() || '',
          };
          if (form.elements.requiresAssistant)
            input.requiresAssistant = form.elements.requiresAssistant.checked;
          if (booking)
            await WusoolServices.updateBooking(booking.id, {
              ...input,
              ...(admin
                ? { userId: form.elements.userId.value, branchId: form.elements.branchId.value }
                : {}),
            });
          else {
            const candidate = {
              ...input,
              branchId: form.elements.branchId.value,
              ...(admin ? { userId: form.elements.userId.value } : {}),
            };
            try {
              await WusoolServices.createBooking(candidate, retryKey);
            } catch (error) {
              if (
                error.code !== 'ASSISTANCE_CAPACITY' ||
                !(await confirmAction(
                  t(
                    'الساعة ممتلئة. الانضمام لقائمة الانتظار؟',
                    'This hour is full. Join the waitlist?',
                  ),
                ))
              )
                throw error;
              await WusoolServices.visits.joinWaitlist(candidate, retryKey);
            }
          }
          await refresh();
          busy = false;
          close();
        } catch (error) {
          d.querySelector('[data-error]').textContent = error.message;
          busy = false;
          submit.disabled = false;
        }
      });
      d.showModal();
      d.querySelector('input,select')?.focus();
    };
    const confirmAction = (message, needsReason = false) =>
      new Promise((resolve) => {
        const d = document.createElement('dialog');
        d.className = 'wusool-initial-dialog';
        WusoolUI.html(
          d,
          `<p>${esc(message)}</p>${needsReason ? `<label>${t('سبب الإلغاء', 'Cancellation reason')}<textarea class="form-control" required maxlength="1000" rows="3"></textarea></label>` : ''}<div class="initial-actions"><button class="btn btn-outline-secondary" data-no>${t('إلغاء', 'Cancel')}</button><button class="btn btn-wusool" data-yes>${t('تأكيد', 'Confirm')}</button></div>`,
        );
        document.body.appendChild(d);
        const finish = (v) => {
          d.close();
          d.remove();
          resolve(v);
        };
        d.querySelector('[data-no]').onclick = () => finish(false);
        d.querySelector('[data-yes]').onclick = () => {
          const reason = d.querySelector('textarea');
          if (needsReason && !reason.value.trim()) {
            reason.setCustomValidity(t('اكتب سبب الإلغاء', 'Enter a cancellation reason'));
            reason.reportValidity();
            return;
          }
          finish(needsReason ? reason.value.trim() : true);
        };
        d.querySelector('textarea')?.addEventListener('input', (e) =>
          e.target.setCustomValidity(''),
        );
        d.addEventListener('cancel', (e) => {
          e.preventDefault();
          finish(false);
        });
        d.addEventListener('focusin', (e) => e.stopPropagation());
        d.showModal();
      });
    window.WusoolBookingConfirm = confirmAction;
    WusoolUI.listen(panel, 'click', async (e) => {
      try {
        const button = e.target.closest('button');
        if (!button) return;
        if(button.dataset.journey){const booking=bookings.find(x=>String(x.id)===String(button.dataset.id));if(booking)await journeyDialog(booking,button.dataset.journey);return;}
        if (button.hasAttribute('data-new')) return editor();
        if (button.dataset.edit) return editor(bookings.find((b) => b.id === button.dataset.edit));
        if (button.dataset.progress) {
          const b = bookings.find((x) => x.id === button.dataset.progress);
          if (!(await confirmAction(t('تحديث حالة الزيارة؟', 'Update visit status?')))) return;
          await WusoolServices.bookingStatus(
            b.id,
            b.status === 'confirmed' ? 'in-progress' : 'completed',
            '',
            b.revision,
          );
          await refresh();
          return;
        }
        if (button.dataset.approve) {
          if (!(await confirmAction(t('الموافقة على الحجز؟', 'Approve this booking?')))) return;
          await WusoolServices.bookingStatus(
            button.dataset.approve,
            'confirmed',
            '',
            bookings.find((b) => b.id === button.dataset.approve)?.revision,
          );
          await refresh();
          return;
        }
        if (button.dataset.cancel || button.dataset.delete) {
          const reason = await confirmAction(
            t('هل أنت متأكد؟', 'Are you sure?'),
            Boolean(button.dataset.cancel),
          );
          if (!reason) return;
          if (button.dataset.delete) await WusoolServices.deleteBooking(button.dataset.delete);
          else
            await WusoolServices.bookingStatus(
              button.dataset.cancel,
              'cancelled',
              typeof reason === 'string' ? reason : '',
              bookings.find((b) => b.id === button.dataset.cancel)?.revision,
            );
          await refresh();
        }
      } catch (error) {
        showError(error);
      }
    });
    const journeyDialog = async (booking, action) => {
      const d = document.createElement('dialog');
      d.className = 'wusool-initial-dialog';
      const title =
        action === 'history'
          ? t('سجل حركة الحجز', 'Booking timeline')
          : t('تحديث رحلة الزائر', 'Update visitor journey');
      WusoolUI.html(
        d,
        `<form><h2>${title}</h2><p>${esc(booking.reference)}</p>${action === 'history' ? `<ol>${(booking.journeyHistory || []).map((h) => `<li><strong>${esc(jlabels[h.to] || h.to)}</strong> · ${esc(h.actorName || h.actorRole)}<br>${esc(new Intl.DateTimeFormat(ar ? 'ar-JO' : 'en-GB', { timeZone: 'Asia/Amman', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(h.at)))}<p>${esc(h.reason || '')}</p></li>`).join('') || t('لا توجد حركة بعد', 'No history yet')}</ol>` : `<p>${esc(jlabels[action === 'depart' ? 'on-the-way' : action === 'arrive' ? 'arrived' : action] || action)}</p>`}${
          action === 'correct'
            ? `<label>${t('الحالة الجديدة', 'New state')}<select name="journeyState" class="form-select">${Object.entries(
                jlabels,
              )
                .map(([key, label]) => `<option value="${key}">${label}</option>`)
                .join('')}</select></label>`
            : ''
        }${['correct', 'no-show'].includes(action) ? `<label>${t('السبب الذي يظهر للمستخدم', 'Reason visible to the user')}<textarea name="reason" required minlength="3" maxlength="1000" class="form-control"></textarea></label>` : ''}<p data-error role="alert"></p><div class="initial-actions"><button type="button" data-close class="btn btn-outline-secondary">${t('إغلاق', 'Close')}</button>${action !== 'history' ? `<button type="submit" class="btn btn-wusool">${t('تأكيد', 'Confirm')}</button>` : ''}</div></form>`,
      );
      document.body.append(d);
      const previous = document.activeElement;
      let trackingCleanup;
      const close = () => {
        trackingCleanup?.();
        d.close();
        d.remove();
        previous?.focus();
      };
      d.querySelector('[data-close]').onclick = close;
      d.addEventListener('cancel', (e) => {
        e.preventDefault();
        close();
      });
      d.querySelector('form').onsubmit = async (e) => {
        e.preventDefault();
        if (!e.currentTarget.reportValidity()) return;
        const submit=e.currentTarget.querySelector('[type=submit]');if(submit.disabled)return;submit.disabled=true;
        try {
          const current=bookings.find(x=>String(x.id)===String(booking.id))||booking;
          await journey.change(booking.id, action, {
            expectedRevision: current.revision || 0,
            reason: e.currentTarget.elements.reason?.value.trim() || '',
            patch: { journeyState: e.currentTarget.elements.journeyState?.value },
          });
          await refresh();
          close();
        } catch (error) {
          d.querySelector('[data-error]').textContent = error.message;
        } finally {if(submit.isConnected)submit.disabled=false;}
      };
      d.showModal();
      if (action === 'history' && window.WusoolBookingTracking) {
        trackingCleanup = WusoolBookingTracking.mount(d, {
          booking, account, panel, close,
          depart: async () => {const current=bookings.find(x=>String(x.id)===String(booking.id));if(!current)throw new Error(t('الحجز غير متاح','Booking unavailable'));await journey.change(current.id,'depart',{expectedRevision:current.revision||0});await refresh();},
          read: () => { const current = bookings.find((x) => x.id === booking.id); return { booking: current, branch: branches.find((x) => String(x.id) === String(current?.branchId || current?.placeId)) }; },
        });
      }
    };
    const tick = () => {
      panel.querySelector('[data-jordan-clock]').textContent =
        t('توقيت الأردن الآن: ', 'Jordan time now: ') +
        new Intl.DateTimeFormat(ar ? 'ar-JO' : 'en-GB', {
          timeZone: 'Asia/Amman',
          dateStyle: 'medium',
          timeStyle: 'medium',
        }).format(new Date());
    };
    tick();
    const clock = setInterval(tick, 1000),
      updates = setInterval(() => refresh().catch(showError), 15000);
    window.addEventListener(
      'pagehide',
      () => {
        clearInterval(clock);
        clearInterval(updates);
      },
      { once: true },
    );
    window.addEventListener('wusool:data-changed', () => refresh().catch(showError));
    window.addEventListener('storage', () => refresh().catch(showError));
    window.addEventListener('focus', () => refresh().catch(showError));
    window.WusoolLive?.watch('booking-tickets', refresh);
    await refresh();
    // Recruitment links use the existing authorized Track dialog, not a second tracker.
    const linkedId = new URLSearchParams(location.search).get('booking');
    const linkedBooking = linkedId && bookings.find(x => String(x.id) === linkedId);
    if (linkedBooking) await journeyDialog(linkedBooking, 'history');
  });
});
