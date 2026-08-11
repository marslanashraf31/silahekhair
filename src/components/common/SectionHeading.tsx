import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  lightBackground?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  lightBackground = true,
  className = ''
}) => {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  }[align];

  return (
    <div className={`max-w-3xl ${alignmentClass} ${className}`}>
      {eyebrow && (
        <span className="inline-block font-sans text-xs font-bold tracking-widest text-[#047857] uppercase mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className={`font-serif text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight ${lightBackground ? 'text-[#064E3B]' : 'text-white'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 font-sans text-base md:text-lg leading-relaxed ${lightBackground ? 'text-[#64748B]' : 'text-emerald-100/80'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
