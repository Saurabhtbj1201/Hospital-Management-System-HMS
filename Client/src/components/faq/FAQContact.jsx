import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { HOSPITAL } from '../../lib/constants';
import { containerVariants, itemVariant } from '../ui/SectionWrapper';

const HELP_CARDS = [
  {
    icon: Phone,
    title: 'Call Us',
    desc: 'Speak to our support team for immediate assistance.',
    action: { label: HOSPITAL.phone, href: `tel:${HOSPITAL.phone}` },
    color: 'bg-primary-100 text-primary-600',
  },
  {
    icon: Mail,
    title: 'Email Us',
    desc: 'Send your detailed query and get a response within 24 hours.',
    action: { label: HOSPITAL.email, href: `mailto:${HOSPITAL.email}` },
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: MessageCircle,
    title: 'Contact Form',
    desc: 'Fill out our contact form and our team will get back to you.',
    action: { label: 'Go to Contact Page', href: '/contact', isRoute: true },
    color: 'bg-emerald-100 text-emerald-600',
  },
];

export default function FAQContact() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Still have questions banner */}
      <motion.div
        variants={itemVariant}
        className="text-center mb-10"
      >
        <h3 className="text-2xl md:text-3xl font-heading font-bold text-dark-900 mb-3">
          Still Have Questions?
        </h3>
        <p className="text-dark-500 max-w-lg mx-auto">
          Can't find what you're looking for? Our support team is always ready to help.
        </p>
      </motion.div>

      {/* Help cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        {HELP_CARDS.map((card) => (
          <motion.div
            key={card.title}
            variants={itemVariant}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-2xl bg-white ring-1 ring-gray-200 p-6 text-center hover:shadow-lg transition-shadow duration-300"
          >
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${card.color} mb-4 mx-auto`}>
              <card.icon size={24} />
            </div>
            <h4 className="text-lg font-bold text-dark-900 mb-1">{card.title}</h4>
            <p className="text-sm text-dark-500 mb-4">{card.desc}</p>
            {card.action.isRoute ? (
              <Link
                to={card.action.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                {card.action.label}
                <ArrowRight size={14} />
              </Link>
            ) : (
              <a
                href={card.action.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                {card.action.label}
                <ArrowRight size={14} />
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
