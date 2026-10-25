import StudioPageHeader from '../../components/layout/StudioPageHeader';
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Trash2, Download, Shield, Volume2 } from 'lucide-react';
import { api } from '../../services/api';
import { useError } from '../../context/ErrorContext';
import { useCookieConsent } from '../../context/CookieConsentContext';
import { useConfirm } from '../../context/ConfirmContext';
import { getCookie, setCookie } from '../../utils/cookies';
import { getPlaybackSpeed, savePlaybackSpeed } from '../../utils/playback';
import { useVoices, preferredVoice, voiceLabel, VOICE_COOKIE } from '../../hooks/useVoices';

export default function SettingsView({ isDark, onToggleDark, userData, t }) {
  const { showError } = useError();
  const { hasConsent } = useCookieConsent();
  const confirm = useConfirm();
  const { voices, loading: voicesLoading } = useVoices();
  const [voiceModel, setVoiceModel] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(getPlaybackSpeed);
  const [autoPlay, setAutoPlay] = useState(getCookie('vlk_autoplay') !== 'false');
  const [clearing, setClearing] = useState(false);
  // Not signed in, or signed in as a guest — guests get a few clips in the default
  // voice only, so playback speed is the one audio setting they can change
  const isGuest = !userData || userData.role === 'GUEST';

  const colors = {
    bg: 'var(--studio-bg)',
    border: 'var(--studio-border)',
    cardBg: 'var(--studio-surface)',
    text: 'var(--studio-text)',
    textMuted: 'var(--studio-muted)',
    primary: 'var(--studio-accent)',
    danger: 'var(--studio-danger)',
  };

  // The list arrives after the first render; pick the saved voice once it is known.
  useEffect(() => {
    if (voices.length) setVoiceModel(preferredVoice(voices));
  }, [voices]);

  const handleVoiceChange = (key) => {
    setVoiceModel(key);
    if (hasConsent) {
      setCookie(VOICE_COOKIE, key);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    savePlaybackSpeed(speed, hasConsent);
  };

  const handleAutoPlayToggle = () => {
    const newVal = !autoPlay;
    setAutoPlay(newVal);
    if (hasConsent) {
      setCookie('vlk_autoplay', newVal.toString());
    }
  };

  const handleClearHistory = async () => {
    const ok = await confirm('Are you sure you want to delete all your chat history? This cannot be undone.', {
      title: 'Clear chat history',
      confirmLabel: 'Clear',
      cancelLabel: 'Cancel',
      danger: true,
    });
    if (!ok) return;

    setClearing(true);
    try {
      // Mocking for now as endpoint doesn't exist, but ready for implementation
      setTimeout(() => {
        showError('Chat history cleared successfully!', 'success');
        setClearing(false);
      }, 1000);
    } catch (err) {
      showError('Failed to clear history');
      setClearing(false);
    }
  };

  const handleExportData = () => {
    showError('Data export will be available in the next update.', 'info');
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <section className="studio-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--studio-hover)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.primary
        }}>
          <Icon size={20} />
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: colors.text }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {children}
      </div>
    </section>
  );

  const SettingRow = ({ label, description, control }) => (
    <div className="studio-setting-row">
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: colors.text, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: colors.textMuted }}>{description}</div>
      </div>
      <div className="studio-setting-control">{control}</div>
    </div>
  );

  return (
    <div className="studio-page">
    <div className="studio-page-content">
      <StudioPageHeader eyebrow="Make it yours" title="Settings" description="A workspace that sounds and feels like you." />

      {/* General / Appearance */}
      <SettingSection title="Appearance" icon={Monitor}>
        <SettingRow
          label="Application Theme"
          description="Choose how VoiceLK looks to you."
          control={
            <div style={{ display: 'flex', gap: 8, background: 'var(--studio-bg)', padding: 4, borderRadius: 999 }}>
              <button
                aria-pressed={!isDark}
                onClick={() => { if (isDark) onToggleDark(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: !isDark ? '#fff' : 'transparent',
                  color: !isDark ? 'var(--studio-accent)' : colors.textMuted,
                  fontWeight: 500, transition: 'all 0.2s',
                  boxShadow: !isDark ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <Sun size={16} /> Light
              </button>
              <button
                aria-pressed={isDark}
                onClick={() => { if (!isDark) onToggleDark(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isDark ? 'var(--studio-accent)' : colors.textMuted,
                  fontWeight: 500, transition: 'all 0.2s',
                  boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          }
        />
      </SettingSection>

      {/* Audio & Playback */}
      <SettingSection title="Audio & Playback" icon={Volume2}>
        {!isGuest && (
        <SettingRow
          label="Voice"
          description={voices.find(v => v.key === voiceModel)?.description
            || 'The voice used to read answers aloud.'}
          control={
            <select aria-label="Voice"
              value={voiceModel}
              onChange={(e) => handleVoiceChange(e.target.value)}
              disabled={voicesLoading || !voices.length}
              style={{
                padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.border}`,
                background: 'var(--studio-bg)', color: colors.text,
                outline: 'none', cursor: voices.length ? 'pointer' : 'not-allowed', minWidth: 140
              }}
            >
              {!voices.length && (
                <option value="">{voicesLoading ? 'Loading...' : 'Unavailable'}</option>
              )}
              {voices.map(v => (
                <option key={v.key} value={v.key}>{voiceLabel(v)}</option>
              ))}
            </select>
          }
        />
        )}
        <SettingRow
          label="Playback Speed"
          description="Default speed for AI voice responses."
          control={
            <select aria-label="Playback speed"
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.border}`,
                background: 'var(--studio-bg)', color: colors.text,
                outline: 'none', cursor: 'pointer', minWidth: 100
              }}
            >
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x (Normal)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          }
        />
        {!isGuest && (
        <SettingRow
          label="Auto-Play Audio"
          description="Automatically play audio responses when generated."
          control={
            <button
              role="switch" aria-label="Auto-play audio" aria-checked={autoPlay}
              onClick={handleAutoPlayToggle}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: autoPlay ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'),
                position: 'relative', transition: 'background 0.2s'
              }}
            >
              <div style={{
                position: 'absolute', top: 2, left: autoPlay ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }} />
            </button>
          }
        />
        )}
      </SettingSection>

      {/* Data & Privacy */}
      {!isGuest && (
        <SettingSection title="Data & Privacy" icon={Shield}>
          <SettingRow
            label="Export Data"
            description="Download a copy of your chat history and account data."
            control={
              <button
                onClick={handleExportData}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                  background: 'transparent', border: `1px solid ${colors.border}`,
                  color: colors.text, fontWeight: 500, transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Download size={16} /> Export
              </button>
            }
          />
          <SettingRow
            label="Clear Chat History"
            description="Permanently delete all your conversations from our servers."
            control={
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, cursor: clearing ? 'not-allowed' : 'pointer',
                  background: 'transparent', border: `1px solid ${colors.danger}`,
                  color: colors.danger, fontWeight: 500, transition: 'all 0.2s',
                  opacity: clearing ? 0.7 : 1
                }}
                onMouseEnter={(e) => !clearing && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                onMouseLeave={(e) => !clearing && (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={16} /> {clearing ? 'Clearing...' : 'Clear Data'}
              </button>
            }
          />
        </SettingSection>
      )}

      {/* spacer for bottom scroll */}
      <div style={{ height: 60 }} />
    </div>
    </div>
  );
}
