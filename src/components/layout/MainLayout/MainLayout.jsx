import { useState, useEffect, useCallback } from 'react';
import {
  History,
  UserCircle2,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Bell,
  LogIn,
  LogOut,
} from 'lucide-react';
import voiceLKIcon from '../../../assets/images/voicelk-icon.png';
import { api } from '../../../services/api';
import HomeView from '../../../pages/Home/Home';
import ProfileView from '../../../pages/Profile/Profile';
import ChatView from '../../../pages/Chat/Chat';
import HistoryView from '../../../pages/History/History';
import HelpView from '../../../pages/Help/Help';
import SettingsView from '../../../pages/Settings/Settings';

const LIGHT = {
  pageBg: '#f0f4fa',
  sidebarBg: '#f8fafc',
  sidebarBorder: '#e5e7eb',
  logoText: '#1d4ed8',
  newChatBg: '#eff6ff',
  newChatBgHover: '#dbeafe',
  newChatText: '#1d4ed8',
  newChatBorder: 'transparent',
  navText: '#374151',
  navTextActive: '#1d4ed8',
  navBgHover: '#eff6ff',
  navBgActive: '#e0edff',
  navIconColor: '#6b7280',
  navIconActive: '#1d4ed8',
  divider: '#e5e7eb',
  topbarIcon: '#9ca3af',
  topbarIconHover: '#1d4ed8',
  topbarIconHoverBg: '#eff6ff',
  avatarBg: 'linear-gradient(135deg, #fbbf24, #f97316)',
  avatarText: '#ffffff',
  headingColor: '#1d4ed8',
  subColor: '#94a3b8',
  cardBg: '#ffffff',
  inputBorder: '#e2e8f0',
  inputShadow: '0 2px 16px rgba(99,102,241,0.07)',
  inputText: '#1e293b',
  inputPlaceholder: '#9ca3af',
  inputIcon: '#9ca3af',
  inputIconHover: '#1d4ed8',
  sendBg: '#1d4ed8',
  sendBgDisabled: '#e8edf5',
  sendIcon: '#ffffff',
  sendIconDisabled: '#9ca3af',
  backdropBg: 'rgba(0,0,0,0.15)',
  drawerShadow: '4px 0 20px rgba(0,0,0,0.10)',
  closeBtnHoverBg: '#f3f4f6',
};

const DARK = {
  pageBg: '#060f1e',
  sidebarBg: 'rgba(8,18,38,0.97)',
  sidebarBorder: 'rgba(255,255,255,0.07)',
  logoText: '#38bdf8',
  newChatBg: 'rgba(0,212,255,0.08)',
  newChatBgHover: 'rgba(0,212,255,0.16)',
  newChatText: '#38bdf8',
  newChatBorder: 'rgba(0,212,255,0.22)',
  navText: '#94a3b8',
  navTextActive: '#38bdf8',
  navBgHover: 'rgba(255,255,255,0.05)',
  navBgActive: 'rgba(0,212,255,0.10)',
  navIconColor: '#64748b',
  navIconActive: '#38bdf8',
  divider: 'rgba(255,255,255,0.07)',
  topbarIcon: '#64748b',
  topbarIconHover: '#38bdf8',
  topbarIconHoverBg: 'rgba(255,255,255,0.07)',
  avatarBg: 'linear-gradient(135deg, #0891b2, #7c3aed)',
  avatarText: '#ffffff',
  headingColor: '#38bdf8',
  subColor: '#475569',
  cardBg: 'rgba(12,24,48,0.9)',
  inputBorder: 'rgba(255,255,255,0.09)',
  inputShadow: '0 4px 24px rgba(0,0,0,0.3)',
  inputText: '#f1f5f9',
  inputPlaceholder: '#475569',
  inputIcon: '#475569',
  inputIconHover: '#38bdf8',
  sendBg: 'linear-gradient(135deg,#0891b2,#00d4ff)',
  sendBgDisabled: 'rgba(255,255,255,0.07)',
  sendIcon: '#ffffff',
  sendIconDisabled: '#334155',
  backdropBg: 'rgba(0,0,0,0.45)',
  drawerShadow: '4px 0 32px rgba(0,0,0,0.5)',
  closeBtnHoverBg: 'rgba(255,255,255,0.07)',
};

const NAV_TOP    = [
  { id: 'history', label: 'History', Icon: History },
  { id: 'profile', label: 'Profile', Icon: UserCircle2 },
];
const NAV_BOTTOM = [
  { id: 'settings', label: 'Settings', Icon: Settings },
  { id: 'help',     label: 'Help',     Icon: HelpCircle },
];

function IconBtn({ onClick, title, children, t, style = {} }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: t.topbarIcon, padding: 7, borderRadius: 8,
        lineHeight: 0, transition: 'color 0.15s, background 0.15s',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = t.topbarIconHover;
        e.currentTarget.style.background = t.topbarIconHoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = t.topbarIcon;
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

// When a click swaps the DOM under a stationary cursor (e.g. closing the
// sidebar mounts a different button right where the pointer already sits),
// browsers re-fire mouseenter on the new element with no real mouse motion.
// This flag makes tooltips ignore that "phantom" hover until the pointer
// actually moves, so a tooltip only reappears once the user re-hovers it.
let vlkSuppressTooltipHover = false;
function vlkArmTooltipSuppression() {
  vlkSuppressTooltipHover = true;
  const clear = () => {
    vlkSuppressTooltipHover = false;
    window.removeEventListener('mousemove', clear);
  };
  window.addEventListener('mousemove', clear);
}

function Tooltip({ label, children, pos = 'right' }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="vlk-tt-wrap"
      onMouseEnter={() => { if (!vlkSuppressTooltipHover) setShow(true); }}
      onMouseLeave={() => setShow(false)}
      onClickCapture={() => { setShow(false); vlkArmTooltipSuppression(); }}
    >
      {children}
      <span className={`vlk-tt-bubble${show ? ' vlk-tt-show' : ''}`} data-pos={pos}>{label}</span>
    </span>
  );
}

function AvatarCircle({ src, label, size, gradient, textColor, fontSize }) {
  const [errored, setErrored] = useState(false);

  if (src && !errored) {
    return (
      <img
        src={src}
        alt="User avatar"
        onError={() => setErrored(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, color: textColor,
    }}>
      {label}
    </div>
  );
}

function NavItem({ id, label, Icon, isActive, full, t, onClick }) {
  const isDark = t.pageBg === '#060f1e';
  const activeBg = isDark ? 'rgba(16, 185, 129, 0.15)' : '#ccfbf1';
  const activeText = isDark ? '#34d399' : '#0f766e';
  const activeIcon = activeText;

  if (!full) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Tooltip label={label}>
          <button
            onClick={onClick}
            style={{
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              border: 'none',
              background: isActive ? activeBg : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.16s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = t.navBgHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? activeBg : 'transparent'; }}
          >
            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8}
              style={{ color: isActive ? activeIcon : t.navIconColor }} />
          </button>
        </Tooltip>
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 14px',
        borderRadius: 9999,
        border: 'none',
        background: isActive ? activeBg : 'transparent',
        cursor: 'pointer',
        color: isActive ? activeText : t.navText,
        fontFamily: 'inherit', fontSize: 13.5,
        fontWeight: isActive ? 600 : 400,
        transition: 'background 0.16s, color 0.16s',
        whiteSpace: 'nowrap', overflow: 'hidden', textAlign: 'left',
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = t.navBgHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? activeBg : 'transparent'; }}
    >
      <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8}
        style={{ color: isActive ? activeIcon : t.navIconColor, flexShrink: 0 }} />
      <span>{label}</span>
    </button>
  );
}

function CollapsedSidebar({ t, activeNav, setActiveNav, onLogoClick, onNewChat, isAuthenticated }) {
  const [logoHover, setLogoHover] = useState(false);

  return (
    <div style={{
      width: 52, minWidth: 52,
      height: '100vh',
      background: t.sidebarBg,
      borderRight: `1px solid ${t.sidebarBorder}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 0 12px',
      gap: 4,
      flexShrink: 0,
      zIndex: 20,
    }}>
      <Tooltip label="Open sidebar">
        <button
          onClick={() => { if (onLogoClick) onLogoClick(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 0 10px', lineHeight: 0,
          }}
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
        >
          <span style={{ width: 26, height: 26, position: 'relative', display: 'block' }}>
            <img src={voiceLKIcon} alt="VoiceLK"
              style={{
                position: 'absolute', inset: 0, width: 26, height: 26, objectFit: 'contain',
                opacity: logoHover ? 0 : 1,
                transform: logoHover ? 'scale(0.82) translateX(2px)' : 'scale(1) translateX(0)',
                transition: 'opacity 0.16s ease, transform 0.16s ease',
              }} />
            <span style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: logoHover ? 1 : 0,
              transform: logoHover ? 'scale(1) translateX(0)' : 'scale(0.82) translateX(-3px)',
              transition: 'opacity 0.16s ease, transform 0.16s ease',
            }}>
              <PanelLeftOpen size={20} strokeWidth={1.8} color={t.navIconColor} />
            </span>
          </span>
        </button>
      </Tooltip>

      <Tooltip label="New Chat">
      <button
        onClick={() => { if (onNewChat) onNewChat(); else setActiveNav('new_chat'); }}
        style={{
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          border: 'none',
          background: activeNav === 'new_chat' ? '#dbeafe' : t.newChatBg,
          color: activeNav === 'new_chat' ? '#1d4ed8' : t.newChatText,
          cursor: 'pointer',
          transition: 'background 0.16s',
        }}
        onMouseEnter={(e) => { if (activeNav !== 'new_chat') e.currentTarget.style.background = t.newChatBgHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = activeNav === 'new_chat' ? '#dbeafe' : t.newChatBg; }}
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
      </Tooltip>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '0 6px', marginTop: 2 }}>
        {NAV_TOP.filter(item => isAuthenticated || item.id !== 'profile').map(({ id, label, Icon }) => (
          <NavItem key={id} id={id} label={label} Icon={Icon}
            isActive={activeNav === id} full={false} t={t}
            onClick={() => setActiveNav(id)} />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ width: 28, height: 1, background: t.divider, margin: '4px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '0 6px' }}>
        {NAV_BOTTOM.map(({ id, label, Icon }) => (
          <NavItem key={id} id={id} label={label} Icon={Icon}
            isActive={activeNav === id} full={false} t={t}
            onClick={() => setActiveNav(id)} />
        ))}
      </div>
    </div>
  );
}

function ExpandedSidebarContent({ t, activeNav, setActiveNav, onClose, onNavClick, onNewChat, isAuthenticated }) {
  const handleNav = (id) => {
    setActiveNav(id);
    if (onNavClick) onNavClick();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', padding: '12px 10px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14, paddingLeft: 2,
      }}>
        <div 
          onClick={() => handleNav('new_chat')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          title="Open Chat"
        >
          <img src={voiceLKIcon} alt="VoiceLK"
            style={{ width: 26, height: 26, objectFit: 'contain' }} />
          <span style={{
            fontSize: 16, fontWeight: 700,
            color: t.logoText, letterSpacing: '-0.3px',
          }}>
            VoiceLK
          </span>
        </div>

        <Tooltip label="Close sidebar">
          <button
            className="vlk-panel-toggle-btn"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: t.topbarIcon, lineHeight: 0, padding: 6, borderRadius: 8,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = t.closeBtnHoverBg;
              e.currentTarget.style.color = t.topbarIconHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = t.topbarIcon;
            }}
          >
            <PanelLeftClose size={19} strokeWidth={1.8} />
          </button>
        </Tooltip>
      </div>

      <button
        onClick={() => { if (onNewChat) onNewChat(); else setActiveNav('new_chat'); if (onNavClick) onNavClick(); }}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 14px',
          borderRadius: 9999,
          border: 'none',
          background: activeNav === 'new_chat' ? '#e2e8f0' : t.newChatBg,
          color: activeNav === 'new_chat' ? '#1d4ed8' : t.newChatText,
          cursor: 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          marginBottom: 6, transition: 'background 0.16s',
        }}
        onMouseEnter={(e) => { if (activeNav !== 'new_chat') e.currentTarget.style.background = t.newChatBgHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = activeNav === 'new_chat' ? '#e2e8f0' : t.newChatBg; }}
      >
        <Plus size={15} strokeWidth={2.5} />
        New Chat
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_TOP.filter(item => isAuthenticated || item.id !== 'profile').map(({ id, label, Icon }) => (
          <NavItem key={id} id={id} label={label} Icon={Icon}
            isActive={activeNav === id} full={true} t={t}
            onClick={() => handleNav(id)} />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ height: 1, background: t.divider, margin: '6px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_BOTTOM.map(({ id, label, Icon }) => (
          <NavItem key={id} id={id} label={label} Icon={Icon}
            isActive={activeNav === id} full={true} t={t}
            onClick={() => handleNav(id)} />
        ))}
      </div>
    </div>
  );
}

export default function MainLayout({ isAuthenticated = true, userData, onLoginClick, onLogout, isDark, onToggleDark }) {
  const [expanded, setExpanded] = useState(() => window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setExpanded(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  // Restore the last visited tab on refresh instead of always snapping back to home.
  const [activeNav, setActiveNav] = useState(() => {
    try {
      return sessionStorage.getItem('vlk_active_nav') || 'new_chat';
    } catch (_) {
      return 'new_chat';
    }
  });
  const [chatInitialMessage, setChatInitialMessage] = useState('');
  const [chatInitialHistoryItem, setChatInitialHistoryItem] = useState(null);

  // Cached backend responses, kept here (above the tab-driven unmount/remount
  // of History) so switching tabs doesn't re-trigger the same fetch.
  const [historyCache, setHistoryCache] = useState(null);
  // Separate small cache just for the topbar avatar/name prefetch below.
  const [profileCache, setProfileCache] = useState(null);

  // Fetch the real profile (name + Google/uploaded avatar) as soon as we're
  // authenticated, not just when the user opens the Profile tab, so the
  // topbar shows the same picture/name right away instead of an email-derived guess.
  useEffect(() => {
    if (!isAuthenticated || !userData?.userId) return;
    if (profileCache?.userId === userData.userId) return;

    let cancelled = false;
    api.get(`/api/reg/${userData.userId}`)
      .then(data => {
        if (cancelled || !data) return;
        setProfileCache({
          userId: userData.userId,
          data: {
            fullName: data.userName || data.email?.split('@')[0] || '',
            email: data.email || '',
            avatar: data.profilePicture || ''
          }
        });
      })
      .catch(err => console.error('Failed to sync profile for topbar', err));
    return () => { cancelled = true; };
  }, [isAuthenticated, userData?.userId]);

  const activeProfile = (profileCache && userData && profileCache.userId === userData.userId)
    ? profileCache.data
    : null;
  const displayName = activeProfile?.fullName || userData?.userName || '';
  const displayAvatar = activeProfile?.avatar || userData?.avatar || '';

  // Restore the last visited tab across refreshes instead of always snapping back to home.
  useEffect(() => {
    try {
      sessionStorage.setItem('vlk_active_nav', activeNav);
    } catch (_) { /* storage unavailable, ignore */ }
  }, [activeNav]);

  // Redirect away from profile if logged out
  useEffect(() => {
    if (!isAuthenticated && activeNav === 'profile') {
      setActiveNav('new_chat');
    }
  }, [isAuthenticated, activeNav]);

  const handleHomeSubmit = (message) => {
    setChatInitialMessage(message);
    setChatInitialHistoryItem(null);
    setActiveNav('chat');
  };

  const handleNewChat = () => {
    setChatInitialMessage('');
    setChatInitialHistoryItem(null);
    setActiveNav('new_chat');
  };

  const handleSelectHistoryItem = (item) => {
    setChatInitialMessage('');
    setChatInitialHistoryItem(item);
    setActiveNav('chat');
  };

  // Reopening from the collapsed rail should restore the persistent sidebar
  // (so it stays open across nav clicks) on desktop widths; on narrow/mobile
  // widths the persistent panel is CSS-hidden, so fall back to the drawer.
  const handleOpenSidebar = () => {
    if (window.innerWidth > 768) {
      setExpanded(true);
    } else {
      setDrawerOpen(true);
    }
  };

  const t = isDark ? DARK : LIGHT;

  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        #voicelk-input::placeholder { color: ${t.inputPlaceholder}; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
        }
        .vlk-tt-wrap { position: relative; display: inline-flex; }
        .vlk-tt-bubble {
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
          background: ${isDark ? '#f1f5f9' : '#111827'};
          color: ${isDark ? '#0f172a' : '#ffffff'};
          font-size: 12.5px;
          font-weight: 600;
          font-family: 'Quicksand', system-ui, sans-serif;
          padding: 6px 13px;
          border-radius: 9999px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.1s ease, transform 0.1s ease;
          transition-delay: 0s;
          z-index: 100;
          box-shadow: 0 4px 16px rgba(0,0,0,0.22);
        }
        .vlk-tt-bubble.vlk-tt-show {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(0);
        }
        .vlk-tt-bubble[data-pos="bottom-end"] {
          left: auto;
          right: 0;
          top: calc(100% + 8px);
          transform: translateY(-6px);
        }
        .vlk-tt-bubble[data-pos="bottom-end"].vlk-tt-show {
          transform: translateY(0);
        }
        .vlk-panel-toggle-btn svg { transition: transform 0.18s ease; }
        .vlk-panel-toggle-btn:hover svg { transform: translateX(-2px); }
      `}</style>

      <div style={{
        display: 'flex', height: '100vh', width: '100vw',
        overflow: 'hidden',
        fontFamily: "'Quicksand', system-ui, sans-serif",
        background: t.pageBg,
      }}>

        {expanded && (
          <div className="desktop-sidebar" style={{
            width: 220, minWidth: 220,
            height: '100vh',
            background: t.sidebarBg,
            borderRight: `1px solid ${t.sidebarBorder}`,
            flexShrink: 0, zIndex: 20,
            animation: 'slideInLeft 0.22s ease',
          }}>
            <ExpandedSidebarContent
              t={t} activeNav={activeNav} setActiveNav={setActiveNav}
              onClose={() => setExpanded(false)}
              onNewChat={handleNewChat}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}

        {!expanded && (
          <CollapsedSidebar
            t={t} activeNav={activeNav} setActiveNav={setActiveNav}
            onLogoClick={handleOpenSidebar}
            onNewChat={handleNewChat}
            isAuthenticated={isAuthenticated}
          />
        )}

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          height: '100vh', overflow: 'hidden',
          background: t.pageBg, position: 'relative',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            flexShrink: 0,
          }}>
            <div />

            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isAuthenticated ? (
                <>
                  <div
                    title={userData?.email || 'User'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                      padding: '4px 12px 4px 4px',
                      borderRadius: 9999,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                      cursor: 'pointer', userSelect: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}
                  >
                    <AvatarCircle
                      key={displayAvatar || 'none'}
                      src={displayAvatar}
                      label={((displayName || userData?.email)?.[0] || 'U').toUpperCase()}
                      size={28}
                      gradient={t.avatarBg}
                      textColor={t.avatarText}
                      fontSize={12}
                    />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: t.itemText }}>
                      {displayName ? displayName.split(' ')[0] : (userData?.email ? userData.email.split('@')[0].split(/[._+-]/)[0].replace(/^\w/, c => c.toUpperCase()) : 'User')}
                    </span>
                  </div>
                </>
              ) : (
                <button
                  onClick={onLoginClick}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 18px 7px 14px',
                    borderRadius: 9999,
                    border: 'none',
                    background: isDark
                      ? 'linear-gradient(135deg, #0891b2, #00d4ff)'
                      : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    color: '#ffffff',
                    fontSize: 13.5, fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s, opacity 0.15s',
                    boxShadow: isDark
                      ? '0 2px 12px rgba(0,212,255,0.3)'
                      : '0 2px 12px rgba(37,99,235,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 4px 20px rgba(0,212,255,0.45)'
                      : '0 4px 20px rgba(37,99,235,0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 2px 12px rgba(0,212,255,0.3)'
                      : '0 2px 12px rgba(37,99,235,0.3)';
                  }}
                >
                  <LogIn size={15} strokeWidth={2.2} />
                  Login
                </button>
              )}
            </div>
          </div>

          {activeNav === 'profile' ? (
            <ProfileView isDark={isDark} onToggleDark={onToggleDark} onLogout={onLogout} userData={userData} />
          ) : activeNav === 'history' ? (
            <HistoryView isDark={isDark} userData={userData} onSelectHistoryItem={handleSelectHistoryItem}
              cache={historyCache} onCacheUpdate={setHistoryCache} />
          ) : activeNav === 'settings' ? (
            <SettingsView isDark={isDark} onToggleDark={onToggleDark} userData={userData} t={t} />
          ) : activeNav === 'help' ? (
            <HelpView isDark={isDark} />
          ) : activeNav === 'chat' ? (
            <ChatView t={t} isDark={isDark} initialMessage={chatInitialMessage} initialHistoryItem={chatInitialHistoryItem} userData={userData}
              onHistorySync={() => setHistoryCache(null)} />
          ) : (
            <HomeView t={t} isDark={isDark} onSubmit={handleHomeSubmit} />
          )}
        </div>

        {drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: t.backdropBg,
                zIndex: 40,
                animation: 'fadeIn 0.18s ease',
              }}
            />
            <div style={{
              position: 'fixed',
              top: 0, left: 0, bottom: 0,
              width: 230,
              background: t.sidebarBg,
              borderRight: `1px solid ${t.sidebarBorder}`,
              boxShadow: t.drawerShadow,
              zIndex: 50,
              animation: 'slideInLeft 0.22s cubic-bezier(0.22,0.61,0.36,1)',
            }}>
              <ExpandedSidebarContent
                t={t} activeNav={activeNav} setActiveNav={setActiveNav}
                onClose={() => { setDrawerOpen(false); }}
                onNavClick={() => { setDrawerOpen(false); }}
                onNewChat={handleNewChat}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
