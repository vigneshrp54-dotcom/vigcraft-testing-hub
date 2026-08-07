/* ============================================================
   VigCraft Testing Hub — Test Suites
   frontend/test-suites/test-suites.js
   Vanilla ES6+, no external libraries.
   Works with the existing test-suites.html / test-suites.css.
   ============================================================ */

(() => {
  'use strict';

  /* ============================================================
     0. DOM REFERENCES
     ============================================================ */

  const dom = {
    // Sidebar
    sidebar: document.getElementById('vc-sidebar'),
    sidebarToggle: document.getElementById('vc-sidebar-toggle'),
    mobileMenuToggle: document.getElementById('vc-mobile-menu-toggle'),

    // Header
    globalSearch: document.getElementById('vc-global-search'),
    userMenuToggle: document.getElementById('vc-user-menu-toggle'),
    userMenu: document.getElementById('vc-user-menu'),

    // Page actions
    newSuiteBtn: document.getElementById('vc-new-suite-btn'),

    // Stats
    statEls: document.querySelectorAll('[data-stat]'),

    // Toolbar
    suiteSearch: document.getElementById('vc-suite-search'),
    projectFilter: document.getElementById('vc-project-filter'),
    statusFilter: document.getElementById('vc-status-filter'),
    clearFiltersBtn: document.getElementById('vc-clear-filters-btn'),

    // Table
    skeleton: document.getElementById('vc-table-skeleton'),
    tableResponsive: document.querySelector('.vc-table-responsive'),
    table: document.getElementById('vc-test-suites-table'),
    tbody: document.getElementById('vc-test-suites-tbody'),
    selectAllCheckbox: document.getElementById('vc-select-all-suites'),
    emptyState: document.getElementById('vc-empty-state'),
    noResultsState: document.getElementById('vc-no-results-state'),
    resetSearchBtn: document.getElementById('vc-reset-search-btn'),

    // Pagination
    pagination: document.querySelector('.vc-pagination'),
    paginationSummary: document.querySelector('.vc-pagination__summary'),
    paginationPages: document.querySelector('.vc-pagination__pages'),
    prevPageBtn: document.getElementById('vc-prev-page-btn'),
    nextPageBtn: document.getElementById('vc-next-page-btn'),

    // Create/Edit modal
    createModal: document.getElementById('vc-create-suite-modal'),
    createForm: document.getElementById('vc-create-suite-form'),
    createTitle: document.getElementById('vc-create-suite-title'),
    createSubmitBtn: document.getElementById('vc-create-suite-submit-btn'),
    nameInput: document.getElementById('vc-suite-name'),
    projectSelect: document.getElementById('vc-suite-project'),
    ownerSelect: document.getElementById('vc-suite-owner'),
    statusSelect: document.getElementById('vc-suite-status'),
    descriptionInput: document.getElementById('vc-suite-description'),
    tagsInput: document.getElementById('vc-suite-tags'),

    // Delete modal
    deleteModal: document.getElementById('vc-delete-suite-modal'),
    deleteSuiteName: document.getElementById('vc-delete-suite-name'),
    confirmDeleteBtn: document.getElementById('vc-confirm-delete-suite-btn'),
  };

  /* ============================================================
     1. STATIC LOOKUPS
     ============================================================ */

  const PROJECTS = {
    'vigcraft-core': 'VigCraft Core Platform',
    'payments-gateway': 'Payments Gateway',
    'mobile-app': 'Mobile App',
    'admin-console': 'Admin Console',
  };

  const OWNERS = {
    'ananya-rao': 'Ananya Rao',
    'karthik-subramanian': 'Karthik Subramanian',
    'priya-menon': 'Priya Menon',
  };

  const STATUS_LABELS = {
    active: 'Active',
    completed: 'Completed',
    draft: 'Draft',
    archived: 'Archived',
  };

  const PAGE_SIZE = 10;

  const SORTABLE_COLUMNS = {
    1: { key: 'name', label: 'Suite Name' },
    2: { key: 'projectName', label: 'Project' },
    3: { key: 'totalCases', label: 'Total Test Cases' },
    4: { key: 'executed', label: 'Executed' },
    5: { key: 'passRate', label: 'Pass Rate' },
    6: { key: 'ownerName', label: 'Owner' },
    7: { key: 'status', label: 'Status' },
    8: { key: 'lastUpdated', label: 'Last Updated' },
  };

  /* ============================================================
     2. STATE
     ============================================================ */

  const state = {
    suites: [],
    filtered: [],
    searchTerm: '',
    projectFilter: '',
    statusFilter: '',
    sortKey: 'lastUpdated',
    sortDir: 'desc',
    currentPage: 1,
    selectedIds: new Set(),
    editingId: null,
    deletingId: null,
    lastFocusedEl: null,
    isLoading: true,
  };

  /* ============================================================
     3. UTILITIES
     ============================================================ */

  function debounce(fn, wait = 250) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  }

  function generateId() {
    return 'SUITE-' + Math.floor(1000 + Math.random() * 9000) + Date.now().toString().slice(-4);
  }

  function formatDate(isoString) {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  function passRateVariant(rate) {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'danger';
  }

  function computePassRate(suite) {
    if (!suite.executed) return 0;
    return Math.round((suite.passed / suite.executed) * 100);
  }

  function slugifyTags(raw) {
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  /* ============================================================
     4. MOCK DATA (stands in for a backend fetch)
     ============================================================ */

  function buildMockData() {
    const names = [
      'Checkout Regression Suite', 'Login & Auth Flows', 'Payment Gateway Smoke Tests',
      'Mobile Onboarding Suite', 'Admin User Management', 'API Contract Validation',
      'Cart & Wishlist Suite', 'Search & Filters Suite', 'Notification Service Tests',
      'Refund & Chargeback Suite', 'Profile Settings Suite', 'Inventory Sync Suite',
      'Push Notification Suite', 'Role & Permission Tests', 'Order Fulfillment Suite',
      'Subscription Billing Suite', 'Accessibility Audit Suite', 'Localization Suite',
      'Performance Baseline Suite', 'Third-Party Integration Suite', 'Webhook Delivery Suite',
      'Dashboard Analytics Suite', 'Password Reset Suite', 'Multi-Factor Auth Suite',
    ];
    const projectKeys = Object.keys(PROJECTS);
    const ownerKeys = Object.keys(OWNERS);
    const statuses = ['active', 'completed', 'draft', 'archived'];

    return names.map((name, i) => {
      const totalCases = 20 + Math.floor(Math.random() * 180);
      const executedRatio = 0.3 + Math.random() * 0.7;
      const executed = Math.floor(totalCases * executedRatio);
      const passRatio = 0.45 + Math.random() * 0.55;
      const passed = Math.floor(executed * passRatio);
      const daysAgo = Math.floor(Math.random() * 45);
      const lastUpdated = new Date(Date.now() - daysAgo * 86400000).toISOString();

      return {
        id: generateId(),
        name,
        project: projectKeys[i % projectKeys.length],
        totalCases,
        executed,
        passed,
        owner: ownerKeys[i % ownerKeys.length],
        status: statuses[i % statuses.length],
        lastUpdated,
        description: '',
        tags: [],
      };
    });
  }

  /* ============================================================
     5. TOAST NOTIFICATIONS
     ============================================================ */

  const Toast = (() => {
    let container = null;

    function ensureStyles() {
      if (document.getElementById('vc-toast-dynamic-styles')) return;
      const style = document.createElement('style');
      style.id = 'vc-toast-dynamic-styles';
      style.textContent = `
        .vc-toast-container {
          position: fixed;
          top: 84px;
          right: 24px;
          z-index: 200;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 360px;
        }
        .vc-toast {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border-radius: var(--vc-radius-md, 12px);
          background: var(--vc-card, #152635);
          border: 1px solid var(--vc-border, #1F3445);
          box-shadow: var(--vc-shadow-lg, 0 16px 48px rgba(0,0,0,0.45));
          color: var(--vc-text-primary, #F8FAFC);
          font-size: 0.85rem;
          line-height: 1.4;
          animation: vc-toast-in 220ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vc-toast--leaving {
          animation: vc-toast-out 180ms ease forwards;
        }
        .vc-toast__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }
        .vc-toast--success .vc-toast__dot { background: var(--vc-success, #22C55E); }
        .vc-toast--error .vc-toast__dot { background: var(--vc-danger, #EF4444); }
        .vc-toast--info .vc-toast__dot { background: var(--vc-primary, #00E599); }
        .vc-toast__close {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--vc-text-secondary, #94A3B8);
          cursor: pointer;
          font-size: 0.9rem;
          line-height: 1;
          padding: 0 0 0 8px;
        }
        .vc-toast__close:hover { color: var(--vc-text-primary, #F8FAFC); }
        @keyframes vc-toast-in {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes vc-toast-out {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(24px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vc-toast, .vc-toast--leaving { animation-duration: 0.001ms !important; }
        }
      `;
      document.head.appendChild(style);
    }

    function ensureContainer() {
      if (container) return container;
      ensureStyles();
      container = document.createElement('div');
      container.className = 'vc-toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
      return container;
    }

    function show(message, type = 'info', duration = 4000) {
      const el = ensureContainer();
      const toast = document.createElement('div');
      toast.className = `vc-toast vc-toast--${type}`;
      toast.innerHTML = `
        <span class="vc-toast__dot" aria-hidden="true"></span>
        <span class="vc-toast__message">${escapeHtml(message)}</span>
        <button type="button" class="vc-toast__close" aria-label="Dismiss notification">&times;</button>
      `;
      el.appendChild(toast);

      const remove = () => {
        toast.classList.add('vc-toast--leaving');
        setTimeout(() => toast.remove(), 200);
      };

      toast.querySelector('.vc-toast__close').addEventListener('click', remove);
      const timer = setTimeout(remove, duration);
      toast.addEventListener('mouseenter', () => clearTimeout(timer));

      return toast;
    }

    return { show };
  })();

  /* ============================================================
     6. SIDEBAR TOGGLE + MOBILE NAVIGATION
     ============================================================ */

  function initSidebar() {
    if (!dom.sidebar) return;

    // Desktop collapse toggle
    if (dom.sidebarToggle) {
      dom.sidebarToggle.addEventListener('click', () => {
        const collapsed = dom.sidebar.classList.toggle('vc-sidebar--collapsed');
        dom.sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
        dom.sidebarToggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      });
    }

    // Mobile nav toggle
    if (dom.mobileMenuToggle) {
      dom.mobileMenuToggle.addEventListener('click', () => {
        const open = dom.sidebar.classList.toggle('vc-sidebar--open');
        dom.mobileMenuToggle.setAttribute('aria-expanded', String(open));
      });
    }

    // Close mobile nav when a nav link is activated
    dom.sidebar.querySelectorAll('.vc-sidebar__link').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          closeMobileSidebar();
        }
      });
    });

    // Close mobile nav on outside click
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 1024) return;
      if (!dom.sidebar.classList.contains('vc-sidebar--open')) return;
      const clickedInsideSidebar = dom.sidebar.contains(e.target);
      const clickedToggle = dom.mobileMenuToggle && dom.mobileMenuToggle.contains(e.target);
      if (!clickedInsideSidebar && !clickedToggle) {
        closeMobileSidebar();
      }
    });

    // Close mobile nav on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.sidebar.classList.contains('vc-sidebar--open')) {
        closeMobileSidebar();
        dom.mobileMenuToggle && dom.mobileMenuToggle.focus();
      }
    });

    // Reset mobile-only state when resizing back to desktop
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 1024) {
        closeMobileSidebar();
      }
    }, 150));
  }

  function closeMobileSidebar() {
    if (!dom.sidebar) return;
    dom.sidebar.classList.remove('vc-sidebar--open');
    if (dom.mobileMenuToggle) dom.mobileMenuToggle.setAttribute('aria-expanded', 'false');
  }

  /* ============================================================
     7. HEADER: GLOBAL SEARCH + USER MENU
     ============================================================ */

  function initHeader() {
    if (dom.globalSearch) {
      dom.globalSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dom.globalSearch.value = '';
          dom.globalSearch.blur();
        }
        if (e.key === 'Enter' && dom.globalSearch.value.trim()) {
          // Route a global search into the local suite search for convenience.
          if (dom.suiteSearch) {
            dom.suiteSearch.value = dom.globalSearch.value.trim();
            dom.suiteSearch.dispatchEvent(new Event('input'));
            Toast.show(`Filtered test suites for "${dom.globalSearch.value.trim()}"`, 'info');
          }
        }
      });
    }

    if (dom.userMenuToggle && dom.userMenu) {
      dom.userMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = dom.userMenu.hasAttribute('hidden');
        if (isHidden) {
          dom.userMenu.removeAttribute('hidden');
          dom.userMenuToggle.setAttribute('aria-expanded', 'true');
        } else {
          closeUserMenu();
        }
      });

      document.addEventListener('click', (e) => {
        if (!dom.userMenu.hasAttribute('hidden') &&
            !dom.userMenu.contains(e.target) &&
            !dom.userMenuToggle.contains(e.target)) {
          closeUserMenu();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !dom.userMenu.hasAttribute('hidden')) {
          closeUserMenu();
          dom.userMenuToggle.focus();
        }
      });
    }
  }

  function closeUserMenu() {
    if (!dom.userMenu) return;
    dom.userMenu.setAttribute('hidden', '');
    dom.userMenuToggle && dom.userMenuToggle.setAttribute('aria-expanded', 'false');
  }

  /* ============================================================
     8. STATISTICS COUNTER ANIMATION
     ============================================================ */

  function animateCounter(el, target, duration = 900) {
    const start = Number(el.textContent.replace(/[^\d]/g, '')) || 0;
    if (start === target) {
      el.textContent = String(target);
      return;
    }
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(start + (target - start) * eased);
      el.textContent = String(value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function updateStats() {
    const total = state.suites.length;
    const active = state.suites.filter((s) => s.status === 'active').length;
    const completed = state.suites.filter((s) => s.status === 'completed').length;
    const draft = state.suites.filter((s) => s.status === 'draft').length;

    const targets = { 'total-suites': total, 'active-suites': active, 'completed-suites': completed, 'draft-suites': draft };

    dom.statEls.forEach((el) => {
      const key = el.getAttribute('data-stat');
      if (key in targets) animateCounter(el, targets[key]);
    });
  }

  /* ============================================================
     9. FILTER / SEARCH / SORT PIPELINE
     ============================================================ */

  function applyPipeline() {
    const term = state.searchTerm.trim().toLowerCase();

    let result = state.suites.filter((suite) => {
      const matchesTerm = !term || suite.name.toLowerCase().includes(term);
      const matchesProject = !state.projectFilter || suite.project === state.projectFilter;
      const matchesStatus = !state.statusFilter || suite.status === state.statusFilter;
      return matchesTerm && matchesProject && matchesStatus;
    });

    if (state.sortKey) {
      const dir = state.sortDir === 'asc' ? 1 : -1;
      result = result.slice().sort((a, b) => {
        const av = getSortValue(a, state.sortKey);
        const bv = getSortValue(b, state.sortKey);
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }

    state.filtered = result;

    const maxPage = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
    if (state.currentPage > maxPage) state.currentPage = maxPage;
  }

  function getSortValue(suite, key) {
    switch (key) {
      case 'projectName': return PROJECTS[suite.project] || '';
      case 'ownerName': return OWNERS[suite.owner] || '';
      case 'passRate': return computePassRate(suite);
      case 'lastUpdated': return new Date(suite.lastUpdated).getTime();
      case 'name': return suite.name.toLowerCase();
      case 'status': return suite.status;
      default: return suite[key];
    }
  }

  /* ============================================================
     10. SORTABLE TABLE HEADERS
     ============================================================ */

  function initSortableHeaders() {
    if (!dom.table) return;
    const headerCells = dom.table.querySelectorAll('thead th');

    headerCells.forEach((th, index) => {
      const col = SORTABLE_COLUMNS[index];
      if (!col) return;

      th.dataset.sortKey = col.key;
      th.setAttribute('role', 'columnheader');
      th.setAttribute('tabindex', '0');
      th.setAttribute('aria-sort', 'none');

      const label = th.textContent.trim();
      th.innerHTML = '';
      const labelSpan = document.createElement('span');
      labelSpan.textContent = label;
      const arrowSpan = document.createElement('span');
      arrowSpan.className = 'vc-sort-arrow';
      arrowSpan.setAttribute('aria-hidden', 'true');
      th.appendChild(labelSpan);
      th.appendChild(arrowSpan);

      const handleSort = () => {
        if (state.sortKey === col.key) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortKey = col.key;
          state.sortDir = 'asc';
        }
        state.currentPage = 1;
        renderAll();
      };

      th.addEventListener('click', handleSort);
      th.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSort();
        }
      });
    });

    updateSortIndicators();
  }

  function updateSortIndicators() {
    if (!dom.table) return;
    dom.table.querySelectorAll('thead th[data-sort-key]').forEach((th) => {
      const arrow = th.querySelector('.vc-sort-arrow');
      if (th.dataset.sortKey === state.sortKey) {
        th.setAttribute('aria-sort', state.sortDir === 'asc' ? 'ascending' : 'descending');
        if (arrow) arrow.textContent = state.sortDir === 'asc' ? '▲' : '▼';
      } else {
        th.setAttribute('aria-sort', 'none');
        if (arrow) arrow.textContent = '';
      }
    });
  }

  /* ============================================================
     11. TABLE RENDERING
     ============================================================ */

  function renderRow(suite) {
    const projectName = PROJECTS[suite.project] || suite.project;
    const ownerName = OWNERS[suite.owner] || suite.owner;
    const passRate = computePassRate(suite);
    const variant = passRateVariant(passRate);
    const statusLabel = STATUS_LABELS[suite.status] || suite.status;
    const checked = state.selectedIds.has(suite.id) ? 'checked' : '';

    const tr = document.createElement('tr');
    tr.className = 'vc-table__row';
    tr.dataset.suiteId = suite.id;

    tr.innerHTML = `
      <td><input type="checkbox" class="vc-checkbox" data-row-select aria-label="Select ${escapeHtml(suite.name)}" ${checked}></td>
      <td class="vc-table__cell--primary">
        <a class="vc-table__link" href="/frontend/test-suites/suite-detail.html?id=${encodeURIComponent(suite.id)}" data-action="view" data-suite-id="${suite.id}">${escapeHtml(suite.name)}</a>
      </td>
      <td>${escapeHtml(projectName)}</td>
      <td>${suite.totalCases}</td>
      <td>${suite.executed}</td>
      <td>
        <div class="vc-progress" role="progressbar" aria-valuenow="${passRate}" aria-valuemin="0" aria-valuemax="100" aria-label="Pass rate ${passRate} percent">
          <div class="vc-progress__bar vc-progress__bar--${variant}" data-progress-bar style="width:0%"></div>
        </div>
        <span class="vc-progress__label">${passRate}%</span>
      </td>
      <td>
        <div class="vc-user-chip">
          <img class="vc-user-chip__avatar" src="/assets/images/avatar-placeholder.png" alt="">
          <span class="vc-user-chip__name">${escapeHtml(ownerName)}</span>
        </div>
      </td>
      <td><span class="vc-badge vc-badge--status vc-badge--${suite.status}">${escapeHtml(statusLabel)}</span></td>
      <td><time datetime="${suite.lastUpdated}">${formatDate(suite.lastUpdated)}</time></td>
      <td>
        <div class="vc-table__actions">
          <button type="button" class="vc-icon-btn" data-action="view" data-suite-id="${suite.id}" aria-label="View ${escapeHtml(suite.name)}">
            <span class="vc-icon vc-icon-eye" aria-hidden="true"></span>
          </button>
          <button type="button" class="vc-icon-btn" data-action="edit" data-suite-id="${suite.id}" aria-label="Edit ${escapeHtml(suite.name)}">
            <span class="vc-icon vc-icon-pencil" aria-hidden="true"></span>
          </button>
          <button type="button" class="vc-icon-btn" data-action="execute" data-suite-id="${suite.id}" aria-label="Execute ${escapeHtml(suite.name)}">
            <span class="vc-icon vc-icon-play" aria-hidden="true"></span>
          </button>
          <button type="button" class="vc-icon-btn vc-icon-btn--danger" data-action="delete" data-suite-id="${suite.id}" data-modal-target="vc-delete-suite-modal" aria-label="Delete ${escapeHtml(suite.name)}">
            <span class="vc-icon vc-icon-trash" aria-hidden="true"></span>
          </button>
        </div>
      </td>
    `;
    return tr;
  }

  function renderTable() {
    if (!dom.tbody) return;

    const start = (state.currentPage - 1) * PAGE_SIZE;
    const pageItems = state.filtered.slice(start, start + PAGE_SIZE);

    dom.tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();
    pageItems.forEach((suite) => fragment.appendChild(renderRow(suite)));
    dom.tbody.appendChild(fragment);

    // Animate progress bars in on next frame (lets the 0% -> value transition run).
    requestAnimationFrame(() => {
      dom.tbody.querySelectorAll('[data-progress-bar]').forEach((bar) => {
        const wrapper = bar.closest('.vc-progress');
        const target = wrapper ? wrapper.getAttribute('aria-valuenow') : '0';
        bar.style.width = `${target}%`;
      });
    });

    updateSelectAllState();
    renderPagination();
    renderVisibilityStates();
  }

  function renderPagination() {
    if (!dom.pagination) return;

    const totalItems = state.filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const start = totalItems === 0 ? 0 : (state.currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(state.currentPage * PAGE_SIZE, totalItems);

    if (dom.paginationSummary) {
      dom.paginationSummary.innerHTML = `Showing <strong>${start}–${end}</strong> of <strong>${totalItems}</strong> test suites`;
    }

    if (dom.paginationPages) {
      dom.paginationPages.innerHTML = '';
      const maxButtons = 5;
      let pages = [];

      if (totalPages <= maxButtons) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        const half = Math.floor(maxButtons / 2);
        let from = Math.max(1, state.currentPage - half);
        let to = Math.min(totalPages, from + maxButtons - 1);
        from = Math.max(1, to - maxButtons + 1);
        pages = Array.from({ length: to - from + 1 }, (_, i) => from + i);
      }

      pages.forEach((page) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vc-pagination__page' + (page === state.currentPage ? ' vc-pagination__page--active' : '');
        btn.textContent = String(page);
        if (page === state.currentPage) btn.setAttribute('aria-current', 'page');
        btn.setAttribute('aria-label', `Go to page ${page}`);
        btn.addEventListener('click', () => goToPage(page));
        li.appendChild(btn);
        dom.paginationPages.appendChild(li);
      });
    }

    if (dom.prevPageBtn) dom.prevPageBtn.disabled = state.currentPage <= 1;
    if (dom.nextPageBtn) dom.nextPageBtn.disabled = state.currentPage >= totalPages;
  }

  function goToPage(page) {
    const totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
    state.currentPage = Math.min(Math.max(1, page), totalPages);
    renderTable();
  }

  function renderVisibilityStates() {
    const hasAnySuites = state.suites.length > 0;
    const hasFilteredResults = state.filtered.length > 0;
    const filtersActive = Boolean(state.searchTerm || state.projectFilter || state.statusFilter);

    if (state.isLoading) {
      show(dom.skeleton);
      hide(dom.tableResponsive);
      hide(dom.pagination);
      hide(dom.emptyState);
      hide(dom.noResultsState);
      return;
    }

    hide(dom.skeleton);

    if (!hasAnySuites) {
      hide(dom.tableResponsive);
      hide(dom.pagination);
      show(dom.emptyState);
      hide(dom.noResultsState);
      return;
    }

    if (!hasFilteredResults && filtersActive) {
      hide(dom.tableResponsive);
      hide(dom.pagination);
      hide(dom.emptyState);
      show(dom.noResultsState);
      return;
    }

    show(dom.tableResponsive);
    show(dom.pagination);
    hide(dom.emptyState);
    hide(dom.noResultsState);
  }

  function show(el) { if (el) el.removeAttribute('hidden'); }
  function hide(el) { if (el) el.setAttribute('hidden', ''); }

  function renderAll() {
    applyPipeline();
    renderTable();
    updateSortIndicators();
    updateStats();
  }

  /* ============================================================
     12. SELECT-ALL / ROW SELECTION
     ============================================================ */

  function updateSelectAllState() {
    if (!dom.selectAllCheckbox || !dom.tbody) return;
    const rowCheckboxes = Array.from(dom.tbody.querySelectorAll('[data-row-select]'));
    if (rowCheckboxes.length === 0) {
      dom.selectAllCheckbox.checked = false;
      dom.selectAllCheckbox.indeterminate = false;
      return;
    }
    const checkedCount = rowCheckboxes.filter((cb) => cb.checked).length;
    dom.selectAllCheckbox.checked = checkedCount === rowCheckboxes.length;
    dom.selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < rowCheckboxes.length;
  }

  function initSelection() {
    if (dom.selectAllCheckbox) {
      dom.selectAllCheckbox.addEventListener('change', () => {
        const checked = dom.selectAllCheckbox.checked;
        const start = (state.currentPage - 1) * PAGE_SIZE;
        const pageIds = state.filtered.slice(start, start + PAGE_SIZE).map((s) => s.id);

        pageIds.forEach((id) => {
          if (checked) state.selectedIds.add(id);
          else state.selectedIds.delete(id);
        });

        dom.tbody.querySelectorAll('[data-row-select]').forEach((cb) => { cb.checked = checked; });
      });
    }

    if (dom.tbody) {
      dom.tbody.addEventListener('change', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLInputElement) || !target.matches('[data-row-select]')) return;
        const row = target.closest('tr[data-suite-id]');
        if (!row) return;
        const id = row.dataset.suiteId;
        if (target.checked) state.selectedIds.add(id);
        else state.selectedIds.delete(id);
        updateSelectAllState();
      });
    }
  }

  /* ============================================================
     13. TOOLBAR: SEARCH + FILTERS
     ============================================================ */

  function initToolbar() {
    if (dom.suiteSearch) {
      const onSearch = debounce(() => {
        state.searchTerm = dom.suiteSearch.value;
        state.currentPage = 1;
        renderAll();
      }, 200);
      dom.suiteSearch.addEventListener('input', onSearch);
      dom.suiteSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dom.suiteSearch.value = '';
          state.searchTerm = '';
          state.currentPage = 1;
          renderAll();
        }
      });
    }

    if (dom.projectFilter) {
      dom.projectFilter.addEventListener('change', () => {
        state.projectFilter = dom.projectFilter.value;
        state.currentPage = 1;
        renderAll();
      });
    }

    if (dom.statusFilter) {
      dom.statusFilter.addEventListener('change', () => {
        state.statusFilter = dom.statusFilter.value;
        state.currentPage = 1;
        renderAll();
      });
    }

    if (dom.clearFiltersBtn) {
      dom.clearFiltersBtn.addEventListener('click', resetFilters);
    }

    if (dom.resetSearchBtn) {
      dom.resetSearchBtn.addEventListener('click', resetFilters);
    }
  }

  function resetFilters() {
    state.searchTerm = '';
    state.projectFilter = '';
    state.statusFilter = '';
    state.currentPage = 1;
    if (dom.suiteSearch) dom.suiteSearch.value = '';
    if (dom.projectFilter) dom.projectFilter.value = '';
    if (dom.statusFilter) dom.statusFilter.value = '';
    renderAll();
  }

  /* ============================================================
     14. MODAL SYSTEM (generic open/close + focus trap)
     ============================================================ */

  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function openModal(modalEl, triggerEl) {
    if (!modalEl) return;
    state.lastFocusedEl = triggerEl || document.activeElement;
    modalEl.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    const focusable = modalEl.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusable.length) focusable[0].focus();

    modalEl.addEventListener('keydown', trapFocus);
  }

  function closeModal(modalEl) {
    if (!modalEl || modalEl.hasAttribute('hidden')) return;
    modalEl.setAttribute('hidden', '');
    modalEl.removeEventListener('keydown', trapFocus);
    document.body.style.overflow = '';
    if (state.lastFocusedEl && typeof state.lastFocusedEl.focus === 'function') {
      state.lastFocusedEl.focus();
    }
  }

  function trapFocus(e) {
    const modalEl = e.currentTarget;
    if (e.key === 'Escape') {
      closeModal(modalEl);
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null
    );
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

  function initModalSystem() {
    // Generic openers: delegated on document so buttons rendered after this
    // listener is attached (e.g. every delete button in dynamically-rendered
    // table rows) still open their modal correctly.
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal-target]');
      if (!trigger) return;

      const targetId = trigger.getAttribute('data-modal-target');
      const modalEl = document.getElementById(targetId);
      if (!modalEl) return;

      // The "New Test Suite" triggers (page header + empty state) should
      // always open in create mode.
      if (targetId === 'vc-create-suite-modal' && trigger.getAttribute('data-action') !== 'edit') {
        resetCreateForm();
      }

      openModal(modalEl, trigger);
    });

    // Generic closers (delegated for the same reason as above)
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-modal-close]');
      if (!closeBtn) return;
      const modalEl = closeBtn.closest('.vc-modal-overlay');
      closeModal(modalEl);
    });

    // Click on the overlay (outside the modal panel) closes it
    document.querySelectorAll('.vc-modal-overlay').forEach((overlay) => {
      overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) closeModal(overlay);
      });
    });
  }

  /* ============================================================
     15. CREATE / EDIT TEST SUITE MODAL
     ============================================================ */

  function resetCreateForm() {
    state.editingId = null;
    if (dom.createForm) dom.createForm.reset();
    clearFormErrors();
    if (dom.createTitle) dom.createTitle.textContent = 'Create New Test Suite';
    if (dom.createSubmitBtn) dom.createSubmitBtn.textContent = 'Create Test Suite';
  }

  function openEditModal(suite) {
    state.editingId = suite.id;
    clearFormErrors();
    if (dom.nameInput) dom.nameInput.value = suite.name;
    if (dom.projectSelect) dom.projectSelect.value = suite.project;
    if (dom.ownerSelect) dom.ownerSelect.value = suite.owner || '';
    if (dom.statusSelect) dom.statusSelect.value = ['draft', 'active'].includes(suite.status) ? suite.status : 'draft';
    if (dom.descriptionInput) dom.descriptionInput.value = suite.description || '';
    if (dom.tagsInput) dom.tagsInput.value = (suite.tags || []).join(', ');
    if (dom.createTitle) dom.createTitle.textContent = 'Edit Test Suite';
    if (dom.createSubmitBtn) dom.createSubmitBtn.textContent = 'Save Changes';

    openModal(dom.createModal, document.querySelector(`[data-action="edit"][data-suite-id="${suite.id}"]`));
  }

  function clearFormErrors() {
    if (!dom.createForm) return;
    dom.createForm.querySelectorAll('.vc-input, .vc-select, .vc-textarea').forEach((field) => {
      field.classList.remove('vc-field--error');
    });
  }

  function validateCreateForm() {
    let valid = true;
    clearFormErrors();

    if (dom.nameInput && !dom.nameInput.value.trim()) {
      dom.nameInput.classList.add('vc-field--error');
      valid = false;
    }
    if (dom.projectSelect && !dom.projectSelect.value) {
      dom.projectSelect.classList.add('vc-field--error');
      valid = false;
    }
    return valid;
  }

  function initCreateForm() {
    if (!dom.createForm) return;

    dom.createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateCreateForm()) {
        Toast.show('Please fill in the required fields.', 'error');
        return;
      }

      const formValues = {
        name: dom.nameInput.value.trim(),
        project: dom.projectSelect.value,
        owner: dom.ownerSelect ? dom.ownerSelect.value : '',
        status: dom.statusSelect ? dom.statusSelect.value : 'draft',
        description: dom.descriptionInput ? dom.descriptionInput.value.trim() : '',
        tags: dom.tagsInput ? slugifyTags(dom.tagsInput.value) : [],
      };

      if (state.editingId) {
        const suite = state.suites.find((s) => s.id === state.editingId);
        if (suite) {
          Object.assign(suite, formValues, { lastUpdated: new Date().toISOString() });
          Toast.show(`"${formValues.name}" was updated.`, 'success');
        }
      } else {
        const newSuite = {
          id: generateId(),
          totalCases: 0,
          executed: 0,
          passed: 0,
          lastUpdated: new Date().toISOString(),
          ...formValues,
        };
        state.suites.unshift(newSuite);
        Toast.show(`"${formValues.name}" was created.`, 'success');
      }

      closeModal(dom.createModal);
      resetCreateForm();
      renderAll();
    });
  }

  /* ============================================================
     16. DELETE CONFIRMATION MODAL
     ============================================================ */

  function initDeleteModal() {
    if (dom.confirmDeleteBtn) {
      dom.confirmDeleteBtn.addEventListener('click', () => {
        if (!state.deletingId) return;
        const suite = state.suites.find((s) => s.id === state.deletingId);
        state.suites = state.suites.filter((s) => s.id !== state.deletingId);
        state.selectedIds.delete(state.deletingId);
        state.deletingId = null;

        closeModal(dom.deleteModal);
        renderAll();

        if (suite) Toast.show(`"${suite.name}" was deleted.`, 'success');
      });
    }
  }

  /* ============================================================
     17. ROW ACTIONS: VIEW / EDIT / EXECUTE / DELETE
     ============================================================ */

  function initRowActions() {
    if (!dom.tbody) return;

    dom.tbody.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;

      const action = actionEl.getAttribute('data-action');
      const suiteId = actionEl.getAttribute('data-suite-id');
      const suite = state.suites.find((s) => s.id === suiteId);
      if (!suite) return;

      switch (action) {
        case 'view':
          // Anchor tags navigate natively; icon buttons get a toast fallback.
          if (actionEl.tagName === 'BUTTON') {
            Toast.show(`Opening "${suite.name}"...`, 'info', 2000);
            window.location.href = `/frontend/test-suites/suite-detail.html?id=${encodeURIComponent(suite.id)}`;
          }
          break;

        case 'edit':
          e.preventDefault();
          openEditModal(suite);
          break;

        case 'execute':
          e.preventDefault();
          executeSuite(suite, actionEl);
          break;

        case 'delete':
          e.preventDefault();
          state.deletingId = suite.id;
          if (dom.deleteSuiteName) dom.deleteSuiteName.textContent = suite.name;
          break;

        default:
          break;
      }
    });
  }

  function executeSuite(suite, buttonEl) {
    if (buttonEl.dataset.running === 'true') return;
    buttonEl.dataset.running = 'true';
    buttonEl.disabled = true;

    Toast.show(`Running "${suite.name}"...`, 'info', 2500);

    setTimeout(() => {
      suite.executed = suite.totalCases;
      const passRatio = 0.55 + Math.random() * 0.45;
      suite.passed = Math.round(suite.executed * passRatio);
      suite.status = computePassRate(suite) >= 80 ? 'completed' : 'active';
      suite.lastUpdated = new Date().toISOString();

      buttonEl.dataset.running = 'false';
      renderAll();

      const rate = computePassRate(suite);
      Toast.show(`"${suite.name}" finished — ${rate}% pass rate.`, rate >= 80 ? 'success' : 'info');
    }, 1500);
  }

  /* ============================================================
     18. PAGINATION BUTTONS
     ============================================================ */

  function initPaginationControls() {
    if (dom.prevPageBtn) {
      dom.prevPageBtn.addEventListener('click', () => goToPage(state.currentPage - 1));
    }
    if (dom.nextPageBtn) {
      dom.nextPageBtn.addEventListener('click', () => goToPage(state.currentPage + 1));
    }
  }

  /* ============================================================
     19. LOADING SIMULATION
     ============================================================ */

  function loadInitialData() {
    state.isLoading = true;
    renderVisibilityStates();

    setTimeout(() => {
      state.suites = buildMockData();
      state.isLoading = false;
      renderAll();
    }, 700);
  }

  /* ============================================================
     20. INIT
     ============================================================ */

  function init() {
    initSidebar();
    initHeader();
    initToolbar();
    initSelection();
    initModalSystem();
    initCreateForm();
    initDeleteModal();
    initRowActions();
    initPaginationControls();
    initSortableHeaders();
    loadInitialData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
