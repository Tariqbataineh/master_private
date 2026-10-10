"use strict";

(() => {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  /* ---------------- Live Leaflet maps ---------------- */
  const createIcon = () => {
    if (!window.L) return null;
    return L.divIcon({
      className: "wusool-marker-shell",
      html: '<span class="wusool-map-marker"><i class="bi bi-universal-access"></i></span>',
      iconSize: [30, 30],
      iconAnchor: [15, 28],
    });
  };

  const heroMapEl = document.getElementById("heroLiveMap");
  let heroMap;

  if (heroMapEl && !document.querySelector('.wusool-journey') && window.L) {
    heroMap = L.map(heroMapEl, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      dragging: true,
    }).setView([31.9539, 35.9106], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(heroMap);

    L.control.zoom({ position: "topright" }).addTo(heroMap);

    const icon = createIcon();
    [
      [31.9565, 35.9078],
      [31.9494, 35.9255],
      [31.9632, 35.8958],
      [31.9447, 35.9024],
    ].forEach((coords, index) => {
      const marker = L.marker(coords, { icon }).addTo(heroMap);
      marker.bindTooltip(index === 0 ? "92% accessibility match" : "Verified place", {
        direction: "top",
        offset: [0, -18],
      });
    });

    setTimeout(() => heroMap.invalidateSize(), 250);
  }

  const journeyMapEl = document.getElementById("journeyMap");
  let journeyMap;
  let journeyRoute;

  const routeSets = [
    {
      center: [31.9539, 35.9106],
      zoom: 14,
      route: [[31.9517,35.9040],[31.9535,35.9065],[31.9554,35.9096],[31.9567,35.9132]],
      text: "Continue for 120 m",
      distance: "4 min",
      icon: "bi-arrow-up-right",
    },
    {
      center: [31.9567, 35.9132],
      zoom: 16,
      route: [[31.9560,35.9118],[31.9563,35.9125],[31.9567,35.9132],[31.9572,35.9137]],
      text: "Use the step-free entrance",
      distance: "2 min",
      icon: "bi-person-wheelchair",
    },
    {
      center: [31.9572, 35.9137],
      zoom: 17,
      route: [[31.9568,35.9132],[31.9570,35.9135],[31.9572,35.9137]],
      text: "Accessible entrance is ahead",
      distance: "40 m",
      icon: "bi-door-open",
    },
  ];

  const renderJourney = (index) => {
    const data = routeSets[index] || routeSets[0];
    const instruction = document.getElementById("routeInstruction");

    if (journeyMap) {
      journeyMap.flyTo(data.center, data.zoom, {
        duration: reduceMotion ? 0 : 1.1,
      });
      if (journeyRoute) journeyRoute.remove();
      journeyRoute = L.polyline(data.route, {
        color: "#0f766e",
        weight: 6,
        opacity: .95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(journeyMap);
    }

    if (instruction) {
      instruction.querySelector(".route-icon i").className = `bi ${data.icon}`;
      instruction.querySelector("strong").textContent = data.text;
      instruction.querySelector(".route-distance").textContent = data.distance;
    }
  };

  if (journeyMapEl && window.L) {
    journeyMap = L.map(journeyMapEl, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      dragging: true,
    }).setView(routeSets[0].center, routeSets[0].zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(journeyMap);

    const icon = createIcon();
    L.marker([31.9567,35.9132], { icon }).addTo(journeyMap);
    renderJourney(0);
    setTimeout(() => journeyMap.invalidateSize(), 250);
  }

  /* ---------------- Story step interaction ---------------- */
  const storySteps = [...document.querySelectorAll(".story-step")];

  const activateStoryStep = (index) => {
    storySteps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === index);
    });
    renderJourney(index);
  };

  storySteps.forEach((step, index) => {
    step.addEventListener("click", () => activateStoryStep(index));
  });

  /* ---------------- Premium motion ---------------- */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".motion-reveal", {
      y: 34,
      opacity: 0,
      duration: 1,
      stagger: .10,
      ease: "power3.out",
    });

    gsap.from(".hero-product-stage", {
      x: 70,
      rotateY: -8,
      rotateX: 3,
      opacity: 0,
      duration: 1.25,
      ease: "power3.out",
      delay: .12,
    });

    gsap.to(".hero-product-stage", {
      y: -30,
      scrollTrigger: {
        trigger: ".premium-hero",
        start: "top top+=120",
        end: "bottom top",
        scrub: 1.1,
      },
    });

    gsap.utils.toArray(".process-card, .place-card, .feature-card, .organization-card, .stat-card").forEach((card) => {
      if (card.closest('.journey-popups-enabled')) return;
      gsap.from(card, {
        y: 34,
        opacity: 0,
        duration: .75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          once: true,
        },
      });
    });

    gsap.from(".story-device", {
      scale: .88,
      rotateY: -8,
      opacity: 0,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: { trigger: ".story-device", start: "top 80%", once: true },
    });

    storySteps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 68%",
        end: "bottom 48%",
        onEnter: () => activateStoryStep(index),
        onEnterBack: () => activateStoryStep(index),
      });
    });

    gsap.from(".ai-vision-demo", {
      x: 70,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".premium-ai-shell", start: "top 72%", once: true },
    });
  }

  /* ---------------- Pointer tilt ---------------- */
  if (!reduceMotion && window.matchMedia?.("(pointer:fine)")?.matches) {
    document.querySelectorAll(".tilt-surface").forEach((surface) => {
      const strength = Number(surface.dataset.tiltStrength || 4);
      let rect = null;
      let frame = 0;
      let lastEvent = null;
      const paint = () => {
        frame = 0;
        if (!rect || !lastEvent) return;
        const x = (lastEvent.clientX - rect.left) / rect.width - .5;
        const y = (lastEvent.clientY - rect.top) / rect.height - .5;
        surface.style.transform = `perspective(1100px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg)`;
      };
      surface.addEventListener("pointerenter", () => { rect = surface.getBoundingClientRect(); }, { passive: true });
      surface.addEventListener("pointermove", (event) => {
        lastEvent = event;
        if (!frame) frame = requestAnimationFrame(paint);
      }, { passive: true });
      surface.addEventListener("pointerleave", () => {
        rect = null;
        lastEvent = null;
        surface.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
      });
    });

    document.querySelectorAll(".magnetic-button").forEach((button) => {
      let rect = null;
      let frame = 0;
      let lastEvent = null;
      const paint = () => {
        frame = 0;
        if (!rect || !lastEvent) return;
        const x = lastEvent.clientX - (rect.left + rect.width / 2);
        const y = lastEvent.clientY - (rect.top + rect.height / 2);
        button.style.transform = `translate(${x * .08}px, ${y * .08}px)`;
      };
      button.addEventListener("pointerenter", () => { rect = button.getBoundingClientRect(); }, { passive: true });
      button.addEventListener("pointermove", (event) => {
        lastEvent = event;
        if (!frame) frame = requestAnimationFrame(paint);
      }, { passive: true });
      button.addEventListener("pointerleave", () => {
        rect = null;
        lastEvent = null;
        button.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------- Count-up when visible ---------------- */
  const counters = document.querySelectorAll("[data-count]");
  counters.forEach((counter) => { counter.dataset.wmCounted = "1"; });
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count || 0);
      if (reduceMotion) {
        node.textContent = target;
      } else {
        let start = 0;
        const startedAt = performance.now();
        const duration = 1100;
        const tick = (now) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          node.textContent = Math.round(start + (target - start) * eased);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      observer.unobserve(node);
    });
  }, { threshold: .5 });
  counters.forEach((counter) => countObserver.observe(counter));

  /* Keep maps correctly sized after responsive layout changes */
  window.addEventListener("resize", () => {
    heroMap?.invalidateSize();
    journeyMap?.invalidateSize();
  });
})();
