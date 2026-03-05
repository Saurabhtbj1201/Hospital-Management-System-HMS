import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function SectionWrapper({
  children,
  title,
  subtitle,
  label,
  background = 'white', // 'white' | 'gray' | 'primary' | 'dark' | 'transparent'
  className,
  titleClassName,
  containerClass,
  centered = true,
  id,
}) {
  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    primary: 'bg-primary-50',
    dark: 'bg-dark-900 text-white',
    transparent: 'bg-transparent',
  };

  return (
    <section
      id={id}
      className={cn('section-padding', bgClasses[background], className)}
    >
      <motion.div
        className={cn('container-custom', containerClass)}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {/* Section Header */}
        {(title || subtitle || label) && (
          <div className={cn('mb-12 md:mb-16', centered && 'text-center')}>
            {/* Label / Eyebrow */}
            {label && (
              <motion.span
                variants={itemVariant}
                className={cn(
                  'inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full mb-4',
                  background === 'dark'
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'bg-primary-100 text-primary-700'
                )}
              >
                {label}
              </motion.span>
            )}

            {/* Title */}
            {title && (
              <motion.h2
                variants={itemVariant}
                className={cn(
                  'text-3xl md:text-4xl lg:text-[2.75rem] font-heading font-bold leading-tight',
                  background === 'dark' ? 'text-white' : 'text-dark-900',
                  centered && 'max-w-3xl mx-auto',
                  titleClassName
                )}
              >
                {title}
              </motion.h2>
            )}

            {/* Subtitle */}
            {subtitle && (
              <motion.p
                variants={itemVariant}
                className={cn(
                  'mt-4 text-lg leading-relaxed',
                  background === 'dark' ? 'text-gray-300' : 'text-dark-500',
                  centered && 'max-w-2xl mx-auto'
                )}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </motion.div>
    </section>
  );
}

// Re-export the item variant for children to use with stagger
SectionWrapper.itemVariant = itemVariant;
SectionWrapper.containerVariants = containerVariants;
