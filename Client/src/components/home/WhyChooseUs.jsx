import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import SectionWrapper from '../ui/SectionWrapper';
import { WHY_CHOOSE_US } from '../../lib/constants';
import { cn } from '../../lib/cn';

const itemVariant = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function WhyChooseUs() {
  return (
    <SectionWrapper
      label="Why Choose Us"
      title="Why Patients Trust Lifebridge"
      subtitle="Combining advanced medical technology with a compassionate, patient-first approach to deliver exceptional healthcare outcomes."
      background="white"
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left — Illustration card */}
        <motion.div
          variants={itemVariant}
          className="relative"
        >
          <div className="relative bg-gradient-to-br from-primary-50 via-primary-100/50 to-purple-50 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary-200/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl" />

            <div className="relative text-center">
              {/* Big icon */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-hero-gradient shadow-purple flex items-center justify-center">
                <Icons.HeartPulse className="text-white" size={44} />
              </div>

              <h3 className="text-2xl font-heading font-bold text-dark-900 mb-3">
                Committed to Excellence
              </h3>
              <p className="text-dark-500 leading-relaxed max-w-sm mx-auto mb-8">
                Every decision we make is guided by our commitment to improving patient lives through innovation, empathy, and clinical excellence.
              </p>

              {/* Highlight stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '99%', label: 'Patient Satisfaction' },
                  { value: '15min', label: 'Avg Wait Time' },
                  { value: '10K+', label: 'Surgeries/Year' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl py-3 px-2 shadow-soft">
                    <div className="text-lg font-bold text-primary-700">{s.value}</div>
                    <div className="text-xs text-dark-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right — Feature list */}
        <motion.div
          className="grid sm:grid-cols-2 gap-5"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {WHY_CHOOSE_US.map((feature, index) => {
            const Icon = Icons[feature.icon] || Icons.CheckCircle;
            return (
              <motion.div
                key={index}
                variants={itemVariant}
                className={cn(
                  'group flex gap-4 p-5 rounded-2xl transition-all duration-300',
                  'hover:bg-primary-50 hover:shadow-soft',
                  'border border-transparent hover:border-primary-100'
                )}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                  <Icon size={24} className="text-primary-600" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-dark-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-dark-500 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
