import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Building2, Save, Upload, Trash2, Phone, Mail, Globe, Hash,
    FileText, AlertCircle, CheckCircle, RefreshCw, Image, X, ZoomIn, ZoomOut, Crop
} from 'lucide-react';
import { toast } from 'sonner';
import { invoiceTemplateAPI } from '../services/api';
import Cropper from 'react-easy-crop';
import './InvoiceTemplate.css';

const InvoiceTemplate = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dirty, setDirty] = useState(false);
    const fileInputRef = useRef();

    // Crop states
    const [cropImage, setCropImage] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [form, setForm] = useState({
        hospitalName: '',
        hospitalAddress: '',
        contactNumber: '',
        emailAddress: '',
        gstNumber: '',
        cinNumber: '',
        websiteUrl: '',
        footerNote: 'This is a computer-generated invoice.',
        termsAndConditions: ''
    });

    const [logoUrl, setLogoUrl] = useState('');
    const [hasLogo, setHasLogo] = useState(false);

    useEffect(() => { fetchTemplate(); }, []);

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            const res = await invoiceTemplateAPI.get();
            const d = res.data;
            setForm({
                hospitalName: d.hospitalName || '',
                hospitalAddress: d.hospitalAddress || '',
                contactNumber: d.contactNumber || '',
                emailAddress: d.emailAddress || '',
                gstNumber: d.gstNumber || '',
                cinNumber: d.cinNumber || '',
                websiteUrl: d.websiteUrl || '',
                footerNote: d.footerNote || '',
                termsAndConditions: d.termsAndConditions || ''
            });
            setLogoUrl(d.hospitalLogoUrl || '');
            setHasLogo(!!d.hospitalLogo);
            setDirty(false);
        } catch {
            toast.error('Failed to load invoice template');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setDirty(true);
    };

    const handleSave = async () => {
        if (!form.hospitalName.trim()) {
            toast.error('Hospital name is required');
            return;
        }
        try {
            setSaving(true);
            const res = await invoiceTemplateAPI.update(form);
            const d = res.data;
            setForm({
                hospitalName: d.hospitalName || '',
                hospitalAddress: d.hospitalAddress || '',
                contactNumber: d.contactNumber || '',
                emailAddress: d.emailAddress || '',
                gstNumber: d.gstNumber || '',
                cinNumber: d.cinNumber || '',
                websiteUrl: d.websiteUrl || '',
                footerNote: d.footerNote || '',
                termsAndConditions: d.termsAndConditions || ''
            });
            setDirty(false);
            toast.success('Invoice template saved');
        } catch {
            toast.error('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!allowed.includes(file.type)) {
            toast.error('Only JPEG, PNG, WebP, or SVG allowed');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File must be under 5MB');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // SVG cannot be cropped on canvas — upload directly
        if (file.type === 'image/svg+xml') {
            uploadLogo(file);
            return;
        }

        // For raster images, open crop modal
        const reader = new FileReader();
        reader.onload = () => {
            setCropImage(reader.result);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const getCroppedImg = (imageSrc, pixelCrop) => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = pixelCrop.width;
                canvas.height = pixelCrop.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(
                    img,
                    pixelCrop.x, pixelCrop.y,
                    pixelCrop.width, pixelCrop.height,
                    0, 0,
                    pixelCrop.width, pixelCrop.height
                );
                canvas.toBlob(resolve, 'image/png');
            };
            img.src = imageSrc;
        });
    };

    const handleCropConfirm = async () => {
        if (!cropImage || !croppedAreaPixels) return;
        try {
            const blob = await getCroppedImg(cropImage, croppedAreaPixels);
            const file = new File([blob], 'logo.png', { type: 'image/png' });
            setShowCropModal(false);
            setCropImage(null);
            await uploadLogo(file);
        } catch {
            toast.error('Failed to crop image');
        }
    };

    const uploadLogo = async (file) => {
        const formData = new FormData();
        formData.append('logo', file);
        try {
            setUploading(true);
            const res = await invoiceTemplateAPI.uploadLogo(formData);
            setLogoUrl(res.data.url);
            setHasLogo(true);
            toast.success('Logo uploaded');
        } catch {
            toast.error('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLogo = async () => {
        try {
            await invoiceTemplateAPI.deleteLogo();
            setLogoUrl('');
            setHasLogo(false);
            toast.success('Logo removed');
        } catch {
            toast.error('Failed to remove logo');
        }
    };

    const completeness = (() => {
        const fields = ['hospitalName', 'hospitalAddress', 'contactNumber', 'emailAddress'];
        const filled = fields.filter(f => form[f]?.trim()).length;
        return Math.round((filled / fields.length) * 100);
    })();

    if (loading) {
        return (
            <div className="it-loading">
                <div className="spinner-large"></div>
                <p>Loading invoice template...</p>
            </div>
        );
    }

    return (
        <div className="invoice-template-page">
            {/* Header */}
            <div className="it-header">
                <div>
                    <h1><FileText size={26} /> Template</h1>
                    <p>Configure hospital details that appear on all invoices</p>
                </div>
                <div className="it-header-actions">
                    <button onClick={fetchTemplate} className="it-btn-outline" title="Refresh">
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {/* Completeness */}
            <div className="it-completeness">
                <div className="it-progress-bar">
                    <div className="it-progress-fill" style={{ width: `${completeness}%` }}></div>
                </div>
                <div className="it-progress-info">
                    <span className={completeness === 100 ? 'it-complete' : 'it-incomplete'}>
                        {completeness === 100 ? <><CheckCircle size={14} /> Template complete</> : <><AlertCircle size={14} /> {completeness}% complete — fill in required fields</>}
                    </span>
                </div>
            </div>

            <div className="it-layout">
                {/* Live Preview */}
                <div className="it-preview-section">
                    <div className="it-preview-card">
                        <div className="it-preview-label">Preview</div>
                        <div className="it-preview-content">
                            {/* Header */}
                            <div className="itp-header">
                                {logoUrl && <img src={logoUrl} alt="Logo" className="itp-logo" />}
                                <div className="itp-hospital">
                                    <h3>{form.hospitalName || 'Hospital Name'}</h3>
                                    <p>{form.hospitalAddress || 'Hospital Address'}</p>
                                    <div className="itp-contacts">
                                        {form.contactNumber && <span><Phone size={11} /> {form.contactNumber}</span>}
                                        {form.emailAddress && <span><Mail size={11} /> {form.emailAddress}</span>}
                                        {form.websiteUrl && <span><Globe size={11} /> {form.websiteUrl}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="itp-divider"></div>

                            <div className="itp-inv-row">
                                <div>
                                    <h4>INVOICE</h4>
                                    <p className="itp-inv-num">#INV2602XXXXX</p>
                                </div>
                                <div className="itp-meta">
                                    <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>

                            <div className="itp-two-col">
                                <div>
                                    <p className="itp-section-label">Patient Details</p>
                                    <p><strong>John Doe</strong></p>
                                    <p>Age: 32 | DOB: 15/06/1993</p>
                                    <p>PID: PID0001</p>
                                </div>
                                <div>
                                    <p className="itp-section-label">Appointment</p>
                                    <p>ID: APT0001</p>
                                    <p>Dept: General Medicine</p>
                                    <p>Dr. Example Doctor</p>
                                </div>
                            </div>

                            <table className="itp-table">
                                <thead>
                                    <tr><th>#</th><th>Service</th><th>Amount</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td>Consultation Fee</td><td>₹500.00</td></tr>
                                    <tr><td>2</td><td>Blood Test</td><td>₹300.00</td></tr>
                                </tbody>
                            </table>

                            <div className="itp-totals">
                                <div className="itp-total-row"><span>Subtotal:</span><span>₹800.00</span></div>
                                <div className="itp-total-row itp-total-bold"><span>Total:</span><span>₹800.00</span></div>
                            </div>

                            {/* QR placeholder */}
                            <div className="itp-qr-section">
                                <div className="itp-qr-placeholder">[QR Code]</div>
                                <p className="itp-qr-label">Scan to verify</p>
                            </div>

                            {/* Signature */}
                            <div className="itp-signature">
                                <div className="itp-sig-line"></div>
                                <p>Authorized Signatory</p>
                            </div>

                            {/* Registration info */}
                            <div className="itp-reg-info">
                                {form.gstNumber && <span>GST: {form.gstNumber}</span>}
                                {form.cinNumber && <span>CIN: {form.cinNumber}</span>}
                            </div>

                            {/* Footer */}
                            <div className="itp-footer">
                                <p>{form.footerNote || 'Computer-generated invoice'}</p>
                                {form.termsAndConditions && <p className="itp-terms">{form.termsAndConditions}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="it-form-section">
                    {/* Logo Upload */}
                    <div className="it-card">
                        <div className="it-card-header">
                            <h2><Image size={17} /> Hospital Logo</h2>
                        </div>
                        <div className="it-card-body">
                            <div className="it-logo-area">
                                {logoUrl ? (
                                    <div className="it-logo-preview">
                                        <img src={logoUrl} alt="Hospital Logo" />
                                        <button onClick={handleDeleteLogo} className="it-logo-delete" title="Remove logo">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="it-logo-placeholder">
                                        <Image size={32} />
                                        <p>No logo uploaded</p>
                                    </div>
                                )}
                                <div className="it-logo-actions">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                        onChange={handleFileSelect}
                                        hidden
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="it-btn-primary"
                                        disabled={uploading}
                                    >
                                        <Upload size={14} /> {uploading ? 'Uploading...' : hasLogo ? 'Change Logo' : 'Upload Logo'}
                                    </button>
                                    <span className="it-hint">JPEG, PNG, WebP, or SVG. Max 5MB.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hospital Information */}
                    <div className="it-card">
                        <div className="it-card-header">
                            <h2><Building2 size={17} /> Hospital Information</h2>
                        </div>
                        <div className="it-card-body">
                            <div className="it-form-grid">
                                <div className="it-field it-field-full">
                                    <label><Building2 size={13} /> Hospital Name <span className="it-req">*</span></label>
                                    <input
                                        type="text"
                                        value={form.hospitalName}
                                        onChange={e => handleChange('hospitalName', e.target.value)}
                                        placeholder="e.g. MindSpace Clinic & Hospital"
                                    />
                                </div>
                                <div className="it-field it-field-full">
                                    <label><Building2 size={13} /> Full Hospital Address <span className="it-req">*</span></label>
                                    <textarea
                                        value={form.hospitalAddress}
                                        onChange={e => handleChange('hospitalAddress', e.target.value)}
                                        placeholder="e.g. 123, Main Street, City, State - 123456"
                                        rows={3}
                                    />
                                </div>
                                <div className="it-field">
                                    <label><Phone size={13} /> Contact Number <span className="it-req">*</span></label>
                                    <input
                                        type="text"
                                        value={form.contactNumber}
                                        onChange={e => handleChange('contactNumber', e.target.value)}
                                        placeholder="e.g. +91 98765 43210"
                                    />
                                </div>
                                <div className="it-field">
                                    <label><Mail size={13} /> Email Address <span className="it-req">*</span></label>
                                    <input
                                        type="email"
                                        value={form.emailAddress}
                                        onChange={e => handleChange('emailAddress', e.target.value)}
                                        placeholder="e.g. info@hospital.com"
                                    />
                                </div>
                                <div className="it-field">
                                    <label><Globe size={13} /> Website URL</label>
                                    <input
                                        type="url"
                                        value={form.websiteUrl}
                                        onChange={e => handleChange('websiteUrl', e.target.value)}
                                        placeholder="e.g. https://www.hospital.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration Details */}
                    <div className="it-card">
                        <div className="it-card-header">
                            <h2><Hash size={17} /> Registration & Compliance</h2>
                        </div>
                        <div className="it-card-body">
                            <div className="it-form-grid">
                                <div className="it-field">
                                    <label><Hash size={13} /> GST Number</label>
                                    <input
                                        type="text"
                                        value={form.gstNumber}
                                        onChange={e => handleChange('gstNumber', e.target.value)}
                                        placeholder="e.g. 22AAAAA0000A1Z5"
                                    />
                                    <span className="it-hint">If applicable</span>
                                </div>
                                <div className="it-field">
                                    <label><Hash size={13} /> CIN / Registration Number</label>
                                    <input
                                        type="text"
                                        value={form.cinNumber}
                                        onChange={e => handleChange('cinNumber', e.target.value)}
                                        placeholder="e.g. U85100MH2020PTC123456"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer & Terms */}
                    <div className="it-card">
                        <div className="it-card-header">
                            <h2><FileText size={17} /> Footer & Terms</h2>
                        </div>
                        <div className="it-card-body">
                            <div className="it-form-grid">
                                <div className="it-field it-field-full">
                                    <label>Footer Note</label>
                                    <input
                                        type="text"
                                        value={form.footerNote}
                                        onChange={e => handleChange('footerNote', e.target.value)}
                                        placeholder="e.g. This is a computer-generated invoice."
                                    />
                                </div>
                                <div className="it-field it-field-full">
                                    <label>Terms & Conditions</label>
                                    <textarea
                                        value={form.termsAndConditions}
                                        onChange={e => handleChange('termsAndConditions', e.target.value)}
                                        placeholder="e.g. Payment is due within 15 days. Late payments may incur additional charges."
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="it-save-bar">
                        <button onClick={handleSave} disabled={saving || !dirty} className="it-btn-primary it-btn-lg">
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Template'}
                        </button>
                        {dirty && <span className="it-unsaved">You have unsaved changes</span>}
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {showCropModal && cropImage && (
                <div className="it-crop-overlay" onClick={() => { setShowCropModal(false); setCropImage(null); }}>
                    <div className="it-crop-modal" onClick={e => e.stopPropagation()}>
                        <div className="it-crop-header">
                            <h3><Crop size={17} /> Crop Logo</h3>
                            <button onClick={() => { setShowCropModal(false); setCropImage(null); }} className="it-crop-close">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="it-crop-area">
                            <Cropper
                                image={cropImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                showGrid={true}
                            />
                        </div>
                        <div className="it-crop-controls">
                            <div className="it-zoom-control">
                                <ZoomOut size={15} />
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    value={zoom}
                                    onChange={e => setZoom(Number(e.target.value))}
                                    className="it-zoom-slider"
                                />
                                <ZoomIn size={15} />
                            </div>
                            <div className="it-crop-actions">
                                <button onClick={() => { setShowCropModal(false); setCropImage(null); }} className="it-btn-outline">
                                    Cancel
                                </button>
                                <button onClick={handleCropConfirm} className="it-btn-primary">
                                    <Upload size={14} /> Crop & Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceTemplate;
