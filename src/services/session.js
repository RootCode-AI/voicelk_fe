// The signed-in session lives in localStorage: the backend's JWT plus the user
// details shown in the UI. The JWT carries its own expiry, so the client can tell
// when the session is over without asking the server.

export const TOKEN_KEY = 'voicelk_token';
export const USER_KEY = 'voicelk_user';

// Fired on window when the session ends without the user logging out.
export const SESSION_EXPIRED_EVENT = 'voicelk:session-expired';

// Expiry of a JWT in epoch milliseconds, or null when it cannot be read.
export function tokenExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const { exp } = JSON.parse(atob(padded));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

// A token without a readable expiry is left to the server, which answers 401.
export function isTokenExpired(token) {
  const expiry = tokenExpiry(token);
  return expiry !== null && Date.now() >= expiry;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Ends the session and tells the app, which signs the user out of the UI.
export function expireSession() {
  if (!getToken()) return;
  clearSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}
