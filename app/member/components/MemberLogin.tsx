'use client';

import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface MemberLoginProps {
  onLogin: (email: string) => void;
  isLoading: boolean;
}

export default function MemberLogin({ onLogin, isLoading }: MemberLoginProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    onLogin(email.toLowerCase().trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030] shadow-lg shadow-black/5"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#777777]" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full pl-12 pr-4 py-3.5 bg-[#f9f9f9] dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl text-[#1b1b1b] dark:text-white placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#1b1b1b] dark:focus:ring-white transition-all"
              disabled={isLoading}
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-6 py-4 rounded-full font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-all disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-[1.02] hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full"
              />
              Accessing Portal...
            </>
          ) : (
            <>
              Access Portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#e2e2e2] dark:border-[#303030]">
        <p className="text-sm text-[#777777] text-center">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#1b1b1b] dark:text-white font-medium hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
