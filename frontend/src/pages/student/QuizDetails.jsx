import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Clock,
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Play,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const QuizDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const res = await API.get(`/quizzes/${id}`);
        setQuiz(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load quiz details.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center text-rose-500">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-card rounded-2xl p-8 border border-pink-200/80 space-y-4 shadow-sm">
          <p className="text-rose-600 font-bold text-sm">{error || 'Quiz not found.'}</p>
          <Link
            to="/student/quizzes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-100 text-pink-800 text-xs font-bold hover:bg-pink-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    navigate(`/student/quiz/${id}/take`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Back button */}
      <Link
        to="/student/quizzes"
        className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-rose-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Quiz Discovery
      </Link>

      {/* Main Details Card */}
      <div className="glass-card rounded-3xl p-8 border border-pink-200/80 space-y-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        {/* Quiz Title & Badges */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-pink-100 text-pink-800 border border-pink-300 uppercase tracking-wider">
              {quiz.categoryName}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-wider">
              {quiz.difficulty}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{quiz.title}</h1>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Description</h3>
          <p className="text-slate-700 text-base leading-relaxed bg-white/80 p-4 rounded-2xl border border-pink-200/80 font-medium">
            {quiz.description}
          </p>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">

          <div className="p-4 rounded-2xl bg-white/90 border border-pink-200/80 space-y-1 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-extrabold">
              <HelpCircle className="w-4 h-4" /> Questions
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{quiz.questionCount}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-pink-200/80 space-y-1 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-extrabold">
              <Clock className="w-4 h-4" /> Duration
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{quiz.durationMinutes} Mins</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-pink-200/80 space-y-1 shadow-xs">
            <div className="flex items-center gap-2 text-amber-600 text-xs font-extrabold">
              <Award className="w-4 h-4" /> Passing Score
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{quiz.passingPercentage}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-pink-200/80 space-y-1 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-extrabold">
              <RotateCcw className="w-4 h-4" /> Max Attempts
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{quiz.maxAttempts}</div>
          </div>

        </div>

        {/* Exam Instructions */}
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 space-y-2 font-medium">
          <div className="font-extrabold flex items-center gap-2 text-sm text-rose-800">
            <ShieldCheck className="w-4 h-4 text-rose-600" /> Assessment Guidelines
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
            <li>Timer will start automatically once you click <strong>Start Quiz</strong>.</li>
            <li>You can navigate back and forth between questions using the Question Palette.</li>
            <li>Score calculation happens securely on the backend upon submission.</li>
            <li>Ensure you submit before time expires; auto-submission will trigger when time reaches 00:00.</li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-pink-100">
          <div className="text-xs text-slate-600 font-bold">
            Attempts remaining for you: <strong className="text-slate-900">{quiz.userAttemptsLeft}</strong> of {quiz.maxAttempts}
          </div>

          <button
            onClick={handleStart}
            disabled={quiz.userAttemptsLeft <= 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-pink-rose hover:opacity-95 text-white font-extrabold text-sm shadow-md glow-pink flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{quiz.userAttemptsLeft <= 0 ? 'Maximum Attempts Reached' : 'Start Quiz'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
