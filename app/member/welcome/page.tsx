'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Trophy, Calendar, Users, MessageCircle, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

interface MemberProgress {
  memberId: string;
  firstName: string;
  memberSince: string;
  daysAsMember: number;
  classesAttended: number;
  milestones: {
    profileComplete: boolean;
    firstClassAttended: boolean;
    threeTechniquesLearned: boolean;
    fiveClassesAttended: boolean;
    threePartnersConnected: boolean;
  };
}

export default function MemberWelcomePage() {
  const [progress, setProgress] = useState<MemberProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Load from API endpoint /api/member/progress
    // For demo purposes, using mock data
    setTimeout(() => {
      setProgress({
        memberId: 'demo-123',
        firstName: 'Andy',
        memberSince: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        daysAsMember: 10,
        classesAttended: 3,
        milestones: {
          profileComplete: true,
          firstClassAttended: true,
          threeTechniquesLearned: false,
          fiveClassesAttended: false,
          threePartnersConnected: false,
        },
      });
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading your progress...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <p className="text-gray-400">Member data not found.</p>
              <Link href="/member" className="text-white underline mt-4 inline-block">
                Go to Member Portal
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const milestonesList = [
    {
      id: 'profileComplete',
      label: 'Complete Your Profile',
      description: 'Make sure all your information is up to date',
      completed: progress.milestones.profileComplete,
      icon: Circle,
      link: '/member',
    },
    {
      id: 'firstClassAttended',
      label: 'Attend Your First Class',
      description: 'Show up and experience BJJ firsthand',
      completed: progress.milestones.firstClassAttended,
      icon: CheckCircle2,
      link: '/schedule',
    },
    {
      id: 'threeTechniquesLearned',
      label: 'Learn 3 Basic Techniques',
      description: 'Master fundamental moves like trap and roll, shrimp, and bridge',
      completed: progress.milestones.threeTechniquesLearned,
      icon: Circle,
    },
    {
      id: 'fiveClassesAttended',
      label: 'Train 5 Times',
      description: 'Build consistency and momentum',
      completed: progress.milestones.fiveClassesAttended,
      icon: Circle,
      link: '/schedule',
    },
    {
      id: 'threePartnersConnected',
      label: 'Meet 3 Training Partners',
      description: 'Connect with your BJJ community',
      completed: progress.milestones.threePartnersConnected,
      icon: Users,
    },
  ];

  const completedCount = Object.values(progress.milestones).filter(Boolean).length;
  const totalMilestones = Object.keys(progress.milestones).length;
  const progressPercentage = (completedCount / totalMilestones) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="text-5xl mb-4">👋</div>
            <h1 className="text-4xl font-serif font-bold mb-3">
              Welcome, {progress.firstName}!
            </h1>
            <p className="text-xl text-gray-400">
              You've been training for {progress.daysAsMember} day{progress.daysAsMember !== 1 ? 's' : ''}.
              Let's keep the momentum going!
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-4 mb-12"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-3 text-blue-400" />
              <div className="text-3xl font-bold mb-1">{progress.daysAsMember}</div>
              <div className="text-sm text-gray-400">Days as Member</div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
              <div className="text-3xl font-bold mb-1">{progress.classesAttended}</div>
              <div className="text-sm text-gray-400">Classes Attended</div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-green-400" />
              <div className="text-3xl font-bold mb-1">
                {completedCount}/{totalMilestones}
              </div>
              <div className="text-sm text-gray-400">Milestones Complete</div>
            </div>
          </motion.div>

          {/* Progress Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Your BJJ Journey</h2>
                <span className="text-sm text-gray-400">
                  {completedCount} of {totalMilestones} complete
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden mb-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                />
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                {milestonesList.map((milestone, index) => {
                  const Icon = milestone.completed ? CheckCircle2 : milestone.icon;

                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        milestone.completed
                          ? 'bg-green-900/20 border-green-700'
                          : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <Icon
                            className={`w-6 h-6 ${
                              milestone.completed ? 'text-green-400' : 'text-gray-500'
                            }`}
                          />
                        </div>

                        <div className="flex-1">
                          <h3
                            className={`font-bold mb-1 ${
                              milestone.completed ? 'line-through text-gray-400' : 'text-white'
                            }`}
                          >
                            {milestone.label}
                          </h3>
                          <p className="text-sm text-gray-400">{milestone.description}</p>

                          {milestone.link && !milestone.completed && (
                            <Link
                              href={milestone.link}
                              className="inline-block mt-2 text-sm text-white hover:text-gray-300 underline"
                            >
                              Complete this milestone →
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Completion Message */}
              {progressPercentage === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-8 p-6 bg-gradient-to-r from-green-900/30 to-blue-900/30 border-2 border-green-700 rounded-lg text-center"
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-2xl font-bold mb-2 text-green-300">
                    All Milestones Complete!
                  </h3>
                  <p className="text-green-200">
                    You're no longer a beginner—you're officially part of The Fort family. Keep training and watch yourself grow!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Recommended Classes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Calendar className="w-7 h-7" />
                Recommended Classes for Beginners
              </h2>
              <p className="text-gray-400 mb-6">
                These classes are perfect for building your fundamentals:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-black rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Adult Gi Classes</h3>
                    <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full">
                      Beginner Friendly
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    Tuesday & Wednesday | 6:30-8:00 PM
                  </p>
                  <p className="text-sm text-gray-500">
                    Traditional BJJ training with the gi (kimono). Focus on fundamental techniques and positions.
                  </p>
                </div>

                <div className="p-4 bg-black rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Morning Rolls</h3>
                    <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full">
                      Light Pace
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    Schedule varies | Check calendar
                  </p>
                  <p className="text-sm text-gray-500">
                    Relaxed training sessions perfect for beginners to practice techniques at their own pace.
                  </p>
                </div>
              </div>

              <Link
                href="/schedule"
                className="block w-full py-4 text-center bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Full Schedule
              </Link>
            </div>
          </motion.div>

          {/* Ask a Question */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-lg p-8 text-center"
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-white" />
            <h2 className="text-2xl font-bold mb-3">Questions or Need Help?</h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              We're here to support you! Whether you have questions about techniques, scheduling,
              or just need some encouragement—reach out anytime.
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
                Send a Message
              </Link>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center gap-6 mt-8 text-sm"
          >
            <Link href="/member" className="text-gray-400 hover:text-white transition-colors">
              ← Member Dashboard
            </Link>
            <Link href="/schedule" className="text-gray-400 hover:text-white transition-colors">
              View Schedule →
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
