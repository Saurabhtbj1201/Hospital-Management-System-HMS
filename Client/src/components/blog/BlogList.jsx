import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText } from 'lucide-react';
import SectionWrapper, { containerVariants } from '../ui/SectionWrapper';
import BlogCard from './BlogCard';
import { BLOG_ARTICLES, BLOG_CATEGORIES } from '../../lib/constants';
import { cn } from '../../lib/cn';

export default function BlogList() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    let list = BLOG_ARTICLES;
    if (activeCategory !== 'All') {
      list = list.filter((a) => a.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, activeCategory]);

  const featuredArticle = useMemo(
    () => filtered.find((a) => a.featured),
    [filtered]
  );
  const regularArticles = useMemo(
    () => filtered.filter((a) => !a.featured),
    [filtered]
  );

  return (
    <SectionWrapper
      label="Health Blog"
      title="Latest Health Articles"
      subtitle="Stay informed with expert advice, health tips, and medical breakthroughs from our team of specialists."
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4 mb-8 -mt-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-dark-800 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
              aria-label="Clear"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
                activeCategory === cat
                  ? 'bg-primary-600 text-white border-primary-600 shadow-purple'
                  : 'bg-white text-dark-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Count ── */}
      <p className="text-sm text-dark-500 mb-6">
        Showing <span className="font-semibold text-primary-700">{filtered.length}</span> article{filtered.length !== 1 && 's'}
        {activeCategory !== 'All' && (
          <> in <span className="font-semibold text-primary-700">{activeCategory}</span></>
        )}
      </p>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={60} className="mx-auto text-dark-300 mb-4" />
          <h3 className="text-lg font-heading font-bold text-dark-700">No articles found</h3>
          <p className="text-sm text-dark-400 mt-1">Try a different search or category.</p>
          {(search || activeCategory !== 'All') && (
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Featured card */}
          {featuredArticle && <BlogCard article={featuredArticle} index={0} featured />}

          {/* Regular grid */}
          {regularArticles.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {regularArticles.map((article, i) => (
                  <BlogCard key={article.id} article={article} index={i + 1} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </SectionWrapper>
  );
}
