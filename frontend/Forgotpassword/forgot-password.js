/**
 * VigCraft Testing Hub — Forgot Password
 * frontend/js/forgot-password.js
 *
 * Vanilla JS controller for forgot-password.html.
 * Handles validation, submission, loading state, and status messaging.
 * DOM structure/classes are defined in forgot-password.html — do not rename here.
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------
     1. Config
     -------------------------------------------------------------------- */
  const CONFIG = {
    apiEndpoint: '/api/auth/forgot-password',
    requestTimeoutMs: 15000,
  };

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* --------------------------------------------------------------------
     2. State
     -------------------------------------------------------------------- */
  let elements = null;
  let isSubmitting = false;

  /* --------------------------------------------------------------------
     3. Init
     -------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    elements = getElements();
    if (!elements) return;

    elements.form.addEventListener('submit', handleSubmit);
    elements.emailInput.addEventListener('input', handleEmailInput);
    elements.emailInput.addEventListener('blur', validateEmail);
  }

  function getElements() {
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const formStatus = document.getElementById('form-status');
    const submitButton = document.getElementById('submit-button');

    if (!form || !emailInput || !emailError || !formStatus || !submitButton) {
      console.error('[forgot-password] Required DOM elements not found.');
      return null;
    }

    return {
      form,
      emailInput,
      emailError,
      formStatus,
      submitButton,
      submitLabel: submitButton.querySelector('.btn__label'),
      submitSpinner: submitButton.querySelector('.btn__spinner'),
    };
  }

  /* --------------------------------------------------------------------
     4. Validation
     -------------------------------------------------------------------- */
  function validateEmail() {
    const value = elements.emailInput.value.trim();
    let message = '';

    if (!value) {
      message = 'Email address is required.';
    } else if (!EMAIL_PATTERN.test(value)) {
      message = 'Enter a valid email address.';
    }

    const isValid = message === '';
    setFieldError(isValid ? '' : message);

    return isValid;
  }

  function setFieldError(message) {
    elements.emailError.textContent = message;
    elements.emailInput.classList.toggle('is-invalid', Boolean(message));
    elements.emailInput.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function handleEmailInput() {
    // Clear stale error as soon as the user starts correcting it.
    if (elements.emailError.textContent) {
      validateEmail();
    }
  }

  /* --------------------------------------------------------------------
     5. Status messaging
     -------------------------------------------------------------------- */
  function showStatus(message, variant) {
    const { formStatus } = elements;
    formStatus.textContent = message;
    formStatus.classList.remove('auth-alert--success', 'auth-alert--error');

    if (variant === 'success') {
      formStatus.classList.add('auth-alert--success');
    } else if (variant === 'error') {
      formStatus.classList.add('auth-alert--error');
    }

    formStatus.hidden = false;
  }

  function hideStatus() {
    elements.formStatus.hidden = true;
    elements.formStatus.textContent = '';
    elements.formStatus.classList.remove('auth-alert--success', 'auth-alert--error');
  }

  /* --------------------------------------------------------------------
     6. Loading state
     -------------------------------------------------------------------- */
  function setLoading(loading) {
    isSubmitting = loading;
    elements.submitButton.disabled = loading;
    elements.submitButton.setAttribute('aria-disabled', String(loading));
    elements.submitSpinner.hidden = !loading;
    elements.submitLabel.textContent = loading ? 'Sending…' : 'Send Reset Link';
  }

  /* --------------------------------------------------------------------
     7. Submission
     -------------------------------------------------------------------- */
  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    hideStatus();

    if (!validateEmail()) {
      elements.emailInput.focus();
      return;
    }

    const email = elements.emailInput.value.trim();

    setLoading(true);

    try {
      await requestPasswordReset(email);
      showStatus(
        'If an account exists for that email, a reset link is on its way. Check your inbox.',
        'success'
      );
      elements.form.reset();
      setFieldError('');
    } catch (error) {
      showStatus(resolveErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function requestPasswordReset(email) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);

    try {
      const response = await fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = await safeParseJson(response);
        const error = new Error(payload?.message || 'Request failed.');
        error.status = response.status;
        throw error;
      }

      return safeParseJson(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function safeParseJson(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  function resolveErrorMessage(error) {
    if (error && error.name === 'AbortError') {
      return 'The request timed out. Please try again.';
    }
    if (error && error.status >= 500) {
      return 'Something went wrong on our end. Please try again shortly.';
    }
    if (error && error.status === 429) {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    if (error instanceof TypeError) {
      return 'Network error. Check your connection and try again.';
    }
    return (error && error.message) || 'Unable to send reset link. Please try again.';
  }
})();