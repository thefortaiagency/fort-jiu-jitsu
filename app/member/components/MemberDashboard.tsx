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
  XCircle,
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
  MapPin,
  Heart,
  Star,
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
        loadMemberData(); // Reload data
      } else {
        const data = await res.json();
        setSaveMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Network error. Please try again.' });
    }

    setTimeout(() => setSaveMessage(null), 3000);
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
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'inactive':
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const validWaiver = waivers.find((w) => w.isValid);

  // Render belt display
  const renderBeltDisplay = () => {
    if (!member.belt) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">No belt assigned yet</p>
          <p className="text-sm text-gray-600 mt-1">Contact your instructor to update your belt rank</p>
        </div>
      );
    }

    const { belt } = member;
    const stripes = [];
    for (let i = 0; i < belt.stripes; i++) {
      stripes.push(
        <div
          key={i}
          className="w-3 h-6 bg-white border border-gray-300 rounded-sm"
        />
      );
    }

    return (
      <div className="flex items-center gap-6">
        <div
          className="w-24 h-8 rounded-sm border-2 border-gray-700 flex items-center justify-end gap-1 px-1"
          style={{ backgroundColor: belt.colorHex }}
        >
          {stripes}
        </div>
        <div>
          <p className="text-xl font-bold">{belt.displayName}</p>
          <p className="text-sm text-gray-400">
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

      {/* Save Message */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg ${
              saveMessage.type === 'success'
                ? 'bg-green-900/50 border border-green-500 text-green-200'
                : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}
          >
            {saveMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
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
            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className={`w-5 h-5 ${getStatusColor(member.status)}`} />
                  <h3 className="text-sm font-medium text-gray-400">Status</h3>
                </div>
                <p className={`text-2xl font-bold capitalize ${getStatusColor(member.status)}`}>
                  {member.status}
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-medium text-gray-400">This Month</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {thisMonthCheckIns} <span className="text-sm text-gray-500">classes</span>
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-medium text-gray-400">Total Classes</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {member.totalClassesAttended}
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <FileCheck className={`w-5 h-5 ${validWaiver ? 'text-green-400' : 'text-red-400'}`} />
                  <h3 className="text-sm font-medium text-gray-400">Waiver</h3>
                </div>
                <p className={`text-2xl font-bold ${validWaiver ? 'text-green-400' : 'text-red-400'}`}>
                  {validWaiver ? 'Valid' : 'Expired'}
                </p>
              </div>
            </div>

            {/* Belt Rank */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold">Belt Rank</h2>
              </div>
              {renderBeltDisplay()}
            </div>

            {/* Membership Info */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold">Membership</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Program</p>
                  <p className="font-medium capitalize">{member.program?.replace('-', ' ') || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Plan</p>
                  <p className="font-medium capitalize">{member.membershipType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Monthly Rate</p>
                  <p className="font-medium">${member.individualMonthlyCost}/mo</p>
                </div>
              </div>
            </div>

            {/* Recent Check-ins Preview */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold">Recent Check-ins</h2>
                </div>
                <button
                  onClick={() => setActiveTab('checkins')}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {checkIns.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No check-ins yet</p>
                ) : (
                  checkIns.slice(0, 5).map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center gap-3 p-3 bg-black rounded-lg border border-gray-800"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">
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
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Check-in History</h2>
              <span className="text-sm text-gray-500">({checkIns.length} total)</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {checkIns.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No check-ins recorded yet</p>
              ) : (
                checkIns.map((checkIn, index) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center gap-4 p-4 bg-black rounded-lg border border-gray-800"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Check-in #{checkIns.length - index}</p>
                      <p className="text-sm text-gray-500">
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
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold">Personal Information</h2>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium">{member.firstName} {member.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {member.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg"
                    />
                  ) : (
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {member.phone || 'Not set'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Member ID</p>
                  <p className="font-mono text-sm text-gray-400">{member.id.slice(0, 8)}...</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold">Emergency Contact</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.emergency_contact_name}
                      onChange={(e) => setEditData({ ...editData, emergency_contact_name: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg"
                    />
                  ) : (
                    <p className="font-medium">{member.emergencyContact?.name || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.emergency_contact_phone}
                      onChange={(e) => setEditData({ ...editData, emergency_contact_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg"
                    />
                  ) : (
                    <p className="font-medium">{member.emergencyContact?.phone || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Relationship</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.emergency_contact_relationship}
                      onChange={(e) => setEditData({ ...editData, emergency_contact_relationship: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg"
                    />
                  ) : (
                    <p className="font-medium">{member.emergencyContact?.relationship || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold">Medical Information</h2>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Medical Conditions / Allergies</p>
                {isEditing ? (
                  <textarea
                    value={editData.medical_conditions}
                    onChange={(e) => setEditData({ ...editData, medical_conditions: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg"
                    placeholder="List any conditions, allergies, or medications..."
                  />
                ) : (
                  <p className="font-medium">{member.medicalConditions || 'None listed'}</p>
                )}
              </div>
            </div>

            {/* QR Code */}
            {member.qrCode && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📱</span>
                  <h2 className="text-xl font-bold">Your Check-in Code</h2>
                </div>
                <p className="font-mono text-lg bg-black px-4 py-2 rounded-lg inline-block">
                  {member.qrCode}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Use this code or scan your keychain tag at the kiosk to check in
                </p>
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
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold">Family Account</h2>
              </div>
              {member.isPrimaryAccountHolder && (
                <Link
                  href={`/signup?familyAccountId=${member.familyAccountId}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {familyMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No family members linked to this account</p>
                  {member.isPrimaryAccountHolder && (
                    <p className="text-sm text-gray-600 mt-2">
                      Click "Add Member" to add family members to your account
                    </p>
                  )}
                </div>
              ) : (
                familyMembers.map((fm) => (
                  <div
                    key={fm.id}
                    className="flex items-center gap-4 p-4 bg-black rounded-lg border border-gray-800"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {fm.firstName} {fm.lastName}
                        {fm.isPrimaryAccountHolder && (
                          <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">Primary</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {fm.program?.replace('-', ' ')}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        fm.status === 'active'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-gray-800 text-gray-400'
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
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800/50 text-center">
        <p className="text-gray-400 mb-4">Need help with your account?</p>
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
      </div>
    </div>
  );
}
