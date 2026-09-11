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
          margin: '12px 0 0 0', fontSize: 14, fontWeight: 500, color: theme.faqAnswer, lineHeight: 1.65,
        }}>
          {answer}
        </p>
      )}
    </div>
  );
}

function CategoryCard({ icon: Icon, iconBg, iconColor, title, description, theme, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: theme.cardBg,
        border: `1px solid ${isActive ? theme.faqQuestion : theme.cardBorder}`,
        borderRadius: 14,
        padding: '24px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: 12,
        cursor: 'pointer', transition: 'box-shadow 0.18s, transform 0.15s, border-color 0.18s',
        boxShadow: isActive ? '0 6px 24px rgba(0,0,0,0.2)' : 'none',
        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = isActive ? '0 6px 24px rgba(0,0,0,0.2)' : 'none';
        e.currentTarget.style.transform = isActive ? 'translateY(-2px)' : 'translateY(0)';
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
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: theme.cardDesc, lineHeight: 1.5 }}>{description}</p>
    </div>
  );
}

const CATEGORIES = {
  START: 'Getting Started',
  ICT: 'ICT Lessons Help',
  AUDIO: 'Audio & TTS Tips',
  ACCOUNT: 'Account Management',
};

const FAQS = [
  {
    category: CATEGORIES.START,
    question: 'What is VoiceLK and who is it for?',
    answer: 'VoiceLK is an AI study assistant built for O/Level ICT students in Sri Lanka. Ask a question in the chat, and VoiceLK answers in text and, where useful, as spoken Sinhala audio — great for revising on the go.',
  },
  {
    category: CATEGORIES.START,
    question: 'Do I need an account to use VoiceLK?',
    answer: "No — you can try VoiceLK as a Guest straight away. Guest sessions can chat and browse Help, but don't get saved chat history, profile settings, or the ability to rate answers. Sign up to unlock those.",
  },
  {
    category: CATEGORIES.START,
    question: 'How do I start a new conversation?',
    answer: "Click 'New Chat' at the top of the sidebar at any time. Your previous conversation stays safely in History (for signed-in accounts) so you can pick it up again later.",
  },
  {
    category: CATEGORIES.ICT,
    question: 'What ICT topics can VoiceLK help with?',
    answer: 'VoiceLK is tuned for the O/Level ICT syllabus — covering topics like computer fundamentals, number systems, databases, networking, programming logic, and more. Ask in plain English or Sinhala.',
  },
  {
    category: CATEGORIES.ICT,
    question: 'The answer seems wrong or unclear — what should I do?',
    answer: "Rate the audio response using the star widget beneath it and add a comment. Your feedback is reviewed and helps us improve future answers. (Feedback is available to signed-in accounts only.)",
  },
  {
    category: CATEGORIES.AUDIO,
    question: 'How do I generate Sinhala audio for a response?',
    answer: "Click the speaker icon next to any of VoiceLK's chat responses to play back the Sinhala narration. Make sure your device's volume is turned up and the tab isn't muted.",
  },
  {
    category: CATEGORIES.AUDIO,
    question: 'Can I change the audio playback speed?',
    answer: "Yes. Go to Settings > Audio & Playback and choose a speed from 0.75x to 1.5x. If you've accepted cookies, this speed is remembered automatically for your next visit.",
  },
  {
    category: CATEGORIES.AUDIO,
    question: 'What does "Auto-Play Audio" do?',
    answer: "When enabled in Settings > Audio & Playback, VoiceLK automatically plays the Sinhala audio as soon as a response is generated, so you don't have to click play each time.",
  },
  {
    category: CATEGORIES.ACCOUNT,
    question: 'How do I switch between light and dark mode?',
    answer: "Toggle it from Settings > Appearance, or from the switch on your Profile page. Your choice is saved as a cookie (once accepted) so VoiceLK opens in the same theme next time.",
  },
  {
    category: CATEGORIES.ACCOUNT,
    question: 'How do I change my preferred language?',
    answer: 'Open Profile > Preferences and choose English or Sinhala from the Primary Language dropdown. This affects how VoiceLK\'s interface and responses are presented to you.',
  },
  {
    category: CATEGORIES.ACCOUNT,
    question: 'Why does VoiceLK ask about cookies?',
    answer: "We use cookies only to remember your theme, language, playback speed, and auto-play preferences between visits. We ask first, and nothing is stored until you accept — you can decline and VoiceLK still works normally for that session.",
  },
  {
    category: CATEGORIES.ACCOUNT,
    question: 'Can I delete my chat history?',
    answer: "Yes, signed-in users can clear all chat history from Settings > Data & Privacy > Clear Chat History. This action is permanent and cannot be undone.",
  },
];

export default function HelpView({ isDark }) {
  const [searchVal, setSearchVal] = useState('');
  const [messageVal, setMessageVal] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

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
    { icon: Rocket,        iconBg: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff', iconColor: isDark ? '#60a5fa' : '#3b82f6', title: CATEGORIES.START,   description: 'Basics of using VoiceLK' },
    { icon: GraduationCap, iconBg: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4', iconColor: isDark ? '#34d399' : '#10b981', title: CATEGORIES.ICT,     description: 'Guidance for O/Level syllabus' },
    { icon: AudioLines,    iconBg: isDark ? 'rgba(5,150,105,0.18)' : '#ecfdf5', iconColor: isDark ? '#34d399' : '#059669', title: CATEGORIES.AUDIO,   description: 'Troubleshoot speech & playback' },
    { icon: UserCog,       iconBg: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', iconColor: isDark ? '#94a3b8' : '#6b7280', title: CATEGORIES.ACCOUNT, description: 'Profile, theme & privacy' },
  ];

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = !activeCategory || faq.category === activeCategory;
    const q = searchVal.trim().toLowerCase();
    const matchesSearch = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

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
                fontSize: 14, fontWeight: 500, color: theme.inputText, fontFamily: 'inherit',
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
            <CategoryCard
              key={i}
              {...cat}
              theme={theme}
              isActive={activeCategory === cat.title}
              onClick={() => setActiveCategory(prev => prev === cat.title ? null : cat.title)}
            />
          ))}
        </div>

        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: theme.heading, margin: 0, letterSpacing: '-0.3px' }}>
              {activeCategory ? activeCategory : 'Popular FAQs'}
            </h2>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: theme.subText,
                  fontFamily: 'inherit', padding: 0,
                }}
              >
                Clear filter
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => (
                <FaqItem key={i} question={faq.question} answer={faq.answer} theme={theme} />
              ))
            ) : (
              <p style={{ fontSize: 14, fontWeight: 500, color: theme.subText, textAlign: 'center', padding: '20px 0' }}>
                No matching questions found. Try a different search term or category.
              </p>
            )}
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
          <p style={{ fontSize: 14, fontWeight: 500, color: theme.supportDesc, lineHeight: 1.65, margin: '0 0 24px 0', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
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
                fontSize: 14, fontWeight: 500, color: theme.inputText,
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
