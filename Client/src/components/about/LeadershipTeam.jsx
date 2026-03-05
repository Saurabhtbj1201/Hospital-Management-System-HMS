import { motion } from 'framer-motion';
import { Linkedin, Mail } from 'lucide-react';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';
import { LEADERSHIP } from '../../lib/constants';
import { cn } from '../../lib/cn';

function getInitials(name) {
  if (!name) return '??';
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Soft gradient backgrounds for each card
const GRADIENTS = [
  'from-primary-100 via-primary-50 to-purple-50',
  'from-blue-100 via-blue-50 to-indigo-50',
  'from-emerald-100 via-emerald-50 to-teal-50',
  'from-amber-100 via-amber-50 to-orange-50',
];

export default function LeadershipTeam() {
  return (
    <SectionWrapper
      label="Leadership"
      title="Meet Our Leadership Team"
      subtitle="Seasoned professionals guiding Lifebridge Medical Center with decades of combined expertise in healthcare and administration."
      background="gray"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {LEADERSHIP.map((leader, index) => (
          <motion.div
            key={leader.name}
            variants={itemVariant}
            className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border border-gray-100 hover:border-primary-200 transition-all duration-300 group"
          >
            {/* Avatar area */}
            <div
              className={cn(
                'relative h-52 flex items-center justify-center bg-gradient-to-br',
                GRADIENTS[index % GRADIENTS.length]
              )}
            >
              {leader.image ? (
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white shadow-soft flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-primary-600">
                    {getInitials(leader.name)}
                  </span>
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* Info */}
            <div className="p-5 text-center -mt-4 relative z-10">
              <h3 className="font-heading font-bold text-dark-900 text-lg group-hover:text-primary-700 transition-colors">
                {leader.name}
              </h3>
              <p className="text-sm text-primary-600 font-medium mt-0.5">
                {leader.title}
              </p>
              <p className="text-xs text-dark-400 mt-2 leading-relaxed line-clamp-3">
                {leader.bio}
              </p>

              {/* Social links (placeholder) */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  aria-label={`LinkedIn profile of ${leader.name}`}
                  className="w-8 h-8 rounded-lg bg-gray-100 text-dark-400 hover:bg-primary-50 hover:text-primary-600 flex items-center justify-center transition-colors"
                >
                  <Linkedin size={14} />
                </button>
                <button
                  aria-label={`Email ${leader.name}`}
                  className="w-8 h-8 rounded-lg bg-gray-100 text-dark-400 hover:bg-primary-50 hover:text-primary-600 flex items-center justify-center transition-colors"
                >
                  <Mail size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
