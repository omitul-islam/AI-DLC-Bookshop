import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ title, subtitle, children, className = '', hover = false }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-card border border-gray-200 p-6 ${hover ? 'hover:shadow-card-hover transition-shadow duration-150' : ''} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
