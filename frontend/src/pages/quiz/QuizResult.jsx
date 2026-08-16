import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Award,
  AlertCircle
} from 'lucide-react';

export const QuizResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/attempts/${id}`);
      setResult(res.data);
    } catch (err) {
      console.error('Failed to load quiz result:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !result) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex justify-center text-rose-500">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isPassed = result.status === 'PASSED';
  const formatTimeTaken = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Back link */}
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-rose-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Main Result Hero Card */}
      <div className="glass-card rounded-3xl p-8 border border-pink-200/80 text-center space-y-6 bg-white/95 shadow-sm relative">

        {/* Status Icon */}
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-md ${
            isPassed
              ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
              : 'bg-rose-100 border-rose-300 text-rose-700'
          }`}
        >
          {isPassed ? <Trophy className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
        </div>

        <div className="space-y-2">
          <span
            className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block ${
              isPassed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            Assessment {result.status}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{result.quizTitle}</h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            {isPassed
              ? 'Congratulations! You met the passing requirements for this assessment.'
              : 'Keep practicing. Review your incorrect responses below and try again.'}
          </p>
        </div>

        {/* Score Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-pink-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Score</span>
            <span className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
              {result.score}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Correct Keys</span>
            <span className="text-2xl font-black text-slate-900">
              {result.correctAnswers} / {result.totalQuestions}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Time Taken</span>
            <span className="text-2xl font-black text-slate-800">
              {formatTimeTaken(result.timeTakenSeconds)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Pass Threshold</span>
            <span className="text-2xl font-black text-amber-600">
              {result.passingPercentage}%
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            to={`/student/quiz/${result.quizId}`}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center gap-2 border border-slate-300"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" /> Retake Quiz
          </Link>
          <Link
            to="/student/quizzes"
            className="px-5 py-2.5 rounded-xl gradient-pink-rose text-white font-extrabold text-xs transition-all shadow-md glow-pink flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> Explore Other Quizzes
          </Link>
        </div>

      </div>

      {/* Itemized Answer Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-rose-500" />
          Detailed Question Breakdown & Solution Keys
        </h2>

        <div className="space-y-4">
          {result.breakdown?.map((item, idx) => {
            const isCorrect = item.isCorrect;

            return (
              <div
                key={item.questionId}
                className="glass-card rounded-2xl p-6 border border-pink-200/80 space-y-4 bg-white/95 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-pink-100 border border-pink-200 text-pink-900 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{item.questionText}</h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1.5 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                {/* Option Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-10">
                  {item.options.map((opt, oIdx) => {
                    const isSelected = item.userAnswer === opt;
                    const isKey = item.correctAnswer === opt;

                    let cardStyle = 'bg-slate-50 border-slate-200 text-slate-600 font-medium';
                    if (isKey) {
                      cardStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold';
                    } else if (isSelected && !isKey) {
                      cardStyle = 'bg-rose-50 border-rose-300 text-rose-900 font-bold';
                    }

                    return (
                      <div key={oIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${cardStyle}`}>
                        <span>{opt}</span>
                        <div className="flex items-center gap-1 text-[10px] font-black">
                          {isKey && <span className="text-emerald-700">✓ Correct Key</span>}
                          {isSelected && !isKey && <span className="text-rose-700">✗ Your Selection</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Solution Explanation */}
                {item.explanation && (
                  <div className="ml-10 p-4 rounded-xl bg-pink-50/80 border border-pink-200 text-xs text-slate-700 space-y-1 font-medium">
                    <strong className="text-pink-800 block font-extrabold">Solution Explanation:</strong>
                    <p className="leading-relaxed">{item.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
