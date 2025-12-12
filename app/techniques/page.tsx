'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X, BookOpen, Target, Shield, Zap, RotateCcw, Swords, Rocket, Award, ChevronDown, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { FadeIn, StaggerChildren, StaggerItem } from '../components/ScrollAnimations';
import {
  TECHNIQUES,
  CATEGORIES,
  DIFFICULTY_LABELS,
  POSITIONS,
  getTechniquesByCategory,
  searchTechniques,
  getStats,
  type Technique,
  type TechniqueCategory,
  type DifficultyLevel,
  type Position
} from '@/lib/techniques-data';

// Category icons mapping
const categoryIcons: Record<TechniqueCategory, React.ReactNode> = {
  'submission': <Target className="w-5 h-5" />,
  'position': <Award className="w-5 h-5" />,
  'guard': <Shield className="w-5 h-5" />,
  'guard-pass': <Zap className="w-5 h-5" />,
  'sweep': <RotateCcw className="w-5 h-5" />,
  'takedown': <Swords className="w-5 h-5" />,
  'escape': <Rocket className="w-5 h-5" />,
  'back-take': <ChevronRight className="w-5 h-5" />
};

// Difficulty colors
const difficultyColors: Record<DifficultyLevel, { bg: string; text: string; border: string }> = {
  'fundamental': { bg: 'bg-white', text: 'text-[#1b1b1b]', border: 'border-[#e2e2e2]' },
  'intermediate': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'advanced': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' }
};

// Category colors for cards
const categoryColors: Record<TechniqueCategory, string> = {
  'submission': 'from-red-500/20 to-red-600/5 border-red-500/20',
  'position': 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
  'guard': 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
  'guard-pass': 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20',
  'sweep': 'from-green-500/20 to-green-600/5 border-green-500/20',
  'takedown': 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
  'escape': 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
  'back-take': 'from-pink-500/20 to-pink-600/5 border-pink-500/20'
};

// Technique Card Component
function TechniqueCard({ technique, onClick }: { technique: Technique; onClick: () => void }) {
  const diffColors = difficultyColors[technique.difficulty];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`p-5 rounded-2xl bg-gradient-to-br ${categoryColors[technique.category]} border cursor-pointer transition-all hover:shadow-lg group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#b9b9b9]">{categoryIcons[technique.category]}</span>
          <span className="text-xs uppercase tracking-wider text-[#777777]">
            {CATEGORIES[technique.category].label}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${diffColors.bg} ${diffColors.text} ${diffColors.border}`}>
          {DIFFICULTY_LABELS[technique.difficulty].label}
        </span>
      </div>

      <h3 className="font-serif text-lg font-bold text-white mb-2 group-hover:text-white/90">
        {technique.name}
      </h3>

      {technique.aliases && technique.aliases.length > 0 && (
        <p className="text-xs text-[#777777] mb-2">
          Also: {technique.aliases.join(', ')}
        </p>
      )}

      <p className="text-sm text-[#b9b9b9] line-clamp-2 mb-3">
        {technique.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {technique.giLegal && (
          <span className="px-2 py-0.5 rounded bg-[#303030] text-[#b9b9b9] text-xs">
            Gi
          </span>
        )}
        {technique.noGiLegal && (
          <span className="px-2 py-0.5 rounded bg-[#303030] text-[#b9b9b9] text-xs">
            No-Gi
          </span>
        )}
        {technique.points !== undefined && technique.points > 0 && (
          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">
            {technique.points} pts
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Technique Detail Modal
function TechniqueModal({ technique, onClose }: { technique: Technique | null; onClose: () => void }) {
  if (!technique) return null;

  const diffColors = difficultyColors[technique.difficulty];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#1b1b1b] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 bg-gradient-to-br ${categoryColors[technique.category]} rounded-t-3xl`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/80">{categoryIcons[technique.category]}</span>
                  <span className="text-sm uppercase tracking-wider text-white/60">
                    {CATEGORIES[technique.category].label}
                  </span>
                  {technique.subcategory && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="text-sm text-white/60 capitalize">
                        {technique.subcategory.replace('-', ' ')}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">
                  {technique.name}
                </h2>
                {technique.aliases && technique.aliases.length > 0 && (
                  <p className="text-sm text-white/60 mt-1">
                    Also known as: {technique.aliases.join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${diffColors.bg} ${diffColors.text} ${diffColors.border}`}>
                {DIFFICULTY_LABELS[technique.difficulty].label} ({DIFFICULTY_LABELS[technique.difficulty].belts})
              </span>
              {technique.giLegal && (
                <span className="px-3 py-1 rounded-full bg-[#303030] text-white text-sm">
                  Gi Legal
                </span>
              )}
              {technique.noGiLegal && (
                <span className="px-3 py-1 rounded-full bg-[#303030] text-white text-sm">
                  No-Gi Legal
                </span>
              )}
              {technique.points !== undefined && technique.points > 0 && (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                  {technique.points} Points
                </span>
              )}
            </div>

            {/* Belt Restrictions Warning */}
            {technique.beltRestrictions && (
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">Competition Restriction</p>
                  <p className="text-sm text-amber-400/80">{technique.beltRestrictions}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-[#777777] mb-2">Description</h3>
              <p className="text-[#e2e2e2] leading-relaxed">{technique.description}</p>
            </div>

            {/* Key Points */}
            {technique.keyPoints && technique.keyPoints.length > 0 && (
              <div>
                <h3 className="text-sm uppercase tracking-wider text-[#777777] mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {technique.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#303030] flex items-center justify-center text-xs text-white font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-[#b9b9b9]">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Positions */}
            {(technique.startingPosition || technique.endingPosition) && (
              <div className="grid grid-cols-2 gap-4">
                {technique.startingPosition && (
                  <div className="p-4 bg-[#0a0a0a] rounded-xl">
                    <h3 className="text-xs uppercase tracking-wider text-[#777777] mb-1">Starting Position</h3>
                    <p className="text-white font-medium">{POSITIONS[technique.startingPosition]}</p>
                  </div>
                )}
                {technique.endingPosition && (
                  <div className="p-4 bg-[#0a0a0a] rounded-xl">
                    <h3 className="text-xs uppercase tracking-wider text-[#777777] mb-1">Ending Position</h3>
                    <p className="text-white font-medium">{POSITIONS[technique.endingPosition]}</p>
                  </div>
                )}
              </div>
            )}

            {/* Related Techniques */}
            {technique.relatedTechniques && technique.relatedTechniques.length > 0 && (
              <div>
                <h3 className="text-sm uppercase tracking-wider text-[#777777] mb-2">Related Techniques</h3>
                <div className="flex flex-wrap gap-2">
                  {technique.relatedTechniques.map((relId) => {
                    const relTech = TECHNIQUES.find(t => t.id === relId);
                    return relTech ? (
                      <span key={relId} className="px-3 py-1 bg-[#303030] rounded-full text-sm text-[#b9b9b9]">
                        {relTech.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function TechniquesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const stats = getStats();

  // Filter techniques
  const filteredTechniques = useMemo(() => {
    let results = TECHNIQUES;

    // Search filter
    if (searchQuery) {
      results = searchTechniques(searchQuery);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      results = results.filter(t => t.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      results = results.filter(t => t.difficulty === selectedDifficulty);
    }

    return results;
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Group by category for display
  const groupedTechniques = useMemo(() => {
    const groups: Record<TechniqueCategory, Technique[]> = {
      'submission': [],
      'position': [],
      'guard': [],
      'guard-pass': [],
      'sweep': [],
      'takedown': [],
      'escape': [],
      'back-take': []
    };

    filteredTechniques.forEach(t => {
      groups[t.category].push(t);
    });

    return groups;
  }, [filteredTechniques]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all';

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1b1b1b]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              Comprehensive Library
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              BJJ Technique Database
            </h1>
            <p className="text-lg md:text-xl text-[#b9b9b9] leading-relaxed">
              Explore our collection of {stats.total} techniques organized by category, difficulty level, and position.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
          >
            <div className="p-4 bg-[#1b1b1b] rounded-2xl border border-[#303030]">
              <p className="text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-[#777777]">Total Techniques</p>
            </div>
            <div className="p-4 bg-[#1b1b1b] rounded-2xl border border-[#303030]">
              <p className="text-3xl font-bold text-white">{stats.byDifficulty.fundamental || 0}</p>
              <p className="text-sm text-[#777777]">Fundamentals</p>
            </div>
            <div className="p-4 bg-[#1b1b1b] rounded-2xl border border-[#303030]">
              <p className="text-3xl font-bold text-white">{stats.byDifficulty.intermediate || 0}</p>
              <p className="text-sm text-[#777777]">Intermediate</p>
            </div>
            <div className="p-4 bg-[#1b1b1b] rounded-2xl border border-[#303030]">
              <p className="text-3xl font-bold text-white">{stats.byDifficulty.advanced || 0}</p>
              <p className="text-sm text-[#777777]">Advanced</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 relative z-10 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#303030]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#777777]" />
              <input
                type="text"
                placeholder="Search techniques..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1b1b1b] border border-[#303030] rounded-xl text-white placeholder-[#777777] focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-[#1b1b1b] border border-[#303030] rounded-xl text-white"
            >
              <Filter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </button>

            {/* Filters (Desktop) */}
            <div className="hidden md:flex gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TechniqueCategory | 'all')}
                className="px-4 py-3 bg-[#1b1b1b] border border-[#303030] rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
                className="px-4 py-3 bg-[#1b1b1b] border border-[#303030] rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
              >
                <option value="all">All Levels</option>
                {Object.entries(DIFFICULTY_LABELS).map(([key, diff]) => (
                  <option key={key} value={key}>{diff.label} ({diff.belts})</option>
                ))}
              </select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 text-[#777777] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as TechniqueCategory | 'all')}
                    className="w-full px-4 py-3 bg-[#1b1b1b] border border-[#303030] rounded-xl text-white focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>

                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
                    className="w-full px-4 py-3 bg-[#1b1b1b] border border-[#303030] rounded-xl text-white focus:outline-none"
                  >
                    <option value="all">All Levels</option>
                    {Object.entries(DIFFICULTY_LABELS).map(([key, diff]) => (
                      <option key={key} value={key}>{diff.label} ({diff.belts})</option>
                    ))}
                  </select>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#777777] hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-[#777777]">
              Showing {filteredTechniques.length} of {stats.total} techniques
            </p>
          </div>
        </div>
      </section>

      {/* Category Quick Nav */}
      <section className="py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-[#1b1b1b]'
                  : 'bg-[#1b1b1b] text-[#b9b9b9] hover:bg-[#303030]'
              }`}
            >
              All
            </button>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as TechniqueCategory)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-white text-[#1b1b1b]'
                    : 'bg-[#1b1b1b] text-[#b9b9b9] hover:bg-[#303030]'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Techniques Grid */}
      <section className="py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {filteredTechniques.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto text-[#303030] mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No techniques found</h3>
              <p className="text-[#777777]">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-white text-[#1b1b1b] rounded-full text-sm font-medium hover:bg-[#e2e2e2] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : selectedCategory === 'all' && !searchQuery ? (
            // Grouped view when showing all categories
            <div className="space-y-16">
              {Object.entries(groupedTechniques).map(([category, techniques]) => {
                if (techniques.length === 0) return null;
                const cat = CATEGORIES[category as TechniqueCategory];

                return (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">{cat.icon}</span>
                      <h2 className="font-serif text-2xl font-bold text-white">{cat.label}</h2>
                      <span className="px-3 py-1 bg-[#303030] rounded-full text-sm text-[#b9b9b9]">
                        {techniques.length}
                      </span>
                    </div>
                    <p className="text-[#777777] mb-6">{cat.description}</p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <AnimatePresence mode="popLayout">
                        {techniques.map((technique) => (
                          <TechniqueCard
                            key={technique.id}
                            technique={technique}
                            onClick={() => setSelectedTechnique(technique)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Flat grid when filtering
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTechniques.map((technique) => (
                  <TechniqueCard
                    key={technique.id}
                    technique={technique}
                    onClick={() => setSelectedTechnique(technique)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1b1b1b] relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Train?
            </h2>
            <p className="text-lg text-[#b9b9b9] mb-8">
              Join us at The Fort to learn these techniques from experienced instructors.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#e2e2e2] transition-all hover:scale-105"
            >
              Start Training
              <ChevronRight className="w-5 h-5" />
            </a>
          </FadeIn>
        </div>
      </section>

      <Footer />

      {/* Technique Detail Modal */}
      {selectedTechnique && (
        <TechniqueModal
          technique={selectedTechnique}
          onClose={() => setSelectedTechnique(null)}
        />
      )}
    </div>
  );
}
