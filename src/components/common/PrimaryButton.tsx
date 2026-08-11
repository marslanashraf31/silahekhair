import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'white' | 'outline';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  icon,
  size = 'md',
  fullWidth = false,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3.5 sm:px-4 py-2 text-xs font-semibold',
    md: 'px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold',
    lg: 'px-7 sm:px-8 py-3.5 sm:py-4 text-base font-bold'
  }[size];

  const variantClasses = {
    primary: 'bg-[#064E3B] text-white hover:bg-[#047857] active:bg-[#065F46] border-transparent focus:ring-[#047857]',
    secondary: 'bg-[#ECFDF5] text-[#064E3B] hover:bg-[#D1FAE5] active:bg-[#A7F3D0] border-emerald-200/50 focus:ring-[#047857]',
    white: 'bg-white text-[#064E3B] hover:bg-emerald-50 active:bg-emerald-100 border-emerald-100 text-[#064E3B] focus:ring-white',
    outline: 'bg-transparent text-white hover:bg-white/10 active:bg-white/20 border-white/40 focus:ring-white'
  }[variant];

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        border rounded-lg shadow-xs hover:shadow-md
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        whitespace-nowrap select-none
        ${variantClasses}
        ${sizeClasses}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      <span>{children}</span>
      {icon && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
