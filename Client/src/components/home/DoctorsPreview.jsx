import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Star, MapPin } from 'lucide-react';
import SectionWrapper from '../ui/SectionWrapper';
import { doctorAPI } from '../../services/api';
import { cn } from '../../lib/cn';

// Fallback mock doctors
const MOCK_DOCTORS = [
  { _id: '1', name: 'Dr. Arun Kapoor', specialization: 'Cardiologist', department: { name: 'Cardiology' }, experience: 25, image: null },
  { _id: '2', name: 'Dr. Meena Reddy', specialization: 'Internal Medicine', department: { name: 'General Medicine' }, experience: 20, image: null },
  { _id: '3', name: 'Dr. Sanjay Gupta', specialization: 'Orthopedic Surgeon', department: { name: 'Orthopedics' }, experience: 22, image: null },
  { _id: '4', name: 'Dr. Priya Mehta', specialization: 'Pediatrician', department: { name: 'Pediatrics' }, experience: 15, image: null },
  { _id: '5', name: 'Dr. Nisha Verma', specialization: 'Neurologist', department: { name: 'Neurology' }, experience: 18, image: null },
  { _id: '6', name: 'Dr. Rajesh Iyer', specialization: 'Ophthalmologist', department: { name: 'Ophthalmology' }, experience: 16, image: null },
];

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

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DoctorsPreview() {
  const [doctors, setDoctors] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorAPI.getAll();
        const data = res?.doctors || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setDoctors(data.slice(0, 8));
        } else {
          setDoctors(MOCK_DOCTORS);
        }
      } catch {
        setDoctors(MOCK_DOCTORS);
      }
    };
    fetchDoctors();
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <SectionWrapper
      label="Our Doctors"
      title="Meet Our Expert Specialists"
      subtitle="Highly qualified and experienced medical professionals committed to your health and wellbeing."
      background="gray"
    >
      {/* Scroll controls */}
      <div className="flex items-center justify-end gap-2 mb-6 -mt-4">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-xl border border-gray-200 text-dark-500 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-xl border border-gray-200 text-dark-500 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Doctor Cards — Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
      >
        {doctors.map((doctor) => (
          <motion.div
            key={doctor._id}
            variants={itemVariant}
            className={cn(
              'flex-shrink-0 w-[260px] sm:w-[280px] snap-start',
              'bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300',
              'border border-gray-100 hover:border-primary-200 group overflow-hidden'
            )}
          >
            {/* Avatar / Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary-100 via-primary-50 to-purple-50 flex items-center justify-center overflow-hidden">
              {doctor.image || doctor.profileImage ? (
                <img
                  src={doctor.image || doctor.profileImage}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white shadow-soft flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {getInitials(doctor.name)}
                  </span>
                </div>
              )}
              {/* Overlay gradient */}
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/80 to-transparent" />
            </div>

            {/* Info */}
            <div className="p-5">
              <h3 className="font-heading font-bold text-dark-900 group-hover:text-primary-700 transition-colors">
                {doctor.name}
              </h3>
              <p className="text-sm text-primary-600 font-medium mt-0.5">
                {doctor.specialization || doctor.department?.name || 'Specialist'}
              </p>

              <div className="flex items-center gap-3 mt-3 text-xs text-dark-500">
                {doctor.experience && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-dark-400" />
                    {doctor.experience}+ yrs
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  4.9
                </span>
              </div>

              <Link
                to="/doctors"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 group-hover:gap-2.5 transition-all"
              >
                View Profile
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All */}
      <motion.div variants={itemVariant} className="text-center mt-10">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors group"
        >
          Meet All Our Doctors
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}
