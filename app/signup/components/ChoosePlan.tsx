'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, MembershipPlan, BillingPeriod, FamilyMember } from '../page';
import { Check, Users, Plus, X } from 'lucide-react';

interface ChoosePlanProps {
  formData: FormData;
  onComplete: (plan: MembershipPlan, billing: BillingPeriod, familyMembers?: FamilyMember[]) => void;
  onBack: () => void;
}

export default function ChoosePlan({ formData, onComplete, onBack }: ChoosePlanProps) {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>(
    formData.path === 'drop-in' ? 'drop-in' : formData.membershipPlan
  );
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(formData.billingPeriod);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(formData.familyMembers);

  const isDropInPath = formData.path === 'drop-in';

  const plans = [
    {
      id: 'kids' as MembershipPlan,
      name: 'Kids BJJ',
      monthlyPrice: 75,
      annualPrice: 750,
      description: 'Perfect for young grapplers',
      features: ['Tue & Wed 5:30-6:30 PM', 'Age-appropriate curriculum', 'Character development', 'Belt progression system'],
      color: 'from-blue-500 to-blue-600',
      popular: false,
    },
    {
      id: 'adult' as MembershipPlan,
      name: 'Adult BJJ',
      monthlyPrice: 100,
      annualPrice: 1000,
      description: 'Full access to adult classes',
      features: [
        'Tue & Wed 6:30-8:00 PM',
        'Morning Rolls (Open Mat)',
        'All skill levels welcome',
        'Unlimited classes',
      ],
      color: 'from-green-500 to-green-600',
      popular: true,
    },
    {
      id: 'morning-rolls' as MembershipPlan,
      name: 'Morning Rolls Only',
      monthlyPrice: 60,
      annualPrice: 600,
      description: 'Open mat sessions only',
      features: [
        'Morning open mat access',
        'Roll at your own pace',
        'No evening classes',
        'Great for experienced grapplers',
      ],
      color: 'from-orange-500 to-orange-600',
      popular: false,
    },
    {
      id: 'family' as MembershipPlan,
      name: 'Family Plan',
      monthlyPrice: 150,
      annualPrice: 1500,
      description: 'Best value for families',
      features: ['2+ family members', 'All classes included', 'Flexible scheduling', 'Save up to $50/month'],
      color: 'from-purple-500 to-purple-600',
      popular: false,
    },
  ];

  const dropInPlan = {
    id: 'drop-in' as MembershipPlan,
    name: 'Drop-in Class',
    price: 20,
    description: 'Try a single class',
    features: ['One class visit', 'No commitment', 'Experience our training', 'Full class participation'],
    color: 'from-orange-500 to-orange-600',
  };

  const calculatePrice = (plan: MembershipPlan) => {
    if (plan === 'drop-in') return 20;
    const planData = plans.find((p) => p.id === plan);
    if (!planData) return 0;
    return billingPeriod === 'monthly' ? planData.monthlyPrice : planData.annualPrice;
  };

  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    return monthlyCost - annualPrice;
  };

  const handleContinue = () => {
    if (selectedPlan === 'family' && familyMembers.length === 0) {
      setShowFamilyForm(true);
      return;
    }
    onComplete(selectedPlan, billingPeriod, familyMembers);
  };

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      isMinor: false,
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers(familyMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  if (isDropInPath) {
    // Drop-in path - simplified view
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Drop-in Visit</h2>
          <p className="text-gray-400">Try a single class before committing</p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold mb-2">{dropInPlan.name}</h3>
              <p className="text-orange-100">{dropInPlan.description}</p>
            </div>

            <div className="text-center mb-8">
              <div className="text-6xl font-bold mb-2">${dropInPlan.price}</div>
              <div className="text-orange-100">One-time payment</div>
            </div>

            <div className="space-y-3 mb-8">
              {dropInPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/10 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2">What's Next?</p>
              <p className="text-orange-100">
                After your drop-in, you can sign up for a full membership at any time. We'll apply a credit toward your first month!
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-4 px-6 border-2 border-gray-700 text-white font-bold rounded-lg hover:bg-gray-900 transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 py-4 px-6 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all"
          >
            Continue to Waiver
          </button>
        </div>
      </motion.div>
    );
  }

  // Full membership path
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Choose Your Membership</h2>
        <p className="text-gray-400">Select the plan that fits your needs</p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-900 rounded-lg p-1 border border-gray-800">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'monthly' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('annual')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'annual' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Annual
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Save 2 months</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => {
          const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          const savings = calculateSavings(plan.monthlyPrice, plan.annualPrice);

          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                selectedPlan === plan.id
                  ? 'border-white bg-white/5 shadow-2xl scale-105'
                  : 'border-gray-700 hover:border-gray-500 hover:bg-gray-900'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              {/* Selected Indicator */}
              {selectedPlan === plan.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="text-4xl font-bold mb-1">
                  ${price}
                  <span className="text-lg font-normal text-gray-400">
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {billingPeriod === 'annual' && (
                  <div className="text-sm text-green-500 font-medium">Save ${savings} per year</div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Family Members Section */}
      <AnimatePresence>
        {selectedPlan === 'family' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-900/20 rounded-2xl p-6 md:p-8 border border-purple-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-serif font-bold">Family Members</h3>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Add additional family members to your plan. You've already added yourself as the primary member.
            </p>

            {/* Primary Member (Read-only) */}
            <div className="bg-black/50 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {formData.firstName} {formData.lastName}
                  </div>
                  <div className="text-sm text-gray-400">Primary Member</div>
                </div>
                <div className="text-sm text-gray-400">
                  {billingPeriod === 'monthly' ? '$150/mo' : '$1,500/yr'}
                </div>
              </div>
            </div>

            {/* Additional Family Members */}
            <div className="space-y-4 mb-6">
              {familyMembers.map((member, index) => (
                <div key={member.id} className="bg-black/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-sm font-medium text-gray-400">Family Member {index + 1}</div>
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(member.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={member.firstName}
                      onChange={(e) => updateFamilyMember(member.id, { firstName: e.target.value })}
                      className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={member.lastName}
                      onChange={(e) => updateFamilyMember(member.id, { lastName: e.target.value })}
                      className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="date"
                      value={member.dateOfBirth}
                      onChange={(e) => updateFamilyMember(member.id, { dateOfBirth: e.target.value })}
                      className="px-3 py-2 bg-black border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addFamilyMember}
              className="w-full py-3 border-2 border-dashed border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-900/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Family Member
            </button>

            {familyMembers.length > 0 && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded-lg text-sm">
                <p className="text-green-400 font-medium">
                  Total: {familyMembers.length + 1} family member{familyMembers.length + 1 !== 1 ? 's' : ''} for $
                  {billingPeriod === 'monthly' ? '150/month' : '1,500/year'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* What's Included Section */}
      <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800">
        <h3 className="text-xl font-serif font-bold mb-4">What's Included in All Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Expert instruction from experienced coaches',
            'Structured curriculum with belt progression',
            'Safe and supportive training environment',
            'Access to open mat sessions',
            'Community of passionate practitioners',
            'Free trial period (7 days)',
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 px-6 border-2 border-gray-700 text-white font-bold rounded-lg hover:bg-gray-900 transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-4 px-6 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all"
        >
          Continue to Waiver & Payment
        </button>
      </div>
    </motion.div>
  );
}
