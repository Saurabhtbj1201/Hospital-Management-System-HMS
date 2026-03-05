import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Stethoscope,
  Syringe,
  Activity,
  Pill,
  Ribbon,
  Ear,
  Scan,
  ShieldPlus,
  Microscope,
  Dna,
  Scissors,
  ArrowRight,
  Phone,
  Clock,
  MapPin,
  IndianRupee,
} from 'lucide-react';
import { cn } from '../../lib/cn';

// Comprehensive icon map by department name keyword
const DEPT_ICON_MAP = {
  cardiology: Heart,
  neurology: Brain,
  orthopedic: Bone,
  pediatric: Baby,
  ophthalmology: Eye,
  'general medicine': Stethoscope,
  surgery: Scissors,
  emergency: ShieldPlus,
  oncology: Ribbon,
  dermatology: Scan,
  ent: Ear,
  radiology: Scan,
  pathology: Microscope,
  pharmacy: Pill,
  'internal medicine': Stethoscope,
  urology: Activity,
  gynecology: Dna,
  gastroenterology: Activity,
  pulmonology: Activity,
  nephrology: Activity,
  psychiatry: Brain,
  dental: Syringe,
};

export function getDeptIcon(name) {
  if (!name) return Activity;
  const lower = name.toLowerCase();
  const key = Object.keys(DEPT_ICON_MAP).find((k) => lower.includes(k));
  return DEPT_ICON_MAP[key] || Activity;
}

// Gentle gradient backgrounds for cards
const GRADIENTS = [
  'from-primary-50 to-purple-50',
  'from-blue-50 to-indigo-50',
  'from-emerald-50 to-teal-50',
  'from-amber-50 to-orange-50',
  'from-rose-50 to-pink-50',
  'from-cyan-50 to-sky-50',
];

const itemVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DepartmentCard({ department, index = 0, detailed = false }) {
  const Icon = getDeptIcon(department.name);
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const hasContact = department.contact && (department.contact.phone || department.contact.location || department.contact.workingHours);
  const fee = department.defaultConsultationFee;

  return (
    <motion.div
      variants={itemVariant}
      className={cn(
        'bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200',
        'transition-all duration-300 group flex flex-col'
      )}
    >
      {/* Top colored bar + icon */}
      <div className={cn('relative bg-gradient-to-br flex items-center justify-center', gradient)}>
        {department.imageUrl || department.image ? (
          <img
            src={department.imageUrl || department.image}
            alt={department.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white shadow-soft flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon size={36} className="text-primary-600" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-lg text-dark-900 group-hover:text-primary-700 transition-colors">
          {department.name}
        </h3>

        {department.description && (
          <p className={cn('text-sm text-dark-500 mt-1.5 leading-relaxed', !detailed && 'line-clamp-2')}>
            {department.description}
          </p>
        )}

        {/* Fee */}
        {fee > 0 && (
          <div className="flex items-center gap-1.5 mt-3 text-sm text-dark-600">
            <IndianRupee size={14} className="text-primary-600" />
            <span>Consultation: <span className="font-semibold text-dark-900">₹{fee}</span></span>
          </div>
        )}

        {/* Contact info (detailed mode) */}
        {detailed && hasContact && (
          <div className="mt-4 space-y-2 text-xs text-dark-500">
            {department.contact.phone && (
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-primary-500" />
                <span>{department.contact.phone}</span>
              </div>
            )}
            {department.contact.location && (
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-primary-500" />
                <span>{department.contact.location}</span>
              </div>
            )}
            {department.contact.workingHours && (
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-primary-500" />
                <span>{department.contact.workingHours}</span>
              </div>
            )}
          </div>
        )}

        {/* Services preview (detailed mode) */}
        {detailed && department.services?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-dark-700 uppercase tracking-wide mb-1.5">Key Services</p>
            <div className="flex flex-wrap gap-1.5">
              {department.services.slice(0, 4).map((s, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-[11px] font-medium bg-primary-50 text-primary-700 rounded-full"
                >
                  {s.serviceName || s}
                </span>
              ))}
              {department.services.length > 4 && (
                <span className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 text-dark-500 rounded-full">
                  +{department.services.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Spacer + link */}
        <div className="mt-auto pt-4">
          <Link
            to={`/departments/${department._id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors group/link"
          >
            View Department
            <ArrowRight size={15} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
