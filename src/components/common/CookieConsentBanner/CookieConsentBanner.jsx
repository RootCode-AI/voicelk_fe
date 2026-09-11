import { Cookie } from 'lucide-react';
import { useCookieConsent } from '../../../context/CookieConsentContext';

export default function CookieConsentBanner() {
  const { consent, acceptCookies, declineCookies } = useCookieConsent();

  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        zIndex: 10000,
        display: 'flex', justifyContent: 'center',
        padding: '16px',
        animation: 'cookieBannerIn 0.3s cubic-bezier(0.22,0.61,0.36,1) forwards',
      }}
    >
      <style>{`
        @keyframes cookieBannerIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        width: '100%', maxWidth: 640,
        background: '#0c1830',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '20px 22px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column', gap: 14,
        fontFamily: "'Quicksand', system-ui, sans-serif",
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(56,189,248,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cookie size={19} color="#38bdf8" strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
              We use cookies to remember your preferences
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.55 }}>
              VoiceLK would like to store cookies on this device to remember your theme, language,
              playback speed, and auto-play settings across visits. We won't set these unless you agree.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={declineCookies}
            style={{
              padding: '9px 18px', borderRadius: 9999,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1', fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            style={{
              padding: '9px 20px', borderRadius: 9999,
              background: '#1d4ed8', border: 'none',
              color: '#ffffff', fontSize: 13.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e40af'}
            onMouseLeave={e => e.currentTarget.style.background = '#1d4ed8'}
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
