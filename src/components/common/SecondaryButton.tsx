import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'subtle';
  fullWidth?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  icon,
  size = 'md',
  variant = 'outline',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-semibold',
    md: 'px-6 py-3 text-sm font-semibold',
    lg: 'px-8 py-4 text-base font-bold'
  }[size];

  const variantClasses = variant === 'outline'
    ? 'border border-[#064E3B]/20 text-[#064E3B] bg-white hover:bg-[#FAF9F6] hover:border-[#064E3B]/40 active:bg-[#F3F0EA]'
    : 'border border-transparent text-[#064E3B] bg-[#ECFDF5] hover:bg-[#D1FAE5] active:bg-[#A7F3D0]';

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2.5
        rounded-lg shadow-2xs hover:shadow-xs
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#047857] focus:ring-offset-2
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        whitespace-nowrap
        ${sizeClasses}
        ${variantClasses}
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
