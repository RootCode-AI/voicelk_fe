import { getHttpErrorMessage } from '../context/ErrorContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('voicelk_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
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

  if (response.status === 204) return {};
  return response.json();
}

export const api = {
  get:    (endpoint, opts = {}) => apiFetch(endpoint, { ...opts, method: 'GET' }),
  post:   (endpoint, body, opts = {}) => apiFetch(endpoint, { ...opts, method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body, opts = {}) => apiFetch(endpoint, { ...opts, method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (endpoint, body, opts = {}) => apiFetch(endpoint, { ...opts, method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (endpoint, opts = {}) => apiFetch(endpoint, { ...opts, method: 'DELETE' }),
};

export class ApiError extends Error {
  constructor(status, userMessage, cause) {
    super(userMessage);
    this.name = 'ApiError';
    this.status = status;
    this.userMessage = userMessage;
    if (cause) this.cause = cause;
  }
}

export function friendlyMessage(err) {
  if (err instanceof ApiError) return err.userMessage;

  // Firebase / Google auth errors
  if (err?.code) {
    const firebaseMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-not-found': 'No account found with this email. Please register first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups and try again.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
      'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
    };
    if (firebaseMessages[err.code]) return firebaseMessages[err.code];
  }

  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (err instanceof Error) {
    // Avoid exposing raw technical messages to users
    const msg = err.message || '';
    if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
      return 'Connection error. Please check your internet and try again.';
    }
    if (msg.toLowerCase().includes('timeout')) {
      return 'The request timed out. Please try again.';
    }
    return msg || 'Something went wrong. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}
