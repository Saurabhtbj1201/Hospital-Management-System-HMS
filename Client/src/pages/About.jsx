import PageHeader from '../components/ui/PageHeader';
import HospitalStory from '../components/about/HospitalStory';
import MissionVisionValues from '../components/about/MissionVisionValues';
import Achievements from '../components/about/Achievements';
import LeadershipTeam from '../components/about/LeadershipTeam';
import HospitalGallery from '../components/about/HospitalGallery';

export default function About() {
  return (
    <>
      <PageHeader
        title="About Us"
        subtitle="Discover the story, mission, and people behind Lifebridge Medical Center — a legacy of compassionate care and medical excellence."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'About Us' },
        ]}
      />
      <HospitalStory />
      <MissionVisionValues />
      <Achievements />
      <LeadershipTeam />
      <HospitalGallery />
    </>
  );
}
