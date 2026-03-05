import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, X, SlidersHorizontal, PackageOpen } from 'lucide-react';
import SectionWrapper, { containerVariants } from '../ui/SectionWrapper';
import ServiceCard from './ServiceCard';
import { serviceAPI } from '../../services/api';
import { cn } from '../../lib/cn';

/* ── Mock services (fallback when API is empty / unreachable) ── */
const MOCK_SERVICES = [
  { _id: 's1', name: 'ECG / Echocardiography', description: 'Non-invasive cardiac diagnostics including electrocardiograms, 2D echocardiography, and stress testing to evaluate heart function.', department: { _id: '1', name: 'Cardiology' }, price: 1200 },
  { _id: 's2', name: 'Coronary Angioplasty', description: 'Minimally invasive procedure to open blocked coronary arteries using balloon catheters and stent placement.', department: { _id: '1', name: 'Cardiology' }, price: 85000 },
  { _id: 's3', name: 'MRI / CT Brain Scan', description: 'High-resolution neuroimaging for brain tumors, stroke, aneurysms, and other neurological conditions.', department: { _id: '2', name: 'Neurology' }, price: 6500 },
  { _id: 's4', name: 'EEG / EMG Testing', description: 'Electrophysiological studies for epilepsy monitoring, nerve conduction, and muscle disorders.', department: { _id: '2', name: 'Neurology' }, price: 3500 },
  { _id: 's5', name: 'Total Joint Replacement', description: 'Advanced hip and knee replacement surgeries with computer-assisted navigation and rapid recovery protocols.', department: { _id: '3', name: 'Orthopedics' }, price: 150000 },
  { _id: 's6', name: 'Arthroscopic Surgery', description: 'Minimally invasive joint surgery for sports injuries, torn ligaments, and cartilage repair.', department: { _id: '3', name: 'Orthopedics' }, price: 45000 },
  { _id: 's7', name: 'Well-Child Checkups', description: 'Scheduled pediatric health assessments, developmental screening, growth monitoring, and age-appropriate vaccinations.', department: { _id: '4', name: 'Pediatrics' }, price: 800 },
  { _id: 's8', name: 'LASIK Eye Surgery', description: 'Custom wavefront-guided laser vision correction for myopia, hyperopia, and astigmatism with same-day discharge.', department: { _id: '5', name: 'Ophthalmology' }, price: 35000 },
  { _id: 's9', name: 'Cataract Surgery', description: 'Phacoemulsification cataract removal with premium intraocular lens implants, day-care procedure.', department: { _id: '5', name: 'Ophthalmology' }, price: 25000 },
  { _id: 's10', name: 'Full Body Health Checkup', description: 'Comprehensive preventive screening including blood work, imaging, cardiac assessment, and specialist consultations.', department: { _id: '6', name: 'General Medicine' }, price: 3999 },
  { _id: 's11', name: 'Laparoscopic Surgery', description: 'Minimally invasive surgical procedures for gallbladder, hernia, appendix, and more — faster recovery, less scarring.', department: { _id: '7', name: 'General Surgery' }, price: 55000 },
  { _id: 's12', name: 'Chemotherapy / Immunotherapy', description: 'Targeted cancer treatment protocols with state-of-the-art chemotherapy suites and immunotherapy infusion centers.', department: { _id: '9', name: 'Oncology' }, price: 25000 },
  { _id: 's13', name: 'Radiation Therapy', description: 'Precision radiation treatment using linear accelerators, IMRT, and stereotactic radiosurgery for tumor targeting.', department: { _id: '9', name: 'Oncology' }, price: 35000 },
  { _id: 's14', name: 'Skin & Laser Treatment', description: 'Cosmetic and medical dermatology including laser resurfacing, chemical peels, vitiligo treatment, and acne therapy.', department: { _id: '10', name: 'Dermatology' }, price: 5000 },
  { _id: 's15', name: 'Endoscopy / Colonoscopy', description: 'Upper and lower GI endoscopic procedures for diagnosis and treatment of digestive disorders.', department: { _id: '12', name: 'Gastroenterology' }, price: 8000 },
  { _id: 's16', name: 'Emergency Trauma Care', description: 'Round-the-clock quality emergency services with rapid triage, advanced life support, and a multi-specialty trauma team.', department: { _id: '8', name: 'Emergency Medicine' }, price: 0 },
];

const departmentOptions = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Ophthalmology',
  'General Medicine', 'General Surgery', 'Emergency Medicine', 'Oncology',
  'Dermatology', 'Gastroenterology', 'ENT',
];

export default function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceAPI.getAll();
        const data = res?.services || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        } else {
          setServices(MOCK_SERVICES);
        }
      } catch {
        setServices(MOCK_SERVICES);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let list = services;
    if (deptFilter) {
      list = list.filter((s) => {
        const d = typeof s.department === 'object' ? s.department?.name : s.department;
        return d?.toLowerCase() === deptFilter.toLowerCase();
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          (typeof s.department === 'object' ? s.department?.name : s.department)?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [services, search, deptFilter]);

  /* ── Skeleton ── */
  const SkeletonGrid = () => (
    <div className={cn('grid gap-6', viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl mx-auto')}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-28 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <SectionWrapper
      label="All Services & Treatments"
      title="Explore Our Services"
      subtitle="We offer a comprehensive range of clinical and diagnostic services powered by the latest medical technologies."
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 -mt-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services, treatments…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-dark-800 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600" aria-label="Clear">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Department filter */}
        <div className="relative">
          <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-dark-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 appearance-none cursor-pointer transition-all"
          >
            <option value="">All Departments</option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-start">
          <button
            onClick={() => setViewMode('grid')}
            className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-400 hover:text-dark-600')}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-400 hover:text-dark-600')}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* ── Count badge ── */}
      {!loading && (
        <p className="text-sm text-dark-500 mb-6">
          Showing <span className="font-semibold text-primary-700">{filtered.length}</span> service{filtered.length !== 1 && 's'}
          {deptFilter && <> in <span className="font-semibold text-primary-700">{deptFilter}</span></>}
        </p>
      )}

      {/* ── Content ── */}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <PackageOpen size={60} className="mx-auto text-dark-300 mb-4" />
          <h3 className="text-lg font-heading font-bold text-dark-700">No services found</h3>
          <p className="text-sm text-dark-400 mt-1">Try a different search or filter.</p>
          {(search || deptFilter) && (
            <button
              onClick={() => { setSearch(''); setDeptFilter(''); }}
              className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 max-w-3xl mx-auto'
          )}
        >
          <AnimatePresence>
            {filtered.map((service, i) => (
              <ServiceCard key={service._id || i} service={service} index={i} viewMode={viewMode} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </SectionWrapper>
  );
}
