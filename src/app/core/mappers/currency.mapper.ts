import { CurrencyHoldingBalance, CurrencyHoldings } from '../models/currency.model';

/**
 * Normalises a raw Firestore holding balance value.
 * Handles both the current nested {cash, card} shape and the legacy flat
 * total written before the cash/card split was introduced.
 */
export function normalizeHoldingBalance(
  value: Partial<CurrencyHoldingBalance> | undefined,
  fallbackTotal = 0,
): CurrencyHoldingBalance {
  const cash = value?.cash ?? fallbackTotal;
  const card = value?.card ?? 0;
  return { cash, card };
}

/**
 * Builds the legacy flat totals written alongside the nested holdings so that
 * old clients reading the document continue to see a non-zero value.
 */
export function buildLegacyHoldingTotals(holdings: CurrencyHoldings): {
  uah: number;
  usd: number;
  eur: number;
} {
  return {
    uah: holdings.uah.cash + holdings.uah.card,
    usd: holdings.usd.cash + holdings.usd.card,
    eur: holdings.eur.cash + holdings.eur.card,
  };
}
