'use client';

import { ArrowRight, Award, Trophy, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { FadeIn, StaggerChildren, StaggerItem } from '../components/ScrollAnimations';

const instructors = [
  {
    name: 'Anton Talamantes',
    title: 'Head Instructor',
    rank: 'Black Belt',
    nickname: '"El Terrible"',
    bio: 'Anton Talamantes is a true legend in the Fort Wayne martial arts scene. With an incredible 37 years of wrestling experience and 18 years in Jiu-Jitsu, Anton brings a wealth of knowledge and a warrior\'s spirit to our academy. A two-time state champion wrestler from Fort Wayne Bishop Dwenger, Anton\'s competitive drive led him to a successful professional MMA career. He was instrumental in the founding of The Fort Wrestling Facility and played a key role in the creation of The Fort Jiu-Jitsu.',
    specialties: ['Competition Preparation', 'MMA Integration', 'Wrestling'],
  },
  {
    name: 'Nick Strahm',
    title: 'Instructor',
    rank: 'Brown Belt',
    nickname: null,
    bio: 'Nick Strahm\'s journey is a testament to the healing power of Jiu-Jitsu. A Marine and Army veteran who served three tours in Iraq, Nick discovered Brazilian Jiu-Jitsu as a way to cope with the challenges of post-traumatic stress. The focus, discipline, and camaraderie he found on the mat not only changed his life but also ignited a passion for helping others. He is particularly passionate about working with beginners and children, creating a welcoming and supportive environment.',
    specialties: ['Beginners', 'Kids Classes', 'Fundamentals'],
  },
  {
    name: 'Tracy Yost',
    title: 'Fitness & Wellness Coach',
    rank: 'Practitioner',
    nickname: null,
    bio: 'Tracy Yost is a Personal Trainer and Wellness Coach with over a decade of experience helping clients achieve their personal best. A former collegiate athlete and fitness competitor, Tracy brings a deep understanding of physical fitness and a passion for combat sports. She is an avid practitioner of both boxing and Brazilian Jiu-Jitsu. Tracy\'s unique expertise in both fitness and martial arts makes her an invaluable resource for our students.',
    specialties: ['Strength & Conditioning', 'Wellness', 'Athletic Performance'],
  },
];

export default function InstructorsPage() {
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
              Led by Champions
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#1b1b1b] dark:text-white mb-6 leading-tight">
              Forged in Fort Wayne
            </h1>
            <p className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
              Our instructors are the heart of The Fort Jiu-Jitsu. They are not just highly decorated
              martial artists; they are passionate teachers, dedicated mentors, and pillars of the
              Fort Wayne grappling community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="py-20 bg-white dark:bg-[#1b1b1b]">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {instructors.map((instructor) => (
              <StaggerItem key={instructor.name}>
                <div className="group">
                  {/* Image Placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#e2e2e2] to-[#f9f9f9] dark:from-[#1b1b1b] dark:to-[#303030] rounded-3xl overflow-hidden mb-8 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src="/jiu-jitsu.png"
                        alt="The Fort Jiu-Jitsu"
                        width={200}
                        height={100}
                        className="dark:invert opacity-10"
                      />
                    </div>
                    {/* Rank Badge */}
                    <div className="absolute top-6 left-6">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] rounded-full text-sm font-medium">
                        <Award className="w-4 h-4" />
                        {instructor.rank}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1b1b1b] dark:text-white">
                        {instructor.name}
                      </h2>
                      {instructor.nickname && (
                        <span className="text-[#777777] italic">{instructor.nickname}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#777777] uppercase tracking-wider mb-4">
                      {instructor.title}
                    </p>
                    <p className="text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed mb-6">
                      {instructor.bio}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2">
                      {instructor.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 bg-[#f9f9f9] dark:bg-[#303030] rounded-full text-sm text-[#5e5e5e] dark:text-[#b9b9b9]"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-[#f9f9f9] dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={0.1}>
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6">
                  <Trophy className="w-8 h-8 text-white dark:text-[#1b1b1b]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-3">
                  Competition Tested
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
                  Our instructors have proven their skills on the competition mats,
                  bringing real-world experience to every class.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white dark:text-[#1b1b1b]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-3">
                  Student Focused
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
                  Every student receives personalized attention, with instruction
                  tailored to their individual goals and skill level.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-white dark:text-[#1b1b1b]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1b1b1b] dark:text-white mb-3">
                  Continuous Learning
                </h3>
                <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
                  Our team is committed to ongoing education, regularly training
                  and studying to bring the latest techniques to you.
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
              Ready to Train With Us?
            </h2>
            <p className="text-lg text-[#b9b9b9] mb-8">
              Join our community and start learning from experienced instructors today.
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
