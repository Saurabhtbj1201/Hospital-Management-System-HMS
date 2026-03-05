import PageHeader from '../components/ui/PageHeader';
import SectionWrapper from '../components/ui/SectionWrapper';
import { HOSPITAL } from '../lib/constants';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly, including your name, email address, phone number, medical history (when scheduling appointments), and any other information submitted through our website forms. We also automatically collect certain technical data such as IP address, browser type, and usage patterns through cookies and analytics tools.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your information is used to: process appointment bookings, communicate with you regarding your healthcare needs, improve our website and services, send relevant health tips and hospital updates (with your consent), comply with legal obligations, and ensure the security of our systems.`,
  },
  {
    title: '3. Data Security',
    content: `We implement industry-standard security measures including SSL encryption, secure servers, firewalls, and access controls to protect your personal and medical data. Access to patient information is restricted to authorized personnel only.`,
  },
  {
    title: '4. Medical Records Confidentiality',
    content: `All medical records are handled in strict compliance with applicable healthcare privacy regulations. Your medical data is stored securely and shared only with authorized medical professionals involved in your care, or as required by law.`,
  },
  {
    title: '5. Cookies & Tracking',
    content: `Our website uses cookies to enhance your experience, analyze traffic, and personalize content. You can manage cookie preferences through your browser settings. Disabling cookies may affect some website functionality.`,
  },
  {
    title: '6. Third-Party Services',
    content: `We may use third-party services for payment processing, analytics, and communication. These services have their own privacy policies and we encourage you to review them. We do not sell your personal data to third parties.`,
  },
  {
    title: '7. Your Rights',
    content: `You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time. To exercise these rights, contact us at ${HOSPITAL.email} or visit our front desk.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy periodically. Changes will be posted on this page with the updated date. Continued use of our website after changes constitutes acceptance of the revised policy.`,
  },
];

export default function Privacy() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        subtitle={`Last updated: January 1, 2026 — ${HOSPITAL.name}`}
        breadcrumbs={[{ label: 'Privacy Policy' }]}
      />

      <SectionWrapper background="white">
        <div className="max-w-3xl mx-auto">
          <p className="text-dark-600 leading-relaxed mb-8">
            At {HOSPITAL.name}, we are committed to protecting your privacy and safeguarding your personal and medical information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website and services.
          </p>

          <div className="space-y-8">
            {sections.map((s) => (
              <div key={s.title}>
                <h3 className="text-lg font-bold text-dark-900 mb-2">{s.title}</h3>
                <p className="text-dark-600 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-xl bg-primary-50 ring-1 ring-primary-200">
            <p className="text-sm text-dark-700">
              <strong>Questions?</strong> Contact our Data Protection Officer at{' '}
              <a href={`mailto:${HOSPITAL.email}`} className="text-primary-600 font-semibold hover:underline">
                {HOSPITAL.email}
              </a>{' '}
              or call{' '}
              <a href={`tel:${HOSPITAL.phone}`} className="text-primary-600 font-semibold hover:underline">
                {HOSPITAL.phone}
              </a>.
            </p>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
