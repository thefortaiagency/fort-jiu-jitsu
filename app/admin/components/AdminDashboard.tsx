'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';
import type { Member } from '@/lib/supabase';
import MemberList from './MemberList';
import MemberDetail from './MemberDetail';
import MemberForm from './MemberForm';
import AdminNav from './AdminNav';
import { LogOut } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
}

type View = 'list' | 'detail' | 'create' | 'edit';

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter();
  const [view, setView] = useState<View>('list');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingWaivers: 0,
    checkedInToday: 0,
    checkInsThisWeek: 0,
    expiringWaivers: 0,
  });

  const fetchMembers = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      return;
    }

    setMembers(data || []);

    // Update total members count
    setStats(prev => ({
      ...prev,
      totalMembers: data?.length || 0,
    }));

    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/admin/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();

      setStats(prev => ({
        ...prev,
        activeMembers: data.activeMembers,
        checkedInToday: data.checkInsToday,
        checkInsThisWeek: data.checkInsThisWeek,
        expiringWaivers: data.expiringWaivers,
        pendingWaivers: data.expiringWaivers, // Keep this for backwards compatibility
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchStats();
  }, [fetchMembers, fetchStats]);

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setView('detail');
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setView('edit');
  };

  const handleCreateMember = () => {
    setSelectedMember(null);
    setView('create');
  };

  const handleSaveMember = async () => {
    await fetchMembers();
    setView('list');
    setSelectedMember(null);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member? This cannot be undone.')) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from('members').delete().eq('id', memberId);

    if (error) {
      alert('Error deleting member: ' + error.message);
      return;
    }

    await fetchMembers();
    setView('list');
    setSelectedMember(null);
  };

  const handleBack = () => {
    setView('list');
    setSelectedMember(null);
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
            <div className="flex items-center gap-4">
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
                <p className="text-gray-400 text-sm">Admin Console</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm hidden md:block">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        {view === 'list' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {/* Total Members */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-5 md:p-6">
              <p className="text-gray-400 text-sm mb-1">Total Members</p>
              {loading ? (
                <div className="h-10 bg-slate-700/30 animate-pulse rounded-lg mt-2"></div>
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-white">{stats.totalMembers}</p>
              )}
            </div>

            {/* Active Members */}
            <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 border border-green-800/50 rounded-2xl p-5 md:p-6">
              <p className="text-gray-400 text-sm mb-1">Active Members</p>
              {statsLoading ? (
                <div className="h-10 bg-green-700/30 animate-pulse rounded-lg mt-2"></div>
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-green-400">{stats.activeMembers}</p>
              )}
            </div>

            {/* Check-ins Today */}
            <Link href="/admin/check-ins" className="bg-gradient-to-br from-sky-900/30 to-sky-950/30 border border-sky-800/50 rounded-2xl p-5 md:p-6 hover:border-sky-600 transition-colors">
              <p className="text-gray-400 text-sm mb-1">Check-ins Today</p>
              {statsLoading ? (
                <div className="h-10 bg-sky-700/30 animate-pulse rounded-lg mt-2"></div>
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-sky-400">{stats.checkedInToday}</p>
              )}
            </Link>

            {/* Check-ins This Week */}
            <Link href="/admin/check-ins" className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 border border-purple-800/50 rounded-2xl p-5 md:p-6 hover:border-purple-600 transition-colors">
              <p className="text-gray-400 text-sm mb-1">Check-ins This Week</p>
              {statsLoading ? (
                <div className="h-10 bg-purple-700/30 animate-pulse rounded-lg mt-2"></div>
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-purple-400">{stats.checkInsThisWeek}</p>
              )}
            </Link>

            {/* Waivers Expiring Soon */}
            <Link href="/admin/waivers" className="bg-gradient-to-br from-amber-900/30 to-amber-950/30 border border-amber-800/50 rounded-2xl p-5 md:p-6 hover:border-amber-600 transition-colors col-span-2 lg:col-span-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Waivers Expiring in Next 30 Days</p>
                  {statsLoading ? (
                    <div className="h-10 bg-amber-700/30 animate-pulse rounded-lg mt-2 w-24"></div>
                  ) : (
                    <p className="text-3xl md:text-4xl font-bold text-amber-400">{stats.expiringWaivers}</p>
                  )}
                </div>
                <div className="text-gray-500 text-sm hidden md:block">
                  <p>Click to view all waivers and send reminders</p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Main Content */}
        {view === 'list' && (
          <MemberList
            members={members}
            loading={loading}
            onSelectMember={handleSelectMember}
            onCreateMember={handleCreateMember}
          />
        )}

        {view === 'detail' && selectedMember && (
          <MemberDetail
            member={selectedMember}
            onEdit={() => handleEditMember(selectedMember)}
            onDelete={() => handleDeleteMember(selectedMember.id)}
            onBack={handleBack}
          />
        )}

        {(view === 'create' || view === 'edit') && (
          <MemberForm
            member={view === 'edit' ? selectedMember : null}
            onSave={handleSaveMember}
            onCancel={handleBack}
          />
        )}
      </main>
    </div>
  );
}
