import { describe, expect, it } from 'vitest';
import { convertExpectedFundToUsd, toExpectedFundEntry } from './expected-funds.helpers';

describe('expected-funds.helpers', () => {
  const rates = {
    usdToUah: 43.42,
    eurToUah: 47,
    eurToUsd: 1.08,
  };

  it('converts EUR support to USD using current rates', () => {
    expect(convertExpectedFundToUsd(56_000, 'EUR', rates)).toBe(60_480);
  });

  it('converts UAH support to USD using current rates', () => {
    expect(convertExpectedFundToUsd(50_000, 'UAH', rates)).toBe(1151.54);
  });

  it('builds a view entry with usdValue', () => {
    expect(
      toExpectedFundEntry(
        {
          id: 'fund-1',
          source: 'Parents',
          description: 'Support',
          originalCurrency: 'USD',
          originalAmount: 8_000,
          eta: 'Q4 2026',
          status: 'confirmed',
        },
        rates,
      ).usdValue,
    ).toBe(8_000);
  });
});
