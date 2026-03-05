import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Ambulance,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { HOSPITAL } from '../../lib/constants';
import { containerVariants, itemVariant } from '../ui/SectionWrapper';

const CONTACT_CARDS = [
  {
    icon: MapPin,
    title: 'Visit Us',
    lines: [HOSPITAL.address.line1, `${HOSPITAL.address.line2}, ${HOSPITAL.address.city}`, `${HOSPITAL.address.state} – ${HOSPITAL.address.zip}`],
    action: { label: 'Get Directions', href: HOSPITAL.address.mapUrl, external: true },
    color: 'primary',
  },
  {
    icon: Phone,
    title: 'Call Us',
    lines: [`General: ${HOSPITAL.phone}`, `Appointments: ${HOSPITAL.phone}`, `Emergency: ${HOSPITAL.emergencyDirect}`],
    action: { label: 'Call Now', href: `tel:${HOSPITAL.phone}` },
    color: 'green',
  },
  {
    icon: Mail,
    title: 'Email Us',
    lines: [`General: ${HOSPITAL.email}`, `Appointments: ${HOSPITAL.appointmentEmail}`],
    action: { label: 'Send Email', href: `mailto:${HOSPITAL.email}` },
    color: 'blue',
  },
  {
    icon: Ambulance,
    title: 'Emergency',
    lines: ['24/7 Emergency Services', `Ambulance: ${HOSPITAL.emergencyPhone}`, `Direct: ${HOSPITAL.emergencyDirect}`],
    action: { label: 'Call Emergency', href: `tel:${HOSPITAL.emergencyPhone}` },
    color: 'red',
  },
];

const colorMap = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'bg-primary-100 text-primary-600',
    ring: 'ring-primary-200',
    hover: 'hover:shadow-primary-100/40',
    action: 'text-primary-600 hover:text-primary-700',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    ring: 'ring-emerald-200',
    hover: 'hover:shadow-emerald-100/40',
    action: 'text-emerald-600 hover:text-emerald-700',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    ring: 'ring-blue-200',
    hover: 'hover:shadow-blue-100/40',
    action: 'text-blue-600 hover:text-blue-700',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    ring: 'ring-red-200',
    hover: 'hover:shadow-red-100/40',
    action: 'text-red-600 hover:text-red-700',
  },
};

const SOCIAL_LINKS = [
  { icon: Facebook, href: HOSPITAL.social.facebook, label: 'Facebook', color: 'hover:bg-blue-600' },
  { icon: Twitter, href: HOSPITAL.social.twitter, label: 'Twitter', color: 'hover:bg-sky-500' },
  { icon: Instagram, href: HOSPITAL.social.instagram, label: 'Instagram', color: 'hover:bg-pink-600' },
  { icon: Linkedin, href: HOSPITAL.social.linkedin, label: 'LinkedIn', color: 'hover:bg-blue-700' },
  { icon: Youtube, href: HOSPITAL.social.youtube, label: 'YouTube', color: 'hover:bg-red-600' },
];

export default function ContactInfo() {
  const hours = HOSPITAL.workingHours;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="space-y-10"
    >
      {/* Contact Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {CONTACT_CARDS.map((card) => {
          const clr = colorMap[card.color];
          return (
            <motion.div
              key={card.title}
              variants={itemVariant}
              className={`relative rounded-2xl p-6 ring-1 ${clr.ring} ${clr.bg} transition-shadow duration-300 hover:shadow-xl ${clr.hover}`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${clr.icon} mb-4`}>
                <card.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-dark-900 mb-2">{card.title}</h3>
              <div className="space-y-1 mb-4">
                {card.lines.map((line, i) => (
                  <p key={i} className="text-sm text-dark-600">{line}</p>
                ))}
              </div>
              {card.action && (
                <a
                  href={card.action.href}
                  target={card.action.external ? '_blank' : undefined}
                  rel={card.action.external ? 'noopener noreferrer' : undefined}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${clr.action} transition-colors`}
                >
                  {card.action.label}
                  <ExternalLink size={14} />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Working Hours */}
      <motion.div
        variants={itemVariant}
        className="rounded-2xl bg-white ring-1 ring-gray-200 p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-600">
            <Clock size={20} />
          </div>
          <h3 className="text-xl font-bold text-dark-900">Working Hours</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(hours).map(([key, val]) => (
            <div key={key} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${val.time === '24/7' ? 'bg-emerald-500' : 'bg-primary-500'}`} />
              <div>
                <p className="text-sm font-semibold text-dark-900 capitalize">{key}</p>
                <p className="text-xs text-dark-500">{val.days}</p>
                <p className="text-sm font-medium text-primary-600">{val.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div variants={itemVariant} className="text-center">
        <h3 className="text-lg font-bold text-dark-900 mb-4">Connect With Us</h3>
        <div className="flex items-center justify-center gap-3">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={`inline-flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 text-dark-500 transition-all duration-300 ${social.color} hover:text-white hover:scale-110`}
            >
              <social.icon size={18} />
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
