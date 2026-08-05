import React, { useState } from 'react';
import { Play, Clock } from 'lucide-react';

export default function HistoryView({ isDark }) {
  const [historyGroups, setHistoryGroups] = useState([]);

  const theme = {
    bg: isDark ? '#060f1e' : '#ffffff',
    heading: isDark ? '#f1f5f9' : '#111827',
    emptyText: isDark ? '#64748b' : '#9ca3af',
    dateLabel: isDark ? '#94a3b8' : '#6b7280',
    itemText: isDark ? '#f1f5f9' : '#1f2937',
    metaText: isDark ? '#94a3b8' : '#6b7280',
    playBg: isDark ? '#1e293b' : '#e5e7eb',
    playBgHover: isDark ? '#334155' : '#d1d5db',
    playIcon: isDark ? '#94a3b8' : '#4b5563',
    badgeBg: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
    badgeText: isDark ? '#cbd5e1' : '#4b5563',
    divider: isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
    dot: isDark ? '#475569' : '#d1d5db',
    btnBg: isDark ? '#0f172a' : '#ffffff',
    btnBgHover: isDark ? '#1e293b' : '#f9fafb',
    btnBorder: isDark ? 'rgba(255,255,255,0.15)' : '#e5e7eb',
    btnText: isDark ? '#38bdf8' : '#2563eb',
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: theme.bg, height: '100%', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 780, width: '100%', margin: '0 auto', padding: '36px 24px 48px 24px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

        {/* Page Heading */}
        <h1 style={{ fontSize: 36, fontWeight: 800, color: theme.heading, margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
          History
        </h1>

        {historyGroups.length === 0 ? (
          /* ── Empty State — centered ── */
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 400, gap: 12, color: theme.emptyText,
          }}>
            <Clock size={44} strokeWidth={1.4} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>No history found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Grouped List */}
            {historyGroups.map((group, gi) => (
              <div key={gi}>
                {/* Date Label */}
                <p style={{ fontSize: 13, fontWeight: 700, color: theme.dateLabel, margin: '24px 0 8px 0' }}>
                  {group.dateLabel}
                </p>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {group.items.map((item, ii) => (
                    <div key={item.id ?? ii}>
                      {/* Row */}
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: '18px 0' }}>

                        {/* Play Button */}
                        <button style={{
                          minWidth: 40, height: 40, borderRadius: '50%',
                          background: theme.playBg, border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 2, transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = theme.playBgHover}
                          onMouseLeave={e => e.currentTarget.style.background = theme.playBg}
                        >
                          <Play size={14} strokeWidth={0} fill={theme.playIcon} style={{ marginLeft: 2 }} />
                        </button>

                        {/* Text + Metadata */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <p style={{ fontSize: 15, color: theme.itemText, fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                            {item.content}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.metaText, fontWeight: 600 }}>
                            <Clock size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span>{item.timestamp}</span>
                            <span style={{ color: theme.dot, fontWeight: 700, fontSize: 14 }}>·</span>
                            <span style={{
                              background: theme.badgeBg, color: theme.badgeText,
                              padding: '2px 10px', borderRadius: 9999,
                              fontSize: 11.5, fontWeight: 600,
                            }}>
                              {item.statusTag}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Divider between items */}
                      {ii < group.items.length - 1 && (
                        <div style={{ height: 1, background: theme.divider, width: '100%' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* "Load earlier interactions" — always visible */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 16 }}>
          <button
            style={{
              borderRadius: 9999, border: `1px solid ${theme.btnBorder}`,
              background: theme.btnBg, color: theme.btnText,
              fontWeight: 600, fontSize: 13.5,
              padding: '9px 24px', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = theme.btnBgHover}
            onMouseLeave={e => e.currentTarget.style.background = theme.btnBg}
          >
            Load earlier interactions
          </button>
        </div>

      </div>
    </div>
  );
}
