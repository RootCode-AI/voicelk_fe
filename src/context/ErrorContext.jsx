import { createContext, useContext, useState, useCallback, useRef } from 'react';
import voiceLKIcon from '../assets/images/voicelk-icon.png';

const ErrorContext = createContext(null);

export const ERROR_TYPES = {
  error:   { label: 'Error',   color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '✕' },
  warning: { label: 'Warning', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '!' },
  info:    { label: 'Info',    color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: 'i' },
  success: { label: 'Success', color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0', icon: '✓' },
};

export function getHttpErrorMessage(status, defaultMessage) {
  const map = {
    400: 'The request was invalid. Please check your input and try again.',
    401: 'You are not logged in. Please sign in to continue.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    408: 'The request timed out. Please try again.',
    422: 'The data you submitted could not be processed.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again shortly.',
    502: 'The server is temporarily unavailable. Please try again later.',
    503: 'The service is currently down for maintenance. Please try again soon.',
    504: 'The server took too long to respond. Please try again.',
  };
  return map[status] || defaultMessage || 'An unexpected error occurred. Please try again.';
}

let toastIdCounter = 0;

export function ErrorProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 320);
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showError = useCallback((message, type = 'error', options = {}) => {
    const id = ++toastIdCounter;
    const duration = options.duration ?? 5000;

    setToasts(prev => [
      ...prev,
      { id, message, type, title: options.title, exiting: false }
    ]);

    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }

    return id;
  }, [dismiss]);

  const clearAll = useCallback(() => {
    setToasts([]);
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, dismiss, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ErrorContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column-reverse', gap: 10,
      maxWidth: 380, width: '100%', pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const cfg = ERROR_TYPES[toast.type] || ERROR_TYPES.error;

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.color}`,
      borderRadius: 12,
      padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      pointerEvents: 'all',
      animation: toast.exiting
        ? 'toastOut 0.3s ease forwards'
        : 'toastIn 0.35s cubic-bezier(0.22,0.61,0.36,1) forwards',
      fontFamily: "'Quicksand', system-ui, sans-serif",
    }}>
      <img
        src={voiceLKIcon}
        alt="VoiceLK"
        style={{
          width: 26, height: 26,
          objectFit: 'contain',
          flexShrink: 0,
          marginTop: 1,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <p style={{ margin: '0 0 2px 0', fontSize: 13, fontWeight: 700, color: cfg.color }}>
            {toast.title}
          </p>
        )}
        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9ca3af', fontSize: 16, lineHeight: 1, padding: 0,
          flexShrink: 0, marginTop: 1, fontWeight: 700,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#374151'}
        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
        aria-label="Dismiss"
      >
        ×
      </button>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(110%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(110%) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

export function useError() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useError must be used inside <ErrorProvider>');
  return ctx;
}
