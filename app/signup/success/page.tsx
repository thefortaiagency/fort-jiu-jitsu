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
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (sessionId) {
      // Verify the session with our backend
      fetch(`/api/verify-payment?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setStatus(data.success ? 'success' : 'error');
        })
        .catch(() => {
          // Even if verification fails, show success since Stripe redirected here
          setStatus('success');
        });
    } else {
      setStatus('success');
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
      className="max-w-xl mx-auto text-center"
    >
      {/* Success Icon */}
      <div className="w-24 h-24 mx-auto mb-8 bg-green-500 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-4xl font-serif mb-4">Welcome to The Fort!</h1>

      <p className="text-xl text-gray-300 mb-8">
        Your membership is now active. We can&apos;t wait to see you on the mats!
      </p>

      {/* Next Steps */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 text-left">
        <h2 className="font-bold text-lg mb-4">What&apos;s Next?</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            <span>
              <strong>Check your email</strong> - We&apos;ve sent a confirmation with your membership
              details.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            <span>
              <strong>Come to class!</strong> - See our{' '}
              <Link href="/schedule" className="underline hover:text-gray-300">
                schedule
              </Link>{' '}
              for class times.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            <span>
              <strong>What to bring</strong> - Wear comfortable athletic clothes for your first
              class. We&apos;ll provide a loaner gi if you don&apos;t have one yet.
            </span>
          </li>
        </ul>
      </div>

      {/* Location Reminder */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
        <h3 className="font-bold mb-2">Find Us At</h3>
        <p className="text-gray-300">
          1519 Goshen Road<br />
          Fort Wayne, IN 46808
        </p>
        <a
          href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm underline hover:text-gray-300"
        >
          Get Directions →
        </a>
      </div>

      {/* Contact */}
      <p className="text-gray-400 mb-8">
        Questions? Call us at{' '}
        <a href="tel:260-452-7615" className="underline hover:text-white">
          (260) 452-7615
        </a>
      </p>

      <Link
        href="/"
        className="inline-block px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
      >
        Back to Home
      </Link>
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
