import {
  currencySymbol,
  formatConverterAmount,
  formatConverterInputAmount,
  formatConverterRate,
  formatHoldingAmount,
  formatNumber,
  getAlternativeCurrency,
  holdingFormKey,
  holdingInputStep,
} from './currency-formatting.helpers';

describe('currency formatting helpers', () => {
  it('returns the symbol for a currency code', () => {
    expect(currencySymbol('USD')).toBe('$');
    expect(currencySymbol('EUR')).toBe('€');
  });

  it('formats numbers with the provided locale', () => {
    expect(formatNumber(1234.56, 0, 2, 'en-US')).toBe('1,234.56');
  });

  it('formats holding amounts with a symbol', () => {
    expect(formatHoldingAmount('USD', 1234.56, 'en-US')).toBe('$1,235');
  });

  it('formats converter amounts with fixed decimals when needed', () => {
    expect(formatConverterAmount(12.5, 'USD', 'en-US')).toBe('12.50');
    expect(formatConverterAmount(12, 'USD', 'en-US')).toBe('12');
  });

  it('formats converter rates by currency precision', () => {
    expect(formatConverterRate(41.5678, 'USD', 'en-US')).toBe('41.5678');
    expect(formatConverterRate(41.5678, 'UAH', 'en-US')).toBe('41.57');
  });

  it('formats converter input amounts up to four decimals', () => {
    expect(formatConverterInputAmount(12.34567, 'en-US')).toBe('12.3457');
  });

  it('returns the correct holding input step', () => {
    expect(holdingInputStep('UAH')).toBe(100);
    expect(holdingInputStep('USD')).toBe(10);
  });

  it('returns the correct form key', () => {
    expect(holdingFormKey('UAH')).toBe('uah');
    expect(holdingFormKey('EUR')).toBe('eur');
  });

  it('returns an alternative currency different from the excluded one', () => {
    expect(getAlternativeCurrency('USD')).not.toBe('USD');
  });
});
