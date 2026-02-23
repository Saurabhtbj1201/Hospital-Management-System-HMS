import { Link, useLocation, Navigate } from 'react-router-dom';
import { FaCheck, FaUserMd, FaCalendar, FaClock, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaArrowLeft } from 'react-icons/fa';
import './AppointmentBooking.css';

const AppointmentConfirmation = () => {
    const location = useLocation();
    const { appointment, formData } = location.state || {};

    // Redirect if no data (direct URL access)
    if (!appointment || !formData) {
        return <Navigate to="/book-appointment" replace />;
    }

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

            <div className="confirmation-container">
                <div className="container">
                    <div className="confirmation-card">
                        <div className="confirmation-header">
                            <div className="success-icon-large">
                                <FaCheck />
                            </div>
                            <h1>Appointment Booked Successfully!</h1>
                            <p>Your appointment has been confirmed. Details are shown below.</p>
                        </div>

                        <div className="id-badge-row">
                            <div className="id-badge">
                                <span className="id-label">Appointment ID</span>
                                <span className="id-value">{appointment.appointmentId}</span>
                            </div>
                            <div className="id-badge">
                                <span className="id-label">Patient ID</span>
                                <span className="id-value">{appointment.patientId}</span>
                            </div>
                        </div>

                        <div className="confirmation-details">
                            <div className="detail-section">
                                <h3><FaUser /> Personal Details</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Patient's Name</span>
                                        <span className="detail-value">{formData.patientName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Gender</span>
                                        <span className="detail-value">{formData.gender}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">{formData.useAge ? 'Age' : 'Date of Birth'}</span>
                                        <span className="detail-value">
                                            {formData.useAge
                                                ? `${formData.ageYears} years${formData.ageMonths ? ` ${formData.ageMonths} months` : ''}`
                                                : formData.dateOfBirth}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Mobile Number</span>
                                        <span className="detail-value">{formData.mobileNumber}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Email Address</span>
                                        <span className="detail-value">{formData.emailAddress}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3><FaCalendar /> Appointment Details</h3>
                                <div className="detail-grid">
                                    {formData.department && (
                                        <div className="detail-item">
                                            <span className="detail-label">Department</span>
                                            <span className="detail-value">{formData.department}</span>
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <span className="detail-label">Date</span>
                                        <span className="detail-value">
                                            {new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Time</span>
                                        <span className="detail-value">{formData.appointmentTime}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Visit Type</span>
                                        <span className="detail-value">{formData.visitType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3><FaHeartbeat /> Medical Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Known Allergies</span>
                                        <span className="detail-value">{formData.knownAllergies}</span>
                                    </div>
                                    {formData.knownAllergies === 'Yes' && formData.allergiesDetails && (
                                        <div className="detail-item full-width">
                                            <span className="detail-label">Allergy Details</span>
                                            <span className="detail-value">{formData.allergiesDetails}</span>
                                        </div>
                                    )}
                                    {formData.reasonForVisit && (
                                        <div className="detail-item full-width">
                                            <span className="detail-label">Reason for Visit</span>
                                            <span className="detail-value">{formData.reasonForVisit}</span>
                                        </div>
                                    )}
                                    {formData.primaryConcern && (
                                        <div className="detail-item full-width">
                                            <span className="detail-label">Primary Concern</span>
                                            <span className="detail-value">{formData.primaryConcern}</span>
                                        </div>
                                    )}
                                    {formData.existingConditions && (
                                        <div className="detail-item full-width">
                                            <span className="detail-label">Existing Conditions</span>
                                            <span className="detail-value">{formData.existingConditions}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {(formData.address || formData.emergencyContactName) && (
                                <div className="detail-section">
                                    <h3><FaMapMarkerAlt /> Additional Information</h3>
                                    <div className="detail-grid">
                                        {formData.address && (
                                            <div className="detail-item full-width">
                                                <span className="detail-label">Address</span>
                                                <span className="detail-value">{formData.address}</span>
                                            </div>
                                        )}
                                        {formData.emergencyContactName && (
                                            <div className="detail-item">
                                                <span className="detail-label">Emergency Contact</span>
                                                <span className="detail-value">{formData.emergencyContactName}</span>
                                            </div>
                                        )}
                                        {formData.emergencyContactNumber && (
                                            <div className="detail-item">
                                                <span className="detail-label">Contact Number</span>
                                                <span className="detail-value">{formData.emergencyContactNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="confirmation-note">
                            <p><strong>Important:</strong> Please arrive 15 minutes before your scheduled time and bring a valid ID.</p>
                        </div>

                        <div className="confirmation-actions">
                            <Link to="/" className="btn btn-primary">
                                Back to Home
                            </Link>
                            <Link to="/book-appointment" className="btn btn-outline">
                                Book Another Appointment
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentConfirmation;
