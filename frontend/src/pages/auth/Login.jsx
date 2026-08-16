import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BrainCircuit, Lock, Mail, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const Login = ({ portal }) => {
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdminPortal = portal === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedUser = await login(email, password);

      // Strict role check for separate portals
      if (isAdminPortal && loggedUser.role !== 'ADMIN') {
        logout();
        setError('Access Denied: Student accounts cannot log in through the Admin Portal. Please use the Student Portal.');
        return;
      }

      if (portal === 'student' && loggedUser.role === 'ADMIN') {
        logout();
        setError('Access Denied: Admin accounts cannot log in through the Student Portal. Please use the Admin Portal.');
        return;
      }

      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Demo fill buttons
  const fillAdmin = () => {
    setEmail('admin@quizzly.com');
    setPassword('admin123');
  };

  const fillStudent = () => {
    setEmail('student@quizzly.com');
    setPassword('student123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Soft Glow Orbs */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none ${
          isAdminPortal ? 'bg-gradient-to-r from-amber-200 to-pink-200' : 'bg-gradient-to-r from-pink-200 to-amber-200'
        }`}
      ></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Card */}
        <div className="glass-card rounded-3xl p-8 border border-pink-200/80 shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
                isAdminPortal
                  ? 'gradient-amber-yellow text-white glow-amber'
                  : 'gradient-pink-rose text-white glow-pink'
              }`}
            >
              <BrainCircuit className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isAdminPortal ? (
                <span className="text-gradient-amber">Admin Control Login</span>
              ) : portal === 'student' ? (
                <span className="text-gradient-pink">Student Portal Login</span>
              ) : (
                <span className="text-slate-900">Welcome Back to Quizzly</span>
              )}
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 font-medium">
              {isAdminPortal
                ? 'Sign in to access admin control center & quiz management'
                : 'Sign in to access your student assessment dashboard'}
            </p>
          </div>

          {/* Quick Demo Credentials */}
          <div className="mb-6 p-3.5 rounded-2xl bg-pink-50/80 border border-pink-200/80 text-xs space-y-2.5 shadow-inner">
            <div className="flex items-center gap-1.5 font-bold text-amber-700">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="uppercase tracking-wider text-[10px]">Instant Demo Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={fillAdmin}
                className="py-2 px-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200 transition-all font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Admin Login
              </button>
              <button
                type="button"
                onClick={fillStudent}
                className="py-2 px-3 rounded-xl bg-pink-100 border border-pink-300 text-pink-900 hover:bg-pink-200 transition-all font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Student Login
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 text-xs flex items-center gap-2.5 shadow-md">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdminPortal ? 'admin@quizzly.com' : 'student@quizzly.com'}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-pink-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-pink-200 text-xs font-medium transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/reset-password" className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-pink-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-pink-200 text-xs font-medium transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 mt-2 rounded-xl text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                isAdminPortal
                  ? 'gradient-amber-yellow hover:opacity-95 glow-amber'
                  : 'gradient-pink-rose hover:opacity-95 glow-pink'
              }`}
            >
              {submitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to {isAdminPortal ? 'Admin Portal' : 'Student Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-pink-100 text-center text-xs text-slate-600 space-y-2">
            <div>
              {isAdminPortal ? (
                <Link to="/student/login" className="text-rose-600 font-bold hover:text-rose-700 hover:underline">
                  ← Switch to Student Portal
                </Link>
              ) : (
                <Link to="/admin/login" className="text-amber-700 font-bold hover:text-amber-800 hover:underline">
                  Switch to Admin Control Portal →
                </Link>
              )}
            </div>
            <div>
              Need a student account?{' '}
              <Link to="/student/register" className="text-rose-600 font-extrabold hover:text-rose-700 hover:underline">
                Create Account Now
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
