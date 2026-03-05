import { motion } from 'framer-motion';
import {
  Target,
  Eye,
  Heart,
  ShieldCheck,
  Lightbulb,
  Award,
  Users,
  Accessibility,
} from 'lucide-react';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';
import { MISSION_VISION_VALUES } from '../../lib/constants';
import { cn } from '../../lib/cn';

const ICON_MAP = {
  Target,
  Eye,
  Heart,
  ShieldCheck,
  Lightbulb,
  Award,
  Users,
  Accessibility,
};

export default function MissionVisionValues() {
  const { mission, vision, values } = MISSION_VISION_VALUES;

  return (
    <SectionWrapper
      label="What Drives Us"
      title="Our Mission, Vision & Values"
      subtitle="The guiding principles that shape every decision we make and every patient we serve."
      background="gray"
    >
      {/* Mission & Vision — side-by-side cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-14">
        {[mission, vision].map((item, i) => {
          const Icon = ICON_MAP[item.icon] || Target;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={cn(
                'relative overflow-hidden rounded-2xl p-8 md:p-10',
                i === 0
                  ? 'bg-gradient-to-br from-primary-600 to-primary-800 text-white'
                  : 'bg-white border border-gray-100 shadow-card'
              )}
            >
              {/* Decorative ring */}
              <div
                className={cn(
                  'absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10',
                  i === 0 ? 'bg-white' : 'bg-primary-400'
                )}
              />

              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-5',
                  i === 0
                    ? 'bg-white/20 text-white'
                    : 'bg-primary-50 text-primary-600'
                )}
              >
                <Icon size={28} />
              </div>

              <h3
                className={cn(
                  'text-xl font-heading font-bold mb-3',
                  i === 0 ? 'text-white' : 'text-dark-900'
                )}
              >
                {item.title}
              </h3>

              <p
                className={cn(
                  'leading-relaxed',
                  i === 0 ? 'text-primary-100' : 'text-dark-500'
                )}
              >
                {item.text}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Core Values — 3×2 grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {values.map((value) => {
          const Icon = ICON_MAP[value.icon] || Heart;
          return (
            <motion.div
              key={value.title}
              variants={itemVariant}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft hover:shadow-card hover:border-primary-200 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                <Icon size={22} />
              </div>
              <h4 className="font-heading font-bold text-dark-900 mb-1 group-hover:text-primary-700 transition-colors">
                {value.title}
              </h4>
              <p className="text-sm text-dark-500 leading-relaxed">{value.text}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
