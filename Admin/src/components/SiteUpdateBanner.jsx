import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import api from '../services/api';
import './SiteUpdateBanner.css';

const SiteUpdateBanner = () => {
    const [banner, setBanner] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        fetchActiveBanner();
    }, []);

    const fetchActiveBanner = async () => {
        try {
            const response = await api.get('/site-updates/active');
            if (response.banner) {
                setBanner(response.banner);
                // Check if user has dismissed this banner
                const dismissedBannerId = localStorage.getItem('dismissedBannerId');
                if (dismissedBannerId === response.banner._id) {
                    setIsVisible(false);
                    setIsDismissed(true);
                }
            }
        } catch (error) {
            console.error('Error fetching site update banner:', error);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        if (banner) {
            localStorage.setItem('dismissedBannerId', banner._id);
            setIsDismissed(true);
        }
    };

    if (!banner || isDismissed || !isVisible) {
        return null;
    }

    return (
        <div
            className="site-update-banner"
            style={{
                backgroundColor: banner.backgroundColor || '#7c3aed',
                color: banner.textColor || '#ffffff'
            }}
        >
            <div className="site-update-content">
                <span className="site-update-message">
                    {banner.message}
                </span>
                {banner.linkText && banner.linkUrl && (
                    <a
                        href={banner.linkUrl}
                        className="site-update-link"
                        style={{ color: banner.textColor || '#ffffff' }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {banner.linkText}
                    </a>
                )}
            </div>
            <button
                className="site-update-close"
                onClick={handleDismiss}
                aria-label="Dismiss banner"
            >
                <FaTimes />
            </button>
        </div>
    );
};

export default SiteUpdateBanner;
