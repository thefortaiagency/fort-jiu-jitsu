'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Member } from '@/lib/supabase';
import MemberList from './MemberList';
import MemberDetail from './MemberDetail';
import MemberForm from './MemberForm';

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
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingWaivers: 0,
    checkedInToday: 0,
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

    // Calculate stats
    const active = data?.filter((m) => m.status === 'active').length || 0;

    // Get today's check-ins
    const today = new Date().toISOString().split('T')[0];
    const { count: checkedIn } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('checked_in_at', `${today}T00:00:00`)
      .lt('checked_in_at', `${today}T23:59:59`);

    // Get pending waivers (members without valid waiver)
    const { data: waivers } = await supabase
      .from('waivers')
      .select('member_id, signed_at')
      .order('signed_at', { ascending: false });

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const membersWithValidWaiver = new Set(
      waivers
        ?.filter((w) => new Date(w.signed_at) > oneYearAgo)
        .map((w) => w.member_id) || []
    );

    const pendingWaivers =
      data?.filter((m) => m.status === 'active' && !membersWithValidWaiver.has(m.id)).length || 0;

    setStats({
      totalMembers: data?.length || 0,
      activeMembers: active,
      pendingWaivers,
      checkedInToday: checkedIn || 0,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-serif">THE FORT</h1>
              <p className="text-gray-400 text-sm">Admin Console</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        {view === 'list' && (
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href="/admin"
              className="px-4 py-2 bg-white text-black font-medium rounded-lg"
            >
              Members
            </Link>
            <Link
              href="/admin/check-ins"
              className="px-4 py-2 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Check-ins
            </Link>
            <Link
              href="/admin/waivers"
              className="px-4 py-2 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Waivers
            </Link>
            <Link
              href="/admin/classes"
              className="px-4 py-2 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Classes
            </Link>
          </div>
        )}

        {/* Stats Cards */}
        {view === 'list' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm">Total Members</p>
              <p className="text-3xl font-bold">{stats.totalMembers}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm">Active Members</p>
              <p className="text-3xl font-bold text-green-400">{stats.activeMembers}</p>
            </div>
            <Link href="/admin/waivers" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-yellow-400 transition-colors">
              <p className="text-gray-400 text-sm">Pending Waivers</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.pendingWaivers}</p>
            </Link>
            <Link href="/admin/check-ins" className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <p className="text-gray-400 text-sm">Checked In Today</p>
              <p className="text-3xl font-bold text-blue-400">{stats.checkedInToday}</p>
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
