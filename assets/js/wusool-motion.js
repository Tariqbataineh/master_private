WusoolUI.enqueue(async () => {
  /* ==========================================================
     WUSOOL MOTION SYSTEM
     Shared interaction runtime. No framework dependency.
     ========================================================== */
  (() => {
    'use strict';

    const doc = document;
    const root = doc.documentElement;
    const body = doc.body;
    if (!body || root.classList.contains('wusool-motion-enabled')) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    root.classList.add('wusool-motion-enabled');
    const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
    const rafThrottle = fn => {
      let frame = 0;
      return (...args) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          fn(...args);
        });
      };
    };

    /* ---------- Global UI layer ---------- */
    const progress = doc.createElement('div');
    progress.id = 'wusoolMotionProgress';
    progress.setAttribute('aria-hidden', 'true');
    body.appendChild(progress);
    const curtain = doc.createElement('div');
    curtain.id = 'wusoolPageCurtain';
    curtain.setAttribute('aria-hidden', 'true');
    WusoolUI.html(curtain, `
    <div class="wm-curtain-brand">
      <div class="wm-mark">W</div>
      <div class="wm-word">WUSOOL</div>
    </div>`);
    body.appendChild(curtain);
    const cursor = doc.createElement('div');
    cursor.id = 'wusoolCursorLight';
    cursor.setAttribute('aria-hidden', 'true');
    body.appendChild(cursor);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.add('wusool-page-ready'));
    });

    /* ---------- Scroll progress ---------- */
    const updateProgress = rafThrottle(() => {
      const max = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
      const ratio = clamp(window.scrollY / max, 0, 1);
      progress.style.transform = `scaleX(${ratio})`;
    });
    updateProgress();
    WusoolUI.listen(window, 'scroll', updateProgress, {
      passive: true
    });
    WusoolUI.listen(window, 'resize', updateProgress, {
      passive: true
    });

    /* ---------- Cursor light ---------- */
    // Update only when the pointer actually moves. This keeps the same visual
    // effect without running an endless requestAnimationFrame loop.
    if (finePointer && !reducedMotion) {
      const moveCursor = rafThrottle(event => {
        cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
        root.classList.add('wusool-pointer-active');
      });
      WusoolUI.listen(window, 'pointermove', moveCursor, {
        passive: true
      });
      WusoolUI.listen(window, 'pointerleave', () => root.classList.remove('wusool-pointer-active'));
    }

    /* ---------- Smart reveal choreography ---------- */
    const revealSelectors = ['main section', 'main .card', 'main [class*="card"]', 'main [class*="panel"]', 'main [class*="widget"]', 'main [class*="metric"]', 'main [class*="stat-"]', 'main [class*="summary"]', 'main [class*="chart"]', 'main .table-responsive', 'main form > .row', 'main form > .mb-3', 'main form > .mb-4', 'main .alert', 'main .list-group', 'main .accordion'];
    const revealSet = new Set();
    revealSelectors.forEach(selector => {
      try {
        doc.querySelectorAll(selector).forEach(el => revealSet.add(el));
      } catch (_) {
        if (WusoolServices.mode === "api") throw _;
      }
    });

    // Avoid hiding entire page shells / structural wrappers.
    const structural = el => {
      if (el.closest('.journey-popups-enabled')) return true;
      const tokens = [...el.classList].map(x => x.toLowerCase());
      const cls = tokens.join(' ');
      const nestedPiece = tokens.some(t => /(card|panel|widget)-(body|header|footer|title|text|content|icon|image|actions?)$/.test(t) || /^(card|panel|widget)-(body|header|footer|title|text|content|icon|image|actions?)/.test(t));
      return nestedPiece || cls.includes('sidebar') || cls.includes('navbar') || cls.includes('toolbar') || cls.includes('modal') || el.closest('.modal') || el.closest('[aria-hidden="true"]');
    };
    let revealIndex = 0;
    const revealPattern = ['up', 'left', 'up', 'right', 'up', 'zoom'];
    revealSet.forEach(el => {
      if (structural(el)) return;
      if (el.dataset.wusoolReveal) return;
      const variant = revealPattern[revealIndex % revealPattern.length];
      el.dataset.wusoolReveal = variant;
      el.style.setProperty('--wm-delay', `${revealIndex % 5 * 42}ms`);
      revealIndex++;
    });
    if (!reducedMotion && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('wm-visible');
          observer.unobserve(entry.target);
        });
      }, {
        threshold: .08,
        rootMargin: '0px 0px -7% 0px'
      });
      doc.querySelectorAll('[data-wusool-reveal]').forEach(el => revealObserver.observe(el));
    } else {
      doc.querySelectorAll('[data-wusool-reveal]').forEach(el => el.classList.add('wm-visible'));
    }

    /* ---------- Interactive surfaces ---------- */
    const surfaceSelectors = ['.card', '[class*="card"]', '[class*="metric"]', '[class*="stat-"]', '[class*="dashboard-widget"]', '[class*="feature-box"]', '[class*="place-item"]', '[class*="branch-item"]'].join(',');
    const isSurface = el => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.closest('.modal') || el.closest('.dropdown-menu')) return false;
      const tokens = [...el.classList].map(x => x.toLowerCase());
      const cls = tokens.join(' ');
      if (cls.includes('container') || cls.includes('sidebar') || cls.includes('navbar') || cls.includes('toolbar')) return false;
      if (tokens.some(t => /(card|panel|widget)-(body|header|footer|title|text|content|icon|image|actions?|link)$/.test(t) || /^(card|panel|widget)-(body|header|footer|title|text|content|icon|image|actions?|link)/.test(t))) return false;
      const surfaceLike = tokens.some(t => t === 'card' || t.endsWith('-card') || t.endsWith('-panel') || t.endsWith('-widget') || /^(metric|stat|summary|feature|place|branch)-.*(card|panel|box|item)$/.test(t) || /^(feature|place|branch)-(box|item)$/.test(t));
      if (!surfaceLike) return false;
      return true;
    };
    const surfaces = [...doc.querySelectorAll(surfaceSelectors)].filter(isSurface);
    surfaces.forEach(el => el.classList.add('wm-interactive-surface'));
    if (finePointer && !reducedMotion) {
      // One delegated pointer pipeline for every card instead of one listener
      // per card + one layout read on every pointer event.
      let activeSurface = null;
      let activeRect = null;
      const resetSurface = el => {
        if (!el) return;
        el.style.setProperty('--wm-tilt-x', '0deg');
        el.style.setProperty('--wm-tilt-y', '0deg');
        el.style.setProperty('--wm-mx', '50%');
        el.style.setProperty('--wm-my', '50%');
      };
      const refreshActiveRect = () => {
        if (activeSurface?.isConnected) activeRect = activeSurface.getBoundingClientRect();else {
          activeSurface = null;
          activeRect = null;
        }
      };
      const moveSurface = rafThrottle(event => {
        const candidate = event.target.closest?.('.wm-interactive-surface');
        if (candidate !== activeSurface) {
          resetSurface(activeSurface);
          activeSurface = candidate || null;
          activeRect = activeSurface ? activeSurface.getBoundingClientRect() : null;
        }
        if (!activeSurface || activeSurface.classList.contains('tilt-surface') || !activeRect) return;
        const rect = activeRect;
        if (rect.width > 760 || rect.height > 680 || rect.width < 120 || rect.height < 65) return;
        const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        const ry = (px - .5) * 7;
        const rx = (.5 - py) * 6;
        activeSurface.style.setProperty('--wm-mx', `${px * 100}%`);
        activeSurface.style.setProperty('--wm-my', `${py * 100}%`);
        activeSurface.style.setProperty('--wm-tilt-x', `${rx.toFixed(2)}deg`);
        activeSurface.style.setProperty('--wm-tilt-y', `${ry.toFixed(2)}deg`);
      });
      WusoolUI.listen(doc, 'pointermove', moveSurface, {
        passive: true
      });
      WusoolUI.listen(doc, 'pointerout', event => {
        if (!activeSurface) return;
        const next = event.relatedTarget;
        if (!next || !activeSurface.contains(next)) {
          resetSurface(activeSurface);
          activeSurface = null;
          activeRect = null;
        }
      }, {
        passive: true
      });
      WusoolUI.listen(window, 'scroll', refreshActiveRect, {
        passive: true
      });
      WusoolUI.listen(window, 'resize', refreshActiveRect, {
        passive: true
      });
    }

    /* ---------- Magnetic buttons + click ripples ---------- */
    const buttons = [...doc.querySelectorAll('.btn, button, [role="button"]')].filter(el => !el.classList.contains('navbar-toggler'));
    buttons.forEach(button => button.classList.add('wm-sheen'));
    if (finePointer && !reducedMotion) {
      let activeButton = null;
      let activeButtonRect = null;
      const resetButton = button => {
        if (!button) return;
        button.style.setProperty('--wm-btn-x', '0px');
        button.style.setProperty('--wm-btn-y', '0px');
      };
      WusoolUI.listen(doc, 'pointermove', rafThrottle(event => {
        const candidate = event.target.closest?.('.wm-sheen');
        if (candidate !== activeButton) {
          resetButton(activeButton);
          activeButton = candidate || null;
          activeButtonRect = activeButton ? activeButton.getBoundingClientRect() : null;
        }
        const rect = activeButtonRect;
        if (!activeButton || !rect || rect.width > 360 || rect.height > 100) return;
        const dx = (event.clientX - (rect.left + rect.width / 2)) * .07;
        const dy = (event.clientY - (rect.top + rect.height / 2)) * .10;
        activeButton.style.setProperty('--wm-btn-x', `${clamp(dx, -5, 5)}px`);
        activeButton.style.setProperty('--wm-btn-y', `${clamp(dy, -4, 4)}px`);
      }), {
        passive: true
      });
      WusoolUI.listen(doc, 'pointerout', event => {
        if (!activeButton) return;
        const next = event.relatedTarget;
        if (!next || !activeButton.contains(next)) {
          resetButton(activeButton);
          activeButton = null;
          activeButtonRect = null;
        }
      }, {
        passive: true
      });
    }
    WusoolUI.listen(doc, 'pointerdown', event => {
      const target = event.target.closest('.btn, button, [role="button"], .nav-link');
      if (!target || target.disabled || reducedMotion) return;
      const rect = target.getBoundingClientRect();
      const ripple = doc.createElement('span');
      ripple.className = 'wm-ripple';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 760);
    }, {
      passive: true
    });

    /* ---------- Form focus states ---------- */
    doc.querySelectorAll('input, select, textarea').forEach(input => {
      const wrapper = input.closest('.mb-3, .mb-4, .form-group, .field-group') || input.parentElement;
      if (!wrapper) return;
      WusoolUI.listen(input, 'focus', () => wrapper.classList.add('wm-field-active'));
      WusoolUI.listen(input, 'blur', () => wrapper.classList.remove('wm-field-active'));
    });

    /* ---------- Progress bars + table row choreography ---------- */
    const progressBars = [...doc.querySelectorAll('.progress-bar')];
    progressBars.forEach(bar => {
      const inlineWidth = bar.style.width;
      const ariaNow = Number(bar.getAttribute('aria-valuenow'));
      const target = inlineWidth || (Number.isFinite(ariaNow) ? `${ariaNow}%` : '');
      if (!target || reducedMotion) return;
      bar.dataset.wmTargetWidth = target;
      bar.style.width = '0%';
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      progressBars.forEach(bar => {
        if (bar.dataset.wmTargetWidth) bar.style.width = bar.dataset.wmTargetWidth;
      });
    }));
    const tableRows = [...doc.querySelectorAll('main tbody tr')];
    if (!reducedMotion && 'IntersectionObserver' in window) {
      const rowObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('wm-row-visible');
          observer.unobserve(entry.target);
        });
      }, {
        threshold: .05,
        rootMargin: '0px 0px -3% 0px'
      });
      tableRows.forEach((row, index) => {
        row.classList.add('wm-row-motion');
        row.style.setProperty('--wm-row-delay', `${index % 8 * 36}ms`);
        rowObserver.observe(row);
      });
    }

    /* ---------- Count-up for visible dashboard numbers ---------- */
    const numberCandidates = [...doc.querySelectorAll('[class*="stat"] [class*="value"], [class*="metric"] [class*="value"], [class*="count"], [data-count], .display-4, .display-5')];
    const animateNumber = el => {
      if (el.dataset.wmCounted === '1') return;
      const raw = el.textContent.trim();
      const match = raw.match(/^([^\d-]*)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
      if (!match) return;
      const value = Number(match[2].replace(/,/g, ''));
      if (!Number.isFinite(value) || Math.abs(value) < 2 || Math.abs(value) > 10000000) return;
      el.dataset.wmCounted = '1';
      if (reducedMotion) return;
      const prefix = match[1],
        suffix = match[3];
      const decimals = (match[2].split('.')[1] || '').length;
      const start = performance.now();
      const duration = 850 + Math.min(650, Math.abs(value) * 2);
      const tick = now => {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        const current = value * eased;
        el.textContent = `${prefix}${current.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);else el.textContent = raw;
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const numberObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          animateNumber(entry.target);
          observer.unobserve(entry.target);
        });
      }, {
        threshold: .6
      });
      numberCandidates.forEach(el => numberObserver.observe(el));
    } else {
      numberCandidates.forEach(animateNumber);
    }

    /* ---------- Login cinematic mode ---------- */
    const loginForm = doc.querySelector('form[id*="login" i]');
    if (loginForm) {
      body.classList.add('wusool-auth-mode');
      const visual = doc.querySelector('.login-hero, [class*="login-visual"]');
      const heroContent = visual?.querySelector('.hero-content, [class*="visual-content"]');
      if (visual && !visual.querySelector('.wm-auth-chip-wrap')) {
        const chipWrap = doc.createElement('div');
        chipWrap.className = 'wm-auth-chip-wrap';
        chipWrap.setAttribute('aria-hidden', 'true');
        WusoolUI.html(chipWrap, `
        <span class="wm-auth-chip"><i class="bi bi-patch-check-fill"></i> Verified accessibility</span>
        <span class="wm-auth-chip"><i class="bi bi-sign-turn-right-fill"></i> Smart navigation</span>
        <span class="wm-auth-chip"><i class="bi bi-stars"></i> AI-powered insights</span>`);
        visual.appendChild(chipWrap);
      }
      if (finePointer && !reducedMotion) {
        WusoolUI.listen(window, 'pointermove', rafThrottle(event => {
          const px = event.clientX / window.innerWidth;
          const py = event.clientY / window.innerHeight;
          body.style.setProperty('--wm-auth-x', `${px * 100}%`);
          body.style.setProperty('--wm-auth-y', `${py * 100}%`);
          if (visual) {
            visual.style.setProperty('--wm-hero-x', `${px * 100}%`);
            visual.style.setProperty('--wm-hero-y', `${py * 100}%`);
            visual.style.setProperty('--wm-hero-shift-x', `${(px - .5) * -16}px`);
            visual.style.setProperty('--wm-hero-shift-y', `${(py - .5) * -10}px`);
          }
          if (heroContent) {
            heroContent.style.setProperty('--wm-auth-content-x', `${(px - .5) * 8}px`);
            heroContent.style.setProperty('--wm-auth-content-y', `${(py - .5) * 6}px`);
          }
        }), {
          passive: true
        });
      }
    }

    /* ---------- Live visual status on dashboards ---------- */
    const statusTargets = doc.querySelectorAll('[class*="status"], [class*="health"], [class*="live"]');
    statusTargets.forEach(el => {
      if (/^(INPUT|SELECT|OPTION|TEXTAREA|BUTTON)$/.test(el.tagName)) return;
      const text = el.textContent.trim().toLowerCase();
      if (text.length > 80) return;
      if (/(online|active|healthy|live|operational|ready)/.test(text) && !el.querySelector('.wm-live-dot')) {
        const dot = doc.createElement('span');
        dot.className = 'wm-live-dot';
        dot.setAttribute('aria-hidden', 'true');
        el.prepend(dot);
      }
    });

    /* ---------- Navigation performance ---------- */
    // Never intercept normal links. Navigation stays native and instant.
    // The entry animation is visual-only and cannot delay a user action.
    WusoolUI.listen(window, 'pageshow', () => {
      root.classList.remove('wusool-page-leaving');
      root.classList.add('wusool-page-ready');
    });

    /* ---------- Bootstrap modal reset / animation friendly ---------- */
    WusoolUI.listen(doc, 'hidden.bs.modal', () => {
      doc.querySelectorAll('.modal-dialog').forEach(el => el.getAnimations?.().forEach(a => a.cancel()));
    });

    /* ---------- Mutation support for dynamically rendered cards ---------- */
    // Batch dynamic-card decoration so DOM-heavy pages do not rescan/repaint
    // synchronously for every individual insertion.
    const pendingDynamicRoots = new Set();
    let dynamicDecorateScheduled = false;
    const flushDynamicCards = () => {
      dynamicDecorateScheduled = false;
      pendingDynamicRoots.forEach(node => {
        if (!(node instanceof HTMLElement) || !node.isConnected) return;
        const dynamicCards = node.matches?.(surfaceSelectors) ? [node, ...(node.querySelectorAll?.(surfaceSelectors) || [])] : [...(node.querySelectorAll?.(surfaceSelectors) || [])];
        dynamicCards.filter(isSurface).forEach(el => {
          el.classList.add('wm-interactive-surface');
          el.dispatchEvent(new CustomEvent('wusool:surface-ready', {
            bubbles: true
          }));
        });
      });
      pendingDynamicRoots.clear();
    };
    const scheduleDynamicCards = () => {
      if (dynamicDecorateScheduled) return;
      dynamicDecorateScheduled = true;
      if ('requestIdleCallback' in window) {
        requestIdleCallback(flushDynamicCards, {
          timeout: 180
        });
      } else {
        window.setTimeout(flushDynamicCards, 48);
      }
    };
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) pendingDynamicRoots.add(node);
        });
      });
      if (pendingDynamicRoots.size) scheduleDynamicCards();
    });
    mutationObserver.observe(doc.body, {
      childList: true,
      subtree: true
    });
  })();
});
