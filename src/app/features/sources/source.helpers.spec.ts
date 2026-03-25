import {
  calcTotalSavingsUsd,
  calcUahTotal,
  calcUsdTotal,
  convertUahToUsd,
} from './source.helpers';
import { SourceBalance } from '../../core/models/source.model';

const base: SourceBalance = {
  cashUsd: 10_000,
  cardUsd: 5_000,
  cardUah: 200_000,
  cashUah: 50_000,
};

describe('calcUsdTotal', () => {
  it('sums cashUsd and cardUsd', () => {
    expect(calcUsdTotal(base)).toBe(15_000);
  });

  it('returns 0 when all USD sources are 0', () => {
    expect(calcUsdTotal({ ...base, cashUsd: 0, cardUsd: 0 })).toBe(0);
  });

  it('handles decimal amounts correctly', () => {
    expect(calcUsdTotal({ ...base, cashUsd: 100.1, cardUsd: 200.2 })).toBe(300.3);
  });
});

describe('calcUahTotal', () => {
  it('sums cardUah and cashUah', () => {
    expect(calcUahTotal(base)).toBe(250_000);
  });

  it('returns 0 when all UAH sources are 0', () => {
    expect(calcUahTotal({ ...base, cardUah: 0, cashUah: 0 })).toBe(0);
  });

  it('handles decimal amounts correctly', () => {
    expect(calcUahTotal({ ...base, cardUah: 100.5, cashUah: 200.5 })).toBe(301);
  });
});

describe('convertUahToUsd', () => {
  it('converts UAH to USD using the given rate', () => {
    expect(convertUahToUsd(250_000, 40)).toBe(6_250);
  });

  it('returns 0 when rate is 0', () => {
    expect(convertUahToUsd(250_000, 0)).toBe(0);
  });

  it('returns 0 when rate is negative', () => {
    expect(convertUahToUsd(250_000, -5)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(convertUahToUsd(100, 3)).toBe(33.33);
  });
});

describe('calcTotalSavingsUsd', () => {
  it('combines USD sources and UAH converted to USD', () => {
    // 15_000 USD + (250_000 UAH / 40) = 15_000 + 6_250 = 21_250
    expect(calcTotalSavingsUsd(base, 40)).toBe(21_250);
  });

  it('returns only USD total when uahPerUsd is 0', () => {
    expect(calcTotalSavingsUsd(base, 0)).toBe(15_000);
  });

  it('returns 0 for empty balances regardless of rate', () => {
    const empty: SourceBalance = { cashUsd: 0, cardUsd: 0, cardUah: 0, cashUah: 0 };
    expect(calcTotalSavingsUsd(empty, 40)).toBe(0);
  });

  it('handles zero UAH sources — returns only USD total', () => {
    const usdOnly: SourceBalance = { cashUsd: 20_000, cardUsd: 0, cardUah: 0, cashUah: 0 };
    expect(calcTotalSavingsUsd(usdOnly, 40)).toBe(20_000);
  });
});
