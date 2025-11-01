import React from 'react';

function FAB({ onClick, title = 'Create' }) {
  return (
    <button onClick={onClick} aria-label={title} title={title}
      style={{
        position: 'fixed',
        right: 22,
        bottom: 22,
        zIndex: 80,
        width: 64,
        height: 64,
        borderRadius: 20,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(2,6,23,0.6)',
        background: 'linear-gradient(90deg,var(--accent), #5fd6c1)',
        color: '#051225',
        fontSize: 26,
      }}
    >
      +
    </button>
  );
}

export default FAB;
