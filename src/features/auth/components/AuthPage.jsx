import { useState, useEffect, useRef } from 'react';
import voiceLKLogo from '../../../assets/images/voicelk-logo.png';
import voiceLKLogoWhite from '../../../assets/images/voicelk-logo-white.png';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, X, Sparkles, AudioLines, BookOpen, Headphones, CheckCircle2, CircleAlert } from 'lucide-react';
import { api, friendlyMessage } from '../../../services/api';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../../services/firebase';
import './AuthPage.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
    <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
    <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.313 0-9.823-3.417-11.423-8.083l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
    <path d="M43.611 20.083H42V20H24v8h11.303a11.966 11.966 0 01-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
  </svg>
);

function InputField({ id, label, type = 'text', icon: Icon, value, onChange, autoComplete, placeholder, disabled, hint }) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <Icon size={17} aria-hidden="true" />
        <input id={id} name={id} type={password && visible ? 'text' : type}
          value={value} onChange={event => onChange(event.target.value)}
          required disabled={disabled} autoComplete={autoComplete} placeholder={placeholder}
          aria-describedby={hint ? `${id}-hint` : undefined} />
        {password && <button type="button" className="auth-password-toggle" disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}
          onClick={() => setVisible(current => !current)}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>}
      </div>
      {hint && <p id={`${id}-hint`} className="auth-field-hint">{hint}</p>}
    </div>
  );
}

export default function AuthPage({ onLogin, onClose, isDark = false }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.focus();
    const handleKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose?.(); }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
        event.preventDefault(); first.focus();
      }
    };
    dialog?.addEventListener('keydown', handleKey);
    return () => { dialog?.removeEventListener('keydown', handleKey); previousFocus?.focus?.(); };
  }, [onClose]);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);


  const busy = loading || googleLoading;
  const toggleView = (next = !isLogin) => {
    if (busy || next === isLogin) return;
    setIsLogin(next);
    setPassword('');
    setConfirmPassword('');
    setFormError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setFormError('');
    setSuccess('');

    // Validation
    if (!email || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!isLogin) {
      if (!userName) {
        setFormError('Please enter a username.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Your passwords do not match. Please try again.');
        return;
      }
      if (password.length < 6) {
        setFormError('Use at least 6 characters for your password.');
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
          userName: data.userName,
          avatar: data.profilePicture,
          role: data.role,
        }));
        if (onLogin) onLogin({
          token: data.token,
          userId: data.userId,
          email: data.email,
          userName: data.userName,
          avatar: data.profilePicture,
          role: data.role,
        });
      } else {
        // Register
        await api.post('/auth/register', { userName, email, password });
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
        setUserName('');
        setSuccess('Your account is ready. Sign in to get started.');
      }
    } catch (err) {
      setFormError(friendlyMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setFormError('');
    setSuccess('');
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const data = await api.post('/auth/firebase', { idToken });

      // Fall back to the Google account's own photo when the backend hasn't
      // synced a profilePicture yet (e.g. a brand-new Google sign-in).
      const avatar = data.profilePicture || result.user.photoURL || '';

      localStorage.setItem('voicelk_token', data.token);
      localStorage.setItem('voicelk_user', JSON.stringify({
        userId: data.userId,
        email: data.email,
        userName: data.userName,
        avatar,
        role: data.role,
      }));

      if (onLogin) onLogin({
        token: data.token,
        userId: data.userId,
        email: data.email,
        userName: data.userName,
        avatar,
        role: data.role,
      });

    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show an error
        return;
      }
      setFormError(friendlyMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={`studio-auth auth-screen${isDark ? ' auth-dark' : ''}`}>
      <div className={`auth-dialog${!isLogin ? ' auth-signup' : ''}`} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-title" tabIndex={-1}>
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close account access"><X size={20} /></button>
        <aside className="auth-story" aria-label="About VoiceLK">
          <img className="auth-story-logo" src={voiceLKLogoWhite} alt="VoiceLK" />
          <div className="auth-story-content">
            <span className="auth-eyebrow"><Sparkles size={14} /> A little curiosity goes a long way</span>
            <h2>Big ideas.<br /><span>A familiar voice.</span></h2>
            <p>Make sense of ICT, one conversation at a time. Ask, listen, and learn in Sinhala.</p>
            <div className="auth-audio-art" aria-hidden="true">
              <div className="auth-art-top"><span className="auth-art-icon"><AudioLines size={21} /></span><span>Learning that speaks to you<small>Your ideas, brought to life</small></span><span className="auth-art-dot" /></div>
              <div className="auth-wave">{[18, 28, 42, 24, 52, 66, 36, 78, 54, 92, 72, 44, 60, 84, 100, 66, 38, 74, 50, 30, 64, 42, 22, 36, 18].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
              <div className="auth-art-bottom"><span>Sinhala, simply spoken</span><Headphones size={15} /></div>
            </div>
          </div>
          <div className="auth-story-footer"><BookOpen size={17} /><span>Made for Sri Lankan learners.</span></div>
        </aside>
        <section className="auth-form-panel">
          <img className="auth-mobile-logo" src={isDark ? voiceLKLogoWhite : voiceLKLogo} alt="VoiceLK" />
          <div className="auth-mode-switch" aria-label="Account access">
            <button type="button" aria-pressed={isLogin} className={isLogin ? 'is-active' : ''} disabled={busy} onClick={() => toggleView(true)}>Sign in</button>
            <button type="button" aria-pressed={!isLogin} className={!isLogin ? 'is-active' : ''} disabled={busy} onClick={() => toggleView(false)}>Sign up</button>
          </div>
          <div className="auth-form-heading">
            <span className="auth-kicker">{isLogin ? 'GOOD TO SEE YOU AGAIN' : 'YOUR NEXT CHAPTER'}</span>
            <h1 id="auth-title">{isLogin ? 'Welcome back.' : 'Find your voice.'}</h1>
            <p>{isLogin ? 'Your next discovery is just a conversation away.' : 'Create your account and make room for a little curiosity.'}</p>
          </div>
          <button type="button" className="auth-google" onClick={handleGoogle} disabled={busy}>
            {googleLoading ? <Loader2 size={18} className="auth-spinner" /> : <GoogleIcon />}
            {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </button>
          <div className="auth-divider"><span>or continue with email</span></div>
          {formError && <div className="auth-notice auth-notice-error" role="alert"><CircleAlert size={17} /><span>{formError}</span></div>}
          {success && <div className="auth-notice auth-notice-success" role="status"><CheckCircle2 size={17} /><span>{success}</span></div>}
          <form className="auth-form" onSubmit={handleSubmit} aria-busy={busy}>
            <div className={isLogin ? 'auth-details-fields' : 'auth-details-fields auth-details-pair'}>
              {!isLogin && <InputField id="reg-username" label="Username" icon={User} placeholder="How should we call you?" autoComplete="username" value={userName} onChange={setUserName} disabled={busy} />}
              <InputField id={isLogin ? 'login-email' : 'reg-email'} label="Email address" type="email" icon={Mail} placeholder="you@example.com" autoComplete="email" value={email} onChange={setEmail} disabled={busy} />
            </div>
            <div className={isLogin ? 'auth-password-fields' : 'auth-password-fields auth-password-pair'}>
              <InputField key={isLogin ? 'login-password' : 'reg-password'} id={isLogin ? 'login-password' : 'reg-password'} label="Password" type="password" icon={Lock} placeholder={isLogin ? 'Enter your password' : 'Create a password'} autoComplete={isLogin ? 'current-password' : 'new-password'} value={password} onChange={setPassword} disabled={busy} hint={!isLogin ? 'At least 6 characters.' : undefined} />
              {!isLogin && <InputField id="reg-confirm-password" label="Confirm password" type="password" icon={Lock} placeholder="Repeat password" autoComplete="new-password" value={confirmPassword} onChange={setConfirmPassword} disabled={busy} />}
            </div>
            <button type="submit" id={isLogin ? 'sign-in-btn' : 'create-account-btn'} className="auth-submit" disabled={busy}>
              {loading ? <><Loader2 size={18} className="auth-spinner" /><span>{isLogin ? 'Signing you in...' : 'Creating your account...'}</span></> : <><span>{isLogin ? 'Sign in' : 'Create account'}</span><ArrowRight size={18} /></>}
            </button>
          </form>
          <p className="auth-switch-prompt">{isLogin ? 'New around here?' : 'Already part of VoiceLK?'}{' '}
            <button type="button" id={isLogin ? 'go-to-register-btn' : 'go-to-login-btn'} disabled={busy} onClick={() => toggleView()}>{isLogin ? 'Create an account' : 'Sign in'}</button>
          </p>
          <div className="auth-form-footer"><AudioLines size={14} /><span>Your words. Your pace. Your VoiceLK.</span></div>
        </section>
      </div>
    </div>
  );
}
