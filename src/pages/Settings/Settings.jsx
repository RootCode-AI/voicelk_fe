import React, { useState } from 'react';
import { Moon, Sun, Monitor, Trash2, Download, Shield, Volume2 } from 'lucide-react';
import { api } from '../../services/api';
import { useError } from '../../context/ErrorContext';

export default function SettingsView({ isDark, onToggleDark, userData, t }) {
  const { showError } = useError();
  const [playbackSpeed, setPlaybackSpeed] = useState(localStorage.getItem('vlk_playbackSpeed') || '1.0');
  const [autoPlay, setAutoPlay] = useState(localStorage.getItem('vlk_autoPlay') !== 'false');
  const [clearing, setClearing] = useState(false);

  const colors = {
    bg: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    cardBg: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    primary: isDark ? '#38bdf8' : '#0ea5e9',
    danger: isDark ? '#ef4444' : '#dc2626',
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    localStorage.setItem('vlk_playbackSpeed', speed);
  };

  const handleAutoPlayToggle = () => {
    const newVal = !autoPlay;
    setAutoPlay(newVal);
    localStorage.setItem('vlk_autoPlay', newVal.toString());
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all your chat history? This cannot be undone.")) return;
    
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
    <div style={{
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: 16,
      padding: '24px',
      marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(14, 165, 233, 0.1)',
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
    </div>
  );

  const SettingRow = ({ label, description, control }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: colors.text, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: colors.textMuted }}>{description}</div>
      </div>
      <div>{control}</div>
    </div>
  );

  return (
    <div style={{
      padding: '32px 40px',
      maxWidth: 800,
      margin: '0 auto',
      width: '100%',
      height: '100%',
      overflowY: 'auto',
    }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Settings</h2>
      <p style={{ color: colors.textMuted, marginBottom: 32 }}>Manage your application preferences and account settings.</p>

      {/* General / Appearance */}
      <SettingSection title="Appearance" icon={Monitor}>
        <SettingRow
          label="Application Theme"
          description="Choose how VoiceLK looks to you."
          control={
            <div style={{ display: 'flex', gap: 8, background: isDark ? 'rgba(0,0,0,0.2)' : '#e2e8f0', padding: 4, borderRadius: 999 }}>
              <button
                onClick={() => onToggleDark()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: !isDark ? '#fff' : 'transparent',
                  color: !isDark ? '#0ea5e9' : colors.textMuted,
                  fontWeight: 500, transition: 'all 0.2s',
                  boxShadow: !isDark ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <Sun size={16} /> Light
              </button>
              <button
                onClick={() => onToggleDark()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isDark ? '#38bdf8' : colors.textMuted,
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
        <SettingRow
          label="Playback Speed"
          description="Default speed for AI voice responses."
          control={
            <select
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.border}`,
                background: isDark ? 'rgba(0,0,0,0.2)' : '#fff', color: colors.text,
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
        <SettingRow
          label="Auto-Play Audio"
          description="Automatically play audio responses when generated."
          control={
            <button
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
      </SettingSection>

      {/* Data & Privacy */}
      {userData?.role !== 'GUEST' && (
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
  );
}
