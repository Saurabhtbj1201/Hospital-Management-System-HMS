import { motion } from 'framer-motion';
import {
  Siren,
  HeartPulse,
  Brain,
  Baby,
  Flame,
  FlaskConical,
} from 'lucide-react';
import { EMERGENCY_SERVICES } from '../../lib/constants';
import { containerVariants, itemVariant } from '../ui/SectionWrapper';

const iconMap = {
  Siren,
  HeartPulse,
  Brain,
  Baby,
  Flame,
  FlaskConical,
};

const colorPalette = [
  { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', border: 'border-red-200', accent: 'text-red-600' },
  { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', border: 'border-rose-200', accent: 'text-rose-600' },
  { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', border: 'border-orange-200', accent: 'text-orange-600' },
  { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-200', accent: 'text-amber-600' },
  { bg: 'bg-pink-50', icon: 'bg-pink-100 text-pink-600', border: 'border-pink-200', accent: 'text-pink-600' },
  { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-200', accent: 'text-purple-600' },
];

export default function EmergencyServices() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {EMERGENCY_SERVICES.map((service, index) => {
        const Icon = iconMap[service.icon] || Siren;
        const clr = colorPalette[index % colorPalette.length];

        return (
          <motion.div
            key={service.title}
            variants={itemVariant}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className={`relative rounded-2xl border ${clr.border} ${clr.bg} p-6 transition-shadow duration-300 hover:shadow-xl`}
          >
            {/* Number badge */}
            <span className="absolute top-4 right-4 text-4xl font-heading font-bold opacity-[0.07] select-none">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${clr.icon} mb-5`}>
              <Icon size={26} />
            </div>

            <h3 className="text-lg font-bold text-dark-900 mb-2">
              {service.title}
            </h3>

            <p className="text-sm text-dark-600 leading-relaxed">
              {service.description}
            </p>

            {/* Bottom accent line */}
            <div className={`mt-5 h-1 w-12 rounded-full ${clr.icon.split(' ')[0]}`} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
