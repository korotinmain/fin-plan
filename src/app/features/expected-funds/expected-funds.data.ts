export type ExpectedFundStatus = 'confirmed' | 'planned';
export type ExpectedFundCurrency = 'USD' | 'EUR' | 'UAH';

export interface ExpectedFundRecord {
  id: string;
  source: string;
  description: string;
  originalCurrency: ExpectedFundCurrency;
  originalAmount: number;
  eta: string;
  status: ExpectedFundStatus;
}

export interface ExpectedFundEntry extends ExpectedFundRecord {
  usdValue: number;
}

export interface ExpectedFundsDocument {
  items: ExpectedFundRecord[];
}

export const EMPTY_EXPECTED_FUNDS_DOCUMENT: ExpectedFundsDocument = {
  items: [],
};

export const DEFAULT_HOUSE_TARGET_USD = 161_700;

export const DEFAULT_EXPECTED_FUND_RECORDS: ExpectedFundRecord[] = [
  {
    id: 'parents',
    source: 'Parents',
    description: 'External support entry',
    originalCurrency: 'EUR',
    originalAmount: 56_000,
    eta: 'Q4 2026',
    status: 'confirmed',
  },
  {
    id: 'arci',
    source: 'Arci',
    description: 'External support entry',
    originalCurrency: 'UAH',
    originalAmount: 50_000,
    eta: 'May 2026',
    status: 'planned',
  },
  {
    id: 'reserve-support',
    source: 'Reserve support',
    description: 'External support entry',
    originalCurrency: 'USD',
    originalAmount: 8_000,
    eta: 'Optional',
    status: 'planned',
  },
];
