/**
 * Calculates how much is still needed to reach the target.
 * Returns 0 if savedAmount already meets or exceeds the target.
 */
export function calcRemaining(targetAmount: number, savedAmount: number): number {
  return Math.max(0, targetAmount - savedAmount);
}

/**
 * Calculates progress toward the goal as an integer percentage (0–100).
 * Returns 0 if targetAmount is 0 or negative (avoids division by zero).
 */
export function calcProgressPercent(
  targetAmount: number,
  savedAmount: number,
): number {
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.round((savedAmount / targetAmount) * 100));
}
