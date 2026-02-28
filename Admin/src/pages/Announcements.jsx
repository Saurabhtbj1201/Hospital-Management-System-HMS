import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBullhorn, FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';
import api from '../services/api';
import './Announcements.css';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get('/announcements');
            setAnnouncements(response.announcements || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Failed to load announcements');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAnnouncement) {
                await api.put(`/announcements/${editingAnnouncement._id}`, formData);
                toast.success('Announcement updated successfully');
            } else {
                await api.post('/announcements', formData);
                toast.success('Announcement created successfully');
            }
            fetchAnnouncements();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save announcement');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await api.delete(`/announcements/${id}`);
                toast.success('Announcement deleted successfully');
                fetchAnnouncements();
            } catch (error) {
                toast.error('Failed to delete announcement');
            }
        }
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            startDate: announcement.startDate?.split('T')[0] || '',
            endDate: announcement.endDate?.split('T')[0] || ''
        });
        setShowModal(true);
    };

    const handleView = (announcement) => {
        setSelectedAnnouncement(announcement);
        setViewModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAnnouncement(null);
        setFormData({
            title: '',
            message: '',
            type: 'info',
            startDate: new Date().toISOString().split('T')[0],
            endDate: ''
        });
    };

    const getAnnouncementStatus = (announcement) => {
        const now = new Date();
        const startDate = new Date(announcement.startDate);
        const endDate = announcement.endDate ? new Date(announcement.endDate) : null;

        if (now < startDate) {
            return 'upcoming';
        } else if (endDate && now > endDate) {
            return 'expired';
        } else {
            return 'current';
        }
    };

    const filteredAnnouncements = announcements.filter(announcement => {
        const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            announcement.message.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterStatus === 'all') return true;

        const status = getAnnouncementStatus(announcement);
        return status === filterStatus;
    });

    const getStatusCounts = () => {
        const counts = {
            all: announcements.length,
            upcoming: 0,
            current: 0,
            expired: 0
        };

        announcements.forEach(announcement => {
            const status = getAnnouncementStatus(announcement);
            counts[status]++;
        });

        return counts;
    };

    const statusCounts = getStatusCounts();

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'info':
                return 'type-info';
            case 'warning':
                return 'type-warning';
            case 'success':
                return 'type-success';
            case 'error':
                return 'type-error';
            default:
                return '';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'upcoming':
                return 'status-upcoming';
            case 'current':
                return 'status-current';
            case 'expired':
                return 'status-expired';
            default:
                return '';
        }
    };

    return (
        <div className="announcements-page">
            <div className="page-header">
                <div>
                    <h1><FaBullhorn /> Announcements</h1>
                    <p>Manage system-wide announcements and notifications</p>
                </div>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                    <FaPlus /> Add Announcement
                </button>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <div className="filter-tabs">
                    <button
                        className={filterStatus === 'all' ? 'active' : ''}
                        onClick={() => setFilterStatus('all')}
                    >
                        All time
                    </button>
                    <button
                        className={filterStatus === 'upcoming' ? 'active' : ''}
                        onClick={() => setFilterStatus('upcoming')}
                    >
                        Upcoming, +{statusCounts.upcoming}
                    </button>
                    <button
                        className={filterStatus === 'current' ? 'active' : ''}
                        onClick={() => setFilterStatus('current')}
                    >
                        Current, +{statusCounts.current}
                    </button>
                    <button
                        className={filterStatus === 'expired' ? 'active' : ''}
                        onClick={() => setFilterStatus('expired')}
                    >
                        Expired, +{statusCounts.expired}
                    </button>
                </div>
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="table-container">
                    <table className="announcements-table">
                        <thead>
                            <tr>
                                <th>ANNOUNCEMENT TITLE</th>
                                <th>DESCRIPTION</th>
                                <th>START DATE</th>
                                <th>END DATE</th>
                                <th>TYPE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="mgmt-skeleton-row">
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '140px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '180px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '85px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-text" style={{ width: '85px' }} /></td>
                                    <td><div className="mgmt-skeleton mgmt-skeleton-badge" /></td>
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
            {/* Announcements Table */}
            <div className="table-container">
                <table className="announcements-table">
                    <thead>
                        <tr>
                            <th>ANNOUNCEMENT TITLE</th>
                            <th>DESCRIPTION</th>
                            <th>START DATE</th>
                            <th>END DATE</th>
                            <th>TYPE</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAnnouncements.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No announcements found
                                </td>
                            </tr>
                        ) : (
                            filteredAnnouncements.map((announcement) => {
                                const status = getAnnouncementStatus(announcement);
                                return (
                                    <tr key={announcement._id}>
                                        <td className="title-cell">{announcement.title}</td>
                                        <td className="description-cell">
                                            {announcement.message.substring(0, 80)}
                                            {announcement.message.length > 80 ? '...' : ''}
                                        </td>
                                        <td>{new Date(announcement.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td>
                                            {announcement.endDate
                                                ? new Date(announcement.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : '-'
                                            }
                                        </td>
                                        <td>
                                            <span className={`type-badge ${getTypeBadgeClass(announcement.type)}`}>
                                                {announcement.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn action-btn-view"
                                                    onClick={() => handleView(announcement)}
                                                    title="View"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="action-btn action-btn-edit"
                                                    onClick={() => handleEdit(announcement)}
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="action-btn action-btn-delete"
                                                    onClick={() => handleDelete(announcement._id)}
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
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
                            <h2>{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Message *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Type *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="success">Success</option>
                                    <option value="error">Error</option>
                                </select>
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

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingAnnouncement ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModal && selectedAnnouncement && (
                <div className="modal-overlay" onClick={() => setViewModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Announcement Details</h2>
                            <button className="modal-close" onClick={() => setViewModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <label>Title:</label>
                                <span>{selectedAnnouncement.title}</span>
                            </div>
                            <div className="detail-row">
                                <label>Type:</label>
                                <span className={`type-badge ${getTypeBadgeClass(selectedAnnouncement.type)}`}>
                                    {selectedAnnouncement.type}
                                </span>
                            </div>
                            <div className="detail-row">
                                <label>Status:</label>
                                <span className={`status-badge ${getStatusBadgeClass(getAnnouncementStatus(selectedAnnouncement))}`}>
                                    {getAnnouncementStatus(selectedAnnouncement).charAt(0).toUpperCase() + getAnnouncementStatus(selectedAnnouncement).slice(1)}
                                </span>
                            </div>
                            <div className="detail-row">
                                <label>Start Date:</label>
                                <span>{new Date(selectedAnnouncement.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="detail-row">
                                <label>End Date:</label>
                                <span>
                                    {selectedAnnouncement.endDate
                                        ? new Date(selectedAnnouncement.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'No end date'
                                    }
                                </span>
                            </div>
                            <div className="detail-row full-width">
                                <label>Message:</label>
                                <p className="description">{selectedAnnouncement.message}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setViewModal(false)}>
                                Close
                            </button>
                            <button className="btn-primary" onClick={() => {
                                setViewModal(false);
                                handleEdit(selectedAnnouncement);
                            }}>
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;
