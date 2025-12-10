'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StepIndicator from './components/StepIndicator';
import ChoosePath from './components/ChoosePath';
import MemberInfo from './components/MemberInfo';
import ChoosePlan from './components/ChoosePlan';
import WaiverPayment from './components/WaiverPayment';

export type MembershipPlan = 'kids' | 'adult' | 'family' | 'drop-in';
export type BillingPeriod = 'monthly' | 'annual';
export type ExperienceLevel = 'never' | 'beginner' | 'intermediate' | 'advanced';

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  isMinor: boolean;
  experienceLevel?: ExperienceLevel;
  goals?: string[];
  medicalConditions?: string;
}

export interface FormData {
  // Path selection
  path: 'new' | 'returning' | 'drop-in' | null;

  // Member info
  email: string;
  phone: string;

  // Promo code
  promoCode: string;

  // For individual/primary member
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  experienceLevel: ExperienceLevel;
  goals: string[];
  medicalConditions: string;

  // Emergency contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  // Parent/Guardian (for minors)
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;

  // Plan selection
  membershipPlan: MembershipPlan;
  billingPeriod: BillingPeriod;

  // Family members (if family plan)
  familyMembers: FamilyMember[];

  // Waiver
  waiverAgreed: boolean;
  signatureData: string | null;
  signerName: string;
}

const initialFormData: FormData = {
  path: null,
  email: '',
  phone: '',
  promoCode: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  experienceLevel: 'beginner',
  goals: [],
  medicalConditions: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  parentFirstName: '',
  parentLastName: '',
  parentEmail: '',
  parentPhone: '',
  membershipPlan: 'adult',
  billingPeriod: 'monthly',
  familyMembers: [],
  waiverAgreed: false,
  signatureData: null,
  signerName: '',
};

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePathSelection = (path: 'new' | 'returning' | 'drop-in') => {
    if (path === 'returning') {
      // Redirect to existing member lookup
      window.location.href = '/member';
      return;
    }

    if (path === 'drop-in') {
      updateFormData({ path, membershipPlan: 'drop-in' });
    } else {
      updateFormData({ path });
    }
    nextStep();
  };

  const handleMemberInfoComplete = (data: Partial<FormData>) => {
    updateFormData(data);
    nextStep();
  };

  const handlePlanSelection = (plan: MembershipPlan, billing: BillingPeriod, familyMembers?: FamilyMember[]) => {
    updateFormData({
      membershipPlan: plan,
      billingPeriod: billing,
      familyMembers: familyMembers || [],
    });
    nextStep();
  };

  const handleWaiverComplete = async (signatureData: string, signerName: string, promoCode?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare member data for API
      const memberData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        membershipType: formData.membershipPlan,
        experienceLevel: formData.experienceLevel,
        goals: formData.goals,
        parentFirstName: formData.parentFirstName,
        parentLastName: formData.parentLastName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelationship: formData.emergencyContactRelationship,
        medicalConditions: formData.medicalConditions,
        waiverAgreed: true,
        signatureData,
        signerName,
        billingPeriod: formData.billingPeriod,
        familyMembers: formData.familyMembers,
        promoCode: promoCode || undefined,
      };

      // Call signup API
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Redirect to Stripe checkout
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

  const steps = [
    { number: 1, label: 'Choose Path' },
    { number: 2, label: 'Your Info' },
    { number: 3, label: 'Select Plan' },
    { number: 4, label: 'Sign & Pay' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navigation />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Join The Fort Jiu-Jitsu
            </h1>
            <p className="text-gray-400 text-lg">
              Start your Brazilian Jiu-Jitsu journey today
            </p>
          </div>

          {/* Progress Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

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

          {/* Step Content */}
          <div className="mt-12">
            {currentStep === 1 && (
              <ChoosePath onSelect={handlePathSelection} />
            )}

            {currentStep === 2 && (
              <MemberInfo
                formData={formData}
                updateFormData={updateFormData}
                onComplete={handleMemberInfoComplete}
                onBack={prevStep}
              />
            )}

            {currentStep === 3 && (
              <ChoosePlan
                formData={formData}
                onComplete={handlePlanSelection}
                onBack={prevStep}
              />
            )}

            {currentStep === 4 && (
              <WaiverPayment
                formData={formData}
                onComplete={handleWaiverComplete}
                onBack={prevStep}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
