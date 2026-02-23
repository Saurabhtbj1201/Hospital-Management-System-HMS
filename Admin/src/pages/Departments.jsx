import { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Power, UserPlus, X, Crown, Users as UsersIcon, Phone, Mail, Trash, Eye } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        defaultConsultationFee: 0,
        services: [],
        contact: {
            phone: '',
            email: '',
            location: '',
            workingHours: ''
        }
    });
    const [newService, setNewService] = useState({ serviceName: '', fee: '', description: '' });
    const [workingHours, setWorkingHours] = useState({
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: true, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '17:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' }
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await api.get('/departments/admin/all');
            setDepartments(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartmentDetails = async (id) => {
        try {
            const data = await api.get(`/departments/${id}`);
            setSelectedDepartment(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch department details');
        }
    };

    const fetchAvailableDoctors = async (departmentId) => {
        try {
            const data = await api.get(`/departments/admin/${departmentId}/available-doctors`);
            setAvailableDoctors(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch doctors');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Stringify working hours for storage
            const submitData = {
                ...formData,
                contact: {
                    ...formData.contact,
                    workingHours: JSON.stringify(workingHours)
                }
            };
            if (editingDepartment) {
                await api.put(`/departments/${editingDepartment._id}`, submitData);
                toast.success('Department updated successfully');
            } else {
                await api.post('/departments', submitData);
                toast.success('Department created successfully');
            }
            fetchDepartments();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/departments/${id}/toggle-status`);
            toast.success(`Department ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`/departments/${id}`);
            toast.success('Department deleted successfully');
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete department');
        }
    };

    const handleEdit = (department) => {
        setEditingDepartment(department);
        setFormData({
            name: department.name,
            description: department.description || '',
            image: department.image || '',
            defaultConsultationFee: department.defaultConsultationFee || 0,
            services: department.services || [],
            contact: department.contact || {
                phone: '',
                email: '',
                location: '',
                workingHours: ''
            }
        });
        // Parse working hours if available
        if (department.contact?.workingHours) {
            try {
                const parsed = JSON.parse(department.contact.workingHours);
                setWorkingHours(parsed);
            } catch (e) {
                // If it's old format string, keep default
            }
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDepartment(null);
        setFormData({
            name: '',
            description: '',
            image: '',
            defaultConsultationFee: 0,
            services: [],
            contact: {
                phone: '',
                email: '',
                location: '',
                workingHours: ''
            }
        });
        setNewService({ serviceName: '', fee: '', description: '' });
        setWorkingHours({
            monday: { enabled: true, start: '09:00', end: '17:00' },
            tuesday: { enabled: true, start: '09:00', end: '17:00' },
            wednesday: { enabled: true, start: '09:00', end: '17:00' },
            thursday: { enabled: true, start: '09:00', end: '17:00' },
            friday: { enabled: true, start: '09:00', end: '17:00' },
            saturday: { enabled: false, start: '09:00', end: '17:00' },
            sunday: { enabled: false, start: '09:00', end: '17:00' }
        });
    };

    const handleAddService = () => {
        if (!newService.serviceName || !newService.fee) {
            toast.error('Please fill service name and fee');
            return;
        }
        setFormData({
            ...formData,
            services: [...formData.services, { ...newService, fee: Number(newService.fee) }]
        });
        setNewService({ serviceName: '', fee: '', description: '' });
    };

    const handleRemoveService = (index) => {
        setFormData({
            ...formData,
            services: formData.services.filter((_, i) => i !== index)
        });
    };

    const handleViewDoctors = async (department) => {
        await fetchDepartmentDetails(department._id);
        await fetchAvailableDoctors(department._id);
        setShowDoctorModal(true);
    };

    const handleAssignDoctor = async (userId, isPrimary = false) => {
        try {
            await api.post('/departments/admin/assign-doctor', {
                departmentId: selectedDepartment._id,
                userId,
                isPrimary
            });
            toast.success('Doctor assigned successfully');
            await fetchDepartmentDetails(selectedDepartment._id);
            await fetchAvailableDoctors(selectedDepartment._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign doctor');
        }
    };

    const handleRemoveDoctor = async (doctorId) => {
        if (!confirm('Are you sure you want to remove this doctor from the department?')) return;
        try {
            await api.post('/departments/admin/remove-doctor', {
                departmentId: selectedDepartment._id,
                doctorId
            });
            toast.success('Doctor removed successfully');
            await fetchDepartmentDetails(selectedDepartment._id);
            await fetchAvailableDoctors(selectedDepartment._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove doctor');
        }
    };

    const handleSetPrimary = async (doctorId) => {
        try {
            await api.post('/departments/admin/set-primary-department', {
                departmentId: selectedDepartment._id,
                doctorId
            });
            toast.success('Primary department updated successfully');
            await fetchDepartmentDetails(selectedDepartment._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set primary department');
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center mb-6 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-gray-600 mt-1">Manage hospital departments and assignments</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Department
                </button>
            </div>

            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="spinner-large"></div>
                    </div>
                ) : departments.length === 0 ? (
                    <div className="p-8 text-center">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No departments found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>Doctors</th>
                                    <th>Consultation Fee</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((dept) => (
                                    <tr key={dept._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{dept.name}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {dept.description || 'No description'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleViewDoctors(dept)}
                                                className="flex items-center gap-2 group"
                                            >
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                                                    {dept.doctorCount || 0}
                                                </span>
                                                <Eye className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                            </button>
                                        </td>
                                        <td>
                                            <div className="font-medium text-gray-900">
                                                ₹{dept.defaultConsultationFee || 0}
                                            </div>
                                            {dept.services && dept.services.length > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    +{dept.services.length} service(s)
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                {dept.contact?.phone && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Phone className="w-3 h-3" />
                                                        {dept.contact.phone}
                                                    </div>
                                                )}
                                                {dept.contact?.email && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Mail className="w-3 h-3" />
                                                        {dept.contact.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${dept.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {dept.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleEdit(dept)}
                                                    className="action-btn action-btn-edit"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Department Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingDepartment ? 'Edit Department' : 'Add New Department'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="label">Department Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input"
                                                placeholder="Cardiology"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="label">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="input"
                                                rows="3"
                                                placeholder="Department description..."
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="label">Image URL</label>
                                            <input
                                                type="text"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                className="input"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Default Consultation Fee (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={formData.defaultConsultationFee}
                                                onChange={(e) => setFormData({ ...formData, defaultConsultationFee: e.target.value })}
                                                className="input"
                                                placeholder="Enter consultation fee in Rupees"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Services */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                                    
                                    {/* Existing Services */}
                                    {formData.services && formData.services.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.services.map((service, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{service.serviceName}</div>
                                                        <div className="text-sm text-gray-600">₹{service.fee}</div>
                                                        {service.description && (
                                                            <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveService(index)}
                                                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Service */}
                                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                                        <div className="font-medium text-gray-700">Add New Service</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newService.serviceName}
                                                    onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
                                                    className="input"
                                                    placeholder="Service Name"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={newService.fee}
                                                    onChange={(e) => setNewService({ ...newService, fee: e.target.value })}
                                                    className="input"
                                                    placeholder="Fee (₹)"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    value={newService.description}
                                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                                    className="input"
                                                    placeholder="Service Description (optional)"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddService}
                                            className="btn-secondary w-full"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Service
                                        </button>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.contact.phone}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    contact: { ...formData.contact, phone: e.target.value }
                                                })}
                                                className="input"
                                                placeholder="+1234567890"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Email</label>
                                            <input
                                                type="email"
                                                value={formData.contact.email}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    contact: { ...formData.contact, email: e.target.value }
                                                })}
                                                className="input"
                                                placeholder="department@hospital.com"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="label">Location</label>
                                            <input
                                                type="text"
                                                value={formData.contact.location}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    contact: { ...formData.contact, location: e.target.value }
                                                })}
                                                className="input"
                                                placeholder="Building A, Floor 3, Room 301"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="label">Working Hours</label>
                                            <div className="space-y-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                {Object.entries(workingHours).map(([day, hours]) => (
                                                    <div key={day} className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2 w-32">
                                                            <input
                                                                type="checkbox"
                                                                checked={hours.enabled}
                                                                onChange={(e) => setWorkingHours({
                                                                    ...workingHours,
                                                                    [day]: { ...hours, enabled: e.target.checked }
                                                                })}
                                                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                                            />
                                                            <label className="text-sm font-medium text-gray-700 capitalize">
                                                                {day}
                                                            </label>
                                                        </div>
                                                        {hours.enabled && (
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <input
                                                                    type="time"
                                                                    value={hours.start}
                                                                    onChange={(e) => setWorkingHours({
                                                                        ...workingHours,
                                                                        [day]: { ...hours, start: e.target.value }
                                                                    })}
                                                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                                />
                                                                <span className="text-sm text-gray-500">to</span>
                                                                <input
                                                                    type="time"
                                                                    value={hours.end}
                                                                    onChange={(e) => setWorkingHours({
                                                                        ...workingHours,
                                                                        [day]: { ...hours, end: e.target.value }
                                                                    })}
                                                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                                />
                                                            </div>
                                                        )}
                                                        {!hours.enabled && (
                                                            <span className="text-sm text-gray-400 italic">Closed</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
                                {editingDepartment && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(editingDepartment._id, editingDepartment.isActive)}
                                            className={`btn-secondary ${editingDepartment.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                        >
                                            <Power className="w-4 h-4 mr-2" />
                                            {editingDepartment.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(editingDepartment._id)}
                                            className="btn-secondary text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </button>
                                    </>
                                )}
                                <div className="flex-1"></div>
                                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingDepartment ? 'Update Department' : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Doctors Slideout */}
            {showDoctorModal && selectedDepartment && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                        onClick={() => {
                            setShowDoctorModal(false);
                            setSelectedDepartment(null);
                        }}
                    ></div>
                    
                    {/* Slideout Panel */}
                    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-out">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 truncate">
                                    <Building2 className="w-4.5 h-4.5 text-primary-600 shrink-0" />
                                    {selectedDepartment.name}
                                </h2>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-xs text-gray-500 font-medium">{selectedDepartment.doctors?.length || 0} Doctor(s)</span>
                                    {selectedDepartment.defaultConsultationFee > 0 && (
                                        <span className="text-xs text-gray-500">Fee: <span className="font-semibold text-gray-700">₹{selectedDepartment.defaultConsultationFee}</span></span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowDoctorModal(false);
                                    setSelectedDepartment(null);
                                }} 
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Assigned Doctors Section */}
                            <div className="border-b border-gray-100">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                                        <UsersIcon className="w-3.5 h-3.5 text-primary-600" />
                                        Assigned Doctors
                                    </h3>
                                    <span className="text-xs text-gray-400 font-medium">{selectedDepartment.doctors?.length || 0}</span>
                                </div>

                                {selectedDepartment.doctors && selectedDepartment.doctors.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {selectedDepartment.doctors.map((doctor) => (
                                            <div
                                                key={doctor._id}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                                            >
                                                {/* Profile Photo */}
                                                {doctor.profilePhotoUrl ? (
                                                    <img
                                                        src={doctor.profilePhotoUrl}
                                                        alt={doctor.user?.name}
                                                        className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                                                        {doctor.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {doctor.user?.name || 'Unknown'}
                                                        </p>
                                                        {doctor.department?.toString() === selectedDepartment._id && (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded text-[10px] font-medium bg-amber-100 text-amber-700 shrink-0">
                                                                <Crown className="w-2.5 h-2.5" />
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{doctor.user?.email}</p>
                                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                                        {doctor.qualifications}{doctor.experience ? ` • ${doctor.experience}y exp` : ''}{doctor.fees ? ` • ₹${doctor.fees}` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {doctor.department?.toString() !== selectedDepartment._id && (
                                                        <button
                                                            onClick={() => handleSetPrimary(doctor._id)}
                                                            className="text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 py-1 rounded font-medium transition-colors"
                                                        >
                                                            Set Primary
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveDoctor(doctor._id)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-6 text-center">
                                        <UsersIcon className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                                        <p className="text-xs text-gray-400">No doctors assigned yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Available Doctors Section */}
                            <div>
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                                        <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                                        Available Doctors
                                    </h3>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {availableDoctors.filter(doctor => 
                                            !selectedDepartment.doctors?.some(d => d._id === doctor._id)
                                        ).length}
                                    </span>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {availableDoctors
                                        .filter(doctor => 
                                            !selectedDepartment.doctors?.some(d => d._id === doctor._id)
                                        )
                                        .map((doctor) => (
                                            <div
                                                key={doctor._id}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                                            >
                                                {/* Profile Photo */}
                                                {doctor.profilePhotoUrl ? (
                                                    <img
                                                        src={doctor.profilePhotoUrl}
                                                        alt={doctor.user?.name}
                                                        className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                                                        {doctor.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {doctor.user?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{doctor.user?.email}</p>
                                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                                        {doctor.department?.name || 'No dept'}{doctor.qualifications ? ` • ${doctor.qualifications}` : ''}{doctor.fees ? ` • ₹${doctor.fees}` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleAssignDoctor(doctor.user._id, false)}
                                                        className="text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded font-medium transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        onClick={() => handleAssignDoctor(doctor.user._id, true)}
                                                        className="text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 py-1 rounded font-medium transition-colors flex items-center gap-0.5"
                                                    >
                                                        <Crown className="w-3 h-3" />
                                                        Primary
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    {availableDoctors.filter(doctor => 
                                        !selectedDepartment.doctors?.some(d => d._id === doctor._id)
                                    ).length === 0 && (
                                        <div className="px-4 py-6 text-center">
                                            <UserPlus className="w-6 h-6 text-blue-300 mx-auto mb-1.5" />
                                            <p className="text-xs text-gray-400">All doctors are already assigned</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Departments;
