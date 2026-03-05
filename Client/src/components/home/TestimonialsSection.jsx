import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionWrapper from '../ui/SectionWrapper';
import TestimonialCard from '../ui/TestimonialCard';
import { TESTIMONIALS } from '../../lib/constants';
import { cn } from '../../lib/cn';

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // How many cards visible at once
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, TESTIMONIALS.length - visibleCount);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-slide every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const visibleTestimonials = TESTIMONIALS.slice(current, current + visibleCount);

  return (
    <SectionWrapper
      label="Testimonials"
      title="What Our Patients Say"
      subtitle="Hear from the people who trusted us with their health and experienced our commitment to care."
      background="white"
    >
      {/* Controls */}
      <div className="flex items-center justify-end gap-2 mb-6 -mt-4">
        <button
          onClick={prev}
          className="p-2 rounded-xl border border-gray-200 text-dark-500 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all"
          aria-label="Previous testimonials"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="p-2 rounded-xl border border-gray-200 text-dark-500 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all"
          aria-label="Next testimonials"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Cards */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === current ? 'w-8 bg-primary-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
