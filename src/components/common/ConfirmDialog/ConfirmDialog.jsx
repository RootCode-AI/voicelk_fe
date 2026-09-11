import { useEffect } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';

const LIGHT = {
  backdrop: 'rgba(15,23,42,0.45)',
  card: '#ffffff',
  cardBorder: 'rgba(0,0,0,0.06)',
  cardShadow: '0 24px 60px rgba(15,23,42,0.18), 0 4px 16px rgba(0,0,0,0.06)',
  title: '#111827',
  message: '#6b7280',
  cancelBg: '#f1f5f9',
  cancelBgHover: '#e2e8f0',
  cancelText: '#374151',
  dangerBg: '#dc2626',
  dangerBgHover: '#b91c1c',
  dangerIconBg: '#fee2e2',
  dangerIconColor: '#dc2626',
  neutralBg: '#2563eb',
  neutralBgHover: '#1d4ed8',
  neutralIconBg: '#dbeafe',
  neutralIconColor: '#2563eb',
};

const DARK = {
  backdrop: 'rgba(0,0,0,0.6)',
  card: 'rgba(12,22,44,0.97)',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardShadow: '0 24px 70px rgba(0,0,0,0.55)',
  title: '#f1f5f9',
  message: '#94a3b8',
  cancelBg: 'rgba(255,255,255,0.06)',
  cancelBgHover: 'rgba(255,255,255,0.1)',
  cancelText: '#e2e8f0',
  dangerBg: '#ef4444',
  dangerBgHover: '#dc2626',
  dangerIconBg: 'rgba(239,68,68,0.15)',
  dangerIconColor: '#f87171',
  neutralBg: 'linear-gradient(135deg,#0891b2,#00d4ff)',
  neutralBgHover: 'linear-gradient(135deg,#0e7490,#00b8e6)',
  neutralIconBg: 'rgba(0,212,255,0.12)',
  neutralIconColor: '#38bdf8',
};

export default function ConfirmDialog({
  open,
  isDark = false,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
  icon,
}) {
  const t = isDark ? DARK : LIGHT;

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const Icon = icon || (danger ? AlertTriangle : LogOut);
  const iconBg = danger ? t.dangerIconBg : t.neutralIconBg;
  const iconColor = danger ? t.dangerIconColor : t.neutralIconColor;
  const confirmBg = danger ? t.dangerBg : t.neutralBg;
  const confirmBgHover = danger ? t.dangerBgHover : t.neutralBgHover;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title || message}
      onClick={() => { if (!loading) onCancel?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: t.backdrop,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'vlkConfirmFadeIn 0.16s ease',
      }}
    >
      <style>{`
        @keyframes vlkConfirmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vlkConfirmPopIn {
          from { opacity: 0; transform: scale(0.94) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 380,
          background: t.card,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: 20,
          boxShadow: t.cardShadow,
          padding: '28px 24px 22px',
          fontFamily: "'Quicksand', system-ui, sans-serif",
          animation: 'vlkConfirmPopIn 0.18s cubic-bezier(0.22,0.61,0.36,1)',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Icon size={22} color={iconColor} strokeWidth={2} style={{ transform: danger ? 'translateX(0.5px)' : 'translateX(4px)' }} />
        </div>

        {title && (
          <h3 style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 700, color: t.title }}>
            {title}
          </h3>
        )}
        <p style={{ margin: 0, fontSize: 14, color: t.message, lineHeight: 1.55 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            type="button"
            onClick={() => { if (!loading) onCancel?.(); }}
            disabled={loading}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 9999,
              background: t.cancelBg, border: 'none',
              color: t.cancelText, fontSize: 13.5, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = t.cancelBgHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = t.cancelBg; }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => { if (!loading) onConfirm?.(); }}
            disabled={loading}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 9999,
              background: confirmBg, border: 'none',
              color: '#ffffff', fontSize: 13.5, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s, opacity 0.15s',
              opacity: loading ? 0.75 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = confirmBgHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = confirmBg; }}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
