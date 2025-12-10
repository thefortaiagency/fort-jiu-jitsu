'use client';

import React from 'react';
import BeltDisplay from '@/app/components/BeltDisplay';
import { formatTimeSincePromotion } from '@/lib/belt-utils';

interface BeltProgressProps {
  currentBelt: {
    name: string;
    display_name: string;
  };
  stripes: number;
  beltUpdatedAt?: string;
  daysAtBelt: number;
  classesAtBelt: number;
  isEligible: boolean;
  recommendation: string;
  estimatedDaysToNext?: number;
  progressPercentage?: number;
}

/**
 * Belt progress component for member dashboard
 * Shows current belt, progress indicators, and eligibility status
 */
export default function BeltProgress({
  currentBelt,
  stripes,
  beltUpdatedAt,
  daysAtBelt,
  classesAtBelt,
  isEligible,
  recommendation,
  estimatedDaysToNext = 365,
  progressPercentage = 0,
}: BeltProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Your Belt Journey
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Current Belt Display */}
        <div className="flex-shrink-0">
          <BeltDisplay
            beltName={currentBelt.name}
            beltDisplayName={currentBelt.display_name}
            stripes={stripes}
            size="xl"
            showStripes={true}
            showLabel={true}
          />
          {beltUpdatedAt && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Promoted {formatTimeSincePromotion(beltUpdatedAt)}
            </p>
          )}
        </div>

        {/* Progress Stats */}
        <div className="flex-1 space-y-6">
          {/* Time at Current Belt */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Time at Current Belt
              </span>
              <span className="text-sm text-gray-600">
                {daysAtBelt} days ({Math.floor(daysAtBelt / 30)} months)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {estimatedDaysToNext > 0
                ? `Estimated ${estimatedDaysToNext} days until eligible for next promotion`
                : 'Eligible for promotion!'}
            </p>
          </div>

          {/* Classes Attended */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Classes Since Promotion
              </span>
              <span className="text-sm text-gray-600">
                {classesAtBelt} classes
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (classesAtBelt / 50) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {classesAtBelt >= 50
                ? 'Minimum classes met!'
                : `${50 - classesAtBelt} more classes recommended`}
            </p>
          </div>

          {/* Eligibility Status */}
          <div
            className={`p-4 rounded-lg ${
              isEligible
                ? 'bg-green-50 border border-green-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isEligible ? 'bg-green-100' : 'bg-blue-100'
                }`}
              >
                {isEligible ? (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    isEligible ? 'text-green-900' : 'text-blue-900'
                  }`}
                >
                  {isEligible
                    ? 'Eligible for Promotion!'
                    : 'Keep Training Hard!'}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    isEligible ? 'text-green-700' : 'text-blue-700'
                  }`}
                >
                  {recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Stripe Progress (if not at max stripes) */}
          {stripes < 4 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Stripes
                </span>
                <span className="text-sm text-gray-600">
                  {stripes} / 4 stripes
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((stripe) => (
                  <div
                    key={stripe}
                    className={`flex-1 h-8 rounded transition-all ${
                      stripe <= stripes
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stripes === 4
                  ? 'Maximum stripes earned! Next promotion will be to a new belt.'
                  : `${4 - stripes} more ${
                      4 - stripes === 1 ? 'stripe' : 'stripes'
                    } until eligible for belt promotion.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-center text-gray-600 italic">
          "The belt only covers two inches of your ass. You have to cover the
          rest." - Royce Gracie
        </p>
      </div>
    </div>
  );
}
