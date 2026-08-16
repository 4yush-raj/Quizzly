import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { History, Calendar, Award, ArrowRight, ExternalLink } from 'lucide-react';

export const AttemptHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/attempts/history');
        setAttempts(res.data);
      } catch (err) {
        console.error('Failed to load attempt history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <History className="w-3.5 h-3.5" /> Activity Log
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Quiz Attempt History</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Review all your past quiz submissions, check your scores, and re-examine detailed answer keys.
        </p>
      </div>

      {/* History Table (Module 18 specification) */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center text-indigo-400">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm space-y-3">
            <p>You have not attempted any quizzes yet.</p>
            <Link
              to="/quizzes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Start Your First Quiz <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Quiz Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Score</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-900/40 transition-colors group">
                    <td className="py-4 px-6 font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {att.quizTitle}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-800 text-slate-300">
                        {att.categoryName}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {new Date(att.completedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-white text-base">
                      {att.score}%
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${att.status === 'PASSED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/attempt/${att.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
                      >
                        View Result <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
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
