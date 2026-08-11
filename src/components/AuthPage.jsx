import { useState, useEffect } from 'react';
import voiceLKIcon from '../assets/voicelk-icon.png';
import { Mail, Lock, User, Eye, EyeOff, Mic2, Loader2 } from 'lucide-react';
import { api, friendlyMessage } from '../utils/api';
import { useError } from '../context/ErrorContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
    <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
    <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.313 0-9.823-3.417-11.423-8.083l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
    <path d="M43.611 20.083H42V20H24v8h11.303a11.966 11.966 0 01-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
  </svg>
);

const LIGHT = {
  pageBg: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 40%, #ede9fe 70%, #fce7f3 100%)',
  card: '#ffffff',
  cardBorder: 'rgba(0,0,0,0.06)',
  cardShadow: '0 20px 60px rgba(99,102,241,0.12), 0 4px 16px rgba(0,0,0,0.06)',
  logoText: '#1e293b',
  subtitle: '#64748b',
  googleBg: '#ffffff',
  googleBorder: '#e2e8f0',
  googleText: '#374151',
  googleHoverBg: '#f8fafc',
  dividerLine: '#e2e8f0',
  dividerText: '#94a3b8',
  inputBg: '#f1f5f9',
  inputBorder: '#e2e8f0',
  inputFocusBorder: '#3b82f6',
  inputFocusRing: 'rgba(59,130,246,0.15)',
  inputText: '#1e293b',
  inputPlaceholder: '#94a3b8',
  inputIcon: '#94a3b8',
  inputIconFocus: '#3b82f6',
  checkBorder: '#cbd5e1',
  checkBorderChecked: '#3b82f6',
  checkBg: '#ffffff',
  checkBgChecked: 'rgba(59,130,246,0.08)',
  rememberText: '#64748b',
  forgotText: '#3b82f6',
  forgotHover: '#2563eb',
  ctaBg: '#4285f4',
  ctaHoverBg: '#3b78e8',
  ctaText: '#ffffff',
  ctaShadow: '0 4px 14px rgba(66,133,244,0.35)',
  toggleText: '#64748b',
  toggleLink: '#3b82f6',
  toggleLinkHover: '#2563eb',
  eyeIcon: '#94a3b8',
  eyeIconHover: '#3b82f6',
};

const DARK = {
  pageBg: '#030d1a',
  pageBgExtra: 'radial-gradient(ellipse at 20% 20%, rgba(0,212,255,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(124,58,237,0.12) 0%, transparent 55%)',
  card: 'rgba(10,20,40,0.85)',
  cardBorder: 'rgba(255,255,255,0.07)',
  cardShadow: '0 32px 80px rgba(0,0,0,0.6)',
  logoText: '#f1f5f9',
  subtitle: '#64748b',
  googleBg: 'rgba(255,255,255,0.05)',
  googleBorder: 'rgba(255,255,255,0.10)',
  googleText: 'rgba(255,255,255,0.85)',
  googleHoverBg: 'rgba(255,255,255,0.09)',
  dividerLine: 'rgba(255,255,255,0.07)',
  dividerText: '#475569',
  inputBg: 'rgba(255,255,255,0.04)',
  inputBorder: 'rgba(255,255,255,0.09)',
  inputFocusBorder: 'rgba(0,212,255,0.6)',
  inputFocusRing: 'rgba(0,212,255,0.08)',
  inputText: '#f1f5f9',
  inputPlaceholder: '#475569',
  inputIcon: '#475569',
  inputIconFocus: '#00d4ff',
  checkBorder: 'rgba(255,255,255,0.18)',
  checkBorderChecked: 'rgba(0,212,255,0.7)',
  checkBg: 'rgba(255,255,255,0.04)',
  checkBgChecked: 'rgba(0,212,255,0.12)',
  rememberText: '#64748b',
  forgotText: '#00d4ff',
  forgotHover: '#67e8f9',
  ctaBg: 'linear-gradient(135deg, #0891b2, #00d4ff 50%, #7c3aed)',
  ctaHoverBg: 'linear-gradient(135deg, #0e7490, #00b8e6 50%, #6d28d9)',
  ctaText: '#ffffff',
  ctaShadow: '0 4px 20px rgba(0,212,255,0.28)',
  toggleText: '#475569',
  toggleLink: '#00d4ff',
  toggleLinkHover: '#67e8f9',
  eyeIcon: '#475569',
  eyeIconHover: '#00d4ff',
};

const InputField = ({ id, label, type: initialType = 'text', icon: Icon, t, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isPassword = initialType === 'password';
  const resolvedType = isPassword ? (showPass ? 'text' : 'password') : initialType;

  return (
    <div style={{ position: 'relative' }}>
      {}
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: focused ? t.inputIconFocus : t.inputIcon,
          transition: 'color 0.18s',
          lineHeight: 0,
          pointerEvents: 'none',
        }}
      >
        <Icon size={15} strokeWidth={1.8} />
      </div>

      <input
        id={id}
        type={resolvedType}
        value={value}
        placeholder={label}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '11px 36px 11px 38px',
          borderRadius: 9999,           
          border: `1px solid ${focused ? t.inputFocusBorder : t.inputBorder}`,
          background: t.inputBg,
          color: t.inputText,
          fontSize: 13,
          outline: 'none',
          boxShadow: focused ? `0 0 0 3px ${t.inputFocusRing}` : 'none',
          transition: 'all 0.18s ease',
          caretColor: t.inputFocusBorder,
          fontFamily: 'inherit',
        }}
      />

      {}
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPass((p) => !p)}
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: t.eyeIcon,
            lineHeight: 0,
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = t.eyeIconHover)}
          onMouseLeave={(e) => (e.currentTarget.style.color = t.eyeIcon)}
          aria-label={showPass ? 'Hide password' : 'Show password'}
        >
          {showPass ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
        </button>
      )}

      {}
      <style>{`
        #${id}::placeholder { color: ${t.inputPlaceholder}; }
      `}</style>
    </div>
  );
};

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [fading, setFading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { showError } = useError();

  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const t = isDark ? DARK : LIGHT;

  const toggleView = () => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setIsLogin((p) => !p);
      setEmail('');
      setPassword('');
      setUserName('');
      setConfirmPassword('');
      setFading(false);
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      showError('Please fill in all required fields.', 'warning');
      return;
    }

    if (!isLogin) {
      if (!userName) {
        showError('Please enter a username.', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        showError('Passwords do not match.', 'error');
        return;
      }
      if (password.length < 6) {
        showError('Password must be at least 6 characters.', 'warning');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const data = await api.post('/auth/login', { email, password });
        // Store token and user info
        localStorage.setItem('voicelk_token', data.token);
        localStorage.setItem('voicelk_user', JSON.stringify({
          userId: data.userId,
          email: data.email,
          role: data.role,
        }));
        if (onLogin) onLogin({
          token: data.token,
          userId: data.userId,
          email: data.email,
          role: data.role,
        });
      } else {
        // Register
        await api.post('/auth/register', { userName, email, password });
        showError('Account created successfully! Please sign in.', 'success');
        // Switch to login view after a short delay
        setTimeout(() => {
          setFading(true);
          setTimeout(() => {
            setIsLogin(true);
            setPassword('');
            setConfirmPassword('');
            setUserName('');
            setFading(false);
          }, 250);
        }, 1200);
      }
    } catch (err) {
      showError(friendlyMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const data = await api.post('/auth/firebase', { idToken });

      localStorage.setItem('voicelk_token', data.token);
      localStorage.setItem('voicelk_user', JSON.stringify({
        userId: data.userId,
        email: data.email,
        role: data.role,
      }));

      if (onLogin) onLogin({
        token: data.token,
        userId: data.userId,
        email: data.email,
        role: data.role,
      });

    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show an error
        return;
      }
      showError(friendlyMessage(err), 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const pageStyle = isDark
    ? { background: t.pageBg, position: 'relative' }
    : { background: t.pageBg };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${isDark ? '#030d1a' : '#dbeafe'}; }
        @keyframes blobDrift {
          0%,100% { transform: scale(1) translate(0,0); }
          33%  { transform: scale(1.06) translate(18px,-14px); }
          66%  { transform: scale(0.96) translate(-10px,18px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          fontFamily: "'Inter', system-ui, sans-serif",
          position: 'relative',
          overflow: 'hidden',
          ...pageStyle,
        }}
      >
        {}
        {isDark && (
          <>
            <div style={{
              position: 'fixed', top: -160, left: -160,
              width: 580, height: 580, borderRadius: '50%',
              background: 'radial-gradient(circle, #00d4ff 0%, #0066cc 60%, transparent 100%)',
              opacity: 0.18, filter: 'blur(110px)',
              animation: 'blobDrift 9s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'fixed', bottom: -180, right: -180,
              width: 680, height: 680, borderRadius: '50%',
              background: 'radial-gradient(circle, #7c3aed 0%, #3b0764 60%, transparent 100%)',
              opacity: 0.15, filter: 'blur(130px)',
              animation: 'blobDrift 11s ease-in-out infinite reverse',
              pointerEvents: 'none',
            }} />
          </>
        )}

        {}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 400,
            zIndex: 10,
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(10px) scale(0.985)' : 'translateY(0) scale(1)',
            transition: 'opacity 250ms ease, transform 250ms ease',
          }}
        >
          {}
          {isDark && (
            <div style={{
              position: 'absolute', inset: -1, borderRadius: 28,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(124,58,237,0.18), transparent)',
              zIndex: -1, filter: 'blur(1px)',
            }} />
          )}

          {}
          <div
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              background: t.card,
              border: `1px solid ${t.cardBorder}`,
              boxShadow: t.cardShadow,
              backdropFilter: isDark ? 'blur(24px)' : 'none',
              WebkitBackdropFilter: isDark ? 'blur(24px)' : 'none',
            }}
          >
            {}
            {isDark && (
              <div style={{
                height: 2,
                background: 'linear-gradient(90deg, transparent, #00d4ff 30%, #7c3aed 70%, transparent)',
              }} />
            )}

            <div style={{ padding: '36px 32px 32px' }}>

              {}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                {}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  marginBottom: 6,
                }}>
                  <img
                    src={voiceLKIcon}
                    alt="VoiceLK icon"
                    style={{
                      width: 34,
                      height: 34,
                      objectFit: 'contain',
                      
                      mixBlendMode: isDark ? 'screen' : 'normal',
                      filter: isDark ? 'brightness(1.15)' : 'none',
                    }}
                  />
                  <span style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: '-0.5px',
                    color: t.logoText,
                    lineHeight: 1,
                  }}>
                    VoiceLK
                  </span>
                </div>
              </div>

              {}
              <button 
                type="button" 
                onClick={handleGoogle}
                disabled={googleLoading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '12px 24px', borderRadius: 9999,
                  background: t.googleBg, border: `1px solid ${t.googleBorder}`,
                  color: t.googleText, fontSize: 14.5, fontWeight: 600,
                  cursor: googleLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s, transform 0.15s',
                  opacity: googleLoading ? 0.7 : 1,
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => { 
                  if (!googleLoading) {
                    e.currentTarget.style.background = t.googleHoverBg; 
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => { 
                  if (!googleLoading) {
                    e.currentTarget.style.background = t.googleBg; 
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)';
                  }
                }}
              >
                {googleLoading ? (
                  <Loader2 size={18} strokeWidth={2.2} style={{ animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <GoogleIcon />
                    Continue with Google
                  </>
                )}
              </button>

              {}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: t.dividerLine }} />
                <span style={{ fontSize: 11, color: t.dividerText, fontWeight: 400, whiteSpace: 'nowrap' }}>
                  {isLogin ? 'or sign in with email' : 'or register with email'}
                </span>
                <div style={{ flex: 1, height: 1, background: t.dividerLine }} />
              </div>



              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                {!isLogin && (
                  <InputField id="reg-username" label="Username" type="text" icon={User} t={t}
                    value={userName} onChange={setUserName} />
                )}

                <InputField
                  id={isLogin ? 'login-email' : 'reg-email'}
                  label="Email address"
                  type="email"
                  icon={Mail}
                  t={t}
                  value={email}
                  onChange={setEmail}
                />

                <InputField
                  id={isLogin ? 'login-password' : 'reg-password'}
                  label="Password"
                  type="password"
                  icon={Lock}
                  t={t}
                  value={password}
                  onChange={setPassword}
                />

                {!isLogin && (
                  <InputField
                    id="reg-confirm-password"
                    label="Confirm Password"
                    type="password"
                    icon={Lock}
                    t={t}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />
                )}

                {}
                {isLogin && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 2,
                  }}>
                    {}
                    <label
                      htmlFor="remember-me"
                      style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}
                    >
                      <div style={{ position: 'relative', lineHeight: 0 }}>
                        <input
                          type="checkbox"
                          id="remember-me"
                          checked={rememberMe}
                          onChange={() => setRememberMe((p) => !p)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                        />
                        {}
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',          
                            border: `1.5px solid ${rememberMe ? t.checkBorderChecked : t.checkBorder}`,
                            background: rememberMe ? t.checkBgChecked : t.checkBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          {rememberMe && (
                            <div style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: isDark ? '#00d4ff' : '#3b82f6',
                            }} />
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: t.rememberText, userSelect: 'none' }}>
                        Remember me
                      </span>
                    </label>

                    {}
                    <button
                      type="button"
                      id="forgot-password-btn"
                      onClick={() => {}}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 500,
                        color: t.forgotText,
                        fontFamily: 'inherit',
                        padding: 0,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = t.forgotHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = t.forgotText)}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {}
                <button
                  type="submit"
                  id={isLogin ? 'sign-in-btn' : 'create-account-btn'}
                  style={{
                    width: '100%',
                    padding: '11px 0',
                    borderRadius: 9999,          
                    fontSize: 13,
                    fontWeight: 600,
                    color: t.ctaText,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 6,
                    background: isDark
                      ? 'linear-gradient(135deg, #0891b2 0%, #00d4ff 45%, #7c3aed 100%)'
                      : '#4285f4',
                    backgroundSize: isDark ? '200% 100%' : 'auto',
                    backgroundPosition: '0% 50%',
                    boxShadow: t.ctaShadow,
                    fontFamily: 'inherit',
                    letterSpacing: '0.01em',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (isDark) e.currentTarget.style.backgroundPosition = '100% 50%';
                    else e.currentTarget.style.background = '#3b78e8';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 8px 28px rgba(0,212,255,0.38)'
                      : '0 6px 18px rgba(66,133,244,0.42)';
                  }}
                  onMouseLeave={(e) => {
                    if (isDark) e.currentTarget.style.backgroundPosition = '0% 50%';
                    else e.currentTarget.style.background = '#4285f4';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = t.ctaShadow;
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.985)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                >
                  {loading ? (
                    <Loader2 size={18} strokeWidth={2.2} style={{ animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {}
              <p style={{ textAlign: 'center', fontSize: 12.5, color: t.toggleText, marginTop: 20 }}>
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      id="go-to-register-btn"
                      onClick={toggleView}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 12.5, fontWeight: 600, color: t.toggleLink,
                        fontFamily: 'inherit', padding: 0, transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = t.toggleLinkHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = t.toggleLink)}
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      id="go-to-login-btn"
                      onClick={toggleView}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 12.5, fontWeight: 600, color: t.toggleLink,
                        fontFamily: 'inherit', padding: 0, transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = t.toggleLinkHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = t.toggleLink)}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
