import PageHeader from '../components/ui/PageHeader';
import SiteBanner from '../components/announcements/SiteBanner';
import AnnouncementsList from '../components/announcements/AnnouncementsList';

export default function Announcements() {
  return (
    <>
      <PageHeader
        title="Announcements & Updates"
        subtitle="Important notices, policy changes, health camps, and the latest happenings at Lifebridge Medical Center."
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Announcements' }]}
      />
      {/* Embedded site banner */}
      <section className="container-custom max-w-5xl pt-8">
        <SiteBanner embedded />
      </section>
      <AnnouncementsList />
    </>
  );
}
