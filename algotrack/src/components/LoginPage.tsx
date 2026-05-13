import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Mail, Lock, User, Eye, EyeOff, LogIn } from 'lucide-react';
import { loginAPI, registerAPI } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: { id: string; email: string; display_name: string | null; token: string; role?: string }, rememberMe: boolean) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginAPI(email, password);
        if (res.success && res.data) {
          onLoginSuccess({
            id: res.data.id,
            email: res.data.email,
            display_name: res.data.display_name,
            role: (res.data as any).role,
            token: res.data.token!,
          }, rememberMe);
        } else {
          setError(res.message || 'Login failed.');
        }
      } else {
        if (!displayName.trim()) {
          setError('Display name is required.');
          setLoading(false);
          return;
        }
        const res = await registerAPI(email, password, displayName);
        if (res.success && res.data) {
          onLoginSuccess({
            id: res.data.id,
            email: res.data.email,
            display_name: res.data.display_name,
            role: (res.data as any).role,
            token: res.data.token!,
          }, rememberMe);
        } else {
          setError(res.message || 'Registration failed.');
        }
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)' }}>
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(30,112,235,0.15) 0%, transparent 70%)', top: '-10%', right: '-5%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', bottom: '-15%', left: '-8%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glass Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl border border-white/[0.08]"
          style={{
            background: 'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #1E70EB 0%, #22D3EE 100%)',
                boxShadow: '0 8px 30px rgba(30,112,235,0.35)',
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tight">AlgoTrack</h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl text-sm font-medium text-red-300 border border-red-500/20"
              style={{ background: 'rgba(239,68,68,0.1)' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name (Register only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="display-name-input"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium text-white placeholder-slate-500 outline-none transition-all border border-white/[0.08] focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium text-white placeholder-slate-500 outline-none transition-all border border-white/[0.08] focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-medium text-white placeholder-slate-500 outline-none transition-all border border-white/[0.08] focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer group" htmlFor="remember-me">
                  <div className="relative">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all flex items-center justify-center group-hover:border-slate-400">
                      {rememberMe && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 text-white"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                    Remember me
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              id="submit-button"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide transition-all disabled:opacity-50 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #1E70EB 0%, #3B82F6 50%, #22D3EE 100%)',
                backgroundSize: '200% 200%',
                boxShadow: '0 4px 20px rgba(30,112,235,0.4)',
              }}
              whileHover={{ scale: 1.02, backgroundPosition: '100% 0%' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Bottom Glow */}
        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(30,112,235,0.15) 0%, transparent 70%)' }}
        />
      </motion.div>
    </div>
  );
}
