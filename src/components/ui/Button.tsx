import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, disabled, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg active:scale-[0.98]',
      secondary: 'bg-surface-elevated text-text-primary hover:bg-border border border-border shadow-sm hover:shadow-md active:scale-[0.98]',
      ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated active:scale-[0.98]',
      outline: 'bg-transparent text-text-primary border border-border hover:bg-surface-elevated hover:border-border-hover active:scale-[0.98]',
    };

    const sizes = {
      sm: 'rounded-lg px-3 py-1.5 text-sm',
      md: 'rounded-xl px-4 py-2.5 text-base',
      lg: 'rounded-xl px-6 py-3.5 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
