import { CURRENCY_META, CurrencyCode } from '../../core/models/currency.model';

/** Returns the symbol character for a given currency code (e.g. '$' for USD). */
export function currencySymbol(code: CurrencyCode): string {
  return CURRENCY_META.find((item) => item.code === code)?.symbol ?? '';
}

/** Locale-aware number formatter. */
export function formatNumber(
  amount: number,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Formats a holding amount with its currency symbol.
 * Whole amounts and values ≥ 1000 are rendered without decimals.
 */
export function formatHoldingAmount(code: CurrencyCode, amount: number, locale: string): string {
  const symbol = currencySymbol(code);
  const maximumFractionDigits = Number.isInteger(amount) || amount >= 1000 ? 0 : 2;
  return `${symbol}${formatNumber(amount, 0, maximumFractionDigits, locale)}`;
}

/** Formats a converter result amount (2 decimal places). */
export function formatConverterAmount(amount: number, _code: CurrencyCode, locale: string): string {
  const decimals = Number.isInteger(amount) ? 0 : 2;
  return formatNumber(amount, decimals, decimals, locale);
}

/** Formats an exchange rate value (4 decimals for non-UAH, 2 for UAH). */
export function formatConverterRate(amount: number, code: CurrencyCode, locale: string): string {
  return formatNumber(amount, 0, code === 'UAH' ? 2 : 4, locale);
}

/** Formats the raw amount input value of the converter (up to 4 decimals). */
export function formatConverterInputAmount(amount: number, locale: string): string {
  return formatNumber(amount, 0, 4, locale);
}

/** Returns the minimum input step for a currency's holding field. */
export function holdingInputStep(code: CurrencyCode): number {
  return code === 'UAH' ? 100 : 10;
}

/** Converts a currency code to its form group key. */
export function holdingFormKey(code: CurrencyCode): 'uah' | 'usd' | 'eur' {
  return code.toLowerCase() as 'uah' | 'usd' | 'eur';
}

/** Returns any currency in the meta list that is not the excluded one. */
export function getAlternativeCurrency(excluded: CurrencyCode): CurrencyCode {
  return CURRENCY_META.find((item) => item.code !== excluded)?.code ?? excluded;
}
