import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { HOSPITAL } from '../../lib/constants';
import { itemVariant } from '../ui/SectionWrapper';

export default function MapSection() {
  return (
    <motion.div
      variants={itemVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="rounded-2xl overflow-hidden ring-1 ring-gray-200 bg-white"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
            <MapPin size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-dark-900">Our Location</h3>
            <p className="text-xs text-dark-500">{HOSPITAL.address.full}</p>
          </div>
        </div>
        <a
          href={HOSPITAL.address.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-50 text-primary-600 text-sm font-semibold hover:bg-primary-100 transition-colors"
        >
          <Navigation size={14} />
          Get Directions
        </a>
      </div>

      {/* Map embed */}
      <div className="relative w-full h-[350px] md:h-[420px] bg-gray-100">
        <iframe
          title="Lifebridge Medical Center Location"
          src={HOSPITAL.address.embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
        />
      </div>

      {/* Mobile directions button */}
      <div className="sm:hidden px-6 py-4 border-t border-gray-100">
        <a
          href={HOSPITAL.address.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Navigation size={16} />
          Get Directions
        </a>
      </div>
    </motion.div>
  );
}
