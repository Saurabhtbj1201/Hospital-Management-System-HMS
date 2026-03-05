import { motion } from 'framer-motion';
import {
  Award,
  ShieldCheck,
  Trophy,
  Star,
  BadgeCheck,
  Ribbon,
  TrendingUp,
  ThumbsUp,
} from 'lucide-react';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';
import CountUp from '../ui/CountUp';

const ACHIEVEMENT_STATS = [
  { icon: ThumbsUp, value: 99, suffix: '%', label: 'Patient Satisfaction' },
  { icon: TrendingUp, value: 50000, suffix: '+', label: 'Patients Served' },
  { icon: Award, value: 35, suffix: '+', label: 'Awards Won' },
  { icon: Star, value: 4.9, suffix: '/5', label: 'Average Rating', decimals: 1 },
];

const ACCREDITATIONS = [
  {
    icon: ShieldCheck,
    title: 'NABH Accredited',
    description: 'National Accreditation Board for Hospitals & Healthcare Providers — Gold Standard.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: BadgeCheck,
    title: 'JCI Certified',
    description: 'Joint Commission International certification for meeting global healthcare standards.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Trophy,
    title: 'Best Hospital Award',
    description: 'Recognized as "Best Multi‑Specialty Hospital" by Healthcare Excellence Awards 2024.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Ribbon,
    title: 'Green Hospital',
    description: 'Awarded Green OT Certification for sustainable and eco-friendly practices.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Award,
    title: 'ISO 9001:2015',
    description: 'Certified for quality management systems in healthcare delivery.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Star,
    title: 'Times Health Icon',
    description: 'Recognized by Times of India as a top healthcare institution for three consecutive years.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
];

export default function Achievements() {
  return (
    <SectionWrapper
      label="Achievements"
      title="Awards & Accreditations"
      subtitle="Our commitment to excellence has been recognized by major healthcare accreditation bodies and industry awards."
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {ACHIEVEMENT_STATS.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl p-6 text-center shadow-card border border-gray-100"
          >
            <CountUp
              end={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              icon={stat.icon}
              decimals={stat.decimals}
            />
          </motion.div>
        ))}
      </div>

      {/* Accreditation cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {ACCREDITATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              variants={itemVariant}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft hover:shadow-card hover:border-primary-200 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4`}>
                <Icon size={22} />
              </div>
              <h4 className="font-heading font-bold text-dark-900 mb-1 group-hover:text-primary-700 transition-colors">
                {item.title}
              </h4>
              <p className="text-sm text-dark-500 leading-relaxed">{item.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
