import { useState, useEffect } from 'react';
import AuthPage from './features/auth/components/AuthPage';
import MainLayout from './components/layout/MainLayout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import CookieConsentBanner from './components/common/CookieConsentBanner/CookieConsentBanner';
import { ErrorProvider, useError } from './context/ErrorContext';
import { CookieConsentProvider, useCookieConsent } from './context/CookieConsentContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { getCookie, setCookie } from './utils/cookies';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import {
  TOKEN_KEY, USER_KEY, SESSION_EXPIRED_EVENT,
  clearSession, expireSession, getToken, isTokenExpired, tokenExpiry,
} from './services/session';

// setTimeout fires immediately for delays above 2^31-1 ms, so long waits are capped
// and simply re-armed when the effect runs again.
const MAX_TIMER_MS = 2 ** 31 - 1;

function loadStoredSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    // A session that ran out while the tab was closed is not restored.
    if (token && storedUser && !isTokenExpired(token)) {
      return { isAuthenticated: true, userData: JSON.parse(storedUser) };
    }
  } catch { /* unreadable session — fall through and clear it */ }
  clearSession();
  return { isAuthenticated: false, userData: null };
}

function AppInner() {
  // Restored synchronously (not in a useEffect) so isAuthenticated is correct
  // on the very first render — MainLayout's child effects run before this
  // component's effects, so an async restore would let a "redirect away from
  // profile if logged out" guard fire while isAuthenticated is still false.
  const [isAuthenticated, setIsAuthenticated] = useState(() => loadStoredSession().isAuthenticated);
  const [showLogin, setShowLogin] = useState(false);
  const [userData, setUserData] = useState(() => loadStoredSession().userData);
  const { showError } = useError();
  const { hasConsent } = useCookieConsent();

  // Single source of truth for theme, shared by MainLayout and the login overlay
  // so both are never out of sync with each other.
  const [isDark, setIsDark] = useState(() => {
    const saved = getCookie('vlk_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (getCookie('vlk_theme')) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e) => setIsDark(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const handleToggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      if (hasConsent) setCookie('vlk_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    const handleError = (event) => {
      console.error('[Global] Uncaught error:', event.error || event.message);
      showError(
        'An unexpected error occurred in the application. Please refresh if the problem persists.',
        'error',
        { title: 'Unexpected Error' }
      );
    };

    const handleUnhandledRejection = (event) => {
      console.error('[Global] Unhandled promise rejection:', event.reason);
      const msg =
        event.reason?.userMessage ||
        event.reason?.message ||
        'A background operation failed. Please try again.';
      showError(msg, 'error', { title: 'Operation Failed' });
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [showError]);

  // Google users who signed in before the avatar was stored in the session have
  // no `avatar` saved locally; backfill it from the persisted Firebase session.
  useEffect(() => {
    return onAuthStateChanged(auth, (fbUser) => {
      const photo = fbUser?.photoURL;
      if (!photo) return;
      setUserData(prev => {
        if (!prev || prev.avatar || prev.email !== fbUser.email) return prev;
        const next = { ...prev, avatar: photo, userName: prev.userName || fbUser.displayName || prev.userName };
        localStorage.setItem(USER_KEY, JSON.stringify(next));
        return next;
      });
    });
  }, []);

  const handleLogin = (data) => {
    setUserData(data);
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const signOutLocally = () => {
    setUserData(null);
    setIsAuthenticated(false);
    // Google sign-ins also leave a Firebase session in the browser; end it too so
    // the next sign-in starts clean.
    signOut(auth).catch(() => {});
  };

  const handleLogout = () => {
    clearSession();
    signOutLocally();
  };

  // A session that ends on its own (expiry, or a token the server refuses) signs
  // the user out of the UI and asks them to sign in again.
  useEffect(() => {
    const onExpired = () => {
      signOutLocally();
      setShowLogin(true);
      showError('Your session has expired. Please sign in again.', 'warning', { title: 'Session expired' });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [showError]);

  // End the session at the moment the token expires, even if the user makes no
  // request; a request made after that would be refused anyway.
  useEffect(() => {
    if (!isAuthenticated) return;
    const expiry = tokenExpiry(getToken() || '');
    if (expiry === null) return;
    const timer = setTimeout(expireSession, Math.min(Math.max(expiry - Date.now(), 0), MAX_TIMER_MS));
    return () => clearTimeout(timer);
  }, [isAuthenticated, userData]);

  // Keep every open tab in step: signing in or out in one tab applies to all.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== TOKEN_KEY && event.key !== null) return;
      const session = loadStoredSession();
      setIsAuthenticated(session.isAuthenticated);
      setUserData(session.userData);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <ConfirmProvider isDark={isDark}>
      <ErrorBoundary>
        <MainLayout
          isAuthenticated={isAuthenticated}
          userData={userData}
          onLoginClick={() => setShowLogin(true)}
          onLogout={handleLogout}
          isDark={isDark}
          onToggleDark={handleToggleDark}
        />
      </ErrorBoundary>
      {showLogin && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          overflowY: 'auto',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(6px)',
          animation: 'authFadeIn 0.25s ease',
        }}>
          <style>{`
            @keyframes authFadeIn {
              from { opacity: 0; } to { opacity: 1; }
            }
          `}</style>
          <AuthPage onLogin={handleLogin} onClose={() => setShowLogin(false)} isDark={isDark} />
        </div>
      )}
      <CookieConsentBanner />
    </ConfirmProvider>
  );
}

function App() {
  return (
    <ErrorProvider>
      <CookieConsentProvider>
        <AppInner />
      </CookieConsentProvider>
    </ErrorProvider>
  );
}

export default App;
