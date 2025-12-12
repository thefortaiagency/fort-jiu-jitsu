'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Image
              src="/jiu-jitsu.png"
              alt="The Fort Jiu-Jitsu"
              width={180}
              height={60}
              className="invert mb-6"
            />
            <p className="text-[#777777] leading-relaxed">
              Fort Wayne's premier integrated grappling academy. Where wrestling meets Jiu-Jitsu.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-[#777777] hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-[#777777] hover:text-white transition-colors">
                  Class Schedule
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="text-[#777777] hover:text-white transition-colors">
                  Our Instructors
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#777777] hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Programs</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/schedule#kids-classes" className="text-[#777777] hover:text-white transition-colors">
                  Kids Gi Classes
                </Link>
              </li>
              <li>
                <Link href="/schedule#adult-classes" className="text-[#777777] hover:text-white transition-colors">
                  Adult Gi Classes
                </Link>
              </li>
              <li>
                <Link href="/schedule#morning-rolls" className="text-[#777777] hover:text-white transition-colors">
                  Morning Rolls
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#777777] hover:text-white transition-colors">
                  Private Training
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:2604527615"
                  className="flex items-center gap-3 text-[#777777] hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  (260) 452-7615
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-[#777777] hover:text-white transition-colors"
                >
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>1519 Goshen Road<br />Fort Wayne, IN 46808</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#303030] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#777777]">
            &copy; {new Date().getFullYear()} The Fort Jiu-Jitsu. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/kiosk"
              className="text-xs text-[#444444] hover:text-[#666666] transition-colors"
            >
              Kiosk
            </Link>
            <p className="text-sm text-[#777777]">
              Part of The Fort Wrestling Facility
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
