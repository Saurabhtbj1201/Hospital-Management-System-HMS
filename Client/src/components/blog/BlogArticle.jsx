import { useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, User, ArrowLeft, BookOpen, Share2,
  Heart, Brain, Salad, Baby, Bone, Activity, Stethoscope,
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import SectionWrapper from '../ui/SectionWrapper';
import Button from '../ui/Button';
import BlogCard from './BlogCard';
import { BLOG_ARTICLES } from '../../lib/constants';
import { cn } from '../../lib/cn';

/* ── Category icon helper ── */
const CATEGORY_ICON = {
  'Heart Health': Heart,
  'Diabetes': Activity,
  'Mental Health': Brain,
  'Nutrition': Salad,
  "Women's Health": Stethoscope,
  'Orthopedics': Bone,
  'Pediatrics': Baby,
  'Neurology': Brain,
};

export default function BlogArticle() {
  const { slug } = useParams();

  const article = useMemo(
    () => BLOG_ARTICLES.find((a) => a.slug === slug),
    [slug]
  );

  const related = useMemo(() => {
    if (!article) return [];
    return BLOG_ARTICLES
      .filter((a) => a.id !== article.id && a.category === article.category)
      .slice(0, 3);
  }, [article]);

  // If no additional same-category articles, show recent different ones
  const suggestions = useMemo(() => {
    if (related.length >= 2) return related;
    if (!article) return [];
    const others = BLOG_ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);
    return others;
  }, [related, article]);

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const CatIcon = CATEGORY_ICON[article.category] || BookOpen;
  const formattedDate = article.date
    ? new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <>
      <PageHeader
        title={article.title}
        subtitle={article.excerpt}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Blog', path: '/blog' },
          { label: article.title },
        ]}
      />

      <SectionWrapper>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Main content ── */}
          <div className="lg:col-span-2">
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden"
            >
              {/* Meta bar */}
              <div className="p-6 pb-4 flex flex-wrap items-center gap-4 border-b border-gray-100">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
                  'bg-primary-50 text-primary-700 border-primary-100'
                )}>
                  <CatIcon size={12} /> {article.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-dark-500">
                  <User size={13} /> {article.author}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-dark-500">
                  <Calendar size={13} /> {formattedDate}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-dark-500">
                  <Clock size={13} /> {article.readTime}
                </span>
              </div>

              {/* Article body */}
              <div
                className="p-6 md:p-8 prose prose-sm max-w-none
                  prose-headings:font-heading prose-headings:text-dark-900 prose-headings:font-bold
                  prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
                  prose-p:text-dark-600 prose-p:leading-relaxed
                  prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-dark-800"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                >
                  <ArrowLeft size={15} /> Back to Blog
                </Link>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: article.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-500 hover:text-primary-600 transition-colors"
                >
                  <Share2 size={15} /> Share
                </button>
              </div>
            </motion.article>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Author card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-5"
            >
              <h4 className="font-heading font-bold text-sm text-dark-900 mb-3">About the Author</h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {article.author?.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-dark-900">{article.author}</p>
                  <p className="text-xs text-dark-400">Medical Expert — Lifebridge</p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-2xl p-6 text-white"
            >
              <h4 className="font-heading font-bold">Need a Consultation?</h4>
              <p className="text-white/80 text-sm mt-1.5 leading-relaxed">
                Speak with our specialists about your health concerns.
              </p>
              <Button
                as={Link}
                to="/book-appointment"
                variant="white"
                size="sm"
                className="mt-4"
              >
                Book Appointment
              </Button>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-5"
            >
              <h4 className="font-heading font-bold text-sm text-dark-900 mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Our Doctors', path: '/doctors' },
                  { label: 'Departments', path: '/departments' },
                  { label: 'Services', path: '/services' },
                  { label: 'Health Packages', path: '/patient-services' },
                ].map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-dark-600 hover:text-primary-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── Related Articles ── */}
      {suggestions.length > 0 && (
        <SectionWrapper
          label="Keep Reading"
          title="Related Articles"
          bg="light"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((a, i) => (
              <BlogCard key={a.id} article={a} index={i} />
            ))}
          </div>
        </SectionWrapper>
      )}
    </>
  );
}
