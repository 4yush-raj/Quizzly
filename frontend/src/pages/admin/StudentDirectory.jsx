import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Users, Search, UserCheck, UserX, Trash2, Award, FileSpreadsheet } from 'lucide-react';

export const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await API.get(`/admin/students?${params.toString()}`);
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    try {
      await API.put(`/admin/users/${id}/status`, { status: newStatus });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student account? All attempt records will be removed.')) {
      return;
    }

    try {
      await API.delete(`/admin/users/${id}`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" /> User Governance
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Directory</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            View student profiles, academic attempt records, average scores, and manage account access status.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Student Roster Table (Module 6 specification) */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-16 flex justify-center text-indigo-400">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No students found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Registration Date</th>
                  <th className="py-4 px-6">Attempts</th>
                  <th className="py-4 px-6">Avg Score</th>
                  <th className="py-4 px-6">Top Score</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{st.name}</span>
                        <span className="text-xs text-slate-400">{st.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(st.registrationDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-300">
                      {st.quizzesAttempted}
                    </td>

                    <td className="py-4 px-6 font-bold text-indigo-400">
                      {st.averageScore}%
                    </td>

                    <td className="py-4 px-6 font-bold text-amber-400">
                      {st.highestScore}%
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          st.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(st.id, st.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            st.status === 'ACTIVE'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          {st.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(st.id)}
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

    </div>
  );
};
