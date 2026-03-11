/**
 * main.js
 * Core interactions for Amna Naveed's 3D Portfolio:
 *   - Loading screen
 *   - Navbar scroll behaviour & active link highlighting
 *   - Mobile nav toggle
 *   - Typing effect (Hero tagline)
 *   - Scroll-triggered AOS-style animations
 *   - Skill-bar fill animation
 *   - Animated counters (stats)
 *   - 3D tilt effect on cards
 *   - Contact form handling
 *   - Smooth scroll for anchor links
 */

(function () {
  'use strict';

  /* ── DOM Ready ──────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initLoadingScreen();
    initNavbar();
    initMobileNav();
    initTypingEffect();
    initScrollAnimations();
    initSkillBars();
    initCounters();
    initTiltCards();
    initContactForm();
    initSmoothScroll();
  }

  /* ════════════════════════════════════════════════════════════════
     LOADING SCREEN
  ════════════════════════════════════════════════════════════════ */
  function initLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;

    // Hide after a short delay to let Three.js initialise
    const delay = typeof THREE !== 'undefined' ? 1400 : 600;
    window.addEventListener('load', function () {
      setTimeout(function () {
        screen.classList.add('hidden');
        // Remove from DOM to save memory
        setTimeout(function () { screen.remove(); }, 700);
      }, delay);
    });
  }

  /* ════════════════════════════════════════════════════════════════
     NAVBAR — scroll + active section
  ════════════════════════════════════════════════════════════════ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const links = navbar.querySelectorAll('.nav-link[data-section]');
    const sections = Array.from(document.querySelectorAll('section[id]'));

    function update() {
      /* Scrolled class */
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      /* Active nav link */
      let current = '';
      const offset = 120;
      sections.forEach(function (sec) {
        if (window.scrollY + offset >= sec.offsetTop) {
          current = sec.id;
        }
      });
      links.forEach(function (link) {
        link.classList.toggle('active', link.dataset.section === current);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update(); // initial call
  }

  /* ════════════════════════════════════════════════════════════════
     MOBILE NAV TOGGLE
  ════════════════════════════════════════════════════════════════ */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ════════════════════════════════════════════════════════════════
     TYPING EFFECT
  ════════════════════════════════════════════════════════════════ */
  function initTypingEffect() {
    const el = document.getElementById('typingText');
    if (!el) return;

    const phrases = [
      'Data Analyst',
      'Machine Learning Engineer',
      'Data Visualization Expert',
      'ML Model Builder',
      'Python Developer',
    ];

    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;
    const TYPING_SPEED   = 80;
    const DELETING_SPEED = 40;
    const PAUSE_AFTER    = 1800;
    const PAUSE_BEFORE   = 400;

    function tick() {
      const current = phrases[phraseIdx];

      if (!deleting) {
        el.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, PAUSE_AFTER);
          return;
        }
        setTimeout(tick, TYPING_SPEED);
      } else {
        el.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, PAUSE_BEFORE);
          return;
        }
        setTimeout(tick, DELETING_SPEED);
      }
    }

    // Small delay so the hero has time to render
    setTimeout(tick, 1600);
  }

  /* ════════════════════════════════════════════════════════════════
     SCROLL-TRIGGERED ANIMATIONS  (replaces AOS library)
  ════════════════════════════════════════════════════════════════ */
  function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(function (el) { el.classList.add('aos-animate'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.aosDelay || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('aos-animate');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ════════════════════════════════════════════════════════════════
     SKILL BAR FILL ANIMATION
  ════════════════════════════════════════════════════════════════ */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill[data-width]');
    if (!bars.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width + '%';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(function (bar) { observer.observe(bar); });
  }

  /* ════════════════════════════════════════════════════════════════
     ANIMATED COUNTERS
  ════════════════════════════════════════════════════════════════ */
  function initCounters() {
    const counters = document.querySelectorAll('.counter[data-target]');
    if (!counters.length) return;

    const DURATION = 1800; // ms

    function animateCounter(el) {
      const target  = parseInt(el.dataset.target, 10);
      const start   = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / DURATION, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ════════════════════════════════════════════════════════════════
     3D TILT EFFECT ON CARDS
  ════════════════════════════════════════════════════════════════ */
  function initTiltCards() {
    // Only on non-touch devices
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect   = card.getBoundingClientRect();
        const x      = e.clientX - rect.left;
        const y      = e.clientY - rect.top;
        const cx     = rect.width  / 2;
        const cy     = rect.height / 2;
        const rotX   = ((y - cy) / cy) * -12; // degrees
        const rotY   = ((x - cx) / cx) * 12;

        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04, 1.04, 1.04)`;
        card.style.transition = 'transform 0.08s ease';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     CONTACT FORM
  ════════════════════════════════════════════════════════════════ */
  function initContactForm() {
    const form   = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form || !status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name    = form.name.value.trim();
      const email   = form.email.value.trim();
      const message = form.message.value.trim();

      /* Basic validation */
      if (!name || !email || !message) {
        showStatus('Please fill in all fields.', 'error');
        return;
      }
      if (!isValidEmail(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }

      /* Simulate sending */
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      setTimeout(function () {
        showStatus('Thank you! Your message has been sent successfully. I\'ll get back to you soon! 🎉', 'success');
        form.reset();
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Send Message';
      }, 1200);
    });

    function showStatus(msg, type) {
      status.textContent = msg;
      status.className   = 'form-status ' + type;
      // Clear after 6 seconds
      setTimeout(function () {
        status.textContent = '';
        status.className   = 'form-status';
      }, 6000);
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  }

  /* ════════════════════════════════════════════════════════════════
     SMOOTH SCROLL for anchor links
  ════════════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navHeight = document.getElementById('navbar')
          ? document.getElementById('navbar').offsetHeight
          : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

})();
