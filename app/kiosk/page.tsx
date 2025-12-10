'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Hash, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function KioskHome() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="p-8 text-center border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/jiu-jitsu.png"
            alt="The Fort Jiu-Jitsu"
            width={400}
            height={200}
            className="mx-auto invert w-full max-w-[300px] h-auto mb-6"
            priority
          />
          <h1 className="text-4xl font-bold mb-2">Member Check-In</h1>
          <div className="flex items-center justify-center gap-2 text-white/60 text-xl">
            <Clock className="w-5 h-5" />
            <span>{formatDate(currentTime)}</span>
            <span className="mx-2">•</span>
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold mb-4">How would you like to check in?</h2>
            <p className="text-white/60 text-lg">Choose your preferred method below</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/kiosk/scan">
                <div className="group relative bg-white/5 border-2 border-white/20 rounded-3xl p-12 hover:bg-white/10 hover:border-white/40 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                    <QrCode className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">Scan QR Code</h3>
                  <p className="text-white/60 text-lg">
                    Use your membership card
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* PIN Entry Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/kiosk/pin">
                <div className="group relative bg-white/5 border-2 border-white/20 rounded-3xl p-12 hover:bg-white/10 hover:border-white/40 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                    <Hash className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">Enter PIN</h3>
                  <p className="text-white/60 text-lg">
                    Use your 4-digit PIN
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-white/40 text-sm border-t border-white/10">
        <p>Need help? Contact staff at the front desk</p>
      </div>
    </div>
  );
}
