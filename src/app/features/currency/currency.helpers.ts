import {
  CurrencyCode,
  CurrencyData,
  CurrencyHoldingBalance,
  CurrencyHoldings,
  ExchangeRates,
} from '../../core/models/currency.model';

function roundCurrency(amount: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(amount * factor) / factor;
}

export function calcHoldingTotal(balance: CurrencyHoldingBalance): number {
  return roundCurrency(balance.cash + balance.card, 2);
}

export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates,
): number {
  if (amount === 0) return 0;
  if (from === to) return roundCurrency(amount, 4);

  if (from === 'USD' && to === 'UAH') return roundCurrency(amount * rates.usdToUah, 2);
  if (from === 'UAH' && to === 'USD') {
    return rates.usdToUah > 0 ? roundCurrency(amount / rates.usdToUah, 4) : 0;
  }

  if (from === 'EUR' && to === 'UAH') return roundCurrency(amount * rates.eurToUah, 2);
  if (from === 'UAH' && to === 'EUR') {
    return rates.eurToUah > 0 ? roundCurrency(amount / rates.eurToUah, 4) : 0;
  }

  if (from === 'EUR' && to === 'USD') return roundCurrency(amount * rates.eurToUsd, 4);
  if (from === 'USD' && to === 'EUR') {
    return rates.eurToUsd > 0 ? roundCurrency(amount / rates.eurToUsd, 4) : 0;
  }

  return 0;
}

export function calcHoldingValueInUah(
  code: CurrencyCode,
  amount: number,
  rates: ExchangeRates,
): number {
  return convertAmount(amount, code, 'UAH', rates);
}

export function calcHoldingValueInUsd(
  code: CurrencyCode,
  amount: number,
  rates: ExchangeRates,
): number {
  return convertAmount(amount, code, 'USD', rates);
}

export function calcHoldingValueInEur(
  code: CurrencyCode,
  amount: number,
  rates: ExchangeRates,
): number {
  return convertAmount(amount, code, 'EUR', rates);
}

export function calcPortfolioTotals(data: CurrencyData): {
  totalUah: number;
  totalUsd: number;
  totalEur: number;
} {
  const holdings = data.holdings;

  const totalUah = roundCurrency(
    calcHoldingValueInUah('UAH', calcHoldingTotal(holdings.uah), data) +
      calcHoldingValueInUah('USD', calcHoldingTotal(holdings.usd), data) +
      calcHoldingValueInUah('EUR', calcHoldingTotal(holdings.eur), data),
    0,
  );

  return {
    totalUah,
    totalUsd: convertAmount(totalUah, 'UAH', 'USD', data),
    totalEur: convertAmount(totalUah, 'UAH', 'EUR', data),
  };
}

export function calcPortfolioShare(
  code: CurrencyCode,
  holdings: CurrencyHoldings,
  rates: ExchangeRates,
): number {
  const total = calcPortfolioTotals({ holdings, ...rates }).totalUah;
  if (total <= 0) return 0;

  const amount = calcHoldingTotal(
    code === 'UAH' ? holdings.uah : code === 'USD' ? holdings.usd : holdings.eur,
  );

  return roundCurrency((calcHoldingValueInUah(code, amount, rates) / total) * 100, 1);
}

export function buildPortfolioSegments(
  holdings: CurrencyHoldings,
  rates: ExchangeRates,
): { code: CurrencyCode; share: number }[] {
  const codes: CurrencyCode[] = ['UAH', 'USD', 'EUR'];
  return codes.map((code) => ({
    code,
    share: calcPortfolioShare(code, holdings, rates),
  }));
}
