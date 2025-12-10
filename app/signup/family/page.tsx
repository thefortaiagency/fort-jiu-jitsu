'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import SignaturePad from '../../components/SignaturePad';
import Link from 'next/link';

type MembershipType = 'kids' | 'adult' | 'drop-in';

interface ParentMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface FormData {
  // Member Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  membershipType: MembershipType;
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
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  membershipType: 'kids',
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

function FamilySignupContent() {
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parent');

  const [step, setStep] = useState<'info' | 'waiver' | 'payment'>('info');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [parentMember, setParentMember] = useState<ParentMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingParent, setIsLoadingParent] = useState(true);

  // Load parent member info
  useEffect(() => {
    if (!parentId) {
      setError('No parent member ID provided');
      setIsLoadingParent(false);
      return;
    }

    const loadParent = async () => {
      try {
        const response = await fetch(`/api/member-lookup?id=${parentId}`);
        const data = await response.json();

        if (data.found && data.member) {
          setParentMember(data.member);
          // Pre-fill signer name with parent's name
          updateFormData({ signerName: `${data.member.first_name} ${data.member.last_name}` });
        } else {
          setError('Parent member not found');
        }
      } catch (err) {
        console.error('Error loading parent:', err);
        setError('Failed to load parent information');
      } finally {
        setIsLoadingParent(false);
      }
    };

    loadParent();
  }, [parentId]);

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

  const validateInfo = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth) {
      setError('Please fill in all required fields');
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
    if (step === 'waiver') setStep('info');
    else if (step === 'payment') setStep('waiver');
  };

  const handleSubmit = async () => {
    if (!parentId) {
      setError('Parent member ID is missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          linkToParentId: parentId,
          // Use parent's info as parent fields
          parentFirstName: parentMember?.first_name,
          parentLastName: parentMember?.last_name,
          parentEmail: parentMember?.email,
          parentPhone: parentMember?.phone,
        }),
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

  if (isLoadingParent) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="pt-32 pb-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading parent information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!parentMember) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <main className="pt-32 pb-20">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
              <h1 className="text-2xl font-serif mb-4">Parent Not Found</h1>
              <p className="text-red-200 mb-6">{error || 'Unable to load parent member information.'}</p>
              <Link
                href="/signup"
                className="inline-block px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go to Regular Signup
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              {['Member Info', 'Waiver', 'Payment'].map((s, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      ['info', 'waiver', 'payment'].indexOf(step) >= i
                        ? 'bg-white text-black'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div
                      className={`w-16 md:w-32 h-1 mx-2 transition-colors ${
                        ['info', 'waiver', 'payment'].indexOf(step) > i ? 'bg-white' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              {['Member Info', 'Waiver', 'Payment'].map((s, i) => (
                <span
                  key={i}
                  className={['info', 'waiver', 'payment'].indexOf(step) >= i ? 'text-white' : 'text-gray-500'}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Parent Info Banner */}
          <div className="mb-8 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <div>
                <div className="text-sm text-blue-300">Adding family member to account:</div>
                <div className="font-bold text-blue-200">
                  {parentMember.first_name} {parentMember.last_name}
                </div>
              </div>
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

          {/* Step: Member Information */}
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h1 className="text-3xl font-serif mb-8">Add Family Member</h1>

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
                      <div className="text-sm text-gray-400 mt-1">{MEMBERSHIP_PRICES[type].description}</div>
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
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    required
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
                    placeholder="e.g., Parent, Sibling"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Medical Info */}
              <div>
                <label className="block text-sm font-medium mb-2">Medical Conditions or Allergies</label>
                <textarea
                  value={formData.medicalConditions}
                  onChange={(e) => updateFormData({ medicalConditions: e.target.value })}
                  placeholder="List any medical conditions, injuries, or allergies we should know about"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div className="flex gap-4">
                <Link
                  href="/member"
                  className="flex-1 py-4 text-center border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </Link>
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
              className="space-y-6"
            >
              <h1 className="text-3xl font-serif mb-4">Liability Waiver</h1>
              <p className="text-gray-400">
                Parent/Guardian signature required for {formData.firstName} {formData.lastName}
              </p>

              {/* Waiver Text */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-64 overflow-y-auto text-sm">
                <h2 className="font-bold text-lg mb-4">THE FORT JIU-JITSU - WAIVER AND RELEASE OF LIABILITY</h2>

                <p className="mb-4">
                  In consideration of being allowed to participate in any way in Brazilian Jiu-Jitsu classes,
                  training, and related activities at The Fort Jiu-Jitsu, I, the undersigned, acknowledge,
                  appreciate, and agree that:
                </p>

                <p className="mb-4">
                  <strong>1. ASSUMPTION OF RISK:</strong> I understand that Brazilian Jiu-Jitsu involves physical
                  contact and carries inherent risks including but not limited to: bruises, sprains, strains,
                  fractures, joint injuries, concussions, and other injuries that may result from training with
                  partners, practicing techniques, or participating in sparring. I voluntarily assume all such
                  risks.
                </p>

                <p className="mb-4">
                  <strong>2. RELEASE OF LIABILITY:</strong> I hereby release, waive, discharge, and covenant not to
                  sue The Fort Jiu-Jitsu, its owners, instructors, employees, and agents from any and all
                  liability, claims, demands, actions, and causes of action arising out of or related to any loss,
                  damage, or injury that may be sustained while participating in training.
                </p>

                <p className="mb-4">
                  <strong>3. MEDICAL ACKNOWLEDGMENT:</strong> I certify that the participant is physically fit and
                  has no medical condition that would prevent full participation in training. I agree to inform
                  instructors of any injuries or health conditions that may affect the ability to train safely.
                </p>

                <p className="mb-4">
                  <strong>4. RULES AND REGULATIONS:</strong> I agree to follow all rules and instructions given by
                  instructors and staff. I understand that failure to do so may result in termination of membership
                  without refund.
                </p>

                <p className="mb-4">
                  <strong>5. PHOTO/VIDEO RELEASE:</strong> I grant permission for The Fort Jiu-Jitsu to use
                  photographs or videos taken during training for promotional purposes.
                </p>

                <p className="mb-4">
                  <strong>6. BINDING EFFECT:</strong> This waiver shall be binding upon me, my heirs, executors,
                  administrators, and assigns.
                </p>

                <p className="font-bold">
                  I HAVE READ THIS WAIVER AND FULLY UNDERSTAND ITS TERMS. I UNDERSTAND THAT I AM GIVING UP
                  SUBSTANTIAL RIGHTS BY SIGNING THIS DOCUMENT. I SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY
                  INDUCEMENT.
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
                <label className="block text-sm font-medium mb-2">Signature (Parent/Guardian)</label>
                <SignaturePad onSignatureChange={(data) => updateFormData({ signatureData: data })} />
              </div>

              {/* Typed Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Type Your Full Legal Name (Parent/Guardian) *</label>
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
              className="space-y-6"
            >
              <h1 className="text-3xl font-serif mb-4">Complete Signup</h1>

              {/* Order Summary */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">New Member</span>
                    <span>
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Membership</span>
                    <span>{MEMBERSHIP_PRICES[formData.membershipType].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Schedule</span>
                    <span>{MEMBERSHIP_PRICES[formData.membershipType].description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Billing Account</span>
                    <span>
                      {parentMember.first_name} {parentMember.last_name}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Individual Price</span>
                    <span className="line-through">${MEMBERSHIP_PRICES[formData.membershipType].price}/month</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-green-400">
                    <span>Family Discount</span>
                    <span>
                      $150/month total
                      <span className="text-sm font-normal text-green-300 ml-2">(Save $25!)</span>
                    </span>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-200">
                  All family members will be billed through the primary account holder's payment method.
                </div>
              </div>

              {/* Waiver Confirmation */}
              <div className="flex items-center gap-3 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-300">Liability waiver signed by {formData.signerName}</span>
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
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Complete Signup'
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">Secure payment powered by Stripe</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function FamilySignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white">
          <Navigation />
          <main className="pt-32 pb-20">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400">Loading...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <FamilySignupContent />
    </Suspense>
  );
}
