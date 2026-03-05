import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Building2, LogOut, CreditCard,
  CheckCircle2, ChevronRight,
} from 'lucide-react';
import SectionWrapper from '../ui/SectionWrapper';
import { PATIENT_GUIDE } from '../../lib/constants';
import { cn } from '../../lib/cn';

const TAB_META = [
  { key: 'Before Your Visit', icon: CalendarCheck, color: 'primary' },
  { key: 'During Your Stay', icon: Building2, color: 'blue' },
  { key: 'After Discharge', icon: LogOut, color: 'emerald' },
  { key: 'Billing & Insurance', icon: CreditCard, color: 'amber' },
];

const colorMap = {
  primary: {
    active: 'border-primary-500 bg-primary-50 text-primary-700',
    icon: 'text-primary-600',
    bullet: 'text-primary-500',
    number: 'bg-primary-100 text-primary-700',
  },
  blue: {
    active: 'border-blue-500 bg-blue-50 text-blue-700',
    icon: 'text-blue-600',
    bullet: 'text-blue-500',
    number: 'bg-blue-100 text-blue-700',
  },
  emerald: {
    active: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    icon: 'text-emerald-600',
    bullet: 'text-emerald-500',
    number: 'bg-emerald-100 text-emerald-700',
  },
  amber: {
    active: 'border-amber-500 bg-amber-50 text-amber-700',
    icon: 'text-amber-600',
    bullet: 'text-amber-500',
    number: 'bg-amber-100 text-amber-700',
  },
};

export default function PatientGuide() {
  const [activeTab, setActiveTab] = useState(0);
  const meta = TAB_META[activeTab];
  const colors = colorMap[meta.color];
  const items = PATIENT_GUIDE[meta.key] || [];

  return (
    <SectionWrapper
      label="Patient Guide"
      title="What to Expect"
      subtitle="Everything you need to know before, during, and after your visit to ensure a smooth and comfortable experience."
    >
      {/* Tab bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {TAB_META.map((tab, i) => {
          const Icon = tab.icon;
          const c = colorMap[tab.color];
          const isActive = activeTab === i;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(i)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all duration-200 group',
                isActive ? c.active : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-card'
              )}
            >
              <Icon
                size={22}
                className={cn(
                  'mb-2 transition-colors',
                  isActive ? c.icon : 'text-dark-400 group-hover:text-dark-600'
                )}
              />
              <span className={cn(
                'text-sm font-semibold block',
                isActive ? '' : 'text-dark-700'
              )}>
                {tab.key}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8"
        >
          <h3 className="font-heading font-bold text-lg text-dark-900 mb-5 flex items-center gap-2">
            <meta.icon size={20} className={colors.icon} />
            {meta.key}
          </h3>

          <ul className="space-y-4">
            {items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3.5"
              >
                <span className={cn(
                  'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                  colors.number
                )}>
                  {i + 1}
                </span>
                <p className="text-sm text-dark-700 leading-relaxed pt-0.5">{item}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </SectionWrapper>
  );
}
