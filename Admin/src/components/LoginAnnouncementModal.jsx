import { FaTimes } from 'react-icons/fa';
import './LoginAnnouncementModal.css';

const LoginAnnouncementModal = ({ announcement, onClose }) => {
    if (!announcement) return null;

    return (
        <div className="login-announcement-modal-overlay" onClick={onClose}>
            <div className="login-announcement-modal" onClick={(e) => e.stopPropagation()}>
                <div className="login-announcement-modal-header">
                    <h2>Announcement</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="login-announcement-modal-body">
                    <div className="modal-detail-row">
                        <label>TITLE</label>
                        <p>{announcement.title}</p>
                    </div>
                    <div className="modal-detail-row">
                        <label>DESCRIPTION</label>
                        <p>{announcement.message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginAnnouncementModal;
