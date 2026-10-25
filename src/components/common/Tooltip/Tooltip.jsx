import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

// Keep the original behavior: a click must not show a new tooltip under a stationary pointer.
let suppressHover = false;
function suppressUntilPointerMoves() {
  suppressHover = true;
  window.addEventListener('mousemove', () => { suppressHover = false; }, { once: true });
}

export default function Tooltip({ label, children, pos = 'right', enabled = true, block = false, isDark = false, className = '' }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const anchor = useRef(null);
  const bubble = useRef(null);
  const id = useId();
  const visible = show && enabled;

  useLayoutEffect(() => {
    if (!visible || !anchor.current || !bubble.current) return;
    const rect = anchor.current.getBoundingClientRect();
    const tip = bubble.current.getBoundingClientRect();
    const left = pos === 'bottom-end' ? rect.right - tip.width : rect.right + 12;
    const top = pos === 'bottom-end' ? rect.bottom + 8 : rect.top + (rect.height - tip.height) / 2;
    setPosition({
      left: Math.max(8, Math.min(left, window.innerWidth - tip.width - 8)),
      top: Math.max(8, Math.min(top, window.innerHeight - tip.height - 8)),
    });
  }, [visible, label, pos]);

  useEffect(() => {
    if (!visible) return;
    const close = () => setShow(false);
    const onKey = event => { if (event.key === 'Escape') close(); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [visible]);

  return (
    <span ref={anchor} className={`vlk-tt-wrap${block ? ' vlk-tt-block' : ''} ${className}`}
      onMouseEnter={() => { if (!suppressHover && enabled) setShow(true); }}
      onMouseLeave={() => setShow(false)} onFocus={() => { if (enabled) setShow(true); }} onBlur={() => setShow(false)}
      onClickCapture={() => { setShow(false); suppressUntilPointerMoves(); }}>
      {cloneElement(children, { 'aria-describedby': visible ? id : children.props['aria-describedby'] })}
      {visible && createPortal(
        <span ref={bubble} id={id} role="tooltip" className={`vlk-tt-bubble vlk-tt-show${isDark ? ' vlk-tt-dark' : ''}`} data-pos={pos} style={position}>{label}</span>, document.body,
      )}
    </span>
  );
}
