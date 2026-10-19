import React from 'react';

interface SmartLibLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SmartLibLogo: React.FC<SmartLibLogoProps> = ({ size = 'md', className = '' }) => {
  const iconSize = size === 'sm' ? 26 : size === 'lg' ? 44 : 34;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const badgeSize = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : size === 'lg' ? 'text-xs px-2 py-0.5' : 'text-[11px] px-1.5 py-0.5';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom SmartLib Emblem matching reference */}
      <div className="relative flex items-center justify-center">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
        >
          {/* Rounded squircle border */}
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="10"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-amber-400/90"
          />
          {/* Open book spine & pages */}
          <path
            d="M20 16V30M20 30C17.5 28.2 13 28.2 10 30V17C13 15.2 17.5 15.2 20 17M20 30C22.5 28.2 27 28.2 30 30V17C27 15.2 22.5 15.2 20 17"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Yellow spark / beacon dot */}
          <circle cx="20" cy="11.5" r="2" fill="#FBBF24" />
        </svg>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={`font-bold tracking-tight text-white ${textSize}`}>
          SmartLib
        </span>
        <span className={`bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded tracking-wide shadow-sm ${badgeSize}`}>
          AU
        </span>
      </div>
    </div>
  );
};
