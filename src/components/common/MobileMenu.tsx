import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link } from 'react-router-dom';
import { X, Heart, Home, Info, FolderHeart, ShieldCheck, PhoneCall, ChevronRight, Layers, Newspaper, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG } from '../../config/siteConfig';
import { FoundationLogo } from './FoundationLogo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMembership: () => void;
  onOpenDonate?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onOpenMembership,
  onOpenDonate
}) => {
  // Prevent body scrolling while mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navIcons: Record<string, React.ReactNode> = {
    '/': <Home className="w-5 h-5 shrink-0 text-[#047857]" />,
    '/about': <Info className="w-5 h-5 shrink-0 text-[#047857]" />,
    '/our-work': <FolderHeart className="w-5 h-5 shrink-0 text-[#047857]" />,
    '/impact': <Heart className="w-5 h-5 shrink-0 text-[#047857]" />,
    '/transparency': <ShieldCheck className="w-5 h-5 shrink-0 text-[#047857]" />,
    '/gallery': <Layers className="w-5 h-5 shrink-0 text-[#047857]" />,
    '/updates': <Newspaper className="w-5 h-5 shrink-0 text-[#047857]" />,
    '/contact': <PhoneCall className="w-5 h-5 shrink-0 text-[#047857]" />
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] lg:hidden flex flex-col bg-[#FAF9F6] text-[#1E293B] w-full h-full overflow-hidden"
        >
          {/* Top Full Screen Header Bar */}
          <div className="p-4 sm:p-5 border-b border-[#047857]/15 bg-white flex items-center justify-between shrink-0 shadow-xs">
            <FoundationLogo size="sm" />
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-2.5 rounded-full text-[#064E3B] bg-[#ECFDF5] hover:bg-[#D1FAE5] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer border border-[#047857]/20 shadow-2xs"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Navigation Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Quick Menu Banner */}
            <div className="bg-[#ECFDF5] p-3.5 sm:p-4 rounded-xl border border-[#047857]/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#047857] uppercase tracking-wider font-sans">
                  Official Menu
                </p>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#064E3B]">
                  Silah-e-Khair Foundation
                </h3>
              </div>
              <span className="text-xs font-bold bg-[#064E3B] text-white px-2.5 py-1 rounded-md">
                Navigation
              </span>
            </div>

            {/* Navigation List */}
            <nav className="flex flex-col space-y-2">
              {SITE_CONFIG.navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    px-4 py-3.5 rounded-xl font-sans text-base font-bold transition-all duration-150 flex items-center justify-between group
                    ${isActive 
                      ? 'bg-[#064E3B] text-white shadow-md' 
                      : 'text-[#1E293B] hover:bg-[#ECFDF5] hover:text-[#064E3B] bg-white border border-[#047857]/15 shadow-2xs'}
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="group-hover:scale-110 transition-transform">
                      {navIcons[item.path] || <ChevronRight className="w-5 h-5 text-[#047857]" />}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-all" />
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Footer CTAs at the bottom of the mobile screen */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#047857]/15 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenMembership();
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#047857] hover:bg-[#064E3B] text-white font-sans font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <span>Become Member</span>
              </button>

              <Link
                to="/member/login"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 text-[#064E3B] font-sans font-bold text-xs border border-[#047857]/25 hover:bg-emerald-100 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                <span>Member Login</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
