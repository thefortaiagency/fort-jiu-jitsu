'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, QrCode, CheckCircle, XCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CheckInStatus = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

export default function KioskScan() {
  const [status, setStatus] = useState<CheckInStatus>('idle');
  const [message, setMessage] = useState('');
  const [memberName, setMemberName] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: 'environment' },
          config,
          async (decodedText) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            setStatus('processing');

            try {
              const response = await fetch('/api/kiosk/check-in-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCode: decodedText }),
              });

              const data = await response.json();

              if (response.ok) {
                setStatus('success');
                setMemberName(data.memberName);
                setMessage(data.alreadyCheckedIn ? 'Already checked in today!' : 'Check-in successful!');

                // Stop scanner
                if (scannerRef.current) {
                  await scannerRef.current.stop();
                }

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
                  setStatus('scanning');
                  isProcessingRef.current = false;
                }, 3000);
              }
            } catch (error) {
              console.error('Check-in error:', error);
              setStatus('error');
              setMessage('Check-in failed. Please try again.');

              // Reset after 3 seconds
              setTimeout(() => {
                setStatus('scanning');
                isProcessingRef.current = false;
              }, 3000);
            }
          },
          undefined
        );

        setStatus('scanning');
      } catch (err) {
        console.error('Scanner error:', err);
        setStatus('error');
        setMessage('Failed to start camera. Please check permissions.');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [router]);

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
          <h1 className="text-2xl font-bold">QR Code Check-In</h1>
          <p className="text-white/60">Position your QR code in the frame</p>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {status === 'idle' || status === 'scanning' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Scanner */}
              <div className="relative">
                <div
                  id="qr-reader"
                  className="rounded-3xl overflow-hidden border-4 border-white/20"
                  style={{ width: '100%' }}
                />
                {status === 'scanning' && (
                  <motion.div
                    className="absolute inset-0 border-4 border-white rounded-3xl pointer-events-none"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </div>

              {/* Instructions */}
              <div className="text-center bg-white/5 border border-white/20 rounded-3xl p-8">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-white/60" />
                <h3 className="text-2xl font-bold mb-2">Scan Your QR Code</h3>
                <p className="text-white/60 text-lg">
                  Hold your membership card QR code in front of the camera
                </p>
              </div>
            </motion.div>
          ) : status === 'processing' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-white/5 border border-white/20 rounded-3xl p-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-24 h-24 mx-auto mb-6"
              >
                <div className="w-full h-full border-4 border-white/20 border-t-white rounded-full" />
              </motion.div>
              <h3 className="text-3xl font-bold">Processing...</h3>
            </motion.div>
          ) : status === 'success' ? (
            <motion.div
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
              <p className="text-white/60 mt-4">Please try again...</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-white/40 text-sm border-t border-white/10">
        <p>Having trouble? Contact staff at the front desk</p>
      </div>
    </div>
  );
}
