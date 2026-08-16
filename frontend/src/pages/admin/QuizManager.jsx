import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  FileQuestion,
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  Clock,
  Award,
  RotateCcw,
  CheckCircle,
  XCircle,
  Eye,
  ShieldAlert,
  X
} from 'lucide-react';

export const QuizManager = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Form Fields (Module 7 specification)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [passingPercentage, setPassingPercentage] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [status, setStatus] = useState('DRAFT');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchQuizzes();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !categoryId) {
        setCategoryId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/quizzes');
      setQuizzes(res.data);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingQuiz(null);
    setTitle('');
    setDescription('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setDifficulty('INTERMEDIATE');
    setDurationMinutes(20);
    setPassingPercentage(60);
    setMaxAttempts(3);
    setStatus('DRAFT');
    setThumbnailUrl('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (quiz) => {
    setEditingQuiz(quiz);
    setTitle(quiz.title);
    setDescription(quiz.description);
    setCategoryId(quiz.categoryId);
    setDifficulty(quiz.difficulty);
    setDurationMinutes(quiz.durationMinutes);
    setPassingPercentage(quiz.passingPercentage);
    setMaxAttempts(quiz.maxAttempts);
    setStatus(quiz.status);
    setThumbnailUrl(quiz.thumbnailUrl || '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      title,
      description,
      categoryId: parseInt(categoryId, 10),
      difficulty,
      durationMinutes: parseInt(durationMinutes, 10),
      passingPercentage: parseFloat(passingPercentage),
      maxAttempts: parseInt(maxAttempts, 10),
      status,
      thumbnailUrl
    };

    try {
      if (editingQuiz) {
        await API.put(`/quizzes/${editingQuiz.id}`, payload);
      } else {
        await API.post('/quizzes', payload);
      }
      setShowModal(false);
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All questions and student attempts will be deleted.')) {
      return;
    }

    try {
      await API.delete(`/quizzes/${id}`);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete quiz.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <FileQuestion className="w-3.5 h-3.5" /> Assessment Suite
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Quiz Management</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Create, edit, publish, or unpublish quizzes and manage question banks.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Quiz
        </button>
      </div>

      {/* Quiz Table (Module 7 specification) */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center text-indigo-400">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No quizzes created yet. Click <strong>Create New Quiz</strong> to start building assessments.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Quiz Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Difficulty</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Questions</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {quizzes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      {q.title}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-800 text-slate-300">
                        {q.categoryName}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300 font-medium">
                      {q.difficulty}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      {q.durationMinutes} Mins
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          q.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : q.status === 'DRAFT'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-indigo-400">
                      {q.questionCount || 0} Qs
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/quizzes/${q.id}/questions`}
                          title="Manage Questions"
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" /> Questions
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create / Edit Quiz */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 border border-slate-800 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingQuiz ? 'Edit Quiz Parameters' : 'Create New Quiz'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. JavaScript Fundamentals"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive description of topics assessed..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none"
                  >
                    <option value="EASY">Easy</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Pass Score (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={passingPercentage}
                    onChange={(e) => setPassingPercentage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold text-indigo-400"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="UNPUBLISHED">Unpublished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? 'Saving...' : 'Save Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
