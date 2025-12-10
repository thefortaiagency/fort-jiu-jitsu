'use client';

import React, { useState, useEffect } from 'react';
import { BeltBadge } from '@/app/components/BeltDisplay';

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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Belt Promotions
          </h1>
          <p className="text-gray-600">
            Manage member promotions and track eligibility
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program
              </label>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Programs</option>
                <option value="kids-bjj">Kids BJJ</option>
                <option value="adult-bjj">Adult BJJ</option>
                <option value="beginners">Beginners</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Belt
              </label>
              <select
                value={filterBelt}
                onChange={(e) => setFilterBelt(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Belts</option>
                <option value="white">White</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="brown">Brown</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showEligibleOnly}
                  onChange={(e) => setShowEligibleOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show Eligible Only
                </span>
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadMembers}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMembers.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedMembers.size} member(s) selected
              </span>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Promote Selected (Stripe)
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                  Promote Selected (Belt)
                </button>
                <button
                  onClick={() => setSelectedMembers(new Set())}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No members found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedMembers.size === filteredMembers.length &&
                        filteredMembers.length > 0
                      }
                      onChange={selectAll}
                      className="w-4 h-4 text-blue-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Belt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
        )}
      </div>
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
    <tr className={selected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 text-blue-600"
        />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {member.first_name} {member.last_name}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
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
          <span className="text-gray-400 text-sm">No Belt</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-xs text-gray-600 space-y-1">
          <div>{eligibility.days_at_belt} days at belt</div>
          <div>{eligibility.classes_at_belt} classes</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            eligibility.is_eligible
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {eligibility.is_eligible ? 'Eligible' : eligibility.recommendation}
        </span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={onPromote}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Promote
        </button>
      </td>
    </tr>
  );
}
