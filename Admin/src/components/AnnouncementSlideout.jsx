import { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../services/api';
import './AnnouncementSlideout.css';

const AnnouncementSlideout = ({ onAnnouncementClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await api.get('/announcements/active');
            const announcementsList = response.announcements || [];
            setAnnouncements(announcementsList);

            // Check unread announcements from localStorage
            const readAnnouncements = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
            const unread = announcementsList.filter(a => !readAnnouncements.includes(a._id));
            setUnreadCount(unread.length);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSlideout = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Mark all as read when opening
            const allIds = announcements.map(a => a._id);
            localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
            setUnreadCount(0);
        }
    };

    const handleAnnouncementClick = (announcement) => {
        onAnnouncementClick(announcement);
        setIsOpen(false);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'info':
                return <FaInfoCircle />;
            case 'warning':
                return <FaExclamationTriangle />;
            case 'success':
                return <FaCheckCircle />;
            case 'error':
                return <FaTimesCircle />;
            default:
                return <FaInfoCircle />;
        }
    };

    const getTypeClass = (type) => {
        return `announcement-type-${type}`;
    };

    const formatTime = (date) => {
        const now = new Date();
        const announcementDate = new Date(date);
        const diffInMinutes = Math.floor((now - announcementDate) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;

        return announcementDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <>
            {/* Bell Icon Button */}
            <button className="announcement-bell-btn" onClick={toggleSlideout}>
                <FaBell />
                {unreadCount > 0 && (
                    <span className="announcement-badge">{unreadCount}</span>
                )}
            </button>

            {/* Slideout Panel */}
            {isOpen && (
                <>
                    <div className="slideout-overlay" onClick={toggleSlideout}></div>
                    <div className="announcement-slideout">
                        <div className="slideout-header">
                            <h3>Notifications</h3>
                            <button className="slideout-close" onClick={toggleSlideout}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="slideout-content">
                            {loading ? (
                                <div className="slideout-loading">
                                    <div className="spinner-small"></div>
                                    <p>Loading announcements...</p>
                                </div>
                            ) : announcements.length === 0 ? (
                                <div className="slideout-empty">
                                    <FaBell />
                                    <p>No announcements</p>
                                </div>
                            ) : (
                                <div className="announcements-list">
                                    {announcements.map((announcement) => (
                                        <div
                                            key={announcement._id}
                                            className={`announcement-notification ${getTypeClass(announcement.type)}`}
                                            onClick={() => handleAnnouncementClick(announcement)}
                                        >
                                            <div className="notification-icon">
                                                {getTypeIcon(announcement.type)}
                                                <span className="notification-dot"></span>
                                            </div>
                                            <div className="notification-content">
                                                <div className="notification-header">
                                                    <span className="notification-title">{announcement.title}</span>
                                                    <span className="notification-time">{formatTime(announcement.createdAt)}</span>
                                                </div>
                                                <p className="notification-message">
                                                    {announcement.message.length > 80
                                                        ? `${announcement.message.substring(0, 80)}...`
                                                        : announcement.message
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default AnnouncementSlideout;
