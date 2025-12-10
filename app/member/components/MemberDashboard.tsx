'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Users,
  Calendar,
  CreditCard,
  FileCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogOut,
  UserPlus,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface MemberDashboardProps {
  email: string;
  onLogout: () => void;
}

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  paymentStatus: string;
  membershipType: string;
  program: string;
  isActive: boolean;
  individualMonthlyCost: number;
  isPrimaryAccountHolder: boolean;
  familyAccountId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
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

export default function MemberDashboard({ email, onLogout }: MemberDashboardProps) {
  const [member, setMember] = useState<MemberData | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [thisMonthCheckIns, setThisMonthCheckIns] = useState(0);

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

      // Fetch check-ins
      const checkInsRes = await fetch(
        `/api/member/${memberData.member.id}/check-ins`
      );
      if (checkInsRes.ok) {
        const checkInsData = await checkInsRes.json();
        setCheckIns(checkInsData.checkIns || []);
        setThisMonthCheckIns(checkInsData.thisMonthCount || 0);
      }

      // Fetch waivers
      const waiversRes = await fetch(
        `/api/member/${memberData.member.id}/waivers`
      );
      if (waiversRes.ok) {
        const waiversData = await waiversRes.json();
        setWaivers(waiversData.waivers || []);
      }
    } catch (err) {
      console.error('Error loading member data:', err);
      setError('Failed to load member information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gray-900 rounded-2xl p-8 border border-red-900/50">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="text-gray-400 mb-6">
            {error || 'Member not found. Please check your email and try again.'}
          </p>
          <button
            onClick={onLogout}
            className="w-full bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string, paymentStatus: string) => {
    if (status === 'active' && paymentStatus === 'active') {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    } else if (paymentStatus === 'past_due') {
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusText = (status: string, paymentStatus: string) => {
    if (status === 'active' && paymentStatus === 'active') {
      return { text: 'Active', color: 'text-green-400' };
    } else if (paymentStatus === 'past_due') {
      return { text: 'Payment Due', color: 'text-yellow-400' };
    } else if (status === 'cancelled') {
      return { text: 'Cancelled', color: 'text-red-400' };
    } else {
      return { text: 'Inactive', color: 'text-gray-400' };
    }
  };

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

  const statusInfo = getStatusText(member.status, member.paymentStatus);
  const validWaiver = waivers.find((w) => w.isValid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {member.firstName}
          </h1>
          <p className="text-gray-400">
            Member since {formatDate(member.createdAt)}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Membership Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            {getStatusIcon(member.status, member.paymentStatus)}
            <h3 className="text-sm font-medium text-gray-400">Status</h3>
          </div>
          <p className={`text-2xl font-bold ${statusInfo.color}`}>
            {statusInfo.text}
          </p>
        </motion.div>

        {/* Check-ins This Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-400">This Month</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {thisMonthCheckIns} <span className="text-sm text-gray-500">check-ins</span>
          </p>
        </motion.div>

        {/* Membership Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-gray-400">Plan</h3>
          </div>
          <p className="text-2xl font-bold text-white capitalize">
            {member.membershipType}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ${member.individualMonthlyCost}/mo
          </p>
        </motion.div>

        {/* Waiver Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <FileCheck className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-medium text-gray-400">Waiver</h3>
          </div>
          <p className={`text-2xl font-bold ${validWaiver ? 'text-green-400' : 'text-red-400'}`}>
            {validWaiver ? 'Valid' : 'Expired'}
          </p>
          {validWaiver && (
            <p className="text-sm text-gray-500 mt-1">
              Until {formatDate(validWaiver.expiresAt)}
            </p>
          )}
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Family Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900 rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold">Family Members</h2>
            </div>
            {member.isPrimaryAccountHolder && (
              <Link
                href={`/signup?familyAccountId=${member.familyAccountId}`}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {familyMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No family members linked to this account
              </p>
            ) : (
              familyMembers.map((familyMember) => (
                <div
                  key={familyMember.id}
                  className="flex items-center gap-3 p-4 bg-black rounded-lg border border-gray-800"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {familyMember.firstName} {familyMember.lastName}
                      {familyMember.isPrimaryAccountHolder && (
                        <span className="ml-2 text-xs text-gray-500">(Primary)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {familyMember.program.replace('-', ' ')}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      familyMember.status === 'active'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {familyMember.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Check-ins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900 rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold">Recent Check-ins</h2>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {checkIns.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No check-ins recorded yet
              </p>
            ) : (
              checkIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center gap-3 p-4 bg-black rounded-lg border border-gray-800"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium capitalize">
                      {checkIn.classType.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(checkIn.checkInTime)} at {formatTime(checkIn.checkInTime)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Account Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-900 rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold">Account Details</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Full Name</p>
            <p className="font-medium">
              {member.firstName} {member.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="font-medium">{member.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Program</p>
            <p className="font-medium capitalize">
              {member.program.replace('-', ' ')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Account Type</p>
            <p className="font-medium">
              {member.isPrimaryAccountHolder
                ? 'Primary Account Holder'
                : 'Family Member'}
            </p>
          </div>
          {member.stripeSubscriptionId && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Billing Status</p>
              <p className="font-medium capitalize flex items-center gap-2">
                {member.paymentStatus}
                {getStatusIcon(member.status, member.paymentStatus)}
              </p>
            </div>
          )}
        </div>

        {member.paymentStatus === 'past_due' && (
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-400 mb-1">
                  Payment Required
                </p>
                <p className="text-sm text-gray-400">
                  Your membership payment is past due. Please update your payment
                  information to continue accessing classes.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-900/50 rounded-xl p-6 border border-gray-800/50 text-center"
      >
        <p className="text-gray-400 mb-4">
          Need help with your account?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:2604527615"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Call (260) 452-7615
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-white rounded-xl font-medium hover:border-white transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
