import { useState, useEffect, useCallback } from 'react';
import {
  History,
  UserCircle2,
  Settings,
  HelpCircle,
  PanelLeftClose,
  Plus,
  Bell,
} from 'lucide-react';
import voiceLKIcon from '../assets/voicelk-icon.png';
import HomeView from './HomeView';
import ProfileView from './ProfileView';

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

function NavItem({ id, label, Icon, isActive, full, t, onClick }) {
  const isProfileActive = id === 'profile' && isActive;
  // Mint green / light teal for profile active state
  const isDark = t.pageBg === '#060f1e';
  const activeBg = isProfileActive 
    ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#a7f3d0') // emerald-200
    : t.navBgActive;
  const activeText = isProfileActive
    ? (isDark ? '#34d399' : '#064e3b') // emerald-900
    : t.navTextActive;
  const activeIcon = isProfileActive ? activeText : t.navIconActive;

  if (!full) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <button
          onClick={onClick}
          title={label}
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

function CollapsedSidebar({ t, activeNav, setActiveNav, onLogoClick }) {
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
      {}
      <button
        onClick={onLogoClick}
        title="Open sidebar"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 0 10px', lineHeight: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <img src={voiceLKIcon} alt="VoiceLK"
          style={{ width: 26, height: 26, objectFit: 'contain' }} />
      </button>

      {}
      <button
        onClick={() => {}}
        title="New Chat"
        style={{
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',           
          border: 'none',
          background: t.newChatBg,
          color: t.newChatText,
          cursor: 'pointer',
          transition: 'background 0.16s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = t.newChatBgHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = t.newChatBg)}
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>

      {}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '0 6px', marginTop: 2 }}>
        {NAV_TOP.map(({ id, label, Icon }) => (
          <NavItem key={id} id={id} label={label} Icon={Icon}
            isActive={activeNav === id} full={false} t={t}
            onClick={() => setActiveNav(id)} />
        ))}
      </div>

      {}
      <div style={{ flex: 1 }} />

      {}
      <div style={{ width: 28, height: 1, background: t.divider, margin: '4px 0' }} />

      {}
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

function ExpandedSidebarContent({ t, activeNav, setActiveNav, onClose, onNavClick }) {
  const handleNav = (id) => {
    setActiveNav(id);
    if (onNavClick) onNavClick();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', padding: '12px 10px',
    }}>
      {}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14, paddingLeft: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={voiceLKIcon} alt="VoiceLK"
            style={{ width: 26, height: 26, objectFit: 'contain' }} />
          <span style={{
            fontSize: 16, fontWeight: 700,
            color: t.logoText, letterSpacing: '-0.3px',
          }}>
            VoiceLK
          </span>
        </div>

        {}
        <button
          onClick={onClose}
          title="Close sidebar"
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
      </div>

      {}
      <button
        onClick={() => { {} if (onNavClick) onNavClick(); }}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 14px',
          borderRadius: 9999,            
          border: 'none',
          background: t.newChatBg,
          color: t.newChatText,
          cursor: 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          marginBottom: 6, transition: 'background 0.16s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = t.newChatBgHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = t.newChatBg)}
      >
        <Plus size={15} strokeWidth={2.5} />
        New Chat
      </button>

      {}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_TOP.map(({ id, label, Icon }) => (
          <NavItem key={id} id={id} label={label} Icon={Icon}
            isActive={activeNav === id} full={true} t={t}
            onClick={() => handleNav(id)} />
        ))}
      </div>

      {}
      <div style={{ flex: 1 }} />

      {}
      <div style={{ height: 1, background: t.divider, margin: '6px 0' }} />

      {}
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

export default function MainLayout() {
  
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e) => setIsDark(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const [expanded, setExpanded] = useState(true);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('profile');

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
      `}</style>

      <div style={{
        display: 'flex', height: '100vh', width: '100vw',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        background: t.pageBg,
      }}>

        {}
        {expanded && (
          <div style={{
            width: 220, minWidth: 220,
            height: '100vh',
            background: t.sidebarBg,
            borderRight: `1px solid ${t.sidebarBorder}`,
            flexShrink: 0, zIndex: 20, overflow: 'hidden',
            animation: 'slideInLeft 0.22s ease',
          }}>
            <ExpandedSidebarContent
              t={t} activeNav={activeNav} setActiveNav={setActiveNav}
              onClose={() => setExpanded(false)}
            />
          </div>
        )}

        {}
        {!expanded && (
          <CollapsedSidebar
            t={t} activeNav={activeNav} setActiveNav={setActiveNav}
            onLogoClick={() => setDrawerOpen(true)}
          />
        )}

        {}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          height: '100vh', overflow: 'hidden',
          background: t.pageBg, position: 'relative',
        }}>

          {}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '8px 16px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconBtn title="Notifications" t={t}>
                <Bell size={18} strokeWidth={1.8} />
              </IconBtn>
              <IconBtn title="Settings" t={t}>
                <Settings size={18} strokeWidth={1.8} />
              </IconBtn>
              {}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: t.avatarBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: t.avatarText,
                cursor: 'pointer', marginLeft: 6, userSelect: 'none',
              }}>
                V
              </div>
            </div>
          </div>

          {/* Dynamic Content Area */}
          {activeNav === 'profile' ? (
            <ProfileView isDark={isDark} />
          ) : (
            <HomeView t={t} isDark={isDark} />
          )}
        </div>

        {}
        {drawerOpen && (
          <>
            {}
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: t.backdropBg,
                zIndex: 40,
                animation: 'fadeIn 0.18s ease',
              }}
            />
            {}
            <div style={{
              position: 'fixed',
              top: 0, left: 0, bottom: 0,
              width: 230,
              background: t.sidebarBg,
              borderRight: `1px solid ${t.sidebarBorder}`,
              boxShadow: t.drawerShadow,
              zIndex: 50,
              animation: 'slideInLeft 0.22s cubic-bezier(0.22,0.61,0.36,1)',
              overflow: 'hidden',
            }}>
              <ExpandedSidebarContent
                t={t} activeNav={activeNav} setActiveNav={setActiveNav}
                
                onClose={() => { setExpanded(true); setDrawerOpen(false); }}
                
                onNavClick={() => setDrawerOpen(false)}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
