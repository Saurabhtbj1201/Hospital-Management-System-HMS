import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Phone,
  Siren,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { HOSPITAL } from '../../lib/constants';

export default function EmergencyBanner() {
  return (
    <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 overflow-hidden">
      {/* Pulse ring background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10 animate-pulse-soft" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/10 animate-pulse-soft delay-500" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container-custom py-14 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left — content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-bold uppercase tracking-wider mb-5 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              Available 24/7
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight mb-4">
              Emergency? <br />
              <span className="text-red-200">Don't Wait — Call Now</span>
            </h2>

            <p className="text-white/80 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
              Our emergency department is staffed 24/7 with experienced physicians, surgeons, and critical care nurses. Every second counts — reach us immediately.
            </p>

            {/* Quick info pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: Clock, text: '24/7 Open' },
                { icon: Siren, text: 'Level-I Trauma Center' },
                { icon: MapPin, text: 'Ground Floor, Block A' },
              ].map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm"
                >
                  <Icon size={15} className="text-red-200" />
                  {text}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${HOSPITAL.emergencyPhone}`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-red-700 font-bold text-base shadow-lg shadow-black/20 hover:bg-red-50 transition-colors"
              >
                <Phone size={20} className="animate-bounce" />
                Call {HOSPITAL.emergencyPhone}
              </a>
              <a
                href={`tel:${HOSPITAL.emergencyDirect}`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/15 text-white font-semibold text-base backdrop-blur-sm ring-1 ring-white/25 hover:bg-white/25 transition-colors"
              >
                <Phone size={18} />
                Direct: {HOSPITAL.emergencyDirect}
              </a>
            </div>
          </motion.div>

          {/* Right — emergency stats card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl ring-1 ring-white/20 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Emergency Department</h3>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { value: '<5 min', label: 'Avg. Triage Time' },
                  { value: '50+', label: 'ER Beds' },
                  { value: '10+', label: 'ICU Units' },
                  { value: '8', label: 'Ambulances' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-xl bg-white/10">
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-white/70 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/15">
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-200 hover:text-white transition-colors"
                >
                  Non-emergency? Book an appointment
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
