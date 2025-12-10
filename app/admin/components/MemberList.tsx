'use client';

import { useState, useMemo } from 'react';
import type { Member } from '@/lib/supabase';

interface MemberListProps {
  members: Member[];
  loading: boolean;
  onSelectMember: (member: Member) => void;
  onCreateMember: () => void;
}

export default function MemberList({
  members,
  loading,
  onSelectMember,
  onCreateMember,
}: MemberListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        member.first_name?.toLowerCase().includes(searchLower) ||
        member.last_name?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.phone?.includes(search);

      // Status filter
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      // Program filter
      const matchesProgram = programFilter === 'all' || member.program === programFilter;

      return matchesSearch && matchesStatus && matchesProgram;
    });
  }, [members, search, statusFilter, programFilter]);

  const programs = useMemo(() => {
    const uniquePrograms = new Set(members.map((m) => m.program).filter(Boolean));
    return Array.from(uniquePrograms).sort();
  }, [members]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-900 text-green-300',
      pending: 'bg-yellow-900 text-yellow-300',
      inactive: 'bg-gray-700 text-gray-300',
      cancelled: 'bg-red-900 text-red-300',
    };
    return styles[status] || 'bg-gray-700 text-gray-300';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold">Members</h2>
        <button
          onClick={onCreateMember}
          className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
        >
          + Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, or phone..."
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Program</label>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Programs</option>
              {programs.map((program) => (
                <option key={program} value={program}>
                  {program.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-gray-400 text-sm mb-4">
        Showing {filteredMembers.length} of {members.length} members
      </p>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-300">Name</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-300 hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-300 hidden lg:table-cell">
                  Program
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-300 hidden lg:table-cell">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => onSelectMember(member)}
                    className="hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-sm text-gray-500 md:hidden">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{member.email}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-400">
                        {member.program?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ||
                          '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                          member.status
                        )}`}
                      >
                        {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden lg:table-cell">
                      {formatDate(member.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
