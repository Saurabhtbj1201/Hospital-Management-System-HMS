import { motion } from 'framer-motion';
import { Building2, CalendarDays } from 'lucide-react';
import SectionWrapper from '../ui/SectionWrapper';
import { MILESTONES, HOSPITAL } from '../../lib/constants';
import { cn } from '../../lib/cn';

export default function HospitalStory() {
  return (
    <SectionWrapper
      label="Our Journey"
      title="The Lifebridge Story"
      subtitle={`Founded in ${HOSPITAL.founded}, ${HOSPITAL.name} has grown from a 50‑bed facility into one of the most trusted multi‑specialty hospitals in the region.`}
    >
      {/* Intro paragraph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto text-center mb-16"
      >
        <p className="text-dark-500 leading-relaxed">
          What started as a small community clinic with a handful of dedicated professionals
          has transformed into a world-class healthcare institution serving over 50,000
          patients annually. Our journey is a story of relentless pursuit of excellence,
          compassion, and innovation.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 via-primary-500 to-primary-300 hidden md:block" />
        {/* Mobile left line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 via-primary-500 to-primary-300 md:hidden" />

        <div className="space-y-12 md:space-y-0">
          {MILESTONES.map((milestone, index) => {
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  'relative md:flex md:items-center md:mb-12',
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                )}
              >
                {/* Content Card */}
                <div className={cn('md:w-1/2', isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12')}>
                  <div
                    className={cn(
                      'ml-14 md:ml-0 bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-gray-100',
                      'group'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3 mb-2',
                        isLeft ? 'md:justify-end' : 'md:justify-start'
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold">
                        <CalendarDays size={14} />
                        {milestone.year}
                      </span>
                    </div>
                    <h3 className="text-lg font-heading font-bold text-dark-900 group-hover:text-primary-700 transition-colors">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-dark-500 mt-1 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Center dot — desktop */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center">
                  <span className="w-5 h-5 rounded-full bg-primary-600 border-4 border-white shadow-lg ring-2 ring-primary-200" />
                </div>

                {/* Left dot — mobile */}
                <div className="absolute left-6 -translate-x-1/2 flex md:hidden items-center justify-center top-6">
                  <span className="w-4 h-4 rounded-full bg-primary-600 border-[3px] border-white shadow ring-2 ring-primary-200" />
                </div>

                {/* Empty half — desktop */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-10"
        >
          <div className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-purple-lg">
            <Building2 size={24} />
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
