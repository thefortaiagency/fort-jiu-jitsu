'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import FirstClassCountdown from '../components/FirstClassCountdown';
import WhatToBring from '../components/WhatToBring';
import GymEtiquette from '../components/GymEtiquette';
import { Clock, MapPin, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FirstClassPage() {
  const [firstClassDate, setFirstClassDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Load member's first class date from API
    // For demo, set to next Tuesday at 6:30 PM
    const getNextTuesday = () => {
      const today = new Date();
      const daysUntilTuesday = (2 - today.getDay() + 7) % 7 || 7;
      const nextTuesday = new Date(today);
      nextTuesday.setDate(today.getDate() + daysUntilTuesday);
      nextTuesday.setHours(18, 30, 0, 0);
      return nextTuesday.toISOString();
    };

    setTimeout(() => {
      setFirstClassDate(getNextTuesday());
      setIsLoading(false);
    }, 500);
  }, []);

  const handleReschedule = () => {
    // TODO: Implement rescheduling
    window.location.href = '/schedule';
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
                <p className="text-gray-400">Loading...</p>
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
            <h1 className="text-4xl font-serif font-bold mb-4">
              Your First Class Guide
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to know to walk in confident and prepared for your first BJJ class at The Fort.
            </p>
          </motion.div>

          {/* Countdown Section */}
          {firstClassDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <FirstClassCountdown
                firstClassDate={firstClassDate}
                onReschedule={handleReschedule}
              />
            </motion.div>
          )}

          {/* Timeline: What Happens During Class */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Clock className="w-8 h-8" />
              What Happens During Class
            </h2>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />

              {/* Timeline Items */}
              <div className="space-y-8">
                {/* Arrival */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center font-bold text-xl relative z-10">
                    -10
                  </div>
                  <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2">Arrive Early</h3>
                    <p className="text-gray-400 mb-3">
                      Get there 10 minutes before class starts. This gives you time to change, meet the instructor, and get settled.
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-black rounded-lg border border-gray-800">
                      <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium mb-1">Where to park & enter:</p>
                        <p className="text-sm text-gray-400">
                          Park in our lot at 1519 Goshen Road. Enter through the main front door. Check in at the desk with your name.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warm-up */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center font-bold text-xl relative z-10">
                    0-10
                  </div>
                  <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2">Warm-Up (10 min)</h3>
                    <p className="text-gray-400 mb-3">
                      Light cardio to get your blood flowing, followed by stretching and basic movements. Don't worry—it's beginner-friendly!
                    </p>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li>• Light jogging or shrimping</li>
                      <li>• Stretching major muscle groups</li>
                      <li>• Basic BJJ movements (bridging, hip escapes)</li>
                    </ul>
                  </div>
                </div>

                {/* Technique */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center font-bold text-xl relative z-10">
                    10-40
                  </div>
                  <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2">Technique Instruction (30 min)</h3>
                    <p className="text-gray-400 mb-3">
                      The instructor demonstrates a technique step-by-step. Pay attention, ask questions, and take mental notes.
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-green-900/20 border border-green-900/50 rounded-lg mt-3">
                      <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-300 mb-1">Pro Tip:</p>
                        <p className="text-sm text-green-200">
                          Don't worry about perfecting it right away. Focus on understanding the concept. Repetition comes next!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drilling */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center font-bold text-xl relative z-10">
                    40-60
                  </div>
                  <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2">Drilling with a Partner (20 min)</h3>
                    <p className="text-gray-400 mb-3">
                      Practice the technique with a training partner. Take turns being the attacker and defender. This is where the learning happens!
                    </p>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li>• You'll be paired with someone (often another beginner)</li>
                      <li>• Go slow and focus on correct movements</li>
                      <li>• Help each other get it right</li>
                      <li>• Instructors will walk around to give feedback</li>
                    </ul>
                  </div>
                </div>

                {/* Rolling (optional) */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold text-xl relative z-10">
                    60-90
                  </div>
                  <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                      Live Rolling (Optional for Beginners)
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full font-normal">
                        Optional
                      </span>
                    </h3>
                    <p className="text-gray-400 mb-3">
                      Light sparring where you try techniques on a resisting opponent. As a beginner, you can sit out or participate at lower intensity. No pressure!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg mt-3">
                      <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-300 mb-1">First-Timer Advice:</p>
                        <p className="text-sm text-blue-200">
                          It's totally fine to watch your first rolling session or two. When you do join, let your partner know you're new—they'll go easy!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cool Down */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl relative z-10">
                    ✓
                  </div>
                  <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="font-bold text-xl mb-2">Cool Down & Bow Out</h3>
                    <p className="text-gray-400">
                      Brief stretching, thank your training partners, and bow off the mat. You survived your first class! 🎉
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What to Bring Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <WhatToBring />
          </motion.div>

          {/* Gym Etiquette Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <GymEtiquette />
          </motion.div>

          {/* Reassurance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-lg p-8 text-center"
          >
            <div className="text-5xl mb-4">🥋</div>
            <h2 className="text-2xl font-bold mb-4">You've Got This!</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
              Every black belt was once a white belt who showed up scared to their first class.
              The BJJ community is built on helping each other grow. You're not alone—we're all
              on this journey together. The hardest part is walking through the door. You've
              already done that by signing up. Now just show up, have fun, and trust the process!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/schedule"
                className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Class Schedule
              </Link>
              <a
                href="tel:260-452-7615"
                className="px-8 py-4 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
              >
                Call with Questions
              </a>
            </div>
          </motion.div>

          {/* Back to Onboarding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-8"
          >
            <Link
              href="/onboarding"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Onboarding
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
