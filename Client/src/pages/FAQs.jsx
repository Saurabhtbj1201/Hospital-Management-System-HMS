import PageHeader from '../components/ui/PageHeader';
import SectionWrapper from '../components/ui/SectionWrapper';
import FAQList from '../components/faq/FAQList';
import FAQContact from '../components/faq/FAQContact';

export default function FAQs() {
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to the most common questions about our hospital, services, appointments, billing, and more."
        breadcrumbs={[{ label: 'FAQs' }]}
      />

      {/* FAQ List with Search & Category Filter */}
      <SectionWrapper
        label="Quick Answers"
        title="How Can We Help You?"
        subtitle="Browse by category or search for a specific question."
        background="white"
      >
        <FAQList />
      </SectionWrapper>

      {/* Still have questions? CTA */}
      <SectionWrapper background="gray">
        <FAQContact />
      </SectionWrapper>
    </>
  );
}
