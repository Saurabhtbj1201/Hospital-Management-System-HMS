import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function Tabs({ tabs, defaultIndex = 0, className, variant = 'underline' }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const variantStyles = {
    underline: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-3 text-sm font-medium transition-colors relative',
      active: 'text-primary-600',
      inactive: 'text-dark-500 hover:text-dark-700',
      indicator: 'absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600',
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-xl inline-flex',
      tab: 'px-4 py-2 text-sm font-medium transition-all rounded-lg relative z-10',
      active: 'text-primary-700',
      inactive: 'text-dark-500 hover:text-dark-700',
      indicator: 'absolute inset-0 bg-white rounded-lg shadow-sm',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={cn('flex gap-0 overflow-x-auto scrollbar-hide', style.container)}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              style.tab,
              activeIndex === index ? style.active : style.inactive
            )}
          >
            <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
            {activeIndex === index && (
              <motion.div
                layoutId={`tab-indicator-${variant}`}
                className={style.indicator}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        {tabs[activeIndex]?.content}
      </motion.div>
    </div>
  );
}
