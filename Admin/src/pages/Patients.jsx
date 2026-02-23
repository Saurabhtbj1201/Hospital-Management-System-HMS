import { useState, useEffect } from 'react';
import { Search, X, Phone, Mail, User, Calendar, ChevronLeft, ChevronRight, RefreshCw, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { patientsAPI } from '../services/api';
import './Patients.css';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [appointmentsModal, setAppointmentsModal] = useState(false);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, [searchTerm, page]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await patientsAPI.getAll({ search: searchTerm, page, limit: 20 });
            setPatients(response.data || []);
            setPagination(response.pagination || { total: 0, pages: 1 });
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAppointmentClick = async (patient) => {
        try {
            setAppointmentsLoading(true);
            setSelectedPatient(patient);
            setAppointmentsModal(true);
            const response = await patientsAPI.getById(patient.patientId || patient._id);
            setPatientAppointments(response.data?.appointments || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setPatientAppointments([]);
        } finally {
            setAppointmentsLoading(false);
        }
    };

    const closeModal = () => {
        setAppointmentsModal(false);
        setSelectedPatient(null);
        setPatientAppointments([]);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle size={14} />;
            case 'Confirmed': return <Clock size={14} />;
            case 'Cancelled': return <XCircle size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    const getAppointmentCategory = (apt) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);

        if (apt.appointmentStatus === 'Cancelled') return 'cancelled';
        if (apt.appointmentStatus === 'Completed') return 'past';
        if (aptDate < now) return 'past';
        if (aptDate.getTime() === now.getTime()) return 'current';
        return 'upcoming';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="patients-page">
            <div className="patients-header">
                <div className="patients-title">
                    <h1>Patient Records</h1>
                    <p>View patient information and appointment history</p>
                </div>
                <button className="refresh-btn" onClick={fetchPatients} title="Refresh">
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="patients-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, email, mobile, or patient ID..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                    {searchTerm && (
                        <button className="search-clear" onClick={() => { setSearchTerm(''); setPage(1); }}>
                            <X size={16} />
                        </button>
                    )}
                </div>
                <div className="patients-count">
                    {pagination.total} patient{pagination.total !== 1 ? 's' : ''} found
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading patients...</p>
                </div>
            ) : patients.length === 0 ? (
                <div className="empty-state">
                    <User size={48} />
                    <h3>No patients found</h3>
                    <p>{searchTerm ? 'Try a different search term' : 'No patient records available'}</p>
                </div>
            ) : (
                <>
                    <div className="patients-table-wrapper">
                        <table className="patients-table">
                            <thead>
                                <tr>
                                    <th>Patient ID</th>
                                    <th>Patient Name</th>
                                    <th>Mobile</th>
                                    <th>Email</th>
                                    <th>Gender</th>
                                    <th>Age</th>
                                    <th className="text-center">Appointments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient._id || patient.patientId}>
                                        <td>
                                            <span className="patient-id-badge">{patient.patientId || patient._id}</span>
                                        </td>
                                        <td>
                                            <div className="patient-name-cell">
                                                <span className="patient-name">{patient.fullName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="cell-with-icon">
                                                <Phone size={14} />
                                                <span>{patient.mobileNumber || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="cell-with-icon">
                                                <Mail size={14} />
                                                <span className="email-text">{patient.emailAddress}</span>
                                            </div>
                                        </td>
                                        <td>{patient.gender || 'N/A'}</td>
                                        <td>{patient.age != null ? `${patient.age} yrs` : 'N/A'}</td>
                                        <td className="text-center">
                                            <button
                                                className="appointments-count-btn"
                                                onClick={() => handleAppointmentClick(patient)}
                                                title="View all appointments"
                                            >
                                                <FileText size={14} />
                                                {patient.totalAppointments || 0}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <span className="pagination-info">
                                Page {page} of {pagination.pages}
                            </span>
                            <button
                                className="pagination-btn"
                                disabled={page >= pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Appointments Modal */}
            {appointmentsModal && selectedPatient && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content appointments-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Appointments</h2>
                                <p className="modal-subtitle">
                                    <span className="modal-patient-id">{selectedPatient.patientId || selectedPatient._id}</span>
                                    <span className="modal-patient-name">{selectedPatient.fullName}</span>
                                    {selectedPatient.mobileNumber && (
                                        <span className="modal-patient-mobile">
                                            <Phone size={13} /> {selectedPatient.mobileNumber}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button className="close-btn" onClick={closeModal}>
                                <X size={22} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {appointmentsLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading appointments...</p>
                                </div>
                            ) : patientAppointments.length === 0 ? (
                                <div className="empty-state">
                                    <Calendar size={40} />
                                    <p>No appointments found</p>
                                </div>
                            ) : (
                                <div className="appointments-timeline">
                                    {patientAppointments.map((apt) => {
                                        const category = getAppointmentCategory(apt);
                                        return (
                                            <div key={apt._id || apt.appointmentId} className={`timeline-item timeline-${category}`}>
                                                <div className="timeline-marker">
                                                    {getStatusIcon(apt.appointmentStatus)}
                                                </div>
                                                <div className="timeline-card">
                                                    <div className="timeline-card-header">
                                                        <span className="appointment-id">{apt.appointmentId}</span>
                                                        <span className={`status-pill status-${apt.appointmentStatus?.toLowerCase()}`}>
                                                            {apt.appointmentStatus}
                                                        </span>
                                                    </div>
                                                    <div className="timeline-card-body">
                                                        <div className="timeline-detail">
                                                            <Calendar size={14} />
                                                            <span>{formatDate(apt.appointmentDate)}</span>
                                                            <Clock size={14} />
                                                            <span>{apt.appointmentTime}</span>
                                                        </div>
                                                        <div className="timeline-detail">
                                                            {apt.department && <span className="dept-tag">{apt.department}</span>}
                                                            <span className="visit-tag">{apt.visitType}</span>
                                                        </div>
                                                        {apt.doctorAssigned?.user?.name && (
                                                            <div className="timeline-detail">
                                                                <User size={14} />
                                                                <span>Dr. {apt.doctorAssigned.user.name}</span>
                                                            </div>
                                                        )}
                                                        {apt.reasonForVisit && (
                                                            <div className="timeline-reason">
                                                                <span>Reason: {apt.reasonForVisit}</span>
                                                            </div>
                                                        )}
                                                        {apt.cancelReason && (
                                                            <div className="timeline-reason cancel-reason">
                                                                <span>Cancel reason: {apt.cancelReason}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="timeline-card-footer">
                                                        <span className={`category-label category-${category}`}>
                                                            {category === 'current' ? 'Today' : category.charAt(0).toUpperCase() + category.slice(1)}
                                                        </span>
                                                        <span className="booked-date">Booked: {formatDate(apt.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patients;
