/**
 * =====================================================================
 * VigCraft Testing Hub — main.js
 * Landing Page Behavior Layer
 *
 * Vanilla JS, ES6+. No external libraries, no framework dependency.
 * Every feature is initialized defensively: a failure in one module
 * never blocks the others, and nothing here can leave page content
 * permanently hidden if a browser feature is unavailable.
 *
 * Public surface: window.VigCraft — exposes reusable utilities and
 * form-validation helpers for future pages (login, signup, etc.) to
 * consume without duplicating logic.
 * =====================================================================
 */

(() => {
  'use strict';

  /* ===================================================================
     1. Environment & Logging
     Console output is silenced outside local/dev hosts so production
     consoles stay clean.
     =================================================================== */

  const DEV_HOSTNAMES = ['localhost', '127.0.0.1', ''];

  const IS_DEV =
    typeof window !== 'undefined' &&
    window.location &&
    (DEV_HOSTNAMES.includes(window.location.hostname) ||
      window.location.hostname.endsWith('.local'));

  const Logger = {
    info(...args) {
      if (IS_DEV) console.info('[VigCraft]', ...args);
    },
    warn(...args) {
      if (IS_DEV) console.warn('[VigCraft]', ...args);
    },
    error(...args) {
      if (IS_DEV) console.error('[VigCraft]', ...args);
    },
  };

  /* ===================================================================
     2. Utilities
     Small, dependency-free helpers reused across modules below.
     =================================================================== */

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  /**
   * Delays invoking fn until `wait` ms have elapsed since the last call.
   * Used for resize/input handlers that don't need per-frame precision.
   */
  function debounce(fn, wait = 150) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), wait);
    };
  }

  /**
   * Ensures fn runs at most once per animation frame, always with the
   * most recently supplied arguments (not the arguments from whichever
   * call happened to trigger the scheduled frame).
   */
  function rafThrottle(fn) {
    let scheduled = false;
    let latestArgs = [];
    return (...args) => {
      latestArgs = args;
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        fn(...latestArgs);
        scheduled = false;
      });
    };
  }

  /**
   * Shared scroll dispatcher: a single passive `scroll` listener and a
   * single rAF throttle, fanned out to every registered handler. Avoids
   * each scroll-driven module (header state, back-to-top, etc.) paying
   * for its own listener + rAF schedule. Each handler is invoked once
   * immediately on registration to establish initial state, matching
   * the "run once, then react to scroll" behavior each module needs.
   */
  const scrollHandlers = [];
  let scrollListenerAttached = false;

  function registerScrollHandler(handler) {
    scrollHandlers.push(handler);
    handler();
  }

  function ensureScrollListener() {
    if (scrollListenerAttached) return;
    scrollListenerAttached = true;
    const dispatch = rafThrottle(() => {
      scrollHandlers.forEach((handler) => handler());
    });
    window.addEventListener('scroll', dispatch, { passive: true });
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const prefersReducedMotion = () =>
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const supportsIntersectionObserver = () =>
    'IntersectionObserver' in window;

  /**
   * Reads a design-system color/spacing token straight from the CSS
   * custom properties defined in main.css, so any JS-created UI (e.g.
   * the back-to-top button) stays visually consistent with the rest of
   * the page without duplicating hex values here.
   */
  function getCSSVar(name, fallback) {
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return value || fallback;
    } catch (error) {
      Logger.warn(`Unable to read CSS variable ${name}, using fallback.`, error);
      return fallback;
    }
  }

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  /* ===================================================================
     3. Mobile Navigation Toggle
     =================================================================== */

  function initMobileNav() {
    const toggle = qs('.site-nav__toggle');
    if (!toggle) return;

    const menuId = toggle.getAttribute('aria-controls');
    const menu = menuId ? document.getElementById(menuId) : null;
    if (!menu) {
      Logger.warn('Mobile nav menu not found for toggle button.');
      return;
    }

    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Close on Escape for keyboard users, returning focus to the toggle.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        toggle.focus();
      }
    });

    // Close after choosing a link, and close on outside click — both
    // expected behaviors for a mobile dropdown menu.
    menu.addEventListener('click', (event) => {
      if (event.target.closest('.site-nav__link')) closeMenu();
    });

    document.addEventListener('click', (event) => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (!isOpen) return;
      if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        closeMenu();
      }
    });

    // Collapsing back to desktop width shouldn't leave the menu "open".
    window.addEventListener(
      'resize',
      debounce(() => {
        if (window.innerWidth >= 1024) closeMenu();
      }, 200)
    );
  }

  /* ===================================================================
     4. Smooth Scrolling (header-offset aware)
     =================================================================== */

  function initSmoothScroll() {
    const header = qs('.site-header');
    const links = qsa('a[href^="#"]').filter((link) => link.hash.length > 1);
    if (!links.length) return;

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = document.getElementById(link.hash.slice(1));
        if (!target) return;

        event.preventDefault();
        const headerOffset = header ? header.offsetHeight : 0;
        const targetTop =
          target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 12;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });

        // Keep focus management accessible: move focus to the target
        // section once scrolling settles, without re-triggering scroll.
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ===================================================================
     5. Active Navigation Highlighting
     =================================================================== */

  function initActiveNavHighlighting() {
    if (!supportsIntersectionObserver()) {
      Logger.warn('IntersectionObserver unsupported; skipping nav highlighting.');
      return;
    }

    const links = qsa('.site-nav__link[href^="#"]');
    if (!links.length) return;

    const header = qs('.site-header');
    const headerOffset = header ? header.offsetHeight : 0;

    const linkBySectionId = new Map();
    links.forEach((link) => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) linkBySectionId.set(section, link);
    });

    if (!linkBySectionId.size) return;

    const setActiveLink = (activeLink) => {
      links.forEach((link) => {
        const isActive = link === activeLink;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const link = linkBySectionId.get(visible.target);
          if (link) setActiveLink(link);
        }
      },
      {
        rootMargin: `-${headerOffset + 16}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    linkBySectionId.forEach((_, section) => observer.observe(section));
  }

  /* ===================================================================
     6. Sticky Header Scroll State
     Adds a hook class once the page scrolls past the top, so main.css
     can layer in a stronger elevation/shadow state if desired.
     =================================================================== */

  function initHeaderScrollState() {
    const header = qs('.site-header');
    if (!header) return;

    const SCROLL_THRESHOLD = 8;

    const updateState = () => {
      header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    };

    registerScrollHandler(updateState);
    ensureScrollListener();
  }

  /* ===================================================================
     7. Back-to-Top Button
     The landing page markup doesn't ship this control yet, so it's
     created here and styled from the existing design tokens in
     main.css. A dedicated .back-to-top rule set in main.css can take
     over this styling in a future pass without changing this module's
     behavior.
     =================================================================== */

  function initBackToTop() {
    const SHOW_AFTER_PX = 480;

    // Read once — used for the initial inline style below (new button)
    // and for the hover/un-hover handlers (new or pre-existing button).
    const baseColor = getCSSVar('--color-signal-700', '#0B7C55');
    const hoverColor = getCSSVar('--color-signal-800', '#086647');

    let button = qs('.back-to-top');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'back-to-top';
      button.setAttribute('aria-label', 'Back to top');

      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '\u2191';
      button.appendChild(icon);

      Object.assign(button.style, {
        position: 'fixed',
        right: '1.25rem',
        bottom: '1.25rem',
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.125rem',
        lineHeight: '1',
        color: getCSSVar('--color-on-dark-900', '#F5F7FA'),
        backgroundColor: baseColor,
        boxShadow: getCSSVar('--shadow-md', '0 8px 24px rgba(10,14,23,0.18)'),
        opacity: '0',
        transform: 'translateY(8px)',
        pointerEvents: 'none',
        transition: 'opacity 200ms ease, transform 200ms ease, background-color 150ms ease',
        zIndex: '999',
      });

      document.body.appendChild(button);
    }

    const setVisible = (visible) => {
      button.style.opacity = visible ? '1' : '0';
      button.style.transform = visible ? 'translateY(0)' : 'translateY(8px)';
      button.style.pointerEvents = visible ? 'auto' : 'none';
    };

    const updateVisibility = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = hoverColor;
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = baseColor;
    });

    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    });

    registerScrollHandler(updateVisibility);
    ensureScrollListener();
  }

  /* ===================================================================
     8. Hero CTA Interactions
     Doesn't intercept navigation — the hero buttons are real links to
     /signup and #modules. This just broadcasts a DOM event so an
     analytics script can hook in later without this file knowing
     anything about analytics.
     =================================================================== */

  function initHeroCtaInteractions() {
    const heroButtons = qsa('.hero__actions .btn');
    if (!heroButtons.length) return;

    heroButtons.forEach((button) => {
      button.addEventListener('click', () => {
        document.dispatchEvent(
          new CustomEvent('vigcraft:cta-click', {
            bubbles: true,
            detail: {
              label: button.textContent.trim(),
              href: button.getAttribute('href') || null,
              section: 'hero',
            },
          })
        );
      });
    });
  }

  /* ===================================================================
     9. Feature / Module Card Touch Parity
     :hover in CSS never fires on touch devices, so tapped cards get a
     matching class for the duration of the touch.
     =================================================================== */

  function initCardInteractions() {
    const cards = qsa('.feature-card, .module-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      card.addEventListener('touchstart', () => card.classList.add('is-touch-active'), {
        passive: true,
      });
      const release = () => card.classList.remove('is-touch-active');
      card.addEventListener('touchend', release);
      card.addEventListener('touchcancel', release);
    });
  }

  /* ===================================================================
     10. Statistics Counter Animation
     Parses the existing text of each .stat-card__value (e.g. "99.9%",
     "10K+") and animates the numeric portion up from zero, preserving
     the original suffix and decimal precision exactly on completion.
     =================================================================== */

  const STAT_VALUE_PATTERN = /^(\d+(?:\.\d+)?)(.*)$/;

  function parseStatValue(text) {
    const trimmed = text.trim();
    const match = STAT_VALUE_PATTERN.exec(trimmed);
    if (!match) return null;

    const [, numberPart, suffix] = match;
    const decimalIndex = numberPart.indexOf('.');
    const decimals = decimalIndex === -1 ? 0 : numberPart.length - decimalIndex - 1;

    return {
      target: parseFloat(numberPart),
      decimals,
      suffix,
    };
  }

  function animateStatValue(element, parsed, duration = 1400) {
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutCubic(progress);
      const current = parsed.target * eased;

      element.textContent = `${current.toFixed(parsed.decimals)}${parsed.suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = `${parsed.target.toFixed(parsed.decimals)}${parsed.suffix}`;
      }
    };

    requestAnimationFrame(tick);
  }

  function initStatsCounter() {
    const values = qsa('.stat-card__value');
    if (!values.length) return;

    if (prefersReducedMotion() || !supportsIntersectionObserver()) {
      // Content is already correct in the markup; nothing further to do.
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          const parsed = parseStatValue(element.textContent);
          if (parsed) animateStatValue(element, parsed);

          obs.unobserve(element);
        });
      },
      { threshold: 0.6 }
    );

    values.forEach((value) => observer.observe(value));
  }

  /* ===================================================================
     11. Scroll Reveal Animations
     Progressive enhancement only: elements are hidden via inline style
     immediately before they're revealed, and only if IntersectionObserver
     is available and the user hasn't requested reduced motion. Any
     failure mid-way is caught and reverses the hidden state so content
     is never stuck invisible.
     =================================================================== */

  function initScrollReveal() {
    if (prefersReducedMotion() || !supportsIntersectionObserver()) return;

    const selectors = [
      '.section-heading',
      '.feature-card',
      '.module-card',
      '.stat-card',
      '.hero__content',
      '.hero__media',
      '.cta__inner',
    ];
    const targets = qsa(selectors.join(', '));
    if (!targets.length) return;

    try {
      targets.forEach((el, index) => {
        const withinGroup = Array.from(el.parentElement ? el.parentElement.children : []).indexOf(el);
        const delay = clamp((withinGroup !== -1 ? withinGroup : index) * 60, 0, 240);

        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`;
      });

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.15 }
      );

      targets.forEach((el) => observer.observe(el));
    } catch (error) {
      Logger.error('Scroll reveal failed; restoring full visibility.', error);
      targets.forEach((el) => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
      });
    }
  }

  /* ===================================================================
     12. Form Validation Helpers (for future pages)
     Pure functions with no DOM assumptions beyond the field element
     itself, so login/signup/contact pages can compose them freely.
     =================================================================== */

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * form.elements.namedItem(name) returns a RadioNodeList — not a single
   * Element — when the form has a grouped field (e.g. radio buttons
   * sharing a name). RadioNodeList has no setAttribute/insertAdjacentElement,
   * so error rendering degrades to targeting the first element in the
   * group rather than throwing.
   */
  function resolveErrorTargetElement(field) {
    if (typeof RadioNodeList !== 'undefined' && field instanceof RadioNodeList) {
      return field[0] || null;
    }
    return field || null;
  }

  const FormValidation = {
    isNotEmpty: (value) => typeof value === 'string' && value.trim().length > 0,
    isValidEmail: (value) => EMAIL_PATTERN.test(String(value).trim()),
    minLength: (value, min) => String(value).trim().length >= min,
    maxLength: (value, max) => String(value).trim().length <= max,
    valuesMatch: (a, b) => a === b,

    /**
     * Runs an ordered list of { test, message } rules against a field's
     * current value and returns the first failure, or null if valid.
     * Rules run in order so the most fundamental issue (e.g. "required")
     * is reported before more specific ones (e.g. "must be an email").
     */
    validateField(field, rules) {
      if (!field || !Array.isArray(rules)) return null;
      const value = field.value;

      for (const rule of rules) {
        if (!rule.test(value)) {
          return rule.message || 'This field is invalid.';
        }
      }
      return null;
    },

    /** Marks a field invalid and renders an accessible error message. */
    setFieldError(field, message) {
      const target = resolveErrorTargetElement(field);
      if (!target) return;
      target.setAttribute('aria-invalid', 'true');

      const errorId = `${target.id || target.name || 'field'}-error`;
      let errorEl = document.getElementById(errorId);

      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = errorId;
        errorEl.className = 'field-error';
        errorEl.setAttribute('role', 'alert');
        target.insertAdjacentElement('afterend', errorEl);
      }

      errorEl.textContent = message;
      target.setAttribute('aria-describedby', errorId);
    },

    /** Clears a previously set field error, if any. */
    clearFieldError(field) {
      const target = resolveErrorTargetElement(field);
      if (!target) return;
      target.removeAttribute('aria-invalid');

      const describedBy = target.getAttribute('aria-describedby');
      if (describedBy) {
        const errorEl = document.getElementById(describedBy);
        if (errorEl) errorEl.remove();
        target.removeAttribute('aria-describedby');
      }
    },

    /**
     * Validates every [data-validate] field inside a form against a
     * schema keyed by field name, e.g.:
     *   { email: [{ test: FormValidation.isValidEmail, message: '...' }] }
     * Returns true if the whole form is valid.
     */
    validateForm(formEl, schema) {
      if (!formEl || !schema) return false;
      let isValid = true;

      Object.entries(schema).forEach(([fieldName, rules]) => {
        const field = formEl.elements.namedItem(fieldName);
        if (!field) {
          Logger.warn(`No field named "${fieldName}" found in form.`);
          return;
        }

        const error = FormValidation.validateField(field, rules);
        if (error) {
          FormValidation.setFieldError(field, error);
          isValid = false;
        } else {
          FormValidation.clearFieldError(field);
        }
      });

      return isValid;
    },
  };

  /* ===================================================================
     13. Public Namespace
     =================================================================== */

  window.VigCraft = Object.freeze({
    FormValidation: Object.freeze(FormValidation),
    utils: Object.freeze({
      qs,
      qsa,
      debounce,
      rafThrottle,
      clamp,
      prefersReducedMotion,
      getCSSVar,
    }),
  });

  /* ===================================================================
     14. Init Orchestrator
     Each module is isolated: a thrown error inside one never prevents
     the others from initializing.
     =================================================================== */

  function safeInit(label, initFn) {
    try {
      initFn();
    } catch (error) {
      Logger.error(`Failed to initialize "${label}":`, error);
    }
  }

  function init() {
    safeInit('mobile navigation', initMobileNav);
    safeInit('smooth scroll', initSmoothScroll);
    safeInit('active nav highlighting', initActiveNavHighlighting);
    safeInit('sticky header scroll state', initHeaderScrollState);
    safeInit('back to top', initBackToTop);
    safeInit('hero CTA interactions', initHeroCtaInteractions);
    safeInit('card touch interactions', initCardInteractions);
    safeInit('stats counter', initStatsCounter);
    safeInit('scroll reveal', initScrollReveal);

    Logger.info('Landing page initialized.');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
