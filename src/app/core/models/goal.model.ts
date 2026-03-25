/**
 * Represents the user's house savings goal.
 * Stored in Firestore at goals/{uid}.
 */
export interface Goal {
  /** Target property price in USD. */
  targetAmount: number;
}
