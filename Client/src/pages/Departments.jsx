import PageHeader from '../components/ui/PageHeader';
import DepartmentsList from '../components/departments/DepartmentsList';

export default function Departments() {
  return (
    <>
      <PageHeader
        title="Our Departments"
        subtitle="Over 30 specialized departments with world-class infrastructure and experienced medical professionals dedicated to every aspect of your health."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Departments' },
        ]}
      />
      <DepartmentsList />
    </>
  );
}
