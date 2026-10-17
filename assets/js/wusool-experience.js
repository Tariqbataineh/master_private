WusoolUI.enqueue(async () => {
  (() => {
    'use strict';

    const doc = document;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const escapeText = (value) =>
      String(value ?? '').replace(
        /[&<>"']/g,
        (char) =>
          ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
          })[char],
      );

    /* ---------------------------------------------------------
       Card choreography: one reusable behavior for all modules.
       --------------------------------------------------------- */
    let cardSequence = 0;
    const decorateCard = (card) => {
      if (
        !(card instanceof HTMLElement) ||
        card.closest('.modal') ||
        card.classList.contains('wx-card-motion')
      )
        return;
      card.classList.add('wx-card-motion');
      card.style.setProperty('--wx-seq', cardSequence++ % 8);
      if (!card.querySelector(':scope > .wx-card-orbit')) {
        const orbit = doc.createElement('span');
        orbit.className = 'wx-card-orbit';
        orbit.setAttribute('aria-hidden', 'true');
        card.appendChild(orbit);
      }
    };
    doc.querySelectorAll('.wm-interactive-surface').forEach(decorateCard);
    WusoolUI.listen(doc, 'wusool:surface-ready', (event) => decorateCard(event.target));

    // Only decorate newly-added cards. The previous implementation rescanned
    // the entire document after every DOM mutation, which was a major source
    // of dashboard/login jank.
    const cardObserver = new MutationObserver((mutations) => {
      const roots = [];
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) roots.push(node);
        });
      });
      if (!roots.length) return;
      const run = () =>
        roots.forEach((node) => {
          if (!node.isConnected) return;
          if (node.matches?.('.wm-interactive-surface')) decorateCard(node);
          node.querySelectorAll?.('.wm-interactive-surface').forEach(decorateCard);
        });
      if ('requestIdleCallback' in window)
        requestIdleCallback(run, {
          timeout: 180,
        });
      else window.setTimeout(run, 36);
    });
    cardObserver.observe(doc.body, {
      childList: true,
      subtree: true,
    });

    /* ---------------------------------------------------------
       Live auth pass.
       --------------------------------------------------------- */
    const authConfig = (() => {
      if (doc.getElementById('registerForm')) {
        return {
          mount: '.register-hero .hero-content',
          type: 'Personal account',
          nameInput: '#fullName',
          emailInput: '#email',
          passwordInput: '#password',
          nameFallback: 'Your name',
          emailFallback: 'name@example.com',
        };
      }
      if (doc.getElementById('loginForm')) {
        return {
          mount: '.login-hero .hero-content',
          type: 'Personal access',
          emailInput: '#email',
          passwordInput: '#password',
          nameFallback: 'Welcome back',
          emailFallback: 'name@example.com',
          deriveName: true,
        };
      }
      if (doc.getElementById('organizationRegisterForm')) {
        return {
          mount: '.register-information > div, .register-information',
          type: 'Organization setup',
          nameInput: '#organizationName',
          secondaryInput: '#representativeName',
          emailInput: '#email',
          passwordInput: '#password',
          nameFallback: 'Your organization',
          emailFallback: 'admin@organization.com',
        };
      }
      if (doc.getElementById('organizationLoginForm')) {
        return {
          mount: '.login-visual-section > .d-flex',
          type: 'Organization portal',
          emailInput: '#email',
          passwordInput: '#password',
          nameFallback: 'Your organization',
          emailFallback: 'admin@organization.com',
        };
      }
      if (doc.getElementById('adminLoginForm')) {
        return {
          mount: '.admin-login-visual-content',
          type: 'Team access',
          emailInput: '#adminEmail',
          passwordInput: '#adminPassword',
          nameFallback: 'Team member',
          emailFallback: 'team@wusool.com',
          deriveName: true,
        };
      }
      return null;
    })();
    const humanize = (text) =>
      String(text || '')
        .replace(/[._-]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
    if (authConfig) {
      const mount = doc.querySelector(authConfig.mount);
      const nameInput = authConfig.nameInput ? doc.querySelector(authConfig.nameInput) : null;
      const secondaryInput = authConfig.secondaryInput
        ? doc.querySelector(authConfig.secondaryInput)
        : null;
      const emailInput = authConfig.emailInput ? doc.querySelector(authConfig.emailInput) : null;
      const passwordInput = authConfig.passwordInput
        ? doc.querySelector(authConfig.passwordInput)
        : null;
      if (mount && !mount.querySelector('.wx-auth-preview')) {
        const preview = doc.createElement('div');
        preview.className = 'wx-auth-preview';
        WusoolUI.html(
          preview,
          `
        <div class="wx-access-pass" aria-live="polite">
          <div class="wx-pass-glow" aria-hidden="true"></div>
          <div class="wx-pass-top">
            <div class="wx-pass-brand">
              <span class="wx-pass-brand-mark"><i class="bi bi-universal-access"></i></span>
              <span><strong>Wusool</strong><small>Secure access</small></span>
            </div>
            <span class="wx-pass-type">${escapeText(authConfig.type)}</span>
          </div>
          <div class="wx-pass-person">
            <div class="wx-pass-avatar" data-wx-avatar>W</div>
            <div class="wx-pass-copy">
              <small data-wx-secondary>${secondaryInput ? 'Responsible person' : 'Live identity'}</small>
              <strong data-wx-name>${escapeText(authConfig.nameFallback)}</strong>
              <div class="wx-pass-email" data-wx-email>${escapeText(authConfig.emailFallback)}</div>
            </div>
          </div>
          <div class="wx-pass-footer">
            <div class="wx-pass-secret">
              <small>Password</small>
              <strong data-wx-password>••••••••</strong>
            </div>
            <div class="wx-pass-status"><span></span>Live</div>
          </div>
        </div>
        <div class="wx-auth-caption"><i class="bi bi-stars"></i><span>Identity preview updates instantly while you type.</span></div>`,
        );
        const firstList = mount.querySelector(
          '.benefits-list, .visual-features, .registration-steps',
        );
        if (firstList) mount.insertBefore(preview, firstList);
        else mount.appendChild(preview);
        const card = preview.querySelector('.wx-access-pass');
        const nameNode = preview.querySelector('[data-wx-name]');
        const emailNode = preview.querySelector('[data-wx-email]');
        const avatarNode = preview.querySelector('[data-wx-avatar]');
        const secondaryNode = preview.querySelector('[data-wx-secondary]');
        const passwordNode = preview.querySelector('[data-wx-password]');
        const deriveDisplayName = () => {
          if (nameInput?.value.trim()) return nameInput.value.trim();
          const email = emailInput?.value.trim() || '';
          if (authConfig.deriveOrganization && email.includes('@')) {
            const domain = email.split('@')[1]?.split('.')[0] || '';
            return humanize(domain) || authConfig.nameFallback;
          }
          if (authConfig.deriveName && email)
            return humanize(email.split('@')[0]) || authConfig.nameFallback;
          return authConfig.nameFallback;
        };
        const updatePreview = (source) => {
          const displayName = deriveDisplayName();
          const email = emailInput?.value.trim() || authConfig.emailFallback;
          const secretLength = Math.max(8, Math.min(14, passwordInput?.value.length || 8));
          nameNode.textContent = displayName;
          emailNode.textContent = email;
          passwordNode.textContent = '•'.repeat(secretLength);
          avatarNode.textContent = (displayName.trim()[0] || 'W').toUpperCase();
          if (secondaryInput && secondaryNode) {
            secondaryNode.textContent = secondaryInput.value.trim() || 'Responsible person';
          }
          if (!reduceMotion) {
            card.classList.add('is-typing');
            window.clearTimeout(card._wxTypingTimer);
            card._wxTypingTimer = window.setTimeout(() => card.classList.remove('is-typing'), 220);
          }
          card.classList.toggle('is-password-active', source === passwordInput);
        };
        [nameInput, secondaryInput, emailInput, passwordInput].filter(Boolean).forEach((input) => {
          WusoolUI.listen(input, 'input', () => updatePreview(input));
          WusoolUI.listen(input, 'focus', () => updatePreview(input));
          WusoolUI.listen(input, 'blur', () => card.classList.remove('is-password-active'));
        });
        if (finePointer && !reduceMotion) {
          let cardRect = null;
          let cardFrame = 0;
          let lastEvent = null;
          const updateCardTilt = () => {
            cardFrame = 0;
            if (!lastEvent || !cardRect) return;
            const x = (lastEvent.clientX - cardRect.left) / cardRect.width - 0.5;
            const y = (lastEvent.clientY - cardRect.top) / cardRect.height - 0.5;
            card.style.setProperty('--wx-pass-rx', `${(-y * 6).toFixed(2)}deg`);
            card.style.setProperty('--wx-pass-ry', `${(x * 8).toFixed(2)}deg`);
          };
          WusoolUI.listen(
            card,
            'pointerenter',
            () => {
              cardRect = card.getBoundingClientRect();
            },
            {
              passive: true,
            },
          );
          WusoolUI.listen(
            card,
            'pointermove',
            (event) => {
              lastEvent = event;
              if (!cardFrame) cardFrame = requestAnimationFrame(updateCardTilt);
            },
            {
              passive: true,
            },
          );
          WusoolUI.listen(card, 'pointerleave', () => {
            cardRect = null;
            lastEvent = null;
            card.style.setProperty('--wx-pass-rx', '0deg');
            card.style.setProperty('--wx-pass-ry', '0deg');
          });
        }
        updatePreview(null);
      }
    }

    /* ---------------------------------------------------------
       Subscription payment card preview.
       --------------------------------------------------------- */
    const checkoutForm = doc.getElementById('checkoutForm');
    if (checkoutForm) {
      const cardholder = doc.getElementById('cardholderName');
      const cardNumber = doc.getElementById('cardNumber');
      const expiry = doc.getElementById('expiryDate');
      const cvv = doc.getElementById('securityCode');
      const paymentSection = cardholder?.closest('section');
      if (paymentSection && !paymentSection.querySelector('.wx-payment-stage')) {
        const stage = doc.createElement('div');
        stage.className = 'wx-payment-stage';
        WusoolUI.html(
          stage,
          `
        <div class="wx-payment-shell">
          <div class="wx-payment-card" aria-label="Live payment card preview">
            <div class="wx-card-face wx-card-front">
              <div class="wx-card-brand-row">
                <span class="wx-card-chip" aria-hidden="true"></span>
                <span class="wx-card-contactless" aria-hidden="true"><i class="bi bi-wifi"></i></span>
                <span class="wx-card-network" data-wx-network>VISA</span>
              </div>
              <div class="wx-card-number" data-wx-card-number>•••• •••• •••• ••••</div>
              <div class="wx-card-bottom">
                <div><small>Card holder</small><strong data-wx-card-name>YOUR NAME</strong></div>
                <div><small>Valid thru</small><strong data-wx-card-expiry>MM/YY</strong></div>
              </div>
              <div class="wx-card-watermark">WUSOOL</div>
            </div>
            <div class="wx-card-face wx-card-back">
              <div class="wx-card-magnetic"></div>
              <div class="wx-card-signature-row">
                <span>Authorized signature</span>
                <div class="wx-card-signature"><span data-wx-card-cvv>•••</span></div>
              </div>
              <div class="wx-card-back-note">Secure organization subscription preview</div>
              <div class="wx-card-network wx-card-network-back" data-wx-network-back>VISA</div>
            </div>
          </div>
          <div class="wx-payment-help"><i class="bi bi-arrow-repeat"></i> CVV focus flips the card. Details update live.</div>
        </div>`,
        );
        const notice = paymentSection.querySelector('.demo-notice');
        if (notice) paymentSection.insertBefore(stage, notice);
        else paymentSection.prepend(stage);
        const visualCard = stage.querySelector('.wx-payment-card');
        const numberNode = stage.querySelector('[data-wx-card-number]');
        const nameNode = stage.querySelector('[data-wx-card-name]');
        const expiryNode = stage.querySelector('[data-wx-card-expiry]');
        const cvvNode = stage.querySelector('[data-wx-card-cvv]');
        const networkNode = stage.querySelector('[data-wx-network]');
        const networkBackNode = stage.querySelector('[data-wx-network-back]');
        const updatePayment = () => {
          const digits = (cardNumber?.value || '').replace(/\D/g, '').slice(0, 16);
          const padded = (digits + '••••••••••••••••').slice(0, 16);
          numberNode.textContent = padded.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
          nameNode.textContent = (cardholder?.value.trim() || 'YOUR NAME').toUpperCase();
          expiryNode.textContent = expiry?.value.trim() || 'MM/YY';
          cvvNode.textContent = cvv?.value ? cvv.value.replace(/./g, '•') : '•••';
          const network = digits.startsWith('5') ? 'MC' : 'VISA';
          networkNode.textContent = network;
          if (networkBackNode) networkBackNode.textContent = network;
        };
        [cardholder, cardNumber, expiry, cvv]
          .filter(Boolean)
          .forEach((input) => WusoolUI.listen(input, 'input', updatePayment));
        WusoolUI.listen(cvv, 'focus', () => visualCard.classList.add('is-flipped'));
        WusoolUI.listen(cvv, 'blur', () => visualCard.classList.remove('is-flipped'));
        WusoolUI.listen(cardNumber, 'focus', () => visualCard.classList.remove('is-flipped'));
        WusoolUI.listen(cardholder, 'focus', () => visualCard.classList.remove('is-flipped'));
        WusoolUI.listen(expiry, 'focus', () => visualCard.classList.remove('is-flipped'));
        if (finePointer && !reduceMotion) {
          let visualRect = null;
          let visualFrame = 0;
          let visualEvent = null;
          const updateVisualCardTilt = () => {
            visualFrame = 0;
            if (!visualRect || !visualEvent || visualCard.classList.contains('is-flipped')) return;
            const x =
              Math.max(0, Math.min(1, (visualEvent.clientX - visualRect.left) / visualRect.width)) -
              0.5;
            const y =
              Math.max(0, Math.min(1, (visualEvent.clientY - visualRect.top) / visualRect.height)) -
              0.5;
            visualCard.style.setProperty('--wx-card-rx', `${(-y * 7).toFixed(2)}deg`);
            visualCard.style.setProperty('--wx-card-ry', `${(x * 9).toFixed(2)}deg`);
          };
          WusoolUI.listen(
            stage,
            'pointerenter',
            () => {
              visualRect = visualCard.getBoundingClientRect();
            },
            {
              passive: true,
            },
          );
          WusoolUI.listen(
            stage,
            'pointermove',
            (event) => {
              visualEvent = event;
              if (!visualFrame) visualFrame = requestAnimationFrame(updateVisualCardTilt);
            },
            {
              passive: true,
            },
          );
          WusoolUI.listen(stage, 'pointerleave', () => {
            visualRect = null;
            visualEvent = null;
            visualCard.style.setProperty('--wx-card-rx', '0deg');
            visualCard.style.setProperty('--wx-card-ry', '0deg');
          });
        }
        updatePayment();
      }
    }
  })();
});
