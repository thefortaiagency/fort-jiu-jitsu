'use client';

import { ArrowRight, MapPin, Phone, Users, Shield, Swords, ChevronDown, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#e2e2e2] dark:border-[#303030]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-serif text-xl md:text-2xl font-bold tracking-tight text-[#1b1b1b] dark:text-white">
            The Fort Jiu-Jitsu
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#about" className="text-[#5e5e5e] hover:text-[#1b1b1b] dark:text-[#b9b9b9] dark:hover:text-white transition-colors font-medium">
              About
            </Link>
            <Link href="#programs" className="text-[#5e5e5e] hover:text-[#1b1b1b] dark:text-[#b9b9b9] dark:hover:text-white transition-colors font-medium">
              Programs
            </Link>
            <Link href="#instructors" className="text-[#5e5e5e] hover:text-[#1b1b1b] dark:text-[#b9b9b9] dark:hover:text-white transition-colors font-medium">
              Instructors
            </Link>
            <Link href="#locations" className="text-[#5e5e5e] hover:text-[#1b1b1b] dark:text-[#b9b9b9] dark:hover:text-white transition-colors font-medium">
              Locations
            </Link>
            <Link
              href="#contact"
              className="bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-6 py-2.5 rounded-full font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-colors"
            >
              Start Training
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1b1b1b] dark:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0a0a0a] border-t border-[#e2e2e2] dark:border-[#303030]">
            <div className="px-6 py-4 space-y-4">
              <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-[#1b1b1b] dark:text-white font-medium">About</Link>
              <Link href="#programs" onClick={() => setMobileMenuOpen(false)} className="block text-[#1b1b1b] dark:text-white font-medium">Programs</Link>
              <Link href="#instructors" onClick={() => setMobileMenuOpen(false)} className="block text-[#1b1b1b] dark:text-white font-medium">Instructors</Link>
              <Link href="#locations" onClick={() => setMobileMenuOpen(false)} className="block text-[#1b1b1b] dark:text-white font-medium">Locations</Link>
              <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="block bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-6 py-3 rounded-full font-medium text-center">Start Training</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f9f9f9] to-white dark:from-[#0a0a0a] dark:to-[#1b1b1b]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(#1b1b1b 1px, transparent 1px), linear-gradient(90deg, #1b1b1b 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f9f9f9] dark:bg-[#1b1b1b] border border-[#e2e2e2] dark:border-[#303030] text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] mb-8">
              <Shield className="w-4 h-4" />
              Fort Wayne's Premier Grappling Academy
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-[#1b1b1b] dark:text-white mb-8 leading-[1.1] tracking-tight"
          >
            Forge Your Path.
            <br />
            <span className="text-[#5e5e5e] dark:text-[#777777]">Master the Mat.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Where the relentless spirit of wrestling meets the intricate art of Brazilian Jiu-Jitsu.
            Join our community of warriors and discover the power of integrated grappling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-all transform hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:8778483678"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-[#1b1b1b] dark:text-white px-8 py-4 rounded-full font-medium border-2 border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-colors"
            >
              <Phone className="w-5 h-5" />
              (877) 848-3678
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <Link href="#about" className="flex flex-col items-center gap-2 text-[#777777] hover:text-[#1b1b1b] dark:hover:text-white transition-colors">
            <span className="text-sm font-medium">Explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
                Our Philosophy
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1b1b1b] dark:text-white mb-6 leading-tight">
                Building More Than Just Fighters
              </h2>
              <p className="text-base md:text-lg text-[#5e5e5e] dark:text-[#b9b9b9] mb-6 leading-relaxed">
                The Fort Jiu-Jitsu is built on the same foundation of excellence and character that has
                made The Fort Wrestling Facility a pillar of the Fort Wayne athletic community. We believe
                that martial arts is a journey of self-discovery and personal growth.
              </p>
              <p className="text-base md:text-lg text-[#5e5e5e] dark:text-[#b9b9b9] mb-6 leading-relaxed">
                In 2024, The Fort Wrestling Facility proudly acquired Get A Grip Jiu-Jitsu to create
                a new, integrated grappling powerhouse. This strategic union bridges the gap between
                the explosive power of wrestling and the strategic depth of Brazilian Jiu-Jitsu.
              </p>
              <p className="text-base md:text-lg text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed italic">
                "It is not about the destination, it is about the journey." — Andrew Oberlin, Founder
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#e2e2e2] to-[#f9f9f9] dark:from-[#1b1b1b] dark:to-[#303030] rounded-2xl flex items-center justify-center">
                <div className="text-center p-8 md:p-12">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-[#1b1b1b] dark:bg-white flex items-center justify-center">
                    <Swords className="w-10 h-10 md:w-12 md:h-12 text-white dark:text-[#1b1b1b]" />
                  </div>
                  <p className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white">
                    "A Legacy of Wrestling, A Future in Jiu-Jitsu"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why The Fort Section */}
      <section className="py-24 md:py-32 bg-white dark:bg-[#1b1b1b]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              The Unfair Advantage
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1b1b1b] dark:text-white mb-6">
              Integrated Grappling
            </h2>
            <p className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] max-w-2xl mx-auto">
              We offer a unique and powerful approach to grappling that you won't find anywhere else in Fort Wayne.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* The Wrestling Edge */}
            <div className="group p-6 md:p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl border border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-[#1b1b1b]" />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                The Wrestling Edge
              </h3>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
                Learn to dominate the takedown, control your opponent from the top position,
                and develop a relentless, grinding pressure that will break your opponents' will.
              </p>
            </div>

            {/* The Jiu-Jitsu Finish */}
            <div className="group p-6 md:p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl border border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Swords className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-[#1b1b1b]" />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                The Jiu-Jitsu Finish
              </h3>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
                Master the intricate techniques of joint locks and chokes, turning your opponent's
                every move into a potential submission opportunity.
              </p>
            </div>

            {/* Community */}
            <div className="group p-6 md:p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl border border-[#e2e2e2] dark:border-[#303030] hover:border-[#1b1b1b] dark:hover:border-white transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-[#1b1b1b]" />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                A Community of Warriors
              </h3>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
                When you join The Fort, you're joining a family of like-minded individuals
                passionate about martial arts and dedicated to helping each other grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24 md:py-32 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              Programs
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1b1b1b] dark:text-white mb-6">
              A Path for Every Grappler
            </h2>
            <p className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] max-w-2xl mx-auto">
              From complete beginners to seasoned competitors, we have a program designed for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Beginner's Gi */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                Beginner's Gi Program
              </h3>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed mb-4">
                The perfect introduction to Brazilian Jiu-Jitsu. Learn fundamental positions,
                movements, and submissions in a safe and supportive environment. Ideal for
                those with little to no combat sports experience.
              </p>
              <span className="text-sm font-medium text-[#777777]">All experience levels welcome</span>
            </div>

            {/* Advanced Gi */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                Advanced Gi Program
              </h3>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed mb-4">
                A deeper dive into the art of Jiu-Jitsu. Advanced techniques, strategies, and
                concepts that will take your game to the next level. Focus on live sparring
                and competition preparation.
              </p>
              <span className="text-sm font-medium text-[#777777]">For experienced practitioners</span>
            </div>

            {/* Wrestling for Jiu-Jitsu */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                Wrestling for Jiu-Jitsu
              </h3>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed mb-4">
                A dominant takedown game is a game-changer. Led by world-class wrestling coaches,
                learn the takedowns, throws, and control techniques that will allow you to
                dictate the pace of any match.
              </p>
              <span className="text-sm font-medium text-[#777777]">The wrestling edge</span>
            </div>

            {/* Kids Programs */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                Kids Programs
              </h3>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed mb-4">
                Martial arts is an invaluable tool for a child's development. Fun, engaging,
                and educational programs teaching wrestling and Jiu-Jitsu fundamentals while
                building confidence and discipline.
              </p>
              <span className="text-sm font-medium text-[#777777]">Ages 5 and up</span>
            </div>
          </div>
        </div>
      </section>

      {/* Instructors Section */}
      <section id="instructors" className="py-24 md:py-32 bg-white dark:bg-[#1b1b1b]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              Our Team
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1b1b1b] dark:text-white mb-6">
              Led by Champions, Forged in Fort Wayne
            </h2>
            <p className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] max-w-2xl mx-auto">
              Highly decorated martial artists, passionate teachers, and dedicated mentors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Anton */}
            <div className="p-6 md:p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <div className="w-20 h-20 rounded-full bg-[#e2e2e2] dark:bg-[#303030] mx-auto mb-6 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white">AT</span>
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 text-center">
                Anton Talamantes
              </h3>
              <p className="text-sm text-[#777777] text-center mb-4">"El Terrible"</p>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed text-center">
                37 years wrestling experience. 18 years Jiu-Jitsu. Two-time state champion wrestler.
                Professional MMA career. A true legend in Fort Wayne martial arts.
              </p>
            </div>

            {/* Nick */}
            <div className="p-6 md:p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <div className="w-20 h-20 rounded-full bg-[#e2e2e2] dark:bg-[#303030] mx-auto mb-6 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white">NS</span>
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 text-center">
                Nick Strahm
              </h3>
              <p className="text-sm text-[#777777] text-center mb-4">Purple Belt</p>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed text-center">
                Marine and Army veteran. Three tours in Iraq. Discovered Jiu-Jitsu as a path to healing.
                Passionate about working with beginners and children.
              </p>
            </div>

            {/* Andrew */}
            <div className="p-6 md:p-8 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <div className="w-20 h-20 rounded-full bg-[#e2e2e2] dark:bg-[#303030] mx-auto mb-6 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white">AO</span>
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 text-center">
                Andrew Oberlin
              </h3>
              <p className="text-sm text-[#777777] text-center mb-4">Founder</p>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed text-center">
                35+ years wrestling experience. Visionary behind The Fort Wrestling Facility and
                The Fort Jiu-Jitsu. Dedicated to building great people, not just great fighters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section id="locations" className="py-24 md:py-32 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              Two Locations, One Community
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1b1b1b] dark:text-white mb-6">
              Train With Us
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Wrestling Facility */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-[#1b1b1b] dark:text-white" />
                <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white">
                  The Fort Wrestling Facility
                </h3>
              </div>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-4">
                1519 Goshen Road<br />
                Fort Wayne, IN 46808
              </p>
              <a
                href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#1b1b1b] dark:text-white font-medium hover:underline"
              >
                Get Directions <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Jiu-Jitsu Facility */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#1b1b1b] rounded-2xl border border-[#e2e2e2] dark:border-[#303030]">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-[#1b1b1b] dark:text-white" />
                <h3 className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white">
                  The Fort Jiu-Jitsu
                </h3>
              </div>
              <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-4">
                1724 Prairie Lane<br />
                Fort Wayne, IN
              </p>
              <a
                href="https://maps.google.com/?q=1724+Prairie+Lane+Fort+Wayne+IN"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#1b1b1b] dark:text-white font-medium hover:underline"
              >
                Get Directions <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 md:py-32 bg-[#1b1b1b] dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg md:text-xl text-[#b9b9b9] mb-12 max-w-2xl mx-auto">
            Whether you're a seasoned wrestler, a Jiu-Jitsu practitioner, or a complete beginner,
            our world-class instructors will empower you to achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:8778483678"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#e2e2e2] transition-all transform hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              (877) 848-3678
            </a>
            <a
              href="https://fortwrestling.pushpress.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white px-8 py-4 rounded-full font-medium border-2 border-[#5e5e5e] hover:border-white transition-colors"
            >
              View Schedule
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 bg-white dark:bg-[#0a0a0a] border-t border-[#e2e2e2] dark:border-[#303030]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-serif text-xl md:text-2xl font-bold text-[#1b1b1b] dark:text-white">
              The Fort Jiu-Jitsu
            </div>
            <div className="flex items-center gap-6 md:gap-8 text-[#5e5e5e] dark:text-[#b9b9b9]">
              <Link href="#about" className="hover:text-[#1b1b1b] dark:hover:text-white transition-colors">
                About
              </Link>
              <Link href="#programs" className="hover:text-[#1b1b1b] dark:hover:text-white transition-colors">
                Programs
              </Link>
              <Link href="#instructors" className="hover:text-[#1b1b1b] dark:hover:text-white transition-colors">
                Instructors
              </Link>
              <Link href="#contact" className="hover:text-[#1b1b1b] dark:hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-sm text-[#777777]">
              &copy; {new Date().getFullYear()} The Fort Jiu-Jitsu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
