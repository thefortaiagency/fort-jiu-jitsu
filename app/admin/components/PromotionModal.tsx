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

      // Determine if member is in kids program
      const isKids = member.current_belt?.is_kids_belt || false;
      const belts = isKids ? data.kids_belts : data.adult_belts;

      setAvailableBelts(belts || []);

      // Pre-select next belt
      if (member.current_belt) {
        const nextBeltName = getNextBelt(member.current_belt.name, isKids);
        if (nextBeltName) {
          const nextBelt = belts.find((b: BeltRank) => b.name === nextBeltName);
          if (nextBelt) {
            setSelectedBeltId(nextBelt.id);
          }
        }
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

  const canAddStripe = (member.current_stripes || 0) < 4;
  const selectedBelt = availableBelts.find((b) => b.id === selectedBeltId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Promote Member
              </h2>
              <p className="text-gray-600 mt-1">
                {member.first_name} {member.last_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
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
                <p className="text-gray-500">No current belt</p>
              )}
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              {member.total_classes_attended} total classes attended
            </div>
          </div>

          {/* Promotion Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Promotion Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPromotionType('stripe')}
                disabled={!canAddStripe}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  promotionType === 'stripe'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!canAddStripe ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-semibold text-gray-900 mb-1">
                  Stripe Promotion
                </div>
                <div className="text-sm text-gray-600">
                  Add one stripe to current belt
                  {!canAddStripe && ' (max stripes reached)'}
                </div>
              </button>

              <button
                onClick={() => setPromotionType('belt')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  promotionType === 'belt'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">
                  Belt Promotion
                </div>
                <div className="text-sm text-gray-600">
                  Promote to next belt rank
                </div>
              </button>
            </div>
          </div>

          {/* Belt Promotion Details */}
          {promotionType === 'belt' && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Belt
                </label>
                <select
                  value={selectedBeltId}
                  onChange={(e) => setSelectedBeltId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Stripes (optional)
                </label>
                <select
                  value={stripes}
                  onChange={(e) => setStripes(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this promotion..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePromote}
              disabled={loading || (promotionType === 'belt' && !selectedBeltId)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
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
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
