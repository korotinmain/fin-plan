import { computed, inject, Injectable } from '@angular/core';
import {
  EMPTY_SOURCE_BALANCE,
  SOURCE_META,
  SourceBalance,
  SourceId,
} from '../../core/models/source.model';
import { OperationFacade } from '../operations/operation.facade';
import { calcBalancesFromOperations } from '../operations/operation.helpers';
import { calcUahTotal, calcUsdTotal } from './source.helpers';

@Injectable({ providedIn: 'root' })
export class SourceFacade {
  private readonly operationFacade = inject(OperationFacade);

  /**
   * Source balances derived from the full operation history.
   * undefined → operations still loading
   * SourceBalance → computed from all recorded operations
   */
  readonly balances = computed<SourceBalance | undefined>(() => {
    const operations = this.operationFacade.operations();
    if (operations === undefined) return undefined;
    return calcBalancesFromOperations(operations);
  });

  readonly isLoading = computed(() => this.balances() === undefined);

  /** USD total: cashUsd + cardUsd */
  readonly usdTotal = computed(() => calcUsdTotal(this.balances() ?? EMPTY_SOURCE_BALANCE));

  /** UAH total: cardUah + cashUah */
  readonly uahTotal = computed(() => calcUahTotal(this.balances() ?? EMPTY_SOURCE_BALANCE));

  /** Static source metadata (labels, currencies) */
  readonly sourceMeta = SOURCE_META;

  balanceFor(id: SourceId): number {
    return (this.balances() ?? EMPTY_SOURCE_BALANCE)[id];
  }
}
