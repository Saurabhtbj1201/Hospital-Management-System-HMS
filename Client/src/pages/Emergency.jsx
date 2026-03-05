import PageHeader from '../components/ui/PageHeader';
import SectionWrapper from '../components/ui/SectionWrapper';
import EmergencyBanner from '../components/emergency/EmergencyBanner';
import EmergencyServices from '../components/emergency/EmergencyServices';
import EmergencyProcess from '../components/emergency/EmergencyProcess';
import FirstAidGuides from '../components/emergency/FirstAidGuides';

export default function Emergency() {
  return (
    <>
      <PageHeader
        title="Emergency Services"
        subtitle="Our 24/7 emergency department is equipped to handle all critical and life-threatening situations with speed and precision."
        breadcrumbs={[{ label: 'Emergency' }]}
        variant="emergency"
      />

      {/* Hero Banner with CTA */}
      <EmergencyBanner />

      {/* Emergency Services Grid */}
      <SectionWrapper
        label="Our Capabilities"
        title="Specialized Emergency Services"
        subtitle="We operate a Level-I trauma center with world-class specialists and equipment to handle every emergency."
        background="white"
      >
        <EmergencyServices />
      </SectionWrapper>

      {/* How it works — process */}
      <SectionWrapper
        label="How It Works"
        title="Emergency Response Process"
        subtitle="From your first call to receiving treatment — our streamlined emergency process ensures the fastest possible care delivery."
        background="gray"
      >
        <EmergencyProcess />
      </SectionWrapper>

      {/* First Aid Guides */}
      <SectionWrapper
        label="Be Prepared"
        title="First Aid Guides"
        subtitle="Know what to do in critical situations before professional help arrives. These step-by-step guides could save a life."
        background="white"
      >
        <FirstAidGuides />
      </SectionWrapper>
    </>
  );
}
