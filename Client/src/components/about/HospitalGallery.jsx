import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Building2, Stethoscope, FlaskConical, BedDouble, Baby, Dumbbell } from 'lucide-react';
import SectionWrapper from '../ui/SectionWrapper';
import { cn } from '../../lib/cn';

// Mock gallery items with placeholder colors (no real images)
const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Main Building — Entrance',
    category: 'Infrastructure',
    icon: Building2,
    gradient: 'from-primary-400 to-primary-600',
  },
  {
    id: 2,
    title: 'Advanced Operation Theater',
    category: 'Facilities',
    icon: Stethoscope,
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    id: 3,
    title: 'State-of-the-Art Lab',
    category: 'Diagnostics',
    icon: FlaskConical,
    gradient: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 4,
    title: 'Deluxe Patient Room',
    category: 'Patient Care',
    icon: BedDouble,
    gradient: 'from-amber-400 to-amber-600',
  },
  {
    id: 5,
    title: 'Neonatal ICU',
    category: 'Pediatrics',
    icon: Baby,
    gradient: 'from-rose-400 to-rose-600',
  },
  {
    id: 6,
    title: 'Rehabilitation Center',
    category: 'Wellness',
    icon: Dumbbell,
    gradient: 'from-teal-400 to-teal-600',
  },
];

const FILTER_TABS = ['All', ...new Set(GALLERY_ITEMS.map((g) => g.category))];

export default function HospitalGallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const filtered =
    activeFilter === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((g) => g.category === activeFilter);

  return (
    <SectionWrapper
      label="Gallery"
      title="A Glimpse Inside Lifebridge"
      subtitle="Explore our world-class infrastructure, modern facilities, and patient-centric spaces."
    >
      {/* Filter tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              activeFilter === tab
                ? 'bg-primary-600 text-white shadow-purple'
                : 'bg-gray-100 text-dark-500 hover:bg-primary-50 hover:text-primary-600'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => setLightbox(item)}
                className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-[4/3] shadow-card hover:shadow-card-hover transition-shadow duration-300"
              >
                {/* Gradient placeholder */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br',
                    item.gradient
                  )}
                />

                {/* Icon illustration */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90">
                  <Icon size={48} strokeWidth={1.5} />
                  <span className="mt-3 text-sm font-medium tracking-wide opacity-80">
                    {item.category}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2 text-white">
                    <ZoomIn size={28} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Close lightbox"
              >
                <X size={20} />
              </button>

              {/* Large gradient placeholder */}
              <div
                className={cn(
                  'aspect-video bg-gradient-to-br flex flex-col items-center justify-center text-white',
                  lightbox.gradient
                )}
              >
                {(() => {
                  const Icon = lightbox.icon;
                  return <Icon size={72} strokeWidth={1.2} />;
                })()}
                <h3 className="mt-4 text-2xl font-heading font-bold">
                  {lightbox.title}
                </h3>
                <span className="text-sm mt-1 opacity-80">{lightbox.category}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
