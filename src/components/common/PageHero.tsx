import React from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  children
}) => {
  return (
    <div className="bg-linear-to-b from-[#ECFDF5]/60 via-[#FAF9F6] to-[#FAF9F6] border-b border-[#047857]/10 pt-28 md:pt-36 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        {eyebrow && (
          <span className="inline-block font-sans text-xs md:text-sm font-bold tracking-widest text-[#047857] uppercase mb-3">
            {eyebrow}
          </span>
        )}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#064E3B] tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 md:mt-6 font-sans text-base md:text-xl text-[#64748B] max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
};
