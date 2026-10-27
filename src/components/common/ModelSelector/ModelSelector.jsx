import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Ban, Clock, Cpu, ChevronDown, Check, LockKeyhole, Loader2, LogIn, RefreshCw } from 'lucide-react';
import { canSelectModel, isAvailable, VOICE_STATUS } from '../../../utils/modelSelection';
import './ModelSelector.css';

export default function ModelSelector({ selection, isDark, disabled = false, onSignIn }) {
  const { voices, loading, error, retry, isGuest, model, selectModel } = selection;
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 12, top: 12 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const id = useId();
  const visible = open && !disabled;
  const selected = voices.find(voice => voice.key === model);
  const selectedName = selected?.name || selected?.key || 'Default model';

  useLayoutEffect(() => {
    if (!visible) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    const top = trigger.top >= menu.height + 12 ? trigger.top - menu.height - 8 : trigger.bottom + 8;
    setPosition({
      left: Math.max(12, Math.min(trigger.right - menu.width, width - menu.width - 12)),
      top: Math.max(12, Math.min(top, height - menu.height - 12)),
    });
  }, [visible, voices, loading, error, model]);

  useEffect(() => {
    if (!visible) return;
    const outside = event => {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    const scroll = event => { if (!menuRef.current?.contains(event.target)) setOpen(false); };
    const close = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', close);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const target = menuRef.current?.querySelector('[aria-checked="true"], [role="menuitemradio"], button');
    (target || menuRef.current)?.focus({ preventScroll: true });
  }, [visible, loading]);

  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);

  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  const onKeyDown = event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
    if (event.key === 'Tab') { close(); return; }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const items = [...menuRef.current.querySelectorAll('[role="menuitemradio"], button[role="menuitem"]')];
    if (!items.length) return;
    const current = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
      : event.key === 'ArrowDown' ? (current + 1) % items.length : (current - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <>
      <button ref={triggerRef} type="button" className={`studio-model-trigger${visible ? ' is-open' : ''}`}
        aria-label={`Model: ${loading ? 'Loading' : selectedName}`} aria-haspopup="menu" aria-expanded={visible}
        aria-controls={visible ? id : undefined} disabled={disabled} onClick={() => setOpen(current => !current)}
        onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}>
        <Cpu size={15} /><span>Model</span><ChevronDown size={13} />
      </button>
      {visible && createPortal(
        <div ref={menuRef} id={id} className={`studio-model-popover${isDark ? ' model-dark' : ''}`} style={position}
          role="menu" aria-label="Choose a model" tabIndex={-1} onKeyDown={onKeyDown}>
          <div className="model-menu-heading"><strong>Model</strong><span>{loading ? 'Finding available models...' : `Selected: ${selectedName}`}</span></div>
          {loading ? <p className="model-menu-state" role="status"><Loader2 size={17} className="model-spinner" />Loading models...</p>
            : error ? <div className="model-menu-state"><p role="alert">{error}</p><button type="button" role="menuitem" onClick={retry}><RefreshCw size={14} />Try again</button></div>
            : !voices.length ? <p className="model-menu-state">No models are available right now. Requests will use the server default.</p>
            : voices.map(voice => {
              const locked = !canSelectModel(voice, isGuest);
              const active = voice.key === model;
              const available = isAvailable(voice);
              const upcoming = voice.status === VOICE_STATUS.COMING_SOON;
              const retired = voice.status === VOICE_STATUS.RETIRED;
              const Icon = retired ? Ban : upcoming ? Clock : locked ? LockKeyhole : Cpu;
              return <button key={voice.key} type="button" role="menuitemradio" aria-checked={active} aria-disabled={locked}
                className={`model-menu-option${active ? ' is-selected' : ''}${retired ? ' is-retired' : ''}`} tabIndex={-1}
                onClick={() => { if (!locked) { selectModel(voice.key); close(); } }}>
                <span className="model-option-icon"><Icon size={17} /></span>
                <span className="model-option-copy"><strong>{voice.name || voice.key}
                  {available && voice.tag && <small className="model-tag">{voice.tag}</small>}
                  {voice.defaultVoice && <small>Default</small>}
                  {upcoming && <small>Coming soon</small>}
                  {retired && <small>No longer supported</small>}</strong>
                  {voice.description && <span>{voice.description}</span>}
                  {locked && available && <em>Sign in required</em>}
                </span>
                {active && <Check size={16} className="model-selected-check" aria-label="Selected" />}
              </button>;
            })}
          {isGuest && <div className="model-menu-footer"><p>Without signing in, only the default model can be used. Sign in to choose another model.</p>
            {onSignIn && <button type="button" role="menuitem" onClick={() => { close(); onSignIn(); }}><LogIn size={14} />Sign in</button>}
          </div>}
        </div>, document.body,
      )}
    </>
  );
}
