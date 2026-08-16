import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  CheckCircle,
  ShieldAlert,
  X,
  Sparkles
} from 'lucide-react';

export const QuestionBankManager = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Form Fields (Module 9 & 10 specification)
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(1);
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizAndQuestions();
  }, [quizId]);

  const fetchQuizAndQuestions = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/quizzes/${quizId}`);
      setQuiz(res.data);
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setMarks(1);
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('');
    setExplanation('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText);
    setMarks(q.marks || 1);

    const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    setOptionA(opts[0] || '');
    setOptionB(opts[1] || '');
    setOptionC(opts[2] || '');
    setOptionD(opts[3] || '');
    setCorrectAnswer(q.correctAnswer);
    setExplanation(q.explanation || '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const optionsList = [optionA, optionB, optionC, optionD].filter((o) => o.trim() !== '');

    if (optionsList.length < 2) {
      setError('Please provide at least 2 option choices.');
      return;
    }

    if (!correctAnswer) {
      setError('Please select which option is the correct answer.');
      return;
    }

    if (!optionsList.includes(correctAnswer)) {
      setError('Selected correct answer must match one of the options defined above.');
      return;
    }

    setSubmitting(true);

    const payload = {
      questionText,
      options: optionsList,
      correctAnswer,
      explanation,
      marks: parseInt(marks, 10)
    };

    try {
      if (editingQuestion) {
        await API.put(`/quizzes/questions/${editingQuestion.id}`, payload);
      } else {
        await API.post(`/quizzes/${quizId}/questions`, payload);
      }
      setShowModal(false);
      fetchQuizAndQuestions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await API.delete(`/quizzes/questions/${id}`);
      fetchQuizAndQuestions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete question.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <Link
        to="/admin/quizzes"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Quizzes List
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            {quiz?.categoryName} • Question Bank
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{quiz?.title}</h1>
          <p className="text-slate-400 text-xs">
            Manage test questions, multiple-choice options, correct key selections, and solution explanations.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Question
        </button>
      </div>

      {/* Question List */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
        {loading ? (
          <div className="py-16 flex justify-center text-indigo-400">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No questions created for this quiz yet. Click <strong>Add New Question</strong> to populate the bank.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">{q.questionText}</h3>
                        <span className="text-[11px] text-slate-400">{q.marks} Point(s)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(q)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-10">
                    {opts.map((opt, oIdx) => {
                      const isCorrect = q.correctAnswer === opt;

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Correct Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="ml-10 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300">
                      <strong className="text-indigo-300 block mb-0.5">Solution Explanation:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Add / Edit Question */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 border border-slate-800 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
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
                  Question Prompt Text
                </label>
                <textarea
                  rows="2"
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. What is the result of typeof NaN in JavaScript?"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Marks / Points
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              {/* Options Setup */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Options Choices & Select Correct Key
                </label>

                {[
                  { label: 'Option A', val: optionA, setVal: setOptionA },
                  { label: 'Option B', val: optionB, setVal: setOptionB },
                  { label: 'Option C', val: optionC, setVal: setOptionC },
                  { label: 'Option D', val: optionD, setVal: setOptionD }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctKey"
                      checked={correctAnswer === item.val && item.val.trim() !== ''}
                      onChange={() => setCorrectAnswer(item.val)}
                      disabled={!item.val.trim()}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder={`${item.label}`}
                      value={item.val}
                      onChange={(e) => {
                        item.setVal(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                ))}
                <span className="text-[11px] text-slate-400 block pt-1">
                  * Select the radio button next to the option that represents the correct answer.
                </span>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Solution Explanation
                </label>
                <textarea
                  rows="2"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Detailed breakdown shown to students upon test completion..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
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
                  {submitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
