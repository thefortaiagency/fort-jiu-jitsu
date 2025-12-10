'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import type { Member } from '@/lib/supabase';
import { isWaiverValid, getWaiverExpiration, daysUntilExpiration } from '@/lib/waiver-utils';

interface MemberDetailProps {
  member: Member;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

interface CheckIn {
  id: string;
  checked_in_at: string;
  class_id?: string;
}

interface Waiver {
  id: string;
  signed_at: string;
  waiver_type: string;
  signer_name: string;
  signer_relationship: string;
}

export default function MemberDetail({ member, onEdit, onDelete, onBack }: MemberDetailProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemberData() {
      const supabase = createBrowserSupabaseClient();

      // Fetch check-ins
      const { data: checkInData } = await supabase
        .from('check_ins')
        .select('*')
        .eq('member_id', member.id)
        .order('checked_in_at', { ascending: false })
        .limit(10);

      setCheckIns(checkInData || []);

      // Fetch waivers
      const { data: waiverData } = await supabase
        .from('waivers')
        .select('*')
        .eq('member_id', member.id)
        .order('signed_at', { ascending: false });

      setWaivers(waiverData || []);

      // Fetch family members if this is a primary account holder
      if (member.is_primary_account_holder) {
        const { data: familyData } = await supabase
          .from('members')
          .select('*')
          .eq('family_account_id', member.id);

        setFamilyMembers(familyData || []);
      } else if (member.family_account_id) {
        // Fetch family including primary
        const { data: familyData } = await supabase
          .from('members')
          .select('*')
          .or(`id.eq.${member.family_account_id},family_account_id.eq.${member.family_account_id}`);

        setFamilyMembers(familyData?.filter((m) => m.id !== member.id) || []);
      }

      setLoading(false);
    }

    fetchMemberData();
  }, [member]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const latestWaiver = waivers[0];
  const hasValidWaiver = latestWaiver && isWaiverValid(latestWaiver.signed_at);
  const waiverDaysLeft = latestWaiver ? daysUntilExpiration(latestWaiver.signed_at) : 0;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-900 text-green-300',
      pending: 'bg-yellow-900 text-yellow-300',
      inactive: 'bg-gray-700 text-gray-300',
      cancelled: 'bg-red-900 text-red-300',
    };
    return styles[status] || 'bg-gray-700 text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Members
        </button>
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit Member
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 border border-red-700 text-red-400 font-medium rounded-lg hover:bg-red-900/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {member.first_name} {member.last_name}
                </h2>
                <p className="text-gray-400">{member.email}</p>
              </div>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadge(member.status)}`}
              >
                {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{member.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Birth Date</p>
                <p>
                  {formatDate(member.birth_date || '')}
                  {member.birth_date && ` (${calculateAge(member.birth_date)} years old)`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Program</p>
                <p>
                  {member.program?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ||
                    '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Membership Type</p>
                <p>{member.membership_type?.charAt(0).toUpperCase() + member.membership_type?.slice(1)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p>{formatDate(member.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-in PIN</p>
                <p className="font-mono">{member.pin_code || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Info (if minor) */}
          {member.parent_first_name && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Parent/Guardian</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p>
                    {member.parent_first_name} {member.parent_last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{member.parent_email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{member.parent_phone || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {member.emergency_contact_name && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p>{member.emergency_contact_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{member.emergency_contact_phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Relationship</p>
                  <p>{member.emergency_contact_relationship || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Medical Info */}
          {(member.medical_conditions || member.medications || member.allergies) && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Medical Information</h3>
              <div className="space-y-4">
                {member.medical_conditions && (
                  <div>
                    <p className="text-sm text-gray-500">Medical Conditions</p>
                    <p>{member.medical_conditions}</p>
                  </div>
                )}
                {member.medications && (
                  <div>
                    <p className="text-sm text-gray-500">Medications</p>
                    <p>{member.medications}</p>
                  </div>
                )}
                {member.allergies && (
                  <div>
                    <p className="text-sm text-gray-500">Allergies</p>
                    <p>{member.allergies}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Waiver Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Waiver Status</h3>
            {latestWaiver ? (
              <div>
                <div
                  className={`inline-block px-3 py-1 rounded text-sm font-medium mb-4 ${
                    hasValidWaiver ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}
                >
                  {hasValidWaiver ? 'Valid' : 'Expired'}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Signed</span>
                    <span>{formatDate(latestWaiver.signed_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expires</span>
                    <span>{formatDate(getWaiverExpiration(latestWaiver.signed_at).toISOString())}</span>
                  </div>
                  {hasValidWaiver && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Days Left</span>
                      <span
                        className={waiverDaysLeft <= 30 ? 'text-yellow-400' : ''}
                      >
                        {waiverDaysLeft}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Signed By</span>
                    <span>{latestWaiver.signer_name}</span>
                  </div>
                  {latestWaiver.signer_relationship !== 'self' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Relationship</span>
                      <span className="capitalize">{latestWaiver.signer_relationship}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No waiver on file</p>
            )}
          </div>

          {/* Family Members */}
          {(member.is_primary_account_holder || member.family_account_id) && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Family Account</h3>
              {member.is_primary_account_holder && (
                <p className="text-sm text-green-400 mb-3">Primary Account Holder</p>
              )}
              {familyMembers.length > 0 ? (
                <ul className="space-y-2">
                  {familyMembers.map((fm) => (
                    <li key={fm.id} className="flex items-center justify-between text-sm">
                      <span>
                        {fm.first_name} {fm.last_name}
                      </span>
                      {fm.is_primary_account_holder && (
                        <span className="text-xs text-gray-500">(Primary)</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No other family members</p>
              )}
            </div>
          )}

          {/* Recent Check-ins */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Recent Check-ins</h3>
            {checkIns.length > 0 ? (
              <ul className="space-y-2">
                {checkIns.map((checkIn) => (
                  <li key={checkIn.id} className="text-sm text-gray-400">
                    {formatDateTime(checkIn.checked_in_at)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No check-ins recorded</p>
            )}
          </div>

          {/* Billing Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Billing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status</span>
                <span
                  className={
                    member.payment_status === 'active'
                      ? 'text-green-400'
                      : member.payment_status === 'past_due'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }
                >
                  {member.payment_status?.charAt(0).toUpperCase() + member.payment_status?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stripe Customer</span>
                <span>{member.stripe_customer_id ? 'Yes' : 'No'}</span>
              </div>
              {member.last_payment_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Payment</span>
                  <span>{formatDate(member.last_payment_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
