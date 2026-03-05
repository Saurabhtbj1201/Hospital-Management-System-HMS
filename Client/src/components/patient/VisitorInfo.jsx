import { motion } from 'framer-motion';
import {
  Clock, Users, Flower2, ShieldAlert, Wifi, Coffee,
  ParkingCircle, Bed, Utensils, Phone,
} from 'lucide-react';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';
import { cn } from '../../lib/cn';

const VISITING_HOURS = [
  { label: 'General Wards', time: '4:00 PM – 7:00 PM', note: 'All days', icon: Users },
  { label: 'ICU / Critical Care', time: '11:00 AM – 11:30 AM & 5:00 PM – 5:30 PM', note: 'Max 2 visitors', icon: ShieldAlert },
  { label: 'Pediatric Ward', time: '10:00 AM – 12:00 PM & 4:00 PM – 7:00 PM', note: 'Parents may stay 24/7', icon: Flower2 },
  { label: 'Maternity Ward', time: '10:00 AM – 8:00 PM', note: 'One companion allowed', icon: Bed },
];

const VISITOR_RULES = [
  'Visitors must register at the reception and collect a visitor pass.',
  'A maximum of 2 visitors per patient is allowed at any time.',
  'Children under 12 are not permitted in ICU and critical care areas.',
  'Maintain silence in patient care areas and corridors.',
  'Use of mobile phones is restricted in ICU and operation theater zones.',
  'Flowers and outside food are not permitted in ICU.',
  'Visitors showing signs of illness should avoid visiting inpatients.',
  'Please sanitize hands before and after visiting patients.',
];

const AMENITIES = [
  { icon: Wifi, label: 'Free Wi-Fi', description: 'Complimentary high-speed internet across the campus.' },
  { icon: ParkingCircle, label: 'Parking', description: 'Multi-level parking with 500+ spaces and valet service.' },
  { icon: Coffee, label: 'Cafeteria', description: 'In-house cafeteria with healthy meals, snacks and beverages.' },
  { icon: Utensils, label: 'Dietary Meals', description: 'Custom meal plans prepared by certified dieticians for inpatients.' },
  { icon: Phone, label: '24/7 Helpline', description: 'Round-the-clock patient helpdesk and concierge service.' },
  { icon: Flower2, label: 'Chapel & Prayer', description: 'Multi-faith prayer room available on the ground floor.' },
];

export default function VisitorInfo() {
  return (
    <SectionWrapper
      label="Visitor Information"
      title="Visiting Hours & Facilities"
      subtitle="Plan your visit with ease — here's everything you need to know about visiting hours, rules, and the amenities available for patients and visitors."
      bg="purple"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── LEFT: Visiting Hours ── */}
        <div>
          <h3 className="font-heading font-bold text-dark-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary-600" /> Visiting Hours
          </h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-3"
          >
            {VISITING_HOURS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  variants={itemVariant}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-soft flex items-start gap-3.5 hover:shadow-card transition-shadow"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-900">{item.label}</p>
                    <p className="text-sm text-primary-700 font-medium">{item.time}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{item.note}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Visitor rules */}
          <div className="mt-8">
            <h3 className="font-heading font-bold text-dark-900 mb-4 flex items-center gap-2">
              <ShieldAlert size={20} className="text-primary-600" /> Visitor Guidelines
            </h3>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft">
              <ul className="space-y-2.5">
                {VISITOR_RULES.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-dark-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Amenities ── */}
        <div>
          <h3 className="font-heading font-bold text-dark-900 mb-4 flex items-center gap-2">
            <Coffee size={20} className="text-primary-600" /> Patient & Visitor Amenities
          </h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {AMENITIES.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  variants={itemVariant}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft hover:shadow-card transition-shadow group"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h4 className="font-heading font-bold text-dark-900 text-sm">{item.label}</h4>
                  <p className="text-xs text-dark-500 mt-1 leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Emergency note */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 bg-red-50 rounded-xl p-4 border border-red-100"
          >
            <h4 className="font-heading font-bold text-red-800 text-sm flex items-center gap-2">
              <Phone size={16} /> Emergency Contact
            </h4>
            <p className="text-sm text-red-700 mt-1">
              For medical emergencies, call <strong>108</strong> or our direct emergency line <strong>+91-9876500108</strong>. Our emergency department is open <strong>24/7</strong>.
            </p>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
