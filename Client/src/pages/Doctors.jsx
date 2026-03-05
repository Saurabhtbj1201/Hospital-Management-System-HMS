import PageHeader from '../components/ui/PageHeader';
import DoctorsList from '../components/doctors/DoctorsList';

export default function Doctors() {
  return (
    <>
      <PageHeader
        title="Our Doctors"
        subtitle="Meet our team of 500+ highly qualified and experienced doctors across 30+ specializations, committed to providing world-class healthcare."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Our Doctors' },
        ]}
      />
      <DoctorsList />
    </>
  );
}
