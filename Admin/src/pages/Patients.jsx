import { useState, useEffect } from 'react';
import { Search, X, Phone, Mail, User, Calendar, ChevronLeft, ChevronRight, RefreshCw, FileText, Clock, CheckCircle, XCircle, AlertCircle, Download, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { toast } from 'sonner';
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
    const [showDownloadModal, setShowDownloadModal] = useState(false);

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
                <div className="patients-header-actions">
                    <button className="pat-dl-trigger-btn" onClick={() => setShowDownloadModal(true)}>
                        <Download size={16} />
                        Download
                    </button>
                    <button className="refresh-btn" onClick={fetchPatients} title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                </div>
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
                    <div className="patient-modal-content appointments-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="patient-modal-header">
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

                        <div className="patient-modal-body">
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
            {showDownloadModal && (
                <PatientDownloadModal onClose={() => setShowDownloadModal(false)} />
            )}
        </div>
    );
};

/* ================================================================
   PATIENT DOWNLOAD FILTER MODAL
   ================================================================ */
const PatientDownloadModal = ({ onClose }) => {
    const [gender, setGender] = useState('');
    const [agePreset, setAgePreset] = useState('');
    const [customAgeMin, setCustomAgeMin] = useState('');
    const [customAgeMax, setCustomAgeMax] = useState('');
    const [visitType, setVisitType] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [downloadDone, setDownloadDone] = useState(false);

    const handleClear = () => {
        setGender('');
        setAgePreset('');
        setCustomAgeMin('');
        setCustomAgeMax('');
        setVisitType('');
    };

    const getAgeRange = () => {
        switch (agePreset) {
            case 'below_18': return { ageMin: 0, ageMax: 17 };
            case 'above_60': return { ageMin: 60, ageMax: undefined };
            case 'custom': return {
                ageMin: customAgeMin ? parseInt(customAgeMin) : undefined,
                ageMax: customAgeMax ? parseInt(customAgeMax) : undefined
            };
            default: return {};
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            setDownloadDone(false);

            const { ageMin, ageMax } = getAgeRange();
            const params = {
                gender: gender || undefined,
                ageMin: ageMin !== undefined ? ageMin : undefined,
                ageMax: ageMax !== undefined ? ageMax : undefined,
                visitType: visitType || undefined,
            };

            const response = await patientsAPI.download(params);
            const data = response.data || [];

            if (!data.length) {
                toast.error('No patients found for the selected filters');
                setDownloading(false);
                return;
            }

            // Build CSV - one row per appointment
            const headers = [
                'Patient ID', 'Patient Name', 'Mobile', 'Email', 'Gender', 'Age',
                'Total Appointments', 'Appointment ID', 'Date', 'Time', 'Status',
                'Department', 'Visit Type', 'Assigned Doctor', 'Reason', 'Primary Concern', 'Cancel Reason'
            ];

            const rows = [];
            data.forEach(p => {
                if (p.appointments && p.appointments.length > 0) {
                    p.appointments.forEach((a, i) => {
                        rows.push([
                            i === 0 ? (p.patientId || '') : '',
                            i === 0 ? (p.fullName || '') : '',
                            i === 0 ? (p.mobileNumber || '') : '',
                            i === 0 ? (p.emailAddress || '') : '',
                            i === 0 ? (p.gender || '') : '',
                            i === 0 ? (p.age != null ? p.age : '') : '',
                            i === 0 ? (p.totalAppointments || 0) : '',
                            a.appointmentId || '',
                            a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('en-IN') : '',
                            a.appointmentTime || '',
                            a.appointmentStatus || '',
                            a.department || '',
                            a.visitType || '',
                            a.doctorName || 'Not Assigned',
                            a.reasonForVisit || '',
                            a.primaryConcern || '',
                            a.cancelReason || ''
                        ]);
                    });
                } else {
                    rows.push([
                        p.patientId || '', p.fullName || '', p.mobileNumber || '',
                        p.emailAddress || '', p.gender || '', p.age != null ? p.age : '',
                        p.totalAppointments || 0, '', '', '', '', '', '', '', '', '', ''
                    ]);
                }
            });

            const csvContent = [headers, ...rows]
                .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `patients_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setDownloadDone(true);
            toast.success(`Downloaded ${data.length} patient records`);
            setTimeout(() => {
                setDownloading(false);
                setDownloadDone(false);
                onClose();
            }, 1200);
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Failed to download patient records');
            setDownloading(false);
        }
    };

    return (
        <div className="pat-dl-overlay" onClick={onClose}>
            <div className="pat-dl-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="pat-dl-header">
                    <div className="pat-dl-header-left">
                        <Filter size={18} />
                        <div>
                            <h2>Download Patient Records</h2>
                            <p>Apply filters and export as CSV</p>
                        </div>
                    </div>
                    <button className="pat-dl-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="pat-dl-body">
                    {/* Gender */}
                    <div className="pat-dl-section">
                        <label className="pat-dl-label">Gender</label>
                        <div className="pat-dl-chip-row">
                            {[
                                { key: '', label: 'All' },
                                { key: 'Male', label: 'Male' },
                                { key: 'Female', label: 'Female' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    className={`pat-dl-chip ${gender === opt.key ? 'active' : ''}`}
                                    onClick={() => setGender(opt.key)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Age */}
                    <div className="pat-dl-section">
                        <label className="pat-dl-label">Age</label>
                        <div className="pat-dl-chip-row">
                            {[
                                { key: '', label: 'All Ages' },
                                { key: 'below_18', label: 'Below 18' },
                                { key: 'above_60', label: 'Above 60' },
                                { key: 'custom', label: 'Custom' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    className={`pat-dl-chip ${agePreset === opt.key ? 'active' : ''}`}
                                    onClick={() => setAgePreset(opt.key)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {agePreset === 'custom' && (
                            <div className="pat-dl-age-range">
                                <div className="pat-dl-age-field">
                                    <label>Min Age</label>
                                    <input type="number" min="0" max="150" placeholder="0" value={customAgeMin} onChange={e => setCustomAgeMin(e.target.value)} />
                                </div>
                                <span className="pat-dl-age-sep">—</span>
                                <div className="pat-dl-age-field">
                                    <label>Max Age</label>
                                    <input type="number" min="0" max="150" placeholder="150" value={customAgeMax} onChange={e => setCustomAgeMax(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Visit Type */}
                    <div className="pat-dl-section">
                        <label className="pat-dl-label">Appointments</label>
                        <div className="pat-dl-chip-row">
                            {[
                                { key: '', label: 'All' },
                                { key: 'New Patient', label: 'New Patient' },
                                { key: 'Follow-up', label: 'Follow-up' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    className={`pat-dl-chip ${visitType === opt.key ? 'active' : ''}`}
                                    onClick={() => setVisitType(opt.key)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pat-dl-footer">
                    <button className="pat-dl-clear-btn" onClick={handleClear}>Clear Filters</button>
                    <button
                        className={`pat-dl-download-btn ${downloading ? (downloadDone ? 'done' : 'loading') : ''}`}
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? (
                            downloadDone ? (
                                <><CheckCircle size={16} /> Done!</>
                            ) : (
                                <><Loader2 size={16} className="pat-dl-spin" /> Downloading...</>
                            )
                        ) : (
                            <><Download size={16} /> Download CSV</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Patients;
