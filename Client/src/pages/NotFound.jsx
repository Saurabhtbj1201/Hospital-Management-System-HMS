import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  ArrowLeft,
  Stethoscope,
  CalendarCheck,
  Phone,
  HeartPulse,
} from 'lucide-react';
import { HOSPITAL } from '../lib/constants';

const QUICK_LINKS = [
  { icon: Home, label: 'Go Home', path: '/', color: 'bg-primary-100 text-primary-600' },
  { icon: Stethoscope, label: 'Find a Doctor', path: '/doctors', color: 'bg-blue-100 text-blue-600' },
  { icon: CalendarCheck, label: 'Book Appointment', path: '/book-appointment', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Phone, label: 'Contact Us', path: '/contact', color: 'bg-amber-100 text-amber-600' },
  { icon: HeartPulse, label: 'Emergency', path: '/emergency', color: 'bg-red-100 text-red-600' },
  { icon: Search, label: 'Our Services', path: '/services', color: 'bg-purple-100 text-purple-600' },
];

export default function NotFound() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative container-custom py-16 text-center">
        {/* Large 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="mb-6"
        >
          <h1 className="text-[10rem] md:text-[14rem] font-heading font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary-400 via-primary-600 to-primary-800 select-none">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-900 mb-3">
            Page Not Found
          </h2>
          <p className="text-dark-500 text-base md:text-lg max-w-lg mx-auto mb-10">
            The page you're looking for doesn't exist or has been moved. Let us help you find your way.
          </p>
        </motion.div>

        {/* Quick links grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10"
        >
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white ring-1 ring-gray-200 hover:ring-primary-300 hover:shadow-lg transition-all duration-200 group"
            >
              <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <link.icon size={22} />
              </div>
              <span className="text-sm font-semibold text-dark-700 group-hover:text-primary-700 transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-900 text-white font-semibold text-sm hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </motion.div>

        {/* Emergency info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-xs text-dark-400"
        >
          Need urgent help? Call{' '}
          <a href={`tel:${HOSPITAL.emergencyPhone}`} className="text-red-600 font-bold hover:underline">
            {HOSPITAL.emergencyPhone}
          </a>{' '}
          for 24/7 emergency services.
        </motion.p>
      </div>
    </section>
  );
}
