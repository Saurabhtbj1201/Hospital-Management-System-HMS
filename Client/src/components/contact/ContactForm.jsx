import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
} from 'lucide-react';
import { supportAPI } from '../../services/api';
import { containerVariants, itemVariant } from '../ui/SectionWrapper';

const SUBJECTS = [
  'General Inquiry',
  'Appointment Query',
  'Billing & Insurance',
  'Medical Records',
  'Feedback / Suggestion',
  'Complaint',
  'Career Inquiry',
  'Partnership Inquiry',
  'Other',
];

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology',
  'Dermatology',
  'ENT',
  'Ophthalmology',
  'Oncology',
  'Radiology',
  'Emergency',
];

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  department: '',
  message: '',
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [apiError, setApiError] = useState('');
  const formRef = useRef(null);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (form.phone && !/^[+]?[\d\s-]{7,15}$/.test(form.phone)) errs.phone = 'Invalid phone number';
    if (!form.subject) errs.subject = 'Please select a subject';
    if (!form.message.trim()) errs.message = 'Message is required';
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    setApiError('');

    try {
      await supportAPI.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject,
        department: form.department || undefined,
        message: form.message.trim(),
      });
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setApiError(err?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const inputBase =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-11 text-sm text-dark-900 placeholder-dark-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';
  const selectBase =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-11 text-sm text-dark-900 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer';
  const errorText = 'mt-1 text-xs text-red-500 font-medium';

  /* ─── Success State ─── */
  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center p-10 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 min-h-[400px]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-dark-900 mb-2">Message Sent!</h3>
        <p className="text-dark-600 mb-6 max-w-md">
          Thank you for reaching out. Our team will review your message and get back to you within 24–48 hours.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="rounded-2xl bg-white ring-1 ring-gray-200 p-6 md:p-8 space-y-5"
      noValidate
    >
      <motion.div variants={itemVariant}>
        <h3 className="text-xl font-bold text-dark-900 mb-1">Send Us a Message</h3>
        <p className="text-sm text-dark-500">Fill out the form below and we'll get back to you shortly.</p>
      </motion.div>

      {/* API Error */}
      <AnimatePresence>
        {status === 'error' && apiError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-50 ring-1 ring-red-200"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{apiError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name & Email row */}
      <div className="grid sm:grid-cols-2 gap-5">
        <motion.div variants={itemVariant}>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`${inputBase} ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
          </div>
          {errors.name && <p className={errorText}>{errors.name}</p>}
        </motion.div>

        <motion.div variants={itemVariant}>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`${inputBase} ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
          </div>
          {errors.email && <p className={errorText}>{errors.email}</p>}
        </motion.div>
      </div>

      {/* Phone & Subject row */}
      <div className="grid sm:grid-cols-2 gap-5">
        <motion.div variants={itemVariant}>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91-9876543210"
              className={`${inputBase} ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
          </div>
          {errors.phone && <p className={errorText}>{errors.phone}</p>}
        </motion.div>

        <motion.div variants={itemVariant}>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">
            Subject <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className={`${selectBase} ${!form.subject ? 'text-dark-400' : ''} ${errors.subject ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            >
              <option value="">Select subject…</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {errors.subject && <p className={errorText}>{errors.subject}</p>}
        </motion.div>
      </div>

      {/* Department (optional) */}
      <motion.div variants={itemVariant}>
        <label className="block text-sm font-medium text-dark-700 mb-1.5">Department (optional)</label>
        <div className="relative">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className={`${selectBase} ${!form.department ? 'text-dark-400' : ''}`}
          >
            <option value="">Select department…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Message */}
      <motion.div variants={itemVariant}>
        <label className="block text-sm font-medium text-dark-700 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="How can we help you?"
          className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-dark-900 placeholder-dark-400 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none ${errors.message ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.message ? <p className={errorText}>{errors.message}</p> : <span />}
          <span className="text-xs text-dark-400">{form.message.length} / 2000</span>
        </div>
      </motion.div>

      {/* Submit */}
      <motion.div variants={itemVariant}>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Message
            </>
          )}
        </button>
      </motion.div>
    </motion.form>
  );
}
