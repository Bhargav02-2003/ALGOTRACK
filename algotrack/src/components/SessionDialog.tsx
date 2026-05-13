import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

interface SessionDialogProps {
  onContinue: () => void;
  onLogout: () => void;
}

const DIALOG_TIMEOUT_SECONDS = 3 * 60; // 3 minutes

export default function SessionDialog({ onContinue, onLogout }: SessionDialogProps) {
  const [remaining, setRemaining] = useState(DIALOG_TIMEOUT_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onLogout]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = (remaining / DIALOG_TIMEOUT_SECONDS) * 100;

  // Color transitions based on urgency
  const getTimerColor = () => {
    if (remaining > 120) return '#3B82F6'; // Blue > 2min
    if (remaining > 60) return '#F59E0B';  // Amber > 1min
    return '#EF4444';                       // Red < 1min
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 rounded-3xl p-8 border border-white/[0.08] overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Animated Ring Timer */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28">
              {/* Background Ring */}
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <motion.circle
                  cx="56" cy="56" r="48" fill="none"
                  stroke={getTimerColor()}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - progress / 100)}
                  transition={{ duration: 0.5 }}
                  style={{ filter: `drop-shadow(0 0 8px ${getTimerColor()}40)` }}
                />
              </svg>
              {/* Timer Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Clock className="w-4 h-4 mb-1" style={{ color: getTimerColor() }} />
                <span className="text-2xl font-black text-white tabular-nums">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white mb-2">Session Expiring</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Your session has been idle for 45 minutes.<br />
              Would you like to continue or log out?
            </p>
          </div>

          {/* Urgency Warning */}
          {remaining <= 60 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl text-center text-sm font-bold border"
              style={{
                background: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.2)',
                color: '#FCA5A5',
              }}
            >
              ⚠️ You will be logged out in {remaining} seconds
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onLogout}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-300 border border-white/[0.08] cursor-pointer transition-all hover:bg-white/[0.04] flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </motion.button>
            <motion.button
              onClick={onContinue}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1E70EB 0%, #3B82F6 50%, #22D3EE 100%)',
                boxShadow: '0 4px 20px rgba(30,112,235,0.4)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              Continue
            </motion.button>
          </div>

          {/* Progress Bar at Bottom */}
          <div className="mt-6 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: getTimerColor(), width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
