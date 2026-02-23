import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaUserMd, FaClock, FaShieldAlt, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Home.css';

const Home = () => {
    const features = [
        {
            icon: <FaCalendarCheck />,
            title: 'Easy Booking',
            description: 'Book your appointment in just a few clicks with our simple and intuitive interface.'
        },
        {
            icon: <FaUserMd />,
            title: 'Expert Doctors',
            description: 'Access to highly qualified and experienced medical professionals across specialties.'
        },
        {
            icon: <FaClock />,
            title: '24/7 Support',
            description: 'Round-the-clock customer support to assist you with your healthcare needs.'
        },
        {
            icon: <FaShieldAlt />,
            title: 'Secure & Private',
            description: 'Your medical information is protected with industry-standard security measures.'
        }
    ];

    return (
        <div className="home-page">
            {/* Header */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <FaUserMd className="logo-icon" />
                            <span>HMS Portal</span>
                        </div>
                        <nav className="nav">
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/book-appointment" className="nav-link">Book Appointment</Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                Your Health, <span className="highlight">Our Priority</span>
                            </h1>
                            <p className="hero-description">
                                Book appointments with top healthcare professionals instantly.
                                Experience seamless healthcare management with our advanced Hospital Management System.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/book-appointment" className="btn btn-primary btn-large">
                                    <FaCalendarCheck />
                                    Book Appointment Now
                                </Link>
                                <button className="btn btn-outline btn-large">
                                    <FaPhone />
                                    Contact Us
                                </button>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="hero-card">
                                <div className="card-icon">
                                    <FaUserMd />
                                </div>
                                <h3>Professional Healthcare</h3>
                                <p>Expert medical care at your fingertips</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose Us</h2>
                        <p className="section-description">
                            Experience the best in healthcare management with our comprehensive features
                        </p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Book Your Appointment?</h2>
                        <p className="cta-description">
                            Join thousands of satisfied patients who trust us with their healthcare needs
                        </p>
                        <Link to="/book-appointment" className="btn btn-primary btn-large">
                            <FaCalendarCheck />
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <div className="footer-logo">
                                <FaUserMd className="logo-icon" />
                                <span>HMS Portal</span>
                            </div>
                            <p className="footer-text">
                                Providing quality healthcare services with advanced technology and compassionate care.
                            </p>
                        </div>
                        <div className="footer-section">
                            <h4 className="footer-title">Quick Links</h4>
                            <ul className="footer-links">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/book-appointment">Book Appointment</Link></li>
                                <li><a href="#about">About Us</a></li>
                                <li><a href="#contact">Contact</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4 className="footer-title">Contact Info</h4>
                            <ul className="footer-contact">
                                <li>
                                    <FaPhone />
                                    <span>+91 1234567890</span>
                                </li>
                                <li>
                                    <FaEnvelope />
                                    <span>info@hmsportal.com</span>
                                </li>
                                <li>
                                    <FaMapMarkerAlt />
                                    <span>123 Healthcare St, Medical City</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 HMS Portal. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
