import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setRequest({
        message,
        title: options.title ?? 'Please confirm',
        confirmLabel: options.confirmLabel ?? 'Yes',
        cancelLabel: options.cancelLabel ?? 'No',
        danger: options.danger ?? false,
      });
    });
  }, []);

  const close = useCallback((result) => {
    setRequest(null);
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {request && (
        <ConfirmDialog
          {...request}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ title, message, confirmLabel, cancelLabel, danger, onConfirm, onCancel }) {
  return (
    <div
      role="presentation"
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 10001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        padding: 20,
        animation: 'confirmBackdropIn 0.2s ease forwards',
      }}
    >
      <style>{`
        @keyframes confirmBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes confirmCardIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 380,
          background: '#0c1830',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18,
          padding: '24px 24px 20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          fontFamily: "'Quicksand', system-ui, sans-serif",
          animation: 'confirmCardIn 0.22s cubic-bezier(0.22,0.61,0.36,1) forwards',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 22 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(56,189,248,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={20} color={danger ? '#f87171' : '#38bdf8'} strokeWidth={2} />
          </div>
          <div>
            <p id="confirm-dialog-title" style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
              {title}
            </p>
            <p id="confirm-dialog-message" style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#94a3b8', lineHeight: 1.55 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 18px', borderRadius: 9999,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1', fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 20px', borderRadius: 9999,
              background: danger ? '#dc2626' : '#1d4ed8', border: 'none',
              color: '#ffffff', fontSize: 13.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = danger ? '#b91c1c' : '#1e40af'}
            onMouseLeave={e => e.currentTarget.style.background = danger ? '#dc2626' : '#1d4ed8'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx.confirm;
}
