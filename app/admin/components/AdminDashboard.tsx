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
import { Users, ClipboardCheck, FileCheck, Calendar, Award, QrCode, LogOut } from 'lucide-react';

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

  const navItems = [
    { href: '/admin', label: 'Members', icon: Users, active: true },
    { href: '/admin/check-ins', label: 'Check-ins', icon: ClipboardCheck, active: false },
    { href: '/admin/waivers', label: 'Waivers', icon: FileCheck, active: false },
    { href: '/admin/classes', label: 'Classes', icon: Calendar, active: false },
    { href: '/admin/promotions', label: 'Promotions', icon: Award, active: false },
    { href: '/admin/qr-codes', label: 'QR Codes', icon: QrCode, active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Watermark Logo Background */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="relative w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] opacity-[0.02]">
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
              <div className="relative w-14 h-14 md:w-16 md:h-16">
                <Image
                  src="/jiu-jitsu.png"
                  alt="The Fort Jiu-Jitsu"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">THE FORT</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Navigation Cards */}
        {view === 'list' && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 mb-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${
                  item.active
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'bg-gray-900/80 border border-gray-800 hover:bg-gray-800/80 hover:border-gray-700 text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.active ? 'text-black' : 'text-gray-400'}`} />
                <span className={`text-xs md:text-sm font-medium ${item.active ? 'text-black' : 'text-gray-300'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        {view === 'list' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-5 md:p-6">
              <p className="text-gray-400 text-sm mb-1">Total Members</p>
              <p className="text-3xl md:text-4xl font-bold text-white">{stats.totalMembers}</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 border border-green-800/50 rounded-2xl p-5 md:p-6">
              <p className="text-gray-400 text-sm mb-1">Active Members</p>
              <p className="text-3xl md:text-4xl font-bold text-green-400">{stats.activeMembers}</p>
            </div>
            <Link href="/admin/waivers" className="bg-gradient-to-br from-amber-900/30 to-amber-950/30 border border-amber-800/50 rounded-2xl p-5 md:p-6 hover:border-amber-600 transition-colors">
              <p className="text-gray-400 text-sm mb-1">Pending Waivers</p>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">{stats.pendingWaivers}</p>
            </Link>
            <Link href="/admin/check-ins" className="bg-gradient-to-br from-sky-900/30 to-sky-950/30 border border-sky-800/50 rounded-2xl p-5 md:p-6 hover:border-sky-600 transition-colors">
              <p className="text-gray-400 text-sm mb-1">Checked In Today</p>
              <p className="text-3xl md:text-4xl font-bold text-sky-400">{stats.checkedInToday}</p>
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
