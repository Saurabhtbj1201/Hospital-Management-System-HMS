import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, LayoutGrid, List } from 'lucide-react';
import SectionWrapper, { containerVariants } from '../ui/SectionWrapper';
import DoctorCard, { normalizeDoctorData } from './DoctorCard';
import { doctorAPI, departmentAPI, appointmentAPI } from '../../services/api';
import { cn } from '../../lib/cn';

// Extended mock doctors
const MOCK_DOCTORS = [
  { _id: '1', name: 'Dr. Arun Kapoor', specialization: 'Interventional Cardiologist', department: { _id: 'd1', name: 'Cardiology' }, experience: 25, qualifications: 'MD, DM Cardiology', fees: 800, shortBio: 'Interventional Cardiologist', specialInterests: ['Angioplasty', 'Heart Failure'], availableSlots: [{ day: 'Monday' }, { day: 'Wednesday' }, { day: 'Friday' }], patientTestimonials: [{ rating: 5 }] },
  { _id: '2', name: 'Dr. Meena Reddy', specialization: 'Internal Medicine', department: { _id: 'd6', name: 'General Medicine' }, experience: 20, qualifications: 'MD Medicine', fees: 500, shortBio: 'Internal Medicine Specialist', specialInterests: ['Diabetes', 'Hypertension'], availableSlots: [{ day: 'Monday' }, { day: 'Tuesday' }, { day: 'Thursday' }, { day: 'Saturday' }], patientTestimonials: [{ rating: 5 }, { rating: 4 }] },
  { _id: '3', name: 'Dr. Sanjay Gupta', specialization: 'Orthopedic Surgeon', department: { _id: 'd3', name: 'Orthopedics' }, experience: 22, qualifications: 'MS Ortho, Fellowship Joint Replacement', fees: 700, shortBio: 'Joint Replacement Specialist', specialInterests: ['Joint Replacement', 'Sports Medicine'], availableSlots: [{ day: 'Tuesday' }, { day: 'Thursday' }, { day: 'Saturday' }], patientTestimonials: [{ rating: 5 }] },
  { _id: '4', name: 'Dr. Priya Mehta', specialization: 'Pediatrician', department: { _id: 'd4', name: 'Pediatrics' }, experience: 15, qualifications: 'MD Pediatrics', fees: 600, shortBio: 'Child Healthcare Specialist', specialInterests: ['Neonatal Care', 'Vaccinations'], availableSlots: [{ day: 'Monday' }, { day: 'Wednesday' }, { day: 'Friday' }, { day: 'Saturday' }], patientTestimonials: [{ rating: 5 }, { rating: 5 }] },
  { _id: '5', name: 'Dr. Nisha Verma', specialization: 'Neurologist', department: { _id: 'd2', name: 'Neurology' }, experience: 18, qualifications: 'MD, DM Neurology', fees: 900, shortBio: 'Specialist in Epilepsy & Stroke', specialInterests: ['Epilepsy', 'Stroke', 'Movement Disorders'], availableSlots: [{ day: 'Monday' }, { day: 'Tuesday' }, { day: 'Thursday' }], patientTestimonials: [{ rating: 4 }] },
  { _id: '6', name: 'Dr. Rajesh Iyer', specialization: 'Ophthalmologist', department: { _id: 'd5', name: 'Ophthalmology' }, experience: 16, qualifications: 'MS Ophthalmology', fees: 500, shortBio: 'LASIK & Cataract Specialist', specialInterests: ['LASIK', 'Cataract', 'Retina'], availableSlots: [{ day: 'Monday' }, { day: 'Wednesday' }, { day: 'Friday' }], patientTestimonials: [{ rating: 5 }] },
  { _id: '7', name: 'Dr. Sunita Das', specialization: 'Gynecologist', department: { _id: 'd13', name: 'Gynecology' }, experience: 19, qualifications: 'MD Obstetrics & Gynecology', fees: 700, shortBio: "Women's Health Specialist", specialInterests: ['High-Risk Pregnancy', 'Laparoscopic Surgery'], availableSlots: [{ day: 'Tuesday' }, { day: 'Wednesday' }, { day: 'Friday' }], patientTestimonials: [{ rating: 5 }] },
  { _id: '8', name: 'Dr. Vikram Singh', specialization: 'Oncologist', department: { _id: 'd9', name: 'Oncology' }, experience: 21, qualifications: 'MD, DM Oncology', fees: 1000, shortBio: 'Medical Oncologist', specialInterests: ['Chemotherapy', 'Immunotherapy'], availableSlots: [{ day: 'Monday' }, { day: 'Thursday' }], patientTestimonials: [{ rating: 5 }, { rating: 5 }] },
  { _id: '9', name: 'Dr. Arjun Nair', specialization: 'Gastroenterologist', department: { _id: 'd12', name: 'Gastroenterology' }, experience: 14, qualifications: 'MD, DM Gastro', fees: 800, shortBio: 'Digestive Health Specialist', specialInterests: ['Endoscopy', 'Liver Disease', 'IBD'], availableSlots: [{ day: 'Monday' }, { day: 'Wednesday' }, { day: 'Saturday' }], patientTestimonials: [{ rating: 4 }] },
  { _id: '10', name: 'Dr. Kavitha Sharma', specialization: 'Dermatologist', department: { _id: 'd10', name: 'Dermatology' }, experience: 12, qualifications: 'MD Dermatology', fees: 600, shortBio: 'Skin & Cosmetic Specialist', specialInterests: ['Laser Treatments', 'Acne', 'Hair Loss'], availableSlots: [{ day: 'Tuesday' }, { day: 'Thursday' }, { day: 'Saturday' }], patientTestimonials: [{ rating: 5 }] },
  { _id: '11', name: 'Dr. Ramesh Patel', specialization: 'ENT Surgeon', department: { _id: 'd11', name: 'ENT' }, experience: 17, qualifications: 'MS ENT', fees: 600, shortBio: 'Head & Neck Surgeon', specialInterests: ['Sinus Surgery', 'Cochlear Implant'], availableSlots: [{ day: 'Monday' }, { day: 'Wednesday' }, { day: 'Friday' }], patientTestimonials: [{ rating: 4 }, { rating: 5 }] },
  { _id: '12', name: 'Dr. Ananya Bose', specialization: 'Psychiatrist', department: { _id: 'd14', name: 'Psychiatry' }, experience: 10, qualifications: 'MD Psychiatry', fees: 700, shortBio: 'Mental Health Specialist', specialInterests: ['Anxiety', 'Depression', 'CBT'], availableSlots: [{ day: 'Tuesday' }, { day: 'Thursday' }], patientTestimonials: [{ rating: 5 }] },
];

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorAPI.getAll();
        let data = res?.doctors || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setDoctors(data.map(normalizeDoctorData));
        } else {
          setDoctors(MOCK_DOCTORS.map(normalizeDoctorData));
        }
      } catch {
        setDoctors(MOCK_DOCTORS.map(normalizeDoctorData));
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch departments for filter dropdown
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        let res = await departmentAPI.getAll();
        let data = res?.departments || res?.data || res;
        if (!Array.isArray(data) || data.length === 0) {
          res = await appointmentAPI.getDepartments();
          data = res?.departments || res?.data || res;
        }
        if (Array.isArray(data)) {
          setDepartments(data.map((d) => d.name).sort());
        }
      } catch {
        // Extract unique depts from mock data
        const names = [...new Set(MOCK_DOCTORS.map((d) => d.department?.name).filter(Boolean))].sort();
        setDepartments(names);
      }
    };
    fetchDepts();
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    let result = doctors;

    if (deptFilter !== 'All') {
      result = result.filter((d) => d.department === deptFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.specialization?.toLowerCase().includes(q) ||
          d.department?.toLowerCase().includes(q) ||
          d.qualifications?.toLowerCase().includes(q) ||
          d.specialInterests?.some((s) => s.toLowerCase().includes(q))
      );
    }

    return result;
  }, [doctors, search, deptFilter]);

  return (
    <SectionWrapper
      label="Our Doctors"
      title="Find the Right Specialist"
      subtitle="Browse our team of 500+ expert doctors across 30+ departments. Search by name, specialization, or department."
    >
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-8 -mt-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialization..."
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

        {/* Department filter */}
        <div className="relative">
          <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 appearance-none cursor-pointer transition-all"
          >
            <option value="All">All Departments</option>
            {departments.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
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

        {/* Count */}
        <span className="text-sm text-dark-400 self-center whitespace-nowrap">
          {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className={cn('grid gap-5', viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-3xl')}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-52 bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Search size={48} className="mx-auto text-dark-300 mb-4" />
          <h3 className="text-xl font-heading font-bold text-dark-700">No doctors found</h3>
          <p className="text-dark-400 mt-1">Try adjusting your search or department filter.</p>
          <button
            onClick={() => { setSearch(''); setDeptFilter('All'); }}
            className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
          >
            Clear all filters
          </button>
        </motion.div>
      )}

      {/* Cards grid */}
      {!loading && filtered.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={cn(
            'grid gap-5',
            viewMode === 'grid'
              ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 max-w-3xl'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((doc, i) => (
              <DoctorCard key={doc._id} doctor={doc} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </SectionWrapper>
  );
}
