'use strict';
WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  WusoolUI.ready(async () => {
    const ar = document.documentElement.lang === 'ar',
      t = (a, e) => (ar ? a : e);
    document.getElementById('analysisLoading')?.classList.add('d-none');
    const results = document.getElementById('analysisResults'),
      button = document.getElementById('continueButton');
    const branchId = new URLSearchParams(location.search).get('id');
    let branch = branchId
      ? await WusoolServices.getBranchById(branchId)
      : JSON.parse((await WusoolServices.rawRead('wusoolCurrentBranchDraft')) || 'null');
    const escape = (value) =>
      String(value ?? '').replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
      );
    function render() {
      if (button) {
        button.disabled = !branch || !window.WusoolBranchWorkflow.complete(branch);
        button.textContent =
          WusoolServices.mode === 'local'
            ? t('إنهاء الإجراءات ونشر الفرع تجريبيًا', 'Finish setup and publish demo branch')
            : t('إنهاء الإجراءات وإرسال للموافقة', 'Finish setup and submit for approval');
      }
      if (!results) return;
      results.classList.remove('d-none');
      const demo = WusoolServices.mode === 'local',
        review = branch?.aiReview,
        complete = window.WusoolBranchWorkflow.checks(branch || {}).aiReview;
      WusoolUI.html(
        results,
        `<article class="card p-4"><div class="alert ${demo ? 'alert-warning' : 'alert-info'}" role="status">${escape(demo ? t('تحليل تجريبي لتكملة الإجراءات. النتيجة محسوبة من إجابات الإتاحة؛ الصور لم يتم تحليلها بذكاء اصطناعي حقيقي.', 'Demo analysis to complete setup. The estimate uses accessibility answers; images have not been analyzed by real AI.') : t('التحليل يتم عبر الخادم المتصل.', 'Analysis runs through the connected backend.'))}</div>${complete ? `<h2>${escape(t('نتيجة مراجعة الإتاحة', 'Accessibility review result'))}: ${escape(review.score)} / 100</h2><p>${escape(review.source === 'demo' ? t('تقييم تجريبي — يحتاج تحققًا فعليًا', 'Demo estimate — requires real verification') : t('نتيجة التحليل من الخادم', 'Backend analysis result'))}</p>` : ''}<p>${escape(t('بعد اكتمال التحليل يمكنك متابعة المراجعة النهائية وإرسال الفرع للأدمن.', 'After analysis, continue to final review and submit the branch to the administrator.'))}</p><button type="button" id="runAnalysisButton" class="btn btn-wusool align-self-start">${escape(demo ? t('تشغيل التحليل التجريبي', 'Run demo analysis') : t('تشغيل تحليل AI', 'Run AI analysis'))}</button><div id="analysisError" class="mt-3" role="alert"></div></article>`,
      );
      const analyze = document.getElementById('runAnalysisButton');
      analyze.disabled = !branch || !(branch.photos||[]).length;
      WusoolUI.listen(analyze, 'click', async () => {
        analyze.disabled = true;
        try {
          const response = await WusoolServices.analyzeBranch(branch.id);
          if (response.status !== 'completed') throw new Error(response.message || response.status);
          branch = await WusoolServices.getBranchById(branch.id);
          if (!window.WusoolBranchWorkflow.checks(branch).aiReview)
            throw new Error(
              t(
                'الخادم لم يحفظ نتيجة التحليل وخطوة المراجعة.',
                'The backend has not persisted the review result and completion step.',
              ),
            );
          render();
          WusoolUI.message(
            t(
              'اكتمل التحليل. يمكنك متابعة المراجعة النهائية.',
              'Analysis completed. Continue to final review.',
            ),
            'success',
          );
        } catch (error) {
          document.getElementById('analysisError').textContent = error.message;
          analyze.disabled = false;
        }
      });
    }
    render();
    const skip=document.createElement('a');skip.href='./branch-submit-review.html?id='+encodeURIComponent(branch?.id||'');skip.className='btn btn-outline-wusool';skip.textContent=t('متابعة بدون تحليل اختياري — لا توجد نتيجة أو اعتماد','Continue without optional analysis — no score or approval');button.before(skip);
    WusoolUI.listen(button, 'click', () => {
      if (!branch || !window.WusoolBranchWorkflow.complete(branch)) return;
      if (WusoolServices.mode !== 'local') {
        location.href = './branch-submit-review.html?id=' + encodeURIComponent(branch.id);
        return;
      }
      const dialog = document.createElement('dialog');
      dialog.className = 'wusool-initial-dialog';
      dialog.innerHTML = `<form method="dialog"><h2>${escape(t('إنهاء إجراءات الفرع', 'Finish branch setup'))}</h2><p>${escape(t('هل تريد نشر الفرع للمستخدمين في النسخة التجريبية؟ سيظهر التقييم كتجريبي وليس توثيق AI حقيقي.', 'Publish this branch to users in the local demo? The score remains a demo estimate, not real AI verification.'))}</p><p role="alert" data-error></p><div class="d-flex gap-2"><button class="btn btn-light" value="cancel">${escape(t('إلغاء', 'Cancel'))}</button><button type="button" class="btn btn-wusool" data-publish>${escape(t('تأكيد وإنهاء الإجراءات', 'Confirm and finish setup'))}</button></div></form>`;
      document.body.append(dialog);
      dialog.addEventListener('close', () => dialog.remove());
      dialog.showModal();
      WusoolUI.listen(dialog.querySelector('[data-publish]'), 'click', async () => {
        const confirm = dialog.querySelector('[data-publish]');
        confirm.disabled = true;
        try {
          branch = await WusoolServices.finalizeBranchSetup(branch.id);
          dialog.close();
          WusoolUI.message(
            t(
              'اكتملت الإجراءات وتم نشر الفرع تجريبيًا للمستخدمين.',
              'Setup completed and branch published to demo users.',
            ),
            'success',
          );
          location.href = './branches.html';
        } catch (error) {
          dialog.querySelector('[data-error]').textContent = error.message;
          confirm.disabled = false;
        }
      });
    });
    WusoolUI.listen(document.getElementById('backButton'), 'click', () => {
      location.href = './branch-photos.html?id=' + encodeURIComponent(branch?.id || '');
    });
  });
});
