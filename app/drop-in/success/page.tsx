'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

export default function DropInSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="pt-32 pb-20 px-4">
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

          <h1 className="text-4xl font-serif mb-4">Drop-in Confirmed!</h1>

          <p className="text-xl text-gray-300 mb-8">
            Your payment is complete. You're all set for today's class!
          </p>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-bold text-lg mb-4">What's Next?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Arrive 10-15 minutes before class starts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Wear comfortable athletic clothes (we have loaner gis available)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>Bring water and a towel</span>
              </li>
            </ul>
          </div>

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

          <p className="text-gray-400 mb-8">
            Questions? Call us at{' '}
            <a href="tel:260-452-7615" className="underline hover:text-white">
              (260) 452-7615
            </a>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
            >
              Join as a Member
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
