import React from 'react';

interface AuraLogoProps {
  size?: number;
  iconSize?: number;
  className?: string;
}

export const AuraLogo: React.FC<AuraLogoProps> = ({
  size = 28,
  iconSize = 13,
  className = '',
}) => {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative p-[1.5px] rounded-lg bg-gradient-to-tr from-[#ff3b30] via-[#ff9500] via-[#ffcc00] via-[#34c759] via-[#007aff] to-[#af52de] shrink-0 ${className}`}
      aria-hidden="true"
    >
      <div className="w-full h-full rounded-[6.5px] bg-white dark:bg-[#171b26] flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 block"
        >
          <defs>
            <linearGradient id="auraChatGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff3b30" />
              <stop offset="50%" stopColor="#af52de" />
              <stop offset="100%" stopColor="#007aff" />
            </linearGradient>
          </defs>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM6 6H18V8H6V6ZM6 9.5H18V11.5H6V9.5ZM6 13H14V15H6V13Z"
            fill="url(#auraChatGrad)"
          />
        </svg>
      </div>
    </div>
  );
};
