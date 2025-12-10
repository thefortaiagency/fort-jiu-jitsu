/**
 * Waiver utility functions for The Fort Jiu-Jitsu
 * Handles waiver validation, expiration checks, and age-based requirements
 */

// Waiver expires after 1 year
const WAIVER_VALIDITY_DAYS = 365;

/**
 * Check if a waiver is currently valid (within 1 year of signing)
 */
export function isWaiverValid(signedAt: string | Date): boolean {
  const signedDate = new Date(signedAt);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return signedDate > oneYearAgo;
}

/**
 * Get the expiration date for a waiver (1 year from signing)
 */
export function getWaiverExpiration(signedAt: string | Date): Date {
  const signedDate = new Date(signedAt);
  const expirationDate = new Date(signedDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  return expirationDate;
}

/**
 * Calculate days until a waiver expires
 * Returns negative number if already expired
 */
export function daysUntilExpiration(signedAt: string | Date): number {
  const expirationDate = getWaiverExpiration(signedAt);
  const today = new Date();
  const diffMs = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if person is currently a minor (under 18)
 */
export function isMinor(birthDate: string | Date): boolean {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust age if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 < 18;
  }

  return age < 18;
}

/**
 * Check if person has turned 18 since their last waiver was signed
 * Returns true if:
 * 1. They were a minor when the waiver was signed (signer_relationship = 'parent' or 'guardian')
 * 2. They are now 18 or older
 * 3. They need to sign their own waiver
 */
export function needsAdultWaiver(
  birthDate: string | Date,
  lastWaiverDate: string | Date,
  lastWaiverRelationship: string
): boolean {
  // If last waiver was signed by self, no need for new adult waiver
  if (lastWaiverRelationship === 'self') {
    return false;
  }

  // Check if they are now an adult
  if (isMinor(birthDate)) {
    return false; // Still a minor
  }

  // Check if they were a minor when the last waiver was signed
  const lastWaiverDateObj = new Date(lastWaiverDate);
  const birthDateObj = new Date(birthDate);
  const ageAtWaiverSigning = lastWaiverDateObj.getFullYear() - birthDateObj.getFullYear();

  // If they were 18+ when waiver was signed but relationship is parent/guardian, something is wrong
  // But we should still require a new adult waiver to correct it
  if (lastWaiverRelationship === 'parent' || lastWaiverRelationship === 'guardian') {
    return true;
  }

  return false;
}

/**
 * Get appropriate warning message based on waiver status
 */
export function getWaiverWarningMessage(
  birthDate: string | Date,
  lastWaiverDate: string | null,
  lastWaiverRelationship: string | null
): { type: 'expired' | 'turned_18' | 'expiring_soon' | null; message: string | null; daysUntil: number | null } {
  if (!lastWaiverDate) {
    return { type: null, message: null, daysUntil: null };
  }

  const daysUntil = daysUntilExpiration(lastWaiverDate);

  // Check if they turned 18 since last waiver
  if (lastWaiverRelationship && needsAdultWaiver(birthDate, lastWaiverDate, lastWaiverRelationship)) {
    return {
      type: 'turned_18',
      message: 'You\'ve turned 18 since your last waiver. You need to sign your own waiver now.',
      daysUntil: null
    };
  }

  // Check if expired
  if (daysUntil < 0) {
    return {
      type: 'expired',
      message: `Your waiver expired ${Math.abs(daysUntil)} days ago. You need to sign a new waiver.`,
      daysUntil
    };
  }

  // Check if expiring soon (within 30 days)
  if (daysUntil <= 30) {
    return {
      type: 'expiring_soon',
      message: `Your waiver expires in ${daysUntil} days. Please renew it soon.`,
      daysUntil
    };
  }

  return { type: null, message: null, daysUntil };
}

/**
 * Determine the correct signer relationship based on age
 */
export function getSignerRelationship(birthDate: string | Date, isParentSigning: boolean): string {
  if (isMinor(birthDate)) {
    return isParentSigning ? 'parent' : 'guardian';
  }
  return 'self';
}
