import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, disabled, variant = 'primary', className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700',
      ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
