import { SourceBalance } from '../../core/models/source.model';

/**
 * Sums the two USD sources (Cash USD + Card USD).
 * Returns the total in USD, rounded to 2 decimal places.
 */
export function calcUsdTotal(balances: SourceBalance): number {
  return Math.round((balances.cashUsd + balances.cardUsd) * 100) / 100;
}

/**
 * Sums the two UAH sources (Card UAH + Cash UAH).
 * Returns the total in UAH, rounded to 2 decimal places.
 */
export function calcUahTotal(balances: SourceBalance): number {
  return Math.round((balances.cardUah + balances.cashUah) * 100) / 100;
}

/**
 * Converts a UAH total to USD using the provided exchange rate.
 * Returns 0 if the rate is zero or negative (safe guard).
 */
export function convertUahToUsd(uahAmount: number, uahPerUsd: number): number {
  if (uahPerUsd <= 0) return 0;
  return Math.round((uahAmount / uahPerUsd) * 100) / 100;
}

/**
 * Calculates total savings in USD, combining USD sources directly
 * and converting UAH sources using the provided rate.
 * When uahPerUsd is not yet available (0), only USD sources are counted.
 */
export function calcTotalSavingsUsd(
  balances: SourceBalance,
  uahPerUsd: number,
): number {
  const usdDirect = calcUsdTotal(balances);
  const uahAsUsd = convertUahToUsd(calcUahTotal(balances), uahPerUsd);
  return Math.round((usdDirect + uahAsUsd) * 100) / 100;
}
