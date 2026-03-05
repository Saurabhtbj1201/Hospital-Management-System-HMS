import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const variants = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-purple active:bg-primary-800 focus-visible:ring-primary-500',
  secondary:
    'bg-secondary-500 text-white hover:bg-secondary-600 shadow-md hover:shadow-lg active:bg-secondary-700 focus-visible:ring-secondary-500',
  outline:
    'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white active:bg-primary-700',
  ghost:
    'text-dark-600 hover:bg-gray-100 hover:text-dark-900 active:bg-gray-200',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg active:bg-red-800 focus-visible:ring-red-500',
  white:
    'bg-white text-primary-600 hover:bg-gray-50 shadow-md hover:shadow-lg active:bg-gray-100',
};

const sizes = {
  sm: 'px-4 py-2 text-sm gap-1.5 rounded-lg',
  md: 'px-6 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-8 py-3.5 text-base gap-2.5 rounded-xl',
  xl: 'px-10 py-4 text-lg gap-3 rounded-2xl',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      as,
      to,
      href,
      loading = false,
      disabled = false,
      iconLeft: IconLeft,
      iconRight: IconRight,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-semibold transition-all duration-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'active:scale-[0.98]',
      variants[variant],
      sizes[size],
      loading && 'pointer-events-none opacity-70',
      className
    );

    const content = (
      <>
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 20 : 16} />
        ) : IconLeft ? (
          <IconLeft size={size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 20 : 16} />
        ) : null}
        {children}
        {!loading && IconRight && (
          <IconRight size={size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 20 : 16} />
        )}
      </>
    );

    // Render as React Router Link
    if (to) {
      return (
        <Link ref={ref} to={to} className={baseClasses} {...props}>
          {content}
        </Link>
      );
    }

    // Render as anchor tag
    if (href) {
      return (
        <a ref={ref} href={href} className={baseClasses} {...props}>
          {content}
        </a>
      );
    }

    // Render as custom component
    if (as) {
      const Component = as;
      return (
        <Component ref={ref} className={baseClasses} disabled={disabled || loading} {...props}>
          {content}
        </Component>
      );
    }

    // Default: render as button
    return (
      <button ref={ref} className={baseClasses} disabled={disabled || loading} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
