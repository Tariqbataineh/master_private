'use strict';
// integrations: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registerintegrations(ctx) {
  ctx.activateDevelopmentSubscription = async function activateDevelopmentSubscription() {
    if (ctx.cfg.mode !== 'local')
      ctx.fail('DEVELOPMENT_ONLY', 'This action is only available in local development.');
    const a = ctx.requireAccount(['Organization']);
    if (a.approvalStatus !== 'approved')
      ctx.fail('ORGANIZATION_PENDING', 'Approval is required before subscription setup.');
    const data = ctx.db();
    let selected;
    try {
      selected = JSON.parse(data.drafts[a.id]?.wusoolSelectedPlan || 'null');
    } catch {}
    const catalog = (await ctx.getPlans()).items;
    const source = catalog.find(p => p.id === selected?.id && p.active !== false);
    const quote = source ? ctx.quoteSubscription(source, selected.branchLimit, selected.billingCycle) : null;
    if (quote && selected.pricingSnapshot && JSON.stringify(selected.pricingSnapshot) !== JSON.stringify(quote))
      ctx.fail('PRICE_CHANGED', 'Pricing changed. Reload checkout and review the current quote before confirming.');
    const plan = quote && {name:source.name,limit:quote.capacity,price:quote.monthlyPrice};
    if (!plan) ctx.fail('PLAN_REQUIRED', 'Choose a subscription plan first.');
    if (plan.limit < data.branches.filter(b=>b.organizationId===a.id&&!b.isDeleted).length) ctx.fail('CAPACITY_BELOW_USAGE','Capacity must cover existing branches.');
    const current = ctx.subscriptionFor?.(data,a.id);
    if(current?.origin==='admin-grant') ctx.fail('ADMIN_GRANT_REQUIRED','An Admin grant must be upgraded through an audited Admin grant action. Existing grant and branches are preserved.');
    if(current && !current.developmentOnly) ctx.fail('CONFIRMATION_REQUIRED','Existing agreements require an authorized subscription upgrade; demo activation cannot replace them.');
    const old = current?.developmentOnly ? current : null;
    const cycle = selected.billingCycle === 'annual' ? 'annual' : 'monthly';
    const x = {
      id: ctx.id('subscription'),
      organizationId: a.id,
      plan: plan.name,
      planName: plan.name,
      planId: selected.id,
      billingCycle: cycle,
      status: 'Active',
      branchLimit: plan.limit,
      developmentOnly: true,
      paymentStatus: 'not-charged',
      price: 0,
      quotedPrice: quote.totalPrice,
      pricingSnapshot: quote,
      createdAt: ctx.now(),
      updatedAt: ctx.now(),
      startDate: ctx.now(),
      isDeleted: false,
    };
    if (old) { old.status = 'Superseded'; old.supersededBy = x.id; }
    data.subscriptions.push(x);
    data.drafts[a.id].wusoolRegistrationStep = 'development-complete';
    ctx.audit(
      data,
      a,
      'Activate development subscription',
      'subscriptions',
      x.id,
      'Simulation only; no payment charged',
    );
    ctx.put(data);
    return ctx.safe(x);
  };
  ctx.upload = async function upload(file, metadata = {}) {
    if (
      !file ||
      file.size > 8 * 1024 * 1024 ||
      ![
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.type)
    )
      ctx.fail('INVALID_FILE', 'Select a supported image, PDF or Word document smaller than 8 MB.');
    if (ctx.cfg.mode === 'local')
      return {
        id: null,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'preview-only',
        uploaded: false,
      };
    const form = new FormData();
    form.append('file', file);
    form.append('metadata', JSON.stringify(metadata));
    const result = await ctx.request('/documents/upload', {
      method: 'POST',
      body: form,
    });
    if (!result?.id || result.uploaded !== true || result.status !== 'uploaded')
      ctx.fail('INVALID_RESPONSE', 'The server did not confirm a successful upload.');
    return result;
  };
  ctx.finalizeBranchSetup = async function finalizeBranchSetup(branchId) {
    if (ctx.cfg.mode === 'api')
      return ctx.request('/branches/' + encodeURIComponent(branchId) + '/submit', {
        method: 'POST',
        body: {},
      });
    const a = ctx.requireAccount(['Admin', 'Organization']),
      data = ctx.db(),
      branch = data.branches.find((b) => b.id === branchId);
    if (!branch || !ctx.own(data, a, 'branches', branch))
      ctx.fail('FORBIDDEN', 'Select an owned branch.');
    if (!window.WusoolBranchWorkflow.complete(branch))
      ctx.fail('BRANCH_INCOMPLETE', window.WusoolBranchWorkflow.explain(branch));
    const org = data.organizations.find((o) => o.id === branch.organizationId);
    if (!org || org.isDeleted || org.status !== 'active' || org.approvalStatus !== 'approved')
      ctx.fail('ORGANIZATION_PENDING', 'The organization must be approved and active.');
    if (['pending','approved','published'].includes(branch.status)) return ctx.copy(branch);
    branch.status = 'pending';
    branch.isPublished = false;
    branch.completedSteps = {...branch.completedSteps,submitted:true};
    branch.submittedAt = ctx.now();
    branch.updatedAt = ctx.now();
    ctx.audit(data,a,'Submit branch for approval','branches',branchId);
    ctx.put(data);
    return ctx.copy(branch);
  };
  ctx.analyzeBranch = async function analyzeBranch(branchId) {
    if (ctx.cfg.mode === 'api') {
      const result = await ctx.request('/ai/branch-analysis', {
        method: 'POST',
        body: {
          branchId,
        },
      });
      if (
        !result ||
        result.demo===true || result.source==='demo' ||
        !['completed', 'uncertain', 'failed', 'unavailable'].includes(result.status) ||
        (result.status === 'completed' &&
          (!Number.isFinite(result.score) || result.score < 0 || result.score > 100))
      )
        ctx.fail('INVALID_RESPONSE', 'Invalid branch analysis response.');
      return result;
    }
    const a = ctx.requireAccount(['Admin', 'Organization']),
      data = ctx.db(),
      branch = data.branches.find((b) => b.id === branchId);
    if (!branch || !ctx.own(data, a, 'branches', branch))
      ctx.fail('FORBIDDEN', 'Select an owned branch.');
    if (!ctx.cfg.demoBranchAnalysis)
      ctx.fail('INTEGRATION_UNAVAILABLE', 'Demo analysis is disabled. Real AI requires a server integration.');
    if (branch.isDeleted) ctx.fail('NOT_FOUND', 'Branch unavailable.');
    const raw = branch.accessibility || branch.accessibilityFeatures || {};
    const answers = Array.isArray(raw)
      ? Object.fromEntries(raw.map(x => [x.key || x.id, x.status ?? x.value]))
      : raw;
    const keys = ['accessibleEntrance','entranceRamp','accessibleParking','elevator','widePathways','accessibleRestroom','seating','hearingSupport','brailleSigns','tactilePaving','staffAssistance','wheelchairAvailable','automaticDoors'];
    const observations = keys.map(key => {
      const input = answers[key];
      const value = input && typeof input === 'object' ? input.status ?? input.value : input;
      const state = value === true || ['available','yes'].includes(value) ? 'available'
        : value === false || ['not-available','no'].includes(value) ? 'unavailable' : 'unknown';
      return {key, state, source:'saved-declaration', confidence:null, evidenceReferences:[]};
    });
    const evidenceVersion = JSON.stringify({accessibility:raw,photos:branch.photos || []});
    const review = {
      status:'completed', source:'demo', demo:true, score:null,
      analyzedAt:ctx.now(), evidenceVersion, observations,
      summary:'محاكاة محلية تلخّص البيانات المسجلة فقط؛ لم تُحلل الصور ولم يُجرَ تحقق فعلي.',
      limitations:['Not AI or field verification.','Photographs are not analyzed.','Unknown facilities remain unknown.'],
      recommendations:observations.filter(x=>x.state==='unknown').map(x=>'تحقق من المرفق قبل الاعتماد: '+x.key),
    };
    branch.aiReview = review;
    branch.scoreSource = 'demo';
    branch.accessibilityScore = null;
    branch.score = null;
    branch.completedSteps = {...branch.completedSteps, aiReview:true};
    branch.updatedAt = ctx.now();
    ctx.audit(data,a,'Run labelled demo accessibility summary','branches',branch.id,'No provider call, image inference, score, approval or publication.');
    ctx.put(data);
    return ctx.copy(review);
  };
  ctx.external = async function external(kind, input = {}, options = {}) {
    if (kind === 'ai/branch-analysis') return ctx.analyzeBranch(input.branchId);
    if (
      ['auth/change-password', 'auth/reset-password'].includes(kind) &&
      !window.WusoolPasswordPolicy.accepts(input.newPassword || input.password || '', 'change')
    )
      ctx.fail('VALIDATION_ERROR', 'Use 6+ characters, an uppercase letter, a number, and @ or _.');
    const allowed = {
      'auth/recovery': ['email'],
      'auth/reset-password': ['email', 'token', 'code', 'newPassword'],
      'auth/change-password': ['currentPassword', 'newPassword'],
      'payments/checkout': ['planId', 'billingCycle', 'termsAccepted'],
      'payments/status': ['checkoutId'],
      'payments/customer-portal': ['returnUrl'],
      'subscriptions/auto-renew': ['enabled', 'subscriptionId', 'expectedRevision'],
      'admin/sessions/revoke': ['ids'],
      'admin/impersonation': ['targetId', 'userId', 'organizationId', 'reason'],
      'ai/copilot': ['question'],
      'ai/reports': ['branchId'],
      'ai/accessibility-report': ['branchId', 'documentId'],
      'ai/surroundings': ['branchId', 'documentId'],
      'ai/assistant': ['question', 'branchId', 'conversationId'],
      'navigation/guidance': [
        'branchId',
        'bookingId',
        'destination',
        'documentId',
        'instructionId',
      ],
      'navigation/status': ['bookingId', 'branchId'],
    };
    if (!allowed[kind]) ctx.fail('INVALID_ENDPOINT', 'Unsupported external operation.');
    if (ctx.cfg.mode === 'local')
      ctx.fail(
        'INTEGRATION_UNAVAILABLE',
        `${kind} requires a configured backend integration. No external operation occurred.`,
      );
    if (input.messageInput && !input.question) input = { ...input, question: input.messageInput };
    const body = Object.fromEntries(
      allowed[kind]
        .filter((key) => input[key] !== undefined && input[key] !== null)
        .map((key) => [key, input[key]]),
    );
    const headers = {};
    if (kind === 'payments/checkout') {
      if (!options.idempotencyKey) ctx.fail('IDEMPOTENCY_REQUIRED', 'Checkout retry key required.');
      if (
        !body.planId ||
        !['monthly', 'annual'].includes(body.billingCycle) ||
        body.termsAccepted !== true
      )
        ctx.fail('VALIDATION_ERROR', 'Choose a plan, billing cycle and accept the terms.');
      headers['Idempotency-Key'] = options.idempotencyKey;
    }
    if (kind === 'payments/status' && !body.checkoutId)
      ctx.fail('VALIDATION_ERROR', 'Checkout identifier required.');
    return ctx.request('/' + kind, { method: 'POST', body, headers });
  };
  ctx.getRuntimeErrors = async function getRuntimeErrors() {
    if (ctx.cfg.mode === 'api') return ctx.request('/admin/errors');
    ctx.requireAccount(['Admin']);
    return JSON.parse(ctx.db().settings.wusoolRuntimeErrors || '[]');
  };
  ctx.reportRuntimeError = async function reportRuntimeError(entry) {
    const dto = {
      id: ctx.id('error'),
      type: entry.type || 'JavaScript',
      message: String(entry.message || 'Unknown error').slice(0, 2000),
      source: String(entry.source || '').split('?')[0],
      line: Number(entry.line) || 0,
      createdAt: ctx.now(),
    };
    if (ctx.cfg.mode === 'api')
      return ctx.request('/telemetry/errors', {
        method: 'POST',
        body: dto,
      });
    const data = ctx.db();
    const events = JSON.parse(data.settings.wusoolRuntimeErrors || '[]');
    events.unshift(dto);
    data.settings.wusoolRuntimeErrors = JSON.stringify(events.slice(0, 100));
    ctx.put(data);
    return dto;
  };
});
// Catalog values are server-authoritative in API mode. These local fixtures are explicit demos.
window.WusoolServiceModules.push(function registerPlans(ctx) {
  ctx.getPlans = async () => {
    const result =
      ctx.cfg.mode === 'api'
        ? await ctx.listAll('plans')
        : {
            items: [
              {
                id: 'single',
                name: 'Single Branch',
                monthlyPrice: 25,
                branchLimit: 1,
                annualDiscount: 0.1,
                currency: 'JOD',
                active: true,
              },
              {
                id: 'multi',
                name: 'Multi Branch',
                monthlyPrice: 75,
                branchLimit: 5,
                annualDiscount: 0.1,
                currency: 'JOD',
                active: true,
              },
              {
                id: 'enterprise',
                name: 'Enterprise',
                monthlyPrice: 150,
                branchLimit: 15,
                annualDiscount: 0.1,
                currency: 'JOD',
                active: true,
              },
            ],
            total: 3,
            page: 1,
            pageSize: 500,
          };
    if(ctx.cfg.mode==='local'){const saved=ctx.db().settings.enterpriseAdditionalBranchPrice;const unit=saved==null?10:Number(saved);result.items=result.items.map(p=>p.id==='enterprise'?{...p,additionalBranchPrice:unit}:p);}
    if (
      !result.items.every(
        (plan) =>
          typeof plan.id === 'string' &&
          typeof plan.name === 'string' &&
          Number.isFinite(plan.monthlyPrice) &&
          plan.monthlyPrice >= 0 &&
          Number.isInteger(plan.branchLimit) &&
          plan.branchLimit > 0 &&
          Number.isFinite(plan.annualDiscount) &&
          plan.annualDiscount >= 0 &&
          plan.annualDiscount <= 1 &&
          plan.currency === 'JOD',
      )
    )
      ctx.fail('INVALID_RESPONSE', 'The server returned an invalid plan catalog.');
    return result;
  };
});

// One quote contract; existing subscriptions retain their own pricing snapshot.
window.WusoolServiceModules.push(function registerCapacityPricing(ctx){
 ctx.effectiveBranchCapacity=subscription=>{const value=subscription?.entitlements?.branches ?? subscription?.branchLimit;const n=Number(value);return Number.isSafeInteger(n)&&n>0?n:0;};
 ctx.quoteSubscription=(plan,capacity=plan.branchLimit,cycle='monthly')=>{
  capacity=Number(capacity);
  if(!['monthly','annual'].includes(cycle))ctx.fail('INVALID_BILLING_CYCLE','Choose monthly or annual billing.');
  if(!Number.isSafeInteger(capacity)||capacity<plan.branchLimit||(!['enterprise'].includes(plan.id)&&capacity!==plan.branchLimit))ctx.fail('INVALID_CAPACITY','Choose a valid branch capacity.');
  if(plan.id==='enterprise'&&(!Number.isFinite(Number(plan.additionalBranchPrice))||Number(plan.additionalBranchPrice)<0))ctx.fail('INVALID_PRICE','Enterprise additional branch pricing is not configured.');
  const extra=capacity-plan.branchLimit,unit=Math.round(Number(plan.additionalBranchPrice||0)*1000),base=Math.round(Number(plan.monthlyPrice)*1000),monthly=base+extra*unit;
  if(!Number.isSafeInteger(monthly)||monthly<0)ctx.fail('INVALID_PRICE','Invalid pricing configuration.');
  let total = monthly;
  if (cycle === 'annual') {
    const annualBase = monthly * 12;
    if (!Number.isSafeInteger(annualBase)) ctx.fail('INVALID_PRICE', 'Annual pricing exceeds the supported monetary range.');
    total = Math.round(annualBase * (1 - plan.annualDiscount));
  }
  if(!Number.isSafeInteger(total)||total<0)ctx.fail('INVALID_PRICE','Annual pricing exceeds the supported monetary range.');
  return {capacity,includedCapacity:plan.branchLimit,extraBranches:extra,unitPrice:unit/1000,basePrice:base/1000,monthlyPrice:monthly/1000,totalPrice:total/1000,currency:'JOD',billingCycle:cycle,annualDiscount:plan.annualDiscount};
 };
 ctx.setEnterpriseBranchPrice=async value=>{const actor=await ctx.getCurrentAccount();if(actor?.role!=='Admin')ctx.fail('FORBIDDEN','Admin access required.');value=Number(value);if(!Number.isFinite(value)||value<0||Math.abs(Math.round(value*1000)-value*1000)>0.000001)ctx.fail('INVALID_PRICE','Use a non-negative JOD price with at most three decimals.');if(ctx.cfg.mode==='api')return ctx.request('/plans/enterprise/branch-price',{method:'PUT',body:{additionalBranchPrice:value}});const data=ctx.db();data.settings.enterpriseAdditionalBranchPrice=value;ctx.audit(data,actor,'Configure Enterprise branch price','plans','enterprise','Future quotes only: '+value+' JOD');ctx.put(data);return value;};
});
