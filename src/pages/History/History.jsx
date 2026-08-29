import { useState, useEffect } from 'react';
import { Bot, Clock, Loader2, Trash2 } from 'lucide-react';
import { api, friendlyMessage } from '../../services/api';
import { useError } from '../../context/ErrorContext';

function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function groupByDate(items) {
  const groups = {};
  items.forEach(item => {
    const label = formatRelativeDate(item.timestamp);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return Object.entries(groups).map(([dateLabel, items]) => ({ dateLabel, items }));
}

export default function HistoryView({ isDark, userData, onSelectHistoryItem, cache, onCacheUpdate }) {
  const isCacheFresh = cache?.userId === userData?.userId;
  const [historyItems, setHistoryItems] = useState(isCacheFresh ? cache.items : []);
  const [loading, setLoading] = useState(false);
  const { showError } = useError();

  useEffect(() => {
    if (!userData?.userId) return;

    if (cache?.userId === userData.userId) {
      setHistoryItems(cache.items);
      return;
    }

    setLoading(true);

    api.get(`/api/ask/history/${userData.userId}`)
      .then(data => {
        const mapped = Array.isArray(data)
          ? data.map(item => ({
            id: item.queryId,
            content: item.inputText,
            responseText: item.responseText || '',
            timestamp: item.timestamp,
            statusTag: item.source || 'AI',
            answerId: item.answerId || null,
            audioId: item.audioId || null,
            audioDuration: item.audioDuration || null,
          }))
          : [];
        setHistoryItems(mapped);
        onCacheUpdate?.({ userId: userData.userId, items: mapped });
      })
      .catch(err => {
        console.error('[HistoryView] Failed to load history:', err);
        showError(friendlyMessage(err), 'error');
      })
      .finally(() => setLoading(false));
  }, [userData?.userId]);

  const historyGroups = groupByDate(historyItems);

  const handleDelete = async (e, queryId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat history?')) return;

    try {
      await api.delete(`/api/queries/${queryId}`);
      const updated = historyItems.filter(item => item.id !== queryId);
      setHistoryItems(updated);
      if (userData?.userId) {
        onCacheUpdate?.({ userId: userData.userId, items: updated });
      }
    } catch (err) {
      console.error('[HistoryView] Failed to delete history:', err);
      showError(friendlyMessage(err), 'error');
    }
  };

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
    responseBg: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
    responseBorder: isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb',
    responseText: isDark ? '#94a3b8' : '#6b7280',
    itemBg: isDark ? 'rgba(12,24,48,0.9)' : '#ffffff',
    itemHoverBg: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: theme.bg, height: '100%', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ maxWidth: 780, width: '100%', margin: '0 auto', padding: '36px 24px 48px 24px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

        <h1 style={{ fontSize: 36, fontWeight: 800, color: theme.heading, margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
          History
        </h1>

        {!userData?.userId ? (
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 400, gap: 12, color: theme.emptyText,
          }}>
            <Clock size={44} strokeWidth={1.4} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>Please log in to see your history</p>
          </div>
        ) : loading ? (
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 400, gap: 12, color: theme.emptyText,
          }}>
            <Loader2 size={32} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite', opacity: 0.5 }} />
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Loading history...</p>
          </div>
        ) : historyGroups.length === 0 ? (
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
            {historyGroups.map((group, gi) => (
              <div key={gi}>
                <p style={{ fontSize: 13, fontWeight: 700, color: theme.dateLabel, margin: '24px 0 8px 0' }}>
                  {group.dateLabel}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {group.items.map((item, ii) => (
                    <div key={item.id ?? ii}>
                      <div 
                        onClick={() => onSelectHistoryItem && onSelectHistoryItem(item)}
                        style={{ 
                          display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16, 
                          padding: '18px 12px', margin: '0 -12px',
                          cursor: 'pointer', borderRadius: 12,
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = theme.itemHoverBg}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div 
                          style={{
                            minWidth: 40, height: 40, borderRadius: '50%',
                            background: theme.playBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: 2,
                          }}
                        >
                          <Bot size={18} strokeWidth={1.8} color={theme.playIcon} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                          <p style={{ fontSize: 15, color: theme.itemText, fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                            {item.content}
                          </p>

                          {item.responseText && (
                            <div style={{
                              fontSize: 13, color: theme.responseText, lineHeight: 1.5,
                              padding: '8px 12px', borderRadius: 10,
                              background: theme.responseBg,
                              border: `1px solid ${theme.responseBorder}`,
                              maxHeight: 60, overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {item.responseText.length > 120
                                ? item.responseText.substring(0, 120) + '...'
                                : item.responseText
                              }
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.metaText, fontWeight: 600 }}>
                            <Clock size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                            <span>{formatTime(item.timestamp)}</span>
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

                        <button 
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: theme.metaText, padding: '8px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s, color 0.15s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : '#fee2e2';
                            e.currentTarget.style.color = isDark ? '#f87171' : '#ef4444';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = theme.metaText;
                          }}
                          onClick={(e) => handleDelete(e, item.id)}
                          title="Delete history"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>

                      </div>

                      {ii < group.items.length - 1 && (
                        <div style={{ height: 1, background: theme.divider, width: '100%', margin: '4px 0' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
