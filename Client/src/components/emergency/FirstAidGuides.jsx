import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Wind,
  Droplets,
  Flame,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { FIRST_AID_GUIDES } from '../../lib/constants';
import { containerVariants, itemVariant } from '../ui/SectionWrapper';

const guideIcons = [Heart, Wind, Droplets, Flame];
const guideColors = [
  { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', ring: 'ring-red-200', step: 'bg-red-100 text-red-700' },
  { bg: 'bg-sky-50', icon: 'bg-sky-100 text-sky-600', ring: 'ring-sky-200', step: 'bg-sky-100 text-sky-700' },
  { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', ring: 'ring-rose-200', step: 'bg-rose-100 text-rose-700' },
  { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', ring: 'ring-orange-200', step: 'bg-orange-100 text-orange-700' },
];

export default function FirstAidGuides() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? -1 : i);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="space-y-4"
    >
      {/* Disclaimer */}
      <motion.div
        variants={itemVariant}
        className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 ring-1 ring-amber-200 mb-6"
      >
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Disclaimer:</span> These guides are for informational purposes only and do not replace professional medical advice. In a real emergency, always call <strong>108</strong> immediately.
        </p>
      </motion.div>

      {FIRST_AID_GUIDES.map((guide, index) => {
        const isOpen = openIndex === index;
        const Icon = guideIcons[index] || Heart;
        const clr = guideColors[index % guideColors.length];

        return (
          <motion.div
            key={guide.title}
            variants={itemVariant}
            className={`rounded-2xl ring-1 ${isOpen ? clr.ring : 'ring-gray-200'} ${isOpen ? clr.bg : 'bg-white'} transition-all duration-300 overflow-hidden`}
          >
            {/* Header (toggle) */}
            <button
              onClick={() => toggle(index)}
              className="flex items-center gap-4 w-full text-left p-5 md:p-6"
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 transition-colors duration-300 ${isOpen ? clr.icon : 'bg-gray-100 text-dark-500'}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-dark-900">{guide.title}</h3>
                <p className="text-xs text-dark-500 mt-0.5">{guide.steps.length} steps</p>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0"
              >
                <ChevronDown size={20} className="text-dark-400" />
              </motion.div>
            </button>

            {/* Steps (collapsible) */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-5 pb-6 md:px-6 md:pb-7">
                    <ol className="space-y-3 ml-1">
                      {guide.steps.map((step, sIdx) => (
                        <motion.li
                          key={sIdx}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: sIdx * 0.06, duration: 0.3 }}
                          className="flex items-start gap-3"
                        >
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 mt-0.5 ${clr.step}`}>
                            {sIdx + 1}
                          </span>
                          <p className="text-sm text-dark-700 leading-relaxed">{step}</p>
                        </motion.li>
                      ))}
                    </ol>

                    {/* Quick reminder */}
                    <div className="mt-5 flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-lg">
                      <CheckCircle2 size={16} className="flex-shrink-0" />
                      Stay calm and act quickly. Professional help is on the way.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
