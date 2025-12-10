'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Member } from '@/lib/supabase';
import AdminNav from '../components/AdminNav';

interface CheckInManagementProps {
  user: User;
}

interface CheckIn {
  id: string;
  member_id: string;
  checked_in_at: string;
  class_id: string | null;
  member?: Member;
}

interface CheckInStats {
  totalCheckIns: number;
  uniqueMembers: number;
  byProgram: { [key: string]: number };
}

export default function CheckInManagement({ user }: CheckInManagementProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CheckInStats>({
    totalCheckIns: 0,
    uniqueMembers: 0,
    byProgram: {},
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const fetchCheckIns = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    // Get check-ins for selected date
    const startOfDay = `${selectedDate}T00:00:00`;
    const endOfDay = `${selectedDate}T23:59:59`;

    const { data: checkInsData, error: checkInsError } = await supabase
      .from('check_ins')
      .select('*')
      .gte('checked_in_at', startOfDay)
      .lte('checked_in_at', endOfDay)
      .order('checked_in_at', { ascending: false });

    if (checkInsError) {
      console.error('Error fetching check-ins:', checkInsError);
      setLoading(false);
      return;
    }

    // Get all members to join with check-ins
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('last_name', { ascending: true });

    if (membersError) {
      console.error('Error fetching members:', membersError);
      setLoading(false);
      return;
    }

    setMembers(membersData || []);

    // Join check-ins with member data
    const checkInsWithMembers = (checkInsData || []).map((checkIn) => ({
      ...checkIn,
      member: membersData?.find((m) => m.id === checkIn.member_id),
    }));

    setCheckIns(checkInsWithMembers);

    // Calculate stats
    const uniqueMemberIds = new Set(checkInsData?.map((c) => c.member_id) || []);
    const byProgram: { [key: string]: number } = {};

    checkInsWithMembers.forEach((checkIn) => {
      if (checkIn.member?.program) {
        byProgram[checkIn.member.program] = (byProgram[checkIn.member.program] || 0) + 1;
      }
    });

    setStats({
      totalCheckIns: checkInsData?.length || 0,
      uniqueMembers: uniqueMemberIds.size,
      byProgram,
    });

    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  // Real-time subscription for check-ins
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const startOfDay = `${selectedDate}T00:00:00`;
    const endOfDay = `${selectedDate}T23:59:59`;

    const channel = supabase
      .channel('check_ins_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'check_ins',
          filter: `checked_in_at=gte.${startOfDay},checked_in_at=lte.${endOfDay}`,
        },
        () => {
          fetchCheckIns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, fetchCheckIns]);

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleAddCheckIn = async () => {
    if (!selectedMemberId) {
      alert('Please select a member');
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from('check_ins').insert({
      member_id: selectedMemberId,
      checked_in_at: new Date().toISOString(),
      class_id: null,
    });

    if (error) {
      alert('Error adding check-in: ' + error.message);
      return;
    }

    setShowAddModal(false);
    setSelectedMemberId('');
    fetchCheckIns();
  };

  const handleExportCSV = () => {
    const headers = ['Member Name', 'Email', 'Program', 'Check-In Time'];
    const rows = checkIns.map((checkIn) => [
      checkIn.member
        ? `${checkIn.member.first_name} ${checkIn.member.last_name}`
        : 'Unknown',
      checkIn.member?.email || '',
      checkIn.member?.program || '',
      new Date(checkIn.checked_in_at).toLocaleTimeString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `check-ins-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatProgram = (program: string) => {
    return program
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
                <p className="text-gray-400 text-sm">Check-In Management</p>
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
        {/* Controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Manual Check-In
              </button>
              <button
                onClick={handleExportCSV}
                disabled={checkIns.length === 0}
                className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total Check-Ins</p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalCheckIns}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Unique Members</p>
            <p className="text-3xl font-bold text-green-400">{stats.uniqueMembers}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-3">By Program</p>
            <div className="space-y-2">
              {Object.entries(stats.byProgram).map(([program, count]) => (
                <div key={program} className="flex justify-between text-sm">
                  <span className="text-gray-400">{formatProgram(program)}:</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
              {Object.keys(stats.byProgram).length === 0 && (
                <p className="text-gray-500 text-sm">No check-ins yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Check-Ins Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold">
              Check-Ins for {new Date(selectedDate).toLocaleDateString()}
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="mt-4">Loading check-ins...</p>
            </div>
          ) : checkIns.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <p>No check-ins for this date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {checkIns.map((checkIn) => (
                    <tr key={checkIn.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(checkIn.checked_in_at).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {checkIn.member ? (
                          <div>
                            <div className="text-sm font-medium">
                              {checkIn.member.first_name} {checkIn.member.last_name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Unknown Member</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {checkIn.member?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {checkIn.member?.program ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-300">
                            {formatProgram(checkIn.member.program)}
                          </span>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {checkIn.member?.status === 'active' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                            {checkIn.member?.status || 'Unknown'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Manual Check-In Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Manual Check-In</h3>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Select Member</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Choose a member...</option>
                {members
                  .filter((m) => m.status === 'active')
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} - {formatProgram(member.program)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedMemberId('');
                }}
                className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCheckIn}
                disabled={!selectedMemberId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
