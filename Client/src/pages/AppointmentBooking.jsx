import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Mail, Calendar, Clock, MapPin, HeartPulse,
  ArrowLeft, ArrowRight, Check, Search, RotateCcw, Loader2,
  ShieldCheck, AlertCircle, Stethoscope,
} from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { appointmentAPI } from '../services/api';
import { cn } from '../lib/cn';

/* ═══════════════════════════════════════════════
   STEP METADATA
   ═══════════════════════════════════════════════ */
const STEPS = [
  { num: 1, label: 'Personal Details', icon: User },
  { num: 2, label: 'Medical Info', icon: HeartPulse },
  { num: 3, label: 'Appointment', icon: Calendar },
  { num: 4, label: 'Additional', icon: MapPin },
  { num: 5, label: 'Review', icon: ShieldCheck },
];

/* ═══════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════ */
const stepVariant = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

/* ═══════════════════════════════════════════════
   REUSABLE FORM ATOMS
   ═══════════════════════════════════════════════ */
const inputBase =
  'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-dark-800 placeholder:text-dark-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400';
const inputError = 'border-red-400 focus:ring-red-500/30 focus:border-red-400';
const inputOk = 'border-gray-200';

function FormGroup({ label, required, error, hint, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-dark-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-dark-400">{hint}</p>}
    </div>
  );
}

function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />}
      <input {...props} className={cn(inputBase, Icon && 'pl-10', props.error ? inputError : inputOk, props.className)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function AppointmentBooking() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [errors, setErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);

  // Follow-up lookup
  const [lookupMobile, setLookupMobile] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [patientFound, setPatientFound] = useState(false);
  const [existingPatientId, setExistingPatientId] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    patientName: '', gender: '', emailAddress: '', mobileNumber: '',
    useAge: false, dateOfBirth: '', ageYears: '', ageMonths: '',
    knownAllergies: 'No', allergiesDetails: '',
    reasonForVisit: '', primaryConcern: '', existingConditions: '',
    department: '', appointmentDate: '', appointmentTime: '', visitType: '',
    address: '', emergencyContactName: '', emergencyContactNumber: '',
  });

  /* ── Data fetching ──────────────────────────── */
  useEffect(() => { fetchDepartments(); }, []);

  useEffect(() => {
    if (formData.appointmentDate) fetchTimeSlots();
  }, [formData.appointmentDate, formData.department]);

  const fetchDepartments = async () => {
    try {
      const response = await appointmentAPI.getDepartments();
      const depts = Array.isArray(response) ? response : (response.departments || response.data || []);
      setDepartments(depts);
    } catch (error) { console.error('Error fetching departments:', error); }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await appointmentAPI.getTimeSlots(formData.appointmentDate, formData.department);
      setTimeSlots(response.timeSlots || []);
    } catch { setTimeSlots([]); }
  };

  /* ── Handlers ───────────────────────────────── */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDOBChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    setFormData((prev) => ({ ...prev, dateOfBirth: value }));
    if (errors.dateOfBirth) setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
  };

  /* ── Validation ─────────────────────────────── */
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (formData.useAge) {
      const y = parseInt(formData.ageYears);
      if (!formData.ageYears || isNaN(y) || y < 0 || y > 120) newErrors.ageYears = 'Valid age (0-120) is required';
      if (formData.ageMonths) {
        const m = parseInt(formData.ageMonths);
        if (isNaN(m) || m < 0 || m > 12) newErrors.ageMonths = 'Months must be 0-12';
      }
    } else {
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const match = formData.dateOfBirth.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!match) { newErrors.dateOfBirth = 'Invalid format (DD/MM/YYYY)'; }
        else {
          const [, dd, mm, yyyy] = match.map(Number);
          const d = new Date(yyyy, mm - 1, dd);
          if (d.getDate() !== dd || d.getMonth() !== mm - 1 || d.getFullYear() !== yyyy) newErrors.dateOfBirth = 'Invalid date';
          else if (d > new Date()) newErrors.dateOfBirth = 'Date cannot be in the future';
        }
      }
    }
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile (10 digits starting 6-9)';
    if (!formData.emailAddress) newErrors.emailAddress = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) newErrors.emailAddress = 'Invalid email address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.knownAllergies) newErrors.knownAllergies = 'Please specify';
    if (formData.knownAllergies === 'Yes' && !formData.allergiesDetails.trim()) newErrors.allergiesDetails = 'Please provide allergy details';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Date is required';
    } else {
      const sel = new Date(formData.appointmentDate);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (sel < today) newErrors.appointmentDate = 'Date cannot be in the past';
      const max = new Date(); max.setDate(max.getDate() + 90);
      if (sel > max) newErrors.appointmentDate = 'Date cannot be more than 90 days ahead';
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Time is required';
    } else if (formData.appointmentDate) {
      const today = new Date();
      const selDate = new Date(formData.appointmentDate);
      if (selDate.toDateString() === today.toDateString()) {
        const now = today.getHours() * 60 + today.getMinutes();
        const sm = parseSlotToMinutes(formData.appointmentTime);
        if (sm !== null && sm <= now) newErrors.appointmentTime = 'Selected time has already passed';
      }
    }
    if (!formData.visitType) newErrors.visitType = 'Visit type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseSlotToMinutes = (slot) => {
    if (!slot) return null;
    const m = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = parseInt(m[1]);
    const min = parseInt(m[2]);
    const p = m[3].toUpperCase();
    if (p === 'AM' && h === 12) h = 0;
    if (p === 'PM' && h !== 12) h += 12;
    return h * 60 + min;
  };

  const getFilteredTimeSlots = () => {
    const today = new Date();
    const sel = new Date(formData.appointmentDate);
    if (sel.toDateString() !== today.toDateString()) return timeSlots;
    const now = today.getHours() * 60 + today.getMinutes();
    return timeSlots.filter((s) => { const m = parseSlotToMinutes(s); return m !== null && m > now; });
  };

  /* ── Step navigation ────────────────────────── */
  const handleNext = () => {
    let valid = false;
    if (currentStep === 1) valid = validateStep1();
    else if (currentStep === 2) valid = validateStep2();
    else if (currentStep === 3) valid = validateStep3();
    else if (currentStep === 4) valid = true;
    if (valid) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
      setFormData((p) => ({ ...p, visitType: '' }));
      setPatientFound(false);
      setExistingPatientId('');
      setLookupMobile('');
      setLookupError('');
    } else if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  /* ── Visit type selection ───────────────────── */
  const handleVisitTypeSelect = (type) => {
    setFormData((p) => ({ ...p, visitType: type }));
    if (type === 'New Patient') setCurrentStep(1);
  };

  /* ── Follow-up lookup ───────────────────────── */
  const handleLookupPatient = async () => {
    if (!lookupMobile.trim()) { setLookupError('Please enter a mobile number'); return; }
    if (!/^[6-9]\d{9}$/.test(lookupMobile)) { setLookupError('Invalid mobile (10 digits starting 6-9)'); return; }
    setLookupLoading(true); setLookupError('');
    try {
      const response = await appointmentAPI.lookupPatient(lookupMobile);
      const patient = response.data;
      let dobFormatted = '', useAge = false, ageYears = '', ageMonths = '';
      if (patient.dateOfBirth) {
        const dob = new Date(patient.dateOfBirth);
        dobFormatted = `${String(dob.getDate()).padStart(2,'0')}/${String(dob.getMonth()+1).padStart(2,'0')}/${dob.getFullYear()}`;
      } else if (patient.age != null) {
        useAge = true; ageYears = String(patient.age); ageMonths = patient.ageMonths ? String(patient.ageMonths) : '';
      }
      setFormData((prev) => ({
        ...prev,
        patientName: patient.fullName || '', gender: patient.gender || '',
        emailAddress: patient.emailAddress || '', mobileNumber: patient.mobileNumber || lookupMobile,
        useAge, dateOfBirth: dobFormatted, ageYears, ageMonths,
        knownAllergies: patient.knownAllergies || 'No', allergiesDetails: patient.allergiesDetails || '',
        existingConditions: patient.existingConditions || '', address: patient.address || '',
        emergencyContactName: patient.emergencyContactName || '',
        emergencyContactNumber: patient.emergencyContactNumber || '',
        visitType: 'Follow-up',
      }));
      setExistingPatientId(patient.patientId || '');
      setPatientFound(true);
      setCurrentStep(1);
    } catch (error) {
      setLookupError(error.message || 'No patient found with this mobile number');
      setPatientFound(false);
    } finally { setLookupLoading(false); }
  };

  /* ── Submit ─────────────────────────────────── */
  const handleSubmit = async () => {
    if (!captchaToken) { alert('Please verify that you are not a robot'); return; }
    setLoading(true);
    try {
      let submissionData = {
        fullName: formData.patientName, gender: formData.gender,
        mobileNumber: formData.mobileNumber, emailAddress: formData.emailAddress,
        knownAllergies: formData.knownAllergies,
        allergiesDetails: formData.knownAllergies === 'Yes' ? formData.allergiesDetails : '',
        reasonForVisit: formData.reasonForVisit, primaryConcern: formData.primaryConcern,
        existingConditions: formData.existingConditions, department: formData.department,
        appointmentDate: formData.appointmentDate, appointmentTime: formData.appointmentTime,
        visitType: formData.visitType, address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber,
      };
      if (formData.useAge) {
        submissionData.age = parseInt(formData.ageYears);
        if (formData.ageMonths) submissionData.ageMonths = parseInt(formData.ageMonths);
      } else if (formData.dateOfBirth) {
        const [day, month, year] = formData.dateOfBirth.split('/');
        submissionData.dateOfBirth = new Date(`${year}-${month}-${day}`);
        const dob = new Date(`${year}-${month}-${day}`);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const md = today.getMonth() - dob.getMonth();
        if (md < 0 || (md === 0 && today.getDate() < dob.getDate())) age--;
        submissionData.age = age;
      }
      if (existingPatientId) submissionData.patientId = existingPatientId;
      const response = await appointmentAPI.createAppointment({ ...submissionData, captchaToken, source: 'Website' });
      const appointment = response.data;
      navigate('/appointment-confirmation', { state: { appointment, formData } });
    } catch (error) {
      alert(error.message || 'Failed to create appointment');
    } finally { setLoading(false); }
  };

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <>
      <PageHeader
        title="Book an Appointment"
        subtitle="Fill in the details below to schedule your visit with our specialists."
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Book Appointment' }]}
      />

      <section className="section-padding bg-gray-50">
        <div className="container-custom max-w-4xl">
          <AnimatePresence mode="wait">
            {/* ════════════ STEP 0 — Visit Type ════════════ */}
            {currentStep === 0 && (
              <motion.div key="step0" {...stepVariant}>
                <h2 className="text-2xl font-heading font-bold text-dark-900 text-center mb-8">
                  How would you like to proceed?
                </h2>
                <div className="grid sm:grid-cols-2 gap-5 max-w-xl mx-auto">
                  {/* New Patient */}
                  <button
                    onClick={() => handleVisitTypeSelect('New Patient')}
                    className={cn(
                      'rounded-2xl border-2 p-8 text-center transition-all duration-200 group',
                      formData.visitType === 'New Patient'
                        ? 'border-primary-500 bg-primary-50 shadow-purple'
                        : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-card'
                    )}
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <User size={28} />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-dark-900">New Patient</h3>
                    <p className="text-sm text-dark-500 mt-1">First time visiting? Start fresh.</p>
                  </button>

                  {/* Follow-up */}
                  <button
                    onClick={() => handleVisitTypeSelect('Follow-up')}
                    className={cn(
                      'rounded-2xl border-2 p-8 text-center transition-all duration-200 group',
                      formData.visitType === 'Follow-up'
                        ? 'border-secondary-500 bg-secondary-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-secondary-300 hover:shadow-card'
                    )}
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary-100 text-secondary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <RotateCcw size={28} />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-dark-900">Follow-up</h3>
                    <p className="text-sm text-dark-500 mt-1">Returning? We'll fetch your details.</p>
                  </button>
                </div>

                {/* Follow-up lookup */}
                <AnimatePresence>
                  {formData.visitType === 'Follow-up' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-8 max-w-md mx-auto bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
                        <h3 className="font-heading font-bold text-dark-900 mb-1 flex items-center gap-2">
                          <Search size={18} className="text-primary-600" />
                          Find Your Records
                        </h3>
                        <p className="text-sm text-dark-500 mb-4">Enter the mobile number from your previous appointment</p>

                        <div className="flex gap-2">
                          <IconInput
                            icon={Phone}
                            type="tel"
                            value={lookupMobile}
                            onChange={(e) => { setLookupMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setLookupError(''); }}
                            placeholder="10-digit mobile"
                            maxLength="10"
                            onKeyDown={(e) => e.key === 'Enter' && handleLookupPatient()}
                            error={lookupError}
                          />
                          <Button onClick={handleLookupPatient} disabled={lookupLoading} className="flex-shrink-0">
                            {lookupLoading ? <Loader2 size={16} className="animate-spin" /> : <><Search size={15} /> Search</>}
                          </Button>
                        </div>
                        {lookupError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={12} /> {lookupError}</p>}

                        <button
                          onClick={() => { setFormData((p) => ({ ...p, visitType: '' })); setLookupMobile(''); setLookupError(''); }}
                          className="mt-4 text-sm font-medium text-dark-500 hover:text-primary-600 flex items-center gap-1.5 transition-colors"
                        >
                          <ArrowLeft size={14} /> Back
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ════════════ STEPS 1-5 ════════════ */}
            {currentStep >= 1 && (
              <motion.div key="steps" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-10 gap-1">
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.num;
                    const isCompleted = currentStep > step.num;
                    return (
                      <div key={step.num} className="flex items-center flex-1 last:flex-initial">
                        <div className="flex flex-col items-center gap-1.5 relative z-10">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                              isCompleted && 'bg-primary-600 text-white shadow-purple',
                              isActive && 'bg-primary-600 text-white shadow-purple ring-4 ring-primary-100',
                              !isActive && !isCompleted && 'bg-gray-100 text-dark-400'
                            )}
                          >
                            {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                          </div>
                          <span className={cn('text-[10px] font-medium whitespace-nowrap hidden sm:block', isActive || isCompleted ? 'text-primary-700' : 'text-dark-400')}>
                            {step.label}
                          </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={cn('flex-1 h-0.5 mx-2 rounded', isCompleted ? 'bg-primary-500' : 'bg-gray-200')} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Step content card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    {/* ──── Step 1: Personal Details ──── */}
                    {currentStep === 1 && (
                      <motion.div key="s1" {...stepVariant}>
                        <h2 className="text-xl font-heading font-bold text-dark-900 mb-6 flex items-center gap-2">
                          <User size={20} className="text-primary-600" /> Personal Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <FormGroup label="Patient's Name" required error={errors.patientName} className="sm:col-span-2">
                            <input name="patientName" value={formData.patientName} onChange={handleInputChange} placeholder="Enter full name" className={cn(inputBase, errors.patientName ? inputError : inputOk)} />
                          </FormGroup>

                          <FormGroup label="Gender" required error={errors.gender}>
                            <select name="gender" value={formData.gender} onChange={handleInputChange} className={cn(inputBase, 'appearance-none cursor-pointer', errors.gender ? inputError : inputOk)}>
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </FormGroup>

                          {/* Age toggle */}
                          <div className="sm:col-span-2">
                            <label className="inline-flex items-center gap-2 text-sm text-dark-600 cursor-pointer">
                              <input type="checkbox" checked={formData.useAge} onChange={(e) => setFormData((p) => ({ ...p, useAge: e.target.checked, dateOfBirth: '', ageYears: '', ageMonths: '' }))} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                              I want to enter age instead of date of birth
                            </label>
                          </div>

                          {formData.useAge ? (
                            <>
                              <FormGroup label="Age (Years)" required error={errors.ageYears}>
                                <input type="number" name="ageYears" value={formData.ageYears} onChange={handleInputChange} min="0" max="120" placeholder="0-120" className={cn(inputBase, errors.ageYears ? inputError : inputOk)} />
                              </FormGroup>
                              <FormGroup label="Age (Months)" error={errors.ageMonths} hint="Optional">
                                <input type="number" name="ageMonths" value={formData.ageMonths} onChange={handleInputChange} min="0" max="12" placeholder="0-12" className={cn(inputBase, errors.ageMonths ? inputError : inputOk)} />
                              </FormGroup>
                            </>
                          ) : (
                            <FormGroup label="Date of Birth (DD/MM/YYYY)" required error={errors.dateOfBirth} hint="Slashes added automatically">
                              <input name="dateOfBirth" value={formData.dateOfBirth} onChange={handleDOBChange} maxLength="10" placeholder="DD/MM/YYYY" className={cn(inputBase, errors.dateOfBirth ? inputError : inputOk)} />
                            </FormGroup>
                          )}

                          <FormGroup label="Mobile Number" required error={errors.mobileNumber}>
                            <IconInput icon={Phone} type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} maxLength="10" placeholder="10-digit mobile" error={errors.mobileNumber} />
                          </FormGroup>

                          <FormGroup label="Email Address" required error={errors.emailAddress} className="sm:col-span-2">
                            <IconInput icon={Mail} type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} placeholder="your.email@example.com" error={errors.emailAddress} />
                          </FormGroup>
                        </div>

                        <StepNav onBack={handleBack} onNext={handleNext} backLabel="Visit Type" />
                      </motion.div>
                    )}

                    {/* ──── Step 2: Medical Info ──── */}
                    {currentStep === 2 && (
                      <motion.div key="s2" {...stepVariant}>
                        <h2 className="text-xl font-heading font-bold text-dark-900 mb-6 flex items-center gap-2">
                          <HeartPulse size={20} className="text-primary-600" /> Medical Information
                        </h2>
                        <div className="grid gap-5">
                          <FormGroup label="Known Allergies" required error={errors.knownAllergies}>
                            <select name="knownAllergies" value={formData.knownAllergies} onChange={handleInputChange} className={cn(inputBase, 'appearance-none cursor-pointer', errors.knownAllergies ? inputError : inputOk)}>
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          </FormGroup>

                          {formData.knownAllergies === 'Yes' && (
                            <FormGroup label="Allergy Details" required error={errors.allergiesDetails}>
                              <textarea name="allergiesDetails" value={formData.allergiesDetails} onChange={handleInputChange} rows="3" placeholder="Specify your allergies" className={cn(inputBase, 'resize-none', errors.allergiesDetails ? inputError : inputOk)} />
                            </FormGroup>
                          )}

                          <FormGroup label="Reason for Visit">
                            <textarea name="reasonForVisit" value={formData.reasonForVisit} onChange={handleInputChange} rows="3" placeholder="Why are you visiting?" className={cn(inputBase, inputOk, 'resize-none')} />
                          </FormGroup>

                          <FormGroup label="Primary Concern">
                            <textarea name="primaryConcern" value={formData.primaryConcern} onChange={handleInputChange} rows="3" placeholder="Describe your primary health concern" className={cn(inputBase, inputOk, 'resize-none')} />
                          </FormGroup>

                          <FormGroup label="Existing Conditions">
                            <textarea name="existingConditions" value={formData.existingConditions} onChange={handleInputChange} rows="3" placeholder="List existing medical conditions" className={cn(inputBase, inputOk, 'resize-none')} />
                          </FormGroup>
                        </div>

                        <StepNav onBack={handleBack} onNext={handleNext} />
                      </motion.div>
                    )}

                    {/* ──── Step 3: Appointment Details ──── */}
                    {currentStep === 3 && (
                      <motion.div key="s3" {...stepVariant}>
                        <h2 className="text-xl font-heading font-bold text-dark-900 mb-6 flex items-center gap-2">
                          <Calendar size={20} className="text-primary-600" /> Appointment Details
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <FormGroup label="Department" hint="Optional">
                            <div className="relative">
                              <Stethoscope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                              <select name="department" value={formData.department} onChange={handleInputChange} className={cn(inputBase, 'pl-10 appearance-none cursor-pointer', inputOk)}>
                                <option value="">Select Department</option>
                                {departments.map((dept) => (<option key={dept._id} value={dept.name}>{dept.name}</option>))}
                              </select>
                            </div>
                          </FormGroup>

                          <FormGroup label="Appointment Date" required error={errors.appointmentDate}>
                            <IconInput
                              icon={Calendar}
                              type="date"
                              name="appointmentDate"
                              value={formData.appointmentDate}
                              onChange={handleInputChange}
                              min={new Date().toISOString().split('T')[0]}
                              max={(() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split('T')[0]; })()}
                              error={errors.appointmentDate}
                            />
                          </FormGroup>

                          <FormGroup label="Appointment Time" required error={errors.appointmentTime} hint={!formData.appointmentDate ? 'Select a date first' : undefined}>
                            <div className="relative">
                              <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                              <select
                                name="appointmentTime"
                                value={formData.appointmentTime}
                                onChange={handleInputChange}
                                disabled={!formData.appointmentDate}
                                className={cn(inputBase, 'pl-10 appearance-none cursor-pointer', errors.appointmentTime ? inputError : inputOk, !formData.appointmentDate && 'opacity-50')}
                              >
                                <option value="">Select Time Slot</option>
                                {formData.appointmentDate && getFilteredTimeSlots().length > 0
                                  ? getFilteredTimeSlots().map((slot, i) => (<option key={i} value={slot}>{slot}</option>))
                                  : formData.appointmentDate && timeSlots.length === 0 && (<option disabled>No slots available</option>)
                                }
                              </select>
                            </div>
                            {formData.appointmentDate && getFilteredTimeSlots().length === 0 && timeSlots.length > 0 && (
                              <p className="text-xs text-red-500 mt-1">No slots remaining today. Select another date.</p>
                            )}
                          </FormGroup>

                          <div className="sm:col-span-2">
                            <p className="text-sm font-medium text-dark-700 mb-2">Visit Type</p>
                            <span className={cn(
                              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold',
                              formData.visitType === 'Follow-up' ? 'bg-secondary-50 text-secondary-700 border border-secondary-200' : 'bg-primary-50 text-primary-700 border border-primary-200'
                            )}>
                              {formData.visitType === 'Follow-up' ? <RotateCcw size={14} /> : <User size={14} />}
                              {formData.visitType}
                            </span>
                          </div>
                        </div>

                        <StepNav onBack={handleBack} onNext={handleNext} />
                      </motion.div>
                    )}

                    {/* ──── Step 4: Additional Info ──── */}
                    {currentStep === 4 && (
                      <motion.div key="s4" {...stepVariant}>
                        <h2 className="text-xl font-heading font-bold text-dark-900 mb-6 flex items-center gap-2">
                          <MapPin size={20} className="text-primary-600" /> Additional Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <FormGroup label="Address" className="sm:col-span-2">
                            <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" placeholder="Full address" className={cn(inputBase, inputOk, 'resize-none')} />
                          </FormGroup>
                          <FormGroup label="Emergency Contact Name">
                            <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} placeholder="Full name" className={cn(inputBase, inputOk)} />
                          </FormGroup>
                          <FormGroup label="Emergency Contact Number">
                            <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} maxLength="10" placeholder="10-digit number" className={cn(inputBase, inputOk)} />
                          </FormGroup>
                        </div>

                        <StepNav onBack={handleBack} onNext={handleNext} />
                      </motion.div>
                    )}

                    {/* ──── Step 5: Review & Submit ──── */}
                    {currentStep === 5 && (
                      <motion.div key="s5" {...stepVariant}>
                        <h2 className="text-xl font-heading font-bold text-dark-900 mb-6 flex items-center gap-2">
                          <ShieldCheck size={20} className="text-primary-600" /> Review & Submit
                        </h2>

                        <div className="space-y-5">
                          <ReviewBlock title="Personal Details" icon={User}>
                            <ReviewItem label="Name" value={formData.patientName} />
                            <ReviewItem label="Gender" value={formData.gender} />
                            <ReviewItem label={formData.useAge ? 'Age' : 'Date of Birth'} value={formData.useAge ? `${formData.ageYears} yrs${formData.ageMonths ? ` ${formData.ageMonths} mo` : ''}` : formData.dateOfBirth} />
                            <ReviewItem label="Mobile" value={formData.mobileNumber} />
                            <ReviewItem label="Email" value={formData.emailAddress} />
                          </ReviewBlock>

                          <ReviewBlock title="Medical Information" icon={HeartPulse}>
                            <ReviewItem label="Allergies" value={formData.knownAllergies} />
                            {formData.knownAllergies === 'Yes' && <ReviewItem label="Details" value={formData.allergiesDetails} full />}
                            {formData.reasonForVisit && <ReviewItem label="Reason" value={formData.reasonForVisit} full />}
                            {formData.primaryConcern && <ReviewItem label="Concern" value={formData.primaryConcern} full />}
                            {formData.existingConditions && <ReviewItem label="Conditions" value={formData.existingConditions} full />}
                          </ReviewBlock>

                          <ReviewBlock title="Appointment Details" icon={Calendar}>
                            {formData.department && <ReviewItem label="Department" value={formData.department} />}
                            <ReviewItem label="Date" value={formData.appointmentDate && new Date(formData.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                            <ReviewItem label="Time" value={formData.appointmentTime} />
                            <ReviewItem label="Visit Type" value={formData.visitType} />
                          </ReviewBlock>

                          {(formData.address || formData.emergencyContactName) && (
                            <ReviewBlock title="Additional Info" icon={MapPin}>
                              {formData.address && <ReviewItem label="Address" value={formData.address} full />}
                              {formData.emergencyContactName && <ReviewItem label="Emergency Contact" value={formData.emergencyContactName} />}
                              {formData.emergencyContactNumber && <ReviewItem label="Contact Number" value={formData.emergencyContactNumber} />}
                            </ReviewBlock>
                          )}
                        </div>

                        {/* Captcha */}
                        <div className="mt-8 text-center">
                          <p className="text-sm text-dark-500 mb-4">Please verify that you are not a robot to complete your booking.</p>
                          <div className="flex justify-center">
                            <ReCAPTCHA
                              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                              onChange={(token) => setCaptchaToken(token)}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                          <Button variant="outline" onClick={handleBack} iconLeft={ArrowLeft}>Back</Button>
                          <Button onClick={handleSubmit} disabled={!captchaToken || loading} loading={loading} iconLeft={Check} size="lg">
                            Confirm & Book
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */
function StepNav({ onBack, onNext, backLabel }) {
  return (
    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
      <Button variant="outline" onClick={onBack} iconLeft={ArrowLeft}>
        {backLabel || 'Back'}
      </Button>
      <Button onClick={onNext} iconRight={ArrowRight}>
        Next
      </Button>
    </div>
  );
}

function ReviewBlock({ title, icon: Icon, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
      <h3 className="font-heading font-bold text-dark-800 mb-3 flex items-center gap-2 text-sm">
        <Icon size={16} className="text-primary-600" /> {title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value, full }) {
  if (!value) return null;
  return (
    <div className={cn('py-1', full && 'sm:col-span-2')}>
      <span className="text-xs text-dark-400 block">{label}</span>
      <span className="text-sm text-dark-800 font-medium">{value}</span>
    </div>
  );
}
