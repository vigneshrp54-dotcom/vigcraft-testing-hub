/**
 * ==========================================================================
 * VigCraft Testing Hub — Dashboard
 * frontend/dashboard/dashboard.js
 *
 * Vanilla JS only. No dependencies.
 * Source of truth: dashboard.html + dashboard.css (both read-only here).
 * This file only wires up behaviour for elements that already exist in
 * the markup — it never injects new structural sections.
 * ==========================================================================
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 0. Small utilities
   * ------------------------------------------------------------------ */
  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const formatNumber = (n) => {
    try {
      return new Intl.NumberFormat('en-US').format(n);
    } catch (err) {
      return String(n);
    }
  };

  function formatRelativeTime(input) {
    const date = input instanceof Date ? input : new Date(input);
    if (isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const divisions = [
      { amount: 60, unit: 'second' },
      { amount: 60, unit: 'minute' },
      { amount: 24, unit: 'hour' },
      { amount: 7, unit: 'day' },
      { amount: 4.34524, unit: 'week' },
      { amount: 12, unit: 'month' },
      { amount: Number.POSITIVE_INFINITY, unit: 'year' }
    ];
    try {
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      let duration = diffSec;
      for (let i = 0; i < divisions.length; i++) {
        const division = divisions[i];
        if (Math.abs(duration) < division.amount) {
          return rtf.format(-Math.round(duration), division.unit);
        }
        duration /= division.amount;
      }
      return '';
    } catch (err) {
      return date.toLocaleDateString();
    }
  }

  /** Debounce helper for resize/input handlers. */
  function debounce(fn, wait) {
    let t;
    return function debounced(...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /** A single visually-hidden live region reused for screen-reader announcements. */
  const liveRegion = (function createLiveRegion() {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.className = 'vc-sr-only';
    el.id = 'vc-js-live-region';
    document.body.appendChild(el);
    return el;
  })();

  function announce(message) {
    if (!message) return;
    liveRegion.textContent = '';
    // Force a reflow so repeated identical messages are re-announced.
    window.requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  }

  /** Lightweight toast for transient feedback (errors, confirmations). Purely additive UI. */
  function showToast(message, type) {
    const palette = {
      success: '#2ECC71',
      danger: '#F0426B',
      warning: '#F5A623',
      info: '#3B9CF2'
    };
    const color = palette[type] || palette.info;

    const toast = document.createElement('div');
    toast.setAttribute('role', type === 'danger' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'danger' ? 'assertive' : 'polite');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      zIndex: '1000',
      maxWidth: '340px',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '0.8125rem',
      fontWeight: '600',
      color: '#F3F4F8',
      background: 'rgba(20, 23, 34, 0.92)',
      border: `1px solid ${color}`,
      boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
      backdropFilter: 'blur(18px) saturate(140%)',
      opacity: '0',
      transform: 'translateY(8px)',
      transition: prefersReducedMotion() ? 'none' : 'opacity 180ms ease, transform 180ms ease'
    });
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    const remove = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), prefersReducedMotion() ? 0 : 200);
    };
    const timer = setTimeout(remove, 4200);
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      remove();
    });
  }

  /** Renders a small inline error state with a retry action inside any container. */
  function renderInlineError(container, message, onRetry, colspan) {
    container.innerHTML = '';
    const wrap = document.createElement(colspan ? 'tr' : 'div');
    const cellWrap = document.createElement(colspan ? 'td' : 'div');
    if (colspan) cellWrap.setAttribute('colspan', String(colspan));

    Object.assign(cellWrap.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '32px 16px',
      textAlign: 'center',
      color: 'var(--vc-text-tertiary)',
      fontSize: 'var(--vc-fs-sm)'
    });

    const text = document.createElement('span');
    text.textContent = message;
    cellWrap.appendChild(text);

    if (typeof onRetry === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vc-link-btn';
      btn.textContent = 'Retry';
      btn.addEventListener('click', onRetry);
      cellWrap.appendChild(btn);
    }

    wrap.appendChild(cellWrap);
    container.appendChild(wrap);
  }

  /* ------------------------------------------------------------------
   * 1. Mock data + resilient data fetching
   *
   * Every widget declares a `data-source` API path in the markup. In
   * production these resolve against the real backend. Here we attempt
   * the real endpoint first (so this file is drop-in ready), and fall
   * back to local mock data if the network call fails — keeping every
   * widget populated and demonstrating graceful error handling.
   * ------------------------------------------------------------------ */
  const MOCK = {
    user: {
      name: 'Alex Morgan',
      firstName: 'Alex'
    },
    stats: [
      { metric: 'total-projects', value: 48, trend: 8.2, badIfUp: false },
      { metric: 'test-suites', value: 216, trend: 4.6, badIfUp: false },
      { metric: 'test-cases', value: 3842, trend: 12.1, badIfUp: false },
      { metric: 'executions', value: 1290, trend: -2.4, badIfUp: false },
      { metric: 'defects', value: 57, trend: -6.3, badIfUp: true }
    ],
    notifications: [
      { id: 'n1', title: 'Execution failed', message: 'Regression Suite #482 has 3 failing test cases.', time: Date.now() - 6 * 60 * 1000, read: false },
      { id: 'n2', title: 'New defect assigned', message: 'DEF-1042 was assigned to you by Priya Nair.', time: Date.now() - 45 * 60 * 1000, read: false },
      { id: 'n3', title: 'AI test generation complete', message: '18 new test cases generated for "Checkout Flow".', time: Date.now() - 3 * 60 * 60 * 1000, read: false },
      { id: 'n4', title: 'Weekly report ready', message: 'Your team\u2019s QA summary for last week is available.', time: Date.now() - 26 * 60 * 60 * 1000, read: true }
    ],
    activity: [
      { id: 'a1', type: 'passed', actor: 'CI Runner', action: 'passed execution', target: 'Smoke Suite \u2014 Payments', time: Date.now() - 4 * 60 * 1000 },
      { id: 'a2', type: 'failed', actor: 'CI Runner', action: 'flagged a failure in', target: 'Checkout Regression', time: Date.now() - 22 * 60 * 1000 },
      { id: 'a3', type: 'created', actor: 'Priya Nair', action: 'created test case', target: 'TC-2291: Guest checkout validation', time: Date.now() - 55 * 60 * 1000 },
      { id: 'a4', type: 'updated', actor: 'Devon Cole', action: 'updated defect', target: 'DEF-1042: Cart total mismatch', time: Date.now() - 3 * 60 * 60 * 1000 },
      { id: 'a5', type: 'created', actor: 'AI Assistant', action: 'generated 18 test cases for', target: 'Checkout Flow', time: Date.now() - 5 * 60 * 60 * 1000 },
      { id: 'a6', type: 'passed', actor: 'CI Runner', action: 'passed execution', target: 'Nightly Regression', time: Date.now() - 20 * 60 * 60 * 1000 }
    ],
    executionStatus: { passed: 612, failed: 48, blocked: 21, inProgress: 34 },
    latestProjects: [
      { id: 'p1', name: 'Payments Platform', owner: 'Priya Nair', status: 'active', testCases: 842, updatedAt: Date.now() - 30 * 60 * 1000 },
      { id: 'p2', name: 'Checkout Revamp', owner: 'Devon Cole', status: 'delayed', testCases: 316, updatedAt: Date.now() - 5 * 60 * 60 * 1000 },
      { id: 'p3', name: 'Mobile App v4', owner: 'Sam Ruiz', status: 'on-hold', testCases: 204, updatedAt: Date.now() - 26 * 60 * 60 * 1000 },
      { id: 'p4', name: 'Notifications Service', owner: 'Alex Morgan', status: 'completed', testCases: 128, updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      { id: 'p5', name: 'Internal Admin Tools', owner: 'Priya Nair', status: 'active', testCases: 96, updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000 }
    ],
    defectSummary: { critical: 4, high: 13, medium: 27, low: 13 }
  };

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Attempts a real network fetch of `url`; on any failure (network error,
   * timeout, non-2xx, malformed JSON) falls back to `mockValue`.
   * Always resolves — callers still wrap usage in try/catch for safety.
   */
  async function fetchWithFallback(url, mockValue, { timeout = 4000, minDelay = 350 } = {}) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;
    const started = Date.now();

    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller ? controller.signal : undefined });
      if (!res.ok) throw new Error(`Request to ${url} failed with status ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      // Expected in this static/demo context — fall back silently to mock data.
      const elapsed = Date.now() - started;
      if (elapsed < minDelay) await wait(minDelay - elapsed);
      return mockValue;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /* ------------------------------------------------------------------
   * 2. Sidebar toggle + mobile menu
   * ------------------------------------------------------------------ */
  function initSidebar() {
    const toggleBtn = qs('#vc-sidebar-toggle');
    const sidebar = qs('#vc-sidebar');
    if (!toggleBtn || !sidebar) return;

    const root = document.documentElement;
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const collapsedWidth = getComputedStyle(root).getPropertyValue('--vc-sidebar-width-collapsed').trim() || '76px';

    let backdrop = null;
    let mobileKeydownHandler = null;

    function getStoredCollapsed() {
      try {
        return window.localStorage.getItem('vc-sidebar-collapsed') === 'true';
      } catch (err) {
        return false;
      }
    }

    function storeCollapsed(value) {
      try {
        window.localStorage.setItem('vc-sidebar-collapsed', String(value));
      } catch (err) {
        /* Storage may be unavailable (private mode) — safe to ignore. */
      }
    }

    function applyDesktopCollapsed(collapsed) {
      root.style.setProperty('--vc-sidebar-width', collapsed ? collapsedWidth : '');
      qsa('.vc-sidebar__label', sidebar).forEach((label) => {
        label.style.display = collapsed ? 'none' : '';
      });
      qsa('.vc-sidebar__link', sidebar).forEach((link) => {
        const labelEl = qs('.vc-sidebar__label', link);
        if (collapsed && labelEl) {
          link.setAttribute('title', labelEl.textContent.trim());
        } else {
          link.removeAttribute('title');
        }
      });
      toggleBtn.setAttribute('aria-expanded', String(!collapsed));
      toggleBtn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    }

    function ensureBackdrop() {
      if (backdrop) return backdrop;
      backdrop = document.createElement('div');
      backdrop.setAttribute('aria-hidden', 'true');
      Object.assign(backdrop.style, {
        position: 'fixed',
        inset: '0',
        background: 'rgba(6, 7, 12, 0.55)',
        zIndex: '85',
        opacity: '0',
        transition: prefersReducedMotion() ? 'none' : 'opacity 220ms ease'
      });
      backdrop.addEventListener('click', closeMobileSidebar);
      return backdrop;
    }

    function trapFocus(e) {
      if (e.key === 'Escape') {
        closeMobileSidebar();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = qsa('a[href], button:not([disabled])', sidebar);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function openMobileSidebar() {
      sidebar.classList.add('is-open');
      sidebar.style.transform = 'translateX(0)';
      document.body.style.overflow = 'hidden';
      const bd = ensureBackdrop();
      document.body.appendChild(bd);
      requestAnimationFrame(() => {
        bd.style.opacity = '1';
      });
      toggleBtn.setAttribute('aria-expanded', 'true');
      const firstLink = qs('.vc-sidebar__link', sidebar);
      if (firstLink) firstLink.focus();
      mobileKeydownHandler = trapFocus;
      document.addEventListener('keydown', mobileKeydownHandler);
    }

    function closeMobileSidebar() {
      sidebar.classList.remove('is-open');
      sidebar.style.transform = '';
      document.body.style.overflow = '';
      if (backdrop && backdrop.parentNode) {
        backdrop.style.opacity = '0';
        setTimeout(() => backdrop && backdrop.remove(), prefersReducedMotion() ? 0 : 200);
      }
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (mobileKeydownHandler) {
        document.removeEventListener('keydown', mobileKeydownHandler);
        mobileKeydownHandler = null;
      }
      toggleBtn.focus();
    }

    function handleToggleClick() {
      if (mobileQuery.matches) {
        if (sidebar.classList.contains('is-open')) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      } else {
        const nowCollapsed = root.style.getPropertyValue('--vc-sidebar-width') === collapsedWidth;
        const collapsed = !nowCollapsed;
        applyDesktopCollapsed(collapsed);
        storeCollapsed(collapsed);
      }
    }

    function handleBreakpointChange() {
      if (mobileQuery.matches) {
        // Entering mobile: desktop collapse styling doesn't apply; ensure closed.
        root.style.setProperty('--vc-sidebar-width', '');
        qsa('.vc-sidebar__label', sidebar).forEach((label) => { label.style.display = ''; });
        qsa('.vc-sidebar__link', sidebar).forEach((link) => link.removeAttribute('title'));
        closeMobileSidebar();
      } else {
        // Returning to desktop: drop any mobile inline state, restore preference.
        sidebar.classList.remove('is-open');
        sidebar.style.transform = '';
        document.body.style.overflow = '';
        if (backdrop && backdrop.parentNode) backdrop.remove();
        applyDesktopCollapsed(getStoredCollapsed());
      }
    }

    toggleBtn.addEventListener('click', handleToggleClick);
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', handleBreakpointChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(handleBreakpointChange); // Safari < 14 fallback
    }

    // Initial state.
    if (!mobileQuery.matches) {
      applyDesktopCollapsed(getStoredCollapsed());
    } else {
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  /* ------------------------------------------------------------------
   * 3. Generic accessible dropdown (Notifications + User menu)
   * ------------------------------------------------------------------ */
  const openDropdowns = new Set();

  function createDropdown(trigger, panel, { isMenu = false, onOpen } = {}) {
    let outsideHandler = null;
    let keyHandler = null;
    let hasLoaded = false;

    function focusFirstItem() {
      const items = qsa(isMenu ? '[role="menuitem"]' : 'a, button, input', panel);
      if (items.length) items[0].focus();
    }

    function close({ restoreFocus = true } = {}) {
      if (panel.hidden) return;
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (outsideHandler) document.removeEventListener('click', outsideHandler, true);
      if (keyHandler) document.removeEventListener('keydown', keyHandler, true);
      openDropdowns.delete(close);
      if (restoreFocus) trigger.focus();
    }

    function open() {
      // Only one dropdown open at a time.
      openDropdowns.forEach((closeOther) => closeOther !== close && closeOther({ restoreFocus: false }));
      openDropdowns.add(close);

      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');

      if (!hasLoaded && typeof onOpen === 'function') {
        hasLoaded = true;
        onOpen();
      }

      outsideHandler = (e) => {
        if (!panel.contains(e.target) && !trigger.contains(e.target)) close();
      };
      keyHandler = (e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          close();
          return;
        }
        if (e.key === 'Tab') {
          const focusable = qsa('a[href], button:not([disabled]), input:not([disabled])', panel);
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
          return;
        }
        if (isMenu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
          e.preventDefault();
          const items = qsa('[role="menuitem"]', panel);
          if (!items.length) return;
          const currentIndex = items.indexOf(document.activeElement);
          const nextIndex = e.key === 'ArrowDown'
            ? (currentIndex + 1) % items.length
            : (currentIndex - 1 + items.length) % items.length;
          items[nextIndex].focus();
        }
      };
      document.addEventListener('click', outsideHandler, true);
      document.addEventListener('keydown', keyHandler, true);

      requestAnimationFrame(focusFirstItem);
    }

    trigger.addEventListener('click', () => {
      if (panel.hidden) open();
      else close();
    });

    return { open, close };
  }

  /* ------------------------------------------------------------------
   * 4. Notifications
   * ------------------------------------------------------------------ */
  function initNotifications() {
    const trigger = qs('#vc-notifications-btn');
    const panel = qs('#vc-notifications-panel');
    const list = qs('#vc-notifications-list');
    const countBadge = qs('#vc-notifications-count');
    const markAllBtn = qs('#vc-mark-all-read');
    if (!trigger || !panel || !list) return;

    let notifications = [];

    function updateBadge() {
      const unread = notifications.filter((n) => !n.read).length;
      if (countBadge) {
        if (unread > 0) {
          countBadge.hidden = false;
          countBadge.textContent = unread > 99 ? '99+' : String(unread);
        } else {
          countBadge.hidden = true;
        }
      }
      trigger.setAttribute('aria-label', unread > 0 ? `Notifications, ${unread} unread` : 'Notifications, no unread');
    }

    function renderNotifications() {
      list.innerHTML = '';
      if (!notifications.length) {
        const empty = document.createElement('li');
        empty.className = 'vc-notifications-list__empty';
        empty.textContent = 'No new notifications.';
        list.appendChild(empty);
        return;
      }

      notifications.forEach((n) => {
        const li = document.createElement('li');
        li.dataset.id = n.id;
        Object.assign(li.style, {
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '12px 18px',
          borderBottom: '1px solid var(--vc-border-subtle)',
          cursor: 'pointer',
          background: n.read ? 'transparent' : 'rgba(108, 92, 231, 0.08)'
        });
        li.setAttribute('tabindex', '0');
        li.setAttribute('role', 'button');
        li.setAttribute('aria-label', `${n.title}. ${n.read ? 'Read' : 'Unread'}. ${n.message}`);

        const titleRow = document.createElement('div');
        Object.assign(titleRow.style, { display: 'flex', alignItems: 'center', gap: '8px' });

        if (!n.read) {
          const dot = document.createElement('span');
          dot.className = 'vc-status-dot vc-status-dot--info';
          dot.setAttribute('aria-hidden', 'true');
          titleRow.appendChild(dot);
        }

        const title = document.createElement('strong');
        title.textContent = n.title;
        title.style.fontSize = 'var(--vc-fs-sm)';
        title.style.color = 'var(--vc-text-primary)';
        titleRow.appendChild(title);

        const message = document.createElement('span');
        message.textContent = n.message;
        message.style.fontSize = 'var(--vc-fs-xs)';
        message.style.color = 'var(--vc-text-secondary)';

        const time = document.createElement('span');
        time.textContent = formatRelativeTime(n.time);
        time.style.fontSize = 'var(--vc-fs-xs)';
        time.style.color = 'var(--vc-text-tertiary)';

        li.appendChild(titleRow);
        li.appendChild(message);
        li.appendChild(time);

        const markRead = () => {
          if (n.read) return;
          n.read = true;
          renderNotifications();
          updateBadge();
        };
        li.addEventListener('click', markRead);
        li.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            markRead();
          }
        });

        list.appendChild(li);
      });
    }

    function load() {
      list.innerHTML = '';
      const loading = document.createElement('li');
      loading.className = 'vc-notifications-list__empty';
      loading.textContent = 'Loading notifications\u2026';
      list.appendChild(loading);

      const source = list.dataset.source || '/api/notifications';
      fetchWithFallback(source, MOCK.notifications)
        .then((data) => {
          notifications = (Array.isArray(data) ? data : []).map((n) => ({ ...n }));
          renderNotifications();
          updateBadge();
        })
        .catch(() => {
          renderInlineError(list, 'Couldn\u2019t load notifications.', load);
        });
    }

    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        if (!notifications.length) return;
        notifications.forEach((n) => { n.read = true; });
        renderNotifications();
        updateBadge();
        announce('All notifications marked as read.');
      });
    }

    createDropdown(trigger, panel, { onOpen: load });
    updateBadge();
  }

  /* ------------------------------------------------------------------
   * 5. User profile dropdown
   * ------------------------------------------------------------------ */
  function initUserMenu() {
    const trigger = qs('#vc-user-menu-btn');
    const panel = qs('#vc-user-menu-panel');
    const logoutLink = qs('#vc-user-menu-logout');
    if (!trigger || !panel) return;

    createDropdown(trigger, panel, { isMenu: true });

    [logoutLink, qs('#vc-nav-logout')].forEach((link) => {
      if (!link) return;
      link.addEventListener('click', (e) => {
        const confirmed = window.confirm('Are you sure you want to log out?');
        if (!confirmed) e.preventDefault();
      });
    });
  }

  /* ------------------------------------------------------------------
   * 6. Global search
   * ------------------------------------------------------------------ */
  function initSearch() {
    const form = qs('#vc-global-search-form');
    const input = qs('#vc-global-search');
    if (!form || !input) return;

    function shake(el) {
      if (prefersReducedMotion() || typeof el.animate !== 'function') return;
      el.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(0)' }
        ],
        { duration: 320, easing: 'ease-in-out' }
      );
    }

    form.addEventListener('submit', (e) => {
      const value = input.value.trim();
      if (!value) {
        e.preventDefault();
        shake(input);
        input.focus();
        announce('Enter a search term to continue.');
      }
      // Non-empty: let the form submit natively (GET /search?q=...).
    });

    input.addEventListener('focus', () => {
      qs('.vc-search').classList.add('is-focused');
    });
    input.addEventListener('blur', () => {
      qs('.vc-search').classList.remove('is-focused');
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (input.value) {
          input.value = '';
        } else {
          input.blur();
        }
      }
    });

    // Global "/" and Ctrl/Cmd+K shortcuts to jump into search.
    document.addEventListener('keydown', (e) => {
      const target = e.target;
      const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.key === '/' && !isTyping) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  /* ------------------------------------------------------------------
   * 7. Welcome section: date + user
   * ------------------------------------------------------------------ */
  function initWelcome() {
    const dateEl = qs('#vc-current-date');
    if (dateEl) {
      try {
        dateEl.textContent = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date());
      } catch (err) {
        dateEl.textContent = new Date().toDateString();
      }
    }

    const nameEl = qs('#vc-welcome-username');
    const userMenuName = qs('#vc-current-user-name');

    fetchWithFallback('/api/dashboard/user', MOCK.user, { minDelay: 150 })
      .then((user) => {
        if (nameEl && user && user.firstName) nameEl.textContent = user.firstName;
        if (userMenuName && user && user.name) userMenuName.textContent = user.name;
      })
      .catch(() => {
        if (userMenuName) userMenuName.textContent = 'Your account';
      });
  }

  /* ------------------------------------------------------------------
   * 8. Statistics counter animation
   * ------------------------------------------------------------------ */
  function animateCount(el, target, { duration = 900, formatter = formatNumber } = {}) {
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = formatter(target);
      return;
    }
    const start = 0;
    const startTime = performance.now();

    function tick(now) {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = Math.round(start + (target - start) * eased);
      el.textContent = formatter(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatter(target);
      }
    }
    requestAnimationFrame(tick);
  }

  function setTrend(el, trendPercent, badIfUp) {
    if (!el) return;
    if (typeof trendPercent !== 'number' || isNaN(trendPercent)) {
      el.textContent = '';
      return;
    }
    const isUp = trendPercent >= 0;
    const good = badIfUp ? !isUp : isUp;
    const arrow = isUp ? '\u2191' : '\u2193';
    el.textContent = `${arrow} ${Math.abs(trendPercent).toFixed(1)}% this week`;
    el.style.color = good ? 'var(--vc-success-500)' : 'var(--vc-danger-500)';
  }

  function loadStats() {
    const grid = qs('#vc-stats-grid');
    if (!grid) return;
    const source = grid.dataset.source || '/api/dashboard/stats';

    fetchWithFallback(source, MOCK.stats)
      .then((stats) => {
        if (!Array.isArray(stats)) throw new Error('Malformed stats payload');
        stats.forEach((stat) => {
          const valueEl = qs(`#vc-stat-${stat.metric}-value`);
          const trendEl = qs(`#vc-stat-${stat.metric}-trend`);
          animateCount(valueEl, Number(stat.value) || 0);
          setTrend(trendEl, Number(stat.trend), !!stat.badIfUp);
        });
      })
      .catch(() => {
        qsa('.vc-stat-card__value', grid).forEach((el) => { el.textContent = '\u2014'; });
        showToast('Couldn\u2019t load statistics. Showing last known values.', 'warning');
      });
  }

  /* ------------------------------------------------------------------
   * 9. Recent activity
   * ------------------------------------------------------------------ */
  const ACTIVITY_STATUS_DOT = {
    passed: 'vc-status-dot--success',
    failed: 'vc-status-dot--danger',
    created: 'vc-status-dot--info',
    updated: 'vc-status-dot--warning'
  };

  function loadRecentActivity() {
    const list = qs('#vc-recent-activity-list');
    if (!list) return;
    const source = list.dataset.source || '/api/dashboard/activity';

    list.innerHTML = '';
    const loadingItem = document.createElement('li');
    loadingItem.className = 'vc-activity-list__empty';
    loadingItem.textContent = 'Loading recent activity\u2026';
    list.appendChild(loadingItem);

    fetchWithFallback(source, MOCK.activity)
      .then((items) => {
        if (!Array.isArray(items)) throw new Error('Malformed activity payload');
        list.innerHTML = '';

        if (!items.length) {
          const empty = document.createElement('li');
          empty.className = 'vc-activity-list__empty';
          empty.textContent = 'No recent activity to display.';
          list.appendChild(empty);
          return;
        }

        items.forEach((item) => {
          const li = document.createElement('li');
          Object.assign(li.style, {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '10px 8px',
            borderRadius: 'var(--vc-radius-md)',
            transition: 'background var(--vc-transition-fast)'
          });

          const dot = document.createElement('span');
          dot.className = `vc-status-dot ${ACTIVITY_STATUS_DOT[item.type] || 'vc-status-dot--info'}`;
          dot.setAttribute('aria-hidden', 'true');
          dot.style.marginTop = '6px';

          const body = document.createElement('div');
          body.style.display = 'flex';
          body.style.flexDirection = 'column';
          body.style.gap = '2px';
          body.style.minWidth = '0';

          const text = document.createElement('p');
          text.style.margin = '0';
          text.style.fontSize = 'var(--vc-fs-sm)';
          text.style.color = 'var(--vc-text-secondary)';

          const actorEl = document.createElement('strong');
          actorEl.style.color = 'var(--vc-text-primary)';
          actorEl.textContent = item.actor || 'Someone';
          text.appendChild(actorEl);
          text.appendChild(document.createTextNode(` ${item.action || 'updated'} `));
          const targetEl = document.createElement('span');
          targetEl.style.color = 'var(--vc-text-primary)';
          targetEl.textContent = item.target || '';
          text.appendChild(targetEl);

          const time = document.createElement('span');
          time.style.fontSize = 'var(--vc-fs-xs)';
          time.style.color = 'var(--vc-text-tertiary)';
          time.textContent = formatRelativeTime(item.time);

          body.appendChild(text);
          body.appendChild(time);
          li.appendChild(dot);
          li.appendChild(body);
          list.appendChild(li);
        });
      })
      .catch(() => {
        renderInlineError(list, 'Couldn\u2019t load recent activity.', loadRecentActivity);
      });
  }

  /* ------------------------------------------------------------------
   * 10. Execution status widget (legend + chart)
   * ------------------------------------------------------------------ */
  function buildDonutChart(container, segments, total) {
    const size = 180;
    const radius = 70;
    const strokeWidth = 20;
    const circumference = 2 * Math.PI * radius;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('focusable', 'false');

    const group = document.createElementNS(svgNS, 'g');
    group.setAttribute('transform', `rotate(-90 ${size / 2} ${size / 2})`);
    svg.appendChild(group);

    const track = document.createElementNS(svgNS, 'circle');
    track.setAttribute('cx', String(size / 2));
    track.setAttribute('cy', String(size / 2));
    track.setAttribute('r', String(radius));
    track.setAttribute('fill', 'none');
    track.setAttribute('stroke', 'rgba(255,255,255,0.06)');
    track.setAttribute('stroke-width', String(strokeWidth));
    group.appendChild(track);

    let offsetSoFar = 0;
    segments.forEach((seg) => {
      if (!seg.value) return;
      const fraction = total > 0 ? seg.value / total : 0;
      const dash = fraction * circumference;

      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', String(size / 2));
      circle.setAttribute('cy', String(size / 2));
      circle.setAttribute('r', String(radius));
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', seg.color);
      circle.setAttribute('stroke-width', String(strokeWidth));
      circle.setAttribute('stroke-linecap', 'butt');
      circle.setAttribute('stroke-dasharray', `${circumference} ${circumference}`);
      circle.setAttribute('stroke-dashoffset', String(circumference));
      circle.style.transition = prefersReducedMotion() ? 'none' : 'stroke-dashoffset 700ms cubic-bezier(0.4,0,0.2,1)';
      group.appendChild(circle);

      const startOffset = circumference - offsetSoFar;
      offsetSoFar += dash;
      const endOffset = circumference - offsetSoFar;

      requestAnimationFrame(() => {
        circle.setAttribute('stroke-dashoffset', String(startOffset));
        requestAnimationFrame(() => {
          circle.setAttribute('stroke-dashoffset', String(endOffset));
        });
      });
    });

    const centerText = document.createElementNS(svgNS, 'text');
    centerText.setAttribute('x', '50%');
    centerText.setAttribute('y', '46%');
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('dominant-baseline', 'middle');
    centerText.setAttribute('fill', 'var(--vc-text-primary)');
    centerText.style.fontSize = '22px';
    centerText.style.fontWeight = '700';
    centerText.textContent = formatNumber(total);
    svg.appendChild(centerText);

    const centerLabel = document.createElementNS(svgNS, 'text');
    centerLabel.setAttribute('x', '50%');
    centerLabel.setAttribute('y', '62%');
    centerLabel.setAttribute('text-anchor', 'middle');
    centerLabel.setAttribute('dominant-baseline', 'middle');
    centerLabel.setAttribute('fill', 'var(--vc-text-tertiary)');
    centerLabel.style.fontSize = '11px';
    centerLabel.style.fontWeight = '600';
    centerLabel.style.textTransform = 'uppercase';
    centerLabel.style.letterSpacing = '0.04em';
    centerLabel.textContent = 'Total runs';
    svg.appendChild(centerLabel);

    container.innerHTML = '';
    container.appendChild(svg);
  }

  function loadExecutionStatus() {
    const widget = qs('#vc-execution-status-widget');
    const chartEl = qs('#vc-execution-status-chart');
    if (!widget) return;
    const source = widget.dataset.source || '/api/dashboard/execution-status';

    fetchWithFallback(source, MOCK.executionStatus)
      .then((data) => {
        const passed = Number(data.passed) || 0;
        const failed = Number(data.failed) || 0;
        const blocked = Number(data.blocked) || 0;
        const inProgress = Number(data.inProgress) || 0;
        const total = passed + failed + blocked + inProgress;

        animateCount(qs('#vc-execution-passed-value'), passed);
        animateCount(qs('#vc-execution-failed-value'), failed);
        animateCount(qs('#vc-execution-blocked-value'), blocked);
        animateCount(qs('#vc-execution-in-progress-value'), inProgress);

        if (chartEl) {
          buildDonutChart(chartEl, [
            { value: passed, color: 'var(--vc-success-500)' },
            { value: failed, color: 'var(--vc-danger-500)' },
            { value: blocked, color: 'var(--vc-warning-500)' },
            { value: inProgress, color: 'var(--vc-info-500)' }
          ], total);
          chartEl.setAttribute('aria-label', `Execution status distribution: ${passed} passed, ${failed} failed, ${blocked} blocked, ${inProgress} in progress`);
        }
      })
      .catch(() => {
        ['passed', 'failed', 'blocked', 'in-progress'].forEach((key) => {
          const el = qs(`#vc-execution-${key}-value`);
          if (el) el.textContent = '\u2014';
        });
        if (chartEl) {
          renderInlineError(chartEl, 'Couldn\u2019t load execution status.', loadExecutionStatus);
        }
      });
  }

  /* ------------------------------------------------------------------
   * 11. Latest projects table
   * ------------------------------------------------------------------ */
  const PROJECT_STATUS_META = {
    active: { label: 'Active', dot: 'vc-status-dot--success' },
    completed: { label: 'Completed', dot: 'vc-status-dot--info' },
    'on-hold': { label: 'On Hold', dot: 'vc-status-dot--warning' },
    delayed: { label: 'Delayed', dot: 'vc-status-dot--danger' },
    archived: { label: 'Archived', dot: 'vc-status-dot--info' }
  };

  function loadLatestProjects() {
    const table = qs('#vc-latest-projects-table');
    const tbody = qs('#vc-latest-projects-tbody');
    if (!table || !tbody) return;
    const source = table.dataset.source || '/api/dashboard/latest-projects';

    fetchWithFallback(source, MOCK.latestProjects)
      .then((projects) => {
        if (!Array.isArray(projects)) throw new Error('Malformed projects payload');
        tbody.innerHTML = '';

        if (!projects.length) {
          const row = document.createElement('tr');
          row.id = 'vc-latest-projects-empty-row';
          const cell = document.createElement('td');
          cell.setAttribute('colspan', '6');
          cell.textContent = 'No projects available yet.';
          row.appendChild(cell);
          tbody.appendChild(row);
          return;
        }

        projects.forEach((project) => {
          const meta = PROJECT_STATUS_META[project.status] || { label: project.status || 'Unknown', dot: 'vc-status-dot--info' };
          const tr = document.createElement('tr');

          const nameTd = document.createElement('td');
          nameTd.textContent = project.name || 'Untitled project';
          nameTd.style.color = 'var(--vc-text-primary)';
          nameTd.style.fontWeight = '600';

          const ownerTd = document.createElement('td');
          ownerTd.textContent = project.owner || '\u2014';

          const statusTd = document.createElement('td');
          const statusWrap = document.createElement('span');
          Object.assign(statusWrap.style, { display: 'inline-flex', alignItems: 'center', gap: '8px' });
          const dot = document.createElement('span');
          dot.className = `vc-status-dot ${meta.dot}`;
          dot.setAttribute('aria-hidden', 'true');
          statusWrap.appendChild(dot);
          statusWrap.appendChild(document.createTextNode(meta.label));
          statusTd.appendChild(statusWrap);

          const casesTd = document.createElement('td');
          casesTd.textContent = formatNumber(Number(project.testCases) || 0);

          const updatedTd = document.createElement('td');
          updatedTd.textContent = formatRelativeTime(project.updatedAt);

          const actionsTd = document.createElement('td');
          const link = document.createElement('a');
          link.className = 'vc-link-btn';
          link.href = `/projects/${encodeURIComponent(project.id || '')}`;
          link.textContent = 'View';
          actionsTd.appendChild(link);

          tr.appendChild(nameTd);
          tr.appendChild(ownerTd);
          tr.appendChild(statusTd);
          tr.appendChild(casesTd);
          tr.appendChild(updatedTd);
          tr.appendChild(actionsTd);
          tbody.appendChild(tr);
        });
      })
      .catch(() => {
        renderInlineError(tbody, 'Couldn\u2019t load latest projects.', loadLatestProjects, 6);
      });
  }

  /* ------------------------------------------------------------------
   * 12. Defect summary
   * ------------------------------------------------------------------ */
  function loadDefectSummary() {
    const widget = qs('#vc-defect-summary-widget');
    if (!widget) return;
    const source = widget.dataset.source || '/api/dashboard/defect-summary';

    fetchWithFallback(source, MOCK.defectSummary)
      .then((data) => {
        animateCount(qs('#vc-defect-critical-value'), Number(data.critical) || 0);
        animateCount(qs('#vc-defect-high-value'), Number(data.high) || 0);
        animateCount(qs('#vc-defect-medium-value'), Number(data.medium) || 0);
        animateCount(qs('#vc-defect-low-value'), Number(data.low) || 0);
      })
      .catch(() => {
        ['critical', 'high', 'medium', 'low'].forEach((sev) => {
          const el = qs(`#vc-defect-${sev}-value`);
          if (el) el.textContent = '\u2014';
        });
        showToast('Couldn\u2019t load defect summary.', 'warning');
      });
  }

  /* ------------------------------------------------------------------
   * 13. Quick actions
   * ------------------------------------------------------------------ */
  function initQuickActions() {
    const grid = qs('#vc-quick-actions-grid');
    if (!grid) return;

    const ACTION_ROUTES = {
      'new-project': '/projects/new',
      'new-test-suite': '/test-suites/new',
      'new-test-case': '/test-cases/new',
      'run-execution': '/test-executions/new',
      'report-defect': '/defects/new',
      'ai-generate-tests': '/ai-tools/generate-tests'
    };

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.vc-quick-action-btn');
      if (!btn || !grid.contains(btn)) return;

      const action = btn.dataset.action;
      const destination = ACTION_ROUTES[action];

      if (!prefersReducedMotion() && typeof btn.animate === 'function') {
        btn.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }],
          { duration: 220, easing: 'ease-out' }
        );
      }

      try {
        if (!destination) throw new Error(`No route configured for action "${action}"`);
        announce(`Opening ${btn.textContent.trim()}\u2026`);
        window.setTimeout(() => {
          window.location.href = destination;
        }, prefersReducedMotion() ? 0 : 140);
      } catch (err) {
        showToast('This action isn\u2019t available right now.', 'danger');
      }
    });
  }

  /* ------------------------------------------------------------------
   * 14. Footer year
   * ------------------------------------------------------------------ */
  function initFooter() {
    const yearEl = qs('#vc-footer-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------
   * 15. Init
   * ------------------------------------------------------------------ */
  function init() {
    try { initSidebar(); } catch (err) { console.error('Sidebar init failed:', err); }
    try { initNotifications(); } catch (err) { console.error('Notifications init failed:', err); }
    try { initUserMenu(); } catch (err) { console.error('User menu init failed:', err); }
    try { initSearch(); } catch (err) { console.error('Search init failed:', err); }
    try { initWelcome(); } catch (err) { console.error('Welcome init failed:', err); }
    try { initQuickActions(); } catch (err) { console.error('Quick actions init failed:', err); }
    try { initFooter(); } catch (err) { console.error('Footer init failed:', err); }

    try { loadStats(); } catch (err) { console.error('Stats load failed:', err); }
    try { loadRecentActivity(); } catch (err) { console.error('Activity load failed:', err); }
    try { loadExecutionStatus(); } catch (err) { console.error('Execution status load failed:', err); }
    try { loadLatestProjects(); } catch (err) { console.error('Latest projects load failed:', err); }
    try { loadDefectSummary(); } catch (err) { console.error('Defect summary load failed:', err); }

    // Recalculate the donut chart on resize (debounced) so it stays crisp.
    window.addEventListener('resize', debounce(() => {
      const chartEl = qs('#vc-execution-status-chart');
      if (chartEl && chartEl.querySelector('svg')) loadExecutionStatus();
    }, 400));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();