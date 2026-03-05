import { useState, useEffect } from 'react';
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
  ArrowRight,
} from 'lucide-react';
import SectionWrapper from '../ui/SectionWrapper';
import { appointmentAPI } from '../../services/api';
import { cn } from '../../lib/cn';

// Fallback department icon map
const deptIcons = {
  cardiology: Heart,
  neurology: Brain,
  orthopedics: Bone,
  pediatrics: Baby,
  ophthalmology: Eye,
  general: Stethoscope,
  surgery: Syringe,
  default: Activity,
};

// Fallback mock departments if API is unavailable
const MOCK_DEPARTMENTS = [
  { _id: '1', name: 'Cardiology', description: 'Expert heart care with advanced cardiac diagnostics, interventional procedures, and rehabilitation programs.' },
  { _id: '2', name: 'Neurology', description: 'Comprehensive brain and nervous system care with cutting-edge neuroimaging and treatment.' },
  { _id: '3', name: 'Orthopedics', description: 'Joint replacement, spine surgery, sports medicine, and trauma care by leading specialists.' },
  { _id: '4', name: 'Pediatrics', description: 'Child-friendly healthcare with specialized pediatric specialists and neonatal care.' },
  { _id: '5', name: 'Ophthalmology', description: 'Complete eye care including LASIK, cataract surgery, and retinal treatments.' },
  { _id: '6', name: 'General Medicine', description: 'Primary healthcare services for diagnosis, prevention, and treatment of common illnesses.' },
  { _id: '7', name: 'Surgery', description: 'Minimally invasive and robotic surgery by experienced surgeons across all specializations.' },
  { _id: '8', name: 'Emergency Medicine', description: 'Round-the-clock emergency services with rapid response trauma and critical care teams.' },
];

function getDeptIcon(name) {
  const key = Object.keys(deptIcons).find((k) =>
    name?.toLowerCase().includes(k)
  );
  return deptIcons[key] || deptIcons.default;
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DepartmentsPreview() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await appointmentAPI.getDepartments();
        const data = res?.departments || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setDepartments(data.slice(0, 8));
        } else {
          setDepartments(MOCK_DEPARTMENTS);
        }
      } catch {
        setDepartments(MOCK_DEPARTMENTS);
      }
    };
    fetchDepts();
  }, []);

  return (
    <SectionWrapper
      label="Departments"
      title="Specialized Medical Departments"
      subtitle="Over 30 dedicated departments equipped with the latest technology and staffed by renowned specialists."
      background="gray"
    >
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {departments.map((dept) => {
          const Icon = getDeptIcon(dept.name);
          return (
            <motion.div
              key={dept._id || dept.name}
              variants={itemVariant}
              className={cn(
                'group relative bg-white rounded-2xl p-6 shadow-card transition-all duration-300',
                'hover:shadow-card-hover hover:-translate-y-1',
                'border border-gray-100 hover:border-primary-200'
              )}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center mb-4 transition-colors">
                <Icon size={28} className="text-primary-600" />
              </div>

              {/* Name */}
              <h3 className="text-lg font-heading font-bold text-dark-900 mb-2 group-hover:text-primary-700 transition-colors">
                {dept.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-dark-500 leading-relaxed line-clamp-2 mb-4">
                {dept.description || 'Expert care with advanced technology and dedicated specialists.'}
              </p>

              {/* Link */}
              <Link
                to={`/departments`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 group-hover:gap-2.5 transition-all"
              >
                Learn More
                <ArrowRight size={14} />
              </Link>

              {/* Hover border-bottom accent */}
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
            </motion.div>
          );
        })}
      </motion.div>

      {/* View All */}
      <motion.div
        variants={itemVariant}
        className="text-center mt-10 md:mt-12"
      >
        <Link
          to="/departments"
          className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors group"
        >
          View All Departments
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}
