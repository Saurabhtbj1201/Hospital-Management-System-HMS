import PageHeader from '../components/ui/PageHeader';
import SectionWrapper from '../components/ui/SectionWrapper';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';
import MapSection from '../components/contact/MapSection';

export default function Contact() {
  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="Have a question or need assistance? We're here to help — reach out to us anytime."
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      {/* Contact Info + Form — 2 column layout */}
      <SectionWrapper
        label="Get in Touch"
        title="We'd Love to Hear From You"
        subtitle="Whether you have a question about our services, need to schedule an appointment, or want to share feedback — our team is ready to assist."
        background="gray"
      >
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left — info cards, hours, social */}
          <ContactInfo />

          {/* Right — contact form */}
          <ContactForm />
        </div>
      </SectionWrapper>

      {/* Map Section */}
      <SectionWrapper
        label="Find Us"
        title="Our Location"
        subtitle="Located in the heart of Medical District, New Delhi — easily accessible by metro, bus, and road."
        background="white"
      >
        <MapSection />
      </SectionWrapper>
    </>
  );
}
