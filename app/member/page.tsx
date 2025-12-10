'use client';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
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
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="pt-24 pb-16 min-h-screen">
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

      <Footer />
    </div>
  );
}
