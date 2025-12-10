'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

function CheckInContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Member';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto text-center"
    >
      {/* Success Icon */}
      <div className="w-24 h-24 mx-auto mb-8 bg-green-500 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-4xl font-serif mb-4">You're Checked In!</h1>

      <p className="text-xl text-gray-300 mb-8">
        Welcome to class, {name}! Have a great training session.
      </p>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
        <p className="text-gray-400 text-sm mb-2">Check-in time</p>
        <p className="text-2xl font-bold">
          {new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </p>
      </div>

      <Link
        href="/"
        className="inline-block px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
      >
        Back to Home
      </Link>
    </motion.div>
  );
}

export default function CheckInSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="pt-32 pb-20 px-4">
        <Suspense
          fallback={
            <div className="flex justify-center">
              <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
            </div>
          }
        >
          <CheckInContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
