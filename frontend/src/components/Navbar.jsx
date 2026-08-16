import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  BrainCircuit,
  LayoutDashboard,
  Compass,
  Trophy,
  History,
  FolderTree,
  FileQuestion,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-pink-rose flex items-center justify-center text-white shadow-lg glow-pink transition-transform group-hover:scale-105">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                Quizzly <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              </span>
              <span className="text-[10px] text-rose-600 font-extrabold -mt-1 tracking-wider uppercase">
                Assessment Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5">
              {user.role === 'ADMIN' ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/admin/dashboard') || isActive('/admin')
                        ? 'gradient-amber-yellow text-white shadow-md glow-amber'
                        : 'text-slate-700 hover:bg-amber-100/60 hover:text-amber-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Overview
                  </Link>

                  <Link
                    to="/admin/quizzes"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/admin/quizzes')
                        ? 'gradient-pink-rose text-white shadow-md glow-pink'
                        : 'text-slate-700 hover:bg-rose-100/60 hover:text-rose-900'
                    }`}
                  >
                    <FileQuestion className="w-4 h-4" />
                    Quizzes
                  </Link>

                  <Link
                    to="/admin/categories"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/admin/categories')
                        ? 'gradient-emerald-teal text-white shadow-md glow-emerald'
                        : 'text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900'
                    }`}
                  >
                    <FolderTree className="w-4 h-4" />
                    Categories
                  </Link>

                  <Link
                    to="/admin/students"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/admin/students')
                        ? 'gradient-blue-purple text-white shadow-md glow-blue'
                        : 'text-slate-700 hover:bg-blue-100/60 hover:text-blue-900'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Students
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/student/dashboard"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/student/dashboard') || isActive('/dashboard')
                        ? 'gradient-pink-rose text-white shadow-md glow-pink'
                        : 'text-slate-700 hover:bg-pink-100/60 hover:text-rose-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link
                    to="/student/quizzes"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/student/quizzes') || isActive('/quizzes')
                        ? 'gradient-blue-purple text-white shadow-md glow-blue'
                        : 'text-slate-700 hover:bg-blue-100/60 hover:text-blue-900'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    Explore Quizzes
                  </Link>

                  <Link
                    to="/student/history"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/student/history') || isActive('/history')
                        ? 'gradient-emerald-teal text-white shadow-md glow-emerald'
                        : 'text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    Attempts
                  </Link>
                </>
              )}

              <Link
                to="/student/leaderboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/student/leaderboard') || isActive('/leaderboard')
                    ? 'gradient-amber-yellow text-white shadow-md glow-amber'
                    : 'text-slate-700 hover:bg-amber-100/60 hover:text-amber-900'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Leaderboard
              </Link>
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-pink-200">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-extrabold text-slate-900">{user.name}</span>
                  <span
                    className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-pink-100 text-pink-800 border border-pink-300'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-100/70 border border-slate-200 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/student/login"
                  className="px-4 py-2 text-xs font-extrabold text-slate-700 hover:text-rose-600 bg-white border border-pink-200 hover:border-pink-300 rounded-xl transition-all shadow-sm"
                >
                  Student Login
                </Link>
                <Link
                  to="/admin/login"
                  className="px-4 py-2 text-xs font-extrabold rounded-xl gradient-amber-yellow hover:opacity-95 text-white shadow-md glow-amber transition-all"
                >
                  Admin Control
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {user && mobileMenuOpen && (
        <div className="md:hidden glass-card border-t border-slate-800 px-4 py-3 space-y-2">
          {user.role === 'ADMIN' ? (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/quizzes"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Manage Quizzes
              </Link>
              <Link
                to="/admin/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Manage Categories
              </Link>
              <Link
                to="/admin/students"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Student Directory
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                My Dashboard
              </Link>
              <Link
                to="/quizzes"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Explore Quizzes
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Attempt History
              </Link>
            </>
          )}
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Leaderboard
          </Link>
        </div>
      )}
    </nav>
  );
};
