import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function CountUp({
  end,
  duration = 2,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
  textClassName,
  labelClassName,
  iconClassName,
  label,
  icon: Icon,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const raw = eased * end;
      setCount(decimals > 0 ? parseFloat(raw.toFixed(decimals)) : Math.floor(raw));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration, decimals]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn('text-center', className)}
    >
      {Icon && (
        <div className={cn('w-14 h-14 mx-auto mb-3 rounded-xl bg-primary-50 flex items-center justify-center', iconClassName)}>
          <Icon className={cn('text-primary-600', iconClassName && 'text-inherit')} size={28} />
        </div>
      )}
      <div className={cn('text-4xl md:text-5xl font-heading font-bold text-dark-900', textClassName)}>
        {prefix}
        {decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}
        {suffix}
      </div>
      {label && (
        <div className={cn('mt-2 text-sm font-medium uppercase tracking-wider', labelClassName)}>
          {label}
        </div>
      )}
    </motion.div>
  );
}
