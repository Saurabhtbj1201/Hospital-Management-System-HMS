import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import api from '../services/api';
import './SiteUpdateBanner.css';

const SiteUpdateBanner = () => {
    const [banners, setBanners] = useState([]);
    const [dismissedIds, setDismissedIds] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('dismissedBannerIds') || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        fetchActiveBanners();
    }, []);

    const fetchActiveBanners = async () => {
        try {
            const response = await api.get('/site-updates/active');
            if (response.banners && response.banners.length > 0) {
                setBanners(response.banners);
            }
        } catch (error) {
            console.error('Error fetching site update banners:', error);
        }
    };

    const handleDismiss = (id) => {
        const updated = [...dismissedIds, id];
        setDismissedIds(updated);
        sessionStorage.setItem('dismissedBannerIds', JSON.stringify(updated));
    };

    const visibleBanners = banners.filter((b) => !dismissedIds.includes(b._id));

    if (visibleBanners.length === 0) {
        return null;
    }

    return (
        <div className="site-update-banners-wrapper">
            {visibleBanners.map((banner) => (
                <div
                    key={banner._id}
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
                        onClick={() => handleDismiss(banner._id)}
                        aria-label="Dismiss banner"
                    >
                        <FaTimes />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default SiteUpdateBanner;
