import { useState, useEffect } from 'react';
import { UserCog, Plus, Search, Edit2, RotateCcw, Power, Trash2, X } from 'lucide-react';
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

    const filteredDoctors = (doctors || []).filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.phone.includes(searchTerm)
    );

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Doctor Management</h1>
                    <p className="text-gray-600">Manage doctors and their access</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Doctor
                </button>
            </div>

            {/* Search Bar */}
            <div className="card p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 w-full"
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
                                            <td className="font-medium">{doctor.name}</td>
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
        </div>
    );
};

export default DoctorManagement;
