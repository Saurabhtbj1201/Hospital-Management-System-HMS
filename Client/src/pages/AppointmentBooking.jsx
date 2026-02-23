import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaUserMd, FaUser, FaPhone, FaEnvelope, FaCalendar, FaClock,
    FaMapMarkerAlt, FaHeartbeat, FaArrowLeft, FaCheck, FaSearch, FaRedoAlt
} from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';
import { appointmentAPI } from '../services/api';
import './AppointmentBooking.css';

const AppointmentBooking = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0); // 0 = visit type selection
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [errors, setErrors] = useState({});
    const [captchaToken, setCaptchaToken] = useState(null);

    // Follow-up lookup state
    const [lookupMobile, setLookupMobile] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [patientFound, setPatientFound] = useState(false);
    const [existingPatientId, setExistingPatientId] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        patientName: '',
        gender: '',
        emailAddress: '',
        mobileNumber: '',
        useAge: false,
        dateOfBirth: '',
        ageYears: '',
        ageMonths: '',
        knownAllergies: 'No',
        allergiesDetails: '',
        reasonForVisit: '',
        primaryConcern: '',
        existingConditions: '',
        department: '',
        appointmentDate: '',
        appointmentTime: '',
        visitType: '',
        address: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (formData.appointmentDate) {
            fetchTimeSlots();
        }
    }, [formData.appointmentDate, formData.department]);

    const fetchDepartments = async () => {
        try {
            const response = await appointmentAPI.getDepartments();
            const depts = Array.isArray(response) ? response : (response.departments || response.data || []);
            setDepartments(depts);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchTimeSlots = async () => {
        try {
            const response = await appointmentAPI.getTimeSlots(
                formData.appointmentDate,
                formData.department
            );
            setTimeSlots(response.timeSlots || []);
        } catch (error) {
            console.error('Error fetching time slots:', error);
            setTimeSlots([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDOBChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (value.length >= 5) {
            value = value.slice(0, 5) + '/' + value.slice(5, 9);
        }
        setFormData(prev => ({ ...prev, dateOfBirth: value }));
        if (errors.dateOfBirth) {
            setErrors(prev => ({ ...prev, dateOfBirth: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.patientName.trim()) {
            newErrors.patientName = 'Patient name is required';
        }
        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }
        if (formData.useAge) {
            const ageYears = parseInt(formData.ageYears);
            if (!formData.ageYears || isNaN(ageYears) || ageYears < 0 || ageYears > 120) {
                newErrors.ageYears = 'Valid age (0-120 years) is required';
            }
            if (formData.ageMonths) {
                const ageMonths = parseInt(formData.ageMonths);
                if (isNaN(ageMonths) || ageMonths < 0 || ageMonths > 12) {
                    newErrors.ageMonths = 'Months must be between 0-12';
                }
            }
        } else {
            if (!formData.dateOfBirth) {
                newErrors.dateOfBirth = 'Date of birth is required';
            } else {
                const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                const match = formData.dateOfBirth.match(dobRegex);
                if (!match) {
                    newErrors.dateOfBirth = 'Invalid date format (DD/MM/YYYY)';
                } else {
                    const day = parseInt(match[1]);
                    const month = parseInt(match[2]);
                    const year = parseInt(match[3]);
                    const date = new Date(year, month - 1, day);
                    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                        newErrors.dateOfBirth = 'Invalid date';
                    } else if (date > new Date()) {
                        newErrors.dateOfBirth = 'Date cannot be in the future';
                    }
                }
            }
        }
        if (!formData.mobileNumber.trim()) {
            newErrors.mobileNumber = 'Mobile number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Invalid mobile number (10 digits, starting with 6-9)';
        }
        if (!formData.emailAddress) {
            newErrors.emailAddress = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
            newErrors.emailAddress = 'Invalid email address';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.knownAllergies) {
            newErrors.knownAllergies = 'Please specify if you have allergies';
        }
        if (formData.knownAllergies === 'Yes' && !formData.allergiesDetails.trim()) {
            newErrors.allergiesDetails = 'Please provide allergy details';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.appointmentDate) {
            newErrors.appointmentDate = 'Appointment date is required';
        } else {
            const selected = new Date(formData.appointmentDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selected < today) {
                newErrors.appointmentDate = 'Date cannot be in the past';
            }
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 90);
            if (selected > maxDate) {
                newErrors.appointmentDate = 'Date cannot be more than 90 days in the future';
            }
        }
        if (!formData.appointmentTime) {
            newErrors.appointmentTime = 'Appointment time is required';
        } else if (formData.appointmentDate) {
            const today = new Date();
            const selectedDate = new Date(formData.appointmentDate);
            if (selectedDate.toDateString() === today.toDateString()) {
                const now = today.getHours() * 60 + today.getMinutes();
                const slotMinutes = parseSlotToMinutes(formData.appointmentTime);
                if (slotMinutes !== null && slotMinutes <= now) {
                    newErrors.appointmentTime = 'Selected time has already passed today';
                }
            }
        }
        if (!formData.visitType) {
            newErrors.visitType = 'Visit type is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const parseSlotToMinutes = (slot) => {
        if (!slot) return null;
        const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return null;
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === 'AM' && hours === 12) hours = 0;
        if (period === 'PM' && hours !== 12) hours += 12;
        return hours * 60 + minutes;
    };

    const getFilteredTimeSlots = () => {
        const today = new Date();
        const selectedDate = new Date(formData.appointmentDate);
        const isToday = selectedDate.toDateString() === today.toDateString();
        if (!isToday) return timeSlots;
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        return timeSlots.filter(slot => {
            const slotMinutes = parseSlotToMinutes(slot);
            return slotMinutes !== null && slotMinutes > nowMinutes;
        });
    };

    const handleNext = () => {
        let isValid = false;
        if (currentStep === 1) isValid = validateStep1();
        else if (currentStep === 2) isValid = validateStep2();
        else if (currentStep === 3) isValid = validateStep3();
        else if (currentStep === 4) isValid = true;

        if (isValid) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep === 1) {
            // Go back to visit type selection
            setCurrentStep(0);
            setFormData(prev => ({ ...prev, visitType: '' }));
            setPatientFound(false);
            setExistingPatientId('');
            setLookupMobile('');
            setLookupError('');
        } else if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const handleVisitTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, visitType: type }));
        if (type === 'New Patient') {
            setCurrentStep(1);
        }
        // For Follow-up, stay on step 0 to show mobile lookup
    };

    const handleLookupPatient = async () => {
        if (!lookupMobile.trim()) {
            setLookupError('Please enter a mobile number');
            return;
        }
        if (!/^[6-9]\d{9}$/.test(lookupMobile)) {
            setLookupError('Invalid mobile number (10 digits, starting with 6-9)');
            return;
        }

        setLookupLoading(true);
        setLookupError('');
        try {
            const response = await appointmentAPI.lookupPatient(lookupMobile);
            const patient = response.data;

            // Convert DOB to DD/MM/YYYY format if present
            let dobFormatted = '';
            let useAge = false;
            let ageYears = '';
            let ageMonths = '';

            if (patient.dateOfBirth) {
                const dob = new Date(patient.dateOfBirth);
                const dd = String(dob.getDate()).padStart(2, '0');
                const mm = String(dob.getMonth() + 1).padStart(2, '0');
                const yyyy = dob.getFullYear();
                dobFormatted = `${dd}/${mm}/${yyyy}`;
            } else if (patient.age != null) {
                useAge = true;
                ageYears = String(patient.age);
                ageMonths = patient.ageMonths ? String(patient.ageMonths) : '';
            }

            setFormData(prev => ({
                ...prev,
                patientName: patient.fullName || '',
                gender: patient.gender || '',
                emailAddress: patient.emailAddress || '',
                mobileNumber: patient.mobileNumber || lookupMobile,
                useAge,
                dateOfBirth: dobFormatted,
                ageYears,
                ageMonths,
                knownAllergies: patient.knownAllergies || 'No',
                allergiesDetails: patient.allergiesDetails || '',
                existingConditions: patient.existingConditions || '',
                address: patient.address || '',
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
        } finally {
            setLookupLoading(false);
        }
    };



    const handleSubmit = async () => {
        if (!captchaToken) {
            alert('Please verify that you are not a robot');
            return;
        }

        setLoading(true);
        try {
            let submissionData = {
                fullName: formData.patientName,
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
                visitType: formData.visitType,
                address: formData.address,
                emergencyContactName: formData.emergencyContactName,
                emergencyContactNumber: formData.emergencyContactNumber,
            };

            if (formData.useAge) {
                submissionData.age = parseInt(formData.ageYears);
                if (formData.ageMonths) {
                    submissionData.ageMonths = parseInt(formData.ageMonths);
                }
            } else if (formData.dateOfBirth) {
                const [day, month, year] = formData.dateOfBirth.split('/');
                submissionData.dateOfBirth = new Date(`${year}-${month}-${day}`);
                const dob = new Date(`${year}-${month}-${day}`);
                const today = new Date();
                let calculatedAge = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                    calculatedAge--;
                }
                submissionData.age = calculatedAge;
            }

            // Include existing patientId for follow-up patients
            if (existingPatientId) {
                submissionData.patientId = existingPatientId;
            }

            const response = await appointmentAPI.createAppointment({
                ...submissionData,
                captchaToken,
                source: 'Website',
            });

            const appointment = response.data;
            navigate('/appointment-confirmation', {
                state: {
                    appointment,
                    formData: {
                        patientName: formData.patientName,
                        gender: formData.gender,
                        useAge: formData.useAge,
                        dateOfBirth: formData.dateOfBirth,
                        ageYears: formData.ageYears,
                        ageMonths: formData.ageMonths,
                        mobileNumber: formData.mobileNumber,
                        emailAddress: formData.emailAddress,
                        knownAllergies: formData.knownAllergies,
                        allergiesDetails: formData.allergiesDetails,
                        reasonForVisit: formData.reasonForVisit,
                        primaryConcern: formData.primaryConcern,
                        existingConditions: formData.existingConditions,
                        department: formData.department,
                        appointmentDate: formData.appointmentDate,
                        appointmentTime: formData.appointmentTime,
                        visitType: formData.visitType,
                        address: formData.address,
                        emergencyContactName: formData.emergencyContactName,
                        emergencyContactNumber: formData.emergencyContactNumber,
                    }
                }
            });
        } catch (error) {
            alert(error.message || 'Failed to create appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="appointment-page">
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/" className="logo">
                            <FaUserMd className="logo-icon" />
                            <span>HMS Portal</span>
                        </Link>
                        <Link to="/" className="btn btn-outline">
                            <FaArrowLeft />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            <div className="appointment-container">
                <div className="container">
                    <div className="appointment-header">
                        <h1>Book Your Appointment</h1>
                        <p>Fill in the details below to schedule your visit</p>
                    </div>

                    {currentStep === 0 ? (
                        <div className="visit-type-selection">
                            <h2 className="visit-type-title">How would you like to proceed?</h2>
                            <div className="visit-type-cards">
                                <div
                                    className={`visit-type-card ${formData.visitType === 'New Patient' ? 'selected' : ''}`}
                                    onClick={() => handleVisitTypeSelect('New Patient')}
                                >
                                    <div className="visit-type-icon new-patient-icon">
                                        <FaUser />
                                    </div>
                                    <h3>New Patient</h3>
                                    <p>First time visiting? Start a fresh appointment booking.</p>
                                </div>
                                <div
                                    className={`visit-type-card ${formData.visitType === 'Follow-up' ? 'selected' : ''}`}
                                    onClick={() => handleVisitTypeSelect('Follow-up')}
                                >
                                    <div className="visit-type-icon followup-icon">
                                        <FaRedoAlt />
                                    </div>
                                    <h3>Follow-up</h3>
                                    <p>Returning patient? We'll fetch your details automatically.</p>
                                </div>
                            </div>

                            {formData.visitType === 'Follow-up' && (
                                <div className="followup-lookup">
                                    <div className="lookup-card">
                                        <h3><FaSearch /> Find Your Records</h3>
                                        <p>Enter the mobile number used in your previous appointment</p>
                                        <div className="lookup-input-group">
                                            <div className="input-with-icon">
                                                <FaPhone className="input-icon" />
                                                <input
                                                    type="tel"
                                                    value={lookupMobile}
                                                    onChange={(e) => {
                                                        setLookupMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                                                        setLookupError('');
                                                    }}
                                                    className={`form-input ${lookupError ? 'error' : ''}`}
                                                    placeholder="Enter 10-digit mobile number"
                                                    maxLength="10"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleLookupPatient()}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-primary lookup-btn"
                                                onClick={handleLookupPatient}
                                                disabled={lookupLoading}
                                            >
                                                {lookupLoading ? <span className="spinner"></span> : <><FaSearch /> Search</>}
                                            </button>
                                        </div>
                                        {lookupError && <span className="form-error lookup-error">{lookupError}</span>}
                                        <button
                                            type="button"
                                            className="btn btn-outline lookup-back-btn"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, visitType: '' }));
                                                setLookupMobile('');
                                                setLookupError('');
                                            }}
                                        >
                                            <FaArrowLeft /> Back
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                    <>
                    <div className="progress-steps">
                        {[
                            { num: 1, label: 'Personal Details' },
                            { num: 2, label: 'Medical Info' },
                            { num: 3, label: 'Appointment' },
                            { num: 4, label: 'Additional Info' },
                            { num: 5, label: 'Verify' }
                        ].map((step, idx) => (
                            <div key={step.num} className="step-wrapper">
                                {idx > 0 && <div className="step-line"></div>}
                                <div className={`step ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
                                    <div className="step-number">{step.num}</div>
                                    <div className="step-label">{step.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form className="appointment-form">
                        {currentStep === 1 && (
                            <div className="form-step">
                                <h2 className="step-title"><FaUser /> Personal Information</h2>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label className="form-label required">Patient's Name</label>
                                        <input type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} className={`form-input ${errors.patientName ? 'error' : ''}`} placeholder="Enter patient's full name" />
                                        {errors.patientName && <span className="form-error">{errors.patientName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleInputChange} className={`form-select ${errors.gender ? 'error' : ''}`}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.gender && <span className="form-error">{errors.gender}</span>}
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">
                                            <input type="checkbox" checked={formData.useAge} onChange={(e) => setFormData(prev => ({ ...prev, useAge: e.target.checked, dateOfBirth: '', ageYears: '', ageMonths: '' }))} className="form-checkbox" />
                                            <span className="ml-2">I want to enter age instead of date of birth</span>
                                        </label>
                                    </div>

                                    {formData.useAge ? (
                                        <>
                                            <div className="form-group">
                                                <label className="form-label required">Age (Years)</label>
                                                <input type="number" name="ageYears" value={formData.ageYears} onChange={handleInputChange} min="0" max="120" className={`form-input ${errors.ageYears ? 'error' : ''}`} placeholder="0-120 years" />
                                                {errors.ageYears && <span className="form-error">{errors.ageYears}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Age (Months - Optional)</label>
                                                <input type="number" name="ageMonths" value={formData.ageMonths} onChange={handleInputChange} min="0" max="12" className={`form-input ${errors.ageMonths ? 'error' : ''}`} placeholder="0-12 months" />
                                                {errors.ageMonths && <span className="form-error">{errors.ageMonths}</span>}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="form-group">
                                            <label className="form-label required">Date of Birth (DD/MM/YYYY)</label>
                                            <input type="text" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleDOBChange} maxLength="10" className={`form-input ${errors.dateOfBirth ? 'error' : ''}`} placeholder="DD/MM/YYYY" />
                                            {errors.dateOfBirth && <span className="form-error">{errors.dateOfBirth}</span>}
                                            <small className="form-hint">Enter date in DD/MM/YYYY format (slashes will be added automatically)</small>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label required">Mobile Number</label>
                                        <div className="input-with-icon">
                                            <FaPhone className="input-icon" />
                                            <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} maxLength="10" className={`form-input ${errors.mobileNumber ? 'error' : ''}`} placeholder="10-digit mobile number" />
                                        </div>
                                        {errors.mobileNumber && <span className="form-error">{errors.mobileNumber}</span>}
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label required">Email Address</label>
                                        <div className="input-with-icon">
                                            <FaEnvelope className="input-icon" />
                                            <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} className={`form-input ${errors.emailAddress ? 'error' : ''}`} placeholder="your.email@example.com" />
                                        </div>
                                        {errors.emailAddress && <span className="form-error">{errors.emailAddress}</span>}
                                    </div>
                                </div>

                                <div className="form-navigation">
                                    <div></div>
                                    <button type="button" onClick={handleNext} className="btn btn-primary">Next <FaCheck /></button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="form-step">
                                <h2 className="step-title"><FaHeartbeat /> Medical Information</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label required">Known Allergies</label>
                                        <select name="knownAllergies" value={formData.knownAllergies} onChange={handleInputChange} className={`form-select ${errors.knownAllergies ? 'error' : ''}`}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                        {errors.knownAllergies && <span className="form-error">{errors.knownAllergies}</span>}
                                    </div>

                                    {formData.knownAllergies === 'Yes' && (
                                        <div className="form-group full-width">
                                            <label className="form-label required">Allergy Details</label>
                                            <textarea name="allergiesDetails" value={formData.allergiesDetails} onChange={handleInputChange} className={`form-textarea ${errors.allergiesDetails ? 'error' : ''}`} placeholder="Please specify your allergies" rows="3" />
                                            {errors.allergiesDetails && <span className="form-error">{errors.allergiesDetails}</span>}
                                        </div>
                                    )}

                                    <div className="form-group full-width">
                                        <label className="form-label">Reason for Visit</label>
                                        <textarea name="reasonForVisit" value={formData.reasonForVisit} onChange={handleInputChange} className="form-textarea" placeholder="Why are you visiting the doctor?" rows="3" />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Primary Concern</label>
                                        <textarea name="primaryConcern" value={formData.primaryConcern} onChange={handleInputChange} className="form-textarea" placeholder="Describe your primary health concern" rows="3" />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Existing Conditions</label>
                                        <textarea name="existingConditions" value={formData.existingConditions} onChange={handleInputChange} className="form-textarea" placeholder="List any existing medical conditions" rows="3" />
                                    </div>
                                </div>

                                <div className="form-navigation">
                                    <button type="button" onClick={handleBack} className="btn btn-outline"><FaArrowLeft /> Back</button>
                                    <button type="button" onClick={handleNext} className="btn btn-primary">Next <FaCheck /></button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="form-step">
                                <h2 className="step-title"><FaCalendar /> Appointment Details</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Department (Optional)</label>
                                        <select name="department" value={formData.department} onChange={handleInputChange} className="form-select">
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept._id} value={dept.name}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Appointment Date</label>
                                        <div className="input-with-icon">
                                            <FaCalendar className="input-icon" />
                                            <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} max={(() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split('T')[0]; })()} className={`form-input ${errors.appointmentDate ? 'error' : ''}`} />
                                        </div>
                                        {errors.appointmentDate && <span className="form-error">{errors.appointmentDate}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Appointment Time</label>
                                        <div className="input-with-icon">
                                            <FaClock className="input-icon" />
                                            <select name="appointmentTime" value={formData.appointmentTime} onChange={handleInputChange} className={`form-select ${errors.appointmentTime ? 'error' : ''}`} disabled={!formData.appointmentDate}>
                                                <option value="">Select Time Slot</option>
                                                {formData.appointmentDate && getFilteredTimeSlots().length > 0 ? (
                                                    getFilteredTimeSlots().map((slot, index) => (
                                                        <option key={index} value={slot}>{slot}</option>
                                                    ))
                                                ) : (
                                                    formData.appointmentDate && timeSlots.length === 0 && (
                                                        <option value="" disabled>No slots available</option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                        {errors.appointmentTime && <span className="form-error">{errors.appointmentTime}</span>}
                                        {!formData.appointmentDate && <small className="form-hint">Please select a date first</small>}
                                        {formData.appointmentDate && getFilteredTimeSlots().length === 0 && timeSlots.length > 0 && (
                                            <small className="form-hint" style={{color: 'var(--danger-color)'}}>No available time slots for today. Please select another date.</small>
                                        )}
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label">Visit Type</label>
                                        <div className="visit-type-badge-container">
                                            <span className={`visit-type-badge ${formData.visitType === 'Follow-up' ? 'badge-followup' : 'badge-new'}`}>
                                                {formData.visitType === 'Follow-up' ? <FaRedoAlt /> : <FaUser />}
                                                {formData.visitType}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-navigation">
                                    <button type="button" onClick={handleBack} className="btn btn-outline"><FaArrowLeft /> Back</button>
                                    <button type="button" onClick={handleNext} className="btn btn-primary">Next <FaCheck /></button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="form-step">
                                <h2 className="step-title"><FaMapMarkerAlt /> Additional Information</h2>

                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label className="form-label">Address</label>
                                        <textarea name="address" value={formData.address} onChange={handleInputChange} className="form-textarea" placeholder="Enter your full address" rows="2" />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Emergency Contact Name</label>
                                        <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} className="form-input" placeholder="Full name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Emergency Contact Number</label>
                                        <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} maxLength="10" className="form-input" placeholder="10-digit number" />
                                    </div>
                                </div>

                                <div className="form-navigation">
                                    <button type="button" onClick={handleBack} className="btn btn-outline"><FaArrowLeft /> Back</button>
                                    <button type="button" onClick={handleNext} className="btn btn-primary">Next <FaCheck /></button>
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="form-step">
                                <h2 className="step-title"><FaCheck /> Review & Submit</h2>

                                <div className="verify-details">
                                    <div className="preview-section">
                                        <h3>Personal Details</h3>
                                        <div className="preview-grid">
                                            <div><strong>Patient's Name:</strong> {formData.patientName}</div>
                                            <div><strong>Gender:</strong> {formData.gender}</div>
                                            {formData.useAge ? (
                                                <div><strong>Age:</strong> {formData.ageYears} years {formData.ageMonths && `${formData.ageMonths} months`}</div>
                                            ) : (
                                                <div><strong>Date of Birth:</strong> {formData.dateOfBirth}</div>
                                            )}
                                            <div><strong>Mobile:</strong> {formData.mobileNumber}</div>
                                            <div><strong>Email:</strong> {formData.emailAddress}</div>
                                        </div>
                                    </div>

                                    <div className="preview-section">
                                        <h3>Medical Information</h3>
                                        <div className="preview-grid">
                                            <div><strong>Known Allergies:</strong> {formData.knownAllergies}</div>
                                            {formData.knownAllergies === 'Yes' && formData.allergiesDetails && (
                                                <div className="full-width"><strong>Allergy Details:</strong> {formData.allergiesDetails}</div>
                                            )}
                                            {formData.reasonForVisit && (
                                                <div className="full-width"><strong>Reason for Visit:</strong> {formData.reasonForVisit}</div>
                                            )}
                                            {formData.primaryConcern && (
                                                <div className="full-width"><strong>Primary Concern:</strong> {formData.primaryConcern}</div>
                                            )}
                                            {formData.existingConditions && (
                                                <div className="full-width"><strong>Existing Conditions:</strong> {formData.existingConditions}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="preview-section">
                                        <h3>Appointment Details</h3>
                                        <div className="preview-grid">
                                            {formData.department && <div><strong>Department:</strong> {formData.department}</div>}
                                            <div><strong>Date:</strong> {new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}</div>
                                            <div><strong>Time:</strong> {formData.appointmentTime}</div>
                                            <div><strong>Visit Type:</strong> {formData.visitType}</div>
                                        </div>
                                    </div>

                                    {(formData.address || formData.emergencyContactName) && (
                                        <div className="preview-section">
                                            <h3>Additional Information</h3>
                                            <div className="preview-grid">
                                                {formData.address && <div className="full-width"><strong>Address:</strong> {formData.address}</div>}
                                                {formData.emergencyContactName && (
                                                    <>
                                                        <div><strong>Emergency Contact:</strong> {formData.emergencyContactName}</div>
                                                        <div><strong>Contact Number:</strong> {formData.emergencyContactNumber}</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="captcha-step-container">
                                    <p className="captcha-instruction">Please verify that you are not a robot to submit your appointment.</p>
                                    <div className="captcha-container">
                                        <ReCAPTCHA
                                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                                            onChange={onCaptchaChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-navigation">
                                    <button type="button" onClick={handleBack} className="btn btn-outline"><FaArrowLeft /> Back</button>
                                    <button type="button" onClick={handleSubmit} disabled={!captchaToken || loading} className="btn btn-primary">
                                        {loading ? (
                                            <span className="spinner"></span>
                                        ) : (
                                            <><FaCheck /> Confirm & Book Appointment</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentBooking;
