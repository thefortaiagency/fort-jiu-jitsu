'use client';

import { useState } from 'react';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/MemberDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f9f9] via-white to-[#f0f0f0] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#1b1b1b]" />

      {/* Faded logo watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="relative w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] opacity-[0.03] dark:opacity-[0.05]">
          <img
            src="/jiu-jitsu.png"
            alt=""
            className="w-full h-full object-contain dark:invert"
          />
        </div>
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#1b1b1b 1px, transparent 1px), linear-gradient(90deg, #1b1b1b 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <Navigation />

      <main className="pt-32 pb-24 min-h-screen relative z-10">
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

      {/* CTA Section */}
      <section className="py-20 bg-[#1b1b1b] dark:bg-[#0a0a0a] relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
            Questions About Your Membership?
          </h2>
          <p className="text-lg text-[#b9b9b9] mb-8">
            Contact us anytime for help with your account or membership details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:2604527615"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#e2e2e2] transition-all hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              (260) 452-7615
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
