import { useState, useEffect, useRef } from 'react';
import {
    X, Search, User, Heart, Calendar, MapPin, ShieldCheck,
    ArrowLeft, ArrowRight, Phone, Mail, Loader2, CheckCircle,
    Stethoscope, UserPlus, RotateCcw, AlertCircle
} from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { appointmentsAPI, departmentsAPI, doctorsAPI } from '../services/api';
import { toast } from 'sonner';
import './BookAppointmentModal.css';

const STEPS_NEW = [
    { key: 'personal', label: 'Personal Details', icon: User },
    { key: 'medical', label: 'Medical Info', icon: Heart },
    { key: 'appointment', label: 'Appointment', icon: Calendar },
    { key: 'additional', label: 'Additional Info', icon: MapPin },
    { key: 'verify', label: 'Verify', icon: ShieldCheck },
];

const STEPS_FOLLOWUP = [
    { key: 'personal', label: 'Personal Details', icon: User },
    { key: 'medical', label: 'Medical Info', icon: Heart },
    { key: 'additional', label: 'Additional Info', icon: MapPin },
    { key: 'appointment', label: 'Appointment', icon: Calendar },
    { key: 'verify', label: 'Verify', icon: ShieldCheck },
];

const BookAppointmentModal = ({ onClose, onSuccess, userRole }) => {
    // Phase: 'select' | 'lookup' | 'form'
    const [phase, setPhase] = useState('select');
    const [visitType, setVisitType] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [captchaToken, setCaptchaToken] = useState(null);
    const recaptchaRef = useRef(null);

    // Follow-up lookup
    const [lookupMobile, setLookupMobile] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [existingPatientId, setExistingPatientId] = useState('');

    // Data
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        gender: '',
        useAge: false,
        dateOfBirth: '',
        ageYears: '',
        ageMonths: '',
        mobileNumber: '',
        emailAddress: '',
        knownAllergies: 'No',
        allergiesDetails: '',
        reasonForVisit: '',
        primaryConcern: '',
        existingConditions: '',
        department: '',
        doctorAssigned: '',
        appointmentDate: '',
        appointmentTime: '',
        address: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
    });

    const steps = visitType === 'Follow-up' ? STEPS_FOLLOWUP : STEPS_NEW;

    useEffect(() => {
        fetchDepartments();
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (formData.appointmentDate) {
            fetchTimeSlots();
        }
    }, [formData.appointmentDate, formData.department]);

    const fetchDepartments = async () => {
        try {
            const res = await departmentsAPI.getAll();
            setDepartments(res.departments || res.data || res || []);
        } catch (err) {
            console.error('Fetch departments error:', err);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await doctorsAPI.getAll();
            setDoctors(res.data || res || []);
        } catch (err) {
            console.error('Fetch doctors error:', err);
        }
    };

    const fetchTimeSlots = async () => {
        try {
            setTimeSlotsLoading(true);
            const res = await appointmentsAPI.getTimeSlots(formData.appointmentDate, formData.department);
            setTimeSlots(res.timeSlots || []);
        } catch (err) {
            console.error('Fetch time slots error:', err);
            setTimeSlots([]);
        } finally {
            setTimeSlotsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'department') {
                updated.doctorAssigned = '';
            }
            return updated;
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleDOBChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
        if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
        setFormData(prev => ({ ...prev, dateOfBirth: value }));
        if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: '' }));
    };

    // --- VALIDATION ---
    const validatePersonal = () => {
        const e = {};
        if (!formData.fullName.trim()) e.fullName = 'Patient name is required';
        if (!formData.gender) e.gender = 'Gender is required';
        if (formData.useAge) {
            const y = parseInt(formData.ageYears);
            if (!formData.ageYears || isNaN(y) || y < 0 || y > 120) e.ageYears = 'Valid age required (0-120)';
            if (formData.ageMonths) {
                const m = parseInt(formData.ageMonths);
                if (isNaN(m) || m < 0 || m > 12) e.ageMonths = 'Months 0-12';
            }
        } else {
            if (!formData.dateOfBirth) {
                e.dateOfBirth = 'Date of birth is required';
            } else {
                const match = formData.dateOfBirth.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (!match) {
                    e.dateOfBirth = 'Invalid format (DD/MM/YYYY)';
                } else {
                    const d = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
                    if (d.getDate() !== parseInt(match[1]) || d.getMonth() !== parseInt(match[2]) - 1) e.dateOfBirth = 'Invalid date';
                    else if (d > new Date()) e.dateOfBirth = 'Cannot be future date';
                }
            }
        }
        if (!formData.mobileNumber.trim()) e.mobileNumber = 'Mobile number is required';
        else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) e.mobileNumber = 'Invalid (10 digits, start 6-9)';
        if (!formData.emailAddress) e.emailAddress = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) e.emailAddress = 'Invalid email';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateMedical = () => {
        const e = {};
        if (formData.knownAllergies === 'Yes' && !formData.allergiesDetails.trim()) e.allergiesDetails = 'Allergy details required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateAppointment = () => {
        const e = {};
        if (!formData.appointmentDate) {
            e.appointmentDate = 'Date is required';
        } else {
            const sel = new Date(formData.appointmentDate);
            const today = new Date(); today.setHours(0, 0, 0, 0);
            if (sel < today) e.appointmentDate = 'Cannot be past date';
            const max = new Date(); max.setDate(max.getDate() + 90);
            if (sel > max) e.appointmentDate = 'Max 90 days ahead';
        }
        if (!formData.appointmentTime) e.appointmentTime = 'Time is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateAdditional = () => true;

    const getValidator = (stepKey) => {
        switch (stepKey) {
            case 'personal': return validatePersonal;
            case 'medical': return validateMedical;
            case 'appointment': return validateAppointment;
            case 'additional': return validateAdditional;
            case 'verify': return () => true;
            default: return () => true;
        }
    };

    const handleNext = () => {
        const validator = getValidator(steps[currentStep].key);
        if (validator()) setCurrentStep(s => Math.min(s + 1, steps.length - 1));
    };

    const handleBack = () => {
        if (currentStep === 0) {
            setPhase('select');
            setVisitType('');
            setCaptchaToken(null);
        } else {
            setCurrentStep(s => s - 1);
        }
    };

    // --- VISIT TYPE SELECTION ---
    const handleSelectNew = () => {
        setVisitType('New Patient');
        setPhase('form');
        setCurrentStep(0);
    };

    const handleSelectFollowup = () => {
        setVisitType('Follow-up');
        setPhase('lookup');
    };

    // --- FOLLOW-UP LOOKUP ---
    const handleLookupPatient = async () => {
        if (!lookupMobile.trim()) { setLookupError('Enter mobile number'); return; }
        if (!/^[6-9]\d{9}$/.test(lookupMobile)) { setLookupError('Invalid mobile (10 digits, start 6-9)'); return; }

        setLookupLoading(true);
        setLookupError('');
        try {
            const res = await appointmentsAPI.lookupPatient(lookupMobile);
            const p = res.data;

            let dob = '', useAge = false, ageYears = '', ageMonths = '';
            if (p.dateOfBirth) {
                const d = new Date(p.dateOfBirth);
                dob = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            } else if (p.age != null) {
                useAge = true;
                ageYears = String(p.age);
                ageMonths = p.ageMonths ? String(p.ageMonths) : '';
            }

            setFormData(prev => ({
                ...prev,
                fullName: p.fullName || '',
                gender: p.gender || '',
                emailAddress: p.emailAddress || '',
                mobileNumber: p.mobileNumber || lookupMobile,
                useAge,
                dateOfBirth: dob,
                ageYears,
                ageMonths,
                knownAllergies: p.knownAllergies || 'No',
                allergiesDetails: p.allergiesDetails || '',
                existingConditions: p.existingConditions || '',
                address: p.address || '',
                emergencyContactName: p.emergencyContactName || '',
                emergencyContactNumber: p.emergencyContactNumber || '',
            }));
            setExistingPatientId(p.patientId || '');
            setPhase('form');
            setCurrentStep(0);
        } catch (err) {
            setLookupError(err?.response?.data?.message || err?.message || 'No patient found');
        } finally {
            setLookupLoading(false);
        }
    };

    // --- SUBMIT ---
    const handleSubmit = async () => {
        if (!captchaToken) { toast.error('Please complete the captcha'); return; }

        setSubmitting(true);
        try {
            let submission = {
                fullName: formData.fullName,
                gender: formData.gender,
                mobileNumber: formData.mobileNumber,
                emailAddress: formData.emailAddress,
                knownAllergies: formData.knownAllergies,
                allergiesDetails: formData.knownAllergies === 'Yes' ? formData.allergiesDetails : '',
                reasonForVisit: formData.reasonForVisit,
                primaryConcern: formData.primaryConcern,
                existingConditions: formData.existingConditions,
                department: formData.department,
                appointmentDate: formData.appointmentDate,
                appointmentTime: formData.appointmentTime,
                visitType: visitType,
                address: formData.address,
                emergencyContactName: formData.emergencyContactName,
                emergencyContactNumber: formData.emergencyContactNumber,
                captchaToken,
            };

            if (formData.doctorAssigned) submission.doctorAssigned = formData.doctorAssigned;

            if (formData.useAge) {
                submission.age = parseInt(formData.ageYears);
                if (formData.ageMonths) submission.ageMonths = parseInt(formData.ageMonths);
            } else if (formData.dateOfBirth) {
                const [dd, mm, yyyy] = formData.dateOfBirth.split('/');
                submission.dateOfBirth = new Date(`${yyyy}-${mm}-${dd}`);
                const dob = new Date(`${yyyy}-${mm}-${dd}`);
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
                submission.age = age;
            }

            if (existingPatientId) submission.patientId = existingPatientId;

            const res = await appointmentsAPI.book(submission);
            toast.success(`Appointment ${res.data.appointmentId} booked successfully!`);
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to book appointment');
            if (recaptchaRef.current) recaptchaRef.current.reset();
            setCaptchaToken(null);
        } finally {
            setSubmitting(false);
        }
    };

    // --- FILTERED DOCTORS ---
    const filteredDoctors = formData.department
        ? doctors.filter(doc => {
            if (doc.department?.name === formData.department) return true;
            if (Array.isArray(doc.departments) && doc.departments.some(d => d?.name === formData.department)) return true;
            return false;
        })
        : doctors;

    // --- TIME SLOTS FILTER ---
    const parseSlotMinutes = (slot) => {
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
        return timeSlots.filter(s => { const m = parseSlotMinutes(s); return m !== null && m > now; });
    };

    // --- RENDER ---
    const bookedByLabel = userRole === 'Admin' ? 'Admin Desk' : 'Reception Desk';

    return (
        <div className="bam-overlay" onClick={onClose}>
            <div className="bam-modal" onClick={e => e.stopPropagation()}>
                {/* HEADER */}
                <div className="bam-header">
                    <div className="bam-header-left">
                        <Calendar size={20} />
                        <div>
                            <h2>Book New Appointment</h2>
                            <p>{phase === 'select' ? 'Select patient type' : phase === 'lookup' ? 'Find patient records' : `Step ${currentStep + 1} of ${steps.length}`}</p>
                        </div>
                    </div>
                    <button className="bam-close" onClick={onClose}><X size={18} /></button>
                </div>

                {/* VISIT TYPE SELECTION */}
                {phase === 'select' && (
                    <div className="bam-body">
                        <p className="bam-select-subtitle">How would you like to proceed?</p>
                        <div className="bam-type-cards">
                            <button className="bam-type-card" onClick={handleSelectNew}>
                                <div className="bam-type-icon bam-type-new"><UserPlus size={24} /></div>
                                <h3>New Patient</h3>
                                <p>First-time patient. Fill all details from scratch.</p>
                            </button>
                            <button className="bam-type-card" onClick={handleSelectFollowup}>
                                <div className="bam-type-icon bam-type-followup"><RotateCcw size={24} /></div>
                                <h3>Follow-up</h3>
                                <p>Returning patient. Auto-fetch previous details.</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* FOLLOW-UP LOOKUP */}
                {phase === 'lookup' && (
                    <div className="bam-body">
                        <div className="bam-lookup-card">
                            <div className="bam-lookup-icon"><Search size={28} /></div>
                            <h3>Find Patient Records</h3>
                            <p>Enter the mobile number used in the previous appointment</p>
                            <div className="bam-lookup-row">
                                <div className="bam-lookup-input-wrap">
                                    <Phone size={16} className="bam-lookup-input-icon" />
                                    <input
                                        type="tel"
                                        value={lookupMobile}
                                        onChange={e => { setLookupMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setLookupError(''); }}
                                        className="bam-lookup-input"
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                        onKeyDown={e => e.key === 'Enter' && handleLookupPatient()}
                                    />
                                </div>
                                <button className="bam-lookup-btn" onClick={handleLookupPatient} disabled={lookupLoading}>
                                    {lookupLoading ? <Loader2 size={16} className="bam-spin" /> : <><Search size={16} /> Search</>}
                                </button>
                            </div>
                            {lookupError && <div className="bam-lookup-error"><AlertCircle size={14} /> {lookupError}</div>}
                        </div>
                        <div className="bam-footer">
                            <button className="bam-btn-outline" onClick={() => { setPhase('select'); setLookupMobile(''); setLookupError(''); }}>
                                <ArrowLeft size={16} /> Back
                            </button>
                        </div>
                    </div>
                )}

                {/* FORM STEPPER */}
                {phase === 'form' && (
                    <>
                        {/* Progress Bar */}
                        <div className="bam-stepper">
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                const isActive = idx === currentStep;
                                const isDone = idx < currentStep;
                                return (
                                    <div key={step.key} className={`bam-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                                        {idx > 0 && <div className="bam-step-line" />}
                                        <div className="bam-step-dot">
                                            {isDone ? <CheckCircle size={14} /> : <Icon size={14} />}
                                        </div>
                                        <span className="bam-step-label">{step.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bam-body bam-form-body">
                            {/* PERSONAL DETAILS */}
                            {steps[currentStep].key === 'personal' && (
                                <div className="bam-step-content">
                                    <h3 className="bam-section-title"><User size={18} /> Personal Details</h3>
                                    <div className="bam-grid">
                                        <div className="bam-field bam-col-full">
                                            <label>Full Name <span className="req">*</span></label>
                                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Patient's full name" className={errors.fullName ? 'err' : ''} />
                                            {errors.fullName && <span className="bam-err">{errors.fullName}</span>}
                                        </div>
                                        <div className="bam-field">
                                            <label>Gender <span className="req">*</span></label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className={errors.gender ? 'err' : ''}>
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.gender && <span className="bam-err">{errors.gender}</span>}
                                        </div>
                                        <div className="bam-field">
                                            <label className="bam-checkbox-label">
                                                <input type="checkbox" name="useAge" checked={formData.useAge} onChange={e => {
                                                    handleChange(e);
                                                    setFormData(prev => ({ ...prev, dateOfBirth: '', ageYears: '', ageMonths: '' }));
                                                }} />
                                                Enter age instead of DOB
                                            </label>
                                        </div>
                                        {formData.useAge ? (
                                            <>
                                                <div className="bam-field">
                                                    <label>Age (Years) <span className="req">*</span></label>
                                                    <input type="number" name="ageYears" value={formData.ageYears} onChange={handleChange} min="0" max="120" placeholder="0-120" className={errors.ageYears ? 'err' : ''} />
                                                    {errors.ageYears && <span className="bam-err">{errors.ageYears}</span>}
                                                </div>
                                                <div className="bam-field">
                                                    <label>Months (Optional)</label>
                                                    <input type="number" name="ageMonths" value={formData.ageMonths} onChange={handleChange} min="0" max="12" placeholder="0-12" className={errors.ageMonths ? 'err' : ''} />
                                                    {errors.ageMonths && <span className="bam-err">{errors.ageMonths}</span>}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bam-field">
                                                <label>Date of Birth <span className="req">*</span></label>
                                                <input type="text" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleDOBChange} maxLength="10" placeholder="DD/MM/YYYY" className={errors.dateOfBirth ? 'err' : ''} />
                                                {errors.dateOfBirth && <span className="bam-err">{errors.dateOfBirth}</span>}
                                                <small>Slashes added automatically</small>
                                            </div>
                                        )}
                                        <div className="bam-field">
                                            <label>Mobile Number <span className="req">*</span></label>
                                            <div className="bam-input-icon-wrap">
                                                <Phone size={15} className="bam-input-icon" />
                                                <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} maxLength="10" placeholder="10-digit number" className={errors.mobileNumber ? 'err' : ''} />
                                            </div>
                                            {errors.mobileNumber && <span className="bam-err">{errors.mobileNumber}</span>}
                                        </div>
                                        <div className="bam-field">
                                            <label>Email Address <span className="req">*</span></label>
                                            <div className="bam-input-icon-wrap">
                                                <Mail size={15} className="bam-input-icon" />
                                                <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} placeholder="email@example.com" className={errors.emailAddress ? 'err' : ''} />
                                            </div>
                                            {errors.emailAddress && <span className="bam-err">{errors.emailAddress}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MEDICAL INFO */}
                            {steps[currentStep].key === 'medical' && (
                                <div className="bam-step-content">
                                    <h3 className="bam-section-title"><Heart size={18} /> Medical Information</h3>
                                    <div className="bam-grid">
                                        <div className="bam-field">
                                            <label>Known Allergies <span className="req">*</span></label>
                                            <select name="knownAllergies" value={formData.knownAllergies} onChange={handleChange}>
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </div>
                                        {formData.knownAllergies === 'Yes' && (
                                            <div className="bam-field bam-col-full">
                                                <label>Allergy Details <span className="req">*</span></label>
                                                <textarea name="allergiesDetails" value={formData.allergiesDetails} onChange={handleChange} rows="2" placeholder="Specify allergies" className={errors.allergiesDetails ? 'err' : ''} />
                                                {errors.allergiesDetails && <span className="bam-err">{errors.allergiesDetails}</span>}
                                            </div>
                                        )}
                                        <div className="bam-field bam-col-full">
                                            <label>Reason for Visit</label>
                                            <textarea name="reasonForVisit" value={formData.reasonForVisit} onChange={handleChange} rows="2" placeholder="Why is the patient visiting?" />
                                        </div>
                                        <div className="bam-field bam-col-full">
                                            <label>Primary Concern</label>
                                            <textarea name="primaryConcern" value={formData.primaryConcern} onChange={handleChange} rows="2" placeholder="Main health concern" />
                                        </div>
                                        <div className="bam-field bam-col-full">
                                            <label>Existing Conditions</label>
                                            <textarea name="existingConditions" value={formData.existingConditions} onChange={handleChange} rows="2" placeholder="Any existing medical conditions" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* APPOINTMENT */}
                            {steps[currentStep].key === 'appointment' && (
                                <div className="bam-step-content">
                                    <h3 className="bam-section-title"><Calendar size={18} /> Appointment Details</h3>
                                    <div className="bam-grid">
                                        <div className="bam-field">
                                            <label>Department</label>
                                            <select name="department" value={formData.department} onChange={handleChange}>
                                                <option value="">Select Department</option>
                                                {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="bam-field">
                                            <label>Assign Doctor</label>
                                            <select name="doctorAssigned" value={formData.doctorAssigned} onChange={handleChange}>
                                                <option value="">Select Doctor (Optional)</option>
                                                {filteredDoctors.map(doc => (
                                                    <option key={doc._id} value={doc._id}>
                                                        {doc.user?.name || doc.name || 'Unknown'} — {doc.department?.name || doc.qualifications || 'N/A'}
                                                    </option>
                                                ))}
                                                {filteredDoctors.length === 0 && <option disabled>No doctors available</option>}
                                            </select>
                                        </div>
                                        <div className="bam-field">
                                            <label>Appointment Date <span className="req">*</span></label>
                                            <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} max={(() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split('T')[0]; })()} className={errors.appointmentDate ? 'err' : ''} />
                                            {errors.appointmentDate && <span className="bam-err">{errors.appointmentDate}</span>}
                                        </div>
                                        <div className="bam-field">
                                            <label>Appointment Time <span className="req">*</span></label>
                                            {timeSlotsLoading ? (
                                                <div className="bam-slot-loading"><Loader2 size={16} className="bam-spin" /> Loading slots...</div>
                                            ) : (
                                                <select name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} disabled={!formData.appointmentDate} className={errors.appointmentTime ? 'err' : ''}>
                                                    <option value="">Select Time</option>
                                                    {formData.appointmentDate && getFilteredTimeSlots().map((slot, i) => (
                                                        <option key={i} value={slot}>{slot}</option>
                                                    ))}
                                                    {formData.appointmentDate && getFilteredTimeSlots().length === 0 && <option disabled>No slots available</option>}
                                                </select>
                                            )}
                                            {errors.appointmentTime && <span className="bam-err">{errors.appointmentTime}</span>}
                                            {!formData.appointmentDate && <small>Select date first</small>}
                                        </div>
                                        <div className="bam-field bam-col-full">
                                            <label>Visit Type</label>
                                            <div className="bam-visit-badge-row">
                                                <span className={`bam-visit-badge ${visitType === 'Follow-up' ? 'followup' : 'newpt'}`}>
                                                    {visitType === 'Follow-up' ? <RotateCcw size={13} /> : <UserPlus size={13} />}
                                                    {visitType}
                                                </span>
                                                <span className="bam-booked-by">
                                                    <Stethoscope size={13} /> Booked by: <strong>{bookedByLabel}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ADDITIONAL INFO */}
                            {steps[currentStep].key === 'additional' && (
                                <div className="bam-step-content">
                                    <h3 className="bam-section-title"><MapPin size={18} /> Additional Information</h3>
                                    <div className="bam-grid">
                                        <div className="bam-field bam-col-full">
                                            <label>Address</label>
                                            <textarea name="address" value={formData.address} onChange={handleChange} rows="2" placeholder="Full address" />
                                        </div>
                                        <div className="bam-field">
                                            <label>Emergency Contact Name</label>
                                            <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Full name" />
                                        </div>
                                        <div className="bam-field">
                                            <label>Emergency Contact Number</label>
                                            <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} maxLength="10" placeholder="10-digit number" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* VERIFY */}
                            {steps[currentStep].key === 'verify' && (
                                <div className="bam-step-content">
                                    <h3 className="bam-section-title"><ShieldCheck size={18} /> Review & Confirm</h3>
                                    <div className="bam-review">
                                        <div className="bam-review-section">
                                            <h4>Personal Details</h4>
                                            <div className="bam-review-grid">
                                                <div><span>Name</span><strong>{formData.fullName}</strong></div>
                                                <div><span>Gender</span><strong>{formData.gender}</strong></div>
                                                {formData.useAge ? (
                                                    <div><span>Age</span><strong>{formData.ageYears} yrs {formData.ageMonths && `${formData.ageMonths} mo`}</strong></div>
                                                ) : (
                                                    <div><span>DOB</span><strong>{formData.dateOfBirth}</strong></div>
                                                )}
                                                <div><span>Mobile</span><strong>{formData.mobileNumber}</strong></div>
                                                <div><span>Email</span><strong>{formData.emailAddress}</strong></div>
                                            </div>
                                        </div>
                                        <div className="bam-review-section">
                                            <h4>Medical Info</h4>
                                            <div className="bam-review-grid">
                                                <div><span>Allergies</span><strong className={formData.knownAllergies === 'Yes' ? 'warn' : ''}>{formData.knownAllergies}</strong></div>
                                                {formData.knownAllergies === 'Yes' && formData.allergiesDetails && (
                                                    <div className="bam-review-full"><span>Allergy Details</span><strong className="warn">{formData.allergiesDetails}</strong></div>
                                                )}
                                                {formData.reasonForVisit && <div className="bam-review-full"><span>Reason</span><strong>{formData.reasonForVisit}</strong></div>}
                                                {formData.primaryConcern && <div className="bam-review-full"><span>Concern</span><strong>{formData.primaryConcern}</strong></div>}
                                                {formData.existingConditions && <div className="bam-review-full"><span>Conditions</span><strong>{formData.existingConditions}</strong></div>}
                                            </div>
                                        </div>
                                        <div className="bam-review-section">
                                            <h4>Appointment</h4>
                                            <div className="bam-review-grid">
                                                {formData.department && <div><span>Department</span><strong>{formData.department}</strong></div>}
                                                {formData.doctorAssigned && (
                                                    <div><span>Doctor</span><strong>{filteredDoctors.find(d => d._id === formData.doctorAssigned)?.user?.name || filteredDoctors.find(d => d._id === formData.doctorAssigned)?.name || 'Selected'}</strong></div>
                                                )}
                                                <div><span>Date</span><strong>{formData.appointmentDate ? new Date(formData.appointmentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</strong></div>
                                                <div><span>Time</span><strong>{formData.appointmentTime}</strong></div>
                                                <div><span>Visit Type</span><strong>{visitType}</strong></div>
                                                <div><span>Booked By</span><strong>{bookedByLabel}</strong></div>
                                            </div>
                                        </div>
                                        {(formData.address || formData.emergencyContactName) && (
                                            <div className="bam-review-section">
                                                <h4>Additional Info</h4>
                                                <div className="bam-review-grid">
                                                    {formData.address && <div className="bam-review-full"><span>Address</span><strong>{formData.address}</strong></div>}
                                                    {formData.emergencyContactName && <div><span>Emergency Contact</span><strong>{formData.emergencyContactName}</strong></div>}
                                                    {formData.emergencyContactNumber && <div><span>Contact Number</span><strong>{formData.emergencyContactNumber}</strong></div>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bam-captcha-wrap">
                                        <p className="bam-captcha-label">Verify you're not a robot</p>
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                            onChange={token => setCaptchaToken(token)}
                                            onExpired={() => setCaptchaToken(null)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FOOTER NAV */}
                        <div className="bam-footer">
                            <button className="bam-btn-outline" onClick={handleBack}>
                                <ArrowLeft size={16} /> {currentStep === 0 ? 'Back' : 'Previous'}
                            </button>
                            {currentStep < steps.length - 1 ? (
                                <button className="bam-btn-primary" onClick={handleNext}>
                                    Next <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    className={`bam-btn-submit ${submitting ? 'loading' : ''}`}
                                    onClick={handleSubmit}
                                    disabled={!captchaToken || submitting}
                                >
                                    {submitting ? (
                                        <><Loader2 size={16} className="bam-spin" /> Booking...</>
                                    ) : (
                                        <><CheckCircle size={16} /> Confirm & Book</>
                                    )}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookAppointmentModal;
