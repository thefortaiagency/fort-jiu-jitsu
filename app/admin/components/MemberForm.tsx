'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import type { Member } from '@/lib/supabase';

interface MemberFormProps {
  member: Member | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function MemberForm({ member, onSave, onCancel }: MemberFormProps) {
  const isEditing = !!member;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    birth_date: member?.birth_date || '',
    program: member?.program || '',
    skill_level: member?.skill_level || 'beginner',
    status: member?.status || 'active',
    membership_type: member?.membership_type || 'monthly',
    // Parent/Guardian
    parent_first_name: member?.parent_first_name || '',
    parent_last_name: member?.parent_last_name || '',
    parent_email: member?.parent_email || '',
    parent_phone: member?.parent_phone || '',
    // Emergency Contact
    emergency_contact_name: member?.emergency_contact_name || '',
    emergency_contact_phone: member?.emergency_contact_phone || '',
    emergency_contact_relationship: member?.emergency_contact_relationship || '',
    // Medical
    medical_conditions: member?.medical_conditions || '',
    medications: member?.medications || '',
    allergies: member?.allergies || '',
    // Address
    address_line1: member?.address_line1 || '',
    address_line2: member?.address_line2 || '',
    city: member?.city || '',
    state: member?.state || '',
    zip_code: member?.zip_code || '',
    // Check-in
    pin_code: member?.pin_code || '',
    // Payment
    payment_status: member?.payment_status || 'pending',
    individual_monthly_cost: member?.individual_monthly_cost || 100,
    is_primary_account_holder: member?.is_primary_account_holder ?? true,
    // Quick login
    one_click_login_enabled: member?.one_click_login_enabled ?? false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createBrowserSupabaseClient();

    // Generate PIN if not set
    const pin_code = formData.pin_code || Math.floor(1000 + Math.random() * 9000).toString();

    // Convert empty strings to null for date fields
    const memberData = {
      ...formData,
      pin_code,
      email: formData.email.toLowerCase().trim(),
      birth_date: formData.birth_date || null,
      updated_at: new Date().toISOString(),
    };

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('members')
        .update(memberData)
        .eq('id', member.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from('members').insert({
        ...memberData,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    onSave();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{isEditing ? 'Edit Member' : 'Add New Member'}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Birth Date</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Check-in PIN</label>
              <input
                type="text"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleChange}
                placeholder="Auto-generated if empty"
                maxLength={4}
                pattern="[0-9]{4}"
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Membership Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Membership Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Program</label>
              <select
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              >
                <option value="">Select Program</option>
                <option value="kids-bjj">Kids BJJ</option>
                <option value="adult-bjj">Adult BJJ</option>
                <option value="beginners">Beginners</option>
                <option value="junior-hammers">Junior Hammers (Wrestling)</option>
                <option value="big-hammers">Big Hammers (Wrestling)</option>
                <option value="lady-hammers">Lady Hammers (Wrestling)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Skill Level</label>
              <select
                name="skill_level"
                value={formData.skill_level}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Membership Type</label>
              <select
                name="membership_type"
                value={formData.membership_type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="drop-in">Drop-in</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Payment Status</label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="past_due">Past Due</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Monthly Cost ($)</label>
              <input
                type="number"
                name="individual_monthly_cost"
                value={formData.individual_monthly_cost}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="one_click_login_enabled"
                  checked={formData.one_click_login_enabled}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-700 bg-black text-white focus:ring-white"
                />
                <div>
                  <span className="text-white font-medium">Enable One-Click Login</span>
                  <p className="text-sm text-gray-500">Member will appear in quick login list on the member portal</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Parent/Guardian */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Parent/Guardian (for minors)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">First Name</label>
              <input
                type="text"
                name="parent_first_name"
                value={formData.parent_first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Last Name</label>
              <input
                type="text"
                name="parent_last_name"
                value={formData.parent_last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                name="parent_email"
                value={formData.parent_email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone</label>
              <input
                type="tel"
                name="parent_phone"
                value={formData.parent_phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Name</label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone</label>
              <input
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Relationship</label>
              <input
                type="text"
                name="emergency_contact_relationship"
                value={formData.emergency_contact_relationship}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Medical Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Medical Conditions</label>
              <textarea
                name="medical_conditions"
                value={formData.medical_conditions}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Medications</label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Address Line 1</label>
              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Address Line 2</label>
              <input
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  maxLength={2}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Member' : 'Create Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
