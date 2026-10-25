import type { GenderKey } from './blood-groups';

// Commonly used gaps in Bangladesh: ~3 months (men), ~4 months (women).
// Confirm with a medical source before launch.
const GAP_DAYS: Record<GenderKey, number> = { MALE: 90, FEMALE: 120 };

export function nextEligibleDate(lastDonatedAt: Date | null, gender: GenderKey): Date | null {
  if (!lastDonatedAt) return null; // never donated = eligible now
  const next = new Date(lastDonatedAt);
  next.setDate(next.getDate() + GAP_DAYS[gender]);
  return next;
}

export function isEligibleNow(lastDonatedAt: Date | null, gender: GenderKey): boolean {
  const next = nextEligibleDate(lastDonatedAt, gender);
  return next === null || next <= new Date();
}