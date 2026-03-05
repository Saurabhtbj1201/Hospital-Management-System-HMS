import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Phone,
  ShieldCheck,
  Award,
  Stethoscope,
  HeartPulse,
  Activity,
  Pill,
  Star,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { HOSPITAL } from '../../lib/constants';
import Button from '../ui/Button';

// Floating icons config
const floatingIcons = [
  { Icon: HeartPulse, top: '12%', left: '8%', delay: 0, size: 28 },
  { Icon: Stethoscope, top: '20%', right: '12%', delay: 0.5, size: 32 },
  { Icon: Activity, bottom: '25%', left: '5%', delay: 1, size: 26 },
  { Icon: Pill, top: '60%', right: '8%', delay: 1.5, size: 24 },
  { Icon: ShieldCheck, bottom: '15%', right: '20%', delay: 2, size: 22 },
  { Icon: Star, top: '35%', left: '15%', delay: 0.8, size: 20 },
];

// Trust badges
const badges = [
  { icon: Award, label: 'NABH Accredited' },
  { icon: CalendarCheck, label: '25+ Years' },
  { icon: Stethoscope, label: '500+ Doctors' },
  { icon: HeartPulse, label: '24/7 Emergency' },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-hero-gradient">
      {/* ─── Background Effects ─── */}
      <div className="absolute inset-0">
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating medical icons */}
        {floatingIcons.map(({ Icon, delay, size, ...pos }, i) => (
          <motion.div
            key={i}
            className="absolute text-white/[0.07] hidden lg:block"
            style={pos}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon size={size} />
          </motion.div>
        ))}
      </div>

      {/* ─── Content ─── */}
      <div className="relative container-custom py-20 md:py-28 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Trusted by 50,000+ Patients
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-hero font-heading font-bold text-white leading-[1.1] mb-6"
            >
              {HOSPITAL.tagline.split(',').length > 1 ? (
                <>
                  {HOSPITAL.tagline.split(',')[0]},
                  <br />
                  <span className="text-primary-200">{HOSPITAL.tagline.split(',')[1]}</span>
                </>
              ) : (
                <>
                  Your Health,
                  <br />
                  <span className="text-primary-200">Our Priority</span>
                </>
              )}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/75 leading-relaxed max-w-lg mb-8"
            >
              Experience world-class healthcare at {HOSPITAL.name}. Book appointments instantly with
              500+ expert doctors across 30+ specializations — all under one roof.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Button
                to="/book-appointment"
                variant="white"
                size="lg"
                iconLeft={CalendarCheck}
              >
                Book Appointment
              </Button>
              <Button
                href={`tel:${HOSPITAL.emergencyDirect}`}
                variant="outline"
                size="lg"
                iconLeft={Phone}
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Emergency: {HOSPITAL.emergencyPhone}
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-x-6 gap-y-3"
            >
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/60 text-sm">
                  <Icon size={16} className="text-primary-300" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10 shadow-2xl">
                <div className="text-center">
                  {/* Pulse ring */}
                  <div className="relative w-28 h-28 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="relative w-full h-full rounded-full bg-white/20 flex items-center justify-center">
                      <HeartPulse className="text-white" size={48} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-heading font-bold text-white mb-2">
                    World-Class Care
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-8">
                    Advanced medical technology combined with compassionate treatment by leading specialists.
                  </p>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: '500+', label: 'Doctors' },
                      { value: '30+', label: 'Departments' },
                      { value: '24/7', label: 'Emergency' },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="text-xl font-bold text-white">{s.value}</div>
                        <div className="text-xs text-white/50">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating mini card — top right */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-card p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark-900">NABH Accredited</p>
                  <p className="text-xs text-dark-500">Quality Assured</p>
                </div>
              </motion.div>

              {/* Floating mini card — bottom left */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-card p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Star size={20} className="text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark-900">4.9 / 5 Rating</p>
                  <p className="text-xs text-dark-500">50,000+ Reviews</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Bottom wave ─── */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto">
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </section>
  );
}
