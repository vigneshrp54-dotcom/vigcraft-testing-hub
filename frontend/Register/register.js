/**
 * =====================================================================
 * VigCraft Testing Hub — register.js
 * Behavior for frontend/pages/register.html, styled by frontend/css/register.css
 *
 * HTML CONTRACT this file expects:
 *   <form id="register-form" class="auth-form" novalidate>
 *     <div id="form-alert" class="form-alert" role="alert" aria-live="assertive"></div>
 *
 *     <input id="fullName" ...>            <p id="fullName-error"></p>
 *     <input id="email" type="email" ...>  <p id="email-error"></p>
 *
 *     <input id="password" type="password" aria-describedby="password-hint password-error">
 *     <button id="toggle-password" type="button" aria-pressed="false">Show</button>
 *     <p id="password-error"></p>
 *
 *     <input id="confirmPassword" type="password" ...>
 *     <button id="toggle-confirm-password" type="button" aria-pressed="false">Show</button>
 *     <p id="confirmPassword-error"></p>
 *
 *     <input id="terms" type="checkbox" ...> <p id="terms-error"></p>
 *
 *     <button id="register-submit" type="submit">Create account</button>
 *   </form>
 *
 * Notes, consistent with login.js:
 *   - #form-alert visibility is content-driven by register.css
 *     (`.form-alert:empty { display: none }`), so this file only ever
 *     needs to set textContent — never toggle `hidden`.
 *   - Field error state is driven entirely by [aria-invalid="true"] on
 *     the input itself (styled in CSS); no separate class is needed.
 *   - Both password toggles are text buttons ("Show" / "Hide"), styled
 *     via [aria-pressed="true"] — not an icon swap.
 *   - register.css defines no spinner element, so the loading state is
 *     communicated via button text + aria-busy + disabled only.
 * =====================================================================
 */

'use strict';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CONFIG = Object.freeze({
  API_ENDPOINT: '/api/auth/register',
  AUTH_TOKEN_KEY: 'vigcraft.authToken',
  REDIRECT_URL: '../dashboard.html',
  REQUEST_TIMEOUT_MS: 15000,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_PATTERN: /^[\p{L}][\p{L}\p{M}'’.\- ]{1,79}$/u,
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_RULES: [
    { test: (v) => v.length >= 8, message: 'at least 8 characters' },
    { test: (v) => /[a-z]/.test(v), message: 'a lowercase letter' },
    { test: (v) => /[A-Z]/.test(v), message: 'an uppercase letter' },
    { test: (v) => /\d/.test(v), message: 'a number' },
  ],
});

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------

const elements = {
  form: document.getElementById('register-form'),
  formAlert: document.getElementById('form-alert'),

  fullName: document.getElementById('fullName'),
  fullNameError: document.getElementById('fullName-error'),

  email: document.getElementById('email'),
  emailError: document.getElementById('email-error'),

  password: document.getElementById('password'),
  passwordError: document.getElementById('password-error'),
  togglePasswordBtn: document.getElementById('toggle-password'),

  confirmPassword: document.getElementById('confirmPassword'),
  confirmPasswordError: document.getElementById('confirmPassword-error'),
  toggleConfirmPasswordBtn: document.getElementById('toggle-confirm-password'),

  terms: document.getElementById('terms'),
  termsError: document.getElementById('terms-error'),

  submitBtn: document.getElementById('register-submit'),
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Validates the full name field.
 * @returns {string} Error message, or empty string if valid.
 */
function validateFullName(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your full name.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (!CONFIG.NAME_PATTERN.test(trimmed)) return 'Enter a valid name.';
  return '';
}

/**
 * Validates the email field.
 * @returns {string} Error message, or empty string if valid.
 */
function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your work email.';
  if (!CONFIG.EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address.';
  return '';
}

/**
 * Validates password strength against CONFIG.PASSWORD_RULES.
 * @returns {string} Error message listing unmet rules, or empty string if valid.
 */
function validatePassword(value) {
  if (!value) return 'Create a password.';

  const unmet = CONFIG.PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.message);
  if (unmet.length > 0) {
    return `Password needs ${formatList(unmet)}.`;
  }
  return '';
}

/**
 * Validates that confirmPassword matches password.
 * @returns {string} Error message, or empty string if valid.
 */
function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Re-enter your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
}

/**
 * Validates the Terms & Conditions checkbox is checked.
 * @returns {string} Error message, or empty string if valid.
 */
function validateTerms(checked) {
  return checked ? '' : 'You must agree to the Terms of Service and Privacy Policy.';
}

/**
 * Joins a list of strings into a natural-language "a, b, and c" phrase.
 */
function formatList(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Renders (or clears) an inline field error. Visibility is fully
 * content-driven by register.css (`.field-error:empty { display: none }`),
 * so no extra class needs to be toggled here.
 */
function setFieldError(inputEl, errorEl, message) {
  errorEl.textContent = message;
  inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
}

/**
 * Runs full form validation across all fields.
 * @returns {boolean} True if the form is valid.
 */
function validateForm() {
  const fullNameError = validateFullName(elements.fullName.value);
  const emailError = validateEmail(elements.email.value);
  const passwordError = validatePassword(elements.password.value);
  const confirmPasswordError = validateConfirmPassword(
    elements.password.value,
    elements.confirmPassword.value
  );
  const termsError = validateTerms(elements.terms.checked);

  setFieldError(elements.fullName, elements.fullNameError, fullNameError);
  setFieldError(elements.email, elements.emailError, emailError);
  setFieldError(elements.password, elements.passwordError, passwordError);
  setFieldError(elements.confirmPassword, elements.confirmPasswordError, confirmPasswordError);
  setTermsError(termsError);

  return !fullNameError && !emailError && !passwordError && !confirmPasswordError && !termsError;
}

/**
 * Terms checkbox doesn't use aria-invalid (checkboxes don't carry the
 * same visual invalid treatment as text inputs in register.css), so its
 * error is set independently of setFieldError.
 */
function setTermsError(message) {
  elements.termsError.textContent = message;
  elements.terms.setAttribute('aria-invalid', message ? 'true' : 'false');
}

// ---------------------------------------------------------------------------
// Password visibility toggles (text buttons: "Show" / "Hide")
// ---------------------------------------------------------------------------

/**
 * Wires a show/hide toggle button to a password input. Reusable for both
 * the password and confirm-password fields.
 */
function initPasswordToggle(toggleBtn, input, showLabel, hideLabel) {
  if (!toggleBtn || !input) return;

  toggleBtn.addEventListener('click', () => {
    const willShow = input.type === 'password';

    input.type = willShow ? 'text' : 'password';
    toggleBtn.textContent = willShow ? 'Hide' : 'Show';
    toggleBtn.setAttribute('aria-pressed', String(willShow));
    toggleBtn.setAttribute('aria-label', willShow ? hideLabel : showLabel);

    input.focus({ preventScroll: true });
  });
}

function initPasswordToggles() {
  initPasswordToggle(
    elements.togglePasswordBtn,
    elements.password,
    'Show password',
    'Hide password'
  );
  initPasswordToggle(
    elements.toggleConfirmPasswordBtn,
    elements.confirmPassword,
    'Show confirm password',
    'Hide confirm password'
  );
}

// ---------------------------------------------------------------------------
// UI state helpers
// ---------------------------------------------------------------------------

function setLoadingState(isLoading) {
  const { submitBtn } = elements;
  submitBtn.disabled = isLoading;
  submitBtn.setAttribute('aria-busy', String(isLoading));
  submitBtn.textContent = isLoading ? 'Creating account…' : 'Create account';
}

/**
 * Sets the form-level alert text. register.css shows/hides #form-alert
 * purely based on whether it has content, so clearing it is just an
 * empty string.
 */
function showFormAlert(message) {
  elements.formAlert.textContent = message;
}

function clearFormAlert() {
  showFormAlert('');
}

// ---------------------------------------------------------------------------
// API integration
// ---------------------------------------------------------------------------

/**
 * Posts registration details to the API with a request timeout.
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function requestRegister(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      // Response had no JSON body; leave data as null.
    }

    return { ok: response.ok, status: response.status, data };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Maps API/network failures to a user-facing message.
 */
function resolveErrorMessage(error, result) {
  if (error?.name === 'AbortError') {
    return 'The request timed out. Check your connection and try again.';
  }
  if (error) {
    return 'Unable to reach the server. Check your connection and try again.';
  }
  if (result?.status === 409) {
    return result.data?.message || 'An account with this email already exists.';
  }
  if (result?.status === 422) {
    return result.data?.message || 'Some details are invalid. Please review the form and try again.';
  }
  if (result?.status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (result?.status >= 500) {
    return 'Something went wrong on our end. Please try again shortly.';
  }
  return result?.data?.message || 'Unable to create your account. Please try again.';
}

// ---------------------------------------------------------------------------
// Form submission
// ---------------------------------------------------------------------------

async function handleRegisterSubmit(event) {
  event.preventDefault();
  clearFormAlert();

  if (!validateForm()) {
    showFormAlert('Please fix the highlighted fields and try again.');
    return;
  }

  const payload = {
    fullName: elements.fullName.value.trim(),
    email: elements.email.value.trim(),
    password: elements.password.value,
  };

  setLoadingState(true);

  let result = null;
  let networkError = null;

  try {
    result = await requestRegister(payload);
  } catch (error) {
    networkError = error;
  }

  setLoadingState(false);

  if (networkError || !result?.ok) {
    showFormAlert(resolveErrorMessage(networkError, result));
    return;
  }

  const token = result.data?.token;
  if (token) {
    sessionStorage.setItem(CONFIG.AUTH_TOKEN_KEY, token);
  }

  showFormAlert('Account created successfully. Redirecting…');
  window.setTimeout(() => {
    window.location.href = CONFIG.REDIRECT_URL;
  }, 600);
}

// ---------------------------------------------------------------------------
// Live validation (on blur, to avoid nagging while typing)
// ---------------------------------------------------------------------------

function initLiveValidation() {
  elements.fullName.addEventListener('blur', () => {
    setFieldError(elements.fullName, elements.fullNameError, validateFullName(elements.fullName.value));
  });

  elements.email.addEventListener('blur', () => {
    setFieldError(elements.email, elements.emailError, validateEmail(elements.email.value));
  });

  elements.password.addEventListener('blur', () => {
    setFieldError(elements.password, elements.passwordError, validatePassword(elements.password.value));
  });

  elements.confirmPassword.addEventListener('blur', () => {
    setFieldError(
      elements.confirmPassword,
      elements.confirmPasswordError,
      validateConfirmPassword(elements.password.value, elements.confirmPassword.value)
    );
  });

  elements.terms.addEventListener('change', () => {
    setTermsError(validateTerms(elements.terms.checked));
  });

  // Clear field-level errors as the user corrects them. The map is built
  // once here rather than reconstructed on every keystroke.
  const textInputs = [elements.fullName, elements.email, elements.password, elements.confirmPassword];
  const errorElementById = {
    [elements.fullName.id]: elements.fullNameError,
    [elements.email.id]: elements.emailError,
    [elements.password.id]: elements.passwordError,
    [elements.confirmPassword.id]: elements.confirmPasswordError,
  };

  textInputs.forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        const errorEl = errorElementById[input.id];
        errorEl.textContent = '';
        input.setAttribute('aria-invalid', 'false');
      }

      // Re-check confirm-password live whenever password changes, since
      // a stale "do not match" error is worse than a slightly eager one.
      if (input === elements.password && elements.confirmPassword.value) {
        setFieldError(
          elements.confirmPassword,
          elements.confirmPasswordError,
          validateConfirmPassword(elements.password.value, elements.confirmPassword.value)
        );
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function initRegisterPage() {
  if (!elements.form) return;

  initPasswordToggles();
  initLiveValidation();

  elements.form.addEventListener('submit', handleRegisterSubmit);
}

document.addEventListener('DOMContentLoaded', initRegisterPage);
