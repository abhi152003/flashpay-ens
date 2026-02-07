import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl border bg-surface px-4 py-3.5 text-text-primary placeholder-text-tertiary 
            outline-none transition-all duration-200
            focus:border-primary focus:ring-2 focus:ring-primary/20
            hover:border-border-hover
            ${error ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : 'border-border'}
            ${success ? 'border-accent-green' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-accent-red flex items-center gap-1">
            <span className="text-xs">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
