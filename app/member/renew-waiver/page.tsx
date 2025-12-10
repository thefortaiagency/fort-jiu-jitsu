'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RenewWaiverPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [email, setEmail] = useState('');
  const [member, setMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('memberEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      loadMember(storedEmail);
    } else {
      setIsLoading(false);
      setError('Please log in to your member portal first');
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [member]);

  const loadMember = async (memberEmail: string) => {
    try {
      const res = await fetch(`/api/member/${encodeURIComponent(memberEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setMember(data.member);
      } else {
        setError('Failed to load member information');
      }
    } catch (err) {
      setError('Failed to load member information');
    } finally {
      setIsLoading(false);
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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

    const { x, y } = getCoordinates(e);
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

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing && hasSignature) {
      const canvas = canvasRef.current;
      if (canvas) {
        setSignatureData(canvas.toDataURL('image/png'));
      }
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureData(null);
  };

  const handleSubmit = async () => {
    if (!waiverAgreed) {
      setError('You must agree to the waiver terms');
      return;
    }
    if (!signatureData) {
      setError('Please sign the waiver');
      return;
    }
    if (!signerName.trim()) {
      setError('Please type your full legal name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/member/renew-waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          signatureData,
          signerName: signerName.trim(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/member');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to renew waiver');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full"
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-2xl p-8 border border-green-900/50 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Waiver Renewed!</h2>
          <p className="text-gray-400 mb-6">
            Your waiver has been successfully renewed. Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 border border-red-900/50 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/member"
            className="inline-block bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200"
          >
            Go to Member Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <Link
          href="/member"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-3">Renew Your Waiver</h1>
          <p className="text-gray-400">
            Hi {member?.firstName}, please review and sign the updated waiver to continue training.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800 space-y-6">
          {/* Waiver Text */}
          <div>
            <h3 className="text-xl font-bold mb-4">Liability Waiver</h3>
            <div className="bg-black border border-gray-700 rounded-lg p-6 h-64 overflow-y-auto text-sm">
              <h4 className="font-bold text-lg mb-4">THE FORT JIU-JITSU - WAIVER AND RELEASE OF LIABILITY</h4>

              <p className="mb-4">
                In consideration of being allowed to participate in any way in Brazilian Jiu-Jitsu classes, training, and
                related activities at The Fort Jiu-Jitsu, I, the undersigned, acknowledge, appreciate, and agree that:
              </p>

              <p className="mb-4">
                <strong>1. ASSUMPTION OF RISK:</strong> I understand that Brazilian Jiu-Jitsu involves physical contact and
                carries inherent risks including but not limited to: bruises, sprains, strains, fractures, joint injuries,
                concussions, and other injuries that may result from training with partners, practicing techniques, or
                participating in sparring. I voluntarily assume all such risks.
              </p>

              <p className="mb-4">
                <strong>2. RELEASE OF LIABILITY:</strong> I hereby release, waive, discharge, and covenant not to sue The
                Fort Jiu-Jitsu, its owners, instructors, employees, and agents from any and all liability, claims, demands,
                actions, and causes of action arising out of or related to any loss, damage, or injury that may be sustained
                while participating in training.
              </p>

              <p className="mb-4">
                <strong>3. MEDICAL ACKNOWLEDGMENT:</strong> I certify that I am physically fit and have no medical condition
                that would prevent my full participation in training. I agree to inform instructors of any injuries or health
                conditions that may affect my ability to train safely.
              </p>

              <p className="mb-4">
                <strong>4. RULES AND REGULATIONS:</strong> I agree to follow all rules and instructions given by instructors
                and staff. I understand that failure to do so may result in termination of my membership without refund.
              </p>

              <p className="mb-4">
                <strong>5. PHOTO/VIDEO RELEASE:</strong> I grant permission for The Fort Jiu-Jitsu to use photographs or
                videos taken during training for promotional purposes.
              </p>

              <p className="mb-4">
                <strong>6. PAYMENT TERMS:</strong> I understand that my membership will automatically renew at the end of
                each billing period until I cancel. I can cancel my membership at any time with 30 days notice.
              </p>

              <p className="mb-4">
                <strong>7. BINDING EFFECT:</strong> This waiver shall be binding upon me, my heirs, executors,
                administrators, and assigns.
              </p>

              <p className="font-bold">
                I HAVE READ THIS WAIVER AND FULLY UNDERSTAND ITS TERMS. I UNDERSTAND THAT I AM GIVING UP SUBSTANTIAL RIGHTS
                BY SIGNING THIS DOCUMENT. I SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.
              </p>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={waiverAgreed}
              onChange={(e) => setWaiverAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-700 bg-black text-white focus:ring-white"
            />
            <span className="text-sm">
              I have read, understand, and agree to the above Waiver and Release of Liability.
            </span>
          </label>

          {/* Signature Pad */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Your Signature <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-gray-700 rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
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
              <p className="text-sm text-gray-400">Sign above using your mouse or finger</p>
              <button
                type="button"
                onClick={clearSignature}
                className="text-sm text-red-500 hover:text-red-400 underline"
              >
                Clear Signature
              </button>
            </div>
          </div>

          {/* Typed Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Type Your Full Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Type your full legal name"
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full"
                />
                Processing...
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5" />
                Sign & Renew Waiver
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
