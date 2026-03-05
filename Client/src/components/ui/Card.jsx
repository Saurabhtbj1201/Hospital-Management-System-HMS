import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

const variantStyles = {
  default: 'bg-white border border-gray-100',
  bordered: 'bg-white border-2 border-gray-200',
  gradient: 'bg-white gradient-border',
  filled: 'bg-primary-50 border border-primary-100',
  glass: 'glass',
  dark: 'bg-dark-900 text-white border border-dark-700',
};

export default function Card({
  children,
  variant = 'default',
  hover = true,
  padding = 'md',
  rounded = '2xl',
  className,
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-50',
  badge,
  badgeColor = 'bg-primary-100 text-primary-700',
  image,
  imageAlt = '',
  imageHeight = 'h-48',
  as: Component = 'div',
  animate = true,
  onClick,
  ...props
}) {
  const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const Wrapper = animate ? motion.div : Component;
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-50px' },
        transition: { duration: 0.5, ease: 'easeOut' },
      }
    : {};

  return (
    <Wrapper
      className={cn(
        `rounded-${rounded} shadow-card transition-all duration-300`,
        variantStyles[variant],
        hover && 'card-hover cursor-default',
        onClick && 'cursor-pointer',
        !image && paddingSizes[padding],
        className
      )}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {/* Image Header */}
      {image && (
        <div className={cn('overflow-hidden', `rounded-t-${rounded}`)}>
          <img
            src={image}
            alt={imageAlt}
            className={cn(imageHeight, 'w-full object-cover transition-transform duration-500 hover:scale-105')}
          />
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className={image ? 'px-6 pt-4' : ''}>
          <span className={cn('inline-block px-3 py-1 text-xs font-semibold rounded-full', badgeColor)}>
            {badge}
          </span>
        </div>
      )}

      {/* Icon Header */}
      {Icon && (
        <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4', iconBg)}>
          <Icon className={iconColor} size={28} />
        </div>
      )}

      {/* Content */}
      {image ? <div className={paddingSizes[padding]}>{children}</div> : children}
    </Wrapper>
  );
}

// Sub-components for structured card content
Card.Title = function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-lg font-bold font-heading text-dark-900 mb-2', className)} {...props}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-dark-500 text-sm leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
};

Card.Footer = function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-100 flex items-center', className)} {...props}>
      {children}
    </div>
  );
};
