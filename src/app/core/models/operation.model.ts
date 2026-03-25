import { ExchangeRates } from './currency.model';
import { SourceBalance, SourceId } from './source.model';

export type OperationType = 'exchange' | 'income' | 'transfer';

export interface OperationRecord {
  id: string;
  type: OperationType;
  occurredAt: string;
  fromSource: SourceId | null;
  toSource: SourceId | null;
  fromAmount: number | null;
  toAmount: number | null;
  counterparty: string | null;
  note: string;
  marketRate: number | null;
  actualRate: number | null;
  fxLossUsd: number;
}

export interface OperationsDocument {
  items: OperationRecord[];
}

export const EMPTY_OPERATIONS_DOCUMENT: OperationsDocument = {
  items: [],
};

export interface ExchangeOperationDraft {
  type: 'exchange';
  occurredAt: string;
  fromSource: SourceId;
  toSource: SourceId;
  fromAmount: number;
  toAmount: number;
  note: string;
}

export interface IncomeOperationDraft {
  type: 'income';
  occurredAt: string;
  toSource: SourceId;
  amount: number;
  counterparty: string;
  note: string;
}

export interface TransferOperationDraft {
  type: 'transfer';
  occurredAt: string;
  fromSource: SourceId;
  toSource: SourceId;
  amount: number;
  note: string;
}

export type OperationDraft = ExchangeOperationDraft | IncomeOperationDraft | TransferOperationDraft;

export interface OperationMutation {
  record: OperationRecord;
  nextBalances: SourceBalance;
}

export interface OperationPersistencePayload {
  currentItems: OperationRecord[];
  draft: OperationDraft;
  balances: SourceBalance;
  rates: ExchangeRates;
}
