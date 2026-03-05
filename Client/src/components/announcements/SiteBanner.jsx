import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteUpdateAPI } from '../../services/api';
import { cn } from '../../lib/cn';

/**
 * A dismissible banner that displays the latest active site update.
 * Place this inside MainLayout above the Navbar, or wherever you want.
 * Can also be embedded on the Announcements page.
 */
export default function SiteBanner({ embedded = false }) {
  const [banner, setBanner] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await siteUpdateAPI.getActive();
        const data = res?.banner || (res?.banners && res.banners[0]) || null;
        if (data && data.message) {
          setBanner(data);
        }
      } catch {
        // Fallback — show a mock banner only on the announcements page (embedded)
        if (embedded) {
          setBanner({
            message: '🎉 Our new Robotic Surgery Center is now open! Offering minimally invasive procedures with world-class precision.',
            linkText: 'Learn More',
            linkUrl: '/services',
            backgroundColor: '#7c3aed',
            textColor: '#ffffff',
          });
        }
      }
    };
    fetchBanner();
  }, [embedded]);

  if (!banner || dismissed) return null;

  const bgColor = banner.backgroundColor || '#7c3aed';
  const textColor = banner.textColor || '#ffffff';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={cn('overflow-hidden', embedded && 'rounded-2xl')}
      >
        <div
          className="relative px-4 py-2.5 text-center text-sm font-medium"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <div className="container-custom flex items-center justify-center gap-3 flex-wrap">
            <span>{banner.message}</span>
            {banner.linkText && banner.linkUrl && (
              <Link
                to={banner.linkUrl}
                className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={{ color: textColor }}
              >
                {banner.linkText} <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {!embedded && (
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
              style={{ color: textColor }}
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
