// BJJ Belt System Utilities
// Handles belt display, progression logic, and eligibility calculations

export interface BeltRank {
  id: string;
  name: string;
  display_name: string;
  color_hex: string;
  gradient_start?: string;
  gradient_end?: string;
  sort_order: number;
  is_kids_belt: boolean;
  min_age?: number;
  max_age?: number;
  typical_time_months?: number;
  max_stripes: number;
}

export interface BeltHistory {
  id: string;
  member_id: string;
  belt_rank_id: string;
  stripes: number;
  promoted_at: string;
  promoted_by?: string;
  notes?: string;
  classes_attended_at_promotion: number;
  days_at_previous_belt: number;
  is_current: boolean;
  belt_rank?: BeltRank;
}

export interface PromotionEligibility {
  is_eligible: boolean;
  days_at_current_belt: number;
  classes_since_promotion: number;
  current_belt_name: string;
  next_belt_name?: string;
  recommendation: string;
}

// Belt color mappings with accurate BJJ colors
export const BELT_COLORS: Record<string, string> = {
  white: '#FFFFFF',
  blue: '#0066CC',
  purple: '#6B21A8',
  brown: '#8B4513',
  black: '#000000',
  kids_white: '#FFFFFF',
  kids_grey_white: '#D3D3D3',
  kids_grey: '#808080',
  kids_grey_black: '#5C5C5C',
  kids_yellow_white: '#FFEB99',
  kids_yellow: '#FFD700',
  kids_yellow_black: '#E6C200',
  kids_orange_white: '#FFB366',
  kids_orange: '#FF8C00',
  kids_orange_black: '#E67E00',
  kids_green_white: '#90EE90',
  kids_green: '#228B22',
  kids_green_black: '#1B6B1B',
};

// Belt gradients for visual appeal
export const BELT_GRADIENTS: Record<string, { start: string; end: string }> = {
  white: { start: '#F8F9FA', end: '#FFFFFF' },
  blue: { start: '#0047AB', end: '#1E90FF' },
  purple: { start: '#581C87', end: '#7C3AED' },
  brown: { start: '#654321', end: '#A0522D' },
  black: { start: '#000000', end: '#1F1F1F' },
  kids_grey_white: { start: '#C0C0C0', end: '#E8E8E8' },
  kids_grey: { start: '#696969', end: '#A9A9A9' },
  kids_grey_black: { start: '#404040', end: '#707070' },
  kids_yellow_white: { start: '#FFE66D', end: '#FFF5CC' },
  kids_yellow: { start: '#FFC107', end: '#FFE135' },
  kids_yellow_black: { start: '#CCA000', end: '#FFDB58' },
  kids_orange_white: { start: '#FF9A4D', end: '#FFCC99' },
  kids_orange: { start: '#FF7F00', end: '#FFA500' },
  kids_orange_black: { start: '#CC6F00', end: '#FF9500' },
  kids_green_white: { start: '#7CCD7C', end: '#B0F0B0' },
  kids_green: { start: '#32CD32', end: '#3CB371' },
  kids_green_black: { start: '#0F5A0F', end: '#2E8B2E' },
};

/**
 * Get the solid color for a belt
 */
export function getBeltColor(beltName: string): string {
  return BELT_COLORS[beltName] || '#6B7280'; // Default gray
}

/**
 * Get CSS gradient string for a belt
 */
export function getBeltGradient(beltName: string): string {
  const gradient = BELT_GRADIENTS[beltName];
  if (!gradient) {
    const color = getBeltColor(beltName);
    return `linear-gradient(135deg, ${color} 0%, ${color} 100%)`;
  }
  return `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`;
}

/**
 * Format belt rank with stripes for display
 */
export function formatBeltRank(belt: string, stripes: number): string {
  const stripeSuffix = stripes > 0 ? ` - ${stripes} ${stripes === 1 ? 'Stripe' : 'Stripes'}` : '';
  return `${belt}${stripeSuffix}`;
}

/**
 * Get the next belt in progression
 */
export function getNextBelt(currentBeltName: string, isKidsBelt: boolean): string | null {
  if (isKidsBelt) {
    const kidsProgression = [
      'kids_white',
      'kids_grey_white',
      'kids_grey',
      'kids_grey_black',
      'kids_yellow_white',
      'kids_yellow',
      'kids_yellow_black',
      'kids_orange_white',
      'kids_orange',
      'kids_orange_black',
      'kids_green_white',
      'kids_green',
      'kids_green_black',
    ];
    const currentIndex = kidsProgression.indexOf(currentBeltName);
    if (currentIndex >= 0 && currentIndex < kidsProgression.length - 1) {
      return kidsProgression[currentIndex + 1];
    }
    // After green-black, kids transition to white belt at 16
    return 'white';
  } else {
    const adultProgression = ['white', 'blue', 'purple', 'brown', 'black'];
    const currentIndex = adultProgression.indexOf(currentBeltName);
    if (currentIndex >= 0 && currentIndex < adultProgression.length - 1) {
      return adultProgression[currentIndex + 1];
    }
  }
  return null; // Black belt is the final belt
}

/**
 * Check if member is eligible for promotion
 * Based on Martialytics best practices:
 * - Blue belt: 1-2 years at white
 * - Purple: 2+ years at blue
 * - Brown: 1.5+ years at purple
 * - Black: Varies, typically 1+ year at brown
 */
export function isEligibleForPromotion(
  daysAtBelt: number,
  classesAttended: number,
  currentStripes: number,
  beltName: string,
  isKidsBelt: boolean
): { eligible: boolean; reason: string } {
  // Minimum requirements
  const minDays = isKidsBelt ? 120 : 180; // 4 months for kids, 6 months for adults
  const minClasses = isKidsBelt ? 30 : 50;
  const maxStripes = 4;

  // Check basic requirements
  if (daysAtBelt < minDays) {
    const daysNeeded = minDays - daysAtBelt;
    return {
      eligible: false,
      reason: `Need ${daysNeeded} more days at current belt`,
    };
  }

  if (classesAttended < minClasses) {
    const classesNeeded = minClasses - classesAttended;
    return {
      eligible: false,
      reason: `Need ${classesNeeded} more classes`,
    };
  }

  // If at max stripes, eligible for belt promotion
  if (currentStripes >= maxStripes) {
    return {
      eligible: true,
      reason: 'Ready for belt promotion (at max stripes)',
    };
  }

  // Otherwise eligible for stripe promotion
  return {
    eligible: true,
    reason: 'Ready for stripe promotion',
  };
}

/**
 * Calculate belt color with proper styling
 */
export function getBeltStyle(beltName: string): React.CSSProperties {
  const color = getBeltColor(beltName);
  const gradient = getBeltGradient(beltName);

  return {
    background: gradient,
    border: beltName.includes('white') ? '1px solid #E5E7EB' : 'none',
    boxShadow:
      beltName.includes('black') || beltName.includes('_black')
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };
}

/**
 * Get stripe indicators (for visual display)
 */
export function getStripeIndicators(stripes: number): string[] {
  return Array(stripes).fill('●');
}

/**
 * Format time since promotion
 */
export function formatTimeSincePromotion(promotedAt: string): string {
  const now = new Date();
  const promoted = new Date(promotedAt);
  const diffMs = now.getTime() - promoted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  } else if (diffMonths > 0) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
}

/**
 * Get belt emoji for notifications
 */
export function getBeltEmoji(beltName: string): string {
  if (beltName.includes('white')) return '⚪';
  if (beltName.includes('blue')) return '🔵';
  if (beltName.includes('purple')) return '🟣';
  if (beltName.includes('brown')) return '🟤';
  if (beltName.includes('black')) return '⚫';
  if (beltName.includes('grey')) return '⚪';
  if (beltName.includes('yellow')) return '🟡';
  if (beltName.includes('orange')) return '🟠';
  if (beltName.includes('green')) return '🟢';
  return '🥋';
}

/**
 * Get congratulations message for promotion
 */
export function getPromotionMessage(
  memberName: string,
  newBelt: string,
  stripes: number,
  isStripePromotion: boolean
): string {
  if (isStripePromotion) {
    return `Congratulations ${memberName}! You've earned your ${stripes} ${
      stripes === 1 ? 'stripe' : 'stripes'
    }! Keep up the great work! 🥋`;
  } else {
    const emoji = getBeltEmoji(newBelt);
    return `Huge congratulations ${memberName}! You've been promoted to ${newBelt}! ${emoji} Your dedication and hard work have paid off!`;
  }
}

/**
 * Validate promotion is legal (can't skip belts)
 */
export function isValidPromotion(
  currentBeltName: string,
  newBeltName: string,
  isKidsBelt: boolean
): { valid: boolean; error?: string } {
  const nextBelt = getNextBelt(currentBeltName, isKidsBelt);

  if (!nextBelt) {
    return { valid: false, error: 'Already at highest belt rank' };
  }

  if (newBeltName !== nextBelt) {
    return {
      valid: false,
      error: `Cannot skip belts. Next belt should be ${nextBelt}`,
    };
  }

  return { valid: true };
}

/**
 * Calculate average time to next belt based on academy data
 */
export function estimatedTimeToNextBelt(
  currentBeltName: string,
  daysAtCurrentBelt: number,
  academyAverageDays: number = 365
): { days: number; percentage: number } {
  const remainingDays = Math.max(0, academyAverageDays - daysAtCurrentBelt);
  const percentage = Math.min(100, (daysAtCurrentBelt / academyAverageDays) * 100);

  return {
    days: remainingDays,
    percentage: Math.round(percentage),
  };
}

/**
 * Get belt rank from database format
 */
export function parseBeltRank(belt: BeltRank | null): {
  name: string;
  color: string;
  gradient: string;
} {
  if (!belt) {
    return {
      name: 'No Belt',
      color: '#6B7280',
      gradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
    };
  }

  return {
    name: belt.display_name,
    color: belt.color_hex,
    gradient: getBeltGradient(belt.name),
  };
}

/**
 * Sort belt history by promotion date (most recent first)
 */
export function sortBeltHistory(history: BeltHistory[]): BeltHistory[] {
  return [...history].sort((a, b) => {
    return new Date(b.promoted_at).getTime() - new Date(a.promoted_at).getTime();
  });
}

/**
 * Get belt texture SVG pattern (for realistic belt appearance)
 */
export function getBeltTextureSVG(beltName: string): string {
  // Create subtle fabric texture pattern
  return `
    <svg width="100%" height="100%">
      <defs>
        <pattern id="belt-texture-${beltName}" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="${getBeltColor(beltName)}" />
          <line x1="0" y1="0" x2="4" y2="4" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" />
          <line x1="4" y1="0" x2="0" y2="4" stroke="rgba(0,0,0,0.05)" stroke-width="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#belt-texture-${beltName})" />
    </svg>
  `;
}
