import { motion } from 'framer-motion';
import {
  Scale, HeartHandshake, ShieldCheck, Lock, UserCheck, HelpCircle,
  ClipboardList, Bell, MessageCircle, Accessibility,
} from 'lucide-react';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';
import { cn } from '../../lib/cn';

const RIGHTS = [
  { icon: HeartHandshake, title: 'Right to Respectful Care', text: 'Every patient has the right to considerate, respectful care regardless of age, gender, religion, disability, or economic status.' },
  { icon: ShieldCheck, title: 'Right to Information', text: 'Patients have the right to receive complete information about their diagnosis, treatment options, risks, and prognosis in understandable language.' },
  { icon: UserCheck, title: 'Right to Consent', text: 'No treatment or procedure shall be performed without the patient\'s informed consent, except in life-threatening emergencies.' },
  { icon: Lock, title: 'Right to Privacy', text: 'All medical records and personal information are kept strictly confidential in compliance with applicable data protection laws.' },
  { icon: HelpCircle, title: 'Right to Second Opinion', text: 'Patients may request a second opinion from another qualified specialist at any point during treatment.' },
  { icon: Scale, title: 'Right to Grievance Redressal', text: 'Patients can file complaints without fear of retaliation. All grievances are addressed within 48 hours by our patient relations team.' },
];

const RESPONSIBILITIES = [
  { icon: ClipboardList, title: 'Provide Accurate Information', text: 'Share complete and truthful medical history, current medications, allergies, and past treatments with your care team.' },
  { icon: Bell, title: 'Follow Treatment Plans', text: 'Adhere to prescribed medications, follow-up schedules, and lifestyle recommendations advised by your doctor.' },
  { icon: MessageCircle, title: 'Communicate Openly', text: 'Inform your healthcare team about any changes in your condition, concerns, or if you don\'t understand instructions.' },
  { icon: Accessibility, title: 'Respect Hospital Policies', text: 'Follow visiting hours, no-smoking rules, maintain silence in patient zones, and respect the rights of other patients and staff.' },
];

export default function PatientRights() {
  return (
    <SectionWrapper
      label="Your Rights Matter"
      title="Patient Rights & Responsibilities"
      subtitle="At Lifebridge Medical Center, we believe in transparency, dignity, and partnership in care. Know your rights and responsibilities as a patient."
    >
      <div className="space-y-12">
        {/* ── Rights ── */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Scale size={22} />
            </div>
            <h3 className="font-heading font-bold text-lg text-dark-900">Patient Rights</h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {RIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariant}
                  className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all duration-300 p-5 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-dark-900">{item.title}</h4>
                  <p className="text-xs text-dark-500 mt-1.5 leading-relaxed">{item.text}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ── Responsibilities ── */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-600 flex items-center justify-center">
              <ClipboardList size={22} />
            </div>
            <h3 className="font-heading font-bold text-lg text-dark-900">Patient Responsibilities</h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 gap-5"
          >
            {RESPONSIBILITIES.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariant}
                  className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-secondary-200 transition-all duration-300 p-5 group flex gap-4"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-dark-900">{item.title}</h4>
                    <p className="text-xs text-dark-500 mt-1.5 leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
