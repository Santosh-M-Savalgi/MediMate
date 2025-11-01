import React, { useEffect, useRef } from 'react';

function Modal({ open, onClose, title, children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
      if (e.key === 'Tab' && containerRef.current) {
        // focus trap
        const focusable = containerRef.current.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // focus first focusable element
    const timer = setTimeout(() => {
      const el = containerRef.current && containerRef.current.querySelector('input, button, textarea, select, [tabindex]:not([tabindex="-1"])');
      el && el.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:60}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(2,6,23,0.6)'}} />
      <div ref={containerRef} style={{position:'relative',zIndex:70,width:'min(720px,96%)'}} className="card">
        {title && <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h3 style={{margin:0}}>{title}</h3>
          <button onClick={onClose} className="mm-logout">Close</button>
        </div>}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
