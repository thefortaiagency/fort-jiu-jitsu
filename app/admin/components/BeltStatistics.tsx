'use client';

import React, { useEffect, useState } from 'react';
import { BeltBadge } from '@/app/components/BeltDisplay';

interface BeltStat {
  belt_name: string;
  color_hex: string;
  is_kids_belt: boolean;
  member_count: number;
  avg_stripes: number;
  avg_days_at_belt: number;
}

interface BeltStatisticsProps {
  program?: string; // Filter by program
}

/**
 * Belt distribution statistics for admin dashboard
 * Shows member counts, average time at belt, etc.
 */
export default function BeltStatistics({ program }: BeltStatisticsProps) {
  const [stats, setStats] = useState<BeltStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [program]);

  async function loadStatistics() {
    try {
      setLoading(true);
      // This would need a dedicated API endpoint
      // For now, we'll fetch from members
      const params = new URLSearchParams();
      if (program) params.append('program', program);

      const res = await fetch(`/api/admin/promotions?${params}`);
      const data = await res.json();

      // Calculate stats from members
      const beltStats: Record<string, BeltStat> = {};

      data.members?.forEach((member: any) => {
        const beltName = member.current_belt?.display_name || 'No Belt';
        const colorHex = member.current_belt?.color_hex || '#6B7280';
        const isKids = member.current_belt?.is_kids_belt || false;

        if (!beltStats[beltName]) {
          beltStats[beltName] = {
            belt_name: beltName,
            color_hex: colorHex,
            is_kids_belt: isKids,
            member_count: 0,
            avg_stripes: 0,
            avg_days_at_belt: 0,
          };
        }

        beltStats[beltName].member_count++;
        beltStats[beltName].avg_stripes += member.current_stripes || 0;
        beltStats[beltName].avg_days_at_belt +=
          member.eligibility?.days_at_belt || 0;
      });

      // Calculate averages
      Object.values(beltStats).forEach((stat) => {
        stat.avg_stripes = stat.avg_stripes / stat.member_count;
        stat.avg_days_at_belt = Math.round(
          stat.avg_days_at_belt / stat.member_count
        );
      });

      setStats(Object.values(beltStats));
    } catch (error) {
      console.error('Failed to load belt statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const totalMembers = stats.reduce((sum, s) => sum + s.member_count, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Belt Distribution</h2>
        <span className="text-sm text-gray-600">
          {totalMembers} total members
        </span>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium mb-1">
            Most Common Belt
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {stats.length > 0
              ? stats.reduce((max, s) =>
                  s.member_count > max.member_count ? s : max
                ).belt_name
              : 'N/A'}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium mb-1">
            Average Time at Belt
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {stats.length > 0
              ? Math.round(
                  stats.reduce((sum, s) => sum + s.avg_days_at_belt, 0) /
                    stats.length
                )
              : 0}{' '}
            days
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium mb-1">
            Average Stripes
          </div>
          <div className="text-2xl font-bold text-green-900">
            {stats.length > 0
              ? (
                  stats.reduce((sum, s) => sum + s.avg_stripes, 0) /
                  stats.length
                ).toFixed(1)
              : 0}
          </div>
        </div>
      </div>

      {/* Belt Breakdown */}
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.belt_name} className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: stat.color_hex }}
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {stat.belt_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.is_kids_belt ? 'Kids Program' : 'Adult Program'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.member_count}
                </div>
                <div className="text-xs text-gray-500">
                  {((stat.member_count / totalMembers) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(stat.member_count / totalMembers) * 100}%`,
                  backgroundColor: stat.color_hex,
                }}
              />
            </div>

            {/* Additional Stats */}
            <div className="mt-2 flex gap-4 text-xs text-gray-600">
              <span>Avg Stripes: {stat.avg_stripes.toFixed(1)}</span>
              <span>
                Avg Time: {stat.avg_days_at_belt} days (
                {Math.round(stat.avg_days_at_belt / 30)} months)
              </span>
            </div>
          </div>
        ))}
      </div>

      {stats.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No belt data available
        </div>
      )}
    </div>
  );
}

/**
 * Compact belt statistics card for dashboard overview
 */
export function BeltStatisticsCard() {
  const [stats, setStats] = useState({
    total_members: 0,
    eligible_for_promotion: 0,
    recent_promotions: 0,
  });

  useEffect(() => {
    loadQuickStats();
  }, []);

  async function loadQuickStats() {
    try {
      const res = await fetch('/api/admin/promotions');
      const data = await res.json();

      setStats({
        total_members: data.stats?.total_members || 0,
        eligible_for_promotion: data.stats?.eligible_count || 0,
        recent_promotions: 0, // Would need separate query
      });
    } catch (error) {
      console.error('Failed to load quick stats:', error);
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Belt Progression Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-90 mb-1">Total BJJ Members</div>
          <div className="text-3xl font-bold">{stats.total_members}</div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-90 mb-1">Eligible for Promotion</div>
          <div className="text-3xl font-bold">{stats.eligible_for_promotion}</div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-90 mb-1">Recent Promotions</div>
          <div className="text-3xl font-bold">{stats.recent_promotions}</div>
        </div>
      </div>

      <div className="mt-4">
        <a
          href="/admin/promotions"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          Manage Promotions
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
