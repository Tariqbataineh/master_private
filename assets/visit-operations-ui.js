'use strict';
window.WusoolVisitUX = (() => {
  const esc = (v) => window.WusoolUI.escape(v ?? ''),
    ar = () => document.documentElement.lang === 'ar',
    t = (a, e) => (ar() ? a : e);
  const facilityLabel = (key) =>
    ({
      accessibleEntrance: t('مدخل مهيأ', 'Accessible entrance'),
      entranceRamp: t('منحدر الدخول', 'Entrance ramp'),
      widePathways: t('ممرات واسعة', 'Wide pathways'),
      elevator: t('مصعد', 'Elevator'),
      accessibleParking: t('مواقف مهيأة', 'Accessible parking'),
      accessibleRestroom: t('دورة مياه مهيأة', 'Accessible restroom'),
      staffAssistance: t('مساعدة الموظفين', 'Staff assistance'),
      hearingSupport: t('دعم سمعي', 'Hearing support'),
      automaticDoors: t('أبواب آلية', 'Automatic doors'),
      tactilePaving: t('مسارات ملموسة', 'Tactile paving'),
      brailleSigns: t('لوحات برايل', 'Braille signs'),
      wheelchairAvailable: t('كرسي متحرك متاح', 'Wheelchair available'),
    })[key] || key;
  let account,
    bookings = [],
    branches = [],
    refresh,
    host;
  function modal(title, body, submit) {
    const previous = document.activeElement,
      d = document.createElement('dialog');
    d.className = 'wusool-initial-dialog visit-operations-dialog';
    WusoolUI.html(
      d,
      `<form><h2>${esc(title)}</h2>${body}<p data-message role="alert"></p><div class="initial-actions"><button type="button" data-close class="btn btn-outline-secondary">${t('إغلاق', 'Close')}</button>${submit ? `<button type="submit" class="btn btn-wusool">${t('تأكيد', 'Confirm')}</button>` : ''}</div></form>`,
    );
    document.body.append(d);
    let cleanup = () => {},
      busy = false;
    const close = () => {
      if (busy) return;
      cleanup();
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
      if (!submit || busy || !e.currentTarget.reportValidity()) return;
      busy = true;
      const button = d.querySelector('[type=submit]');
      button.disabled = true;
      try {
        await submit(e.currentTarget, d);
        busy = false;
        await refresh();
        close();
      } catch (error) {
        d.querySelector('[data-message]').textContent = error.message;
        busy = false;
        button.disabled = false;
      }
    };
    d.showModal();
    return { d, close, onClose: (f) => (cleanup = f) };
  }
  const actions = (b, a) => {
    const button = (action, label) =>
      `<button class="btn btn-sm btn-outline-primary" data-visit-action="${action}" data-id="${esc(b.id)}">${label}</button>`;
    let html = '';
    if (a.role === 'User') {
      if (b.status === 'confirmed') html += button('pass', t('QR الحجز', 'Booking QR'));
      if (!b.interviewId && ['pending', 'confirmed', 'waitlisted'].includes(b.status))
        html += button('cancel', t('إلغاء مع سبب', 'Cancel with reason'));
      if (b.appointmentProposal)
        html += button('proposal', t('الرد على الموعد المقترح', 'Respond to proposed appointment'));
      if (b.status === 'completed' && !b.reviewed)
        html += `<a class="btn btn-sm btn-outline-success" href="write-review.html?visitId=${encodeURIComponent(b.id)}&placeId=${encodeURIComponent(b.branchId)}">${t('تقييم الزيارة', 'Review visit')}</a>`;
    } else if (b.status === 'confirmed' && b.journeyState === 'arrived')
      html += button('verify', t('التحقق من QR', 'Verify QR'));
    if (b.scheduleBlocked)
      html += `<small class="text-danger">${t('الفرع مغلق في موعدك — يلزم موعد جديد', 'Branch closed for this appointment · reschedule needed')}</small>`;
    return html;
  };
  function update(rows, places) {
    bookings = rows;
    branches = places;
    const waiting = rows.filter((b) => b.status === 'confirmed' && b.journeyState === 'arrived'),
      serving = rows.filter((b) => b.status === 'in-progress'),
      way = rows.filter((b) => b.journeyState === 'on-the-way' && b.status === 'confirmed');
    const active = account.role === 'User' ? waiting : waiting.concat(serving, way);
    WusoolUI.html(
      host.querySelector('[data-reception-board]'),
      `<div class="visit-board-head"><div><p class="text-secondary small">${t('تحديث تلقائي · توقيت الأردن', 'Automatic updates · Jordan time')}</p><h3>${t(account.role === 'User' ? 'دوري في الزيارة' : 'لوحة الاستقبال الحية', account.role === 'User' ? 'My live visit queue' : 'Live reception board')}</h3></div></div>${
        active.length
          ? `<div class="visit-queue-grid">${active
              .map((b) => {
                const q =
                  WusoolServices.mode === 'local'
                    ? WusoolServices.visits.queue(b.id)
                    : b.queue || {};
                return `<article class="visit-queue-card"><strong>${esc(account.role === 'User' ? b.branchName : b.visitorName || b.reference)}</strong><p>${esc(b.reference)}</p><p>${b.journeyState === 'serving' ? t('قيد الخدمة', 'Being served') : b.journeyState === 'on-the-way' ? t('بالطريق', 'On the way') : q.called ? t('دورك الآن — توجه للاستقبال', 'Your turn · present your QR') : t('موقعك في الدور: ', 'Queue position: ') + esc(q.position)}</p>${q.position ? `<small>${t('أمامك: ', 'Ahead: ')}${esc(q.ahead)} · ${t('الانتظار المتوقع: ', 'Estimated wait: ')}${esc(q.estimatedMinutes)} ${t('دقيقة — تقديري', 'min · estimate')}</small>` : ''}${account.role !== 'User' && q.position === 1 ? `<button class="btn btn-wusool btn-sm" data-call="${esc(b.branchId)}">${t('نداء الزائر التالي', 'Call next visitor')}</button>` : ''}</article>`;
              })
              .join('')}</div>`
          : `<p class="text-secondary">${t('يظهر الدور عندما يسجّل الزائر وصوله لحجز مؤكد.', 'The queue appears when a visitor reports arrival for a confirmed booking.')}</p>`
      }`,
    );
  }
  async function showPass(b) {
    const pass = await WusoolServices.visits.pass(b.id),
      qr = qrcode(0, 'M');
    qr.addData(pass.payload);
    qr.make();
    const view = modal(
      t('بطاقة استقبال الزيارة', 'Visit reception pass'),
      `<p>${esc(pass.reference)} · ${esc(pass.date)} ${esc(pass.time)}</p><div data-qr class="visit-qr"></div><p>${t('اعرض الرمز للمؤسسة عند الوصول. خاص بهذا الحجز ويتغير عند تغيير الموعد.', 'Present this pass at reception. It belongs to this booking and changes when the appointment changes.')}</p><details><summary>${t('رمز الحجز البديل', 'Fallback booking code')}</summary><textarea readonly class="form-control" aria-label="Booking verification code">${esc(pass.payload)}</textarea></details>`,
    );
    view.d.querySelector('[data-qr]').innerHTML = qr.createSvgTag({
      cellSize: 5,
      margin: 4,
      scalable: true,
    });
  }
  async function verifyDialog(b) {
    let stream, timer;
    const view = modal(
      t('التحقق من هوية الحجز', 'Verify booking pass'),
      `<p>${esc(b.visitorName || b.reference)} · ${esc(b.reference)}</p><button type="button" class="btn btn-outline-primary" data-camera>${t('مسح QR بالكاميرا', 'Scan QR with camera')}</button><video data-video playsinline muted hidden></video><label>${t('أو الصق رمز الحجز من بطاقة الزائر', 'Or paste the code from the visitor’s pass')}<textarea name="payload" required class="form-control" autocomplete="off"></textarea></label><p>${t('التحقق لا يسجّل الاستقبال؛ بعدها اضغط تم استقبال الزائر.', 'Verification does not record reception. Then select Receive visitor.')}</p>`,
      async (form) => {
        const result = await WusoolServices.visits.verify(
          form.elements.payload.value.trim(),
          b.revision,
          b.id,
        );
        if (result.id !== b.id)
          throw new Error(
            t(
              'هذا الرمز لحجز آخر. افتح الحجز الصحيح.',
              'This QR belongs to another booking. Open the correct booking.',
            ),
          );
      },
    );
    const stop = () => {
      clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
    view.onClose(stop);
    view.d.querySelector('[data-camera]').onclick = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw Error(
            t(
              'الكاميرا تحتاج localhost أو HTTPS. يمكنك لصق الرمز.',
              'Camera requires localhost or HTTPS. Paste the code instead.',
            ),
          );
        stop();
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (!view.d.isConnected) {
          stop();
          return;
        }
        const video = view.d.querySelector('video');
        video.hidden = false;
        video.srcObject = stream;
        await video.play();
        if (!view.d.isConnected) {
          stop();
          return;
        }
        const canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d', { willReadFrequently: true });
        timer = setInterval(() => {
          if (!video.videoWidth) return;
          canvas.width = Math.min(video.videoWidth, 960);
          canvas.height = Math.round((video.videoHeight * canvas.width) / video.videoWidth);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height),
            result = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
          if (result) {
            view.d.querySelector('[name=payload]').value = result.data;
            stop();
            video.hidden = true;
            view.d.querySelector('[data-message]').textContent = t(
              'تمت قراءة الرمز. اضغط تأكيد للتحقق.',
              'QR read. Confirm to verify.',
            );
          }
        }, 300);
      } catch (error) {
        stop();
        view.d.querySelector('[data-message]').textContent = error.message;
      }
    };
  }
  function proposal(b) {
    const p = b.appointmentProposal;
    modal(
      t('موعد مقترح — القرار إلك', 'Proposed appointment · your decision'),
      `<p>${t('موعدك الحالي', 'Current appointment')}: ${esc(b.date)} ${esc(b.time)}</p><p>${t('الموعد المقترح', 'Proposed appointment')}: ${esc(p.date)} ${esc(p.time)} · ${esc(branches.find((x) => x.id === p.branchId)?.name || p.branchId)}</p><p>${esc(p.reason)}</p><label>${t('اختيارك', 'Your response')}<select name="response" class="form-select"><option value="accept">${t('أوافق على الموعد الجديد', 'Accept new appointment')}</option><option value="decline">${t('أحتاج موعدًا بديلًا', 'Request another appointment')}</option></select></label><label>${t('طلب الموعد البديل / ملاحظة', 'Alternative request / note')}<textarea name="reason" class="form-control" maxlength="1000"></textarea></label>`,
      (form) =>
        WusoolServices.visits.respond(
          b.id,
          form.elements.response.value === 'accept',
          form.elements.reason.value,
          b.revision,
        ),
    );
  }
  function notice() {
    modal(
      t('إغلاق أو تحديث تسهيلات الفرع', 'Branch closure or facility update'),
      `<label>${t('الفرع', 'Branch')}<select name="branch" required class="form-select">${branches.map((b) => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('')}</select></label><label>${t('نوع التحديث', 'Update type')}<select name="kind" class="form-select"><option value="closure">${t('عطلة / إغلاق طارئ', 'Holiday / emergency closure')}</option><option value="reopen">${t('إعادة فتح يوم مغلق', 'Reopen a closed date')}</option><option value="facility">${t('حالة تسهيلات الوصول', 'Facility availability')}</option></select></label><label>${t('تاريخ الإغلاق', 'Closure date')}<input name="date" type="date" class="form-control"></label><label>${t('التسهيلة', 'Facility')}<select name="facility" class="form-select"></select></label><label>${t('متوفرة الآن', 'Available now')}<input name="available" type="checkbox" checked></label><label>${t('السبب — يصل للزوار المتأثرين', 'Reason · notified to affected visitors')}<textarea name="reason" required maxlength="1000" class="form-control"></textarea></label>`,
      (form) =>
        WusoolServices.visits.branchNotice(form.elements.branch.value, {
          date: form.elements.kind.value !== 'facility' ? form.elements.date.value : null,
          reopen: form.elements.kind.value === 'reopen',
          facility: form.elements.facility.value,
          available: form.elements.available.checked,
          reason: form.elements.reason.value,
        }),
    );
    const form = document.querySelector('dialog:last-of-type form'),
      setFields = () => {
        const closure = form.elements.kind.value !== 'facility';
        form.elements.date.required = closure;
        form.elements.date.closest('label').hidden = !closure;
        form.elements.facility.closest('label').hidden = closure;
        form.elements.available.closest('label').hidden = closure;
        const branch = branches.find((b) => b.id === form.elements.branch.value);
        WusoolUI.html(
          form.elements.facility,
          Object.keys(branch?.accessibility || {})
            .map((k) => `<option value="${esc(k)}">${esc(facilityLabel(k))}</option>`)
            .join(''),
        );
      };
    form.elements.kind.onchange = setFields;
    form.elements.branch.onchange = setFields;
    setFields();
  }
  function mount(panel, a, onRefresh) {
    account = a;
    refresh = onRefresh;
    host = document.createElement('section');
    host.className = 'visit-operations';
    WusoolUI.html(
      host,
      `<div class="visit-operations-tools"><button class="btn btn-outline-secondary" data-export>${t('تصدير بياناتي', 'Export my data')}</button>${a.role !== 'User' ? `<button class="btn btn-outline-primary" data-notice>${t('العطل وتوفر التسهيلات', 'Closures & facility availability')}</button>` : ''}</div><article class="booking-table-card mb-4" data-reception-board></article>`,
    );
    panel.querySelector('.booking-table-card').before(host);
    panel.addEventListener('click', async (e) => {
      try {
        const button = e.target.closest(
          '[data-visit-action],[data-call],[data-export],[data-notice]',
        );
        if (!button) return;
        if (button.hasAttribute('data-export')) {
          if (
            a.role === 'Admin' &&
            !(await WusoolBookingConfirm(
              t(
                'النسخة تشمل بيانات خاصة دون كلمات مرور أو رموز QR. احفظها في مكان آمن. تصدير؟',
                'The export includes private records without password verifiers or QR tokens. Store securely. Export?',
              ),
            ))
          )
            return;
          const result = await WusoolServices.visits.exportData(),
            url = URL.createObjectURL(
              new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }),
            ),
            link = document.createElement('a');
          link.href = url;
          link.download =
            'Wusool-' + a.role + '-' + new Date().toISOString().slice(0, 10) + '.json';
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          return;
        }
        if (button.hasAttribute('data-notice')) return notice();
        if (button.dataset.call) {
          await WusoolServices.visits.callNext(button.dataset.call);
          await refresh();
          return;
        }
        const b = bookings.find((b) => b.id === button.dataset.id);
        if (!b) return;
        const action = button.dataset.visitAction;
        if (action === 'pass') await showPass(b);
        if (action === 'verify') await verifyDialog(b);
        if (action === 'proposal') proposal(b);
        if (action === 'cancel') {
          const reason = await WusoolBookingConfirm(
            t('إلغاء الحجز وإتاحة مكانه للانتظار؟', 'Cancel and release the slot to the waitlist?'),
            true,
          );
          if (reason) {
            await WusoolServices.visits.cancel(b.id, reason, b.revision);
            await refresh();
          }
        }
      } catch (error) {
        modal(t('تعذر إكمال الإجراء', 'Action unavailable'), `<p>${esc(error.message)}</p>`);
      }
    });
  }
  return { mount, update, actions };
})();
