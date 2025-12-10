'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemberPortal() {
  const [memberEmail, setMemberEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (email: string) => {
    setIsLoading(true);
    // Simulate a brief loading state
    setTimeout(() => {
      setMemberEmail(email);
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setMemberEmail(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Watermark Logo Background */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="relative w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] opacity-[0.06]">
          <Image
            src="/jiu-jitsu.png"
            alt=""
            fill
            className="object-contain invert"
            priority
          />
        </div>
      </div>

      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-gray-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative w-36 h-10 md:w-48 md:h-14">
                <Image
                  src="/jiu-jitsu.png"
                  alt="The Fort Jiu-Jitsu"
                  fill
                  className="object-contain object-left invert"
                  priority
                />
              </div>
              <div className="border-l border-gray-700 pl-4">
                <p className="text-gray-400 text-sm">Member Portal</p>
              </div>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Back to Site
            </Link>
          </div>
        </div>
      </header>

      <main className="py-8 md:py-12 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {!memberEmail ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-md mx-auto">
                  <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-center">
                    Member Portal
                  </h1>
                  <p className="text-gray-400 text-center mb-12">
                    Access your membership information and family account details
                  </p>
                  <MemberLogin onLogin={handleLogin} isLoading={isLoading} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MemberDashboard email={memberEmail} onLogout={handleLogout} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-lg border-t border-gray-800/50 py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} The Fort Jiu-Jitsu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
