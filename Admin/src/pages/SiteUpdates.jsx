import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaBullhorn } from 'react-icons/fa';
import { toast } from 'sonner';
import api from '../services/api';
import './SiteUpdates.css';

const SiteUpdates = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        message: '',
        linkText: '',
        linkUrl: '',
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await api.get('/site-updates');
            setBanners(response.banners || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('Failed to load site updates');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBanner) {
                await api.put(`/site-updates/${editingBanner._id}`, formData);
                toast.success('Site update banner updated successfully');
            } else {
                await api.post('/site-updates', formData);
                toast.success('Site update banner created successfully');
            }
            fetchBanners();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save banner');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await api.delete(`/site-updates/${id}`);
                toast.success('Banner deleted successfully');
                fetchBanners();
            } catch (error) {
                toast.error('Failed to delete banner');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.put(`/site-updates/${id}/toggle`);
            toast.success('Banner status updated');
            fetchBanners();
        } catch (error) {
            toast.error('Failed to update banner status');
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            message: banner.message,
            linkText: banner.linkText || '',
            linkUrl: banner.linkUrl || '',
            backgroundColor: banner.backgroundColor || '#7c3aed',
            textColor: banner.textColor || '#ffffff',
            startDate: banner.startDate?.split('T')[0] || '',
            endDate: banner.endDate?.split('T')[0] || ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBanner(null);
        setFormData({
            message: '',
            linkText: '',
            linkUrl: '',
            backgroundColor: '#7c3aed',
            textColor: '#ffffff',
            startDate: new Date().toISOString().split('T')[0],
            endDate: ''
        });
    };

    return (
        <div className="site-updates-page">
            <div className="page-header">
                <div>
                    <h1><FaBullhorn /> Site Updates</h1>
                    <p>Manage site-wide update banners</p>
                </div>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                    <FaPlus /> Add Banner
                </button>
            </div>

            {loading ? (
                <div className="table-container">
                    <table className="site-updates-table">
                        <thead>
                            <tr>
                                <th>MESSAGE</th>
                                <th>LINK</th>
                                <th>COLORS</th>
                                <th>START DATE</th>
                                <th>END DATE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(4)].map((_, i) => (
                                <tr key={i} className="mgmt-skeleton-row">
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '180px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '80px' }} /></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <div className="mgmt-skeleton" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                                            <div className="mgmt-skeleton" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                                        </div>
                                    </td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '85px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '85px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-badge" /></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
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
            <>
            {/* Banners Table */}
            <div className="table-container">
                <table className="site-updates-table">
                    <thead>
                        <tr>
                            <th>MESSAGE</th>
                            <th>LINK</th>
                            <th>COLORS</th>
                            <th>START DATE</th>
                            <th>END DATE</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No site update banners found
                                </td>
                            </tr>
                        ) : (
                            banners.map((banner) => (
                                <tr key={banner._id}>
                                    <td className="message-cell">{banner.message}</td>
                                    <td>
                                        {banner.linkText ? (
                                            <span className="link-preview">
                                                {banner.linkText}
                                            </span>
                                        ) : (
                                            <span className="no-link">-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="color-preview">
                                            <div
                                                className="color-swatch"
                                                style={{ backgroundColor: banner.backgroundColor }}
                                                title={`Background: ${banner.backgroundColor}`}
                                            ></div>
                                            <div
                                                className="color-swatch"
                                                style={{ backgroundColor: banner.textColor }}
                                                title={`Text: ${banner.textColor}`}
                                            ></div>
                                        </div>
                                    </td>
                                    <td>{new Date(banner.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td>
                                        {banner.endDate
                                            ? new Date(banner.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <span className={`status-badge ${banner.isActive ? 'status-active' : 'status-inactive'}`}>
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn action-btn-toggle"
                                                onClick={() => handleToggleStatus(banner._id)}
                                                title={banner.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {banner.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                            </button>
                                            <button
                                                className="action-btn action-btn-edit"
                                                onClick={() => handleEdit(banner)}
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="action-btn action-btn-delete"
                                                onClick={() => handleDelete(banner._id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            </>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingBanner ? 'Edit Banner' : 'Create Banner'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Message *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows="3"
                                    placeholder="We've just launched a new feature!"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Link Text</label>
                                    <input
                                        type="text"
                                        value={formData.linkText}
                                        onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                                        placeholder="Check it out"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Link URL</label>
                                    <input
                                        type="url"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Background Color *</label>
                                    <div className="color-input-group">
                                        <input
                                            type="color"
                                            value={formData.backgroundColor}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            value={formData.backgroundColor}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                            placeholder="#7c3aed"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Text Color *</label>
                                    <div className="color-input-group">
                                        <input
                                            type="color"
                                            value={formData.textColor}
                                            onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            value={formData.textColor}
                                            onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                            placeholder="#ffffff"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="banner-preview">
                                <label>Preview:</label>
                                <div
                                    className="preview-banner"
                                    style={{
                                        backgroundColor: formData.backgroundColor,
                                        color: formData.textColor
                                    }}
                                >
                                    <span>{formData.message || 'Your message will appear here'}</span>
                                    {formData.linkText && (
                                        <span className="preview-link">{formData.linkText}</span>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingBanner ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SiteUpdates;
