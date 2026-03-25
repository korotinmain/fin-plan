/**
 * Per-currency holdings stored in Firestore at currency/{uid}.
 * Amounts are in each currency's native units.
 */
export interface CurrencyHoldingBalance {
  cash: number;
  card: number;
}

export interface CurrencyHoldings {
  uah: CurrencyHoldingBalance;
  usd: CurrencyHoldingBalance;
  eur: CurrencyHoldingBalance;
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
export interface CurrencyData extends ExchangeRates {
  holdings: CurrencyHoldings;
}

export const EMPTY_CURRENCY_HOLDING_BALANCE: CurrencyHoldingBalance = {
  cash: 0,
  card: 0,
};

export const EMPTY_CURRENCY_HOLDINGS: CurrencyHoldings = {
  uah: { ...EMPTY_CURRENCY_HOLDING_BALANCE },
  usd: { ...EMPTY_CURRENCY_HOLDING_BALANCE },
  eur: { ...EMPTY_CURRENCY_HOLDING_BALANCE },
};

export const EMPTY_CURRENCY_DATA: CurrencyData = {
  holdings: EMPTY_CURRENCY_HOLDINGS,
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
