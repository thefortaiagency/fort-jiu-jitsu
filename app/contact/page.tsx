'use client';

import { useState } from 'react';
import { Phone, MapPin, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { FadeIn, StaggerChildren, StaggerItem } from '../components/ScrollAnimations';

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interest: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setIsSubmitted(true);
      setFormState({ name: '', email: '', phone: '', message: '', interest: 'general' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
              Get In Touch
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#1b1b1b] dark:text-white mb-6 leading-tight">
              Start Your Journey
            </h1>
            <p className="text-lg md:text-xl text-[#5e5e5e] dark:text-[#b9b9b9] leading-relaxed">
              Ready to begin your Jiu-Jitsu journey? Reach out to us and we'll help you get started.
              Your first class is on us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-white dark:bg-[#1b1b1b]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <FadeIn>
              <div className="bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-3xl p-8 md:p-12">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1b1b1b] dark:text-white mb-8">
                  Send Us a Message
                </h2>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4">
                        Message Sent!
                      </h3>
                      <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-8">
                        We'll get back to you as soon as possible.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-[#1b1b1b] dark:text-white underline hover:no-underline"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                          {error}
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formState.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1b1b1b] border border-[#e2e2e2] dark:border-[#303030] text-[#1b1b1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1b1b1b] dark:focus:ring-white transition-all"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formState.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1b1b1b] border border-[#e2e2e2] dark:border-[#303030] text-[#1b1b1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1b1b1b] dark:focus:ring-white transition-all"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formState.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1b1b1b] border border-[#e2e2e2] dark:border-[#303030] text-[#1b1b1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1b1b1b] dark:focus:ring-white transition-all"
                            placeholder="(260) 555-1234"
                          />
                        </div>
                        <div>
                          <label htmlFor="interest" className="block text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] mb-2">
                            I'm Interested In
                          </label>
                          <select
                            id="interest"
                            name="interest"
                            value={formState.interest}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1b1b1b] border border-[#e2e2e2] dark:border-[#303030] text-[#1b1b1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1b1b1b] dark:focus:ring-white transition-all"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="kids">Kids Classes</option>
                            <option value="adult">Adult Classes</option>
                            <option value="morning">Morning Rolls</option>
                            <option value="private">Private Training</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9] mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formState.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1b1b1b] border border-[#e2e2e2] dark:border-[#303030] text-[#1b1b1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1b1b1b] dark:focus:ring-white transition-all resize-none"
                          placeholder="Tell us about your goals or any questions you have..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-white dark:border-[#1b1b1b] border-t-transparent rounded-full"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>

            {/* Contact Info */}
            <FadeIn delay={0.2}>
              <div className="space-y-8">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1b1b1b] dark:text-white mb-8">
                    Contact Information
                  </h2>

                  <StaggerChildren className="space-y-6">
                    <StaggerItem>
                      <a
                        href="tel:2604527615"
                        className="flex items-start gap-4 p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl hover:bg-[#e2e2e2] dark:hover:bg-[#1b1b1b] transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Phone className="w-5 h-5 text-white dark:text-[#1b1b1b]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#1b1b1b] dark:text-white mb-1">Phone</h3>
                          <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">(260) 452-7615</p>
                        </div>
                      </a>
                    </StaggerItem>

                    <StaggerItem>
                      <a
                        href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl hover:bg-[#e2e2e2] dark:hover:bg-[#1b1b1b] transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <MapPin className="w-5 h-5 text-white dark:text-[#1b1b1b]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#1b1b1b] dark:text-white mb-1">Location</h3>
                          <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
                            1519 Goshen Road<br />
                            Fort Wayne, IN 46808
                          </p>
                        </div>
                      </a>
                    </StaggerItem>

                    <StaggerItem>
                      <div className="flex items-start gap-4 p-6 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-white dark:text-[#1b1b1b]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#1b1b1b] dark:text-white mb-1">Class Hours</h3>
                          <div className="text-[#5e5e5e] dark:text-[#b9b9b9] space-y-1">
                            <p>Mon/Wed/Fri: 5:00 - 6:00 AM (Morning Rolls)</p>
                            <p>Tue/Wed: 5:30 - 6:30 PM (Kids Gi)</p>
                            <p>Tue/Wed: 6:30 - 8:00 PM (Adult Gi)</p>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  </StaggerChildren>
                </div>

                {/* Map Placeholder */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-[#e2e2e2] to-[#f9f9f9] dark:from-[#1b1b1b] dark:to-[#303030] rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/jiu-jitsu.png"
                      alt="The Fort Jiu-Jitsu"
                      width={200}
                      height={100}
                      className="dark:invert opacity-10"
                    />
                  </div>
                  <a
                    href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="px-6 py-3 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] rounded-full font-medium hover:scale-105 transition-transform">
                      Open in Google Maps
                    </span>
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Free Trial CTA */}
      <section className="py-20 bg-[#1b1b1b] dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
              Try Your First Class Free
            </h2>
            <p className="text-lg text-[#b9b9b9] mb-8 max-w-2xl mx-auto">
              Experience The Fort Jiu-Jitsu firsthand. No commitment, no pressure—just
              come train with us and see if we're the right fit for your journey.
            </p>
            <a
              href="tel:2604527615"
              className="inline-flex items-center gap-2 bg-white text-[#1b1b1b] px-8 py-4 rounded-full font-medium hover:bg-[#e2e2e2] transition-all hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              Call (260) 452-7615
            </a>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
