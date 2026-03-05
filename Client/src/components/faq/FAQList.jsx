import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  HelpCircle,
  Stethoscope,
  CreditCard,
  FileText,
  Clock,
  Siren,
  Briefcase,
  X,
} from 'lucide-react';
import { FAQS, FAQ_CATEGORIES } from '../../lib/constants';
import Accordion from '../ui/Accordion';
import { containerVariants, itemVariant } from '../ui/SectionWrapper';

/* Icon + color map for each category */
const CATEGORY_META = {
  General: { icon: HelpCircle, color: 'bg-purple-100 text-purple-600 ring-purple-200', active: 'bg-purple-600 text-white ring-purple-600' },
  Appointments: { icon: Stethoscope, color: 'bg-blue-100 text-blue-600 ring-blue-200', active: 'bg-blue-600 text-white ring-blue-600' },
  'Billing & Insurance': { icon: CreditCard, color: 'bg-emerald-100 text-emerald-600 ring-emerald-200', active: 'bg-emerald-600 text-white ring-emerald-600' },
  'Medical Records': { icon: FileText, color: 'bg-amber-100 text-amber-600 ring-amber-200', active: 'bg-amber-600 text-white ring-amber-600' },
  'Visiting Hours': { icon: Clock, color: 'bg-sky-100 text-sky-600 ring-sky-200', active: 'bg-sky-600 text-white ring-sky-600' },
  Emergency: { icon: Siren, color: 'bg-red-100 text-red-600 ring-red-200', active: 'bg-red-600 text-white ring-red-600' },
  Services: { icon: Briefcase, color: 'bg-teal-100 text-teal-600 ring-teal-200', active: 'bg-teal-600 text-white ring-teal-600' },
};

export default function FAQList() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let items = FAQS;

    if (activeCategory !== 'All') {
      items = items.filter((f) => f.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    return items;
  }, [activeCategory, search]);

  /* Count per category for badges */
  const countMap = useMemo(() => {
    const map = { All: FAQS.length };
    FAQ_CATEGORIES.forEach((cat) => {
      map[cat] = FAQS.filter((f) => f.category === cat).length;
    });
    return map;
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="space-y-8"
    >
      {/* Search Bar */}
      <motion.div variants={itemVariant} className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search frequently asked questions…"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 pl-12 pr-10 text-sm text-dark-900 placeholder-dark-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-dark-400"
          >
            <X size={16} />
          </button>
        )}
      </motion.div>

      {/* Category Pills */}
      <motion.div
        variants={itemVariant}
        className="flex flex-wrap justify-center gap-2"
      >
        {/* All pill */}
        <button
          onClick={() => setActiveCategory('All')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ring-1 transition-all duration-200 ${
            activeCategory === 'All'
              ? 'bg-primary-600 text-white ring-primary-600 shadow-md shadow-primary-200'
              : 'bg-gray-100 text-dark-600 ring-gray-200 hover:bg-gray-200'
          }`}
        >
          All
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === 'All' ? 'bg-white/20' : 'bg-dark-200/60'}`}>
            {countMap.All}
          </span>
        </button>

        {FAQ_CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat] || {};
          const Icon = meta.icon || HelpCircle;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ring-1 transition-all duration-200 ${
                isActive
                  ? `${meta.active} shadow-md`
                  : `${meta.color} hover:opacity-80`
              }`}
            >
              <Icon size={14} />
              {cat}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-dark-200/40'}`}>
                {countMap[cat]}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Results info */}
      {search.trim() && (
        <motion.p
          variants={itemVariant}
          className="text-center text-sm text-dark-500"
        >
          {filtered.length === 0
            ? 'No questions found matching your search.'
            : `Showing ${filtered.length} result${filtered.length > 1 ? 's' : ''} for "${search}"`}
        </motion.p>
      )}

      {/* FAQ Accordion */}
      <motion.div variants={itemVariant}>
        {filtered.length > 0 ? (
          <Accordion items={filtered} allowMultiple />
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-dark-300" />
            </div>
            <h3 className="text-lg font-bold text-dark-700 mb-1">No FAQs Found</h3>
            <p className="text-sm text-dark-500 max-w-md mx-auto">
              Try adjusting your search or selecting a different category. You can also{' '}
              <a href="/contact" className="text-primary-600 font-semibold hover:underline">
                contact us
              </a>{' '}
              directly.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
