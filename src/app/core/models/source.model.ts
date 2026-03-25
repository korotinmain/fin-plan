/**
 * The four fixed savings sources for the house savings plan.
 * These are the only supported sources — no dynamic creation.
 */
export type SourceId = 'cashUsd' | 'cardUsd' | 'cardUah' | 'cashUah';
export type SourceCurrency = 'USD' | 'UAH';

/**
 * Per-source balance map stored in Firestore at sources/{uid}.
 * All amounts are in the source's native currency.
 */
export interface SourceBalance {
  cashUsd: number;
  cardUsd: number;
  cardUah: number;
  cashUah: number;
}

export const EMPTY_SOURCE_BALANCE: SourceBalance = {
  cashUsd: 0,
  cardUsd: 0,
  cardUah: 0,
  cashUah: 0,
};

/**
 * Static metadata for each source — labels and currencies.
 */
export interface SourceMeta {
  id: SourceId;
  label: string;
  currency: SourceCurrency;
}

export const SOURCE_META: SourceMeta[] = [
  { id: 'cashUsd', label: 'Cash USD', currency: 'USD' },
  { id: 'cardUsd', label: 'Card USD', currency: 'USD' },
  { id: 'cardUah', label: 'Card UAH', currency: 'UAH' },
  { id: 'cashUah', label: 'Cash UAH', currency: 'UAH' },
];
