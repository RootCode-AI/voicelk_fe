import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider, useError } from './context/ErrorContext';

function AppInner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const { showError } = useError();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('voicelk_token');
    const storedUser = localStorage.getItem('voicelk_user');
    if (token && storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (_) {
        localStorage.removeItem('voicelk_token');
        localStorage.removeItem('voicelk_user');
      }
    }
  }, []);

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
          <AuthPage onLogin={handleLogin} />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorProvider>
      <AppInner />
    </ErrorProvider>
  );
}

export default App;
