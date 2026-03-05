import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Bell, Filter, Megaphone,
  Info, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';
import SectionWrapper, { containerVariants } from '../ui/SectionWrapper';
import AnnouncementCard from './AnnouncementCard';
import { announcementAPI } from '../../services/api';
import { cn } from '../../lib/cn';

/* ── Mock data (fallback) ── */
const MOCK_ANNOUNCEMENTS = [
  {
    _id: 'a1',
    title: 'COVID-19 Vaccination Drive — Phase 4 Now Open',
    message: 'Walk-in COVID-19 booster vaccinations are now available for all age groups 18+. No appointment required. Available daily from 9 AM to 4 PM at the Vaccination Center, Block D Ground Floor.',
    type: 'success',
    priority: 'high',
    startDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    icon: 'bell',
  },
  {
    _id: 'a2',
    title: 'OPD Timings Extended on Saturdays',
    message: 'Effective immediately, OPD services will now be available until 6:00 PM on Saturdays (previously 2:00 PM). This applies to all departments.',
    type: 'info',
    priority: 'medium',
    startDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    icon: 'bell',
  },
  {
    _id: 'a3',
    title: 'Scheduled Maintenance — Online Portal',
    message: 'Our online appointment booking portal will undergo scheduled maintenance on March 10, 2026 from 12:00 AM to 4:00 AM. During this time, please call +91-9876543210 to book appointments.',
    type: 'warning',
    priority: 'medium',
    startDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    icon: 'bell',
  },
  {
    _id: 'a4',
    title: 'New Robotic Surgery Center Inaugurated',
    message: 'We are proud to announce the inauguration of our state-of-the-art Robotic Surgery Center equipped with the Da Vinci Xi system. This enables minimally invasive surgeries with enhanced precision and faster recovery.',
    type: 'success',
    priority: 'high',
    startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    icon: 'bell',
  },
  {
    _id: 'a5',
    title: 'Free Health Camp — Diabetes Screening',
    message: 'Lifebridge is organizing a free diabetes screening camp on March 14, 2026 (World Kidney Day). The camp includes fasting blood glucose, HbA1c, BMI assessment, and a free dietician consultation.',
    type: 'info',
    priority: 'medium',
    startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    icon: 'bell',
  },
  {
    _id: 'a6',
    title: 'Blood Bank — Urgent Requirement for O-Negative',
    message: 'Our blood bank urgently needs O-Negative donors. If you are a healthy individual aged 18-65, please visit our Blood Bank (Block A, Ground Floor) between 8 AM and 6 PM. Walk-ins welcome.',
    type: 'error',
    priority: 'high',
    startDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    icon: 'bell',
  },
  {
    _id: 'a7',
    title: 'Telemedicine Services Now Available 24/7',
    message: 'Our video consultation platform is now operational around the clock. Consult with our doctors from the comfort of your home — available for follow-ups, second opinions, and non-emergency consultations.',
    type: 'success',
    priority: 'low',
    startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    icon: 'bell',
  },
  {
    _id: 'a8',
    title: 'Visitor Policy Update',
    message: 'Effective March 1, 2026: Visiting hours for General Wards are now 4:00 PM – 7:00 PM. ICU visiting remains restricted. A maximum of 2 visitors per patient are allowed at any time.',
    type: 'warning',
    priority: 'low',
    startDate: new Date(Date.now() - 12 * 86400000).toISOString(),
    icon: 'bell',
  },
];

const TYPE_FILTERS = [
  { key: 'all', label: 'All', icon: Bell },
  { key: 'info', label: 'Info', icon: Info },
  { key: 'success', label: 'Updates', icon: CheckCircle2 },
  { key: 'warning', label: 'Notices', icon: AlertTriangle },
  { key: 'error', label: 'Urgent', icon: XCircle },
];

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await announcementAPI.getActive();
        const data = res?.announcements || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setAnnouncements(data);
        } else {
          setAnnouncements(MOCK_ANNOUNCEMENTS);
        }
      } catch {
        setAnnouncements(MOCK_ANNOUNCEMENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const filtered = useMemo(() => {
    let list = announcements;
    if (typeFilter !== 'all') {
      list = list.filter((a) => a.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.message?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [announcements, search, typeFilter]);

  /* ── Skeleton ── */
  const Skeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4">
          <div className="w-11 h-11 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <SectionWrapper
      label="Hospital Announcements"
      title="Latest Announcements & Notices"
      subtitle="Stay updated with the latest news, policy changes, health camps, and important notices from Lifebridge Medical Center."
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4 mb-8 -mt-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-dark-800 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600" aria-label="Clear">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
                  typeFilter === f.key
                    ? 'bg-primary-600 text-white border-primary-600 shadow-purple'
                    : 'bg-white text-dark-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
                )}
              >
                <Icon size={14} /> {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Count ── */}
      {!loading && (
        <p className="text-sm text-dark-500 mb-6">
          Showing <span className="font-semibold text-primary-700">{filtered.length}</span> announcement{filtered.length !== 1 && 's'}
        </p>
      )}

      {/* ── Content ── */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Megaphone size={60} className="mx-auto text-dark-300 mb-4" />
          <h3 className="text-lg font-heading font-bold text-dark-700">No announcements found</h3>
          <p className="text-sm text-dark-400 mt-1">Try a different search or filter.</p>
          {(search || typeFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setTypeFilter('all'); }}
              className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence>
            {filtered.map((a, i) => (
              <AnnouncementCard key={a._id || i} announcement={a} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </SectionWrapper>
  );
}
