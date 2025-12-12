'use client';

import React, { useState, useEffect } from 'react';
import BeltDisplay from '@/app/components/BeltDisplay';
import { getNextBelt } from '@/lib/belt-utils';

interface BeltRank {
  id: string;
  name: string;
  display_name: string;
  color_hex: string;
  is_kids_belt: boolean;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  current_belt?: BeltRank;
  current_stripes: number;
  total_classes_attended: number;
  program?: string;
}

interface PromotionModalProps {
  member: Member;
  onClose: () => void;
  onSuccess: () => void;
  promotedBy: string; // Instructor ID
}

export default function PromotionModal({
  member,
  onClose,
  onSuccess,
  promotedBy,
}: PromotionModalProps) {
  const [promotionType, setPromotionType] = useState<'stripe' | 'belt'>(
    'stripe'
  );
  const [availableBelts, setAvailableBelts] = useState<BeltRank[]>([]);
  const [selectedBeltId, setSelectedBeltId] = useState('');
  const [stripes, setStripes] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAvailableBelts();
  }, []);

  async function loadAvailableBelts() {
    try {
      const res = await fetch('/api/belts');
      const data = await res.json();

      // Determine if member is in kids program based on belt OR program name
      const isKids = member.current_belt?.is_kids_belt ||
                     member.program === 'kids-bjj' ||
                     member.program === 'kids' ||
                     false;
      const belts = isKids ? data.kids_belts : data.adult_belts;

      setAvailableBelts(belts || []);

      // Pre-select first belt (white) for members without a belt, or next belt for members with a belt
      if (member.current_belt) {
        const nextBeltName = getNextBelt(member.current_belt.name, isKids);
        if (nextBeltName) {
          const nextBelt = belts?.find((b: BeltRank) => b.name === nextBeltName);
          if (nextBelt) {
            setSelectedBeltId(nextBelt.id);
          }
        }
      } else if (belts && belts.length > 0) {
        // No current belt - pre-select first belt (white)
        setSelectedBeltId(belts[0].id);
        // Also default to belt promotion for members without a belt
        setPromotionType('belt');
      }
    } catch (error) {
      console.error('Failed to load belts:', error);
      setError('Failed to load available belts');
    }
  }

  async function handlePromote() {
    setLoading(true);
    setError('');

    try {
      const body: any = {
        promoted_by: promotedBy,
        notes,
        is_stripe_promotion: promotionType === 'stripe',
      };

      if (promotionType === 'stripe') {
        body.stripes = (member.current_stripes || 0) + 1;
      } else {
        body.new_belt_id = selectedBeltId;
        body.stripes = stripes;
      }

      const res = await fetch(`/api/members/${member.id}/belt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to promote member');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Promotion error:', error);
      setError(error instanceof Error ? error.message : 'Failed to promote member');
    } finally {
      setLoading(false);
    }
  }

  // Can only add stripe if member has a belt and has less than 4 stripes
  const hasBelt = !!member.current_belt;
  const canAddStripe = hasBelt && (member.current_stripes || 0) < 4;
  const selectedBelt = availableBelts.find((b) => b.id === selectedBeltId);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Promote Member
              </h2>
              <p className="text-gray-400 mt-1">
                {member.first_name} {member.last_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Current Belt Display */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Current Belt
            </h3>
            <div className="flex items-center justify-center">
              {member.current_belt ? (
                <BeltDisplay
                  beltName={member.current_belt.name}
                  beltDisplayName={member.current_belt.display_name}
                  stripes={member.current_stripes}
                  size="lg"
                  showStripes={true}
                  showLabel={true}
                />
              ) : (
                <p className="text-gray-400">No current belt</p>
              )}
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              {member.total_classes_attended} total classes attended
            </div>
          </div>

          {/* Promotion Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Promotion Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPromotionType('stripe')}
                disabled={!canAddStripe}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  promotionType === 'stripe'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                } ${!canAddStripe ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-semibold text-white mb-1">
                  Stripe Promotion
                </div>
                <div className="text-sm text-gray-400">
                  Add one stripe to current belt
                  {!hasBelt && ' (no belt assigned)'}
                  {hasBelt && !canAddStripe && ' (max stripes reached)'}
                </div>
              </button>

              <button
                onClick={() => setPromotionType('belt')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  promotionType === 'belt'
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                }`}
              >
                <div className="font-semibold text-white mb-1">
                  Belt Promotion
                </div>
                <div className="text-sm text-gray-400">
                  Promote to next belt rank
                </div>
              </button>
            </div>
          </div>

          {/* Belt Promotion Details */}
          {promotionType === 'belt' && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Belt
                </label>
                <select
                  value={selectedBeltId}
                  onChange={(e) => setSelectedBeltId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="">Select belt...</option>
                  {availableBelts.map((belt) => (
                    <option key={belt.id} value={belt.id}>
                      {belt.display_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBelt && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <BeltDisplay
                      beltName={selectedBelt.name}
                      beltDisplayName={selectedBelt.display_name}
                      stripes={stripes}
                      size="lg"
                      showStripes={true}
                      showLabel={true}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Starting Stripes (optional)
                </label>
                <select
                  value={stripes}
                  onChange={(e) => setStripes(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  {[0, 1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'stripe' : 'stripes'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this promotion..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-transparent"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePromote}
              disabled={loading || (promotionType === 'belt' && !selectedBeltId)}
              className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                  Promoting...
                </span>
              ) : (
                `Promote to ${
                  promotionType === 'stripe'
                    ? `${(member.current_stripes || 0) + 1} Stripes`
                    : selectedBelt?.display_name || 'Next Belt'
                }`
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
