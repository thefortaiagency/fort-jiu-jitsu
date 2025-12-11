'use client';

import { useState } from 'react';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Navigation />

      <main className="pt-32 pb-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
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
                  <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f9f9f9] dark:bg-[#1b1b1b] border border-[#e2e2e2] dark:border-[#303030] text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] mb-6">
                      Members Only
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                      Member Portal
                    </h1>
                    <p className="text-[#5e5e5e] dark:text-[#b9b9b9] text-lg">
                      Access your membership information and family account details
                    </p>
                  </div>
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

      <Footer />
    </div>
  );
}
