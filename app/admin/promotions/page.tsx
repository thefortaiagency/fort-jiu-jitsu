'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BeltBadge } from '@/app/components/BeltDisplay';
import AdminNav from '../components/AdminNav';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  program: string;
  current_belt?: {
    id: string;
    name: string;
    display_name: string;
    color_hex: string;
  };
  current_stripes: number;
  eligibility: {
    is_eligible: boolean;
    days_at_belt: number;
    classes_at_belt: number;
    recommendation: string;
  };
}

export default function PromotionsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [filterProgram, setFilterProgram] = useState('');
  const [filterBelt, setFilterBelt] = useState('');
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [filterProgram, filterBelt]);

  async function loadMembers() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterProgram) params.append('program', filterProgram);
      if (filterBelt) params.append('belt', filterBelt);

      const res = await fetch(`/api/admin/promotions?${params}`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = showEligibleOnly
    ? members.filter((m) => m.eligibility.is_eligible)
    : members;

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const selectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.id)));
    }
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
                <p className="text-gray-400 text-sm">Belt Promotions</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Belt Promotions</h2>
          <p className="text-gray-400">
            Manage member promotions and track eligibility
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Program
              </label>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-white focus:border-transparent"
              >
                <option value="">All Programs</option>
                <option value="kids-bjj">Kids BJJ</option>
                <option value="adult-bjj">Adult BJJ</option>
                <option value="beginners">Beginners</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Belt
              </label>
              <select
                value={filterBelt}
                onChange={(e) => setFilterBelt(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-white focus:border-transparent"
              >
                <option value="">All Belts</option>
                <option value="white">White</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="brown">Brown</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEligibleOnly}
                  onChange={(e) => setShowEligibleOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-white focus:ring-white"
                />
                <span className="text-sm font-medium text-gray-300">
                  Show Eligible Only
                </span>
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadMembers}
                className="w-full px-4 py-2 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMembers.size > 0 && (
          <div className="bg-gray-900 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="text-sm font-medium text-green-400">
                {selectedMembers.size} member(s) selected
              </span>
              <div className="flex gap-2 flex-wrap">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">
                  Promote Selected (Stripe)
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors">
                  Promote Selected (Belt)
                </button>
                <button
                  onClick={() => setSelectedMembers(new Set())}
                  className="px-4 py-2 border border-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        {loading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400">No members found</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedMembers.size === filteredMembers.length &&
                          filteredMembers.length > 0
                        }
                        onChange={selectAll}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-white focus:ring-white"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Current Belt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredMembers.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      selected={selectedMembers.has(member.id)}
                      onToggle={() => toggleMember(member.id)}
                      onPromote={() => {
                        // Open promotion modal
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MemberRow({
  member,
  selected,
  onToggle,
  onPromote,
}: {
  member: Member;
  selected: boolean;
  onToggle: () => void;
  onPromote: () => void;
}) {
  const { eligibility } = member;

  return (
    <tr className={selected ? 'bg-gray-800/50' : 'hover:bg-gray-800/30'}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-white focus:ring-white"
        />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-white">
          {member.first_name} {member.last_name}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-800 text-gray-300 border border-gray-700">
          {member.program}
        </span>
      </td>
      <td className="px-6 py-4">
        {member.current_belt ? (
          <BeltBadge
            beltName={member.current_belt.name}
            beltDisplayName={member.current_belt.display_name}
            stripes={member.current_stripes}
          />
        ) : (
          <span className="text-gray-500 text-sm">No Belt</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-xs text-gray-400 space-y-1">
          <div>{eligibility.days_at_belt} days at belt</div>
          <div>{eligibility.classes_at_belt} classes</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            eligibility.is_eligible
              ? 'bg-green-900/50 text-green-400 border border-green-500/50'
              : 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/50'
          }`}
        >
          {eligibility.is_eligible ? 'Eligible' : eligibility.recommendation}
        </span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={onPromote}
          className="text-sm text-white hover:text-gray-300 font-medium px-3 py-1 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Promote
        </button>
      </td>
    </tr>
  );
}
