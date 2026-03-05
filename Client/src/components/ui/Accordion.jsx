import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Accordion({ items, className, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState(new Set());

  const toggle = (index) => {
    setOpenItems((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={cn('divide-y divide-gray-200 rounded-2xl border border-gray-200 overflow-hidden', className)}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        return (
          <div key={index} className={cn('transition-colors', isOpen && 'bg-primary-50/30')}>
            <button
              onClick={() => toggle(index)}
              className={cn(
                'flex items-center justify-between w-full px-6 py-5 text-left',
                'font-semibold text-dark-800 hover:text-primary-700 transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500'
              )}
              aria-expanded={isOpen}
            >
              <span className="pr-4">{item.question || item.title}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <ChevronDown
                  size={20}
                  className={cn(
                    'transition-colors',
                    isOpen ? 'text-primary-600' : 'text-dark-400'
                  )}
                />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-dark-600 leading-relaxed">
                    {item.answer || item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
