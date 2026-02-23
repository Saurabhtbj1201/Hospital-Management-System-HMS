import { FaTimes, FaBell, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './AnnouncementModal.css';

const AnnouncementModal = ({ announcement, isOpen, onClose }) => {
    if (!isOpen || !announcement) return null;

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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="announcement-modal-overlay" onClick={onClose}>
            <div className="announcement-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className={`announcement-modal-header announcement-modal-${announcement.type}`}>
                    <div className="announcement-modal-icon-large">
                        {getIcon(announcement.type)}
                    </div>
                    <button className="announcement-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="announcement-modal-body">
                    <h2>{announcement.title}</h2>
                    <div className="announcement-modal-meta">
                        <span className={`announcement-modal-badge announcement-modal-badge-${announcement.type}`}>
                            {announcement.type}
                        </span>
                        <span className={`announcement-modal-badge announcement-modal-badge-${announcement.priority}`}>
                            {announcement.priority} priority
                        </span>
                    </div>
                    <p className="announcement-modal-message">{announcement.message}</p>

                    <div className="announcement-modal-footer">
                        <div className="announcement-modal-dates">
                            <div>
                                <strong>Posted:</strong> {formatDate(announcement.startDate)}
                            </div>
                            {announcement.endDate && (
                                <div>
                                    <strong>Valid until:</strong> {formatDate(announcement.endDate)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="announcement-modal-actions">
                    <button className="announcement-modal-btn-close" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementModal;
