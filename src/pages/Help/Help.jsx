import { useState } from 'react';
import {
  Search, Rocket, GraduationCap, AudioLines, UserCog,
  ChevronDown, ChevronUp, SendHorizonal
} from 'lucide-react';

function FaqItem({ question, answer, theme }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      onClick={() => setOpen(prev => !prev)}
      style={{
        background: theme.faqItemBg,
        border: `1px solid ${theme.faqItemBorder}`,
        borderRadius: 12,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.18s',
        userSelect: 'none',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: theme.faqQuestion }}>
          {question}
        </p>
        {open
          ? <ChevronUp size={18} color={theme.faqChevron} strokeWidth={2} style={{ flexShrink: 0 }} />
          : <ChevronDown size={18} color={theme.faqChevron} strokeWidth={2} style={{ flexShrink: 0 }} />
        }
      </div>

      {open && (
        <p style={{
          margin: '12px 0 0 0', fontSize: 14, color: theme.faqAnswer, lineHeight: 1.65,
        }}>
          {answer}
        </p>
      )}
    </div>
  );
}

function CategoryCard({ icon: Icon, iconBg, iconColor, title, description, theme }) {
  return (
    <div style={{
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: 14,
      padding: '24px 16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: 12,
      cursor: 'pointer', transition: 'box-shadow 0.18s, transform 0.15s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={24} color={iconColor} strokeWidth={1.8} />
      </div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.cardTitle }}>{title}</p>
      <p style={{ margin: 0, fontSize: 13, color: theme.cardDesc, lineHeight: 1.5 }}>{description}</p>
    </div>
  );
}

const FAQS = [
  {
    question: 'How do I generate Sinhala audio?',
    answer: "To generate Sinhala audio, simply click the 'Speaker' icon next to any of VoiceLK's responses in the chat interface. Ensure your device's volume is turned up.",
  },
  {
    question: 'Is VoiceLK free for O/Level students?',
    answer: 'VoiceLK offers a generous free tier specifically designed to cover the core O/Level ICT syllabus. Premium features like unlimited chats and advanced analytics require a Pro subscription.',
  },
  {
    question: 'Can I export my chat history?',
    answer: "Yes, you can export your chat history by going to Settings > Data & Privacy, and clicking the 'Export Data' button. It will be downloaded as a PDF or text file.",
  },
];

export default function HelpView({ isDark }) {
  const [searchVal, setSearchVal] = useState('');
  const [messageVal, setMessageVal] = useState('');

  const theme = {
    bg: isDark ? '#060f1e' : '#f0f4fa',
    heading: isDark ? '#f8fafc' : '#111827',
    subText: isDark ? '#94a3b8' : '#6b7280',
    cardBg: isDark ? 'rgba(12,24,48,0.9)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    cardTitle: isDark ? '#f1f5f9' : '#111827',
    cardDesc: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    inputBorder: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    inputText: isDark ? '#f8fafc' : '#111827',
    faqItemBg: isDark ? 'rgba(12,24,48,0.9)' : '#ffffff',
    faqItemBorder: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    faqQuestion: isDark ? '#f1f5f9' : '#111827',
    faqAnswer: isDark ? '#cbd5e1' : '#4b5563',
    faqChevron: isDark ? '#94a3b8' : '#6b7280',
    supportCardBg: isDark ? 'rgba(12,24,48,0.6)' : '#f9fafb',
    supportCardBorder: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    supportTitle: isDark ? '#f8fafc' : '#111827',
    supportDesc: isDark ? '#94a3b8' : '#6b7280',
  };

  const categories = [
    { icon: Rocket,        iconBg: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff', iconColor: isDark ? '#60a5fa' : '#3b82f6', title: 'Getting Started',      description: 'Basics of using VoiceLK' },
    { icon: GraduationCap, iconBg: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4', iconColor: isDark ? '#34d399' : '#10b981', title: 'ICT Lessons Help',  description: 'Guidance for O/Level syllabus' },
    { icon: AudioLines,    iconBg: '#ecfdf5', iconColor: '#059669', title: 'Audio & TTS Tips',     description: 'Troubleshoot speech features' },
    { icon: UserCog,       iconBg: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', iconColor: isDark ? '#94a3b8' : '#6b7280', title: 'Account Management',  description: 'Billing, profiles & security' },
  ];

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      background: theme.bg,
      height: '100%',
      fontFamily: "'Quicksand', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 60px' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: theme.heading, margin: '0 0 24px 0', letterSpacing: '-0.5px' }}>
            How can we help you?
          </h1>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: theme.inputBg,
            border: `1.5px solid ${theme.inputBorder}`,
            borderRadius: 9999,
            padding: '10px 20px',
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.05)',
            maxWidth: 520, margin: '0 auto',
          }}>
            <Search size={17} color={theme.subText} strokeWidth={2} style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search help articles, tutorials, and FAQs..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, color: theme.inputText, fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 14,
          marginBottom: 40,
        }}>
          {categories.map((cat, i) => (
            <CategoryCard key={i} {...cat} theme={theme} />
          ))}
        </div>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: theme.heading, margin: '0 0 16px 0', letterSpacing: '-0.3px' }}>
            Popular FAQs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <FaqItem key={i} question={faq.question} answer={faq.answer} theme={theme} />
            ))}
          </div>
        </section>

        <div style={{
          background: theme.supportCardBg,
          border: `1px solid ${theme.supportCardBorder}`,
          borderRadius: 20,
          padding: '28px 20px',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: theme.supportTitle, margin: '0 0 10px 0' }}>
            Still need help?
          </h3>
          <p style={{ fontSize: 14, color: theme.supportDesc, lineHeight: 1.65, margin: '0 0 24px 0', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            Can't find the answer you're looking for? Our support team and community are here to help you succeed.
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
            maxWidth: 480, margin: '0 auto', justifyContent: 'center',
          }}>
            <input
              type="text"
              value={messageVal}
              onChange={e => setMessageVal(e.target.value)}
              placeholder="Type your message here..."
              style={{
                flex: 1, background: theme.inputBg,
                border: `1.5px solid ${theme.inputBorder}`,
                borderRadius: 9999,
                padding: '11px 18px',
                fontSize: 14, color: theme.inputText,
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: '#1d4ed8', color: '#ffffff',
              border: 'none', borderRadius: 9999,
              padding: '11px 20px',
              fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e40af'}
              onMouseLeave={e => e.currentTarget.style.background = '#1d4ed8'}
            >
              <SendHorizonal size={15} strokeWidth={2.2} />
              Send us a Message
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
