'use strict';
// auth: registers responsibilities against a private shared context.
window.WusoolServiceModules.push(function registerauth(ctx) {
  ctx.hash = async function hash(password, salt) {
    if (!crypto?.subtle)
      ctx.fail(
        'LOCAL_CONTEXT_REQUIRED',
        'Open the project using Live Server at localhost or 127.0.0.1, or HTTPS. Browser cryptography is unavailable at this address.',
      );
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256,
    );
    return Array.from(new Uint8Array(bits), (x) => x.toString(16).padStart(2, '0')).join('');
  };
  ctx.resetAccountAccess = async function resetAccountAccess(kind, accountId) {
    if (!['users', 'organizations'].includes(kind))
      ctx.fail('INVALID_REFERENCE', 'Choose a user or organization.');
    if (ctx.cfg.mode === 'api')
      return ctx.request('/' + kind + '/' + encodeURIComponent(accountId) + '/reset-access', {
        method: 'POST',
        body: {
          requirePasswordChange: true,
        },
      });
    const actor = ctx.requireAccount(['Admin']);
    let data = ctx.db(),
      account = data[kind].find((x) => x.id === accountId && !x.isDeleted);
    if (!account) ctx.fail('NOT_FOUND', 'Account not found.');
    if (account.role === 'Admin')
      ctx.fail('ADMIN_PROTECTED', 'Use the protected administrator login.');
    if(kind==='organizations' && account.representativeAccountId && account.representativeAccountId!==account.id){
      if(!data.memberships.some(m=>m.organizationId===account.id&&m.accountId===account.representativeAccountId&&!m.isDeleted&&m.active!==false))ctx.fail('REPRESENTATIVE_REQUIRED','Repair the primary representative assignment before resetting access.');
      return ctx.resetAccountAccess('users',account.representativeAccountId);
    }
    if(kind==='organizations' && (!data.memberships.some(m=>m.organizationId===accountId&&m.accountId===accountId&&!m.isDeleted&&m.active!==false) || ((account.imported||account.directoryOnly||account.approvalStatus==='unclaimed')&&!account.adoption)))
      ctx.fail('REPRESENTATIVE_REQUIRED','Assign an authorized project representative before resetting access. Public contact emails cannot receive login credentials.');
    const temporaryAccessCode =
        'Wusool@' + crypto.randomUUID().replace(/-/g, '').slice(0, 12) + '1',
      salt = crypto.randomUUID(),
      verifier = await ctx.hash(temporaryAccessCode, salt);
    data = ctx.db();
    account = data[kind].find((x) => x.id === accountId && !x.isDeleted);
    if (!account) ctx.fail('NOT_FOUND', 'Account not found.');
    data.credentials[accountId] = {
      salt,
      verifier,
    };
    account.requiresInitialSetup = true;
    account.updatedAt = ctx.now();
    data.revocations[accountId] = (data.revocations[accountId] || 0) + 1;
    ctx.audit(
      data,
      actor,
      'Reset account access',
      kind,
      accountId,
      'New temporary password issued; first-login change required.',
    );
    ctx.put(data);
    return {
      account: ctx.accountDto(account),
      temporaryAccessCode,
      delivery: {
        status: 'local-preview',
        message: 'No email sent. Copy this temporary password and share it privately.',
      },
    };
  };
  ctx.register = async function register(input, role = 'User') {
    if (role === 'Organization' && ('latitude' in input || 'longitude' in input))
      input = {
        ...input,
        ...window.WusoolLocation.fields(input),
      };
    if (
      !window.WusoolPasswordPolicy.accepts(
        input.password || '',
        role === 'Organization' ? 'organizationRegistration' : 'userRegistration',
      )
    )
      ctx.fail('VALIDATION_ERROR', 'Use 6+ characters, an uppercase letter, a number, and @ or _.');
    if (ctx.cfg.mode === 'api')
      return ctx.accountDto(
        await ctx.request('/auth/register', {
          method: 'POST',
          body: {
            ...input,
            role,
          },
        }),
      );
    const email = String(input.email || '')
      .trim()
      .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || String(input.password || '').length < 6)
      ctx.fail(
        'VALIDATION_ERROR',
        'Enter a valid email and password meeting the configured policy.',
      );
    if (!['User', 'Organization'].includes(role))
      ctx.fail('FORBIDDEN', 'Public administrator registration is unavailable.');
    let data = ctx.db();
    if ([...data.users, ...data.organizations].some((x) => !x.isDeleted && x.email === email))
      ctx.fail('EMAIL_EXISTS', 'An account already exists for this email.');
    const salt = crypto.randomUUID(),
      verifier = await ctx.hash(input.password, salt);
    data = ctx.db();
    if ([...data.users, ...data.organizations].some((x) => !x.isDeleted && x.email === email))
      ctx.fail('EMAIL_EXISTS', 'An account already exists for this email.');
    const kind = role === 'Organization' ? 'organizations' : 'users';
    const x = ctx.normalize(
      kind,
      {
        ...input,
        email,
        id: ctx.id(role.toLowerCase()),
      },
      null,
      null,
    );
    data[kind].push(x);
    data.credentials[x.id] = {
      salt,
      verifier,
    };
    if (role === 'Organization') {
      data.applications.push({
        id: ctx.id('application'),
        organizationId: x.id,
        status: 'pending',
        representativeName: input.representativeName || '',
        registrationNumber: input.registrationNumber || '',
        documentStatus: 'preview-only',
        createdAt: ctx.now(),
      });
      data.memberships.push({
        id: ctx.id('membership'),
        organizationId: x.id,
        accountId: x.id,
        role: 'owner',
      });

    }
    ctx.audit(data, null, 'Register', kind, x.id);
    ctx.put(data);
    return ctx.accountDto({
      ...x,
      role,
    });
  };
  ctx.login = async function login(email, password, role = 'User') {
    if (!['User', 'Organization', 'Admin'].includes(role))
      ctx.fail('FORBIDDEN', 'Choose a valid account role.');
    if (!window.WusoolPasswordPolicy.accepts(password || '', 'login'))
      ctx.fail('PASSWORD_POLICY', 'Use 6+ characters, an uppercase letter, a number, and @ or _.');
    if (ctx.cfg.mode === 'api') {
      const a = await ctx.request('/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
          role,
        },
      });
      if (
        !a?.id ||
        !['User', 'Organization', 'Admin'].includes(a.role) ||
        (a.authenticationStatus && a.authenticationStatus !== 'authenticated')
      )
        ctx.fail(
          'AUTHENTICATION_INCOMPLETE',
          'Complete the backend authentication challenge before signing in.',
        );
      if (['blocked', 'suspended', 'disabled'].includes(a.status)) {
        ctx.clearSession();
        ctx.fail('ACCOUNT_BLOCKED', 'Account is unavailable.');
      }
      window.WusoolHttp.invalidate();
      window.dispatchEvent(
        new CustomEvent('wusool:account-changed', { detail: { id: a.id, role: a.role } }),
      );
      return ctx.accountDto(a);
    }
    const data = ctx.db();
    let kind = role === 'Organization' ? 'organizations' : 'users';
    let a = data[kind].find(
      (x) =>
        !x.isDeleted &&
        x.email === String(email).trim().toLowerCase() &&
        (role !== 'Admin' || x.role === 'Admin'),
    );
    let membership;
    if(role==='Organization'){
      const user=data.users.find(x=>!x.isDeleted&&x.role!=='Admin'&&x.email===String(email).trim().toLowerCase());
      const matches=user?data.memberships.filter(m=>m.accountId===user.id&&!m.isDeleted&&m.active!==false):[];
      if(matches.length>1)ctx.fail('ORGANIZATION_SELECTION_REQUIRED','Multiple institution assignments found. Ask Admin to choose a primary institution for this login.');
      if(user&&matches.length){a=user;kind='users';membership=matches[0];}
      else if(user&&!a)ctx.fail('REPRESENTATIVE_REQUIRED','Ask Admin to assign your account to an institution.');
    }
    if (!a) ctx.fail('INVALID_CREDENTIALS', 'The email or password is incorrect.');
    if (a.isDeleted || ['blocked', 'suspended', 'disabled'].includes(a.status))
      ctx.fail('ACCOUNT_BLOCKED', 'Account has been blocked or disabled. Contact support.');
    if(role==='Organization' && kind==='organizations' && (!data.memberships.some(m=>m.organizationId===a.id&&m.accountId===a.id&&!m.isDeleted&&m.active!==false)||((a.imported||a.directoryOnly||a.approvalStatus==='unclaimed')&&!a.adoption)))
      ctx.fail('REPRESENTATIVE_REQUIRED','Ask Admin to assign your project representative account to this institution. Public contact details do not authorize sign-in.');
    const c = data.credentials[a.id];
    if (!c?.salt || !c?.verifier)
      ctx.fail(
        'CREDENTIALS_MISSING',
        'This account has no saved login credential. Ask the administrator to issue a new temporary password; account data has not been deleted.',
      );
    if ((await ctx.hash(password, c.salt)) !== c.verifier)
      ctx.fail('INVALID_CREDENTIALS', 'The email or password is incorrect.');
    ctx.storage.session.setItem(
      ctx.SESSION,
      JSON.stringify({
        id: a.id,
        role,
        accountKind:kind,
        ...(membership?{organizationId:membership.organizationId}:{}),
        version: data.revocations[a.id] || 0,
      }),
    );
    window.dispatchEvent(
      new CustomEvent('wusool:account-changed', {
        detail: {
          id: a.id,
          role,
        },
      }),
    );
    return ctx.current();
  };
  ctx.validateAccountInput = function validateAccountInput(kind, input) {
    const errors = {};
    const value = (key) => String(input[key] || '').trim();
    if (value('name').length < 2 || value('name').length > 120)
      errors.name = 'Enter a name between 2 and 120 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email')) || value('email').length > 254)
      errors.email = 'Enter a valid email address.';
    const phone = value('phone').replace(/[\s()-]/g, '');
    if (!/^(?:07[789]\d{7}|\+9627[789]\d{7}|\+\d{8,15})$/.test(phone))
      errors.phone =
        'Enter a Jordanian mobile number (07XXXXXXXX) or an international number starting with +.';
    if (value('city').length < 2 || value('city').length > 80)
      errors.city = 'Enter a city between 2 and 80 characters.';
    if (kind === 'organizations') {
      if (value('address').length < 3 || value('address').length > 250)
        errors.address = 'Enter an address between 3 and 250 characters.';
      if (!value('type')) errors.type = 'Select an organization type.';
      if (value('website')) {
        try {
          const url = new URL(value('website'));
          if (
            !['http:', 'https:'].includes(url.protocol) ||
            !url.hostname.includes('.') ||
            url.username ||
            url.password
          )
            throw Error();
        } catch {
          errors.website =
            'Enter a full website URL, such as https://example.com, or leave it empty.';
        }
      }
    }
    if (value('notes').length > 1000) errors.notes = 'Notes must be 1000 characters or fewer.';
    return errors;
  };
  ctx.createManagedAccount = async function createManagedAccount(kind, input) {
    if (!['users', 'organizations'].includes(kind))
      ctx.fail('INVALID_ENTITY', 'Choose a user or organization.');
    const errors = ctx.validateAccountInput(kind, input);
    if (Object.keys(errors).length)
      throw Object.assign(new Error(Object.values(errors)[0]), {
        code: 'VALIDATION_ERROR',
        fields: errors,
      });
    if (ctx.cfg.mode === 'api')
      return ctx.request('/admin/accounts', {
        method: 'POST',
        body: {
          kind,
          account: input,
          sendInvitation: true,
          requireCredentialChange: true,
        },
      });
    ctx.requireAccount(['Admin']);
    const account = await ctx.save(kind, input),
      data = ctx.db();
    const temporaryAccessCode = 'W@' + crypto.randomUUID().replace(/-/g, '').slice(0, 18) + '7';
    const salt = crypto.randomUUID();
    data.credentials[account.id] = {
      salt,
      verifier: await ctx.hash(temporaryAccessCode, salt),
    };
    data[kind].find((x) => x.id === account.id).requiresInitialSetup = true;
    if (kind === 'organizations')
      data.memberships.push({
        id: ctx.id('membership'),
        organizationId: account.id,
        accountId: account.id,
        role: 'owner',
      });
    ctx.audit(
      data,
      ctx.current(data),
      'Create invitation',
      kind,
      account.id,
      'Local preview; email not sent',
    );
    ctx.put(data);
    return {
      account: ctx.accountDto(data[kind].find((x) => x.id === account.id)),
      deliveryStatus: 'not-sent-local',
      temporaryAccessCode,
    };
  };
  ctx.changeInitialPassword = async function changeInitialPassword(currentPassword, newPassword) {
    if (!window.WusoolPasswordPolicy.accepts(newPassword || '', 'userRegistration'))
      ctx.fail('PASSWORD_POLICY', 'Use 6+ characters, an uppercase letter, a number, and @ or _.');
    if (currentPassword === newPassword)
      ctx.fail('VALIDATION_ERROR', 'Choose a different password from the temporary one.');
    if (ctx.cfg.mode === 'api')
      return ctx.accountDto(
        await ctx.request('/auth/initial-password', {
          method: 'POST',
          body: {
            currentPassword,
            newPassword,
          },
        }),
      );
    let data = ctx.db();
    const a = ctx.current(data);
    if (!a) ctx.fail('UNAUTHENTICATED', 'Sign in first.');
    if (!a.requiresInitialSetup)
      ctx.fail('INVALID_TRANSITION', 'This account does not require first-login setup.');
    const credentialId=a.accountId||a.id;
    const c = data.credentials[credentialId];
    if (!c || (await ctx.hash(currentPassword, c.salt)) !== c.verifier)
      ctx.fail('INVALID_CREDENTIALS', 'The temporary password is incorrect.');
    const salt = crypto.randomUUID(), verifier=await ctx.hash(newPassword,salt);
    data=ctx.db();
    const latest=ctx.current(data);
    if((latest?.accountId||latest?.id)!==credentialId||!latest.requiresInitialSetup||data.credentials[credentialId]?.verifier!==c.verifier)ctx.fail('STALE_ACCOUNT','Account access changed during password setup. Sign in again with the latest temporary password.');
    data.credentials[credentialId] = {
      salt,
      verifier,
    };
    const kind = a.accountId ? 'users' : a.role === 'Organization' ? 'organizations' : 'users',
      account = data[kind].find((x) => x.id === credentialId);
    account.requiresInitialSetup = false;
    data.revocations[credentialId] = (data.revocations[credentialId] || 0) + 1;
    ctx.audit(data, a, 'Initial credential change', kind, credentialId);
    const oldSession=ctx.session();
    ctx.storage.session.setItem(
      ctx.SESSION,
      JSON.stringify({
        ...oldSession,
        id: credentialId,
        role: a.role,
        version: data.revocations[credentialId],
      }),
    );
    try{ctx.put(data);}catch(error){ctx.storage.session.setItem(ctx.SESSION,JSON.stringify(oldSession));throw error;}
    return ctx.current(data);
  };
  ctx.seedAdmin = async function seedAdmin() {
    if (ctx.cfg.mode !== 'local')
      ctx.fail('DEVELOPMENT_ONLY', 'Fixture is available only locally.');
    let data = ctx.db();
    const email = 'admin@wusool.com';
    let changed = false;
    let account =
      data.users.find((x) => x.email === email) ||
      data.users.find((x) => x.id === 'admin-local') ||
      data.users.find((x) => x.role === 'Admin');
    if (!account) {
      account = {
        id: 'admin-local',
        name: 'Wusool Administrator',
        email,
        role: 'Admin',
        status: 'active',
        accessibilityPreferences: [],
        savedPlaces: [],
        createdAt: ctx.now(),
      };
      data.users.push(account);
      changed = true;
    }
    if (
      !data.settings.canonicalAdminProvisioned ||
      !data.credentials[account.id]?.salt ||
      !data.credentials[account.id]?.verifier
    ) {
      const salt = crypto.randomUUID(),
        verifier = await ctx.hash('WusoolAdmin2026@', salt);
      const pending = account;
      data = ctx.db();
      account = data.users.find((x) => x.id === pending.id) || pending;
      if (!data.users.some((x) => x.id === account.id)) data.users.push(account);
      data.credentials[account.id] = {
        salt,
        verifier,
      };
      data.settings.canonicalAdminProvisioned = true;
      changed = true;
    }
    for (const other of data.users)
      if (other.id !== account.id && other.role === 'Admin') {
        other.role = 'User';
        changed = true;
      }
    if (
      account.email !== email ||
      account.role !== 'Admin' ||
      account.status !== 'active' ||
      account.isDeleted ||
      account.requiresInitialSetup
    ) {
      Object.assign(account, {
        email,
        role: 'Admin',
        status: 'active',
        isDeleted: false,
        requiresInitialSetup: false,
      });
      changed = true;
    }
    if (changed) ctx.put(data);
  };
  ctx.getCurrentAccount = async function getCurrentAccount() {
    if (ctx.cfg.mode === 'local') return ctx.current();
    const account = ctx.accountDto(await ctx.request('/auth/me'));
    if (account && ['blocked', 'suspended', 'disabled'].includes(account.status)) {
      ctx.clearSession();
      ctx.fail(
        'ACCOUNT_BLOCKED',
        'Account is unavailable. Sign in again after contacting support.',
      );
    }
    return account;
  };
  ctx.logout = async function logout() {
    try {
      if (ctx.cfg.mode === 'api')
        await ctx.request('/auth/logout', {
          method: 'POST',
        });
    } finally {
      ctx.clearSession();
    }
  };
});
