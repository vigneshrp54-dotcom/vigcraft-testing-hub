/**
 * =====================================================================
 * VigCraft Testing Hub — login.js
 * Behavior for frontend/pages/login.html, styled by frontend/css/login.css
 *
 * HTML CONTRACT this file expects (see review notes for the full markup):
 *   <body class="auth-page">
 *     <form id="login-form" class="auth-form" novalidate>
 *       <div id="form-alert" class="form-alert" role="alert" aria-live="assertive"></div>
 *
 *       <div class="form-field">
 *         <input id="email" class="form-field__input" type="email" aria-describedby="email-error">
 *         <p id="email-error" class="field-error"></p>
 *       </div>
 *
 *       <div class="form-field">
 *         <div class="form-field__input-group">
 *           <input id="password" class="form-field__input" type="password" aria-describedby="password-error">
 *           <button id="toggle-password" class="form-field__toggle-visibility" type="button" aria-pressed="false">Show</button>
 *         </div>
 *         <p id="password-error" class="field-error"></p>
 *       </div>
 *
 *       <input id="remember-me" class="form-checkbox__input" type="checkbox">
 *       <button id="login-submit" class="btn btn--primary auth-form__submit" type="submit">Sign in</button>
 *     </form>
 *   </body>
 *
 * Notes on the contract, driven by login.css:
 *   - #form-alert / .form-alert visibility is content-driven (CSS hides it
 *     when :empty), so this file only ever needs to set textContent — never
 *     toggle `hidden` — for the alert to show or disappear correctly.
 *   - Field error state is driven entirely by [aria-invalid="true"] on the
 *     input itself (styled in CSS); no separate "is-invalid" class exists
 *     or is needed.
 *   - The password toggle is a text button ("Show" / "Hide"), not an icon
 *     swap — login.css styles it via [aria-pressed="true"], not an icon class.
 *   - login.css defines no spinner element/animation, so the loading state
 *     here is communicated via button text + aria-busy + disabled, with no
 *     spinner markup required.
 * =====================================================================
 */

'use strict';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CONFIG = Object.freeze({
  API_ENDPOINT: '/api/auth/login',
  REMEMBER_ME_KEY: 'vigcraft.rememberedEmail',
  AUTH_TOKEN_KEY: 'vigcraft.authToken',
  REDIRECT_URL: '../dashboard.html',
  REQUEST_TIMEOUT_MS: 15000,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 8,
});

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------

const elements = {
  form: document.getElementById('login-form'),
  formAlert: document.getElementById('form-alert'),
  email: document.getElementById('email'),
  emailError: document.getElementById('email-error'),
  password: document.getElementById('password'),
  passwordError: document.getElementById('password-error'),
  togglePasswordBtn: document.getElementById('toggle-password'),
  rememberMe: document.getElementById('remember-me'),
  submitBtn: document.getElementById('login-submit'),
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Validates the email field.
 * @returns {string} Error message, or empty string if valid.
 */
function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your email address.';
  if (!CONFIG.EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address.';
  return '';
}

/**
 * Validates the password field.
 * @returns {string} Error message, or empty string if valid.
 */
function validatePassword(value) {
  if (!value) return 'Enter your password.';
  if (value.length < CONFIG.MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${CONFIG.MIN_PASSWORD_LENGTH} characters.`;
  }
  return '';
}

/**
 * Renders (or clears) an inline field error. Visibility is fully
 * content-driven by login.css (`.field-error:empty { display: none }`),
 * so no extra class needs to be toggled here.
 */
function setFieldError(inputEl, errorEl, message) {
  errorEl.textContent = message;
  inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
}

/**
 * Runs full form validation.
 * @returns {boolean} True if the form is valid.
 */
function validateForm() {
  const emailError = validateEmail(elements.email.value);
  const passwordError = validatePassword(elements.password.value);

  setFieldError(elements.email, elements.emailError, emailError);
  setFieldError(elements.password, elements.passwordError, passwordError);

  return !emailError && !passwordError;
}

// ---------------------------------------------------------------------------
// Password visibility toggle (text button: "Show" / "Hide")
// ---------------------------------------------------------------------------

function initPasswordToggle() {
  const { togglePasswordBtn, password } = elements;
  if (!togglePasswordBtn || !password) return;

  togglePasswordBtn.addEventListener('click', () => {
    const willShow = password.type === 'password';

    password.type = willShow ? 'text' : 'password';
    togglePasswordBtn.textContent = willShow ? 'Hide' : 'Show';
    togglePasswordBtn.setAttribute('aria-pressed', String(willShow));
    togglePasswordBtn.setAttribute('aria-label', willShow ? 'Hide password' : 'Show password');

    // Keep focus on the input for a smooth keyboard/screen-reader experience.
    password.focus({ preventScroll: true });
  });
}

// ---------------------------------------------------------------------------
// Remember Me
// ---------------------------------------------------------------------------

function initRememberMe() {
  const rememberedEmail = localStorage.getItem(CONFIG.REMEMBER_ME_KEY);
  if (rememberedEmail) {
    elements.email.value = rememberedEmail;
    elements.rememberMe.checked = true;
  }
}

function persistRememberMe(email, remember) {
  if (remember) {
    localStorage.setItem(CONFIG.REMEMBER_ME_KEY, email);
  } else {
    localStorage.removeItem(CONFIG.REMEMBER_ME_KEY);
  }
}

// ---------------------------------------------------------------------------
// UI state helpers
// ---------------------------------------------------------------------------

function setLoadingState(isLoading) {
  const { submitBtn } = elements;
  submitBtn.disabled = isLoading;
  submitBtn.setAttribute('aria-busy', String(isLoading));
  submitBtn.textContent = isLoading ? 'Signing in…' : 'Sign in';
}

/**
 * Sets the form-level alert text. login.css shows/hides #form-alert purely
 * based on whether it has content, so clearing it is just an empty string.
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
 * Posts credentials to the authentication API with a request timeout.
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function requestLogin(payload) {
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
  if (result?.status === 401) {
    return result.data?.message || 'Incorrect email or password.';
  }
  if (result?.status === 403) {
    return result.data?.message || 'Your account does not have access. Contact your administrator.';
  }
  if (result?.status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (result?.status >= 500) {
    return 'Something went wrong on our end. Please try again shortly.';
  }
  return result?.data?.message || 'Unable to sign in. Please try again.';
}

// ---------------------------------------------------------------------------
// Form submission
// ---------------------------------------------------------------------------

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearFormAlert();

  if (!validateForm()) {
    showFormAlert('Please fix the highlighted fields and try again.');
    return;
  }

  const email = elements.email.value.trim();
  const password = elements.password.value;
  const remember = elements.rememberMe.checked;

  setLoadingState(true);

  let result = null;
  let networkError = null;

  try {
    result = await requestLogin({ email, password, rememberMe: remember });
  } catch (error) {
    networkError = error;
  }

  setLoadingState(false);

  if (networkError || !result?.ok) {
    showFormAlert(resolveErrorMessage(networkError, result));
    return;
  }

  persistRememberMe(email, remember);

  const token = result.data?.token;
  if (token) {
    sessionStorage.setItem(CONFIG.AUTH_TOKEN_KEY, token);
  }

  showFormAlert('Signed in successfully. Redirecting…');
  window.setTimeout(() => {
    window.location.href = CONFIG.REDIRECT_URL;
  }, 600);
}

// ---------------------------------------------------------------------------
// Live validation (on blur, to avoid nagging while typing)
// ---------------------------------------------------------------------------

function initLiveValidation() {
  elements.email.addEventListener('blur', () => {
    setFieldError(elements.email, elements.emailError, validateEmail(elements.email.value));
  });

  elements.password.addEventListener('blur', () => {
    setFieldError(
      elements.password,
      elements.passwordError,
      validatePassword(elements.password.value)
    );
  });

  // Clear field-level errors as the user corrects them.
  [elements.email, elements.password].forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        const errorEl = input === elements.email ? elements.emailError : elements.passwordError;
        errorEl.textContent = '';
        input.setAttribute('aria-invalid', 'false');
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function initLoginPage() {
  if (!elements.form) return;

  initRememberMe();
  initPasswordToggle();
  initLiveValidation();

  elements.form.addEventListener('submit', handleLoginSubmit);
}

document.addEventListener('DOMContentLoaded', initLoginPage);
