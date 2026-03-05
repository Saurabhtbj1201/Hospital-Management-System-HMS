import { motion } from 'framer-motion';
import {
  Bell, AlertTriangle, CheckCircle2, XCircle, Info,
  Calendar, Clock, Megaphone, ArrowUpRight,
} from 'lucide-react';
import { cn } from '../../lib/cn';

/* ── Type → style map ── */
const TYPE_STYLES = {
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: Info,
    iconBg: 'bg-blue-100 text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    accent: 'border-l-blue-500',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    accent: 'border-l-amber-500',
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100 text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    accent: 'border-l-emerald-500',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: XCircle,
    iconBg: 'bg-red-100 text-red-600',
    badge: 'bg-red-100 text-red-700',
    accent: 'border-l-red-500',
  },
};

/* ── Priority → badge ── */
const PRIORITY_BADGE = {
  high: 'bg-red-500 text-white',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-dark-500',
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AnnouncementCard({ announcement, index = 0 }) {
  const type = announcement.type || 'info';
  const style = TYPE_STYLES[type] || TYPE_STYLES.info;
  const Icon = style.icon;
  const priority = announcement.priority || 'medium';

  const formattedDate = announcement.startDate || announcement.createdAt
    ? new Date(announcement.startDate || announcement.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '';

  const timeAgo = getTimeAgo(announcement.startDate || announcement.createdAt);

  return (
    <motion.div
      variants={itemVariant}
      className={cn(
        'rounded-2xl border border-l-4 p-5 transition-all duration-300 hover:shadow-card group',
        style.bg,
        style.accent
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn('flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center', style.iconBg)}>
          <Icon size={22} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-heading font-bold text-dark-900 leading-snug">
              {announcement.title}
            </h3>

            {/* Priority badge */}
            <span className={cn(
              'flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
              PRIORITY_BADGE[priority]
            )}>
              {priority}
            </span>
          </div>

          <p className="text-sm text-dark-600 leading-relaxed mt-1">{announcement.message}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-dark-400">
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium', style.badge)}>
              <Icon size={11} /> {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {formattedDate}
              </span>
            )}
            {timeAgo && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {timeAgo}
              </span>
            )}
            {announcement.createdBy?.name && (
              <span className="text-dark-400">
                by {announcement.createdBy.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Time-ago helper ── */
function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return '';
}
