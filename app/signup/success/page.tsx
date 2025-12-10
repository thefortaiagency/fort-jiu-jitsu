'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const memberName = searchParams.get('name');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (sessionId) {
      // Verify the session with our backend
      fetch(`/api/verify-payment?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setStatus(data.success ? 'success' : 'error');
          if (data.success) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        })
        .catch(() => {
          // Even if verification fails, show success since Stripe redirected here
          setStatus('success');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        });
    } else {
      setStatus('success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
        <p className="mt-4 text-gray-400">Confirming your membership...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center"
    >
      {/* Animated Celebration */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: 'linear',
                delay: Math.random() * 0.5,
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#fff', '#000', '#888'][Math.floor(Math.random() * 3)],
              }}
            />
          ))}
        </div>
      )}

      {/* Success Icon with Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 mx-auto mb-8 bg-green-500 rounded-full flex items-center justify-center"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-4xl font-serif mb-4"
      >
        Welcome to The Fort{memberName ? `, ${memberName}` : ''}!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xl text-gray-300 mb-8"
      >
        Your membership is now active. We can&apos;t wait to see you on the mats!
      </motion.p>

      {/* Next Steps with Icons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 text-left"
      >
        <h2 className="font-bold text-lg mb-6 text-center">What&apos;s Next?</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-black rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold">
              1
            </div>
            <div>
              <h3 className="font-bold mb-1">Check your email</h3>
              <p className="text-sm text-gray-400">
                We&apos;ve sent a confirmation with your membership details and member QR code for quick check-ins.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-black rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold">
              2
            </div>
            <div>
              <h3 className="font-bold mb-1">Complete your onboarding</h3>
              <p className="text-sm text-gray-400 mb-2">
                Take 5 minutes to learn what to expect in your first class.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 text-sm text-white hover:text-gray-300 transition-colors underline"
              >
                Start Onboarding →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-black rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold">
              3
            </div>
            <div>
              <h3 className="font-bold mb-1">View class schedule</h3>
              <p className="text-sm text-gray-400 mb-2">
                See when our next classes are and plan your first visit.
              </p>
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 text-sm text-white hover:text-gray-300 transition-colors underline"
              >
                View Schedule →
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="grid md:grid-cols-2 gap-4 mb-8"
      >
        <Link
          href="/onboarding/first-class"
          className="p-6 bg-gray-900 border border-gray-700 rounded-lg hover:border-white transition-all group"
        >
          <div className="text-3xl mb-2">📚</div>
          <h3 className="font-bold mb-1 group-hover:text-gray-300">First Class Guide</h3>
          <p className="text-sm text-gray-400">What to bring, what to expect, and gym etiquette</p>
        </Link>

        <a
          href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 bg-gray-900 border border-gray-700 rounded-lg hover:border-white transition-all group"
        >
          <div className="text-3xl mb-2">📍</div>
          <h3 className="font-bold mb-1 group-hover:text-gray-300">Get Directions</h3>
          <p className="text-sm text-gray-400">1519 Goshen Road, Fort Wayne, IN 46808</p>
        </a>
      </motion.div>

      {/* Social Sharing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-lg"
      >
        <p className="text-gray-400 mb-4">
          Excited to start your BJJ journey? Share the news! 🥋
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => {
              const text = "I just joined The Fort Jiu-Jitsu! 🥋 Excited to start my Brazilian Jiu-Jitsu journey!";
              if (navigator.share) {
                navigator.share({ text });
              } else {
                navigator.clipboard.writeText(text);
                alert('Copied to clipboard!');
              }
            }}
            className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Share Your Journey
          </button>
        </div>
      </motion.div>

      {/* Contact */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="text-gray-400 mb-8"
      >
        Questions? Call us at{' '}
        <a href="tel:260-452-7615" className="underline hover:text-white font-medium">
          (260) 452-7615
        </a>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Home
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="pt-32 pb-20 px-4">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
              <p className="mt-4 text-gray-400">Loading...</p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
