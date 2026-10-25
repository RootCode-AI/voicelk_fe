import { useState, useEffect, useCallback, useRef } from 'react';
import {
  History,
  UserCircle2,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Sparkles,
  MessageSquare,
  AudioLines,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';
import Tooltip from '../../common/Tooltip/Tooltip';
import './MainLayout.css';
import './StudioPages.css';
import voiceLKMark from '../../../assets/images/voicelk-mark.png';
import voiceLKMarkWhite from '../../../assets/images/voicelk-mark-white.png';
import voiceLKLogo from '../../../assets/images/voicelk-logo.png';
import voiceLKLogoWhite from '../../../assets/images/voicelk-logo-white.png';
import { api } from '../../../services/api';
import HomeView from '../../../pages/Home/Home';
import ProfileView from '../../../pages/Profile/Profile';
import ChatView from '../../../pages/Chat/Chat';
import HistoryView from '../../../pages/History/History';
import { mapHistoryItem } from '../../../utils/history';
import HelpView from '../../../pages/Help/Help';
import SettingsView from '../../../pages/Settings/Settings';

const LIGHT = {
  pageBg: '#f8f9fb',
  sidebarBg: '#ffffff',
  sidebarBorder: '#e5e7eb',
  logoMark: voiceLKMark,
  logoFull: voiceLKLogo,
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
  logoMark: voiceLKMarkWhite,
  logoFull: voiceLKLogoWhite,
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

const PAGE_TITLES = {
  new_chat: 'Chat',
  chat: 'Chat',
  history: 'History',
  profile: 'Profile',
  settings: 'Settings',
  help: 'Help',
};

function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img className="studio-avatar" src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
  ) : <span className="studio-avatar">{name.slice(0, 2).toUpperCase()}</span>;
}

export default function MainLayout({ isAuthenticated = true, userData, onLoginClick, onLogout, isDark, onToggleDark }) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const [expanded, setExpanded] = useState(() => !window.matchMedia('(max-width: 768px)').matches);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sidebarRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)');
    const handleResize = event => {
      setIsMobile(event.matches);
      setDrawerOpen(false);
      if (event.matches) setExpanded(false);
    };
    query.addEventListener('change', handleResize);
    return () => query.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile || !drawerOpen) return;
    const sidebar = sidebarRef.current;
    const menu = mobileMenuRef.current;
    sidebar?.querySelector('button')?.focus();
    const handleKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); setDrawerOpen(false); }
      if (event.key !== 'Tab') return;
      const buttons = [...sidebar.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    sidebar?.addEventListener('keydown', handleKey);
    return () => { sidebar?.removeEventListener('keydown', handleKey); menu?.focus(); };
  }, [isMobile, drawerOpen]);

  // Restore the last visited tab on refresh instead of always snapping back to home.
  const [activeNav, setActiveNav] = useState(() => {
    try {
      return sessionStorage.getItem('vlk_active_nav') || 'new_chat';
    } catch (_) {
      return 'new_chat';
    }
  });
  const [chatInitialMessage, setChatInitialMessage] = useState('');
  const [chatInitialModel, setChatInitialModel] = useState('');
  const [chatInitialHistoryItem, setChatInitialHistoryItem] = useState(null);

  // Cached backend responses, kept here (above the tab-driven unmount/remount
  // of History) so switching tabs doesn't re-trigger the same fetch.
  const [historyCache, setHistoryCache] = useState(null);
  // Questions asked in Chat this session, shown at the top of History straight
  // away (marked pending while the backend is still answering).
  const [recentHistory, setRecentHistory] = useState([]);

  useEffect(() => {
    setRecentHistory([]);
    setHistoryCache(null);
  }, [userData?.userId]);

  const handleHistoryPending = useCallback((tempId, text) => {
    setRecentHistory(prev => [{
      id: tempId,
      content: text,
      responseText: '',
      timestamp: new Date().toISOString(),
      statusTag: 'Sending…',
      pending: true,
    }, ...prev]);
  }, []);

  const handleHistoryResolved = useCallback((tempId, data) => {
    if (!data?.queryId) {
      setRecentHistory(prev => prev.filter(i => i.id !== tempId));
      return;
    }
    const item = mapHistoryItem(data);
    setRecentHistory(prev => prev.map(i => (i.id === tempId ? item : i)));
    setHistoryCache(prev => (prev
      ? { ...prev, items: [item, ...prev.items.filter(i => i.id !== item.id)] }
      : prev));
  }, []);
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

  // Browser tab title, e.g. "VoiceLK | Chat"; a new chat and an open one are both Chat.
  useEffect(() => {
    const page = PAGE_TITLES[activeNav] || 'Chat';
    document.title = `VoiceLK | ${page}`;
  }, [activeNav]);

  // Redirect away from profile if logged out
  useEffect(() => {
    if (!isAuthenticated && activeNav === 'profile') {
      setActiveNav('new_chat');
    }
  }, [isAuthenticated, activeNav]);

  const handleHomeSubmit = (message, model) => {
    setChatInitialMessage(message);
    setChatInitialModel(model || '');
    setChatInitialHistoryItem(null);
    setActiveNav('chat');
  };

  const handleNewChat = () => {
    setChatInitialModel('');
    setChatInitialMessage('');
    setChatInitialHistoryItem(null);
    setActiveNav('new_chat');
  };

  const handleSelectHistoryItem = (item) => {
    setChatInitialModel('');
    setChatInitialMessage('');
    setChatInitialHistoryItem(item);
    setActiveNav('chat');
  };

  const t = isDark ? DARK : LIGHT;

  const accountName = isAuthenticated ? (displayName || userData?.email?.split('@')[0] || 'Your account') : 'Sign in';
  const sidebarItems = [...NAV_TOP, ...NAV_BOTTOM];
  const savedChats = [...recentHistory, ...(historyCache?.items || [])]
    .filter((item, index, items) => !item.pending && items.findIndex(other => other.id === item.id) === index)
    .slice(0, 3);
  const navigate = (id) => {
    if (id === 'profile' && !isAuthenticated) onLoginClick();
    else setActiveNav(id);
    setDrawerOpen(false);
  };
  const newChat = () => { handleNewChat(); setDrawerOpen(false); };

  const sidebar = (
    <>
      <Tooltip label="New chat" enabled={!expanded && !drawerOpen} block isDark={isDark}>
        <button className="studio-new-chat" aria-label="New chat" onClick={newChat}><Sparkles size={16} /><span>New chat</span></button>
      </Tooltip>
      <p className="studio-section-label">Explore</p>
      <nav aria-label="Main navigation" className="studio-nav">
        <Tooltip label="Voice studio" enabled={!expanded && !drawerOpen} block isDark={isDark}>
          <button className={`studio-nav-item ${activeNav === 'new_chat' || activeNav === 'chat' ? 'is-active' : ''}`}
            aria-label="Voice studio" aria-current={activeNav === 'new_chat' || activeNav === 'chat' ? 'page' : undefined} onClick={newChat}>
            <AudioLines size={18} /><span>Voice studio</span>
          </button>
        </Tooltip>
        {sidebarItems.map(({ id, label, Icon }) => (
          <Tooltip key={id} label={label} enabled={!expanded && !drawerOpen} block isDark={isDark}>
            <button className={`studio-nav-item ${activeNav === id ? 'is-active' : ''}`}
              aria-label={label} aria-current={activeNav === id ? 'page' : undefined} onClick={() => navigate(id)}>
              <Icon size={18} /><span>{label}</span>
            </button>
          </Tooltip>
        ))}
      </nav>
      <div className="studio-sidebar-details" inert={!isMobile && !expanded} aria-hidden={!isMobile && !expanded}>
      <div className="studio-recents">
        <p className="studio-section-label">Recent chats</p>
        {savedChats.length ? savedChats.map(item => (
          <button className="studio-recent" key={item.id} title={item.content}
            onClick={() => { handleSelectHistoryItem(item); setDrawerOpen(false); }}>
            <MessageSquare size={16} /><span>{item.content}</span>
          </button>
        )) : <p className="studio-empty-history">Your conversations will appear here. Start with a little curiosity.</p>}
      </div>
      <div className="studio-account-card">
        {isAuthenticated && (
          <button className="studio-account-summary" onClick={() => navigate('profile')}>
            <Avatar key={displayAvatar} src={displayAvatar} name={accountName} />
            <span><strong>{accountName}</strong><small>Your personal workspace</small></span>
          </button>
        )}
        <button className="studio-account-action" onClick={isAuthenticated ? onLogout : onLoginClick}>
          {isAuthenticated ? <LogOut size={15} /> : <LogIn size={15} />}
          <span>{isAuthenticated ? 'Sign out' : 'Sign in'}</span>
        </button>
      </div>
      </div>
    </>
  );

  return (
    <div className={`voice-studio ${isDark ? 'studio-dark' : ''}`}>
      <header className="studio-header">
        <div className={`studio-header-sidebar${!isMobile && !expanded ? ' is-collapsed' : ''}`}>
        <button className="studio-brand" onClick={newChat} aria-label="VoiceLK home"
          inert={!isMobile && !expanded} aria-hidden={!isMobile && !expanded}>
          <img src={isDark ? voiceLKLogoWhite : voiceLKLogo} alt="VoiceLK" />
        </button>
        <Tooltip label={expanded ? 'Collapse sidebar' : 'Expand sidebar'} pos="bottom-end" isDark={isDark} className="studio-desktop-toggle">
          <button className="studio-header-icon studio-header-sidebar-toggle"
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'} aria-expanded={expanded}
            aria-controls="studio-sidebar" onClick={() => setExpanded(open => !open)}>
            {expanded ? <PanelLeftClose size={20} /> : (
              <>
                <img className="studio-collapsed-mark" src={isDark ? voiceLKMarkWhite : voiceLKMark} alt="" aria-hidden="true" />
                <PanelLeftOpen className="studio-expand-icon" size={20} aria-hidden="true" />
              </>
            )}
          </button>
        </Tooltip>
        <Tooltip label={drawerOpen ? 'Close navigation' : 'Open navigation'} pos="bottom-end" isDark={isDark} className="studio-mobile-menu">
          <button ref={mobileMenuRef} className="studio-header-icon" aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={drawerOpen} aria-controls="studio-sidebar" onClick={() => setDrawerOpen(open => !open)}>
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </Tooltip>
        </div>
        <div className="studio-header-actions">
          <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} pos="bottom-end" isDark={isDark}>
            <button type="button" className="studio-header-icon" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={onToggleDark}>
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </Tooltip>
          <Tooltip label={isAuthenticated ? 'Your profile' : 'Sign in'} pos="bottom-end" isDark={isDark}>
          <button className="studio-header-account" onClick={() => navigate('profile')}>
            <span>{accountName}</span>
            {isAuthenticated ? (
              <Avatar key={displayAvatar} src={displayAvatar} name={accountName} />
            ) : (
              <span className="studio-avatar" aria-hidden="true"><LogIn size={15} /></span>
            )}
          </button>
          </Tooltip>
        </div>
      </header>
      <div className="studio-body">
        <aside ref={sidebarRef} id="studio-sidebar" aria-label="Sidebar" inert={isMobile && !drawerOpen}
          aria-hidden={isMobile && !drawerOpen}
          className={`studio-sidebar ${!isMobile && !expanded ? 'is-collapsed' : ''} ${drawerOpen ? 'is-open' : ''}`}>
          {isMobile && (
            <div className="studio-sidebar-top">
              <span className="studio-sidebar-caption">Workspace</span>
              <Tooltip label="Close navigation" isDark={isDark}>
                <button className="studio-collapse-toggle" aria-label="Close navigation"
                  aria-expanded={drawerOpen} aria-controls="studio-sidebar" onClick={() => setDrawerOpen(false)}>
                  <X size={19} />
                </button>
              </Tooltip>
            </div>
          )}
          {sidebar}
        </aside>
        <button className={`studio-backdrop${drawerOpen ? ' is-visible' : ''}`} aria-label="Close navigation"
          aria-hidden={!isMobile || !drawerOpen} tabIndex={-1} onClick={() => setDrawerOpen(false)} />
        <main className="studio-main" inert={isMobile && drawerOpen} aria-label={PAGE_TITLES[activeNav] || 'Voice studio'}>
          {activeNav === 'profile' ? (
            <ProfileView isDark={isDark} onToggleDark={onToggleDark} onLogout={onLogout} userData={userData} />
          ) : activeNav === 'history' ? (
            <HistoryView isDark={isDark} userData={userData} onSelectHistoryItem={handleSelectHistoryItem}
              cache={historyCache} onCacheUpdate={setHistoryCache} recentItems={recentHistory}
              onRecentRemove={(id) => setRecentHistory(prev => prev.filter(i => i.id !== id))} />
          ) : activeNav === 'settings' ? (
            <SettingsView isDark={isDark} onToggleDark={onToggleDark} userData={userData} t={t} />
          ) : activeNav === 'help' ? (
            <HelpView isDark={isDark} />
          ) : activeNav === 'chat' ? (
            <ChatView key={chatInitialHistoryItem?.id || 'new-chat'} t={t} isDark={isDark} initialMessage={chatInitialMessage} initialModel={chatInitialModel} onLoginClick={onLoginClick} initialHistoryItem={chatInitialHistoryItem} userData={userData}
              onHistoryPending={handleHistoryPending} onHistoryResolved={handleHistoryResolved} />
          ) : (
            <HomeView displayName={displayName} onSubmit={handleHomeSubmit} userData={userData} isDark={isDark} onLoginClick={onLoginClick} />
          )}
        </main>
      </div>
    </div>
  );
}
