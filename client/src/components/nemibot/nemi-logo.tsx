import React from 'react';

// Versión componente del logo de NEMI Bot
const NemiLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      width="100" 
      height="100" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="50" cy="50" r="48" fill="#2563EB" stroke="#FFFFFF" strokeWidth="4"/>
      <path d="M30 35C30 32.2386 32.2386 30 35 30H65C67.7614 30 70 32.2386 70 35V65C70 67.7614 67.7614 70 65 70H35C32.2386 70 30 67.7614 30 65V35Z" fill="white"/>
      <rect x="38" y="42" width="8" height="8" rx="4" fill="#2563EB"/>
      <rect x="54" y="42" width="8" height="8" rx="4" fill="#2563EB"/>
      <path d="M38 58H62" stroke="#2563EB" strokeWidth="4" strokeLinecap="round"/>
      <path d="M25 25L28 28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M72 28L75 25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 50H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M85 50H80" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M25 75L28 72" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M72 72L75 75" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};

export default NemiLogo;