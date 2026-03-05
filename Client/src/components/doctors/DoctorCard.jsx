import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, GraduationCap, Calendar, ArrowRight, IndianRupee } from 'lucide-react';
import { cn } from '../../lib/cn';

// Gradient backgrounds for avatars
const AVATAR_GRADIENTS = [
  'from-primary-100 via-primary-50 to-purple-50',
  'from-blue-100 via-blue-50 to-indigo-50',
  'from-emerald-100 via-emerald-50 to-teal-50',
  'from-amber-100 via-amber-50 to-orange-50',
  'from-rose-100 via-rose-50 to-pink-50',
  'from-cyan-100 via-cyan-50 to-sky-50',
];

export function getInitials(name) {
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

/** Normalize the varying API / mock doctor shapes */
export function normalizeDoctorData(doc) {
  return {
    _id: doc._id,
    name: doc.user?.name || doc.name || 'Doctor',
    email: doc.user?.email || doc.email || '',
    phone: doc.user?.phone || doc.phone || '',
    department: doc.department?.name || doc.department || '',
    departmentId: doc.department?._id || null,
    specialization: doc.specialization || doc.shortBio || '',
    qualifications: doc.qualifications || '',
    experience: doc.experience || 0,
    fees: doc.fees || doc.defaultConsultationFee || 0,
    image: doc.profilePhotoUrl || doc.profilePhoto || doc.image || null,
    gender: doc.gender || '',
    shortBio: doc.shortBio || '',
    specialInterests: doc.specialInterests || [],
    featuredTreatments: doc.featuredTreatments || [],
    availableSlots: doc.availableSlots || [],
    testimonials: doc.patientTestimonials || [],
    rating: doc.rating || (doc.patientTestimonials?.length ? (doc.patientTestimonials.reduce((a, t) => a + (t.rating || 5), 0) / doc.patientTestimonials.length).toFixed(1) : null),
    isActive: doc.isActive ?? true,
  };
}

const itemVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DoctorCard({ doctor, index = 0 }) {
  const d = typeof doctor.name === 'undefined' && doctor.user ? normalizeDoctorData(doctor) : doctor;
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

  return (
    <motion.div
      variants={itemVariant}
      className={cn(
        'bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200',
        'transition-all duration-300 group flex flex-col'
      )}
    >
      {/* Avatar area */}
      <div className={cn('relative h-52 bg-gradient-to-br flex items-center justify-center', gradient)}>
        {d.image ? (
          <img
            src={d.image}
            alt={d.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white shadow-soft flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="text-3xl font-bold text-primary-600">{getInitials(d.name)}</span>
          </div>
        )}
        {/* Rating badge */}
        {d.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-xs font-semibold text-amber-600">
            <Star size={12} fill="currentColor" />
            {d.rating}
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1 -mt-3 relative z-10">
        <h3 className="font-heading font-bold text-lg text-dark-900 group-hover:text-primary-700 transition-colors">
          {d.name}
        </h3>
        <p className="text-sm text-primary-600 font-medium mt-0.5">
          {d.specialization || d.department || 'Specialist'}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-dark-500">
          {d.experience > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-primary-500" />
              {d.experience} yrs exp
            </span>
          )}
          {d.qualifications && (
            <span className="flex items-center gap-1 truncate max-w-[160px]">
              <GraduationCap size={13} className="text-primary-500" />
              {d.qualifications}
            </span>
          )}
          {d.fees > 0 && (
            <span className="flex items-center gap-1">
              <IndianRupee size={13} className="text-primary-500" />
              ₹{d.fees}
            </span>
          )}
        </div>

        {/* Available days */}
        {d.availableSlots?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            <Calendar size={13} className="text-primary-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {[...new Set(d.availableSlots.map((s) => s.day?.slice(0, 3)))].slice(0, 5).map((day) => (
                <span key={day} className="px-2 py-0.5 text-[10px] font-medium bg-primary-50 text-primary-700 rounded">
                  {day}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Spacer + link */}
        <div className="mt-auto pt-4">
          <Link
            to={`/doctors/${d._id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors group/link"
          >
            View Profile
            <ArrowRight size={15} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
