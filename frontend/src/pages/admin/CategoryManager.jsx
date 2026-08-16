import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FolderTree, Plus, Edit2, Trash2, CheckCircle, ShieldAlert, X } from 'lucide-react';

export const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingCategory) {
        await API.put(`/categories/${editingCategory.id}`, { name, description });
      } else {
        await API.post('/categories', { name, description });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated quizzes will be affected.')) {
      return;
    }

    try {
      await API.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete category.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <FolderTree className="w-3.5 h-3.5" /> Taxonomy Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Quiz Categories</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Create and organize subjects (e.g., HTML, CSS, JavaScript, React, Python, Database).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {/* Categories Grid (Module 8 specification) */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6">
        {loading ? (
          <div className="py-16 flex justify-center text-indigo-400">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No categories defined yet. Click <strong>Create Category</strong> to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{cat.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {cat.quizCount || 0} Quizzes
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-slate-800 space-y-6 relative shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. JavaScript"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of category topics..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
