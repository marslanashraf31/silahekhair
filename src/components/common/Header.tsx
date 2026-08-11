import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, Heart, LogIn } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';
import { FoundationLogo } from './FoundationLogo';
import { PrimaryButton } from './PrimaryButton';
import { MobileMenu } from './MobileMenu';

interface HeaderProps {
  onOpenMembership: () => void;
  onOpenDonate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMembership, onOpenDonate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Desktop navigation links excluding Home (as logo serves as Home link)
  const desktopNavItems = SITE_CONFIG.navItems.filter((item) => item.path !== '/');

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#047857]/10 py-3' 
          : 'bg-[#FAF9F6]/90 backdrop-blur-xs py-4 border-b border-[#047857]/5'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Foundation Official Vector Logo */}
        <FoundationLogo size={isScrolled ? 'sm' : 'md'} />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                px-3 py-2 rounded-md font-sans text-xs xl:text-sm font-bold tracking-tight transition-all duration-200
                ${isActive 
                  ? 'text-[#064E3B] bg-[#ECFDF5]' 
                  : 'text-[#1E293B]/80 hover:text-[#064E3B] hover:bg-[#FAF9F6]'}
              `}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* 1. Donate Now: Primary Button (Red) - Visible on both Mobile & Desktop */}
          <button
            onClick={onOpenDonate}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-sans text-xs sm:text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-xs hover:shadow-md transition-all cursor-pointer border border-rose-700 shrink-0"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-white" />
            <span>Donate Now</span>
          </button>

          {/* 2. Become a Member: Simple Outlined / Green Button - Desktop only */}
          <button
            onClick={onOpenMembership}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-xs sm:text-sm font-bold text-[#064E3B] bg-emerald-50 hover:bg-emerald-100 transition-all border border-[#047857]/30 cursor-pointer shrink-0"
          >
            <span>Become a Member</span>
          </button>

          {/* 3. Member Login: Simple Text / Link (Not a button box) - Desktop only */}
          <Link
            to="/member/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-2 font-sans text-xs sm:text-sm font-bold text-slate-700 hover:text-[#064E3B] transition-colors shrink-0"
          >
            <LogIn className="w-3.5 h-3.5 text-[#047857]" />
            <span>Member Login</span>
          </Link>

          {/* Mobile Navigation Toggle (Hamburger Icon) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg text-[#064E3B] hover:bg-[#ECFDF5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857] min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenMembership={onOpenMembership}
        onOpenDonate={onOpenDonate}
      />
    </header>
  );
};
