import { describe, expect, it } from 'vitest';
import { EMPTY_SOURCE_BALANCE } from '../../core/models/source.model';
import { buildOperationMutation, calculateFxLossUsd } from './operation.helpers';

describe('operation.helpers', () => {
  it('calculates USD loss for a UAH to USD exchange', () => {
    expect(
      calculateFxLossUsd('UAH', 'USD', 97_130, 2_200, {
        usdToUah: 43.42,
        eurToUah: 47,
        eurToUsd: 1.08,
      }),
    ).toBe(36.99);
  });

  it('applies an income operation to balances', () => {
    const mutation = buildOperationMutation(
      {
        type: 'income',
        occurredAt: '2026-03-26',
        toSource: 'cardUah',
        amount: 99_705,
        counterparty: 'FOP payout',
        note: '',
      },
      EMPTY_SOURCE_BALANCE,
      { usdToUah: 43.42, eurToUah: 47, eurToUsd: 1.08 },
    );

    expect(mutation.nextBalances.cardUah).toBe(99_705);
    expect(mutation.record.type).toBe('income');
  });

  it('moves balance between same-currency sources for a transfer', () => {
    const mutation = buildOperationMutation(
      {
        type: 'transfer',
        occurredAt: '2026-03-24',
        fromSource: 'cardUsd',
        toSource: 'cashUsd',
        amount: 1_500,
        note: 'source rebalance',
      },
      {
        ...EMPTY_SOURCE_BALANCE,
        cardUsd: 2_000,
      },
      { usdToUah: 43.42, eurToUah: 47, eurToUsd: 1.08 },
    );

    expect(mutation.nextBalances.cardUsd).toBe(500);
    expect(mutation.nextBalances.cashUsd).toBe(1_500);
  });
});
