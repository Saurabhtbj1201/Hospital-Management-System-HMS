import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  IndianRupee,
  Stethoscope,
  CalendarPlus,
  Star,
  Users,
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';
import Button from '../ui/Button';
import { departmentAPI, doctorAPI } from '../../services/api';
import { getDeptIcon } from './DepartmentCard';
import { cn } from '../../lib/cn';

/* ── Helper ─────────────────────────────────── */
function getInitials(name) {
  if (!name) return '??';
  return name.replace(/^Dr\.\s*/i, '').split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

/* ── Component ──────────────────────────────── */
export default function DepartmentDetail() {
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await departmentAPI.getById(id);
        const dept = res?.department || res?.data || res;
        setDepartment(dept);

        // Doctors may come with the department response
        if (dept?.doctors?.length) {
          setDoctors(dept.doctors);
        } else {
          // Try fetching doctors filtered by department
          try {
            const docRes = await doctorAPI.getAll({ department: id });
            const docs = docRes?.doctors || docRes?.data || docRes;
            if (Array.isArray(docs)) setDoctors(docs);
          } catch {
            // no doctors available – that's fine
          }
        }
      } catch {
        setDepartment(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /* ── Loading ────────────── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Not found ──────────── */
  if (!department) {
    return (
      <>
        <PageHeader
          title="Department Not Found"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Departments', path: '/departments' },
            { label: 'Not Found' },
          ]}
        />
        <div className="container-custom py-20 text-center">
          <h2 className="text-2xl font-heading font-bold text-dark-800 mb-2">
            Oops! Department not found.
          </h2>
          <p className="text-dark-500 mb-6">
            The department you're looking for may have been removed or does not exist.
          </p>
          <Button as={Link} to="/departments" iconLeft={ArrowLeft}>
            Back to Departments
          </Button>
        </div>
      </>
    );
  }

  /* ── Main render ─────────── */
  const Icon = getDeptIcon(department.name);
  const hasContact = department.contact && Object.values(department.contact).some(Boolean);

  return (
    <>
      {/* Header */}
      <PageHeader
        title={department.name}
        subtitle={department.description}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Departments', path: '/departments' },
          { label: department.name },
        ]}
      />

      {/* Info Section */}
      <SectionWrapper>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — main info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-card"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Icon size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-dark-900">{department.name}</h2>
                  {department.defaultConsultationFee > 0 && (
                    <p className="text-sm text-dark-500 flex items-center gap-1 mt-0.5">
                      <IndianRupee size={13} /> Consultation from <span className="font-semibold text-dark-800">₹{department.defaultConsultationFee}</span>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-dark-600 leading-relaxed">{department.description}</p>

              <div className="mt-6">
                <Button as={Link} to="/book-appointment" iconLeft={CalendarPlus}>
                  Book Appointment
                </Button>
              </div>
            </motion.div>

            {/* Services */}
            {department.services?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-card"
              >
                <h3 className="text-lg font-heading font-bold text-dark-900 mb-5 flex items-center gap-2">
                  <Stethoscope size={20} className="text-primary-600" />
                  Services Offered
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {department.services.map((service, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <span className="text-sm font-medium text-dark-700">
                        {service.serviceName || service}
                      </span>
                      {service.fee > 0 && (
                        <span className="text-xs font-semibold text-primary-600">₹{service.fee}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Doctors in this department */}
            {doctors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-card"
              >
                <h3 className="text-lg font-heading font-bold text-dark-900 mb-5 flex items-center gap-2">
                  <Users size={20} className="text-primary-600" />
                  Doctors in {department.name}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {doctors.map((doc) => (
                    <Link
                      key={doc._id}
                      to={`/doctors/${doc._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:bg-primary-50/40 transition-all group"
                    >
                      {doc.profilePhotoUrl || doc.image ? (
                        <img src={doc.profilePhotoUrl || doc.image} alt={doc.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                          {getInitials(doc.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark-800 group-hover:text-primary-700 truncate transition-colors">
                          {doc.name}
                        </p>
                        <p className="text-xs text-dark-400 truncate">
                          {doc.specialization || doc.designation || 'Specialist'}
                          {doc.experience && ` · ${doc.experience} yrs`}
                        </p>
                      </div>
                      {doc.rating && (
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                          <Star size={12} fill="currentColor" /> {doc.rating}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right sidebar — contact info */}
          <div className="space-y-6">
            {/* Contact card */}
            {hasContact && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card"
              >
                <h3 className="font-heading font-bold text-dark-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {department.contact.phone && (
                    <a href={`tel:${department.contact.phone}`} className="flex items-center gap-3 text-sm text-dark-600 hover:text-primary-600 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <Phone size={16} />
                      </div>
                      {department.contact.phone}
                    </a>
                  )}
                  {department.contact.email && (
                    <a href={`mailto:${department.contact.email}`} className="flex items-center gap-3 text-sm text-dark-600 hover:text-primary-600 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <Mail size={16} />
                      </div>
                      {department.contact.email}
                    </a>
                  )}
                  {department.contact.location && (
                    <div className="flex items-center gap-3 text-sm text-dark-600">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} />
                      </div>
                      {department.contact.location}
                    </div>
                  )}
                  {department.contact.workingHours && (
                    <div className="flex items-center gap-3 text-sm text-dark-600">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <Clock size={16} />
                      </div>
                      {department.contact.workingHours}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Quick book CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white"
            >
              <h3 className="font-heading font-bold text-lg mb-2">Need a Consultation?</h3>
              <p className="text-primary-100 text-sm mb-5 leading-relaxed">
                Book an appointment with our {department.name} specialists today.
              </p>
              <Button as={Link} to="/book-appointment" variant="white" className="w-full justify-center" iconLeft={CalendarPlus}>
                Book Now
              </Button>
            </motion.div>

            {/* Back link */}
            <Link
              to="/departments"
              className="flex items-center gap-2 text-sm font-medium text-dark-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to all departments
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
