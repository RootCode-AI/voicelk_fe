import React, { useState } from 'react';
import { Play, Clock } from 'lucide-react';

export default function HistoryView() {
  const [historyGroups, setHistoryGroups] = useState([]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#ffffff', height: '100%', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: '40px 48px 32px 40px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

        {/* Page Heading */}
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
          History
        </h1>

        {historyGroups.length === 0 ? (
          /* ── Empty State — centered ── */
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 400, gap: 12, color: '#9ca3af',
          }}>
            <Clock size={44} strokeWidth={1.4} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>No history found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Grouped List */}
            {historyGroups.map((group, gi) => (
              <div key={gi}>
                {/* Date Label */}
                <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', margin: '24px 0 8px 0' }}>
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
                          background: '#e5e7eb', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 2, transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#d1d5db'}
                          onMouseLeave={e => e.currentTarget.style.background = '#e5e7eb'}
                        >
                          <Play size={14} strokeWidth={0} fill="#4b5563" style={{ marginLeft: 2 }} />
                        </button>

                        {/* Text + Metadata */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <p style={{ fontSize: 15, color: '#1f2937', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                            {item.content}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                            <Clock size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span>{item.timestamp}</span>
                            <span style={{ color: '#d1d5db', fontWeight: 700, fontSize: 14 }}>·</span>
                            <span style={{
                              background: '#f3f4f6', color: '#4b5563',
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
                        <div style={{ height: 1, background: '#f3f4f6', width: '100%' }} />
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
              borderRadius: 9999, border: '1px solid #e5e7eb',
              background: '#ffffff', color: '#2563eb',
              fontWeight: 600, fontSize: 13.5,
              padding: '9px 24px', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            Load earlier interactions
          </button>
        </div>

      </div>
    </div>
  );
}
