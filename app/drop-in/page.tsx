'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  UserCheck,
  UserPlus,
  ArrowRight,
  CreditCard,
  FileSignature,
  CheckCircle,
  Phone,
  Clock,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

type VisitorType = 'returning' | 'new' | null;

export default function DropInPage() {
  const [visitorType, setVisitorType] = useState<VisitorType>(null);
  const [dropInForm, setDropInForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDropInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropInForm.firstName || !dropInForm.lastName || !dropInForm.email) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/drop-in/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dropInForm),
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Failed to process drop-in. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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

      <main className="pt-32 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-sm font-medium text-green-700 dark:text-green-400 mb-6">
              <DollarSign className="w-4 h-4" />
              $20 Single Class
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1b1b1b] dark:text-white mb-4">
              Drop-in Training
            </h1>
            <p className="text-[#5e5e5e] dark:text-[#b9b9b9] text-lg max-w-2xl mx-auto">
              Try a class at The Fort! Whether you're visiting from another gym or want to experience
              what we offer, we welcome all skill levels.
            </p>
          </div>

          {/* Class Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030] p-6 text-center">
              <Calendar className="w-8 h-8 text-[#5e5e5e] dark:text-[#b9b9b9] mx-auto mb-3" />
              <p className="font-medium text-[#1b1b1b] dark:text-white">Tue & Wed</p>
              <p className="text-sm text-[#777777]">Evening Classes</p>
            </div>
            <div className="bg-white dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030] p-6 text-center">
              <Clock className="w-8 h-8 text-[#5e5e5e] dark:text-[#b9b9b9] mx-auto mb-3" />
              <p className="font-medium text-[#1b1b1b] dark:text-white">Kids: 5:30-6:30pm</p>
              <p className="text-sm text-[#777777]">Adults: 6:30-8:00pm</p>
            </div>
            <div className="bg-white dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030] p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <p className="font-medium text-[#1b1b1b] dark:text-white">$20 / class</p>
              <p className="text-sm text-[#777777]">Pay online or in person</p>
            </div>
          </div>

          {/* Visitor Type Selection */}
          <AnimatePresence mode="wait">
            {!visitorType && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-center text-xl font-medium text-[#1b1b1b] dark:text-white mb-6">
                  Have you trained at The Fort before?
                </h2>
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {/* Returning Visitor */}
                  <motion.button
                    onClick={() => setVisitorType('returning')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group p-8 bg-white dark:bg-[#1b1b1b] rounded-3xl border-2 border-[#e2e2e2] dark:border-[#303030] hover:border-green-500 dark:hover:border-green-500 transition-all text-left"
                  >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2">
                      Yes, I've Been Here
                    </h3>
                    <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-4">
                      I've trained at The Fort before and already have a waiver on file.
                    </p>
                    <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-medium group-hover:gap-3 transition-all">
                      Quick Drop-in <ArrowRight className="w-4 h-4" />
                    </span>
                  </motion.button>

                  {/* New Visitor */}
                  <motion.button
                    onClick={() => setVisitorType('new')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group p-8 bg-white dark:bg-[#1b1b1b] rounded-3xl border-2 border-[#e2e2e2] dark:border-[#303030] hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left"
                  >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2">
                      First Time Here
                    </h3>
                    <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-4">
                      I'm new to The Fort and need to sign a waiver before training.
                    </p>
                    <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
                      Sign Waiver First <ArrowRight className="w-4 h-4" />
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Returning Visitor Form */}
            {visitorType === 'returning' && (
              <motion.div
                key="returning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-lg mx-auto"
              >
                <button
                  onClick={() => setVisitorType(null)}
                  className="text-[#5e5e5e] dark:text-[#b9b9b9] hover:text-[#1b1b1b] dark:hover:text-white mb-6 flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back
                </button>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-3xl border border-green-200 dark:border-green-800 p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2">
                      Welcome Back!
                    </h2>
                    <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
                      Enter your info to pay for today's class
                    </p>
                  </div>

                  <form onSubmit={handleDropInSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={dropInForm.firstName}
                        onChange={(e) => setDropInForm({ ...dropInForm, firstName: e.target.value })}
                        placeholder="First Name *"
                        required
                        className="w-full bg-white dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl px-4 py-3 text-[#1b1b1b] dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                      <input
                        type="text"
                        value={dropInForm.lastName}
                        onChange={(e) => setDropInForm({ ...dropInForm, lastName: e.target.value })}
                        placeholder="Last Name *"
                        required
                        className="w-full bg-white dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl px-4 py-3 text-[#1b1b1b] dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                    <input
                      type="email"
                      value={dropInForm.email}
                      onChange={(e) => setDropInForm({ ...dropInForm, email: e.target.value })}
                      placeholder="Email Address *"
                      required
                      className="w-full bg-white dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl px-4 py-3 text-[#1b1b1b] dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                    <input
                      type="tel"
                      value={dropInForm.phone}
                      onChange={(e) => setDropInForm({ ...dropInForm, phone: e.target.value })}
                      placeholder="Phone (optional)"
                      className="w-full bg-white dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl px-4 py-3 text-[#1b1b1b] dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />

                    {error && (
                      <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isProcessing || !dropInForm.firstName || !dropInForm.lastName || !dropInForm.email}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Pay $20 & Check In
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-[#777777] text-sm">
                      Secure payment powered by Stripe
                    </p>
                  </form>
                </div>
              </motion.div>
            )}

            {/* New Visitor - Redirect to Check-in with Waiver */}
            {visitorType === 'new' && (
              <motion.div
                key="new"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-lg mx-auto"
              >
                <button
                  onClick={() => setVisitorType(null)}
                  className="text-[#5e5e5e] dark:text-[#b9b9b9] hover:text-[#1b1b1b] dark:hover:text-white mb-6 flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back
                </button>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-3xl border border-blue-200 dark:border-blue-800 p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileSignature className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2">
                    Welcome to The Fort!
                  </h2>
                  <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-6">
                    Before you can train, we need you to sign a liability waiver.
                    It only takes a minute!
                  </p>

                  <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 mb-6 text-left">
                    <h3 className="font-medium text-[#1b1b1b] dark:text-white mb-4">What happens next:</h3>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400">1</span>
                        <span className="text-[#5e5e5e] dark:text-[#b9b9b9]">Fill out your info & sign the waiver</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400">2</span>
                        <span className="text-[#5e5e5e] dark:text-[#b9b9b9]">Pay $20 for today's class</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                        <span className="text-[#5e5e5e] dark:text-[#b9b9b9]">You're checked in and ready to train!</span>
                      </li>
                    </ol>
                  </div>

                  <Link
                    href="/check-in?mode=waiver"
                    className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-all"
                  >
                    <FileSignature className="w-5 h-5" />
                    Sign Waiver & Pay
                  </Link>

                  <p className="text-[#777777] text-sm mt-4">
                    Your waiver is good for 1 year
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Membership CTA */}
          <div className="mt-16 text-center">
            <div className="bg-[#f9f9f9] dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030] p-8">
              <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-2">
                Training regularly?
              </h3>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-4">
                A membership saves you money. Unlimited classes starting at $75/month for kids, $100/month for adults.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all"
              >
                View Membership Options <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="py-20 bg-[#1b1b1b] dark:bg-[#0a0a0a] relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
            Questions About Drop-ins?
          </h2>
          <p className="text-lg text-[#b9b9b9] mb-8">
            Call us anytime - we're happy to help!
          </p>
          <a
            href="tel:2604527615"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#e2e2e2] transition-all hover:scale-105"
          >
            <Phone className="w-5 h-5" />
            (260) 452-7615
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
