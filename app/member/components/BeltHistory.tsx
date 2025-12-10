'use client';

import React, { useState } from 'react';
import BeltDisplay, { BeltBadge } from '@/app/components/BeltDisplay';
import { formatTimeSincePromotion, getBeltEmoji } from '@/lib/belt-utils';
import type { BeltHistory as BeltHistoryType } from '@/lib/belt-utils';

interface BeltHistoryProps {
  history: BeltHistoryType[];
  memberName: string;
}

/**
 * Full promotion history component with timeline view
 * Shows all belt promotions with details
 */
export default function BeltHistory({ history, memberName }: BeltHistoryProps) {
  const [selectedPromotion, setSelectedPromotion] =
    useState<BeltHistoryType | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Belt History Yet
        </h3>
        <p className="text-gray-500">
          Your promotion history will appear here as you progress through your
          BJJ journey.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Belt History & Achievements
      </h2>

      {/* Timeline */}
      <div className="space-y-8">
        {history.map((promotion, index) => {
          const isLatest = index === 0;
          const beltRank = promotion.belt_rank;

          if (!beltRank) return null;

          return (
            <div key={promotion.id} className="relative">
              {/* Timeline line */}
              {index < history.length - 1 && (
                <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-300" />
              )}

              {/* Promotion card */}
              <div
                className={`flex gap-6 ${
                  isLatest ? 'ring-2 ring-blue-500 rounded-lg p-4 bg-blue-50' : ''
                }`}
              >
                {/* Timeline dot with belt icon */}
                <div className="flex-shrink-0 relative">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      isLatest ? 'ring-4 ring-blue-200 shadow-lg' : 'shadow-md'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${
                        beltRank.gradient_start || beltRank.color_hex
                      }, ${beltRank.gradient_end || beltRank.color_hex})`,
                    }}
                  >
                    {getBeltEmoji(beltRank.name)}
                  </div>
                  {isLatest && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Current
                    </div>
                  )}
                </div>

                {/* Promotion details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {beltRank.display_name}
                        {promotion.stripes > 0 && (
                          <span className="text-sm text-gray-600 ml-2">
                            ({promotion.stripes}{' '}
                            {promotion.stripes === 1 ? 'stripe' : 'stripes'})
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Promoted {formatTimeSincePromotion(promotion.promoted_at)}
                      </p>
                    </div>
                    <BeltBadge
                      beltName={beltRank.name}
                      beltDisplayName={beltRank.display_name}
                      stripes={promotion.stripes}
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        Classes at Promotion
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {promotion.classes_attended_at_promotion}
                      </div>
                    </div>
                    {promotion.days_at_previous_belt > 0 && (
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">
                          Days at Previous Belt
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {promotion.days_at_previous_belt}
                        </div>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Date</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {new Date(promotion.promoted_at).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {promotion.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-700 italic">
                        "{promotion.notes}"
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setSelectedPromotion(promotion)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Certificate
                    </button>
                    <button
                      onClick={() => {
                        // Share functionality
                        const shareText = `Just earned my ${beltRank.display_name} at The Fort Jiu-Jitsu! 🥋 ${getBeltEmoji(beltRank.name)}`;
                        if (navigator.share) {
                          navigator.share({
                            title: 'BJJ Belt Promotion',
                            text: shareText,
                          });
                        }
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Journey So Far
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {history.length}
              </div>
              <div className="text-sm text-gray-600">
                {history.length === 1 ? 'Promotion' : 'Promotions'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {history[0]?.days_at_previous_belt || 0}
              </div>
              <div className="text-sm text-gray-600">Days Training</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {history[0]?.classes_attended_at_promotion || 0}
              </div>
              <div className="text-sm text-gray-600">Classes Attended</div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedPromotion && (
        <PromotionCertificateModal
          promotion={selectedPromotion}
          memberName={memberName}
          onClose={() => setSelectedPromotion(null)}
        />
      )}
    </div>
  );
}

/**
 * Modal displaying a shareable promotion certificate
 */
function PromotionCertificateModal({
  promotion,
  memberName,
  onClose,
}: {
  promotion: BeltHistoryType;
  memberName: string;
  onClose: () => void;
}) {
  const beltRank = promotion.belt_rank;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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

        {/* Certificate */}
        <div className="border-8 border-double border-gray-800 p-8 text-center">
          <div className="mb-6">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              The Fort Jiu-Jitsu
            </h2>
            <p className="text-lg text-gray-600">Certificate of Promotion</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">This certifies that</p>
            <h3 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              {memberName}
            </h3>
            <p className="text-gray-700 mb-4">has been promoted to</p>
          </div>

          <div className="mb-6 flex justify-center">
            <BeltDisplay
              beltName={beltRank?.name || ''}
              beltDisplayName={beltRank?.display_name || ''}
              stripes={promotion.stripes}
              size="xl"
              showStripes={true}
              showLabel={true}
            />
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Promoted on{' '}
              {new Date(promotion.promoted_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {promotion.notes && (
              <p className="italic mt-4">"{promotion.notes}"</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Print Certificate
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
