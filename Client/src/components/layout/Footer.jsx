import { Link } from 'react-router-dom';
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Siren,
} from 'lucide-react';
import { HOSPITAL, FOOTER_LINKS } from '../../lib/constants';
import { cn } from '../../lib/cn';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: HOSPITAL.social.facebook, label: 'Facebook' },
    { icon: Twitter, href: HOSPITAL.social.twitter, label: 'Twitter' },
    { icon: Instagram, href: HOSPITAL.social.instagram, label: 'Instagram' },
    { icon: Linkedin, href: HOSPITAL.social.linkedin, label: 'LinkedIn' },
    { icon: Youtube, href: HOSPITAL.social.youtube, label: 'YouTube' },
  ];

  return (
    <footer className="bg-dark-900 text-gray-300">
      {/* Emergency Strip */}
      <div className="bg-red-600">
        <div className="container-custom py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Siren size={18} className="animate-pulse-soft" />
            <span>24/7 Emergency Services Available</span>
          </div>
          <a
            href={`tel:${HOSPITAL.emergencyDirect}`}
            className="flex items-center gap-2 bg-white text-red-600 px-5 py-1.5 rounded-full font-bold text-sm hover:bg-red-50 transition-colors"
          >
            <Phone size={14} />
            Call Now: {HOSPITAL.emergencyPhone}
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* ─── Column 1: About ─── */}
          <div className="lg:col-span-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group mb-5">
              <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center shadow-purple">
                <Heart className="text-white fill-white/30" size={22} />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-white leading-tight">
                  {HOSPITAL.shortName}
                </h3>
                <p className="text-[10px] text-gray-500 -mt-0.5 font-medium tracking-wide uppercase">
                  Medical Center
                </p>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {HOSPITAL.name} is a leading multi-specialty hospital committed to providing
              world-class healthcare services with compassion, integrity, and innovation.
              Established in {HOSPITAL.founded}, we serve 50,000+ patients across 30+ departments.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    'bg-dark-700 text-gray-400 hover:bg-primary-600 hover:text-white',
                    'transition-all duration-300'
                  )}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ─── Column 2: Quick Links ─── */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-heading font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 text-sm hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight
                      size={12}
                      className="text-gray-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Column 3: Services ─── */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-heading font-semibold mb-5">Our Services</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-gray-400 text-sm hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight
                      size={12}
                      className="text-gray-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Column 4: Contact Info ─── */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-heading font-semibold mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={HOSPITAL.address.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 text-sm hover:text-primary-400 transition-colors group"
                >
                  <MapPin size={18} className="flex-shrink-0 mt-0.5 text-primary-500" />
                  <span>{HOSPITAL.address.full}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${HOSPITAL.phone}`}
                  className="flex items-center gap-3 text-gray-400 text-sm hover:text-primary-400 transition-colors"
                >
                  <Phone size={18} className="flex-shrink-0 text-primary-500" />
                  <span>{HOSPITAL.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${HOSPITAL.email}`}
                  className="flex items-center gap-3 text-gray-400 text-sm hover:text-primary-400 transition-colors"
                >
                  <Mail size={18} className="flex-shrink-0 text-primary-500" />
                  <span>{HOSPITAL.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <Clock size={18} className="flex-shrink-0 mt-0.5 text-primary-500" />
                <div>
                  <p>OPD: {HOSPITAL.workingHours.opd.days}, {HOSPITAL.workingHours.opd.time}</p>
                  <p>Emergency: {HOSPITAL.workingHours.emergency.time}</p>
                </div>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="text-white text-sm font-semibold mb-3">Stay Updated</h5>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={cn(
                    'flex-1 px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-xl text-sm text-white',
                    'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'transition-all duration-200'
                  )}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-700">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} {HOSPITAL.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            {FOOTER_LINKS.support.slice(-2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-500 hover:text-primary-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
