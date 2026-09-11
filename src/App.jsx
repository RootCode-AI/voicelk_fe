import { useState, useEffect } from 'react';
import AuthPage from './features/auth/components/AuthPage';
import MainLayout from './components/layout/MainLayout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import CookieConsentBanner from './components/common/CookieConsentBanner/CookieConsentBanner';
import { ErrorProvider, useError } from './context/ErrorContext';
import { CookieConsentProvider, useCookieConsent } from './context/CookieConsentContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { getCookie, setCookie } from './utils/cookies';

function loadStoredSession() {
  try {
    const token = localStorage.getItem('voicelk_token');
    const storedUser = localStorage.getItem('voicelk_user');
    if (token && storedUser) {
      return { isAuthenticated: true, userData: JSON.parse(storedUser) };
    }
  } catch (_) {
    localStorage.removeItem('voicelk_token');
    localStorage.removeItem('voicelk_user');
  }
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

  const handleLogin = (data) => {
    setUserData(data);
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('voicelk_token');
    localStorage.removeItem('voicelk_user');
    setUserData(null);
    setIsAuthenticated(false);
  };

  return (
    <>
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
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(6px)',
          animation: 'authFadeIn 0.25s ease',
        }}>
          <style>{`
            @keyframes authFadeIn {
              from { opacity: 0; } to { opacity: 1; }
            }
          `}</style>
          <button
            onClick={() => setShowLogin(false)}
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 10000,
              background: 'rgba(255,255,255,0.12)', border: 'none',
              color: '#fff', fontSize: 22, width: 36, height: 36,
              borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            title="Close"
          >
            ✕
          </button>
          <AuthPage onLogin={handleLogin} isDark={isDark} />
        </div>
      )}
      <CookieConsentBanner />
    </>
  );
}

function App() {
  return (
    <ErrorProvider>
      <ConfirmProvider>
        <CookieConsentProvider>
          <AppInner />
        </CookieConsentProvider>
      </ConfirmProvider>
    </ErrorProvider>
  );
}

export default App;
