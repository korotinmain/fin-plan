import { ExchangeRates } from '../../core/models/currency.model';
import {
  OperationDraft,
  OperationMutation,
  OperationRecord,
} from '../../core/models/operation.model';
import {
  SOURCE_META,
  SourceBalance,
  SourceCurrency,
  SourceId,
} from '../../core/models/source.model';

const SOURCE_LABELS = Object.fromEntries(
  SOURCE_META.map((item) => [item.id, item.label]),
) as Record<SourceId, string>;

const SOURCE_CURRENCIES = Object.fromEntries(
  SOURCE_META.map((item) => [item.id, item.currency]),
) as Record<SourceId, SourceCurrency>;

export function sourceLabelFor(id: SourceId): string {
  return SOURCE_LABELS[id];
}

export function sourceCurrencyFor(id: SourceId): SourceCurrency {
  return SOURCE_CURRENCIES[id];
}

export function calcBalancesFromOperations(operations: OperationRecord[]): SourceBalance {
  const balances: SourceBalance = { cashUsd: 0, cardUsd: 0, cardUah: 0, cashUah: 0 };

  for (const op of operations) {
    if (op.type === 'income' && op.toSource !== null && op.toAmount !== null) {
      balances[op.toSource] = Math.round((balances[op.toSource] + op.toAmount) * 100) / 100;
    } else if (
      op.type === 'transfer' &&
      op.fromSource !== null &&
      op.toSource !== null &&
      op.fromAmount !== null
    ) {
      balances[op.fromSource] = Math.round((balances[op.fromSource] - op.fromAmount) * 100) / 100;
      balances[op.toSource] = Math.round((balances[op.toSource] + op.fromAmount) * 100) / 100;
    } else if (
      op.type === 'exchange' &&
      op.fromSource !== null &&
      op.toSource !== null &&
      op.fromAmount !== null &&
      op.toAmount !== null
    ) {
      balances[op.fromSource] = Math.round((balances[op.fromSource] - op.fromAmount) * 100) / 100;
      balances[op.toSource] = Math.round((balances[op.toSource] + op.toAmount) * 100) / 100;
    }
  }

  return balances;
}

export function sortOperationsDescending(items: OperationRecord[]): OperationRecord[] {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(`${left.occurredAt}T00:00:00`);
    const rightTime = Date.parse(`${right.occurredAt}T00:00:00`);

    if (leftTime === rightTime) {
      return right.id.localeCompare(left.id);
    }

    return rightTime - leftTime;
  });
}

export function buildOperationMutation(
  draft: OperationDraft,
  balances: SourceBalance,
  rates: ExchangeRates,
): OperationMutation {
  if (draft.occurredAt.trim() === '') {
    throw new Error('operations.errors.invalidDate');
  }

  switch (draft.type) {
    case 'exchange':
      return buildExchangeMutation(draft, balances, rates);
    case 'income':
      return buildIncomeMutation(draft, balances);
    case 'transfer':
      return buildTransferMutation(draft, balances);
  }
}

function buildExchangeMutation(
  draft: Extract<OperationDraft, { type: 'exchange' }>,
  balances: SourceBalance,
  rates: ExchangeRates,
): OperationMutation {
  if (draft.fromSource === draft.toSource) {
    throw new Error('operations.errors.sameSource');
  }

  const fromCurrency = sourceCurrencyFor(draft.fromSource);
  const toCurrency = sourceCurrencyFor(draft.toSource);

  if (fromCurrency === toCurrency) {
    throw new Error('operations.errors.exchangeRequiresDifferentCurrency');
  }

  const fromAmount = assertPositive(draft.fromAmount, 'operations.errors.invalidAmount');
  const toAmount = assertPositive(draft.toAmount, 'operations.errors.invalidAmount');
  assertEnoughBalance(balances, draft.fromSource, fromAmount);

  const marketRate = getPairRate(fromCurrency, toCurrency, rates);
  const actualRate = getActualRate(fromCurrency, toCurrency, fromAmount, toAmount);
  const fxLossUsd = calculateFxLossUsd(fromCurrency, toCurrency, fromAmount, toAmount, rates);

  return {
    record: {
      id: createOperationId(),
      type: 'exchange',
      occurredAt: draft.occurredAt,
      fromSource: draft.fromSource,
      toSource: draft.toSource,
      fromAmount,
      toAmount,
      counterparty: null,
      note: draft.note.trim(),
      marketRate,
      actualRate,
      fxLossUsd,
    },
    nextBalances: {
      ...balances,
      [draft.fromSource]: roundAmount(balances[draft.fromSource] - fromAmount),
      [draft.toSource]: roundAmount(balances[draft.toSource] + toAmount),
    },
  };
}

function buildIncomeMutation(
  draft: Extract<OperationDraft, { type: 'income' }>,
  balances: SourceBalance,
): OperationMutation {
  const amount = assertPositive(draft.amount, 'operations.errors.invalidAmount');

  if (draft.counterparty.trim() === '') {
    throw new Error('operations.errors.counterpartyRequired');
  }

  return {
    record: {
      id: createOperationId(),
      type: 'income',
      occurredAt: draft.occurredAt,
      fromSource: null,
      toSource: draft.toSource,
      fromAmount: null,
      toAmount: amount,
      counterparty: draft.counterparty.trim(),
      note: draft.note.trim(),
      marketRate: null,
      actualRate: null,
      fxLossUsd: 0,
    },
    nextBalances: {
      ...balances,
      [draft.toSource]: roundAmount(balances[draft.toSource] + amount),
    },
  };
}

function buildTransferMutation(
  draft: Extract<OperationDraft, { type: 'transfer' }>,
  balances: SourceBalance,
): OperationMutation {
  if (draft.fromSource === draft.toSource) {
    throw new Error('operations.errors.sameSource');
  }

  const fromCurrency = sourceCurrencyFor(draft.fromSource);
  const toCurrency = sourceCurrencyFor(draft.toSource);

  if (fromCurrency !== toCurrency) {
    throw new Error('operations.errors.transferRequiresSameCurrency');
  }

  const amount = assertPositive(draft.amount, 'operations.errors.invalidAmount');
  assertEnoughBalance(balances, draft.fromSource, amount);

  return {
    record: {
      id: createOperationId(),
      type: 'transfer',
      occurredAt: draft.occurredAt,
      fromSource: draft.fromSource,
      toSource: draft.toSource,
      fromAmount: amount,
      toAmount: amount,
      counterparty: null,
      note: draft.note.trim(),
      marketRate: null,
      actualRate: null,
      fxLossUsd: 0,
    },
    nextBalances: {
      ...balances,
      [draft.fromSource]: roundAmount(balances[draft.fromSource] - amount),
      [draft.toSource]: roundAmount(balances[draft.toSource] + amount),
    },
  };
}

function assertPositive(value: number, errorKey: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(errorKey);
  }

  return roundAmount(value);
}

function assertEnoughBalance(balances: SourceBalance, sourceId: SourceId, amount: number): void {
  if (balances[sourceId] < amount) {
    throw new Error('operations.errors.insufficientFunds');
  }
}

function getPairRate(
  fromCurrency: SourceCurrency,
  toCurrency: SourceCurrency,
  rates: ExchangeRates,
): number {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const usdToUah = rates.usdToUah;

  if (!Number.isFinite(usdToUah) || usdToUah <= 0) {
    throw new Error('operations.errors.marketRateUnavailable');
  }

  return usdToUah;
}

function getActualRate(
  fromCurrency: SourceCurrency,
  toCurrency: SourceCurrency,
  fromAmount: number,
  toAmount: number,
): number {
  if (fromCurrency === 'UAH' && toCurrency === 'USD') {
    return roundAmount(fromAmount / toAmount);
  }

  if (fromCurrency === 'USD' && toCurrency === 'UAH') {
    return roundAmount(toAmount / fromAmount);
  }

  return 1;
}

export function calculateFxLossUsd(
  fromCurrency: SourceCurrency,
  toCurrency: SourceCurrency,
  fromAmount: number,
  toAmount: number,
  rates: ExchangeRates,
): number {
  const marketRate = getPairRate(fromCurrency, toCurrency, rates);

  if (fromCurrency === toCurrency) {
    return 0;
  }

  if (fromCurrency === 'UAH' && toCurrency === 'USD') {
    const idealUsd = fromAmount / marketRate;
    return roundAmount(Math.max(idealUsd - toAmount, 0));
  }

  if (fromCurrency === 'USD' && toCurrency === 'UAH') {
    const idealUah = fromAmount * marketRate;
    const lossUah = Math.max(idealUah - toAmount, 0);
    return roundAmount(lossUah / marketRate);
  }

  return 0;
}

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

function createOperationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `op-${Date.now().toString()}-${Math.random().toString(36).slice(2, 10)}`;
}
