import React, { useEffect } from 'react';

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bg = type === 'error' ? 'rgba(255,92,92,0.12)' : 'rgba(123,224,198,0.08)';

  return (
    <div style={{position:'fixed',left:20,bottom:20,zIndex:120}}>
      <div style={{padding:'10px 14px',borderRadius:12,background:bg,color:'#fff',border:'1px solid rgba(255,255,255,0.04)',boxShadow:'0 8px 30px rgba(2,6,23,0.6)'}}>
        {message}
      </div>
    </div>
  );
}

export default Toast;
