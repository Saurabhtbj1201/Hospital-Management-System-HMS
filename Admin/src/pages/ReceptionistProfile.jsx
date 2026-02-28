import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import {
    User, Mail, Phone, Shield, Save, Lock, Eye, EyeOff, Loader2,
    CheckCircle2, AlertCircle, Calendar, Camera, Trash2, Clock,
    Plus, X, Upload, Crop, ZoomIn, ZoomOut, RotateCw, Activity,
    CreditCard, Briefcase, FileText, Image as ImageIcon,
    FileSignature, GraduationCap
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

const ID_PROOF_TYPES = ['Aadhar', 'Voter ID', 'PAN', 'Passport'];
const SHIFT_OPTIONS = ['Morning', 'Afternoon', 'Night', 'Rotational'];
const EDUCATION_LEVELS = ['Below Matriculation', 'Matriculation', 'Intermediate', 'Graduate', 'Post Graduate', 'Diploma', 'Other'];

const ReceptionistProfile = () => {
    const { user, updateUser, setProfilePhoto } = useAuth();
    const [activeSection, setActiveSection] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const photoInputRef = useRef(null);
    const signatureInputRef = useRef(null);
    const idDocInputRef = useRef(null);

    // Edit states
    const [editForm, setEditForm] = useState({
        email: '', phone: '', gender: '', dateOfBirth: '',
        shift: '', idProofType: '', idProofNumber: '',
        experience: 0, educationLevel: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingSignature, setUploadingSignature] = useState(false);
    const [uploadingIdDoc, setUploadingIdDoc] = useState(false);

    // Crop state
    const [cropModal, setCropModal] = useState({ open: false, type: 'photo', imageSrc: null });
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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
            const rp = data.receptionistProfile;
            setEditForm({
                email: data.email || '',
                phone: data.phone || '',
                gender: rp?.gender || '',
                dateOfBirth: rp?.dateOfBirth ? rp.dateOfBirth.split('T')[0] : '',
                shift: rp?.shift || '',
                idProofType: rp?.idProofType || '',
                idProofNumber: rp?.idProofNumber || '',
                experience: rp?.experience || 0,
                educationLevel: rp?.educationLevel || ''
            });
        } catch {
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

    // Crop-based photo/signature upload
    const handleFileSelect = (e, type = 'photo') => {
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
        const isSignature = cropModal.type === 'signature';
        try {
            const croppedBlob = await getCroppedImg(cropModal.imageSrc, croppedAreaPixels, rotation);
            const formData = new FormData();
            if (isSignature) {
                formData.append('signature', croppedBlob, 'signature.jpg');
                setUploadingSignature(true);
            } else {
                formData.append('photo', croppedBlob, 'cropped.jpg');
                setUploadingPhoto(true);
            }
            setCropModal({ open: false, type: 'photo', imageSrc: null });

            if (isSignature) {
                const data = await profileAPI.uploadSignature(formData);
                setProfile(prev => ({
                    ...prev,
                    receptionistProfile: { ...prev.receptionistProfile, digitalSignature: data.url }
                }));
                toast.success('Signature uploaded');
            } else {
                const data = await profileAPI.uploadPhoto(formData);
                setProfile(prev => ({
                    ...prev,
                    receptionistProfile: { ...prev.receptionistProfile, profilePhoto: data.url }
                }));
                setProfilePhoto(data.url);
                toast.success('Photo uploaded');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploadingPhoto(false);
            setUploadingSignature(false);
        }
    };

    const closeCropModal = () => setCropModal({ open: false, type: 'photo', imageSrc: null });

    const handleDeletePhoto = async () => {
        try {
            await profileAPI.deletePhoto();
            setProfile(prev => ({
                ...prev,
                receptionistProfile: { ...prev.receptionistProfile, profilePhoto: '' }
            }));
            setProfilePhoto('');
            toast.success('Photo removed');
        } catch {
            toast.error('Failed to remove photo');
        }
    };

    const handleDeleteSignature = async () => {
        try {
            await profileAPI.deleteSignature();
            setProfile(prev => ({
                ...prev,
                receptionistProfile: { ...prev.receptionistProfile, digitalSignature: '' }
            }));
            toast.success('Signature removed');
        } catch {
            toast.error('Failed to remove signature');
        }
    };

    // ID document upload (direct, no crop — supports PDF)
    const handleIdDocUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('idDocument', file);
        try {
            setUploadingIdDoc(true);
            const data = await profileAPI.uploadIdDocument(formData);
            setProfile(prev => ({
                ...prev,
                receptionistProfile: { ...prev.receptionistProfile, idProofDocument: data.url }
            }));
            toast.success('ID document uploaded');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploadingIdDoc(false);
            e.target.value = '';
        }
    };

    const handleDeleteIdDoc = async () => {
        try {
            await profileAPI.deleteIdDocument();
            setProfile(prev => ({
                ...prev,
                receptionistProfile: { ...prev.receptionistProfile, idProofDocument: '' }
            }));
            toast.success('ID document removed');
        } catch {
            toast.error('Failed to remove ID document');
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

    const getInitials = () => {
        if (!profile?.name) return 'R';
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

    if (loading) {
        return (
            <div className="p-4 lg:p-6">
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
                                    <div className="mgmt-skeleton" style={{ width: '60px', height: '20px', borderRadius: '4px' }} />
                                    <div className="mgmt-skeleton" style={{ width: '50px', height: '20px', borderRadius: '4px' }} />
                                </div>
                                <div className="mgmt-skeleton" style={{ width: '80px', height: '10px', borderRadius: '4px', marginTop: '8px' }} />
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
    const rp = profile?.receptionistProfile;

    const sections = [
        { id: 'personal', label: 'Personal Information', icon: User },
        { id: 'employment', label: 'Employment Details', icon: Briefcase },
        { id: 'identity', label: 'ID Proof', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'activity', label: 'Activity', icon: Activity },
    ];

    return (
        <div className="p-4 lg:p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your personal information, employment details, and account settings</p>
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
                                {rp?.profilePhoto ? (
                                    <img src={rp.profilePhoto} alt={profile?.name} className="w-20 h-20 object-cover border-2 border-gray-200" />
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
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                    {profile?.role}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border ${profile?.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {profile?.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {rp?.shift && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {rp.shift} Shift
                                </p>
                            )}
                            {rp?.profilePhoto && (
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
                                    </div>

                                    {/* Digital Signature */}
                                    <div className="mt-5 pt-4 border-t border-gray-100">
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Digital Signature
                                            <span className="text-gray-400 font-normal ml-1">(JPEG, PNG, WebP — max 2MB, wide format recommended)</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            {rp?.digitalSignature ? (
                                                <div className="relative group">
                                                    <img src={rp.digitalSignature} alt="Signature" className="h-16 border border-gray-200 bg-white p-1" />
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
                                                    <div className="text-center">
                                                        <FileSignature className="w-5 h-5 mx-auto mb-1 text-gray-300" />
                                                        No signature
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => signatureInputRef.current?.click()}
                                                disabled={uploadingSignature}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                            >
                                                {uploadingSignature ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                Upload Signature
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

                    {/* EMPLOYMENT DETAILS */}
                    {activeSection === 'employment' && (
                        <div className="space-y-4">
                            <SectionCard title="Employment Details" description="Your shift schedule, experience, and qualifications">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Shift</label>
                                            <select
                                                value={editForm.shift}
                                                onChange={e => setEditForm(f => ({ ...f, shift: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                            >
                                                <option value="">Select Shift</option>
                                                {SHIFT_OPTIONS.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <FormField label="Experience (Years)" icon={Briefcase} type="number" min="0" value={editForm.experience} onChange={v => setEditForm(f => ({ ...f, experience: Number(v) }))} />
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Education Level</label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                <select
                                                    value={editForm.educationLevel}
                                                    onChange={e => setEditForm(f => ({ ...f, educationLevel: e.target.value }))}
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                                >
                                                    <option value="">Select Education Level</option>
                                                    {EDUCATION_LEVELS.map(l => (
                                                        <option key={l} value={l}>{l}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <ReadOnlyField
                                            label="Employment Status"
                                            value={profile?.isActive ? 'Active' : 'Inactive'}
                                            icon={Briefcase}
                                            valueClass={profile?.isActive ? 'text-green-600' : 'text-red-600'}
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

                    {/* ID PROOF */}
                    {activeSection === 'identity' && (
                        <div className="space-y-4">
                            <SectionCard title="ID Proof" description="Government-issued identity document for verification">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">ID Type</label>
                                            <select
                                                value={editForm.idProofType}
                                                onChange={e => setEditForm(f => ({ ...f, idProofType: e.target.value, idProofNumber: e.target.value ? f.idProofNumber : '' }))}
                                                className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                            >
                                                <option value="">Select ID Type</option>
                                                {ID_PROOF_TYPES.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {editForm.idProofType && (
                                            <FormField
                                                label={`${editForm.idProofType} Number`}
                                                icon={CreditCard}
                                                type="text"
                                                value={editForm.idProofNumber}
                                                onChange={v => setEditForm(f => ({ ...f, idProofNumber: v }))}
                                                placeholder={
                                                    editForm.idProofType === 'Aadhar' ? 'XXXX XXXX XXXX' :
                                                    editForm.idProofType === 'PAN' ? 'ABCDE1234F' :
                                                    editForm.idProofType === 'Voter ID' ? 'ABC1234567' :
                                                    'Passport Number'
                                                }
                                            />
                                        )}
                                    </div>

                                    {/* ID Document Upload */}
                                    {editForm.idProofType && (
                                        <div className="mt-5 pt-4 border-t border-gray-100">
                                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                                Upload {editForm.idProofType} Document
                                                <span className="text-gray-400 font-normal ml-1">(JPEG, PNG, WebP or PDF — max 5MB)</span>
                                            </label>
                                            <div className="flex items-center gap-4">
                                                {rp?.idProofDocument ? (
                                                    <div className="relative group">
                                                        {rp.idProofDocument.includes('.pdf') || rp.idProofDocumentKey?.endsWith('.pdf') ? (
                                                            <div className="h-20 w-36 border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 p-2">
                                                                <FileText className="w-6 h-6 text-red-500" />
                                                                <span className="text-[10px] text-gray-500">PDF Document</span>
                                                                <a href={rp.idProofDocument} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary-600 hover:underline">View</a>
                                                            </div>
                                                        ) : (
                                                            <a href={rp.idProofDocument} target="_blank" rel="noopener noreferrer">
                                                                <img src={rp.idProofDocument} alt="ID Document" className="h-20 border border-gray-200 bg-white p-1" />
                                                            </a>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={handleDeleteIdDoc}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-20 w-36 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                                                        <div className="text-center">
                                                            <ImageIcon className="w-5 h-5 mx-auto mb-1 text-gray-300" />
                                                            No document
                                                        </div>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => idDocInputRef.current?.click()}
                                                    disabled={uploadingIdDoc}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    {uploadingIdDoc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                    Upload
                                                </button>
                                                <input ref={idDocInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleIdDocUpload} />
                                            </div>
                                        </div>
                                    )}

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
                                    {rp?.joiningDate && (
                                        <ReadOnlyField
                                            label="Joining Date"
                                            value={new Date(rp.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            icon={Calendar}
                                        />
                                    )}
                                    {rp?.shift && (
                                        <ReadOnlyField
                                            label="Current Shift"
                                            value={rp.shift}
                                            icon={Clock}
                                        />
                                    )}
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
                uploading={cropModal.type === 'signature' ? uploadingSignature : uploadingPhoto}
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

const CropModal = ({ open, type = 'photo', imageSrc, crop, zoom, rotation, onCropChange, onZoomChange, onRotationChange, onCropComplete, onConfirm, onClose, uploading }) => {
    if (!open) return null;
    const isSignature = type === 'signature';
    const aspect = isSignature ? 3 : 1;
    const cropSize = isSignature ? { width: 240, height: 80 } : { width: 160, height: 160 };
    const title = isSignature ? 'Crop Signature' : 'Crop Profile Photo';
    const instruction = isSignature
        ? 'Drag to reposition. Scroll to zoom. Use a wide image (3:1 ratio) for best results.'
        : 'Drag to reposition. Scroll to zoom. Use a square photo for best results (displayed at 80×80px).';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-[360px] max-w-[95vw] shadow-xl border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Crop className="w-4 h-4 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Instruction */}
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                    <p className="text-[11px] text-blue-700">
                        {instruction}
                    </p>
                </div>

                {/* Crop Area */}
                <div className="relative w-full" style={{ height: 220 }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropComplete}
                        cropSize={cropSize}
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
                            type="range" min={1} max={3} step={0.05} value={zoom}
                            onChange={e => onZoomChange(Number(e.target.value))}
                            className="flex-1 h-1 accent-primary-600 cursor-pointer"
                        />
                        <ZoomIn className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-400 w-8 text-right">{Math.round(zoom * 100)}%</span>
                    </div>
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

export default ReceptionistProfile;
