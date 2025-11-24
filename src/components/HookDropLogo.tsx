import React from 'react';

const HookDropLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <svg 
        width="200" 
        height="80" 
        viewBox="0 0 200 80" 
        className="w-full h-full"
      >
        {/* Sky gradient background */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          
          {/* Text gradient */}
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        
        {/* Sky background */}
        <rect width="200" height="40" fill="url(#skyGradient)" rx="8" />
        
        {/* Falling musical notes */}
        <g className="animate-pulse">
          {/* Musical note 1 */}
          <circle cx="30" cy="8" r="2" fill="#fbbf24" opacity="0.8" />
          <rect x="32" y="4" width="1" height="8" fill="#fbbf24" opacity="0.8" />
          
          {/* Musical note 2 */}
          <circle cx="60" cy="12" r="2" fill="#f59e0b" opacity="0.9" />
          <rect x="62" y="8" width="1" height="8" fill="#f59e0b" opacity="0.9" />
          
          {/* Musical note 3 */}
          <circle cx="120" cy="6" r="2" fill="#fbbf24" opacity="0.7" />
          <rect x="122" y="2" width="1" height="8" fill="#fbbf24" opacity="0.7" />
          
          {/* Musical note 4 */}
          <circle cx="160" cy="10" r="2" fill="#f59e0b" opacity="0.8" />
          <rect x="162" y="6" width="1" height="8" fill="#f59e0b" opacity="0.8" />
        </g>
        
        {/* HookDrop text */}
        <text 
          x="100" 
          y="65" 
          textAnchor="middle" 
          className="text-2xl font-bold" 
          fill="url(#textGradient)"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          HookDrop
        </text>
      </svg>
    </div>
  );
};

export default HookDropLogo;