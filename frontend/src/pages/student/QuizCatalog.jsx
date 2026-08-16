import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Search, Filter, Clock, HelpCircle, Award, Compass, Sparkles, ArrowRight } from 'lucide-react';

export const QuizCatalog = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [search, selectedCategory, selectedDifficulty, selectedDuration, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (selectedDuration) params.append('duration', selectedDuration);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await API.get(`/quizzes?${params.toString()}`);
      setQuizzes(res.data);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100 border border-pink-300 text-pink-800 text-xs font-bold glow-pink">
          <Compass className="w-3.5 h-3.5 text-rose-500" /> Discovery Hub
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available Assessments</h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-medium">
          Browse published quizzes across web development, programming languages, and databases.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-pink-200/80 space-y-4 shadow-sm">

        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quiz title or description..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-pink-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-pink-200 shadow-xs"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-pink-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-rose-400 shadow-xs"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.quizCount})
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-white border border-pink-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-rose-400 shadow-xs"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="HARD">Hard</option>
          </select>

          {/* Duration Filter */}
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="bg-white border border-pink-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-rose-400 shadow-xs"
          >
            <option value="">Any Duration</option>
            <option value="10">≤ 10 Minutes</option>
            <option value="20">≤ 20 Minutes</option>
            <option value="30">≤ 30 Minutes</option>
            <option value="60">≤ 60 Minutes</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-pink-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-rose-400 shadow-xs"
          >
            <option value="recent">Recently Added</option>
            <option value="popular">Most Popular</option>
            <option value="duration">Shortest Duration</option>
          </select>

        </div>
      </div>

      {/* Quiz Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12 text-indigo-400">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-pink-200/80 shadow-sm">
          <p className="text-slate-600 text-base font-medium">No quizzes match your filter criteria.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedDifficulty('');
              setSelectedDuration('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-pink-100 text-pink-800 text-xs font-bold hover:bg-pink-200 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="glass-card rounded-2xl border border-pink-200/80 overflow-hidden flex flex-col justify-between hover:border-pink-400 hover:shadow-xl transition-all group shadow-sm"
            >
              <div>
                {/* Thumbnail / Header */}
                <div className="relative h-40 bg-pink-50 overflow-hidden flex items-center justify-center">
                  {quiz.thumbnailUrl ? (
                    <img
                      src={quiz.thumbnailUrl}
                      alt={quiz.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-pink-200 via-rose-100 to-amber-100 flex items-center justify-center text-rose-800 font-extrabold text-xl">
                      {quiz.categoryName}
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white/90 text-rose-800 backdrop-blur-md border border-rose-200 shadow-xs">
                      {quiz.categoryName}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase backdrop-blur-md shadow-xs ${
                        quiz.difficulty === 'EASY'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : quiz.difficulty === 'HARD'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-medium">
                    {quiz.description}
                  </p>

                  <div className="pt-3 border-t border-pink-100 grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-bold">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>{quiz.questionCount || 0} Qs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>{quiz.durationMinutes} mins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{quiz.passingPercentage}% Pass</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <Link
                  to={`/student/quiz/${quiz.id}`}
                  className="w-full py-2.5 rounded-xl gradient-pink-rose hover:opacity-95 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md glow-pink transition-all"
                >
                  <span>View Details & Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
