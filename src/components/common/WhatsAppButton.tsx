import React from 'react';
import { MessageSquare } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';

interface WhatsAppButtonProps {
  message?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'subtle' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  message = SITE_CONFIG.whatsappMessages.general,
  label = 'Inquire via WhatsApp',
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodedText}`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-5 py-2.5 text-sm font-semibold gap-2',
    lg: 'px-7 py-3.5 text-base font-bold gap-2.5'
  }[size];

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Silah-e-Khair Foundation on WhatsApp"
        className={`
          fixed bottom-6 right-6 z-40
          flex items-center gap-2.5
          bg-[#25D366] text-white
          hover:bg-[#20BD5A] active:bg-[#1DA850]
          px-4 py-3 rounded-full shadow-lg hover:shadow-xl
          transition-all duration-300 transform hover:-translate-y-0.5
          focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2
          ${className}
        `}
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline font-sans text-xs font-bold tracking-wide">
          WhatsApp Us
        </span>
      </a>
    );
  }

  const variantStyle = {
    primary: 'bg-[#25D366] text-white hover:bg-[#20BD5A] active:bg-[#1DA850] shadow-2xs hover:shadow',
    secondary: 'bg-[#064E3B] text-white hover:bg-[#047857]',
    subtle: 'bg-[#ECFDF5] text-[#064E3B] border border-[#047857]/20 hover:bg-[#D1FAE5]'
  }[variant];

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center justify-center
        rounded-lg transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2
        cursor-pointer whitespace-nowrap
        ${sizeClasses}
        ${variantStyle}
        ${className}
      `}
    >
      <MessageSquare className="w-4 h-4 fill-current shrink-0" />
      <span>{label}</span>
    </a>
  );
};
