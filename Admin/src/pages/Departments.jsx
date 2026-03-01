import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit2, Trash2, Power, UserPlus, X, Crown, Users as UsersIcon, Phone, Mail, Trash, Eye, MapPin, Clock, IndianRupee, Image, FileText, Stethoscope, Upload, Crop, ZoomIn, ZoomOut, RotateCw, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import api, { departmentsAPI } from '../services/api';

// Helper: create an image element from a URL
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const img = new window.Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (e) => reject(e));
        img.crossOrigin = 'anonymous';
        img.src = url;
    });

// Helper: crop image and return as Blob
const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const bW = image.width * cos + image.height * sin;
    const bH = image.width * sin + image.height * cos;

    canvas.width = bW;
    canvas.height = bH;

    ctx.translate(bW / 2, bH / 2);
    ctx.rotate(radians);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.putImageData(data, 0, 0);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
};

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewDepartment, setViewDepartment] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
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
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Crop state
    const [cropModal, setCropModal] = useState({ open: false, imageSrc: null });
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [cropZoom, setCropZoom] = useState(1);
    const [cropRotation, setCropRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
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
            let savedDept;
            if (editingDepartment) {
                savedDept = await api.put(`/departments/${editingDepartment._id}`, submitData);
                toast.success('Department updated successfully');
            } else {
                savedDept = await api.post('/departments', submitData);
                toast.success('Department created successfully');
            }
            // Upload image if a new file was selected
            if (imageFile && savedDept?._id) {
                await handleImageUpload(savedDept._id);
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
        // Set image preview from presigned URL
        setImagePreview(department.imageUrl || '');
        setImageFile(null);
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
        setImageFile(null);
        setImagePreview('');
        setCropModal({ open: false, imageSrc: null });
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

    const validateAndOpenCrop = (file) => {
        if (!file) return;
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowed.includes(file.type)) {
            toast.error('Only PNG, JPG, and WebP images are allowed');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setCropModal({ open: true, imageSrc: reader.result });
            setCrop({ x: 0, y: 0 });
            setCropZoom(1);
            setCropRotation(0);
            setCroppedAreaPixels(null);
        };
        reader.readAsDataURL(file);
    };

    const handleImageSelect = (e) => {
        validateAndOpenCrop(e.target.files?.[0]);
        e.target.value = '';
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        validateAndOpenCrop(e.dataTransfer.files?.[0]);
    };

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleCropConfirm = async () => {
        if (!croppedAreaPixels || !cropModal.imageSrc) return;
        try {
            const croppedBlob = await getCroppedImg(cropModal.imageSrc, croppedAreaPixels, cropRotation);
            setImageFile(croppedBlob);
            setImagePreview(URL.createObjectURL(croppedBlob));
            setCropModal({ open: false, imageSrc: null });
        } catch {
            toast.error('Failed to crop image');
        }
    };

    const handleCropCancel = () => {
        setCropModal({ open: false, imageSrc: null });
    };

    const handleImageUpload = async (departmentId) => {
        if (!imageFile) return;
        setUploadingImage(true);
        try {
            const fd = new FormData();
            fd.append('image', imageFile, 'department-image.jpg');
            await departmentsAPI.uploadImage(departmentId, fd);
            setImageFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageRemove = async () => {
        if (editingDepartment && formData.image) {
            try {
                await departmentsAPI.deleteImage(editingDepartment._id);
                toast.success('Image removed');
            } catch (error) {
                toast.error('Failed to remove image');
                return;
            }
        }
        setFormData({ ...formData, image: '' });
        setImageFile(null);
        setImagePreview('');
    };

    const handleRemoveService = (index) => {
        setFormData({
            ...formData,
            services: formData.services.filter((_, i) => i !== index)
        });
    };

    const handleViewDetails = async (department) => {
        setShowViewModal(true);
        setViewLoading(true);
        try {
            const data = await api.get(`/departments/${department._id}`);
            setViewDepartment(data);
        } catch (error) {
            toast.error('Failed to fetch department details');
            setShowViewModal(false);
        } finally {
            setViewLoading(false);
        }
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

    const [downloading, setDownloading] = useState(false);

    const handleDownloadData = async () => {
        if (!departments.length) {
            toast.error('No department data to download');
            return;
        }
        try {
            setDownloading(true);
            // Fetch details for each department to get assigned doctor names
            const detailedDepts = await Promise.all(
                departments.map(async (dept) => {
                    try {
                        const details = await api.get(`/departments/${dept._id}`);
                        return { ...dept, doctors: details.doctors || [] };
                    } catch {
                        return { ...dept, doctors: [] };
                    }
                })
            );

            const headers = ['Name', 'Description', 'Consultation Fee', 'Doctor Count', 'Assigned Doctors', 'Status', 'Image Link', 'Phone', 'Email', 'Location', 'Services', 'Created At'];
            const rows = detailedDepts.map((dept) => [
                dept.name || '',
                (dept.description || '').replace(/[\n\r]+/g, ' '),
                dept.defaultConsultationFee || 0,
                dept.doctorCount || 0,
                (dept.doctors || []).map(d => d.user?.name || 'Unknown').join('; '),
                dept.isActive ? 'Active' : 'Inactive',
                dept.imageUrl || '',
                dept.contact?.phone || '',
                dept.contact?.email || '',
                dept.contact?.location || '',
                (dept.services || []).map(s => `${s.serviceName} (₹${s.fee})`).join('; '),
                dept.createdAt ? new Date(dept.createdAt).toLocaleDateString() : ''
            ]);
            const csvContent = [headers, ...rows]
                .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                .join('\n');
            const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `departments_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Department data downloaded');
        } catch {
            toast.error('Failed to download department data');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center mb-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-gray-600 mt-1">Manage hospital departments and assignments</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleDownloadData} disabled={downloading} className="btn-secondary" title="Download all department data as CSV">
                        {downloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                        {downloading ? 'Downloading...' : 'Download All'}
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Department
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
                {loading ? (
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
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="mgmt-skeleton-row">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="mgmt-skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                                                <div>
                                                    <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '120px', marginBottom: '6px' }} />
                                                    <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '160px', height: '10px' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td><div className="mgmt-skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} /></td>
                                        <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '70px' }} /></td>
                                        <td>
                                            <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '100px', marginBottom: '6px' }} />
                                            <div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '130px', height: '10px' }} />
                                        </td>
                                        <td><div className="mgmt-skeleton mgmt-skeleton-badge" /></td>
                                        <td>
                                            <div className="flex gap-2">
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
                                                {dept.imageUrl ? (
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex-shrink-0 border border-gray-200"
                                                        style={{
                                                            backgroundImage: `url(${dept.imageUrl})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Building2 className="w-5 h-5 text-primary-600" />
                                                    </div>
                                                )}
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
                                                    onClick={() => handleViewDetails(dept)}
                                                    className="action-btn action-btn-view"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
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
                                            <label className="label">Department Image</label>
                                            <p className="text-xs text-gray-500 mb-2">Recommended: 2560 × 1440px (16:9). PNG, JPG, or WebP. Max 10MB.</p>
                                            
                                            {(imagePreview || formData.image) ? (
                                                <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                    <div
                                                        className="w-full rounded-lg"
                                                        style={{
                                                            backgroundImage: `url(${imagePreview || ''})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            backgroundRepeat: 'no-repeat',
                                                            aspectRatio: '16 / 9',
                                                        }}
                                                    />
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <label className="cursor-pointer bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all flex items-center gap-1">
                                                            <Upload className="w-3.5 h-3.5" /> Change
                                                            <input
                                                                type="file"
                                                                accept=".png,.jpg,.jpeg,.webp"
                                                                className="hidden"
                                                                onChange={handleImageSelect}
                                                            />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={handleImageRemove}
                                                            className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                                        </button>
                                                    </div>
                                                    {imageFile && (
                                                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-md font-medium">
                                                            New file selected — will upload on save
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <label
                                                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
                                                    style={{ aspectRatio: '16 / 9' }}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={handleImageDrop}
                                                >
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <p className="text-sm font-medium text-gray-600">Click or drag & drop to upload</p>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — 2560 × 1440px (16:9)</p>
                                                    <input
                                                        type="file"
                                                        accept=".png,.jpg,.jpeg,.webp"
                                                        className="hidden"
                                                        onChange={handleImageSelect}
                                                    />
                                                </label>
                                            )}
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

            {/* View Department Details Modal */}
            {showViewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primary-50 to-blue-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {viewLoading ? 'Loading...' : viewDepartment?.name || 'Department Details'}
                                    </h2>
                                    {viewDepartment && (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            viewDepartment.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {viewDepartment.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowViewModal(false); setViewDepartment(null); }}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto">
                            {viewLoading ? (
                                <div className="p-12 text-center">
                                    <div className="spinner-large"></div>
                                    <p className="text-gray-500 mt-3">Loading department details...</p>
                                </div>
                            ) : viewDepartment ? (
                                <div className="p-6 space-y-6">
                                    {/* Image Preview (16:9 cover) + Basic Info */}
                                    {viewDepartment.imageUrl ? (
                                        <div
                                            className="w-full rounded-xl border border-gray-200 shadow-sm"
                                            style={{
                                                backgroundImage: `url(${viewDepartment.imageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                aspectRatio: '16 / 9',
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-full rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center"
                                            style={{ aspectRatio: '16 / 9' }}
                                        >
                                            <Image className="w-12 h-12 text-gray-300" />
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department Name</label>
                                            <p className="text-lg font-bold text-gray-900 mt-0.5">{viewDepartment.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                                            <p className="text-sm text-gray-700 mt-0.5">{viewDepartment.description || <span className="text-gray-400 italic">No description provided</span>}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-green-600" />
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Default Consultation Fee</label>
                                                <p className="text-xl font-bold text-green-700">₹{viewDepartment.defaultConsultationFee || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-4 h-4 text-primary-600" />
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Services</h3>
                                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                                {viewDepartment.services?.length || 0} service(s)
                                            </span>
                                        </div>
                                        {viewDepartment.services && viewDepartment.services.length > 0 ? (
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="text-left text-xs font-semibold text-gray-600 px-4 py-2.5">#</th>
                                                            <th className="text-left text-xs font-semibold text-gray-600 px-4 py-2.5">Service Name</th>
                                                            <th className="text-right text-xs font-semibold text-gray-600 px-4 py-2.5">Fee (₹)</th>
                                                            <th className="text-left text-xs font-semibold text-gray-600 px-4 py-2.5">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {viewDepartment.services.map((service, index) => (
                                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-2.5 text-sm text-gray-500">{index + 1}</td>
                                                                <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{service.serviceName}</td>
                                                                <td className="px-4 py-2.5 text-sm font-semibold text-green-700 text-right">₹{service.fee}</td>
                                                                <td className="px-4 py-2.5 text-sm text-gray-600">{service.description || <span className="text-gray-400 italic">—</span>}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                <FileText className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                                                <p className="text-sm text-gray-400">No services added</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact Details */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Phone className="w-4 h-4 text-primary-600" />
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Contact Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Phone className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                                                    <p className="text-sm text-gray-900 mt-0.5">{viewDepartment.contact?.phone || <span className="text-gray-400 italic">Not provided</span>}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Mail className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                                                    <p className="text-sm text-gray-900 mt-0.5">{viewDepartment.contact?.email || <span className="text-gray-400 italic">Not provided</span>}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
                                                    <p className="text-sm text-gray-900 mt-0.5">{viewDepartment.contact?.location || <span className="text-gray-400 italic">Not provided</span>}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Working Hours */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className="w-4 h-4 text-primary-600" />
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Working Hours</h3>
                                        </div>
                                        {(() => {
                                            let parsedHours = null;
                                            if (viewDepartment.contact?.workingHours) {
                                                try { parsedHours = JSON.parse(viewDepartment.contact.workingHours); } catch (e) { /* not JSON */ }
                                            }
                                            if (parsedHours && typeof parsedHours === 'object') {
                                                return (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                        {Object.entries(parsedHours).map(([day, hours]) => (
                                                            <div key={day} className={`p-2.5 rounded-lg border text-center ${
                                                                hours.enabled
                                                                    ? 'bg-green-50 border-green-200'
                                                                    : 'bg-gray-50 border-gray-200'
                                                            }`}>
                                                                <p className="text-xs font-bold text-gray-700 capitalize mb-1">{day}</p>
                                                                {hours.enabled ? (
                                                                    <p className="text-xs text-green-700 font-medium">{hours.start} – {hours.end}</p>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 italic">Closed</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            } else if (viewDepartment.contact?.workingHours) {
                                                return <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{viewDepartment.contact.workingHours}</p>;
                                            } else {
                                                return (
                                                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                        <Clock className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                                                        <p className="text-sm text-gray-400">No working hours set</p>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>

                                    {/* Assigned Doctors */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Stethoscope className="w-4 h-4 text-primary-600" />
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Assigned Doctors</h3>
                                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                                {viewDepartment.doctors?.length || 0} doctor(s)
                                            </span>
                                        </div>
                                        {viewDepartment.doctors && viewDepartment.doctors.length > 0 ? (
                                            <div className="space-y-2">
                                                {viewDepartment.doctors.map((doctor) => (
                                                    <div key={doctor._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                                        {doctor.profilePhotoUrl ? (
                                                            <img
                                                                src={doctor.profilePhotoUrl}
                                                                alt={doctor.user?.name}
                                                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                                                                {doctor.user?.name?.charAt(0) || '?'}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                                    Dr. {doctor.user?.name || 'Unknown'}
                                                                </p>
                                                                {doctor.department?.toString() === viewDepartment._id && (
                                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded text-[10px] font-medium bg-amber-100 text-amber-700 shrink-0">
                                                                        <Crown className="w-2.5 h-2.5" /> Primary
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 truncate">{doctor.user?.email}</p>
                                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                                                {doctor.qualifications && <span>{doctor.qualifications}</span>}
                                                                {doctor.experience && <span>{doctor.experience}y exp</span>}
                                                                {doctor.fees > 0 && <span className="font-semibold text-green-700">₹{doctor.fees}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                <UsersIcon className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                                                <p className="text-sm text-gray-400">No doctors assigned</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewDepartment(null);
                                    if (viewDepartment) handleEdit(viewDepartment);
                                }}
                                className="btn-secondary"
                            >
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Department
                            </button>
                            <button
                                onClick={() => { setShowViewModal(false); setViewDepartment(null); }}
                                className="btn-primary"
                            >
                                Close
                            </button>
                        </div>
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

            {/* ─── Crop Modal ─── */}
            {cropModal.open && cropModal.imageSrc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                    <div className="bg-white w-[520px] max-w-[95vw] shadow-xl border border-gray-200 rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Crop className="w-4 h-4 text-gray-600" />
                                <h3 className="text-sm font-semibold text-gray-900">Crop Department Image</h3>
                            </div>
                            <button onClick={handleCropCancel} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Instruction */}
                        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                            <p className="text-[11px] text-blue-700">
                                Drag to reposition. Scroll to zoom. Use a wide image (16:9 ratio, 2560 × 1440px) for best results.
                            </p>
                        </div>

                        {/* Crop Area */}
                        <div className="relative w-full" style={{ height: 280 }}>
                            <Cropper
                                image={cropModal.imageSrc}
                                crop={crop}
                                zoom={cropZoom}
                                rotation={cropRotation}
                                aspect={16 / 9}
                                onCropChange={setCrop}
                                onZoomChange={setCropZoom}
                                onCropComplete={onCropComplete}
                                objectFit="contain"
                                style={{
                                    containerStyle: { background: '#f3f4f6' },
                                    cropAreaStyle: { border: '2px solid #4f46e5', color: 'rgba(0,0,0,0.4)' },
                                }}
                            />
                        </div>

                        {/* Controls */}
                        <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                            <div className="flex items-center gap-2">
                                <ZoomOut className="w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="range" min={1} max={3} step={0.05} value={cropZoom}
                                    onChange={e => setCropZoom(Number(e.target.value))}
                                    className="flex-1 h-1 accent-primary-600 cursor-pointer"
                                />
                                <ZoomIn className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-[10px] text-gray-400 w-8 text-right">{Math.round(cropZoom * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <RotateCw className="w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="range" min={0} max={360} step={1} value={cropRotation}
                                    onChange={e => setCropRotation(Number(e.target.value))}
                                    className="flex-1 h-1 accent-primary-600 cursor-pointer"
                                />
                                <span className="text-[10px] text-gray-400 w-8 text-right">{cropRotation}°</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={handleCropCancel}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCropConfirm}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors"
                            >
                                <Crop className="w-3 h-3" />
                                Crop & Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
