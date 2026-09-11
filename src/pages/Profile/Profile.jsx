import { useState, useEffect, useRef } from 'react';
import { api, friendlyMessage } from '../../services/api';
import { Pencil, User, SlidersHorizontal, ChevronDown, LogOut, Loader2 } from 'lucide-react';
import { useError } from '../../context/ErrorContext';
import { useCookieConsent } from '../../context/CookieConsentContext';
import { getCookie, setCookie } from '../../utils/cookies';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProfileView({ isDark, onToggleDark, onLogout, userData, cache, onCacheUpdate }) {
  const [user, setUser] = useState(() => {
    if (cache?.userId === userData?.userId) return cache.data;
    return {
      fullName: userData?.email?.split('@')[0] || '',
      email: userData?.email || '',
      avatar: ''
    };
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const { showError } = useError();
  const { hasConsent } = useCookieConsent();

  useEffect(() => {
    if (userData && userData.userId) {
      if (cache?.userId === userData.userId) {
        setUser(cache.data);
        return;
      }

      api.get(`/api/reg/${userData.userId}`)
        .then(data => {
          if (data) {
            const mapped = {
              fullName: data.userName || data.email?.split('@')[0] || '',
              email: data.email || '',
              avatar: data.profilePicture || ''
            };
            setUser(mapped);
            onCacheUpdate?.({ userId: userData.userId, data: mapped });
          }
        })
        .catch(err => {
          console.error("Failed to fetch user profile", err);
          showError(friendlyMessage(err), 'error');
        });
    } else {
      setUser({
        fullName: '',
        email: '',
        avatar: ''
      });
    }
  }, [userData]);

  useEffect(() => {
    setAvatarError(false);
  }, [user.avatar]);

  const [language, setLanguageState] = useState(getCookie('vlk_language') || 'English');

  const setLanguage = (value) => {
    setLanguageState(value);
    if (hasConsent) {
      setCookie('vlk_language', value);
    }
  };

  const theme = {
    bg: isDark ? '#060f1e' : '#f0f4fa',
    card: isDark ? 'rgba(12,24,48,0.9)' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    subText: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
    inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
    shadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.03)',
    iconColor: isDark ? '#38bdf8' : '#2563eb',
    avatarBg: isDark ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : 'linear-gradient(135deg, #fbbf24, #f97316)',
    avatarText: '#ffffff'
  };

  const avatarInitial = ((user.fullName || user.email)?.[0] || 'U').toUpperCase();

  const handleAvatarButtonClick = () => {
    if (uploadingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please choose an image file.', 'error');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      showError('Image is too large. Please choose one under 5MB.', 'error');
      return;
    }
    if (!userData?.userId) {
      showError('Please log in to update your avatar.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingAvatar(true);
    try {
      const data = await api.upload(`/api/reg/${userData.userId}/avatar`, formData);
      const updated = { ...user, avatar: data.profilePicture || '' };
      setUser(updated);
      onCacheUpdate?.({ userId: userData.userId, data: updated });
    } catch (err) {
      console.error('Failed to upload avatar', err);
      showError(friendlyMessage(err), 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <>
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '48px 24px',
      background: theme.bg,
      color: theme.text,
      fontFamily: "'Quicksand', system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            {user.avatar && !avatarError ? (
              <img
                key={user.avatar}
                src={user.avatar}
                alt="User avatar"
                onError={() => setAvatarError(true)}
                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
              />
            ) : (
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: theme.avatarBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
              }}>
                {(user.fullName || user.email) ? (
                  <span style={{ fontSize: 40, fontWeight: 700, color: theme.avatarText }}>
                    {avatarInitial}
                  </span>
                ) : (
                  <User size={44} color="#ffffff" strokeWidth={1.5} />
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              style={{ display: 'none' }}
            />
            <button
              title="Edit Avatar"
              onClick={handleAvatarButtonClick}
              disabled={uploadingAvatar}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 30, height: 30, borderRadius: '50%',
                background: '#2563eb', border: `3px solid ${theme.bg}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: uploadingAvatar ? 'not-allowed' : 'pointer', padding: 0,
                transition: 'transform 0.15s', opacity: uploadingAvatar ? 0.7 : 1
              }}
              onMouseEnter={(e) => { if (!uploadingAvatar) e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {uploadingAvatar ? (
                <Loader2 size={13} color="#ffffff" strokeWidth={2.5} className="animate-spin" />
              ) : (
                <Pencil size={13} color="#ffffff" strokeWidth={2.5} />
              )}
            </button>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            {user.fullName || 'Your Name'}
          </h2>
          <p style={{ fontSize: 14, color: theme.subText, margin: 0, fontWeight: 400 }}>
            {user.email || 'your.email@example.com'}
          </p>
        </div>

        <div style={{
          background: theme.card, borderRadius: 20, padding: 28,
          boxShadow: theme.shadow, border: `1px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <User size={20} color={theme.iconColor} strokeWidth={2} />
            <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Account Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: theme.subText, marginBottom: 8 }}>
                Full Name
              </label>
              <input
                readOnly
                value={user.fullName}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 9999,
                  background: theme.inputBg, border: 'none', color: theme.text,
                  fontSize: 14, outline: 'none', fontFamily: 'inherit'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: theme.subText, marginBottom: 8 }}>
                Email Address
              </label>
              <input
                readOnly
                value={user.email}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 9999,
                  background: theme.inputBg, border: 'none', color: theme.text,
                  fontSize: 14, outline: 'none', fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', margin: '24px 0' }} />

          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: theme.iconColor, fontSize: 14.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 10, padding: 0,
            transition: 'opacity 0.2s', letterSpacing: '-0.2px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {/* Custom SVG for "Reset Password" (lock inside circular arrow) */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C7.38222 2 3.49842 5.12788 2.33926 9.40058" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 4V10H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="9" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11V9.5C10 8.39543 10.8954 7.5 12 7.5V7.5C13.1046 7.5 14 8.39543 14 9.5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Change Password
          </button>
        </div>

        <div style={{
          background: theme.card, borderRadius: 20, padding: 28,
          boxShadow: theme.shadow, border: `1px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <SlidersHorizontal size={20} color={theme.iconColor} strokeWidth={2} />
            <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Preferences</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, color: theme.text }}>Dark Mode</div>
              <div style={{ fontSize: 12.5, color: theme.subText }}>Switch to a darker visual theme</div>
            </div>
            <button
              onClick={() => { if (onToggleDark) onToggleDark(); }}
              style={{
                width: 48, height: 26, borderRadius: 9999,
                background: isDark ? '#10b981' : '#e5e7eb',
                border: 'none', position: 'relative', cursor: 'pointer',
                transition: 'background 0.3s ease'
              }}
              aria-label="Toggle dark mode"
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#ffffff',
                position: 'absolute', top: 3, left: isDark ? 25 : 3,
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 10, color: theme.text }}>
              Primary Language
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  width: '100%', padding: '12px 18px', borderRadius: 9999,
                  background: theme.inputBg, border: 'none', color: theme.text,
                  fontSize: 14, outline: 'none', appearance: 'none', cursor: 'pointer',
                  fontWeight: 500, fontFamily: 'inherit'
                }}
              >
                <option value="English">English</option>
                <option value="Sinhala">Sinhala</option>
              </select>
              <ChevronDown size={18} color={theme.subText} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 9999,
            background: isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2',
            color: isDark ? '#fca5a5' : '#b91c1c', 
            border: 'none', cursor: 'pointer',
            fontSize: 14.5, fontWeight: 600, transition: 'transform 0.15s, background 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.25)' : '#fecaca';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2';
          }}
          >
            <LogOut size={17} strokeWidth={2.5} />
            Logout from VoiceLK
          </button>
        </div>

      </div>
    </div>

    <ConfirmDialog
      open={showLogoutConfirm}
      isDark={isDark}
      title="Log out?"
      message="Are you sure you want to log out?"
      confirmLabel="Log Out"
      cancelLabel="Cancel"
      onCancel={() => setShowLogoutConfirm(false)}
      onConfirm={() => { setShowLogoutConfirm(false); onLogout?.(); }}
    />
    </>
  );
}
