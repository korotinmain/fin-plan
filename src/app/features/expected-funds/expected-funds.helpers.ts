import { ExchangeRates } from '../../core/models/currency.model';
import { ExpectedFundCurrency, ExpectedFundEntry, ExpectedFundRecord } from './expected-funds.data';

export function toExpectedFundEntry(
  record: ExpectedFundRecord,
  rates: ExchangeRates,
): ExpectedFundEntry {
  return {
    ...record,
    usdValue: convertExpectedFundToUsd(record.originalAmount, record.originalCurrency, rates),
  };
}

export function convertExpectedFundToUsd(
  amount: number,
  currency: ExpectedFundCurrency,
  rates: ExchangeRates,
): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  switch (currency) {
    case 'USD':
      return roundAmount(amount);
    case 'EUR':
      return rates.eurToUsd > 0 ? roundAmount(amount * rates.eurToUsd) : 0;
    case 'UAH':
      return rates.usdToUah > 0 ? roundAmount(amount / rates.usdToUah) : 0;
  }
}

export function createExpectedFundId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `fund-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}
