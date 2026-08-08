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
  if (err instanceof Error)    return err.message || 'An unexpected error occurred.';
  return 'An unexpected error occurred.';
}
