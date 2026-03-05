import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  Menu,
  X,
  ChevronDown,
  CalendarCheck,
  Clock,
  Siren,
  Heart,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { HOSPITAL, NAV_LINKS, NAV_MORE_LINKS } from '../../lib/constants';
import Button from '../ui/Button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsMoreOpen(false);
  }, [location.pathname]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close "More" dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const navLinkClass = ({ isActive }) =>
    cn(
      'relative px-1 py-2 text-sm font-medium transition-colors link-underline',
      isActive
        ? 'text-primary-600 after:!w-full'
        : isScrolled
        ? 'text-dark-700 hover:text-primary-600'
        : 'text-dark-700 hover:text-primary-600'
    );

  return (
    <>
      {/* ─── Emergency Top Bar ─── */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 text-white">
        <div className="container-custom flex items-center justify-between py-2 text-xs md:text-sm">
          <div className="flex items-center gap-4 md:gap-6">
            <a
              href={`tel:${HOSPITAL.emergencyDirect}`}
              className="flex items-center gap-1.5 hover:text-primary-200 transition-colors"
            >
              <Siren size={14} className="animate-pulse-soft" />
              <span className="font-semibold">Emergency: {HOSPITAL.emergencyPhone}</span>
            </a>
            <span className="hidden md:inline text-white/30">|</span>
            <a
              href={`tel:${HOSPITAL.phone}`}
              className="hidden md:flex items-center gap-1.5 hover:text-primary-200 transition-colors"
            >
              <Phone size={13} />
              <span>{HOSPITAL.phone}</span>
            </a>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <a
              href={`mailto:${HOSPITAL.email}`}
              className="hidden sm:flex items-center gap-1.5 hover:text-primary-200 transition-colors"
            >
              <Mail size={13} />
              <span>{HOSPITAL.email}</span>
            </a>
            <span className="hidden sm:inline text-white/30">|</span>
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              <span>{HOSPITAL.workingHours.opd.days}: {HOSPITAL.workingHours.opd.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Navbar ─── */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-soft'
            : 'bg-white'
        )}
      >
        <nav className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center shadow-purple transition-transform group-hover:scale-105">
                <Heart className="text-white fill-white/30" size={22} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-heading font-bold text-dark-900 leading-tight">
                  {HOSPITAL.shortName}
                </h1>
                <p className="text-[10px] text-dark-400 -mt-0.5 font-medium tracking-wide uppercase">
                  Medical Center
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.path} to={link.path} className={navLinkClass} end={link.path === '/'}>
                  {link.label}
                </NavLink>
              ))}

              {/* More Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={cn(
                    'flex items-center gap-1 px-1 py-2 text-sm font-medium transition-colors',
                    isMoreOpen ? 'text-primary-600' : 'text-dark-700 hover:text-primary-600'
                  )}
                >
                  More
                  <ChevronDown
                    size={14}
                    className={cn(
                      'transition-transform duration-200',
                      isMoreOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden py-2"
                    >
                      {NAV_MORE_LINKS.map((link) => (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          className={({ isActive }) =>
                            cn(
                              'block px-4 py-2.5 text-sm transition-colors',
                              isActive
                                ? 'bg-primary-50 text-primary-700 font-semibold'
                                : 'text-dark-600 hover:bg-gray-50 hover:text-primary-600'
                            )
                          }
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                to="/book-appointment"
                variant="primary"
                size="md"
                iconLeft={CalendarCheck}
              >
                Book Appointment
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-xl text-dark-600 hover:bg-gray-100 transition-colors"
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* ─── Mobile Menu ─── */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="container-custom py-4 space-y-1 max-h-[75vh] overflow-y-auto">
                {/* Main Links */}
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) =>
                      cn(
                        'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-dark-600 hover:bg-gray-50'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                {/* Divider */}
                <div className="border-t border-gray-100 my-2" />

                {/* More Links */}
                <p className="px-4 pt-2 pb-1 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                  More
                </p>
                {NAV_MORE_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      cn(
                        'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-dark-600 hover:bg-gray-50'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                {/* Divider */}
                <div className="border-t border-gray-100 my-2" />

                {/* CTA */}
                <div className="px-4 pt-2 pb-2">
                  <Button
                    to="/book-appointment"
                    variant="primary"
                    size="lg"
                    iconLeft={CalendarCheck}
                    className="w-full"
                  >
                    Book Appointment
                  </Button>
                </div>

                {/* Emergency */}
                <a
                  href={`tel:${HOSPITAL.emergencyDirect}`}
                  className="mx-4 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold text-sm"
                >
                  <Siren size={16} />
                  Emergency: {HOSPITAL.emergencyPhone}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
