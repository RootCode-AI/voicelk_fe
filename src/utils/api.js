import { getHttpErrorMessage } from '../context/ErrorContext';

/**
 * Central API utility for VoiceLK frontend.
 *
 * All backend calls should go through these helpers so that:
 *  - HTTP errors are caught and converted to user-friendly messages.
 *  - Network failures are handled gracefully.
 *  - Auth headers / base URL are applied consistently.
 *
 * Usage example:
 *   import { apiFetch } from '../utils/api';
 *   const data = await apiFetch('/tts/generate', { method: 'POST', body: JSON.stringify(payload) });
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ── Core fetch wrapper ─────────────────────────────────────────
/**
 * @param {string} endpoint  - relative path, e.g. '/auth/login'
 * @param {RequestInit} options  - standard fetch options
 * @returns {Promise<any>}   - parsed JSON response
 * @throws {ApiError}        - enriched error with .status and .userMessage
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach auth token if present
  const token = localStorage.getItem('voicelk_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    // Network failure (no internet, CORS blocked, server down)
    throw new ApiError(
      0,
      'Unable to reach the server. Please check your internet connection.',
      networkError
    );
  }

  if (!response.ok) {
    let serverMessage = '';
    try {
      const body = await response.json();
      serverMessage = body?.detail || body?.message || body?.error || '';
    } catch (_) { /* ignore parse errors */ }

    const userMessage = serverMessage || getHttpErrorMessage(response.status);
    throw new ApiError(response.status, userMessage);
  }

  // Return JSON or empty object for 204 No Content
  if (response.status === 204) return {};
  return response.json();
}

// ── Convenience methods ────────────────────────────────────────
export const api = {
  get:    (endpoint, opts = {}) => apiFetch(endpoint, { ...opts, method: 'GET' }),
  post:   (endpoint, body, opts = {}) => apiFetch(endpoint, { ...opts, method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body, opts = {}) => apiFetch(endpoint, { ...opts, method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (endpoint, body, opts = {}) => apiFetch(endpoint, { ...opts, method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (endpoint, opts = {}) => apiFetch(endpoint, { ...opts, method: 'DELETE' }),
};

// ── Custom error class ─────────────────────────────────────────
export class ApiError extends Error {
  /**
   * @param {number} status       - HTTP status (0 = network error)
   * @param {string} userMessage  - safe, user-facing message
   * @param {Error}  [cause]      - original error if any
   */
  constructor(status, userMessage, cause) {
    super(userMessage);
    this.name = 'ApiError';
    this.status = status;
    this.userMessage = userMessage;
    if (cause) this.cause = cause;
  }
}

// ── Error message helper for use in components ─────────────────
/**
 * Extracts a user-friendly message from any thrown value.
 *
 * Usage inside a catch block:
 *   catch (err) {
 *     showError(friendlyMessage(err));
 *   }
 */
export function friendlyMessage(err) {
  if (err instanceof ApiError) return err.userMessage;
  if (err instanceof Error)    return err.message || 'An unexpected error occurred.';
  return 'An unexpected error occurred.';
}
