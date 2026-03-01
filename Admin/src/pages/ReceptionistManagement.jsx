import { useState, useEffect } from 'react';
import { UserCog, Plus, Search, Edit2, RotateCcw, Power, Trash2, X, Download, Loader2, Eye, Phone, Mail, Calendar, Briefcase, GraduationCap, Shield, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ReceptionistManagement = () => {
    const [receptionists, setReceptionists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingReceptionist, setEditingReceptionist] = useState(null);
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
        fetchReceptionists();
    }, []);

    const fetchReceptionists = async () => {
        try {
            setLoading(true);
            const data = await api.get('/user-management/Receptionist');
            setReceptionists(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch receptionists');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingReceptionist) {
                await api.put(`/user-management/${editingReceptionist._id}`, formData);
                toast.success('Receptionist updated successfully');
            } else {
                await api.post('/user-management', { ...formData, role: 'Receptionist' });
                toast.success('Receptionist created successfully with password: hms@receptionist');
            }
            fetchReceptionists();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/user-management/${id}/toggle-status`);
            toast.success(`Receptionist ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchReceptionists();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleResetPassword = async (id) => {
        if (!confirm('Reset password to hms@receptionist?')) return;
        try {
            await api.patch(`/user-management/${id}/reset-password`);
            toast.success('Password reset to: hms@receptionist');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this receptionist?')) return;
        try {
            await api.delete(`/user-management/${id}`);
            toast.success('Receptionist deleted successfully');
            fetchReceptionists();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete receptionist');
        }
    };

    const handleEdit = (receptionist) => {
        setEditingReceptionist(receptionist);
        setFormData({
            name: receptionist.name,
            email: receptionist.email,
            phone: receptionist.phone
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingReceptionist(null);
        setFormData({ name: '', email: '', phone: '' });
    };

    const handleViewDetail = async (receptionist) => {
        setShowDetailModal(true);
        setDetailLoading(true);
        try {
            const data = await api.get(`/user-management/profile/${receptionist._id}`);
            setDetailData(data);
        } catch (error) {
            toast.error('Failed to fetch receptionist details');
            setShowDetailModal(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDownloadData = async () => {
        if (!receptionists.length) {
            toast.error('No receptionist data to download');
            return;
        }
        try {
            setDownloading(true);
            const profiles = await Promise.all(
                receptionists.map(async (r) => {
                    try {
                        return await api.get(`/user-management/profile/${r._id}`);
                    } catch {
                        return { ...r, receptionistProfile: null };
                    }
                })
            );
            const headers = [
                'Name', 'Email', 'Phone', 'Status', 'Gender', 'Date of Birth',
                'Shift', 'Joining Date', 'Experience (Years)', 'Education Level',
                'ID Proof Type', 'ID Proof Number', 'Created At'
            ];
            const rows = profiles.map((p) => {
                const rp = p.receptionistProfile || {};
                return [
                    p.name || '',
                    p.email || '',
                    p.phone || '',
                    p.isActive ? 'Active' : 'Inactive',
                    rp.gender || '',
                    rp.dateOfBirth ? new Date(rp.dateOfBirth).toLocaleDateString() : '',
                    rp.shift || '',
                    rp.joiningDate ? new Date(rp.joiningDate).toLocaleDateString() : '',
                    rp.experience || 0,
                    rp.educationLevel || '',
                    rp.idProofType || '',
                    rp.idProofNumber || '',
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
            link.download = `receptionists_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Receptionist data downloaded');
        } catch {
            toast.error('Failed to download receptionist data');
        } finally {
            setDownloading(false);
        }
    };

    const filteredReceptionists = (receptionists || []).filter(receptionist =>
        receptionist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receptionist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receptionist.phone.includes(searchTerm)
    );

    return (
        <div className="p-4">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Receptionist Management</h1>
                    <p className="text-gray-600">Manage receptionists and their access</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleDownloadData} disabled={downloading} className="btn-secondary flex items-center gap-2" title="Download all receptionist data as CSV">
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {downloading ? 'Downloading...' : 'Download All'}
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Receptionist
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

            {/* Receptionists Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="mgmt-skeleton-row">
                                        <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '120px' }} /></td>
                                        <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '160px' }} /></td>
                                        <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '100px' }} /></td>
                                        <td><div className="mgmt-skeleton mgmt-skeleton-badge" /></td>
                                        <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '85px' }} /></td>
                                        <td>
                                            <div className="flex gap-2">
                                                <div className="mgmt-skeleton mgmt-skeleton-btn" />
                                                <div className="mgmt-skeleton mgmt-skeleton-btn" />
                                                <div className="mgmt-skeleton mgmt-skeleton-btn" />
                                                <div className="mgmt-skeleton mgmt-skeleton-btn" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReceptionists.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-gray-500 py-8">
                                            No receptionists found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReceptionists.map((receptionist) => (
                                        <tr key={receptionist._id}>
                                            <td>
                                                <button
                                                    onClick={() => handleViewDetail(receptionist)}
                                                    className="font-medium text-primary-600 hover:text-primary-800 hover:underline text-left"
                                                >
                                                    {receptionist.name}
                                                </button>
                                            </td>
                                            <td>{receptionist.email}</td>
                                            <td>{receptionist.phone}</td>
                                            <td>
                                                <span className={`badge ${receptionist.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {receptionist.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>{new Date(receptionist.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(receptionist)}
                                                        className="btn-icon"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(receptionist._id)}
                                                        className="btn-icon text-blue-600"
                                                        title="Reset Password"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(receptionist._id, receptionist.isActive)}
                                                        className={`btn-icon ${receptionist.isActive ? 'text-red-600' : 'text-green-600'}`}
                                                        title={receptionist.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(receptionist._id)}
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
                                {editingReceptionist ? 'Edit Receptionist' : 'Add New Receptionist'}
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
                                        placeholder="Jane Smith"
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
                                        placeholder="receptionist@hospital.com"
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
                                {!editingReceptionist && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">
                                            Default password will be set to: <strong>hms@receptionist</strong>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {editingReceptionist ? 'Update' : 'Create'}
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
                            <h2 className="text-xl font-bold text-gray-900">Receptionist Details</h2>
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
                                {detailData.receptionistProfile?.profilePhoto && (
                                    <div className="flex justify-center">
                                        <img
                                            src={detailData.receptionistProfile.profilePhoto}
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
                                            <p className="font-medium text-gray-900">{detailData.receptionistProfile?.gender || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Date of Birth</p>
                                            <p className="font-medium text-gray-900">{detailData.receptionistProfile?.dateOfBirth ? new Date(detailData.receptionistProfile.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Status</p>
                                            <span className={`badge ${detailData.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {detailData.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Details */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> Employment Details
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Shift</p>
                                            <p className="font-medium text-gray-900">{detailData.receptionistProfile?.shift || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Joining Date</p>
                                            <p className="font-medium text-gray-900">{detailData.receptionistProfile?.joiningDate ? new Date(detailData.receptionistProfile.joiningDate).toLocaleDateString() : 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Experience</p>
                                            <p className="font-medium text-gray-900">{detailData.receptionistProfile?.experience ? `${detailData.receptionistProfile.experience} year(s)` : 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Education Level</p>
                                            <p className="font-medium text-gray-900">{detailData.receptionistProfile?.educationLevel || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ID Proof */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> ID Proof
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">ID Proof Type</p>
                                            <p className="font-medium text-gray-900">{detailData.receptionistProfile?.idProofType || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">ID Proof Number</p>
                                            <p className="font-medium text-gray-900">{detailData.receptionistProfile?.idProofNumber || 'Not set'}</p>
                                        </div>
                                    </div>
                                    {detailData.receptionistProfile?.idProofDocument && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 mb-2">ID Proof Document</p>
                                            <img
                                                src={detailData.receptionistProfile.idProofDocument}
                                                alt="ID Proof"
                                                className="max-w-xs rounded-lg border border-gray-200 shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Digital Signature */}
                                {detailData.receptionistProfile?.digitalSignature && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Digital Signature</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <img
                                                src={detailData.receptionistProfile.digitalSignature}
                                                alt="Digital Signature"
                                                className="max-w-[200px] rounded border border-gray-200"
                                            />
                                        </div>
                                    </div>
                                )}

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

export default ReceptionistManagement;
