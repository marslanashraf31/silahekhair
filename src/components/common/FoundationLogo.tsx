import React from 'react';
import { Link } from 'react-router-dom';
import foundationLogo from '../../assets/images/silah-logo.svg';

interface FoundationLogoProps {
  variant?: 'full' | 'compact' | 'white' | 'stacked';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FoundationLogo: React.FC<FoundationLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md'
}) => {
  const sizeConfig = {
    sm: {
      icon: 'w-10 h-10',
      title: 'text-xs sm:text-sm font-black tracking-wide',
      sub: 'text-[8px] sm:text-[9px] font-bold tracking-[0.24em]'
    },
    md: {
      icon: 'w-12 h-12 md:w-14 md:h-14',
      title: 'text-sm sm:text-base md:text-lg font-black tracking-wide',
      sub: 'text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.25em]'
    },
    lg: {
      icon: 'w-16 h-16 md:w-20 md:h-20',
      title: 'text-lg md:text-xl font-black tracking-wide',
      sub: 'text-[11px] md:text-xs font-bold tracking-[0.28em]'
    },
    xl: {
      icon: 'w-24 h-24 md:w-28 md:h-28',
      title: 'text-2xl md:text-3xl font-black tracking-wide',
      sub: 'text-xs md:text-sm font-bold tracking-[0.3em]'
    }
  }[size];

  const isWhite = variant === 'white';

  return (
    <Link 
      to="/" 
      className={`inline-flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-95 focus:outline-none shrink-0 group ${
        variant === 'stacked' ? 'flex-col text-center' : 'flex-row'
      } ${className}`}
      aria-label="Silah-e-Khair Foundation"
    >
      {/* Official Image Logo Container */}
      <div className={`relative flex items-center justify-center ${sizeConfig.icon} shrink-0 overflow-hidden rounded-full ${
        isWhite ? 'bg-white p-0.5 ring-2 ring-emerald-300/40 shadow-xs' : 'bg-white p-0.5 border border-emerald-900/10 shadow-2xs'
      }`}>
        <img
          src={foundationLogo}
          alt="Silah-e-Khair Foundation Logo"
          className="w-full h-full object-contain rounded-full select-none"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.triedFallback) {
              target.dataset.triedFallback = 'true';
              target.src = '/silah-logo.jpg';
            }
          }}
        />
      </div>

      {/* Foundation Name Typography */}
      {variant !== 'compact' && (
        <div className={`flex flex-col justify-center leading-tight select-none ${variant === 'stacked' ? 'items-center mt-2' : 'items-start'}`}>
          <span className={`font-sans ${sizeConfig.title} ${isWhite ? 'text-white' : 'text-[#064E3B]'} uppercase tracking-wider whitespace-nowrap`}>
            SILAH E KHAIR
          </span>
          <span className={`font-sans ${sizeConfig.sub} ${isWhite ? 'text-emerald-200' : 'text-[#047857]'} font-bold uppercase tracking-[0.24em] sm:tracking-[0.26em] mt-0.5 whitespace-nowrap`}>
            FOUNDATION
          </span>
        </div>
      )}
    </Link>
  );
};
