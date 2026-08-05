import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider, useError } from './context/ErrorContext';

// ── Inner app — has access to ErrorContext ─────────────────────
function AppInner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showError } = useError();

  // Catch unhandled JS runtime errors (e.g. undefined is not a function)
  useEffect(() => {
    const handleError = (event) => {
      console.error('[Global] Uncaught error:', event.error || event.message);
      showError(
        'An unexpected error occurred in the application. Please refresh if the problem persists.',
        'error',
        { title: 'Unexpected Error' }
      );
    };

    // Catch unhandled Promise rejections (e.g. failed awaits without try/catch)
    const handleUnhandledRejection = (event) => {
      console.error('[Global] Unhandled promise rejection:', event.reason);
      const msg =
        event.reason?.userMessage ||   // ApiError from our api.js
        event.reason?.message ||
        'A background operation failed. Please try again.';
      showError(msg, 'error', { title: 'Operation Failed' });
      event.preventDefault(); // Suppress default console noise
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [showError]);

  return isAuthenticated
    ? <ErrorBoundary><MainLayout /></ErrorBoundary>
    : <AuthPage onLogin={() => setIsAuthenticated(true)} />;
}

// ── Root ───────────────────────────────────────────────────────
function App() {
  return (
    <ErrorProvider>
      <AppInner />
    </ErrorProvider>
  );
}

export default App;
