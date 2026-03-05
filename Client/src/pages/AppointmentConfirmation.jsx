import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, User, Calendar, HeartPulse, MapPin,
  Home, CalendarPlus, Download,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { appointmentAPI } from '../services/api';
import { cn } from '../lib/cn';

export default function AppointmentConfirmation() {
  const location = useLocation();
  const { appointment, formData } = location.state || {};

  if (!appointment || !formData) {
    return <Navigate to="/book-appointment" replace />;
  }

  return (
    <>
      <PageHeader
        title="Appointment Confirmed"
        subtitle="Your appointment has been successfully booked."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Book Appointment', path: '/book-appointment' },
          { label: 'Confirmation' },
        ]}
      />

      <section className="section-padding bg-gray-50">
        <div className="container-custom max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden"
          >
            {/* Success header */}
            <div className="bg-gradient-to-r from-secondary-500 to-emerald-500 px-6 py-10 text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"
              >
                <CheckCircle2 size={44} />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold">Appointment Booked Successfully!</h1>
              <p className="text-white/80 mt-2 text-sm">Your appointment details are shown below.</p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* ID Badges */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-xl p-4 text-center border border-primary-100">
                  <span className="text-xs font-medium text-primary-500 uppercase tracking-wide">Appointment ID</span>
                  <p className="text-lg font-heading font-bold text-primary-700 mt-0.5">{appointment.appointmentId}</p>
                </div>
                <div className="bg-secondary-50 rounded-xl p-4 text-center border border-secondary-100">
                  <span className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Patient ID</span>
                  <p className="text-lg font-heading font-bold text-secondary-700 mt-0.5">{appointment.patientId}</p>
                </div>
              </div>

              {/* Detail sections */}
              <DetailSection title="Personal Details" icon={User}>
                <DetailItem label="Patient's Name" value={formData.patientName} />
                <DetailItem label="Gender" value={formData.gender} />
                <DetailItem
                  label={formData.useAge ? 'Age' : 'Date of Birth'}
                  value={formData.useAge ? `${formData.ageYears} years${formData.ageMonths ? ` ${formData.ageMonths} months` : ''}` : formData.dateOfBirth}
                />
                <DetailItem label="Mobile Number" value={formData.mobileNumber} />
                <DetailItem label="Email Address" value={formData.emailAddress} />
              </DetailSection>

              <DetailSection title="Appointment Details" icon={Calendar}>
                {formData.department && <DetailItem label="Department" value={formData.department} />}
                <DetailItem label="Date" value={formData.appointmentDate && new Date(formData.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                <DetailItem label="Time" value={formData.appointmentTime} />
                <DetailItem label="Visit Type" value={formData.visitType} />
              </DetailSection>

              <DetailSection title="Medical Information" icon={HeartPulse}>
                <DetailItem label="Known Allergies" value={formData.knownAllergies} />
                {formData.knownAllergies === 'Yes' && formData.allergiesDetails && (
                  <DetailItem label="Allergy Details" value={formData.allergiesDetails} full />
                )}
                {formData.reasonForVisit && <DetailItem label="Reason for Visit" value={formData.reasonForVisit} full />}
                {formData.primaryConcern && <DetailItem label="Primary Concern" value={formData.primaryConcern} full />}
                {formData.existingConditions && <DetailItem label="Existing Conditions" value={formData.existingConditions} full />}
              </DetailSection>

              {(formData.address || formData.emergencyContactName) && (
                <DetailSection title="Additional Information" icon={MapPin}>
                  {formData.address && <DetailItem label="Address" value={formData.address} full />}
                  {formData.emergencyContactName && <DetailItem label="Emergency Contact" value={formData.emergencyContactName} />}
                  {formData.emergencyContactNumber && <DetailItem label="Contact Number" value={formData.emergencyContactNumber} />}
                </DetailSection>
              )}

              {/* Note */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Please arrive 15 minutes before your scheduled time and bring a valid photo ID.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button as={Link} to="/" iconLeft={Home} className="flex-1 justify-center">
                  Back to Home
                </Button>
                <Button as={Link} to="/book-appointment" variant="outline" iconLeft={CalendarPlus} className="flex-1 justify-center">
                  Book Another
                </Button>
                {appointment.appointmentId && (
                  <Button
                    as="a"
                    href={appointmentAPI.downloadPDF(appointment._id || appointment.appointmentId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    iconLeft={Download}
                    className="flex-1 justify-center"
                  >
                    Download PDF
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ── Sub-components ──────────────────────────── */
function DetailSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
      <h3 className="font-heading font-bold text-dark-800 mb-3 flex items-center gap-2 text-sm">
        <Icon size={16} className="text-primary-600" /> {title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">{children}</div>
    </div>
  );
}

function DetailItem({ label, value, full }) {
  if (!value) return null;
  return (
    <div className={cn('py-1', full && 'sm:col-span-2')}>
      <span className="text-xs text-dark-400 block">{label}</span>
      <span className="text-sm text-dark-800 font-medium">{value}</span>
    </div>
  );
}
