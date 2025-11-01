import React from 'react';

export function IconHeart({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21s-7.5-4.35-10-7.2C-0.17 10.72 3 6 7 6c2.56 0 4 2 5 3 1-1 2.44-3 5-3 4 0 7.17 4.72 5 7.8C19.5 16.65 12 21 12 21z" fill="currentColor" />
    </svg>
  );
}

export function IconStar({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.011 4.665 24 6 15.595 0 9.748l8.332-1.73L12 .587z" fill="currentColor" />
    </svg>
  );
}

export function IconSend({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
    </svg>
  );
}
