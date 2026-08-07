/**
 * ==========================================================================
 * VigCraft Testing Hub — Projects Page
 * frontend/projects/projects.js
 *
 * Principal Frontend Architect: Hallmark AI
 *
 * Enterprise-grade, dependency-free ES6+ module implementing all client
 * side interactivity for projects.html. This file relies exclusively on
 * the HTML structure and CSS classes that already exist in projects.html
 * and projects.css — no markup, class names, or selectors are introduced
 * into those files, and no external libraries are used.
 *
 * Architecture:
 *   - Config          -> centralised selectors, constants & data maps
 *   - Utils           -> small, pure helper functions
 *   - ToastManager     -> toast notification system
 *   - ModalManager      -> generic modal open/close/focus-trap engine
 *   - SidebarController -> sidebar toggle + mobile navigation
 *   - DropdownController-> header user-menu dropdown
 *   - TableController    -> search, filter, sort, empty/no-results/loading
 *   - StatsCounter        -> animated statistics counters
 *   - ProgressAnimator     -> animated progress bar fills
 *   - ProjectActions        -> view / edit / delete / create project flows
 *   - App                    -> bootstraps everything on DOMContentLoaded
 * ==========================================================================
 */

(() => {
  'use strict';

  /* ========================================================================
     1. CONFIGURATION
     ======================================================================== */

  const Config = {
    selectors: {
      // Header / Sidebar
      menuToggle: '.app-header__menu-toggle',
      appBody: '.app-body',
      sidebar: '.app-sidebar',
      sidebarLinks: '.sidebar-nav__link',
      sidebarItems: '.sidebar-nav__item',
      userMenuBtn: '.app-header__user-btn',
      userMenuWrap: '.app-header__user',

      // Search
      globalSearchInput: '#global-search',
      projectSearchInput: '#project-search',

      // Filters
      filterType: '#filter-type',
      filterStatus: '#filter-status',
      clearFiltersBtn: '#clear-filters-btn',
      moreFiltersBtn: '.toolbar__filters .btn--secondary',

      // Table
      table: '#projects-table',
      tableBody: '.data-table__body',
      tableRow: '.data-table__row',
      sortBtn: '.data-table__sort-btn',
      tableResponsive: '.table-responsive',
      tableSkeleton: '.table-skeleton',
      emptyState: '.empty-state[data-state="empty"]',
      noResultsState: '.empty-state--no-results',
      tableFooterSummary: '.table-footer__summary',

      // Stats
      statCards: '.stat-card',
      statValue: '.stat-card__value',

      // Modals
      modal: '.modal',
      modalOpenTrigger: '[data-modal-target]',
      modalCloseTrigger: '[data-modal-close]',
      modalDialog: '.modal__dialog',
      createModal: '#create-project-modal',
      deleteModal: '#delete-confirm-modal',
      createForm: '#create-project-form',

      // Row actions
      rowActionBtn: '[data-action]',

      // Progress
      progressBar: '.progress-bar',
      progressFill: '.progress-bar__fill',
      progressLabel: '.progress-bar__label',

      // Status badges
      statusBadge: '.status-badge',
    },

    breakpoints: {
      mobile: 768,
    },

    typeLabels: {
      web: 'Web Application',
      mobile: 'Mobile Application',
      api: 'API / Backend',
      desktop: 'Desktop',
    },

    statusLabels: {
      active: 'Active',
      'on-hold': 'On Hold',
      completed: 'Completed',
      archived: 'Archived',
    },

    toastDuration: 4200,
    loadingSimDuration: 700,
    debounceDelay: 250,
  };

  /* ========================================================================
     2. UTILITIES
     ======================================================================== */

  const Utils = {
    /** Debounce any function by a given delay (ms). */
    debounce(fn, delay = Config.debounceDelay) {
      let timer = null;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    },

    /** Query a single element, optionally scoped. */
    qs(selector, scope = document) {
      return scope.querySelector(selector);
    },

    /** Query multiple elements as a real array, optionally scoped. */
    qsa(selector, scope = document) {
      return Array.from(scope.querySelectorAll(selector));
    },

    /** Generate a lightweight unique id. */
    uid(prefix = 'id') {
      return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    },

    /** Format a Date object to "Mon DD, YYYY" (e.g. "Aug 05, 2026"). */
    formatDate(date) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = String(date.getDate()).padStart(2, '0');
      return `${months[date.getMonth()]} ${day}, ${date.getFullYear()}`;
    },

    /** Generate the next sequential project reference code. */
    nextProjectCode() {
      const num = 1000 + Math.floor(Math.random() * 8999);
      return `PRJ-${num}`;
    },

    /** Ease-out cubic, used for counter/number animations. */
    easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    },

    /** Animate a numeric value over a duration using requestAnimationFrame. */
    animateValue({ from = 0, to, duration = 900, onUpdate, onComplete }) {
      const start = performance.now();
      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = Utils.easeOutCubic(progress);
        const value = Math.round(from + (to - from) * eased);
        onUpdate(value);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else if (typeof onComplete === 'function') {
          onComplete();
        }
      };
      requestAnimationFrame(step);
    },

    /** Trap focus within a container for keyboard accessibility. */
    getFocusableElements(container) {
      const selector = [
        'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
        'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])',
      ].join(',');
      return Utils.qsa(selector, container).filter((el) => el.offsetParent !== null);
    },
  };

  /* ========================================================================
     3. TOAST NOTIFICATION SYSTEM
     ======================================================================== */

  class ToastManager {
    constructor() {
      this.container = this._createContainer();
      document.body.appendChild(this.container);
    }

    _createContainer() {
      const container = document.createElement('div');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      container.style.cssText = `
        position: fixed;
        top: calc(var(--header-height, 64px) + 16px);
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 340px;
        pointer-events: none;
      `;
      return container;
    }

    /**
     * Show a toast notification.
     * @param {string} message
     * @param {'success'|'danger'|'warning'|'info'} type
     */
    show(message, type = 'info') {
      const colors = {
        success: { border: 'var(--color-success)', soft: 'var(--color-success-soft)' },
        danger: { border: 'var(--color-danger)', soft: 'var(--color-danger-soft)' },
        warning: { border: 'var(--color-warning)', soft: 'var(--color-warning-soft)' },
        info: { border: 'var(--color-primary)', soft: 'var(--color-primary-soft)' },
      };
      const palette = colors[type] || colors.info;

      const toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      toast.style.cssText = `
        pointer-events: auto;
        background: var(--color-card);
        border: 1px solid var(--color-border);
        border-left: 3px solid ${palette.border};
        color: var(--color-text-primary);
        font-family: var(--font-sans);
        font-size: 13.5px;
        line-height: 1.4;
        padding: 12px 14px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        opacity: 0;
        transform: translateX(24px);
        transition: opacity var(--transition-base), transform var(--transition-base);
      `;

      const text = document.createElement('span');
      text.textContent = message;
      text.style.cssText = 'flex: 1;';

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Dismiss notification');
      closeBtn.textContent = '×';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 0;
        flex-shrink: 0;
      `;

      const dismiss = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(24px)';
        setTimeout(() => toast.remove(), 220);
      };

      closeBtn.addEventListener('click', dismiss);

      toast.appendChild(text);
      toast.appendChild(closeBtn);
      this.container.appendChild(toast);

      // Trigger entrance animation on next frame.
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
      });

      const timer = setTimeout(dismiss, Config.toastDuration);
      toast.addEventListener('mouseenter', () => clearTimeout(timer));

      return toast;
    }

    success(message) { return this.show(message, 'success'); }
    danger(message) { return this.show(message, 'danger'); }
    warning(message) { return this.show(message, 'warning'); }
    info(message) { return this.show(message, 'info'); }
  }

  /* ========================================================================
     4. MODAL MANAGER (generic, works for static & dynamically-built modals)
     ======================================================================== */

  class ModalManager {
    constructor() {
      this.activeModal = null;
      this.lastFocusedEl = null;
      this._bindGlobalEvents();
    }

    _bindGlobalEvents() {
      // Event delegation: open triggers.
      document.addEventListener('click', (e) => {
        const opener = e.target.closest(Config.selectors.modalOpenTrigger);
        if (opener) {
          const targetId = opener.getAttribute('data-modal-target');
          const modal = document.getElementById(targetId);
          if (modal) {
            this.open(modal, opener);
          }
          return;
        }

        const closer = e.target.closest(Config.selectors.modalCloseTrigger);
        if (closer) {
          const modal = closer.closest(Config.selectors.modal);
          if (modal) this.close(modal);
        }
      });

      // ESC key closes the topmost active modal.
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.activeModal) {
          this.close(this.activeModal);
        }
        if (e.key === 'Tab' && this.activeModal) {
          this._trapFocus(e, this.activeModal);
        }
      });
    }

    open(modal, triggerEl = null) {
      if (!modal) return;
      this.lastFocusedEl = triggerEl || document.activeElement;
      this.activeModal = modal;

      modal.hidden = false;
      document.body.style.overflow = 'hidden';

      // Move focus into the dialog for keyboard accessibility.
      const dialog = Utils.qs(Config.selectors.modalDialog, modal) || modal;
      const focusable = Utils.getFocusableElements(dialog);
      (focusable[0] || dialog).focus({ preventScroll: true });

      modal.dispatchEvent(new CustomEvent('modal:open', { bubbles: true }));
    }

    close(modal) {
      if (!modal || modal.hidden) return;
      modal.hidden = true;

      if (this.activeModal === modal) {
        document.body.style.overflow = '';
        this.activeModal = null;
      }

      if (this.lastFocusedEl && typeof this.lastFocusedEl.focus === 'function') {
        this.lastFocusedEl.focus({ preventScroll: true });
      }

      modal.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));

      // Clean up modals that were dynamically injected (view/edit modals).
      if (modal.dataset.dynamic === 'true') {
        setTimeout(() => modal.remove(), 250);
      }
    }

    _trapFocus(e, modal) {
      const dialog = Utils.qs(Config.selectors.modalDialog, modal) || modal;
      const focusable = Utils.getFocusableElements(dialog);
      if (focusable.length === 0) return;

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
  }

  /* ========================================================================
     5. SIDEBAR CONTROLLER (toggle + mobile navigation + responsive)
     ======================================================================== */

  class SidebarController {
    constructor() {
      this.toggleBtn = Utils.qs(Config.selectors.menuToggle);
      this.sidebar = Utils.qs(Config.selectors.sidebar);
      this.isOpen = true;
      this._bindEvents();
      this._syncWithViewport();
    }

    _bindEvents() {
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', () => this.toggle());
      }

      // Close mobile nav automatically after selecting a link.
      document.addEventListener('click', (e) => {
        const link = e.target.closest(Config.selectors.sidebarLinks);
        if (link && this._isMobile()) {
          this.close();
        }
      });

      window.addEventListener('resize', Utils.debounce(() => this._syncWithViewport(), 150));
    }

    _isMobile() {
      return window.innerWidth <= Config.breakpoints.mobile;
    }

    _syncWithViewport() {
      if (!this.sidebar) return;
      if (this._isMobile()) {
        this.close();
      } else {
        this.open();
      }
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      if (!this.sidebar) return;
      this.isOpen = true;
      this.sidebar.style.display = '';
      if (this.toggleBtn) this.toggleBtn.setAttribute('aria-expanded', 'true');
    }

    close() {
      if (!this.sidebar) return;
      // On desktop we never fully hide navigation — only collapse on mobile.
      if (this._isMobile()) {
        this.isOpen = false;
        this.sidebar.style.display = 'none';
        if (this.toggleBtn) this.toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  /* ========================================================================
     6. DROPDOWN CONTROLLER (header user menu)
     ======================================================================== */

  class DropdownController {
    constructor(toast) {
      this.toast = toast;
      this.btn = Utils.qs(Config.selectors.userMenuBtn);
      this.wrap = Utils.qs(Config.selectors.userMenuWrap);
      this.panel = null;
      this._bindEvents();
    }

    _bindEvents() {
      if (!this.btn || !this.wrap) return;

      this.btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isOpen() ? this.close() : this.open();
      });

      this.btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.open();
          const first = this.panel && Utils.qs('button, a', this.panel);
          if (first) first.focus();
        }
      });

      document.addEventListener('click', (e) => {
        if (this.isOpen() && !this.wrap.contains(e.target)) {
          this.close();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
          this.btn.focus();
        }
      });
    }

    isOpen() {
      return this.btn.getAttribute('aria-expanded') === 'true';
    }

    open() {
      if (!this.panel) this.panel = this._buildPanel();
      this.wrap.appendChild(this.panel);
      this.btn.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => {
        this.panel.style.opacity = '1';
        this.panel.style.transform = 'translateY(0)';
      });
    }

    close() {
      this.btn.setAttribute('aria-expanded', 'false');
      if (this.panel) {
        this.panel.style.opacity = '0';
        this.panel.style.transform = 'translateY(-6px)';
        setTimeout(() => this.panel && this.panel.remove(), 180);
      }
    }

    _buildPanel() {
      const panel = document.createElement('div');
      panel.setAttribute('role', 'menu');
      panel.style.cssText = `
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 180px;
        background: var(--color-card);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        opacity: 0;
        transform: translateY(-6px);
        transition: opacity var(--transition-fast), transform var(--transition-fast);
        z-index: 500;
      `;

      // Ensure the wrapper can host an absolutely-positioned child.
      this.wrap.style.position = 'relative';

      const items = [
        { label: 'My Profile', action: 'profile' },
        { label: 'Account Settings', action: 'settings' },
        { label: 'Sign Out', action: 'signout' },
      ];

      items.forEach(({ label, action }) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.setAttribute('role', 'menuitem');
        item.textContent = label;
        item.style.cssText = `
          background: none;
          border: none;
          text-align: left;
          color: var(--color-text-primary);
          font-family: var(--font-sans);
          font-size: 13.5px;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--transition-fast);
        `;
        item.addEventListener('mouseenter', () => { item.style.background = 'var(--color-surface)'; });
        item.addEventListener('mouseleave', () => { item.style.background = 'none'; });
        item.addEventListener('click', () => {
          this.close();
          this.toast.info(`${label} selected.`);
        });
        panel.appendChild(item);
      });

      return panel;
    }
  }

  /* ========================================================================
     7. STATISTICS COUNTER ANIMATION
     ======================================================================== */

  class StatsCounter {
    constructor() {
      this.cards = Utils.qsa(Config.selectors.statCards);
    }

    animateAll() {
      this.cards.forEach((card, index) => {
        const valueEl = Utils.qs(Config.selectors.statValue, card);
        if (!valueEl) return;
        const target = parseInt(valueEl.textContent.replace(/[^\d]/g, ''), 10) || 0;
        valueEl.textContent = '0';
        setTimeout(() => {
          Utils.animateValue({
            from: 0,
            to: target,
            duration: 1000,
            onUpdate: (val) => { valueEl.textContent = val; },
          });
        }, index * 90);
      });
    }

    /** Recalculate a single card's value (used after create/delete). */
    setValue(modifierClass, value, animate = true) {
      const card = document.querySelector(`.stat-card__icon-wrap--${modifierClass}`);
      if (!card) return;
      const wrapper = card.closest(Config.selectors.statCards);
      const valueEl = wrapper && Utils.qs(Config.selectors.statValue, wrapper);
      if (!valueEl) return;
      const current = parseInt(valueEl.textContent.replace(/[^\d]/g, ''), 10) || 0;
      if (!animate) {
        valueEl.textContent = value;
        return;
      }
      Utils.animateValue({
        from: current,
        to: value,
        duration: 500,
        onUpdate: (val) => { valueEl.textContent = val; },
      });
    }

    adjust(modifierClass, delta) {
      const card = document.querySelector(`.stat-card__icon-wrap--${modifierClass}`);
      if (!card) return;
      const wrapper = card.closest(Config.selectors.statCards);
      const valueEl = wrapper && Utils.qs(Config.selectors.statValue, wrapper);
      if (!valueEl) return;
      const current = parseInt(valueEl.textContent.replace(/[^\d]/g, ''), 10) || 0;
      this.setValue(modifierClass, Math.max(0, current + delta));
    }
  }

  /* ========================================================================
     8. PROGRESS BAR ANIMATOR
     ======================================================================== */

  class ProgressAnimator {
    animateAll(scope = document) {
      Utils.qsa(Config.selectors.progressBar, scope).forEach((bar) => this.animate(bar));
    }

    animate(bar) {
      const fill = Utils.qs(Config.selectors.progressFill, bar);
      if (!fill) return;
      const target = parseInt(bar.getAttribute('aria-valuenow'), 10) || 0;
      fill.style.width = '0%';
      // Force reflow then animate to target so the CSS transition fires.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.width = `${target}%`;
        });
      });
    }

    setProgress(row, value) {
      const bar = Utils.qs(Config.selectors.progressBar, row);
      const label = Utils.qs(Config.selectors.progressLabel, row);
      if (!bar) return;
      const clamped = Math.max(0, Math.min(100, value));
      bar.setAttribute('aria-valuenow', String(clamped));
      const fill = Utils.qs(Config.selectors.progressFill, bar);
      if (fill) fill.style.width = `${clamped}%`;
      if (label) label.textContent = `${clamped}%`;
    }
  }

  /* ========================================================================
     9. TABLE CONTROLLER — search, filters, sort, states
     ======================================================================== */

  class TableController {
    constructor({ toast, progressAnimator }) {
      this.toast = toast;
      this.progressAnimator = progressAnimator;

      this.tableSection = Utils.qs('.table-card');
      this.tableResponsive = Utils.qs(Config.selectors.tableResponsive);
      this.tableSkeleton = Utils.qs(Config.selectors.tableSkeleton);
      this.tableBody = Utils.qs(Config.selectors.tableBody);
      this.emptyState = Utils.qs(Config.selectors.emptyState);
      this.noResultsState = Utils.qs(Config.selectors.noResultsState);
      this.footerSummary = Utils.qs(Config.selectors.tableFooterSummary);

      this.searchInput = Utils.qs(Config.selectors.projectSearchInput);
      this.globalSearchInput = Utils.qs(Config.selectors.globalSearchInput);
      this.typeFilter = Utils.qs(Config.selectors.filterType);
      this.statusFilter = Utils.qs(Config.selectors.filterStatus);
      this.clearFiltersBtn = Utils.qs(Config.selectors.clearFiltersBtn);
      this.moreFiltersBtn = Utils.qs(Config.selectors.moreFiltersBtn);

      this.sortState = { key: null, direction: 'asc' };

      this._tagRowsWithMetadata();
      this._bindEvents();
    }

    /** Derive filterable metadata (data-* attrs) from each row's rendered content. */
    _tagRowsWithMetadata() {
      this.getRows().forEach((row) => this._tagRow(row));
    }

    _tagRow(row) {
      if (!row.dataset.projectId) {
        row.dataset.projectId = Utils.uid('prj');
      }

      const title = Utils.qs('.table-cell-primary__title', row);
      const cells = Utils.qsa('.data-table__td', row);
      const badge = Utils.qs(Config.selectors.statusBadge, row);
      const owner = Utils.qs('.table-owner span', row);

      row.dataset.name = title ? title.textContent.trim().toLowerCase() : '';
      row.dataset.client = cells[1] ? cells[1].textContent.trim().toLowerCase() : '';
      row.dataset.typeLabel = cells[2] ? cells[2].textContent.trim() : '';
      row.dataset.owner = owner ? owner.textContent.trim().toLowerCase() : '';

      // Resolve type value (web/mobile/api/desktop) from its display label.
      const typeEntry = Object.entries(Config.typeLabels).find(
        ([, label]) => label === row.dataset.typeLabel
      );
      row.dataset.type = typeEntry ? typeEntry[0] : '';

      // Resolve status value from the badge's modifier class.
      if (badge) {
        const statusClass = Array.from(badge.classList).find((c) => c.startsWith('status-badge--'));
        row.dataset.status = statusClass ? statusClass.replace('status-badge--', '') : '';
      }
    }

    getRows() {
      return this.tableBody ? Utils.qsa(Config.selectors.tableRow, this.tableBody) : [];
    }

    _bindEvents() {
      // Search (debounced for performance).
      if (this.searchInput) {
        this.searchInput.addEventListener(
          'input',
          Utils.debounce(() => this.applyFilters(), Config.debounceDelay)
        );
      }

      // Header global search — informs the user rather than silently no-op'ing.
      if (this.globalSearchInput) {
        this.globalSearchInput.addEventListener(
          'input',
          Utils.debounce((e) => {
            const term = e.target.value.trim();
            if (term.length > 1 && this.searchInput) {
              this.searchInput.value = term;
              this.applyFilters();
            }
          }, Config.debounceDelay)
        );
      }

      // Type / Status filters.
      if (this.typeFilter) this.typeFilter.addEventListener('change', () => this.applyFilters());
      if (this.statusFilter) this.statusFilter.addEventListener('change', () => this.applyFilters());

      // Clear filters.
      if (this.clearFiltersBtn) {
        this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
      }

      // "More Filters" — placeholder affordance, communicated via toast.
      if (this.moreFiltersBtn) {
        this.moreFiltersBtn.addEventListener('click', () => {
          this.toast.info('Advanced filters are coming soon.');
        });
      }

      // Sortable column headers (event delegation on the table itself).
      const table = Utils.qs(Config.selectors.table);
      if (table) {
        table.addEventListener('click', (e) => {
          const btn = e.target.closest(Config.selectors.sortBtn);
          if (btn) this._handleSort(btn);
        });
      }

      // Keyboard: Enter/Space already trigger <button> natively; nothing extra needed.
    }

    _handleSort(btn) {
      const th = btn.closest('th');
      const table = Utils.qs(Config.selectors.table);
      const allTh = Utils.qsa('th', table.querySelector('thead'));
      const columnIndex = allTh.indexOf(th);

      const key = `col-${columnIndex}`;
      if (this.sortState.key === key) {
        this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortState.key = key;
        this.sortState.direction = 'asc';
      }

      // Reset aria-sort on all headers, then set the active one.
      allTh.forEach((h) => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', this.sortState.direction === 'asc' ? 'ascending' : 'descending');

      const rows = this.getRows();
      const direction = this.sortState.direction === 'asc' ? 1 : -1;

      rows.sort((a, b) => {
        const cellA = Utils.qsa('.data-table__td', a)[columnIndex];
        const cellB = Utils.qsa('.data-table__td', b)[columnIndex];
        const textA = (cellA ? cellA.textContent.trim() : '').toLowerCase();
        const textB = (cellB ? cellB.textContent.trim() : '').toLowerCase();

        const numA = parseFloat(textA);
        const numB = parseFloat(textB);
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          return (numA - numB) * direction;
        }
        return textA.localeCompare(textB) * direction;
      });

      rows.forEach((row) => this.tableBody.appendChild(row));
      this._flashRows(rows);
    }

    /** Brief highlight animation to signal the table has re-ordered/filtered. */
    _flashRows(rows) {
      rows.forEach((row, i) => {
        row.style.transition = 'none';
        row.style.opacity = '0.4';
        setTimeout(() => {
          row.style.transition = 'opacity var(--transition-base)';
          row.style.opacity = '1';
        }, i * 18);
      });
    }

    applyFilters() {
      const searchTerm = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
      const typeValue = this.typeFilter ? this.typeFilter.value : '';
      const statusValue = this.statusFilter ? this.statusFilter.value : '';

      const rows = this.getRows();
      let visibleCount = 0;

      rows.forEach((row) => {
        const matchesSearch =
          !searchTerm ||
          row.dataset.name.includes(searchTerm) ||
          row.dataset.client.includes(searchTerm) ||
          row.dataset.owner.includes(searchTerm);

        const matchesType = !typeValue || row.dataset.type === typeValue;
        const matchesStatus = !statusValue || row.dataset.status === statusValue;

        const isVisible = matchesSearch && matchesType && matchesStatus;
        row.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      this._updateFooterSummary(visibleCount, rows.length);
      this._syncStates(visibleCount, rows.length);
    }

    clearFilters() {
      if (this.searchInput) this.searchInput.value = '';
      if (this.globalSearchInput) this.globalSearchInput.value = '';
      if (this.typeFilter) this.typeFilter.value = '';
      if (this.statusFilter) this.statusFilter.value = '';
      this.applyFilters();
    }

    _updateFooterSummary(visible, total) {
      if (!this.footerSummary) return;
      if (total === 0) {
        this.footerSummary.innerHTML = 'No projects to show';
        return;
      }
      this.footerSummary.innerHTML = `Showing <strong>${visible === 0 ? 0 : 1}–${visible}</strong> of <strong>${total}</strong> projects`;
    }

    /** Toggle between loaded table, empty state, and no-results state. */
    _syncStates(visibleCount, totalCount) {
      const hasNoProjectsAtAll = totalCount === 0;
      const hasNoMatches = totalCount > 0 && visibleCount === 0;

      if (this.emptyState) this.emptyState.hidden = !hasNoProjectsAtAll;
      if (this.noResultsState) this.noResultsState.hidden = !hasNoMatches;
      if (this.tableResponsive) {
        this.tableResponsive.hidden = hasNoProjectsAtAll || hasNoMatches;
      }
    }

    /** Simulate a brief loading state (e.g. on initial page load). */
    showLoading() {
      if (this.tableSkeleton) this.tableSkeleton.hidden = false;
      if (this.tableResponsive) this.tableResponsive.hidden = true;
      if (this.emptyState) this.emptyState.hidden = true;
      if (this.noResultsState) this.noResultsState.hidden = true;
    }

    hideLoading() {
      if (this.tableSkeleton) this.tableSkeleton.hidden = true;
      const rows = this.getRows();
      this._syncStates(rows.filter((r) => !r.hidden).length, rows.length);
    }

    addRow(row) {
      this._tagRow(row);
      row.style.opacity = '0';
      row.style.transform = 'translateY(-6px)';
      row.style.transition = 'opacity var(--transition-base), transform var(--transition-base)';
      this.tableBody.insertBefore(row, this.tableBody.firstChild);
      requestAnimationFrame(() => {
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
      });
      this.progressAnimator.animateAll(row);
      this.applyFilters();
    }

    removeRow(row) {
      row.style.transition = 'opacity var(--transition-base), transform var(--transition-base)';
      row.style.opacity = '0';
      row.style.transform = 'translateX(12px)';
      setTimeout(() => {
        row.remove();
        this.applyFilters();
      }, 220);
    }
  }

  /* ========================================================================
     10. PROJECT ACTIONS — view / edit / create / delete flows
     ======================================================================== */

  class ProjectActions {
    constructor({ toast, modalManager, tableController, statsCounter, progressAnimator }) {
      this.toast = toast;
      this.modalManager = modalManager;
      this.tableController = tableController;
      this.statsCounter = statsCounter;
      this.progressAnimator = progressAnimator;

      this.pendingDeleteRow = null;

      this._bindTableActionDelegation();
      this._bindDeleteConfirmation();
      this._bindCreateForm();
    }

    /* ---- Row-level actions: view / edit / delete (event delegation) ---- */
    _bindTableActionDelegation() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest(Config.selectors.rowActionBtn);
        if (!btn) return;

        const row = btn.closest(Config.selectors.tableRow);
        if (!row) return;

        const action = btn.getAttribute('data-action');
        if (action === 'view') this._openViewModal(row);
        if (action === 'edit') this._openEditModal(row);
        if (action === 'delete') this.pendingDeleteRow = row; // Confirmation handled by static modal.
      });
    }

    _rowData(row) {
      const cells = Utils.qsa('.data-table__td', row);
      return {
        id: row.dataset.projectId,
        name: Utils.qs('.table-cell-primary__title', row)?.textContent.trim() || '',
        code: Utils.qs('.table-cell-primary__subtitle', row)?.textContent.trim() || '',
        client: cells[1]?.textContent.trim() || '',
        typeLabel: cells[2]?.textContent.trim() || '',
        typeValue: row.dataset.type,
        owner: Utils.qs('.table-owner span', row)?.textContent.trim() || '',
        statusValue: row.dataset.status,
        statusLabel: Utils.qs(Config.selectors.statusBadge, row)?.textContent.trim() || '',
        progress: parseInt(Utils.qs(Config.selectors.progressBar, row)?.getAttribute('aria-valuenow'), 10) || 0,
        created: cells[6]?.textContent.trim() || '',
        updated: cells[7]?.textContent.trim() || '',
      };
    }

    /* ---- View Project: dynamically built read-only modal ---- */
    _openViewModal(row) {
      const data = this._rowData(row);
      const modal = this._buildModalShell({
        id: `view-modal-${data.id}`,
        title: data.name,
        size: 'sm',
      });

      const body = Utils.qs('.modal__body', modal);
      body.innerHTML = '';

      const fields = [
        ['Reference', data.code],
        ['Client', data.client],
        ['Project Type', data.typeLabel],
        ['Owner', data.owner],
        ['Progress', `${data.progress}%`],
        ['Created', data.created],
        ['Last Updated', data.updated],
      ];

      fields.forEach(([label, value]) => {
        const row2 = document.createElement('p');
        row2.className = 'modal__text';
        row2.style.cssText = 'display:flex; justify-content:space-between; gap:12px; margin:0 0 8px;';
        row2.innerHTML = `<strong style="color:var(--color-text-secondary); font-weight:500;">${label}</strong><span>${value}</span>`;
        body.appendChild(row2);
      });

      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge status-badge--${data.statusValue}`;
      statusBadge.textContent = data.statusLabel;
      const statusRow = document.createElement('p');
      statusRow.className = 'modal__text';
      statusRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:12px; margin:0;';
      statusRow.innerHTML = '<strong style="color:var(--color-text-secondary); font-weight:500;">Status</strong>';
      statusRow.appendChild(statusBadge);
      body.appendChild(statusRow);

      const footer = Utils.qs('.modal__footer', modal);
      footer.innerHTML = '';
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn btn--secondary';
      closeBtn.setAttribute('data-modal-close', '');
      closeBtn.textContent = 'Close';
      footer.appendChild(closeBtn);

      document.body.appendChild(modal);
      this.modalManager.open(modal);
    }

    /* ---- Edit Project: dynamically built form modal, prefilled ---- */
    _openEditModal(row) {
      const data = this._rowData(row);
      const modal = this._buildModalShell({
        id: `edit-modal-${data.id}`,
        title: `Edit Project — ${data.name}`,
        size: 'lg',
      });

      const body = Utils.qs('.modal__body', modal);
      body.innerHTML = '';

      const form = document.createElement('form');
      form.className = 'form';
      form.id = `edit-form-${data.id}`;

      const typeOptions = Object.entries(Config.typeLabels)
        .map(([val, label]) => `<option value="${val}" ${val === data.typeValue ? 'selected' : ''}>${label}</option>`)
        .join('');
      const statusOptions = Object.entries(Config.statusLabels)
        .map(([val, label]) => `<option value="${val}" ${val === data.statusValue ? 'selected' : ''}>${label}</option>`)
        .join('');

      form.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="edit-name-${data.id}">Project Name</label>
            <input type="text" id="edit-name-${data.id}" class="input" value="${data.name}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-client-${data.id}">Client</label>
            <input type="text" id="edit-client-${data.id}" class="input" value="${data.client}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="edit-type-${data.id}">Project Type</label>
            <select id="edit-type-${data.id}" class="select" required>${typeOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-owner-${data.id}">Owner</label>
            <input type="text" id="edit-owner-${data.id}" class="input" value="${data.owner}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="edit-status-${data.id}">Status</label>
            <select id="edit-status-${data.id}" class="select" required>${statusOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-progress-${data.id}">Progress (%)</label>
            <input type="number" id="edit-progress-${data.id}" class="input" min="0" max="100" value="${data.progress}" required>
          </div>
        </div>
      `;

      body.appendChild(form);

      const footer = Utils.qs('.modal__footer', modal);
      footer.innerHTML = '';

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn btn--secondary';
      cancelBtn.setAttribute('data-modal-close', '');
      cancelBtn.textContent = 'Cancel';

      const saveBtn = document.createElement('button');
      saveBtn.type = 'submit';
      saveBtn.setAttribute('form', form.id);
      saveBtn.className = 'btn btn--primary';
      saveBtn.innerHTML = '<span>Save Changes</span>';

      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._applyEdit(row, data, form);
        this.modalManager.close(modal);
      });

      document.body.appendChild(modal);
      this.modalManager.open(modal);
    }

    _applyEdit(row, originalData, form) {
      const id = originalData.id;
      const name = Utils.qs(`#edit-name-${id}`, form).value.trim();
      const client = Utils.qs(`#edit-client-${id}`, form).value.trim();
      const typeValue = Utils.qs(`#edit-type-${id}`, form).value;
      const owner = Utils.qs(`#edit-owner-${id}`, form).value.trim();
      const statusValue = Utils.qs(`#edit-status-${id}`, form).value;
      const progress = Math.max(0, Math.min(100, parseInt(Utils.qs(`#edit-progress-${id}`, form).value, 10) || 0));

      const cells = Utils.qsa('.data-table__td', row);

      Utils.qs('.table-cell-primary__title', row).textContent = name;
      cells[1].textContent = client;
      cells[2].textContent = Config.typeLabels[typeValue] || typeValue;

      const ownerNameEl = Utils.qs('.table-owner span', row);
      if (ownerNameEl) ownerNameEl.textContent = owner;

      const badge = Utils.qs(Config.selectors.statusBadge, row);
      if (badge) {
        badge.className = `status-badge status-badge--${statusValue}`;
        badge.textContent = Config.statusLabels[statusValue] || statusValue;
      }

      this.progressAnimator.setProgress(row, progress);
      cells[7].textContent = Utils.formatDate(new Date());

      // Re-tag metadata & recompute filters/stats since status/type may have changed.
      const previousStatus = row.dataset.status;
      this.tableController._tagRow(row);
      this.tableController.applyFilters();

      if (previousStatus !== statusValue) {
        this.statsCounter.adjust(previousStatus === 'active' ? 'active' : previousStatus, 0); // no-op guard
        this._reconcileStatusStats(previousStatus, statusValue);
      }

      this.toast.success(`"${name}" was updated successfully.`);
    }

    _reconcileStatusStats(previousStatus, newStatus) {
      const map = { active: 'active', completed: 'completed', archived: 'archived' };
      if (map[previousStatus]) this.statsCounter.adjust(map[previousStatus], -1);
      if (map[newStatus]) this.statsCounter.adjust(map[newStatus], 1);
    }

    /* ---- Shared modal shell builder (reuses only existing modal classes) ---- */
    _buildModalShell({ id, title, size = 'sm' }) {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = id;
      modal.dataset.dynamic = 'true';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.hidden = true;

      const sizeClass = size === 'lg' ? 'modal__dialog--lg' : 'modal__dialog--sm';

      modal.innerHTML = `
        <div class="modal__overlay" data-modal-close></div>
        <div class="modal__dialog ${sizeClass}" tabindex="-1">
          <div class="modal__header">
            <h2 class="modal__title">${title}</h2>
            <button type="button" class="modal__close-btn" data-modal-close aria-label="Close dialog">
              <span class="icon icon-x" aria-hidden="true"></span>
            </button>
          </div>
          <div class="modal__body"></div>
          <div class="modal__footer"></div>
        </div>
      `;

      return modal;
    }

    /* ---- Delete confirmation (uses the existing static delete modal) ---- */
    _bindDeleteConfirmation() {
      const deleteModal = Utils.qs(Config.selectors.deleteModal);
      if (!deleteModal) return;

      const confirmBtn = Utils.qs('.btn--danger', deleteModal);
      if (!confirmBtn) return;

      confirmBtn.addEventListener('click', () => {
        if (!this.pendingDeleteRow) return;
        const data = this._rowData(this.pendingDeleteRow);
        const statusValue = this.pendingDeleteRow.dataset.status;

        this.tableController.removeRow(this.pendingDeleteRow);

        this.statsCounter.adjust('total', -1);
        if (['active', 'completed', 'archived'].includes(statusValue)) {
          this.statsCounter.adjust(statusValue, -1);
        }

        this.modalManager.close(deleteModal);
        this.toast.danger(`"${data.name}" was deleted.`);
        this.pendingDeleteRow = null;
      });

      // Reset pending row if the modal is dismissed without confirming.
      deleteModal.addEventListener('modal:close', () => {
        this.pendingDeleteRow = null;
      });
    }

    /* ---- Create Project ---- */
    _bindCreateForm() {
      const form = Utils.qs(Config.selectors.createForm);
      const createModal = Utils.qs(Config.selectors.createModal);
      if (!form || !createModal) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.reportValidity()) return;

        const name = Utils.qs('#new-project-name', form).value.trim();
        const client = Utils.qs('#new-project-client', form).value.trim();
        const typeValue = Utils.qs('#new-project-type', form).value;
        const ownerSelect = Utils.qs('#new-project-owner', form);
        const owner = ownerSelect.options[ownerSelect.selectedIndex].text;
        const statusValue = Utils.qs('#new-project-status', form).value;

        const row = this._buildProjectRow({ name, client, typeValue, owner, statusValue });
        this.tableController.addRow(row);

        this.statsCounter.adjust('total', 1);
        if (['active', 'completed', 'archived'].includes(statusValue)) {
          this.statsCounter.adjust(statusValue, 1);
        }

        this.modalManager.close(createModal);
        form.reset();
        this.toast.success(`"${name}" was created successfully.`);
      });
    }

    _buildProjectRow({ name, client, typeValue, owner, statusValue }) {
      const row = document.createElement('tr');
      row.className = 'data-table__row';

      const today = Utils.formatDate(new Date());
      const code = Utils.nextProjectCode();
      const progress = statusValue === 'completed' || statusValue === 'archived' ? 100 : 0;
      const typeLabel = Config.typeLabels[typeValue] || typeValue;
      const statusLabel = Config.statusLabels[statusValue] || statusValue;

      row.innerHTML = `
        <td class="data-table__td" data-label="Project Name">
          <div class="table-cell-primary">
            <span class="table-cell-primary__title">${name}</span>
            <span class="table-cell-primary__subtitle">${code}</span>
          </div>
        </td>
        <td class="data-table__td" data-label="Client">${client}</td>
        <td class="data-table__td" data-label="Project Type">${typeLabel}</td>
        <td class="data-table__td" data-label="Owner">
          <div class="table-owner">
            <img src="/assets/images/avatar-placeholder.png" alt="" class="avatar avatar--xs">
            <span>${owner}</span>
          </div>
        </td>
        <td class="data-table__td" data-label="Status">
          <span class="status-badge status-badge--${statusValue}">${statusLabel}</span>
        </td>
        <td class="data-table__td" data-label="Progress">
          <div class="progress-bar" role="progressbar" aria-label="Project completion progress" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar__fill" style="width:0%"></div>
          </div>
          <span class="progress-bar__label">${progress}%</span>
        </td>
        <td class="data-table__td" data-label="Created Date">${today}</td>
        <td class="data-table__td" data-label="Last Updated">${today}</td>
        <td class="data-table__td data-table__td--actions" data-label="Actions">
          <div class="table-actions">
            <button type="button" class="table-actions__btn" data-action="view" aria-label="View project">
              <span class="icon icon-eye" aria-hidden="true"></span>
            </button>
            <button type="button" class="table-actions__btn" data-action="edit" aria-label="Edit project">
              <span class="icon icon-edit" aria-hidden="true"></span>
            </button>
            <button type="button" class="table-actions__btn table-actions__btn--danger" data-action="delete" data-modal-target="delete-confirm-modal" aria-label="Delete project">
              <span class="icon icon-trash" aria-hidden="true"></span>
            </button>
          </div>
        </td>
      `;

      return row;
    }
  }

  /* ========================================================================
     11. APPLICATION BOOTSTRAP
     ======================================================================== */

  const App = {
    init() {
      this.toast = new ToastManager();
      this.modalManager = new ModalManager();
      this.sidebarController = new SidebarController();
      this.dropdownController = new DropdownController(this.toast);
      this.statsCounter = new StatsCounter();
      this.progressAnimator = new ProgressAnimator();

      this.tableController = new TableController({
        toast: this.toast,
        progressAnimator: this.progressAnimator,
      });

      this.projectActions = new ProjectActions({
        toast: this.toast,
        modalManager: this.modalManager,
        tableController: this.tableController,
        statsCounter: this.statsCounter,
        progressAnimator: this.progressAnimator,
      });

      this._simulateInitialLoad();
      this._bindKeyboardShortcuts();
    },

    /** Briefly show the loading skeleton on first paint, then reveal data with animations. */
    _simulateInitialLoad() {
      this.tableController.showLoading();
      setTimeout(() => {
        this.tableController.hideLoading();
        this.tableController.applyFilters();
        this.statsCounter.animateAll();
        this.progressAnimator.animateAll();
      }, Config.loadingSimDuration);
    },

    /** Global keyboard accessibility affordances. */
    _bindKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // "/" focuses the project search box, unless already typing in a field.
        const tag = document.activeElement.tagName;
        const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
        if (e.key === '/' && !isTyping) {
          e.preventDefault();
          const searchInput = Utils.qs(Config.selectors.projectSearchInput);
          if (searchInput) searchInput.focus();
        }
      });
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();
