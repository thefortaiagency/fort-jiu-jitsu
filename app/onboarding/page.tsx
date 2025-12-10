'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ProgressChecklist, { ChecklistItem } from './components/ProgressChecklist';
import { Play, BookOpen, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

const defaultChecklistItems: ChecklistItem[] = [
  {
    id: 'profile',
    label: 'Complete Your Profile',
    description: 'Make sure all your information is up to date',
    completed: false,
    link: '/member',
    linkText: 'Go to Member Portal',
  },
  {
    id: 'first-class-guide',
    label: 'Read First Class Guide',
    description: 'Learn what to bring and what to expect',
    completed: false,
    link: '/onboarding/first-class',
    linkText: 'Read the Guide',
  },
  {
    id: 'watch-welcome',
    label: 'Watch Welcome Video',
    description: 'A message from our instructors',
    completed: false,
  },
  {
    id: 'schedule-class',
    label: 'View Class Schedule',
    description: 'Plan when you want to attend your first class',
    completed: false,
    link: '/schedule',
    linkText: 'View Schedule',
  },
  {
    id: 'etiquette',
    label: 'Learn Gym Etiquette',
    description: 'Understand BJJ customs and respectful training',
    completed: false,
  },
];

export default function OnboardingPage() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(defaultChecklistItems);
  const [isLoading, setIsLoading] = useState(true);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Load member data and checklist progress from API
    // For now, simulate loading
    setTimeout(() => {
      setIsLoading(false);
      // TODO: Replace with actual member ID from auth/session
      setMemberId('demo-member-id');
    }, 500);
  }, []);

  const handleItemToggle = async (itemId: string, completed: boolean) => {
    // TODO: Save to database via API
    // POST /api/onboarding with { memberId, itemId, completed }
    console.log('Toggling item:', itemId, completed);

    // For now, just update local state
    setChecklistItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, completed } : item))
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading your onboarding...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-serif font-bold mb-4">Welcome to Your BJJ Journey</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Complete these steps to prepare for your first class and get the most out of your
              training at The Fort.
            </p>
          </motion.div>

          {/* Progress Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <ProgressChecklist
              items={checklistItems}
              onItemToggle={handleItemToggle}
              memberId={memberId || 'guest'}
            />
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/onboarding/first-class"
                className="group p-6 bg-gray-900 border border-gray-700 rounded-lg hover:border-white transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-black rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-gray-300">
                      First Class Preparation
                    </h3>
                    <p className="text-sm text-gray-400">
                      Everything you need to know before stepping on the mat
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/schedule"
                className="group p-6 bg-gray-900 border border-gray-700 rounded-lg hover:border-white transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-black rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-gray-300">
                      Class Schedule
                    </h3>
                    <p className="text-sm text-gray-400">
                      View class times and plan your training schedule
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Welcome Video Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-lg p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-black" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">Welcome Message from Your Instructors</h2>
                  <p className="text-gray-400 mb-6">
                    Watch this short video to hear directly from our coaching staff about what makes
                    The Fort special and what you can expect in your first weeks of training.
                  </p>
                  <div className="bg-gray-800 aspect-video rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-500">Video Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Common Questions</h2>
            <div className="space-y-4">
              <details className="bg-gray-900 border border-gray-700 rounded-lg p-6 group">
                <summary className="font-bold cursor-pointer flex items-center justify-between">
                  What should I wear to my first class?
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Wear comfortable athletic clothes without zippers or buttons. If you have a gi,
                  bring it! If not, we have loaners available. Under your gi, wear a rash guard or
                  t-shirt and athletic shorts. Bring flip flops for walking off the mat.
                </p>
              </details>

              <details className="bg-gray-900 border border-gray-700 rounded-lg p-6 group">
                <summary className="font-bold cursor-pointer flex items-center justify-between">
                  Do I need to be in shape before starting?
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Not at all! BJJ will get you in shape. We welcome all fitness levels and everyone
                  trains at their own pace. Our instructors will help you modify techniques as
                  needed while you build endurance.
                </p>
              </details>

              <details className="bg-gray-900 border border-gray-700 rounded-lg p-6 group">
                <summary className="font-bold cursor-pointer flex items-center justify-between">
                  Will I be the only beginner?
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  We have beginners starting every week! All our students remember what it's like to
                  be new, and the BJJ community is incredibly welcoming. You'll never feel alone or
                  out of place.
                </p>
              </details>

              <details className="bg-gray-900 border border-gray-700 rounded-lg p-6 group">
                <summary className="font-bold cursor-pointer flex items-center justify-between">
                  How often should I train as a beginner?
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  We recommend 2-3 times per week for beginners. This gives you enough repetition to
                  learn techniques while allowing recovery time. Consistency is more important than
                  intensity when you're starting out.
                </p>
              </details>

              <details className="bg-gray-900 border border-gray-700 rounded-lg p-6 group">
                <summary className="font-bold cursor-pointer flex items-center justify-between">
                  Is BJJ safe? Will I get injured?
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Safety is our #1 priority. BJJ is a controlled sport where you can "tap out" at
                  any time to stop a submission. Beginners start with technique-focused training
                  before advancing to live sparring. Minor bumps and bruises can happen (like any
                  sport), but serious injuries are rare when training smart.
                </p>
              </details>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-lg p-8 text-center"
          >
            <Users className="w-12 h-12 mx-auto mb-4 text-white" />
            <h2 className="text-2xl font-bold mb-3">Still Have Questions?</h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              We're here to help! Reach out anytime and we'll get you the answers you need to feel
              confident about your first class.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:260-452-7615"
                className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Call (260) 452-7615
              </a>
              <Link
                href="/contact"
                className="px-8 py-4 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
              >
                Send Us a Message
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
