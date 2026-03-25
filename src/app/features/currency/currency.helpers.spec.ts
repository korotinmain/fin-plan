import {
  calcHoldingTotal,
  buildPortfolioSegments,
  calcHoldingValueInEur,
  calcHoldingValueInUah,
  calcHoldingValueInUsd,
  calcPortfolioShare,
  calcPortfolioTotals,
  convertAmount,
} from './currency.helpers';
import { CurrencyData, ExchangeRates } from '../../core/models/currency.model';

const rates: ExchangeRates = {
  usdToUah: 41.5,
  eurToUah: 44.2,
  eurToUsd: 1.0651,
};

const data: CurrencyData = {
  holdings: {
    uah: { cash: 30_000, card: 15_000 },
    usd: { cash: 2_000, card: 1_500 },
    eur: { cash: 500, card: 300 },
  },
  ...rates,
};

describe('convertAmount', () => {
  it('returns the original amount when converting to the same currency', () => {
    expect(convertAmount(12.3456, 'USD', 'USD', rates)).toBe(12.3456);
  });

  it('converts USD to UAH', () => {
    expect(convertAmount(100, 'USD', 'UAH', rates)).toBe(4_150);
  });

  it('converts UAH to USD', () => {
    expect(convertAmount(4_150, 'UAH', 'USD', rates)).toBe(100);
  });

  it('converts EUR to USD', () => {
    expect(convertAmount(800, 'EUR', 'USD', rates)).toBe(852.08);
  });

  it('returns 0 for inverse conversions when the rate is invalid', () => {
    expect(convertAmount(100, 'UAH', 'USD', { ...rates, usdToUah: 0 })).toBe(0);
  });
});

describe('holding value helpers', () => {
  it('calculates a combined holding total', () => {
    expect(calcHoldingTotal({ cash: 500, card: 250.5 })).toBe(750.5);
  });

  it('converts USD holdings to UAH', () => {
    expect(calcHoldingValueInUah('USD', 3_500, rates)).toBe(145_250);
  });

  it('converts UAH holdings to USD', () => {
    expect(calcHoldingValueInUsd('UAH', 45_000, rates)).toBe(1_084.3373);
  });

  it('converts UAH holdings to EUR', () => {
    expect(calcHoldingValueInEur('UAH', 44_200, rates)).toBe(1_000);
  });
});

describe('calcPortfolioTotals', () => {
  it('returns aggregate totals across all currencies', () => {
    expect(calcPortfolioTotals(data)).toEqual({
      totalUah: 225_610,
      totalUsd: 5_436.3855,
      totalEur: 5_104.2986,
    });
  });
});

describe('calcPortfolioShare', () => {
  it('returns the UAH share of the portfolio', () => {
    expect(calcPortfolioShare('UAH', data.holdings, rates)).toBe(19.9);
  });

  it('returns the USD share of the portfolio', () => {
    expect(calcPortfolioShare('USD', data.holdings, rates)).toBe(64.4);
  });

  it('returns 0 when the portfolio is empty', () => {
    expect(
      calcPortfolioShare(
        'EUR',
        {
          uah: { cash: 0, card: 0 },
          usd: { cash: 0, card: 0 },
          eur: { cash: 0, card: 0 },
        },
        rates,
      ),
    ).toBe(0);
  });
});

describe('buildPortfolioSegments', () => {
  it('returns ordered segment data for the chart', () => {
    expect(buildPortfolioSegments(data.holdings, rates)).toEqual([
      { code: 'UAH', share: 19.9 },
      { code: 'USD', share: 64.4 },
      { code: 'EUR', share: 15.7 },
    ]);
  });
});
