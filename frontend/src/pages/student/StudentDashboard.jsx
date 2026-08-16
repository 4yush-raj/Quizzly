import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import {
  Trophy,
  CheckCircle2,
  BarChart3,
  Award,
  FileSpreadsheet,
  Compass,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, quizRes] = await Promise.all([
          API.get('/attempts/history'),
          API.get('/quizzes?sortBy=popular')
        ]);
        setAttempts(attRes.data);
        setQuizzes(quizRes.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Stats
  const totalAttempted = attempts.length;
  const passedCount = attempts.filter((a) => a.status === 'PASSED').length;
  const failedCount = attempts.filter((a) => a.status === 'FAILED').length;

  const sumScore = attempts.reduce((acc, a) => acc + a.score, 0);
  const avgScore = totalAttempted > 0 ? Math.round(sumScore / totalAttempted) : 0;
  const highestScore = totalAttempted > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex justify-center text-blue-400">
        <div className="w-7 h-7 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-pink-200/80 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-300/30 via-amber-200/30 to-rose-200/20 blur-3xl pointer-events-none rounded-full"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100 border border-pink-300 text-pink-800 text-xs font-bold glow-pink">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" /> Student Learning Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back, <span className="text-gradient-pink">{user?.name}</span>! 👋
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-medium">
              Track your test performance, review detailed itemized explanations, and challenge yourself with new quizzes.
            </p>
          </div>

          <Link
            to="/student/quizzes"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl gradient-pink-rose hover:opacity-95 text-white font-extrabold text-xs shadow-lg glow-pink transition-all shrink-0"
          >
            <Compass className="w-4 h-4" />
            Explore Quizzes Now
          </Link>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-pink-200/80 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-2xl gradient-pink-rose flex items-center justify-center text-white shadow-md glow-pink shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Attempted</span>
            <span className="text-2xl font-black text-slate-900">{totalAttempted}</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-emerald-200/80 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-2xl gradient-emerald-teal flex items-center justify-center text-white shadow-md glow-emerald shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Passed</span>
            <span className="text-2xl font-black text-emerald-600">{passedCount}</span>
            <span className="text-[10px] text-rose-500 font-bold ml-1">({failedCount} Failed)</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-blue-200/80 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-2xl gradient-blue-purple flex items-center justify-center text-white shadow-md glow-blue shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Average Score</span>
            <span className="text-2xl font-black text-blue-600">{avgScore}%</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-amber-200/80 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-2xl gradient-amber-yellow flex items-center justify-center text-white shadow-md glow-amber shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Highest Score</span>
            <span className="text-2xl font-black text-amber-600">{highestScore}%</span>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Attempts */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-pink-200/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              Recent Quiz Attempts
            </h2>
            {attempts.length > 0 && (
              <Link to="/student/history" className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-pink-200 rounded-xl bg-pink-50/50">
              <p className="text-slate-500 text-xs font-medium">You haven't attempted any quizzes yet.</p>
              <Link
                to="/student/quizzes"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-pink-rose text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
              >
                Browse Available Quizzes
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.slice(0, 5).map((att) => (
                <div
                  key={att.id}
                  className="p-4 rounded-xl bg-white border border-pink-100 flex items-center justify-between hover:border-pink-300 shadow-xs transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{att.quizTitle}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold border border-pink-200">
                        {att.categoryName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Completed on {new Date(att.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">{att.score}%</div>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          att.status === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {att.status}
                      </span>
                    </div>
                    <Link
                      to={`/student/attempt/${att.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-extrabold transition-all"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Quizzes Sidebar */}
        <div className="glass-card rounded-2xl p-6 border border-pink-200/80 space-y-4 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Popular Quizzes
          </h2>

          <div className="space-y-3">
            {quizzes.map((q) => (
              <div key={q.id} className="p-4 rounded-xl bg-white border border-pink-100 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                    {q.categoryName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {q.durationMinutes} mins
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{q.title}</h3>
                <Link
                  to={`/student/quiz/${q.id}`}
                  className="w-full mt-2 py-2 rounded-xl gradient-pink-rose hover:opacity-95 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  Start Quiz <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
