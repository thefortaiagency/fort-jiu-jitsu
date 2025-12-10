'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemberType } from '@/lib/stripe';

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone?: string;
  program: 'kids-bjj' | 'adult-bjj';
  familyRole?: 'spouse' | 'child' | 'other';
  relationshipToPrimary?: string;
}

interface FamilyPricing {
  monthlyTotal: number;
  savings: number;
  vsIndividual: number;
  memberCount: number;
}

interface FamilyBuilderProps {
  onFamilyChange: (family: FamilyMember[]) => void;
  onPricingChange: (pricing: FamilyPricing) => void;
  initialMembers?: FamilyMember[];
}

export default function FamilyBuilder({
  onFamilyChange,
  onPricingChange,
  initialMembers = [],
}: FamilyBuilderProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialMembers);
  const [showAddMember, setShowAddMember] = useState(false);
  const [pricing, setPricing] = useState<FamilyPricing | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  // New member form state
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    program: 'adult-bjj',
    familyRole: 'other',
    relationshipToPrimary: '',
  });

  // Calculate pricing whenever family changes
  useEffect(() => {
    if (familyMembers.length === 0) {
      setPricing(null);
      return;
    }

    const calculatePricing = async () => {
      setIsLoadingPricing(true);
      try {
        const memberTypes: MemberType[] = familyMembers.map((m) =>
          m.program === 'kids-bjj' ? 'kid' : 'adult'
        );

        const response = await fetch('/api/family/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberCount: familyMembers.length,
            memberTypes,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setPricing(data);
          onPricingChange(data);
        }
      } catch (error) {
        console.error('Error calculating pricing:', error);
      } finally {
        setIsLoadingPricing(false);
      }
    };

    calculatePricing();
  }, [familyMembers, onPricingChange]);

  // Notify parent of family changes
  useEffect(() => {
    onFamilyChange(familyMembers);
  }, [familyMembers, onFamilyChange]);

  const addMember = () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.dateOfBirth || !newMember.email) {
      alert('Please fill in all required fields');
      return;
    }

    const member: FamilyMember = {
      id: `temp-${Date.now()}`,
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      dateOfBirth: newMember.dateOfBirth,
      email: newMember.email,
      phone: newMember.phone,
      program: newMember.program || 'adult-bjj',
      familyRole: newMember.familyRole,
      relationshipToPrimary: newMember.relationshipToPrimary,
    };

    setFamilyMembers([...familyMembers, member]);

    // Reset form
    setNewMember({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      program: 'adult-bjj',
      familyRole: 'other',
      relationshipToPrimary: '',
    });
    setShowAddMember(false);
  };

  const removeMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Family Members List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
          {familyMembers.length > 0 && (
            <span className="text-sm text-gray-500">{familyMembers.length} member(s)</span>
          )}
        </div>

        <AnimatePresence>
          {familyMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </h4>
                    {index === 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Age:</span> {calculateAge(member.dateOfBirth)} years old
                    </p>
                    <p>
                      <span className="font-medium">Program:</span>{' '}
                      {member.program === 'kids-bjj' ? 'Kids BJJ' : 'Adult BJJ'}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {member.email}
                    </p>
                    {member.relationshipToPrimary && (
                      <p>
                        <span className="font-medium">Relationship:</span> {member.relationshipToPrimary}
                      </p>
                    )}
                  </div>
                </div>
                {index > 0 && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                    title="Remove member"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {familyMembers.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No family members added yet</p>
          </div>
        )}
      </div>

      {/* Add Member Button/Form */}
      {!showAddMember ? (
        <button
          onClick={() => setShowAddMember(true)}
          className="w-full py-3 px-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-700 font-medium hover:border-purple-500 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 4v16m8-8H4"></path>
          </svg>
          Add Family Member
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4"
        >
          <h4 className="font-medium text-gray-900 mb-4">Add Family Member</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newMember.firstName}
                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newMember.lastName}
                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newMember.dateOfBirth}
                onChange={(e) => {
                  const age = calculateAge(e.target.value);
                  setNewMember({
                    ...newMember,
                    dateOfBirth: e.target.value,
                    program: age < 18 ? 'kids-bjj' : 'adult-bjj',
                    familyRole: age < 18 ? 'child' : 'other',
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <select
                value={newMember.program}
                onChange={(e) =>
                  setNewMember({ ...newMember, program: e.target.value as 'kids-bjj' | 'adult-bjj' })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="adult-bjj">Adult BJJ</option>
                <option value="kids-bjj">Kids BJJ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <select
                value={newMember.familyRole}
                onChange={(e) =>
                  setNewMember({ ...newMember, familyRole: e.target.value as 'spouse' | 'child' | 'other' })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Details</label>
              <input
                type="text"
                value={newMember.relationshipToPrimary}
                onChange={(e) => setNewMember({ ...newMember, relationshipToPrimary: e.target.value })}
                placeholder="e.g., Spouse, Son, Daughter"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={addMember}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Add Member
            </button>
            <button
              onClick={() => setShowAddMember(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Pricing Summary */}
      {pricing && familyMembers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Individual pricing would be:</span>
              <span className="font-medium text-gray-900">${pricing.vsIndividual}/month</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Family discount applied:</span>
              <span className="font-medium text-green-600">-${pricing.savings}/month</span>
            </div>

            <div className="border-t border-purple-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Your monthly total:</span>
                <span className="text-2xl font-bold text-purple-600">${pricing.monthlyTotal}</span>
              </div>
            </div>

            {pricing.savings > 0 && (
              <div className="bg-green-100 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-green-800">
                  You're saving ${pricing.savings}/month with the family plan!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  That's ${(pricing.savings * 12).toFixed(0)} per year!
                </p>
              </div>
            )}
          </div>

          {familyMembers.length === 1 && (
            <div className="mt-4 bg-blue-100 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Add another family member to unlock family pricing starting at $150/month
                for 2+ members!
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
