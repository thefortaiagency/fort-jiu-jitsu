'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  QrCode,
  Camera,
  Keyboard,
  DollarSign,
  CreditCard,
  FileSignature,
} from 'lucide-react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import Image from 'next/image';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  program: string;
  status: string;
}

interface CheckInResult {
  success: boolean;
  member?: Member;
  message: string;
}

export default function PersonalCheckIn() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'scan' | 'manual' | 'dropin' | 'waiver'>('scan');
  const [dropInForm, setDropInForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [isProcessingDropIn, setIsProcessingDropIn] = useState(false);
  const [waiverForm, setWaiverForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    signerName: '',
    waiverAgreed: false
  });
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isProcessingWaiver, setIsProcessingWaiver] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Focus manual input when in manual mode
  useEffect(() => {
    if (mode === 'manual' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [mode]);

  // Handle camera scanning
  const startScanner = useCallback(async () => {
    console.log('startScanner called');

    if (scannerRef.current) {
      console.log('Scanner already exists, skipping');
      return;
    }

    const container = document.getElementById('qr-reader');
    if (!container) {
      console.log('Container qr-reader not found');
      return;
    }

    console.log('Starting scanner...');
    setCameraError(null);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          console.log('Scanned:', decodedText);
          if (scannerRef.current) {
            try {
              await scannerRef.current.stop();
              scannerRef.current = null;
            } catch (e) {
              console.error('Error stopping after scan:', e);
            }
          }
          setIsScanning(false);
          await handleScannedCode(decodedText);
        },
        () => {}
      );

      console.log('Scanner started successfully');
      setIsScanning(true);
    } catch (err) {
      console.error('Camera error:', err);
      scannerRef.current = null;
      setCameraError(
        err instanceof Error
          ? err.message
          : 'Failed to access camera. Please allow camera permissions or use manual entry.'
      );
    }
  }, []);

  const stopScanner = useCallback(async () => {
    console.log('stopScanner called, ref exists:', !!scannerRef.current);
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        console.log('Scanner stopped successfully');
      } catch (err) {
        console.error('Error stopping scanner:', err);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  }, []);

  // Start/stop scanner based on mode
  useEffect(() => {
    console.log('Mode changed to:', mode);
    if (mode === 'scan') {
      const timer = setTimeout(() => {
        console.log('Timer fired, calling startScanner');
        startScanner();
      }, 500);
      return () => {
        console.log('Cleanup: clearing timer and stopping scanner');
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [mode, startScanner, stopScanner]);

  async function handleScannedCode(code: string) {
    console.log('handleScannedCode called with:', code);
    if (isLoading) {
      console.log('Already loading, skipping');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/members/lookup?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.member) {
        await handleCheckIn(data.member);
      } else {
        setCheckInResult({
          success: false,
          message: 'Member not found. Please try again or ask staff for help.',
        });
        setTimeout(() => {
          setCheckInResult(null);
          if (mode === 'scan') {
            startScanner();
          }
        }, 3000);
      }
    } catch (error) {
      setCheckInResult({
        success: false,
        message: 'Lookup failed. Please try again.',
      });
      setTimeout(() => {
        setCheckInResult(null);
        if (mode === 'scan') {
          startScanner();
        }
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckIn(member: Member) {
    setIsLoading(true);
    setCheckInResult(null);

    try {
      const res = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: member.id,
          check_in_method: mode === 'scan' ? 'qr_scan' : 'manual',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const monthlyRes = await fetch(`/api/check-in?memberId=${member.id}`);
        const monthlyData = await monthlyRes.json();
        const monthlyCount = monthlyData.thisMonthCount || 1;

        window.location.href = `/check-in/success?name=${encodeURIComponent(member.first_name)}&count=${monthlyCount}`;
      } else {
        setCheckInResult({
          success: false,
          member,
          message: data.error || 'Check-in failed',
        });
      }
    } catch (error) {
      setCheckInResult({
        success: false,
        member,
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setBarcodeInput('');

      setTimeout(() => {
        setCheckInResult(null);
      }, 4000);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    await handleScannedCode(barcodeInput.trim());
    setBarcodeInput('');
    barcodeInputRef.current?.focus();
  }

  const handleDropInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropInForm.firstName || !dropInForm.lastName || !dropInForm.email) return;

    setIsProcessingDropIn(true);
    try {
      const res = await fetch('/api/drop-in/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dropInForm),
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setCheckInResult({
          success: false,
          message: data.error || 'Failed to process drop-in. Please try again.',
        });
        setTimeout(() => setCheckInResult(null), 4000);
      }
    } catch (error) {
      setCheckInResult({
        success: false,
        message: 'Network error. Please try again.',
      });
      setTimeout(() => setCheckInResult(null), 4000);
    } finally {
      setIsProcessingDropIn(false);
    }
  };

  // Initialize canvas when waiver mode is active
  useEffect(() => {
    if (mode === 'waiver' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [mode]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL('image/png'));
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleWaiverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!waiverForm.firstName || !waiverForm.lastName || !waiverForm.email) {
      setCheckInResult({ success: false, message: 'Please fill in all required fields' });
      setTimeout(() => setCheckInResult(null), 4000);
      return;
    }

    if (!waiverForm.waiverAgreed) {
      setCheckInResult({ success: false, message: 'You must agree to the waiver terms' });
      setTimeout(() => setCheckInResult(null), 4000);
      return;
    }

    if (!signatureData) {
      setCheckInResult({ success: false, message: 'Please sign the waiver' });
      setTimeout(() => setCheckInResult(null), 4000);
      return;
    }

    if (!waiverForm.signerName.trim()) {
      setCheckInResult({ success: false, message: 'Please type your full legal name' });
      setTimeout(() => setCheckInResult(null), 4000);
      return;
    }

    setIsProcessingWaiver(true);
    try {
      const res = await fetch('/api/waiver-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...waiverForm,
          signatureData,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = `/check-in/success?name=${encodeURIComponent(data.member.firstName)}&count=1`;
      } else {
        setCheckInResult({
          success: false,
          message: data.error || 'Failed to sign waiver. Please try again.',
        });
        setTimeout(() => setCheckInResult(null), 4000);
      }
    } catch (error) {
      setCheckInResult({
        success: false,
        message: 'Network error. Please try again.',
      });
      setTimeout(() => setCheckInResult(null), 4000);
    } finally {
      setIsProcessingWaiver(false);
    }
  };

  const modeButtons = [
    { id: 'scan' as const, label: 'Scan QR', icon: Camera, desc: 'Use camera' },
    { id: 'manual' as const, label: 'Type Code', icon: Keyboard, desc: 'Enter manually' },
    { id: 'dropin' as const, label: 'Drop-in', icon: DollarSign, desc: '$20 visitor' },
    { id: 'waiver' as const, label: 'Sign Waiver', icon: FileSignature, desc: 'First time' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Watermark Logo Background */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="relative w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] opacity-[0.07]">
          <Image
            src="/jiu-jitsu.png"
            alt=""
            fill
            className="object-contain invert"
            priority
          />
        </div>
      </div>

      {/* Header with Logo */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-gray-800/50 px-4 py-4 md:py-6 sticky top-0 z-40 relative">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-400 text-sm md:text-base mb-3">Personal Check-In</p>

          <div className="flex items-center justify-center">
            <div className="relative w-40 h-12 md:w-56 md:h-16">
              <Image
                src="/jiu-jitsu.png"
                alt="The Fort Jiu-Jitsu"
                fill
                className="object-contain invert"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10 pb-32 relative z-10">
        {/* Success/Error Message - Full Screen Overlay */}
        <AnimatePresence>
          {checkInResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`w-full max-w-lg p-8 md:p-12 rounded-3xl text-center ${
                  checkInResult.success
                    ? 'bg-gradient-to-br from-green-900 to-green-950 border-2 border-green-500'
                    : 'bg-gradient-to-br from-red-900 to-red-950 border-2 border-red-500'
                }`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  {checkInResult.success ? (
                    <CheckCircle className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 text-green-400" />
                  ) : (
                    <XCircle className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 text-red-400" />
                  )}
                </motion.div>
                <h2
                  className={`text-3xl md:text-5xl font-bold mb-4 ${
                    checkInResult.success ? 'text-green-300' : 'text-red-300'
                  }`}
                >
                  {checkInResult.message}
                </h2>
                {checkInResult.member && (
                  <p className="text-xl md:text-2xl text-gray-300 capitalize">
                    {checkInResult.member.program?.replace('-', ' ')} Program
                  </p>
                )}
                <p className="text-gray-500 mt-6 text-sm">This will close automatically...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8">
          {modeButtons.map((btn) => (
            <motion.button
              key={btn.id}
              onClick={() => setMode(btn.id)}
              whileTap={{ scale: 0.95 }}
              className={`relative p-4 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-300 ${
                mode === btn.id
                  ? 'bg-white text-black shadow-2xl shadow-white/20'
                  : 'bg-gray-900/80 border border-gray-800 hover:bg-gray-800/80 hover:border-gray-700'
              }`}
            >
              <btn.icon className={`w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 ${
                mode === btn.id ? 'text-black' : 'text-gray-400'
              }`} />
              <p className={`font-bold text-sm md:text-xl ${
                mode === btn.id ? 'text-black' : 'text-white'
              }`}>
                {btn.label}
              </p>
              <p className={`text-xs md:text-sm mt-1 hidden md:block ${
                mode === btn.id ? 'text-gray-600' : 'text-gray-500'
              }`}>
                {btn.desc}
              </p>
              {mode === btn.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-2xl md:rounded-3xl -z-10"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Camera Scan Mode */}
        <AnimatePresence mode="wait">
          {mode === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-6 md:p-10">
                {cameraError ? (
                  <div className="text-center py-8">
                    <XCircle className="w-20 h-20 mx-auto mb-6 text-red-500" />
                    <p className="text-red-400 text-xl mb-6">{cameraError}</p>
                    <button
                      onClick={() => {
                        setCameraError(null);
                        startScanner();
                      }}
                      className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-xl md:text-2xl text-gray-300">
                        Scan your <span className="text-white font-bold">QR code</span> from the Member Portal
                      </p>
                    </div>
                    <div
                      id="qr-reader"
                      ref={scannerContainerRef}
                      className="mx-auto rounded-2xl overflow-hidden bg-black border-4 border-gray-700"
                      style={{ maxWidth: '400px' }}
                    />
                    {isLoading && (
                      <div className="text-center mt-6">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full mx-auto mb-4"
                        />
                        <p className="text-xl text-white">Processing...</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Help text */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm mb-2">Don&apos;t have your QR code?</p>
                <Link href="/member" className="text-white/70 hover:text-white underline text-sm">
                  Log in to Member Portal to get it
                </Link>
              </div>
            </motion.div>
          )}

          {/* Manual Entry Mode */}
          {mode === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <form onSubmit={handleManualSubmit}>
                <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-8 md:p-12 text-center">
                  <QrCode className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-6 text-gray-600" />
                  <p className="text-xl md:text-2xl text-gray-300 mb-8">
                    Enter your <span className="text-white font-bold">member ID</span> or <span className="text-white font-bold">last 4 digits of phone</span>
                  </p>
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Type here..."
                    className="w-full bg-black border-2 border-gray-700 rounded-2xl px-6 py-5 md:py-6 text-2xl md:text-3xl text-center focus:ring-4 focus:ring-white/20 focus:border-white transition-all"
                    autoFocus
                    autoComplete="off"
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoading || !barcodeInput.trim()}
                    whileTap={{ scale: 0.98 }}
                    className="mt-8 w-full bg-gradient-to-r from-white to-gray-100 text-black font-bold py-5 md:py-6 rounded-2xl text-xl md:text-2xl hover:from-gray-100 hover:to-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-3 border-gray-400 border-t-black rounded-full"
                        />
                        Processing...
                      </span>
                    ) : (
                      'Check In'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Drop-in Mode */}
          {mode === 'dropin' && (
            <motion.div
              key="dropin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <form onSubmit={handleDropInSubmit}>
                <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 border border-green-700/50 rounded-3xl p-6 md:p-10">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-10 h-10 md:w-12 md:h-12 text-green-400" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Drop-in Visitor</h2>
                    <p className="text-lg text-green-300/80">$20 single class - Try a class today!</p>
                  </div>

                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={dropInForm.firstName}
                        onChange={(e) => setDropInForm({ ...dropInForm, firstName: e.target.value })}
                        placeholder="First Name *"
                        required
                        className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                      <input
                        type="text"
                        value={dropInForm.lastName}
                        onChange={(e) => setDropInForm({ ...dropInForm, lastName: e.target.value })}
                        placeholder="Last Name *"
                        required
                        className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                    <input
                      type="email"
                      value={dropInForm.email}
                      onChange={(e) => setDropInForm({ ...dropInForm, email: e.target.value })}
                      placeholder="Email Address *"
                      required
                      className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                    <input
                      type="tel"
                      value={dropInForm.phone}
                      onChange={(e) => setDropInForm({ ...dropInForm, phone: e.target.value })}
                      placeholder="Phone (optional)"
                      className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isProcessingDropIn || !dropInForm.firstName || !dropInForm.lastName || !dropInForm.email}
                    whileTap={{ scale: 0.98 }}
                    className="mt-8 w-full max-w-md mx-auto block bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-5 rounded-2xl text-xl hover:from-green-500 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  >
                    {isProcessingDropIn ? (
                      <span className="flex items-center justify-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                        />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <CreditCard className="w-6 h-6" />
                        Pay $20 &amp; Check In
                      </span>
                    )}
                  </motion.button>

                  <p className="text-center text-gray-500 text-sm mt-4">
                    Secure payment powered by Stripe
                  </p>
                </div>
              </form>
            </motion.div>
          )}

          {/* Sign Waiver Mode */}
          {mode === 'waiver' && (
            <motion.div
              key="waiver"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <form onSubmit={handleWaiverSubmit}>
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-700/50 rounded-3xl p-6 md:p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileSignature className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Sign Waiver & Check In</h2>
                    <p className="text-blue-300/80">First time? Sign the waiver and you&apos;re ready to train!</p>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-4 max-w-lg mx-auto mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={waiverForm.firstName}
                        onChange={(e) => setWaiverForm({ ...waiverForm, firstName: e.target.value })}
                        placeholder="First Name *"
                        required
                        className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <input
                        type="text"
                        value={waiverForm.lastName}
                        onChange={(e) => setWaiverForm({ ...waiverForm, lastName: e.target.value })}
                        placeholder="Last Name *"
                        required
                        className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <input
                      type="email"
                      value={waiverForm.email}
                      onChange={(e) => setWaiverForm({ ...waiverForm, email: e.target.value })}
                      placeholder="Email Address *"
                      required
                      className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="tel"
                        value={waiverForm.phone}
                        onChange={(e) => setWaiverForm({ ...waiverForm, phone: e.target.value })}
                        placeholder="Phone (optional)"
                        className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <input
                        type="date"
                        value={waiverForm.dateOfBirth}
                        onChange={(e) => setWaiverForm({ ...waiverForm, dateOfBirth: e.target.value })}
                        placeholder="Date of Birth"
                        className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Waiver Text */}
                  <div className="max-w-lg mx-auto mb-4">
                    <h3 className="text-lg font-bold text-white mb-2">Liability Waiver</h3>
                    <div className="bg-black/50 border border-gray-700 rounded-xl p-4 h-40 overflow-y-auto text-sm text-gray-300">
                      <p className="mb-3">
                        <strong>WAIVER AND RELEASE OF LIABILITY</strong> - In consideration of being allowed to participate in Brazilian Jiu-Jitsu classes at The Fort Jiu-Jitsu, I acknowledge and agree:
                      </p>
                      <p className="mb-2">
                        <strong>1. ASSUMPTION OF RISK:</strong> I understand BJJ involves physical contact and inherent risks including injuries. I voluntarily assume all such risks.
                      </p>
                      <p className="mb-2">
                        <strong>2. RELEASE OF LIABILITY:</strong> I release The Fort Jiu-Jitsu from any liability for injuries sustained while training.
                      </p>
                      <p className="mb-2">
                        <strong>3. MEDICAL ACKNOWLEDGMENT:</strong> I certify I am physically fit to participate and will inform instructors of any health conditions.
                      </p>
                      <p className="mb-2">
                        <strong>4. PHOTO/VIDEO RELEASE:</strong> I grant permission for photos/videos taken during training to be used for promotional purposes.
                      </p>
                      <p className="font-bold">
                        I HAVE READ THIS WAIVER AND FULLY UNDERSTAND ITS TERMS. I SIGN IT FREELY AND VOLUNTARILY.
                      </p>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <div className="max-w-lg mx-auto mb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={waiverForm.waiverAgreed}
                        onChange={(e) => setWaiverForm({ ...waiverForm, waiverAgreed: e.target.checked })}
                        className="mt-1 w-5 h-5 rounded border-gray-700 bg-black text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">
                        I have read, understand, and agree to the Waiver and Release of Liability.
                      </span>
                    </label>
                  </div>

                  {/* Signature Pad */}
                  <div className="max-w-lg mx-auto mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Your Signature <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-gray-700 rounded-xl overflow-hidden bg-white">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={150}
                        className="w-full touch-none cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-400">Sign above using your finger or mouse</p>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-xs text-red-400 hover:text-red-300 underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Typed Name */}
                  <div className="max-w-lg mx-auto mb-6">
                    <input
                      type="text"
                      value={waiverForm.signerName}
                      onChange={(e) => setWaiverForm({ ...waiverForm, signerName: e.target.value })}
                      placeholder="Type your full legal name *"
                      className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isProcessingWaiver || !waiverForm.firstName || !waiverForm.lastName || !waiverForm.email || !waiverForm.waiverAgreed || !signatureData || !waiverForm.signerName}
                    whileTap={{ scale: 0.98 }}
                    className="w-full max-w-lg mx-auto block bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-5 rounded-2xl text-xl hover:from-blue-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  >
                    {isProcessingWaiver ? (
                      <span className="flex items-center justify-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                        />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-6 h-6" />
                        Sign Waiver & Check In
                      </span>
                    )}
                  </motion.button>

                  {/* Alternative Options */}
                  <div className="max-w-lg mx-auto mt-6 pt-4 border-t border-blue-800/50">
                    <p className="text-center text-gray-400 text-sm mb-3">Want to become a member?</p>
                    <div className="flex gap-3">
                      <Link
                        href="/signup"
                        className="flex-1 bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl text-center hover:bg-white/20 transition-all text-sm"
                      >
                        Start Free Trial
                      </Link>
                      <button
                        type="button"
                        onClick={() => setMode('dropin')}
                        className="flex-1 bg-green-600/20 border border-green-500/30 text-green-400 font-medium py-3 rounded-xl hover:bg-green-600/30 transition-all text-sm"
                      >
                        $20 Drop-in
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-gray-800/50 px-4 py-4 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm md:text-base text-gray-500">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src="/jiu-jitsu.png"
                alt="The Fort"
                fill
                className="object-contain opacity-50 invert"
              />
            </div>
            <span>The Fort Jiu-Jitsu</span>
          </div>
          <span className="text-gray-600">Scan QR or enter your code</span>
        </div>
      </footer>
    </div>
  );
}
