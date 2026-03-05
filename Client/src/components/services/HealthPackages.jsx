import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, Star, ArrowRight, Sparkles, ShieldCheck, IndianRupee,
} from 'lucide-react';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';
import Button from '../ui/Button';
import { HEALTH_PACKAGES } from '../../lib/constants';
import { cn } from '../../lib/cn';

const tierStyles = [
  {
    border: 'border-gray-200 hover:border-primary-200',
    badge: null,
    icon: ShieldCheck,
    iconBg: 'bg-primary-50 text-primary-600',
    priceBg: 'text-dark-900',
    cta: 'outline',
  },
  {
    border: 'border-primary-300 ring-2 ring-primary-100 hover:border-primary-400',
    badge: 'Most Popular',
    icon: Star,
    iconBg: 'bg-primary-100 text-primary-600',
    priceBg: 'text-primary-700',
    cta: 'primary',
  },
  {
    border: 'border-gray-200 hover:border-primary-200',
    badge: 'Comprehensive',
    icon: Sparkles,
    iconBg: 'bg-amber-50 text-amber-600',
    priceBg: 'text-dark-900',
    cta: 'outline',
  },
];

export default function HealthPackages() {
  return (
    <SectionWrapper
      label="Health Packages"
      title="Preventive Health Checkup Plans"
      subtitle="Early detection saves lives. Choose a health checkup package that suits your needs and stay ahead with regular preventive screenings."
      bg="purple"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid md:grid-cols-3 gap-6 lg:gap-8"
      >
        {HEALTH_PACKAGES.map((pkg, i) => {
          const style = tierStyles[i] || tierStyles[0];
          const Icon = style.icon;
          return (
            <motion.div
              key={pkg.id}
              variants={itemVariant}
              className={cn(
                'bg-white rounded-2xl border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative',
                style.border
              )}
            >
              {/* Badge */}
              {(pkg.badge || style.badge) && (
                <div className="absolute top-0 right-0">
                  <span className={cn(
                    'inline-block text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-xl',
                    i === 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-dark-600'
                  )}>
                    {pkg.badge || style.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="p-6 pb-4 text-center">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4', style.iconBg)}>
                  <Icon size={26} />
                </div>
                <h3 className="font-heading font-bold text-lg text-dark-900">{pkg.name}</h3>

                {/* Price */}
                <div className="mt-3 flex items-baseline justify-center gap-2">
                  <span className={cn('text-3xl font-heading font-extrabold', style.priceBg)}>
                    {pkg.price}
                  </span>
                  {pkg.originalPrice && (
                    <span className="text-sm text-dark-400 line-through">{pkg.originalPrice}</span>
                  )}
                </div>
                {pkg.originalPrice && (
                  <span className="inline-block mt-1 text-xs font-semibold text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full">
                    Save {calculateDiscount(pkg.price, pkg.originalPrice)}%
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-gray-100" />

              {/* Tests list */}
              <div className="p-6 pt-4 flex-1">
                <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-3">
                  Includes {pkg.tests.length} Tests
                </p>
                <ul className="space-y-2.5">
                  {pkg.tests.map((test, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-dark-700">
                      <Check size={16} className="text-secondary-500 flex-shrink-0 mt-0.5" />
                      <span>{test}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <Button
                  as={Link}
                  to="/book-appointment"
                  variant={style.cta}
                  size="lg"
                  className="w-full justify-center"
                  iconRight={ArrowRight}
                >
                  Book Package
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}

/* ── Extract numeric rupee value ── */
function parseRupee(str) {
  return parseInt(String(str).replace(/[^\d]/g, ''), 10) || 0;
}

function calculateDiscount(price, originalPrice) {
  const p = parseRupee(price);
  const o = parseRupee(originalPrice);
  if (!o) return 0;
  return Math.round(((o - p) / o) * 100);
}
