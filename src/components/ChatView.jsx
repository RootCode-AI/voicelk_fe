import { useState, useRef, useEffect } from 'react';
import { Play, Download, MoreVertical, PlusCircle, Send, Bot } from 'lucide-react';

// A simple helper to parse markdown-like bold (**) and newlines
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
        {/* Progress track */}
        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', background: '#3b82f6', borderRadius: 2 }} />
        </div>
        {/* Timestamps */}
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

export default function ChatView({ t, isDark, initialMessage = '' }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);
  const initialSentRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send the initial message from HomeView on first mount
  useEffect(() => {
    if (initialMessage && !initialSentRef.current) {
      initialSentRef.current = true;
      const userMsg = { id: Date.now(), type: 'user', content: initialMessage };
      setMessages([userMsg]);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'ai',
          content: `ඔබ ලබාදුන් "${initialMessage}" යන මාතෘකාවට අදාල පිළිතුර මෙන්න...`,
          hasAudio: false
        }]);
      }, 1000);
    }
  }, [initialMessage]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    // Add user message
    const newUserMsg = { id: Date.now(), type: 'user', content: inputVal };
    setMessages(prev => [...prev, newUserMsg]);
    setInputVal('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: `ඔබ ලබාදුන් "${newUserMsg.content}" යන මාතෘකාවට අදාල පිළිතුර මෙන්න...`,
        hasAudio: false
      }]);
    }, 1000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Scrollable Messages Area */}
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
                color: msg.type === 'user' ? (isDark ? '#f8fafc' : '#111827') : (isDark ? '#f1f5f9' : '#1f2937'),
                padding: msg.type === 'user' ? '10px 16px' : '0',
                borderRadius: msg.type === 'user' ? 20 : 0,
                fontSize: 14.5,
                lineHeight: 1.6,
                fontWeight: msg.type === 'user' ? 500 : 400
              }}>
                {renderRichText(msg.content)}
                
                {msg.hasAudio && (
                  <AudioPlayer duration={msg.audioDuration} t={t} />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Pinned Bottom Input Bar */}
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
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 15, color: isDark ? '#f8fafc' : '#111827', fontFamily: 'inherit'
            }}
          />

          <button
            type="submit"
            style={{
              background: 'none', border: 'none', cursor: inputVal.trim() ? 'pointer' : 'default',
              color: inputVal.trim() ? '#3b82f6' : '#9ca3af', padding: 0,
              display: 'flex', alignItems: 'center',
              transition: 'color 0.2s, transform 0.1s',
              transform: inputVal.trim() ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </form>
      </div>

    </div>
  );
}
