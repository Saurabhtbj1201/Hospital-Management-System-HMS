import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, User, ArrowRight, BookOpen, Heart,
  Brain, Salad, Baby, Bone, Activity, Stethoscope,
} from 'lucide-react';
import { cn } from '../../lib/cn';

/* ── Category → color + icon mapping ── */
const CATEGORY_MAP = {
  'Heart Health': { icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  'Diabetes': { icon: Activity, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  'Mental Health': { icon: Brain, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  'Nutrition': { icon: Salad, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  "Women's Health": { icon: Stethoscope, color: 'bg-pink-50 text-pink-600 border-pink-100' },
  'Orthopedics': { icon: Bone, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  'Pediatrics': { icon: Baby, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  'Neurology': { icon: Brain, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
};

const GRADIENTS = [
  'from-primary-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
];

function getCategoryMeta(category) {
  return CATEGORY_MAP[category] || { icon: BookOpen, color: 'bg-gray-50 text-gray-600 border-gray-100' };
}

const itemVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function BlogCard({ article, index = 0, featured = false }) {
  const catMeta = getCategoryMeta(article.category);
  const CatIcon = catMeta.icon;
  const gradient = GRADIENTS[index % GRADIENTS.length];

  const formattedDate = article.date
    ? new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  /* ── Featured card (wide, horizontal) ── */
  if (featured) {
    return (
      <motion.div
        variants={itemVariant}
        className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all duration-300 overflow-hidden group"
      >
        <div className="grid md:grid-cols-2">
          {/* Image / gradient placeholder */}
          <div className={cn('relative bg-gradient-to-br flex items-center justify-center min-h-[240px]', gradient)}>
            {article.image ? (
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-white/80">
                <BookOpen size={56} className="mx-auto mb-2 opacity-40" />
                <span className="text-xs font-medium uppercase tracking-wide opacity-60">Featured Article</span>
              </div>
            )}
            <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Featured
            </span>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <span className={cn('inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-semibold border mb-3', catMeta.color)}>
              <CatIcon size={12} /> {article.category}
            </span>

            <h2 className="font-heading font-bold text-xl md:text-2xl text-dark-900 group-hover:text-primary-700 transition-colors leading-tight">
              <Link to={`/blog/${article.slug}`}>{article.title}</Link>
            </h2>

            <p className="text-sm text-dark-500 mt-3 leading-relaxed line-clamp-3">{article.excerpt}</p>

            <div className="flex items-center gap-4 mt-5 text-xs text-dark-400">
              <span className="flex items-center gap-1"><User size={12} /> {article.author}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {formattedDate}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
            </div>

            <Link
              to={`/blog/${article.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors mt-5 group/link"
            >
              Read Article
              <ArrowRight size={15} className="group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Standard card (vertical) ── */
  return (
    <motion.div
      variants={itemVariant}
      className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all duration-300 overflow-hidden group flex flex-col"
    >
      {/* Image / gradient placeholder */}
      <div className={cn('relative bg-gradient-to-br flex items-center justify-center h-44', gradient)}>
        {article.image ? (
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <CatIcon size={40} className="text-white/30" />
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <span className={cn('inline-flex items-center gap-1 w-fit px-2.5 py-0.5 rounded-full text-[11px] font-semibold border mb-2', catMeta.color)}>
          <CatIcon size={11} /> {article.category}
        </span>

        <h3 className="font-heading font-bold text-dark-900 group-hover:text-primary-700 transition-colors leading-snug line-clamp-2">
          <Link to={`/blog/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className="text-sm text-dark-500 mt-2 leading-relaxed line-clamp-2 flex-1">{article.excerpt}</p>

        <div className="flex items-center gap-3 mt-4 text-[11px] text-dark-400">
          <span className="flex items-center gap-1"><User size={11} /> {article.author}</span>
          <span className="flex items-center gap-1"><Calendar size={11} /> {formattedDate}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {article.readTime}</span>
        </div>

        <div className="mt-auto pt-4">
          <Link
            to={`/blog/${article.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors group/link"
          >
            Read More
            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
