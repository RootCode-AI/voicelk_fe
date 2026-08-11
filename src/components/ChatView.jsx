import { useState, useRef, useEffect } from 'react';
import { Play, Download, MoreVertical, PlusCircle, Send, Bot, Loader2 } from 'lucide-react';
import { api, friendlyMessage } from '../utils/api';

function renderRichText(text) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function AudioPlayer({ duration, t }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      background: '#ffffff', borderRadius: 9999, padding: '8px 16px',
      border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginTop: 16, maxWidth: 400
    }}>
      <button style={{
        width: 36, height: 36, borderRadius: '50%', background: '#3b82f6',
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0
      }}>
        <Play size={18} color="#ffffff" fill="#ffffff" style={{ marginLeft: 3 }} />
      </button>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', background: '#3b82f6', borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
          <span>0:14</span>
          <span>{duration}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4 }}>
          <Download size={18} strokeWidth={2} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4 }}>
          <MoreVertical size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function ThinkingBubble({ isDark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      color: isDark ? '#94a3b8' : '#6b7280',
      fontSize: 14, fontStyle: 'italic',
    }}>
      <Loader2 size={16} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} />
      <span>Thinking...</span>
    </div>
  );
}

export default function ChatView({ t, isDark, initialMessage = '', userData }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const initialSentRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToBackend = async (text) => {
    // Add a "thinking" placeholder
    const thinkingId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: thinkingId,
      type: 'ai',
      content: '',
      isThinking: true,
    }]);

    try {
      console.log('[ChatView] Sending to /api/ask:', { inputText: text, syllabusTopic: '', userId: userData?.userId || '' });
      const data = await api.post('/api/ask', {
        inputText: text,
        syllabusTopic: '',
        userId: userData?.userId || '',
      });
      console.log('[ChatView] Response:', data);

      // Replace thinking bubble with real response
      setMessages(prev => prev.map(msg =>
        msg.id === thinkingId
          ? { ...msg, content: data.responseText || 'No response received.', isThinking: false }
          : msg
      ));
    } catch (err) {
      console.error('[ChatView] Error:', err);
      // Replace thinking bubble with error message
      setMessages(prev => prev.map(msg =>
        msg.id === thinkingId
          ? { ...msg, content: `⚠️ ${friendlyMessage(err)}`, isThinking: false, isError: true }
          : msg
      ));
    }
  };

  useEffect(() => {
    if (initialMessage && !initialSentRef.current) {
      initialSentRef.current = true;
      const userMsg = { id: Date.now(), type: 'user', content: initialMessage };
      setMessages([userMsg]);
      sendToBackend(initialMessage);
    }
  }, [initialMessage]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending) return;
    
    const text = inputVal.trim();
    const newUserMsg = { id: Date.now(), type: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputVal('');
    setIsSending(true);

    await sendToBackend(text);
    setIsSending(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ maxWidth: 800, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', 
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}>
              {msg.type === 'ai' && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginRight: 12, marginTop: 4
                }}>
                  <Bot size={18} color="#ffffff" />
                </div>
              )}
              
              <div style={{
                maxWidth: '90%',
                background: msg.type === 'user' ? (isDark ? '#1e293b' : '#f3f4f6') : 'transparent',
                color: msg.isError
                  ? (isDark ? '#fca5a5' : '#dc2626')
                  : msg.type === 'user'
                    ? (isDark ? '#f8fafc' : '#111827')
                    : (isDark ? '#f1f5f9' : '#1f2937'),
                padding: msg.type === 'user' ? '10px 16px' : '0',
                borderRadius: msg.type === 'user' ? 20 : 0,
                fontSize: 14.5,
                lineHeight: 1.6,
                fontWeight: msg.type === 'user' ? 500 : 400
              }}>
                {msg.isThinking ? (
                  <ThinkingBubble isDark={isDark} />
                ) : (
                  renderRichText(msg.content)
                )}
                
                {msg.hasAudio && (
                  <AudioPlayer duration={msg.audioDuration} t={t} />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px',
        background: `linear-gradient(to bottom, transparent, ${t.pageBg} 20%)`,
        display: 'flex', justifyContent: 'center'
      }}>
        <form
          onSubmit={handleSend}
          style={{
            width: '100%', maxWidth: 760,
            display: 'flex', alignItems: 'center', gap: 12,
            background: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
            borderRadius: 9999,
            padding: '10px 12px 10px 16px',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <button
            type="button"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center'
            }}
          >
            <PlusCircle size={22} strokeWidth={2} />
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type a topic or paste text to generate Sinhala audio..."
            disabled={isSending}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 15, color: isDark ? '#f8fafc' : '#111827', fontFamily: 'inherit',
              opacity: isSending ? 0.6 : 1,
            }}
          />

          <button
            type="submit"
            disabled={isSending || !inputVal.trim()}
            style={{
              background: 'none', border: 'none',
              cursor: (inputVal.trim() && !isSending) ? 'pointer' : 'default',
              color: (inputVal.trim() && !isSending) ? '#3b82f6' : '#9ca3af', padding: 0,
              display: 'flex', alignItems: 'center',
              transition: 'color 0.2s, transform 0.1s',
              transform: (inputVal.trim() && !isSending) ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </form>
      </div>

    </div>
  );
}
