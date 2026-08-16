import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Trophy, Crown, Award, Medal, Sparkles, Filter } from 'lucide-react';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('average'); // 'average' | 'highest' | 'completed'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await API.get(`/leaderboard?${params.toString()}`);
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
          <Crown className="w-5 h-5 fill-amber-400" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-300/20 border border-slate-300/40 text-slate-300 flex items-center justify-center font-bold">
          <Medal className="w-5 h-5" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-600 flex items-center justify-center font-bold">
          <Award className="w-5 h-5" />
        </div>
      );
    }
    return (
      <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-extrabold flex items-center justify-center">
        #{rank}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Community Hall of Fame
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Leaderboard</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Compete with top performers and track academic rankings across subjects.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="glass-card p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSortBy('average')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                sortBy === 'average' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Avg Score
            </button>
            <button
              onClick={() => setSortBy('highest')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                sortBy === 'highest' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Score
            </button>
            <button
              onClick={() => setSortBy('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                sortBy === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quizzes Done
            </button>
          </div>

        </div>
      </div>

      {/* Leaderboard Table (Module 19 specification) */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-16 flex justify-center text-indigo-400">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No rankings available for this filter combination.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6 text-center">Completed Quizzes</th>
                  <th className="py-4 px-6 text-center">Highest Score</th>
                  <th className="py-4 px-6 text-right">Average Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {leaderboard.map((student) => (
                  <tr
                    key={student.studentId}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      student.rank === 1 ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center">{getRankBadge(student.rank)}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base">{student.studentName}</span>
                        <span className="text-xs text-slate-400">{student.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-slate-300">
                      {student.quizzesCompleted}
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-amber-400">
                      {student.highestScore}%
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="text-lg font-black text-indigo-400">
                        {student.averageScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
