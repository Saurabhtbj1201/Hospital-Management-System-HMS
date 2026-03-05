import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Phone,
  Clock,
  Ambulance,
  MapPin,
  ArrowRight,
  Shield,
  Stethoscope,
} from 'lucide-react';
import { HOSPITAL } from '../../lib/constants';
import { containerVariants, itemVariant } from '../ui/SectionWrapper';

const STEPS = [
  {
    icon: Phone,
    title: 'Call Us',
    desc: 'Dial 108 or our direct emergency line for immediate response.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: Ambulance,
    title: 'Ambulance Dispatch',
    desc: 'Our GPS-equipped ambulance with paramedic crew is dispatched instantly.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Stethoscope,
    title: 'Triage & Assessment',
    desc: 'Rapid triage by trained emergency physicians within minutes of arrival.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Shield,
    title: 'Immediate Treatment',
    desc: 'State-of-the-art emergency care with specialist consultation as needed.',
    color: 'bg-emerald-100 text-emerald-600',
  },
];

export default function EmergencyProcess() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="space-y-10"
    >
      {/* Steps timeline */}
      <div className="relative">
        {/* Connector line (desktop) */}
        <div className="hidden md:block absolute top-10 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-0.5 bg-gradient-to-r from-red-300 via-orange-300 via-blue-300 to-emerald-300" />

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.title}
              variants={itemVariant}
              className="relative text-center"
            >
              {/* Step number on connector */}
              <div className="relative z-10 mx-auto mb-4">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${step.color} shadow-md`}>
                  <step.icon size={24} />
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-dark-900 text-white text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>
              <h4 className="text-base font-bold text-dark-900 mb-1">{step.title}</h4>
              <p className="text-sm text-dark-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA / info cards */}
      <motion.div
        variants={itemVariant}
        className="grid sm:grid-cols-3 gap-5"
      >
        {/* Card 1 — Call */}
        <div className="rounded-2xl bg-red-600 text-white p-6 flex flex-col items-center text-center">
          <Phone size={28} className="mb-3" />
          <h4 className="text-lg font-bold mb-1">Emergency Helpline</h4>
          <p className="text-white/80 text-sm mb-4">Available 24 hours, 7 days a week</p>
          <a
            href={`tel:${HOSPITAL.emergencyPhone}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-red-700 font-bold text-sm hover:bg-red-50 transition-colors"
          >
            <Phone size={16} />
            {HOSPITAL.emergencyPhone}
          </a>
        </div>

        {/* Card 2 — Timing */}
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
            <Clock size={24} />
          </div>
          <h4 className="text-lg font-bold text-dark-900 mb-1">Response Time</h4>
          <p className="text-dark-500 text-sm mb-2">Average ambulance response</p>
          <span className="text-3xl font-heading font-bold text-primary-600">&lt; 12 min</span>
          <p className="text-xs text-dark-400 mt-1">Within 15 km radius</p>
        </div>

        {/* Card 3 — Location */}
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <MapPin size={24} />
          </div>
          <h4 className="text-lg font-bold text-dark-900 mb-1">ER Location</h4>
          <p className="text-dark-500 text-sm mb-3">Ground Floor, Block A — directly accessible from main entrance</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            View on Map
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
