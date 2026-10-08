WusoolUI.enqueue(async () => {
  /* Shared presentation only: authentication remains in each account's login script. */
  (() => {
    const registering = !!document.querySelector('#registerForm,#organizationRegisterForm');
    const org = !!document.querySelector('#organizationLoginForm,#organizationRegisterForm');
    const visual = document.querySelector('.login-hero,.login-visual-section,.register-hero,.register-information');
    if (!visual) return;
    document.body.classList.add('auth-cinematic');
    if (registering) document.body.classList.add('auth-register-cinematic');
    visual.classList.add('auth-scene');
    WusoolUI.html(visual, `<img class="auth-scene-photo" src="../../assets/images/wusool-login-campus.png" alt="An accessible campus courtyard with a welcoming entrance" fetchpriority="high"><div class="auth-scene-shade"></div><div class="auth-scene-top"><a href="../../visitor/html/home.html" class="auth-wordmark">Wusool<span>.</span></a><span class="auth-scene-tag">EVERY JOURNEY BELONGS</span></div><div class="auth-scene-copy"><span class="auth-eyebrow">${org ? 'OPEN DOORS. CREATE POSSIBILITIES.' : 'YOUR NEXT CHAPTER STARTS HERE.'}</span><h2>${org ? 'Better places.<br>A world of possibility.' : 'A world closer.<br>A journey made yours.'}</h2><p>${org ? 'Give every visitor the information they need to arrive with confidence.' : 'Explore places, plan your visit, and move forward with confidence.'}</p><div class="auth-scene-note"><span class="auth-note-icon" aria-hidden="true">↗</span><div><strong>${org ? 'Build a more welcoming experience' : 'Find your way forward'}</strong><small>${org ? 'Branches · Accessibility · Community' : 'Discover · Understand · Arrive'}</small></div></div></div>`);
    const form = document.querySelector('#loginForm,#organizationLoginForm,#registerForm,#organizationRegisterForm');
    const panel = document.querySelector('.login-form-wrapper,.register-form-wrapper') || document.querySelector('.login-form-section,.register-form-section');
    const switcher = document.createElement('nav');
    switcher.className = 'auth-account-switch';
    switcher.setAttribute('aria-label', 'Account type');
    WusoolUI.html(switcher, `<a href="../../visitor/html/${registering ? 'register' : 'login'}.html" ${!org ? 'aria-current="page"' : ''}>Personal account</a><a href="../../org/html/organization-${registering ? 'register' : 'login'}.html" ${org ? 'aria-current="page"' : ''}>Organization</a>`);
    if (!form.querySelector('.account-type-grid')) panel.prepend(switcher);
    const password = form.querySelector('input[type="password"]');
    const hint = document.createElement('p');
    hint.className = 'auth-caps-hint';
    hint.textContent = 'Caps Lock is on.';
    hint.hidden = true;
    hint.setAttribute('role', 'status');
    password.after(hint);
    WusoolUI.listen(password, 'keyup', e => hint.hidden = !e.getModifierState('CapsLock'));
    WusoolUI.listen(password, 'blur', () => hint.hidden = true);
    form.querySelectorAll('input:not([type=checkbox])').forEach(input => {
      const group = input.closest('.input-group');
      WusoolUI.listen(input, 'focus', () => group?.classList.add('auth-field-active'));
      WusoolUI.listen(input, 'blur', () => group?.classList.remove('auth-field-active'));
    });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer:fine)').matches) {
      let frame = 0,
        x = 0,
        y = 0;
      WusoolUI.listen(visual, 'pointermove', e => {
        const r = visual.getBoundingClientRect();
        x = (e.clientX - r.left) / r.width - .5;
        y = (e.clientY - r.top) / r.height - .5;
        if (!frame) frame = requestAnimationFrame(() => {
          frame = 0;
          visual.style.setProperty('--auth-x', `${x * 12}px`);
          visual.style.setProperty('--auth-y', `${y * 10}px`);
        });
      }, {
        passive: true
      });
      WusoolUI.listen(visual, 'pointerleave', () => {
        x = y = 0;
        visual.style.setProperty('--auth-x', '0px');
        visual.style.setProperty('--auth-y', '0px');
      });
    }
  })();
});
