import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-error ml-0.5">*</span>}
      </label>
      <input
        ref={ref}
        className={`px-3 py-2 text-sm border rounded-md transition-colors duration-150 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
            : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
);
