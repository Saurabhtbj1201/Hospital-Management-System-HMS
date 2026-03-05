import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Brain, Bone, Baby, Eye, Stethoscope, Syringe, Activity, Pill,
  Ribbon, Ear, Scan, ShieldPlus, Microscope, Dna, Scissors, ArrowRight,
  IndianRupee, Building2, CalendarPlus,
} from 'lucide-react';
import { cn } from '../../lib/cn';

/* ── Icon map (shared concept with DepartmentCard) ── */
const SERVICE_ICON_MAP = {
  cardiology: Heart, heart: Heart, cardiac: Heart, ecg: Heart, echo: Heart, angio: Heart,
  neurology: Brain, brain: Brain, eeg: Brain, stroke: Brain, epilepsy: Brain,
  orthopedic: Bone, joint: Bone, spine: Bone, fracture: Bone, bone: Bone,
  pediatric: Baby, child: Baby, neonatal: Baby, vaccination: Baby,
  ophthalmology: Eye, eye: Eye, lasik: Eye, cataract: Eye, retina: Eye,
  'general medicine': Stethoscope, checkup: Stethoscope, diabetes: Stethoscope,
  surgery: Scissors, laparoscopic: Scissors, hernia: Scissors, robotic: Scissors,
  emergency: ShieldPlus, trauma: ShieldPlus, critical: ShieldPlus,
  oncology: Ribbon, cancer: Ribbon, chemotherapy: Ribbon, radiation: Ribbon,
  dermatology: Scan, skin: Scan, laser: Scan, hair: Scan,
  ent: Ear, hearing: Ear, sinus: Ear, tonsil: Ear,
  radiology: Scan, 'ct scan': Scan, mri: Scan, 'x-ray': Scan, ultrasound: Scan,
  pathology: Microscope, lab: Microscope, blood: Microscope, biopsy: Microscope,
  pharmacy: Pill, medicine: Pill, drug: Pill,
  urology: Activity, kidney: Activity, nephrology: Activity,
  gynecology: Dna, obstetrics: Dna, pregnancy: Dna, fertility: Dna,
  gastroenterology: Activity, endoscopy: Activity, colonoscopy: Activity, liver: Activity,
  pulmonology: Activity, lung: Activity, respiratory: Activity,
  psychiatry: Brain, mental: Brain, counseling: Brain,
  dental: Syringe, tooth: Syringe,
};

export function getServiceIcon(name) {
  if (!name) return Activity;
  const lower = name.toLowerCase();
  const key = Object.keys(SERVICE_ICON_MAP).find((k) => lower.includes(k));
  return SERVICE_ICON_MAP[key] || Activity;
}

/* ── Gradient palette ── */
const GRADIENTS = [
  'from-primary-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
  'from-violet-500 to-fuchsia-600',
  'from-lime-500 to-green-600',
];

const itemVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ServiceCard({ service, index = 0, viewMode = 'grid' }) {
  const Icon = getServiceIcon(service.name);
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const deptName = typeof service.department === 'object' ? service.department?.name : service.department;

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={itemVariant}
        className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all duration-300 p-5 flex gap-5 items-start group"
      >
        {/* Icon */}
        <div className={cn('flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-md', gradient)}>
          <Icon size={26} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-heading font-bold text-dark-900 group-hover:text-primary-700 transition-colors text-lg">
                {service.name}
              </h3>
              {deptName && (
                <span className="inline-flex items-center gap-1 text-xs text-dark-500 mt-0.5">
                  <Building2 size={12} /> {deptName}
                </span>
              )}
            </div>
            {service.price > 0 && (
              <span className="flex-shrink-0 inline-flex items-center gap-0.5 bg-primary-50 text-primary-700 font-bold text-sm px-3 py-1 rounded-full border border-primary-100">
                <IndianRupee size={13} />{service.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {service.description && (
            <p className="text-sm text-dark-500 mt-2 leading-relaxed line-clamp-2">{service.description}</p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <Link
              to="/book-appointment"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
            >
              <CalendarPlus size={14} /> Book Appointment
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Grid card (default) ── */
  return (
    <motion.div
      variants={itemVariant}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all duration-300 group flex flex-col"
    >
      {/* Gradient header */}
      <div className={cn('relative bg-gradient-to-br px-5 pt-6 pb-10', gradient)}>
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon size={28} />
        </div>
        {service.price > 0 && (
          <span className="absolute top-4 right-4 inline-flex items-center gap-0.5 bg-white/20 backdrop-blur-sm text-white font-bold text-sm px-3 py-1 rounded-full">
            <IndianRupee size={13} />{service.price.toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 -mt-4 relative">
        <h3 className="font-heading font-bold text-lg text-dark-900 group-hover:text-primary-700 transition-colors">
          {service.name}
        </h3>

        {deptName && (
          <span className="inline-flex items-center gap-1 text-xs text-dark-500 mt-1">
            <Building2 size={12} /> {deptName}
          </span>
        )}

        {service.description && (
          <p className="text-sm text-dark-500 mt-2 leading-relaxed line-clamp-3">{service.description}</p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-4">
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors group/link"
          >
            <CalendarPlus size={14} /> Book Appointment
            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
