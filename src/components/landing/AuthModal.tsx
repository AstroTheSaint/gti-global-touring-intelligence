import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { cn } from '../../types';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({
  open,
  onClose,
  onSuccess,
  initialMode = 'signin',
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setIsSignUp(initialMode === 'signup');
    }
  }, [open, initialMode]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      resetForm();
      onSuccess();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      let errMsg = 'Authentication failed. Please check your inputs.';
      if (code === 'auth/invalid-credential') errMsg = 'Invalid email or password.';
      else if (code === 'auth/email-already-in-use') errMsg = 'This email is already registered. Please sign in.';
      else if (code === 'auth/weak-password') errMsg = 'Password must be at least 6 characters.';
      else if (code === 'auth/invalid-email') errMsg = 'Please enter a valid email address.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-[#12151C] border border-[#242A35] rounded-xl p-6 shadow-2xl z-10"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">
              {isSignUp ? 'Create your account' : 'Sign in to GTI'}
            </h2>
            <p className="text-xs text-[#94A3B8] mb-5">
              {isSignUp
                ? 'Start your free trial with verified touring intelligence.'
                : 'Access your dashboards, exports, and market reports.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@domain.com"
                  className="w-full bg-[#1C212B] border border-[#242A35] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-[#2E66FF]/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#1C212B] border border-[#242A35] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-[#2E66FF]/50"
                  required
                />
              </div>

              {error && <p className="text-rose-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer',
                  loading
                    ? 'bg-[#2E66FF]/50 text-white/70'
                    : 'bg-[#2E66FF] hover:bg-[#2558e0] text-white'
                )}
              >
                {loading ? 'Processing…' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="w-full text-xs text-[#2E66FF] hover:underline cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
