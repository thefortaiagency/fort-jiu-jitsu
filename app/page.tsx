'use client';

import { ArrowRight, Phone, Users, Shield, Swords, ChevronDown, Clock, Calendar, Sunrise } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { FadeIn, StaggerChildren, StaggerItem, ScaleIn } from './components/ScrollAnimations';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f9f9f9] via-white to-[#f0f0f0] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#1b1b1b]" />

        {/* Animated grid pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(#1b1b1b 1px, transparent 1px), linear-gradient(90deg, #1b1b1b 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '80px 80px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-[#e2e2e2] to-transparent dark:from-[#303030] dark:to-transparent opacity-50 blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tl from-[#e2e2e2] to-transparent dark:from-[#303030] dark:to-transparent opacity-30 blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-24"
        >
          {/* Hero Logo - BIGGER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-8"
          >
            <Image
              src="/jiu-jitsu.png"
              alt="The Fort Jiu-Jitsu"
              width={600}
              height={300}
              className="mx-auto dark:invert w-full max-w-[500px] md:max-w-[600px] h-auto"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-[#1b1b1b]/80 backdrop-blur-sm border border-[#e2e2e2] dark:border-[#303030] text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] mb-8 shadow-sm">
              <Shield className="w-4 h-4" />
              Fort Wayne's Premier Grappling Academy
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-[#1b1b1b] dark:text-white mb-6 leading-[1.1] tracking-tight"
          >
            Forge Your Path.
            <br />
            <span className="bg-gradient-to-r from-[#5e5e5e] to-[#777777] dark:from-[#777777] dark:to-[#999999] bg-clip-text text-transparent">
              Master the Mat.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Where the relentless spirit of wrestling meets the intricate art of Brazilian Jiu-Jitsu.
            Join our community of warriors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-8 py-4 rounded-full font-medium transition-all hover:scale-105 hover:shadow-xl hover:shadow-black/10"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:2604527615"
              className="inline-flex items-center justify-center gap-2 bg-white/80 dark:bg-[#1b1b1b]/80 backdrop-blur-sm text-[#1b1b1b] dark:text-white px-8 py-4 rounded-full font-medium border border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-all hover:shadow-lg"
            >
              <Phone className="w-5 h-5" />
              (260) 452-7615
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <Link href="#features" className="flex flex-col items-center gap-2 text-[#777777] hover:text-[#1b1b1b] dark:hover:text-white transition-colors">
            <span className="text-xs font-medium uppercase tracking-wider">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 bg-[#f9f9f9] dark:bg-[#0a0a0a] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              The Unfair Advantage
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#1b1b1b] dark:text-white mb-6">
              Integrated Grappling
            </h2>
            <p className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] max-w-2xl mx-auto">
              A unique approach to grappling you won't find anywhere else in Fort Wayne.
            </p>
          </FadeIn>

          <StaggerChildren className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* The Wrestling Edge */}
            <StaggerItem>
              <div className="group h-full p-8 bg-white dark:bg-[#1b1b1b] rounded-3xl border border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Shield className="w-7 h-7 text-white dark:text-[#1b1b1b]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                  The Wrestling Edge
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
                  Dominate the takedown, control from top position, and develop relentless pressure that breaks your opponents' will.
                </p>
              </div>
            </StaggerItem>

            {/* The Jiu-Jitsu Finish */}
            <StaggerItem>
              <div className="group h-full p-8 bg-white dark:bg-[#1b1b1b] rounded-3xl border border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Swords className="w-7 h-7 text-white dark:text-[#1b1b1b]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                  The Jiu-Jitsu Finish
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
                  Master intricate joint locks and chokes, turning every opponent movement into a potential submission.
                </p>
              </div>
            </StaggerItem>

            {/* Community */}
            <StaggerItem>
              <div className="group h-full p-8 bg-white dark:bg-[#1b1b1b] rounded-3xl border border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Users className="w-7 h-7 text-white dark:text-[#1b1b1b]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                  Community of Warriors
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
                  Join a family of like-minded individuals passionate about martial arts and dedicated to growth.
                </p>
              </div>
            </StaggerItem>
          </StaggerChildren>
        </div>
      </section>

      {/* Schedule Preview Section */}
      <section className="py-24 md:py-32 bg-white dark:bg-[#1b1b1b]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              2025/26 Season
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#1b1b1b] dark:text-white mb-6">
              Train With Us
            </h2>
            <p className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] max-w-2xl mx-auto">
              Multiple training opportunities throughout the week.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Morning Rolls */}
            <ScaleIn delay={0}>
              <Link href="/signup" className="block">
                <div className="relative group p-8 bg-gradient-to-br from-[#1b1b1b] to-[#303030] dark:from-[#0a0a0a] dark:to-[#1b1b1b] rounded-3xl text-white overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <Sunrise className="w-10 h-10 mb-6 text-[#b9b9b9]" />
                  <h3 className="font-serif text-xl font-bold mb-2">Morning Rolls</h3>
                  <p className="text-[#b9b9b9] text-sm mb-4">Included with membership</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#777777]" />
                      <span>Mon, Wed, Fri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#777777]" />
                      <span>5:00 - 6:00 AM</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                    Join Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScaleIn>

            {/* Kids Classes */}
            <ScaleIn delay={0.1}>
              <Link href="/signup" className="block">
                <div className="group p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-3xl border border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-all hover:scale-[1.02] cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#e2e2e2] dark:bg-[#303030] flex items-center justify-center mb-6">
                    <Users className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-2">Kids Gi Classes</h3>
                  <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">$75<span className="text-sm font-normal text-[#777777]">/mo</span></p>
                  <div className="space-y-2 text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Tue & Wed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>5:30 - 6:30 PM</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] group-hover:text-[#1b1b1b] dark:group-hover:text-white transition-colors">
                    Sign Up <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScaleIn>

            {/* Adult Classes */}
            <ScaleIn delay={0.2}>
              <Link href="/signup" className="block">
                <div className="group p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-3xl border border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-all hover:scale-[1.02] cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#e2e2e2] dark:bg-[#303030] flex items-center justify-center mb-6">
                    <Swords className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-2">Adult Gi Classes</h3>
                  <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">$100<span className="text-sm font-normal text-[#777777]">/mo</span></p>
                  <div className="space-y-2 text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Tue & Wed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>6:30 - 8:00 PM</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] group-hover:text-[#1b1b1b] dark:group-hover:text-white transition-colors">
                    Sign Up <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScaleIn>
          </div>

          <FadeIn delay={0.3} className="mt-12 text-center">
            <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-8 p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl">
              <div className="text-center px-4">
                <p className="text-sm text-[#777777] uppercase tracking-wider mb-1">Drop-In</p>
                <p className="text-xl font-bold text-[#1b1b1b] dark:text-white">$20</p>
              </div>
              <div className="hidden sm:block w-px bg-[#e2e2e2] dark:bg-[#303030]" />
              <div className="text-center px-4">
                <p className="text-sm text-[#777777] uppercase tracking-wider mb-1">Family Discounts</p>
                <p className="text-xl font-bold text-[#1b1b1b] dark:text-white">Available</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.4} className="mt-10 text-center">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 text-[#1b1b1b] dark:text-white font-medium hover:gap-3 transition-all"
            >
              View Full Schedule
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-[#1b1b1b] dark:bg-[#0a0a0a] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg md:text-xl text-[#b9b9b9] mb-10 max-w-2xl mx-auto">
              Whether you're a seasoned wrestler, a Jiu-Jitsu practitioner, or a complete beginner,
              our world-class instructors will help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:2604527615"
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#e2e2e2] transition-all hover:scale-105 hover:shadow-xl"
              >
                <Phone className="w-5 h-5" />
                (260) 452-7615
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white px-8 py-4 rounded-full font-medium border-2 border-[#5e5e5e] hover:border-white transition-all hover:bg-white/5"
              >
                Contact Us
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
