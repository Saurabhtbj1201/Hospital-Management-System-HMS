import { useState } from 'react';
import { FaTimes, FaLifeRing } from 'react-icons/fa';
import { toast } from 'sonner';
import './SupportModal.css';

const SupportModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        issueType: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const issueTypes = [
        'Forgot Password',
        'Invalid Email',
        'Invalid Phone',
        'Login Error',
        'Account Locked',
        'Other'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Extract name from email (text before @)
    const getNameFromEmail = (email) => {
        if (!email) return 'Anonymous User';
        const username = email.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        return username
            .replace(/[._]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Create submission data with name extracted from email
            const submissionData = {
                name: getNameFromEmail(formData.email),
                email: formData.email || 'no-email@provided.com',
                issueType: formData.issueType,
                description: formData.description
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/support`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Support ticket submitted successfully! We will get back to you soon.');

                setFormData({
                    email: '',
                    issueType: '',
                    description: ''
                });

                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                toast.error(data.message || 'Failed to submit ticket. Please try again.');
            }
        } catch (error) {
            toast.error('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="support-modal-overlay" onClick={onClose}>
            <div className="support-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="support-modal-header">
                    <div className="support-modal-header-content">
                        <div className="support-modal-icon">
                            <FaLifeRing />
                        </div>
                        <div>
                            <h2>Welcome back! How can I help?</h2>
                            <p>I'm here to help tackle your tasks. Choose from the prompts below or tell me what you need!</p>
                        </div>
                    </div>
                    <button className="support-modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="support-modal-form">
                    <div className="support-modal-form-group">
                        <label htmlFor="email">
                            Email <span className="support-modal-optional-label">(optional)</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Enter your email (optional)"
                        />
                    </div>

                    <div className="support-modal-form-group">
                        <label htmlFor="issueType">Select Issue Type *</label>
                        <div className="support-modal-issue-type-grid">
                            {issueTypes.map((type) => (
                                <label
                                    key={type}
                                    className={`support-modal-issue-type-card ${formData.issueType === type ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="issueType"
                                        value={type}
                                        checked={formData.issueType === type}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <span>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="support-modal-form-group">
                        <label htmlFor="description">Describe Your Issue *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            rows="5"
                            placeholder="Ask me anything..."
                        />
                    </div>

                    <div className="support-modal-footer">
                        <button
                            type="button"
                            className="support-modal-btn-secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="support-modal-btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupportModal;
