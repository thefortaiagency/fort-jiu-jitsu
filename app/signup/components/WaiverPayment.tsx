'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FormData } from '../page';
import SignaturePad from './SignaturePad';
import { CheckCircle, Lock, Shield } from 'lucide-react';

interface WaiverPaymentProps {
  formData: FormData;
  onComplete: (signatureData: string, signerName: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function WaiverPayment({ formData, onComplete, onBack, isLoading }: WaiverPaymentProps) {
  const [waiverAgreed, setWaiverAgreed] = useState(formData.waiverAgreed);
  const [signatureData, setSignatureData] = useState<string | null>(formData.signatureData);
  const [signerName, setSignerName] = useState(formData.signerName);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine if member is a minor
  const isMinor = () => {
    if (!formData.dateOfBirth) return false;
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  };

  const getPlanName = () => {
    const plans: Record<string, string> = {
      kids: 'Kids Gi Classes',
      adult: 'Adult Gi Classes',
      family: 'Family Plan',
      'drop-in': 'Drop-in Class',
    };
    return plans[formData.membershipPlan] || 'Membership';
  };

  const getPlanPrice = () => {
    const prices: Record<string, { monthly: number; annual: number }> = {
      kids: { monthly: 75, annual: 750 },
      adult: { monthly: 100, annual: 1000 },
      family: { monthly: 150, annual: 1500 },
      'drop-in': { monthly: 20, annual: 20 },
    };

    const planPrices = prices[formData.membershipPlan];
    if (!planPrices) return 0;

    return formData.billingPeriod === 'monthly' ? planPrices.monthly : planPrices.annual;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!waiverAgreed) {
      newErrors.waiver = 'You must agree to the waiver terms to continue';
    }
    if (!signatureData) {
      newErrors.signature = 'Please sign the waiver';
    }
    if (!signerName.trim()) {
      newErrors.signerName = 'Please type your full legal name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate() && signatureData) {
      onComplete(signatureData, signerName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Review & Sign Waiver</h2>
        <p className="text-gray-400">Almost there! Review your order and sign the liability waiver</p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800">
        <h3 className="text-xl font-serif font-bold mb-6">Order Summary</h3>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">
                {formData.firstName} {formData.lastName}
              </div>
              <div className="text-sm text-gray-400">{formData.email}</div>
            </div>
            <div className="text-sm text-gray-400">Member</div>
          </div>

          {/* Family Members */}
          {formData.familyMembers && formData.familyMembers.length > 0 && (
            <div className="pl-4 border-l-2 border-gray-700 space-y-2">
              {formData.familyMembers.map((member, index) => (
                <div key={member.id} className="flex justify-between">
                  <div className="text-sm">
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="text-sm text-gray-400">Family Member</div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">{getPlanName()}</div>
                <div className="text-sm text-gray-400">
                  {formData.billingPeriod === 'monthly' ? 'Monthly' : 'Annual'} billing
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${getPlanPrice()}</div>
                <div className="text-sm text-gray-400">
                  {formData.membershipPlan !== 'drop-in' &&
                    `per ${formData.billingPeriod === 'monthly' ? 'month' : 'year'}`}
                </div>
              </div>
            </div>

            {formData.billingPeriod === 'annual' && formData.membershipPlan !== 'drop-in' && (
              <div className="text-sm text-green-500 text-right">Save 2 months with annual billing</div>
            )}
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-300 mb-2">What happens next?</p>
              <ul className="space-y-1 text-gray-300">
                <li>• Complete payment via secure Stripe checkout</li>
                <li>• Receive confirmation email with class schedule</li>
                <li>• Your 7-day free trial begins immediately</li>
                <li>• First charge occurs after trial period ends</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Waiver */}
      <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800">
        <h3 className="text-xl font-serif font-bold mb-4">Liability Waiver</h3>

        {/* Waiver Text */}
        <div className="bg-black border border-gray-700 rounded-lg p-6 h-64 overflow-y-auto text-sm mb-6">
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

        {/* Agreement Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={waiverAgreed}
            onChange={(e) => {
              setWaiverAgreed(e.target.checked);
              setErrors((prev) => ({ ...prev, waiver: '' }));
            }}
            className="mt-1 w-5 h-5 rounded border-gray-700 bg-black text-white focus:ring-white"
          />
          <span className="text-sm">
            I have read, understand, and agree to the above Waiver and Release of Liability.
            {isMinor() && ' As the parent/guardian, I am signing on behalf of the minor named above.'}
          </span>
        </label>
        {errors.waiver && <p className="text-sm text-red-500 mb-4">{errors.waiver}</p>}

        {/* Signature Pad */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            {isMinor() ? 'Parent/Guardian Signature' : 'Your Signature'} <span className="text-red-500">*</span>
          </label>
          <SignaturePad
            onSignatureChange={(data) => {
              setSignatureData(data);
              setErrors((prev) => ({ ...prev, signature: '' }));
            }}
          />
          {errors.signature && <p className="mt-2 text-sm text-red-500">{errors.signature}</p>}
        </div>

        {/* Typed Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Type Your Full Legal Name {isMinor() && '(Parent/Guardian)'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => {
              setSignerName(e.target.value);
              setErrors((prev) => ({ ...prev, signerName: '' }));
            }}
            placeholder="Type your full legal name"
            className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.signerName ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
            }`}
          />
          {errors.signerName && <p className="mt-1 text-sm text-red-500">{errors.signerName}</p>}
        </div>
      </div>

      {/* Security & Trust Indicators */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Lock className="w-5 h-5" />
            <span>Secure SSL Encryption</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="w-5 h-5" />
            <span>Protected by Stripe</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CheckCircle className="w-5 h-5" />
            <span>7-Day Free Trial</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-4 px-6 border-2 border-gray-700 text-white font-bold rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 py-4 px-6 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              {formData.membershipPlan === 'drop-in'
                ? `Pay $${getPlanPrice()}`
                : `Start 7-Day Free Trial`}
            </>
          )}
        </button>
      </div>

      {/* Fine Print */}
      <div className="text-center text-sm text-gray-500">
        {formData.membershipPlan !== 'drop-in' && (
          <p className="mb-2">
            Your card will not be charged during the 7-day trial period. Cancel anytime before the trial ends to avoid
            charges.
          </p>
        )}
        <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </motion.div>
  );
}
