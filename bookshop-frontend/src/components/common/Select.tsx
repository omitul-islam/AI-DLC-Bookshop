import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, placeholder, className = '', required, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      <select
        ref={ref}
        className={`px-3 py-2 text-sm border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
            : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
);
