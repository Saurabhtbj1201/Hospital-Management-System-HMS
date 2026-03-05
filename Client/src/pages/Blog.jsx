import PageHeader from '../components/ui/PageHeader';
import BlogList from '../components/blog/BlogList';

export default function Blog() {
  return (
    <>
      <PageHeader
        title="Health Blog"
        subtitle="Expert health tips, medical insights, and wellness advice from our team of specialists."
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Blog' }]}
      />
      <BlogList />
    </>
  );
}
