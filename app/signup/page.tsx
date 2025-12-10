'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SignaturePad from '../components/SignaturePad';
import Link from 'next/link';

type MembershipType = 'kids' | 'adult' | 'drop-in';
type FlowType = 'new' | 'returning-active' | 'returning-inactive' | 'returning-dropin';

interface MemberInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType: string;
  status: string;
  hasValidWaiver: boolean;
  waiverExpires: string | null;
  hasActiveSubscription: boolean;
  memberSince: string;
}

interface FormData {
  // Lookup
  email: string;
  // Member Info
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  membershipType: MembershipType;
  // Parent/Guardian (for minors)
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  // Medical
  medicalConditions: string;
  // Waiver
  waiverAgreed: boolean;
  signatureData: string | null;
  signerName: string;
}

const initialFormData: FormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  membershipType: 'adult',
  parentFirstName: '',
  parentLastName: '',
  parentEmail: '',
  parentPhone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  medicalConditions: '',
  waiverAgreed: false,
  signatureData: null,
  signerName: '',
};

const MEMBERSHIP_PRICES = {
  kids: { name: 'Kids Gi Classes', price: 75, description: 'Tue & Wed 5:30-6:30 PM' },
  adult: { name: 'Adult Gi Classes', price: 100, description: 'Tue & Wed 6:30-8:00 PM + Morning Rolls' },
  'drop-in': { name: 'Drop-in Class', price: 20, description: 'Single class visit' },
};

export default function SignupPage() {
  const [step, setStep] = useState<'email' | 'returning' | 'info' | 'waiver' | 'payment'>('email');
  const [flowType, setFlowType] = useState<FlowType>('new');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMinor = () => {
    if (!formData.dateOfBirth) return false;
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Step 1: Email lookup
  const handleEmailLookup = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/member-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.found && data.member) {
        setMemberInfo(data.member);

        // Determine flow based on member status
        if (data.member.status === 'active' && data.member.hasActiveSubscription) {
          setFlowType('returning-active');
          setStep('returning');
        } else if (data.member.status === 'cancelled' || data.member.status === 'inactive') {
          setFlowType('returning-inactive');
          setStep('returning');
        } else {
          // Pending or other status - might need to complete signup
          setFlowType('returning-dropin');
          setStep('returning');
        }
      } else {
        // New member
        setFlowType('new');
        setStep('info');
      }
    } catch (err) {
      setError('Failed to look up email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle returning member actions
  const handleReturningAction = async (action: 'check-in' | 'drop-in' | 'reactivate') => {
    if (!memberInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      if (action === 'check-in') {
        const response = await fetch('/api/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: memberInfo.id,
            classType: 'general',
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Redirect to check-in success
          window.location.href = `/check-in/success?name=${encodeURIComponent(memberInfo.firstName)}`;
        } else {
          setError(data.error || 'Check-in failed');
        }
      } else if (action === 'drop-in') {
        // Check if waiver needs renewal
        if (!memberInfo.hasValidWaiver) {
          setFlowType('returning-dropin');
          setStep('waiver');
        } else {
          // Go straight to payment
          const response = await fetch('/api/drop-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memberId: memberInfo.id,
              needsWaiver: false,
            }),
          });

          const data = await response.json();

          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          } else {
            setError(data.error || 'Failed to process drop-in');
          }
        }
      } else if (action === 'reactivate') {
        // Go to membership selection
        setFlowType('returning-inactive');
        setStep('payment');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateInfo = () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      setError('Please fill in all required fields');
      return false;
    }
    if (isMinor() && (!formData.parentFirstName || !formData.parentLastName || !formData.parentEmail)) {
      setError('Parent/Guardian information is required for minors');
      return false;
    }
    if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
      setError('Emergency contact information is required');
      return false;
    }
    setError(null);
    return true;
  };

  const validateWaiver = () => {
    if (!formData.waiverAgreed) {
      setError('You must agree to the waiver to continue');
      return false;
    }
    if (!formData.signatureData) {
      setError('Please sign the waiver');
      return false;
    }
    if (!formData.signerName) {
      setError('Please type your full legal name');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 'info' && validateInfo()) {
      setStep('waiver');
    } else if (step === 'waiver' && validateWaiver()) {
      setStep('payment');
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === 'info') setStep('email');
    else if (step === 'waiver') {
      if (flowType === 'new') setStep('info');
      else setStep('returning');
    }
    else if (step === 'payment') setStep('waiver');
    else if (step === 'returning') {
      setStep('email');
      setMemberInfo(null);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Returning member drop-in with renewed waiver
      if (flowType === 'returning-dropin' && memberInfo) {
        const response = await fetch('/api/drop-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: memberInfo.id,
            needsWaiver: true,
            signatureData: formData.signatureData,
            signerName: formData.signerName,
          }),
        });

        const data = await response.json();

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error(data.error || 'Failed to process drop-in');
        }
        return;
      }

      // New member or reactivating member
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        window.location.href = '/signup/success';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  const getProgressSteps = () => {
    if (flowType === 'returning-active') {
      return ['Email', 'Welcome Back'];
    }
    if (flowType === 'returning-dropin' && memberInfo?.hasValidWaiver) {
      return ['Email', 'Options', 'Payment'];
    }
    if (flowType === 'returning-dropin' || flowType === 'returning-inactive') {
      return ['Email', 'Options', 'Waiver', 'Payment'];
    }
    return ['Email', 'Your Info', 'Waiver', 'Payment'];
  };

  const getCurrentStepIndex = () => {
    const steps = getProgressSteps();
    if (step === 'email') return 0;
    if (step === 'returning') return 1;
    if (step === 'info') return 1;
    if (step === 'waiver') return flowType === 'new' ? 2 : steps.indexOf('Waiver');
    if (step === 'payment') return steps.length - 1;
    return 0;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              {getProgressSteps().map((s, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      i <= getCurrentStepIndex() ? 'bg-white text-black' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < getProgressSteps().length - 1 && (
                    <div
                      className={`w-16 md:w-24 h-1 mx-2 transition-colors ${
                        i < getCurrentStepIndex() ? 'bg-white' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              {getProgressSteps().map((s, i) => (
                <span key={i} className={i <= getCurrentStepIndex() ? 'text-white' : 'text-gray-500'}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Step: Email Lookup */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-serif mb-4">Welcome to The Fort</h1>
                <p className="text-gray-400 mb-8">
                  Enter your email to get started. We'll check if you're already in our system.
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailLookup()}
                    placeholder="your@email.com"
                    className="w-full px-4 py-4 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white text-lg"
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  onClick={handleEmailLookup}
                  disabled={isLoading}
                  className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Checking...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </motion.div>
            )}

            {/* Step: Returning Member Options */}
            {step === 'returning' && memberInfo && (
              <motion.div
                key="returning"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-serif mb-2">
                  Welcome back, {memberInfo.firstName}!
                </h1>

                {/* Active Member */}
                {flowType === 'returning-active' && (
                  <>
                    <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-300">Your membership is active</span>
                      </div>
                    </div>

                    <p className="text-gray-400">
                      Ready for today's class? Check in below or manage your membership.
                    </p>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => handleReturningAction('check-in')}
                        disabled={isLoading}
                        className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Checking in...' : 'Check In for Class'}
                      </button>

                      <Link
                        href="/member"
                        className="block w-full py-4 text-center border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        Manage Membership
                      </Link>
                    </div>
                  </>
                )}

                {/* Inactive/Cancelled Member */}
                {flowType === 'returning-inactive' && (
                  <>
                    <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                      <span className="text-yellow-300">Your membership is currently inactive</span>
                    </div>

                    <p className="text-gray-400">
                      Would you like to reactivate your membership or just do a drop-in today?
                    </p>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => handleReturningAction('reactivate')}
                        className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Reactivate Membership
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReturningAction('drop-in')}
                        disabled={isLoading}
                        className="w-full py-4 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Processing...' : 'Drop-in ($20)'}
                      </button>
                    </div>

                    {!memberInfo.hasValidWaiver && (
                      <p className="text-sm text-gray-500">
                        Note: Your waiver has expired. You'll need to sign a new one.
                      </p>
                    )}
                  </>
                )}

                {/* Pending/Other Status */}
                {flowType === 'returning-dropin' && (
                  <>
                    <p className="text-gray-400">
                      It looks like you've trained with us before. What would you like to do today?
                    </p>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => handleReturningAction('drop-in')}
                        disabled={isLoading}
                        className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Processing...' : 'Drop-in ($20)'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFlowType('new');
                          setStep('info');
                        }}
                        className="w-full py-4 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        Sign Up for Membership
                      </button>
                    </div>

                    {!memberInfo.hasValidWaiver && (
                      <p className="text-sm text-gray-500">
                        Note: Your waiver has expired and will need to be renewed.
                      </p>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Use a different email
                </button>
              </motion.div>
            )}

            {/* Step: Personal Information (New Members) */}
            {step === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-serif mb-8">Join The Fort Jiu-Jitsu</h1>

                {/* Membership Type */}
                <div>
                  <label className="block text-sm font-medium mb-3">Membership Type *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.keys(MEMBERSHIP_PRICES) as MembershipType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateFormData({ membershipType: type })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.membershipType === type
                            ? 'border-white bg-white/10'
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="font-bold">{MEMBERSHIP_PRICES[type].name}</div>
                        <div className="text-2xl font-bold mt-1">
                          ${MEMBERSHIP_PRICES[type].price}
                          {type !== 'drop-in' && <span className="text-sm font-normal">/mo</span>}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {MEMBERSHIP_PRICES[type].description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Member Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData({ firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData({ lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    required
                  />
                </div>

                {/* Parent/Guardian Info (for minors) */}
                {isMinor() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700"
                  >
                    <h3 className="font-bold text-lg">Parent/Guardian Information</h3>
                    <p className="text-sm text-gray-400">Required for members under 18</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Parent First Name *</label>
                        <input
                          type="text"
                          value={formData.parentFirstName}
                          onChange={(e) => updateFormData({ parentFirstName: e.target.value })}
                          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Parent Last Name *</label>
                        <input
                          type="text"
                          value={formData.parentLastName}
                          onChange={(e) => updateFormData({ parentLastName: e.target.value })}
                          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Parent Email *</label>
                        <input
                          type="email"
                          value={formData.parentEmail}
                          onChange={(e) => updateFormData({ parentEmail: e.target.value })}
                          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Parent Phone</label>
                        <input
                          type="tel"
                          value={formData.parentPhone}
                          onChange={(e) => updateFormData({ parentPhone: e.target.value })}
                          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Name *</label>
                      <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Phone *</label>
                      <input
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => updateFormData({ emergencyContactRelationship: e.target.value })}
                      placeholder="e.g., Spouse, Parent, Sibling"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                {/* Medical Info */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Medical Conditions or Allergies
                  </label>
                  <textarea
                    value={formData.medicalConditions}
                    onChange={(e) => updateFormData({ medicalConditions: e.target.value })}
                    placeholder="List any medical conditions, injuries, or allergies we should know about"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-4 border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Continue to Waiver
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: Waiver */}
            {step === 'waiver' && (
              <motion.div
                key="waiver"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-serif mb-4">Liability Waiver</h1>
                {flowType !== 'new' && memberInfo && (
                  <p className="text-gray-400">
                    Welcome back, {memberInfo.firstName}! Your waiver has expired and needs to be renewed.
                  </p>
                )}

                {/* Waiver Text */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-64 overflow-y-auto text-sm">
                  <h2 className="font-bold text-lg mb-4">
                    THE FORT JIU-JITSU - WAIVER AND RELEASE OF LIABILITY
                  </h2>

                  <p className="mb-4">
                    In consideration of being allowed to participate in any way in Brazilian Jiu-Jitsu
                    classes, training, and related activities at The Fort Jiu-Jitsu, I, the undersigned,
                    acknowledge, appreciate, and agree that:
                  </p>

                  <p className="mb-4">
                    <strong>1. ASSUMPTION OF RISK:</strong> I understand that Brazilian Jiu-Jitsu involves
                    physical contact and carries inherent risks including but not limited to: bruises,
                    sprains, strains, fractures, joint injuries, concussions, and other injuries that may
                    result from training with partners, practicing techniques, or participating in
                    sparring. I voluntarily assume all such risks.
                  </p>

                  <p className="mb-4">
                    <strong>2. RELEASE OF LIABILITY:</strong> I hereby release, waive, discharge, and
                    covenant not to sue The Fort Jiu-Jitsu, its owners, instructors, employees, and agents
                    from any and all liability, claims, demands, actions, and causes of action arising out
                    of or related to any loss, damage, or injury that may be sustained while participating
                    in training.
                  </p>

                  <p className="mb-4">
                    <strong>3. MEDICAL ACKNOWLEDGMENT:</strong> I certify that I am physically fit and
                    have no medical condition that would prevent my full participation in training. I
                    agree to inform instructors of any injuries or health conditions that may affect my
                    ability to train safely.
                  </p>

                  <p className="mb-4">
                    <strong>4. RULES AND REGULATIONS:</strong> I agree to follow all rules and
                    instructions given by instructors and staff. I understand that failure to do so may
                    result in termination of my membership without refund.
                  </p>

                  <p className="mb-4">
                    <strong>5. PHOTO/VIDEO RELEASE:</strong> I grant permission for The Fort Jiu-Jitsu to
                    use photographs or videos taken during training for promotional purposes.
                  </p>

                  <p className="mb-4">
                    <strong>6. BINDING EFFECT:</strong> This waiver shall be binding upon me, my heirs,
                    executors, administrators, and assigns.
                  </p>

                  <p className="font-bold">
                    I HAVE READ THIS WAIVER AND FULLY UNDERSTAND ITS TERMS. I UNDERSTAND THAT I AM GIVING
                    UP SUBSTANTIAL RIGHTS BY SIGNING THIS DOCUMENT. I SIGN IT FREELY AND VOLUNTARILY
                    WITHOUT ANY INDUCEMENT.
                  </p>
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.waiverAgreed}
                    onChange={(e) => updateFormData({ waiverAgreed: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-900 text-white focus:ring-white"
                  />
                  <span className="text-sm">
                    I have read, understand, and agree to the above Waiver and Release of Liability.
                    {isMinor() && ' As the parent/guardian, I am signing on behalf of the minor named above.'}
                  </span>
                </label>

                {/* Signature */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Signature {isMinor() && '(Parent/Guardian)'}
                  </label>
                  <SignaturePad
                    onSignatureChange={(data) => updateFormData({ signatureData: data })}
                  />
                </div>

                {/* Typed Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type Your Full Legal Name {isMinor() && '(Parent/Guardian)'} *
                  </label>
                  <input
                    type="text"
                    value={formData.signerName}
                    onChange={(e) => updateFormData({ signerName: e.target.value })}
                    placeholder="Type your full legal name"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                  />
                </div>

                {/* Navigation */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-4 border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: Payment */}
            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-serif mb-4">Complete Your {flowType === 'returning-dropin' ? 'Drop-in' : 'Membership'}</h1>

                {/* Order Summary */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h2 className="font-bold text-lg mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Member</span>
                      <span>
                        {flowType !== 'new' && memberInfo
                          ? `${memberInfo.firstName} ${memberInfo.lastName}`
                          : `${formData.firstName} ${formData.lastName}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {flowType === 'returning-dropin' ? 'Visit Type' : 'Membership'}
                      </span>
                      <span>
                        {flowType === 'returning-dropin'
                          ? 'Drop-in Class'
                          : MEMBERSHIP_PRICES[formData.membershipType].name}
                      </span>
                    </div>
                    {flowType !== 'returning-dropin' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Schedule</span>
                        <span>{MEMBERSHIP_PRICES[formData.membershipType].description}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>
                        ${flowType === 'returning-dropin' ? 20 : MEMBERSHIP_PRICES[formData.membershipType].price}
                        {flowType !== 'returning-dropin' && formData.membershipType !== 'drop-in' && (
                          <span className="text-sm font-normal text-gray-400">/month</span>
                        )}
                      </span>
                    </div>
                    {flowType !== 'returning-dropin' && formData.membershipType !== 'drop-in' && (
                      <p className="text-sm text-gray-400 mt-2">
                        You will be charged monthly. Cancel anytime.
                      </p>
                    )}
                  </div>
                </div>

                {/* Waiver Confirmation */}
                <div className="flex items-center gap-3 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-300">
                    Liability waiver signed by {formData.signerName || memberInfo?.firstName}
                  </span>
                </div>

                {/* Navigation */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1 py-4 border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Pay $${flowType === 'returning-dropin' ? 20 : MEMBERSHIP_PRICES[formData.membershipType].price}`
                    )}
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                  Secure payment powered by Stripe
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
