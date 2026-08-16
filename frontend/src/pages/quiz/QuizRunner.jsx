import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  HelpCircle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const QuizRunner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: selectedAnswer }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Storage key for timer persistence
  const storageKey = `quizzly_timer_quiz_${id}`;

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/quizzes/${id}`);
      const quizData = res.data;
      setQuiz(quizData);
      setQuestions(quizData.questions || []);

      // Calculate or retrieve remaining time
      const totalSeconds = (quizData.durationMinutes || 15) * 60;
      const savedTime = localStorage.getItem(storageKey);

      if (savedTime && !isNaN(savedTime)) {
        setTimeLeftSeconds(parseInt(savedTime, 10));
      } else {
        setTimeLeftSeconds(totalSeconds);
        localStorage.setItem(storageKey, totalSeconds.toString());
      }
    } catch (err) {
      console.error('Failed to load quiz runner:', err);
      alert('Failed to load quiz. Returning to catalog.');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (loading || !quiz || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        const updated = prev - 1;
        localStorage.setItem(storageKey, updated.toString());
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quiz, timeLeftSeconds]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! Submitting your answers automatically.');
    submitAnswers();
  };

  const submitAnswers = async () => {
    setSubmitting(true);
    localStorage.removeItem(storageKey);

    const formattedAnswers = Object.entries(userAnswers).map(([qId, ans]) => ({
      questionId: parseInt(qId, 10),
      selectedAnswer: ans
    }));

    const totalSecondsAllocated = (quiz.durationMinutes || 15) * 60;
    const timeTaken = Math.max(1, totalSecondsAllocated - timeLeftSeconds);

    try {
      const res = await API.post('/attempts/submit', {
        quizId: parseInt(id, 10),
        userAnswers: formattedAnswers,
        timeTakenSeconds: timeTaken
      });

      navigate(`/student/attempt/${res.data.attemptId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit quiz attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !quiz) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex justify-center text-rose-500">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;
  const isTimeCritical = timeLeftSeconds < 180; // less than 3 mins left

  const optionsList = currentQ
    ? typeof currentQ.options === 'string'
      ? JSON.parse(currentQ.options)
      : currentQ.options
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Top Runner Header */}
      <div className="glass-card rounded-2xl p-5 border border-pink-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-20 z-40 bg-white/95 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">
            {quiz.categoryName} • Assessment Runner
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{quiz.title}</h1>
        </div>

        {/* Live Timer & Submit Trigger */}
        <div className="flex items-center gap-4">
          <div
            className={`px-4 py-2 rounded-xl font-mono text-sm font-black flex items-center gap-2 border ${
              isTimeCritical
                ? 'bg-rose-100 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-pink-50 border-pink-200 text-pink-900'
            }`}
          >
            <Clock className="w-4 h-4 text-rose-500" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2 rounded-xl gradient-pink-rose hover:opacity-95 text-white font-extrabold text-xs shadow-md glow-pink flex items-center gap-1.5 transition-all"
          >
            <Send className="w-4 h-4" />
            Submit Quiz
          </button>
        </div>
      </div>

      {/* Main Runner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Question Area (3 cols) */}
        <div className="lg:col-span-3 space-y-6">

          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-pink-200/80 space-y-6 bg-white/95 shadow-sm">

            {/* Header / Question Index */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-4">
              <span className="text-xs font-bold text-slate-500">
                Question <strong className="text-slate-900 text-base font-extrabold">{currentIdx + 1}</strong> of {totalQuestions}
              </span>
              <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200 text-[11px] font-extrabold">
                {currentQ?.marks || 1} Point(s)
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
              {currentQ?.questionText}
            </h2>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {optionsList.map((optionStr, oIdx) => {
                const isSelected = userAnswers[currentQ.id] === optionStr;

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, optionStr)}
                    className={`w-full p-4 rounded-2xl text-left border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs'
                        : 'bg-white border-pink-200/80 text-slate-700 hover:border-pink-300 hover:bg-pink-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center border ${
                          isSelected
                            ? 'gradient-pink-rose text-white border-rose-400'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="font-semibold">{optionStr}</span>
                    </div>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-pink-100">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              {currentIdx < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-5 py-2 rounded-xl gradient-pink-rose text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md glow-pink transition-all"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 rounded-xl gradient-pink-rose text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md glow-pink"
                >
                  Review & Submit
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Question Palette Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 border border-pink-200/80 space-y-4 bg-white/95 shadow-sm">

            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Question Palette</h3>
              <span className="text-[11px] font-extrabold text-rose-600">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>

            {/* Grid Palette */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id];
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all border flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-white gradient-pink-rose text-white border-rose-400'
                        : isAnswered
                          ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-pink-100 space-y-2 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-100 border border-rose-300"></span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-50 border border-slate-200"></span>
                <span>Unanswered</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-pink-200 space-y-5 text-center shadow-2xl relative bg-white">

            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">Ready to Submit Quiz?</h3>
              <p className="text-xs text-slate-600 font-medium">
                You have answered <strong className="text-slate-900">{answeredCount}</strong> out of <strong className="text-slate-900">{totalQuestions}</strong> questions.
              </p>
            </div>

            {answeredCount < totalQuestions && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left font-medium">
                ⚠️ Warning: You have <strong>{totalQuestions - answeredCount} unanswered questions</strong>. They will be marked as incorrect upon submission.
              </div>
            )}

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Continue Quiz
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={submitAnswers}
                className="px-5 py-2 rounded-xl gradient-pink-rose text-white text-xs font-extrabold hover:opacity-95 shadow-md glow-pink transition-all"
              >
                {submitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
