import PageHeader from '../components/ui/PageHeader';
import PatientGuide from '../components/patient/PatientGuide';
import InsurancePartners from '../components/patient/InsurancePartners';
import VisitorInfo from '../components/patient/VisitorInfo';
import PatientRights from '../components/patient/PatientRights';

export default function PatientServices() {
  return (
    <>
      <PageHeader
        title="Patient Services"
        subtitle="Your comfort and care are our top priority. Find everything you need — from visitor information to insurance support."
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Patient Services' }]}
      />
      <PatientGuide />
      <InsurancePartners />
      <VisitorInfo />
      <PatientRights />
    </>
  );
}
