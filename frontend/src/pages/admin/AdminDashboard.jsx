import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  Users,
  FileQuestion,
  FolderTree,
  FileSpreadsheet,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/analytics');
      const { stats, charts } = res.data;

      const totalAtt = stats.totalAttempts || 0;
      const overallPassRate = totalAtt > 0 ? Math.round((stats.passedAttempts / totalAtt) * 100) : 0;

      setAnalytics({
        metrics: {
          totalStudents: stats.totalStudents || 0,
          totalQuizzes: stats.totalQuizzes || 0,
          publishedQuizzes: stats.publishedQuizzes || 0,
          draftQuizzes: stats.draftQuizzes || 0,
          totalCategories: stats.totalCategories || 6,
          totalAttempts: totalAtt,
          overallPassRate
        },
        passCount: stats.passedAttempts || 0,
        failCount: stats.failedAttempts || 0,
        categoryDistribution: charts.categoryPopularity || []
      });
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex justify-center text-blue-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Chart Colors (Executive Palette: Sapphire, Indigo, Emerald, Ruby)
  const passFailData = [
    { name: 'Passed', value: analytics.passCount, color: '#10B981' },
    { name: 'Failed', value: analytics.failCount, color: '#EF4444' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold glow-amber">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Administrative Governance
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Control Center</h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-medium">
            Monitor real-time platform metrics, assessment success rates, student activity, and quiz management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/quizzes"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gradient-amber-yellow hover:opacity-95 text-white font-extrabold text-xs shadow-md glow-amber transition-all"
          >
            <Plus className="w-4 h-4" /> Create Quiz
          </Link>
          <Link
            to="/admin/categories"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-pink-50 text-slate-800 font-extrabold text-xs transition-all border border-pink-200 shadow-sm"
          >
            <FolderTree className="w-4 h-4 text-pink-600" /> Categories
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-pink-200/80 space-y-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-10 h-10 rounded-xl gradient-pink-rose flex items-center justify-center text-white shadow-md glow-pink">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{analytics.metrics.totalStudents}</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Active Registered Users
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-blue-200/80 space-y-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Quizzes</span>
            <div className="w-10 h-10 rounded-xl gradient-blue-purple flex items-center justify-center text-white shadow-md glow-blue">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{analytics.metrics.totalQuizzes}</div>
          <div className="text-[11px] text-blue-600 font-semibold">
            {analytics.metrics.publishedQuizzes} Published • {analytics.metrics.draftQuizzes} Drafts
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-amber-200/80 space-y-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Categories</span>
            <div className="w-10 h-10 rounded-xl gradient-amber-yellow flex items-center justify-center text-white shadow-md glow-amber">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{analytics.metrics.totalCategories}</div>
          <div className="text-[11px] text-amber-700 font-semibold">Curriculum Taxonomies</div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-rose-200/80 space-y-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Attempts</span>
            <div className="w-10 h-10 rounded-xl gradient-pink-rose flex items-center justify-center text-white shadow-md glow-pink">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{analytics.metrics.totalAttempts}</div>
          <div className="text-[11px] text-rose-600 font-bold">
            {analytics.metrics.overallPassRate}% Overall Pass Rate
          </div>
        </div>

      </div>

      {/* Analytics Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pass / Fail Outcome Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-pink-200/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Assessment Pass vs Fail Ratio</h2>
              <p className="text-xs text-slate-500 font-medium">Proportion of student attempts meeting passing criteria</p>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
              {analytics.metrics.overallPassRate}% Pass Rate
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            {analytics.metrics.totalAttempts === 0 ? (
              <p className="text-slate-500 text-xs font-medium">No attempt data available for visualization.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#F472B6',
                      borderRadius: '12px',
                      color: '#0F172A',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex justify-center gap-8 pt-2 border-t border-pink-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-700 font-bold">Passed ({analytics.passCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-xs text-slate-700 font-bold">Failed ({analytics.failCount})</span>
            </div>
          </div>
        </div>

        {/* Quiz Attempts per Category */}
        <div className="glass-card rounded-2xl p-6 border border-pink-200/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Popularity by Category</h2>
              <p className="text-xs text-slate-500 font-medium">Total student attempt volume per subject area</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            {analytics.categoryDistribution.length === 0 ? (
              <p className="text-slate-500 text-xs font-medium">No category data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FCE7F3" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#F472B6',
                      borderRadius: '12px',
                      color: '#0F172A',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="attempts" fill="#EC4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/quizzes"
          className="p-5 rounded-2xl glass-card border border-pink-200/80 hover:border-pink-400 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">Quiz Management</h3>
            <p className="text-xs text-slate-500 font-medium">Create, edit, or publish quizzes and questions.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/categories"
          className="p-5 rounded-2xl glass-card border border-pink-200/80 hover:border-pink-400 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">Taxonomy & Categories</h3>
            <p className="text-xs text-slate-500 font-medium">Organize subjects and curriculum taxonomies.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
        </Link>

        <Link
          to="/admin/students"
          className="p-5 rounded-2xl glass-card border border-pink-200/80 hover:border-pink-400 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">Student Roster</h3>
            <p className="text-xs text-slate-500 font-medium">Manage student accounts, performance, and status.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
        </Link>
      </div>

    </div>
  );
};
