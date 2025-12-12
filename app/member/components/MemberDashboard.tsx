'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Users,
  Calendar,
  CreditCard,
  FileCheck,
  AlertCircle,
  CheckCircle,
  LogOut,
  UserPlus,
  Clock,
  TrendingUp,
  Award,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  Heart,
  Star,
  Ban,
  RefreshCw,
  DollarSign,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';

interface MemberDashboardProps {
  email: string;
  onLogout: () => void;
}

interface BeltInfo {
  name: string;
  displayName: string;
  colorHex: string;
  isKidsBelt: boolean;
  stripes: number;
  updatedAt: string | null;
}

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  status: string;
  paymentStatus: string;
  membershipType: string;
  program: string;
  skillLevel: string;
  isActive: boolean;
  individualMonthlyCost: number;
  isPrimaryAccountHolder: boolean;
  familyAccountId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  totalClassesAttended: number;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalConditions: string;
  qrCode: string | null;
  belt: BeltInfo | null;
  createdAt: string;
  updatedAt: string;
}

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  status: string;
  isPrimaryAccountHolder: boolean;
}

interface CheckIn {
  id: string;
  checkInTime: string;
  classType: string;
}

interface Waiver {
  id: string;
  waiverType: string;
  signedAt: string;
  signerName: string;
  isValid: boolean;
  expiresAt: string;
}

interface SubscriptionInfo {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  amount: number;
  interval: string;
  isInTrial: boolean;
  trialEnd: string | null;
}

type TabType = 'overview' | 'checkins' | 'profile' | 'family';

export default function MemberDashboard({ email, onLogout }: MemberDashboardProps) {
  const [member, setMember] = useState<MemberData | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [thisMonthCheckIns, setThisMonthCheckIns] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  useEffect(() => {
    loadMemberData();
  }, [email]);

  const loadMemberData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch member data
      const memberRes = await fetch(`/api/member/${encodeURIComponent(email)}`);
      if (!memberRes.ok) {
        throw new Error('Failed to load member data');
      }
      const memberData = await memberRes.json();
      setMember(memberData.member);
      setFamilyMembers(memberData.familyMembers || []);

      // Initialize edit data
      setEditData({
        phone: memberData.member.phone || '',
        emergency_contact_name: memberData.member.emergencyContact?.name || '',
        emergency_contact_phone: memberData.member.emergencyContact?.phone || '',
        emergency_contact_relationship: memberData.member.emergencyContact?.relationship || '',
        medical_conditions: memberData.member.medicalConditions || '',
      });

      // Fetch check-ins
      const checkInsRes = await fetch(`/api/member/${memberData.member.id}/check-ins`);
      if (checkInsRes.ok) {
        const checkInsData = await checkInsRes.json();
        setCheckIns(checkInsData.checkIns || []);
        setThisMonthCheckIns(checkInsData.thisMonthCount || 0);
      }

      // Fetch waivers
      const waiversRes = await fetch(`/api/member/${memberData.member.id}/waivers`);
      if (waiversRes.ok) {
        const waiversData = await waiversRes.json();
        setWaivers(waiversData.waivers || []);
      }

      // Fetch subscription details
      const subscriptionRes = await fetch(`/api/member/subscription?memberId=${memberData.member.id}`);
      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json();
        if (subscriptionData.hasSubscription) {
          setSubscription(subscriptionData.subscription);
        }
      }
    } catch (err) {
      console.error('Error loading member data:', err);
      setError('Failed to load member information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`/api/member/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        loadMemberData();
      } else {
        const data = await res.json();
        setSaveMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Network error. Please try again.' });
    }

    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleCancelMembership = async () => {
    if (!member) return;

    setIsCancelling(true);
    try {
      const res = await fetch('/api/member/cancel-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          reason: cancelReason,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSaveMessage({
          type: 'success',
          text: data.message || 'Your membership has been scheduled for cancellation.'
        });
        setShowCancelModal(false);
        setCancelReason('');
        loadMemberData();
      } else {
        const data = await res.json();
        setSaveMessage({ type: 'error', text: data.error || 'Failed to cancel membership' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsCancelling(false);
    }

    setTimeout(() => setSaveMessage(null), 5000);
  };

  const handleDropInPayment = async () => {
    if (!member) return;

    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/member/drop-in-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to create payment session' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleResubscribe = async () => {
    if (!member) return;

    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/member/resubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to create subscription' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOneClickCheckIn = async () => {
    if (!member || isCheckingIn) return;

    setIsCheckingIn(true);
    try {
      const res = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: member.id,
          check_in_method: 'one-tap',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCheckInSuccess(true);
        setThisMonthCheckIns(prev => prev + 1);
        // Reload check-ins to show updated list
        const checkInsRes = await fetch(`/api/member/${member.id}/check-ins`);
        if (checkInsRes.ok) {
          const checkInsData = await checkInsRes.json();
          setCheckIns(checkInsData.checkIns || []);
        }
        // Reset success state after 5 seconds
        setTimeout(() => setCheckInSuccess(false), 5000);
      } else if (data.error?.includes('already checked in')) {
        setAlreadyCheckedIn(true);
        setTimeout(() => setAlreadyCheckedIn(false), 4000);
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Check-in failed. Please try again.' });
        setTimeout(() => setSaveMessage(null), 4000);
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Network error. Please try again.' });
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-[#e2e2e2] dark:border-[#303030] border-t-[#1b1b1b] dark:border-t-white rounded-full mx-auto mb-4"
          />
          <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Error</h2>
          </div>
          <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-6">
            {error || 'Member not found. Please check your email and try again.'}
          </p>
          <button
            onClick={onLogout}
            className="w-full bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-6 py-3 rounded-full font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'inactive':
      case 'cancelled': return 'text-red-600 dark:text-red-400';
      default: return 'text-[#5e5e5e] dark:text-[#b9b9b9]';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'inactive':
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-[#f9f9f9] dark:bg-[#303030]';
    }
  };

  const validWaiver = waivers.find((w) => w.isValid);

  const renderBeltDisplay = () => {
    if (!member.belt) {
      return (
        <div className="text-center py-4">
          <p className="text-[#777777]">No belt assigned yet</p>
          <p className="text-sm text-[#999999] mt-1">Contact your instructor to update your belt rank</p>
        </div>
      );
    }

    const { belt } = member;
    const stripes = [];
    for (let i = 0; i < belt.stripes; i++) {
      stripes.push(
        <div
          key={i}
          className="w-3 h-6 bg-white border border-[#e2e2e2] rounded-sm"
        />
      );
    }

    return (
      <div className="flex items-center gap-6">
        <div
          className="w-24 h-8 rounded-sm border-2 border-[#303030] flex items-center justify-end gap-1 px-1"
          style={{ backgroundColor: belt.colorHex }}
        >
          {stripes}
        </div>
        <div>
          <p className="text-xl font-bold text-[#1b1b1b] dark:text-white">{belt.displayName}</p>
          <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">
            {belt.stripes > 0 ? `${belt.stripes} stripe${belt.stripes > 1 ? 's' : ''}` : 'No stripes yet'}
            {belt.updatedAt && (
              <span className="ml-2">- Promoted {formatDate(belt.updatedAt)}</span>
            )}
          </p>
        </div>
      </div>
    );
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'checkins', label: 'Check-ins', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: Edit },
    { id: 'family', label: 'Family', icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1b1b1b] dark:text-white mb-2">
            Welcome back, {member.firstName}
          </h1>
          <p className="text-[#5e5e5e] dark:text-[#b9b9b9]">
            Member since {formatDate(member.createdAt)}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-[#5e5e5e] dark:text-[#b9b9b9] hover:text-[#1b1b1b] dark:hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Save Message */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl ${
              saveMessage.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            {saveMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status-specific banners */}
      {member.status === 'pending' && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-200 dark:bg-yellow-800/50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-1">Payment Required</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                Your membership signup is pending. Please complete payment to activate your account.
              </p>
              <button
                onClick={handleResubscribe}
                disabled={isProcessingPayment}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-600 text-white rounded-full font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Complete Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {member.status === 'cancelled' && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-200 dark:bg-red-800/50 flex items-center justify-center flex-shrink-0">
              <Ban className="w-6 h-6 text-red-700 dark:text-red-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-1">Membership Cancelled</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Your membership has been cancelled. You can rejoin anytime or purchase a drop-in class.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleResubscribe}
                  disabled={isProcessingPayment}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] rounded-full font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-colors disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Rejoin Membership
                    </>
                  )}
                </button>
                <button
                  onClick={handleDropInPayment}
                  disabled={isProcessingPayment}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#e2e2e2] dark:border-[#303030] text-[#1b1b1b] dark:text-white rounded-full font-medium hover:bg-[#f9f9f9] dark:hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                >
                  <DollarSign className="w-4 h-4" />
                  Buy Drop-in ($20)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {member.status === 'inactive' && (
        <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">Membership Inactive</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your membership is currently inactive. Reactivate to continue training.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleResubscribe}
                  disabled={isProcessingPayment}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] rounded-full font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reactivate Membership
                </button>
                <button
                  onClick={handleDropInPayment}
                  disabled={isProcessingPayment}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#e2e2e2] dark:border-[#303030] text-[#1b1b1b] dark:text-white rounded-full font-medium hover:bg-[#f9f9f9] dark:hover:bg-[#1b1b1b] transition-colors disabled:opacity-50"
                >
                  <DollarSign className="w-4 h-4" />
                  Buy Drop-in ($20)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drop-in option for active members */}
      {member.status === 'active' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Need extra classes? Purchase a drop-in for a friend or family member.
              </span>
            </div>
            <button
              onClick={handleDropInPayment}
              disabled={isProcessingPayment}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              Buy Drop-in ($20)
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#e2e2e2] dark:border-[#303030] pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b]'
                : 'text-[#5e5e5e] dark:text-[#b9b9b9] hover:text-[#1b1b1b] dark:hover:text-white hover:bg-[#f9f9f9] dark:hover:bg-[#1b1b1b]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* One-Tap Check-In */}
            {member.status === 'active' && (
              <div className={`rounded-3xl p-6 border transition-all ${
                checkInSuccess
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border-green-300 dark:border-green-700'
                  : alreadyCheckedIn
                  ? 'bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
              }`}>
                {checkInSuccess ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                    >
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-1">You're Checked In!</h3>
                    <p className="text-green-600 dark:text-green-400">Have a great training session, {member.firstName}!</p>
                  </motion.div>
                ) : alreadyCheckedIn ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-1">Already Checked In</h3>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">You've already checked in today. Enjoy your training!</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <motion.button
                      onClick={handleOneClickCheckIn}
                      disabled={isCheckingIn}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isCheckingIn ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                          />
                          Checking In...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-7 h-7" />
                          Check In Now
                        </>
                      )}
                    </motion.button>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-1">Ready to Train?</h3>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        One tap and you're in. No scanning needed!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1b1b1b] rounded-2xl p-6 border border-[#e2e2e2] dark:border-[#303030]">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${getStatusBg(member.status)} flex items-center justify-center`}>
                    <CheckCircle className={`w-4 h-4 ${getStatusColor(member.status)}`} />
                  </div>
                  <h3 className="text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9]">Status</h3>
                </div>
                <p className={`text-2xl font-bold capitalize ${getStatusColor(member.status)}`}>
                  {member.status}
                </p>
              </div>

              <div className="bg-white dark:bg-[#1b1b1b] rounded-2xl p-6 border border-[#e2e2e2] dark:border-[#303030]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9]">This Month</h3>
                </div>
                <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white">
                  {thisMonthCheckIns} <span className="text-sm font-normal text-[#777777]">classes</span>
                </p>
              </div>

              <div className="bg-white dark:bg-[#1b1b1b] rounded-2xl p-6 border border-[#e2e2e2] dark:border-[#303030]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9]">Total Classes</h3>
                </div>
                <p className="text-2xl font-bold text-[#1b1b1b] dark:text-white">
                  {member.totalClassesAttended}
                </p>
              </div>

              <div className="bg-white dark:bg-[#1b1b1b] rounded-2xl p-6 border border-[#e2e2e2] dark:border-[#303030]">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${validWaiver ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} flex items-center justify-center`}>
                    <FileCheck className={`w-4 h-4 ${validWaiver ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                  </div>
                  <h3 className="text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9]">Waiver</h3>
                </div>
                <p className={`text-2xl font-bold ${validWaiver ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {validWaiver ? 'Valid' : 'Expired'}
                </p>
                {!validWaiver && (
                  <Link
                    href="/member/renew-waiver"
                    className="mt-3 inline-block text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    Renew Now
                  </Link>
                )}
              </div>
            </div>

            {/* Belt Rank */}
            <div className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Belt Rank</h2>
              </div>
              {renderBeltDisplay()}
            </div>

            {/* Membership Info */}
            <div className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Membership</h2>
                </div>
                {member.status === 'active' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-sm text-[#777777] hover:text-red-500 transition-colors"
                  >
                    Cancel Membership
                  </button>
                )}
              </div>
              {member.status === 'pending_cancellation' && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">Cancellation Pending</p>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                    Your membership will end at the end of your current billing period.
                  </p>
                </div>
              )}
              {(member.status === 'cancelled' || member.status === 'inactive') && (
                <div className="bg-gray-100 dark:bg-gray-800/30 border border-gray-300 dark:border-gray-600 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No active subscription. Use the options above to rejoin or purchase a drop-in class.
                  </p>
                </div>
              )}
              {member.status === 'pending' && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">Payment Pending</p>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                    Complete your payment to activate your membership.
                  </p>
                </div>
              )}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-[#777777] mb-1">Program</p>
                  <p className="font-medium text-[#1b1b1b] dark:text-white capitalize">{member.program?.replace('-', ' ') || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-[#777777] mb-1">Plan</p>
                  <p className="font-medium text-[#1b1b1b] dark:text-white capitalize">{member.membershipType}</p>
                </div>
                <div>
                  <p className="text-sm text-[#777777] mb-1">Monthly Rate</p>
                  <p className="font-medium text-[#1b1b1b] dark:text-white">${subscription?.amount || member.individualMonthlyCost}/{subscription?.interval || 'mo'}</p>
                </div>
              </div>

              {subscription && (
                <div className="mt-6 pt-6 border-t border-[#e2e2e2] dark:border-[#303030]">
                  <div className="grid md:grid-cols-2 gap-6">
                    {subscription.isInTrial && subscription.trialEnd ? (
                      <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1">
                          <Clock className="w-4 h-4" />
                          <p className="text-sm font-medium">Free Trial Active</p>
                        </div>
                        <p className="text-[#1b1b1b] dark:text-white font-medium">
                          Trial ends {formatDate(subscription.trialEnd)}
                        </p>
                        <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9] mt-1">
                          First charge of ${subscription.amount} on {formatDate(subscription.trialEnd)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-[#777777] mb-1">Next Billing Date</p>
                        <p className="font-medium text-[#1b1b1b] dark:text-white">
                          {formatDate(subscription.nextBillingDate)}
                        </p>
                        <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">
                          ${subscription.amount} will be charged
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-[#777777] mb-1">Billing Period</p>
                      <p className="font-medium text-[#1b1b1b] dark:text-white capitalize">{subscription.interval}ly</p>
                      <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">
                        Current period: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Check-ins Preview */}
            <div className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Recent Check-ins</h2>
                </div>
                <button
                  onClick={() => setActiveTab('checkins')}
                  className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9] hover:text-[#1b1b1b] dark:hover:text-white"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {checkIns.length === 0 ? (
                  <p className="text-[#777777] text-center py-4">No check-ins yet</p>
                ) : (
                  checkIns.slice(0, 5).map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center gap-3 p-4 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-xl border border-[#e2e2e2] dark:border-[#303030]"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div className="flex-1">
                        <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">
                          {formatDate(checkIn.checkInTime)} at {formatTime(checkIn.checkInTime)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'checkins' && (
          <motion.div
            key="checkins"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Check-in History</h2>
              <span className="text-sm text-[#777777]">({checkIns.length} total)</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {checkIns.length === 0 ? (
                <p className="text-[#777777] text-center py-8">No check-ins recorded yet</p>
              ) : (
                checkIns.map((checkIn, index) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center gap-4 p-4 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-xl border border-[#e2e2e2] dark:border-[#303030]"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1b1b1b] dark:text-white">Check-in #{checkIns.length - index}</p>
                      <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">
                        {formatDate(checkIn.checkInTime)} at {formatTime(checkIn.checkInTime)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Personal Info */}
            <div className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f9f9f9] dark:bg-[#303030] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Personal Information</h2>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#e2e2e2] dark:border-[#303030] rounded-full hover:bg-[#f9f9f9] dark:hover:bg-[#303030] text-[#1b1b1b] dark:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 border border-[#e2e2e2] dark:border-[#303030] rounded-full hover:bg-[#f9f9f9] dark:hover:bg-[#303030] text-[#1b1b1b] dark:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-[#777777] mb-1">Full Name</p>
                  <p className="font-medium text-[#1b1b1b] dark:text-white">{member.firstName} {member.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#777777] mb-1">Email</p>
                  <p className="font-medium text-[#1b1b1b] dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#777777]" />
                    {member.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#777777] mb-1">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-[#f9f9f9] dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl text-[#1b1b1b] dark:text-white"
                    />
                  ) : (
                    <p className="font-medium text-[#1b1b1b] dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#777777]" />
                      {member.phone || 'Not set'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#777777] mb-1">Member ID</p>
                  <p className="font-mono text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">{member.id.slice(0, 8)}...</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Emergency Contact</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-[#777777] mb-1">Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.emergency_contact_name}
                      onChange={(e) => setEditData({ ...editData, emergency_contact_name: e.target.value })}
                      className="w-full px-4 py-2 bg-[#f9f9f9] dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl text-[#1b1b1b] dark:text-white"
                    />
                  ) : (
                    <p className="font-medium text-[#1b1b1b] dark:text-white">{member.emergencyContact?.name || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#777777] mb-1">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.emergency_contact_phone}
                      onChange={(e) => setEditData({ ...editData, emergency_contact_phone: e.target.value })}
                      className="w-full px-4 py-2 bg-[#f9f9f9] dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl text-[#1b1b1b] dark:text-white"
                    />
                  ) : (
                    <p className="font-medium text-[#1b1b1b] dark:text-white">{member.emergencyContact?.phone || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#777777] mb-1">Relationship</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.emergency_contact_relationship}
                      onChange={(e) => setEditData({ ...editData, emergency_contact_relationship: e.target.value })}
                      className="w-full px-4 py-2 bg-[#f9f9f9] dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl text-[#1b1b1b] dark:text-white"
                    />
                  ) : (
                    <p className="font-medium text-[#1b1b1b] dark:text-white">{member.emergencyContact?.relationship || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Medical Information</h2>
              </div>

              <div>
                <p className="text-sm text-[#777777] mb-1">Medical Conditions / Allergies</p>
                {isEditing ? (
                  <textarea
                    value={editData.medical_conditions}
                    onChange={(e) => setEditData({ ...editData, medical_conditions: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#f9f9f9] dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl text-[#1b1b1b] dark:text-white"
                    placeholder="List any conditions, allergies, or medications..."
                  />
                ) : (
                  <p className="font-medium text-[#1b1b1b] dark:text-white">{member.medicalConditions || 'None listed'}</p>
                )}
              </div>
            </div>

            {/* QR Code */}
            {member.qrCode && (
              <div className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#f9f9f9] dark:bg-[#303030] flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Your Check-in QR Code</h2>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* QR Code Image */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-[#e2e2e2] dark:border-[#303030] shadow-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(member.qrCode)}&bgcolor=ffffff&color=1b1b1b`}
                      alt="Your check-in QR code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-4">
                      Show this QR code at the check-in kiosk or scan it with your phone when you arrive
                    </p>
                    <div className="mb-4">
                      <p className="text-sm text-[#777777] mb-1">Your Code</p>
                      <p className="font-mono text-xl bg-[#f9f9f9] dark:bg-[#0a0a0a] text-[#1b1b1b] dark:text-white px-4 py-2 rounded-xl inline-block border border-[#e2e2e2] dark:border-[#303030]">
                        {member.qrCode}
                      </p>
                    </div>
                    <Link
                      href="/check-in"
                      className="inline-flex items-center gap-2 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] px-6 py-3 rounded-full font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Go to Check-in
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'family' && (
          <motion.div
            key="family"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f9f9f9] dark:bg-[#303030] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#1b1b1b] dark:text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Family Account</h2>
              </div>
              {member.isPrimaryAccountHolder && (
                <Link
                  href={`/signup?familyAccountId=${member.familyAccountId}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] rounded-full hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {familyMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-[#999999] mx-auto mb-4" />
                  <p className="text-[#777777]">No family members linked to this account</p>
                  {member.isPrimaryAccountHolder && (
                    <p className="text-sm text-[#999999] mt-2">
                      Click &quot;Add Member&quot; to add family members to your account
                    </p>
                  )}
                </div>
              ) : (
                familyMembers.map((fm) => (
                  <div
                    key={fm.id}
                    className="flex items-center gap-4 p-4 bg-[#f9f9f9] dark:bg-[#0a0a0a] rounded-xl border border-[#e2e2e2] dark:border-[#303030]"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#e2e2e2] dark:bg-[#303030] flex items-center justify-center">
                      <User className="w-6 h-6 text-[#5e5e5e] dark:text-[#b9b9b9]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1b1b1b] dark:text-white">
                        {fm.firstName} {fm.lastName}
                        {fm.isPrimaryAccountHolder && (
                          <span className="ml-2 text-xs bg-[#e2e2e2] dark:bg-[#303030] text-[#5e5e5e] dark:text-[#b9b9b9] px-2 py-1 rounded">Primary</span>
                        )}
                      </p>
                      <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9] capitalize">
                        {fm.program?.replace('-', ' ')}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        fm.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-[#f9f9f9] dark:bg-[#303030] text-[#5e5e5e] dark:text-[#b9b9b9]'
                      }`}
                    >
                      {fm.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Support */}
      <div className="bg-[#f9f9f9] dark:bg-[#1b1b1b]/50 rounded-3xl p-8 border border-[#e2e2e2] dark:border-[#303030]/50 text-center">
        <p className="text-[#5e5e5e] dark:text-[#b9b9b9] mb-6">Need help with your account?</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:2604527615"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1b1b1b] dark:bg-white text-white dark:text-[#1b1b1b] rounded-full font-medium hover:bg-[#303030] dark:hover:bg-[#e2e2e2] transition-colors"
          >
            Call (260) 452-7615
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#e2e2e2] dark:border-[#303030] text-[#1b1b1b] dark:text-white rounded-full font-medium hover:border-[#1b1b1b] dark:hover:border-white transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>

      {/* Cancel Membership Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isCancelling && setShowCancelModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1b1b1b] rounded-3xl p-8 max-w-md w-full border border-[#e2e2e2] dark:border-[#303030] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1b1b1b] dark:text-white">Cancel Membership</h3>
                  <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">We&apos;re sorry to see you go</p>
                </div>
              </div>

              <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-2xl p-4 mb-6">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  Your membership will remain active until the end of your current billing period.
                  You can continue training until then.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#5e5e5e] dark:text-[#b9b9b9]">
                  Help us improve - why are you leaving? (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you're cancelling..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#f9f9f9] dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#303030] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-[#1b1b1b] dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-3 border border-[#e2e2e2] dark:border-[#303030] rounded-full text-[#1b1b1b] dark:text-white hover:bg-[#f9f9f9] dark:hover:bg-[#303030] transition-colors disabled:opacity-50"
                >
                  Keep Membership
                </button>
                <button
                  onClick={handleCancelMembership}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
