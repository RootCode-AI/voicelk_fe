import { useState, useRef } from 'react';
import { Send, Sparkles, Lightbulb, Languages, ArrowUpRight } from 'lucide-react';

import ModelSelector from '../../components/common/ModelSelector/ModelSelector';
import { useModelSelection } from '../../hooks/useModelSelection';

const PROMPTS = [
  { title: 'Turn curiosity into a conversation', text: 'Tell me about the most beautiful places to visit in Sri Lanka.' },
  { title: 'Give your words a voice', text: 'Write a short welcome message in Sinhala for my new podcast.' },
];

export default function HomeView({ displayName, onSubmit, userData, isDark, onLoginClick }) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);
  const selection = useModelSelection(userData);
  const handleSend = (event) => {
    event.preventDefault();
    if (!inputVal.trim()) return;
    onSubmit?.(inputVal.trim(), selection.model);
  };
  const usePrompt = (text) => {
    setInputVal(text);
    inputRef.current?.focus();
  };

  return (
    <div className="studio-home">
      <section className="studio-welcome" aria-labelledby="studio-greeting">
        <div className="studio-welcome-content">
        <h1 id="studio-greeting">Hi there{displayName ? ', ' : ''}<span>{displayName?.split(' ')[0]}</span><br />
          <span className="studio-gradient">What would you like to say?</span>
        </h1>
        <p className="studio-intro">Sinhala-English code-switched speech, powered by neural text-to-speech.</p>
        <div className="studio-prompts">
          {PROMPTS.map(prompt => (
            <button className="studio-prompt" key={prompt.title} onClick={() => usePrompt(prompt.text)}>
              <span className="studio-prompt-title">{prompt.title}</span>
              <span className="studio-prompt-text">{prompt.text}</span>
              <span className="studio-prompt-footer"><span className="studio-bulb"><Lightbulb size={16} /></span><ArrowUpRight size={16} /></span>
            </button>
          ))}
        </div>
        </div>
      </section>
      <div className="studio-compose-area">
        <form className="studio-composer" onSubmit={handleSend}>
          <div className="studio-input-row">
            <Sparkles size={16} aria-hidden="true" />
            <textarea ref={inputRef} id="voicelk-input" aria-label="Message to VoiceLK" rows={2}
              value={inputVal} onChange={event => setInputVal(event.target.value)}
              placeholder="Ask anything or paste your text. Let's bring it to life..."
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) handleSend(event);
              }} />
          </div>
          <div className="studio-composer-toolbar">
            <span className="studio-language"><Languages size={17} /><span>Sinhala audio</span></span>
            <div className="studio-composer-actions">
              <ModelSelector selection={selection} isDark={isDark} onSignIn={onLoginClick} />
              <button type="submit" id="send-btn" className="studio-send" disabled={!inputVal.trim()}><Send size={15} /><span>Send</span></button>
            </div>
          </div>
        </form>
        <p className="studio-composer-note">Made for your words. Powered by VoiceLK.</p>
      </div>
    </div>
  );
}
