import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: 'default' | 'primary' | 'danger';
}

const variants = {
  default: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
  primary: 'text-gray-400 hover:text-blue-600 hover:bg-blue-50',
  danger: 'text-gray-400 hover:text-red-600 hover:bg-red-50',
};

export function IconButton({ icon, label, variant = 'default', className = '', ...props }: IconButtonProps) {
  return (
    <button
      className={`p-1.5 rounded transition-colors ${variants[variant]} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}
