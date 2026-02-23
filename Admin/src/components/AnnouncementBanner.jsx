import { useState, useEffect } from 'react';
import { FaBell, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import './AnnouncementBanner.css';

const AnnouncementBanner = ({ onAnnouncementClick }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        fetchActiveAnnouncements();
    }, []);

    useEffect(() => {
        if (announcements.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % announcements.length);
            }, 5000); // Change every 5 seconds

            return () => clearInterval(interval);
        }
    }, [announcements.length]);

    const fetchActiveAnnouncements = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements/active`);
            const data = await response.json();
            if (data.success && data.announcements.length > 0) {
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const getIcon = (type) => {
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
                return <FaBell />;
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible || announcements.length === 0) return null;

    const currentAnnouncement = announcements[currentIndex];

    return (
        <div className={`announcement-banner announcement-${currentAnnouncement.type}`}>
            <div className="announcement-content">
                <div className="announcement-icon">
                    {getIcon(currentAnnouncement.type)}
                </div>
                <div className="announcement-text">
                    <h4>{currentAnnouncement.title}</h4>
                    <p>{currentAnnouncement.message.substring(0, 100)}{currentAnnouncement.message.length > 100 ? '...' : ''}</p>
                </div>
                <button
                    className="announcement-view-btn"
                    onClick={() => onAnnouncementClick(currentAnnouncement)}
                >
                    View Details
                </button>
            </div>
            <button className="announcement-close-btn" onClick={handleClose}>
                <FaTimes />
            </button>
            {announcements.length > 1 && (
                <div className="announcement-dots">
                    {announcements.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementBanner;
