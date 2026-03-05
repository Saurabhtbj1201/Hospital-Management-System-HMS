import PageHeader from '../components/ui/PageHeader';
import ServicesList from '../components/services/ServicesList';
import HealthPackages from '../components/services/HealthPackages';

export default function Services() {
  return (
    <>
      <PageHeader
        title="Services & Treatments"
        subtitle="From diagnostics to advanced surgical procedures — explore the full spectrum of healthcare services we provide."
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Services' }]}
      />
      <ServicesList />
      <HealthPackages />
    </>
  );
}
