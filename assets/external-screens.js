'use strict';
window.WusoolExternalScreen = async function prepareExternalScreen(kind) {
  const { message, listen } = window.WusoolUI;
  const retryKey = crypto.randomUUID();
  const t = (ar, en) => (document.documentElement.lang?.startsWith('ar') ? ar : en);
  message(
    t(
      'هذه العملية تحتاج إعداد خدمات الخادم. اختيار الملف معاينة فقط حتى يؤكد الخادم رفعه.',
      'This operation requires backend configuration. Selected files remain previews until a confirmed upload.',
    ),
    'info',
  );
  const outputIds = [
    'overallScore',
    'scoreLabel',
    'summaryList',
    'facilitiesContainer',
    'issuesContainer',
    'suggestionsContainer',
    'currentInstruction',
    'instructionDetails',
    'hazardMessage',
    'routeSteps',
    'aiAnalysisResult',
    'analysisMessage',
    'photoStatus',
    'guidanceStatus',
    'transactionId',
    'paymentDate',
    'paymentMethod',
    'renewalDate',
    'paymentAmount',
    'totalReports',
    'readyReports',
    'improvementReports',
    'averageScore',
    'resultsText',
  ];
  for (const id of outputIds) {
    const n = document.getElementById(id);
    if (n && !['INPUT', 'SELECT', 'TEXTAREA'].includes(n.tagName))
      n.textContent = t('لم يتم التأكيد', 'Not confirmed');
  }
  document.getElementById('analysisProgressSection')?.classList.add('d-none');
  if (kind === 'payments/status' || kind === 'navigation/status') {
    const heading = document.querySelector('main h1');
    if (heading)
      heading.textContent =
        kind === 'payments/status'
          ? t('حالة الدفع', 'Payment status')
          : t('حالة التنقل', 'Navigation status');
  }
  document
    .querySelectorAll('#cardNumber,#securityCode,#cvv,#cardCvv,#cardExpiry,#cardholderName')
    .forEach((n) => {
      n.value = '';
      n.disabled = true;
      n.required = false;
    });
  document
    .querySelectorAll('.success-description')
    .forEach(
      (n) =>
        (n.textContent = t(
          'فتح هذه الصفحة لا يؤكد الدفع ولا يفعّل الاشتراك.',
          'Opening this page does not confirm payment or activate a subscription.',
        )),
    );
  const params = new URLSearchParams(location.search),
    branchId = params.get('id') || params.get('placeId') || params.get('branchId');
  const back = document.getElementById('backToPlaceLink');
  if (back && branchId)
    back.href =
      './' +
      (location.pathname.includes('/user/') ? 'user-place-details' : 'place-details') +
      '.html?id=' +
      encodeURIComponent(branchId);
  if (kind === 'payments/checkout') {
    const chosen = JSON.parse((await WusoolServices.rawRead('wusoolSelectedPlan')) || 'null');
    const plan = (await WusoolServices.getPlans()).items.find(
      (p) => p.id === chosen?.id && p.active !== false,
    );
    if (!plan)
      throw Object.assign(
        new Error(t('اختر باقة متاحة أولًا.', 'Choose an available plan first.')),
        { code: 'PLAN_REQUIRED' },
      );
    const form = document.getElementById('checkoutForm');
    WusoolUI.html(
      form,
      `<h2>${t('إكمال الاشتراك', 'Complete subscription')}</h2><p>${t('ستنتقل إلى بوابة الدفع المعتمدة.', 'You will continue to the hosted payment provider.')}</p><label><input type="checkbox" name="termsAccepted" required> ${t('أوافق على شروط الاشتراك', 'I agree to subscription terms')}</label><button type="submit" class="btn btn-wusool mt-3">${t('متابعة للدفع', 'Continue to payment')}</button>`,
    );
    for (const [id, value] of Object.entries({
      planName: plan.name,
      branchLimit: plan.branchLimit,
      billingCycle: chosen.billingCycle,
      planPrice: plan.monthlyPrice + ' ' + plan.currency,
      totalPrice: t('يؤكده الخادم', 'Confirmed by server'),
    })) {
      const n = document.getElementById(id);
      if (n) n.textContent = String(value);
    }
    form.dataset.planId = plan.id;
    form.dataset.billingCycle = chosen.billingCycle === 'annual' ? 'annual' : 'monthly';
  }
  let selectedFile = null,
    confirmedPayment = false;
  const inputs = ['photoInput', 'cameraInput']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  for (const input of inputs)
    listen(input, 'change', () => {
      const file = input.files[0];
      if (!file) return;
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 8 * 1024 * 1024
      )
        throw new Error(
          t('اختر صورة صحيحة أصغر من 8 ميجابايت.', 'Select a supported image smaller than 8 MB.'),
        );
      selectedFile = file;
      const preview = document.getElementById('photoPreview');
      if (preview) {
        const reader = new FileReader();
        reader.onload = () => {
          preview.src = reader.result;
          document.getElementById('previewSection')?.classList.remove('d-none');
        };
        reader.onerror = () => message(t('فشلت المعاينة.', 'Preview failed.'));
        reader.readAsDataURL(file);
      }
      const name = document.getElementById('selectedFileName');
      if (name) name.textContent = file.name;
      const size = document.getElementById('selectedFileSize');
      if (size) size.textContent = Math.ceil(file.size / 1024) + ' KB';
      const analyze = document.getElementById('analyzePhotoButton');
      if (analyze) analyze.disabled = false;
    });
  for (const id of ['uploadPhotoButton', 'changePhotoButton', 'openCameraButton'])
    listen(document.getElementById(id), 'click', () => {
      const input = document.getElementById(
        id === 'openCameraButton' ? 'cameraInput' : 'photoInput',
      );
      if (input) input.click();
    });
  listen(document.getElementById('removePhotoButton'), 'click', () => {
    selectedFile = null;
    inputs.forEach((n) => (n.value = ''));
    const preview = document.getElementById('photoPreview');
    if (preview) preview.removeAttribute('src');
    document.getElementById('previewSection')?.classList.add('d-none');
    const analyze = document.getElementById('analyzePhotoButton');
    if (analyze) analyze.disabled = true;
  });
  const showResult = (result) => {
    if (!result || typeof result !== 'object')
      throw Object.assign(new Error('Invalid backend operation response.'), {
        code: 'INVALID_RESPONSE',
      });
    if (
      (result.score != null &&
        (!Number.isFinite(result.score) || result.score < 0 || result.score > 100)) ||
      (result.confidence != null &&
        (!Number.isFinite(result.confidence) || result.confidence < 0 || result.confidence > 1))
    )
      throw Object.assign(new Error('Invalid analysis score or confidence.'), {
        code: 'INVALID_RESPONSE',
      });
    if (result.url) {
      const url = new URL(result.url);
      if (url.protocol !== 'https:') throw new Error('Invalid hosted destination.');
      location.assign(url.href);
      return;
    }
    if (kind === 'payments/checkout') throw new Error('Hosted checkout URL was not returned.');
    if (
      kind.startsWith('auth/') &&
      !['queued', 'sent', 'accepted', 'completed'].includes(result.status)
    )
      throw new Error('The backend did not confirm this authentication operation.');
    const status = result.status || 'completed';
    message(
      result.message || result.text || t('رد الخادم: ', 'Backend response: ') + status,
      ['failed', 'unavailable'].includes(status) ? 'warning' : 'info',
    );
    if (result.score != null) {
      const score = document.getElementById('overallScore');
      if (score) score.textContent = result.score;
    }
    for (const [key, id] of [
      ['summary', 'summaryList'],
      ['facilities', 'facilitiesContainer'],
      ['issues', 'issuesContainer'],
      ['suggestions', 'suggestionsContainer'],
      ['steps', 'routeSteps'],
    ])
      if (Array.isArray(result[key])) {
        const n = document.getElementById(id);
        if (n) {
          n.replaceChildren();
          for (const item of result[key]) {
            const p = document.createElement('p');
            p.textContent = typeof item === 'string' ? item : item.text || item.name || '';
            n.append(p);
          }
        }
      }
    if (kind === 'payments/status') {
      confirmedPayment = result.status === 'confirmed';
      const receipt = document.getElementById('printReceiptButton');
      if (receipt) receipt.disabled = !confirmedPayment;
      for (const [key, id] of [
        ['transactionId', 'transactionId'],
        ['paidAt', 'paymentDate'],
        ['amount', 'paymentAmount'],
        ['paymentMethodLabel', 'paymentMethod'],
      ]) {
        const n = document.getElementById(id);
        if (n)
          n.textContent =
            result.status === 'confirmed'
              ? String(result[key] ?? '—')
              : t('لم يتم التأكيد', 'Not confirmed');
      }
    }
  };
  const action = async (event) => {
    event?.preventDefault();
    const form = event?.target?.closest?.('form') || document.querySelector('form');
    if (form && !form.checkValidity()) {
      form.reportValidity?.();
      return;
    }
    const input = {
      branchId,
      checkoutId: params.get('checkoutId'),
      token: params.get('token'),
      email: params.get('email'),
      code: params.get('code'),
    };
    if (form)
      for (const x of form.querySelectorAll('input,select,textarea'))
        if ((x.name || x.id) && !x.disabled && x.type !== 'file')
          input[x.name || x.id] = x.type === 'checkbox' ? x.checked : x.value;
    if (input.newPassword && input.confirmPassword && input.newPassword !== input.confirmPassword)
      throw new Error(t('كلمتا المرور غير متطابقتين.', 'Passwords do not match.'));
    if (selectedFile && WusoolServices.mode === 'api') {
      const upload = await WusoolServices.upload(selectedFile, { branchId, purpose: kind });
      input.documentId = upload.id;
    }
    if (kind === 'payments/checkout') {
      input.planId = form.dataset.planId;
      input.billingCycle = form.dataset.billingCycle;
    }
    showResult(await WusoolServices.external(kind, input, { idempotencyKey: retryKey }));
  };
  document.querySelectorAll('form').forEach((form) => listen(form, 'submit', action));
  if (kind === 'payments/status' && params.get('checkoutId')) await action();
  const actionIds = [
    'analyzePhotoButton',
    'runAnalysisButton',
    'resendButton',
    'nextInstructionButton',
    'repeatInstructionButton',
    'arrivedButton',
    'speakGuidance',
    'voiceInputButton',
    'savedProfileButton',
    'applyPreferencesButton',
  ];
  for (const id of actionIds) listen(document.getElementById(id), 'click', action);
  for (const button of document.querySelectorAll('.prompt-button'))
    listen(button, 'click', () => {
      const input = document.getElementById('messageInput');
      if (input) {
        input.value = button.textContent.trim();
        input.focus();
      }
    });
  listen(document.getElementById('newChatButton'), 'click', () => {
    const chat = document.getElementById('chatMessages');
    if (chat)
      chat.textContent = t(
        'لم تبدأ محادثة مع خدمة الذكاء الاصطناعي.',
        'No AI conversation started.',
      );
  });
  const chat = document.getElementById('chatMessages');
  if (chat)
    chat.textContent = t(
      'الذكاء الاصطناعي يحتاج إعداد الخادم.',
      'AI requires backend configuration.',
    );
  for (const id of ['clearFiltersButton', 'emptyClearButton'])
    listen(document.getElementById(id), 'click', () => {
      document.querySelectorAll('input[type="search"]').forEach((n) => (n.value = ''));
      message(
        t('لا توجد تقارير ذكاء اصطناعي مؤكدة.', 'No confirmed AI reports are available.'),
        'info',
      );
    });
  const reports = document.getElementById('reportsContainer');
  if (reports) reports.replaceChildren();
  const receipt = document.getElementById('printReceiptButton');
  if (receipt) {
    receipt.disabled = true;
    listen(receipt, 'click', () => {
      if (confirmedPayment) window.print();
      else
        message(
          t(
            'الفاتورة تحتاج دفعًا مؤكدًا من الخادم.',
            'A receipt requires backend-confirmed payment.',
          ),
          'info',
        );
    });
  }
  listen(document.getElementById('changeEmailButton'), 'click', () => {
    document.getElementById('successSection')?.classList.add('d-none');
    document.getElementById('requestSection')?.classList.remove('d-none');
    document.getElementById('email')?.focus();
  });
  for (const [id, inputId] of [
    ['toggleNewPasswordButton', 'newPassword'],
    ['toggleConfirmPasswordButton', 'confirmPassword'],
  ])
    listen(document.getElementById(id), 'click', () => {
      const n = document.getElementById(inputId);
      if (n) n.type = n.type === 'password' ? 'text' : 'password';
    });
  if (kind === 'payments/status') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-wusool-outline';
    button.textContent = t('تحقق من حالة الدفع', 'Check payment status');
    document.querySelector('main')?.append(button);
    listen(button, 'click', action);
  }
  return action;
};
