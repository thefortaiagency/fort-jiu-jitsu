'use client';

import React from 'react';
import { getBeltGradient, getStripeIndicators } from '@/lib/belt-utils';

interface BeltDisplayProps {
  beltName: string;
  beltDisplayName: string;
  stripes?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStripes?: boolean;
  showLabel?: boolean;
  className?: string;
}

/**
 * Visual belt component with realistic appearance
 * Shows belt color, gradient, and stripe indicators
 */
export default function BeltDisplay({
  beltName,
  beltDisplayName,
  stripes = 0,
  size = 'md',
  showStripes = true,
  showLabel = true,
  className = '',
}: BeltDisplayProps) {
  const gradient = getBeltGradient(beltName);
  const stripeIndicators = getStripeIndicators(stripes);

  // Size configurations
  const sizeClasses = {
    sm: {
      container: 'h-8 w-24',
      stripe: 'w-1 h-4',
      text: 'text-xs',
    },
    md: {
      container: 'h-12 w-32',
      stripe: 'w-1.5 h-6',
      text: 'text-sm',
    },
    lg: {
      container: 'h-16 w-40',
      stripe: 'w-2 h-8',
      text: 'text-base',
    },
    xl: {
      container: 'h-20 w-48',
      stripe: 'w-2.5 h-10',
      text: 'text-lg',
    },
  };

  const sizes = sizeClasses[size];

  // Determine text color based on belt darkness
  const textColor = beltName.includes('white') ? 'text-gray-700' : 'text-white';

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      {/* Belt visual */}
      <div
        className={`${sizes.container} rounded-md relative overflow-hidden shadow-lg`}
        style={{
          background: gradient,
          border: beltName.includes('white') ? '1px solid #E5E7EB' : 'none',
        }}
      >
        {/* Belt texture overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.1) 2px,
                rgba(0,0,0,0.1) 4px
              )`,
            }}
          />
        </div>

        {/* Stripe indicators */}
        {showStripes && stripes > 0 && (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            {stripeIndicators.map((_, index) => (
              <div
                key={index}
                className={`${sizes.stripe} bg-white/90 rounded-sm shadow-sm`}
                style={{
                  transform: 'skewX(-15deg)',
                }}
              />
            ))}
          </div>
        )}

        {/* Belt shine effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Belt label */}
      {showLabel && (
        <div className={`text-center ${sizes.text} font-medium text-gray-700`}>
          <div>{beltDisplayName}</div>
          {showStripes && stripes > 0 && (
            <div className="text-xs text-gray-500">
              {stripes} {stripes === 1 ? 'Stripe' : 'Stripes'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact belt badge for use in cards/lists
 */
export function BeltBadge({
  beltName,
  beltDisplayName,
  stripes = 0,
  className = '',
}: {
  beltName: string;
  beltDisplayName: string;
  stripes?: number;
  className?: string;
}) {
  const gradient = getBeltGradient(beltName);
  const textColor = beltName.includes('white') ? 'text-gray-700' : 'text-white';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${textColor} ${className}`}
      style={{
        background: gradient,
        border: beltName.includes('white') ? '1px solid #E5E7EB' : 'none',
      }}
    >
      <span>{beltDisplayName}</span>
      {stripes > 0 && (
        <span className="flex gap-0.5">
          {Array(stripes)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="w-1 h-3 bg-white/90 rounded-sm"
                style={{ transform: 'skewX(-15deg)' }}
              />
            ))}
        </span>
      )}
    </div>
  );
}

/**
 * Belt icon for small spaces (avatars, etc.)
 */
export function BeltIcon({
  beltName,
  stripes = 0,
  size = 16,
}: {
  beltName: string;
  stripes?: number;
  size?: number;
}) {
  const gradient = getBeltGradient(beltName);

  return (
    <div
      className="rounded-full shadow-sm relative overflow-hidden"
      style={{
        width: size,
        height: size,
        background: gradient,
        border: beltName.includes('white') ? '1px solid #E5E7EB' : 'none',
      }}
      title={`${stripes} stripes`}
    >
      {stripes > 0 && (
        <div
          className="absolute top-0 right-0 w-1.5 h-1.5 bg-white rounded-full"
          style={{
            fontSize: size / 3,
          }}
        />
      )}
    </div>
  );
}
