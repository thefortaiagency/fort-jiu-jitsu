'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Delete, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CheckInStatus = 'idle' | 'processing' | 'success' | 'error';

export default function KioskPin() {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<CheckInStatus>('idle');
  const [message, setMessage] = useState('');
  const [memberName, setMemberName] = useState('');
  const router = useRouter();

  const handleNumberClick = (num: string) => {
    if (pin.length < 4 && status === 'idle') {
      setPin(pin + num);
    }
  };

  const handleClear = () => {
    setPin('');
    setStatus('idle');
    setMessage('');
    setMemberName('');
  };

  const handleSubmit = async () => {
    if (pin.length !== 4 || status !== 'idle') return;

    setStatus('processing');

    try {
      const response = await fetch('/api/kiosk/check-in-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMemberName(data.memberName);
        setMessage(data.alreadyCheckedIn ? 'Already checked in today!' : 'Check-in successful!');

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/kiosk');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Check-in failed');
        if (data.memberName) {
          setMemberName(data.memberName);
        }

        // Reset after 3 seconds
        setTimeout(() => {
          handleClear();
        }, 3000);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setStatus('error');
      setMessage('Check-in failed. Please try again.');

      // Reset after 3 seconds
      setTimeout(() => {
        handleClear();
      }, 3000);
    }
  };

  const renderPinDots = () => {
    return (
      <div className="flex gap-4 justify-center mb-8">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-6 h-6 rounded-full border-4 transition-all duration-200 ${
              i < pin.length
                ? 'bg-white border-white'
                : 'bg-transparent border-white/40'
            }`}
            animate={i === pin.length - 1 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    );
  };

  const NumberButton = ({ num }: { num: string }) => (
    <motion.button
      onClick={() => handleNumberClick(num)}
      whileTap={{ scale: 0.95 }}
      className="bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 rounded-3xl p-8 text-4xl font-bold transition-all duration-200 active:bg-white/30 min-h-[100px] touch-manipulation"
      disabled={status !== 'idle'}
    >
      {num}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-white/10">
        <Link
          href="/kiosk"
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">PIN Check-In</h1>
          <p className="text-white/60">Enter your 4-digit PIN</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {status === 'idle' || status === 'processing' ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* PIN Display */}
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center mb-8">Enter PIN</h2>
                  {renderPinDots()}
                  {status === 'processing' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-white/60 text-lg"
                    >
                      Processing...
                    </motion.p>
                  )}
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <NumberButton key={num} num={num} />
                  ))}
                  <motion.button
                    onClick={handleClear}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/40 hover:border-red-500/60 rounded-3xl p-8 text-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 min-h-[100px] touch-manipulation"
                    disabled={status !== 'idle'}
                  >
                    <Delete className="w-6 h-6" />
                    Clear
                  </motion.button>
                  <NumberButton num="0" />
                  <motion.button
                    onClick={handleSubmit}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/40 hover:border-green-500/60 rounded-3xl p-8 text-xl font-bold transition-all duration-200 min-h-[100px] touch-manipulation ${
                      pin.length === 4 && status === 'idle'
                        ? 'opacity-100'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                    disabled={pin.length !== 4 || status !== 'idle'}
                  >
                    Submit
                  </motion.button>
                </div>
              </motion.div>
            ) : status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-green-500/10 border-2 border-green-500 rounded-3xl p-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-500" />
                </motion.div>
                <h3 className="text-4xl font-bold mb-4">Welcome, {memberName}!</h3>
                <p className="text-2xl text-green-400">{message}</p>
                <p className="text-white/60 mt-4">Redirecting...</p>
              </motion.div>
            ) : (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-red-500/10 border-2 border-red-500 rounded-3xl p-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <XCircle className="w-24 h-24 mx-auto mb-6 text-red-500" />
                </motion.div>
                <h3 className="text-4xl font-bold mb-4">Check-In Failed</h3>
                {memberName && <p className="text-2xl mb-2">{memberName}</p>}
                <p className="text-2xl text-red-400">{message}</p>
                <p className="text-white/60 mt-4">Resetting...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-white/40 text-sm border-t border-white/10">
        <p>Having trouble? Contact staff at the front desk</p>
      </div>
    </div>
  );
}
