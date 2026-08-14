import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Instagram, LogIn, Heart } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';
import { FoundationLogo } from './FoundationLogo';

interface FooterProps {
  onOpenMembership: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMembership }) => {
  return (
    <footer className="bg-[#064E3B] text-white pt-16 pb-12 border-t border-[#047857]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 lg:gap-12 pb-12 border-b border-emerald-800/60">
            
            {/* Foundation Branding & Intro */}
            <div className="md:col-span-5 space-y-4">
              <FoundationLogo variant="white" size="md" />
              <p className="font-sans text-sm text-emerald-100/80 leading-relaxed max-w-md pt-2">
                Silah-e-Khair Foundation is a community-based humanitarian initiative created by friends pooling monthly contributions to support families and individuals in need with dignity and transparency.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Quick Navigation
              </h3>
              <ul className="space-y-2 text-sm font-sans text-emerald-100/80">
                {SITE_CONFIG.navItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className="hover:text-white transition-colors inline-flex items-center gap-1 hover:translate-x-1 duration-150"
                    >
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
                <li className="pt-2 border-t border-emerald-800/80">
                  <Link 
                    to="/member/login" 
                    className="text-amber-300 font-bold hover:text-white transition-colors inline-flex items-center gap-1.5 hover:translate-x-1 duration-150"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-400" />
                    <span>Member Portal Login</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Direct Action */}
            <div className="md:col-span-4 space-y-4">
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Get in Touch
              </h3>
              <p className="font-sans text-xs text-emerald-200/80 leading-relaxed">
                For general inquiries, beneficiary verification requests, or direct donations, connect with our coordination team:
              </p>
              
              <div className="space-y-2.5 pt-1">
                {/* Big Support Us Button -> WhatsApp */}
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.support)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-current text-rose-700" />
                  <span>Support Us</span>
                </a>

                {/* Become a Member Button */}
                <button
                  onClick={onOpenMembership}
                  className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer"
                >
                  <span>Become a Member</span>
                </button>

                {/* Small Inline Social & WhatsApp Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.general)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#20BD5A] text-white px-2 py-2 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                    title="WhatsApp Us"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={SITE_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-2 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>

                  <a
                    href={SITE_CONFIG.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-2 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.33 22a6.33 6.33 0 0 0 6.33-6.33V9.12a8.16 8.16 0 0 0 3.93 1.02V6.69z"/>
                    </svg>
                    <span>TikTok</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom copyright row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-emerald-200/70 gap-4">
            <p>© {new Date().getFullYear()} Silah-e-Khair Foundation. Built for community service.</p>
            <div className="flex items-center space-x-6">
              <Link to="/transparency" className="hover:text-white transition-colors">Transparency</Link>
              <Link to="/about" className="hover:text-white transition-colors">Our Charter</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
  );
};
