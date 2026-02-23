import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserMd, FaEye, FaEyeSlash, FaStar, FaChevronLeft, FaChevronRight, FaQuestionCircle } from 'react-icons/fa';
import SupportModal from '../components/SupportModal';
import AnnouncementSlideout from '../components/AnnouncementSlideout';
import LoginAnnouncementModal from '../components/LoginAnnouncementModal';
import SiteUpdateBanner from '../components/SiteUpdateBanner';
import './Login.css';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const testimonials = [
        {
            quote: "We've been using HMS Portal to streamline our hospital operations and can't imagine working without it. It's incredible.",
            author: "Dr. Sarah Johnson",
            title: "Chief Medical Officer,\nCity General Hospital"
        },
        {
            quote: "The efficiency and ease of use of HMS Portal has transformed how we manage patient care. Highly recommended for any healthcare facility.",
            author: "Dr. Michael Chen",
            title: "Head of Surgery,\nMetropolitan Hospital"
        },
        {
            quote: "HMS Portal has revolutionized our appointment scheduling and patient management. The system is intuitive and powerful.",
            author: "Dr. Emily Rodriguez",
            title: "Director of Operations,\nCentral Medical Center"
        }
    ];

    // Auto-play carousel
    useEffect(() => {
        document.title = 'Login | HMS';
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [testimonials.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        if (!identifier || !password) {
            setErrorMessage('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (!selectedRole) {
            setErrorMessage('Please select your role');
            setIsLoading(false);
            return;
        }

        const result = await login(identifier, password);
        setIsLoading(false);

        if (result.success) {
            // Verify the role matches
            if (result.role !== selectedRole) {
                setErrorMessage(`Invalid credentials for ${selectedRole} role`);
                return;
            }

            // Navigate based on role
            switch (result.role) {
                case 'Admin':
                    navigate('/admin/dashboard');
                    break;
                case 'Receptionist':
                    navigate('/receptionist/dashboard');
                    break;
                case 'Doctor':
                    navigate('/doctor/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } else {
            setErrorMessage(result.error);
        }
    };

    const handleAnnouncementClick = (announcement) => {
        setSelectedAnnouncement(announcement);
        setShowAnnouncementModal(true);
    };

    return (
        <div className="login-page">
            {/* Site Update Banner */}
            <SiteUpdateBanner />

            {/* Left Side - Form */}
            <div className="login-left">
                <div className="login-form-container">
                    <div className="logo-section">
                        <div className="logo-icon">
                            <FaUserMd />
                        </div>
                        <span className="logo-text">HMS Portal</span>
                    </div>

                    <div className="welcome-section">
                        <h1>Welcome back</h1>
                        <p>Welcome back! Please enter your details.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="form">
                        {errorMessage && (
                            <div className="error-alert">
                                {errorMessage}
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor="identifier">Email or Phone</label>
                            <input
                                type="text"
                                id="identifier"
                                placeholder="Enter your email or phone number"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                disabled={isLoading}
                                className="input"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">
                                Password
                                <span className="tooltip-icon-wrapper">
                                    <FaQuestionCircle className="tooltip-icon" />
                                    <div className="password-tooltip">
                                        <div className="tooltip-header">Password Requirements:</div>
                                        <ul>
                                            <li>At least 8 characters long</li>
                                            <li>Contains uppercase and lowercase letters</li>
                                            <li>Contains at least one number</li>
                                            <li>Contains at least one special character</li>
                                        </ul>
                                    </div>
                                </span>
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Select Role</label>
                            <div className="role-selection">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Admin"
                                        checked={selectedRole === 'Admin'}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span>Admin</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Receptionist"
                                        checked={selectedRole === 'Receptionist'}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span>Receptionist</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Doctor"
                                        checked={selectedRole === 'Doctor'}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span>Doctor</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember for 30 days</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>

                        <p className="support-text">
                            <a href="#" onClick={(e) => { e.preventDefault(); setShowSupportModal(true); }}>
                                Issue in login/Forget password
                            </a>
                        </p>
                    </form>

                    <div className="footer-text">
                        © HMS Portal 2026
                    </div>
                </div>
            </div>

            {/* Right Side - Image & Testimonial */}
            <div className="login-right">
                {/* Announcement Bell Icon */}
                <AnnouncementSlideout onAnnouncementClick={handleAnnouncementClick} />

                {/* Testimonials Section */}
                <button className="carousel-nav prev" onClick={prevSlide} aria-label="Previous testimonial">
                    <FaChevronLeft />
                </button>

                <div className="testimonial-card">
                    <div className="quote-text">
                        "{testimonials[currentSlide].quote}"
                    </div>
                    <div className="testimonial-author">
                        <div className="author-info">
                            <div className="author-name">{testimonials[currentSlide].author}</div>
                            <div className="author-title">{testimonials[currentSlide].title.split('\n').map((line, i) => (
                                <span key={i}>{line}{i === 0 && <br />}</span>
                            ))}</div>
                        </div>
                        <div className="rating">
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                            <FaStar />
                        </div>
                    </div>
                    <div className="carousel-dots">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${currentSlide === index ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <button className="carousel-nav next" onClick={nextSlide} aria-label="Next testimonial">
                    <FaChevronRight />
                </button>
            </div>

            {/* Support Modal */}
            <SupportModal
                isOpen={showSupportModal}
                onClose={() => setShowSupportModal(false)}
            />

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <LoginAnnouncementModal
                    announcement={selectedAnnouncement}
                    onClose={() => {
                        setShowAnnouncementModal(false);
                        setSelectedAnnouncement(null);
                    }}
                />
            )}
        </div>
    );
};

export default Login;
