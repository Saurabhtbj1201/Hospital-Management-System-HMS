import { useState, useEffect, useRef } from 'react';
import { Calendar, Search, Edit2, Eye, UserPlus, Check, X, Clock, RefreshCw, XCircle, CheckCircle, UserMinus, Printer, Download, Filter, ChevronDown, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { appointmentsAPI, doctorsAPI, departmentsAPI, invoiceTemplateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import './Appointments.css';

const Appointments = () => {
    const { user } = useAuth();
    const userRole = user?.role;
    const isDoctor = userRole === 'Doctor';
    const isAdminOrReceptionist = userRole === 'Admin' || userRole === 'Receptionist';

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [hospitalTemplate, setHospitalTemplate] = useState(null);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    useEffect(() => {
        fetchAppointments();
        if (isAdminOrReceptionist) {
            fetchDoctors();
            fetchDepartments();
        }
        fetchHospitalTemplate();
    }, [filter, searchTerm, currentPage, dateFilter]);

    const fetchHospitalTemplate = async () => {
        try {
            setTemplateLoading(true);
            const res = await invoiceTemplateAPI.get();
            setHospitalTemplate(res.data);
        } catch (error) {
            console.error('Error fetching hospital template:', error);
        } finally {
            setTemplateLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                status: filter !== 'all' ? filter : undefined,
                search: searchTerm || undefined,
                date: dateFilter || undefined
            };
            const response = isDoctor
                ? await appointmentsAPI.getMyAppointments(params)
                : await appointmentsAPI.getAll(params);
            setAppointments(response.data || []);
            setTotalPages(response.pagination?.pages || 1);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await doctorsAPI.getAll();
            setDoctors(response.data || response || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await departmentsAPI.getAll();
            setDepartments(response.departments || response.data || response || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleCancelAppointment = async (id) => {
        const reason = prompt('Please enter the reason for cancellation:');
        if (!reason || !reason.trim()) return;
        try {
            await appointmentsAPI.updateStatus(id, 'Cancelled', reason.trim());
            fetchAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment');
        }
    };

    const handleAssignDoctor = async (id, doctorId) => {
        try {
            await appointmentsAPI.assignDoctor(id, doctorId);
            fetchAppointments();
            setShowModal(false);
        } catch (error) {
            console.error('Error assigning doctor:', error);
            alert('Failed to assign doctor');
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            await appointmentsAPI.update(id, data);
            fetchAppointments();
            setShowModal(false);
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        }
    };

    const handleDoctorComplete = async (id) => {
        if (!window.confirm('Mark this appointment as Completed?')) return;
        try {
            await appointmentsAPI.doctorComplete(id);
            fetchAppointments();
        } catch (error) {
            console.error('Error completing appointment:', error);
            alert('Failed to complete appointment');
        }
    };

    const handleDoctorRemove = async (id) => {
        const reason = prompt('Please enter the reason for removing yourself from this appointment:');
        if (!reason || !reason.trim()) return;
        try {
            await appointmentsAPI.doctorRemove(id, reason.trim());
            fetchAppointments();
        } catch (error) {
            console.error('Error removing from appointment:', error);
            alert('Failed to remove from appointment');
        }
    };

    const openModal = (appointment, type) => {
        setSelectedAppointment(appointment);
        setModalType(type);
        setShowModal(true);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'Pending': 'status-pending',
            'Confirmed': 'status-confirmed',
            'Completed': 'status-completed',
            'Cancelled': 'status-cancelled'
        };
        return statusMap[status] || '';
    };

    const getDoctorName = (apt) => {
        if (!apt.doctorAssigned) return null;
        return apt.doctorAssigned?.user?.name || apt.doctorAssigned?.name || 'Assigned';
    };

    return (
        <div className="appointments-page">
            <div className="appointments-header">
                <div className="appointments-title">
                    <h1>{isDoctor ? 'My Appointments' : 'Appointments Management'}</h1>
                    <p>{isDoctor ? 'View appointments assigned to you' : 'View and manage all patient appointments'}</p>
                </div>
                {!isDoctor && (
                    <button className="dl-trigger-btn" onClick={() => setShowDownloadModal(true)}>
                        <Download size={16} />
                        Download
                    </button>
                )}
            </div>

            <div className="appointments-filters">
                <div className="filter-group">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'Pending' ? 'active' : ''}`}
                        onClick={() => setFilter('Pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-btn ${filter === 'Confirmed' ? 'active' : ''}`}
                        onClick={() => setFilter('Confirmed')}
                    >
                        Confirmed
                    </button>
                    <button
                        className={`filter-btn ${filter === 'Completed' ? 'active' : ''}`}
                        onClick={() => setFilter('Completed')}
                    >
                        Completed
                    </button>
                </div>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                    type="date"
                    className="date-filter-input"
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                    title="Filter by date"
                />
                {dateFilter && (
                    <button
                        className="filter-btn clear-date-btn"
                        onClick={() => setDateFilter('')}
                        title="Clear date filter"
                    >
                        <X size={14} />
                    </button>
                )}
                <button
                    className="filter-btn refresh-btn"
                    onClick={() => { fetchAppointments(); }}
                    title="Refresh"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {loading ? (
                <div className="appointments-table">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Appointment ID</th>
                                    <th>Patient Name</th>
                                    <th>Date & Time</th>
                                    <th>Department</th>
                                    {isAdminOrReceptionist && <th>Assigned Doctor</th>}
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(6)].map((_, i) => (
                                    <tr key={i} className="skeleton-row">
                                        <td><div className="skeleton skeleton-text" style={{ width: '80px' }} /></td>
                                        <td>
                                            <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '6px' }} />
                                            <div className="skeleton skeleton-text" style={{ width: '150px', height: '10px' }} />
                                        </td>
                                        <td>
                                            <div className="skeleton skeleton-text" style={{ width: '100px', marginBottom: '6px' }} />
                                            <div className="skeleton skeleton-text" style={{ width: '70px', height: '10px' }} />
                                        </td>
                                        <td><div className="skeleton skeleton-text" style={{ width: '90px' }} /></td>
                                        {isAdminOrReceptionist && <td><div className="skeleton skeleton-text" style={{ width: '110px' }} /></td>}
                                        <td><div className="skeleton skeleton-badge" /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <div className="skeleton skeleton-action" />
                                                {isAdminOrReceptionist && <div className="skeleton skeleton-action" />}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <>
                    <div className="appointments-table">
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Appointment ID</th>
                                        <th>Patient Name</th>
                                        <th>Date & Time</th>
                                        <th>Department</th>
                                        {isAdminOrReceptionist && <th>Assigned Doctor</th>}
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAdminOrReceptionist ? 7 : 6} className="no-data">
                                                No appointments found
                                            </td>
                                        </tr>
                                    ) : (
                                        appointments.map((apt) => (
                                            <tr key={apt._id}>
                                                <td>{apt.appointmentId}</td>
                                                <td>
                                                    <div>{apt.fullName}</div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                        {apt.emailAddress}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>{formatDate(apt.appointmentDate)}</div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                        {apt.appointmentTime}
                                                    </div>
                                                </td>
                                                <td>{apt.department || 'N/A'}</td>

                                                {/* Assigned Doctor column - Admin/Receptionist only */}
                                                {isAdminOrReceptionist && (
                                                    <td>
                                                        {getDoctorName(apt) ? (
                                                            <span className="assigned-doctor-name">
                                                                {getDoctorName(apt)}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                className="btn-assign-inline"
                                                                onClick={() => openModal(apt, 'assign')}
                                                                title="Assign Doctor"
                                                            >
                                                                <UserPlus size={14} /> Assign
                                                            </button>
                                                        )}
                                                    </td>
                                                )}

                                                {/* Status column */}
                                                <td>
                                                    <div className="status-cell">
                                                        <span className={`status-badge ${getStatusClass(apt.appointmentStatus)}`}>
                                                            {apt.appointmentStatus}
                                                        </span>
                                                        {isAdminOrReceptionist && apt.appointmentStatus !== 'Cancelled' && apt.appointmentStatus !== 'Completed' && (
                                                            <button
                                                                className="btn-cancel-inline"
                                                                onClick={() => handleCancelAppointment(apt._id)}
                                                                title="Cancel Appointment"
                                                            >
                                                                <XCircle size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions column */}
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="action-btn action-btn-view"
                                                            onClick={() => openModal(apt, 'view')}
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {isAdminOrReceptionist && (
                                                            <button
                                                                className="action-btn action-btn-edit"
                                                                onClick={() => openModal(apt, 'edit')}
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                        )}
                                                        {isDoctor && apt.appointmentStatus === 'Confirmed' && (
                                                            <button
                                                                className="action-btn action-btn-complete"
                                                                onClick={() => handleDoctorComplete(apt._id)}
                                                                title="Mark as Completed"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                        {isDoctor && (apt.appointmentStatus === 'Confirmed' || apt.appointmentStatus === 'Pending') && (
                                                            <button
                                                                className="action-btn action-btn-remove"
                                                                onClick={() => handleDoctorRemove(apt._id)}
                                                                title="Remove Yourself"
                                                            >
                                                                <UserMinus size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="page-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {showDownloadModal && (
                <DownloadFilterModal
                    doctors={doctors}
                    departments={departments}
                    isDoctor={isDoctor}
                    onClose={() => setShowDownloadModal(false)}
                />
            )}

            {showModal && <AppointmentModal
                appointment={selectedAppointment}
                type={modalType}
                doctors={doctors}
                departments={departments}
                userRole={userRole}
                hospitalTemplate={hospitalTemplate}
                onClose={() => setShowModal(false)}
                onAssignDoctor={handleAssignDoctor}
                onUpdate={handleUpdate}
            />}
        </div>
    );
};

/* ================================================================
   DOWNLOAD FILTER MODAL
   ================================================================ */
const DownloadFilterModal = ({ doctors, departments, isDoctor, onClose }) => {
    const [dateRange, setDateRange] = useState('this_month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [status, setStatus] = useState('');
    const [department, setDepartment] = useState('');
    const [doctor, setDoctor] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [downloadDone, setDownloadDone] = useState(false);

    const getDateBounds = () => {
        const now = new Date();
        let from, to;
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        switch (dateRange) {
            case 'this_month':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'past_2':
                from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                break;
            case 'past_3':
                from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            case 'custom':
                from = customFrom ? new Date(customFrom) : null;
                to = customTo ? new Date(customTo + 'T23:59:59') : to;
                break;
            default:
                from = null;
        }
        return { from, to };
    };

    const handleClear = () => {
        setDateRange('this_month');
        setCustomFrom('');
        setCustomTo('');
        setStatus('');
        setDepartment('');
        setDoctor('');
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            setDownloadDone(false);

            const { from, to } = getDateBounds();
            const params = {
                page: 1,
                limit: 10000,
                status: status || undefined,
                department: department || undefined,
                doctor: doctor || undefined,
                dateFrom: from ? from.toISOString() : undefined,
                dateTo: to ? to.toISOString() : undefined,
            };

            const response = isDoctor
                ? await appointmentsAPI.getMyAppointments(params)
                : await appointmentsAPI.getAll(params);

            const data = response.data || response || [];
            if (!data.length) {
                toast.error('No appointments found for the selected filters');
                setDownloading(false);
                return;
            }

            // Build CSV
            const headers = ['Appointment ID', 'Patient Name', 'Email', 'Mobile', 'Date', 'Time', 'Department', 'Assigned Doctor', 'Status', 'Visit Type', 'Primary Concern'];
            const rows = data.map(a => [
                a.appointmentId || '',
                a.fullName || '',
                a.emailAddress || '',
                a.mobileNumber || '',
                a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('en-IN') : '',
                a.appointmentTime || '',
                a.department || '',
                a.doctorAssigned?.user?.name || a.doctorAssigned?.name || 'Not Assigned',
                a.appointmentStatus || '',
                a.visitType || '',
                a.primaryConcern || ''
            ]);

            const csvContent = [headers, ...rows]
                .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `appointments_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setDownloadDone(true);
            toast.success(`Downloaded ${data.length} appointments`);
            setTimeout(() => {
                setDownloading(false);
                setDownloadDone(false);
                onClose();
            }, 1200);
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Failed to download appointments');
            setDownloading(false);
        }
    };

    const filteredDoctors = department
        ? doctors.filter(doc => {
            if (doc.department?.name === department) return true;
            if (Array.isArray(doc.departments) && doc.departments.some(d => d?.name === department)) return true;
            return false;
        })
        : doctors;

    return (
        <div className="dl-overlay" onClick={onClose}>
            <div className="dl-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="dl-header">
                    <div className="dl-header-left">
                        <Filter size={18} />
                        <div>
                            <h2>Download Appointments</h2>
                            <p>Apply filters and export as CSV</p>
                        </div>
                    </div>
                    <button className="dl-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="dl-body">
                    {/* Date Range */}
                    <div className="dl-section">
                        <label className="dl-label">Date Range</label>
                        <div className="dl-chip-row">
                            {[
                                { key: 'this_month', label: 'This Month' },
                                { key: 'past_2', label: 'Past 2 Months' },
                                { key: 'past_3', label: 'Past 3 Months' },
                                { key: 'custom', label: 'Custom' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    className={`dl-chip ${dateRange === opt.key ? 'active' : ''}`}
                                    onClick={() => setDateRange(opt.key)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {dateRange === 'custom' && (
                            <div className="dl-date-range">
                                <div className="dl-date-field">
                                    <label>From</label>
                                    <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                                </div>
                                <span className="dl-date-sep">—</span>
                                <div className="dl-date-field">
                                    <label>To</label>
                                    <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status */}
                    <div className="dl-section">
                        <label className="dl-label">Status</label>
                        <div className="dl-select-wrapper">
                            <select value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <ChevronDown size={14} className="dl-select-icon" />
                        </div>
                    </div>

                    {/* Department */}
                    <div className="dl-section">
                        <label className="dl-label">Department</label>
                        <div className="dl-select-wrapper">
                            <select value={department} onChange={e => { setDepartment(e.target.value); setDoctor(''); }}>
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d._id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="dl-select-icon" />
                        </div>
                    </div>

                    {/* Assigned Doctor */}
                    {!isDoctor && (
                        <div className="dl-section">
                            <label className="dl-label">Assigned Doctor</label>
                            <div className="dl-select-wrapper">
                                <select value={doctor} onChange={e => setDoctor(e.target.value)}>
                                    <option value="">All Doctors</option>
                                    {filteredDoctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>
                                            {doc.user?.name || doc.name || 'Unknown'}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="dl-select-icon" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="dl-footer">
                    <button className="dl-clear-btn" onClick={handleClear}>Clear Filters</button>
                    <button
                        className={`dl-download-btn ${downloading ? (downloadDone ? 'done' : 'loading') : ''}`}
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? (
                            downloadDone ? (
                                <><CheckCircle size={16} /> Done!</>
                            ) : (
                                <><Loader2 size={16} className="dl-spin" /> Downloading...</>
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

const AppointmentModal = ({ appointment, type, doctors, departments, userRole, hospitalTemplate, onClose, onAssignDoctor, onUpdate }) => {
    const printRef = useRef();
    const [qrDataUrl, setQrDataUrl] = useState('');

    useEffect(() => {
        if (type === 'view' && appointment?.appointmentId) {
            QRCode.toDataURL(appointment.appointmentId, {
                width: 100, margin: 1, color: { dark: '#1e293b', light: '#ffffff' }
            }).then(url => setQrDataUrl(url)).catch(() => {});
        }
    }, [type, appointment?.appointmentId]);

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;
        const t = hospitalTemplate || {};
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head>
                <title>Appointment - ${appointment?.appointmentId || ''}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px 40px; color: #1f2937; font-size: 13px; }
                    .apt-template-view { font-size: 13px; color: #1e293b; }
                    .apt-tpl-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 10px; }
                    .apt-tpl-logo { width: 60px; height: 60px; object-fit: contain; border-radius: 6px; }
                    .apt-tpl-hospital-info { flex: 1; }
                    .apt-tpl-hospital-name { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 2px; }
                    .apt-tpl-hospital-address { font-size: 12px; color: #64748b; margin: 0 0 6px; line-height: 1.4; }
                    .apt-tpl-contacts { display: flex; flex-wrap: wrap; gap: 14px; font-size: 11px; color: #6b7280; }
                    .apt-tpl-registration { display: flex; gap: 20px; font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
                    .apt-tpl-divider { height: 3px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); margin: 10px 0; border-radius: 2px; }
                    .apt-tpl-divider-light { height: 1px; background: #e5e7eb; margin: 14px 0; }
                    .apt-tpl-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
                    .apt-tpl-doc-title { font-size: 16px; font-weight: 700; color: #1e40af; letter-spacing: 0.06em; margin: 0; }
                    .apt-tpl-date-generated { font-size: 11px; color: #94a3b8; margin: 0; }
                    .apt-tpl-id-row { display: flex; gap: 14px; margin-bottom: 4px; }
                    .apt-tpl-id-box { flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; text-align: center; }
                    .apt-tpl-id-label { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 4px; }
                    .apt-tpl-id-value { display: block; font-size: 15px; font-weight: 700; color: #1e40af; }
                    .apt-tpl-section { margin-bottom: 2px; }
                    .apt-tpl-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
                    .apt-tpl-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
                    .apt-tpl-detail { display: flex; flex-direction: column; padding: 6px 0; }
                    .apt-tpl-detail-full { grid-column: 1 / -1; }
                    .apt-tpl-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #94a3b8; margin-bottom: 2px; }
                    .apt-tpl-value { font-size: 13px; color: #1e293b; }
                    .apt-tpl-value-bold { font-weight: 600; }
                    .apt-tpl-value-warn { color: #b45309; font-weight: 600; }
                    .apt-tpl-section-warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; }
                    .apt-tpl-section-warning .apt-tpl-section-title { color: #92400e; border-bottom-color: #fde68a; }
                    .apt-tpl-warning-row { display: flex; flex-direction: column; padding: 6px 0; }
                    .apt-tpl-warning-row .apt-tpl-label { color: #b45309; }
                    .apt-tpl-bottom-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding-top: 14px; border-top: 1px solid #e5e7eb; }
                    .apt-tpl-qr-block { text-align: center; }
                    .apt-tpl-qr-block img { width: 80px; height: 80px; }
                    .apt-tpl-qr-block p { font-size: 10px; color: #9ca3af; margin-top: 3px; }
                    .apt-tpl-timestamps { text-align: right; font-size: 11px; color: #94a3b8; }
                    .apt-tpl-timestamps p { margin-bottom: 2px; }
                    .apt-tpl-footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; }
                    .apt-tpl-footer p { font-size: 11px; color: #94a3b8; font-style: italic; }
                    .apt-tpl-reg-info { display: flex; gap: 20px; font-size: 11px; color: #9ca3af; margin-top: 12px; justify-content: center; }
                    .status-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block; }
                    .status-badge.pending, .status-badge.status-pending { background: #fef3c7; color: #92400e; }
                    .status-badge.confirmed, .status-badge.status-confirmed { background: #dbeafe; color: #1e40af; }
                    .status-badge.completed, .status-badge.status-completed { background: #d1fae5; color: #065f46; }
                    .status-badge.cancelled, .status-badge.status-cancelled { background: #fee2e2; color: #991b1b; }
                    .apt-tpl-print-btn { display: none !important; }
                </style>
            </head>
            <body>${content.innerHTML}</body>
            </html>
        `);
        win.document.close();
        win.print();
    };

    const [formData, setFormData] = useState({
        appointmentStatus: appointment?.appointmentStatus || '',
        department: appointment?.department || '',
        appointmentDate: appointment?.appointmentDate?.split('T')[0] || '',
        appointmentTime: appointment?.appointmentTime || '',
        doctorId: appointment?.doctorAssigned?._id || '',
        knownAllergies: appointment?.knownAllergies || 'No',
        allergiesDetails: appointment?.allergiesDetails || '',
        existingConditions: appointment?.existingConditions || ''
    });

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: inputType === 'checkbox' ? checked : value };
            // Reset assigned doctor if department changes
            if (name === 'department' && value !== appointment?.department) {
                updated.doctorId = '';
            }
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (type === 'assign') {
            onAssignDoctor(appointment._id, formData.doctorId);
        } else if (type === 'edit') {
            onUpdate(appointment._id, formData);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {type === 'view' && 'Appointment Details'}
                        {type === 'edit' && 'Edit Appointment'}
                        {type === 'assign' && 'Assign Doctor'}
                    </h2>
                    <div className="modal-header-actions">
                        {type === 'view' && (
                            <button className="apt-tpl-print-btn" onClick={handlePrint} title="Print Appointment">
                                <Printer size={16} /> Print
                            </button>
                        )}
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {type === 'view' && (
                    <div className="modal-body apt-template-view" ref={printRef}>
                        {/* Hospital Header */}
                        <div className="apt-tpl-header">
                            {hospitalTemplate?.hospitalLogoUrl && (
                                <img src={hospitalTemplate.hospitalLogoUrl} alt="Logo" className="apt-tpl-logo" />
                            )}
                            <div className="apt-tpl-hospital-info">
                                <h3 className="apt-tpl-hospital-name">{hospitalTemplate?.hospitalName || 'Hospital Name'}</h3>
                                <p className="apt-tpl-hospital-address">{hospitalTemplate?.hospitalAddress || ''}</p>
                                <div className="apt-tpl-contacts">
                                    {hospitalTemplate?.contactNumber && <span>📞 {hospitalTemplate.contactNumber}</span>}
                                    {hospitalTemplate?.emailAddress && <span>✉ {hospitalTemplate.emailAddress}</span>}
                                    {hospitalTemplate?.websiteUrl && <span>🌐 {hospitalTemplate.websiteUrl}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Registration & Compliance */}
                        {(hospitalTemplate?.gstNumber || hospitalTemplate?.cinNumber) && (
                            <div className="apt-tpl-registration">
                                {hospitalTemplate?.gstNumber && <span>GST: {hospitalTemplate.gstNumber}</span>}
                                {hospitalTemplate?.cinNumber && <span>CIN: {hospitalTemplate.cinNumber}</span>}
                            </div>
                        )}

                        <div className="apt-tpl-divider"></div>

                        {/* Document Title */}
                        <div className="apt-tpl-title-row">
                            <h4 className="apt-tpl-doc-title">APPOINTMENT DETAILS</h4>
                            <p className="apt-tpl-date-generated">Generated: {new Date().toLocaleDateString('en-IN')}</p>
                        </div>

                        {/* Highlighted IDs */}
                        <div className="apt-tpl-id-row">
                            <div className="apt-tpl-id-box">
                                <span className="apt-tpl-id-label">Appointment ID</span>
                                <span className="apt-tpl-id-value">{appointment.appointmentId}</span>
                            </div>
                            <div className="apt-tpl-id-box">
                                <span className="apt-tpl-id-label">Patient ID</span>
                                <span className="apt-tpl-id-value">{appointment.patientId}</span>
                            </div>
                        </div>

                        <div className="apt-tpl-divider"></div>

                        {/* Patient Information */}
                        <div className="apt-tpl-section">
                            <h4 className="apt-tpl-section-title">Patient Information</h4>
                            <div className="apt-tpl-details-grid">
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Name:</span>
                                    <span className="apt-tpl-value apt-tpl-value-bold">{appointment.fullName}</span>
                                </div>
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Email:</span>
                                    <span className="apt-tpl-value">{appointment.emailAddress}</span>
                                </div>
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Mobile:</span>
                                    <span className="apt-tpl-value">{appointment.mobileNumber || 'N/A'}</span>
                                </div>
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Age / Gender:</span>
                                    <span className="apt-tpl-value">{appointment.age} / {appointment.gender}</span>
                                </div>
                            </div>
                        </div>

                        <div className="apt-tpl-divider-light"></div>

                        {/* Appointment Information */}
                        <div className="apt-tpl-section">
                            <h4 className="apt-tpl-section-title">Appointment Information</h4>
                            <div className="apt-tpl-details-grid">
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Date / Time:</span>
                                    <span className="apt-tpl-value apt-tpl-value-bold">{new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} — {appointment.appointmentTime}</span>
                                </div>
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Department:</span>
                                    <span className="apt-tpl-value">{appointment.department || 'N/A'}</span>
                                </div>
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Status:</span>
                                    <span className={`status-badge ${(appointment.appointmentStatus || '').toLowerCase()}`}>{appointment.appointmentStatus}</span>
                                </div>
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Assigned Doctor:</span>
                                    <span className="apt-tpl-value">{appointment.doctorAssigned?.user?.name || 'Not Assigned'}</span>
                                </div>
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Visit Type:</span>
                                    <span className="apt-tpl-value">{appointment.visitType || 'N/A'}</span>
                                </div>
                                {appointment.primaryConcern && (
                                    <div className="apt-tpl-detail apt-tpl-detail-full">
                                        <span className="apt-tpl-label">Primary Concern:</span>
                                        <span className="apt-tpl-value">{appointment.primaryConcern}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="apt-tpl-divider-light"></div>

                        {/* Medical Information */}
                        <div className="apt-tpl-section">
                            <h4 className="apt-tpl-section-title">Medical Information</h4>
                            <div className="apt-tpl-details-grid">
                                <div className="apt-tpl-detail">
                                    <span className="apt-tpl-label">Known Allergies:</span>
                                    <span className={`apt-tpl-value ${appointment.knownAllergies === 'Yes' ? 'apt-tpl-value-warn' : ''}`}>{appointment.knownAllergies || 'No'}</span>
                                </div>
                                {appointment.allergiesDetails && (
                                    <div className="apt-tpl-detail apt-tpl-detail-full">
                                        <span className="apt-tpl-label">Allergy Details:</span>
                                        <span className="apt-tpl-value apt-tpl-value-warn">{appointment.allergiesDetails}</span>
                                    </div>
                                )}
                                {appointment.existingConditions && (
                                    <div className="apt-tpl-detail apt-tpl-detail-full">
                                        <span className="apt-tpl-label">Existing Conditions:</span>
                                        <span className="apt-tpl-value">{appointment.existingConditions}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cancel / Removal Reasons (Admin/Receptionist only) */}
                        {((appointment.cancelReason || appointment.doctorRemovalReason) && (userRole === 'Admin' || userRole === 'Receptionist')) && (
                            <>
                                <div className="apt-tpl-divider-light"></div>
                                <div className="apt-tpl-section apt-tpl-section-warning">
                                    <h4 className="apt-tpl-section-title">⚠ Additional Notes</h4>
                                    {appointment.cancelReason && (
                                        <div className="apt-tpl-warning-row">
                                            <span className="apt-tpl-label">Cancel Reason:</span>
                                            <span className="apt-tpl-value">{appointment.cancelReason}</span>
                                        </div>
                                    )}
                                    {appointment.doctorRemovalReason && (
                                        <div className="apt-tpl-warning-row">
                                            <span className="apt-tpl-label">Doctor Removal Reason:</span>
                                            <span className="apt-tpl-value">
                                                {appointment.doctorRemovalReason}
                                                {appointment.doctorRemovedAt && (
                                                    <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '8px' }}>
                                                        ({new Date(appointment.doctorRemovedAt).toLocaleString()})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* QR Code + Timestamps */}
                        <div className="apt-tpl-bottom-section">
                            <div className="apt-tpl-qr-block">
                                {qrDataUrl && <img src={qrDataUrl} alt="QR Code" />}
                                <p>Scan to verify</p>
                                <p style={{ fontSize: '10px', color: '#94a3b8' }}>{appointment.appointmentId}</p>
                            </div>
                            <div className="apt-tpl-timestamps">
                                {appointment.createdAt && (
                                    <p>Created: {new Date(appointment.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                )}
                                {appointment.updatedAt && (
                                    <p>Last Updated: {new Date(appointment.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                )}
                            </div>
                        </div>

                        {/* Registration info */}
                        {(hospitalTemplate?.gstNumber || hospitalTemplate?.cinNumber) && (
                            <div className="apt-tpl-reg-info">
                                {hospitalTemplate?.gstNumber && <span>GST: {hospitalTemplate.gstNumber}</span>}
                                {hospitalTemplate?.cinNumber && <span>CIN: {hospitalTemplate.cinNumber}</span>}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="apt-tpl-footer">
                            <p>{hospitalTemplate?.footerNote || 'This is a computer-generated document.'}</p>
                        </div>
                    </div>
                )}

                {(type === 'edit' || type === 'assign') && (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {type === 'edit' && (
                                <>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <select
                                            name="department"
                                            className="form-control"
                                            value={formData.department}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept._id} value={dept.name}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Appointment Date</label>
                                        <input
                                            type="date"
                                            name="appointmentDate"
                                            className="form-control"
                                            value={formData.appointmentDate}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Appointment Time</label>
                                        <input
                                            type="text"
                                            name="appointmentTime"
                                            className="form-control"
                                            value={formData.appointmentTime}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Known Allergies</label>
                                        <select
                                            name="knownAllergies"
                                            className="form-control"
                                            value={formData.knownAllergies}
                                            onChange={handleChange}
                                        >
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>

                                    {formData.knownAllergies === 'Yes' && (
                                        <div className="form-group">
                                            <label>Allergy Details</label>
                                            <input
                                                type="text"
                                                name="allergiesDetails"
                                                className="form-control"
                                                value={formData.allergiesDetails}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Existing Conditions</label>
                                        <textarea
                                            name="existingConditions"
                                            className="form-control"
                                            rows="3"
                                            value={formData.existingConditions}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </>
                            )}

                            {type === 'assign' && (() => {
                                const deptName = appointment?.department;
                                const filteredDoctors = deptName
                                    ? doctors.filter(doc => {
                                        if (doc.department?.name === deptName) return true;
                                        if (Array.isArray(doc.departments) && doc.departments.some(d => d?.name === deptName)) return true;
                                        return false;
                                    })
                                    : doctors;
                                return (
                                    <div className="form-group">
                                        <label>Select Doctor {deptName ? `(${deptName})` : ''}</label>
                                        <select
                                            name="doctorId"
                                            className="form-control"
                                            value={formData.doctorId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Choose a doctor...</option>
                                            {filteredDoctors.map(doctor => (
                                                <option key={doctor._id} value={doctor._id}>
                                                    {doctor.user?.name || doctor.name || 'Unknown'} - {doctor.department?.name || doctor.qualifications || 'N/A'}
                                                </option>
                                            ))}
                                            {filteredDoctors.length === 0 && (
                                                <option disabled>No doctors in this department</option>
                                            )}
                                        </select>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                {type === 'assign' ? 'Assign' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Appointments;
