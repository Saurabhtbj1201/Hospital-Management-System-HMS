import { motion } from 'framer-motion';
import { CalendarCheck, Phone } from 'lucide-react';
import Button from '../ui/Button';
import { HOSPITAL } from '../../lib/constants';

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-cta-gradient">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative container-custom py-16 md:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-heading font-bold text-white leading-tight mb-4">
            Need a Doctor?{' '}
            <span className="text-primary-200">Book an Appointment Now</span>
          </h2>
          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Don't wait for your health concerns to grow. Our 500+ specialists are ready to provide
            the care you need. Book your appointment instantly — it only takes a minute.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              to="/book-appointment"
              variant="white"
              size="lg"
              iconLeft={CalendarCheck}
            >
              Book Appointment
            </Button>
            <Button
              href={`tel:${HOSPITAL.phone}`}
              variant="outline"
              size="lg"
              iconLeft={Phone}
              className="border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              Call: {HOSPITAL.phone}
            </Button>
          </div>

          <p className="mt-6 text-white/40 text-sm">
            Or visit us at {HOSPITAL.address.line1}, {HOSPITAL.address.city}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
