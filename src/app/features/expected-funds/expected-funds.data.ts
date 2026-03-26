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
