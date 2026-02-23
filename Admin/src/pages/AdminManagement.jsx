import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Edit2, RotateCcw, Power, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminManagement = () => {
    const { user: currentUser } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await api.get('/user-management/Admin');
            setAdmins(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAdmin) {
                await api.put(`/user-management/${editingAdmin._id}`, formData);
                toast.success('Admin updated successfully');
            } else {
                await api.post('/user-management', { ...formData, role: 'Admin' });
                toast.success('Admin created successfully with password: hms@admin');
            }
            fetchAdmins();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (id === currentUser?._id) {
            toast.error('You cannot deactivate your own account');
            return;
        }
        try {
            await api.patch(`/user-management/${id}/toggle-status`);
            toast.success(`Admin ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleResetPassword = async (id) => {
        if (!confirm('Reset password to hms@admin?')) return;
        try {
            await api.patch(`/user-management/${id}/reset-password`);
            toast.success('Password reset to: hms@admin');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleDelete = async (id) => {
        if (id === currentUser?._id) {
            toast.error('You cannot delete your own account');
            return;
        }
        if (!confirm('Are you sure you want to delete this admin?')) return;
        try {
            await api.delete(`/user-management/${id}`);
            toast.success('Admin deleted successfully');
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete admin');
        }
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            name: admin.name,
            email: admin.email,
            phone: admin.phone
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAdmin(null);
        setFormData({ name: '', email: '', phone: '' });
    };

    const filteredAdmins = (admins || []).filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phone.includes(searchTerm)
    );

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Management</h1>
                    <p className="text-gray-600">Manage system administrators and their access</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Admin
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

            {/* Admins Table */}
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
                                {filteredAdmins.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-gray-500 py-8">
                                            No admins found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAdmins.map((admin) => (
                                        <tr key={admin._id}>
                                            <td className="font-medium">{admin.name}</td>
                                            <td>{admin.email}</td>
                                            <td>{admin.phone}</td>
                                            <td>
                                                <span className={`badge ${admin.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {admin.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(admin)}
                                                        className="btn-icon"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(admin._id)}
                                                        className="btn-icon text-blue-600"
                                                        title="Reset Password"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                                                        className={`btn-icon ${admin.isActive ? 'text-red-600' : 'text-green-600'} ${admin._id === currentUser?._id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                        title={admin._id === currentUser?._id ? 'Cannot deactivate yourself' : (admin.isActive ? 'Deactivate' : 'Activate')}
                                                        disabled={admin._id === currentUser?._id}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(admin._id)}
                                                        className={`btn-icon text-red-600 ${admin._id === currentUser?._id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                        title={admin._id === currentUser?._id ? 'Cannot delete yourself' : 'Delete'}
                                                        disabled={admin._id === currentUser?._id}
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
                                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
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
                                        placeholder="Admin Name"
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
                                        placeholder="admin@hospital.com"
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
                                {!editingAdmin && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">
                                            Default password will be set to: <strong>hms@admin</strong>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {editingAdmin ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
