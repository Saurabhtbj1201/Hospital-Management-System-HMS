import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  GraduationCap,
  CalendarPlus,
  Calendar,
  Star,
  Heart,
  Award,
  IndianRupee,
  BadgeCheck,
  Sparkles,
  MessageSquareQuote,
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import SectionWrapper from '../ui/SectionWrapper';
import Button from '../ui/Button';
import { doctorAPI } from '../../services/api';
import { getInitials, normalizeDoctorData } from './DoctorCard';
import { cn } from '../../lib/cn';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await doctorAPI.getById(id);
        const data = res?.doctor || res?.data || res;
        if (data) {
          setDoctor(normalizeDoctorData(data));
        }
      } catch {
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
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
  if (!doctor) {
    return (
      <>
        <PageHeader
          title="Doctor Not Found"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Doctors', path: '/doctors' },
            { label: 'Not Found' },
          ]}
        />
        <div className="container-custom py-20 text-center">
          <h2 className="text-2xl font-heading font-bold text-dark-800 mb-2">
            Doctor profile not found
          </h2>
          <p className="text-dark-500 mb-6">
            The doctor you're looking for may have been removed or doesn't exist.
          </p>
          <Button as={Link} to="/doctors" iconLeft={ArrowLeft}>
            Back to Doctors
          </Button>
        </div>
      </>
    );
  }

  /* ── Main render ─────────── */
  const d = doctor;

  return (
    <>
      {/* Header */}
      <PageHeader
        title={d.name}
        subtitle={d.specialization || d.department}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Doctors', path: '/doctors' },
          { label: d.name },
        ]}
      />

      <SectionWrapper>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Left column (2/3) ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-card"
            >
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-100 via-primary-50 to-purple-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {d.image ? (
                    <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary-600">{getInitials(d.name)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-heading font-bold text-dark-900">{d.name}</h2>
                  <p className="text-primary-600 font-medium mt-0.5">
                    {d.specialization || d.department || 'Specialist'}
                  </p>

                  {/* Meta chips */}
                  <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-dark-600">
                    {d.experience > 0 && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <Clock size={14} className="text-primary-500" />
                        {d.experience} yrs experience
                      </span>
                    )}
                    {d.qualifications && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                        <GraduationCap size={14} className="text-primary-500" />
                        {d.qualifications}
                      </span>
                    )}
                    {d.rating && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
                        <Star size={14} fill="currentColor" />
                        {d.rating} rating
                      </span>
                    )}
                    {d.department && (
                      <Link
                        to={d.departmentId ? `/departments/${d.departmentId}` : '/departments'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 border border-primary-100 text-primary-700 hover:bg-primary-100 transition-colors"
                      >
                        <BadgeCheck size={14} />
                        {d.department}
                      </Link>
                    )}
                  </div>

                  {/* Short bio */}
                  {d.shortBio && d.shortBio !== d.specialization && (
                    <p className="mt-4 text-dark-500 leading-relaxed">{d.shortBio}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button as={Link} to="/book-appointment" iconLeft={CalendarPlus}>
                  Book Appointment
                </Button>
                {d.phone && (
                  <Button as="a" href={`tel:${d.phone}`} variant="outline" iconLeft={Phone}>
                    Call Now
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Special Interests */}
            {d.specialInterests?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-card"
              >
                <h3 className="text-lg font-heading font-bold text-dark-900 mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-primary-600" />
                  Areas of Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {d.specialInterests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 text-sm font-medium bg-primary-50 text-primary-700 rounded-full border border-primary-100"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Featured Treatments */}
            {d.featuredTreatments?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-card"
              >
                <h3 className="text-lg font-heading font-bold text-dark-900 mb-4 flex items-center gap-2">
                  <Award size={20} className="text-primary-600" />
                  Featured Treatments
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {d.featuredTreatments.map((treatment, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <Heart size={14} className="text-primary-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-dark-700">{treatment}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Patient Testimonials */}
            {d.testimonials?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-card"
              >
                <h3 className="text-lg font-heading font-bold text-dark-900 mb-5 flex items-center gap-2">
                  <MessageSquareQuote size={20} className="text-primary-600" />
                  Patient Testimonials
                </h3>
                <div className="space-y-4">
                  {d.testimonials.map((t, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            size={14}
                            className={s < (t.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                      {t.testimonial && (
                        <p className="text-sm text-dark-600 leading-relaxed italic">"{t.testimonial}"</p>
                      )}
                      {t.patientName && (
                        <p className="text-xs text-dark-400 mt-2 font-medium">— {t.patientName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right sidebar (1/3) ── */}
          <div className="space-y-6">
            {/* Consultation fee */}
            {d.fees > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card text-center"
              >
                <p className="text-sm text-dark-500 mb-1">Consultation Fee</p>
                <p className="text-3xl font-heading font-bold text-dark-900 flex items-center justify-center gap-1">
                  <IndianRupee size={22} className="text-primary-600" />
                  {d.fees}
                </p>
              </motion.div>
            )}

            {/* Availability */}
            {d.availableSlots?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card"
              >
                <h3 className="font-heading font-bold text-dark-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-primary-600" />
                  Availability
                </h3>
                <div className="space-y-2">
                  {d.availableSlots.map((slot, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 text-sm"
                    >
                      <span className="font-medium text-dark-700">{slot.day}</span>
                      {slot.startTime && slot.endTime && (
                        <span className="text-dark-400">{slot.startTime} – {slot.endTime}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white"
            >
              <h3 className="font-heading font-bold text-lg mb-2">Need a Consultation?</h3>
              <p className="text-primary-100 text-sm mb-5 leading-relaxed">
                Book an appointment with {d.name} today.
              </p>
              <Button as={Link} to="/book-appointment" variant="white" className="w-full justify-center" iconLeft={CalendarPlus}>
                Book Now
              </Button>
            </motion.div>

            {/* Contact */}
            {(d.email || d.phone) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card"
              >
                <h3 className="font-heading font-bold text-dark-900 mb-4">Contact</h3>
                <div className="space-y-3">
                  {d.phone && (
                    <a href={`tel:${d.phone}`} className="flex items-center gap-3 text-sm text-dark-600 hover:text-primary-600 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <Phone size={16} />
                      </div>
                      {d.phone}
                    </a>
                  )}
                  {d.email && (
                    <a href={`mailto:${d.email}`} className="flex items-center gap-3 text-sm text-dark-600 hover:text-primary-600 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <Mail size={16} />
                      </div>
                      {d.email}
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Back link */}
            <Link
              to="/doctors"
              className="flex items-center gap-2 text-sm font-medium text-dark-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to all doctors
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
