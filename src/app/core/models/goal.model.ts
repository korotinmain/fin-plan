/**
 * Represents the user's house savings goal.
 * Stored in Firestore at goals/{uid}.
 */
export interface Goal {
  /** Target property price in USD. */
  targetAmount: number;
  /** Money already committed to the property outside current balances, in USD. */
  alreadyPaidAmount: number;
  /** Base currency — always USD for this product. */
  currency: 'USD';
  /** ISO date string of the last update (optional, not yet written by the service). */
  updatedAt?: string;
}
