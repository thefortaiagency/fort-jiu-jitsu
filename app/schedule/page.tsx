'use client';

import { ArrowRight, Phone, Clock, Calendar, MapPin, Sunrise, Users, Swords, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { FadeIn, StaggerChildren, StaggerItem, ScaleIn } from '../components/ScrollAnimations';

const scheduleData = [
  {
    day: 'Monday',
    classes: [
      { name: 'Morning Rolls', time: '5:00 - 6:00 AM', type: 'open', included: true },
    ],
  },
  {
    day: 'Tuesday',
    classes: [
      { name: 'Kids Gi Class', time: '5:30 - 6:30 PM', type: 'kids' },
      { name: 'Adult Gi Class', time: '6:30 - 8:00 PM', type: 'adult' },
    ],
  },
  {
    day: 'Wednesday',
    classes: [
      { name: 'Morning Rolls', time: '5:00 - 6:00 AM', type: 'open', included: true },
      { name: 'Kids Gi Class', time: '5:30 - 6:30 PM', type: 'kids' },
      { name: 'Adult Gi Class', time: '6:30 - 8:00 PM', type: 'adult' },
    ],
  },
  {
    day: 'Thursday',
    classes: [],
  },
  {
    day: 'Friday',
    classes: [
      { name: 'Morning Rolls', time: '5:00 - 6:00 AM', type: 'open', included: true },
    ],
  },
  {
    day: 'Saturday',
    classes: [],
  },
  {
    day: 'Sunday',
    classes: [],
  },
];

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-[#f9f9f9] to-white dark:from-[#0a0a0a] dark:to-[#1b1b1b]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              2025/26 Season
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#1b1b1b] dark:text-white mb-6 leading-tight">
              Class Schedule & Pricing
            </h1>
            <p className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
              Join us at The Fort Wrestling Facility for world-class Jiu-Jitsu instruction.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white dark:bg-[#1b1b1b]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1b1b1b] dark:text-white mb-4">
              Membership Options
            </h2>
            <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
              Choose the program that fits your goals
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Morning Rolls - Included */}
            <ScaleIn>
              <div className="relative h-full p-8 bg-gradient-to-br from-[#1b1b1b] to-[#303030] rounded-3xl text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <Sunrise className="w-12 h-12 mb-6 text-[#b9b9b9]" />
                  <h3 className="font-serif text-2xl font-bold mb-2">Morning Rolls</h3>
                  <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm mb-6">
                    Included with membership
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-[#b9b9b9]">
                      <Check className="w-5 h-5 text-white" />
                      Mon, Wed, Fri
                    </li>
                    <li className="flex items-center gap-3 text-[#b9b9b9]">
                      <Check className="w-5 h-5 text-white" />
                      5:00 - 6:00 AM
                    </li>
                    <li className="flex items-center gap-3 text-[#b9b9b9]">
                      <Check className="w-5 h-5 text-white" />
                      Open mat training
                    </li>
                  </ul>
                </div>
              </div>
            </ScaleIn>

            {/* Kids Program */}
            <ScaleIn delay={0.1}>
              <div className="h-full p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-3xl border-2 border-[#e2e2e2] dark:border-[#303030]">
                <Users className="w-12 h-12 mb-6 text-[#5e5e5e] dark:text-[#b9b9b9]" />
                <h3 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2">
                  Kids Gi Classes
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-[#1b1b1b] dark:text-white">$75</span>
                  <span className="text-[#777777]">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <Check className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                    Tuesday & Wednesday
                  </li>
                  <li className="flex items-center gap-3 text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <Check className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                    5:30 - 6:30 PM
                  </li>
                  <li className="flex items-center gap-3 text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <Check className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                    Morning rolls included
                  </li>
                  <li className="flex items-center gap-3 text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <Check className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                    Family discounts available
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="block w-full py-3 text-center bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </div>
            </ScaleIn>

            {/* Adult Program */}
            <ScaleIn delay={0.2}>
              <div className="h-full p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-3xl border-2 border-[#1b1b1b] dark:border-white relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] text-sm font-medium rounded-full">
                  Most Popular
                </div>
                <Swords className="w-12 h-12 mb-6 text-[#5e5e5e] dark:text-[#b9b9b9]" />
                <h3 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2">
                  Adult Gi Classes
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-[#1b1b1b] dark:text-white">$100</span>
                  <span className="text-[#777777]">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <Check className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                    Tuesday & Wednesday
                  </li>
                  <li className="flex items-center gap-3 text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <Check className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                    6:30 - 8:00 PM
                  </li>
                  <li className="flex items-center gap-3 text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <Check className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                    Morning rolls included
                  </li>
                  <li className="flex items-center gap-3 text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <Check className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                    All skill levels welcome
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="block w-full py-3 text-center bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </div>
            </ScaleIn>
          </div>

          {/* Drop-in */}
          <FadeIn delay={0.3} className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <span className="text-[#5e5e5e] dark:text-[#b9b9b9]">Drop-in rate:</span>
              <span className="text-2xl font-bold text-[#1b1b1b] dark:text-white">$20</span>
              <span className="text-[#777777]">per class</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Weekly Schedule */}
      <section className="py-20 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1b1b1b] dark:text-white mb-4">
              Weekly Schedule
            </h2>
            <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
              All classes held at The Fort Wrestling Facility
            </p>
          </FadeIn>

          <div className="max-w-4xl mx-auto">
            <StaggerChildren className="space-y-4">
              {scheduleData.map((day) => (
                <StaggerItem key={day.day}>
                  <div className={`p-6 rounded-2xl border ${
                    day.classes.length > 0
                      ? 'bg-white dark:bg-[#1b1b1b] border-[#e2e2e2] dark:border-[#303030]'
                      : 'bg-[#f9f9f9] dark:bg-[#0a0a0a] border-transparent opacity-50'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="md:w-32">
                        <h3 className="font-serif text-lg font-bold text-[#1b1b1b] dark:text-white">
                          {day.day}
                        </h3>
                      </div>
                      <div className="flex-1">
                        {day.classes.length > 0 ? (
                          <div className="space-y-3">
                            {day.classes.map((cls, idx) => (
                              <div
                                key={idx}
                                className="flex flex-wrap items-center gap-3"
                              >
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  cls.type === 'open'
                                    ? 'bg-[#1b1b1b] text-white dark:bg-white dark:text-[#1b1b1b]'
                                    : cls.type === 'kids'
                                    ? 'bg-[#e2e2e2] dark:bg-[#303030] text-[#1b1b1b] dark:text-white'
                                    : 'bg-[#e2e2e2] dark:bg-[#303030] text-[#1b1b1b] dark:text-white'
                                }`}>
                                  {cls.name}
                                </span>
                                <span className="flex items-center gap-1 text-sm text-[#777777]">
                                  <Clock className="w-4 h-4" />
                                  {cls.time}
                                </span>
                                {cls.included && (
                                  <span className="text-xs text-[#777777]">
                                    (Included with membership)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#777777]">No scheduled classes</span>
                        )}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-white dark:bg-[#1b1b1b]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              <MapPin className="w-12 h-12 mx-auto mb-6 text-[#5e5e5e] dark:text-[#b9b9b9]" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                The Fort Wrestling Facility
              </h2>
              <p className="text-xl text-[#5e5e5e] dark:text-[#b9b9b9] mb-8">
                1519 Goshen Road<br />
                Fort Wayne, IN 46808
              </p>
              <a
                href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#1b1b1b] dark:text-white font-medium hover:underline"
              >
                Get Directions
                <ArrowRight className="w-5 h-5" />
              </a>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1b1b1b] dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-[#b9b9b9] mb-8">
              Call us or stop by to begin your Jiu-Jitsu journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#e2e2e2] transition-all hover:scale-105"
              >
                Sign Up Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:2604527615"
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white px-8 py-4 rounded-full font-medium border-2 border-[#5e5e5e] hover:border-white transition-colors"
              >
                <Phone className="w-5 h-5" />
                (260) 452-7615
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
