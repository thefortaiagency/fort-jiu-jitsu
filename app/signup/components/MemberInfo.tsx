'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, ExperienceLevel } from '../page';
import { AlertCircle } from 'lucide-react';

interface MemberInfoProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onComplete: (data: Partial<FormData>) => void;
  onBack: () => void;
}

export default function MemberInfo({ formData, updateFormData, onComplete, onBack }: MemberInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMinor, setIsMinor] = useState(false);

  // Calculate if member is a minor based on date of birth
  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const isActuallyMinor =
        age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate());
      setIsMinor(isActuallyMinor);
    }
  }, [formData.dateOfBirth]);

  const availableGoals = [
    { id: 'self-defense', label: 'Self-Defense' },
    { id: 'fitness', label: 'Fitness & Health' },
    { id: 'competition', label: 'Competition' },
    { id: 'fun', label: 'Fun & Social' },
    { id: 'discipline', label: 'Discipline & Focus' },
    { id: 'confidence', label: 'Build Confidence' },
  ];

  const experienceLevels: { value: ExperienceLevel; label: string; description: string }[] = [
    { value: 'never', label: 'Never Trained', description: 'No martial arts experience' },
    { value: 'beginner', label: 'Beginner', description: '0-1 year of training' },
    { value: 'intermediate', label: 'Intermediate', description: '1-3 years of training' },
    { value: 'advanced', label: 'Advanced', description: '3+ years of training' },
  ];

  const toggleGoal = (goalId: string) => {
    const currentGoals = formData.goals || [];
    if (currentGoals.includes(goalId)) {
      updateFormData({ goals: currentGoals.filter((g) => g !== goalId) });
    } else {
      updateFormData({ goals: [...currentGoals, goalId] });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic info
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    // Parent info for minors
    if (isMinor) {
      if (!formData.parentFirstName?.trim()) newErrors.parentFirstName = 'Parent first name is required';
      if (!formData.parentLastName?.trim()) newErrors.parentLastName = 'Parent last name is required';
      if (!formData.parentEmail?.trim()) newErrors.parentEmail = 'Parent email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
        newErrors.parentEmail = 'Please enter a valid email';
      }
    }

    // Emergency contact
    if (!formData.emergencyContactName?.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }
    if (!formData.emergencyContactPhone?.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onComplete(formData);
    } else {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Member Information Section */}
      <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800">
        <h2 className="text-2xl font-serif font-bold mb-6">
          {isMinor ? "Student's Information" : 'Your Information'}
        </h2>

        <div className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div id="firstName">
              <label className="block text-sm font-medium mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
                }`}
                placeholder="John"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div id="lastName">
              <label className="block text-sm font-medium mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
                }`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div id="email">
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-all"
                placeholder="(260) 555-0123"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div id="dateOfBirth">
            <label className="block text-sm font-medium mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
              className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
              }`}
            />
            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium mb-3">Experience Level</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateFormData({ experienceLevel: level.value })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.experienceLevel === level.value
                      ? 'border-white bg-white/10'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-sm text-gray-400 mt-1">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium mb-3">What are your goals? (Select all that apply)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableGoals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.goals?.includes(goal.id)
                      ? 'border-white bg-white/10'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Parent/Guardian Information (if minor) */}
      <AnimatePresence>
        {isMinor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-900/20 rounded-2xl p-6 md:p-8 border border-blue-700"
          >
            <div className="flex items-start gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-serif font-bold mb-1">Parent/Guardian Information</h2>
                <p className="text-sm text-gray-400">Required for members under 18 years old</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="parentFirstName">
                  <label className="block text-sm font-medium mb-2">
                    Parent First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parentFirstName}
                    onChange={(e) => updateFormData({ parentFirstName: e.target.value })}
                    className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.parentFirstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
                    }`}
                  />
                  {errors.parentFirstName && <p className="mt-1 text-sm text-red-500">{errors.parentFirstName}</p>}
                </div>

                <div id="parentLastName">
                  <label className="block text-sm font-medium mb-2">
                    Parent Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parentLastName}
                    onChange={(e) => updateFormData({ parentLastName: e.target.value })}
                    className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.parentLastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
                    }`}
                  />
                  {errors.parentLastName && <p className="mt-1 text-sm text-red-500">{errors.parentLastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="parentEmail">
                  <label className="block text-sm font-medium mb-2">
                    Parent Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => updateFormData({ parentEmail: e.target.value })}
                    className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.parentEmail ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
                    }`}
                  />
                  {errors.parentEmail && <p className="mt-1 text-sm text-red-500">{errors.parentEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Parent Phone</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => updateFormData({ parentPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Contact */}
      <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800">
        <h2 className="text-2xl font-serif font-bold mb-6">Emergency Contact</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div id="emergencyContactName">
              <label className="block text-sm font-medium mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
                className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.emergencyContactName ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
                }`}
              />
              {errors.emergencyContactName && (
                <p className="mt-1 text-sm text-red-500">{errors.emergencyContactName}</p>
              )}
            </div>

            <div id="emergencyContactPhone">
              <label className="block text-sm font-medium mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
                className={`w-full px-4 py-3 bg-black border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.emergencyContactPhone ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-white'
                }`}
              />
              {errors.emergencyContactPhone && (
                <p className="mt-1 text-sm text-red-500">{errors.emergencyContactPhone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Relationship</label>
            <input
              type="text"
              value={formData.emergencyContactRelationship}
              onChange={(e) => updateFormData({ emergencyContactRelationship: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-all"
              placeholder="e.g., Spouse, Parent, Sibling"
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800">
        <h2 className="text-2xl font-serif font-bold mb-6">Medical Information</h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            Medical Conditions, Injuries, or Allergies
          </label>
          <textarea
            value={formData.medicalConditions}
            onChange={(e) => updateFormData({ medicalConditions: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-all resize-none"
            placeholder="Please list any medical conditions, past injuries, or allergies we should be aware of..."
          />
          <p className="mt-2 text-sm text-gray-500">This information helps us keep you safe during training</p>
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
          type="submit"
          className="flex-1 py-4 px-6 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all"
        >
          Continue to Plan Selection
        </button>
      </div>
    </motion.form>
  );
}
