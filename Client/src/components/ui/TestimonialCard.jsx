import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function TestimonialCard({ testimonial, className }) {
  const { name, role, avatar, rating, text } = testimonial;

  // Generate initials from name
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300',
        'border border-gray-100 relative',
        className
      )}
    >
      {/* Quote mark */}
      <div className="absolute top-4 right-6 text-6xl text-primary-100 font-serif leading-none select-none">
        &ldquo;
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-4 relative z-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={cn(
              i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-dark-600 leading-relaxed mb-6 relative z-10 line-clamp-4">
        {text}
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 relative z-10">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-100"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
        )}
        <div>
          <h4 className="font-semibold text-dark-900 text-sm">{name}</h4>
          <p className="text-dark-500 text-xs">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}
