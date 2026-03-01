import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { toast } from 'sonner';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Cropper from 'react-easy-crop';
import {
    User, Mail, Phone, Shield, Building2, GraduationCap, Clock,
    IndianRupee, Briefcase, Save, Lock, Eye, EyeOff, Loader2,
    CheckCircle2, AlertCircle, Pencil, Calendar, Camera, Trash2,
    FileSignature, Hash, Heart, Star, Award, Activity, Globe,
    Plus, X, Upload, Crop, ZoomIn, ZoomOut, RotateCw
} from 'lucide-react';

// Helper: create an image element from a file/url
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (e) => reject(e));
        img.crossOrigin = 'anonymous';
        img.src = url;
    });

// Helper: get cropped canvas and return as Blob
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

const DoctorProfile = () => {
    const { user, updateUser, setProfilePhoto } = useAuth();
    const [activeSection, setActiveSection] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const photoInputRef = useRef(null);
    const signatureInputRef = useRef(null);

    // Edit states
    const [editForm, setEditForm] = useState({
        email: '', phone: '', qualifications: '', experience: 0, fees: 0,
        gender: '', dateOfBirth: '', medicalCouncilId: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingSignature, setUploadingSignature] = useState(false);

    // Crop state
    const [cropModal, setCropModal] = useState({ open: false, type: null, imageSrc: null });
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Public website state
    const [websiteForm, setWebsiteForm] = useState({
        shortBio: '', detailedBiography: '', specialInterests: [], featuredTreatments: [],
        patientTestimonials: []
    });
    const [websiteLoading, setWebsiteLoading] = useState(false);
    const [newInterest, setNewInterest] = useState('');
    const [newTreatment, setNewTreatment] = useState('');

    // Password state
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileAPI.getMyProfile();
            setProfile(data);
            setEditForm({
                email: data.email || '', phone: data.phone || '',
                qualifications: data.doctorProfile?.qualifications || '',
                experience: data.doctorProfile?.experience || 0,
                fees: data.doctorProfile?.fees || 0,
                gender: data.doctorProfile?.gender || '',
                dateOfBirth: data.doctorProfile?.dateOfBirth ? data.doctorProfile.dateOfBirth.split('T')[0] : '',
                medicalCouncilId: data.doctorProfile?.medicalCouncilId || ''
            });
            setWebsiteForm({
                shortBio: data.doctorProfile?.shortBio || '',
                detailedBiography: data.doctorProfile?.detailedBiography || '',
                specialInterests: data.doctorProfile?.specialInterests || [],
                featuredTreatments: data.doctorProfile?.featuredTreatments || [],
                patientTestimonials: data.doctorProfile?.patientTestimonials || []
            });
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setEditLoading(true);
            const data = await profileAPI.updateMyProfile(editForm);
            setProfile(data);
            updateUser({ email: data.email, phone: data.phone });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setEditLoading(false);
        }
    };

    // Open crop modal when a file is selected
    const handleFileSelect = (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setCropModal({ open: true, type, imageSrc: reader.result });
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
            setCroppedAreaPixels(null);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleCropConfirm = async () => {
        if (!croppedAreaPixels || !cropModal.imageSrc) return;
        try {
            const croppedBlob = await getCroppedImg(cropModal.imageSrc, croppedAreaPixels, rotation);
            const formData = new FormData();
            const isPhoto = cropModal.type === 'photo';
            formData.append(isPhoto ? 'photo' : 'signature', croppedBlob, `cropped.jpg`);

            if (isPhoto) {
                setUploadingPhoto(true);
            } else {
                setUploadingSignature(true);
            }
            setCropModal({ open: false, type: null, imageSrc: null });

            const data = isPhoto
                ? await profileAPI.uploadPhoto(formData)
                : await profileAPI.uploadSignature(formData);

            setProfile(prev => ({
                ...prev,
                doctorProfile: {
                    ...prev.doctorProfile,
                    [isPhoto ? 'profilePhoto' : 'digitalSignature']: data.url
                }
            }));
            if (isPhoto) setProfilePhoto(data.url);
            toast.success(isPhoto ? 'Photo uploaded' : 'Signature uploaded');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploadingPhoto(false);
            setUploadingSignature(false);
        }
    };

    const closeCropModal = () => {
        setCropModal({ open: false, type: null, imageSrc: null });
    };

    const handleDeletePhoto = async () => {
        try {
            await profileAPI.deletePhoto();
            setProfile(prev => ({
                ...prev,
                doctorProfile: { ...prev.doctorProfile, profilePhoto: '' }
            }));
            setProfilePhoto('');
            toast.success('Photo removed');
        } catch (error) {
            toast.error('Failed to remove photo');
        }
    };

    const handleDeleteSignature = async () => {
        try {
            await profileAPI.deleteSignature();
            setProfile(prev => ({
                ...prev,
                doctorProfile: { ...prev.doctorProfile, digitalSignature: '' }
            }));
            toast.success('Signature removed');
        } catch (error) {
            toast.error('Failed to remove signature');
        }
    };

    const handleUpdateWebsite = async (e) => {
        e.preventDefault();
        try {
            setWebsiteLoading(true);
            const data = await profileAPI.updatePublicWebsite(websiteForm);
            setProfile(data);
            toast.success('Public website content updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setWebsiteLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        try {
            setPasswordLoading(true);
            await profileAPI.changePassword(passwordForm);
            toast.success('Password changed successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswords({ current: false, new: false, confirm: false });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const addTag = (type) => {
        const value = type === 'interest' ? newInterest.trim() : newTreatment.trim();
        if (!value) return;
        const key = type === 'interest' ? 'specialInterests' : 'featuredTreatments';
        if (!websiteForm[key].includes(value)) {
            setWebsiteForm(prev => ({ ...prev, [key]: [...prev[key], value] }));
        }
        type === 'interest' ? setNewInterest('') : setNewTreatment('');
    };

    const removeTag = (type, index) => {
        const key = type === 'interest' ? 'specialInterests' : 'featuredTreatments';
        setWebsiteForm(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
    };

    const addTestimonial = () => {
        setWebsiteForm(prev => ({
            ...prev,
            patientTestimonials: [...prev.patientTestimonials, { patientName: '', testimonial: '', rating: 5 }]
        }));
    };

    const updateTestimonial = (index, field, value) => {
        setWebsiteForm(prev => ({
            ...prev,
            patientTestimonials: prev.patientTestimonials.map((t, i) => i === index ? { ...t, [field]: value } : t)
        }));
    };

    const removeTestimonial = (index) => {
        setWebsiteForm(prev => ({
            ...prev,
            patientTestimonials: prev.patientTestimonials.filter((_, i) => i !== index)
        }));
    };

    const getInitials = () => {
        if (!profile?.name) return 'DR';
        const names = profile.name.split(' ');
        return names.length >= 2 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : profile.name.substring(0, 2).toUpperCase();
    };

    const getPasswordStrength = (password) => {
        if (!password) return { label: '', color: '', width: '0%' };
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
        if (score === 2) return { label: 'Fair', color: 'bg-orange-500', width: '40%' };
        if (score === 3) return { label: 'Good', color: 'bg-yellow-500', width: '60%' };
        if (score === 4) return { label: 'Strong', color: 'bg-green-500', width: '80%' };
        return { label: 'Very Strong', color: 'bg-emerald-600', width: '100%' };
    };

    const quillModules = {
        toolbar: [
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean']
        ]
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-4">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <div className="mgmt-skeleton" style={{ width: '140px', height: '20px', borderRadius: '4px', marginBottom: '6px' }} />
                        <div className="mgmt-skeleton" style={{ width: '340px', height: '12px', borderRadius: '4px' }} />
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-5">
                    {/* Left sidebar skeleton */}
                    <div className="lg:w-72 flex-shrink-0 space-y-4">
                        <div className="bg-white border border-gray-200 p-5">
                            <div className="flex flex-col items-center">
                                <div className="mgmt-skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '12px' }} />
                                <div className="mgmt-skeleton" style={{ width: '120px', height: '14px', borderRadius: '4px', marginBottom: '6px' }} />
                                <div className="mgmt-skeleton" style={{ width: '160px', height: '10px', borderRadius: '4px', marginBottom: '8px' }} />
                                <div className="flex gap-2">
                                    <div className="mgmt-skeleton" style={{ width: '50px', height: '20px', borderRadius: '4px' }} />
                                    <div className="mgmt-skeleton" style={{ width: '50px', height: '20px', borderRadius: '4px' }} />
                                </div>
                                <div className="mgmt-skeleton" style={{ width: '100px', height: '10px', borderRadius: '4px', marginTop: '8px' }} />
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <div className="mgmt-skeleton" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
                                    <div className="mgmt-skeleton" style={{ width: '130px', height: '12px', borderRadius: '4px' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Right content skeleton */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white border border-gray-200 p-5" style={{ borderRadius: '0' }}>
                            <div className="mgmt-skeleton" style={{ width: '180px', height: '16px', borderRadius: '4px', marginBottom: '6px' }} />
                            <div className="mgmt-skeleton" style={{ width: '260px', height: '11px', borderRadius: '4px', marginBottom: '20px' }} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i}>
                                        <div className="mgmt-skeleton" style={{ width: '90px', height: '10px', borderRadius: '4px', marginBottom: '8px' }} />
                                        <div className="mgmt-skeleton" style={{ width: '100%', height: '38px', borderRadius: '4px' }} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                                <div className="mgmt-skeleton" style={{ width: '110px', height: '10px', borderRadius: '4px', marginBottom: '10px' }} />
                                <div className="mgmt-skeleton" style={{ width: '100%', height: '60px', borderRadius: '4px' }} />
                            </div>
                            <div className="flex justify-end mt-4">
                                <div className="mgmt-skeleton" style={{ width: '120px', height: '36px', borderRadius: '6px' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const strength = getPasswordStrength(passwordForm.newPassword);
    const dp = profile?.doctorProfile;

    const sections = [
        { id: 'personal', label: 'Personal Information', icon: User },
        { id: 'professional', label: 'Professional Details', icon: Briefcase },
        { id: 'website', label: 'Public Website', icon: Globe },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'activity', label: 'Activity', icon: Activity },
    ];

    return (
        <div className="p-4 lg:p-4">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your personal information, credentials, and public profile</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5">
                {/* Left: Profile Card + Nav */}
                <div className="lg:w-72 flex-shrink-0 space-y-4">
                    {/* Profile Card */}
                    <div className="bg-white border border-gray-200 p-5">
                        <div className="flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="relative group mb-3">
                                {dp?.profilePhoto ? (
                                    <img src={dp.profilePhoto} alt={profile?.name} className="w-20 h-20 object-cover border-2 border-gray-200" />
                                ) : (
                                    <div className="w-20 h-20 bg-primary-600 flex items-center justify-center border-2 border-gray-200">
                                        <span className="text-xl font-bold text-white">{getInitials()}</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => photoInputRef.current?.click()}
                                    disabled={uploadingPhoto}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    {uploadingPhoto ? (
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-5 h-5 text-white" />
                                    )}
                                </button>
                                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleFileSelect(e, 'photo')} />
                            </div>
                            <h2 className="text-base font-semibold text-gray-900">{profile?.name}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    {profile?.role}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border ${profile?.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {profile?.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {dp?.primaryDepartment && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" /> {dp.primaryDepartment.name}
                                </p>
                            )}
                            {dp?.profilePhoto && (
                                <button onClick={handleDeletePhoto} className="text-xs text-red-500 hover:text-red-700 mt-2 flex items-center gap-1 mx-auto">
                                    <Trash2 className="w-3 h-3" /> Remove photo
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Section Nav */}
                    <div className="bg-white border border-gray-200">
                        <nav className="flex flex-col">
                            {sections.map(s => {
                                const Icon = s.icon;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSection(s.id)}
                                        className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left border-l-2 transition-colors ${
                                            activeSection === s.id
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {s.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                    {/* PERSONAL INFORMATION */}
                    {activeSection === 'personal' && (
                        <div className="space-y-4">
                            <SectionCard title="Personal Information" description="Your basic account and contact details">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <ReadOnlyField label="Full Name" value={profile?.name} icon={User} />
                                        <ReadOnlyField label="Role" value={profile?.role} icon={Shield} />
                                        <FormField label="Email Address" icon={Mail} type="email" required value={editForm.email} onChange={v => setEditForm(f => ({ ...f, email: v }))} />
                                        <FormField label="Phone Number" icon={Phone} type="tel" value={editForm.phone} onChange={v => setEditForm(f => ({ ...f, phone: v }))} />
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                                            <select
                                                value={editForm.gender}
                                                onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                            >
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <FormField label="Date of Birth" icon={Calendar} type="date" value={editForm.dateOfBirth} onChange={v => setEditForm(f => ({ ...f, dateOfBirth: v }))} />
                                        <FormField label="Medical Council ID" icon={Hash} type="text" value={editForm.medicalCouncilId} onChange={v => setEditForm(f => ({ ...f, medicalCouncilId: v }))} placeholder="e.g., MCI-12345" />
                                    </div>

                                    {/* Digital Signature */}
                                    <div className="mt-5 pt-4 border-t border-gray-100">
                                        <label className="block text-xs font-medium text-gray-600 mb-2">Digital Signature (for prescriptions)</label>
                                        <div className="flex items-center gap-4">
                                            {dp?.digitalSignature ? (
                                                <div className="relative group">
                                                    <img src={dp.digitalSignature} alt="Signature" className="h-16 border border-gray-200 bg-white p-1" />
                                                    <button
                                                        type="button"
                                                        onClick={handleDeleteSignature}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="h-16 w-40 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                                                    No signature
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => signatureInputRef.current?.click()}
                                                disabled={uploadingSignature}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                            >
                                                {uploadingSignature ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                Upload
                                            </button>
                                            <input ref={signatureInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleFileSelect(e, 'signature')} />
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
                                        <button type="submit" disabled={editLoading} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors">
                                            {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </SectionCard>
                        </div>
                    )}

                    {/* PROFESSIONAL DETAILS */}
                    {activeSection === 'professional' && (
                        <div className="space-y-4">
                            <SectionCard title="Professional Details" description="Your qualifications, department, and practice information">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <ReadOnlyField label="Primary Department" value={dp?.primaryDepartment?.name || 'Not assigned'} icon={Building2} />
                                        <ReadOnlyField
                                            label="All Departments"
                                            value={dp?.departments?.length > 0 ? dp.departments.map(d => d.name).join(', ') : 'None'}
                                            icon={Building2}
                                        />
                                        <div className="sm:col-span-2">
                                            <FormField label="Qualifications" icon={GraduationCap} type="text" value={editForm.qualifications} onChange={v => setEditForm(f => ({ ...f, qualifications: v }))} placeholder="e.g., MBBS, MD (Cardiology)" />
                                        </div>
                                        <FormField label="Experience (years)" icon={Briefcase} type="number" min={0} value={editForm.experience} onChange={v => setEditForm(f => ({ ...f, experience: parseInt(v) || 0 }))} />
                                        <FormField label="Consultation Fee (₹)" icon={IndianRupee} type="number" min={0} value={editForm.fees} onChange={v => setEditForm(f => ({ ...f, fees: parseInt(v) || 0 }))} />
                                        <ReadOnlyField
                                            label="Available Slots"
                                            value={dp?.availableSlots?.length > 0 ? `${dp.availableSlots.length} configured` : 'None configured'}
                                            icon={Clock}
                                        />
                                    </div>
                                    <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
                                        <button type="submit" disabled={editLoading} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors">
                                            {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </SectionCard>
                        </div>
                    )}

                    {/* PUBLIC WEBSITE */}
                    {activeSection === 'website' && (
                        <div className="space-y-4">
                            <SectionCard title="Public Website Content" description="This information will be displayed on the hospital's public website">
                                <form onSubmit={handleUpdateWebsite}>
                                    {/* Short Bio */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Short Bio <span className="text-gray-400">(150–200 words)</span></label>
                                        <textarea
                                            rows={3}
                                            maxLength={1000}
                                            value={websiteForm.shortBio}
                                            onChange={e => setWebsiteForm(f => ({ ...f, shortBio: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                                            placeholder="Brief professional summary..."
                                        />
                                        <p className="text-[10px] text-gray-400 mt-0.5 text-right">{websiteForm.shortBio.length}/1000</p>
                                    </div>

                                    {/* Detailed Biography */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Detailed Biography</label>
                                        <div className="border border-gray-300 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[140px] [&_.ql-editor]:text-sm">
                                            <ReactQuill
                                                theme="snow"
                                                value={websiteForm.detailedBiography}
                                                onChange={v => setWebsiteForm(f => ({ ...f, detailedBiography: v }))}
                                                modules={quillModules}
                                                placeholder="Write a detailed biography..."
                                            />
                                        </div>
                                    </div>

                                    {/* Special Interests */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Special Interests</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newInterest}
                                                onChange={e => setNewInterest(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('interest'))}
                                                className="flex-1 px-3 py-1.5 border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="e.g., Interventional Cardiology"
                                            />
                                            <button type="button" onClick={() => addTag('interest')} className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {websiteForm.specialInterests.map((item, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 text-xs text-blue-700">
                                                    <Heart className="w-3 h-3" /> {item}
                                                    <button type="button" onClick={() => removeTag('interest', i)} className="text-blue-400 hover:text-blue-700 ml-0.5"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Featured Treatments */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Featured Treatments</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newTreatment}
                                                onChange={e => setNewTreatment(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('treatment'))}
                                                className="flex-1 px-3 py-1.5 border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="e.g., Angioplasty"
                                            />
                                            <button type="button" onClick={() => addTag('treatment')} className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {websiteForm.featuredTreatments.map((item, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                                                    <Award className="w-3 h-3" /> {item}
                                                    <button type="button" onClick={() => removeTag('treatment', i)} className="text-emerald-400 hover:text-emerald-700 ml-0.5"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Patient Testimonials */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-medium text-gray-600">Patient Testimonials <span className="text-gray-400">(optional)</span></label>
                                            <button type="button" onClick={addTestimonial} className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
                                                <Plus className="w-3 h-3" /> Add
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {websiteForm.patientTestimonials.map((t, i) => (
                                                <div key={i} className="p-3 border border-gray-200 bg-gray-50 relative">
                                                    <button type="button" onClick={() => removeTestimonial(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        <input
                                                            type="text" placeholder="Patient Name"
                                                            value={t.patientName}
                                                            onChange={e => updateTestimonial(i, 'patientName', e.target.value)}
                                                            className="px-2.5 py-1.5 border border-gray-300 text-sm focus:ring-1 focus:ring-primary-500"
                                                        />
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <button key={star} type="button" onClick={() => updateTestimonial(i, 'rating', star)}>
                                                                    <Star className={`w-4 h-4 ${star <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        rows={2} placeholder="Testimonial text..."
                                                        value={t.testimonial}
                                                        onChange={e => updateTestimonial(i, 'testimonial', e.target.value)}
                                                        className="w-full mt-2 px-2.5 py-1.5 border border-gray-300 text-sm resize-none focus:ring-1 focus:ring-primary-500"
                                                    />
                                                </div>
                                            ))}
                                            {websiteForm.patientTestimonials.length === 0 && (
                                                <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200">No testimonials added yet</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <button type="submit" disabled={websiteLoading} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors">
                                            {websiteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Website Content
                                        </button>
                                    </div>
                                </form>
                            </SectionCard>
                        </div>
                    )}

                    {/* SECURITY */}
                    {activeSection === 'security' && (
                        <div className="space-y-4">
                            <SectionCard title="Change Password" description="Ensure your account uses a strong, unique password">
                                <form onSubmit={handleChangePassword} className="max-w-md">
                                    <div className="space-y-4">
                                        <PasswordField
                                            label="Current Password" value={passwordForm.currentPassword}
                                            show={showPasswords.current}
                                            onToggle={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                                            onChange={v => setPasswordForm(f => ({ ...f, currentPassword: v }))}
                                            placeholder="Enter current password"
                                        />
                                        <div>
                                            <PasswordField
                                                label="New Password" value={passwordForm.newPassword}
                                                show={showPasswords.new}
                                                onToggle={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                                                onChange={v => setPasswordForm(f => ({ ...f, newPassword: v }))}
                                                placeholder="Enter new password"
                                            />
                                            {passwordForm.newPassword && (
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] text-gray-500">Strength</span>
                                                        <span className={`text-[10px] font-medium ${strength.label === 'Weak' ? 'text-red-600' : strength.label === 'Fair' ? 'text-orange-600' : strength.label === 'Good' ? 'text-yellow-600' : 'text-green-600'}`}>{strength.label}</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-gray-200 overflow-hidden">
                                                        <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }}></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 mt-1.5">
                                                        <PasswordRule met={passwordForm.newPassword.length >= 8} text="8+ characters" />
                                                        <PasswordRule met={/[A-Z]/.test(passwordForm.newPassword)} text="Uppercase" />
                                                        <PasswordRule met={/[0-9]/.test(passwordForm.newPassword)} text="Number" />
                                                        <PasswordRule met={/[^A-Za-z0-9]/.test(passwordForm.newPassword)} text="Special char" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <PasswordField
                                                label="Confirm New Password" value={passwordForm.confirmPassword}
                                                show={showPasswords.confirm}
                                                onToggle={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                                                onChange={v => setPasswordForm(f => ({ ...f, confirmPassword: v }))}
                                                placeholder="Confirm new password"
                                                match={passwordForm.confirmPassword ? passwordForm.confirmPassword === passwordForm.newPassword : null}
                                            />
                                            {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                                                <p className="mt-1 text-[10px] text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Passwords don't match</p>
                                            )}
                                            {passwordForm.confirmPassword && passwordForm.confirmPassword === passwordForm.newPassword && (
                                                <p className="mt-1 text-[10px] text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Match</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </SectionCard>
                        </div>
                    )}

                    {/* ACTIVITY */}
                    {activeSection === 'activity' && (
                        <div className="space-y-4">
                            <SectionCard title="Account Activity" description="Track your account activity and session information">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ReadOnlyField
                                        label="Last Login"
                                        value={profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                        icon={Clock}
                                    />
                                    <ReadOnlyField
                                        label="Account Created"
                                        value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                                        icon={Calendar}
                                    />
                                    <ReadOnlyField
                                        label="Last Updated"
                                        value={profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                        icon={Activity}
                                    />
                                    <ReadOnlyField
                                        label="Account Status"
                                        value={profile?.isActive ? 'Active' : 'Inactive'}
                                        icon={Shield}
                                        valueClass={profile?.isActive ? 'text-green-600' : 'text-red-600'}
                                    />
                                </div>
                            </SectionCard>
                        </div>
                    )}
                </div>
            </div>

            {/* Crop Modal */}
            <CropModal
                open={cropModal.open}
                type={cropModal.type}
                imageSrc={cropModal.imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onConfirm={handleCropConfirm}
                onClose={closeCropModal}
                uploading={uploadingPhoto || uploadingSignature}
            />
        </div>
    );
};

/* ─── Reusable Components ─── */

const SectionCard = ({ title, description, children }) => (
    <div className="bg-white border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const ReadOnlyField = ({ label, value, icon: Icon, valueClass = '' }) => (
    <div className="p-3 bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
            <Icon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        </div>
        <p className={`text-sm font-medium text-gray-900 pl-5.5 ${valueClass}`}>{value || '—'}</p>
    </div>
);

const FormField = ({ label, icon: Icon, type, value, onChange, placeholder, required, min }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />}
            <input
                type={type} required={required} min={min}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2 border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
            />
        </div>
    </div>
);

const PasswordField = ({ label, value, show, onToggle, onChange, placeholder, match }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
                type={show ? 'text' : 'password'} required
                value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full pl-8 pr-10 py-2 border text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    match === true ? 'border-green-300 bg-green-50/50' : match === false ? 'border-red-300 bg-red-50/50' : 'border-gray-300'
                }`}
            />
            <button type="button" onClick={onToggle} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
        </div>
    </div>
);

const PasswordRule = ({ met, text }) => (
    <span className={`flex items-center gap-1 text-[10px] ${met ? 'text-green-600' : 'text-gray-400'}`}>
        {met ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
        {text}
    </span>
);

/* ─── Crop Modal ─── */

const CropModal = ({ open, type, imageSrc, crop, zoom, rotation, onCropChange, onZoomChange, onRotationChange, onCropComplete, onConfirm, onClose, uploading }) => {
    if (!open) return null;
    const isPhoto = type === 'photo';
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-[360px] max-w-[95vw] shadow-xl border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Crop className="w-4 h-4 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                            Crop {isPhoto ? 'Profile Photo' : 'Signature'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Instruction */}
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                    <p className="text-[11px] text-blue-700">
                        {isPhoto
                            ? 'Drag to reposition. Scroll to zoom. Use a square photo for best results (displayed at 80×80px).'
                            : 'Crop your signature area. Use a transparent or white background for best quality.'
                        }
                    </p>
                </div>

                {/* Crop Area */}
                <div className="relative w-full" style={{ height: isPhoto ? 220 : 180 }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={isPhoto ? 1 : 3 / 1}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropComplete}
                        cropSize={isPhoto ? { width: 160, height: 160 } : { width: 240, height: 80 }}
                        objectFit="contain"
                        style={{
                            containerStyle: { background: '#f3f4f6' },
                            cropAreaStyle: { border: '2px solid #4f46e5', color: 'rgba(0,0,0,0.4)' },
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                    {/* Zoom */}
                    <div className="flex items-center gap-2">
                        <ZoomOut className="w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="range" min={1} max={3} step={0.05} value={zoom}
                            onChange={e => onZoomChange(Number(e.target.value))}
                            className="flex-1 h-1 accent-primary-600 cursor-pointer"
                        />
                        <ZoomIn className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-400 w-8 text-right">{Math.round(zoom * 100)}%</span>
                    </div>
                    {/* Rotate */}
                    <div className="flex items-center gap-2">
                        <RotateCw className="w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="range" min={0} max={360} step={1} value={rotation}
                            onChange={e => onRotationChange(Number(e.target.value))}
                            className="flex-1 h-1 accent-primary-600 cursor-pointer"
                        />
                        <span className="text-[10px] text-gray-400 w-8 text-right">{rotation}°</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={uploading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Crop & Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
