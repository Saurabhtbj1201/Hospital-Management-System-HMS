import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  className,
  overlayClassName,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog as="div" className="relative z-50" open={isOpen} onClose={onClose} static>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn('fixed inset-0 bg-black/60 backdrop-blur-sm', overlayClassName)}
            aria-hidden="true"
          />

          {/* Panel Container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Dialog.Panel
                  className={cn(
                    'w-full rounded-2xl bg-white shadow-2xl',
                    'ring-1 ring-black/5',
                    sizeClasses[size],
                    className
                  )}
                >
                  {/* Header */}
                  {(title || showClose) && (
                    <div className="flex items-start justify-between p-6 pb-0">
                      <div>
                        {title && (
                          <Dialog.Title className="text-xl font-bold font-heading text-dark-900">
                            {title}
                          </Dialog.Title>
                        )}
                        {description && (
                          <Dialog.Description className="mt-1 text-sm text-dark-500">
                            {description}
                          </Dialog.Description>
                        )}
                      </div>
                      {showClose && (
                        <button
                          onClick={onClose}
                          className="ml-4 p-2 rounded-xl text-dark-400 hover:text-dark-600 hover:bg-gray-100 transition-colors"
                          aria-label="Close modal"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-6">{children}</div>
                </Dialog.Panel>
              </motion.div>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

// Optional footer sub-component
Modal.Footer = function ModalFooter({ children, className }) {
  return (
    <div className={cn('flex items-center justify-end gap-3 pt-4 border-t border-gray-100', className)}>
      {children}
    </div>
  );
};
