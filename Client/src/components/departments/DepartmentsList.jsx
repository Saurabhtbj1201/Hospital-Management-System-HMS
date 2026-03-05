import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, X } from 'lucide-react';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';
import DepartmentCard from './DepartmentCard';
import { departmentAPI, appointmentAPI } from '../../services/api';
import { cn } from '../../lib/cn';

// Extended mock departments
const MOCK_DEPARTMENTS = [
  { _id: '1', name: 'Cardiology', description: 'Expert heart care with advanced cardiac diagnostics, interventional cardiology, and cardiac rehabilitation programs.', defaultConsultationFee: 800, services: [{ serviceName: 'ECG' }, { serviceName: 'Echocardiography' }, { serviceName: 'Angioplasty' }, { serviceName: 'Pacemaker Implant' }, { serviceName: 'Cardiac Rehab' }], contact: { phone: '+91-9876543201', location: 'Block A, 2nd Floor', workingHours: 'Mon-Sat 8AM-8PM' } },
  { _id: '2', name: 'Neurology', description: 'Comprehensive brain and nervous system care with cutting-edge neuroimaging, epilepsy monitoring, and stroke treatment.', defaultConsultationFee: 900, services: [{ serviceName: 'EEG' }, { serviceName: 'EMG/NCV' }, { serviceName: 'MRI Brain' }, { serviceName: 'Stroke Unit' }, { serviceName: 'Epilepsy Monitoring' }], contact: { phone: '+91-9876543202', location: 'Block B, 3rd Floor', workingHours: 'Mon-Sat 9AM-7PM' } },
  { _id: '3', name: 'Orthopedics', description: 'Joint replacement, spine surgery, sports medicine, and trauma care by leading orthopedic specialists.', defaultConsultationFee: 700, services: [{ serviceName: 'Joint Replacement' }, { serviceName: 'Spine Surgery' }, { serviceName: 'Sports Medicine' }, { serviceName: 'Fracture Care' }, { serviceName: 'Arthroscopy' }], contact: { phone: '+91-9876543203', location: 'Block A, 3rd Floor', workingHours: 'Mon-Sat 8AM-8PM' } },
  { _id: '4', name: 'Pediatrics', description: 'Child-friendly healthcare with specialized pediatric specialists, neonatal ICU, and developmental assessments.', defaultConsultationFee: 600, services: [{ serviceName: 'Well-Child Visits' }, { serviceName: 'Vaccinations' }, { serviceName: 'NICU' }, { serviceName: 'Pediatric Surgery' }, { serviceName: 'Growth Assessments' }], contact: { phone: '+91-9876543204', location: 'Block C, 1st Floor', workingHours: 'Mon-Sat 8AM-9PM' } },
  { _id: '5', name: 'Ophthalmology', description: 'Complete eye care including LASIK, cataract surgery, retinal treatments, and glaucoma management.', defaultConsultationFee: 500, services: [{ serviceName: 'LASIK' }, { serviceName: 'Cataract Surgery' }, { serviceName: 'Retinal Treatment' }, { serviceName: 'Glaucoma Care' }, { serviceName: 'Pediatric Eye Care' }], contact: { phone: '+91-9876543205', location: 'Block B, 1st Floor', workingHours: 'Mon-Sat 9AM-6PM' } },
  { _id: '6', name: 'General Medicine', description: 'Primary healthcare services for diagnosis, prevention, and management of common and chronic illnesses.', defaultConsultationFee: 500, services: [{ serviceName: 'Health Checkup' }, { serviceName: 'Chronic Disease Mgmt' }, { serviceName: 'Diabetes Care' }, { serviceName: 'Hypertension Mgmt' }], contact: { phone: '+91-9876543206', location: 'Block A, Ground Floor', workingHours: 'Mon-Sat 8AM-8PM' } },
  { _id: '7', name: 'General Surgery', description: 'Minimally invasive and robotic surgery by experienced surgeons across all specializations.', defaultConsultationFee: 800, services: [{ serviceName: 'Laparoscopic Surgery' }, { serviceName: 'Hernia Repair' }, { serviceName: 'Appendectomy' }, { serviceName: 'Gallbladder Surgery' }, { serviceName: 'Robotic Surgery' }], contact: { phone: '+91-9876543207', location: 'Block A, 4th Floor', workingHours: 'Mon-Sat 8AM-6PM' } },
  { _id: '8', name: 'Emergency Medicine', description: 'Round-the-clock emergency services with rapid response trauma and critical care teams.', defaultConsultationFee: 0, services: [{ serviceName: 'Trauma Care' }, { serviceName: 'Critical Care' }, { serviceName: 'Resuscitation' }, { serviceName: 'Triage' }], contact: { phone: '108', location: 'Ground Floor, Main Entrance', workingHours: '24/7 All Days' } },
  { _id: '9', name: 'Oncology', description: 'Comprehensive cancer diagnosis and treatment including chemotherapy, radiation therapy, and surgical oncology.', defaultConsultationFee: 1000, services: [{ serviceName: 'Chemotherapy' }, { serviceName: 'Radiation Therapy' }, { serviceName: 'Surgical Oncology' }, { serviceName: 'Immunotherapy' }, { serviceName: 'Palliative Care' }], contact: { phone: '+91-9876543209', location: 'Block D, 2nd Floor', workingHours: 'Mon-Sat 8AM-6PM' } },
  { _id: '10', name: 'Dermatology', description: 'Skin, hair, and nail care with advanced cosmetic dermatology and laser treatments.', defaultConsultationFee: 600, services: [{ serviceName: 'Acne Treatment' }, { serviceName: 'Laser Therapy' }, { serviceName: 'Hair Transplant' }, { serviceName: 'Skin Biopsy' }], contact: { phone: '+91-9876543210', location: 'Block C, 2nd Floor', workingHours: 'Mon-Sat 9AM-6PM' } },
  { _id: '11', name: 'ENT', description: 'Ear, nose, and throat specialists providing treatment for hearing disorders, sinus conditions, and throat ailments.', defaultConsultationFee: 600, services: [{ serviceName: 'Hearing Tests' }, { serviceName: 'Sinus Surgery' }, { serviceName: 'Tonsillectomy' }, { serviceName: 'Sleep Apnea Treatment' }], contact: { phone: '+91-9876543211', location: 'Block B, 2nd Floor', workingHours: 'Mon-Sat 9AM-7PM' } },
  { _id: '12', name: 'Gastroenterology', description: 'Digestive system care with endoscopy, colonoscopy, liver disease treatment, and GI surgery.', defaultConsultationFee: 800, services: [{ serviceName: 'Endoscopy' }, { serviceName: 'Colonoscopy' }, { serviceName: 'Liver Biopsy' }, { serviceName: 'ERCP' }, { serviceName: 'IBD Management' }], contact: { phone: '+91-9876543212', location: 'Block A, 1st Floor', workingHours: 'Mon-Sat 8AM-7PM' } },
];

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Try dedicated department API first
        let res = await departmentAPI.getAll();
        let data = res?.departments || res?.data || res;
        if (!Array.isArray(data) || data.length === 0) {
          // Fallback to appointment departments endpoint
          res = await appointmentAPI.getDepartments();
          data = res?.departments || res?.data || res;
        }
        if (Array.isArray(data) && data.length > 0) {
          setDepartments(data);
        } else {
          setDepartments(MOCK_DEPARTMENTS);
        }
      } catch {
        setDepartments(MOCK_DEPARTMENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.services?.some((s) => (s.serviceName || s).toLowerCase().includes(q))
    );
  }, [departments, search]);

  return (
    <SectionWrapper
      label="All Departments"
      title="Explore Our Departments"
      subtitle="Browse through our comprehensive range of medical departments — each staffed with experts and equipped with the latest technology."
    >
      {/* Search & view toggle toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 -mt-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments or services..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-dark-800 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-start">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-dark-400 hover:text-dark-600'
            )}
            aria-label="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-dark-400 hover:text-dark-600'
            )}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>

        {/* Count badge */}
        <span className="text-sm text-dark-400 self-center">
          {filtered.length} department{filtered.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className={cn('grid gap-5', viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Search size={48} className="mx-auto text-dark-300 mb-4" />
          <h3 className="text-xl font-heading font-bold text-dark-700">No departments found</h3>
          <p className="text-dark-400 mt-1">Try adjusting your search query.</p>
          <button
            onClick={() => setSearch('')}
            className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
          >
            Clear search
          </button>
        </motion.div>
      )}

      {/* Department cards */}
      {!loading && filtered.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={cn(
            'grid gap-5',
            viewMode === 'grid'
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 max-w-3xl'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((dept, i) => (
              <DepartmentCard
                key={dept._id || dept.name}
                department={dept}
                index={i}
                detailed={viewMode === 'list'}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </SectionWrapper>
  );
}
