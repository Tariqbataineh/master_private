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
    const plans = {
      single: {
        name: 'Single Branch',
        limit: 1,
        price: 25,
      },
      multi: {
        name: 'Multi Branch',
        limit: 5,
        price: 75,
      },
      enterprise: {
        name: 'Enterprise',
        limit: 15,
        price: 150,
      },
    };
    const plan = plans[selected?.id];
    if (!plan) ctx.fail('PLAN_REQUIRED', 'Choose a subscription plan first.');
    const old = data.subscriptions.find(
      (x) => x.organizationId === a.id && !x.isDeleted && x.developmentOnly,
    );
    const cycle = selected.billingCycle === 'annual' ? 'annual' : 'monthly';
    const x = {
      id: old?.id || ctx.id('subscription'),
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
      quotedPrice: cycle === 'annual' ? plan.price * 12 * 0.9 : plan.price,
      createdAt: old?.createdAt || ctx.now(),
      updatedAt: ctx.now(),
      startDate: ctx.now(),
      isDeleted: false,
    };
    if (old) data.subscriptions[data.subscriptions.indexOf(old)] = x;
    else data.subscriptions.push(x);
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
    if (ctx.cfg.demoBranchPublication !== true || branch.scoreSource !== 'demo')
      ctx.fail('DEMO_PUBLICATION_DISABLED', 'Submit this branch for administrator approval.');
    if (branch.status === 'approved' && branch.demoPublication === true) return ctx.copy(branch);
    branch.status = 'approved';
    branch.isPublished = true;
    branch.demoPublication = true;
    branch.evidenceStatus = 'unverified';
    branch.statusLabel = 'Published — Demo';
    branch.completedSteps = {
      ...branch.completedSteps,
      submitted: true,
    };
    branch.submittedAt = ctx.now();
    branch.updatedAt = ctx.now();
    ctx.audit(
      data,
      a,
      'demo-branch-published',
      'branches',
      branchId,
      'Local demo publication only; no real administrator or AI verification.',
    );
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
    if (ctx.cfg.demoBranchAnalysis !== true)
      ctx.fail('INTEGRATION_UNAVAILABLE', 'Demo analysis is disabled. Configure the backend.');
    const checks = window.WusoolBranchWorkflow.checks(branch);
    if (['details', 'workingHours', 'accessibility', 'photos'].some((k) => !checks[k]))
      ctx.fail('BRANCH_INCOMPLETE', window.WusoolBranchWorkflow.explain(branch));
    const answers = Object.values(branch.accessibility || {}).map((v) =>
      String(v?.status || v).toLowerCase(),
    );
    const yes = answers.filter((v) => ['available', 'yes'].includes(v)).length;
    const unknown = answers.filter((v) => ['not-sure', 'unknown'].includes(v)).length;
    const score = Math.round((100 * yes) / Math.max(1, answers.length));
    const result = {
      id: ctx.id('demo-analysis'),
      branchId,
      status: 'completed',
      score,
      source: 'demo',
      isDemo: true,
      model: 'local-checklist-demo-v1',
      generatedAt: ctx.now(),
      message: 'Demo checklist estimate only. Images were not analyzed by AI.',
      findings: [
        {
          category: 'declared-accessibility',
          available: yes,
          unknown,
          total: answers.length,
        },
      ],
      recommendations: unknown
        ? ['Verify the unknown accessibility answers before a real assessment.']
        : ['Connect the backend for actual photo analysis.'],
    };
    branch.aiReview = {
      ...result,
    };
    branch.analysisId = result.id;
    branch.accessibilityScore = score;
    branch.score = score;
    branch.scoreSource = 'demo';
    branch.completedSteps = {
      ...branch.completedSteps,
      aiReview: true,
    };
    branch.updatedAt = ctx.now();
    ctx.audit(data, a, 'demo-branch-analysis', 'branches', branchId, result.message);
    ctx.put(data);
    return ctx.copy(result);
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
