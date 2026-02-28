import { useState, useEffect } from 'react';
import { UserCog, Plus, Search, Edit2, RotateCcw, Power, Trash2, X, Download, Loader2, User, Stethoscope, Globe, Star } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [downloading, setDownloading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const data = await api.get('/user-management/Doctor');
            setDoctors(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoctor) {
                await api.put(`/user-management/${editingDoctor._id}`, formData);
                toast.success('Doctor updated successfully');
            } else {
                await api.post('/user-management', { ...formData, role: 'Doctor' });
                toast.success('Doctor created successfully with password: hms@doctor');
            }
            fetchDoctors();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/user-management/${id}/toggle-status`);
            toast.success(`Doctor ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchDoctors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleResetPassword = async (id) => {
        if (!confirm('Reset password to hms@doctor?')) return;
        try {
            await api.patch(`/user-management/${id}/reset-password`);
            toast.success('Password reset to: hms@doctor');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this doctor?')) return;
        try {
            await api.delete(`/user-management/${id}`);
            toast.success('Doctor deleted successfully');
            fetchDoctors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete doctor');
        }
    };

    const handleEdit = (doctor) => {
        setEditingDoctor(doctor);
        setFormData({
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDoctor(null);
        setFormData({ name: '', email: '', phone: '' });
    };

    const handleViewDetail = async (doctor) => {
        setShowDetailModal(true);
        setDetailLoading(true);
        try {
            const data = await api.get(`/user-management/profile/${doctor._id}`);
            setDetailData(data);
        } catch (error) {
            toast.error('Failed to fetch doctor details');
            setShowDetailModal(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDownloadData = async () => {
        if (!doctors.length) {
            toast.error('No doctor data to download');
            return;
        }
        try {
            setDownloading(true);
            const profiles = await Promise.all(
                doctors.map(async (d) => {
                    try {
                        return await api.get(`/user-management/profile/${d._id}`);
                    } catch {
                        return { ...d, doctorProfile: null };
                    }
                })
            );
            const headers = [
                'Name', 'Email', 'Phone', 'Status', 'Gender', 'Date of Birth',
                'Qualifications', 'Experience (Years)', 'Consultation Fee',
                'Medical Council ID', 'Primary Department', 'All Departments',
                'Short Bio', 'Special Interests', 'Featured Treatments', 'Created At'
            ];
            const rows = profiles.map((p) => {
                const dp = p.doctorProfile || {};
                return [
                    p.name || '',
                    p.email || '',
                    p.phone || '',
                    p.isActive ? 'Active' : 'Inactive',
                    dp.gender || '',
                    dp.dateOfBirth ? new Date(dp.dateOfBirth).toLocaleDateString() : '',
                    dp.qualifications || '',
                    dp.experience || 0,
                    dp.fees || 0,
                    dp.medicalCouncilId || '',
                    dp.primaryDepartment?.name || '',
                    (dp.departments || []).map(d => d.name).join('; '),
                    (dp.shortBio || '').replace(/[\n\r]+/g, ' '),
                    (dp.specialInterests || []).join('; '),
                    (dp.featuredTreatments || []).join('; '),
                    p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
                ];
            });
            const csvContent = [headers, ...rows]
                .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                .join('\n');
            const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `doctors_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Doctor data downloaded');
        } catch {
            toast.error('Failed to download doctor data');
        } finally {
            setDownloading(false);
        }
    };

    const filteredDoctors = (doctors || []).filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.phone.includes(searchTerm)
    );

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Doctor Management</h1>
                    <p className="text-gray-600">Manage doctors and their access</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleDownloadData} disabled={downloading} className="btn-secondary flex items-center gap-2" title="Download all doctor data as CSV">
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {downloading ? 'Downloading...' : 'Download All'}
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Doctor
                    </button>
                </div>
            </div>

            {/* Search Bar */}
                <div className="search-form mb-6">
                    <div className="search-input-wrapper">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

            {/* Doctors Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="spinner-large"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Departments</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDoctors.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-gray-500 py-8">
                                            No doctors found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDoctors.map((doctor) => (
                                        <tr key={doctor._id}>
                                            <td>
                                                <button
                                                    onClick={() => handleViewDetail(doctor)}
                                                    className="font-medium text-primary-600 hover:text-primary-800 hover:underline text-left"
                                                >
                                                    {doctor.name}
                                                </button>
                                            </td>
                                            <td>{doctor.email}</td>
                                            <td>{doctor.phone}</td>
                                            <td>
                                                {doctor.doctorInfo ? (
                                                    <div className="space-y-1">
                                                        {doctor.doctorInfo.primaryDepartment && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                                                                    {doctor.doctorInfo.primaryDepartment.name}
                                                                </span>
                                                                <span className="text-xs text-gray-500">(Primary)</span>
                                                            </div>
                                                        )}
                                                        {doctor.doctorInfo.allDepartments && doctor.doctorInfo.allDepartments.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {doctor.doctorInfo.allDepartments
                                                                    .filter(dept => dept._id !== doctor.doctorInfo.primaryDepartment?._id)
                                                                    .map(dept => (
                                                                        <span key={dept._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                                            {dept.name}
                                                                        </span>
                                                                    ))
                                                                }
                                                            </div>
                                                        )}
                                                        {!doctor.doctorInfo.primaryDepartment && (!doctor.doctorInfo.allDepartments || doctor.doctorInfo.allDepartments.length === 0) && (
                                                            <span className="text-sm text-gray-400 italic">Not assigned</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Not assigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${doctor.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {doctor.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>{new Date(doctor.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(doctor)}
                                                        className="btn-icon"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(doctor._id)}
                                                        className="btn-icon text-blue-600"
                                                        title="Reset Password"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(doctor._id, doctor.isActive)}
                                                        className={`btn-icon ${doctor.isActive ? 'text-red-600' : 'text-green-600'}`}
                                                        title={doctor.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(doctor._id)}
                                                        className="btn-icon text-red-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input"
                                        placeholder="Dr. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input"
                                        placeholder="doctor@hospital.com"
                                    />
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input"
                                        placeholder="+1234567890"
                                    />
                                </div>
                                {!editingDoctor && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">
                                            Default password will be set to: <strong>hms@doctor</strong>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {editingDoctor ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-h-[90vh] overflow-y-auto p-6" style={{ maxWidth: '60rem' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Doctor Details</h2>
                            <button onClick={() => { setShowDetailModal(false); setDetailData(null); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                                <p className="text-gray-500 mt-2">Loading details...</p>
                            </div>
                        ) : detailData ? (
                            <div className="space-y-6">
                                {/* Profile Photo */}
                                {detailData.doctorProfile?.profilePhoto && (
                                    <div className="flex justify-center">
                                        <img
                                            src={detailData.doctorProfile.profilePhoto}
                                            alt={detailData.name}
                                            className="w-28 h-28 rounded-full object-cover border-4 border-primary-100 shadow"
                                        />
                                    </div>
                                )}

                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Personal Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="font-medium text-gray-900">{detailData.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium text-gray-900">{detailData.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-900">{detailData.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Gender</p>
                                            <p className="font-medium text-gray-900">{detailData.doctorProfile?.gender || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Date of Birth</p>
                                            <p className="font-medium text-gray-900">{detailData.doctorProfile?.dateOfBirth ? new Date(detailData.doctorProfile.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Status</p>
                                            <span className={`badge ${detailData.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {detailData.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Details */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" /> Professional Details
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Qualifications</p>
                                            <p className="font-medium text-gray-900">{detailData.doctorProfile?.qualifications || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Experience</p>
                                            <p className="font-medium text-gray-900">{detailData.doctorProfile?.experience ? `${detailData.doctorProfile.experience} year(s)` : 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Consultation Fee</p>
                                            <p className="font-medium text-gray-900">{detailData.doctorProfile?.fees ? `₹${detailData.doctorProfile.fees}` : 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Medical Council ID</p>
                                            <p className="font-medium text-gray-900">{detailData.doctorProfile?.medicalCouncilId || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Primary Department</p>
                                            <p className="font-medium text-gray-900">{detailData.doctorProfile?.primaryDepartment?.name || 'Not assigned'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">All Departments</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {detailData.doctorProfile?.departments?.length > 0 ? detailData.doctorProfile.departments.map(dept => (
                                                    <span key={dept._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">{dept.name}</span>
                                                )) : <span className="text-gray-400 text-sm">None</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Digital Signature */}
                                {detailData.doctorProfile?.digitalSignature && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Digital Signature</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <img
                                                src={detailData.doctorProfile.digitalSignature}
                                                alt="Digital Signature"
                                                className="max-w-[200px] rounded border border-gray-200"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Public Website */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> Public Website
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Short Bio</p>
                                            <p className="font-medium text-gray-900 text-sm">{detailData.doctorProfile?.shortBio || 'Not set'}</p>
                                        </div>
                                        {detailData.doctorProfile?.detailedBiography && (
                                            <div>
                                                <p className="text-xs text-gray-500">Detailed Biography</p>
                                                <div className="text-sm text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: detailData.doctorProfile.detailedBiography }} />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Special Interests</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {detailData.doctorProfile?.specialInterests?.length > 0
                                                        ? detailData.doctorProfile.specialInterests.map((item, i) => (
                                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{item}</span>
                                                        ))
                                                        : <span className="text-gray-400 text-sm">None</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Featured Treatments</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {detailData.doctorProfile?.featuredTreatments?.length > 0
                                                        ? detailData.doctorProfile.featuredTreatments.map((item, i) => (
                                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">{item}</span>
                                                        ))
                                                        : <span className="text-gray-400 text-sm">None</span>}
                                                </div>
                                            </div>
                                        </div>
                                        {detailData.doctorProfile?.patientTestimonials?.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">Patient Testimonials</p>
                                                <div className="space-y-2">
                                                    {detailData.doctorProfile.patientTestimonials.map((t, i) => (
                                                        <div key={i} className="bg-white rounded p-3 border border-gray-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-sm text-gray-900">{t.patientName || 'Anonymous'}</span>
                                                                <span className="flex items-center gap-0.5 text-yellow-500">
                                                                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                                                                        <Star key={j} className="w-3 h-3 fill-current" />
                                                                    ))}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">{t.testimonial}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 pt-2">
                                    Account created: {detailData.createdAt ? new Date(detailData.createdAt).toLocaleString() : 'N/A'}
                                    {detailData.lastLogin && ` | Last login: ${new Date(detailData.lastLogin).toLocaleString()}`}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No data available</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorManagement;
