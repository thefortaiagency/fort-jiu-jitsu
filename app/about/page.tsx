'use client';

import { ArrowRight, Shield, Swords, Users, Target, Award, Heart, Droplets, Dumbbell, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { FadeIn, StaggerChildren, StaggerItem } from '../components/ScrollAnimations';

export default function AboutPage() {
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
              About Us
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#1b1b1b] dark:text-white mb-6 leading-tight">
              Building More Than Just Fighters
            </h1>
            <p className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
              The Fort Jiu-Jitsu is built on a foundation of excellence and character,
              where martial arts becomes a journey of self-discovery and personal growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white dark:bg-[#1b1b1b]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#e2e2e2] to-[#f9f9f9] dark:from-[#1b1b1b] dark:to-[#303030] rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/jiu-jitsu.png"
                      alt="The Fort Jiu-Jitsu"
                      width={300}
                      height={150}
                      className="dark:invert opacity-20"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#1b1b1b] dark:bg-white rounded-3xl flex items-center justify-center">
                  <div className="text-center text-white dark:text-[#1b1b1b]">
                    <p className="text-4xl font-bold">2024</p>
                    <p className="text-sm opacity-70">Est.</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
                Our Story
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1b1b1b] dark:text-white mb-6">
                A Legacy of Wrestling, A Future in Jiu-Jitsu
              </h2>
              <div className="space-y-4 text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
                <p>
                  In 2024, The Fort Wrestling Facility proudly acquired Get A Grip Jiu-Jitsu to create
                  a new, integrated grappling powerhouse: The Fort Jiu-Jitsu.
                </p>
                <p>
                  This strategic union bridges the gap between the explosive power of wrestling and the
                  strategic depth of Brazilian Jiu-Jitsu. We offer a seamless path for wrestlers to
                  transition their skills to submission grappling, and for Jiu-Jitsu practitioners to
                  develop a dominant top game.
                </p>
                <p>
                  Our vision is to create a unified community of grapplers who are well-rounded,
                  technically proficient, and mentally tough.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              Our Philosophy
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1b1b1b] dark:text-white mb-6">
              What We Stand For
            </h2>
          </FadeIn>

          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="h-full p-8 bg-white dark:bg-[#1b1b1b] rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-white dark:text-[#1b1b1b]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-3">
                  Discipline
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
                  We believe the lessons learned on the mat extend far beyond the arena.
                  Discipline shapes character and builds champions in life.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full p-8 bg-white dark:bg-[#1b1b1b] rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-white dark:text-[#1b1b1b]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-3">
                  Excellence
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
                  We strive for excellence in everything we do. From technique to
                  attitude, we hold ourselves to the highest standards.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full p-8 bg-white dark:bg-[#1b1b1b] rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6 text-white dark:text-[#1b1b1b]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-3">
                  Community
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
                  We foster an environment where hard work, resilience, and a growth
                  mindset are paramount. We grow together.
                </p>
              </div>
            </StaggerItem>
          </StaggerChildren>

          <FadeIn delay={0.3} className="mt-16 text-center">
            <blockquote className="max-w-2xl mx-auto">
              <p className="font-serif text-2xl md:text-3xl text-[#1b1b1b] dark:text-white italic mb-4">
                "It is not about the destination, it is about the journey."
              </p>
              <cite className="text-[#777777] not-italic">— The Fort Philosophy</cite>
            </blockquote>
          </FadeIn>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-white dark:bg-[#1b1b1b]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              Our Facility
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1b1b1b] dark:text-white mb-6">
              World-Class Training Space
            </h2>
            <p className="text-lg text-[#5e5e5e] dark:text-[#b9b9b9] max-w-2xl mx-auto">
              Train in a purpose-built facility designed for serious grapplers, with everything
              you need to take your skills to the next level.
            </p>
          </FadeIn>

          <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <StaggerItem>
              <div className="text-center p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl">
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-4">
                  <Square className="w-7 h-7 text-white dark:text-[#1b1b1b]" />
                </div>
                <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-1">4,000+</p>
                <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">Sq Ft of Mats</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl">
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-4">
                  <Droplets className="w-7 h-7 text-white dark:text-[#1b1b1b]" />
                </div>
                <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-1">5</p>
                <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">Hot Showers</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl">
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-4">
                  <Dumbbell className="w-7 h-7 text-white dark:text-[#1b1b1b]" />
                </div>
                <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-1">Full</p>
                <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">Weight Room</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl">
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white dark:text-[#1b1b1b]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-1">Pro</p>
                <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">Pull-Up Bars</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl">
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white dark:text-[#1b1b1b]" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-1">Heavy</p>
                <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">Long Bags</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl">
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-white dark:text-[#1b1b1b]" />
                </div>
                <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-1">More</p>
                <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">Equipment</p>
              </div>
            </StaggerItem>
          </StaggerChildren>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4 block">
              Why The Fort
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1b1b1b] dark:text-white mb-6">
              The Unfair Advantage
            </h2>
            <p className="text-lg text-[#5e5e5e] dark:text-[#b9b9b9] max-w-2xl mx-auto">
              We're not just a Jiu-Jitsu academy; we're an integrated grappling institution
              built on one of the most successful wrestling programs in the state.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeIn delay={0.1}>
              <div className="p-8 bg-[#1b1b1b] dark:bg-[#0a0a0a] rounded-3xl text-white">
                <Shield className="w-10 h-10 mb-6 text-[#b9b9b9]" />
                <h3 className="font-serif text-xl font-bold mb-3">The Wrestling Edge</h3>
                <p className="text-[#b9b9b9]">
                  Wrestling is the ultimate art of control. Learn to dominate the takedown,
                  control from top position, and develop grinding pressure that breaks opponents.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="p-8 bg-[#f9f9f9] dark:bg-[#303030] rounded-3xl">
                <Swords className="w-10 h-10 mb-6 text-[#5e5e5e] dark:text-[#b9b9b9]" />
                <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-3">
                  The Jiu-Jitsu Finish
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
                  Master intricate joint locks and chokes, turning every opponent's move
                  into a potential submission opportunity.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1b1b1b] dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-lg text-[#b9b9b9] mb-8">
              Start your journey with Fort Wayne's premier grappling academy.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#e2e2e2] transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
