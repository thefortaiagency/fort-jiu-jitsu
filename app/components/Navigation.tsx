'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/instructors', label: 'Instructors' },
  { href: '/signup', label: 'Sign Up' },
  { href: '/contact', label: 'Contact' },
  { href: '/member', label: 'Member Portal' },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="relative z-10">
          <Image
            src="/jiu-jitsu.png"
            alt="The Fort Jiu-Jitsu"
            width={120}
            height={40}
            className="dark:invert w-[100px] md:w-[120px] h-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-[#1b1b1b] dark:text-white'
                  : 'text-[#5e5e5e] hover:text-[#1b1b1b] dark:text-[#b9b9b9] dark:hover:text-white'
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#1b1b1b] dark:bg-white rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href="tel:2604527615"
            className="flex items-center gap-2 text-sm font-medium text-[#5e5e5e] hover:text-[#1b1b1b] dark:text-[#b9b9b9] dark:hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4" />
            (260) 452-7615
          </a>
          <Link
            href="/signup"
            className="bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-all hover:scale-105"
          >
            Join Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#1b1b1b] dark:text-white relative z-10"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white dark:bg-[#0a0a0a] border-t border-[#e2e2e2] dark:border-[#303030] overflow-hidden"
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-[#f9f9f9] dark:bg-[#1b1b1b] text-[#1b1b1b] dark:text-white'
                        : 'text-[#5e5e5e] dark:text-[#b9b9b9]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="pt-4"
              >
                <a
                  href="tel:2604527615"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full border-2 border-[#e2e2e2] dark:border-[#303030] text-[#1b1b1b] dark:text-white font-medium mb-3"
                >
                  <Phone className="w-5 h-5" />
                  (260) 452-7615
                </a>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-6 py-3 rounded-full font-medium text-center"
                >
                  Join Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
