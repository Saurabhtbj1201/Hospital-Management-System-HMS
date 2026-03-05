import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  className,
  variant = 'default', // 'default' | 'emergency'
}) {
  const bgClass =
    variant === 'emergency'
      ? 'bg-emergency-gradient'
      : 'bg-hero-gradient';

  return (
    <section className={cn('relative overflow-hidden', bgClass, className)}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Floating medical cross */}
        <div className="absolute top-10 right-[15%] text-white/10 text-8xl font-bold select-none">✚</div>
        <div className="absolute bottom-6 left-[10%] text-white/10 text-6xl font-bold select-none">✚</div>
      </div>

      <div className="relative container-custom py-16 md:py-20 lg:py-24">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 text-sm text-white/70 mb-4"
            aria-label="Breadcrumb"
          >
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Home size={14} />
              <span>Home</span>
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                <ChevronRight size={14} className="text-white/40" />
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </motion.nav>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white text-balance"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl text-balance"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
