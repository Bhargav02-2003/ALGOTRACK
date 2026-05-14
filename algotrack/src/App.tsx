import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Trophy,
  Layout as LayoutIcon,
  Search,
  User as UserIcon,
  ChevronDown,
  Loader2,
  Trash2,
  LogOut,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LoginPage from './components/LoginPage';
import SessionDialog from './components/SessionDialog';
import AdminDashboard from './components/AdminDashboard';
import {
  getChaptersAPI,
  getProgressAPI,
  toggleProgressAPI,
  getProgressStatsAPI,
  updateUserAPI,
  type Chapter,
  type User,
} from './services/api';

// ── Session Timing Constants ──
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface AuthUser {
  id: string;
  email: string;
  display_name: string | null;
  token: string;
  role?: string;
}

export default function App() {
  // ── Auth State ──
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Session State ──
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── App Data State ──
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [completedProblems, setCompletedProblems] = useState<string[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  // ── Router ──
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // ── Profile Edit State ──
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Stats State ──
  const [stats, setStats] = useState<{
    totalCompleted: number;
    totalProblems: number;
    progressPercentage: number;
    byChapter: { chapter_id: string; chapter_title: string; completed: number; total: number }[];
    byDifficulty: { difficulty: string; completed: number; total: number }[];
  } | null>(null);

  // ── Session Timer Logic ──
  const clearSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }, []);

  const startSessionTimer = useCallback(() => {
    clearSessionTimer();
    sessionTimerRef.current = setTimeout(() => {
      setShowSessionDialog(true);
    }, SESSION_DURATION_MS);
  }, [clearSessionTimer]);

  const handleContinueSession = useCallback(() => {
    setShowSessionDialog(false);
    startSessionTimer();
  }, [startSessionTimer]);

  const handleLogout = useCallback(() => {
    clearSessionTimer();
    setShowSessionDialog(false);
    setUser(null);
    setIsAuthenticated(false);
    setChapters([]);
    setCompletedProblems([]);
    setStats(null);
    localStorage.removeItem('algotrack_token');
    localStorage.removeItem('algotrack_user');
    localStorage.removeItem('algotrack_session_start');
    sessionStorage.removeItem('algotrack_token');
    sessionStorage.removeItem('algotrack_user');
    sessionStorage.removeItem('algotrack_session_start');
  }, [clearSessionTimer]);

  // ── Check Saved Auth on Mount ──
  useEffect(() => {
    const savedToken = localStorage.getItem('algotrack_token') || sessionStorage.getItem('algotrack_token');
    const savedUser = localStorage.getItem('algotrack_user') || sessionStorage.getItem('algotrack_user');
    const sessionStart = localStorage.getItem('algotrack_session_start') || sessionStorage.getItem('algotrack_session_start');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as AuthUser;

        // Check if session has expired (30 min from session start)
        if (sessionStart) {
          const elapsed = Date.now() - parseInt(sessionStart, 10);
          if (elapsed >= SESSION_DURATION_MS + 3 * 60 * 1000) {
            // Session fully expired (30min + 3min grace)
            handleLogout();
            setAuthLoading(false);
            return;
          }
          if (elapsed >= SESSION_DURATION_MS) {
            // In grace period — show dialog immediately
            setUser(parsed);
            setIsAuthenticated(true);
            setShowSessionDialog(true);
            setAuthLoading(false);
            return;
          }
        }

        setUser(parsed);
        setIsAuthenticated(true);

        // Resume timer with remaining time
        const elapsed = sessionStart ? Date.now() - parseInt(sessionStart, 10) : 0;
        const remainingMs = SESSION_DURATION_MS - elapsed;
        if (remainingMs > 0) {
          sessionTimerRef.current = setTimeout(() => {
            setShowSessionDialog(true);
          }, remainingMs);
        }
      } catch {
        handleLogout();
      }
    }
    setAuthLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login Handler ──
  const handleLoginSuccess = useCallback((userData: AuthUser, rememberMe: boolean) => {
    setUser(userData);
    setIsAuthenticated(true);
    setEditName(userData.display_name || '');

    // Determine storage based on "Remember Me"
    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear old data from both to prevent conflicts
    localStorage.removeItem('algotrack_token');
    localStorage.removeItem('algotrack_user');
    localStorage.removeItem('algotrack_session_start');
    sessionStorage.removeItem('algotrack_token');
    sessionStorage.removeItem('algotrack_user');
    sessionStorage.removeItem('algotrack_session_start');

    // Store new user data
    storage.setItem('algotrack_token', userData.token);
    storage.setItem('algotrack_user', JSON.stringify(userData));
    storage.setItem('algotrack_session_start', Date.now().toString());

    // Start 30min session timer
    startSessionTimer();

    // Navigate to profile page after login
    navigate('/profile');
  }, [startSessionTimer, navigate]);

  // ── Fetch Data When Authenticated ──
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        // Fetch chapters
        const chaptersRes = await getChaptersAPI();
        if (chaptersRes.success && chaptersRes.data) {
          setChapters(chaptersRes.data);
          if (chaptersRes.data.length > 0 && expandedChapters.length === 0) {
            setExpandedChapters([chaptersRes.data[0].id]);
          }
        }

        // Fetch progress
        const progressRes = await getProgressAPI(user.id);
        if (progressRes.success && progressRes.data) {
          setCompletedProblems(progressRes.data);
        }

        // Fetch stats
        const statsRes = await getProgressStatsAPI(user.id);
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        setEditName(user.display_name || '');
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Toggle Problem ──
  const toggleProblem = async (problemId: string) => {
    if (!user) return;

    const isCurrentlyCompleted = completedProblems.includes(problemId);
    const willBeCompleted = !isCurrentlyCompleted;

    // Optimistic update
    setCompletedProblems((prev) =>
      willBeCompleted ? [...prev, problemId] : prev.filter((p) => p !== problemId)
    );

    try {
      await toggleProgressAPI(problemId, willBeCompleted);
      // Refresh stats
      const statsRes = await getProgressStatsAPI(user.id);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
    } catch {
      // Revert on error
      setCompletedProblems((prev) =>
        isCurrentlyCompleted ? [...prev, problemId] : prev.filter((p) => p !== problemId)
      );
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    );
  };

  // ── Save Profile ──
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await updateUserAPI(user.id, { display_name: editName });
      if (res.success && res.data) {
        const updatedUser = { ...user, display_name: res.data.display_name };
        setUser(updatedUser);
        
        if (localStorage.getItem('algotrack_user')) {
          localStorage.setItem('algotrack_user', JSON.stringify(updatedUser));
        } else if (sessionStorage.getItem('algotrack_user')) {
          sessionStorage.setItem('algotrack_user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.error('Save profile failed:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Computed Values ──
  const totalProblems = chapters.reduce((acc, ch) => acc + (ch.problems?.length || 0), 0);
  const completedCount = completedProblems.length;
  const progressPercentage = totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0;

  // ── Auth Loading ──
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  // ── Show Login Page ──
  if (!isAuthenticated || !user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // ── Data Loading ──
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block">
            <Loader2 className="w-8 h-8 text-[#1E70EB]" />
          </motion.div>
          <p className="text-slate-500 text-sm font-medium mt-4">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      {/* Session Timeout Dialog */}
      {showSessionDialog && (
        <SessionDialog onContinue={handleContinueSession} onLogout={handleLogout} />
      )}

      {/* Blue Header */}
      <header className="bg-[#1E70EB] py-3 px-6 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold tracking-wide">Dashboard</h1>

          <nav className="flex items-center gap-6">
            <Link
              to="/profile"
              className={`text-white text-sm font-medium hover:text-white/80 transition-colors ${currentPath === '/profile' ? 'border-b-2 border-white pb-1' : ''}`}
            >
              Profile
            </Link>
            {user?.role !== 'admin' && (
              <>
                <Link
                  to="/topics"
                  className={`text-white text-sm font-medium hover:text-white/80 transition-colors ${currentPath === '/topics' ? 'border-b-2 border-white pb-1' : ''}`}
                >
                  Topics
                </Link>
                <Link
                  to="/progress"
                  className={`text-white text-sm font-medium hover:text-white/80 transition-colors ${currentPath === '/progress' ? 'border-b-2 border-white pb-1' : ''}`}
                >
                  Progress
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`text-amber-300 text-sm font-bold hover:text-amber-200 transition-colors ${currentPath.startsWith('/admin') ? 'border-b-2 border-amber-300 pb-1' : ''}`}
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={() => { handleLogout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors cursor-pointer ml-4 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <Routes>
          <Route path="/profile" element={
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {/* Hero Section */}
              <div className="bg-gradient-to-br from-[#1E70EB] to-[#1E40AF] rounded-[2.5rem] p-12 text-white overflow-hidden relative shadow-2xl shadow-blue-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />

                <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-blue-100 font-bold tracking-widest uppercase text-xs">
                      Logged in as {user.display_name || user.email}
                    </span>
                  </div>
                  <h2 className="text-6xl font-black mb-6 leading-tight tracking-tight">
                    Master the Art of <span className="text-blue-300 underline decoration-blue-400/50 underline-offset-8">Problem Solving.</span>
                  </h2>
                  <p className="text-xl text-blue-50/90 leading-relaxed font-medium">
                    Track your journey through our curated 450+ DSA problems. Save your progress, access hand-picked tutorials, and get interview-ready.
                  </p>
                </div>
              </div>

              <div className="space-y-6 max-w-md px-4">
                <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Display Name</span>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E70EB] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Email</span>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="mt-1 block w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </label>
                  <motion.button
                    onClick={handleSaveProfile}
                    disabled={saving || editName === (user.display_name || '')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#1E70EB] hover:bg-[#1a63d1] transition-colors cursor-pointer disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <div className="p-4 bg-[#F0F9FF] border border-blue-100 rounded-xl">
                    <p className="text-[#1E70EB] text-sm font-medium">
                      Your progress is synced with the server and saved to your account.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          } />

          {user?.role !== 'admin' && (
            <Route path="/topics" element={
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">Study Plan</h3>
                  <p className="text-slate-500 font-medium">Curated collection of 450+ problems to master DSA.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for a problem..."
                    className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-[#1E70EB] outline-none shadow-sm transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-10">
                {chapters.map((chapter) => {
                  const chapterProblems = chapter.problems || [];
                  const filteredProblems = chapterProblems.filter((p) =>
                    p.title.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (filteredProblems.length === 0 && searchQuery) return null;

                  const completedInChapter = chapterProblems.filter((p) => completedProblems.includes(p.id)).length;
                  const isChapterDone = completedInChapter === chapterProblems.length && chapterProblems.length > 0;
                  const isExpanded = expandedChapters.includes(chapter.id);

                  return (
                    <motion.div key={chapter.id} layout className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
                      <div
                        onClick={() => toggleChapter(chapter.id)}
                        className="bg-[#22D3EE] p-3 px-5 flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <h4 className="text-white font-bold text-lg tracking-tight">{chapter.title}</h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isChapterDone ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {isChapterDone ? 'Done' : 'Pending'}
                          </span>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                          <ChevronDown className="text-white w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="overflow-x-auto bg-[#F8FAFC]">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-white border-b border-slate-100">
                                    <th className="px-8 py-4 text-sm font-bold text-slate-800 w-[40%]">Name</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-800 text-center">LeetCode Link</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-800 text-center">YouTube Link</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-800 text-center">Article Link</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-800 text-center">Level</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-800 text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {filteredProblems.map((problem) => {
                                    const isDone = completedProblems.includes(problem.id);
                                    return (
                                      <tr key={problem.id} className="bg-white hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5">
                                          <label className="flex items-center gap-4 cursor-pointer group">
                                            <input
                                              type="checkbox"
                                              checked={isDone}
                                              onChange={() => toggleProblem(problem.id)}
                                              className="w-4 h-4 rounded border-slate-300 text-[#1E70EB] focus:ring-[#1E70EB] cursor-pointer"
                                            />
                                            <span className={`text-sm font-bold transition-colors ${isDone ? 'text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                              {problem.title}
                                            </span>
                                          </label>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                          <a href={problem.practice_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#1E70EB] hover:underline">
                                            Practise
                                          </a>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                          <a href={problem.youtube_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#1E70EB] hover:underline">
                                            Watch
                                          </a>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                          <a href={problem.article_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#1E70EB] hover:underline">
                                            Read
                                          </a>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                          <span className="text-[11px] font-black tracking-widest text-slate-700">
                                            {problem.difficulty.toUpperCase()}
                                          </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                          <span className="text-sm font-bold text-slate-900">
                                            {isDone ? 'Done' : 'Pending'}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          } />
          )}

          {user?.role !== 'admin' && (
            <Route path="/progress" element={
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-extrabold text-slate-900">Your Progress</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#1E70EB] rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
                  <LayoutIcon className="w-12 h-12 mb-6 opacity-30" />
                  <span className="text-4xl font-black">{stats?.progressPercentage ?? progressPercentage}%</span>
                  <p className="text-blue-100 font-bold mt-2">Overall Completion</p>
                </div>
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
                  <CheckCircle2 className="w-12 h-12 mb-6 opacity-30" />
                  <span className="text-4xl font-black">{stats?.totalCompleted ?? completedCount}</span>
                  <p className="text-slate-400 font-bold mt-2">Problems Solved</p>
                </div>
                <div className="bg-emerald-500 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200">
                  <Trophy className="w-12 h-12 mb-6 opacity-30" />
                  <span className="text-4xl font-black">{(stats?.totalProblems ?? totalProblems) - (stats?.totalCompleted ?? completedCount)}</span>
                  <p className="text-emerald-100 font-bold mt-2">More to Master</p>
                </div>
              </div>

              {/* Difficulty Level Breakdown */}
              {stats?.byDifficulty && stats.byDifficulty.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
                  <h3 className="text-xl font-bold mb-8">Difficulty Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.byDifficulty.map((d) => {
                      const pct = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
                      const colorMap: Record<string, { bg: string; text: string; bar: string; shadow: string; icon: string }> = {
                        Easy: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', shadow: 'shadow-emerald-100', icon: '🟢' },
                        Medium: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500', shadow: 'shadow-amber-100', icon: '🟡' },
                        Hard: { bg: 'bg-rose-50', text: 'text-rose-700', bar: 'bg-rose-500', shadow: 'shadow-rose-100', icon: '🔴' },
                      };
                      const colors = colorMap[d.difficulty] || colorMap.Easy;
                      return (
                        <div key={d.difficulty} className={`${colors.bg} p-6 rounded-2xl border border-slate-100 shadow-sm ${colors.shadow} space-y-4`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{colors.icon}</span>
                              <h4 className={`font-black text-lg ${colors.text}`}>{d.difficulty}</h4>
                            </div>
                            <span className={`text-sm font-black ${colors.text}`}>{pct}%</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                            <span>Completed</span>
                            <span>{d.completed}/{d.total}</span>
                          </div>
                          <div className="h-2 w-full bg-white/80 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`h-full rounded-full ${colors.bar}`}
                            />
                          </div>
                          <p className="text-xs font-medium text-slate-500">
                            {d.total - d.completed} remaining
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {stats?.byChapter && (
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
                  <h3 className="text-xl font-bold mb-8">Chapter Mastery Breakdown</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {stats.byChapter.map((ch) => {
                      const totalPct = ch.total > 0 ? Math.round((ch.completed / ch.total) * 100) : 0;
                      return (
                        <div key={ch.chapter_id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-slate-800 text-lg">{ch.chapter_title}</h4>
                            <span className="text-sm font-black text-[#1E70EB]">{totalPct}% Complete</span>
                          </div>
                          
                          {/* Difficulty Breakdown for Chapter (Stacked vertically) */}
                          <div className="space-y-4 pt-2">
                            {/* Easy */}
                            {ch.easy_total > 0 && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                  <span>Easy</span>
                                  <span>{ch.easy_completed}/{ch.easy_total}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(ch.easy_completed / ch.easy_total) * 100}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full bg-[#00b8a3]"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Medium */}
                            {ch.medium_total > 0 && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                  <span>Medium</span>
                                  <span>{ch.medium_completed}/{ch.medium_total}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(ch.medium_completed / ch.medium_total) * 100}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full bg-[#ffb800]"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Hard */}
                            {ch.hard_total > 0 && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                  <span>Hard</span>
                                  <span>{ch.hard_completed}/{ch.hard_total}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(ch.hard_completed / ch.hard_total) * 100}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full bg-[#ef4444]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          } />
          )}

          {user?.role === 'admin' && (
            <Route path="/admin/*" element={
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AdminDashboard />
              </motion.div>
            } />
          )}

          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </main>

      <footer className="bg-slate-50 py-12 border-t border-slate-200 text-center">
        <p className="text-slate-500 text-sm font-medium">
          © 2026 Dashboard. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
