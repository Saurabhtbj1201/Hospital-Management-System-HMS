import { motion } from 'framer-motion';
import { ShieldCheck, BadgeCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';
import Button from '../ui/Button';
import { INSURANCE_PARTNERS } from '../../lib/constants';
import { cn } from '../../lib/cn';

/* ── Brand color palette for cards ── */
const BRAND_COLORS = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-primary-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
  'from-indigo-500 to-violet-600',
  'from-lime-500 to-green-600',
  'from-orange-500 to-red-500',
  'from-teal-500 to-emerald-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
];

export default function InsurancePartners() {
  return (
    <SectionWrapper
      label="Insurance & TPA"
      title="We Accept All Major Insurance"
      subtitle="We partner with leading health insurance providers to offer hassle-free cashless treatment. Bring your insurance card and we'll handle the rest."
      bg="light"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        {INSURANCE_PARTNERS.map((partner, i) => (
          <motion.div
            key={partner}
            variants={itemVariant}
            className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center text-center shadow-soft hover:shadow-card hover:border-primary-200 transition-all duration-300 group"
          >
            {/* Placeholder icon since we don't have logos */}
            <div className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform',
              BRAND_COLORS[i % BRAND_COLORS.length]
            )}>
              <ShieldCheck size={22} />
            </div>
            <p className="text-xs font-semibold text-dark-700 leading-tight">{partner}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Cashless note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 bg-gradient-to-r from-primary-50 via-purple-50 to-primary-50 rounded-2xl p-6 border border-primary-100 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <BadgeCheck size={28} className="text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-heading font-bold text-dark-900 text-sm">Cashless Treatment Available</h4>
            <p className="text-sm text-dark-500 mt-0.5">
              Our dedicated TPA desk processes insurance claims in-house. EMI options are available for major procedures through select banking partners.
            </p>
          </div>
        </div>
        <Button as={Link} to="/contact" variant="outline" size="sm" className="flex-shrink-0" iconRight={ArrowRight}>
          Contact Billing
        </Button>
      </motion.div>
    </SectionWrapper>
  );
}
