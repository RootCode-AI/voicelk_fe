import { useState, useRef } from 'react';
import { Paperclip, SendHorizonal } from 'lucide-react';

export default function HomeView({ t, isDark, onSubmit }) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    if (onSubmit) onSubmit(inputVal.trim());
    setInputVal('');
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 16px',
      textAlign: 'center',
      gap: 14,
    }}>
      <h1 style={{
        fontSize: 'clamp(20px, 4.5vw, 32px)',
        fontWeight: 800,
        color: t.headingColor,
        margin: 0,
        letterSpacing: '-0.5px',
        lineHeight: 1.25,
      }}>
        Hello, what can I help you with today?
      </h1>

      <p style={{
        fontSize: 'clamp(12.5px, 1.4vw, 14.5px)',
        color: t.subColor,
        margin: 0,
        fontWeight: 400,
      }}>
        VoiceLK සමඟ අද මොනවද ඉගෙන ගන්නේ?
      </p>

      <form
        onSubmit={handleSend}
        style={{
          width: '100%',
          maxWidth: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: t.cardBg,
          border: `1px solid ${t.inputBorder}`,
          borderRadius: 9999,
          padding: '7px 8px 7px 14px',
          boxShadow: t.inputShadow,
          marginTop: 4,
          backdropFilter: isDark ? 'blur(12px)' : 'none',
        }}
      >
        <button
          type="button"
          onClick={() => {}}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: t.inputIcon, lineHeight: 0, padding: 0, flexShrink: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = t.inputIconHover)}
          onMouseLeave={(e) => (e.currentTarget.style.color = t.inputIcon)}
          aria-label="Attach"
        >
          <Paperclip size={16} strokeWidth={1.8} />
        </button>

        <input
          ref={inputRef}
          id="voicelk-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type a topic or paste text to generate Sinhala audio..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 13, color: t.inputText, fontFamily: 'inherit',
            caretColor: isDark ? '#00d4ff' : '#1d4ed8',
          }}
        />

        <button
          type="submit"
          id="send-btn"
          style={{
            width: 30, height: 30, borderRadius: '50%', border: 'none',
            background: inputVal.trim() ? t.sendBg : t.sendBgDisabled,
            color: inputVal.trim() ? t.sendIcon : t.sendIconDisabled,
            cursor: inputVal.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.2s, transform 0.15s',
          }}
          onMouseEnter={(e) => { if (inputVal.trim()) e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          aria-label="Send"
        >
          <SendHorizonal size={14} strokeWidth={2.2} />
        </button>
      </form>
    </div>
  );
}
