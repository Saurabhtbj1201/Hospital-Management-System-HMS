import { useState, useEffect } from 'react';
import { UserCog, Plus, Search, Edit2, RotateCcw, Power, Trash2, X } from 'lucide-react';
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

    const filteredReceptionists = (receptionists || []).filter(receptionist =>
        receptionist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receptionist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receptionist.phone.includes(searchTerm)
    );

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Receptionist Management</h1>
                    <p className="text-gray-600">Manage receptionists and their access</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Receptionist
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

            {/* Receptionists Table */}
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
                                            <td className="font-medium">{receptionist.name}</td>
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
        </div>
    );
};

export default ReceptionistManagement;
