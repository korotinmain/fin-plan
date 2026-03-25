/**
 * Per-currency holdings stored in Firestore at currency/{uid}.
 * Amounts are in each currency's native units.
 */
export interface CurrencyHoldings {
  uah: number;
  usd: number;
  eur: number;
}

/**
 * Live exchange rates stored alongside holdings.
 * Rates are manually maintained by the user and can be updated at any time.
 */
export interface ExchangeRates {
  /** How many UAH buys one USD, e.g. 41.5 */
  usdToUah: number;
  /** How many UAH buys one EUR, e.g. 44.2 */
  eurToUah: number;
  /** How many USD buys one EUR, e.g. 1.0651 */
  eurToUsd: number;
}

/**
 * Combined document stored at currency/{uid}.
 */
export interface CurrencyData extends CurrencyHoldings, ExchangeRates {}

export const EMPTY_CURRENCY_DATA: CurrencyData = {
  uah: 0,
  usd: 0,
  eur: 0,
  usdToUah: 0,
  eurToUah: 0,
  eurToUsd: 0,
};

export type CurrencyCode = 'UAH' | 'USD' | 'EUR';

export const CURRENCY_META: {
  code: CurrencyCode;
  symbol: string;
  label: string;
}[] = [
  { code: 'UAH', symbol: '₴', label: 'Ukrainian Hryvnia' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
];
