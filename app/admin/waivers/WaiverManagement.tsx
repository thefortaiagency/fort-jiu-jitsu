'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import AdminNav from '../components/AdminNav';
import {
  isWaiverValid,
  daysUntilExpiration,
  getWaiverExpiration,
  needsAdultWaiver,
} from '@/lib/waiver-utils';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  status: string;
  birth_date: string | null;
}

interface Waiver {
  id: string;
  member_id: string;
  signed_at: string;
  waiver_type: string;
  signer_name: string;
  signer_relationship: string;
}

interface WaiverManagementProps {
  user: User;
  initialMembers: Member[];
  initialWaivers: Waiver[];
}

type FilterStatus = 'all' | 'valid' | 'expiring' | 'expired' | 'no_waiver' | 'turned_18';

interface MemberWithWaiver extends Member {
  waiver: Waiver | null;
  waiverStatus: 'valid' | 'expiring' | 'expired' | 'no_waiver' | 'turned_18';
  daysUntilExpiration: number | null;
  expirationDate: Date | null;
}

export default function WaiverManagement({
  user,
  initialMembers,
  initialWaivers,
}: WaiverManagementProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  // Process members with their waiver status
  const membersWithWaivers = useMemo<MemberWithWaiver[]>(() => {
    return initialMembers.map((member) => {
      // Find the most recent waiver for this member
      const memberWaivers = initialWaivers.filter((w) => w.member_id === member.id);
      const mostRecentWaiver = memberWaivers.length > 0 ? memberWaivers[0] : null;

      let waiverStatus: MemberWithWaiver['waiverStatus'] = 'no_waiver';
      let daysUntil: number | null = null;
      let expirationDate: Date | null = null;

      if (mostRecentWaiver) {
        daysUntil = daysUntilExpiration(mostRecentWaiver.signed_at);
        expirationDate = getWaiverExpiration(mostRecentWaiver.signed_at);

        // Check if member turned 18 and needs new waiver
        if (
          member.birth_date &&
          needsAdultWaiver(
            member.birth_date,
            mostRecentWaiver.signed_at,
            mostRecentWaiver.signer_relationship
          )
        ) {
          waiverStatus = 'turned_18';
        } else if (daysUntil < 0) {
          waiverStatus = 'expired';
        } else if (daysUntil <= 30) {
          waiverStatus = 'expiring';
        } else {
          waiverStatus = 'valid';
        }
      }

      return {
        ...member,
        waiver: mostRecentWaiver,
        waiverStatus,
        daysUntilExpiration: daysUntil,
        expirationDate,
      };
    });
  }, [initialMembers, initialWaivers]);

  // Filter and search members
  const filteredMembers = useMemo(() => {
    let filtered = membersWithWaivers;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((m) => m.waiverStatus === filterStatus);
    }

    // Search by name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.first_name.toLowerCase().includes(query) ||
          m.last_name.toLowerCase().includes(query) ||
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [membersWithWaivers, filterStatus, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = membersWithWaivers.length;
    const valid = membersWithWaivers.filter((m) => m.waiverStatus === 'valid').length;
    const expiring = membersWithWaivers.filter((m) => m.waiverStatus === 'expiring').length;
    const expired = membersWithWaivers.filter((m) => m.waiverStatus === 'expired').length;
    const noWaiver = membersWithWaivers.filter((m) => m.waiverStatus === 'no_waiver').length;
    const turned18 = membersWithWaivers.filter((m) => m.waiverStatus === 'turned_18').length;

    return {
      total,
      valid,
      expiring,
      expired,
      noWaiver,
      turned18,
      needsAttention: expiring + expired + noWaiver + turned18,
    };
  }, [membersWithWaivers]);

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleSendReminder = (member: MemberWithWaiver) => {
    console.log('Sending reminder to:', member.email, {
      name: `${member.first_name} ${member.last_name}`,
      status: member.waiverStatus,
      daysUntilExpiration: member.daysUntilExpiration,
    });
    alert(`Reminder email will be sent to ${member.email}`);
  };

  const handleBulkReminders = () => {
    const needsReminder = filteredMembers.filter(
      (m) =>
        m.waiverStatus === 'expiring' ||
        m.waiverStatus === 'expired' ||
        m.waiverStatus === 'no_waiver' ||
        m.waiverStatus === 'turned_18'
    );

    console.log('Sending bulk reminders to:', needsReminder.length, 'members');
    needsReminder.forEach((member) => {
      console.log('  -', member.email, `(${member.waiverStatus})`);
    });
    alert(`Bulk reminder emails will be sent to ${needsReminder.length} members`);
  };

  const handleToggleSelect = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const handleSendSelectedReminders = () => {
    const selected = filteredMembers.filter((m) => selectedMembers.has(m.id));
    console.log('Sending reminders to selected members:', selected.length);
    selected.forEach((member) => {
      console.log('  -', member.email, `(${member.waiverStatus})`);
    });
    alert(`Reminder emails will be sent to ${selected.length} selected members`);
    setSelectedMembers(new Set());
  };

  const getStatusBadge = (status: MemberWithWaiver['waiverStatus']) => {
    const badges = {
      valid: 'bg-green-900/50 text-green-400 border border-green-800',
      expiring: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
      expired: 'bg-red-900/50 text-red-400 border border-red-800',
      no_waiver: 'bg-gray-700/50 text-gray-400 border border-gray-600',
      turned_18: 'bg-orange-900/50 text-orange-400 border border-orange-800',
    };

    const labels = {
      valid: 'Valid',
      expiring: 'Expiring Soon',
      expired: 'Expired',
      no_waiver: 'No Waiver',
      turned_18: 'Turned 18',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Watermark Logo Background */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="relative w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] opacity-[0.06]">
          <Image
            src="/jiu-jitsu.png"
            alt=""
            fill
            className="object-contain invert"
            priority
          />
        </div>
      </div>

      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-gray-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/admin" className="flex items-center gap-4">
              <div className="relative w-36 h-10 md:w-48 md:h-14">
                <Image
                  src="/jiu-jitsu.png"
                  alt="The Fort Jiu-Jitsu"
                  fill
                  className="object-contain object-left invert"
                  priority
                />
              </div>
              <div className="border-l border-gray-700 pl-4">
                <p className="text-gray-400 text-sm">Waiver Management</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm hidden md:block">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Total Waivers</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gray-900 border border-green-900/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Valid</p>
            <p className="text-2xl font-bold text-green-400">{stats.valid}</p>
          </div>
          <div className="bg-gray-900 border border-yellow-900/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Expiring Soon</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.expiring}</p>
          </div>
          <div className="bg-gray-900 border border-red-900/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Expired</p>
            <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">No Waiver</p>
            <p className="text-2xl font-bold text-gray-400">{stats.noWaiver}</p>
          </div>
          <div className="bg-gray-900 border border-orange-900/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Turned 18</p>
            <p className="text-2xl font-bold text-orange-400">{stats.turned18}</p>
          </div>
          <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Needs Attention</p>
            <p className="text-2xl font-bold text-blue-400">{stats.needsAttention}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Search Members</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-700"
              />
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-700"
              >
                <option value="all">All Status ({stats.total})</option>
                <option value="valid">Valid ({stats.valid})</option>
                <option value="expiring">Expiring in 30 Days ({stats.expiring})</option>
                <option value="expired">Expired ({stats.expired})</option>
                <option value="no_waiver">No Waiver ({stats.noWaiver})</option>
                <option value="turned_18">Turned 18 ({stats.turned18})</option>
              </select>
            </div>

            {/* Bulk Actions */}
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Bulk Actions</label>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkReminders}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Send All Reminders
                </button>
                {selectedMembers.size > 0 && (
                  <button
                    onClick={handleSendSelectedReminders}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Send to Selected ({selectedMembers.size})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        filteredMembers.length > 0 && selectedMembers.size === filteredMembers.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-700 bg-black text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Member
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Signed Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Expires
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Days Until
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No members found
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMembers.has(member.id)}
                          onChange={() => handleToggleSelect(member.id)}
                          className="rounded border-gray-700 bg-black text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {member.first_name} {member.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {member.email || 'N/A'}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(member.waiverStatus)}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {member.waiver ? formatDate(new Date(member.waiver.signed_at)) : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {member.expirationDate ? formatDate(member.expirationDate) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {member.daysUntilExpiration !== null ? (
                          <span
                            className={
                              member.daysUntilExpiration < 0
                                ? 'text-red-400'
                                : member.daysUntilExpiration <= 30
                                ? 'text-yellow-400'
                                : 'text-gray-400'
                            }
                          >
                            {member.daysUntilExpiration < 0
                              ? `${Math.abs(member.daysUntilExpiration)} days ago`
                              : `${member.daysUntilExpiration} days`}
                          </span>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {member.waiverStatus !== 'valid' && member.email && (
                          <button
                            onClick={() => handleSendReminder(member)}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                          >
                            Send Reminder
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-400 text-center">
          Showing {filteredMembers.length} of {stats.total} members
        </div>
      </main>
    </div>
  );
}
